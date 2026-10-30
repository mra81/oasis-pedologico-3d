/* =========================================================
   FACTORS — transecto, topossequência e fatores de formação
   S = f(clima, organismos, relevo, material de origem, tempo)
   ========================================================= */
(function () {
  OP.FACTORS = {
    model: 'S = f(clima, organismos, relevo, material de origem, tempo)',

    intro: 'O solo não nasce pronto: é o resultado da ação conjunta de cinco fatores. ' +
      'Ao longo de um transecto, a combinação muda de parada para parada — e o solo ' +
      'responde de forma diferente em cada uma.',

    catena: 'Numa topossequência (catena), clima e material de origem são parecidos e o ' +
      'relevo varia: topo, encosta e baixada recebem água, sedimentos e erosão de modos ' +
      'diferentes. Aqui o transecto também muda o clima — de propósito, para comparar os ' +
      'cinco fatores lado a lado.',

    factors: [
      { id: 'clima', icon: '☀️', name: 'Clima', short: 'chuva e temperatura' },
      { id: 'organismos', icon: '🌱', name: 'Organismos', short: 'raízes, fauna e micróbios' },
      { id: 'relevo', icon: '⛰️', name: 'Relevo', short: 'caminho da água' },
      { id: 'material', icon: '🪨', name: 'Material de origem', short: 'elementos e minerais' },
      { id: 'tempo', icon: '⏳', name: 'Tempo', short: 'maturação do perfil' },
    ],

    order: ['cerrado', 'semiarido', 'encosta'],

    stops: {
      /* ---------------- 1. topo ---------------- */
      cerrado: {
        n: 1,
        position: 'Topo',
        positionLong: 'Topo de paisagem suave ondulada',
        zone: 'Cerrado',
        ecosystem: 'Cerrado — savana tropical sazonal',
        soil: 'Latossolo Vermelho distrófico',
        summary: 'Clima tropical sazonal + relevo de topo + material ácido + tempo longo ' +
          '→ Latossolo profundo, lixiviado e ácido. O clima lava as bases; o tempo aprofunda o perfil.',
        climate: 'Tropical sazonal: cerca de 1.400 mm/ano concentrados no verão e 4–5 meses ' +
          'secos. Chove mais do que evapotranspira: a água percola e lixivia Ca²⁺, Mg²⁺, K⁺, ' +
          'Na⁺ e sílica para fora do perfil.',
        organisms: 'Cerrado com raízes profundas, micorrizas, cupins e formigas. A matéria ' +
          'orgânica é reciclada rápido e misturada ao perfil pela bioturbação — o carbono ' +
          'entra e sai, mas o sistema mantém a estrutura.',
        relief: 'Topo de paisagem suave ondulado, bem drenado. A água infiltra e percola; ' +
          'não há acúmulo de sais nem de sedimentos. É o ponto da topossequência que mais ' +
          'perde e menos recebe.',
        material: 'Rochas ácidas (arenitos, granitos, gnaisses) ou sedimentos pobres em bases. ' +
          'Há pouco Ca²⁺, Mg²⁺ e K⁺ para repor o que a chuva leva embora.',
        time: 'Paisagem antiga e muito intemperizada: perfil profundo (mais de 2 m), argila ' +
          '1:1 (caulinita) e óxidos de Fe e Al, com baixa CTC. O tempo é o que transformou ' +
          'rocha em Latossolo.',
        dominant: 'clima (lixiviação) + tempo (intemperismo)',
        climateTag: '1.400 mm · percola e lixivia',
        conservationTag: 'cobertura + plantio direto',
        reaction: 'A chuva lavou as bases e deixou H⁺ e Al³⁺ nos sítios da argila. É essa ' +
          'acidez trocável que o calcário neutraliza: o carbonato consome H⁺, gera OH⁻ e ' +
          'precipita Al(OH)₃. Por isso a dose se calcula pela acidez trocável, não só pelo pH.',
        conservation: 'Manter cobertura e plantio direto; corrigir pela acidez trocável e ' +
          'proteger o calcário da erosão antes que ele reaja. Solo de topo perde água rápido: ' +
          'cobertura e matéria orgânica seguram a chuva no perfil.',
      },

      /* ---------------- 2. pediplano ---------------- */
      semiarido: {
        n: 2,
        position: 'Pediplano',
        positionLong: 'Superfície aplainada por erosão',
        zone: 'Semiárido',
        ecosystem: 'Caatinga — floresta tropical seca e caducifólia',
        soil: 'Solo salino-sódico / Tecnossolo',
        summary: 'Chuva escassa + evaporação alta + relevo aplainado + material com sódio ' +
          '→ sais acumulam e a argila dispersa. A drenagem impedida fecha o ciclo.',
        climate: 'Semiárido: cerca de 600 mm/ano irregulares e evapotranspiração potencial de ' +
          '~2.200 mm/ano. O balanço hídrico é negativo: a água evapora e os sais sobem por ' +
          'capilaridade até a superfície.',
        organisms: 'Caatinga esparsa, raízes superficiais e pouca matéria orgânica. A biota ' +
          'do solo é sensível à salinidade e à crosta que se forma na superfície.',
        relief: 'Pediplano (superfície aplainada por erosão), com baixadas de drenagem ' +
          'impedida. A água fica parada, evapora e concentra sais — o oposto do topo, que ' +
          'drena e perde.',
        material: 'Sedimentos e rochas ricas em sódio, além de rejeito de mineração: um ' +
          'Tecnossolo, material antropogênico que a paisagem não teve tempo de organizar.',
        time: 'A salinização pode avançar em décadas com irrigação mal manejada. O Tecnossolo ' +
          'é jovem: tempo curto de formação, sem horizontes bem desenvolvidos.',
        dominant: 'clima (evaporação) + relevo (drenagem impedida) + material (sais)',
        climateTag: '600 mm · evapora e concentra sais',
        conservationTag: 'drenagem + gesso + matéria orgânica',
        reaction: 'Com Na⁺ dominando o complexo de troca, a argila se dispersa e sela os poros. ' +
          'O gesso fornece Ca²⁺, que desloca o Na⁺; sem drenagem o sódio volta por ascensão ' +
          'capilar — por isso a etapa de lixiviar é obrigatória.',
        conservation: 'Drenagem + gesso + matéria orgânica; irrigar com água de boa qualidade ' +
          'e manter cobertura morta para reduzir a evaporação e a subida capilar. Sem drenagem, ' +
          'a correção não se sustenta.',
      },

      /* ---------------- 3. encosta ---------------- */
      encosta: {
        n: 3,
        position: 'Encosta',
        positionLong: 'Rampa dissecada, com ravina',
        zone: 'Encosta',
        ecosystem: 'Encosta degradada — solo exposto e pasto ralo',
        soil: 'Neossolo/Cambissolo raso em ravina',
        summary: 'Declive + chuva concentrada + solo exposto → escoamento e ravina. Raízes e ' +
          'fungos são o que seguram o agregado e interrompem a perda de solo.',
        climate: 'Chuvas concentradas e intensas. A gota bate no solo exposto, quebra os ' +
          'agregados e o escoamento superficial ganha energia ao longo da rampa.',
        organisms: 'Poucas raízes e fungos no momento — e são justamente eles que produzem ' +
          'exsudatos e glomalina para reagregar o solo. A biologia é o capital a reconstruir.',
        relief: 'Declive acentuado e rampa longa: a água corre rápido, carrega partículas e ' +
          'abre ravinas. O topo perde, a baixada recebe — o relevo decide para onde o solo vai.',
        material: 'Colúvio e saprolito: solo jovem, pouco espesso e pedregoso, fácil de ' +
          'desagregar quando perde a cobertura.',
        time: 'A degradação é rápida (anos de uso) e a recuperação é lenta: cada chuva pode ' +
          'desfazer o que a biologia levou meses para construir.',
        dominant: 'relevo (declive) + organismos (raízes e fungos) + uso do solo',
        climateTag: 'chuva concentrada · escoamento',
        conservationTag: 'cobertura + terraceamento',
        reaction: 'Sem agregado, a gota quebra os torrões e sela a superfície. Exsudato e ' +
          'glomalina costuram as partículas: o macroagregado infiltra em vez de deixar a ' +
          'enxurrada correr.',
        conservation: 'Cobertura permanente, terraceamento e cordões em nível, reflorestamento ' +
          'com espécies nativas e não revolver o solo na rampa. Em encosta, cobertura vale ' +
          'mais que obra de contenção.',
      },
    },
  };
})();
