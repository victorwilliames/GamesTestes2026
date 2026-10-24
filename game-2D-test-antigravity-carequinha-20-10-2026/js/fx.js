'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — fx.js
// Efeitos Visuais de Combate Estilo Quadrinhos (HQ)
// Rastro da Lâmina em Arco, Faíscas, Poeira, Ondas de Choque e Onomatopeias
// =============================================================================

(() => {
  const { TAU } = globalThis.Agy.Core;
  const { ribbon, Palette } = globalThis.Agy.Ink;

  class CombatFX {
    constructor() {
      this.particles = [];
      this.slashTrails = [];
      this.onomatopoeias = [];
      this.currentTrail = null;
      this.screenShake = 0;
    }

    startSlash() {
      this.currentTrail = [];
    }

    addSlashPoint(screenX, screenY) {
      if (this.currentTrail) {
        this.currentTrail.push([screenX, screenY]);
        if (this.currentTrail.length > 50) this.currentTrail.shift();
      }
    }

    endSlash() {
      if (this.currentTrail && this.currentTrail.length >= 3) {
        this.slashTrails.push({
          points: this.currentTrail,
          duration: 0.28,
          maxDuration: 0.28
        });
      }
      this.currentTrail = null;
    }

    spawnImpact(screenX, screenY, strength = 1.0) {
      this.screenShake = Math.max(this.screenShake, 5.0 * strength);

      // Faíscas e fragmentos de impacto
      const count = Math.floor(14 * strength);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * TAU;
        const speed = 40 + Math.random() * 160 * strength;
        this.particles.push({
          x: screenX,
          y: screenY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.6 - 35 * strength,
          gravity: 280,
          radius: 1.5 + Math.random() * 3.5,
          color: Math.random() < 0.6 ? '#f2e8cf' : Palette.gold.base,
          life: 0.45 + Math.random() * 0.3,
          maxLife: 0.75
        });
      }

      // Anel de onda de choque
      this.particles.push({
        isRing: true,
        x: screenX,
        y: screenY,
        radius: 6,
        growth: 280 * strength,
        life: 0.45,
        maxLife: 0.45
      });
    }

    spawnText(text, screenX, screenY) {
      this.onomatopoeias.push({
        text,
        x: screenX,
        y: screenY,
        life: 0.65,
        maxLife: 0.65
      });
    }

    update(dt) {
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - dt * 25);
      }

      // Atualiza partículas
      for (const p of this.particles) {
        p.life -= dt;
        if (p.isRing) {
          p.radius += p.growth * dt;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += p.gravity * dt;
        }
      }
      this.particles = this.particles.filter(p => p.life > 0);

      // Atualiza rastros de lâmina
      for (const tr of this.slashTrails) {
        tr.duration -= dt;
      }
      this.slashTrails = this.slashTrails.filter(tr => tr.duration > 0);

      // Atualiza textos
      for (const txt of this.onomatopoeias) {
        txt.life -= dt;
        txt.y -= 28 * dt; // Flutua para cima
      }
      this.onomatopoeias = this.onomatopoeias.filter(txt => txt.life > 0);
    }

    render(ctx) {
      // 1. Rastros da Espada (Curvas Afuniladas Brilhantes)
      for (const tr of this.slashTrails) {
        const factor = tr.duration / tr.maxDuration;
        ctx.globalAlpha = Math.max(0, factor);
        const arcPath = ribbon(tr.points, t => (2 + 18 * Math.sin(Math.PI * t)) * factor);
        ctx.fillStyle = '#f4f9ff';
        ctx.fill(arcPath);
        ctx.strokeStyle = '#3a4e59';
        ctx.lineWidth = 1.2;
        ctx.stroke(arcPath);
        ctx.globalAlpha = 1.0;
      }

      // Rastro ativo durante o golpe
      if (this.currentTrail && this.currentTrail.length >= 3) {
        const activePath = ribbon(this.currentTrail, t => 3 + 15 * Math.sin(Math.PI * t));
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#f4f9ff';
        ctx.fill(activePath);
        ctx.strokeStyle = '#3a4e59';
        ctx.lineWidth = 1.2;
        ctx.stroke(activePath);
        ctx.globalAlpha = 1.0;
      }

      // 2. Partículas e Ondas de Choque
      for (const p of this.particles) {
        const k = Math.max(0, p.life / p.maxLife);
        if (p.isRing) {
          ctx.globalAlpha = k * 0.7;
          ctx.strokeStyle = '#f8f4e8';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.radius, p.radius * 0.44, 0, 0, TAU);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        } else {
          ctx.globalAlpha = k;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      // 3. Onomatopeias Estilizadas de Quadrinhos
      for (const txt of this.onomatopoeias) {
        const k = txt.life / txt.maxLife;
        ctx.globalAlpha = Math.min(1.0, k * 1.5);
        ctx.font = `900 ${Math.round(28 + 10 * k)}px Impact, "Arial Black", sans-serif`;
        ctx.textAlign = 'center';

        // Contorno preto pesado
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#120d18';
        ctx.strokeText(txt.text, txt.x, txt.y);

        // Preenchimento dourado quente
        ctx.fillStyle = '#ffcf33';
        ctx.fillText(txt.text, txt.x, txt.y);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  globalThis.Agy = globalThis.Agy || {};
  globalThis.Agy.CombatFX = CombatFX;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatFX;
  }
})();
