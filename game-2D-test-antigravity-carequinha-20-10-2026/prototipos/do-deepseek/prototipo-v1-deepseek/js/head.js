'use strict';
// head.js — carequinha (careca) com leitura 2.5D estilo Hades.
// Crânio: loft 3D projetado, largo nas têmporas e afilando no queixo.
// Rosto: decalque 2D ancorado na frente do crânio, comprimido pelo yaw.
// Luz da alta-esquerda: sombra dura na borda direita, testa/maçã iluminadas.
Object.assign(Pilot, (() => {
  const { add, localPoint, project, TAU } = Pilot;
  const { PAL, line, inkPath, alpha, ellipsoidPts, solid, loftPts, hull3, celFill, taperPath, path } = Pilot;

  const RX = 30.6, RY = 23.2, RZ = 32.5;

  // z, meia-largura, meia-profundidade, deslocamento frontal.
  // Têmporas largas no terço superior, mandíbula estreita e queixo pontudo.
  const SKULL = [
    [-34, 3.6, 4.0, 6.2],
    [-32, 6.2, 7.0, 5.8],
    [-29, 9.0, 9.6, 5.4],
    [-26, 12.2, 12.4, 4.8],
    [-22, 14.2, 14.8, 4.0],
    [-17, 19.0, 17.8, 3.0],
    [-11, 24.0, 20.2, 2.0],
    [-5, 28.4, 22.0, 1.0],
    [2, 30.0, 23.2, 0.0],
    [9, 29.6, 23.4, -0.8],
    [16, 28.2, 22.8, -1.4],
    [22, 25.8, 20.8, -2.0],
    [27, 20.4, 16.4, -2.4],
    [31, 11.6, 9.0, -2.7],
    [33, 2.8, 2.6, -2.9],
  ];

  function eyePath(cx, cy, w, h, flip) {
    const s = flip ? -1 : 1;
    const X = x => cx + s * x * w;
    const p = new Path2D();
    p.moveTo(X(-1), cy + 0.05 * h);
    p.quadraticCurveTo(X(-0.52), cy + 0.60 * h, X(0.02), cy + 0.65 * h);
    p.quadraticCurveTo(X(0.56), cy + 0.62 * h, X(1), cy + 0.35 * h);
    p.quadraticCurveTo(X(0.50), cy - 0.33 * h, X(-0.10), cy - 0.37 * h);
    p.quadraticCurveTo(X(-0.66), cy - 0.34 * h, X(-1), cy + 0.05 * h);
    p.closePath();
    return p;
  }

  function disc(ctx, x, y, rx, ry, rot, color) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
    ctx.fillStyle = color; ctx.fill();
  }

  function drawHead(ctx, node) {
    const yaw = node.yaw || 0;
    const s = node.scale || 1;
    const C = node.pos || [0, 0, 0];
    const w = (r, f, z) => add(C, localPoint([r * s, f * s, z * s], yaw));
    const pr = v => project(v);

    // ---- orelhas grandes e pontudas (atrás do crânio) ---------------------
    for (const sg of [1, -1]) {
      const ear = w(sg * 30.8, 0.5, -2.0);
      const earPts = ellipsoidPts(ear, [7.0 * s, 9.8 * s, 13.0 * s], yaw, 7, 12);
      solid(ctx, earPts, PAL.skin, 2.8 * s, 2.0 * s);
      // sombra na base da orelha
      ctx.save(); ctx.clip(path(earPts));
      const baseShadow = pr(w(sg * 27.2, 2.0, -6.0));
      disc(ctx, baseShadow[0], baseShadow[1], 4.2 * s, 8.2 * s, sg * 0.2, alpha('#5e2a1d', 0.36));
      ctx.restore();
      // ponta da orelha, puxada para cima/fora
      const tipPath = new Path2D();
      const t0 = pr(w(sg * 27.8, 0.5, 7.0));
      const t1 = pr(w(sg * 38.5, -1.0, 16.5));
      const t2 = pr(w(sg * 33.6, 1.0, 1.0));
      tipPath.moveTo(t0[0], t0[1]); tipPath.lineTo(t1[0], t1[1]); tipPath.lineTo(t2[0], t2[1]); tipPath.closePath();
      ctx.fillStyle = PAL.skin.base; ctx.fill(tipPath); inkPath(ctx, tipPath, 2.0 * s);
      // concha
      const inner = pr(w(sg * 32.8, 4.0, -2.0));
      disc(ctx, inner[0], inner[1], 2.8 * s, 8.2 * s, sg * 0.14, alpha('#5e2a1d', 0.72));
      disc(ctx, inner[0] - sg * 0.6 * s, inner[1] - 1.0 * s, 1.8 * s, 5.8 * s, sg * 0.12, alpha('#a3563f', 0.55));
      // borda iluminada da concha
      const rim = pr(w(sg * 31.2, 4.6, 3.0));
      disc(ctx, rim[0], rim[1], 1.4 * s, 4.6 * s, sg * 0.1, alpha('#ffd39a', 0.3));
      line(ctx, [pr(w(sg * 31.8, 5.0, 4.0)), pr(w(sg * 32.6, 5.2, -2.6)), pr(w(sg * 32.4, 4.0, -8.2))], alpha('#5e2a1d', 0.72), 1.3 * s);
      // trágus
      const tr = pr(w(sg * 28.6, 5.4, -6.0));
      disc(ctx, tr[0], tr[1], 2.2 * s, 2.9 * s, 0, alpha('#7e3a26', 0.55));
    }

    // ---- crânio -----------------------------------------------------------
    const levels = SKULL.map(([z, rw, rf, cf]) => ({ z: z * s, rw: rw * s, rf: rf * s, cf: cf * s, n: 26 }));
    const skull = hull3(loftPts(levels, yaw, C));
    celFill(ctx, skull, PAL.skin, 4.4 * s, 3.0 * s);

    // ---- sombras duras (luz alta-esquerda) --------------------------------
    ctx.save(); ctx.clip(skull);
    // borda direita (faixa dura)
    const re = pr(w(31.0, 4.0, -2));
    disc(ctx, re[0], re[1], 8.0 * s, 32 * s, -0.10, alpha(PAL.skin.shadow, 0.52));
    const re2 = pr(w(30.5, 1.0, -4));
    disc(ctx, re2[0], re2[1], 4.6 * s, 30 * s, -0.08, alpha(PAL.skin.deep, 0.28));
    // mandíbula direita
    const jw = pr(w(10, 9, -24));
    disc(ctx, jw[0], jw[1], 15.5 * s, 7.6 * s, -0.06, alpha(PAL.skin.shadow, 0.34));
    // maçã direita
    const ch = pr(w(21, 12, -10));
    disc(ctx, ch[0], ch[1], 8.0 * s, 5.6 * s, 0.2, alpha(PAL.skin.shadow, 0.2));
    // testa alta-esquerda
    const hl = pr(w(-14, 19, 16));
    disc(ctx, hl[0], hl[1], 13 * s, 8.5 * s, 0.32, alpha(PAL.skin.light, 0.26));
    // maçã esquerda
    const hl2 = pr(w(-20, 13, -7));
    disc(ctx, hl2[0], hl2[1], 7.0 * s, 4.6 * s, 0.0, alpha(PAL.skin.light, 0.18));
    // topo do crânio
    const top = pr(w(-6, 7, 30));
    disc(ctx, top[0], top[1], 14 * s, 6.4 * s, 0.1, alpha(PAL.skin.light, 0.18));
    ctx.restore();

    // ---- ROSTO 2D (decalque) ----------------------------------------------
    const camYaw = Math.PI / 4;
    let rel = yaw - camYaw;
    rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    const hs = Math.cos(rel);              // 1 = de frente, 0 = de perfil
    if (hs > 0.10) {
      const a = pr(w(0, 21.8, -10.0));
      ctx.save();
      ctx.clip(skull);
      ctx.translate(a[0], a[1]);
      ctx.scale(hs * s, -s);               // y do rosto é "para cima"

      const EX = 13.0, EY = 1.0, EW = 9.2, EH = 9.4;

      // sombra do lado direito do rosto (por baixo da faixa, para não apagar o vermelho)
      ctx.fillStyle = alpha('#7d3a2e', 0.24);
      ctx.beginPath();
      ctx.moveTo(17, 46); ctx.lineTo(58, 46); ctx.lineTo(58, -44); ctx.lineTo(12, -44);
      ctx.quadraticCurveTo(8, -28, 13, -16);
      ctx.quadraticCurveTo(17, -6, 14, 4);
      ctx.quadraticCurveTo(12, 19, 17, 46);
      ctx.closePath(); ctx.fill();

      // faixa vermelha: do topo do crânio até a mandíbula direita
      const stripePts = [[6, 43], [12, 38], [18, 33], [23, 27], [27, 21], [29, 15],
        [29.5, 9], [29, 3], [27, -3], [24, -7], [20, -10], [12, -14]];
      const stripeW = [8.5, 9.5, 10, 10.5, 10, 9, 8, 7, 5.5, 4.2, 3.4, 2.2];
      const sw = q => stripeW[Math.min(stripeW.length - 1, Math.round(q * (stripeW.length - 1)))];
      const stripeBorder = taperPath(stripePts, q => sw(q) + 2.2);
      ctx.fillStyle = '#5f1721'; ctx.fill(stripeBorder);
      const stripeBase = taperPath(stripePts, q => sw(q));
      ctx.fillStyle = '#a82c2c'; ctx.fill(stripeBase);

      // núcleo iluminado da faixa + lascas de pincel
      const stripeCore = taperPath(stripePts, q => Math.max(1.0, sw(q) * 0.4));
      ctx.fillStyle = alpha('#e25443', 0.9); ctx.fill(stripeCore);
      ctx.strokeStyle = alpha('#7e1f26', 0.55); ctx.lineWidth = 1.1;
      for (const [x0, y0, x1, y1] of [[9, 40, 12, 37], [17, 32, 21, 28], [24, 23, 28, 19], [28, 13, 30, 9], [27, 2, 29, -2], [23, -5, 25, -8]]) {
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      // entalhes escuros que quebram a borda
      for (const [x, y, r] of [[12, 35, 1.3], [20, 28, 1.7], [27, 20, 1.2], [28.5, 8, 1.5], [25.5, -2, 1.2], [19, -9, 1.0]]) {
        ctx.fillStyle = alpha('#6e1b24', 0.78);
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }

      // órbita afundada e sombra sob a sobrancelha
      for (const sg of [1, -1]) {
        disc(ctx, sg * EX, EY + 5.6, 12.0, 5.2, 0, alpha('#5e2a1d', 0.26));
        disc(ctx, sg * EX, EY + 6.8, 8.0, 2.4, 0, alpha('#4d1f1c', 0.32));
      }

      // rubor das bochechas
      for (const sg of [1, -1]) disc(ctx, sg * 21.0, -5.6, 6.8, 3.6, 0.05, alpha(PAL.red.light, 0.12));

      for (const sg of [1, -1]) {
        // esclera
        const eye = eyePath(sg * EX, EY, EW, EH, sg < 0);
        ctx.fillStyle = '#fff7e8'; ctx.fill(eye);

        // íris rubra grande + pupila + brilhos (recortados na esclera)
        ctx.save(); ctx.clip(eye);
        const ix = sg * (EX - 0.2);
        disc(ctx, ix, EY + 0.2, 7.0, 6.8, 0, PAL.red.light);
        disc(ctx, ix, EY + 0.2, 6.2, 6.2, 0, PAL.red.base);
        disc(ctx, ix, EY + 0.15, 3.2, 3.5, 0, '#1e0a0e');
        disc(ctx, ix - sg * 2.6, EY + 3.0, 2.0, 2.0, 0, '#fff8e6');
        disc(ctx, ix + sg * 1.8, EY - 2.8, 1.1, 1.1, 0, alpha('#ff8a7a', 0.85));
        // sombra da pálpebra no alto da íris
        ctx.fillStyle = alpha('#3a1418', 0.32);
        ctx.beginPath(); ctx.ellipse(ix, EY + 5.6, 6.6, 2.6, 0, 0, TAU); ctx.fill();
        // borda inferior clara
        ctx.fillStyle = alpha('#ff9a7a', 0.2);
        ctx.beginPath(); ctx.ellipse(ix, EY - 4.6, 5.4, 1.6, 0, 0, TAU); ctx.fill();
        ctx.restore();

        inkPath(ctx, eye, 2.0, '#1b1418');

        // pálpebra superior grossa e alta
        ctx.strokeStyle = '#171014'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sg * (EX - 8.8), EY + 0.8);
        ctx.quadraticCurveTo(sg * (EX - 1.8), EY + 6.8, sg * (EX + 4.0), EY + 6.4);
        ctx.quadraticCurveTo(sg * (EX + 7.8), EY + 6.0, sg * (EX + 9.2), EY + 3.2);
        ctx.stroke();
        // cílio externo
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(sg * (EX + 8.2), EY + 4.4);
        ctx.lineTo(sg * (EX + 10.6), EY + 6.8);
        ctx.stroke();
        // pálpebra inferior
        ctx.strokeStyle = alpha('#6f3222', 0.55); ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(sg * (EX - 7.2), EY - 2.8);
        ctx.quadraticCurveTo(sg * (EX - 1.0), EY - 5.2, sg * (EX + 6.0), EY - 3.4);
        ctx.stroke();
        // vinco acima da pálpebra
        ctx.strokeStyle = alpha('#7d3a2e', 0.3); ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(sg * (EX - 6.4), EY + 8.4);
        ctx.quadraticCurveTo(sg * (EX - 0.8), EY + 9.4, sg * (EX + 5.4), EY + 8.0);
        ctx.stroke();

        // sobrancelha: pincelada grossa em cunha, mergulhando para o centro
        const browPts = [[sg * 24.5, 17.2], [sg * 13.0, 13.4], [sg * 2.6, 8.6]];
        ctx.fillStyle = '#191015'; ctx.fill(taperPath(browPts, q => 5.6 - 3.8 * q));
        // brilho de tinta na metade de cima
        ctx.fillStyle = alpha('#5a2f38', 0.8);
        ctx.fill(taperPath([[sg * 23.4, 18.0], [sg * 12.4, 14.2], [sg * 3.2, 9.6]], q => 1.7 - 0.8 * q));
        // ponta interna arrepiada
        ctx.fillStyle = '#191015';
        ctx.fill(taperPath([[sg * 3.2, 9.4], [sg * 0.9, 7.8]], q => 2.2 - q * 1.2));
      }

      // vinco da raiva entre as sobrancelhas
      ctx.strokeStyle = alpha('#5e2a1d', 0.5); ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      for (const sg of [1, -1]) {
        ctx.beginPath(); ctx.moveTo(sg * 1.2, 9.2); ctx.lineTo(sg * 2.8, 13.0); ctx.stroke();
      }

      // nariz: curto e estreito, com sombra triangular e narinas
      ctx.fillStyle = alpha('#5e2a1d', 0.28);
      ctx.beginPath(); ctx.moveTo(0, 1.8); ctx.lineTo(3.6, -7.6); ctx.lineTo(1.0, -9.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = alpha('#a3563f', 0.24);
      ctx.beginPath(); ctx.moveTo(0, 1.6); ctx.lineTo(-3.2, -7.6); ctx.lineTo(0, -8.8); ctx.lineTo(3.2, -7.6); ctx.closePath(); ctx.fill();
      line(ctx, [[0, 1.2], [0, -8.4]], alpha('#5d2a24', 0.55), 1.1);
      disc(ctx, 0, -8.2, 3.2, 1.2, 0, alpha('#5e2a1d', 0.55));
      for (const sg of [1, -1]) disc(ctx, sg * 2.4, -8.0, 0.8, 0.55, 0, '#4d1f1c');
      disc(ctx, 0, -5.8, 1.5, 1.1, 0, alpha('#ffd0a0', 0.26));
      disc(ctx, 0, -1.4, 1.2, 3.0, 0, alpha('#ffd0a0', 0.16));

      // boca: pequena, cantos para baixo (frown) e sulco do queixo
      disc(ctx, 0, -15.2, 4.2, 2.0, 0, alpha('#7d3a2e', 0.16));
      ctx.strokeStyle = '#4d1f1c'; ctx.lineWidth = 1.9; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-3.2, -15.8);
      ctx.quadraticCurveTo(-1.4, -13.8, 0, -13.7);
      ctx.quadraticCurveTo(1.4, -13.8, 3.2, -15.8);
      ctx.stroke();
      // lábio inferior
      ctx.strokeStyle = alpha('#e8907a', 0.4); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-2.4, -16.6); ctx.quadraticCurveTo(0, -15.8, 2.4, -16.6); ctx.stroke();
      // sulco do queixo
      ctx.strokeStyle = alpha('#5e2a1d', 0.3); ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.moveTo(-3.8, -18.2); ctx.quadraticCurveTo(0, -19.4, 3.8, -18.2); ctx.stroke();
      disc(ctx, 0, -20.0, 3.8, 2.0, 0, alpha('#ffcb87', 0.13));

      // sulcos nasogenianos
      ctx.strokeStyle = alpha('#8f4329', 0.2); ctx.lineWidth = 1.0;
      for (const sg of [1, -1]) {
        ctx.beginPath(); ctx.moveTo(sg * 3.4, -8.0); ctx.quadraticCurveTo(sg * 4.2, -10.8, sg * 3.6, -13.4); ctx.stroke();
      }

      // cicatriz X na testa (lado esquerdo, acima da sobrancelha)
      const scarStrokes = [[-22.0, 21.0, -14.0, 27.0], [-22.0, 27.0, -14.0, 21.0]];
      for (const [x0, y0, x1, y1] of scarStrokes) {
        const sp = taperPath([[x0, y0], [x1, y1]], q => 2.2 - Math.abs(q - 0.5) * 2.6);
        ctx.fillStyle = '#7a1f26'; ctx.fill(sp);
      }
      for (const [x0, y0, x1, y1] of [[-20.8, 22.0, -15.2, 26.2], [-20.8, 26.0, -15.2, 21.8]]) {
        line(ctx, [[x0, y0], [x1, y1]], alpha('#e07a62', 0.5), 0.8);
      }

      // arranhões na bochecha direita, sob a faixa
      ctx.strokeStyle = '#a1402f'; ctx.lineWidth = 1.3;
      for (const [x0, y0, x1, y1] of [[12.5, -8.4, 15.4, -10.6], [10.8, -10.6, 13.0, -12.4], [9.0, -12.4, 10.8, -13.8]]) {
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }

      ctx.restore();
    }

    // ---- nuca: faixa + X ---------------------------------------------------
    if (facingBack(yaw)) {
      const b0 = pr(w(5, -22, 30)), b1 = pr(w(19, -22, 20)), b2 = pr(w(25, -22, 4));
      const bp = taperPath([b0, b1, b2], q => 10.5 - q * 3.0);
      ctx.fillStyle = '#b8352f'; ctx.fill(bp);
      inkPath(ctx, bp, 1.5, '#6e1b24');
      const a = pr(w(-16, -22, 12)), b = pr(w(-9, -22, 4));
      line(ctx, [a, b], '#8d2f2c', 2.0 * s);
      const c = pr(w(-16, -22, 4)), d = pr(w(-9, -22, 12));
      line(ctx, [c, d], '#8d2f2c', 2.0 * s);
    }

    inkPath(ctx, skull, 2.8 * s);
  }

  function facingBack(yaw) {
    const dx = Math.cos(yaw) + Math.sin(yaw);
    return dx < -0.25;
  }

  return { drawHead, HEAD_R: [RX, RZ], HEAD_CHIN: -32, HEAD_CROWN: 33 };
})());
