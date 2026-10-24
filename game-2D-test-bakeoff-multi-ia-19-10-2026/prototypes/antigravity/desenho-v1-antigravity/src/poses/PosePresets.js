// ============================================================================
// PosePresets.js — Poses Estáticas Canônicas para as 8 Vistas/Peças de Referência
// ============================================================================

export const POSE_PRESETS = {
  // 1. Herói Completo em Idle Frontal (Sul 0° — hero-idle-s.png)
  'hero-idle-s': {
    id: 'hero-idle-s',
    label: 'Herói Completo — Idle Sul (0°)',
    refImage: './assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png',
    category: 'static-ref',
    showHead: true,
    showBody: true,
    showCape: true,
    showScarf: true,
    showWeapons: true,
    showBareNeck: false,
    yaw: 0,
    capeFlutter: 0,
    legSpread: 0,
    bodyScale: 0.76,
    head: {
      x: 627,
      y: 656,
      scaleX: 0.568,
      scaleY: 0.568,
      rotation: 0,
      yaw: 0,
      anchorX: 637,
      anchorY: 1132
    },
    neckBase: { x: 627, y: 682 },
    chest:    { x: 627, y: 748 },
    pelvis:   { x: 625, y: 835 },
    armL: {
      shoulder: { x: 485, y: 702 },
      elbow:    { x: 415, y: 765 },
      wrist:    { x: 368, y: 828 },
      handGrip: { x: 342, y: 866 }
    },
    armR: {
      shoulder: { x: 769, y: 702 },
      elbow:    { x: 839, y: 765 },
      wrist:    { x: 886, y: 828 },
      handGrip: { x: 912, y: 866 }
    },
    legL: {
      hip:      { x: 525, y: 890 },
      knee:     { x: 495, y: 1035 },
      ankle:    { x: 468, y: 1145 },
      footSole: { x: 452, y: 1226 },
      footPitch: 0
    },
    legR: {
      hip:      { x: 729, y: 890 },
      knee:     { x: 759, y: 1035 },
      ankle:    { x: 786, y: 1145 },
      footSole: { x: 802, y: 1226 },
      footPitch: 0
    },
    weaponL: {
      x: 342,
      y: 866,
      scale: 0.64,
      rotation: -0.48,
      chainSway: 0.12
    },
    weaponR: {
      x: 912,
      y: 866,
      scale: 0.64,
      rotation: 0.48,
      chainSway: 0.12
    }
  },

  // 2. Cabeça Isolada em Close-up (hero-part-head.png)
  'hero-part-head': {
    id: 'hero-part-head',
    label: 'Peça Canônica — Cabeça (hero-part-head)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-head.png',
    category: 'static-ref',
    showHead: true,
    showBody: false,
    showCape: false,
    showScarf: false,
    showWeapons: false,
    yaw: 0,
    head: {
      x: 637,
      y: 1132,
      scaleX: 1.0,
      scaleY: 1.0,
      rotation: 0,
      yaw: 0,
      anchorX: 637,
      anchorY: 1132
    }
  },

  // 3. Corpo Isolado com Capa e Braços Naturais (hero-part-body.png)
  'hero-part-body': {
    id: 'hero-part-body',
    label: 'Peça Canônica — Corpo + Capa (hero-part-body)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-body.png',
    category: 'static-ref',
    showHead: false,
    showBody: true,
    showCape: true,
    showScarf: true,
    showWeapons: false,
    showBareNeck: false,
    yaw: 0,
    capeFlutter: 0,
    legSpread: 0,
    bodyScale: 0.96,
    neckBase: { x: 615, y: 315 },
    chest:    { x: 615, y: 445 },
    pelvis:   { x: 615, y: 588 },
    armL: {
      shoulder: { x: 435, y: 385 },
      elbow:    { x: 335, y: 515 },
      wrist:    { x: 265, y: 642 },
      handGrip: { x: 248, y: 712 }
    },
    armR: {
      shoulder: { x: 795, y: 385 },
      elbow:    { x: 895, y: 515 },
      wrist:    { x: 965, y: 642 },
      handGrip: { x: 982, y: 712 }
    },
    legL: {
      hip:      { x: 485, y: 665 },
      knee:     { x: 445, y: 895 },
      ankle:    { x: 415, y: 1035 },
      footSole: { x: 398, y: 1162 },
      footPitch: 0
    },
    legR: {
      hip:      { x: 745, y: 665 },
      knee:     { x: 785, y: 895 },
      ankle:    { x: 815, y: 1035 },
      footSole: { x: 842, y: 1162 },
      footPitch: 0
    }
  },

  // 4. Corpo em T-Pose com Capa (hero-part-body-tpose.png)
  'hero-part-body-tpose': {
    id: 'hero-part-body-tpose',
    label: 'Peça Canônica — T-Pose com Capa (hero-part-body-tpose)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-body-tpose.png',
    category: 'static-ref',
    showHead: false,
    showBody: true,
    showCape: true,
    showScarf: true,
    showWeapons: false,
    showBareNeck: false,
    yaw: 0,
    capeFlutter: -0.15,
    legSpread: 0,
    bodyScale: 0.90,
    neckBase: { x: 627, y: 365 },
    chest:    { x: 627, y: 472 },
    pelvis:   { x: 627, y: 608 },
    armL: {
      shoulder: { x: 448, y: 412 },
      elbow:    { x: 285, y: 432 },
      wrist:    { x: 145, y: 448 },
      handGrip: { x: 78,  y: 458 }
    },
    armR: {
      shoulder: { x: 806, y: 412 },
      elbow:    { x: 969, y: 432 },
      wrist:    { x: 1109, y: 448 },
      handGrip: { x: 1176, y: 458 }
    },
    legL: {
      hip:      { x: 505, y: 685 },
      knee:     { x: 472, y: 905 },
      ankle:    { x: 442, y: 1035 },
      footSole: { x: 425, y: 1155 },
      footPitch: 0
    },
    legR: {
      hip:      { x: 749, y: 685 },
      knee:     { x: 782, y: 905 },
      ankle:    { x: 812, y: 1035 },
      footSole: { x: 829, y: 1155 },
      footPitch: 0
    }
  },

  // 5. Corpo em T-Pose sem Capa — Estudo Anatômico (hero-part-body-tpose-nocape.png)
  'hero-part-body-tpose-nocape': {
    id: 'hero-part-body-tpose-nocape',
    label: 'Peça Canônica — T-Pose sem Capa (Anatomia)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-body-tpose-nocape.png',
    category: 'static-ref',
    showHead: false,
    showBody: true,
    showCape: false,
    showScarf: false,
    showWeapons: false,
    showBareNeck: true,
    yaw: 0,
    capeFlutter: 0,
    legSpread: 0,
    bodyScale: 0.88,
    neckBase: { x: 627, y: 365 },
    chest:    { x: 627, y: 475 },
    pelvis:   { x: 627, y: 620 },
    armL: {
      shoulder: { x: 455, y: 425 },
      elbow:    { x: 285, y: 442 },
      wrist:    { x: 145, y: 452 },
      handGrip: { x: 68,  y: 456 }
    },
    armR: {
      shoulder: { x: 799, y: 425 },
      elbow:    { x: 969, y: 442 },
      wrist:    { x: 1109, y: 452 },
      handGrip: { x: 1186, y: 456 }
    },
    legL: {
      hip:      { x: 505, y: 685 },
      knee:     { x: 482, y: 885 },
      ankle:    { x: 455, y: 1010 },
      footSole: { x: 445, y: 1115 },
      footPitch: 0
    },
    legR: {
      hip:      { x: 749, y: 685 },
      knee:     { x: 772, y: 885 },
      ankle:    { x: 799, y: 1010 },
      footSole: { x: 809, y: 1115 },
      footPitch: 0
    }
  },

  // 6. Par de Armas Isoladas (hero-part-weapons.png)
  'hero-part-weapons': {
    id: 'hero-part-weapons',
    label: 'Peça Canônica — Par de Armas (hero-part-weapons)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-weapons.png',
    category: 'static-ref',
    showHead: false,
    showBody: false,
    showCape: false,
    showScarf: false,
    showWeapons: true,
    weaponL: {
      x: 475,
      y: 665,
      scale: 1.0,
      rotation: 0,
      chainSway: 0
    },
    weaponR: {
      x: 779,
      y: 665,
      scale: 1.0,
      rotation: 0,
      chainSway: 0
    }
  }
};
