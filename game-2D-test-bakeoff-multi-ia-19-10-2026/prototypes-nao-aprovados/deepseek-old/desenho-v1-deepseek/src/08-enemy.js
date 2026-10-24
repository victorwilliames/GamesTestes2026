/* ============================================================================
 * 08-enemy.js — INIMIGOS: esqueletos guerreiros chibi (3/4 fake 2.5D)
 * Mesmo renderer procedural do herói: peças em cache + FK + pintura por camadas.
 * Espaço local do inimigo: origem no PELVE, -y para cima, olhando para a DIREITA.
 * ========================================================================== */
(function (DS) {
  'use strict';

  const S = DS.SKEL = {
    UPPER: 62, FORE: 60,
    THIGH: 96, SHIN: 84, SOLE: 54,
    SHOULDER: [66, -118],
    HIP: [44, -6],
    NECK: [0, -132],
    GROUND: 286,
    HEAD_R: 46,
    SC: 1.52,              // escala do inimigo no mundo (herói = 1361 de altura)
    BAKE: 0.5,             // escala de rasterização das peças (nítidez x memória)
    HIT_Y: 240,            // altura do peito acima do chão (teste de hitbox)
    HIT_R: 205,            // raio de acerto contra a lâmina
  };

  /* ------------------------------------------------------------- peças */
  function skull() {
    return DS.part('sk_skull', {
      w: 260, h: 260, px: 130, py: 176, ss: S.BAKE,
      draw(ctx) {
        const seed = 4201;
        // crânio
        const s = DS.path();
        s.M(-58, 12);
        s.C(-66, -48, -40, -92, 4, -94);
        s.C(50, -96, 74, -56, 66, 6);
        s.C(60, 40, 40, 54, 18, 58);
        s.L(10, 78); s.L(-4, 60); s.L(-18, 74); s.L(-30, 56);
        s.C(-48, 46, -54, 32, -58, 12);
        s.Z();
        DS.wash(ctx, s, {
          kind: 'bone', base: '#e9dcc0', shadow: '#b9a17c', deep: '#8a6f57', seed: seed,
          box: [-90, -110, 180, 200], inkW: 3.6, shadeAlpha: 0.5, blur: 8,
          hatch: { hatch: 40, len: [3, 14], w: [0.5, 1.7], dir: 0.15, cols: ['#fff6e2', '#8a6f57', '#c2a883'], alpha: [0.05, 0.24] },
        });
        // órbitas fundas + brilho vermelho
        for (const sx of [-1, 1]) {
          const e = DS.path();
          e.M(sx * 14 - 20, -30);
          e.C(sx * 14 - 2, -44, sx * 14 + 16, -40, sx * 14 + 22, -24);
          e.C(sx * 14 + 16, -10, sx * 14 - 4, -6, sx * 14 - 20, -18);
          e.Z();
          DS.wash(ctx, e, {
            kind: 'bone', base: '#221a18', shadow: '#0e0a0a', deep: '#000', seed: seed + sx,
            box: [-60, -60, 140, 90], inkW: 2.4, shadeAlpha: 0.6, blur: 4, hatch: false, light: null,
          });
          const g = ctx.createRadialGradient(sx * 16, -26, 1, sx * 16, -26, 15);
          g.addColorStop(0, 'rgba(255,120,60,0.95)');
          g.addColorStop(1, 'rgba(255,60,20,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(sx * 16, -26, 15, 0, 6.3); ctx.fill();
        }
        // nariz + mandíbula costurada
        const nose = DS.path();
        nose.M(-6, -10); nose.L(4, -12); nose.L(2, 6); nose.L(-6, 6); nose.Z();
        DS.wash(ctx, nose, { kind: 'bone', base: '#2a1f1c', seed: seed + 9, box: [-30, -30, 60, 60], inkW: 2, shadeAlpha: 0.5, hatch: false });
        DS.strokes(ctx, ['M -34 26 L 34 30', 'M -30 40 L 26 44', 'M -22 54 L 16 56'], '#8a6f57', 2, 0.55);
        DS.ink(ctx, s, { color: '#241a16', w: 3.2, seed: seed + 3, jitter: 1.0 });
      },
    });
  }

  function ribs() {
    return DS.part('sk_ribs', {
      w: 240, h: 260, px: 120, py: 150, ss: S.BAKE,
      draw(ctx) {
        const seed = 4211;
        // esterno + costelas
        for (let i = 0; i < 4; i++) {
          const y = -66 + i * 30;
          const w = 66 - i * 5;
          const r = DS.path();
          r.M(-w, y + 6);
          r.C(-w * 0.4, y - 14, w * 0.4, y - 14, w, y + 4);
          r.C(w * 0.4, y + 22, -w * 0.4, y + 20, -w, y + 6);
          r.Z();
          DS.wash(ctx, r, {
            kind: 'bone', base: '#e3d5b6', shadow: '#a8906d', seed: seed + i,
            box: [-w - 10, y - 30, w * 2 + 20, 60], inkW: 2.6, shadeAlpha: 0.5, blur: 4,
          });
        }
        const spine = DS.path();
        spine.M(-9, -104); spine.L(9, -104); spine.L(12, 78); spine.L(-12, 78); spine.Z();
        DS.wash(ctx, spine, {
          kind: 'bone', base: '#d9c9a8', shadow: '#9c8462', seed: seed + 7, box: [-30, -120, 60, 210],
          inkW: 2.6, shadeAlpha: 0.5, blur: 4,
        });
        for (let i = 0; i < 7; i++) {
          const y = -96 + i * 26;
          ctx.fillStyle = i % 2 ? '#c9b593' : '#efe3c8';
          ctx.beginPath(); ctx.ellipse(0, y, 15, 8, 0, 0, 6.3); ctx.fill();
          ctx.strokeStyle = '#7c6547'; ctx.lineWidth = 1.6; ctx.stroke();
        }
      },
    });
  }

  function pelvisPart() {
    return DS.part('sk_pelvis', {
      w: 200, h: 150, px: 100, py: 60, ss: S.BAKE,
      draw(ctx) {
        const seed = 4221;
        const p = DS.path();
        p.M(-62, -14);
        p.C(-30, -30, 30, -30, 62, -14);
        p.C(58, 18, 34, 34, 0, 34);
        p.C(-34, 34, -58, 18, -62, -14);
        p.Z();
        DS.wash(ctx, p, {
          kind: 'bone', base: '#e1d3b3', shadow: '#a68e6b', deep: '#7c6547', seed: seed,
          box: [-90, -50, 180, 100], inkW: 3, shadeAlpha: 0.5, blur: 6,
        });
        // tanga podre vermelha
        const c = DS.path();
        c.M(-58, -6); c.C(-24, 6, 24, 6, 58, -6);
        c.C(54, 34, 44, 58, 38, 78);
        c.L(18, 54); c.L(4, 80); c.L(-12, 52); c.L(-28, 78); c.L(-42, 50);
        c.C(-52, 30, -56, 12, -58, -6);
        c.Z();
        DS.wash(ctx, c, {
          kind: 'cloth', base: '#8c1a12', shadow: '#3d060a', deep: '#250306', seed: seed + 5,
          box: [-80, -20, 160, 110], inkW: 2.8, shadeAlpha: 0.55, blur: 6,
        });
      },
    });
  }

  function boneArm() {
    return DS.part('sk_arm', {
      w: 160, h: 90, px: 12, py: 45, ss: S.BAKE,
      draw(ctx) {
        const seed = 4231;
        const b = DS.path();
        b.M(0, -13);
        b.C(30, -20, 62, -18, 92, -12);
        b.C(102, -8, 102, 8, 92, 12);
        b.C(62, 18, 30, 20, 0, 13);
        b.Z();
        DS.wash(ctx, b, {
          kind: 'bone', base: '#e6d8ba', shadow: '#ab9370', seed: seed,
          box: [-6, -30, 120, 60], inkW: 2.8, shadeAlpha: 0.5, blur: 4,
        });
        for (const k of [0, 92]) {
          ctx.fillStyle = '#efe3c8';
          ctx.beginPath(); ctx.arc(k, 0, 15, 0, 6.3); ctx.fill();
          ctx.strokeStyle = '#7c6547'; ctx.lineWidth = 2.4; ctx.stroke();
        }
      },
    });
  }

  function boneLeg() {
    return DS.part('sk_leg', {
      w: 200, h: 110, px: 12, py: 55, ss: S.BAKE,
      draw(ctx) {
        const seed = 4241;
        const b = DS.path();
        b.M(0, -16);
        b.C(38, -24, 78, -22, 118, -14);
        b.C(130, -9, 130, 9, 118, 14);
        b.C(78, 22, 38, 24, 0, 16);
        b.Z();
        DS.wash(ctx, b, {
          kind: 'bone', base: '#e2d4b5', shadow: '#a68e6b', seed: seed,
          box: [-6, -36, 150, 72], inkW: 3, shadeAlpha: 0.5, blur: 4,
        });
        for (const k of [0, 118]) {
          ctx.fillStyle = '#ece0c4';
          ctx.beginPath(); ctx.arc(k, 0, 17, 0, 6.3); ctx.fill();
          ctx.strokeStyle = '#7c6547'; ctx.lineWidth = 2.6; ctx.stroke();
        }
      },
    });
  }

  function footPart() {
    return DS.part('sk_foot', {
      w: 150, h: 120, px: 60, py: 80, ss: S.BAKE,
      draw(ctx) {
        const p = DS.path();
        p.M(-34, -40);
        p.C(4, -48, 34, -38, 40, -16);
        p.C(62, -10, 74, 2, 76, 18);
        p.C(60, 30, 6, 32, -30, 26);
        p.C(-42, 16, -44, -18, -34, -40);
        p.Z();
        DS.wash(ctx, p, {
          kind: 'leather', base: '#4a3226', shadow: '#1b1215', seed: 4251,
          box: [-60, -60, 160, 110], inkW: 3, shadeAlpha: 0.5, blur: 5,
        });
        // dedos de osso para fora
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#e6d8ba';
          ctx.beginPath(); ctx.ellipse(52 + i * 4, -4 + i * 11, 12, 7, 0.2, 0, 6.3); ctx.fill();
          ctx.strokeStyle = '#7c6547'; ctx.lineWidth = 2; ctx.stroke();
        }
      },
    });
  }

  function shieldPart() {
    return DS.part('sk_shield', {
      w: 260, h: 320, px: 150, py: 170, ss: S.BAKE,
      draw(ctx) {
        const seed = 4261;
        const p = DS.path();
        p.M(-92, -110);
        p.C(-40, -138, 60, -132, 92, -96);
        p.C(96, -20, 70, 62, 12, 108);
        p.C(-48, 66, -86, -6, -92, -110);
        p.Z();
        DS.wash(ctx, p, {
          kind: 'wood', base: '#7b5c34', shadow: '#33220f', deep: '#1d1308', seed: seed,
          box: [-120, -160, 240, 300], inkW: 4, shadeAlpha: 0.55, blur: 8,
          hatch: { hatch: 60, len: [5, 22], w: [0.6, 2.4], dir: 1.5, cols: ['#c39a5e', '#2b1d0e'], alpha: [0.06, 0.3] },
        });
        // reforço metálico + caveirinha
        const b = DS.path();
        b.M(-96, -70); b.L(96, -52); b.L(94, -30); b.L(-95, -48); b.Z();
        DS.wash(ctx, b, {
          kind: 'steel', base: '#8e8b84', shadow: '#3a3735', seed: seed + 3,
          box: [-110, -90, 220, 70], inkW: 2.6, shadeAlpha: 0.5, blur: 4,
        });
        ctx.fillStyle = '#e7d6b7';
        ctx.beginPath(); ctx.ellipse(0, 6, 26, 22, 0, 0, 6.3); ctx.fill();
        ctx.strokeStyle = '#59462f'; ctx.lineWidth = 2.6; ctx.stroke();
        ctx.fillStyle = '#2a1c14';
        ctx.beginPath(); ctx.arc(-9, 2, 6, 0, 6.3); ctx.fill();
        ctx.beginPath(); ctx.arc(9, 2, 6, 0, 6.3); ctx.fill();
        DS.ink(ctx, p, { color: '#1d1308', w: 3.6, seed: seed + 5, jitter: 1.2 });
      },
    });
  }

  function spearPart() {
    return DS.part('sk_spear', {
      w: 560, h: 140, px: 40, py: 70, ss: S.BAKE,
      draw(ctx) {
        const seed = 4271;
        const pole = DS.path();
        pole.M(0, -6); pole.L(330, -8); pole.L(330, 8); pole.L(0, 6); pole.Z();
        DS.wash(ctx, pole, {
          kind: 'wood', base: '#6f5330', shadow: '#2c1d0e', seed: seed,
          box: [-10, -30, 360, 60], inkW: 2.8, shadeAlpha: 0.5, blur: 4,
          hatch: { hatch: 40, len: [6, 24], w: [0.5, 2], dir: 0, cols: ['#c39a5e', '#2b1d0e'], alpha: [0.06, 0.3] },
        });
        // ponta de pedra/ferro
        const tip = DS.path();
        tip.M(320, -18);
        tip.C(370, -14, 412, -6, 440, 0);
        tip.C(410, 8, 368, 16, 320, 20);
        tip.C(330, 8, 330, -8, 320, -18);
        tip.Z();
        DS.wash(ctx, tip, {
          kind: 'steel', base: '#9a9791', shadow: '#3f3c39', deep: '#25231f', seed: seed + 4,
          box: [300, -40, 160, 90], inkW: 3, shadeAlpha: 0.5, blur: 5,
          light: '#e8e2d4', lightAlpha: 0.4, lightW: 2,
        });
        // amarração da ponta
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = i % 2 ? '#3a2a18' : '#a5814c';
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(292 + i * 9, -16); ctx.lineTo(296 + i * 9, 16); ctx.stroke();
        }
      },
    });
  }

  /* -------------------------------------------------------------- FK */
  DS.skFk = function (p) {
    const c = Math.cos(p.lean || 0), s = Math.sin(p.lean || 0);
    const rot = (x, y) => [x * c - y * s, x * s + y * c];
    const pelvis = [0, p.py || 0];
    const neckL = rot(S.NECK[0], S.NECK[1]);
    const neck = [pelvis[0] + neckL[0], pelvis[1] + neckL[1]];
    const shR = rot(S.SHOULDER[0], S.SHOULDER[1]);
    const shL = rot(-S.SHOULDER[0], S.SHOULDER[1]);
    const shoulderR = [pelvis[0] + shR[0], pelvis[1] + shR[1]];
    const shoulderL = [pelvis[0] + shL[0], pelvis[1] + shL[1]];
    const hipR = rot(S.HIP[0], S.HIP[1]);
    const hipL = rot(-S.HIP[0], S.HIP[1]);
    const hipRP = [pelvis[0] + hipR[0], pelvis[1] + hipR[1]];
    const hipLP = [pelvis[0] + hipL[0], pelvis[1] + hipL[1]];
    const elbow = (sh, a) => [sh[0] + Math.cos(a) * S.UPPER, sh[1] + Math.sin(a) * S.UPPER];
    const wrist = (el, a) => [el[0] + Math.cos(a) * S.FORE, el[1] + Math.sin(a) * S.FORE];
    const elR = elbow(shoulderR, p.aR[0]), elL = elbow(shoulderL, p.aL[0]);
    const wrR = wrist(elR, p.aR[0] + p.aR[1]), wrL = wrist(elL, p.aL[0] + p.aL[1]);
    const knee = (hp, a) => [hp[0] + Math.cos(a) * S.THIGH, hp[1] + Math.sin(a) * S.THIGH];
    const ankle = (kn, a) => [kn[0] + Math.cos(a) * S.SHIN, kn[1] + Math.sin(a) * S.SHIN];
    const knR = knee(hipRP, p.lR[0]), knL = knee(hipLP, p.lL[0]);
    const anR = ankle(knR, p.lR[0] + p.lR[1]), anL = ankle(knL, p.lL[0] + p.lL[1]);
    return {
      pelvis, neck, shoulderR, shoulderL, elbowR: elR, elbowL: elL, wristR: wrR, wristL: wrL,
      hipR: hipRP, hipL: hipLP, kneeR: knR, kneeL: knL, ankleR: anR, ankleL: anL,
      headRot: (p.lean || 0) * 0.5 + (p.headPitch || 0),
    };
  };

  /* ----------------------------------------------------------- poses */
  function base() {
    return {
      py: 0, lean: 0, headPitch: 0,
      aR: [1.10, 0.10], aL: [2.04, -0.10],
      lR: [1.44, -0.05], lL: [1.70, 0.05],
      spear: -0.30,         // ângulo da lança em relação ao braço
      shield: 0.30,         // giro do escudo
      mouth: 0,
    };
  }

  DS.SKELPOSE = {
    idle(t) {
      const p = base();
      const b = Math.sin(t * 2.1 + 1.0);
      p.py = b * 2.4;
      p.lean = 0.03 + b * 0.02;
      p.aR = [1.10 + b * 0.05, 0.10];
      p.aL = [2.04 - b * 0.05, -0.10];
      p.lR = [1.44, -0.05 - b * 0.02];
      p.lL = [1.70, 0.05 + b * 0.02];
      return p;
    },
    walk(t) {
      const p = base();
      const sw = Math.sin(t * 8.4), cw = Math.cos(t * 8.4);
      p.py = -Math.abs(cw) * 4;
      p.lean = 0.10;
      p.lR = [1.44 + sw * 0.42, -0.08 - Math.max(0, -sw) * 0.5];
      p.lL = [1.70 - sw * 0.42, 0.08 + Math.max(0, sw) * 0.5];
      p.aR = [1.10 - sw * 0.12, 0.10];
      p.aL = [2.04 + sw * 0.12, -0.10];
      return p;
    },
    attack(u) {
      const p = base();
      const wind = DS.smooth(DS.clamp(u / 0.32, 0, 1));
      const hit = DS.smooth(DS.clamp((u - 0.32) / 0.2, 0, 1));
      const rec = DS.smooth(DS.clamp((u - 0.55) / 0.45, 0, 1));
      p.lean = -0.14 * wind + 0.30 * hit - 0.16 * rec;
      p.py = -6 * hit;
      p.aR = [1.10 - 0.5 * wind + 0.55 * hit - 0.05 * rec, 0.10 + 0.3 * wind - 0.5 * hit];
      p.aL = [2.04 + 0.2 * wind - 0.1 * hit, -0.10];
      p.lR = [1.30, -0.10];
      p.lL = [1.84, 0.10];
      p.headPitch = 0.1 * hit;
      return p;
    },
    hurt(u) {
      const p = base();
      const k = Math.sin(Math.min(1, u) * Math.PI);
      p.lean = -0.4 * k;
      p.py = -4 * k;
      p.headPitch = -0.4 * k;
      p.aR = [1.3, 0.4 * k];
      p.aL = [1.9, -0.4 * k];
      return p;
    },
    dead(u) {
      const p = base();
      const k = DS.smooth(DS.clamp(u, 0, 1));
      p.lean = 1.45 * k;
      p.py = 30 * k;
      p.aR = [1.6, 0.6 * k];
      p.aL = [1.6, -0.6 * k];
      p.lR = [1.5 + 0.5 * k, -0.6 * k];
      p.lL = [1.65 - 0.5 * k, 0.6 * k];
      return p;
    },
  };

  /* ------------------------------------------------------------- fábrica */
  DS.enemy = {
    make(x, y, kind, seed) {
      return {
        x, y, kind: kind || 0,
        hp: 30, maxHp: 30,
        facing: -1,
        state: 'idle', st: 0, t: 0,
        flash: 0, hurtT: 0, dead: false,
        cd: 1 + (seed % 5) * 0.3,
        vx: 0, vy: 0,
        seed: seed || 1,
        stick: (seed % 7) * 0.1,
        pose: DS.SKELPOSE.idle(0),
        fk: null,
      };
    },

    update(e, dt, ctxw) {
      e.t += dt;
      const hero = ctxw.hero;
      const dx = hero.x - e.x, dy = hero.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      e.facing = dx < 0 ? -1 : 1;
      if (e.dead) { e.st = Math.min(1, e.st + dt * 1.5); e.pose = DS.SKELPOSE.dead(e.st); return; }
      if (e.hurtT > 0) {
        e.hurtT -= dt;
        e.pose = DS.SKELPOSE.hurt(1 - e.hurtT / 0.35);
        e.x += e.vx * dt; e.y += e.vy * dt;
        e.vx *= 0.86; e.vy *= 0.86;
        return;
      }
      // separação entre inimigos: vale em QUALQUER estado (parados também se abrem)
      for (const o of ctxw.enemies) {
        if (o === e || o.dead) continue;
        const ox = e.x - o.x, oy = e.y - o.y;
        const od = Math.hypot(ox, oy);
        if (od > 0.01 && od < 250) { e.x += (ox / od) * 300 * dt; e.y += (oy / od) * 300 * dt; }
      }
      if (e.state === 'attack') {
        e.st += dt / 0.75;
        e.pose = DS.SKELPOSE.attack(e.st);
        // a ponta da lança fere o herói no meio do golpe
        if (!e.hitDone && e.st > 0.4 && e.st < 0.62 && d < 420) {
          e.hitDone = true;
          if (ctxw.onEnemyHit) ctxw.onEnemyHit(e, 7, e.facing);
        }
        if (e.st >= 1) { e.state = 'idle'; e.st = 0; e.cd = 1.1 + (e.seed % 4) * 0.35; }
        return;
      }
      e.cd -= dt;
      const range = 330;
      if (d > range - 40) {
        // persegue o herói
        const spd = 250;
        const stop = d - (range - 60);
        const k = Math.min(1, stop / 90);
        e.x += (dx / d) * spd * dt * k;
        e.y += (dy / d) * spd * dt * k * 0.85;
        e.state = 'walk';
        e.pose = DS.SKELPOSE.walk(e.t * 1.05 + e.stick);
      } else if (e.cd <= 0) {
        e.state = 'attack'; e.st = 0; e.hitDone = false;
      } else {
        e.state = 'idle';
        e.pose = DS.SKELPOSE.idle(e.t + e.stick);
      }
    },

    hurt(e, dmg, dirx) {
      e.hp -= dmg;
      e.flash = 1;
      e.vx = dirx * 780; e.vy = -140;
      if (e.hp <= 0) { e.dead = true; e.state = 'dead'; e.st = 0; }
      else { e.hurtT = 0.35; e.state = 'hurt'; }
    },
  };

  /* -------------------------------------------------------------- desenho */
  const P = {
    skull: skull(), ribs: ribs(), pelvis: pelvisPart(),
    arm: boneArm(), leg: boneLeg(), foot: footPart(),
    shield: shieldPart(), spear: spearPart(),
  };

  DS.drawEnemy = function (ctx, e, t) {
    const p = e.pose;
    const f = DS.skFk(p);
    e.fk = f;
    ctx.save();
    ctx.translate(e.x, e.y - S.GROUND * S.SC);
    if (e.facing < 0) ctx.scale(-1, 1);
    ctx.scale(S.SC, S.SC);
    if (e.flash > 0) { ctx.save(); }
    // sombra
    DS.shadowEllipse(ctx, 0, S.GROUND + 6, 70, 20, 0.34);

    const drawArm = (side) => {
      const a1 = side > 0 ? p.aR[0] : p.aL[0];
      const a2 = side > 0 ? p.aR[1] : p.aL[1];
      const sh = side > 0 ? f.shoulderR : f.shoulderL;
      ctx.save();
      ctx.translate(sh[0], sh[1]);
      ctx.rotate(a1);
      P.arm.blit(ctx);
      ctx.translate(S.UPPER, 0);
      ctx.rotate(a2);
      P.arm.blit(ctx);
      if (side > 0) {
        // lança na mão direita
        ctx.save();
        ctx.translate(S.FORE, 0);
        ctx.rotate(p.spear);
        P.spear.blit(ctx);
        ctx.restore();
      }
      ctx.restore();
    };
    const drawLeg = (side) => {
      const hip = side > 0 ? f.hipR : f.hipL;
      const l = side > 0 ? p.lR : p.lL;
      ctx.save();
      ctx.translate(hip[0], hip[1]);
      ctx.rotate(l[0]);
      P.leg.blit(ctx);
      ctx.translate(S.THIGH, 0);
      ctx.rotate(l[1]);
      P.leg.blit(ctx);
      ctx.translate(S.SHIN, 0);
      const tilt = DS.clamp((l[0] + l[1] - Math.PI / 2) * 0.5, -0.5, 0.5);
      ctx.rotate(tilt);
      P.foot.blit(ctx);
      ctx.restore();
    };

    drawLeg(-1);
    drawLeg(1);
    drawArm(-1);                 // braço do escudo (esquerdo, atrás)
    // escudo preso ao antebraço esquerdo
    ctx.save();
    ctx.translate(f.wristL[0], f.wristL[1]);
    ctx.scale(-1, 1);
    ctx.rotate(p.shield - 0.2);
    P.shield.blit(ctx);
    ctx.restore();

    P.pelvis.blit(ctx);
    ctx.save();
    ctx.translate(0, p.py);
    ctx.rotate(p.lean);
    P.ribs.blit(ctx);
    ctx.restore();
    ctx.save();
    ctx.translate(f.neck[0], f.neck[1]);
    ctx.rotate(f.headRot);
    P.skull.blit(ctx);
    ctx.restore();
    drawArm(1);
    ctx.restore();

    if (e.flash > 0) {
      ctx.restore();
      // clarão de dano: silhueta branca aproximada
      ctx.save();
      ctx.translate(e.x, e.y - S.GROUND * S.SC);
      if (e.facing < 0) ctx.scale(-1, 1);
      ctx.scale(S.SC, S.SC);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = e.flash * 0.35;
      P.ribs.blit(ctx);
      ctx.globalAlpha = e.flash * 0.5;
      P.skull.blit(ctx, e.flash * 0.6);
      ctx.restore();
    }
  };
})(window.DS);
