'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — core.js
// Matemática 3D, Câmera Isométrica 3/4, Vetores e Coordenadas Cilíndricas
// Inspirado na metodologia de Rafael (RafaxLab) e Claude
// =============================================================================

(() => {
  const DEG = Math.PI / 180;
  const RAD = 180 / Math.PI;
  const TAU = Math.PI * 2;

  // Câmera Isométrica 3/4 canônica (yaw 45°, pitch 34°)
  const PITCH = 34 * DEG;
  const SQ2 = Math.SQRT1_2;
  const SIN_P = Math.sin(PITCH);
  const COS_P = Math.cos(PITCH);

  // Vetor apontando na direção da câmera no espaço de mundo
  const CAM_DIR = [COS_P * SQ2, COS_P * SQ2, SIN_P];
  // Luz direcional principal vindo do alto à esquerda
  const LIGHT_DIR = [-0.55, -0.35, 0.76];

  // ---------- Vetores 3D ----------
  const vAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const vSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const vScale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const vDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const vCross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
  const vLen = a => Math.hypot(a[0], a[1], a[2]);
  const vDist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const vNorm = a => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const vLerp = (a, b, t) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t
  ];

  // Projeção 3D do mundo para a tela isométrica: [screenX, screenY, depth]
  const project = ([x, y, z]) => [
    (x - y) * SQ2,
    (x + y) * SQ2 * SIN_P - z * COS_P,
    (x + y) * SQ2 * COS_P + z * SIN_P
  ];

  // Desprojeção de tela 2D para o plano de chão z = 0
  const unproject = ([sx, sy]) => [
    (sx + sy / SIN_P) * SQ2,
    (-sx + sy / SIN_P) * SQ2,
    0
  ];

  // Converte ponto local [direita, frente, cima] para o referencial de mundo girado por yaw
  const localToWorld = ([r, f, z], yaw) => [
    r * Math.sin(yaw) + f * Math.cos(yaw),
    -r * Math.cos(yaw) + f * Math.sin(yaw),
    z
  ];

  // Coordenadas Cilíndricas (método chave de Rafael para arcos perfeitos de golpe):
  // Ângulo theta (ao redor do corpo), raio r (distância do centro) e altura z
  const cylindricalToLocal = (theta, radius, z) => [
    Math.sin(theta) * radius,
    Math.cos(theta) * radius,
    z
  ];

  // Curvas de interpolação e aceleração (Easing)
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const Ease = {
    linear: t => clamp(t, 0, 1),
    smooth: t => {
      t = clamp(t, 0, 1);
      return t * t * (3 - 2 * t);
    },
    inQuad: t => Math.pow(clamp(t, 0, 1), 2),
    outQuad: t => {
      t = clamp(t, 0, 1);
      return t * (2 - t);
    },
    inOutQuad: t => {
      t = clamp(t, 0, 1);
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    outCubic: t => {
      t = clamp(t, 0, 1) - 1;
      return t * t * t + 1;
    },
    outBack: t => {
      t = clamp(t, 0, 1) - 1;
      const s = 1.70158;
      return t * t * ((s + 1) * t + s) + 1;
    }
  };

  const angleDiff = (a, b) => {
    let d = (b - a) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  };

  const angleLerp = (a, b, t) => a + angleDiff(a, b) * t;

  // Gerador de números pseudo-aleatórios determinístico com semente
  function createRNG(seed = 1337) {
    let s = seed >>> 0;
    const rng = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    rng.range = (min, max) => min + (max - min) * rng();
    rng.int = (min, max) => Math.floor(min + (max - min + 1) * rng());
    rng.pick = arr => arr[Math.floor(rng() * arr.length)];
    return rng;
  }

  const Core = {
    DEG,
    RAD,
    TAU,
    PITCH,
    SQ2,
    SIN_P,
    COS_P,
    CAM_DIR,
    LIGHT_DIR,
    vAdd,
    vSub,
    vScale,
    vDot,
    vCross,
    vLen,
    vDist,
    vNorm,
    vLerp,
    project,
    unproject,
    localToWorld,
    cylindricalToLocal,
    clamp,
    lerp,
    Ease,
    angleDiff,
    angleLerp,
    createRNG
  };

  globalThis.Agy = globalThis.Agy || {};
  globalThis.Agy.Core = Core;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Core;
  }
})();
