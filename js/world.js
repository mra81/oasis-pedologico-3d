/* =========================================================
   WORLD — terreno, biomas, céu, luzes e decoração low poly
   Formas arredondadas (esferas/cápsulas) em vez de caixas.
   ========================================================= */
(function () {
  const C = OP.CONFIG;
  const SIZE = C.size;
  const P = C.palette;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function mulberry(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- relevo ----------
  function hCerrado(x, z) {
    return 0.9 * Math.sin(x * 0.11) * Math.cos(z * 0.09) + 0.5 * Math.sin((x + z) * 0.07);
  }
  function hSemi(x, z) {
    return 0.16 * Math.sin(x * 0.3) * Math.cos(z * 0.25);
  }
  function hEncosta(x, z) {
    const slope = Math.max(0, x - 18) * 0.17;
    const gully = -3.2 * Math.exp(-Math.pow((z - 8) / 7, 2)) * smooth(20, 34, x);
    const bump = 0.55 * Math.sin(x * 0.15) * Math.cos(z * 0.13);
    return slope + gully + bump;
  }

  function heightAt(x, z) {
    const wE = smooth(14, 30, x);
    const wC = 1 - smooth(-30, -14, x);
    const wS = Math.max(0, 1 - wE - wC);
    return wC * hCerrado(x, z) + wS * hSemi(x, z) + wE * hEncosta(x, z);
  }

  function biomeWeights(x) {
    const wE = smooth(14, 30, x);
    const wC = 1 - smooth(-30, -14, x);
    return { c: wC, s: Math.max(0, 1 - wE - wC), e: wE };
  }

  // ---------- utilitários de geometria / material ----------
  function mergeGeos(list) {
    const pos = [];
    const nor = [];
    list.forEach((g) => {
      const ng = g.index ? g.toNonIndexed() : g;
      const p = ng.attributes.position;
      const n = ng.attributes.normal;
      for (let i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i));
        nor.push(n.getX(i), n.getY(i), n.getZ(i));
      }
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    return out;
  }

  // superfícies suaves (esferas, cápsulas) — o "menos quadrado"
  const matte = (color, opts) => new THREE.MeshLambertMaterial(
    Object.assign({ color }, opts || {})
  );
  // facetas para rocha/terreno, mantendo a leitura low poly
  const faceted = (color, opts) => new THREE.MeshLambertMaterial(
    Object.assign({ color, flatShading: true }, opts || {})
  );

  function shadow(mesh, cast, receive) {
    mesh.castShadow = cast !== false;
    mesh.receiveShadow = receive !== false;
    return mesh;
  }

  let root = null;
  let clouds = [];
  let skyDome = null;

  /* ---------------- céu ---------------- */
  function buildSky(scene) {
    const geo = new THREE.SphereGeometry(300, 24, 18);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const top = new THREE.Color(0x4a9fe0);
    const mid = new THREE.Color(0x9fd2e8);
    const low = new THREE.Color(0xe6f1f2);
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / 300;             // -1 (baixo) .. 1 (zênite)
      if (h > 0) {
        tmp.copy(mid).lerp(top, smooth(0.02, 0.75, h));
      } else {
        tmp.copy(mid).lerp(low, smooth(0.0, -0.5, h));
      }
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    skyDome = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, side: THREE.BackSide, fog: false,
      depthWrite: false, toneMapped: false,
    }));
    skyDome.renderOrder = -2;
    scene.add(skyDome);
  }

  function buildClouds(scene, rand) {
    const white = new THREE.MeshLambertMaterial({
      color: 0xf7fbff, emissive: 0x93b6cf, emissiveIntensity: 0.35,
      transparent: true, opacity: 0.92, fog: false,
    });

    for (let i = 0; i < 7; i++) {
      const parts = [];
      const puffs = 3 + Math.floor(rand() * 3);
      for (let p = 0; p < puffs; p++) {
        const g = new THREE.SphereGeometry(2.2 + rand() * 1.9, 12, 9);
        g.translate((p - puffs / 2) * 2.4 + rand() * 1.2, rand() * 1.1, (rand() - 0.5) * 2.4);
        g.scale(1, 0.62, 1);
        parts.push(g);
      }
      const cloud = new THREE.Mesh(mergeGeos(parts), white);
      const a = (i / 7) * Math.PI * 2 + rand();
      const r = 95 + rand() * 70;
      cloud.position.set(Math.cos(a) * r, 46 + rand() * 20, Math.sin(a) * r);
      cloud.userData.speed = 0.35 + rand() * 0.5;
      cloud.userData.baseX = cloud.position.x;
      scene.add(cloud);
      clouds.push(cloud);
    }
  }

  function buildHills(scene, rand) {
    const groups = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rand() * 0.12;
      const r = 118 + rand() * 34;
      const h = 12 + rand() * 16;
      const w = 26 + rand() * 22;
      const g = new THREE.IcosahedronGeometry(1, 1);
      const pos = g.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const k = 0.86 + rand() * 0.28;
        pos.setXYZ(v, pos.getX(v) * k, pos.getY(v) * k, pos.getZ(v) * k);
      }
      g.computeVertexNormals();
      const color = i % 3 === 0 ? 0x8fa877 : (i % 3 === 1 ? 0x9db98a : 0xa8b48c);
      const m = new THREE.Mesh(g, faceted(color, { fog: true }));
      m.position.set(Math.cos(a) * r, -2 + h * 0.12, Math.sin(a) * r);
      m.scale.set(w, h, w * 0.8);
      groups.add(m);
    }
    scene.add(groups);
  }

  /* ---------------- terreno ---------------- */
  function buildGround(scene) {
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, C.seg, C.seg);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cA = new THREE.Color(P.cerrado);
    const cB = new THREE.Color(P.semi);
    const cC = new THREE.Color(P.encosta);
    const tmp = new THREE.Color();
    const rnd = mulberry(7);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, heightAt(x, z));

      const w = biomeWeights(x);
      // variação em ondas (manchas de solo), não ruído por vértice
      const n = 0.05 * Math.sin(x * 0.31) * Math.cos(z * 0.27) +
        0.035 * Math.sin((x + z) * 0.11) + (rnd() - 0.5) * 0.05;

      tmp.setRGB(
        cA.r * w.c + cB.r * w.s + cC.r * w.e,
        cA.g * w.c + cB.g * w.s + cC.g * w.e,
        cA.b * w.c + cB.b * w.s + cC.b * w.e
      );
      tmp.offsetHSL(0, 0, n);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true,
    }));
    mesh.receiveShadow = true;
    scene.add(mesh);

    // chão distante, escondido pela neblina
    const far = new THREE.Mesh(
      new THREE.CircleGeometry(280, 48),
      faceted(0x94a07a, { fog: true })
    );
    far.rotation.x = -Math.PI / 2;
    far.position.y = -2.4;
    scene.add(far);
  }

  /* ---------------- trilha contínua (fita com borda) ---------------- */
  function ribbon(widthFn, lift) {
    const verts = [];
    const idx = [];
    let i = 0;
    for (let x = -60; x <= 60; x += 1.4) {
      const z = Math.sin(x * 0.045) * 2.1;
      const w = widthFn(x);
      const y = heightAt(x, z) + lift;
      verts.push(x, y, z - w, x, y, z + w);
      if (i > 0) {
        const a = (i - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      i++;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }

  function buildPath(scene) {
    // borda mais escura: separa a trilha do terreno em qualquer bioma
    const edge = new THREE.Mesh(
      ribbon((x) => 2.05 + 0.35 * Math.sin(x * 0.2), 0.05),
      new THREE.MeshLambertMaterial({
        color: 0x9a7448, transparent: true, opacity: 0.5,
        depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
      })
    );
    edge.renderOrder = 1;
    edge.receiveShadow = true;
    scene.add(edge);

    // leito de areia claro
    const mesh = new THREE.Mesh(
      ribbon((x) => 1.5 + 0.3 * Math.sin(x * 0.2), 0.075),
      new THREE.MeshLambertMaterial({
        color: 0xdcc39a, transparent: true, opacity: 0.88,
        depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3,
      })
    );
    mesh.renderOrder = 2;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  /* ---------------- vegetação e rochas ---------------- */
  function boulder(scale, rand, color) {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const k = 0.82 + rand() * 0.3;
      pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, matte(color || 0x8a8f95));
    m.scale.set(scale * (0.9 + rand() * 0.4), scale * (0.55 + rand() * 0.3), scale * (0.9 + rand() * 0.4));
    m.rotation.y = rand() * Math.PI;
    m.position.y += m.scale.y * 0.55;
    return shadow(m);
  }

  function shrub(scale, color, rand) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 0.95, 7), matte(0x5b3a1e));
    trunk.position.y = 0.47;
    g.add(trunk);
    const puffs = 4;
    for (let i = 0; i < puffs; i++) {
      const r = 0.42 + rand() * 0.3;
      const c = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), matte(color));
      c.position.set((rand() - 0.5) * 0.85, 0.95 + rand() * 0.55, (rand() - 0.5) * 0.85);
      c.scale.y = 0.85;
      g.add(c);
    }
    g.scale.setScalar(scale);
    g.traverse((o) => { if (o.isMesh) shadow(o); });
    return g;
  }

  function tortuousTree(scale, rand) {
    const g = new THREE.Group();
    const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.21, 1.7, 8), matte(0x4a2f1a));
    seg1.position.y = 0.85;
    seg1.rotation.z = 0.09;
    const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 1.5, 8), matte(0x4a2f1a));
    seg2.position.set(0.3, 2.3, 0.04);
    seg2.rotation.z = -0.2;
    g.add(seg1, seg2);

    const crowns = 5;
    for (let i = 0; i < crowns; i++) {
      const r = 0.62 + rand() * 0.5;
      const c = new THREE.Mesh(
        new THREE.SphereGeometry(r, 11, 9),
        matte(i % 2 ? 0x3f7a2b : 0x2f5d24)
      );
      c.position.set((rand() - 0.5) * 1.6, 2.9 + rand() * 1.2, (rand() - 0.5) * 1.4);
      c.scale.set(1, 0.8, 1);
      g.add(c);
    }
    g.scale.setScalar(scale);
    g.traverse((o) => { if (o.isMesh) shadow(o); });
    return g;
  }

  function cactus(scale, rand) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.15, 5, 10), matte(0x5b7f3f));
    body.position.y = 0.85;
    g.add(body);
    const arms = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < arms; i++) {
      const side = i === 0 ? 1 : -1;
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.42, 4, 8), matte(0x648a45));
      arm.position.set(side * 0.33, 0.95 + i * 0.2, 0);
      arm.rotation.z = side * -0.55;
      g.add(arm);
    }
    g.scale.setScalar(scale);
    g.traverse((o) => { if (o.isMesh) shadow(o); });
    return g;
  }

  // tufo de capim em UMA malha (1 draw call por tufo)
  function grassTuft(color, rand) {
    const parts = [];
    const blades = 4 + Math.floor(rand() * 3);
    for (let i = 0; i < blades; i++) {
      const h = 0.5 + rand() * 0.45;
      const g = new THREE.ConeGeometry(0.055, h, 4);
      const rot = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler((rand() - 0.5) * 0.3, 0, (rand() - 0.5) * 0.55)
      );
      g.applyMatrix4(rot);
      g.translate((rand() - 0.5) * 0.4, h / 2, (rand() - 0.5) * 0.4);
      parts.push(g);
    }
    const mesh = new THREE.Mesh(mergeGeos(parts), matte(color));
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    return mesh;
  }

  function saltCrust(radius, rand) {
    const shape = new THREE.Shape();
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = radius * (0.66 + rand() * 0.5);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);

    const g = new THREE.Group();

    // borda mais escura: dá espessura à crosta em vez de "papel no chão"
    const rim = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      color: 0x9a8767, transparent: true, opacity: 0.7,
      polygonOffset: true, polygonOffsetFactor: -1,
    }));
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.035;
    rim.scale.set(1.14, 1.14, 1);
    rim.receiveShadow = true;

    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      color: P.semiCrust, transparent: true, opacity: 0.86,
      polygonOffset: true, polygonOffsetFactor: -2,
    }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.055;
    m.receiveShadow = true;

    g.add(rim, m);
    return g;
  }

  function miningPile(scale, rand) {
    const body = new THREE.CylinderGeometry(0.75, 2.3, 1.8, 9);
    body.translate(0, 0.9, 0);
    const top = new THREE.SphereGeometry(0.78, 9, 7);
    top.scale(1, 0.55, 1);
    top.translate(0, 1.78, 0);
    const mesh = new THREE.Mesh(mergeGeos([body, top]), faceted(P.semiMine));
    mesh.scale.setScalar(scale);
    mesh.rotation.y = rand() * Math.PI;
    return shadow(mesh);
  }

  function deadBush(rand) {
    const parts = [];
    const sticks = 4 + Math.floor(rand() * 3);
    for (let i = 0; i < sticks; i++) {
      const h = 0.8 + rand() * 0.7;
      const g = new THREE.CylinderGeometry(0.02, 0.045, h, 4);
      const rot = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler((rand() - 0.5) * 0.9, rand() * 3, (rand() - 0.5) * 0.9)
      );
      g.applyMatrix4(rot);
      g.translate(0, h / 2, 0);
      parts.push(g);
    }
    return new THREE.Mesh(mergeGeos(parts), matte(0x9c7a4a));
  }

  function scatter(scene, rand, count, x0, x1, factory) {
    for (let i = 0; i < count; i++) {
      const x = x0 + rand() * (x1 - x0);
      const z = -SIZE / 2 + 4 + rand() * (SIZE - 8);
      if (C.zones.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 10)) continue;
      const obj = factory(rand);
      obj.position.x = x;
      obj.position.z = z;
      obj.position.y += heightAt(x, z);
      scene.add(obj);
    }
  }

  // capim em malha instanciada: 1 draw call para centenas de folhas
  function buildGrassField(scene, rand) {
    const geo = new THREE.ConeGeometry(0.05, 0.55, 4);
    geo.translate(0, 0.275, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const COUNT = 700;
    const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let n = 0;

    while (n < COUNT) {
      const x = -60 + rand() * 120;
      const z = -58 + rand() * 116;
      if (C.zones.some((zn) => Math.hypot(x - zn.x, z - zn.z) < 9)) continue;
      const w = biomeWeights(x);
      if (w.s > 0.55) continue;                 // semiárido quase sem capim
      if (Math.abs(z) < 3 && Math.abs(x) < 58) continue; // fora da trilha

      dummy.position.set(x, heightAt(x, z), z);
      dummy.rotation.set((rand() - 0.5) * 0.35, rand() * Math.PI, (rand() - 0.5) * 0.35);
      const s = 0.7 + rand() * 0.9;
      dummy.scale.set(s, s * (0.8 + rand() * 0.6), s);
      dummy.updateMatrix();
      mesh.setMatrixAt(n, dummy.matrix);

      color.setHex(w.c > w.e ? 0xa8a05a : 0x7d9a4e).offsetHSL(0, 0, (rand() - 0.5) * 0.08);
      mesh.setColorAt(n, color);
      n++;
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  function buildProps(scene) {
    const rand = mulberry(20261030);

    // Cerrado: árvores tortuosas, arbustos arredondados e capim seco
    scatter(scene, rand, 30, -58, -22, (r) =>
      r() > 0.55 ? tortuousTree(0.8 + r() * 0.5, r) : shrub(0.75 + r() * 0.55, r() > 0.5 ? 0x3f6212 : 0x4d7c0f, r)
    );
    scatter(scene, rand, 16, -58, -22, (r) => grassTuft(0xb59a45, r));
    scatter(scene, rand, 9, -58, -22, (r) => boulder(0.5 + r() * 0.6, r, 0x7d6a55));

    // Semiárido: crostas irregulares, pilhas de rejeito, mandacarus e arbustos mortos
    scatter(scene, rand, 24, -18, 18, (r) => saltCrust(1.0 + r() * 1.9, r));
    scatter(scene, rand, 9, -18, 18, (r) => miningPile(0.7 + r() * 0.8, r));
    scatter(scene, rand, 12, -18, 18, (r) => deadBush(r));
    scatter(scene, rand, 6, -18, 18, (r) => cactus(0.7 + r() * 0.5, r));
    scatter(scene, rand, 14, -18, 18, (r) => grassTuft(0xa8955f, r));

    // Encosta: blocos arredondados, solo exposto e tufos raros
    scatter(scene, rand, 18, 22, 58, (r) => boulder(0.6 + r() * 1.0, r, 0x8a8f95));
    scatter(scene, rand, 12, 22, 58, (r) => grassTuft(0x6b8f3f, r));

    buildGrassField(scene, rand);
  }

  // ---------- API ----------
  OP.World = {
    heightAt,
    biomeWeights,

    init(scene, opts) {
      root = new THREE.Group();
      scene.add(root);

      scene.background = new THREE.Color(P.sky);
      scene.fog = new THREE.Fog(P.fog, 78, 190);

      const hemi = new THREE.HemisphereLight(P.hemiSky, P.hemiGround, 0.4);
      scene.add(hemi);

      const sun = new THREE.DirectionalLight(P.sun, 0.85);
      sun.position.set(-40, 60, 35);
      sun.castShadow = !opts.mobile;
      if (sun.castShadow) {
        sun.shadow.mapSize.set(2048, 2048);
        const c = sun.shadow.camera;
        c.left = -70; c.right = 70; c.top = 70; c.bottom = -70;
        c.near = 1; c.far = 200;
        sun.shadow.bias = -0.0008;
        sun.shadow.normalBias = 0.02;
      }
      scene.add(sun);

      // luz de preenchimento fria, para as sombras não ficarem pretas
      const fill = new THREE.DirectionalLight(0xbcd9ff, 0.2);
      fill.position.set(45, 25, -40);
      scene.add(fill);

      const rand = mulberry(4242);
      buildSky(scene);
      buildClouds(scene, rand);
      buildHills(scene, rand);
      buildGround(root);
      buildPath(root);
      buildProps(root);

      return { sun, hemi };
    },

    update(dt, t) {
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 220) c.position.x = -220;
      }
      if (skyDome) skyDome.position.set(0, 0, 0);
    },
  };
})();
