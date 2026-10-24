'use strict';
// =============================================================================
// knight.js — pinta o cavaleiro a partir do esqueleto resolvido (rig.js).
// Cada peça vira uma forma 2D (cápsula ou casco convexo de pontos 3D
// projetados) com sombreamento celular. As peças são ordenadas por
// profundidade; antes da cor, uma passada de silhueta desenha o contorno
// grosso de tinta do personagem inteiro.
// =============================================================================

const KLW_OUT = 4.6;   // contorno externo (largura total do traço, unidades)
const KLW_IN = 1.4;    // linhas internas

const pj2 = p => [projX(p[0], p[1]), projY(p[0], p[1], p[2])];

// ---------- utilidades de forma ----------
function ringPts(f, z, hw, fd, bd, n = 14) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, c = Math.cos(a), s = Math.sin(a);
    out.push(fPoint(f, [c * (c >= 0 ? fd : bd), hw * s, z]));
  }
  return out;
}
// faixa (cinto, gola…) ao redor de um anel elíptico: só a parte voltada à câmera
function bandPolys(f, zTop, zBot, hw, fd, bd, n = 24, thr = 0) {
  const vis = [], top = [], bot = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, c = Math.cos(a), s = Math.sin(a), A = c >= 0 ? fd : bd;
    top.push(pj2(fPoint(f, [c * A, hw * s, zTop])));
    bot.push(pj2(fPoint(f, [c * A, hw * s, zBot])));
    vis.push(vDot(vNorm(fDir(f, [c / A, s / hw, 0])), Cam.toCam) > thr);
  }
  const start = vis.indexOf(false);
  if (start < 0) return [];
  const runs = [];
  let run = null;
  for (let k = 1; k <= n; k++) {
    const i = (start + k) % n;
    if (vis[i]) (run || (run = [])).push(i);
    else if (run) { runs.push(run); run = null; }
  }
  if (run) runs.push(run);
  return runs.map(idx => {
    const ext = [(idx[0] - 1 + n) % n, ...idx, (idx[idx.length - 1] + 1) % n];
    return { top: ext.map(i => top[i]), bot: ext.map(i => bot[i]) };
  });
}
// arco visível de um anel em volta de um membro (para frisos e tiras)
function limbRing(a3, b3, t, r) {
  const u = vNorm(vSub(b3, a3));
  const c3 = vLerp(a3, b3, t);
  const e1 = vPerp(u), e2 = vCross(u, e1);
  const th0 = Math.atan2(vDot(Cam.toCam, e2), vDot(Cam.toCam, e1));
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const th = th0 - Math.PI / 2 + (i / 10) * Math.PI;
    pts.push(pj2(vAdd(c3, vAdd(vScale(e1, Math.cos(th) * r), vScale(e2, Math.sin(th) * r)))));
  }
  return pts;
}
function trimLine(c, pts, lw, color, edge = true) {
  c.lineCap = 'butt'; c.lineJoin = 'round';
  if (edge) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.lineWidth = lw + 1.5; c.strokeStyle = INK; c.stroke();
  }
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.lineWidth = lw; c.strokeStyle = color; c.stroke();
}
function insetPoly(pts, d) {
  const [cx, cy] = polyCentroid(pts);
  return pts.map(p => {
    const dx = cx - p[0], dy = cy - p[1], l = Math.hypot(dx, dy) || 1;
    const k = Math.min(d, l * 0.45);
    return [p[0] + (dx / l) * k, p[1] + (dy / l) * k];
  });
}

// ---------- peças básicas ----------
function capsulePart(a3, b3, ra, rb, tones, key, o = {}) {
  const A = pj2(a3), B = pj2(b3);
  const build = c => pathCapsule(c, A[0], A[1], ra, B[0], B[1], rb);
  return {
    key, sil: build,
    paint: c => {
      celFill(c, build, tones, o.so ?? Math.min(ra, rb) * 0.7, o.hl ?? 0);
      if (o.mid) o.mid(c, A, B);
      inkStroke(c, build, KLW_IN);
      if (o.after) o.after(c, A, B);
    },
  };
}
function hullPart(points3, tones, key, o = {}) {
  const pts = convexHull(points3.map(pj2));
  const build = o.smooth ? (c => pathSmooth(c, pts)) : (c => pathSoftPoly(c, pts, o.soft ?? 0.45));
  return {
    key, sil: build, pts,
    paint: c => {
      celFill(c, build, tones, o.so ?? 3, o.hl ?? 0);
      if (o.mid) o.mid(c, pts, build);
      inkStroke(c, build, KLW_IN);
      if (o.after) o.after(c, pts, build);
    },
  };
}
function borderQuad(c, q, fill, border, inset) {
  const outer = cc => pathSoftPoly(cc, q, 0.2);
  celFill(c, outer, border, 1.0, 0);
  const iq = insetPoly(q, inset);
  const inner = cc => pathSoftPoly(cc, iq, 0.2);
  celFill(c, inner, fill, 2.4, 0);
  inkStroke(c, inner, 0.7);
  inkStroke(c, outer, KLW_IN);
}

// ---------- mãos ----------
function fistPoints(hand, axis, toward) {
  let w = vSub(toward, vScale(axis, vDot(toward, axis)));
  w = vLen(w) < 1e-4 ? vPerp(axis) : vNorm(w);
  const k = vCross(axis, w);
  const ctr = vAddS(hand, w, 1.0);
  const pts = [];
  const E = [4.1, 4.4, 3.7];
  const add = (a, b, d) => pts.push(vAdd(ctr, vAdd(vScale(axis, a * E[0]), vAdd(vScale(w, b * E[1]), vScale(k, d * E[2])))));
  for (const a of [-0.85, 0.85]) for (const b of [-0.85, 0.85]) for (const d of [-0.85, 0.85]) add(a, b, d);
  add(1.1, 0, 0); add(-1.1, 0, 0); add(0, 1.1, 0); add(0, -1.1, 0); add(0, 0, 1.1); add(0, 0, -1.1);
  return pts;
}

// ---------- capa (verlet) ----------
class Cape {
  constructor() { this.R = 5; this.C = 4; this.seg = 17.5; this.p = null; this.o = null; }
  anchors(rig) {
    const out = [];
    for (let c = 0; c < this.C; c++) {
      const t = c / (this.C - 1);
      out.push(fPoint(rig.chest, [-11.2 - 2.2 * Math.sin(t * Math.PI), lerp(14.5, -14.5, t), 12.5]));
    }
    return out;
  }
  restW(r) { return lerp(29, 46, r / (this.R - 1)) / (this.C - 1); }
  reset(rig) {
    const A = this.anchors(rig);
    const back = vScale(rig.chest.x, -1);
    this.p = []; this.o = [];
    for (let r = 0; r < this.R; r++) for (let c = 0; c < this.C; c++) {
      const q = vAdd(A[c], [back[0] * r * 4, back[1] * r * 4, -r * this.seg]);
      this.p.push(q); this.o.push(q.slice());
    }
  }
  link(i, j, L) {
    const a = this.p[i], b = this.p[j];
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const d = Math.hypot(dx, dy, dz) || 1e-6;
    const diff = (d - L) / d;
    const wa = i < this.C ? 0 : 1, wb = j < this.C ? 0 : 1;
    const s = wa + wb;
    if (!s) return;
    const ka = wa / s, kb = wb / s;
    a[0] += dx * diff * ka; a[1] += dy * diff * ka; a[2] += dz * diff * ka;
    b[0] -= dx * diff * kb; b[1] -= dy * diff * kb; b[2] -= dz * diff * kb;
  }
  collide(rig) {
    const ch = rig.chest;
    for (let i = this.C; i < this.p.length; i++) {
      const p = this.p[i];
      const d = vSub(p, ch.o);
      let lx = vDot(d, ch.x), ly = vDot(d, ch.y);
      const lz = vDot(d, ch.z);
      if (lz < -100) continue;
      const bd = lz > -36 ? 13.5 : 11, hw = lz > -36 ? 20 : 16;
      const e = (lx / bd) ** 2 + (ly / hw) ** 2;
      if (e < 1) {
        if (e < 1e-4) { lx = -bd; ly = 0; } else { const k = 1 / Math.sqrt(e); const nx = lx * k, ny = ly * k; lx = nx; ly = ny; }
        const cur = [vDot(d, ch.x), vDot(d, ch.y)];
        const dx = lx - cur[0], dy = ly - cur[1];
        p[0] += ch.x[0] * dx + ch.y[0] * dy; p[1] += ch.x[1] * dx + ch.y[1] *
… (22629 caracteres a mais)