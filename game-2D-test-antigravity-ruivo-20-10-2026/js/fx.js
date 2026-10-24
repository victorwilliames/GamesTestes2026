/**
 * fx.js - Efeitos Visuais de Combate Estilo Hades
 * (Arcos Curvados de Espada, Faíscas de Aço, Impacto de Solo, Poeira de Passos e Tremores de Tela)
 */

class FXManager {
  constructor() {
    this.slashes = [];
    this.particles = [];
    this.shockwaves = [];
    this.dustPuffs = [];

    // Tremor de tela
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffset = { x: 0, y: 0 };
  }

  triggerShake(intensity = 6, duration = 0.25) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  /**
   * Dispara um arco de corte estilizado (Corte / Revés / Salto)
   */
  spawnSlash(origin2D, angle, radius = 55, arcSpan = Math.PI * 0.9, comboIndex = 1) {
    this.slashes.push({
      x: origin2D.x,
      y: origin2D.y,
      angle: angle,
      radius: radius,
      arcSpan: arcSpan,
      progress: 0,
      duration: comboIndex === 3 ? 0.32 : 0.22,
      comboIndex: comboIndex
    });
  }

  /**
   * Dispara faíscas de impacto metálico
   */
  spawnSparks(x, y, count = 12, dirAngle = 0) {
    for (let i = 0; i < count; i++) {
      const spd = 70 + Math.random() * 150;
      const spread = (Math.random() - 0.5) * Math.PI * 0.85;
      const a = dirAngle + spread;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0,
        maxLife: 0.18 + Math.random() * 0.16,
        size: 2.2 + Math.random() * 2.8,
        color: Math.random() > 0.35 ? '#FFE070' : '#FF5020'
      });
    }
  }

  /**
   * Dispara onda de choque circular no solo (Combo 3 Ground Slam)
   */
  spawnShockwave(x, y, maxRadius = 80) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 6,
      maxRadius: maxRadius,
      life: 0,
      duration: 0.38
    });
    this.triggerShake(9, 0.32); // Tremor violento na tela!
  }

  /**
   * Dispara poeira de passos ao correr pelas lajes de pedra
   */
  spawnDust(x, y, vx = 0, vy = 0) {
    this.dustPuffs.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 4,
      vx: vx * 0.2 + (Math.random() - 0.5) * 12,
      vy: vy * 0.2 - 8 - Math.random() * 8,
      radius: 3.5 + Math.random() * 3.5,
      life: 0,
      duration: 0.28 + Math.random() * 0.15
    });
  }

  update(dt) {
    // Atualiza tremor de tela
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const p = this.shakeTimer / this.shakeDuration;
      const curIntensity = this.shakeIntensity * p;
      this.shakeOffset.x = (Math.random() - 0.5) * curIntensity * 2;
      this.shakeOffset.y = (Math.random() - 0.5) * curIntensity * 2;
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
    }

    // Atualizar arcos de corte
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.progress += dt / s.duration;
      if (s.progress >= 1.0) {
        this.slashes.splice(i, 1);
      }
    }

    // Atualizar faíscas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.91;
      p.vy *= 0.91;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Atualizar poeira
    for (let i = this.dustPuffs.length - 1; i >= 0; i--) {
      const d = this.dustPuffs[i];
      d.life += dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.radius += dt * 8;
      if (d.life >= d.duration) {
        this.dustPuffs.splice(i, 1);
      }
    }

    // Atualizar ondas de choque
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      const t = sw.life / sw.duration;
      sw.radius = sw.maxRadius * (1 - Math.pow(1 - t, 2.2));
      if (sw.life >= sw.duration) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // 1. Poeira de passos no solo
    for (const d of this.dustPuffs) {
      const alpha = Math.max(0, 1 - d.life / d.duration);
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.radius, d.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 165, 150, ${alpha * 0.28})`;
      ctx.fill();
      ctx.restore();
    }

    // 2. Ondas de choque do Combo 3 no solo
    for (const sw of this.shockwaves) {
      const alpha = Math.max(0, 1 - sw.life / sw.duration);
      ctx.save();

      // Anel de fogo exterior
      ctx.beginPath();
      ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.52, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 90, 20, ${alpha * 0.85})`;
      ctx.lineWidth = 5 * (1 - sw.life / sw.duration) + 1.5;
      ctx.stroke();

      // Anel dourado interior incandescente
      ctx.beginPath();
      ctx.ellipse(sw.x, sw.y, sw.radius * 0.72, sw.radius * 0.38, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 240, 180, ${alpha * 0.75})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();
    }

    // 3. Arcos de corte da espada (Slash Trails)
    for (const s of this.slashes) {
      const p = s.progress;
      const alpha = p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      const startA = -s.arcSpan * 0.5 + p * 0.2;
      const endA = startA + s.arcSpan * (1 - p * 0.22);

      // Faixa exterior azul/prateada translúcida
      ctx.beginPath();
      ctx.arc(0, 0, s.radius, startA, endA);
      ctx.arc(0, 0, s.radius * 0.70, endA, startA, true);
      ctx.closePath();

      const glowColor = s.comboIndex === 3
        ? `rgba(255, 120, 40, ${alpha * 0.85})`
        : (s.comboIndex === 2 ? `rgba(80, 200, 255, ${alpha * 0.75})` : `rgba(180, 230, 255, ${alpha * 0.70})`);
      ctx.fillStyle = glowColor;
      ctx.fill();

      // Núcleo branco brilhante do corte de lâmina
      ctx.beginPath();
      ctx.arc(0, 0, s.radius * 0.90, startA, endA);
      ctx.arc(0, 0, s.radius * 0.80, endA, startA, true);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.fill();

      // Borda escura afiada HQ
      ctx.strokeStyle = `rgba(20, 10, 30, ${alpha * 0.75})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, s.radius, startA, endA);
      ctx.stroke();

      ctx.restore();
    }

    // 4. Faíscas de impacto metálico
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.restore();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FXManager };
}
