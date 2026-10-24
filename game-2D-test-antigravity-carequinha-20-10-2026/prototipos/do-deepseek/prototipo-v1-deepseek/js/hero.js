'use strict';
// hero.js — carequinha chibi 2.5D: torso em V, músculos definidos por placas e
// sombra dura, membros em tubo contínuo com gradiente cel, mãos/pés grandes.
// A ordem de desenho é explícita (braço de trás -> tronco -> pernas -> saia ->
// faixa -> braço da frente -> cabeça) para a roupa nunca sumir atrás do corpo.
Object.assign(Pilot, (() => {
  const { add, sub, mul, norm, dot, localPoint, project, TAU } = Pilot;
  const { PAL, INK, volumeFill, path, ellipsoidPts, tubePts, polyTubePts, loftPts, hull3, taperPath, inkPath, line, alpha } = Pilot;

  const D = v => project(v)[2];
  const P2 = v => { const p = project(v); return [p[0], p[1]]; };

  const SKIN = { base: '#e08a44', shadow: '#8a3f26', light: '#ffc179', deep: '#65301f' };
  const SKIN_MID = { base: '#c26e38', shadow: '#7a3522', light: '#eda368', deep: '#5a281b' };
  const SASH = { base: '#b3262e', shadow: '#5f1721', light: '#e0453c', deep: '#3f0e16' };
  const CLOTH = { base: '#302b27', shadow: '#141110', light: '#4c453d', deep: '#0a0808' };
  const LEATHER = { base: '#4a3323', shadow: '#241610', light: '#775238' };
  const STEEL = { base: '#a9b8bd', shadow: '#4b6170', light: '#f0f2e4' };
  const GOLD = { base: '#c9a05a', shadow: '#7a5d35', light: '#f6dca4' };
  const INK2 = '#241713';
  const Q = Math.SQRT1_2;
  const CP = Math.cos(Pilot.pitch);

  // ---- pincéis locais ------------------------------------------------------
  function disc(ctx, x, y, rx, ry, rot, color) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
    ctx.fillStyle = color; ctx.fill();
  }
  function shade(ctx, clip, c3, rx, ry, rot, color, a) {
    ctx.save(); ctx.clip(clip);
    const p = P2(c3); disc(ctx, p[0], p[1], rx, ry, rot, alpha(color, a));
    ctx.restore();
  }
  // Placa de músculo: sombra embaixo, corpo, luz em cima e tinta só na borda de baixo.
  function plate(ctx, clip, c3, rw, zh, rot, tone, lit) {
    const rx = rw * Q, ry = zh * CP;
    ctx.save(); ctx.clip(clip);
    const p = P2(c3);
    disc(ctx, p[0], p[1] + ry * 0.42, rx * 1.10, ry * 1.12, rot, alpha(tone.shadow, 0.74));
    disc(ctx, p[0], p[1] - ry * 0.04, rx, ry, rot, tone.base);
    disc(ctx, p[0] - rx * 0.26, p[1] - ry * 0.40, rx * 0.64, ry * 0.34, rot, alpha(tone.light, lit ? 0.3 : 0.24));
    if (lit) disc(ctx, p[0] + rx * 0.12, p[1] + ry * 0.34, rx * 0.54, ry * 0.26, rot, alpha(tone.shadow, 0.5));
    ctx.strokeStyle = alpha(INK2, 0.82); ctx.lineWidth = 2.0; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(p[0], p[1] + ry * 0.04, rx * 0.98, ry * 0.98, rot, Math.PI * 0.08, Math.PI * 0.92); ctx.stroke();
    ctx.restore();
  }

  // ---- punho fechado -------------------------------------------------------
  function drawFist(ctx, hd, el, at, pos) {
    const c = P2(hd), e = P2(el);
    let dx = c[0] - e[0], dy = c[1] - e[1];
    const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    const px = -dy, py = dx;
    const u = (a, b) => [c[0] + dx * a + px * b, c[1] + dy * a + py * b];
    const W = 9.6, W0 = 6.0, L0 = -9.2, L1 = 8.0;
    const p = new Path2D();
    p.moveTo(u(L0, -W0)[0], u(L0, -W0)[1]);
    p.lineTo(u(-2.8, -W)[0], u(-2.8, -W)[1]);
    p.lineTo(u(L1, -W)[0], u(L1, -W)[1]);
    const vs = [-W, -W / 2, 0, W / 2, W];
    for (let i = 0; i < 4; i++) {
      const mid = (vs[i] + vs[i + 1]) / 2;
      p.quadraticCurveTo(u(10.8, mid)[0], u(10.8, mid)[1], u(L1, vs[i + 1])[0], u(L1, vs[i + 1])[1]);
    }
    p.lineTo(u(-2.8, W)[0], u(-2.8, W)[1]);
    p.lineTo(u(L0, W0)[0], u(L0, W0)[1]);
    p.quadraticCurveTo(u(-10.8, 0)[0], u(-10.8, 0)[1], u(L0, -W0)[0], u(L0, -W0)[1]);
    p.closePath();

    // gradiente cel + preenchimento
    const g = ctx.createLinearGradient(c[0] - W, 0, c[0] + W, 0);
    g.addColorStop(0, SKIN.light); g.addColorStop(0.22, SKIN.base);
    g.addColorStop(0.56, SKIN.base); g.addColorStop(0.57, SKIN_MID.base); g.addColorStop(1, SKIN_MID.shadow);
    ctx.fillStyle = g; ctx.fill(p);

    ctx.save(); ctx.clip(p);
    // sombra da parte de baixo
    disc(ctx, c[0] + 3.2, c[1] + 5.2, 11.5, 9.5, 0, alpha(SKIN.shadow, 0.42));
    // luz no dorso da mão
    disc(ctx, c[0] - 3.6, c[1] - 4.4, 6.2, 4.4, 0.4, alpha(SKIN.light, 0.3));
    ctx.restore();
    inkPath(ctx, p, 2.1, INK2);

    // sulcos entre os dedos
    ctx.strokeStyle = alpha('#8f4632', 0.75); ctx.lineWidth = 1.0; ctx.lineCap = 'round';
    for (let i = 1; i < 4; i++) {
      const a = u(L1 - 0.5, vs[i]), b = u(3.4, vs[i] * 0.92);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // dobras dos nós
    ctx.strokeStyle = alpha('#7d3a2e', 0.45); ctx.lineWidth = 1.3;
    for (let i = 0; i < 4; i++) {
      const a = u(4.6, vs[i] + 1.6), b = u(7.8, vs[i] + 1.4);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }

    // polegar do lado de dentro do corpo
    const center = P2(at(0, 0, hd[2] - pos[2]));
    const bodyDir = (center[0] - c[0]) * px + (center[1] - c[1]) * py;
    const tv = bodyDir >= 0 ? 1 : -1;
    const t0 = u(-5.0, tv * 5.2), t1 = u(2.4, tv * 7.0);
    const tp = taperPath([t0, t1], q => 4.1 - 0.7 * q);
    ctx.fillStyle = SKIN.base; ctx.fill(tp);
    inkPath(ctx, tp, 1.4, INK2);
    const tc = u(-1.2, tv * 7.2);
    disc(ctx, tc[0], tc[1], 2.6, 1.7, Math.atan2(dy, dx), alpha(SKIN.shadow, 0.35));
  }

  // ---- torso ---------------------------------------------------------------
  function drawTorso(ctx, hz, at, yaw, pos, facing) {
    const levels = [
      { z: hz - 4, rw: 21.5, rf: 15.0 },
      { z: hz + 2, rw: 20.0, rf: 14.0 },
      { z: hz + 10, rw: 19.2, rf: 13.4 },
      { z: hz + 20, rw: 21.0, rf: 14.4 },
      { z: hz + 32, rw: 26.0, rf: 16.8 },
      { z: hz + 44, rw: 31.0, rf: 19.4 },
      { z: hz + 54, rw: 34.0, rf: 20.4 },
      { z: hz + 60, rw: 29.0, rf: 18.0 },
      { z: hz + 64, rw: 18.0, rf: 12.0 },
    ];
    const torso = volumeFill(ctx, loftPts(levels, yaw, pos), SKIN, 3.4, 2.9, 0.22);
    shade(ctx, torso, at(-28, 7, hz + 40), 12, 34, -0.04, SKIN.light, 0.16);
    shade(ctx, torso, at(30, 8, hz + 42), 13, 36, -0.05, SKIN.shadow, 0.2);

    if (facing > 0) {
      // peitorais
      for (const sg of [1, -1]) {
        const tone = sg > 0 ? SKIN_MID : SKIN;
        plate(ctx, torso, at(sg * 17.0, 17.0, hz + 45), 14.0, 8.6, -sg * 0.10, tone, sg < 0);
        const n = P2(at(sg * 18.2, 18.0, hz + 39.4));
        disc(ctx, n[0], n[1], 1.2, 1.5, 0, alpha('#7a3a2a', 0.85));
      }
      // esterno
      line(ctx, [P2(at(0, 18.2, hz + 54)), P2(at(0, 19.0, hz + 35))], alpha('#7a3a2a', 0.6), 2.3);
      shade(ctx, torso, at(0, 18.4, hz + 35), 5.0, 7, 0, SKIN.shadow, 0.22);
      // clavículas
      for (const sg of [1, -1]) {
        line(ctx, [P2(at(sg * 6, 15, hz + 57)), P2(at(sg * 28, 12, hz + 52))], alpha(SKIN.shadow, 0.45), 1.8);
        line(ctx, [P2(at(sg * 6, 15.5, hz + 58.6)), P2(at(sg * 27, 12.5, hz + 53.6))], alpha(SKIN.light, 0.25), 1.3);
      }
      // abdômen: 4 fileiras de placas
      const rows = [hz + 38, hz + 31, hz + 24, hz + 17.5];
      for (let row = 0; row < rows.length; row++) {
        for (const sg of [1, -1]) {
          const tone = sg > 0 ? SKIN_MID : SKIN;
          const shrink = row === 3 ? 0.86 : 1;
          plate(ctx, torso, at(sg * 8.2, 15.2, rows[row] - row * 0.4), 6.2 * shrink, 4.2 * shrink, sg * 0.02, tone, sg < 0 && row < 2);
        }
      }
      // linha central + umbigo
      line(ctx, [P2(at(0, 15.4, hz + 50)), P2(at(0, 16.0, hz + 18))], alpha('#7a3a2a', 0.5), 1.8);
      const u = P2(at(0, 15.9, hz + 13));
      disc(ctx, u[0], u[1], 1.4, 2.4, 0, alpha('#6d3024', 0.8));
      // V inferior do abdômen
      for (const sg of [1, -1]) {
        line(ctx, [P2(at(sg * 16.5, 15.4, hz + 2)), P2(at(sg * 3.0, 15.4, hz + 12))], alpha('#7a3a2a', 0.4), 1.6);
      }
      // oblíquos + serrátil
      for (const sg of [1, -1]) {
        shade(ctx, torso, at(sg * 22.0, 13, hz + 26), 6.2, 15, sg * 0.12, SKIN.shadow, 0.24);
        for (let i = 0; i < 3; i++) {
          const a = P2(at(sg * (19.6 + i * 1.2), 14.5, hz + 34 - i * 3.4));
          const b = P2(at(sg * (16.6 + i * 1.0), 15.0, hz + 30.6 - i * 3.2));
          line(ctx, [a, b], alpha('#7a3a2a', 0.34), 1.1);
        }
      }
      // cicatriz vermelha no peito (lado direito)
      const a = P2(at(8.5, 18.6, hz + 50)), b = P2(at(19.0, 17.6, hz + 41));
      ctx.fillStyle = PAL.red.shadow; ctx.fill(taperPath([a, b], q => 2.0 - 0.8 * q));
      const c = P2(at(11.0, 18.4, hz + 47.2)), d = P2(at(16.6, 18.0, hz + 43.5));
      ctx.fillStyle = alpha(PAL.red.light, 0.75); ctx.fill(taperPath([c, d], q => 0.9 - 0.3 * q));
    } else {
      // costas: escápulas, coluna e lats
      for (const sg of [1, -1]) plate(ctx, torso, at(sg * 14, -11, hz + 47), 9.0, 6.2, sg * 0.3, SKIN_MID, sg < 0);
      line(ctx, [P2(at(0, -11.8, hz + 58)), P2(at(0, -12.5, hz + 10))], alpha('#7a3a2a', 0.65), 2.0);
      for (const sg of [1, -1]) shade(ctx, torso, at(sg * 23, -8, hz + 34), 6.8, 28, sg * 0.15, SKIN.shadow, 0.22);
      line(ctx, [P2(at(-11, -13, hz + 44)), P2(at(-5, -13.5, hz + 50))], alpha(PAL.red.shadow, 0.8), 1.8);
    }
    return torso;
  }

  // ---- pescoço e trapézios -------------------------------------------------
  function drawNeck(ctx, hz, at, yaw) {
    for (const sg of [1, -1]) {
      line(ctx, [P2(at(sg * 8, 3.5, hz + 65)), P2(at(sg * 26, 1.8, hz + 56))], alpha(SKIN.shadow, 0.35), 2.8);
      line(ctx, [P2(at(sg * 8, 3.5, hz + 66.2)), P2(at(sg * 25, 1.8, hz + 57.2))], alpha(SKIN.light, 0.25), 1.5);
    }
    const neck = volumeFill(ctx, tubePts(at(0, 2.0, hz + 58), at(0, 0.8, hz + 70), 14.0, 12.0, 0, 4, 12), SKIN, 3.0, 2.2, 0.2);
    shade(ctx, neck, at(0, 4.5, hz + 67), 9.5, 4.6, 0, SKIN.shadow, 0.4);
    shade(ctx, neck, at(0, 4.0, hz + 60), 7.5, 8, 0, SKIN.light, 0.12);
  }

  // ---- braço ---------------------------------------------------------------
  function drawArm(ctx, sh, el, hd, side, at, pos, yaw) {
    const midU = add(sh, mul(sub(el, sh), 0.42));
    const midF = add(el, mul(sub(hd, el), 0.46));
    const pts = polyTubePts([sh, midU, el, midF, hd], [13.0, 10.8, 7.2, 10.0, 5.4], 12, 4);
    const arm = volumeFill(ctx, pts, SKIN, 3.2, 2.5, 0.2);
    const front = localPoint([0, 1, 0], yaw);

    // bíceps (luz em cima, sombra embaixo) e tríceps
    shade(ctx, arm, add(midU, mul(front, 3.2)), 5.6, 7.8, -0.18, SKIN.light, 0.26);
    shade(ctx, arm, add(midU, localPoint([side * 1.2, -1.5, -4], yaw)), 6.8, 7.4, -0.2, SKIN.shadow, 0.26);
    // antebraço
    shade(ctx, arm, add(midF, mul(front, 2.8)), 4.8, 7.4, -0.1, SKIN.light, 0.22);
    shade(ctx, arm, add(midF, localPoint([-side * 1.0, -1.5, -2], yaw)), 5.0, 8.2, 0.1, SKIN.shadow, 0.22);
    // separação bíceps/tríceps
    const s0 = P2(add(sh, mul(sub(el, sh), 0.28))), s1 = P2(add(sh, mul(sub(el, sh), 0.78)));
    line(ctx, [s0, s1], alpha('#8f4632', 0.45), 1.1);
    // vinco do cotovelo
    const ec = P2(add(el, mul(sub(hd, el), 0.08)));
    line(ctx, [[ec[0] - 4, ec[1] - 1], [ec[0] + 4, ec[1] + 1]], alpha('#8f4632', 0.45), 1.2);

    // deltoide integrado ao tubo: só luz/sombra e um vinco curvo, sem bola separada
    shade(ctx, arm, add(sh, localPoint([-side * 3.6, 4.2, 6.0], yaw)), 7.8, 6.4, 0, SKIN.light, 0.28);
    shade(ctx, arm, add(sh, localPoint([side * 2.2, 1.8, -6.2], yaw)), 6.4, 5.8, 0, SKIN.shadow, 0.34);
    const d0 = P2(add(sh, localPoint([-side * 2.0, 8.0, -5.0], yaw)));
    const d1 = P2(add(sh, localPoint([side * 5.2, 3.0, -7.2], yaw)));
    const d2 = P2(add(sh, localPoint([side * 4.2, -6.0, -3.0], yaw)));
    ctx.strokeStyle = alpha('#7a3a2a', 0.5); ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(d0[0], d0[1]); ctx.quadraticCurveTo(d1[0], d1[1], d2[0], d2[1]); ctx.stroke();

    // capa de ombro que arredonda o topo do tubo (sem contorno interno)
    const capC = add(sh, localPoint([0, 0.5, 2.0], yaw));
    const capPts = ellipsoidPts(capC, [13.0, 12.0, 10.0], yaw, 7, 14);
    const capP = path(capPts);
    const capA = P2(add(capC, localPoint([-13, 0, 0], yaw)));
    const capB = P2(add(capC, localPoint([13, 0, 0], yaw)));
    const cg = ctx.createLinearGradient(Math.min(capA[0], capB[0]), 0, Math.max(capA[0], capB[0]), 0);
    cg.addColorStop(0, SKIN.light); cg.addColorStop(0.18, SKIN.base);
    cg.addColorStop(0.56, SKIN.base); cg.addColorStop(0.57, SKIN.shadow); cg.addColorStop(1, SKIN.deep);
    ctx.fillStyle = cg; ctx.fill(capP);
    ctx.save(); ctx.clip(capP);
    const capSC = P2(capC);
    const capL = P2(add(capC, localPoint([-side * 3.2, 3.4, 5.0], yaw)));
    disc(ctx, capL[0], capL[1], 6.4, 4.4, 0, alpha(SKIN.light, 0.3));
    const capS = P2(add(capC, localPoint([side * 2.0, -1.0, -5.0], yaw)));
    disc(ctx, capS[0], capS[1], 5.6, 4.0, 0, alpha(SKIN.shadow, 0.34));
    // tinta só na metade de fora, para fundir com o tronco
    ctx.beginPath();
    if (side > 0) ctx.rect(capSC[0] - 2, -10000, 20000, 20000);
    else ctx.rect(-10000, -10000, capSC[0] + 2 + 10000, 20000);
    ctx.clip();
    ctx.strokeStyle = INK2; ctx.lineWidth = 2.4; ctx.stroke(capP);
    ctx.restore();

    // faixa vermelha justa no bíceps esquerdo (como na referência)
    if (side < 0) {
      const b0 = add(sh, mul(sub(el, sh), 0.58));
      const b1 = add(sh, mul(sub(el, sh), 0.72));
      const bandPts = tubePts(b0, b1, 11.2, 10.8, 0.04, 2, 12);
      const band = volumeFill(ctx, bandPts, SASH, 2.2, 1.9, 0.18);
      shade(ctx, band, add(b0, localPoint([0, 1, 2], yaw)), 5.0, 3.8, 0, SASH.light, 0.25);
      shade(ctx, band, add(b0, localPoint([0, -5.0, -1], yaw)), 5.6, 2.8, 0, SASH.shadow, 0.35);
      const knot = add(b0, localPoint([side * 8.8, 2.5, 0.0], yaw));
      volumeFill(ctx, ellipsoidPts(knot, [3.0, 2.6, 3.2], yaw, 5, 9), SASH, 1.5, 1.4);
      const tail = P2(add(knot, localPoint([side * 1.4, 1.2, -6.0], yaw)));
      const tp = taperPath([P2(knot), tail], q => 3.0 - 1.5 * q);
      ctx.fillStyle = SASH.shadow; ctx.fill(tp); inkPath(ctx, tp, 1.1, SASH.shadow);
    }

    // punho grande
    drawFist(ctx, hd, el, at, pos);
  }

  // ---- perna e pé ----------------------------------------------------------
  function drawLeg(ctx, hip, knee, foot, side, at, pos, yaw) {
    const midT = add(hip, mul(sub(knee, hip), 0.46));
    const midS = add(knee, mul(sub(foot, knee), 0.34));
    const calf = add(midS, localPoint([-side * 0.8, -2.8, 1.5], yaw));
    const pts = polyTubePts([hip, midT, knee, calf, foot], [12.8, 11.6, 8.0, 10.8, 5.8], 12, 4);
    const leg = volumeFill(ctx, pts, SKIN, 3.4, 2.5, 0.18);
    const front = localPoint([0, 1, 0], yaw);

    shade(ctx, leg, add(midT, localPoint([side * 2.5, 3.2, 0], yaw)), 4.8, 11, 0.08, SKIN.light, 0.24);
    shade(ctx, leg, add(midT, localPoint([-side * 3.0, -1.5, -2], yaw)), 5.2, 12, -0.06, SKIN.shadow, 0.28);
    // quadríceps
    const q0 = P2(add(hip, mul(sub(knee, hip), 0.2))), q1 = P2(add(hip, mul(sub(knee, hip), 0.82)));
    line(ctx, [q0, q1], alpha('#8f4632', 0.3), 1.0);
    // panturrilha
    shade(ctx, leg, add(midS, localPoint([side * 1.4, -1.8, 2], yaw)), 4.6, 6.6, 0.1, SKIN.light, 0.2);
    shade(ctx, leg, add(midS, localPoint([-side * 2.0, -2.2, 0], yaw)), 4.8, 7.0, -0.08, SKIN.shadow, 0.22);

    // joelho: rótula desenhada dentro do tubo, sem bola separada
    shade(ctx, leg, add(knee, localPoint([-side * 1.8, 4.0, 1.5], yaw)), 4.8, 3.6, 0, SKIN.light, 0.22);
    shade(ctx, leg, add(knee, localPoint([side * 1.4, 2.0, -3.6], yaw)), 5.0, 3.2, 0, SKIN.shadow, 0.32);
    const k0 = P2(add(knee, localPoint([-side * 3.2, 4.4, 1.0], yaw)));
    const k1 = P2(add(knee, localPoint([side * 2.8, 3.4, -2.8], yaw)));
    line(ctx, [k0, k1], alpha('#7a3a2a', 0.4), 1.1);

    // pé virado para fora
    drawFoot(ctx, foot, side, pos, yaw);
    void at; void front;
  }

  function drawFoot(ctx, foot, side, pos, yaw) {
    const fa = -side * 0.30;
    const F = (r, f, z) => {
      const cr = r * Math.cos(fa) - f * Math.sin(fa);
      const cf = r * Math.sin(fa) + f * Math.cos(fa);
      return add(foot, localPoint([cr, cf, z], yaw));
    };
    const heel = F(0, -4.4, 1.4);
    const mid = F(side * 0.3, 2.9, 1.1);
    const ball = F(side * 0.9, 11.2, 0.9);
    const toeRow = F(side * 1.4, 18.2, 0.5);
    const footPts = polyTubePts([heel, mid, ball, toeRow], [6.2, 7.3, 8.1, 5.8], 10, 4);
    const footPath = volumeFill(ctx, footPts, SKIN, 2.8, 1.8, 0.15);
    // arco e peito do pé
    shade(ctx, footPath, F(side * 3.0, 4.4, 4.8), 4.2, 3.2, 0.2, SKIN.light, 0.24);
    shade(ctx, footPath, F(-side * 0.4, 0.8, 0.0), 5.6, 2.4, 0, SKIN.shadow, 0.4);
    line(ctx, [P2(F(side * 3.4, 4.0, 5.0)), P2(F(side * 3.0, 10.0, 3.2))], alpha('#8f4632', 0.35), 1.0);

    // dedos: cinco saliências fundidas, contorno só na ponta
    const bs = P2(ball), ts = P2(toeRow);
    let fdx = ts[0] - bs[0], fdy = ts[1] - bs[1];
    const fl = Math.hypot(fdx, fdy) || 1; fdx /= fl; fdy /= fl;
    const ang = Math.atan2(fdy, fdx);
    for (let i = 0; i < 5; i++) {
      const off = -side * 4.3 + side * i * 2.15;
      const tp = P2(F(side * 1.4 + off, 19.1 + (i === 0 ? 1.2 : 0), 0.2));
      const r = 2.8 - i * 0.19;
      ctx.fillStyle = SKIN.base;
      ctx.beginPath(); ctx.arc(tp[0], tp[1], r, 0, TAU); ctx.fill();
      ctx.strokeStyle = alpha('#5a2c22', 0.85); ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(tp[0], tp[1], r, ang - 1.7, ang + 1.7); ctx.stroke();
      if (i < 4) {
        const m = P2(F(side * 1.4 + off + side * 1.08, 18.9, 0.2));
        ctx.strokeStyle = alpha('#6b3327', 0.55); ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(m[0], m[1]); ctx.lineTo(m[0] - fdx * 2.9, m[1] - fdy * 2.9); ctx.stroke();
      }
    }
    void pos;
  }

  // ---- saia de pelos -------------------------------------------------------
  function drawSkirt(ctx, hz, at, pos, yaw, t) {
    const base = [
      { z: hz + 2, rw: 21.0, rf: 16.5 },
      { z: hz - 4, rw: 24.0, rf: 18.8 },
      { z: hz - 11, rw: 26.5, rf: 20.5 },
    ];
    volumeFill(ctx, loftPts(base, yaw, pos), CLOTH, 3.2, 2.3, 0.18);
    // cós grosso da saia
    const band = [{ z: hz + 3, rw: 21.5, rf: 16.8 }, { z: hz - 1, rw: 23.0, rf: 18.0 }];
    volumeFill(ctx, loftPts(band, yaw, pos), CLOTH, 2.0, 1.8, 0.2);

    const layer = (n, rw, rf, z0, len0, len1, tone, phase, lineA) => {
      for (let i = 0; i < n; i++) {
        const a = TAU * (i + phase) / n;
        const spread = 0.19 + (i % 3) * 0.022;
        const rr = ((i * 37) % 100) / 100;
        const len = len0 + rr * (len1 - len0);
        const p0 = P2(add(pos, localPoint([rw * Math.sin(a - spread), rf * Math.cos(a - spread), z0], yaw)));
        const p1 = P2(add(pos, localPoint([rw * Math.sin(a + spread), rf * Math.cos(a + spread), z0], yaw)));
        const p2 = P2(add(pos, localPoint([rw * 0.98 * Math.sin(a + 0.025), rf * 0.96 * Math.cos(a + 0.025), z0 - len], yaw)));
        const p3 = P2(add(pos, localPoint([rw * 0.99 * Math.sin(a - 0.02), rf * 0.97 * Math.cos(a - 0.02), z0 - len * 0.78], yaw)));
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.closePath();
        ctx.fillStyle = (i % 4 === 0) ? tone.light : tone.base; ctx.fill();
        ctx.strokeStyle = tone.shadow; ctx.lineWidth = 1.15; ctx.lineJoin = 'round'; ctx.stroke();
        const fc = P2(add(pos, localPoint([rw * 0.99 * Math.sin(a), rf * 0.96 * Math.cos(a), z0 - len * 0.5], yaw)));
        line(ctx, [[(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], fc], alpha(lineA, 0.28), 1.0);
      }
    };
    // camada de trás, mais escura e curta
    layer(14, 25.0, 19.5, hz - 7, 4, 9, { base: CLOTH.shadow, light: CLOTH.base, shadow: '#0c0a09' }, 0.5, CLOTH.light);
    // camada da frente, irregular, terminando no meio da coxa
    layer(16, 26.2, 20.2, hz - 10, 6, 14, CLOTH, 0.0, CLOTH.light);
    void t;
  }

  // ---- faixa vermelha ------------------------------------------------------
  function drawSash(ctx, hz, at, pos, yaw, t) {
    const sash = [
      { z: hz - 4, rw: 24.5, rf: 19.2 },
      { z: hz, rw: 25.8, rf: 20.4 },
      { z: hz + 4, rw: 24.8, rf: 19.4 },
      { z: hz + 6, rw: 20.5, rf: 16.5 },
    ];
    volumeFill(ctx, loftPts(sash, yaw, pos), SASH, 3.0, 2.1, 0.2);
    // dobras horizontais
    for (const [zz, a0] of [[hz - 2.0, 0.55], [hz + 1.5, 0.45], [hz + 4.5, 0.35]]) {
      const a = P2(at(-19.8, 18.6, zz)), b = P2(at(0, 21.6, zz + 0.6)), c = P2(at(19.8, 18.6, zz));
      ctx.strokeStyle = alpha(SASH.shadow, a0); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]); ctx.stroke();
      const d = P2(at(-19.2, 18.8, zz + 1.0)), e = P2(at(0, 21.8, zz + 1.6)), f = P2(at(19.2, 18.8, zz + 1.0));
      ctx.strokeStyle = alpha(SASH.light, 0.35); ctx.lineWidth = 1.0;
      ctx.beginPath(); ctx.moveTo(d[0], d[1]); ctx.quadraticCurveTo(e[0], e[1], f[0], f[1]); ctx.stroke();
    }

    // duas pontas largas, por baixo do nó
    const tails = [[1, 23, 8.0, 3.2], [-1, 19, 7.2, 2.8]];
    for (const [sg, len, w0, w1] of tails) {
      const pts = [
        at(sg * 6.0, 22.0, hz - 1),
        at(sg * (8.5 + Math.sin(t * 1.7 + sg) * 0.8), 21.6, hz - 9),
        at(sg * (7.5 + Math.sin(t * 1.7 + 0.9) * 1.4), 20.2, hz - 1 - len),
      ].map(P2);
      const tp = taperPath(pts, q => w0 + (w1 - w0) * q);
      ctx.fillStyle = sg > 0 ? SASH.base : SASH.shadow;
      ctx.fill(tp); inkPath(ctx, tp, 1.5, SASH.shadow);
      line(ctx, [pts[0], pts[1]], alpha(SASH.light, 0.5), 1.5);
      // ponta rasgada em duas línguas
      const last = pts[2];
      const tip = P2(at(sg * (7.0 + Math.sin(t * 1.7 + 1.4) * 1.0), 19.9, hz - 1 - len - 3.0));
      ctx.fillStyle = sg > 0 ? SASH.base : SASH.shadow;
      ctx.beginPath(); ctx.moveTo(last[0] - 2.4, last[1]); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(last[0] + 2.4, last[1]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = SASH.shadow; ctx.lineWidth = 1.0; ctx.stroke();
    }

    // laço: duas dobras grandes de pano, uma de cada lado do nó
    for (const sg of [1, -1]) {
      const a = P2(at(sg * 2.2, 23.0, hz - 2.4));
      const b = P2(at(sg * 10.8, 22.2, hz + 4.6));
      const c = P2(at(sg * 17.0, 20.6, hz + 0.6));
      const d = P2(at(sg * 8.0, 21.8, hz - 5.0));
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]);
      ctx.quadraticCurveTo((c[0] + d[0]) / 2 + sg * 2.0, (c[1] + d[1]) / 2, d[0], d[1]);
      ctx.quadraticCurveTo((a[0] + d[0]) / 2, (a[1] + d[1]) / 2 + 1.6, a[0], a[1]);
      ctx.closePath();
      ctx.fillStyle = SASH.base; ctx.fill();
      ctx.strokeStyle = SASH.shadow; ctx.lineWidth = 1.7; ctx.lineJoin = 'round'; ctx.stroke();
      // vinco interno do laço
      const e = P2(at(sg * 6.8, 22.4, hz + 0.0)), f = P2(at(sg * 11.6, 21.6, hz + 2.8));
      ctx.strokeStyle = alpha(SASH.shadow, 0.82); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.quadraticCurveTo((e[0] + f[0]) / 2 + sg * 1.6, (e[1] + f[1]) / 2, f[0], f[1]); ctx.stroke();
      // luz na borda de cima
      const g = P2(at(sg * 8.0, 22.2, hz + 3.8)), h = P2(at(sg * 13.0, 21.4, hz + 1.8));
      line(ctx, [g, h], alpha(SASH.light, 0.5), 1.4);
    }
    // nó central
    const knot = at(-0.5, 23.2, hz - 0.5);
    volumeFill(ctx, ellipsoidPts(knot, [6.0, 5.0, 5.4], yaw, 6, 11), SASH, 2.5, 1.9, 0.22);
    const kp = P2(knot);
    ctx.strokeStyle = alpha(SASH.shadow, 0.85); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(kp[0] - 2.8, kp[1] + 1.6); ctx.quadraticCurveTo(kp[0], kp[1] + 3.6, kp[0] + 2.8, kp[1] + 1.4); ctx.stroke();
    const kl = P2(at(-2.6, 23.4, hz + 1.6));
    line(ctx, [kp, kl], alpha(SASH.light, 0.45), 1.2);
  }

  // ---- espada --------------------------------------------------------------
  function drawSword(ctx, rig, t) {
    const hand = rig.handR;
    const dir = rig.swordDir;
    const gripA = add(hand, mul(dir, -10));
    const guardC = add(hand, mul(dir, 2.8));
    const tip = add(hand, mul(dir, 40));
    volumeFill(ctx, ellipsoidPts(gripA, [2.9, 2.9, 2.9], rig.yaw, 5, 9), GOLD, 1.4, 1.2, 0.2);
    volumeFill(ctx, tubePts(add(hand, mul(dir, -8.4)), add(hand, mul(dir, 1.4)), 2.1, 2.2, 0, 3, 8), LEATHER, 1.2, 1.0, 0.2);
    const gp = P2(guardC), hp = P2(hand);
    let gx = hp[0] - P2(add(hand, mul(dir, -6)))[0];
    let gy = hp[1] - P2(add(hand, mul(dir, -6)))[1];
    const gl = Math.hypot(gx, gy) || 1; gx /= gl; gy /= gl;
    const px = -gy, py = gx;
    const g1 = [gp[0] - px * 7.2, gp[1] - py * 7.2], g2 = [gp[0] + px * 7.2, gp[1] + py * 7.2];
    const gpath = taperPath([g1, g2], q => 4.4 - Math.abs(q - 0.5) * 3.0);
    ctx.fillStyle = GOLD.base; ctx.fill(gpath);
    inkPath(ctx, gpath, 1.4, GOLD.shadow);
    const b0 = P2(guardC), b1 = P2(tip);
    let bx = b1[0] - b0[0], by = b1[1] - b0[1];
    const bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
    const nx = -by, ny = bx;
    const w0 = 5.2, w1 = 3.8;
    const blade = [
      [b0[0] + nx * w0, b0[1] + ny * w0],
      [b1[0] + nx * 1.1, b1[1] + ny * 1.1],
      [b1[0] + bx * 3.0, b1[1] + by * 3.0],
      [b1[0] - nx * 1.1, b1[1] - ny * 1.1],
      [b0[0] - nx * w1, b0[1] - ny * w1],
    ];
    const bp = path(blade, false);
    ctx.fillStyle = STEEL.base; ctx.fill(bp);
    ctx.save(); ctx.clip(bp);
    ctx.fillStyle = STEEL.light;
    ctx.beginPath();
    ctx.moveTo(b0[0] - nx * w1, b0[1] - ny * w1);
    ctx.lineTo(b1[0] - nx * 1.1, b1[1] - ny * 1.1);
    ctx.lineTo(b0[0] - nx * w1 + bx * 26, b0[1] - ny * w1 + by * 26);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    inkPath(ctx, bp, 1.6, '#2b3138');
    line(ctx, [P2(add(guardC, mul(dir, 3))), P2(add(tip, mul(dir, -6)))], alpha('#44525c', 0.75), 1.1);
    void t;
  }

  // ---- montagem ------------------------------------------------------------
  function drawHero(ctx, rig, opts = {}) {
    const t = rig.time || 0;
    const yaw = rig.yaw;
    const pos = rig.pos;
    const at = (r, f, z) => add(pos, localPoint([r, f, z], yaw));
    const facing = dot(norm(localPoint([0, 1, 0], yaw)), Pilot.toCamera);
    const fighting = rig.combat && rig.combat.index >= 0;
    const hz = rig.hips[2] - pos[2];

    const nearRight = D(rig.shoulderR) >= D(rig.shoulderL);
    const armL = () => drawArm(ctx, rig.shoulderL, rig.elbowL, rig.handL, -1, at, pos, yaw);
    const armR = () => drawArm(ctx, rig.shoulderR, rig.elbowR, rig.handR, 1, at, pos, yaw);
    const torso = () => { drawTorso(ctx, hz, at, yaw, pos, facing); drawNeck(ctx, hz, at, yaw); };
    const legs = () => {
      const legR = () => drawLeg(ctx, rig.hipR, rig.kneeR, rig.footR, 1, at, pos, yaw);
      const legL = () => drawLeg(ctx, rig.hipL, rig.kneeL, rig.footL, -1, at, pos, yaw);
      if (D(rig.hipR) >= D(rig.hipL)) { legL(); legR(); } else { legR(); legL(); }
    };
    const outfit = () => { drawSkirt(ctx, hz, at, pos, yaw, t); drawSash(ctx, hz, at, pos, yaw, t); };

    const mark = opts.onStage || (() => {});
    if (fighting) {
      // braço esquerdo atrás do tronco se estiver do lado oposto
      if (nearRight) { armL(); mark('armL'); }
      torso(); mark('torso'); legs(); mark('legs'); outfit(); mark('outfit');
      if (!nearRight) { armL(); mark('armL2'); }
      armR(); mark('armR');   // espada sempre na frente
      drawSword(ctx, rig, t); mark('sword');
    } else if (nearRight) {
      armL(); mark('armL'); torso(); mark('torso'); legs(); mark('legs');
      outfit(); mark('outfit'); armR(); mark('armR');
    } else {
      armR(); mark('armR'); torso(); mark('torso'); legs(); mark('legs');
      outfit(); mark('outfit'); armL(); mark('armL2');
    }

    Pilot.drawHead(ctx, { pos: rig.head, yaw: rig.yaw, scale: 1.0 * (opts.headScale || 1) });
    mark('head');
  }

  return { drawHero };
})());
