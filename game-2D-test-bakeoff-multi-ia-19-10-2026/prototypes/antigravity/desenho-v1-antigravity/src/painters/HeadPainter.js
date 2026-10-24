// ============================================================================
// HeadPainter.js — Orquestrador Modular da Cabeça (Cabelo Traseiro + Rosto + Franja)
// ============================================================================

import { FacePainter } from './FacePainter.js';
import { HairPainter } from './HairPainter.js';

export class HeadPainter {
  constructor(materials) {
    this.mat = materials;
    this.facePainter = new FacePainter(materials);
    this.hairPainter = new HairPainter(materials);
  }

  /**
   * Renderiza a cabeça completa no espaço local (1254 × 1254 de hero-part-head.png)
   * ou transformada para o pivô anatômico do pescoço/cabeça no personagem completo.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} transform - { x, y, scaleX, scaleY, rotation, yaw, anchorX, anchorY }
   */
  paint(ctx, transform = {}) {
    const {
      x = 637,
      y = 1132,
      scaleX = 1.0,
      scaleY = 1.0,
      rotation = 0,
      yaw = 0,
      anchorX = 637,
      anchorY = 1132
    } = transform;

    ctx.save();
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-anchorX, -anchorY);

    // 1. Camada traseira de cabelo e pontas da nuca
    this.hairPainter.paintBackHair(ctx, yaw);

    // 2. Orelhas (com escorço de yaw)
    this.facePainter.paintEar(ctx, 'L', yaw);
    this.facePainter.paintEar(ctx, 'R', yaw);

    // 3. Base do rosto chibi, bochechas, queixo e cicatriz na testa
    const facePath = this.facePainter.paintFaceBase(ctx, yaw);

    // 4. Olhos vermelhos, sobrancelhas inclinadas, nariz e boca
    this.facePainter.paintEye(ctx, 'L', yaw);
    this.facePainter.paintEye(ctx, 'R', yaw);
    this.facePainter.paintEyebrowsAndFeatures(ctx, yaw);

    // 5. Sombra projetada da franja sobre a testa
    this.hairPainter.paintForeheadCastShadow(ctx, facePath, yaw);

    // 6. Grandes mechas da coroa, laterais e franja frontal assimétrica
    this.hairPainter.paintMainAndFrontLocks(ctx, yaw);

    ctx.restore();
  }
}
