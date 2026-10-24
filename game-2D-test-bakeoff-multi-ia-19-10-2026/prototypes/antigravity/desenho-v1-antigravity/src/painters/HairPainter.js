// ============================================================================
// HairPainter.js — Cabelo Volumoso em Mechas Orgânicas Assimétricas (Refinado Fase F)
// ============================================================================

export class HairPainter {
  constructor(materials) {
    this.mat = materials;
  }

  paintBackHair(ctx, yaw = 0) {
    const crownShift = -yaw * 10;
    ctx.save();
    ctx.translate(crownShift, 0);

    // 1. Massa craniana escura de preenchimento total (zero lacunas na testa/coroa)
    const baseMass = new Path2D();
    baseMass.moveTo(220, 410);
    baseMass.bezierCurveTo(340, 175, 895, 195, 1045, 440);
    baseMass.bezierCurveTo(1140, 645, 1095, 890, 955, 990);
    baseMass.lineTo(310, 995);
    baseMass.bezierCurveTo(175, 865, 165, 615, 220, 410);
    baseMass.closePath();
    ctx.fillStyle = '#1f100a';
    ctx.fill(baseMass);

    // 2. Pontas traseiras abaixo da orelha esquerda
    this.mat.paintHairLock(ctx, [
      [420, 990],
      [350, 1015, 295, 1042, 262, 1066],
      [305, 1068, 326, 1062, 342, 1055],
      [334, 1068, 326, 1076, 328, 1084],
      [355, 1076, 368, 1072, 376, 1068],
      [372, 1082, 370, 1092, 374, 1096],
      [412, 1082, 445, 1060, 470, 1035]
    ], {
      rootPoint: [420, 1005],
      tipPoint: [320, 1075],
      highlightIntensity: 0.45,
      outlineWidth: 5.8,
      seed: 601
    });

    // 3. Pontas traseiras abaixo da orelha direita
    this.mat.paintHairLock(ctx, [
      [855, 995],
      [915, 1020, 965, 1042, 994, 1054],
      [976, 1058, 966, 1058, 956, 1055],
      [964, 1066, 970, 1076, 968, 1082],
      [925, 1072, 885, 1055, 835, 1030]
    ], {
      rootPoint: [865, 1005],
      tipPoint: [975, 1068],
      highlightIntensity: 0.45,
      outlineWidth: 5.8,
      seed: 602
    });

    ctx.restore();
  }

  paintForeheadCastShadow(ctx, faceClipPath, yaw = 0) {
    const shiftX = yaw * 24;
    ctx.save();
    if (faceClipPath) ctx.clip(faceClipPath);
    ctx.translate(shiftX, 0);

    const shadowPath = new Path2D();
    shadowPath.moveTo(350, 600);
    shadowPath.lineTo(950, 600);
    shadowPath.lineTo(950, 910);
    shadowPath.bezierCurveTo(910, 825, 865, 735, 818, 655);
    shadowPath.bezierCurveTo(758, 755, 652, 852, 552, 922);
    shadowPath.lineTo(540, 868);
    shadowPath.lineTo(472, 898);
    shadowPath.lineTo(462, 845);
    shadowPath.lineTo(350, 925);
    shadowPath.closePath();

    const grad = ctx.createLinearGradient(620, 630, 620, 925);
    grad.addColorStop(0.0, 'rgba(138, 48, 14, 0.72)');
    grad.addColorStop(0.65, 'rgba(186, 78, 28, 0.50)');
    grad.addColorStop(1.0, 'rgba(218, 108, 48, 0.22)');
    ctx.fillStyle = grad;
    ctx.fill(shadowPath);

    ctx.restore();
  }

  paintMainAndFrontLocks(ctx, yaw = 0) {
    const backShift = -yaw * 8;
    const midShift = yaw * 8;
    const frontShift = yaw * 22;

    // ========================================================================
    // CAMADA 1: MECHAS SECUNDÁRIAS E INTERMEDIÁRIAS
    // ========================================================================
    ctx.save();
    ctx.translate(backShift, 0);

    // Mecha intermediária superior-esquerda (entre L1 e C1: ponta em 342, 208)
    this.mat.paintHairLock(ctx, [
      [585, 385],
      [515, 285, 425, 228, 342, 208],
      [345, 275, 375, 345, 445, 405],
      [515, 415, 555, 405, 585, 385]
    ], {
      rootPoint: [545, 385],
      tipPoint: [342, 208],
      highlightIntensity: 0.78,
      outlineWidth: 6.0,
      seed: 700
    });

    // Lock R1 — Mecha secundária superior-direita (ponta em 1038, 315)
    this.mat.paintHairLock(ctx, [
      [810, 420],
      [885, 345, 968, 318, 1038, 315],
      [1028, 368, 1002, 418, 955, 465],
      [895, 455, 845, 440, 810, 420]
    ], {
      rootPoint: [835, 425],
      tipPoint: [1038, 315],
      highlightIntensity: 0.85,
      outlineWidth: 6.0,
      seed: 701
    });

    // Lock R6 — Mecha inferior direita acima da orelha (1168, 886)
    this.mat.paintHairLock(ctx, [
      [905, 685],
      [1025, 730, 1118, 802, 1168, 886],
      [1135, 888, 1112, 884, 1092, 876],
      [1105, 896, 1112, 910, 1114, 918],
      [1055, 905, 985, 875, 900, 835]
    ], {
      rootPoint: [910, 740],
      tipPoint: [1168, 886],
      highlightIntensity: 0.90,
      outlineWidth: 6.2,
      seed: 702
    });

    // Lock L4 — Mecha inferior esquerda acima da orelha (127, 918)
    this.mat.paintHairLock(ctx, [
      [355, 705],
      [245, 760, 172, 835, 127, 918],
      [158, 912, 182, 902, 204, 890],
      [182, 928, 166, 952, 158, 968],
      [215, 945, 275, 895, 365, 845]
    ], {
      rootPoint: [350, 760],
      tipPoint: [127, 918],
      highlightIntensity: 0.85,
      outlineWidth: 6.2,
      seed: 703
    });

    ctx.restore();

    // ========================================================================
    // CAMADA 2: GRANDES MECHAS DA SILHUETA EXTERNA (MAIS CHEIAS E VOLUMOSAS)
    // ========================================================================
    ctx.save();
    ctx.translate(midShift, 0);

    // Lock R2 — Chifre vertical superior-direito (ponta em 886, 162 + dente 995, 275)
    this.mat.paintHairLock(ctx, [
      [785, 435],
      [795, 305, 835, 212, 886, 162],
      [932, 215, 958, 258, 968, 298],
      [982, 282, 995, 274, 1006, 272],
      [1008, 335, 985, 398, 935, 455],
      [875, 450, 825, 442, 785, 435]
    ], {
      rootPoint: [845, 435],
      tipPoint: [886, 162],
      highlightIntensity: 1.10,
      outlineWidth: 6.4,
      seed: 704
    });

    // Lock R3 — Grande mecha superior-média direita (ponta em 1208, 414)
    this.mat.paintHairLock(ctx, [
      [855, 425],
      [985, 372, 1112, 382, 1208, 414],
      [1168, 482, 1105, 528, 1015, 558],
      [935, 525, 880, 475, 855, 425]
    ], {
      rootPoint: [865, 455],
      tipPoint: [1208, 414],
      highlightIntensity: 1.15,
      outlineWidth: 6.4,
      seed: 705
    });

    // Lock R4 — Grande mecha média direita (ponta em 1238, 622)
    this.mat.paintHairLock(ctx, [
      [905, 485],
      [1055, 495, 1165, 548, 1238, 622],
      [1175, 658, 1105, 672, 1020, 668],
      [960, 615, 920, 550, 905, 485]
    ], {
      rootPoint: [925, 535],
      tipPoint: [1238, 622],
      highlightIntensity: 1.10,
      outlineWidth: 6.4,
      seed: 706
    });

    // Lock R5 — Grande mecha média-inferior direita (ponta em 1241, 766)
    this.mat.paintHairLock(ctx, [
      [915, 565],
      [1062, 608, 1172, 682, 1241, 766],
      [1155, 792, 1068, 795, 982, 775],
      [940, 710, 920, 635, 915, 565]
    ], {
      rootPoint: [935, 615],
      tipPoint: [1241, 766],
      highlightIntensity: 1.05,
      outlineWidth: 6.4,
      seed: 707
    });

    // Lock L3 — Grande mecha média-inferior esquerda (ponta extrema esquerda em 7, 782)
    this.mat.paintHairLock(ctx, [
      [405, 545],
      [235, 595, 98, 678, 7, 782],
      [118, 812, 232, 808, 345, 765],
      [385, 695, 405, 620, 405, 545]
    ], {
      rootPoint: [375, 615],
      tipPoint: [7, 782],
      highlightIntensity: 1.10,
      outlineWidth: 6.4,
      seed: 708
    });

    // Lock L2 — Grande mecha média-superior esquerda (ponta em 20, 510 + dente 118, 606)
    this.mat.paintHairLock(ctx, [
      [475, 405],
      [285, 392, 132, 432, 20, 510],
      [75, 558, 132, 582, 168, 586],
      [142, 596, 126, 604, 118, 608],
      [188, 622, 292, 612, 405, 568],
      [445, 515, 468, 460, 475, 405]
    ], {
      rootPoint: [435, 475],
      tipPoint: [20, 510],
      highlightIntensity: 1.15,
      outlineWidth: 6.4,
      seed: 709
    });

    // Lock L1 — Grande mecha superior esquerda (ponta em 188, 214)
    this.mat.paintHairLock(ctx, [
      [645, 395],
      [485, 255, 332, 212, 188, 214],
      [202, 312, 245, 392, 320, 452],
      [445, 472, 555, 448, 645, 395]
    ], {
      rootPoint: [565, 415],
      tipPoint: [188, 214],
      highlightIntensity: 1.20,
      outlineWidth: 6.6,
      seed: 710
    });

    // Lock C1 — MECHA MESTRA DO TOPO/COROA (ponta mais alta em 454, 78)
    this.mat.paintHairLock(ctx, [
      [858, 428],
      [822, 248, 662, 132, 454, 78],
      [434, 162, 438, 238, 468, 308],
      [555, 385, 695, 432, 858, 428]
    ], {
      rootPoint: [835, 415],
      tipPoint: [454, 78],
      highlightIntensity: 1.35,
      outlineWidth: 6.8,
      seed: 711,
      extraStrands: [
        Object.assign([810, 395, 645, 235, 462, 92], { color: '#140804', width: 4.5 }),
        Object.assign([765, 405, 595, 265, 452, 148], { color: '#140804', width: 4.0 })
      ]
    });

    ctx.restore();

    // ========================================================================
    // CAMADA 3: MECHAS FRONTAIS, COSTELETAS E FRANJA ASSIMÉTRICA COMPLETA
    // (Cobre 100% da testa superior esquerda, deixando exposto apenas o arco direito!)
    // ========================================================================
    ctx.save();
    ctx.translate(frontShift * 0.65, 0);

    // Costeleta Esquerda longa (cai na frente da orelha esquerda até 362, 982)
    this.mat.paintHairLock(ctx, [
      [445, 685],
      [375, 775, 338, 878, 362, 982],
      [405, 918, 435, 835, 475, 745]
    ], {
      rootPoint: [425, 715],
      tipPoint: [362, 982],
      highlightIntensity: 0.72,
      outlineWidth: 5.8,
      seed: 712
    });

    // Costeleta Direita longa (cai na frente da orelha direita até 908, 965)
    this.mat.paintHairLock(ctx, [
      [855, 635],
      [898, 742, 912, 855, 908, 965],
      [962, 882, 985, 778, 955, 665]
    ], {
      rootPoint: [895, 665],
      tipPoint: [908, 965],
      highlightIntensity: 0.78,
      outlineWidth: 5.8,
      seed: 713
    });

    // Lock F1 — Grande Mecha Frontal Direita (do redemoinho 828, 432 até 1088, 778)
    this.mat.paintHairLock(ctx, [
      [828, 432],
      [955, 428, 1052, 558, 1088, 778],
      [988, 735, 882, 652, 818, 535],
      [808, 490, 812, 452, 828, 432]
    ], {
      rootPoint: [835, 440],
      tipPoint: [1088, 778],
      highlightIntensity: 1.25,
      outlineWidth: 6.6,
      seed: 714
    });

    // Lock F3 — Grande Mecha Lateral-Frontal Esquerda (cobre toda a têmpora esquerda e desce até 162, 768 e 272, 902)
    this.mat.paintHairLock(ctx, [
      [745, 412],
      [505, 415, 285, 548, 162, 768],
      [225, 752, 275, 732, 318, 712],
      [285, 785, 268, 845, 272, 902],
      [385, 842, 495, 745, 615, 625],
      [685, 545, 725, 468, 745, 412]
    ], {
      rootPoint: [695, 435],
      tipPoint: [162, 768],
      highlightIntensity: 1.15,
      outlineWidth: 6.4,
      seed: 716
    });

    // Lock F2 — Mecha em Arco Superior da Franja (parte de 818, 422 para a esquerda até 372, 532)
    this.mat.paintHairLock(ctx, [
      [818, 422],
      [675, 305, 495, 338, 372, 532],
      [465, 495, 585, 465, 715, 472],
      [775, 462, 805, 442, 818, 422]
    ], {
      rootPoint: [810, 425],
      tipPoint: [372, 532],
      highlightIntensity: 1.25,
      outlineWidth: 6.4,
      seed: 715
    });

    ctx.restore();

    // ========================================================================
    // CAMADA 4: FRANJA PRINCIPAL CENTRAL-ESQUERDA (MAIS LARGA E VOLUMOSA)
    // ========================================================================
    ctx.save();
    ctx.translate(frontShift, 0);

    // Sub-mecha esquerda da franja que cruza a sobrancelha esquerda (ponta em 468, 886)
    this.mat.paintHairLock(ctx, [
      [775, 422],
      [565, 435, 445, 615, 468, 886],
      [545, 815, 645, 695, 735, 565],
      [765, 505, 778, 455, 775, 422]
    ], {
      rootPoint: [755, 435],
      tipPoint: [468, 886],
      highlightIntensity: 1.18,
      outlineWidth: 6.4,
      seed: 717
    });

    // Mecha Central Gigante da Franja (parte de 828, 432 e desce até 546, 914 entre os olhos)
    this.mat.paintHairLock(ctx, [
      [828, 432],
      [645, 378, 498, 558, 546, 914],
      [668, 792, 788, 672, 838, 532],
      [852, 482, 845, 448, 828, 432]
    ], {
      rootPoint: [825, 435],
      tipPoint: [546, 914],
      highlightIntensity: 1.38,
      outlineWidth: 6.8,
      seed: 718,
      extraStrands: [
        Object.assign([815, 442, 645, 575, 552, 895], { color: '#140804', width: 4.5 }),
        Object.assign([795, 435, 605, 545, 548, 845], { color: '#140804', width: 4.0 })
      ]
    });

    ctx.restore();
  }
}
