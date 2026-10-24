// ============================================================================
// ClothPainter.js & AccessoryPainter.js
// Saiote escuro rasgado, faixas vermelhas, cinto, correntes e caveira única.
// ============================================================================

import { createRNG } from '../materials/MaterialPainter.js';

export class ClothPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha o saiote escuro rasgado e as faixas vermelhas pendentes a partir de pelvis.
   */
  paint(ctx, pelvis, scale = 1.0, yaw = 0, legSpread = 0) {
    const shiftX = yaw * 18;
    ctx.save();
    ctx.translate(pelvis.x, pelvis.y);
    ctx.scale(scale, scale);

    // 1. FAIXAS VERMELHAS INTERNAS E CENTRAIS (sob o saiote escuro e entre as pernas)
    const leftSash = new Path2D();
    leftSash.moveTo(-125 + shiftX * 0.5, 18);
    leftSash.lineTo(-28 + shiftX * 0.5, 28);
    leftSash.lineTo(-58 + shiftX * 0.4 - legSpread * 8, 198);
    leftSash.lineTo(-82 + shiftX * 0.4 - legSpread * 8, 172);
    leftSash.lineTo(-108 + shiftX * 0.4 - legSpread * 10, 212);
    leftSash.lineTo(-126 + shiftX * 0.4 - legSpread * 10, 178);
    leftSash.lineTo(-152 + shiftX * 0.4 - legSpread * 12, 195);
    leftSash.closePath();

    this.mat.paintCrimsonCloth(ctx, leftSash, { x: -165, y: 15, w: 150, h: 205 }, {
      outlineWidth: 5.2,
      folds: [
        [-88 + shiftX * 0.4, 42, -102 + shiftX * 0.4, 125, -108 + shiftX * 0.4, 195],
        [-62 + shiftX * 0.4, 45, -72 + shiftX * 0.4, 118, -68 + shiftX * 0.4, 178]
      ],
      seed: 1001
    });

    // Faixa vermelha central longa (entre as pernas)
    const centerSash = new Path2D();
    centerSash.moveTo(-36 + shiftX * 0.6, 32);
    centerSash.lineTo(54 + shiftX * 0.6, 32);
    centerSash.lineTo(68 + shiftX * 0.5, 225);
    centerSash.lineTo(46 + shiftX * 0.5, 205);
    centerSash.lineTo(38 + shiftX * 0.5, 268);
    centerSash.lineTo(14 + shiftX * 0.5, 232);
    centerSash.lineTo(-4 + shiftX * 0.5, 288);
    centerSash.lineTo(-24 + shiftX * 0.5, 215);
    centerSash.lineTo(-42 + shiftX * 0.5, 235);
    centerSash.closePath();

    this.mat.paintCrimsonCloth(ctx, centerSash, { x: -55, y: 30, w: 135, h: 265 }, {
      outlineWidth: 5.4,
      folds: [
        [2 + shiftX * 0.5, 48, 0 + shiftX * 0.5, 155, -4 + shiftX * 0.5, 265],
        [28 + shiftX * 0.5, 52, 34 + shiftX * 0.5, 148, 36 + shiftX * 0.5, 245]
      ],
      seed: 1002
    });

    // 2. PAINEL ESQUERDO DO SAIOTE DE COURO/TECIDO ESCURO RASGADO
    const skirtL = new Path2D();
    skirtL.moveTo(-175, 10);
    skirtL.lineTo(-22 + shiftX * 0.5, 28);
    // Recorte interno que revela a faixa vermelha esquerda
    skirtL.lineTo(-62 + shiftX * 0.4, 155);
    skirtL.lineTo(-92 + shiftX * 0.4, 128);
    skirtL.lineTo(-142 + shiftX * 0.3, 188);
    skirtL.lineTo(-115 - legSpread * 12, 272);
    skirtL.lineTo(-152 - legSpread * 14, 238);
    skirtL.lineTo(-182 - legSpread * 16, 282);
    skirtL.lineTo(-208 - legSpread * 16, 244);
    skirtL.lineTo(-242 - legSpread * 18, 268);
    skirtL.lineTo(-248 - legSpread * 18, 232);
    skirtL.lineTo(-292 - legSpread * 20, 258);
    skirtL.lineTo(-268 - legSpread * 18, 208);
    skirtL.lineTo(-302 - legSpread * 20, 214);
    skirtL.lineTo(-252 - legSpread * 15, 148);
    skirtL.lineTo(-278 - legSpread * 15, 152);
    skirtL.bezierCurveTo(-248, 98, -215, 52, -175, 10);
    skirtL.closePath();

    this.mat.paintDarkLeather(ctx, skirtL, { x: -310, y: 8, w: 300, h: 280 }, {
      baseColor: '#3d241a',
      highlightColor: '#6e4330',
      edgeHighlight: '#ab7052',
      shadowColor: '#1c0f0a',
      outlineWidth: 5.8,
      ridges: [
        Object.assign([-175, 55, -215, 145, -255, 235], { width: 4.5 }),
        Object.assign([-140, 65, -165, 155, -182, 260], { width: 4.5 })
      ],
      seed: 1003
    });

    // Hachuras rústicas de tecido/couro rasgado no painel esquerdo
    this.paintSkirtHatching(ctx, skirtL, -290, 20, 260, 260, 1013);

    // 3. PAINEL DIREITO DO SAIOTE ESCURO RASGADO (com furo triangular e detalhes vermelhos)
    const skirtR = new Path2D();
    skirtR.moveTo(-18 + shiftX * 0.6, 24);
    skirtR.lineTo(175, 10);
    skirtR.bezierCurveTo(215, 52, 248, 98, 282 + legSpread * 15, 156);
    skirtR.lineTo(256 + legSpread * 15, 150);
    skirtR.lineTo(306 + legSpread * 20, 224);
    skirtR.lineTo(272 + legSpread * 18, 214);
    skirtR.lineTo(298 + legSpread * 20, 272);
    skirtR.lineTo(246 + legSpread * 18, 236);
    skirtR.lineTo(234 + legSpread * 16, 268);
    skirtR.lineTo(192 + legSpread * 14, 228);
    skirtR.lineTo(154 + legSpread * 12, 274);
    skirtR.lineTo(128 + legSpread * 10, 246);
    skirtR.lineTo(84 + legSpread * 8, 298);
    skirtR.lineTo(42 + shiftX * 0.5, 175);
    skirtR.lineTo(88 + shiftX * 0.6, 138);
    skirtR.lineTo(-18 + shiftX * 0.6, 98);
    skirtR.closePath();

    this.mat.paintDarkLeather(ctx, skirtR, { x: -25, y: 8, w: 340, h: 295 }, {
      baseColor: '#3d241a',
      highlightColor: '#6e4330',
      edgeHighlight: '#ab7052',
      shadowColor: '#1c0f0a',
      outlineWidth: 5.8,
      ridges: [
        Object.assign([85, 65, 125, 155, 152, 255], { width: 4.5 }),
        Object.assign([155, 55, 205, 145, 255, 235], { width: 4.5 })
      ],
      seed: 1004
    });

    this.paintSkirtHatching(ctx, skirtR, 0, 20, 305, 280, 1014);

    // Detalhe canônico 1: Rasgo triangular no painel direito que deixa ver a pele da coxa (x=+135, y=+185)
    const tearHole = new Path2D();
    tearHole.moveTo(118 + legSpread * 8, 188);
    tearHole.lineTo(144 + legSpread * 8, 166);
    tearHole.lineTo(162 + legSpread * 8, 194);
    tearHole.closePath();
    ctx.fillStyle = '#eb9b64';
    ctx.fill(tearHole);
    this.mat.strokeArtisanalInk(ctx, tearHole, 4.4, '#1a0b06', '#3d1e12');

    // Detalhe canônico 2: Costuras/marcas vermelhas na ponta interna direita do saiote
    ctx.strokeStyle = '#d9161d';
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(64 + legSpread * 6, 224);
    ctx.lineTo(92 + legSpread * 6, 242);
    ctx.moveTo(86 + legSpread * 6, 218);
    ctx.lineTo(68 + legSpread * 6, 248);
    ctx.moveTo(76 + legSpread * 6, 255);
    ctx.lineTo(84 + legSpread * 8, 285);
    ctx.stroke();

    ctx.restore();
  }

  paintSkirtHatching(ctx, clipPath, x, y, w, h, seed) {
    ctx.save();
    ctx.clip(clipPath);
    const rng = createRNG(seed);
    ctx.lineCap = 'round';
    for (let i = 0; i < 48; i++) {
      const sx = x + rng() * w;
      const sy = y + rng() * h;
      const len = 8 + rng() * 16;
      const ang = (i % 2 === 0 ? 0.65 : -0.55) + (rng() - 0.5) * 0.35;
      ctx.strokeStyle = rng() > 0.42
        ? 'rgba(188, 124, 86, 0.28)'
        : 'rgba(20, 9, 5, 0.36)';
      ctx.lineWidth = 1.8 + rng() * 1.8;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class AccessoryPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha as faixas vermelhas laterais da cintura, o cinto de couro escuro,
   * as correntes de bronze envelhecido e a CAVEIRA ÚNICA CENTRAL no cinto frontal.
   */
  paint(ctx, pelvis, scale = 1.0, yaw = 0) {
    const shiftX = yaw * 26;
    ctx.save();
    ctx.translate(pelvis.x, pelvis.y);
    ctx.scale(scale, scale);

    // 1. FAIXAS VERMELHAS VOLUMOSAS NA CINTURA (logo abaixo do cinto de couro)
    const hipSashL = new Path2D();
    hipSashL.moveTo(-162, -16);
    hipSashL.lineTo(-45 + shiftX, -4);
    hipSashL.lineTo(-55 + shiftX, 46);
    hipSashL.lineTo(-195, 58);
    hipSashL.lineTo(-178, 32);
    hipSashL.lineTo(-212, 24);
    hipSashL.closePath();

    const hipSashR = new Path2D();
    hipSashR.moveTo(45 + shiftX, -4);
    hipSashR.lineTo(162, -16);
    hipSashR.lineTo(212, 24);
    hipSashR.lineTo(178, 32);
    hipSashR.lineTo(195, 58);
    hipSashR.lineTo(55 + shiftX, 46);
    hipSashR.closePath();

    this.mat.paintCrimsonCloth(ctx, hipSashL, { x: -215, y: -18, w: 175, h: 80 }, {
      outlineWidth: 5.2,
      folds: [[-188, 16, -125, 12, -62 + shiftX, 18]],
      seed: 1101
    });

    this.mat.paintCrimsonCloth(ctx, hipSashR, { x: 42, y: -18, w: 175, h: 80 }, {
      outlineWidth: 5.2,
      folds: [[62 + shiftX, 18, 125, 12, 188, 16]],
      seed: 1102
    });

    // 2. CINTO DE COURO ESCURO
    const beltPath = new Path2D();
    beltPath.moveTo(-156, -42);
    beltPath.quadraticCurveTo(shiftX, -24, 156, -42);
    beltPath.lineTo(166, 2);
    beltPath.quadraticCurveTo(shiftX, 20, -166, 2);
    beltPath.closePath();

    this.mat.paintDarkLeather(ctx, beltPath, { x: -170, y: -45, w: 340, h: 70 }, {
      baseColor: '#4a2b1e',
      highlightColor: '#825039',
      edgeHighlight: '#c4835f',
      shadowColor: '#21110b',
      outlineWidth: 5.8,
      ridges: [
        Object.assign([-158, -18, shiftX, -2, 158, -18], { width: 4.5 })
      ],
      seed: 1103
    });

    // 3. CORRENTES METÁLICAS PESADAS DE BRONZE ENVELHECIDO NA CINTURA (elos 3D entrelaçados)
    const leftChainArc = [
      { x: -72 + shiftX * 0.7, y: 12, ang: -0.42, type: 'edge' },
      { x: -102 + shiftX * 0.5, y: 26, ang: -0.48, type: 'face' },
      { x: -134 + shiftX * 0.3, y: 44, ang: -0.54, type: 'edge' },
      { x: -166, y: 66, ang: -0.58, type: 'face' },
      { x: -198, y: 90, ang: -0.62, type: 'edge' },
      { x: -224, y: 112, ang: -0.35, type: 'face' },
      // Segunda volta da corrente esquerda
      { x: -192, y: 98, ang: 0.42, type: 'edge' },
      { x: -158, y: 78, ang: 0.48, type: 'face' },
      { x: -124 + shiftX * 0.3, y: 58, ang: 0.44, type: 'edge' },
      { x: -92 + shiftX * 0.5, y: 38, ang: 0.38, type: 'face' }
    ];
    this.paintWaistChain(ctx, leftChainArc, 1200);

    const rightChainArc = [
      { x: 72 + shiftX * 0.7, y: 12, ang: 0.42, type: 'edge' },
      { x: 102 + shiftX * 0.5, y: 26, ang: 0.48, type: 'face' },
      { x: 134 + shiftX * 0.3, y: 44, ang: 0.54, type: 'edge' },
      { x: 166, y: 66, ang: 0.58, type: 'face' },
      { x: 198, y: 90, ang: 0.62, type: 'edge' },
      { x: 224, y: 112, ang: 0.35, type: 'face' },
      // Segunda volta da corrente direita
      { x: 192, y: 98, ang: -0.42, type: 'edge' },
      { x: 158, y: 78, ang: -0.48, type: 'face' },
      { x: 124 + shiftX * 0.3, y: 58, ang: -0.44, type: 'edge' },
      { x: 92 + shiftX * 0.5, y: 38, ang: -0.38, type: 'face' }
    ];
    this.paintWaistChain(ctx, rightChainArc, 1250);

    // 4. FIVELA CENTRAL EM FORMATO DE CAVEIRA CLARA (CAVEIRA ÚNICA NO CINTO FRONTAL)
    this.paintSkullBuckle(ctx, shiftX, 2);

    ctx.restore();
  }

  paintWaistChain(ctx, nodes, seedBase) {
    // 1. Elos abertos vistos de frente ('face')
    nodes.forEach((n, idx) => {
      if (n.type !== 'face') return;
      this.mat.paintBronzeChainLink(ctx, n.x, n.y, 24, 15, n.ang, seedBase + idx);
    });
    // 2. Elos de perfil ('edge') que conectam por dentro dos furos dos elos 'face'
    nodes.forEach((n, idx) => {
      if (n.type !== 'edge') return;
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.ang);
      const bar = new Path2D();
      bar.ellipse(0, 0, 19, 8.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(18, 6, 3, 0.55)';
      ctx.beginPath();
      ctx.ellipse(1, 3, 20, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createLinearGradient(0, -8.5, 0, 8.5);
      g.addColorStop(0.0, '#2e1108');
      g.addColorStop(0.35, '#d98a4e');
      g.addColorStop(0.55, '#ffbe82');
      g.addColorStop(0.85, '#783819');
      g.addColorStop(1.0, '#1f0a05');
      ctx.fillStyle = g;
      ctx.fill(bar);
      this.mat.strokeArtisanalInk(ctx, bar, 4.4, '#170804', '#38180c');
      ctx.restore();
    });
  }

  paintSkullBuckle(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    // Silhueta esculpida da caveira com maçãs do rosto salientes e 4 dentes superiores
    const skullPath = new Path2D();
    // Topo do crânio
    skullPath.moveTo(0, -56);
    skullPath.bezierCurveTo(42, -56, 64, -34, 62, -6);
    // Maçã do rosto direita (zigomático)
    skullPath.bezierCurveTo(76, 4, 78, 24, 62, 34);
    skullPath.bezierCurveTo(52, 40, 44, 38, 38, 42);
    // Dente 4 (direito externo)
    skullPath.lineTo(36, 56);
    skullPath.quadraticCurveTo(28, 62, 20, 56);
    skullPath.lineTo(18, 46);
    // Dente 3 (direito central)
    skullPath.lineTo(16, 58);
    skullPath.quadraticCurveTo(8, 64, 1, 58);
    skullPath.lineTo(0, 46);
    // Dente 2 (esquerdo central)
    skullPath.lineTo(-1, 58);
    skullPath.quadraticCurveTo(-8, 64, -16, 58);
    skullPath.lineTo(-18, 46);
    // Dente 1 (esquerdo externo)
    skullPath.lineTo(-20, 56);
    skullPath.quadraticCurveTo(-28, 62, -36, 56);
    skullPath.lineTo(-38, 42);
    // Maçã do rosto esquerda
    skullPath.bezierCurveTo(-44, 38, -52, 40, -62, 34);
    skullPath.bezierCurveTo(-78, 24, -76, 4, -62, -6);
    skullPath.bezierCurveTo(-64, -34, -42, -56, 0, -56);
    skullPath.closePath();

    // Sombra projetada da caveira sobre o cinto/saiote
    ctx.fillStyle = 'rgba(18, 8, 4, 0.55)';
    ctx.save();
    ctx.translate(0, 6);
    ctx.fill(skullPath);
    ctx.restore();

    // Preenchimento volumétrico de osso envelhecido
    const grad = ctx.createRadialGradient(-8, -22, 8, 0, 0, 76);
    grad.addColorStop(0.0, '#fbf5ec');
    grad.addColorStop(0.45, '#e8d8c1');
    grad.addColorStop(0.82, '#bfa78a');
    grad.addColorStop(1.0, '#8a7055');
    ctx.fillStyle = grad;
    ctx.fill(skullPath);

    // Textura porosa e sombras internas da caveira
    ctx.save();
    ctx.clip(skullPath);

    const pat = this.mat.getProceduralPattern(ctx, 'bone');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.globalAlpha = 0.90;
      ctx.fillRect(-80, -60, 160, 130);
    }

    // Sombra nas têmporas e sob as maçãs do rosto
    ctx.fillStyle = 'rgba(122, 94, 68, 0.48)';
    ctx.beginPath();
    ctx.arc(-54, -8, 22, 0, Math.PI * 2);
    ctx.arc(54, -8, 22, 0, Math.PI * 2);
    ctx.fill();

    // Pequenas fissuras e poros cranianos
    ctx.strokeStyle = 'rgba(92, 68, 48, 0.65)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-26, -48);
    ctx.lineTo(-18, -32);
    ctx.lineTo(-24, -24);
    ctx.moveTo(28, -44);
    ctx.lineTo(20, -28);
    ctx.stroke();

    ctx.restore();

    // Contorno artesanal da caveira
    this.mat.strokeArtisanalInk(ctx, skullPath, 5.5, '#170a05', '#3b2115');

    // Órbitas oculares profundas e inclinadas (expressão ameaçadora)
    const leftSocket = new Path2D();
    leftSocket.moveTo(-48, -6);
    leftSocket.quadraticCurveTo(-30, -14, -14, 2);
    leftSocket.quadraticCurveTo(-18, 20, -36, 18);
    leftSocket.quadraticCurveTo(-50, 14, -48, -6);
    leftSocket.closePath();

    const rightSocket = new Path2D();
    rightSocket.moveTo(48, -6);
    rightSocket.quadraticCurveTo(30, -14, 14, 2);
    rightSocket.quadraticCurveTo(18, 20, 36, 18);
    rightSocket.quadraticCurveTo(50, 14, 48, -6);
    rightSocket.closePath();

    // Borda chanfrada das órbitas
    ctx.strokeStyle = '#7d6249';
    ctx.lineWidth = 4.5;
    ctx.stroke(leftSocket);
    ctx.stroke(rightSocket);

    ctx.fillStyle = '#1a0b06';
    ctx.fill(leftSocket);
    ctx.fill(rightSocket);

    // Cavidade nasal triangular central
    const noseHole = new Path2D();
    noseHole.moveTo(0, 8);
    noseHole.lineTo(-11, 28);
    noseHole.quadraticCurveTo(0, 25, 11, 28);
    noseHole.closePath();
    ctx.fillStyle = '#1a0b06';
    ctx.fill(noseHole);

    // Divisórias dos dentes
    ctx.strokeStyle = '#241008';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(-18, 38);
    ctx.lineTo(-18, 54);
    ctx.moveTo(0, 36);
    ctx.lineTo(0, 54);
    ctx.moveTo(18, 38);
    ctx.lineTo(18, 54);
    ctx.stroke();

    ctx.restore();
  }
}
