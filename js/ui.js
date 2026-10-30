/* =========================================================
   UI — HUD, aviso de interação, joystick, toasts e telas
   ========================================================= */
(function () {
  const $ = (s) => document.querySelector(s);

  const stick = { x: 0, z: 0, active: false };
  let promptCb = null;
  let toastTimer = 0;

  function bindJoystick() {
    const base = $('#stick');
    const knob = $('#knob');
    if (!base) return;
    const R = 46;
    let id = null;
    let cx = 0;
    let cy = 0;

    const start = (e) => {
      if (id !== null) return;
      id = e.pointerId;
      const r = base.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      stick.active = true;
      base.classList.add('active');
      move(e);
      base.setPointerCapture(id);
    };

    const move = (e) => {
      if (id === null) return;
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      stick.x = dx / R;
      stick.z = -dy / R;
    };

    const end = () => {
      if (id === null) return;
      try { base.releasePointerCapture(id); } catch (err) { /* ignore */ }
      id = null;
      stick.active = false;
      stick.x = 0;
      stick.z = 0;
      knob.style.transform = 'translate(0,0)';
      base.classList.remove('active');
    };

    base.addEventListener('pointerdown', start);
    base.addEventListener('pointermove', move);
    base.addEventListener('pointerup', end);
    base.addEventListener('pointercancel', end);
    base.addEventListener('pointerleave', end);
  }

  OP.UI = {
    stick,

    init(opts) {
      bindJoystick();
      if (opts && opts.mobile) document.body.classList.add('is-touch');

      $('#prompt').addEventListener('click', () => { if (promptCb) promptCb(); });

      $('#start-btn').addEventListener('click', () => {
        $('#start').classList.add('off');
        if (opts && opts.onStart) opts.onStart();
      });

      $('#reset').addEventListener('click', () => {
        if (confirm('Reiniciar as três áreas?')) {
          if (opts && opts.onReset) opts.onReset();
        }
      });
    },

    onPrompt(cb) { promptCb = cb; },

    setNear(zone) {
      const p = $('#prompt');
      if (!zone) {
        p.classList.remove('show');
        return;
      }
      $('#prompt-label').textContent = zone.stop
        ? 'Parada ' + zone.stop + ' · ' + zone.name
        : zone.name;
      p.title = zone.stopName
        ? 'Parada ' + zone.stop + ' — ' + zone.stopName + '. ' + (zone.blurb || '')
        : (zone.blurb || '');
      p.classList.add('show');
    },

    setProgress(solved) {
      const pips = $('#pips');
      if (!pips.children.length) {
        pips.innerHTML = OP.CONFIG.zones.map(() => '<i></i>').join('');
      }
      OP.CONFIG.zones.forEach((z, i) => {
        pips.children[i].classList.toggle('on', solved.indexOf(z.id) >= 0);
      });
      $('#counter').textContent = solved.length + ' / ' + OP.CONFIG.zones.length;
    },

    toast(msg) {
      const t = $('#toast');
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
    },

    showDebrief(solved) {
      const box = $('#debrief');
      const list = OP.CONFIG.zones.map((z) => {
        const p = OP.PUZZLES[z.puzzle];
        const ok = solved.indexOf(z.id) >= 0;
        return '<div class="recap"><span class="num">' + (ok ? '✓' : '·') + '</span>' +
          '<span class="mod">' + z.name + '</span><b>' + p.title + '</b> — ' +
          '<i>' + p.summary + '</i></div>';
      }).join('');
      $('#recap').innerHTML = list;
      box.classList.add('on');
      box.setAttribute('aria-hidden', 'false');
    },

    hideDebrief() {
      const box = $('#debrief');
      box.classList.remove('on');
      box.setAttribute('aria-hidden', 'true');
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    const close = $('#debrief-close');
    if (close) close.addEventListener('click', () => OP.UI.hideDebrief());

    const tr = $('#debrief-transect');
    if (tr) {
      tr.addEventListener('click', () => {
        OP.UI.hideDebrief();
        if (OP.Transect) OP.Transect.open();
      });
    }
  });
})();
