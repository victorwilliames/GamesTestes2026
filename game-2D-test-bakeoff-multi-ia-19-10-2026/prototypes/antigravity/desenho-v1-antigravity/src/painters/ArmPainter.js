// ============================================================================
// ArmPainter.js & HandPainter.js — Braços Musculosos, Braçadeiras em Camadas,
// Correntes Infernais Enroladas nos Antebraços e Mãos com Empunhadura Real.
// Articulados por shoulder -> elbow -> wrist -> handGrip.
// ============================================================================

import { createRNG } from '../materials/MaterialPainter.js';

export class HandPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha o punho fechado completo quando o herói está SEM armas (hero-part-body e tpose).
   */
  paint(ctx, wrist, handGrip, side = 'L', scale = 1.0) {
    this.paintWristAndPalmBack(ctx, wrist, handGrip, side, scale, false);
  }

  /**
   * Camada 1 da mão (desenhada ANTES do cabo da arma quando armado, ou mão completa quando desarmado):
   * Sequência de oclusão: wristBridge -> dorsalLeatherGuard -> gripBack (base da palma) -> fingersBack.
   */
  paintWristAndPalmBack(ctx, wrist, handGrip, side = 'L', scale = 1.0, holdingWeapon = true) {
    const isLeft = side === 'L';
    const dx = handGrip.x - wrist.x;
    const dy = handGrip.y - wrist.y;
    const dist = Math.hypot(dx, dy) || (56 * scale);
    const angle = Math.atan2(dy, dx) - Math.PI * 0.5;
    const flipX = isLeft ? 1 : -1;

    ctx.save();
    ctx.translate(handGrip.x, handGrip.y);
    ctx.rotate(angle);
    ctx.scale(scale * flipX, scale);

    const backY = -Math.max(54, dist / scale + 10);

    // 0. Ponte muscular do punho (garante zero gap entre antebraço e mão)
    const wristBridge = new Path2D();
    wristBridge.moveTo(-42, backY);
    wristBridge.lineTo(42, backY);
    wristBridge.lineTo(48, 8);
    wristBridge.lineTo(-48, 8);
    wristBridge.closePath();
    this.mat.paintSkinPath(ctx, wristBridge, { x: -50, y: backY, w: 100, h: -backY + 12 }, {
      baseColor: '#f5b278',
      highlightColor: '#ffd4a8',
      shadowColor: '#d97c40',
      deepShadowColor: '#b0521d',
      outlineWidth: 4.8,
      seed: isLeft ? 905 : 906
    });

    // 1. Aba de couro escuro que protege o dorso da mão e conecta na braçadeira
    const guardPath = new Path2D();
    guardPath.moveTo(-54, backY + 8);
    guardPath.quadraticCurveTo(0, backY - 4, 54, backY + 10);
    guardPath.bezierCurveTo(64, backY + 34, 62, -4, 54, 18);
    guardPath.quadraticCurveTo(18, -10, -18, -8);
    guardPath.quadraticCurveTo(-48, 10, -58, 16);
    guardPath.closePath();

    this.mat.paintDarkLeather(ctx, guardPath, { x: -62, y: backY - 6, w: 128, h: -backY + 30 }, {
      outlineWidth: 5.5,
      ridges: [
        Object.assign([-48, backY + 24, 0, backY + 16, 48, backY + 26], { width: 4.5 })
      ],
      seed: isLeft ? 911 : 912
    });

    // Rebites metálicos escuros no protetor de dorso da luva
    ctx.fillStyle = '#c97a48';
    ctx.strokeStyle = '#1a0804';
    ctx.lineWidth = 2.2;
    for (const rx of [-32, 0, 32]) {
      ctx.beginPath();
      ctx.arc(rx, backY + 14, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (holdingWeapon) {
      // 2. gripBack: Base posterior da palma (eminência tenar/hipotenar atrás do cabo)
      const palmBack = new Path2D();
      palmBack.moveTo(-52, -10);
      palmBack.bezierCurveTo(-62, 10, -56, 34, -36, 42);
      palmBack.bezierCurveTo(-12, 48, 22, 44, 44, 30);
      palmBack.bezierCurveTo(56, 18, 56, -2, 46, -12);
      palmBack.closePath();

      this.mat.paintSkinPath(ctx, palmBack, { x: -62, y: -14, w: 120, h: 64 }, {
        baseColor: '#d98248',
        highlightColor: '#f2a872',
        shadowColor: '#ad5522',
        deepShadowColor: '#783210',
        outlineWidth: 5.0,
        seed: isLeft ? 915 : 916
      });

      // 3. fingersBack: Pontas posteriores dos dedos fechando por trás do cabo (em sombra profunda)
      const fingersBack = new Path2D();
      fingersBack.moveTo(-38, 28);
      fingersBack.bezierCurveTo(-30, 50, 18, 52, 36, 34);
      fingersBack.bezierCurveTo(24, 18, -22, 18, -38, 28);
      fingersBack.closePath();
      ctx.fillStyle = '#8c3b16';
      ctx.fill(fingersBack);
      this.mat.strokeArtisanalInk(ctx, fingersBack, 4.2, '#1c0904', '#38160c');
    } else {
      // Quando desarmado (hero-part-body / tpose), desenha o punho fechado completo
      const fistPath = new Path2D();
      fistPath.moveTo(-56, -14);
      fistPath.bezierCurveTo(-72, 12, -68, 48, -40, 60);
      fistPath.bezierCurveTo(-18, 68, 10, 66, 32, 56);
      fistPath.bezierCurveTo(58, 46, 66, 18, 52, -10);
      fistPath.bezierCurveTo(24, -28, -24, -28, -56, -14);
      fistPath.closePath();

      this.mat.paintSkinPath(ctx, fistPath, { x: -72, y: -28, w: 140, h: 98 }, {
        baseColor: '#f7b880',
        highlightColor: '#ffd9b0',
        shadowColor: '#de8346',
        deepShadowColor: '#b85a22',
        outlineWidth: 5.8,
        seed: isLeft ? 921 : 922
      });

      ctx.save();
      ctx.clip(fistPath);
      ctx.fillStyle = 'rgba(178, 72, 24, 0.56)';
      ctx.beginPath();
      ctx.ellipse(4, 16, 38, 17, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      this.mat.strokeArtisanalInk(ctx, (c) => {
        c.moveTo(16, -8);
        c.bezierCurveTo(-10, -6, -26, 14, -14, 32);
        c.bezierCurveTo(2, 42, 28, 34, 38, 14);
        c.moveTo(-30, 20);
        c.quadraticCurveTo(-26, 44, -20, 58);
        c.moveTo(-4, 24);
        c.quadraticCurveTo(-2, 46, 4, 58);
        c.moveTo(20, 20);
        c.quadraticCurveTo(24, 40, 28, 52);
      }, 4.5, '#240f08', '#4a2315');
    }

    ctx.restore();
  }

  /**
   * Camada 2 da mão (desenhada DEPOIS do cabo da arma quando armado):
   * Sequência: Sombra de Contato no Cabo -> 4 Dedos Articulados Individuais (fingersFront)
   * com nós (knuckles) e dobras -> Polegar Oposto em Trava (thumb) -> Lábio de Oclusão da Guarda.
   */
  paintClenchedFingersOverHilt(ctx, wrist, handGrip, weaponPose, side = 'L', scale = 1.0) {
    const isLeft = side === 'L';
    const flipX = isLeft ? 1 : -1;
    const wRot = weaponPose ? (weaponPose.rotation || 0) : 0;
    // Alinha os dedos exatamente com o eixo do cabo da arma (inclinado a ~35° no espaço local)
    const hiltAxisAngle = wRot + (isLeft ? 0.58 : -0.58);

    ctx.save();
    ctx.translate(handGrip.x, handGrip.y);
    ctx.rotate(hiltAxisAngle);
    ctx.scale(scale * flipX, scale);

    // 1. Sombra de contato densa projetada pelos dedos e polegar sobre o couro do cabo
    ctx.fillStyle = 'rgba(14, 4, 2, 0.68)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 58, 34, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // 2. 4 DEDOS INDIVIDUAIS ESCULPIDOS ENVOLVENDO O CABO (Mindinho -> Anelar -> Médio -> Indicador)
    // Desenhamos do mindinho (x mais negativo, perto do pomo) até o indicador (x mais positivo, junto à guarda)
    // para que a sobreposição anatômica natural dos dedos curvados fique 100% correta!
    const fingerSpecs = [
      // Mindinho (Pinky)
      { cx: -35, topY: -8, botY: 40, w: 23, tilt: -0.08, seed: 931, knuckleY: 4 },
      // Anelar (Ring)
      { cx: -13, topY: -15, botY: 46, w: 25, tilt: -0.03, seed: 932, knuckleY: 0 },
      // Médio (Middle — mais longo e volumoso)
      { cx: 11,  topY: -18, botY: 48, w: 26, tilt: 0.02,  seed: 933, knuckleY: -2 },
      // Indicador (Index — trava junto ao colar da guarda)
      { cx: 34,  topY: -14, botY: 43, w: 25, tilt: 0.06,  seed: 934, knuckleY: 1 }
    ];

    for (let i = 0; i < fingerSpecs.length; i++) {
      const f = fingerSpecs[i];
      const hw = f.w * 0.5;
      const skew = f.tilt * 18;

      // Sombra lateral entre um dedo e o anterior
      if (i > 0) {
        ctx.fillStyle = 'rgba(28, 9, 4, 0.52)';
        ctx.beginPath();
        ctx.ellipse(f.cx - hw - 1, (f.topY + f.botY) * 0.5, 6, (f.botY - f.topY) * 0.46, f.tilt, 0, Math.PI * 2);
        ctx.fill();
      }

      const fPath = new Path2D();
      fPath.moveTo(f.cx - hw, f.topY + 8);
      // Topo arredondado da falange proximal/média dobrando sobre a borda superior do cabo
      fPath.bezierCurveTo(f.cx - hw * 0.8, f.topY - 6, f.cx + hw * 0.8, f.topY - 6, f.cx + hw, f.topY + 8);
      // Descida frontal da falange média envolvendo a face externa do cabo
      fPath.bezierCurveTo(f.cx + hw + 3 + skew, (f.topY + f.botY) * 0.5, f.cx + hw + skew, f.botY - 8, f.cx + skew * 0.8, f.botY);
      // Curva inferior onde a ponta do dedo dobra para trás do cabo
      fPath.bezierCurveTo(f.cx - hw + skew, f.botY - 6, f.cx - hw - 2 + skew, (f.topY + f.botY) * 0.5, f.cx - hw, f.topY + 8);
      fPath.closePath();

      this.mat.paintSkinPath(ctx, fPath, {
        x: f.cx - hw - 4,
        y: f.topY - 8,
        w: f.w + 10,
        h: (f.botY - f.topY) + 12
      }, {
        baseColor: '#f7b880',
        highlightColor: '#ffe2be',
        shadowColor: '#dc7e40',
        deepShadowColor: '#a84a18',
        outlineWidth: 5.0,
        seed: f.seed + (isLeft ? 0 : 20)
      });

      // Luz quente no nó do dedo (knuckle highlight) e dobra articular (interphalangeal crease)
      ctx.save();
      ctx.clip(fPath);

      // Brilho volumétrico do nó do dedo
      ctx.fillStyle = 'rgba(255, 238, 214, 0.58)';
      ctx.beginPath();
      ctx.ellipse(f.cx + 1, f.knuckleY, hw * 0.62, 6.5, f.tilt, 0, Math.PI * 2);
      ctx.fill();

      // Dobra transversal da falange (knuckle crease)
      ctx.strokeStyle = 'rgba(148, 56, 18, 0.68)';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f.cx - hw * 0.65, f.knuckleY + 11);
      ctx.quadraticCurveTo(f.cx, f.knuckleY + 14, f.cx + hw * 0.65, f.knuckleY + 10);
      ctx.stroke();

      // Sombra de curvatura inferior (virada para dentro da palma)
      ctx.fillStyle = 'rgba(92, 30, 8, 0.45)';
      ctx.fillRect(f.cx - hw - 4, f.botY - 14, f.w + 12, 18);

      ctx.restore();
    }

    // 3. POLEGAR EM OPOSIÇÃO (thumb) — Fecha por cima da base do indicador e médio, travando o cabo!
    // Sombra projetada pelo polegar sobre os dedos indicador/médio
    ctx.fillStyle = 'rgba(22, 6, 3, 0.55)';
    ctx.beginPath();
    ctx.ellipse(10, -10, 38, 18, -0.18, 0, Math.PI * 2);
    ctx.fill();

    const thumbPath = new Path2D();
    thumbPath.moveTo(14, -34);
    thumbPath.bezierCurveTo(-16, -34, -34, -16, -24, 2);
    thumbPath.bezierCurveTo(-12, 15, 22, 13, 40, -4);
    thumbPath.bezierCurveTo(48, -18, 36, -34, 14, -34);
    thumbPath.closePath();

    this.mat.paintSkinPath(ctx, thumbPath, { x: -34, y: -36, w: 82, h: 54 }, {
      baseColor: '#fac492',
      highlightColor: '#ffe8cc',
      shadowColor: '#e0864a',
      deepShadowColor: '#b55622',
      outlineWidth: 5.2,
      seed: isLeft ? 941 : 942
    });

    // Dobra articular e volume da falange distal do polegar
    ctx.save();
    ctx.clip(thumbPath);
    ctx.fillStyle = 'rgba(255, 240, 218, 0.55)';
    ctx.beginPath();
    ctx.ellipse(8, -18, 18, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(152, 58, 20, 0.65)';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4, -24);
    ctx.quadraticCurveTo(0, -14, 6, -4);
    ctx.stroke();
    ctx.restore();

    // 4. OCLUSÃO DO COLAR DA GUARDA SOBRE A BORDA DO INDICADOR (garante encaixe físico guarda <-> punho)
    const guardLip = new Path2D();
    guardLip.moveTo(42, -26);
    guardLip.quadraticCurveTo(54, -2, 46, 26);
    guardLip.lineTo(54, 22);
    guardLip.quadraticCurveTo(62, -2, 50, -28);
    guardLip.closePath();
    ctx.fillStyle = '#bd4e20';
    ctx.fill(guardLip);
    this.mat.strokeArtisanalInk(ctx, guardLip, 4.0, '#140402', '#330c06');

    ctx.restore();
  }
}

export class ArmPainter {
  constructor(materials) {
    this.mat = materials;
    this.handPainter = new HandPainter(materials);
  }

  /**
   * Desenha um braço completo articulado (ombro -> cotovelo -> pulso -> punho)
   * com deltoide, bíceps, as duas braçadeiras de tiras de couro enroladas,
   * e — quando armado (showChainWraps) — as voltas de Corrente Infernal enroladas nos pulsos/antebraços!
   */
  paint(ctx, armPose, side = 'L', scale = 1.0, showChainWraps = false) {
    const { shoulder, elbow, wrist } = armPose;
    const isLeft = side === 'L';

    // Vetor do braço superior (shoulder -> elbow)
    const uDx = elbow.x - shoulder.x;
    const uDy = elbow.y - shoulder.y;
    const uLen = Math.hypot(uDx, uDy) || 1;
    const uAng = Math.atan2(uDy, uDx);

    // Vetor do antebraço (elbow -> wrist)
    const fDx = wrist.x - elbow.x;
    const fDy = wrist.y - elbow.y;
    const fLen = Math.hypot(fDx, fDy) || 1;
    const fAng = Math.atan2(fDy, fDx);

    // 1. SEGMENTO SUPERIOR DO BRAÇO (Deltoide + Bíceps)
    ctx.save();
    ctx.translate(shoulder.x, shoulder.y);
    ctx.rotate(uAng);

    const rShoulder = 64 * scale;
    const rElbow = 52 * scale;

    const upperArmPath = new Path2D();
    upperArmPath.moveTo(-14 * scale, -rShoulder * 0.96);
    upperArmPath.bezierCurveTo(-rShoulder * 1.05, -rShoulder * 0.85, -rShoulder * 1.05, rShoulder * 0.85, -14 * scale, rShoulder * 0.92);
    upperArmPath.bezierCurveTo(uLen * 0.35, rShoulder * 1.02, uLen * 0.72, rElbow * 1.02, uLen + 18 * scale, rElbow * 0.90);
    upperArmPath.bezierCurveTo(uLen + 36 * scale, rElbow * 0.45, uLen + 36 * scale, -rElbow * 0.45, uLen + 18 * scale, -rElbow * 0.90);
    upperArmPath.bezierCurveTo(uLen * 0.68, -rShoulder * 1.12, uLen * 0.32, -rShoulder * 1.15, -14 * scale, -rShoulder * 0.96);
    upperArmPath.closePath();

    this.mat.paintSkinPath(ctx, upperArmPath, {
      x: -rShoulder * 1.1,
      y: -rShoulder * 1.2,
      w: uLen + rShoulder + 45 * scale,
      h: rShoulder * 2.4
    }, {
      baseColor: '#f7b880',
      highlightColor: '#ffd8ae',
      shadowColor: '#de8448',
      deepShadowColor: '#b85c24',
      outlineWidth: 0,
      seed: isLeft ? 811 : 812
    });

    const upperArmOutline = new Path2D();
    upperArmOutline.moveTo(4 * scale, -rShoulder * 1.02);
    upperArmOutline.bezierCurveTo(uLen * 0.32, -rShoulder * 1.15, uLen * 0.68, -rShoulder * 1.12, uLen + 18 * scale, -rElbow * 0.90);
    upperArmOutline.bezierCurveTo(uLen + 36 * scale, -rElbow * 0.45, uLen + 36 * scale, rElbow * 0.45, uLen + 18 * scale, rElbow * 0.90);
    upperArmOutline.bezierCurveTo(uLen * 0.72, rElbow * 1.02, uLen * 0.35, rShoulder * 1.02, 12 * scale, rShoulder * 0.92);
    this.mat.strokeArtisanalInk(ctx, upperArmOutline, 5.6, '#210d07', '#421d10');

    ctx.strokeStyle = 'rgba(184, 82, 32, 0.58)';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(uLen * 0.16, -rShoulder * 0.38);
    ctx.quadraticCurveTo(uLen * 0.42, 0, uLen * 0.58, rElbow * 0.34);
    ctx.stroke();

    // 2. BRAÇADEIRA SUPERIOR (3 tiras grossas de couro perto do cotovelo)
    const b1Start = uLen * 0.48;
    const b1End = uLen * 1.04;
    const b1W = b1End - b1Start;
    const b1R = rElbow * 1.12;

    const upperBracerPath = new Path2D();
    upperBracerPath.moveTo(b1Start, -b1R * 0.96);
    upperBracerPath.bezierCurveTo(b1Start + b1W * 0.3, -b1R * 1.12, b1Start + b1W * 0.7, -b1R * 1.10, b1End, -b1R * 0.95);
    upperBracerPath.quadraticCurveTo(b1End + 12 * scale, 0, b1End, b1R * 0.95);
    upperBracerPath.bezierCurveTo(b1Start + b1W * 0.7, b1R * 1.10, b1Start + b1W * 0.3, b1R * 1.12, b1Start, b1R * 0.96);
    upperBracerPath.quadraticCurveTo(b1Start - 10 * scale, 0, b1Start, -b1R * 0.96);
    upperBracerPath.closePath();

    const ridges1 = [];
    for (let i = 1; i <= 2; i++) {
      const rx = b1Start + (b1W * i) / 3;
      ridges1.push(Object.assign([rx, -b1R * 1.02, rx + 9 * scale, 0, rx, b1R * 1.02], { width: 5.2 }));
    }

    this.mat.paintDarkLeather(ctx, upperBracerPath, {
      x: b1Start - 12,
      y: -b1R * 1.15,
      w: b1W + 28,
      h: b1R * 2.3
    }, {
      outlineWidth: 5.6,
      ridges: ridges1,
      seed: isLeft ? 821 : 822
    });

    ctx.restore();

    // 3. ANTEBRAÇO + BRAÇADEIRA INFERIOR EM 4 VOLTAS DE COURO + CORRENTES INFERNAIS ENROLADAS
    ctx.save();
    ctx.translate(elbow.x, elbow.y);
    ctx.rotate(fAng);

    const rForearm = 52 * scale;
    const rWrist = 46 * scale;
    const b2Start = fLen * 0.20;
    const b2End = fLen * 1.06;
    const b2W = b2End - b2Start;
    const b2R = rForearm * 1.10;

    // 3A. Elos traseiros da corrente que dão a volta POR TRÁS da braçadeira (oclusão real!)
    if (showChainWraps) {
      this.paintForearmChainWrapsBack(ctx, b2Start, b2W, b2R, rWrist, scale, isLeft);
    }

    const forearmPath = new Path2D();
    forearmPath.moveTo(-16 * scale, -rForearm * 0.92);
    forearmPath.bezierCurveTo(fLen * 0.28, -rForearm * 1.08, fLen * 0.68, -rWrist * 1.04, fLen + 22 * scale, -rWrist * 0.90);
    forearmPath.lineTo(fLen + 22 * scale, rWrist * 0.90);
    forearmPath.bezierCurveTo(fLen * 0.68, rWrist * 1.04, fLen * 0.28, rForearm * 1.08, -16 * scale, rForearm * 0.92);
    forearmPath.closePath();

    this.mat.paintSkinPath(ctx, forearmPath, {
      x: -18 * scale,
      y: -rForearm * 1.12,
      w: fLen + 44 * scale,
      h: rForearm * 2.24
    }, {
      baseColor: '#f7b880',
      highlightColor: '#ffd8ae',
      shadowColor: '#de8448',
      deepShadowColor: '#b85c24',
      outlineWidth: 5.5,
      seed: isLeft ? 831 : 832
    });

    // Braçadeira inferior de couro
    const lowerBracerPath = new Path2D();
    lowerBracerPath.moveTo(b2Start, -b2R * 0.96);
    lowerBracerPath.bezierCurveTo(b2Start + b2W * 0.35, -b2R * 1.12, b2Start + b2W * 0.75, -rWrist * 1.14, b2End, -rWrist * 1.04);
    lowerBracerPath.quadraticCurveTo(b2End + 10 * scale, 0, b2End, rWrist * 1.04);
    lowerBracerPath.bezierCurveTo(b2Start + b2W * 0.75, rWrist * 1.14, b2Start + b2W * 0.35, b2R * 1.12, b2Start, b2R * 0.96);
    lowerBracerPath.quadraticCurveTo(b2Start - 10 * scale, 0, b2Start, -b2R * 0.96);
    lowerBracerPath.closePath();

    const ridges2 = [];
    for (let i = 1; i <= 3; i++) {
      const rx = b2Start + (b2W * i) / 4;
      const rr = b2R - (b2R - rWrist * 1.06) * (i / 4);
      ridges2.push(Object.assign([rx, -rr, rx + 8 * scale, 0, rx, rr], { width: 5.0 }));
    }

    this.mat.paintDarkLeather(ctx, lowerBracerPath, {
      x: b2Start - 12,
      y: -b2R * 1.18,
      w: b2W + 28,
      h: b2R * 2.36
    }, {
      outlineWidth: 5.6,
      ridges: ridges2,
      seed: isLeft ? 841 : 842
    });

    // 3B. Voltas frontais de Corrente Infernal enroladas sobre a braçadeira e pulso (estilo Blades of Chaos!)
    if (showChainWraps) {
      this.paintForearmChainWrapsFront(ctx, b2Start, b2W, b2R, rWrist, scale, isLeft);
    }

    ctx.restore();
  }

  /**
   * Desenha as bordas dos elos que contornam por trás do antebraço/braçadeira.
   */
  paintForearmChainWrapsBack(ctx, b2Start, b2W, b2R, rWrist, scale, isLeft) {
    const wraps = [0.22, 0.54, 0.86];
    for (let w = 0; w < wraps.length; w++) {
      const t = wraps[w];
      const wx = b2Start + b2W * t;
      const rad = (b2R * (1 - t) + rWrist * 1.08 * t);
      const tilt = isLeft ? 0.24 : -0.24;

      for (const sgn of [-1, 1]) {
        ctx.save();
        ctx.translate(wx + sgn * 4 * scale, sgn * (rad + 4 * scale));
        ctx.rotate(tilt);
        ctx.scale(scale, scale);

        const p = new Path2D();
        p.ellipse(0, 0, 16, 8.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1f0b07';
        ctx.fill(p);
        ctx.strokeStyle = '#0d0302';
        ctx.lineWidth = 4.2;
        ctx.stroke(p);
        ctx.restore();
      }
    }
  }

  /**
   * Desenha 3 voltas pesadas de elos individuais de ferro escuro/queimado com brasa
   * cruzando a frente da braçadeira do antebraço + argola de ancoragem no pulso.
   */
  paintForearmChainWrapsFront(ctx, b2Start, b2W, b2R, rWrist, scale, isLeft) {
    const rng = createRNG(isLeft ? 8801 : 8802);
    const wraps = [0.20, 0.52, 0.84];

    for (let w = 0; w < wraps.length; w++) {
      const t = wraps[w];
      const cx = b2Start + b2W * t;
      const spanY = (b2R * (1 - t) + rWrist * 1.06 * t) * 0.94;
      const diagX = (isLeft ? 1 : -1) * 14 * scale;

      // Sombra de contato pesada da volta de corrente sobre o couro da braçadeira
      ctx.strokeStyle = 'rgba(10, 3, 2, 0.72)';
      ctx.lineWidth = 20 * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - diagX, -spanY);
      ctx.quadraticCurveTo(cx + 6 * scale, 0, cx + diagX, spanY);
      ctx.stroke();

      // 3 elos individuais por volta (2 laterais e 1 central aberto/frontal)
      const linkSteps = [-0.72, 0.0, 0.72];
      for (let k = 0; k < linkSteps.length; k++) {
        const u = linkSteps[k];
        const lx = cx + diagX * u + (1 - u * u) * 5 * scale;
        const ly = u * spanY;
        const ang = Math.PI * 0.5 - (isLeft ? 0.22 : -0.22);
        const isFace = k === 1;

        this.paintInfernalWrapLink(ctx, lx, ly, ang, scale * 0.76, isFace, rng);
      }
    }

    // Argola forjada de ancoragem no pulso (wristAnchor) de onde parte a corrente para o pomo da arma
    const shackleX = b2Start + b2W * 0.92;
    const shackleY = (isLeft ? 1 : -1) * rWrist * 0.68;
    this.paintInfernalWrapLink(ctx, shackleX, shackleY, 0.35, scale * 0.88, true, rng, true);
  }

  paintInfernalWrapLink(ctx, x, y, ang, s, isFace, rng, isGlowingAnchor = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(s, s);

    if (isFace) {
      const hw = 24, hh = 15, r = 12;
      const ihw = 9, ihh = 4, ir = 3.5;
      const makeStad = (p, w, h, rad) => {
        p.moveTo(-w + rad, -h);
        p.lineTo(w - rad, -h);
        p.quadraticCurveTo(w, -h, w, -h + rad);
        p.lineTo(w, h - rad);
        p.quadraticCurveTo(w, h, w - rad, h);
        p.lineTo(-w + rad, h);
        p.quadraticCurveTo(-w, h, -w, h - rad);
        p.lineTo(-w, -h + rad);
        p.quadraticCurveTo(-w, -h, -w + rad, -h);
        p.closePath();
      };

      const ring = new Path2D();
      makeStad(ring, hw, hh, r);
      makeStad(ring, ihw, ihh, ir);

      // Ferro escuro queimado com reflexo de brasa/sangue
      const g = ctx.createRadialGradient(-5, -5, 2, 0, 0, 28);
      if (isGlowingAnchor) {
        g.addColorStop(0.0, '#ffd28a');
        g.addColorStop(0.35, '#d9531e');
        g.addColorStop(0.72, '#4a180c');
        g.addColorStop(1.0, '#170503');
      } else {
        g.addColorStop(0.0, '#a86448');
        g.addColorStop(0.32, '#592c1c');
        g.addColorStop(0.70, '#2b120b');
        g.addColorStop(1.0, '#120402');
      }
      ctx.fillStyle = g;
      ctx.fill(ring, 'evenodd');

      // Brilho incandescente laranja-rubro na aresta
      ctx.strokeStyle = isGlowingAnchor ? 'rgba(255, 168, 76, 0.85)' : 'rgba(214, 92, 42, 0.65)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-4, -3, 11, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();

      const outer = new Path2D();
      makeStad(outer, hw, hh, r);
      this.mat.strokeArtisanalInk(ctx, outer, 4.8, '#120302', '#2b0b06');
    } else {
      const rx = 20, ry = 10;
      const link = new Path2D();
      link.moveTo(-rx, 0);
      link.bezierCurveTo(-rx, -ry * 1.2, rx, -ry * 1.2, rx, 0);
      link.bezierCurveTo(rx, ry * 1.2, -rx, ry * 1.2, -rx, 0);
      link.closePath();

      const g = ctx.createLinearGradient(0, -ry, 0, ry);
      g.addColorStop(0.0, '#1a0704');
      g.addColorStop(0.32, '#7d3a22');
      g.addColorStop(0.55, '#c96b42');
      g.addColorStop(0.82, '#3d170c');
      g.addColorStop(1.0, '#120302');
      ctx.fillStyle = g;
      ctx.fill(link);

      if (rng() > 0.4) {
        ctx.fillStyle = 'rgba(175, 20, 6, 0.55)';
        ctx.beginPath();
        ctx.arc((rng() - 0.5) * 12, (rng() - 0.5) * 5, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      this.mat.strokeArtisanalInk(ctx, link, 4.6, '#120302', '#2b0b06');
    }

    ctx.restore();
  }
}
