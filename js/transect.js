/* =========================================================
   TRANSECT — painel de topossequência e fatores de formação
   Mostra o perfil topográfico, as três paradas e, em cada uma,
   como clima, organismos, relevo, material de origem e tempo
   mudam o solo — e o que isso tem a ver com a reação do Visor.
   ========================================================= */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  // posição de cada parada no SVG (viewBox 340 × 160)
  const MARKS = {
    cerrado: [60, 49],
    semiarido: [160, 88],
    encosta: [230, 111],
  };

  // perfil: topo alto, ombreira, pediplano aplainado, colina residual
  // e encosta dissecada com ravina (não é uma rampa única)
  const PROFILE = [
    [8, 58], [28, 55], [48, 51], [60, 49], [70, 54], [82, 65], [98, 76],
    [116, 83], [138, 86], [160, 88], [176, 85], [190, 87], [202, 92],
    [216, 101], [230, 111], [242, 120], [248, 117], [254, 127], [264, 123],
    [278, 131], [300, 136], [332, 140],
  ];

  let open = false;
  let current = null;
  let built = false;
  let onOpen = null;
  let onClose = null;
  let lastFocus = null;

  /* ---------------- utilidades ---------------- */
  function colorOf(id) {
    const z = (OP.CONFIG.zones || []).find((x) => x.id === id);
    return z ? '#' + z.color.toString(16).padStart(6, '0') : '#a3e635';
  }

  function profilePath() {
    const line = PROFILE.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
    return line + ' L332,160 L8,160 Z';
  }

  function stops() {
    const f = OP.FACTORS;
    return f.order.map((id) => Object.assign({ id, color: colorOf(id) }, f.stops[id]));
  }

  /* ---------------- SVG do transecto ---------------- */
  function svgMarkup() {
    const list = stops();
    const d = profilePath();

    const defs =
      '<linearGradient id="trSky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#12294a"/><stop offset="1" stop-color="#0a1526"/>' +
      '</linearGradient>' +
      '<linearGradient id="trSoil" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#7a5230"/>' +
        '<stop offset=".45" stop-color="#5a3a1d"/>' +
        '<stop offset="1" stop-color="#2e1e10"/>' +
      '</linearGradient>' +
      '<marker id="trArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">' +
        '<path d="M0,0 L8,4 L0,8 z" fill="#7dd3fc"/>' +
      '</marker>' +
      '<clipPath id="trClip"><path d="' + d + '"/></clipPath>' +
      list.map((s, i) =>
        '<radialGradient id="trGlow' + i + '" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0" stop-color="' + s.color + '" stop-opacity=".55"/>' +
          '<stop offset="1" stop-color="' + s.color + '" stop-opacity="0"/>' +
        '</radialGradient>').join('');

    const glows = list.map((s, i) => {
      const m = MARKS[s.id] || [160, 90];
      return '<ellipse cx="' + m[0] + '" cy="' + m[1] + '" rx="27" ry="10" fill="url(#trGlow' + i + ')"/>';
    }).join('');

    const pins = list.map((s) => {
      const m = MARKS[s.id] || [160, 90];
      const x = m[0];
      const y = m[1];
      return '<g class="tr-pin" data-stop="' + s.id + '" role="button" tabindex="0" ' +
          'aria-label="Parada ' + s.n + ': ' + s.position + '">' +
          '<line x1="' + x + '" y1="' + (y - 5) + '" x2="' + x + '" y2="' + (y - 23) + '" ' +
            'stroke="' + s.color + '" stroke-width="1.4" stroke-dasharray="2 2"/>' +
          '<circle class="tr-pin-b" cx="' + x + '" cy="' + (y - 31) + '" r="9.4" fill="' + s.color + '"/>' +
          '<text class="tr-pin-n" x="' + x + '" y="' + (y - 28) + '">' + s.n + '</text>' +
          '<text class="tr-pin-t" x="' + (x + 13) + '" y="' + (y - 27) + '">' + s.position + '</text>' +
          '<circle cx="' + x + '" cy="' + (y - 16) + '" r="19" fill="transparent"/>' +
        '</g>';
    }).join('');

    const rain = [16, 28, 40, 52].map((x, i) => {
      const y = 16 + (i % 2) * 7;
      return '<line class="tr-rain" x1="' + x + '" y1="' + y + '" x2="' + (x - 3) + '" y2="' + (y + 12) + '"/>';
    }).join('');

    const notes =
      // ascensão capilar no pediplano
      '<g class="tr-note">' +
        '<line x1="188" y1="99" x2="188" y2="88" stroke="#7dd3fc" stroke-width="1.1" ' +
          'stroke-dasharray="2 2" marker-end="url(#trArrow)"/>' +
        '<text x="188" y="106">sais sobem</text>' +
      '</g>' +
      // enxurrada na encosta
      '<g class="tr-note">' +
        '<line x1="210" y1="98" x2="252" y2="123" stroke="#7dd3fc" stroke-width="1.1" ' +
          'stroke-dasharray="2 2" marker-end="url(#trArrow)"/>' +
        '<text x="252" y="142">enxurrada</text>' +
      '</g>';

    return '<svg viewBox="0 0 340 160" preserveAspectRatio="xMidYMid meet" role="img" ' +
        'aria-label="Perfil topográfico com topo, pediplano e encosta dissecada">' +
        '<defs>' + defs + '</defs>' +
        '<rect width="340" height="160" fill="url(#trSky)"/>' +
        rain +
        '<g clip-path="url(#trClip)">' +
          '<rect width="340" height="160" fill="url(#trSoil)"/>' +
          glows +
          '<rect y="112" width="340" height="20" fill="rgba(0,0,0,.20)"/>' +
          '<rect y="132" width="340" height="28" fill="#2b241d"/>' +
          '<path d="M0,132 H340" stroke="rgba(255,255,255,.16)" stroke-dasharray="4 3"/>' +
          '<path d="M0,112 H340" stroke="rgba(255,255,255,.10)" stroke-dasharray="3 4"/>' +
        '</g>' +
        '<path d="' + d + '" fill="none" stroke="#c9a06a" stroke-width="1.5"/>' +
        notes +
        pins +
      '</svg>';
  }

  /* ---------------- conteúdo da parada ---------------- */
  // os campos do texto usam o nome do fator em inglês; aqui fica a ponte
  const FIELD = {
    clima: 'climate',
    organismos: 'organisms',
    relevo: 'relief',
    material: 'material',
    tempo: 'time',
  };

  function infoMarkup(s) {
    const cards = OP.FACTORS.factors.map((f) =>
      '<article class="tr-factor" data-factor="' + f.id + '">' +
        '<span class="ic" aria-hidden="true">' + f.icon + '</span>' +
        '<div><h4>' + f.name + ' <small>' + f.short + '</small></h4>' +
        '<p>' + (s[FIELD[f.id]] || '') + '</p></div>' +
      '</article>').join('');

    return '<div class="tr-info-head" style="--c:' + s.color + '">' +
        '<span class="tr-badge">Parada ' + s.n + '</span>' +
        '<h3>' + s.position + ' <small>' + s.positionLong + '</small></h3>' +
        '<p class="tr-eco">🌿 ' + s.ecosystem + '</p>' +
        '<p class="tr-soil">🧱 ' + s.soil + '</p>' +
      '</div>' +
      '<p class="tr-sum">' + s.summary + '</p>' +
      '<div class="tr-callout dom"><b>Fator dominante</b><span>' + s.dominant + '</span></div>' +
      '<div class="tr-factors">' + cards + '</div>' +
      '<div class="tr-callout react"><b>Reação no Visor</b><p>' + s.reaction + '</p></div>' +
      '<div class="tr-callout cons"><b>Conservação</b><p>' + s.conservation + '</p></div>';
  }

  function compareMarkup() {
    const f = OP.FACTORS;
    const head = f.order.map((id) =>
      '<th scope="col">' + f.stops[id].n + ' · ' + f.stops[id].position + '</th>').join('');
    const row = (label, fn) =>
      '<tr><th scope="row">' + label + '</th>' +
      f.order.map((id) => '<td>' + fn(f.stops[id]) + '</td>').join('') + '</tr>';

    const table = '<div class="tr-table-wrap"><table class="tr-table">' +
      '<thead><tr><th scope="col">Fator</th>' + head + '</tr></thead>' +
      '<tbody>' +
        row('Ecossistema', (s) => s.ecosystem) +
        row('Solo', (s) => s.soil) +
        row('Clima', (s) => s.climateTag) +
        row('Fator dominante', (s) => s.dominant) +
        row('Conservação', (s) => s.conservationTag) +
      '</tbody></table></div>';

    // no celular a tabela vira três cartões empilhados (leitura sem rolagem lateral)
    const cards = f.order.map((id) => {
      const s = f.stops[id];
      return '<article class="tr-ccard" style="--c:' + colorOf(id) + '">' +
        '<h4><span class="n">' + s.n + '</span>' + s.position +
          ' <small>' + s.ecosystem.split(' — ')[0] + '</small></h4>' +
        '<dl>' +
          '<dt>Solo</dt><dd>' + s.soil + '</dd>' +
          '<dt>Clima</dt><dd>' + s.climateTag + '</dd>' +
          '<dt>Dominante</dt><dd>' + s.dominant + '</dd>' +
          '<dt>Conservação</dt><dd>' + s.conservationTag + '</dd>' +
        '</dl>' +
      '</article>';
    }).join('');

    return table + '<div class="tr-cards">' + cards + '</div>';
  }

  /* ---------------- montagem ---------------- */
  function build() {
    const f = OP.FACTORS;
    const panel = $('#transect');
    if (!panel || !f) return;

    $('#tr-lead').textContent = f.intro;
    $('#tr-model').textContent = f.model;
    $('#tr-svg').innerHTML = svgMarkup();

    $('#tr-tabs').innerHTML = f.order.map((id) => {
      const s = f.stops[id];
      return '<button class="tr-tab" type="button" role="tab" data-stop="' + id + '" ' +
          'style="--c:' + colorOf(id) + '" ' +
          'aria-selected="false" aria-controls="tr-info" id="tr-tab-' + id + '">' +
          '<span class="n">' + s.n + '</span>' +
          '<b>' + s.position + '</b>' +
          '<i>' + s.ecosystem.split(' — ')[0] + '</i>' +
        '</button>';
    }).join('');

    $('#tr-legend').innerHTML = f.factors.map((fa) =>
      '<button class="tr-chip" type="button" data-factor="' + fa.id + '" title="' + fa.short + '">' +
        '<span aria-hidden="true">' + fa.icon + '</span>' + fa.name +
      '</button>').join('');

    $('#tr-compare').innerHTML =
      '<summary>📊 Comparar as 3 paradas</summary>' + compareMarkup();

    $('#tr-foot').textContent = f.catena;

    built = true;
    show(current || f.order[0]);
  }

  function show(id) {
    const s = OP.FACTORS.stops[id];
    if (!s) return;
    current = id;

    $$('.tr-tab').forEach((b) => {
      const on = b.dataset.stop === id;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    $$('.tr-pin').forEach((p) => p.classList.toggle('on', p.dataset.stop === id));

    const info = $('#tr-info');
    info.innerHTML = infoMarkup(s);
    info.scrollTop = 0;
  }

  function flashFactor(id) {
    const card = $('#tr-info .tr-factor[data-factor="' + id + '"]');
    if (!card) return;
    card.classList.remove('flash');
    void card.offsetWidth;
    card.classList.add('flash');
    if (card.scrollIntoView) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setTimeout(() => card.classList.remove('flash'), 1400);
  }

  /* ---------------- abrir / fechar ---------------- */
  function openPanel(stopId) {
    if (OP.Nano && OP.Nano.isOpen()) return;
    if (!built) build();
    const panel = $('#transect');
    if (!panel) return;

    lastFocus = document.activeElement;
    panel.classList.add('on');
    panel.setAttribute('aria-hidden', 'false');
    open = true;
    show(stopId || current || OP.FACTORS.order[0]);

    const btn = $('#tr-close');
    if (btn) btn.focus();
    if (onOpen) onOpen();
  }

  function closePanel() {
    if (!open) return;
    const panel = $('#transect');
    panel.classList.remove('on');
    panel.setAttribute('aria-hidden', 'true');
    open = false;
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) {
      try { lastFocus.focus(); } catch (err) { /* ignore */ }
    }
    lastFocus = null;
    if (onClose) onClose();
  }

  /* ---------------- eventos ---------------- */
  function bind() {
    const panel = $('#transect');
    if (!panel) return;

    panel.addEventListener('click', (e) => {
      if (e.target === panel) { closePanel(); return; }

      const tab = e.target.closest('.tr-tab');
      if (tab) { show(tab.dataset.stop); return; }

      const pin = e.target.closest('.tr-pin');
      if (pin) { show(pin.dataset.stop); return; }

      const chip = e.target.closest('.tr-chip');
      if (chip) { flashFactor(chip.dataset.factor); return; }

      if (e.target.closest('#tr-close')) closePanel();
    });

    // teclado: setas trocam de parada, Enter/Espaço nos marcadores
    panel.addEventListener('keydown', (e) => {
      const tab = e.target.closest('.tr-tab');
      const pin = e.target.closest('.tr-pin');

      if ((tab || pin) && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        show((tab || pin).dataset.stop);
        return;
      }
      if (!tab || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;

      e.preventDefault();
      const order = OP.FACTORS.order;
      const i = order.indexOf(tab.dataset.stop);
      const next = order[(i + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length];
      show(next);
      const el = $('#tr-tab-' + next);
      if (el) el.focus();
    });

    const hudBtn = $('#transect-btn');
    if (hudBtn) hudBtn.addEventListener('click', () => openPanel());

    const startBtn = $('#start-transect');
    if (startBtn) startBtn.addEventListener('click', () => openPanel());
  }

  OP.Transect = {
    isOpen() { return open; },
    open: openPanel,
    close: closePanel,
    show,

    init(opts) {
      onOpen = opts && opts.onOpen;
      onClose = opts && opts.onClose;
      bind();
      build();
    },
  };

  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      if (open) closePanel(); else openPanel();
    } else if (e.key === 'Escape' && open) {
      closePanel();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { if (!built) build(); });
  }
})();
