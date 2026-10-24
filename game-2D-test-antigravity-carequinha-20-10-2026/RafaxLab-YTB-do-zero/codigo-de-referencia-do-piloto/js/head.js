'use strict';
// =============================================================================
// head.js — cabeça do cavaleiro desenhada a partir do traçado da referência.
// O rosto (olhos, sobrancelhas, nariz, boca, sombras, orelhas, laterais
// raspadas e as mechas da frente) foi medido na imagem de referência e vive
// em face_data.js em pixels da vista frontal. Aqui cada ponto é levado para a
// superfície 3D da cabeça (x = frente, y = esquerda, z = cima) e projetado
// pela câmera — então a mesma arte aparece corretamente na câmera 3/4 do jogo
// (vista de cima) e gira com a cabeça. A nuca usa mechas 3D próprias.
// =============================================================================

const HEAD_SCALE = 0.98;
// crânio (elipsoide) no espaço local da cabeça
const SKULL_C = [-1.6, 0, 4.0];
const SKULL_R = [12.8, 13.2, 14.2];

// ---------------------------------------------------------------- superfície
const RF = FACE_REF;
const rY = rx => (rx - RF.cx) * RF.k;            // px da referência → y local
const rZ = ry => (RF.ey - ry) * RF.k + 0.85;     // px da referência → z local

function skullX(y, z, grow = 0) {
  const u = 1 - (y / (SKULL_R[1] + grow)) ** 2 - ((z - SKULL_C[2]) / (SKULL_R[2] + grow)) ** 2;
  return u > 0 ? SKULL_C[0] + (SKULL_R[0] + grow) * Math.sqrt(u) : null;
}
// fatias do rosto: [z, meia-largura, centro x, profundidade]
const FACE_SLICES = [
  [12, 12.0, -1.6, 9.5], [6, 12.8, -1.6, 12.4], [3, 12.4, -1.6, 12.9], [0.85, 12.0, -1.6, 12.4],
  [-3, 11.4, -1.6, 12.8], [-6.5, 10.2, -1.4, 13.0], [-9, 8.6, -1.0, 13.0], [-12, 5.8, -0.5, 12.4], [-14.6, 3.0, 0, 11.0],
];
function faceX(y, z) {
  const S = FACE_SLICES;
  let a = S[0], b = S[0];
  if (z <= S[S.length - 1][0]) a = b = S[S.length - 1];
  else for (let i = 0; i < S.length - 1; i++) if (z <= S[i][0] && z >= S[i + 1][0]) { a = S[i]; b = S[i + 1]; break; }
  const t = a === b ? 0 : (a[0] - z) / (a[0] - b[0]);
  const W = lerp(a[1], b[1], t), xc = lerp(a[2], b[2], t), D = lerp(a[3], b[3], t);
  return xc + D * Math.sqrt(Math.max(0, 1 - (y / W) ** 2));
}
// nariz: elevação sobre a superfície (ponte → ponta → base)
function noseBump(y, z) {
  if (z > 2.6 || z < -7.4) return 0;
  const h = z > -5.4 ? lerp(0.5, 3.4, (2.6 - z) / 8.0) : lerp(3.4, 0.6, (-5.4 - z) / 2.0);
  const w = z > -4.6 ? 1.5 : 2.4;
  return h * Math.exp(-((y / w) ** 2));
}
function surfX(y, z) {
  const s = skullX(y, z);
  return Math.max(s === null ? -99 : s, faceX(y, z));
}
// profundidade do cabelo: casca acima do crânio; fora dela as pontas se inclinam para trás
function hairX(y, z) {
  const g = 1.8;
  const s = skullX(y, z, g);
  if (s !== null) return Math.max(s, z < 7 ? faceX(y, z) + 1.2 : -99);
  const ey = SKULL_R[1] + g, ez = SKULL_R[2] + g;
  const d = Math.hypot(y / ey, (z - SKULL_C[2]) / ez);
  return SKULL_C[0] - (d - 1) * Math.min(ey, ez) * 0.3;
}

// ---------------------------------------------------------------- nuca e topo (3D)
function skullPt(lat, lon, raise = 0) {
  const la = lat * DEG, lo = lon * DEG;
  return [
    SKULL_C[0] + (SKULL_R[0] + raise) * Math.cos(la) * Math.cos(lo),
    SKULL_C[1] + (SKULL_R[1] + raise) * Math.cos(la) * Math.sin(lo),
    SKULL_C[2] + (SKULL_R[2] + raise) * Math.sin(la),
  ];
}
function skullNormal(lat, lon) {
  const la = lat * DEG, lo = lon * DEG;
  return vNorm([(Math.cos(la) * Math.cos(lo)) / SKULL_R[0], (Math.cos(la) * Math.sin(lo)) / SKULL_R[1], Math.sin(la) / SKULL_R[2]]);
}
function mohawkPt(beta, y, raise = 0) {
  const k = Math.sqrt(Math.max(0, 1 - (y / SKULL_R[1]) ** 2));
  const b = beta * DEG;
  const n = vNorm([Math.cos(b) * k / SKULL_R[0], y / (SKULL_R[1] * SKULL_R[1]), Math.sin(b) * k / SKULL_R[2]]);
  const p = [SKULL_C[0] + SKULL_R[0] * Math.cos(b) * k, y, SKULL_C[2] + SKULL_R[2] * Math.sin(b) * k];
  return vAddS(p, n, raise);
}
// linha do cabelo (latitude) por longitude: o couro raspado fica acima dela
const HAIRLINE = [[0, 36], [36, 28], [42, 15], [48, 4], [70, -4], [100, -9], [140, -15], [180, -20]];
function hairlineLat(lonDeg) {
  const a = Math.min(180, Math.abs(lonDeg));
  for (let i = 1; i < HAIRLINE.length; i++) {
    const [l0, v0] = HAIRLINE[i - 1], [l1, v1] = HAIRLINE[i];
    if (a <= l1) return lerp(v0, v1, (a - l0) / (l1 - l0));
  }
  return HAIRLINE[HAIRLINE.length - 1][1];
}
// mechas da coroa e da nuca (vistas de trás/lado)
const BACK_LOCKS = (() => {
  const L = [];
  const rel = (beta, y, c1, c2, tip, w, tone) => {
    const b = mohawkPt(beta, y, 1.4);
    L.push({ base: b, c1: vAdd(b, c1), c2: vAdd(b, c2), tip: vAdd(b, tip), w, tone });
  };
  rel(84, 0, [-2, 0.6, 6], [-7, 1.5, 10], [-12, 2.5, 10], 7.5, 'mid');
  rel(98, -4, [-2.5, -1.5, 5], [-7.5, -3, 7], [-12, -5, 6], 6.5, 'base');
  rel(100, 4, [-2.5, 1.5, 5], [-7.5, 3, 7], [-12, 5.5, 5.5], 6.5, 'mid');
  rel(116, 0, [-3, 0.5, 4], [-8, 1, 5], [-13, 1.5, 3], 7, 'base');
  rel(130, -4.5, [-3, -1.6, 2.6], [-6.5, -3.4, 3.4], [-10, -6, 2.6], 5.5, 'mid');
  rel(130, 4.5, [-3, 1.6, 2.6], [-6.5, 3.4, 3.4], [-10, 6, 2.6], 5.5, 'base');
  rel(146, 0, [-3, 0, 2.5], [-7, 0, 3], [-11, 0.5, 1.5], 6, 'mid');
  return L;
})();

// casco da cabeça (crânio + mandíbula traçada)
const HEAD_OUTLINE = (() => {
  const pts = [];
  for (let lat = -20; lat <= 75; lat += 15) for (let lon = 0; lon < 360; lon += 20) pts.push(skullPt(lat, lon));
  pts.push(skullPt(90, 0));
  for (const [rx, ry] of RF.jaw.concat(RF.sides)) { const y = rY(rx), z = rZ(ry); pts.push([surfX(y, z), y, z]); }
  for (const s of [1, -1]) pts.push([-5, 6.5 * s, -10.5], [-8.5, 5.5 * s, -6]); // nuca/base do crânio
  return pts;
})();

// ---------------------------------------------------------------- cores
const HAIR_TONES = {
  dark: ['#3a1812', '#240c0a', '#5a2a1a'],
  base: ['#6c3018', '#3c1810', '#9a4e28'],
  mid: ['#8a4426', '#5a2816', '#b8693a'],
  light: ['#b0602e', '#7a3a1c', '#d88c4c'],
};
const SKIN = { base: '#f0a86c', mid: '#e5925e', shadow: '#cc6c48', deep: '#a84824', light: '#fcb484', ink: '#3a160c' };
const HAIR_MASS = '#2a0f0c', HAIR_INK = '#1c0806';
const BUZZ = { base: '#b47854', dark: '#946042', light: '#c88c66' };

// ---------- vistas (câmeras) ----------
const GAME_VIEW = { project: p => proj(p), get toCam() { return Cam.toCam; }, lw: 1, ink: INK };
function makeOrthoView(yawDeg, pitchDeg, origin, lw = 0.55) {
  const y = yawDeg * DEG, p = pitchDeg * DEG;
  const toCam = [Math.cos(p) * Math.cos(y), Math.cos(p) * Math.sin(y), Math.sin(p)];
  const right = vNorm(vCross([0, 0, 1], toCam)); // base destra (sem espelhar)
  const up = vCross(toCam, right);
  return {
    toCam, lw, ink: INK,
    project: q => { const d = vSub(q, origin); return [vDot(d, right), -vDot(d, up), vDot(d, toCam)]; },
  };
}

// ---------------------------------------------------------------- montagem
function buildHead(frame, view, opts = {}) {
  const ink = view.ink;
  const HS = HEAD_SCALE;
  const px = opts.px || Cam.px || 1;                     // pixels de tela por unidade
  const u = RF.k * HS;                         
… (14781 caracteres a mais)