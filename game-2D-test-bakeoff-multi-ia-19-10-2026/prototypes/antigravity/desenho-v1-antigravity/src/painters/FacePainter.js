// ============================================================================
// FacePainter.js — Rosto, Orelhas, Olhos Vermelhos, Sobrancelhas e Expressão
// Refinado na Fase F para suavizar o queixo e intensificar os olhos rubi.
// ============================================================================

import { createRNG } from '../materials/MaterialPainter.js';

export class FacePainter {
  constructor(materials) {
    this.mat = materials;
  }

  paintEar(ctx, side, yaw = 0) {
    const isLeft = side === 'L';
    // Em perfil lateral acentuado, a orelha oposta fica oculta atrás do crânio
    if (isLeft && yaw < -0.42) return;
    if (!isLeft && yaw > 0.42) return;

    const shiftX = isLeft ? yaw * 22 : yaw * 16;
    const scaleX = isLeft ? Math.max(0.62, 1 - yaw * 0.28) : Math.max(0.62, 1 + yaw * 0.18);

    ctx.save();
    const anchorX = isLeft ? 385 : 920;
    const anchorY = 945;
    ctx.translate(anchorX + shiftX, anchorY);
    ctx.scale(scaleX, 1);
    ctx.translate(-anchorX, -anchorY);

    const earPath = new Path2D();
    if (isLeft) {
      earPath.moveTo(385, 868);
      earPath.bezierCurveTo(310, 825, 222, 855, 214, 925);
      earPath.bezierCurveTo(208, 995, 275, 1052, 350, 1044);
      earPath.bezierCurveTo(378, 1040, 395, 1028, 402, 1015);
      earPath.closePath();
    } else {
      earPath.moveTo(918, 855);
      earPath.bezierCurveTo(995, 812, 1088, 842, 1098, 912);
      earPath.bezierCurveTo(1106, 985, 1038, 1042, 960, 1034);
      earPath.bezierCurveTo(932, 1030, 912, 1018, 905, 1005);
      earPath.closePath();
    }

    const bounds = isLeft
      ? { x: 210, y: 835, w: 195, h: 215 }
      : { x: 905, y: 825, w: 198, h: 215 };

    this.mat.paintSkinPath(ctx, earPath, bounds, {
      baseColor: '#f6b278',
      highlightColor: '#ffd4a6',
      shadowColor: '#de8245',
      deepShadowColor: '#bd5e26',
      outlineWidth: 6.2,
      innerRimRatio: 0.03,
      seed: isLeft ? 111 : 222
    });

    ctx.save();
    ctx.clip(earPath);

    const conchaPath = new Path2D();
    if (isLeft) {
      conchaPath.moveTo(362, 898);
      conchaPath.bezierCurveTo(305, 865, 252, 895, 255, 948);
      conchaPath.bezierCurveTo(258, 992, 315, 1012, 368, 992);
      conchaPath.closePath();
    } else {
      conchaPath.moveTo(942, 886);
      conchaPath.bezierCurveTo(1002, 852, 1055, 882, 1052, 938);
      conchaPath.bezierCurveTo(1048, 982, 990, 1002, 936, 982);
      conchaPath.closePath();
    }

    const cg = ctx.createLinearGradient(0, 860, 0, 1010);
    cg.addColorStop(0, '#c75e26');
    cg.addColorStop(0.55, '#e08046');
    cg.addColorStop(1, '#eb985e');
    ctx.fillStyle = cg;
    ctx.fill(conchaPath);

    ctx.strokeStyle = '#6e2d12';
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(355, 906);
      ctx.bezierCurveTo(308, 878, 268, 905, 276, 952);
    } else {
      ctx.moveTo(948, 894);
      ctx.bezierCurveTo(998, 866, 1038, 895, 1030, 942);
    }
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  paintFaceBase(ctx, yaw = 0) {
    const faceShift = yaw * 14;
    ctx.save();

    const facePath = new Path2D();
    facePath.moveTo(385 + faceShift * 0.4, 735);
    facePath.bezierCurveTo(
      368 + faceShift * 0.5, 835,
      365 + faceShift * 0.6, 935,
      384 + faceShift * 0.7, 1008
    );
    facePath.bezierCurveTo(
      405 + faceShift * 0.8, 1082,
      498 + faceShift * 0.9, 1128,
      637 + faceShift, 1132
    );
    facePath.bezierCurveTo(
      782 + faceShift * 0.9, 1128,
      888 + faceShift * 0.7, 1078,
      916 + faceShift * 0.5, 1000
    );
    facePath.bezierCurveTo(
      938 + faceShift * 0.4, 925,
      936 + faceShift * 0.3, 820,
      912 + faceShift * 0.2, 720
    );
    facePath.bezierCurveTo(
      840, 610,
      460, 615,
      385 + faceShift * 0.4, 735
    );
    facePath.closePath();

    this.mat.paintSkinPath(ctx, facePath, { x: 365, y: 615, w: 575, h: 520 }, {
      baseColor: '#fabf88',
      highlightColor: '#ffdfb8',
      shadowColor: '#e69054',
      deepShadowColor: '#cc7035',
      outlineWidth: 6.4,
      innerRimRatio: 0.0,
      seed: 333
    });

    ctx.save();
    ctx.clip(facePath);

    // Sombra quente alaranjada na testa superior
    const foreheadGrad = ctx.createLinearGradient(650, 620, 650, 860);
    foreheadGrad.addColorStop(0.0, 'rgba(204, 96, 40, 0.58)');
    foreheadGrad.addColorStop(0.55, 'rgba(232, 134, 72, 0.24)');
    foreheadGrad.addColorStop(1.0, 'rgba(250, 191, 136, 0.0)');
    ctx.fillStyle = foreheadGrad;
    ctx.fillRect(360, 610, 590, 260);

    // Iluminação central quente nas bochechas/nariz e sombra alaranjada suave no contorno inferior
    const jawGrad = ctx.createRadialGradient(
      642 + faceShift, 960, 120,
      642 + faceShift, 985, 315
    );
    jawGrad.addColorStop(0.0, 'rgba(255, 232, 202, 0.36)');
    jawGrad.addColorStop(0.62, 'rgba(250, 191, 136, 0.0)');
    jawGrad.addColorStop(0.88, 'rgba(224, 124, 64, 0.32)');
    jawGrad.addColorStop(1.0, 'rgba(192, 90, 36, 0.52)');
    ctx.fillStyle = jawGrad;
    ctx.fillRect(360, 610, 590, 530);

    // Rubor quente sutil nas bochechas
    for (const [bx, by] of [[442 + faceShift, 986], [852 + faceShift, 976]]) {
      const bg = ctx.createRadialGradient(bx, by, 6, bx, by, 68);
      bg.addColorStop(0, 'rgba(236, 120, 66, 0.34)');
      bg.addColorStop(1, 'rgba(236, 120, 66, 0.0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bx, by, 68, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cicatriz sutil na testa direita
    ctx.strokeStyle = 'rgba(255, 228, 198, 0.58)';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(758 + faceShift, 742);
    ctx.quadraticCurveTo(788 + faceShift, 708, 818 + faceShift, 678);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return facePath;
  }

  paintEye(ctx, side, yaw = 0) {
    const isLeft = side === 'L';
    const shiftX = yaw * 38;

    // Escorço do olho distante em perspectiva 3/4 e perfil
    const eyeScaleX = isLeft
      ? (yaw < -0.2 ? Math.max(0.38, 1.0 + yaw * 0.58) : 1.0)
      : (yaw > 0.2 ? Math.max(0.38, 1.0 - yaw * 0.58) : 1.0);

    ctx.save();
    ctx.translate(shiftX, 0);
    if (eyeScaleX !== 1.0) {
      const anchorX = isLeft ? 568 : 706;
      ctx.translate(anchorX, 0);
      ctx.scale(eyeScaleX, 1.0);
      ctx.translate(-anchorX, 0);
    }

    const scleraPath = new Path2D();
    if (isLeft) {
      scleraPath.moveTo(418, 892);
      scleraPath.quadraticCurveTo(498, 906, 568, 938);
      scleraPath.bezierCurveTo(558, 978, 532, 992, 496, 992);
      scleraPath.bezierCurveTo(454, 990, 428, 956, 418, 892);
      scleraPath.closePath();
    } else {
      scleraPath.moveTo(706, 932);
      scleraPath.quadraticCurveTo(788, 898, 876, 876);
      scleraPath.bezierCurveTo(868, 946, 842, 982, 796, 986);
      scleraPath.bezierCurveTo(748, 988, 720, 968, 706, 932);
      scleraPath.closePath();
    }

    const sy0 = isLeft ? 890 : 876;
    const sGrad = ctx.createLinearGradient(0, sy0, 0, 992);
    sGrad.addColorStop(0.0, '#c7aaa0');
    sGrad.addColorStop(0.32, '#f2e6e0');
    sGrad.addColorStop(1.0, '#fcf7f4');
    ctx.fillStyle = sGrad;
    ctx.fill(scleraPath);

    ctx.save();
    ctx.clip(scleraPath);

    // Íris vermelha maior e mais intensa (facetas pictóricas rubi/escarlate)
    const icx = isLeft ? 508 + yaw * 6 : 788 + yaw * 6;
    const icy = isLeft ? 944 : 934;
    const irx = isLeft ? 49 : 51;
    const iry = isLeft ? 48 : 50;

    const irisPath = new Path2D();
    irisPath.ellipse(icx, icy, irx, iry, 0, 0, Math.PI * 2);

    const iGrad = ctx.createLinearGradient(icx, icy - iry, icx, icy + iry);
    iGrad.addColorStop(0.0, '#450205');
    iGrad.addColorStop(0.32, '#9e050d');
    iGrad.addColorStop(0.68, '#e60b16');
    iGrad.addColorStop(1.0, '#ff2626');
    ctx.fillStyle = iGrad;
    ctx.fill(irisPath);

    // Facetas internas pictóricas da íris (sem raios finos artificiais)
    const rng = createRNG(isLeft ? 501 : 502);
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      const dist = irx * (0.45 + rng() * 0.25);
      const fx = icx + Math.cos(ang) * dist;
      const fy = icy + Math.sin(ang) * dist;
      ctx.fillStyle = fy > icy ? 'rgba(255, 65, 65, 0.55)' : 'rgba(65, 2, 6, 0.45)';
      ctx.beginPath();
      ctx.arc(fx, fy, 6 + rng() * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anel límbico escuro espesso
    ctx.strokeStyle = '#290204';
    ctx.lineWidth = 6.0;
    ctx.stroke(irisPath);

    // Pupila vertical escura intensa
    ctx.fillStyle = '#170204';
    ctx.beginPath();
    ctx.ellipse(icx, icy - 2, 11.5, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brilhos internos sutis na íris
    ctx.fillStyle = 'rgba(255, 155, 155, 0.65)';
    ctx.beginPath();
    ctx.arc(icx - 16, icy - 10, 5.0, 0, Math.PI * 2);
    ctx.arc(icx + 15, icy + 13, 4.0, 0, Math.PI * 2);
    ctx.fill();

    // Sombra superior da pálpebra sobre a íris
    ctx.fillStyle = 'rgba(32, 3, 5, 0.46)';
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(410, 880);
      ctx.quadraticCurveTo(498, 902, 575, 936);
      ctx.lineTo(575, 954);
      ctx.quadraticCurveTo(495, 922, 410, 910);
    } else {
      ctx.moveTo(700, 930);
      ctx.quadraticCurveTo(788, 894, 885, 870);
      ctx.lineTo(885, 892);
      ctx.quadraticCurveTo(790, 914, 700, 948);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Contorno inferior da esclera
    ctx.strokeStyle = '#521f12';
    ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(426, 912);
      ctx.bezierCurveTo(440, 976, 488, 996, 548, 986);
    } else {
      ctx.moveTo(724, 976);
      ctx.bezierCurveTo(778, 992, 845, 974, 868, 896);
    }
    ctx.stroke();

    // Halo avermelhado escuro ao redor dos cílios superiores (como em hero-part-head.png)
    ctx.strokeStyle = '#6e070d';
    ctx.lineWidth = 9.0;
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(400, 884);
      ctx.quadraticCurveTo(486, 894, 576, 938);
    } else {
      ctx.moveTo(698, 934);
      ctx.quadraticCurveTo(786, 890, 890, 866);
    }
    ctx.stroke();

    // Pálpebra superior espessa e cílios escuros
    const lashPath = new Path2D();
    if (isLeft) {
      lashPath.moveTo(392, 880);
      lashPath.quadraticCurveTo(486, 890, 580, 938);
      lashPath.quadraticCurveTo(568, 947, 550, 939);
      lashPath.quadraticCurveTo(482, 908, 410, 898);
      lashPath.closePath();
    } else {
      lashPath.moveTo(692, 934);
      lashPath.quadraticCurveTo(786, 886, 896, 862);
      lashPath.quadraticCurveTo(882, 882, 864, 885);
      lashPath.quadraticCurveTo(786, 906, 710, 941);
      lashPath.closePath();
    }
    ctx.fillStyle = '#1c0505';
    ctx.fill(lashPath);
    this.mat.strokeArtisanalInk(ctx, lashPath, 4.2, '#140404', '#4a090d');

    ctx.restore();
  }

  paintEyebrowsAndFeatures(ctx, yaw = 0) {
    const shiftX = yaw * 34;
    ctx.save();
    ctx.translate(shiftX, 0);

    // Sobrancelha Esquerda
    const browL = new Path2D();
    browL.moveTo(392, 816);
    browL.quadraticCurveTo(492, 866, 596, 918);
    browL.quadraticCurveTo(582, 930, 560, 921);
    browL.quadraticCurveTo(476, 878, 386, 832);
    browL.closePath();

    ctx.fillStyle = '#1c0b07';
    ctx.fill(browL);
    this.mat.strokeArtisanalInk(ctx, browL, 4.4, '#140704', '#381b11');

    // Sobrancelha Direita
    const browR = new Path2D();
    browR.moveTo(672, 916);
    browR.quadraticCurveTo(795, 850, 934, 790);
    browR.quadraticCurveTo(940, 804, 918, 815);
    browR.quadraticCurveTo(798, 872, 692, 925);
    browR.closePath();

    ctx.fillStyle = '#1c0b07';
    ctx.fill(browR);
    this.mat.strokeArtisanalInk(ctx, browR, 4.6, '#140704', '#381b11');

    // Pequeno nariz esculpido
    const noseShadow = new Path2D();
    noseShadow.moveTo(634, 968);
    noseShadow.lineTo(616, 992);
    noseShadow.quadraticCurveTo(630, 1002, 644, 994);
    noseShadow.closePath();

    ctx.fillStyle = '#c9652e';
    ctx.fill(noseShadow);

    ctx.fillStyle = '#ffe3bf';
    ctx.beginPath();
    ctx.moveTo(634, 968);
    ctx.lineTo(648, 988);
    ctx.lineTo(636, 992);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#4a1d0c';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(622, 993);
    ctx.quadraticCurveTo(633, 998, 642, 993);
    ctx.stroke();

    // Boca discreta e determinada
    ctx.strokeStyle = '#d4743b';
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(622, 1055);
    ctx.quadraticCurveTo(656, 1058, 686, 1050);
    ctx.stroke();

    this.mat.strokeArtisanalInk(ctx, (c) => {
      c.moveTo(608, 1046);
      c.quadraticCurveTo(655, 1043, 702, 1038);
    }, 6.4, '#210c07', '#4a2114');

    ctx.restore();
  }
}
