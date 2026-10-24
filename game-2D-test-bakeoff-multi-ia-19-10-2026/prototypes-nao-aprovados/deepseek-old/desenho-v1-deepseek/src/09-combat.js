/* ============================================================================
 * 09-combat.js — COMBOS, HITBOX DAS LÂMINAS, HITSTOP E EFEITOS
 * A hitbox usa a MESMA geometria da arma desenhada (DS.bladeWorld), então o
 * que acerta na tela é o que acerta no jogo.
 * ========================================================================== */
(function (DS) {
  'use strict';
  const SK = DS.SK;

  /* --------------------------------------------------------- definição dos golpes
   * u = 0..1 dentro do golpe. hit = janela ativa (em u). */
  const MOVES = DS.MOVES = [
    { name: 'A1 corte direito', dur: 0.46, hit: [0.30, 0.52], dmg: 12, kb: 260, side: 1, shake: 5, freeze: 0.055, sound: 'slash' },
    { name: 'A2 backhand esquerdo', dur: 0.44, hit: [0.28, 0.50], dmg: 14, kb: 290, side: -1, shake: 6, freeze: 0.06, sound: 'slash' },
    { name: 'A3 duplo descendente', dur: 0.70, hit: [0.34, 0.60], dmg: 26, kb: 420, side: 0, shake: 11, freeze: 0.10, sound: 'boom' },
  ];

  const C = DS.combat = {
    comboIdx: 0,
    comboT: 0,
    window: 0,
    frozen: 0,
    buffer: false,
  };

  C.reset = function () {
    C.comboIdx = 0; C.comboT = 0; C.window = 0; C.frozen = 0; C.buffer = false; C.hits = 0;
  };

  /* -------------------------------------------------------------- efeitos */
  const F = DS.fx = {
    parts: [], rings: [], pops: [], slash: [], shake: 0, shakeT: 0,
    reset() { F.parts.length = 0; F.rings.length = 0; F.pops.length = 0; F.slash.length = 0; F.shake = 0; F.shakeT = 0; },
    addShake(k) { F.shake = Math.max(F.shake, k); F.shakeT = 0.32; },

    spark(x, y, n, dir, col) {
      for (let i = 0; i < n; i++) {
        const a = dir + (Math.random() - 0.5) * 2.2;
        const sp = 520 + Math.random() * 1900;
        F.parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 260,
          life: 0.18 + Math.random() * 0.3, max: 0.48, kind: 'spark',
          col: col || (Math.random() < 0.5 ? '#ffd75c' : '#ff8a1e'), size: 6 + Math.random() * 12,
        });
      }
    },
    blood(x, y, n, dir) {
      for (let i = 0; i < n; i++) {
        const a = dir + (Math.random() - 0.5) * 1.9;
        const sp = 260 + Math.random() * 1200;
        F.parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 380,
          life: 0.3 + Math.random() * 0.45, max: 0.75, kind: 'blood',
          col: Math.random() < 0.5 ? '#8d0f10' : '#c8231c', size: 7 + Math.random() * 16, g: 2400,
        });
      }
    },
    dust(x, y, n, col) {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
        const sp = 130 + Math.random() * 520;
        F.parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.5,
          life: 0.3 + Math.random() * 0.4, max: 0.7, kind: 'dust',
          col: col || '#cbb286', size: 18 + Math.random() * 52, g: -120,
        });
      }
    },
    ring(x, y, r, col) { F.rings.push({ x, y, r, life: 0.26, max: 0.26, col: col || '#fff2c4' }); },
    pop(x, y, text, col) { F.pops.push({ x, y, text, col: col || '#ffe9b0', life: 0.7, max: 0.7, vy: -190 }); },
    /* rastro das lâminas: guarda raiz+ponta por alguns frames */
    pushSlash(side, root, tip, hot) {
      F.slash.push({ side, root, tip, life: 0.18, max: 0.18, hot: hot ? 1 : 0 });
    },

    update(dt) {
      if (F.shakeT > 0) { F.shakeT -= dt; if (F.shakeT <= 0) F.shake = 0; }
      for (let i = F.parts.length - 1; i >= 0; i--) {
        const p = F.parts[i];
        p.life -= dt;
        if (p.life <= 0) { F.parts.splice(i, 1); continue; }
        p.vy += (p.g == null ? 900 : p.g) * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.97;
      }
      for (let i = F.rings.length - 1; i >= 0; i--) { F.rings[i].life -= dt; if (F.rings[i].life <= 0) F.rings.splice(i, 1); }
      for (let i = F.pops.length - 1; i >= 0; i--) {
        const p = F.pops[i]; p.life -= dt; p.y += p.vy * dt; p.vy *= 0.92;
        if (p.life <= 0) F.pops.splice(i, 1);
      }
      for (let i = F.slash.length - 1; i >= 0; i--) { F.slash[i].life -= dt; if (F.slash[i].life <= 0) F.slash.splice(i, 1); }
    },

    /* desenha rastros e partículas em espaço de mundo (chamado dentro da câmera) */
    draw(ctx, layer) {
      // rastros de lâmina (atrás do herói)
      if (layer === 'back') {
        for (const s of F.slash) {
          const k = s.life / s.max;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = k * 0.5;
          ctx.strokeStyle = s.hot ? '#ffb347' : '#ffd9a0';
          ctx.lineWidth = 100 * k;
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(s.root[0], s.root[1]); ctx.lineTo(s.tip[0], s.tip[1]); ctx.stroke();
          ctx.globalAlpha = k * 0.85;
          ctx.strokeStyle = s.hot ? '#fff0c0' : '#ffffff';
          ctx.lineWidth = 26 * k;
          ctx.beginPath(); ctx.moveTo(s.root[0], s.root[1]); ctx.lineTo(s.tip[0], s.tip[1]); ctx.stroke();
          ctx.restore();
        }
        return;
      }
      // partículas + anéis + números
      for (const p of F.parts) {
        const k = p.life / p.max;
        ctx.save();
        if (p.kind === 'spark') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = k;
          ctx.strokeStyle = p.col;
          ctx.lineWidth = p.size * k;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
          ctx.stroke();
        } else if (p.kind === 'blood') {
          ctx.globalAlpha = Math.min(1, k * 1.6);
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * k, p.size * k * 0.7, 0, 0, 6.3); ctx.fill();
        } else {
          ctx.globalAlpha = k * 0.55;
          ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.4 - k * 0.4), 0, 6.3); ctx.fill();
        }
        ctx.restore();
      }
      for (const r of F.rings) {
        const k = 1 - r.life / r.max;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (1 - k) * 0.8;
        ctx.strokeStyle = r.col;
        ctx.lineWidth = 22 * (1 - k) + 2;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r * (0.3 + k), r.r * (0.3 + k) * 0.5, 0, 0, 6.3);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.font = '700 120px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      for (const p of F.pops) {
        const k = p.life / p.max;
        ctx.globalAlpha = Math.min(1, k * 2);
        ctx.lineWidth = 20;
        ctx.strokeStyle = 'rgba(20,8,6,0.85)';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.col;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.restore();
    },
  };

  /* ------------------------------------------------------------ golpe do herói */
  C.start = function (g) {
    const h = g.hero;
    if (h.atk >= 0) { C.buffer = true; return false; }   // encadeia no fim do atual
    const idx = C.comboT > 0 ? Math.min(MOVES.length - 1, C.comboIdx) : 0;
    h.atk = idx;
    h.atkT = 0;
    h.hitDone = false;
    h.attackDir = h.faceDir;
    C.comboIdx = idx;
    C.comboT = 0;
    C.window = 0;
    // pequeno impulso para frente no golpe
    const mv = MOVES[idx];
    h.vx += h.faceDir * (mv.side === 0 ? 760 : 560);
    return true;
  };

  /* Retorna a "lâmina quente" (a que está causando dano agora) ou null. */
  function activeBlades(g) {
    const h = g.hero;
    if (h.atk < 0) return [];
    const mv = MOVES[h.atk];
    const u = h.atkT / mv.dur;
    if (u < mv.hit[0] || u > mv.hit[1]) return [];
    const f = h.fk;
    if (!f) return [];
    const out = [];
    if (mv.side >= 0) out.push({ side: 1, wrist: f.wristR, wa: h.pose.wR, blade: DS.bladeWorld(1, f.wristR, h.pose.wR) });
    if (mv.side <= 0) out.push({ side: -1, wrist: f.wristL, wa: h.pose.wL, blade: DS.bladeWorld(-1, f.wristL, h.pose.wL) });
    return out;
  }

  /* distância de um ponto ao segmento */
  function segDist(px, py, a, b) {
    const vx = b[0] - a[0], vy = b[1] - a[1];
    const L2 = vx * vx + vy * vy || 1;
    let t = ((px - a[0]) * vx + (py - a[1]) * vy) / L2;
    t = DS.clamp(t, 0, 1);
    const dx = px - (a[0] + vx * t), dy = py - (a[1] + vy * t);
    return Math.hypot(dx, dy);
  }

  /* converte um ponto do espaço LOCAL do herói (pelve na origem, -y p/ cima)
   * para o espaço de MUNDO (herói espelhado quando facing = -1). */
  function toWorld(h, p) {
    const fx = h.faceDir < 0 ? -1 : 1;
    return [h.x + fx * p[0], h.y - DS.SK.GROUND + p[1]];
  }

  C.update = function (g, dt) {
    const h = g.hero;
    if (C.frozen > 0) { C.frozen -= dt; return; }

    if (h.atk >= 0) {
      h.atkT += dt;
      const mv = MOVES[h.atk];
      const u = h.atkT / mv.dur;
      h.pose = DS.POSE.attack(DS.clamp(u, 0, 1), h.atk);
      h.fk = DS.fk(h.pose);        // hitbox no MESMO frame do desenho
      // rastro das lâminas + hitbox (o que acerta é a MESMA geometria desenhada)
      const list = activeBlades(g);
      for (const b of list) {
        const bf = DS.bladeWorld(b.side, b.wrist, b.wa);
        const root = toWorld(h, bf.root), tip = toWorld(h, bf.tip);
        DS.fx.pushSlash(b.side, root, tip, true);
        for (const e of g.enemies) {
          if (e.dead || e.hurtT > 0) continue;
          const d = segDist(e.x, e.y - DS.SKEL.HIT_Y, root, tip);
          if (d < DS.SKEL.HIT_R) {
            DS.enemy.hurt(e, mv.dmg, h.faceDir);
            const hx = e.x - h.faceDir * 40, hy = e.y - DS.SKEL.HIT_Y;
            DS.fx.blood(hx, hy, 16, h.faceDir > 0 ? -0.4 : Math.PI + 0.4);
            DS.fx.spark(hx, hy, 22, h.faceDir > 0 ? 0 : Math.PI);
            DS.fx.ring(hx, hy, 190, '#ffdca0');
            DS.fx.pop(hx, hy - 150, String(mv.dmg), '#ffe9b0');
            DS.fx.addShake(mv.shake);
            C.frozen = mv.freeze;
            C.hits = (C.hits || 0) + 1;
            h.hitDone = true;
            break;
          }
        }
      }
      if (u >= 1) {
        h.atk = -1;
        C.comboIdx = Math.min(MOVES.length - 1, C.comboIdx + 1);
        if (C.comboIdx >= MOVES.length) C.comboIdx = MOVES.length - 1;
        C.comboT = 0.34;      // janela para encadear o próximo golpe
        if (C.buffer) { C.buffer = false; C.start(g); }
      }
    } else if (C.comboT > 0) {
      C.comboT -= dt;
      if (C.comboT <= 0) C.comboIdx = 0;
    }
  };
})(window.DS);
