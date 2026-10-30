/* =========================================================
   PLAYER — avatar arredondado (cápsulas e esferas) + controle
   ========================================================= */
(function () {
  const C = OP.CONFIG;

  const matte = (color) => new THREE.MeshLambertMaterial({ color });

  let group = null;
  let body = null;
  let head = null;
  let blob = null;
  const legs = [];
  const arms = [];
  const vel = new THREE.Vector3();
  const pos = new THREE.Vector3();
  let facing = 0;
  let walkPhase = 0;

  const SKIN = 0xf2c9a0;
  const SHIRT = 0x2563eb;
  const SHIRT_DARK = 0x1d4ed8;
  const PANTS = 0x1e3a8a;
  const BOOT = 0x4a3421;
  const HAT = 0xe8c766;
  const HAT_DARK = 0xd4b155;

  function radialShadowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.22)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }

  function buildAvatar() {
    const g = new THREE.Group();

    // ---- pernas ----
    for (let i = 0; i < 2; i++) {
      const pivot = new THREE.Group();
      pivot.position.set(i === 0 ? -0.17 : 0.17, 0.95, 0);

      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.44, 4, 10), matte(PANTS));
      leg.position.y = -0.34;

      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 9), matte(BOOT));
      boot.position.set(0, -0.79, 0.05);
      boot.scale.set(1, 0.66, 1.32);

      pivot.add(leg, boot);
      g.add(pivot);
      legs.push(pivot);
    }

    // ---- tronco ----
    body = new THREE.Group();

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.44, 6, 14), matte(SHIRT));
    torso.position.y = 1.33;
    torso.scale.set(1, 1, 0.82);
    body.add(torso);

    // peitilho do colete, dá leitura de "farda de campo"
    const vest = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), matte(SHIRT_DARK));
    vest.position.set(0, 1.28, 0.13);
    vest.scale.set(0.95, 1.15, 0.55);
    body.add(vest);

    // mochila
    const pack = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.26, 5, 12), matte(0xb45309));
    pack.position.set(0, 1.36, -0.3);
    pack.scale.set(1, 1, 0.72);
    body.add(pack);
    const packFlap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), matte(0x92400e));
    packFlap.position.set(0, 1.6, -0.33);
    packFlap.scale.set(1, 0.6, 0.6);
    body.add(packFlap);

    // ---- braços ----
    for (let i = 0; i < 2; i++) {
      const pivot = new THREE.Group();
      pivot.position.set(i === 0 ? -0.36 : 0.36, 1.72, 0);

      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.4, 4, 10), matte(SHIRT_DARK));
      arm.position.y = -0.27;

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.098, 10, 8), matte(SKIN));
      hand.position.y = -0.53;

      pivot.add(arm, hand);
      body.add(pivot);
      arms.push(pivot);
    }

    // ---- cabeça ----
    head = new THREE.Group();
    head.position.y = 1.95;

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.235, 18, 14), matte(SKIN));
    skull.scale.set(1, 1.05, 0.98);
    head.add(skull);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.242, 16, 12), matte(0x2a1d14));
    hair.position.set(0, 0.045, -0.02);
    hair.scale.set(1, 0.92, 1);
    head.add(hair);

    for (let i = 0; i < 2; i++) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), matte(0x241a12));
      eye.position.set(i === 0 ? -0.08 : 0.08, 0.01, 0.212);
      head.add(eye);
    }

    // chapéu de palha: aba + copa arredondada
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.52, 0.045, 22), matte(HAT));
    brim.position.y = 0.19;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.255, 0.2, 18), matte(HAT_DARK));
    crown.position.y = 0.3;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.215, 16, 10), matte(HAT));
    dome.position.y = 0.4;
    dome.scale.y = 0.55;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.258, 0.262, 0.05, 18), matte(0x8a5a2b));
    band.position.y = 0.225;
    head.add(brim, crown, dome, band);

    body.add(head);
    g.add(body);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  OP.Player = {
    init(scene, opts) {
      group = buildAvatar();
      pos.set(C.player.start.x, 0, C.player.start.z);
      pos.y = OP.World.heightAt(pos.x, pos.z);
      group.position.copy(pos);
      scene.add(group);

      if (opts && opts.blob) {
        blob = new THREE.Mesh(
          new THREE.PlaneGeometry(1.5, 1.5),
          new THREE.MeshBasicMaterial({
            map: radialShadowTexture(), transparent: true, depthWrite: false,
            opacity: 0.55,
          })
        );
        blob.rotation.x = -Math.PI / 2;
        scene.add(blob);
      }

      return group;
    },

    get position() { return pos; },
    get mesh() { return group; },

    update(dt, input, camYaw, frozen) {
      const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
      const right = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));
      const wish = new THREE.Vector3()
        .addScaledVector(fwd, input.z)
        .addScaledVector(right, input.x);

      if (frozen) wish.set(0, 0, 0);

      if (wish.lengthSq() > 0.001) {
        wish.normalize().multiplyScalar(C.player.speed);
      }

      vel.lerp(wish, Math.min(1, dt * 10));
      if (vel.lengthSq() < 0.0004) vel.set(0, 0, 0);

      pos.x = THREE.MathUtils.clamp(pos.x + vel.x * dt, -C.size / 2 + 3, C.size / 2 - 3);
      pos.z = THREE.MathUtils.clamp(pos.z + vel.z * dt, -C.size / 2 + 3, C.size / 2 - 3);
      pos.y = OP.World.heightAt(pos.x, pos.z);

      group.position.copy(pos);

      const speed = Math.hypot(vel.x, vel.z);
      if (speed > 0.4) {
        const want = Math.atan2(vel.x, vel.z);
        let diff = want - facing;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        facing += diff * Math.min(1, dt * 11);
      }
      group.rotation.y = facing;

      // caminhada
      walkPhase += speed * dt * 2.3;
      const swing = Math.sin(walkPhase) * Math.min(0.6, speed * 0.1);
      legs[0].rotation.x = swing;
      legs[1].rotation.x = -swing;
      arms[0].rotation.x = -swing * 0.85;
      arms[1].rotation.x = swing * 0.85;
      arms[0].rotation.z = -0.06 - Math.abs(swing) * 0.12;
      arms[1].rotation.z = 0.06 + Math.abs(swing) * 0.12;

      // tronco respira, inclina ao andar e dá um "quique" por passo
      const bob = Math.abs(Math.sin(walkPhase)) * Math.min(0.07, speed * 0.012);
      const breathe = Math.sin(walkPhase * 0.6 + performance.now() * 0.0016) * 0.008;
      body.position.y = bob + breathe;
      body.rotation.x = Math.min(0.12, speed * 0.014);
      head.rotation.x = -body.rotation.x * 0.6;
      head.rotation.z = Math.sin(walkPhase) * Math.min(0.05, speed * 0.008);

      if (blob) {
        blob.position.set(pos.x, OP.World.heightAt(pos.x, pos.z) + 0.04, pos.z);
        blob.material.opacity = 0.5;
      }
    },

    teleport(x, z) {
      pos.set(x, OP.World.heightAt(x, z), z);
      group.position.copy(pos);
      vel.set(0, 0, 0);
    },
  };
})();
