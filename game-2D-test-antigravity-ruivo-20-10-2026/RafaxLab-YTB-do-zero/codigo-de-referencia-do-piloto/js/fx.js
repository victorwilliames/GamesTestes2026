'use strict';
// =============================================================================
// fx.js — efeitos redesenhados a cada quadro: rastro da espada, poeira,
// folhas e linhas de vento, onda de choque, rachaduras e onomatopeias.
// =============================================================================

const TRAIL_STYLES = [
  { rim: '#79dcff', core: '#f6fdff', ink: '#123049' },
  { rim: '#79dcff', core: '#f6fdff', ink: '#123049' },
  { rim: '#ffbf3d', core: '#fff8e0', ink: '#3d1d08' },
];

// ---------- rastro da espada ----------
// Amostras (ponta e ponto interno da lâmina) são geradas com subpassos ao
// longo da curva do golpe, então o crescente sai liso mesmo num golpe de 70 ms.
class SwordTrail {
  constructor() { this.s = []; this.life = 0.16; }
  add(tip, inner, t, style) { this.s.push({ tip, inner, t, style }); }
  update(now) { while (this.s.length && now - this.s[0].t > this.life) this.s.shift(); }
  draw(ctx, now) {
    if (this.s.length < 2) return;
    let seg = [this.s[0]];
    for (let i = 1; i < this.s.length; i++) {
      const a = this.s[i - 1], b = this.s[i];
      if (b.t - a.t > 0.05 || b.style !== a.style) { this.drawSeg(ctx, seg, now); seg = []; }
      seg.push(b);
    }
    this.drawSeg(ctx, seg, now);
  }
  drawSeg(ctx, seg, now) {
    const n = seg.length;
    if (n < 2) return;
    const st = TRAIL_STYLES[seg[0].style] || TRAIL_STYLES[0];
    const outer = [], inner = [], core = [];
    for (let i = 0; i < n; i++) {
      const s = seg[i];
      const age = clamp((now - s.t) / this.life, 0, 1);
      const k = Math.pow(1 - age, 0.8) * Math.pow(i / (n - 1), 0.55);
      const T = pj2(s.tip), I = pj2(s.inner);
      outer.push(T);
      inner.push([lerp(T[0], I[0], k), lerp(T[1], I[1], k)]);
      core.push([lerp(T[0], I[0], k * 0.42), lerp(T[1], I[1], k * 0.42)]);
    }
    const poly = outer.concat(inner.slice().reverse());
    const corePoly = outer.concat(core.slice().reverse());
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.beginPath(); pathPoly(ctx, poly);
    ctx.fillStyle = st.ink; ctx.strokeStyle = st.ink; ctx.lineWidth = 2.6; ctx.fill(); ctx.stroke();
    ctx.beginPath(); pathPoly(ctx, poly); ctx.fillStyle = st.rim; ctx.fill();
    ctx.beginPath(); pathPoly(ctx, corePoly); ctx.fillStyle = st.core; ctx.fill();
    // linhas de velocidade dentro do crescente
    for (const f of [0.62, 0.8]) {
      const line = [];
      for (let i = Math.floor(n * 0.3); i < n; i++) line.push([lerp(outer[i][0], inner[i][0], f), lerp(outer[i][1], inner[i][1], f)]);
      if (line.length > 1) inkLine(ctx, line, 0.8, st.core);
    }
    ctx.restore();
  }
}

// ---------- partículas ----------
const FX = {
  puffs: [], leaves: [], streaks: [], rings: [], cracks: [], words: [], streakTimer: 0, leafTimer: 0,

  puff(x, y, z, r0, r1, life, vx = 0, vy = 0, vz = 0) {
    this.puffs.push({ p: [x, y, z], v: [vx, vy, vz], r0, r1, life, t: 0, seed: Math.random() * TAU });
  },
  leaf(x, y, z, vx, vy, vz, col) {
    if (this.leaves.length > 90) this.leaves.shift();
    this.leaves.push({
      p: [x, y, z], v: [vx, vy, vz], rot: Math.random() * TAU, spin: (Math.random() - 0.5) * 12,
      t: 0, life: 4 + Math.random() * 2, land: -1, col: col || (Math.random() < 0.5 ? '#86c552' : '#5aa847'), seed: Math.random() * TAU,
      size: 4.5 + Math.random() * 2.5,
    });
  },
  leafBurst(x, y, z, n, spread = 90, cols) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = Math.random() * spread;
      this.leaf(x + Math.cos(a) * 12, y + Math.sin(a) * 12, z + Math.random() * 30,
        Math.cos(a) * s, Math.sin(a) * s, 80 + Math.random() * 120, cols ? cols[i % cols.length] : undefined);
    }
  },
  ring(x, y, r1, life, width = 9) { this.rings.push({ x, y, r1, life, t: 0, width }); },
  crack(x, y) {
    const lines = [];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + Math.random() * 0.6;
      const pts = [[x, y]];
      let cx = x, cy = y, ang = a;
      const len = 60 + Math.random() * 70;
      for (let k = 0; k < 4; k++) {
        ang += (Math.random() - 0.5) * 0.9;
        cx += Math.cos(ang) * len / 4; cy += Math.sin(ang) * len / 4;
        pts.push([cx, cy]);
      }
      lines.push(pts);
    }
    this.cracks.push({ lines, t: 0, life: 1.8 });
  },
  word(text, x, y, z, style = 0) { this.words.push({ text, p: [x, y, z], t: 0, life: 0.75, style, rot: (Math.random() - 0.5) * 0.3 }); },

  update(dt, cam) {
    for (const d of this.puffs) {
      d.t += dt;
      d.p[0] += d.v[0] * dt; d.p[1] += d.v[1] * dt; d.p[2] += d.v[2] * dt;
      d.v[0] *= Math.exp(-dt * 5); d.v[1] *= Math.exp(-dt * 5); d.v[2] *= Math.exp(-dt * 3);
    }
    this.puffs = this.puffs.filter(d => d.t < d.life);
    for (const l of this.leaves) {
      l.t += dt;
      if (l.land < 0) {
        const w = Wind.at(l.p[0], l.p[1]);
        const im = Wind.push(l.p[0], l.p[1]);
        const ax = Wind.dir[0] * w * 140 + im[0] * 260, ay = Wind.dir[1] * w * 140 + im[1] * 260;
        l.v[0] += (ax - l.v[0]) * Math.min(1, dt * 1.6) + Math.sin(l.t * 5 + l.seed) * 60 * dt;
        l.v[1] += (ay - l.v[1]) * Math.min(1, dt * 1.6) + Math.cos(l.t * 4 + l.seed) * 60 * dt;
        l.v[2] += (-42 - l.v[2]) * Math.min(1, dt * 2.2);
        l.p[0] += l.v[0] * dt; l.p[1] += l.v[1] * dt; l.p[2] += l.v[2] * dt;
        l.rot += l.spin * dt;
        if (l.p[2] <= 0) { l.p[2] = 0; l.land = l.t; }
      }
    }
    this.leaves = this.leaves.filter(l => l.land < 0 ? l.t < 14 : l.t - l.land < 2.2);
    for (const r of this.rings) r.t += dt;
    this.rings = this.rings.filter(r => r.t < r.life);
    for (const c of this.cracks) c.t += dt;
    this.cracks = this.cracks.filter(c => c.t < c.life);
    for (const w of this.words) w.t += dt;
    this.words = this.words.filter(w => w.t < w.life);

    // linhas de vento: nascem a barlavento da câmera e cruzam a tela
    this.streakTimer -= dt;
    if (this.streakTimer <= 0) {
      this.streakTimer = 0.35 + Math.random() * 0.5;
      const g = screenToGround(Cam.W * (Math.random() * 0.4 - 0.2), Cam.H * (0.1 + Math.random() * 0.85));
      this.streaks.push({ head: [g[0], g[1], 30 + Math.random() * 110], pts: [], t: 0, life: 1.8 + Math.random() * 0.9, curl: Math.random() < 0.35, seed: Math.random() * TAU, w: 1.6 + Math.random() * 1.4 });
    }
    for (const s of this.streaks) {
      s.t += dt;
      const w = Wind.at(s.head[0], s.head[1]);
      const sp = 420 + 380 * w;
      let vx = Wind.dir[0] * sp, vy = Wind.dir[1] * sp, vz = Math.sin(s.t * 3 + s.seed) * 30;
      const u = s.t / s.life;
      if (s.curl && u > 0.45 && u < 0.72) { // um "cacho" no meio do caminho
        const a = ((u - 0.45) / 0.27) * TAU;
        vx += -Math.sin(a) * 900 * Wind.dir[0]; vy += -Math.sin(a) * 900 * Wind.dir[1]; vz += Math.cos(a) * 800;
      }
      s.head[0] += vx * dt; s.head[1] += vy * dt; s.head[2] += vz * dt;
      s.pts.push(s.head.slice());
      if (s.pts.length > 18) s.pts.shift();
    }
 
… (4669 caracteres a mais)