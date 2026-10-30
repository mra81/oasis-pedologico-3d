/* =========================================================
   PUZZLES — as três reações do Visor Nano
   Cada etapa: alvo + peças aceitas + reação + explicação
   Extras: `need` (quantas vezes), `partial` (feedback parcial),
   `eq` (equação que acende conforme as etapas são resolvidas).
   ========================================================= */
(function () {

  /* Fichas das peças: aparecem ao tocar/segurar o chip. */
  OP.CHIP_INFO = {
    caco3: { name: 'Calcário · CaCO₃', text: 'Pouco solúvel. Na água libera Ca²⁺ e carbonato; o carbonato consome H⁺ e gera OH⁻. Sem umidade, quase não reage.' },
    agua: { name: 'Água · H₂O', text: 'A calagem depende dela: a dissolução do calcário e a formação de OH⁻ acontecem em solução.' },
    oh: { name: 'Hidroxila · OH⁻', text: 'Neutraliza H⁺ e precipita Al³⁺. Cada Al³⁺ precisa de três OH⁻.' },
    ca: { name: 'Cálcio · Ca²⁺', text: 'Cátion 2+. Ocupa sítios negativos da argila e desloca dois Na⁺ (1+ cada).' },
    mg: { name: 'Magnésio · Mg²⁺', text: 'Cátion 2+ do calcário dolomítico. Ocupa sítios da argila e é nutriente da planta.' },
    al3: { name: 'Alumínio trocável · Al³⁺', text: 'Em pH baixo domina a CTC efetiva e trava o crescimento da raiz.' },
    h: { name: 'Hidrogênio · H⁺', text: 'Acidez ativa. Ocupa sítios da argila e mantém o pH baixo.' },
    gesso: { name: 'Gipsita · CaSO₄·2H₂O', text: 'Fornece Ca²⁺ e SO₄²⁻. Não neutraliza acidez: não substitui o calcário.' },
    so4: { name: 'Sulfato · SO₄²⁻', text: 'Ânion que acompanha o cálcio do gesso. Ajuda a manter o balanço de cargas da solução.' },
    na: { name: 'Sódio · Na⁺', text: 'Cátion 1+ que dispersa a argila: os poros entopem e a água deixa de infiltrar.' },
    om: { name: 'Matéria orgânica', text: 'Cimenta os flocos de argila e reabre poros. É o que transforma floco em agregado.' },
    exsudato: { name: 'Exsudato radicular', text: 'Açúcares e ácidos orgânicos liberados pela raiz. Fazem a ponte entre areia, silte e argila.' },
    hifa: { name: 'Hifa + glomalina', text: 'A glomalina é uma glicoproteína fúngica que costura as partículas em macroagregados.' },
    chuva: { name: 'Gota de chuva', text: 'É o teste: se o agregado não se desfaz, a água infiltra em vez de selar a superfície.' },
    areia: { name: 'Areia', text: 'Partícula grande e pouco reativa. Sozinha, não segura água nem nutriente.' },
    silte: { name: 'Silte', text: 'Partícula intermediária. Fácil de desagregar e de transportar pela enxurrada.' },
    argila: { name: 'Argila', text: 'Partícula pequena, com carga negativa: é onde acontece a troca de cátions.' },
  };

  OP.PUZZLES = {

    /* ---------------------------------------------------------
       1) CERRADO — acidez e toxidez por alumínio (calagem)
       --------------------------------------------------------- */
    calagem: {
      id: 'calagem',
      zone: 'cerrado',
      module: 'Química do Solo',
      title: 'Acidez e Alumínio',
      place: 'Cerrado · Latossolo distrófico',
      scale: '1 µm · superfície da argila',
      brief: 'pH 4,8 · Al³⁺ 1,2 cmolc/kg · V% 22% · CTC 6,5 cmolc/kg. ' +
        'As raízes estão curtas e grossas: o alumínio está travando o crescimento.',
      hint: 'Arraste o calcário para a solução do solo.',
      eq: [
        { at: 0, text: 'CaCO₃ + H₂O → Ca²⁺ + 2 OH⁻' },
        { at: 1, text: 'Al³⁺ + 3 OH⁻ → Al(OH)₃↓' },
        { at: 2, text: 'argila–Al + Ca²⁺ → argila–Ca' },
      ],
      values: { pH: '4,8', 'Al³⁺': '1,2 cmolc/kg', 'V%': '22%', CTC: '6,5 cmolc/kg' },

      build(api) {
        api.zone({ id: 'solucao', x: 50, y: 19, w: 62, h: 19, label: 'solução do solo', cls: 'sol' });
        api.zone({ id: 'argila', x: 50, y: 77, w: 92, h: 25, label: 'superfície da argila', cls: 'clay' });
        api.flow({ x: 50, y: 31, h: 30, label: 'troca iônica' });

        api.zone({ id: 'sitio1', x: 24, y: 77, w: 15, h: 15, label: 'sítio vago', cls: 'site' });
        api.zone({ id: 'sitio2', x: 50, y: 77, w: 15, h: 15, label: '', cls: 'site' });
        api.zone({ id: 'sitio3', x: 76, y: 77, w: 15, h: 15, label: '', cls: 'site' });

        const al = api.chip({ id: 'al3', label: 'Al³⁺', cls: 'al3', x: 24, y: 77, target: 'al3' });
        api.chip({ id: 'h', label: 'H⁺', cls: 'h', x: 50, y: 77, target: 'h' });
        api.chip({ id: 'al3b', label: 'Al³⁺', cls: 'al3', x: 76, y: 77, target: 'al3b' });

        // três cargas positivas para neutralizar: o jogador vê a estequiometria
        api.slots(al, 3);

        const root = document.createElement('div');
        root.className = 'root';
        api.scene.appendChild(root);

        api.chip({ id: 'caco3', label: 'CaCO₃', cls: 'reagent', tray: true });
        api.chip({ id: 'agua', label: 'H₂O', cls: 'water', tray: true });
      },

      steps: [
        {
          target: 'solucao',
          accept: ['caco3'],
          text: 'O calcário (CaCO₃) é pouco solúvel. Na água ele libera Ca²⁺ e carbonato; ' +
            'o carbonato consome H⁺ e gera OH⁻. É a hidroxila que neutraliza a acidez — ' +
            'por isso a calagem precisa de umidade para reagir.',
          done(api, el) {
            api.remove(el);
            api.chip({ id: 'ca', label: 'Ca²⁺', cls: 'ca', tray: true });
            api.chip({ id: 'oh', label: 'OH⁻', cls: 'oh', tray: true });
            api.hint('Leve as três hidroxilas até um dos Al³⁺.');
          },
        },
        {
          target: 'al3',
          accept: ['oh'],
          need: 3,
          replenish: true,
          partial(api, target, n, need) {
            api.fillSlot(target, n);
            api.pop(target, '+' + n + ' OH⁻');
            api.hint('Faltam ' + (need - n) + ' hidroxila(s) para precipitar este Al³⁺.');
          },
          text: 'Al³⁺ + 3 OH⁻ → Al(OH)₃↓. O hidróxido de alumínio é insolúvel: sai da solução e ' +
            'deixa de intoxicar a raiz. Cada Al³⁺ consome três hidroxilas — por isso a ' +
            'recomendação de calcário é calculada pela acidez trocável, não pelo pH sozinho.',
          done(api, el) {
            api.remove(el);
            ['al3', 'al3b'].forEach((id, i) => {
              const al = api.scene.querySelector('[data-target="' + id + '"]');
              if (!al) return;
              al.dataset.locked = '1';
              al.textContent = 'Al(OH)₃';
              al.className = 'chip aloh3';
              api.move(al, i === 0 ? 30 : 70, 48);
            });
            // o H+ trocável também é neutralizado: sobra sítio para Ca e Mg
            const h = api.scene.querySelector('[data-chip="h"]');
            if (h) {
              api.pop(h, 'H⁺ neutralizado');
              setTimeout(() => {
                h.classList.add('flushed');
                setTimeout(() => h.remove(), 720);
              }, 220);
            }
            api.hint('Os sítios ficaram vagos. Ocupe com o cálcio.');
            api.values({ pH: '5,9', 'Al³⁺': '0,2 cmolc/kg' });
          },
        },
        {
          target: 'sitio1',
          accept: ['ca'],
          text: 'Com o Al³⁺ fora da solução, os sítios negativos da argila recebem Ca²⁺ e Mg²⁺. ' +
            'A saturação por bases (V%) sobe e a CTC efetiva passa a ser ocupada por nutrientes, ' +
            'não por alumínio.',
          done(api, el) {
            api.remove(el);
            const ca1 = api.chip({ id: 'ca_site', label: 'Ca²⁺', cls: 'ca', x: 24, y: 77 });
            if (ca1) ca1.dataset.locked = '1';
            const mg = api.chip({ id: 'mg_site', label: 'Mg²⁺', cls: 'mg', x: 50, y: 77 });
            if (mg) mg.dataset.locked = '1';
            const ca2 = api.chip({ id: 'ca_site2', label: 'Ca²⁺', cls: 'ca', x: 76, y: 77 });
            if (ca2) ca2.dataset.locked = '1';
            const root = api.scene.querySelector('.root');
            if (root) root.classList.add('grow');
            api.values({ pH: '6,0', 'Al³⁺': '0,0 cmolc/kg', 'V%': '58%' });
          },
        },
      ],

      summary: 'Com pH 6,0 e alumínio precipitado, a raiz explora o perfil. A calagem não ' +
        '“aduba”: ela corrige a acidez trocável e libera os sítios da argila para Ca²⁺ e Mg²⁺. ' +
        'Sem conservação, o calcário aplicado na superfície se perde por erosão antes de reagir.',
    },

    /* ---------------------------------------------------------
       2) SEMIÁRIDO — sódio, dispersão e recuperação com gesso
       --------------------------------------------------------- */
    sodio: {
      id: 'sodio',
      zone: 'semiarido',
      module: 'Química e Física do Solo',
      title: 'Sódio e Estrutura',
      place: 'Semiárido · solo salino-sódico e área de mineração',
      scale: '10 µm · complexo de troca',
      brief: 'pH 8,7 · PST 18% · CE 6 dS/m · infiltração 2 mm/h. O sódio dispersa a argila: ' +
        'os poros entopem, a água escorre e a crosta de sal cresce.',
      hint: 'Arraste a gipsita para a solução.',
      eq: [
        { at: 0, text: 'CaSO₄·2H₂O → Ca²⁺ + SO₄²⁻' },
        { at: 1, text: 'argila–Na + Ca²⁺ → argila–Ca + 2 Na⁺' },
        { at: 2, text: 'Na⁺ + drenagem → fora do perfil' },
        { at: 3, text: 'argila + MO → agregado estável' },
      ],
      values: { pH: '8,7', PST: '18%', 'Infiltração': '2 mm/h', CE: '6 dS/m' },

      build(api) {
        api.zone({ id: 'solucao', x: 40, y: 19, w: 46, h: 19, label: 'solução do solo', cls: 'sol' });
        api.zone({ id: 'drenagem', x: 84, y: 19, w: 24, h: 19, label: 'drenagem', cls: 'drain' });
        api.zone({ id: 'complexo', x: 50, y: 77, w: 92, h: 25, label: 'complexo de troca (argila)', cls: 'clay' });

        api.chip({ id: 'na1', label: 'Na⁺', cls: 'na', x: 22, y: 77 });
        api.chip({ id: 'na2', label: 'Na⁺', cls: 'na', x: 40, y: 77 });
        api.chip({ id: 'na3', label: 'Na⁺', cls: 'na', x: 58, y: 77 });
        api.chip({ id: 'na4', label: 'Na⁺', cls: 'na', x: 76, y: 77 });

        api.zone({ id: 'agregado', x: 50, y: 48, w: 34, h: 15, label: 'floculação → agregado' });

        api.chip({ id: 'gesso', label: 'CaSO₄·2H₂O', cls: 'reagent', tray: true });
        api.chip({ id: 'om', label: 'Matéria orgânica', cls: 'om', tray: true });
      },

      steps: [
        {
          target: 'solucao',
          accept: ['gesso'],
          text: 'A gipsita dissolve e libera Ca²⁺ e SO₄²⁻. Diferente do calcário, ela não sobe o pH: ' +
            'serve para fornecer cálcio e deslocar sódio, não para corrigir acidez.',
          done(api, el) {
            api.remove(el);
            api.chip({ id: 'ca', label: 'Ca²⁺', cls: 'ca', tray: true });
            api.chip({ id: 'so4', label: 'SO₄²⁻', cls: 'so4', tray: true });
            api.hint('Leve o Ca²⁺ ao complexo de troca.');
          },
        },
        {
          target: 'complexo',
          accept: ['ca'],
          text: 'O Ca²⁺ tem carga 2+ e desloca dois Na⁺ (1+ cada) do complexo de troca. ' +
            'O sódio vai para a solução e precisa ser lixiviado com água de drenagem — ' +
            'sem drenagem, ele volta.',
          done(api, el) {
            api.remove(el);
            [['na1', 34], ['na2', 48]].forEach(([id, x]) => {
              const n = api.scene.querySelector('[data-chip="' + id + '"]');
              if (!n) return;
              n.classList.add('na-free');
              api.move(n, x, 24);
            });
            api.chip({ id: 'ca_site', label: 'Ca²⁺', cls: 'ca', x: 22, y: 77 });
            api.values({ PST: '11%' });
            api.hint('O sódio está na solução. Arraste os dois Na⁺ para a drenagem.');
          },
        },
        {
          target: 'drenagem',
          accept: ['na1', 'na2'],
          need: 2,
          keep: true,
          partial(api, target, n, need) {
            api.hint('Falta ' + (need - n) + ' Na⁺ sair do perfil.');
          },
          text: 'Sódio trocado não some: ele precisa sair do perfil com a água de drenagem. ' +
            'É por isso que gesso sem drenagem não recupera solo sódico — o sódio volta ' +
            'com a ascensão capilar e a crosta se refaz.',
          done(api) {
            // os Na+ parados na drenagem descem e saem do perfil
            const parked = Array.prototype.slice.call(api.scene.querySelectorAll('.chip.parked'));
            parked.forEach((n, i) => {
              setTimeout(() => {
                n.classList.add('flushed');
                setTimeout(() => n.remove(), 720);
              }, i * 110);
            });
            // os que ainda estavam no complexo também são lixiviados
            ['na3', 'na4'].forEach((id, i) => {
              const n = api.scene.querySelector('[data-chip="' + id + '"]');
              if (!n) return;
              setTimeout(() => {
                api.move(n, 84, 19);
                setTimeout(() => {
                  n.classList.add('flushed');
                  setTimeout(() => n.remove(), 720);
                }, 420);
              }, 140 + i * 120);
            });
            const drain = api.scene.querySelector('[data-target="drenagem"]');
            if (drain) drain.classList.remove('has-chip');
            api.values({ PST: '6%', 'Infiltração': '14 mm/h' });
            api.hint('A argila ainda está dispersa. Una os flocos com matéria orgânica.');
          },
        },
        {
          target: 'agregado',
          accept: ['om'],
          text: 'Com o sódio fora e Ca²⁺ no complexo, a argila flocula. A matéria orgânica cimenta ' +
            'os flocos: formam-se agregados, os poros reabrem e a água volta a infiltrar. ' +
            'É a reconstrução de um Tecnossolo sobre a área degradada.',
          done(api, el) {
            api.remove(el);
            const agg = api.scene.querySelector('[data-target="agregado"]');
            if (agg) {
              agg.classList.add('formed');
              agg.textContent = 'agregado estável';
            }
            api.values({ PST: '6%', 'Infiltração': '14 mm/h', CE: '2,5 dS/m' });
          },
        },
      ],

      summary: 'Sódio não se “lava” só com chuva: ele precisa ser trocado por cálcio e levado ' +
        'para fora do perfil. Gesso + matéria orgânica + drenagem recuperam estrutura e ' +
        'infiltração. Em área de mineração, esse é o caminho para reconstruir o solo.',
    },

    /* ---------------------------------------------------------
       3) ENCOSTA — agregação, selamento e erosão
       --------------------------------------------------------- */
    agregacao: {
      id: 'agregacao',
      zone: 'encosta',
      module: 'Física do Solo e Conservação',
      title: 'Agregados e Erosão',
      place: 'Encosta · ravina e solo exposto',
      scale: '100 µm · partículas e hifas',
      brief: 'Agregados estáveis em água: 22% · infiltração 4 mm/h · perda de solo 12 t/ha/ano. ' +
        'A gota de chuva quebra os agregados, sela a superfície e a enxurrada abre a ravina.',
      hint: 'Arraste o exsudato radicular para as partículas.',
      eq: [
        { at: 0, text: 'C orgânico + partículas → microagregado' },
        { at: 1, text: 'hifa + glomalina → macroagregado (>250 µm)' },
        { at: 2, text: 'chuva + agregado estável → infiltração' },
      ],
      values: { 'Agregados': '22%', 'Infiltração': '4 mm/h', 'Perda de solo': '12 t/ha/ano' },

      build(api) {
        const rain = document.createElement('div');
        rain.className = 'rain';
        rain.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
        api.scene.appendChild(rain);

        api.zone({ id: 'particulas', x: 50, y: 38, w: 84, h: 44, label: 'partículas soltas (areia, silte, argila)' });

        const parts = [
          ['areia', 'Areia', 30, 28], ['silte', 'Silte', 50, 24], ['argila', 'Argila', 68, 30],
          ['areia2', 'Areia', 38, 48], ['silte2', 'Silte', 58, 50], ['argila2', 'Argila', 46, 36],
        ];
        parts.forEach(([id, label, x, y]) => {
          api.chip({ id, label, cls: 'particle', x, y, target: id });
        });

        api.zone({ id: 'agregado', x: 50, y: 76, w: 34, h: 18, label: 'macroagregado (>250 µm)' });

        api.chip({ id: 'exsudato', label: 'Exsudato radicular', cls: 'om', tray: true });
        api.chip({ id: 'hifa', label: 'Hifa + glomalina', cls: 'fungo', tray: true });
        api.chip({ id: 'chuva', label: 'Gota de chuva', cls: 'water', tray: true });
      },

      steps: [
        {
          target: 'particulas',
          accept: ['exsudato'],
          text: 'Exsudatos radiculares (açúcares e ácidos orgânicos) colam as partículas. ' +
            'É o primeiro passo da agregação: o carbono orgânico faz a ponte entre areia, silte e argila.',
          done(api, el) {
            api.remove(el);
            api.scene.querySelectorAll('.particle').forEach((p) => p.classList.add('glued'));
            api.hint('Agora costure com a hifa.');
          },
        },
        {
          target: 'agregado',
          accept: ['hifa'],
          text: 'Hifas de fungos micorrízicos e a glomalina costuram as partículas em macroagregados ' +
            '(>250 µm). Agregado estável em água não se desfaz com a chuva — e protege o carbono ' +
            'que está dentro dele.',
          done(api, el) {
            api.remove(el);
            const agg = api.scene.querySelector('[data-target="agregado"]');
            if (agg) {
              agg.classList.add('formed');
              agg.textContent = 'macroagregado estável';
            }
            api.scene.querySelectorAll('.particle').forEach((p) => p.classList.add('wrapped'));
            api.values({ 'Agregados': '68%' });
            api.hint('Teste o agregado com a chuva.');
          },
        },
        {
          target: 'agregado',
          accept: ['chuva'],
          text: 'Com macroagregados estáveis, a gota não sela a superfície: a água infiltra, ' +
            'a enxurrada desaparece e a ravina para de crescer. Conservar estrutura é conservar água.',
          done(api, el) {
            api.remove(el);
            const agg = api.scene.querySelector('[data-target="agregado"]');
            if (agg) agg.classList.add('wet');
            api.values({ 'Infiltração': '26 mm/h', 'Perda de solo': '2 t/ha/ano' });
          },
        },
      ],

      summary: 'Agregação é o elo entre matéria orgânica, biologia e física do solo. ' +
        'Solo agregado infiltra mais, erode menos e guarda mais carbono. Em encosta, ' +
        'cobertura + raízes + fungos valem mais que qualquer obra de contenção.',
    },
  };
})();
