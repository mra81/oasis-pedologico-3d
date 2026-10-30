/* =========================================================
   ZONES — balizas de interação (halo, anel, feixe e cristal)
   Brilho colorido e legível: nada de disco branco estourado.
   ========================================================= */
(function () {
  const C = OP.CONFIG;
  const items = [];
  let reduceMotion = false;

  // textura radial colorida (uma por zona) — o centro já nasce com a cor da zona
  function glowTexture(hex) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const col = new THREE.Color(hex);
    const rgb = [
      Math.round(col.r * 255),
      Math.round(col.g * 255),
      Math.round(col.b * 255),
    ].join(',');
    const g = ctx.createRadialGradient(64, 64, 3, 64, 64, 62);
    g.addColorStop(0, 'rgba(' + rgb + ',0.85)');
    g.addColorStop(0.42, 'rgba(' + rgb + ',0.34)');
    g.addColorStop(0.72, 'rgba(' + rgb + ',0.10)');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }

  // cor sólida, sem iluminação (mantém a saturação)
  function solid(color, opacity) {
    return new THREE.MeshBasicMaterial({
      color, transparent: opacity < 1, opacity: opacity == null ? 1 : opacity,
      depthWrite: false, side: THREE.DoubleSide, fog: false,
    });
  }

  // coluna de luz: alpha forte na base e sumindo no topo (evita "caixa" branca)
  let beamTex = null;
  function beamTexture() {
    if (beamTex) return beamTex;
    const c = document.createElement('canvas');
    c.width = 8;
    c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 128, 0, 0);
    g.addColorStop(0, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.28)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 8, 128);
    beamTex = new THREE.CanvasTexture(c);
    beamTex.needsUpdate = true;
    return beamTex;
  }

  OP.Zones = {
    init(scene, opts) {
      reduceMotion = !!(opts && opts.reduceMotion);

      C.zones.forEach((z) => {
        const y = OP.World.heightAt(z.x, z.z);
        const g = new THREE.Group();
        g.position.set(z.x, y, z.z);
        scene.add(g);

        // mancha colorida no chão (mistura normal: tinge o solo em vez de estourar)
        const disc = new THREE.Mesh(
          new THREE.PlaneGeometry(C.zoneRadius * 2.35, C.zoneRadius * 2.35),
          new THREE.MeshBasicMaterial({
            map: glowTexture(z.color),
            transparent: true, opacity: 0.62, depthWrite: false,
            side: THREE.DoubleSide, fog: false,
          })
        );
        disc.rotation.x = -Math.PI / 2;
        disc.position.y = 0.09;
        disc.renderOrder = 1;
        g.add(disc);

        // anel externo nítido (a borda é o que dá leitura de "área")
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(C.zoneRadius - 0.42, C.zoneRadius, 72),
          solid(z.color, 0.9)
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.115;
        ring.renderOrder = 2;
        g.add(ring);

        // anel interno tracejado, dá profundidade sem brilho extra
        const inner = new THREE.Mesh(
          new THREE.RingGeometry(C.zoneRadius - 1.55, C.zoneRadius - 1.38, 72),
          solid(z.color, 0.4)
        );
        inner.rotation.x = -Math.PI / 2;
        inner.position.y = 0.105;
        inner.renderOrder = 2;
        g.add(inner);

        // pilar de luz estreito (não uma parede): base fina, topo largo e desvanecendo
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 1.15, 3.8, 24, 1, true),
          new THREE.MeshBasicMaterial({
            map: beamTexture(), color: z.color, transparent: true, opacity: 0.2,
            depthWrite: false, blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide, fog: false,
          })
        );
        beam.position.y = 1.95;
        g.add(beam);

        // cristal flutuante + halo
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.46, 0),
          solid(z.color, 1)
        );
        crystal.scale.set(1, 1.5, 1);
        crystal.position.y = 2.5;
        crystal.castShadow = true;
        g.add(crystal);

        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(0.84, 0.03, 8, 44),
          solid(z.color, 0.85)
        );
        halo.position.y = 2.5;
        halo.rotation.x = Math.PI / 2;
        g.add(halo);

        // sombra suave no chão do cristal, ajuda a "plantar" a baliza
        const spot = new THREE.Mesh(
          new THREE.CircleGeometry(0.7, 20),
          new THREE.MeshBasicMaterial({
            color: 0x0b132b, transparent: true, opacity: 0.22, depthWrite: false,
          })
        );
        spot.rotation.x = -Math.PI / 2;
        spot.position.y = 0.1;
        g.add(spot);

        items.push({
          zone: z, group: g, ring, inner, disc, beam, crystal, halo,
          baseY: 2.5, solved: false,
        });
      });
    },

    update(dt, t, playerPos) {
      let near = null;
      let best = Infinity;

      items.forEach((it, i) => {
        const bob = reduceMotion ? 0 : Math.sin(t * 1.5 + i * 1.7) * 0.16;
        it.crystal.position.y = it.baseY + bob;
        it.crystal.rotation.y = reduceMotion ? 0 : t * 0.9;
        it.halo.position.y = it.baseY + bob;
        it.halo.rotation.z = reduceMotion ? 0 : t * 0.7;

        const pulse = reduceMotion ? 0.55 : 0.5 + Math.sin(t * 2 + i) * 0.16;
        it.ring.material.opacity = it.solved ? 0.45 : 0.72 + Math.sin(t * 2 + i) * 0.18;
        it.inner.material.opacity = it.solved ? 0.2 : pulse * 0.6;
        it.disc.material.opacity = it.solved ? 0.3 : (reduceMotion ? 0.5 : 0.46 + Math.sin(t * 1.6 + i) * 0.1);
        it.beam.material.opacity = it.solved ? 0.06 : 0.18;

        const d = Math.hypot(playerPos.x - it.zone.x, playerPos.z - it.zone.z);
        if (d < C.zoneRadius + 1.5 && d < best) {
          best = d;
          near = it.zone;
        }
      });

      return near;
    },

    markSolved(id) {
      const it = items.find((x) => x.zone.id === id);
      if (!it) return;
      it.solved = true;
      const green = new THREE.Color(0x22c55e);
      [it.ring, it.inner, it.disc, it.crystal, it.halo].forEach((m) => {
        if (m.material.color) m.material.color.copy(green);
      });
      if (it.disc.material.map) {
        // troca a textura colorida pela versão verde
        it.disc.material.map.dispose();
        it.disc.material.map = glowTexture(0x22c55e);
        it.disc.material.needsUpdate = true;
      }
      it.beam.material.color.copy(green);
      it.crystal.scale.set(1.2, 1.1, 1.2);
    },
  };
})();
