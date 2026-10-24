'use strict';
// =============================================================================
// world.js — o pequeno campo aberto (um platô flutuante).
//   • O chão (grama, trilha, praça de pedras, penhasco e sombras dos objetos)
//     é pintado UMA vez num canvas fora da tela.
//   • Árvores, arbustos, pedras, ruínas e tufos de grama são pintados uma vez
//     em sprites fora da tela e reaproveitados por várias instâncias.
//   • A cada quadro só o balanço do vento muda (transformações nos sprites).
// =============================================================================

const FIELD = { R: 1120, cliff: 230, plazaR: 285 };
const nzA = makeNoise2D(101), nzB = makeNoise2D(202), nzC = makeNoise2D(303), nzD = makeNoise2D(404);

const LEAF = {
  deep: '#1d4a31', shadow: '#2f6a39', base: '#4f9a3f', light: '#86c552', hi: '#b8e06c',
};
const GRASS = { base: '#67a447', dark: '#4b8a3d', darker: '#3b7437', light: '#8dc055', lighter: '#aed468', ink: '#244a2a' };
const STONE = { base: '#b8b1a5', shadow: '#8a837d', light: '#e3ddd1', side: '#6e6966', ink: '#2a2530' };
const MARBLE = { base: '#e3dccd', shadow: '#aaa192', light: '#fffaef', side: '#8f8679' };
const DIRT = { base: '#c99d5f', shadow: '#a77842', light: '#e3bf7f', ink: '#5d3f22' };
const BARK = { base: '#7b5236', shadow: '#4f3424', light: '#a3764c' };
const CLIFF = { light: '#c68f5c', base: '#a06f47', shadow: '#734b31', deep: '#4f3122', ink: '#2c1a14' };

// ---------- forma do platô ----------
function edgeR(th) {
  return FIELD.R * (1 + 0.075 * Math.sin(3 * th + 0.7) + 0.05 * Math.sin(5 * th + 2.1) + 0.026 * Math.sin(11 * th + 4.0)
    + 0.035 * nzA(Math.cos(th) * 1.7 + 3.1, Math.sin(th) * 1.7 + 7.3));
}
const EDGE = [];
(function buildEdge() {
  const N = 240;
  for (let i = 0; i < N; i++) {
    const th = (i / N) * TAU, r = edgeR(th);
    const d = FIELD.cliff + 75 * nzB(i * 0.17, 3.3) + 55 * Math.abs(nzC(i * 0.83, 1.1)) + (i % 7 === 0 ? 40 : 0);
    EDGE.push({ x: Math.cos(th) * r, y: Math.sin(th) * r, th, d });
  }
})();
function insideField(x, y, margin = 0) { return Math.hypot(x, y) < edgeR(Math.atan2(y, x)) - margin; }

// ---------- trilha de terra (Catmull-Rom) ----------
const PATH_CTRL = [[-1320, 470], [-900, 330], [-520, 170], [-200, 50], [0, 0], [210, -80], [520, -260], [860, -400], [1320, -560]];
const PATH = (() => {
  const out = [];
  const P = PATH_CTRL;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < 16; k++) {
      const t = k / 16, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(P[P.length - 1]);
  return out;
})();
function pathDist(x, y) {
  let best = 1e9;
  for (let i = 0; i < PATH.length - 1; i++) {
    const a = PATH[i], b = PATH[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    best = Math.min(best, Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t));
  }
  return best;
}
const pathWidth = s => 52 + 12 * nzD(s * 0.004, 0.5);

// ---------- posicionamento dos objetos ----------
function generateProps() {
  const rnd = makeRng(1337);
  const props = [];
  const free = (x, y, r, gap = 26) => props.every(p => Math.hypot(p.x - x, p.y - y) > p.r + r + gap);
  const front = (x, y) => (x + y) * SQ1_2 / FIELD.R; // >0 = mais perto da câmera
  // ruínas: colunas quebradas em volta da praça
  const ruins = [
    { a: -2.25, d: 365, kind: 'column', v: 0 }, { a: -0.65, d: 395, kind: 'column', v: 1 },
    { a: 1.05, d: 400, kind: 'drum', v: 0 }, { a: 2.85, d: 370, kind: 'column', v: 1 },
  ];
  for (const r of ruins) {
    const x = Math.cos(r.a) * r.d, y = Math.sin(r.a) * r.d;
    props.push({ kind: r.kind, v: r.v, x, y, r: r.kind === 'drum' ? 40 : 30, flip: false });
  }
  let tries = 0;
  const target = { tree: 13, bush: 20, rock: 11 };
  const count = k => props.filter(p => p.kind === k).length;
  while (count('tree') < target.tree && tries++ < 4000) {
    const th = rnd() * TAU, rr = lerp(0.5, 0.9, Math.sqrt(rnd())) * FIELD.R;
    const x = Math.cos(th) * rr, y = Math.sin(th) * rr;
    if (front(x, y) > 0.25 && rnd() < 0.75) continue;
    const cyp = rnd() < 0.38;
    const r = cyp ? 24 : 30;
    if (!insideField(x, y, 90) || pathDist(x, y) < 120 || Math.hypot(x, y) < 520 || !free(x, y, r, cyp ? 120 : 190)) continue;
    props.push({ kind: cyp ? 'cypress' : 'oak', v: rnd.int(0, cyp ? 1 : 2), x, y, r, flip: rnd() < 0.5 });
  }
  tries = 0;
  while (count('bush') < target.bush && tries++ < 4000) {
    const th = rnd() * TAU, rr = lerp(0.3, 0.93, Math.sqrt(rnd())) * FIELD.R;
    const x = Math.cos(th) * rr, y = Math.sin(th) * rr;
    if (!insideField(x, y, 60) || pathDist(x, y) < 95 || Math.hypot(x, y) < FIELD.plazaR + 90 || !free(x, y, 40, 40)) continue;
    props.push({ kind: 'bush', v: rnd.int(0, 2), x, y, r: 40, flip: rnd() < 0.5, solid: false });
  }
  tries = 0;
  while (count('rock') < target.rock && tries++ < 4000) {
    const th = rnd() * TAU, rr = lerp(0.35, 0.95, rnd()) * FIELD.R;
    const x = Math.cos(th) * rr, y = Math.sin(th) * rr;
    const v = rnd.int(0, 3);
    const r = [44, 30, 24, 52][v];
    if (!insideField(x, y, 40) || pathDist(x, y) < 80 || Math.hypot(x, y) < FIELD.plazaR + 70 || !free(x, y, r, 50)) continue;
    props.push({ kind: 'rock', v, x, y, r, flip: rnd() < 0.5 });
  }
  // tufos de grama (sprites animados pelo vento)
  tries = 0;
  const tufts = [];
  while (tufts.length < 300 && tries++ < 9000) {
    const x = rnd.range(-1300, 1300), y = rnd.range(-1300, 1300);
    if (!insideField(x, y, 22) || Math.hypot(x, y) < FIELD.plazaR - 10 || pathDist(x, y) < pathWidth(0) * 0.85) continue;
    if (!props.every(p => Math.hypot(p.x - x, p.y - y) > p.r + 8)) continue;
    if (!tufts.every(t => Math.hypot(t.x - x, t.y - y) > 34)) continue;
    tufts.push({ kind: 'tuft', v: rnd() < 0.2 ? rnd.int(4, 5) : rnd.int(0, 3), x, y, r: 0, flip: rnd() < 0.5 });
  }
  // algumas flores/tufos dentro das frestas da praça
  for (let i = 0; i < 18; i++) {
    const a = rnd() * TAU, d = rnd.range(150, FIELD.plazaR - 10);
    tufts.push({ kind: 'tuft', v: rnd.int(0, 5), x: Math.cos(a) * d, y: Math.sin(a) * d, r: 0, flip: rnd() < 0.5, small: true });
  }
  for (const p of props.concat(tufts)) { p.a = 0; p.va = 0; p.fade = 1; p.phase = rnd() * TAU; }
  return { props, tufts };
}

// ---------- utilidades de desenho no espaço projetado ----------
const gx = (x, y) => projX(x, y);
const gy = (x, y, z = 0) => projY(x, y, z);
function groundPoly(ctx, pts, z = 0) {
  ctx.moveTo(gx(pts[0][0], pts[0][1]), gy(pts[0][0], pts[0][1], z));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(gx(pts[i][0], pts[i][1]), gy(pts[i][0], pts[i][1], z));
  ctx.closePath();
}
function g
… (38045 caracteres a mais)