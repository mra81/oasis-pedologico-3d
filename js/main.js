/* =========================================================
   MAIN — bootstrap, loop e ligação entre mundo, zonas e visor
   ========================================================= */
(function () {
  const $ = (s) => document.querySelector(s);
  const C = OP.CONFIG;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) document.documentElement.classList.add('reduce-motion');
  const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 820;

  let renderer, scene, camera;
  let last = 0;
  let started = false;
  let paused = true;
  let dprCap = 2;
  let quality = 0;
  let perfAcc = 0;
  let perfN = 0;
  let near = null;
  let pendingDebrief = false;
  let solved = [];

  const keys = Object.create(null);
  let drag = null;

  /* ---------------- persistência ---------------- */
  function load() {
    try {
      const raw = localStorage.getItem(C.storageKey);
      const data = raw ? JSON.parse(raw) : null;
      solved = (data && Array.isArray(data.solved)) ? data.solved : [];
    } catch (err) {
      solved = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(C.storageKey, JSON.stringify({ solved }));
    } catch (err) { /* modo privado */ }
  }

  /* ---------------- cena ---------------- */
  function initScene() {
    // r149: sem isso, cores hex são tratadas como lineares e o output em sRGB
    // clareia tudo (o "lavado"). Com legacyMode=false o pipeline fica correto.
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;

    renderer = new THREE.WebGLRenderer({
      canvas: $('#world'), antialias: true, powerPreference: 'high-performance',
    });
    // no celular, 2x de densidade custa caro e não melhora a leitura
    dprCap = mobile ? 1.75 : 2;
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      C.camera.fov, window.innerWidth / window.innerHeight, 0.1, 420
    );
    applySize();

    OP.World.init(scene, { mobile });
    OP.Player.init(scene, { blob: mobile });
    OP.CameraRig.init(camera);
    OP.Zones.init(scene, { reduceMotion });

    // atalho de depuração/telemetria (não usado pelo jogo)
    OP.debug = { renderer, scene, camera };

    window.addEventListener('resize', applySize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', applySize);
    document.addEventListener('visibilitychange', () => { perfAcc = 0; perfN = 0; });
  }

  function applySize() {
    if (!renderer || !camera) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  // se o aparelho não segura 40 fps, baixa a resolução em dois degraus
  function watchPerf(seconds) {
    if (!started || paused) return;
    perfAcc += Math.min(seconds, 0.25);
    perfN += 1;
    if (perfAcc < 2.5) return;
    const ms = (perfAcc / perfN) * 1000;
    perfAcc = 0;
    perfN = 0;
    if (ms > 24 && quality < 2) {
      quality += 1;
      dprCap = quality === 1 ? 1.35 : 1;
      applySize();
    }
  }

  /* ---------------- fluxo ---------------- */
  function openZone(zone) {
    if (!zone || paused) return;
    paused = true;
    near = null;
    OP.UI.setNear(null);

    const p = new THREE.Vector3(zone.x, OP.World.heightAt(zone.x, zone.z), zone.z);
    OP.CameraRig.focus(p);
    OP.Nano.open(zone.puzzle, { onSolved: onSolved, onClose: onClose });
  }

  function onSolved(zoneId) {
    if (solved.indexOf(zoneId) < 0) solved.push(zoneId);
    save();
    OP.Zones.markSolved(zoneId);
    OP.UI.setProgress(solved);
    const z = C.zones.find((x) => x.id === zoneId);
    OP.UI.toast('Área recuperada: ' + (z ? z.name : zoneId));

    if (solved.length >= C.zones.length) pendingDebrief = true;
  }

  function onClose() {
    paused = false;
    OP.CameraRig.release();
    if (pendingDebrief) {
      pendingDebrief = false;
      setTimeout(() => OP.UI.showDebrief(solved), 420);
    }
  }

  /* ---------------- input ---------------- */
  function readInput() {
    let x = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    let z = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
    x += OP.UI.stick.x;
    z += OP.UI.stick.z;
    const m = Math.hypot(x, z);
    if (m > 1) { x /= m; z /= m; }
    return { x, z };
  }

  function bindInput() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') return;
      keys[e.code] = true;
      if (e.code === 'KeyE') {
        e.preventDefault();
        if (!paused && !(OP.Transect && OP.Transect.isOpen()) && near) openZone(near);
      }
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });
    window.addEventListener('blur', () => { Object.keys(keys).forEach((k) => (keys[k] = false)); });

    const canvas = $('#world');

    canvas.addEventListener('pointerdown', (e) => {
      if (paused) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      OP.CameraRig.rotate(dx, dy);
    });

    const endDrag = (e) => {
      if (drag && drag.id === e.pointerId) drag = null;
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      OP.CameraRig.zoom(e.deltaY);
    }, { passive: false });

    OP.UI.onPrompt(() => openZone(near));
  }

  /* ---------------- loop ---------------- */
  function frame(now) {
    const raw = (now - last) / 1000;
    const dt = Math.min(raw, 0.05);
    last = now;
    const t = now / 1000;
    watchPerf(raw);

    const active = started && !paused && !(OP.Transect && OP.Transect.isOpen()) && !document.hidden;
    const input = active ? readInput() : { x: 0, z: 0 };

    OP.Player.update(dt, input, OP.CameraRig.yaw, !active);
    if (OP.World.update) OP.World.update(dt, t);
    const n = OP.Zones.update(dt, t, OP.Player.position);
    if (active) {
      near = n;
      OP.UI.setNear(n);
    }
    OP.CameraRig.update(dt, OP.Player.position);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  /* ---------------- start ---------------- */
  function boot() {
    load();
    initScene();
    OP.UI.init({
      mobile,
      onStart() {
        started = true;
        paused = false;
      },
      onReset() {
        localStorage.removeItem(C.storageKey);
        window.location.reload();
      },
    });
    OP.UI.setProgress(solved);
    solved.forEach((id) => OP.Zones.markSolved(id));

    // transecto: pausa o jogador enquanto o painel está aberto
    OP.Transect.init({
      onOpen() {
        paused = true;
        near = null;
        OP.UI.setNear(null);
      },
      onClose() {
        if (started && !OP.Nano.isOpen()) paused = false;
      },
    });

    bindInput();

    if (solved.length >= C.zones.length) {
      OP.UI.toast('Todas as áreas foram recuperadas.');
    }

    requestAnimationFrame((t) => { last = t; frame(t); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
