'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — head.js
// Cabeça e Rosto Procedural do Herói Carequinha em Canvas 2D Puro
// Fiel a ref/hero-carequinha/head.png e às regras do Prompt 5 de Rafael
// =============================================================================

(() => {
  const { TAU, project, localToWorld, vAdd } = globalThis.Agy.Core;
  const { Palette, celFill, projectHull, createPath, hexToRgba, torsoLoftCloud, ellipsoidCloud } = globalThis.Agy.Ink;

  // Perfil transversal 3D do crânio do Carequinha
  const CRANIUM_SLICES = [
    { z: -26, radiusW: 10, radiusF: 9, offY: -1, points: 14 },   // Queixo
    { z: -18, radiusW: 19, radiusF: 16, offY: 0, points: 18 },   // Mandíbula
    { z: -8,  radiusW: 24, radiusF: 22, offY: 1, points: 20 },   // Maçãs do rosto
    { z: 4,   radiusW: 27, radiusF: 25, offY: 0, points: 22 },   // Olhos e têmporas
    { z: 16,  radiusW: 26, radiusF: 24, offY: -2, points: 20 },  // Testa alta
    { z: 26,  radiusW: 21, radiusF: 20, offY: -3, points: 18 },  // Curva do topo
    { z: 32,  radiusW: 12, radiusF: 11, offY: -4, points: 14 }   // Vértice do crânio
  ];

  function drawHead(ctx, headNode) {
    const pos = headNode.pos || [0, 0, 0];
    const yaw = headNode.yaw || 0;
    const scale = headNode.scale || 1.0;

    const toW = (r, f, z) => vAdd(pos, localToWorld([r * scale, f * scale, z * scale], yaw));

    // 1. Orelhas Volumosas (Desenhadas antes do crânio para oclusão)
    for (const side of [1, -1]) {
      const earCenter = toW(side * 26, -2, -4);
      const earCloud = ellipsoidCloud(earCenter, [5 * scale, 9 * scale, 12 * scale], yaw);
      const earPath = projectHull(earCloud);
      celFill(ctx, earPath, Palette.skin, 2.5 * scale, 1.3 * scale);

      // Dobra interna da orelha
      const earInner = project(toW(side * 28, 1, -4));
      ctx.fillStyle = hexToRgba(Palette.skin.shadow, 0.55);
      ctx.beginPath();
      ctx.ellipse(earInner[0], earInner[1], 2.2 * scale, 6.0 * scale, side * 0.12, 0, TAU);
      ctx.fill();
    }

    // 2. Volume 3D do Crânio
    const craniumSections = CRANIUM_SLICES.map(s => ({
      z: s.z * scale,
      radiusW: s.radiusW * scale,
      radiusF: s.radiusF * scale,
      offY: s.offY * scale,
      points: s.points
    }));
    const craniumCloud = torsoLoftCloud(craniumSections, yaw, pos);
    const craniumPath = projectHull(craniumCloud);
    celFill(ctx, craniumPath, Palette.skin, 4.5 * scale, 2.4 * scale);

    // 3. Sombreamento Esferoidal e Volume Celular do Crânio
    ctx.save();
    ctx.clip(craniumPath);

    // Sombra de oclusão do lado direito
    const shadowCenter = project(toW(25, 6, 0));
    ctx.fillStyle = hexToRgba(Palette.skin.shadow, 0.45);
    ctx.beginPath();
    ctx.ellipse(shadowCenter[0], shadowCenter[1], 12 * scale, 30 * scale, -0.15, 0, TAU);
    ctx.fill();

    // Sombra sob a mandíbula
    const jawCenter = project(toW(0, 8, -24));
    ctx.fillStyle = hexToRgba(Palette.skin.shadow, 0.35);
    ctx.beginPath();
    ctx.ellipse(jawCenter[0], jawCenter[1], 20 * scale, 8 * scale, 0, 0, TAU);
    ctx.fill();

    // Ponto de luz quente no topo da cabeça calva
    const lightCenter = project(toW(-12, 16, 18));
    ctx.fillStyle = hexToRgba(Palette.skin.highlight, 0.3);
    ctx.beginPath();
    ctx.ellipse(lightCenter[0], lightCenter[1], 12 * scale, 9 * scale, 0.3, 0, TAU);
    ctx.fill();

    ctx.restore();

    // 4. Traços Faciais (Rosto Projetado no Espaço 3D)
    // Regra de Ouro do Prompt 5: O herói olha para a sua frente 3D.
    // Os traços só aparecem quando o rosto está no campo visual da câmera.
    const camAngle = Math.PI / 4;
    let viewAngle = yaw - camAngle;
    viewAngle = Math.atan2(Math.sin(viewAngle), Math.cos(viewAngle));
    const faceFacingFactor = Math.cos(viewAngle);

    if (faceFacingFactor > 0.08) {
      const faceOrigin = project(toW(0, 24 * scale, 4 * scale));

      ctx.save();
      ctx.clip(craniumPath);
      ctx.translate(faceOrigin[0], faceOrigin[1]);
      ctx.scale(faceFacingFactor, -1); // Compressão angular na perspectiva

      // ---------- MARCA VERMELHA DO CAREQUINHA ----------
      // Faixa vertical carmesim sobre o olho esquerdo (lado direito do observador)
      const mark = new Path2D();
      mark.moveTo(8, 28);
      mark.lineTo(15, 27);
      mark.lineTo(17, 10);
      mark.lineTo(14, -8);
      mark.lineTo(10, -22);
      mark.lineTo(5, -22);
      mark.lineTo(7, -8);
      mark.lineTo(6, 10);
      mark.closePath();

      ctx.fillStyle = hexToRgba(Palette.scarlet.base, 0.92);
      ctx.fill(mark);
      ctx.strokeStyle = hexToRgba(Palette.scarlet.shadow, 0.95);
      ctx.lineWidth = 1.4;
      ctx.stroke(mark);

      // ---------- OLHOS RUBROS E SOBRANCELHAS ----------
      const eyeSpacing = 11.5;
      const eyeY = 3.0;

      for (const side of [1, -1]) {
        const eyeX = side * eyeSpacing;

        // Esclera
        const sclera = new Path2D();
        sclera.moveTo(eyeX - side * 7, eyeY + 1);
        sclera.quadraticCurveTo(eyeX, eyeY + 4, eyeX + side * 7, eyeY + 1.5);
        sclera.quadraticCurveTo(eyeX, eyeY - 2.5, eyeX - side * 7, eyeY + 1);
        sclera.closePath();
        ctx.fillStyle = '#fff6e8';
        ctx.fill(sclera);

        // Íris Rubra Incandescente
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(eyeX + side * 0.5, eyeY + 0.8, 3.8, 3.4, 0, 0, TAU);
        ctx.fillStyle = Palette.scarlet.base;
        ctx.fill();

        // Pupila
        ctx.beginPath();
        ctx.ellipse(eyeX + side * 0.5, eyeY + 0.8, 1.6, 1.8, 0, 0, TAU);
        ctx.fillStyle = '#18070b';
        ctx.fill();

        // Brilho no olhar
        ctx.beginPath();
        ctx.arc(eyeX - side * 1.2, eyeY + 2.0, 1.1, 0, TAU);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Contorno do olho
        ctx.strokeStyle = Palette.ink;
        ctx.lineWidth = 1.3;
        ctx.stroke(sclera);

        // Pálpebra superior grossa estilizada (estilo HQ / Hades)
        ctx.strokeStyle = '#150d12';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(eyeX - side * 8, eyeY + 1.5);
        ctx.quadraticCurveTo(eyeX, eyeY + 4.8, eyeX + side * 8.5, eyeY + 2.2);
        ctx.stroke();

        // Sobrancelha preta grossa e furiosa
        const brow = new Path2D();
        const inner = side * 4.0;
        const outer = side * 19.5;
        brow.moveTo(outer, 12.0);
        brow.quadraticCurveTo(side * 12.0, 11.2, inner, 8.2);
        brow.lineTo(inner, 5.0);
        brow.quadraticCurveTo(side * 12.0, 8.0, outer, 9.2);
        brow.closePath();
        ctx.fillStyle = '#120b10';
        ctx.fill(brow);
      }

      // Rugas de expressão entre as sobrancelhas (fúria)
      ctx.strokeStyle = hexToRgba('#7d382b', 0.65);
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      for (const side of [1, -1]) {
        ctx.beginPath();
        ctx.moveTo(side * 1.8, 7.0);
        ctx.lineTo(side * 2.8, 11.5);
        ctx.stroke();
      }

      // Nariz marcado e sombreado
      ctx.fillStyle = hexToRgba('#9a4e3b', 0.4);
      ctx.beginPath();
      ctx.moveTo(0, -0.5);
      ctx.lineTo(-2.8, -4.8);
      ctx.lineTo(2.8, -4.8);
      ctx.closePath();
      ctx.fill();

      // Narinas
      ctx.fillStyle = hexToRgba('#55231e', 0.9);
      for (const side of [1, -1]) {
        ctx.beginPath();
        ctx.arc(side * 1.9, -4.5, 0.7, 0, TAU);
        ctx.fill();
      }

      // Boca severa e determinada
      ctx.strokeStyle = '#521f1c';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4.5, -8.0);
      ctx.quadraticCurveTo(0, -9.5, 4.5, -8.0);
      ctx.stroke();

      // Cicatriz em X / talho no lado esquerdo da face
      ctx.strokeStyle = '#8c2c29';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-18.5, 13.0);
      ctx.lineTo(-12.5, 19.0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-18.5, 19.0);
      ctx.lineTo(-12.5, 13.0);
      ctx.stroke();

      ctx.restore();
    }

    // Contorno final do crânio
    ctx.strokeStyle = Palette.ink;
    ctx.lineWidth = 2.4 * scale;
    ctx.stroke(craniumPath);
  }

  const Head = {
    drawHead,
    CRANIUM_SLICES
  };

  globalThis.Agy = globalThis.Agy || {};
  globalThis.Agy.Head = Head;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Head;
  }
})();
