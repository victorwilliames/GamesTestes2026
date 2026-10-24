// ============================================================================
// TorsoPainter.js — Pescoço, Trapézio, Peitoral Esculpido e Abdômen Chibi
// ============================================================================

export class TorsoPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha o tronco (com pescoço visível para modos sem cachecol/capa como nocape).
   * Opera a partir dos pivôs chest e pelvis.
   */
  paint(ctx, pose) {
    const {
      neckBase = { x: 627, y: 360 },
      chest = { x: 627, y: 455 },
      pelvis = { x: 627, y: 610 },
      yaw = 0,
      showBareNeck = false
    } = pose;

    const cx = (chest.x + pelvis.x) * 0.5;
    const shiftX = yaw * 24;
    const torsoAngle = Math.atan2(chest.x - pelvis.x, pelvis.y - chest.y);

    ctx.save();
    ctx.translate(pelvis.x, pelvis.y);
    ctx.rotate(torsoAngle * 0.65);
    ctx.translate(-pelvis.x, -pelvis.y);

    const topY = showBareNeck ? neckBase.y - 42 : neckBase.y - 8;
    const botY = pelvis.y + 18;
    const lateralFactor = Math.abs(yaw);
    const halfChestW = 176 * Math.max(0.62, 1.0 - lateralFactor * 0.38);
    const halfWaistW = 138 * Math.max(0.64, 1.0 - lateralFactor * 0.36);

    // 1. Silhueta muscular do tronco + trapézio + pescoço
    const torsoPath = new Path2D();
    if (showBareNeck) {
      // Pescoço cilíndrico forte (hero-part-body-tpose-nocape.png: x=562..691, y=320..380)
      torsoPath.moveTo(cx - 64, topY);
      torsoPath.lineTo(cx + 64, topY);
      torsoPath.bezierCurveTo(cx + 68, topY + 42, cx + 82, topY + 55, cx + halfChestW, chest.y - 58);
    } else {
      torsoPath.moveTo(cx - 115, topY);
      torsoPath.lineTo(cx + 115, topY);
      torsoPath.lineTo(cx + halfChestW, chest.y - 50);
    }

    // Lateral direita do peito descendo até a cintura
    torsoPath.bezierCurveTo(
      cx + halfChestW + 8, chest.y + 5,
      cx + halfWaistW + 14, chest.y + 65,
      cx + halfWaistW, botY
    );
    torsoPath.lineTo(cx - halfWaistW, botY);
    torsoPath.bezierCurveTo(
      cx - halfWaistW - 14, chest.y + 65,
      cx - halfChestW - 8, chest.y + 5,
      cx - halfChestW, chest.y - 58
    );

    if (showBareNeck) {
      torsoPath.bezierCurveTo(cx - 82, topY + 55, cx - 68, topY + 42, cx - 64, topY);
    }
    torsoPath.closePath();

    this.mat.paintSkinPath(ctx, torsoPath, {
      x: cx - halfChestW - 15,
      y: topY,
      w: (halfChestW + 15) * 2,
      h: botY - topY
    }, {
      baseColor: '#f7b77f',
      highlightColor: '#ffd7ab',
      shadowColor: '#df8549',
      deepShadowColor: '#bd5e26',
      outlineWidth: 5.8,
      seed: 801
    });

    // 2. Escultura interna dos músculos (peitoral, clavículas, costelas e abdômen)
    ctx.save();
    ctx.clip(torsoPath);

    const midX = cx + shiftX;
    const pecBottomY = chest.y + 24;

    // Sombra sob os peitorais
    const pecShadowL = new Path2D();
    pecShadowL.moveTo(cx - halfChestW + 12, chest.y - 12);
    pecShadowL.bezierCurveTo(cx - 125, pecBottomY + 18, midX - 35, pecBottomY + 16, midX - 4, pecBottomY - 6);
    pecShadowL.lineTo(midX - 4, pecBottomY + 18);
    pecShadowL.bezierCurveTo(midX - 45, pecBottomY + 32, cx - 135, pecBottomY + 28, cx - halfChestW + 10, chest.y + 8);
    pecShadowL.closePath();

    const pecShadowR = new Path2D();
    pecShadowR.moveTo(cx + halfChestW - 12, chest.y - 12);
    pecShadowR.bezierCurveTo(cx + 125, pecBottomY + 18, midX + 35, pecBottomY + 16, midX + 4, pecBottomY - 6);
    pecShadowR.lineTo(midX + 4, pecBottomY + 18);
    pecShadowR.bezierCurveTo(midX + 45, pecBottomY + 32, cx + 135, pecBottomY + 28, cx + halfChestW - 10, chest.y + 8);
    pecShadowR.closePath();

    ctx.fillStyle = 'rgba(196, 92, 38, 0.55)';
    ctx.fill(pecShadowL);
    ctx.fill(pecShadowR);

    // Brilho volumétrico superior nos peitorais
    for (const [px, py, rx, ry] of [
      [midX - 74, chest.y - 14, 58, 30],
      [midX + 74, chest.y - 14, 58, 30]
    ]) {
      const pg = ctx.createRadialGradient(px, py - 6, 4, px, py, rx);
      pg.addColorStop(0, 'rgba(255, 232, 204, 0.62)');
      pg.addColorStop(1, 'rgba(255, 232, 204, 0.0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gomos abdominais (2 colunas × 3 fileiras esculpidas)
    const abStartY = pecBottomY + 16;
    const abRowH = (botY - abStartY - 8) / 2.6;
    for (let row = 0; row < 2; row++) {
      const ay = abStartY + row * abRowH;
      for (const sideSign of [-1, 1]) {
        const ax = midX + sideSign * 42;
        // Luz superior do gomo
        ctx.fillStyle = 'rgba(255, 224, 190, 0.42)';
        ctx.beginPath();
        ctx.ellipse(ax, ay + abRowH * 0.35, 30, abRowH * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sombra inferior em arco do gomo
        ctx.strokeStyle = 'rgba(186, 84, 32, 0.65)';
        ctx.lineWidth = 4.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ax - 28, ay + abRowH * 0.68);
        ctx.quadraticCurveTo(ax, ay + abRowH * 0.85, ax + 28, ay + abRowH * 0.65);
        ctx.stroke();
      }
    }

    // Sombras laterais dos oblíquos/costelas
    ctx.fillStyle = 'rgba(178, 76, 26, 0.45)';
    ctx.beginPath();
    ctx.moveTo(cx - halfChestW, chest.y - 10);
    ctx.quadraticCurveTo(midX - 92, chest.y + 55, cx - halfWaistW, botY);
    ctx.lineTo(cx - halfWaistW - 20, botY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + halfChestW, chest.y - 10);
    ctx.quadraticCurveTo(midX + 92, chest.y + 55, cx + halfWaistW, botY);
    ctx.lineTo(cx + halfWaistW + 20, botY);
    ctx.closePath();
    ctx.fill();

    // Linhas anatômicas definidas em traço marrom-escuro/terracota
    ctx.strokeStyle = '#8c3d16';
    ctx.lineWidth = 4.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Sulco central do esterno e linha alba
    ctx.moveTo(midX, chest.y - 38);
    ctx.lineTo(midX, botY - 8);
    // Curva inferior do peitoral esquerdo
    ctx.moveTo(cx - halfChestW + 18, chest.y - 16);
    ctx.bezierCurveTo(midX - 115, pecBottomY + 18, midX - 42, pecBottomY + 16, midX, pecBottomY - 6);
    // Curva inferior do peitoral direito
    ctx.moveTo(cx + halfChestW - 18, chest.y - 16);
    ctx.bezierCurveTo(midX + 115, pecBottomY + 18, midX + 42, pecBottomY + 16, midX, pecBottomY - 6);
    ctx.stroke();

    if (showBareNeck) {
      // Linhas das clavículas e esternocleidomastoideo (visíveis em nocape)
      ctx.strokeStyle = '#9e471c';
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(cx - 48, topY + 12);
      ctx.quadraticCurveTo(cx - 28, topY + 52, midX - 8, topY + 68);
      ctx.moveTo(cx + 48, topY + 12);
      ctx.quadraticCurveTo(cx + 28, topY + 52, midX + 8, topY + 68);
      ctx.moveTo(cx - 110, topY + 62);
      ctx.quadraticCurveTo(midX - 55, topY + 76, midX - 6, topY + 70);
      ctx.moveTo(cx + 110, topY + 62);
      ctx.quadraticCurveTo(midX + 55, topY + 76, midX + 6, topY + 70);
      ctx.stroke();

      // Corte escuro elíptico no topo do pescoço (como em hero-part-body-tpose-nocape.png)
      ctx.strokeStyle = '#1a0b06';
      ctx.lineWidth = 6.0;
      ctx.beginPath();
      ctx.moveTo(cx - 65, topY + 2);
      ctx.quadraticCurveTo(cx, topY + 6, cx + 65, topY + 2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }
}
