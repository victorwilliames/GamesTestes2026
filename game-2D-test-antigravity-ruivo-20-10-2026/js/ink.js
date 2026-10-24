/**
 * ink.js - Pincéis Estilo HQ (Cel-Shading) e Paleta Oficial
 * Baseado estritamente em ref/novo-heroi/SPEC-VISUAL.md
 */

const PALETTE = {
  // Cabelo Escarlate
  hairHighlight: '#F83840',
  hairMain: '#D81828',
  hairShadow: '#A80818',
  hairOutline: '#380000',

  // Pele
  skinBase: '#F8B484',
  skinShadow: '#E88858',
  skinBlush: '#F89878',
  skinOutline: '#3a1a14',

  // Olhos e Traços
  eyes: '#201008',
  eyebrows: '#D81828',

  // Armadura Prateada
  armorLight: '#E0D8D0',
  armorMid: '#B8A8A0',
  armorShadow: '#888080',
  armorCrevice: '#504848',
  armorOutline: '#282020',

  // Tecidos e Adornos
  tunicRed: '#E02030',
  tunicShadow: '#A81020',
  shoulderBow: '#F08020',
  shoulderBowShadow: '#B05010',
  pantsDark: '#502820',
  pantsShadow: '#341812',
  beltLeather: '#482820',
  goldBuckle: '#C09840',
  goldShadow: '#806020',

  // Espada
  swordBlade: '#D0C8C0',
  swordEdge: '#F4F0EC',
  swordShadow: '#787070',
  swordGold: '#C09840',
  swordGoldShadow: '#806020',
  swordGrip: '#482820',
  swordOutline: '#201818',

  // Cenário & FX
  groundBase: '#252a32',
  groundGrid: '#313844',
  groundDecal: '#1c2026',
  stoneLight: '#545f70',
  stoneShadow: '#363d4a',
  treeLeaves: '#2e6b52',
  treeLeavesLight: '#469c76',
  treeTrunk: '#3b2820',
  slashArc: 'rgba(255, 240, 220, 0.85)',
  slashGlow: 'rgba(240, 80, 50, 0.45)',
  spark: '#FFE070'
};

const Ink = {
  palette: PALETTE,

  // Vetor de luz padrão na tela (vindo do alto-esquerda com leve profundidade)
  lightDir: { x: -0.6, y: -0.8 },

  /**
   * Desenha cápsula cel-shaded com contorno escuro e sombra via máscara clip()
   */
  drawCapsule(ctx, p1, p2, radius, baseColor, shadowColor, outlineColor = '#201818', lineWidth = 2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(p1.x, p1.y);
    ctx.rotate(angle);

    // Caminho da cápsula local (de 0 até len)
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineTo(len, -radius);
    ctx.arc(len, 0, radius, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.closePath();

    // Cor base
    ctx.fillStyle = baseColor;
    ctx.fill();

    // Sombra via clip
    if (shadowColor) {
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      // Desloca a sombra para a direita/baixo relativo ao ângulo
      ctx.rect(-radius, 0.1 * radius, len + radius * 2, radius * 2);
      ctx.fillStyle = shadowColor;
      ctx.fill();
      ctx.restore();
    }

    // Contorno escuro
    if (outlineColor && lineWidth > 0) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.restore();
  },

  /**
   * Desenha polígono genérico com cel-shading em camadas
   */
  drawPolygon(ctx, points, baseColor, shadowColor = null, outlineColor = '#201818', lineWidth = 2) {
    if (!points || points.length < 3) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = baseColor;
    ctx.fill();

    if (shadowColor) {
      ctx.save();
      ctx.clip();
      // Deslocamento da luz
      const shiftX = this.lightDir.x * 6;
      const shiftY = this.lightDir.y * 6;
      ctx.beginPath();
      ctx.moveTo(points[0].x - shiftX, points[0].y - shiftY);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x - shiftX, points[i].y - shiftY);
      }
      ctx.closePath();
      ctx.fillStyle = shadowColor;
      ctx.fill();
      ctx.restore();
    }

    if (outlineColor && lineWidth > 0) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.restore();
  },

  /**
   * Desenha círculo estilizado com cel-shading de 2 tons
   */
  drawCircle(ctx, x, y, r, baseColor, shadowColor, outlineColor = '#201818', lineWidth = 2) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = baseColor;
    ctx.fill();

    if (shadowColor) {
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      // Sombra na meia-lua oposta à luz
      ctx.arc(x - this.lightDir.x * (r * 0.4), y - this.lightDir.y * (r * 0.4), r, 0, Math.PI * 2);
      ctx.fillStyle = shadowColor;
      ctx.fill();
      ctx.restore();
    }

    if (outlineColor && lineWidth > 0) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    ctx.restore();
  },

  /**
   * Desenha fita ou faixa ondulante (lenço, laço, pontas de tecido)
   */
  drawRibbon(ctx, points, widths, baseColor, shadowColor, outlineColor = '#201818', lineWidth = 2) {
    if (points.length < 2) return;
    const leftSide = [];
    const rightSide = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const w = widths[i] ?? widths[0];

      let nx = 0, ny = 1;
      if (i < points.length - 1) {
        const dx = points[i + 1].x - p.x;
        const dy = points[i + 1].y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        nx = -dy / len;
        ny = dx / len;
      } else {
        const dx = p.x - points[i - 1].x;
        const dy = p.y - points[i - 1].y;
        const len = Math.hypot(dx, dy) || 1;
        nx = -dy / len;
        ny = dx / len;
      }

      leftSide.push({ x: p.x + nx * w, y: p.y + ny * w });
      rightSide.push({ x: p.x - nx * w, y: p.y - ny * w });
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(leftSide[0].x, leftSide[0].y);
    for (let i = 1; i < leftSide.length; i++) ctx.lineTo(leftSide[i].x, leftSide[i].y);
    for (let i = rightSide.length - 1; i >= 0; i--) ctx.lineTo(rightSide[i].x, rightSide[i].y);
    ctx.closePath();

    ctx.fillStyle = baseColor;
    ctx.fill();

    if (shadowColor) {
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      for (let i = rightSide.length - 1; i >= 0; i--) ctx.lineTo(rightSide[i].x, rightSide[i].y);
      ctx.closePath();
      ctx.fillStyle = shadowColor;
      ctx.fill();
      ctx.restore();
    }

    if (outlineColor && lineWidth > 0) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.restore();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PALETTE, Ink };
}
