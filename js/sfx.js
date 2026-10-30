/* =========================================================
   SFX — efeitos sonoros sintetizados (WebAudio, sem arquivos)
   ========================================================= */
(function () {
  const KEY = 'oasis-pedologico-3d:audio';
  let ctx = null;
  let muted = false;

  try { muted = localStorage.getItem(KEY) === 'off'; } catch (e) { muted = false; }

  function ac() {
    if (muted) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, delay, slideTo) {
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.05, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  const bank = {
    tick: () => tone(920, 0.06, 'sine', 0.045),
    ok: () => { tone(660, 0.09, 'triangle', 0.06); tone(990, 0.13, 'triangle', 0.05, 0.07); },
    err: () => { tone(200, 0.12, 'square', 0.035); tone(130, 0.15, 'square', 0.03, 0.05); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', 0.06, i * 0.1)); },
    open: () => { tone(430, 0.09, 'sine', 0.045, 0, 760); tone(760, 0.12, 'sine', 0.04, 0.06); },
    close: () => { tone(560, 0.08, 'sine', 0.04, 0, 320); tone(320, 0.12, 'sine', 0.035, 0.06); },
  };

  OP.SFX = {
    play(name) {
      if (muted) return;
      const fn = bank[name];
      if (fn) { try { fn(); } catch (e) { /* áudio bloqueado */ } }
    },
    get muted() { return muted; },
    setMuted(v) {
      muted = !!v;
      try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch (e) { /* modo privado */ }
    },
    toggle() { this.setMuted(!muted); return muted; },
    buzz(pattern) {
      if (muted || !navigator.vibrate) return;
      try { navigator.vibrate(pattern); } catch (e) { /* sem suporte */ }
    },
  };
})();
