'use strict';
// fx.js — efeitos de combate: rastro da lâmina (crescente), poeira de impacto,
// onda de choque no vento e a onomatopeia "KRAK!". Tudo em 2D, sobre a câmera.
Object.assign(Pilot, (() => {
  const { taperPath } = Pilot;
  const TAU = Math.PI * 2;
  const rnd = () => Math.random();

  class Effects {
    constructor() { this.parts = []; this.trails = []; this.texts = []; this.cur = null; }

    beginSlash() { this.cur = []; }
    slash(sx, sy) { if (this.cur) { this.cur.push([sx, sy]); if (this.cur.length > 46) this.cur.shift(); } }
    endSlash() { if (this.cur && this.cur.length > 2) this.trails.push({ pts: this.cur, life: 0.26, max: 0.26 }); this.cur = null; }

    impact(sx, sy, power = 1) {
      for (let i = 0; i < 12 * power; i++) {
        const a = rnd() * TAU, sp = 30 + rnd() * 150 * power;
        this.parts.push({ x: sx, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.5 - 40 * power, life: 0.45 + rnd() * 0.3, max: 0.7, r: 1.5 + rnd() * 3, c: rnd() < 0.5 ? '#c9b79a' : '#8f8a74', g: 260 });
      }
    }
    shockwave(sx, sy) { this.parts.push({ ring: true, x: sx, y: sy, life: 0.5, max: 0.5, r: 4 }); }
    krak(sx, sy) { this.texts.push({ x: sx, y: sy, t: 'KRAK!', life: 0.6, max: 0.6 }); }

    update(dt) {
      for (const p of this.parts) {
        if (p.ring) { p.life -= dt; p.r += 260 * dt; continue; }
        p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt;
      }
      this.parts = this.parts.filter(p => p.life > 0);
      for (const tr of this.trails) tr.life -= dt;
      this.trails = this.trails.filter(t => t.life > 0);
      for (const t of this.texts) { t.life -= dt; t.y -= 26 * dt; }
      this.texts = this.texts.filter(t => t.life > 0);
    }

    draw(ctx) {
      // rastro: crescente afunilado que desbota
      for (const tr of this.trails) {
        const k = tr.life / tr.max;
        ctx.globalAlpha = Math.max(0, k);
        const p = taperPath(tr.pts, t => (2 + 16 * Math.sin(Math.PI * t)) * k);
        ctx.fillStyle = '#eaf3ff'; ctx.fill(p);
        ctx.strokeStyle = '#4d6574'; ctx.lineWidth = 1; ctx.stroke(p);
        ctx.globalAlpha = 1;
      }
      if (this.cur && this.cur.length > 2) {
        const p = taperPath(this.cur, t => 3 + 14 * Math.sin(Math.PI * t));
        ctx.globalAlpha = 0.75; ctx.fillStyle = '#eaf3ff'; ctx.fill(p); ctx.strokeStyle = '#4d6574'; ctx.stroke(p); ctx.globalAlpha = 1;
      }
      for (const p of this.parts) {
        const k = Math.max(0, p.life / p.max);
        if (p.ring) { ctx.globalAlpha = k * 0.6; ctx.strokeStyle = '#e8dfcc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.42, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; continue; }
        ctx.globalAlpha = k; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      }
      for (const t of this.texts) {
        const k = t.life / t.max;
        ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.font = `900 ${Math.round(26 + 10 * k)}px Impact, "Arial Black", sans-serif`;
        ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#16111c'; ctx.strokeText(t.t, t.x, t.y);
        ctx.fillStyle = '#ffd23f'; ctx.fillText(t.t, t.x, t.y);
        ctx.globalAlpha = 1;
      }
    }
    clear() { this.parts.length = 0; this.trails.length = 0; this.texts.length = 0; this.cur = null; }
  }

  return { Effects };
})());