/* =========================================================
   NANO — motor do Visor: palco, drag-and-drop, etapas e caderneta
   Interações: arraste com alvo destacado, ficha das peças,
   estequiometria por slots, dica, som, partículas e equação viva.
   ========================================================= */
(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const state = {
    open: false,
    puzzle: null,
    step: 0,
    progress: 0,
    solved: false,
    onSolved: null,
    onClose: null,
  };

  let api = null;
  let drag = null;
  let hoverZone = null;
  let hintTimer = 0;
  let tipTimer = 0;

  /* ---------------- utilidades ---------------- */
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function say(html, tag) {
    const cad = $('#cad');
    if (!cad) return;
    const entry = el('div', 'entry');
    if (tag) entry.appendChild(el('span', 'tag', tag));
    entry.appendChild(el('p', null, html));
    cad.insertBefore(entry, cad.firstChild);
    cad.scrollTop = 0;
  }

  function setValues(obj) {
    const box = $('#nano-values');
    if (!box) return;
    box.innerHTML = Object.keys(obj).map((k) =>
      '<span class="val"><i>' + k + '</i><b>' + obj[k] + '</b></span>'
    ).join('');
  }

  function setHint(text) {
    const h = $('#nano-hint');
    if (h) h.textContent = text;
  }

  // liga a parada do Visor ao transecto: mostra o ecossistema e o fator
  // dominante daquela posição da topossequência
  function sayFactors(zoneId) {
    const f = OP.FACTORS && OP.FACTORS.stops && OP.FACTORS.stops[zoneId];
    const cad = $('#cad');
    if (!f || !cad) return;
    const entry = el('div', 'entry factors');
    entry.innerHTML =
      '<span class="tag">fatores de formação</span>' +
      '<p><b>Parada ' + f.n + ' · ' + f.position + '</b> — ' + f.ecosystem + '</p>' +
      '<p class="mini"><b>Dominante:</b> ' + f.dominant + '</p>' +
      '<p class="mini">Clima, organismos, relevo, material e tempo estão no ' +
      'transecto do mapa (tecla T).</p>';
    cad.insertBefore(entry, cad.firstChild);
  }

  function setStepUI() {
    const p = state.puzzle;
    const total = p.steps.length;
    const done = Math.min(state.step, total);
    $('#nano-step').textContent = state.solved
      ? 'Área recuperada'
      : 'Etapa ' + (done + 1) + ' de ' + total;
    const bar = $('#nano-bar b');
    if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
  }

  function setEq() {
    $$('.eq-part').forEach((p) => {
      p.classList.toggle('on', Number(p.dataset.at) < state.step);
    });
  }

  function buildEq(p) {
    const box = $('#nano-eq');
    if (!box) return;
    box.innerHTML = '';
    if (!p.eq) return;
    p.eq.forEach((part, i) => {
      if (i) box.appendChild(el('span', 'eq-sep', '·'));
      const s = el('span', 'eq-part', part.text);
      s.dataset.at = part.at;
      box.appendChild(s);
    });
    setEq();
  }

  /* ---------------- fichas das peças ---------------- */
  function lookupInfo(chip) {
    const dict = OP.CHIP_INFO || {};
    const id = chip.dataset.id || '';
    return dict[id] || dict[id.replace(/\d+$/, '')] || dict[chip.dataset.cls || ''];
  }

  function hideTip() {
    const tip = $('#chip-tip');
    if (tip) tip.classList.remove('on');
    clearTimeout(tipTimer);
  }

  function showTip(chip) {
    const info = lookupInfo(chip);
    if (!info) return;
    const tip = $('#chip-tip');
    tip.innerHTML = '<b>' + info.name + '</b>' + info.text;
    const maxW = Math.min(232, window.innerWidth - 24);
    tip.style.maxWidth = maxW + 'px';
    tip.style.visibility = 'hidden';
    tip.classList.add('on');

    const r = chip.getBoundingClientRect();
    const w = tip.offsetWidth || maxW;
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(10, Math.min(window.innerWidth - w - 10, left));
    tip.style.left = left + 'px';

    const h = tip.offsetHeight;
    let top = r.top - h - 10;
    if (top < 10) top = r.bottom + 10;
    tip.style.top = top + 'px';
    tip.style.visibility = '';

    clearTimeout(tipTimer);
    tipTimer = setTimeout(hideTip, 4500);
    OP.SFX.play('tick');
  }

  /* ---------------- efeitos ---------------- */
  function burstAt(node, color, n) {
    const r = node.getBoundingClientRect();
    const box = el('div', 'burst');
    box.style.left = (r.left + r.width / 2) + 'px';
    box.style.top = (r.top + r.height / 2) + 'px';
    for (let i = 0; i < n; i++) {
      const p = el('i');
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.6;
      const d = 24 + Math.random() * 36;
      p.style.setProperty('--dx', Math.round(Math.cos(a) * d) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(a) * d) + 'px');
      if (color) p.style.background = color;
      p.style.animationDelay = (Math.random() * 0.07).toFixed(2) + 's';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 900);
  }

  function popAt(node, text) {
    const scene = $('#scene');
    if (!scene) return;
    const x = parseFloat(node.style.left) || 50;
    const y = parseFloat(node.style.top) || 50;
    const p = el('div', 'pop', text);
    p.style.left = x + '%';
    p.style.top = (y - 5) + '%';
    scene.appendChild(p);
    setTimeout(() => p.remove(), 980);
  }

  function absorb(chip, target) {
    const r = target.getBoundingClientRect();
    chip.dataset.absorbing = '1';
    chip.style.transition = 'left .24s ease, top .24s ease, transform .24s ease, opacity .24s ease';
    chip.style.left = (r.left + r.width / 2) + 'px';
    chip.style.top = (r.top + r.height / 2) + 'px';
    chip.style.transform = 'translate(-50%,-50%) scale(.35)';
    chip.style.opacity = '0';
    setTimeout(() => chip.remove(), 260);
  }

  function respawn(chip) {
    const id = chip.dataset.id;
    const label = chip.dataset.label;
    const cls = chip.dataset.cls;
    setTimeout(() => {
      if (!state.puzzle || state.solved) return;
      api.chip({ id, label, cls, tray: true });
    }, 270);
  }

  // deixa a peça parada dentro do alvo (usado na drenagem: o íon fica visível
  // até completar a etapa, em vez de sumir na hora)
  function park(chip, target, n, need) {
    const r = target.getBoundingClientRect();
    const t = need > 1 ? (n - 1) / (need - 1) : 0.5;
    const x = need > 1 ? 0.3 + 0.4 * t : 0.5;
    chip.dataset.locked = '1';
    chip.classList.add('parked');
    chip.style.position = 'fixed';
    chip.style.left = (r.left + r.width * x) + 'px';
    chip.style.top = (r.top + r.height * 0.56) + 'px';
    chip.style.transform = 'translate(-50%,-50%) scale(.82)';
    chip.style.zIndex = '2';
    target.classList.add('has-chip');
  }

  /* ---------------- drag and drop ---------------- */
  function makeDrag(chip) {
    // teclado: Enter/Espaço abre a ficha da peça (equivalente ao toque)
    chip.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      showTip(chip);
    });

    chip.addEventListener('pointerdown', (e) => {
      if (chip.dataset.locked === '1' || state.solved) return;
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      hideTip();

      const r = chip.getBoundingClientRect();
      drag = {
        chip,
        home: { left: chip.style.left, top: chip.style.top },
        offX: e.clientX - (r.left + r.width / 2),
        offY: e.clientY - (r.top + r.height / 2),
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      };

      chip.classList.add('dragging');
      chip.style.position = 'fixed';
      chip.style.transform = 'translate(-50%,-50%)';
      chip.style.left = (e.clientX - drag.offX) + 'px';
      chip.style.top = (e.clientY - drag.offY) + 'px';

      $('#nano').classList.add('dragging');

      try { chip.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
  }

  function zoneUnder(x, y) {
    const stack = document.elementsFromPoint(x, y) || [];
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].classList && stack[i].classList.contains('zone')) return stack[i];
    }
    return null;
  }

  function onMove(e) {
    if (!drag) return;
    drag.chip.style.left = (e.clientX - drag.offX) + 'px';
    drag.chip.style.top = (e.clientY - drag.offY) + 'px';

    if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 8) {
      drag.moved = true;
    }

    const z = zoneUnder(e.clientX, e.clientY);
    if (z !== hoverZone) {
      if (hoverZone) hoverZone.classList.remove('hot');
      hoverZone = z;
      if (z) z.classList.add('hot');
    }
  }

  function endDragListeners() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    $('#nano').classList.remove('dragging');
    if (hoverZone) { hoverZone.classList.remove('hot'); hoverZone = null; }
  }

  function restore(chip) {
    chip.classList.remove('dragging', 'shake');
    chip.style.position = '';
    chip.style.transform = '';
    chip.style.transition = '';
    chip.style.left = drag ? drag.home.left : '';
    chip.style.top = drag ? drag.home.top : '';
    chip.style.zIndex = '';
    chip.style.opacity = '';
  }

  function onUp(e) {
    if (!drag) return;
    const chip = drag.chip;
    const moved = drag.moved;
    endDragListeners();

    if (!moved) {
      // toque curto: mostra a ficha da peça em vez de tentar soltar
      restore(chip);
      drag = null;
      showTip(chip);
      return;
    }

    const target = resolveTarget(e.clientX, e.clientY);
    let ok = false;
    if (target) ok = tryDrop(chip, target);

    if (!ok) cancelDrag(chip);
    else chip.classList.remove('dragging');
    drag = null;
  }

  function cancelDrag(chip) {
    chip.classList.remove('dragging', 'shake');
    chip.style.position = '';
    chip.style.transform = '';
    chip.style.left = drag ? drag.home.left : '';
    chip.style.top = drag ? drag.home.top : '';
    chip.style.zIndex = '';
    void chip.offsetWidth;
    chip.classList.add('shake');
    setTimeout(() => chip.classList.remove('shake'), 320);
  }

  // Escolhe o alvo do drop olhando toda a pilha de elementos sob o cursor:
  // 1) o elemento que é exatamente o alvo da etapa (chip de íon ou zona);
  // 2) senão, a primeira zona encontrada (as peças ficam soltas sobre o palco).
  function resolveTarget(x, y) {
    const stack = document.elementsFromPoint(x, y) || [];
    const step = state.puzzle.steps[state.step];
    const want = step ? step.target : null;
    let zone = null;
    for (let i = 0; i < stack.length; i++) {
      const node = stack[i];
      const t = node.dataset && node.dataset.target;
      if (t && want && t === want) return node;
      if (!zone && node.classList && node.classList.contains('zone')) zone = node;
    }
    return zone;
  }

  function tryDrop(chip, target) {
    const step = state.puzzle.steps[state.step];
    if (!step) return false;

    const rightTarget = target.dataset.target === step.target;
    const rightItem = step.accept.indexOf(chip.dataset.id) >= 0;

    if (rightTarget && rightItem) {
      const need = step.need || 1;
      state.progress += 1;
      const complete = state.progress >= need;

      if (step.keep) park(chip, target, state.progress, need);
      else absorb(chip, target);

      if (!complete) {
        // etapa parcial: a peça entra, mas ainda faltam cargas/íons
        burstAt(target, '#22d3ee', 5);
        if (step.partial) step.partial(api, target, state.progress, need);
        if (step.replenish) respawn(chip);
        OP.SFX.play('tick');
        OP.SFX.buzz(8);
        return true;
      }

      burstAt(target, '#a3e635', 10);
      OP.SFX.play('ok');
      OP.SFX.buzz([12, 30, 16]);

      step.done(api, chip);
      say(step.text, 'reação');

      const sc = $('#scene');
      if (sc) {
        sc.classList.remove('step-done');
        void sc.offsetWidth;
        sc.classList.add('step-done');
        setTimeout(() => sc.classList.remove('step-done'), 620);
      }

      state.step += 1;
      state.progress = 0;
      setStepUI();
      setEq();

      if (state.step >= state.puzzle.steps.length) win();
      return true;
    }

    const extra = chip.dataset.id && lookupInfo(chip);
    const who = extra ? extra.name.split(' · ')[0] : 'Essa peça';
    if (rightTarget) {
      say(who + ' não participa desta etapa. ' + (state.puzzle.hint || ''), 'tentativa');
    } else {
      say('Esse não é o lugar da reação. ' + (state.puzzle.hint || ''), 'tentativa');
    }
    OP.SFX.play('err');
    OP.SFX.buzz([18, 40, 18]);
    return false;
  }

  /* ---------------- dica ---------------- */
  function clearHint() {
    $$('.chip.hint, .zone.hint').forEach((n) => n.classList.remove('hint'));
    clearTimeout(hintTimer);
  }

  function showHint() {
    const step = state.puzzle && state.puzzle.steps[state.step];
    if (!step) return;
    clearHint();

    $$('#tray .chip').forEach((c) => {
      if (step.accept.indexOf(c.dataset.id) >= 0) c.classList.add('hint');
    });
    $$('#scene .chip').forEach((c) => {
      if (step.accept.indexOf(c.dataset.id) >= 0) c.classList.add('hint');
    });

    const t = $('#scene [data-target="' + step.target + '"]');
    if (t) t.classList.add('hint');

    hintTimer = setTimeout(clearHint, 3600);
    OP.SFX.play('tick');
  }

  /* ---------------- API entregue aos puzzles ---------------- */
  function makeApi() {
    return {
      get scene() { return $('#scene'); },
      get tray() { return $('#tray'); },

      chip(opts) {
        const chip = el('div', 'chip ' + (opts.cls || ''));
        chip.dataset.id = opts.id;
        chip.dataset.chip = opts.id;
        chip.dataset.label = opts.label;
        chip.dataset.cls = opts.cls || '';
        if (opts.target) chip.dataset.target = opts.target;
        chip.textContent = opts.label;
        chip.setAttribute('role', 'button');
        chip.setAttribute('tabindex', '0');
        chip.setAttribute('aria-label', opts.label);

        if (opts.tray) {
          chip.dataset.tray = '1';
          $('#tray').appendChild(chip);
        } else {
          $('#scene').appendChild(chip);
          api.move(chip, opts.x, opts.y);
        }
        makeDrag(chip);
        return chip;
      },

      zone(opts) {
        const z = el('div', 'zone ' + (opts.cls || ''));
        z.dataset.target = opts.id;
        z.style.left = opts.x + '%';
        z.style.top = opts.y + '%';
        z.style.width = opts.w + '%';
        z.style.height = opts.h + '%';
        if (opts.label) z.appendChild(el('span', 'zone-label', opts.label));
        $('#scene').appendChild(z);
        return z;
      },

      flow(opts) {
        const f = el('div', 'flow');
        f.style.left = opts.x + '%';
        f.style.top = opts.y + '%';
        f.style.height = opts.h + '%';
        if (opts.label) f.appendChild(el('span', 'flow-label', opts.label));
        $('#scene').appendChild(f);
        return f;
      },

      move(node, x, y) {
        if (!node) return;
        node.style.left = x + '%';
        node.style.top = y + '%';
      },

      remove(node) {
        if (!node) return;
        if (node.dataset && node.dataset.absorbing === '1') return;
        if (node.parentNode) node.remove();
      },

      // estequiometria visível: slots de carga no íon
      slots(node, n) {
        if (!node) return null;
        const box = el('div', 'slots');
        for (let i = 0; i < n; i++) box.appendChild(el('i'));
        node.appendChild(box);
        node.classList.add('has-slots');
        return box;
      },

      fillSlot(node, n) {
        if (!node) return;
        const s = node.querySelectorAll('.slots i');
        if (s[n - 1]) s[n - 1].classList.add('on');
      },

      pop(node, text) { popAt(node, text); },

      say,
      values: setValues,
      hint: setHint,
    };
  }

  /* ---------------- ciclo de vida ---------------- */
  function build() {
    const p = state.puzzle;
    $('#nano-mod').textContent = p.module + ' · ' + p.title;
    $('#nano-place').textContent = p.place;

    const stage = $('#nano-stage');
    stage.innerHTML = '';

    const board = el('div', 'board');
    const scene = el('div', 'scene');
    scene.id = 'scene';
    scene.appendChild(el('div', 'scale-tag', p.scale));

    const trayWrap = el('div', 'tray-wrap');
    trayWrap.appendChild(el('div', 'tray-title', 'Bancada'));
    const tray = el('div', 'tray');
    tray.id = 'tray';
    trayWrap.appendChild(tray);
    trayWrap.appendChild(el('div', 'tray-help',
      'Arraste uma peça para o palco. Toque numa peça para ver a ficha.'));

    board.appendChild(scene);
    board.appendChild(trayWrap);
    stage.appendChild(board);

    $('#cad').innerHTML = '';
    setValues(p.values || {});
    setHint(p.hint || '');
    buildEq(p);
    sayFactors(p.zone);
    say(p.brief, 'diagnóstico');

    state.step = 0;
    state.progress = 0;
    state.solved = false;
    setStepUI();

    api = makeApi();
    p.build(api);
  }

  function win() {
    state.solved = true;
    setStepUI();
    setEq();
    setHint('Reação completa — área recuperada.');
    OP.SFX.play('win');
    OP.SFX.buzz([20, 60, 20, 60, 30]);

    const p = state.puzzle;
    const card = el('div', 'win-card');
    card.innerHTML =
      '<b>Área recuperada</b>' +
      '<p>' + p.summary + '</p>' +
      '<button class="btn ok" type="button" data-act="back">Voltar ao mapa</button>';
    $('#cad').insertBefore(card, $('#cad').firstChild);

    card.querySelector('[data-act="back"]').addEventListener('click', () => OP.Nano.close());

    if (state.onSolved) state.onSolved(p.zone);
  }

  OP.Nano = {
    isOpen() { return state.open; },

    open(puzzleId, handlers) {
      const p = OP.PUZZLES[puzzleId];
      if (!p) return;
      state.puzzle = p;
      state.onSolved = handlers && handlers.onSolved;
      state.onClose = handlers && handlers.onClose;

      const node = $('#nano');
      node.classList.add('on');
      node.setAttribute('aria-hidden', 'false');
      state.open = true;
      build();
      OP.SFX.play('open');
    },

    close() {
      if (!state.open) return;
      hideTip();
      clearHint();
      const node = $('#nano');
      node.classList.remove('on');
      node.setAttribute('aria-hidden', 'true');
      state.open = false;
      state.puzzle = null;
      OP.SFX.play('close');
      if (state.onClose) state.onClose();
    },

    restart() {
      if (!state.puzzle) return;
      hideTip();
      clearHint();
      build();
    },
  };

  /* ---------------- ligações fixas ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = $('#nano-close');
    if (closeBtn) closeBtn.addEventListener('click', () => OP.Nano.close());

    const resetBtn = $('#nano-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => OP.Nano.restart());

    const hintBtn = $('#nano-hint-btn');
    if (hintBtn) hintBtn.addEventListener('click', showHint);

    const audioBtn = $('#nano-audio');
    if (audioBtn) {
      const paint = () => {
        audioBtn.textContent = OP.SFX.muted ? '🔇' : '🔊';
        audioBtn.classList.toggle('off', OP.SFX.muted);
        audioBtn.setAttribute('aria-pressed', String(!OP.SFX.muted));
      };
      audioBtn.addEventListener('click', () => { OP.SFX.toggle(); paint(); });
      paint();
    }

    document.addEventListener('pointerdown', (e) => {
      const tip = $('#chip-tip');
      if (!tip || !tip.classList.contains('on')) return;
      if (e.target.closest && e.target.closest('.chip')) return;
      hideTip();
    }, true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.open) OP.Nano.close();
    if (e.key === 'h' && state.open) showHint();
  });
})();
