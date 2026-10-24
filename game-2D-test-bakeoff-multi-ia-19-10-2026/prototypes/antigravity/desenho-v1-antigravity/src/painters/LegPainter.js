// ============================================================================
// LegPainter.js & BootPainter.js — Coxas Musculosas e Botas Colossais de Couro
// Articulados por hip -> knee -> ankle -> footSole.
// ============================================================================

export class LegPainter {
  constructor(materials) {
    this.mat = materials;
  }

  paint(ctx, legPose, side = 'L', scale = 1.0) {
    const { hip, knee } = legPose;
    const isLeft = side === 'L';
    const dx = knee.x - hip.x;
    const dy = knee.y - hip.y;
    const len = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(hip.x, hip.y);
    ctx.rotate(ang);

    const rHip = 74 * scale;
    const rKnee = 64 * scale;

    const thighPath = new Path2D();
    thighPath.moveTo(-20 * scale, -rHip);
    thighPath.bezierCurveTo(len * 0.35, -rHip * 1.06, len * 0.75, -rKnee * 1.04, len + 28 * scale, -rKnee * 0.94);
    thighPath.lineTo(len + 28 * scale, rKnee * 0.94);
    thighPath.bezierCurveTo(len * 0.75, rKnee * 1.04, len * 0.35, rHip * 1.06, -20 * scale, rHip);
    thighPath.closePath();

    this.mat.paintSkinPath(ctx, thighPath, {
      x: -24 * scale,
      y: -rHip * 1.1,
      w: len + 56 * scale,
      h: rHip * 2.2
    }, {
      baseColor: '#f6b47b',
      highlightColor: '#ffd4a6',
      shadowColor: '#dc8044',
      deepShadowColor: '#b35520',
      outlineWidth: 5.5,
      seed: isLeft ? 851 : 852
    });

    // Sombra projetada pelo saiote na parte superior da coxa
    ctx.save();
    ctx.clip(thighPath);
    const sg = ctx.createLinearGradient(0, 0, len * 0.65, 0);
    sg.addColorStop(0.0, 'rgba(138, 48, 14, 0.62)');
    sg.addColorStop(0.55, 'rgba(186, 78, 28, 0.28)');
    sg.addColorStop(1.0, 'rgba(246, 180, 123, 0.0)');
    ctx.fillStyle = sg;
    ctx.fillRect(-25 * scale, -rHip * 1.1, len * 0.7, rHip * 2.2);
    ctx.restore();

    ctx.restore();
  }
}

export class BootPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha a bota colossal de couro escuro com 4 dobras de cano,
   * 2 tiras arqueadas no peito do pé, biqueira arredondada e sola tratorada.
   */
  paint(ctx, legPose, side = 'L', scale = 1.0) {
    const { knee, ankle, footSole } = legPose;
    const isLeft = side === 'L';
    const flipX = isLeft ? 1 : -1;

    // Ângulo da canela/bota (vertical = 0 quando knee está exatamente acima de footSole)
    const dx = footSole.x - knee.x;
    const dy = footSole.y - knee.y;
    const bootH = Math.hypot(dx, dy) || (255 * scale);
    // Na pose neutra, o joelho fica ligeiramente para dentro em relação ao centro da sola
    const naturalDx = (isLeft ? -22 : 22) * scale;
    const rot = Math.atan2(dx - naturalDx, dy) * -0.45;
    const pitch = legPose.footPitch || 0;

    ctx.save();
    ctx.translate(footSole.x, footSole.y);
    ctx.rotate(rot + pitch);
    // No sistema local da bota Esquerda (flipX = 1):
    // x negativo (-215) aponta para FORA (biqueira), x positivo (+125) aponta para DENTRO (calcanhar)
    ctx.scale(scale * flipX, scale);

    const hScale = Math.max(0.82, Math.min(1.18, bootH / (255 * scale)));
    ctx.scale(1.0, hScale);

    // 1. CORPO PRINCIPAL DA BOTA (Cano de 4 dobras abauladas + Peito do pé + Biqueira volumosa)
    const bootBody = new Path2D();
    // Topo do cano (y = -258, largura de x = -92 a +96)
    bootBody.moveTo(-90, -258);
    bootBody.quadraticCurveTo(4, -244, 96, -244);
    // Lateral interna com 3 gomos arredondados do cano + calcanhar robusto
    bootBody.bezierCurveTo(112, -232, 112, -216, 102, -208);
    bootBody.bezierCurveTo(116, -196, 116, -180, 104, -172);
    bootBody.bezierCurveTo(118, -158, 116, -142, 104, -132);
    bootBody.bezierCurveTo(122, -96, 128, -56, 122, -32);
    // Base acima da sola
    bootBody.lineTo(-214, -32);
    // Grande curva arredondada da biqueira (cúpula volumosa para fora)
    bootBody.bezierCurveTo(-228, -82, -202, -132, -144, -144);
    // Subida externa com os 3 gomos abaulados do cano
    bootBody.bezierCurveTo(-136, -156, -134, -168, -116, -174);
    bootBody.bezierCurveTo(-126, -186, -124, -202, -106, -210);
    bootBody.bezierCurveTo(-114, -224, -108, -244, -90, -258);
    bootBody.closePath();

    // Cristas e vincos das 4 dobras horizontais do cano + 2 tiras arqueadas do peito do pé
    const ridges = [
      // Dobra 1 do cano
      Object.assign([-102, -216, 4, -204, 102, -208], { width: 5.8 }),
      // Dobra 2 do cano
      Object.assign([-112, -180, 2, -168, 104, -172], { width: 5.8 }),
      // Dobra 3 do cano
      Object.assign([-124, -146, -4, -132, 104, -134], { width: 6.0 }),
      // Tira arqueada superior do peito do pé
      Object.assign([-146, -138, -18, -116, 114, -76], { width: 6.4 }),
      // Tira arqueada inferior do peito do pé (separa a biqueira)
      Object.assign([-170, -122, -42, -94, 88, -34], { width: 6.6 }),
      // Costura central da biqueira
      Object.assign([-140, -114, -146, -74, -130, -34], { width: 5.0 })
    ];

    const stitches = [
      Object.assign([-92, -244, 4, -232, 94, -232], { width: 2.6 }),
      Object.assign([-102, -206, 4, -194, 98, -196], { width: 2.6 }),
      Object.assign([-114, -170, 0, -158, 98, -160], { width: 2.6 }),
      Object.assign([-160, -114, -36, -86, 80, -36], { width: 2.7 })
    ];

    this.mat.paintDarkLeather(ctx, bootBody, {
      x: -225,
      y: -265,
      w: 355,
      h: 240
    }, {
      baseColor: '#523022',
      highlightColor: '#8f583e',
      edgeHighlight: '#cf8e68',
      shadowColor: '#26140d',
      outlineWidth: 6.2,
      ridges,
      stitches,
      seed: isLeft ? 861 : 862
    });

    // Realce volumétrico extra na cúpula da biqueira
    ctx.save();
    ctx.clip(bootBody);
    const toeGrad = ctx.createRadialGradient(-148, -82, 8, -135, -75, 78);
    toeGrad.addColorStop(0.0, 'rgba(218, 152, 108, 0.42)');
    toeGrad.addColorStop(0.65, 'rgba(156, 94, 62, 0.16)');
    toeGrad.addColorStop(1.0, 'rgba(38, 20, 13, 0.0)');
    ctx.fillStyle = toeGrad;
    ctx.beginPath();
    ctx.arc(-138, -78, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. SOLA TRATORADA GROSSA (y = -36 até 0, largura de -216 a +124)
    const solePath = new Path2D();
    solePath.moveTo(-214, -36);
    solePath.quadraticCurveTo(-45, -32, 122, -34);
    solePath.lineTo(124, -4);
    solePath.quadraticCurveTo(-45, 4, -216, -4);
    solePath.closePath();

    this.mat.paintDarkLeather(ctx, solePath, {
      x: -220,
      y: -40,
      w: 350,
      h: 46
    }, {
      baseColor: '#754630',
      highlightColor: '#b57452',
      edgeHighlight: '#e09f79',
      shadowColor: '#361d12',
      outlineWidth: 6.0,
      ridges: [
        // Linha horizontal da vira da sola
        Object.assign([-212, -20, -45, -16, 120, -18], { width: 4.2 })
      ],
      stitches: [
        Object.assign([-206, -28, -45, -24, 116, -26], { width: 2.6, color: '#e3a682' })
      ],
      seed: isLeft ? 871 : 872
    });

    // Sulcos verticais dos blocos tratorados da sola
    this.mat.strokeArtisanalInk(ctx, (c) => {
      for (const sx of [-138, -62, 24]) {
        c.moveTo(sx, -20);
        c.lineTo(sx, 0);
      }
    }, 5.2, '#170a05', '#361b10');

    ctx.restore();
  }
}
