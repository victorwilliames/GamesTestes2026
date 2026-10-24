'use strict';
// head.js — cabeça chibi do carequinha (careca: sem faixa no couro cabeludo).
// O crânio é um loft 3D projetado (silhueta correta em qualquer ângulo).
// O ROSTO é um decalque 2D limpo, ancorado na frente do crânio e comprimido
// pelo ângulo do yaw — sem projetar cada traço na superfície (que borrava).
Object.assign(Pilot, (() => {
  const { add, localPoint, project, pitch, DEG, TAU } = Pilot;
  const { PAL, celFill, path, line, inkPath, alpha, ellipsoidPts, solid, loftPts, hull3 } = Pilot;

  const RX = 28, RY = 26, RZ = 30;
  // Crânio: testa alta, maçãs largas, mandíbula marcada e queixo pequeno.
  const SKULL = [
    [-32, 3.0, 3.8, 5.2],
    [-30, 8.5, 8.8, 4.8],
    [-27.5, 13.0, 12.6, 4.0],
    [-24, 16.2, 15.4, 3.2],
    [-19, 19.6, 18.8, 2.2],
    [-13, 22.6, 21.8, 1.2],
    [-6, 25.0, 24.2, 0.4],
    [1, 26.8, 25.4, -0.3],
    [8, 27.2, 25.4, -0.8],
    [15, 26.0, 24.2, -1.3],
    [21, 23.0, 21.2, -1.8],
    [26, 18.0, 16.6, -2.2],
    [30, 11.5, 10.4, -2.6],
    [32, 3.0, 2.8, -2.8],
  ];

  function eyePath(cx, cy, w, h, flip) {
    const s = flip ? -1 : 1;
    const X = x => cx + s * x * w;
    const p = new Path2D();
    p.moveTo(X(-1), cy + 0.02 * h);
    p.quadraticCurveTo(X(-0.55), cy + 0.52 * h, X(-0.05), cy + 0.56 * h);
    p.quadraticCurveTo(X(0.48), cy + 0.60 * h, X(1), cy + 0.26 * h);
    p.quadraticCurveTo(X(0.52), cy - 0.38 * h, X(-0.05), cy - 0.42 * h);
    p.quadraticCurveTo(X(-0.58), cy - 0.36 * h, X(-1), cy + 0.02 * h);
    p.closePath();
    return p;
  }

  function drawHead(ctx, node) {
    const yaw = node.yaw || 0;
    const s = node.scale || 1;
    const C = node.pos || [0, 0, 0];
    const w = (r, f, z) => add(C, localPoint([r * s, f * s, z * s], yaw));
    const pr = v => project(v);

    // ---- orelhas (atrás do crânio) ----------------------------------------
    for (const sg of [1, -1]) {
      const ear = w(sg * 26.2, -2.0, -5.5);
      solid(ctx, ellipsoidPts(ear, [5.6 * s, 9.6 * s, 12.6 * s], yaw), PAL.skin, 2.8 * s, 1.5 * s);
      const inner = w(sg * 28.4, 1.4, -5.8);
      const q = pr(inner);
      const p = new Path2D();
      p.ellipse(q[0], q[1], 2.1 * s, 6.8 * s, sg * 0.15, 0, TAU);
      ctx.fillStyle = alpha('#8f4a36', 0.5); ctx.fill(p);
      line(ctx, [pr(w(sg * 28.2, 3.4, 2.8)), pr(w(sg * 29.0, 3.8, -3.2)), pr(w(sg * 29.2, 2.2, -8.8))], alpha('#7d3f2e', 0.6), 1.2 * s);
    }

    // ---- crânio ------------------------------------------------------------
    const levels = SKULL.map(([z, rw, rf, cf]) => ({ z: z * s, rw: rw * s, rf: rf * s, cf: cf * s, n: 22 }));
    const skull = hull3(loftPts(levels, yaw, C));
    celFill(ctx, skull, PAL.skin, 4.4 * s, 2.5 * s);

    // ---- sombra chapada: só na borda direita e sob o queixo ----------------
    ctx.save(); ctx.clip(skull);
    const sc = pr(w(26.5, 8, -2));
    const sp = new Path2D();
    sp.ellipse(sc[0], sc[1], 11.5 * s, 29 * s, -0.16, 0, TAU);
    ctx.fillStyle = alpha(PAL.skin.shadow, 0.55); ctx.fill(sp);
    const jaw = pr(w(0, 10, -26));
    const jp = new Path2D();
    jp.ellipse(jaw[0], jaw[1], 21 * s, 7.5 * s, 0, 0, TAU);
    ctx.fillStyle = alpha(PAL.skin.shadow, 0.28); ctx.fill(jp);
    const hl = pr(w(-14, 20, 13));
    const hp = new Path2D();
    hp.ellipse(hl[0], hl[1], 11 * s, 9 * s, 0.35, 0, TAU);
    ctx.fillStyle = alpha('#ffd9a3', 0.20); ctx.fill(hp);
    ctx.restore();

    // ---- ROSTO 2D (decalque) ----------------------------------------------
    const camYaw = Math.PI / 4;
    let rel = yaw - camYaw;
    rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    const hs = Math.cos(rel);              // 1 = de frente, 0 = de perfil
    if (hs > 0.10) {
      const a = pr(w(0, RY * 0.985, 9.0));
      ctx.save();
      ctx.clip(skull);
      ctx.translate(a[0], a[1]);
      ctx.scale(hs, -1);                    // y do rosto é "para cima"

      const EX = 11.0, EY = 3.0, EW = 7.5, EH = 5.5;

      // rubor das bochechas
      for (const sg of [1, -1]) {
        const p = new Path2D();
        p.ellipse(sg * 17.0, -3.5, 5.8, 3.2, 0.05, 0, TAU);
        ctx.fillStyle = alpha(PAL.red.light, 0.18); ctx.fill(p);
      }

      for (const sg of [1, -1]) {
        // esclera
        const eye = eyePath(sg * EX, EY, EW, EH, sg < 0);
        ctx.fillStyle = '#fff4de'; ctx.fill(eye);

        // íris rubra + pupila + brilho
        ctx.save();
        ctx.beginPath(); ctx.ellipse(sg * (EX + 0.25), EY + 0.1, 3.5, 3.3, 0, 0, TAU);
        ctx.fillStyle = PAL.red.base; ctx.fill();
        ctx.beginPath(); ctx.ellipse(sg * (EX + 0.25), EY, 1.45, 1.7, 0, 0, TAU);
        ctx.fillStyle = '#1e0a0e'; ctx.fill();
        ctx.beginPath(); ctx.arc(sg * (EX - 1.3), EY + 1.7, 1.2, 0, TAU);
        ctx.fillStyle = '#fff8e6'; ctx.fill();
        ctx.restore();

        inkPath(ctx, eye, 1.5, '#1b1418');
        // pálpebra superior grossa
        ctx.strokeStyle = '#171014'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sg * (EX - 7.1), EY + 0.2);
        ctx.quadraticCurveTo(sg * (EX - 2.4), EY + 4.1, sg * (EX + 3.8), EY + 3.9);
        ctx.quadraticCurveTo(sg * (EX + 6.4), EY + 3.7, sg * (EX + 7.4), EY + 1.4);
        ctx.stroke();
        // cílio externo
        ctx.strokeStyle = '#171014'; ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sg * (EX + 7.0), EY + 2.0);
        ctx.lineTo(sg * (EX + 8.6), EY + 3.4);
        ctx.stroke();
        // pálpebra inferior discreta
        ctx.strokeStyle = alpha('#7d3a2e', 0.55); ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(sg * (EX - 5.6), EY - 1.4);
        ctx.quadraticCurveTo(sg * (EX - 1.6), EY - 2.6, sg * (EX + 4.6), EY - 1.6);
        ctx.stroke();

        // sobrancelha: cunha grossa caída para o centro
        const bp = new Path2D();
        const outer = sg * 19.2, inner = sg * 4.2;
        bp.moveTo(outer, 11.5);
        bp.quadraticCurveTo(sg * 12.0, 10.8, inner, 7.9);
        bp.lineTo(sg * 4.6, 4.9);
        bp.quadraticCurveTo(sg * 12.2, 7.6, outer, 8.8);
        bp.closePath();
        ctx.fillStyle = '#191015'; ctx.fill(bp);
        // brilho de tinta na sobrancelha
        ctx.fillStyle = alpha('#5a2f38', 0.8);
        ctx.beginPath();
        ctx.moveTo(outer - sg * 1.2, 10.9);
        ctx.quadraticCurveTo(sg * 11.6, 10.0, inner + sg * 1.4, 7.7);
        ctx.lineTo(sg * 4.7, 6.9);
        ctx.quadraticCurveTo(sg * 11.6, 8.6, outer - sg * 1.2, 9.4);
        ctx.closePath(); ctx.fill();
      }

      // vinco da raiva entre as sobrancelhas
      ctx.strokeStyle = alpha('#7a3a2e', 0.55); ctx.lineWidth = 1.0; ctx.lineCap = 'round';
      for (const sg of [1, -1]) {
        ctx.beginPath(); ctx.moveTo(sg * 1.5, 6.4); ctx.lineTo(sg * 2.4, 10.2); ctx.stroke();
      }

      // nariz discreto
      ctx.fillStyle = alpha('#a3563f', 0.35);
      ctx.beginPath();
      ctx.moveTo(0, -0.8); ctx.lineTo(-2.4, -4.6); ctx.lineTo(2.4, -4.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = alpha('#5d2a24', 0.8);
      for (const sg of [1, -1]) { ctx.beginPath(); ctx.arc(sg * 1.8, -4.3, 0.62, 0, TAU); ctx.fill(); }

      // boca emburrada
      ctx.strokeStyle = '#5a2522'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4.2, -7.6);
      ctx.quadraticCurveTo(0, -8.9, 4.2, -7.6);
      ctx.stroke();
      ctx.strokeStyle = alpha('#e8907a', 0.35); ctx.lineWidth = 1.0;
      ctx.beginPath(); ctx.moveTo(-2.8, -9.4); ctx.quadraticCurveTo(0, -8.8, 2.8, -9.4); ctx.stroke();
      // vinco do queixo
      ctx.strokeStyle = alpha('#8f4632', 0.22); ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.moveTo(-4.0, -12.0); ctx.quadraticCurveTo(0, -13.0, 4.0, -12.0); ctx.stroke();

      // cicatriz X na testa (lado esquerdo do observador)
      ctx.strokeStyle = '#8d2f2c'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-19.6, 11.0); ctx.lineTo(-12.6, 17.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-19.6, 17.8); ctx.lineTo(-12.6, 11.0); ctx.stroke();
      ctx.strokeStyle = alpha('#d46a56', 0.7); ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-19.0, 11.9); ctx.lineTo(-13.2, 17.2); ctx.stroke();

      // arranhões na bochecha direita
      ctx.strokeStyle = '#a1402f'; ctx.lineWidth = 1.0;
      ctx.beginPath(); ctx.moveTo(18.3, -1.4); ctx.lineTo(21.0, -4.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(18.8, -5.0); ctx.lineTo(20.6, -7.0); ctx.stroke();

      ctx.restore();
    }

    // ---- cicatriz na nuca --------------------------------------------------
    if (facingBack(yaw)) {
      const a = pr(w(-14, -23, 10)), b = pr(w(-8, -23, 3));
      line(ctx, [a, b], '#8d2f2c', 1.7 * s);
      const c = pr(w(-14, -23, 3)), d = pr(w(-8, -23, 10));
      line(ctx, [c, d], '#8d2f2c', 1.7 * s);
    }

    inkPath(ctx, skull, 2.4 * s);
  }

  function facingBack(yaw) {
    const dx = Math.cos(yaw) + Math.sin(yaw);
    return dx < -0.25;
  }

  return { drawHead, HEAD_R: [RX, RZ], HEAD_CHIN: -32, HEAD_CROWN: 32 };
})());
