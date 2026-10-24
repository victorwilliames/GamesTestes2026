// ============================================================================
// ScarfPainter.js & CapePainter.js — Cachecol Vermelho em Dobras e Capa Rasgada
// ============================================================================

export class CapePainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha a capa vermelha assimétrica que esvoaça para a direita da tela
   * (atrás do braço esquerdo do herói) e a pequena aba de tecido sob a axila esquerda.
   */
  paint(ctx, neckBase, scale = 1.0, yaw = 0, flutter = 0) {
    ctx.save();
    ctx.translate(neckBase.x, neckBase.y);
    ctx.scale(scale, scale);

    // 1. Pequena aba vermelha rasgada sob o braço esquerdo (x = -195..-135, y = +145..+295)
    const leftUnderFlap = new Path2D();
    leftUnderFlap.moveTo(-148, 85);
    leftUnderFlap.lineTo(-208, 175);
    leftUnderFlap.lineTo(-182, 185);
    leftUnderFlap.lineTo(-218, 255);
    leftUnderFlap.lineTo(-142, 215);
    leftUnderFlap.closePath();

    this.mat.paintCrimsonCloth(ctx, leftUnderFlap, { x: -225, y: 80, w: 90, h: 185 }, {
      baseColor: '#8f080e',
      highlightColor: '#c41219',
      shadowColor: '#450306',
      outlineWidth: 5.0,
      seed: 1301
    });

    // 2. GRANDE CAPA ASSIMÉTRICA DIREITA COM 6 PONTAS RASGADAS
    // Mesmo quando o personagem gira (yaw), a capa mantém sua natureza física assimétrica no lado direito!
    const fy = flutter * 18;
    const fx = yaw * 16;

    const capePath = new Path2D();
    capePath.moveTo(115, -18);
    // Borda superior ondulada que se projeta para a direita
    capePath.bezierCurveTo(235, 35, 365, 95, 558 + fx, 142 + fy);
    // Ponta 1 (superior extrema direita)
    capePath.lineTo(482 + fx, 162 + fy);
    // Ponta 2 (longa direita)
    capePath.bezierCurveTo(535 + fx, 195 + fy, 578 + fx, 238 + fy, 598 + fx, 282 + fy);
    capePath.lineTo(492 + fx, 248 + fy);
    // Ponta 3 (média-inferior direita)
    capePath.bezierCurveTo(525 + fx, 288 + fy, 545 + fx, 332 + fy, 535 + fx, 378 + fy);
    capePath.lineTo(445 + fx, 315 + fy);
    // Ponta 4 (inferior longa)
    capePath.bezierCurveTo(475 + fx, 365 + fy, 492 + fx, 405 + fy, 495 + fx, 442 + fy);
    capePath.lineTo(395 + fx, 365 + fy);
    // Ponta 5 (interna inferior)
    capePath.lineTo(412 + fx, 418 + fy);
    capePath.lineTo(325 + fx * 0.7, 338 + fy * 0.7);
    // Ponta 6 (junto ao quadril direito)
    capePath.lineTo(318 + fx * 0.5, 385 + fy * 0.5);
    capePath.bezierCurveTo(245, 315, 175, 225, 115, 125);
    capePath.closePath();

    const folds = [
      Object.assign([165, 25, 345, 105, 535 + fx, 152 + fy], { width: 5.5 }),
      Object.assign([155, 55, 355, 165, 565 + fx, 265 + fy], { width: 6.0 }),
      Object.assign([145, 85, 325, 225, 515 + fx, 355 + fy], { width: 6.0 }),
      Object.assign([135, 115, 285, 265, 465 + fx, 415 + fy], { width: 5.8 })
    ];

    this.mat.paintCrimsonCloth(ctx, capePath, {
      x: 110,
      y: -25,
      w: 510,
      h: 480
    }, {
      baseColor: '#c91017',
      highlightColor: '#f22424',
      shadowColor: '#630409',
      deepFoldColor: '#2b0103',
      outlineWidth: 6.0,
      folds,
      seed: 1302
    });

    ctx.restore();
  }
}

export class ScarfPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha o cachecol vermelho volumoso enrolado no pescoço e ombros,
   * com dobras arredondadas e sobrepostas (hero-part-body.png y=220..405).
   */
  paint(ctx, neckBase, scale = 1.0, yaw = 0) {
    const shiftX = yaw * 16;
    ctx.save();
    ctx.translate(neckBase.x, neckBase.y);
    ctx.scale(scale, scale);

    // Silhueta externa do cachecol com dobras arredondadas e volumosas (não serrilhadas)
    const scarfPath = new Path2D();
    // Topo esquerdo da gola alta (que abraça o queixo)
    scarfPath.moveTo(-195 + shiftX * 0.3, -98);
    scarfPath.bezierCurveTo(-95 + shiftX * 0.5, -54, 75 + shiftX * 0.5, -58, 195 + shiftX * 0.3, -112);
    // Dobra superior direita arredondada
    scarfPath.bezierCurveTo(235, -115, 256, -92, 232, -68);
    // Dobra lateral direita 2 (abaulada)
    scarfPath.bezierCurveTo(268, -62, 286, -34, 252, -14);
    // Dobra lateral direita 3 (une com a capa)
    scarfPath.bezierCurveTo(292, -6, 312, 22, 275, 34);
    // Borda inferior em V arredondado e pesado sobre o peitoral
    scarfPath.bezierCurveTo(195, 52, 105, 68, 4 + shiftX, 82);
    scarfPath.bezierCurveTo(-95, 64, -182, 34, -248, -2);
    // Dobra lateral esquerda inferior
    scarfPath.bezierCurveTo(-272, -14, -264, -36, -238, -42);
    // Dobra lateral esquerda superior
    scarfPath.bezierCurveTo(-274, -56, -258, -88, -195 + shiftX * 0.3, -98);
    scarfPath.closePath();

    // Vincos internos profundos e curvos das 5 dobras sobrepostas do cachecol
    const folds = [
      // Vinco da gola superior
      Object.assign([-188, -74, 12 + shiftX * 0.5, -24, 218, -76], { width: 6.4 }),
      // Vinco diagonal principal 1 (da esquerda para a direita)
      Object.assign([-228, -42, -12 + shiftX * 0.5, 4, 248, -32], { width: 6.8 }),
      // Vinco diagonal 2 (cruzado da direita para o centro-esquerda)
      Object.assign([-168, -4, 42 + shiftX * 0.5, 28, 265, 2], { width: 6.4 }),
      // Vinco inferior acima da ponta central do cachecol
      Object.assign([-118, 28, 6 + shiftX * 0.5, 54, 162, 24], { width: 6.0 })
    ];

    this.mat.paintCrimsonCloth(ctx, scarfPath, {
      x: -275,
      y: -125,
      w: 590,
      h: 215
    }, {
      baseColor: '#d4131a',
      highlightColor: '#ff3030',
      shadowColor: '#69050a',
      deepFoldColor: '#2e0103',
      outlineWidth: 6.2,
      folds,
      seed: 1303
    });

    // Luzes volumétricas nas cristas das dobras do cachecol
    ctx.save();
    ctx.clip(scarfPath);
    ctx.strokeStyle = 'rgba(255, 92, 82, 0.38)';
    ctx.lineWidth = 8.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-165, -56);
    ctx.quadraticCurveTo(10 + shiftX * 0.5, -12, 195, -52);
    ctx.moveTo(-195, -22);
    ctx.quadraticCurveTo(-5 + shiftX * 0.5, 18, 215, -14);
    ctx.moveTo(-115, 14);
    ctx.quadraticCurveTo(15 + shiftX * 0.5, 40, 155, 16);
    ctx.stroke();
    ctx.restore();

    // Sombra escura na cavidade superior do pescoço (onde encaixa o queixo)
    const neckWell = new Path2D();
    neckWell.moveTo(-148 + shiftX * 0.4, -80);
    neckWell.quadraticCurveTo(10 + shiftX * 0.5, -40, 168 + shiftX * 0.4, -92);
    neckWell.quadraticCurveTo(15 + shiftX * 0.5, -62, -148 + shiftX * 0.4, -80);
    neckWell.closePath();
    ctx.fillStyle = '#330204';
    ctx.fill(neckWell);

    ctx.restore();
  }
}

