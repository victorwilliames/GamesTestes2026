'use strict';
// =============================================================================
// rig.js — o esqueleto 3D invisível.
//   • Pose = conjunto de números (quadril, tronco, cabeça, alvos de mão/pé,
//     direção da espada). Poses-chave são interpoladas com curvas de easing.
//   • Mãos usam coordenadas cilíndricas (ângulo, distância, altura) em torno
//     do eixo do corpo: interpolar o ângulo gera arcos naturais de golpe.
//   • Braços e pernas são resolvidos com IK de 2 ossos + vetor polar.
// Espaço do personagem: x = frente, y = esquerda, z = cima.
// =============================================================================

const BODY = {
  spine: 30, neck: 17, headUp: 12.5,
  shoulderW: 19, shoulderUp: 12, hipW: 10, hipDown: 5,
  upper: 28, fore: 30,       // braço (ombro→cotovelo→centro da mão)
  thigh: 44, shin: 44, ankleH: 8,
  gripToGuard: 6, bladeLen: 92,
};

const POSE_FIELDS = [
  'px', 'py', 'pz', 'pYaw', 'pPitch', 'pRoll',
  'cYaw', 'cPitch', 'cRoll', 'hYaw', 'hPitch',
  'lfx', 'lfy', 'lfz', 'lfYaw', 'lfPitch',
  'rfx', 'rfy', 'rfz', 'rfYaw', 'rfPitch',
  'lha', 'lhd', 'lhh', 'rha', 'rhd', 'rhh',
  'sYaw', 'sPitch', 'sRoll', 'twoHand',
  'lePx', 'lePy', 'lePz', 'rePx', 'rePy', 'rePz', 'kOut',
];

const BASE_POSE = {
  px: 0, py: 0, pz: 90, pYaw: 0, pPitch: 0, pRoll: 0,
  cYaw: 0, cPitch: 0, cRoll: 0, hYaw: 0, hPitch: 0,
  lfx: 0, lfy: 12, lfz: 0, lfYaw: 0, lfPitch: 0,
  rfx: 0, rfy: -12, rfz: 0, rfYaw: 0, rfPitch: 0,
  lha: 80, lhd: 26, lhh: 92, rha: -80, rhd: 26, rhh: 92,
  sYaw: 0, sPitch: -60, sRoll: 0, twoHand: 0,
  lePx: -0.45, lePy: 0.8, lePz: -0.45, rePx: -0.45, rePy: -0.8, rePz: -0.45, kOut: 0.22,
};

const mkPose = (over, from = BASE_POSE) => Object.assign({}, from, over);
const clonePose = p => Object.assign({}, p);
function lerpPose(a, b, t) {
  const o = {};
  for (const k of POSE_FIELDS) o[k] = a[k] + (b[k] - a[k]) * t;
  return o;
}
function catmullPose(p0, p1, p2, p3, t) {
  const o = {}, t2 = t * t, t3 = t2 * t;
  for (const k of POSE_FIELDS) {
    const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
    o[k] = 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  }
  return o;
}

// ---------------------------------------------------------------- poses ----
// Guarda de combate (respiração alterna entre A e B)
const IDLE_A = mkPose({
  pz: 87, pYaw: -16, pPitch: 5,
  cYaw: 12, cPitch: 9, hYaw: 4, hPitch: -2,
  lfx: 13, lfy: 14, lfYaw: 20,
  rfx: -13, rfy: -14, rfYaw: -38,
  lha: 52, lhd: 25, lhh: 99,
  rha: -48, rhd: 31, rhh: 97,
  sYaw: -22, sPitch: -26, sRoll: 18,
});
const IDLE_B = mkPose({ pz: 85.6, cPitch: 11, lhh: 97.5, rhh: 95.8, sPitch: -29, hPitch: 0 }, IDLE_A);

// Corrida: meio ciclo (perna direita à frente) e o espelho gera a outra metade.
const RUN_HALF = [
  // contato: pé direito toca à frente, esquerdo saindo atrás
  { rf: [46, -11, 2, -6, -14], lf: [-40, 11, 15, 6, 42], pz: 85.5, pYaw: 11, cYaw: -15 },
  // descida: corpo no ponto mais baixo
  { rf: [22, -11, 0, -6, 0], lf: [-22, 11, 31, 6, 58], pz: 81.5, pYaw: 7, cYaw: -10 },
  // passagem
  { rf: [-2, -11, 0, -6, 0], lf: [6, 11, 29, 6, 12], pz: 88.5, pYaw: 0, cYaw: 0 },
  // subida: impulso, calcanhar sobe
  { rf: [-26, -11, 4, -6, 28], lf: [32, 11, 13, 6, -12], pz: 93.5, pYaw: -7, cYaw: 9 },
];
const RUN_BASE = mkPose({
  pPitch: 9, cPitch: 15, hPitch: -6, kOut: 0.12,
  sYaw: -158, sPitch: -20, sRoll: 0,
});
function runKey(i) {
  const half = RUN_HALF[i % 4];
  const mirror = i >= 4;
  const s = Math.cos((i / 8) * TAU);          // +1 = perna direita à frente
  const k = (s + 1) / 2;
  const R = mirror ? half.lf : half.rf, L = mirror ? half.rf : half.lf;
  const sg = mirror ? -1 : 1;
  return mkPose({
    rfx: R[0], rfy: -Math.abs(R[1]), rfz: R[2], rfYaw: R[3] * -1, rfPitch: R[4],
    lfx: L[0], lfy: Math.abs(L[1]), lfz: L[2], lfYaw: L[3], lfPitch: L[4],
    pz: half.pz, pYaw: half.pYaw * sg, cYaw: half.cYaw * sg,
    // braços em oposição às pernas; o braço da espada balança menos
    lha: lerp(118, 22, k), lhd: lerp(22, 31, k), lhh: lerp(97, 114, k),
    rha: lerp(-74, -134, k), rhd: lerp(30, 24, k), rhh: lerp(103, 97, k),
    sYaw: lerp(-140, -166, k), sPitch: lerp(-14, -24, k),
  }, RUN_BASE);
}
const RUN_KEYS = [0, 1, 2, 3, 4, 5, 6, 7].map(runKey);
const RUN_CYCLE_DIST = 24 * 8; // distância percorrida por ciclo (pé plantado anda 24 a cada 1/8)
function runPose(phase) {
  const f = (((phase % 1) + 1) % 1) * 8;
  const i = Math.floor(f), t = f - i;
  const K = j => RUN_KEYS[(j + 8) % 8];
  return catmullPose(K(i - 1), K(i), K(i + 1), K(i + 2), t);
}

// ---------------------------------------------------------------- golpes ----
// Cada golpe: antecipação → golpe (rastro) → continuação → recuperação.
// pose: null = volta para a pose de locomoção atual.
const ATTACKS = [
  { // 1) corte diagonal da direita para a esquerda
    name: 'corte', lunge: 36, cancel: 0.30, hitKey: 1,
    keys: [
      { dur: 0.11, ease: 'outCubic', pose: mkPose({
        pz: 83, pYaw: -32, pPitch: 6, cYaw: -36, cPitch: 10, cRoll: 5, hYaw: 52, hPitch: -4,
        lfx: 22, lfy: 15, lfYaw: 22, rfx: -18, rfy: -15, rfYaw: -42,
        rha: -118, rhd: 25, rhh: 137, sYaw: -150, sPitch: 32, sRoll: 10,
        lha: 22, lhd: 34, lhh: 112, rePx: -0.1, rePy: -1, rePz: -0.15,
      }) },
      { dur: 0.07, ease: 'linear', trail: true, lunge: 0.75, pose: mkPose({
        pz: 81, pYaw: 24, pPitch: 10, cYaw: 34, cPitch: 15, cRoll: -4, hYaw: -40, hPitch: -6,
        lfx: 27, lfy: 16, lfYaw: 22, rfx: -30, rfy: -14, rfz: 5, rfYaw: -30, rfPitch: 18,
        rha: 34, rhd: 44, rhh: 101, sYaw: 96, sPitch: -12, sRoll: 0,
        lha: 122, lhd: 24, lhh: 104, rePx: -0.4, rePy: -0.9, rePz: -0.3,
      }) },
      { dur: 0.08, ease: 'outCubic', trail: true, lunge: 0.25, pose: mkPose({
        pz: 82, pYaw: 30, pPitch: 10, cYaw: 42, cPitch: 15, cRoll: -5, hYaw: -46, hPitch: -6,
        lfx: 27, lfy: 16, lfYaw: 22, rfx: -28, rfy: -14, rfYaw: -30,
        rha: 62, rhd: 37, rhh: 95, sYaw: 132, sPitch: -22, sRoll: -6,
        lha: 132, lhd: 22, lhh: 102, rePx: -0.4, rePy: -0.9, rePz: -0.3,
      }) },
      { dur: 0.26, ease: 'inOutQuad', pose: null },
    ],
  },
  { // 2) corte de revés da esquerda para a direita, com troca de base
    name: 'reves', lunge: 36, cancel: 0.27, hitKey: 1,
    keys: [
      { dur: 0.09, ease: 'outCubic', pose: mkPose({
        pz: 84, pYaw: 28, pPitch: 6, cYaw: 44, cPitch: 11, cRoll: -4, hYaw: -50, hPitch: -4,
        lfx: 4, lfy: 15, lfYaw: 28, rfx: 25, rfy: -13, rfYaw: -8,
        rha: 86, rhd: 26, rhh: 121, sYaw: 162, sPitch: 16, sRoll: -10,
        lha: 146, lhd: 20, lhh: 106, rePx: 0.1, rePy: -0.6, rePz: -0.8,
      }) },
      { dur: 0.07, ease: 'linear', trail: true, lunge: 0.75, pose: mkPose({
        pz: 82, pYaw: -24, pPitch: 9, cYaw: -38, cPitch: 13, cRoll: 4, hYaw: 44, hPitch: -6,
        lfx: -4, lfy: 15, lfz: 4, lfYaw: 24, lfPitch: 16, rfx: 30, rfy: -13, rfYaw: -8,
        rha: -62, rhd: 45, rhh: 112, sY
… (9679 caracteres a mais)