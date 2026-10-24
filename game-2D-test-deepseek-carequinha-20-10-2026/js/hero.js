'use strict';
// hero.js — carequinha chibi montado sobre o rig. Membros são UM tubo contínuo
// (sem emendas de bolinha), músculos são definidos por sombra chapada e linhas
// de dobra, e cada peça entra numa lista ordenada por profundidade.
Object.assign(Pilot, (() => {
  const { add, sub, mul, norm, dot, localPoint, project, TAU, lerp } = Pilot;
  const { PAL, INK, celFill, path, solid, ellipsoidPts, tubePts, polyTubePts, loftPts, taperPath, inkPath, line, alpha } = Pilot;

  const D = v => project(v)[2];
  const P2 = v => { const p = project(v); return [p[0], p[1]]; };

  const SKIN = { base: '#e9a160', shadow: '#a95c40', light: '#ffcd8c' };
  const SASH = { base: '#b52d35', shadow: '#671c27', light: '#dd4a3e' };
  const CLOTH = { base: '#332f2b', shadow: '#171512', light: '#4f4840' };
  const LEATHER = { base: '#4b3526', shadow: '#241811', light: '#755139' };
  const STEEL = { base: '#a7b7bc', shadow: '#4d6574', light: '#eef0e2' };
  const GOLD = { base: '#c8a05a', shadow: '#7a5d35', light: '#f4d9a0' };
  const BONE = { base: '#e8dcc0', shadow: '#a3937a', light: '#fff6dd' };

  // Punho fechado desenhado em 2D sobre o antebraço: caixa arredondada com
  // quatro nós dos dedos fundidos, sombra chapada e polegar do lado de dentro.
  function drawFist(ctx, hd, el, at, pos) {
    const c = P2(hd), e = P2(el);
    let dx = c[0] - e[0], dy = c[1] - e[1];
    const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const px = -dy, py = dx;
    const u = (a, b) => [c[0] + dx * a + px * b, c[1] + dy * a + py * b];
    const W = 7.4, W0 = 4.8, L0 = -7.2, L1 = 6.2;
    const p = new Path2D();
    p.moveTo(u(L0, -W0)[0], u(L0, -W0)[1]);
    p.lineTo(u(-2.2, -W)[0], u(-2.2, -W)[1]);
    p.lineTo(u(L1, -W)[0], u(L1, -W)[1]);
    const vs = [-W, -W / 2, 0, W / 2, W];
    for (let i = 0; i < 4; i++) {
      const mid = (vs[i] + vs[i + 1]) / 2;
      p.quadraticCurveTo(u(8.6, mid)[0], u(8.6, mid)[1], u(L1, vs[i + 1])[0], u(L1, vs[i + 1])[1]);
    }
    p.lineTo(u(-2.2, W)[0], u(-2.2, W)[1]);
    p.lineTo(u(L0, W0)[0], u(L0, W0)[1]);
    p.quadraticCurveTo(u(-9.0, 0)[0], u(-9.0, 0)[1], u(L0, -W0)[0], u(L0, -W0)[1]);
    p.closePath();

    ctx.fillStyle = SKIN.base; ctx.fill(p);
    ctx.save(); ctx.clip(p);
    const sh = [c[0] + 3.4, c[1] + 4.8];
    const sp = new Path2D(); sp.ellipse(sh[0], sh[1], 10.5, 10.5, 0, 0, TAU);
    ctx.fillStyle = alpha(SKIN.shadow, 0.5); ctx.fill(sp);
    const hl = [c[0] - 3.6, c[1] - 4.2];
    const hp = new Path2D(); hp.ellipse(hl[0], hl[1], 5.8, 4.4, 0.4, 0, TAU);
    ctx.fillStyle = alpha(SKIN.light, 0.32); ctx.fill(hp);
    ctx.restore();
    inkPath(ctx, p, 1.7, '#2a1a16');

    // vincos entre os dedos
    ctx.strokeStyle = alpha('#8f4632', 0.7); ctx.lineWidth = 0.9; ctx.lineCap = 'round';
    for (let i = 1; i < 4; i++) {
      const a = u(L1 - 0.4, vs[i]), b = u(3.2, vs[i] * 0.9);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }

    // polegar do lado de dentro do corpo
    const center = P2(at(0, 0, hd[2] - pos[2]));
    const bodyDir = (center[0] - c[0]) * px + (center[1] - c[1]) * py;
    const tv = bodyDir >= 0 ? 1 : -1;
    const t0 = u(-4.4, tv * 4.6), t1 = u(2.2, tv * 5.9);
    const tp = taperPath([t0, t1], q => 3.4 - 0.5 * q);
    ctx.fillStyle = SKIN.base; ctx.fill(tp);
    inkPath(ctx, tp, 1.2, '#2a1a16');
    const tc = u(-1.0, tv * 6.2);
    ctx.fillStyle = alpha(SKIN.shadow, 0.35);
    ctx.beginPath(); ctx.ellipse(tc[0], tc[1], 2.4, 1.6, Math.atan2(dy, dx), 0, TAU); ctx.fill();
  }

  function drawHero(ctx, rig, opts = {}) {
    const t = rig.time || 0;
    const yaw = rig.yaw;
    const pos = rig.pos;
    const at = (r, f, z) => add(pos, localPoint([r, f, z], yaw));
    const facing = dot(norm(localPoint([0, 1, 0], yaw)), Pilot.toCamera);
    const fighting = rig.combat && rig.combat.index >= 0;

    const parts = [];
    const push = (d, fn) => parts.push({ d, fn });
    // "blob" sem contorno: usado para músculos internos (funde com o corpo).
    const muscle = (c, r, off = 3, tone = SKIN, lat = 5, lon = 10) =>
      solid(ctx, ellipsoidPts(c, r, yaw, lat, lon), tone, off, 0);
    const blob = (c, r, tone, off = 3, w = 1.2, lat = 5, lon = 10) =>
      solid(ctx, ellipsoidPts(c, r, yaw, lat, lon), tone, off, w);

    const hz = rig.hips[2] - pos[2];
    const shz = rig.shoulderR[2] - pos[2];
    const hdz = rig.head[2] - pos[2];

    // ------------------------------------------------------------------ torso
    const torsoLevels = [
      { z: hz - 4, rw: 15.0, rf: 11.6 },
      { z: hz + 4, rw: 13.4, rf: 10.4 },
      { z: hz + 12, rw: 12.8, rf: 10.0 },
      { z: hz + 20, rw: 15.2, rf: 12.0 },
      { z: hz + 29, rw: 20.2, rf: 14.8 },
      { z: hz + 37, rw: 24.0, rf: 15.8 },
      { z: hz + 43, rw: 21.0, rf: 13.4 },
      { z: hz + 46, rw: 15.2, rf: 10.6 },
    ];
    const torso = hull3(loftPts(torsoLevels, yaw, pos));
    push(D(at(0, 0, hz + 22)), () => solid(ctx, torso, SKIN, 4.8, 2.2));

    if (facing > 0) {
      // peitorais: placa achatada, definida por sombra e uma linha (sem bolha)
      for (const sg of [1, -1]) {
        push(D(at(sg * 12, 14, hz + 34)) + 0.35, () => {
          const a = P2(at(sg * 21, 14.8, hz + 36.2));
          const b = P2(at(sg * 12, 18.0, hz + 31.6));
          const c = P2(at(sg * 2.2, 17.8, hz + 32.6));
          ctx.strokeStyle = alpha('#8f4632', 0.16); ctx.lineWidth = 7.5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]); ctx.stroke();
          ctx.strokeStyle = alpha('#8f4632', 0.72); ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]); ctx.stroke();
        });
        push(D(at(sg * 11, 17.4, hz + 40)) + 0.45, () => {
          const h = P2(at(sg * 11, 17.6, hz + 40.2));
          const p = new Path2D(); p.ellipse(h[0], h[1], 7.4, 3.0, sg * 0.22, 0, TAU);
          ctx.fillStyle = alpha('#ffd0a0', 0.26); ctx.fill(p);
        });
        push(D(at(sg * 12.2, 17.2, hz + 35)) + 0.6, () => {
          const n = P2(at(sg * 12.2, 17.3, hz + 35));
          ctx.fillStyle = alpha('#8a4028', 0.8);
          ctx.beginPath(); ctx.ellipse(n[0], n[1], 1.0, 1.25, 0, 0, TAU); ctx.fill();
        });
      }
      // esterno
      push(D(at(0, 17, hz + 36)) + 0.5, () =>
        line(ctx, [P2(at(0, 16.2, hz + 43)), P2(at(0, 17.4, hz + 30))], alpha('#8f4632', 0.5), 1.3));
      // abdômen: três vincos horizontais + linha central (sem gomos redondos)
      push(D(at(0, 13.5, hz + 17)) + 0.55, () => {
        for (const z of [24.5, 19, 13.5]) {
          const a = P2(at(-8.6, 12.2, hz + z + 0.9)), b = P2(at(0, 13.7, hz + z - 0.4)), d = P2(at(8.6, 12.2, hz + z + 0.9));
          ctx.strokeStyle = alpha('#8f4632', 0.42); ctx.lineWidth = 1.15; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], d[0], d[1]); ctx.stroke();
        }
        line(ctx, [P2(at(0, 13.2, hz + 27)), P2(at(0, 14.1, hz + 7))], alpha('#8f4632', 0.30), 1.0);
        const u = P2(at(0, 14.2, hz + 5.3));
        ctx.fillStyle = alpha('#7a3a2a', 0.8); ctx.beginPath(); ctx.ellipse(u[0], u[1], 1.1, 1.6, 0, 0, TAU); ctx.fill();
      });
      // sombra lateral direita: fecha o V do tronco
      push(D(at(18, 8, hz + 27)) + 0.65, () => {
        ctx.save(); ctx.clip(torso);
        const c = P2(at(19, 7, hz + 27));
        const p = new Path2D(); p.ellipse(c[0], c[1], 11, 26, -0.16, 0, TAU);
        ctx.fillStyle = alpha(SKIN.shadow, 0.2); ctx.fill(p);
        ctx.restore();
      });
      // cicatriz vermelha no peito
      push(D(at(10, 17, hz + 38)) + 0.7, () => {
        const a = P2(at(5.5, 17.8, hz + 41)), b = P2(at(13.5, 16.8, hz + 35));
        ctx.fillStyle = PAL.red.shadow; ctx.fill(taperPath([a, b], q => 1.6 - 0.6 * q));
        const c = P2(at(8.0, 17.6, hz + 39.1)), d = P2(at(11.8, 17.4, hz + 37.0));
        ctx.fillStyle = alpha(PAL.red.light, 0.7); ctx.fill(taperPath([c, d], q => 0.7 - 0.2 * q));
      });
    } else {
      // costas: escápulas achatadas e coluna
      for (const sg of [1, -1]) {
        const c = at(sg * 10, -12, hz + 35);
        push(D(c) + 0.3, () => {
          const p = P2(c);
          const q = new Path2D(); q.ellipse(p[0], p[1], 8.6, 5.0, sg * 0.3, 0, TAU);
          ctx.fillStyle = alpha(SKIN.shadow, 0.18); ctx.fill(q);
        });
      }
      push(D(at(0, -12, hz + 26)) + 0.4, () =>
        line(ctx, [P2(at(0, -11, hz + 44)), P2(at(0, -12.6, hz + 7))], alpha('#8f4632', 0.6), 1.5));
      push(D(at(18, -8, hz + 27)) + 0.45, () => {
        ctx.save(); ctx.clip(torso);
        const c = P2(at(19, -5, hz + 27));
        const p = new Path2D(); p.ellipse(c[0], c[1], 11, 26, 0.16, 0, TAU);
        ctx.fillStyle = alpha(SKIN.shadow, 0.18); ctx.fill(p);
        ctx.restore();
      });
    }

    // ------------------------------------------------------------------ pescoço
    push(D(at(0, 1, hz + 50)), () => {
      const base = at(0, 2.4, hz + 43);
      const top = at(0, 0.8, hz + 58);
      solid(ctx, tubePts(base, top, 9.6, 8.4, 0.0, 6, 12), SKIN, 3.2, 1.9);
    });
    // trapézios: ligam o pescoço aos ombros (sem anel escuro no pescoço)
    for (const sg of [1, -1]) {
      push(D(at(sg * 9, 0, hz + 44)) + 0.15, () => {
        const a = P2(at(sg * 6.5, 4.0, hz + 47.5)), b = P2(at(sg * 20.5, 2.0, hz + 43.0));
        line(ctx, [a, b], alpha(SKIN.shadow, 0.16), 3.4);
        line(ctx, [a, b], alpha('#8f4632', 0.38), 1.0);
      });
    }

    // ------------------------------------------------------------------ pernas
    for (const [hip, knee, foot, side] of [[rig.hipR, rig.kneeR, rig.footR, 1], [rig.hipL, rig.kneeL, rig.footL, -1]]) {
      const midT = add(hip, mul(sub(knee, hip), 0.46));
      const midS = add(knee, mul(sub(foot, knee), 0.34));
      const calf = add(midS, localPoint([side * 0.8, -2.4, 0], yaw));
      push(D(add(hip, mul(sub(foot, hip), 0.45))), () => {
        solid(ctx, polyTubePts([hip, midT, knee, calf, foot],
          [10.4, 9.6, 7.0, 8.6, 4.8], 11, 4), SKIN, 3.8, 1.9);
        // linha do quadríceps
        line(ctx, [P2(add(hip, mul(sub(knee, hip), 0.2))), P2(add(hip, mul(sub(knee, hip), 0.8)))], alpha('#b26445', 0.32), 1.0);
      });
      // joelho
      push(D(knee) + 0.15, () => muscle(knee, [6.2, 5.8, 6.0], 2.0, SKIN, 4, 9));
      // pé grande, descalço
      const heel = add(foot, localPoint([0, -3.6, 0.8], yaw));
      const ball = add(foot, localPoint([side * 1.2, 9.5, 0.4], yaw));
      const toeRow = add(foot, localPoint([side * 2.4, 16.0, -0.2], yaw));
      push(D(ball), () => {
        solid(ctx, polyTubePts([heel, add(foot, localPoint([0, 2.0, 0.7], yaw)), ball, toeRow],
          [5.2, 6.2, 6.8, 5.0], 10, 4), SKIN, 2.8, 1.5);
        // peito do pé
        line(ctx, [P2(add(foot, localPoint([side * 3.2, 4.0, 5.2], yaw))), P2(add(foot, localPoint([side * 3.0, 10.0, 3.6], yaw)))], alpha('#b26445', 0.35), 1.0);
      });
      // dedos: cinco saliências fundidas, com contorno só na ponta
      push(D(toeRow) + 0.2, () => {
        const bs = P2(ball), ts = P2(toeRow);
        let fdx = ts[0] - bs[0], fdy = ts[1] - bs[1];
        const fl = Math.hypot(fdx, fdy) || 1; fdx /= fl; fdy /= fl;
        const ang = Math.atan2(fdy, fdx);
        for (let i = 0; i < 5; i++) {
          const off = -side * 4.1 + side * i * 2.05;
          const tp = P2(add(foot, localPoint([side * 2.4 + off, 16.6 + (i === 0 ? 0.9 : 0), -0.2], yaw)));
          const r = 2.25 - i * 0.22;
          ctx.fillStyle = SKIN.base;
          ctx.beginPath(); ctx.arc(tp[0], tp[1], r, 0, TAU); ctx.fill();
          // contorno só do lado de fora do dedo
          ctx.strokeStyle = alpha('#5a2c22', 0.85); ctx.lineWidth = 1.0;
          ctx.beginPath(); ctx.arc(tp[0], tp[1], r, ang - 1.7, ang + 1.7); ctx.stroke();
          if (i < 4) {
            const m = P2(add(foot, localPoint([side * 2.4 + off + side * 1.02, 16.4, -0.2], yaw)));
            ctx.strokeStyle = alpha('#6b3327', 0.55); ctx.lineWidth = 0.9;
            ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(m[0] - fdx * 2.3, m[1] - fdy * 2.3); ctx.stroke();
          }
        }
      });
    }

    // ------------------------------------------------------------------ saia de pelos
    const skirt = [
      { z: hz + 3, rw: 17.0, rf: 13.6 },
      { z: hz - 5, rw: 20.6, rf: 16.2 },
      { z: hz - 12, rw: 22.2, rf: 17.6 },
    ];
    push(D(at(0, 0, hz - 4)), () => solid(ctx, loftPts(skirt, yaw, pos), CLOTH, 3.8, 1.9));
    push(D(at(0, 0, hz - 16)) + 0.2, () => {
      for (let i = 0; i < 18; i++) {
        const a = TAU * i / 18 + 0.12;
        const spread = 0.15 + (i % 3) * 0.022;
        const len = 7 + ((i * 37) % 10);
        const tipL = [21.6 * Math.sin(a - spread), 17.0 * Math.cos(a - spread), hz - 11];
        const tipR = [21.6 * Math.sin(a + spread), 17.0 * Math.cos(a + spread), hz - 11];
        const end = [18.6 * Math.sin(a), 14.8 * Math.cos(a), hz - 9 - len];
        const pts = [tipL, tipR, end].map(v => P2(add(pos, localPoint(v, yaw))));
        ctx.fillStyle = (i % 5 === 0) ? CLOTH.light : CLOTH.base;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = CLOTH.shadow; ctx.lineWidth = 1.1; ctx.stroke();
      }
    });

    // ------------------------------------------------------------------ faixa vermelha
    const sash = [
      { z: hz + 2, rw: 17.2, rf: 13.8 },
      { z: hz + 8, rw: 18.8, rf: 15.2 },
      { z: hz + 14, rw: 18.0, rf: 14.4 },
      { z: hz + 17, rw: 16.2, rf: 12.8 },
    ];
    push(D(at(0, 0, hz + 8)) + 0.5, () => {
      solid(ctx, loftPts(sash, yaw, pos), SASH, 3.2, 1.7);
      // dobras horizontais do tecido
      for (const zz of [hz + 5.5, hz + 11.5]) {
        const a = P2(at(-13.5, 12.8, zz)), b = P2(at(0, 15.6, zz + 0.6)), c = P2(at(13.5, 12.8, zz));
        ctx.strokeStyle = alpha(SASH.shadow, 0.55); ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]); ctx.stroke();
      }
      // nó grande no centro/frente
      const knot = at(1.2, 16.8, hz + 9);
      blob(knot, [7.2, 5.2, 6.0], SASH, 2.6, 1.5, 6, 10);
      for (const sg of [1, -1]) blob(at(sg * 6.0, 16.0, hz + 11.2), [4.0, 3.4, 4.6], SASH, 1.8, 1.1, 4, 8);
      // duas pontas longas, caindo no centro
      for (const [sg, len, w0, w1] of [[1, 26, 5.6, 2.0], [-1, 22, 5.0, 2.2]]) {
        const pts = [
          at(sg * 1.8, 17.2, hz + 5),
          at(sg * (4.2 + Math.sin(t * 1.8 + sg) * 0.7), 16.8, hz - 6),
          at(sg * (3.4 + Math.sin(t * 1.8 + 0.8) * 1.5), 15.8, hz + 5 - len),
        ].map(P2);
        const tp = taperPath(pts, q => w0 + (w1 - w0) * q);
        ctx.fillStyle = sg > 0 ? SASH.base : SASH.shadow;
        ctx.fill(tp); inkPath(ctx, tp, 1.2, SASH.shadow);
        line(ctx, [pts[0], pts[2]], alpha('#e2604f', sg > 0 ? 0.45 : 0.2), 0.9);
      }
    });

    // ------------------------------------------------------------------ braços
    for (const [sh, el, hd, side] of [[rig.shoulderR, rig.elbowR, rig.handR, 1], [rig.shoulderL, rig.elbowL, rig.handL, -1]]) {
      const midU = add(sh, mul(sub(el, sh), 0.42));
      const midF = add(el, mul(sub(hd, el), 0.46));
      push(D(add(sh, mul(sub(hd, sh), 0.45))), () => {
        solid(ctx, polyTubePts([sh, midU, el, midF, hd],
          [9.6, 9.2, 7.2, 8.2, 5.0], 11, 4), SKIN, 3.8, 1.9);
      });
      // deltoide: volume sem contorno
      push(D(sh) + 0.2, () => muscle(sh, [10.0, 9.6, 10.0], 3.6, SKIN, 6, 12));
      // vinco do bíceps
      push(D(midU) + 0.3, () => {
        const a = add(sh, mul(sub(el, sh), 0.3)), b = add(sh, mul(sub(el, sh), 0.82));
        line(ctx, [P2(add(a, localPoint([1.6, 1.8, 0], yaw))), P2(add(b, localPoint([1.2, 1.4, 0], yaw)))], alpha('#b26445', 0.5), 1.0);
      });
      // punho grande
      push(D(hd) + 0.5, () => {
        drawFist(ctx, hd, el, at, pos);
      });
      if (side > 0) {
        push(D(sh) + 0.3, () => {
          const a = P2(at(25, 7, hz + 47)), b = P2(at(29, 6, hz + 42));
          ctx.fillStyle = alpha(PAL.red.base, 0.85); ctx.fill(taperPath([a, b], q => 1.7 - 0.5 * q));
        });
      }
    }

    // ------------------------------------------------------------------ espada
    const hand = rig.handR;
    const dir = fighting ? rig.swordDir : norm(localPoint([0.18, -0.22, -0.96], yaw));
    const sdepth = fighting ? D(hand) + 0.9 : D(hand) - 3.4;
    const gripA = add(hand, mul(dir, -10));
    const guardC = add(hand, mul(dir, 2.8));
    const tip = add(hand, mul(dir, 47));
    push(sdepth, () => {
      blob(gripA, [2.7, 2.7, 2.7], GOLD, 1.4, 1.0, 4, 8);
      solid(ctx, tubePts(add(hand, mul(dir, -8.4)), add(hand, mul(dir, 1.4)), 2.0, 2.1, 0, 3, 8), LEATHER, 1.2, 0.9);
      const gp = P2(guardC), hp = P2(hand);
      let gx = hp[0] - P2(add(hand, mul(dir, -6)))[0];
      let gy = hp[1] - P2(add(hand, mul(dir, -6)))[1];
      const gl = Math.hypot(gx, gy) || 1; gx /= gl; gy /= gl;
      const px = -gy, py = gx;
      const g1 = [gp[0] - px * 8.0, gp[1] - py * 8.0], g2 = [gp[0] + px * 8.0, gp[1] + py * 8.0];
      const gpath = taperPath([g1, g2], q => 4.8 - Math.abs(q - 0.5) * 3.2);
      ctx.fillStyle = GOLD.base; ctx.fill(gpath);
      inkPath(ctx, gpath, 1.2, GOLD.shadow);
      const b0 = P2(guardC), b1 = P2(tip);
      let bx = b1[0] - b0[0], by = b1[1] - b0[1];
      const bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
      const nx = -by, ny = bx;
      const w0 = 7.2, w1 = 5.2;
      const blade = [
        [b0[0] + nx * w0, b0[1] + ny * w0],
        [b1[0] + nx * 1.4, b1[1] + ny * 1.4],
        [b1[0] + bx * 3.2, b1[1] + by * 3.2],
        [b1[0] - nx * 1.4, b1[1] - ny * 1.4],
        [b0[0] - nx * w1, b0[1] - ny * w1],
      ];
      const bp = path(blade, false);
      ctx.fillStyle = STEEL.base; ctx.fill(bp);
      ctx.save(); ctx.clip(bp);
      ctx.fillStyle = STEEL.light;
      ctx.beginPath();
      ctx.moveTo(b0[0] - nx * w1, b0[1] - ny * w1);
      ctx.lineTo(b1[0] - nx * 1.4, b1[1] - ny * 1.4);
      ctx.lineTo(b0[0] - nx * w1 + bx * 28, b0[1] - ny * w1 + by * 28);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      inkPath(ctx, bp, 1.4, '#2b3138');
      line(ctx, [P2(add(guardC, mul(dir, 3))), P2(add(tip, mul(dir, -6)))], alpha('#44525c', 0.75), 1.1);
    });

    // ------------------------------------------------------------------ cabeça
    push(D(rig.head) + 7, () =>
      Pilot.drawHead(ctx, { pos: rig.head, yaw: rig.yaw, scale: opts.headScale || 1 }));

    parts.sort((a, b) => a.d - b.d).forEach(p => p.fn());
  }

  return { drawHero };
})());
