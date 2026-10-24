/**
 * head.js - Renderizador da Cabeça Chibi (Red-Haired Knight)
 * Baseado com precisão milimétrica em ref/novo-heroi/cabeca-ref.png e prancha-turnaround-poses.png
 */

if (typeof require !== 'undefined') {
  const inkModule = require('./ink.js');
  PALETTE = inkModule.PALETTE;
  Ink = inkModule.Ink;
}

const HeadRenderer = {
  /**
   * Renderiza a cabeça do herói chibi em 8 direções com cabelo fofo escarlate em gomos arredondados
   */
  draw(ctx, screenPos, facingAngle = 0, camYaw = 45 * Math.PI / 180, scale = 1.0) {
    let relAngle = (facingAngle - camYaw) % (Math.PI * 2);
    if (relAngle < 0) relAngle += Math.PI * 2;

    const r = 17 * scale; // Raio da cabeça chibi
    const cx = screenPos.x;
    const cy = screenPos.y;

    const cosRel = Math.cos(relAngle);
    const sinRel = Math.sin(relAngle);
    const isBack = cosRel < -0.3; // Costas (135° a 225°)
    const isProfile = Math.abs(sinRel) > 0.7; // Perfil puro (90° e 270°)

    ctx.save();

    // 1. Cabelo Traseiro (volume de fundo)
    this.drawHairBack(ctx, cx, cy, r, relAngle);

    // 2. Orelhas (desenhadas antes do rosto para ficarem na lateral)
    if (!isBack) {
      this.drawEars(ctx, cx, cy, r, relAngle);
    }

    // 3. Pele do Rosto (redondinha e fofa)
    if (!isBack) {
      this.drawChibiFace(ctx, cx, cy, r, sinRel, cosRel);
      this.drawChibiFeatures(ctx, cx, cy, r, relAngle);
    } else {
      // Se de costas, crânio coberto pelas mechas posteriores
      this.drawBackSkull(ctx, cx, cy, r);
    }

    // 4. Mechas Frontais e Superiores (Gomos fofos em nuvem)
    this.drawHairFront(ctx, cx, cy, r, relAngle);

    ctx.restore();
  },

  /**
   * Orelhas arredondadas estilizadas
   */
  drawEars(ctx, cx, cy, r, relAngle) {
    const pal = PALETTE;
    const sinRel = Math.sin(relAngle);
    const earY = cy + r * 0.15;

    // Orelha Esquerda
    if (sinRel > -0.5) {
      const earLX = cx - r * 0.92;
      ctx.beginPath();
      ctx.arc(earLX, earY, r * 0.26, 0, Math.PI * 2);
      ctx.fillStyle = pal.skinBase;
      ctx.fill();
      ctx.strokeStyle = pal.armorOutline;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(earLX + 1, earY, r * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = pal.skinShadow;
      ctx.fill();
    }

    // Orelha Direita
    if (sinRel < 0.5) {
      const earRX = cx + r * 0.92;
      ctx.beginPath();
      ctx.arc(earRX, earY, r * 0.26, 0, Math.PI * 2);
      ctx.fillStyle = pal.skinBase;
      ctx.fill();
      ctx.strokeStyle = pal.armorOutline;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(earRX - 1, earY, r * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = pal.skinShadow;
      ctx.fill();
    }
  },

  /**
   * Cabelo posterior e tufos volumosos de fundo
   */
  drawHairBack(ctx, cx, cy, r, relAngle) {
    const pal = PALETTE;
    const shiftX = Math.sin(relAngle) * (r * 0.2);

    // Gomos de cabelo posteriores (tufos arredondados fofos)
    const backLobes = [
      { ox: -r * 0.85, oy: -r * 0.2, rad: r * 0.55 },
      { ox: r * 0.85, oy: -r * 0.2, rad: r * 0.55 },
      { ox: -r * 0.6, oy: -r * 0.9, rad: r * 0.6 },
      { ox: r * 0.6, oy: -r * 0.9, rad: r * 0.6 },
      { ox: 0, oy: -r * 1.05, rad: r * 0.65 }
    ];

    for (const lobe of backLobes) {
      ctx.beginPath();
      ctx.arc(cx + lobe.ox - shiftX * 0.5, cy + lobe.oy, lobe.rad, 0, Math.PI * 2);
      ctx.fillStyle = pal.hairShadow;
      ctx.fill();
      ctx.strokeStyle = pal.hairOutline;
      ctx.lineWidth = 2.0;
      ctx.stroke();
    }
  },

  /**
   * Crânio visto de costas (180°)
   */
  drawBackSkull(ctx, cx, cy, r) {
    const pal = PALETTE;
    // Base da nuca
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.2, r * 0.85, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.hairShadow;
    ctx.fill();
    ctx.strokeStyle = pal.hairOutline;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3 Gomos grandes e redondos no meio da cabeça de costas
    const midLobes = [
      { ox: -r * 0.45, oy: cy + r * 0.05, rad: r * 0.45 },
      { ox: r * 0.45, oy: cy + r * 0.05, rad: r * 0.45 },
      { ox: 0, oy: cy - r * 0.2, rad: r * 0.52 }
    ];
    for (const lobe of midLobes) {
      ctx.beginPath();
      ctx.arc(cx + lobe.ox, lobe.oy, lobe.rad, 0, Math.PI * 2);
      ctx.fillStyle = pal.hairMain;
      ctx.fill();
      ctx.strokeStyle = pal.hairOutline;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  },

  /**
   * Rosto Chibi fofo e redondo
   */
  drawChibiFace(ctx, cx, cy, r, sinRel, cosRel) {
    const pal = PALETTE;
    const chinShift = sinRel * (r * 0.25);

    // Contorno do rosto suave, bochechas fofas e queixo redondo
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.82, cy - r * 0.1);
    // Bochecha esquerda
    ctx.bezierCurveTo(cx - r * 0.95, cy + r * 0.5, cx + chinShift - r * 0.5, cy + r * 0.98, cx + chinShift, cy + r * 1.02);
    // Bochecha direita
    ctx.bezierCurveTo(cx + chinShift + r * 0.5, cy + r * 0.98, cx + r * 0.95, cy + r * 0.5, cx + r * 0.82, cy - r * 0.1);
    ctx.closePath();

    ctx.fillStyle = pal.skinBase;
    ctx.fill();

    // Sombreamento cel-shading suave no queixo
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(cx + chinShift, cy + r * 0.95, r * 0.7, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.skinShadow;
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = pal.skinOutline;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Blush suave e fofo nas bochechas
    ctx.fillStyle = pal.skinBlush;
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.48 + chinShift * 0.5, cy + r * 0.42, r * 0.22, r * 0.14, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.48 + chinShift * 0.5, cy + r * 0.42, r * 0.22, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  /**
   * Olhos verticais ovais escuros, sobrancelhas e boca
   */
  drawChibiFeatures(ctx, cx, cy, r, relAngle) {
    const pal = PALETTE;
    const sinRel = Math.sin(relAngle);
    const cosRel = Math.cos(relAngle);

    // Centro focal dos traços
    const faceCenterX = cx + sinRel * (r * 0.38);
    const eyeSpacing = r * 0.42 * Math.max(0.18, cosRel);

    const eyeLeftX = faceCenterX - eyeSpacing;
    const eyeRightX = faceCenterX + eyeSpacing;
    const eyeY = cy + r * 0.22;

    const eyeW = Math.max(2.2, r * 0.16 * Math.max(0.3, cosRel));
    const eyeH = r * 0.28;

    // Olho Esquerdo (oval vertical escuro café)
    if (eyeLeftX > cx - r * 0.85 && eyeLeftX < cx + r * 0.85) {
      ctx.beginPath();
      ctx.ellipse(eyeLeftX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fillStyle = pal.eyes;
      ctx.fill();

      // Ponto de brilho/vida no canto superior do olho
      ctx.beginPath();
      ctx.arc(eyeLeftX - eyeW * 0.3, eyeY - eyeH * 0.35, eyeW * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Sobrancelha vermelha expressiva acima do olho esquerdo
      ctx.strokeStyle = pal.eyebrows;
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(eyeLeftX - eyeW * 1.3, eyeY - eyeH * 1.05);
      ctx.lineTo(eyeLeftX + eyeW * 0.9, eyeY - eyeH * 0.85);
      ctx.stroke();
    }

    // Olho Direito
    if (eyeRightX > cx - r * 0.85 && eyeRightX < cx + r * 0.85) {
      ctx.beginPath();
      ctx.ellipse(eyeRightX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fillStyle = pal.eyes;
      ctx.fill();

      // Ponto de brilho
      ctx.beginPath();
      ctx.arc(eyeRightX - eyeW * 0.3, eyeY - eyeH * 0.35, eyeW * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Sobrancelha vermelha
      ctx.strokeStyle = pal.eyebrows;
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(eyeRightX - eyeW * 0.9, eyeY - eyeH * 0.85);
      ctx.lineTo(eyeRightX + eyeW * 1.3, eyeY - eyeH * 1.05);
      ctx.stroke();
    }

    // Nariz: pontinho discreto no estilo chibi
    ctx.fillStyle = pal.skinShadow;
    ctx.beginPath();
    ctx.arc(faceCenterX, cy + r * 0.48, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Boca: traço sutil e determinado
    ctx.strokeStyle = pal.eyes;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(faceCenterX - r * 0.12, cy + r * 0.68);
    ctx.lineTo(faceCenterX + r * 0.12, cy + r * 0.68);
    ctx.stroke();
  },

  /**
   * Cabelo Frontal: Gomos fofos escarlates (nuvem de cachos com mechas curvas)
   */
  drawHairFront(ctx, cx, cy, r, relAngle) {
    const pal = PALETTE;
    const sinRel = Math.sin(relAngle);
    const shift = sinRel * (r * 0.22);

    // 1. Tufos superiores fofos (Cluster de gomos que dão o formato da coroa)
    const topClusters = [
      { ox: -r * 0.55 + shift * 0.4, oy: -r * 0.85, rad: r * 0.48 },
      { ox: 0 + shift * 0.5, oy: -r * 1.05, rad: r * 0.56 },
      { ox: r * 0.55 + shift * 0.6, oy: -r * 0.85, rad: r * 0.48 },
      { ox: r * 0.9 + shift * 0.7, oy: -r * 0.5, rad: r * 0.42 }
    ];

    for (const tuft of topClusters) {
      ctx.beginPath();
      ctx.arc(cx + tuft.ox, cy + tuft.oy, tuft.rad, 0, Math.PI * 2);
      ctx.fillStyle = pal.hairMain;
      ctx.fill();

      // Realce de luz no topo do tufo
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      ctx.arc(cx + tuft.ox, cy + tuft.oy - tuft.rad * 0.35, tuft.rad * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = pal.hairHighlight;
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = pal.hairOutline;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    // 2. Franja frontal fofa e ondulada (cobre a testa com gomos arredondados, não pontiagudos!)
    const bangs = [
      // Mecha esquerda lateral
      {
        start: { x: cx - r * 0.9, y: cy - r * 0.2 },
        cp1: { x: cx - r * 0.95 + shift, y: cy + r * 0.15 },
        end: { x: cx - r * 0.55 + shift, y: cy + r * 0.05 },
        rad: r * 0.35
      },
      // Gomo central da franja
      {
        start: { x: cx - r * 0.55 + shift, y: cy + r * 0.05 },
        cp1: { x: cx - r * 0.25 + shift, y: cy + r * 0.20 },
        end: { x: cx + r * 0.1 + shift, y: cy + r * 0.05 },
        rad: r * 0.40
      },
      // Gomo direito da franja
      {
        start: { x: cx + r * 0.1 + shift, y: cy + r * 0.05 },
        cp1: { x: cx + r * 0.45 + shift, y: cy + r * 0.18 },
        end: { x: cx + r * 0.85, y: cy - r * 0.15 },
        rad: r * 0.38
      }
    ];

    for (const b of bangs) {
      ctx.beginPath();
      ctx.moveTo(b.start.x, b.start.y);
      ctx.quadraticCurveTo(b.cp1.x, b.cp1.y, b.end.x, b.end.y);
      ctx.quadraticCurveTo(b.cp1.x, b.cp1.y - 12, b.start.x, b.start.y);
      ctx.closePath();

      ctx.fillStyle = pal.hairMain;
      ctx.fill();

      // Realce de luz
      ctx.strokeStyle = pal.hairHighlight;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.strokeStyle = pal.hairOutline;
      ctx.lineWidth = 2.0;
      ctx.stroke();
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HeadRenderer };
}
