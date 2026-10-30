/* =========================================================
   CONFIG — paleta, biomas, zonas e constantes do jogo
   ========================================================= */
window.OP = window.OP || {};

OP.CONFIG = {
  size: 120,            // lado do mapa (m)
  seg: 96,              // segmentos do terreno (low poly)
  storageKey: 'oasis-pedologico-3d:v1',

  palette: {
    sky: 0x87c9e8,
    fog: 0x9fd2e8,
    sun: 0xfff3d6,
    hemiSky: 0xbfe3ff,
    hemiGround: 0x6b4a2f,
    cerrado: 0xa8431f,
    cerradoGrass: 0xb59a45,
    semi: 0xb3a17c,
    semiCrust: 0xd6c6a4,
    semiMine: 0x8c9298,
    encosta: 0x7d5f3c,
    encostaGreen: 0x5f7f3f,
  },

  // as três áreas problemáticas
  zones: [
    {
      id: 'cerrado', name: 'Cerrado', puzzle: 'calagem',
      x: -40, z: 0, color: 0xff7a3d, icon: '🌾',
      // posição na topossequência (usada nos rótulos e no transecto)
      stop: 1, stopName: 'Topo', short: 'Cerrado',
      blurb: 'Latossolo vermelho, ácido, com Al³⁺ tóxico.',
    },
    {
      id: 'semiarido', name: 'Semiárido', puzzle: 'sodio',
      x: 0, z: 0, color: 0x38bdf8, icon: '🧂',
      stop: 2, stopName: 'Pediplano', short: 'Semiárido',
      blurb: 'Crosta salina, sódio dispersando a argila.',
    },
    {
      id: 'encosta', name: 'Encosta', puzzle: 'agregacao',
      x: 40, z: 0, color: 0xfbbf24, icon: '⛰️',
      stop: 3, stopName: 'Encosta', short: 'Encosta',
      blurb: 'Ravinas, selamento e água que não infiltra.',
    },
  ],

  zoneRadius: 7,

  player: {
    speed: 7.5,
    start: { x: 0, z: 18 },
  },

  camera: {
    dist: 12,
    minDist: 4,
    maxDist: 22,
    pitch: 0.62,
    minPitch: 0.08,
    maxPitch: 1.2,
    fov: 55,
  },
};
