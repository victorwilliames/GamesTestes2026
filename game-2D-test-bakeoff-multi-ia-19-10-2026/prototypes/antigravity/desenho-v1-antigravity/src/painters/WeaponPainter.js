// ============================================================================
// WeaponPainter.js — Lâminas do Caos (Pintura Pictórica Artesanal, Fogo, Sangue e Aço)
// Reconstrução 100% Canvas 2D de hero-part-weapons.png:
// - Silhueta exata medida pixel a pixel (ponta superior em (246,272), barriga
//   externa em (40,518), longo chifre inferior descendo até (180,748),
//   2 dentes internos inferiores e 3 ganchos internos superiores).
// - Pintura pictórica artesanal (sem linhas artificiais e sem manchas de "onça"):
//   leito incandescente de magma (#fffce0 -> #ff9900 -> #e61c00 -> #800400)
//   sobreposto por cristas irregulares de basalto/ferro forjado e centenas de
//   pinceladas de aço batido (#fffaf5, #d6c0b2, #7d5d4f, #2b120c) na metade superior.
// - Cabo robusto e grosso (~72px de largura) com tiras de couro e colares de
//   bronze/cobre forjado e oxidado.
// - Corrente pesada de elos grossos entrelaçados (stadium links).
// ============================================================================

import { createRNG } from '../materials/MaterialPainter.js';

export class WeaponPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha o par completo nas coordenadas exatas de hero-part-weapons.png (1254x1254).
   */
  paintCanonicalPair(ctx) {
    this.paintSingleWeaponCanonical(ctx, 'L');
    this.paintSingleWeaponCanonical(ctx, 'R');
  }

  /**
   * Método principal chamado por HeroRenderer para desenhar cada arma (L ou R),
   * seja em hero-part-weapons (scale=1, x=475/779, y=665) ou empunhada pela mão (handGrip).
   */
  paintWeapon(ctx, wPose = {}) {
    const {
      x = 475,
      y = 665,
      scale = 1.0,
      rotation = 0,
      side = 'L'
    } = wPose;

    const isLeft = side === 'L';

    // Peça canônica isolada (hero-part-weapons): espaço 1254x1254 exato
    if (Math.abs(scale - 1.0) < 0.01 && Math.abs(rotation) < 0.01 && (x === 475 || x === 779)) {
      this.paintSingleWeaponCanonical(ctx, side);
      return;
    }

    // Quando empunhada pela mão do herói (hero-idle-s, SE, SW, run, attack):
    // O centro da empunhadura no cabo da arma esquerda é (395, 638), logo atrás da guarda,
    // fazendo com que a guarda fique colada ao lado externo dos dedos e o pomo saia do lado interno!
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    if (!isLeft) {
      ctx.scale(-1, 1);
    }
    ctx.scale(scale, scale);
    ctx.translate(-395, -638);
    this.paintLeftWeaponGeometry(ctx, isLeft ? 2101 : 2202);
    ctx.restore();
  }

  paintSingleWeaponCanonical(ctx, side = 'L') {
    ctx.save();
    if (side === 'R') {
      ctx.translate(1254, 0);
      ctx.scale(-1, 1);
      this.paintLeftWeaponGeometry(ctx, 2202);
    } else {
      this.paintLeftWeaponGeometry(ctx, 2101);
    }
    ctx.restore();
  }

  paintLeftWeaponGeometry(ctx, seed = 2101) {
    // 1. CORRENTE PESADA ENTRELAÇADA
    this.paintHeavyChaosChain(ctx, seed + 50);

    // 2. CABO ROBUSTO DE COURO ESCURO E BRONZE FORJADO OXIDADO
    this.paintChaosHilt(ctx, seed + 20);

    // 3. LÂMINA DO CAOS PICTÓRICA (Aço Forjado + Magma + Basalto + Fogo e Sangue)
    this.paintChaosBlade(ctx, seed);
  }

  // ==========================================================================
  // LÂMINA DO CAOS — PINTURA PICTÓRICA ARTESANAL FIEL AO ANEXO
  // ==========================================================================
  paintChaosBlade(ctx, seed) {
    const rng = createRNG(seed);
    const bladePath = new Path2D();

    // Ponta superior aguçada: (246, 272)
    bladePath.moveTo(246, 272);

    // GRANDE ARCO CORTANTE EXTERNO (de (246,272) até a barriga (40,518) e descendo até a ponta inferior (180,748))
    bladePath.bezierCurveTo(156, 304, 78, 378, 48, 468);
    bladePath.bezierCurveTo(32, 528, 44, 602, 84, 665);
    bladePath.bezierCurveTo(112, 706, 146, 732, 180, 748);

    // CURVA INTERNA DO CHIFRE INFERIOR (sobe de (180,748) para dentro até a abóbada (196,588))
    bladePath.bezierCurveTo(160, 704, 150, 646, 162, 606);
    bladePath.bezierCurveTo(168, 590, 180, 584, 196, 588);

    // Dente Interno Inferior 1 (ponta em (224, 606))
    bladePath.lineTo(224, 606);
    // Entalhe em (246, 586)
    bladePath.quadraticCurveTo(235, 592, 246, 586);
    // Dente Interno Inferior 2 / Gancho da Guarda (ponta em (278, 636))
    bladePath.quadraticCurveTo(264, 608, 278, 636);
    // Sobe até a base da guarda do cabo em (316, 608)
    bladePath.quadraticCurveTo(294, 616, 316, 608);

    // Linha de encaixe na guarda do cabo ((316,608) -> (358,548))
    bladePath.lineTo(358, 548);

    // Gancho Superior 3 (junto à guarda, ponta em (368, 518))
    bladePath.lineTo(368, 518);
    // Curva côncava profunda entre Gancho 3 e Gancho 2 ((368,518) -> (316,482) -> (342,462))
    bladePath.bezierCurveTo(332, 518, 308, 502, 316, 482);
    bladePath.bezierCurveTo(320, 472, 330, 466, 342, 462);

    // Curva côncava profunda entre Gancho 2 e Gancho 1 ((342,462) -> (244,418) -> (268,398))
    bladePath.bezierCurveTo(292, 464, 246, 444, 244, 418);
    bladePath.bezierCurveTo(243, 406, 254, 400, 268, 398);

    // Curva côncava superior entre Gancho 1 e a Ponta Superior ((268,398) -> (206,326) -> (246,272))
    bladePath.bezierCurveTo(222, 392, 198, 360, 206, 326);
    bladePath.bezierCurveTo(212, 302, 228, 284, 246, 272);
    bladePath.closePath();

    // 1. Base global de sangue vulcânico e magma profundo
    ctx.fillStyle = '#240502';
    ctx.fill(bladePath);

    ctx.save();
    ctx.clip(bladePath);

    // ========================================================================
    // CAMADA 1: LEITO DE FOGO, MAGMA E SANGUE PROFUNDO EM TODA A METADE INFERIOR
    // ========================================================================
    const magmaBed = ctx.createRadialGradient(85, 565, 15, 165, 555, 245);
    magmaBed.addColorStop(0.0, '#fff7b0');
    magmaBed.addColorStop(0.22, '#ff9d00');
    magmaBed.addColorStop(0.48, '#e62200');
    magmaBed.addColorStop(0.75, '#8f0600');
    magmaBed.addColorStop(1.0, '#260402');
    ctx.fillStyle = magmaBed;
    ctx.fill(bladePath);

    // Segundo foco incandescente intenso no chifre inferior e dentes inferiores
    const hornFire = ctx.createRadialGradient(145, 655, 10, 175, 625, 145);
    hornFire.addColorStop(0.0, '#ffffdb');
    hornFire.addColorStop(0.30, '#ffae00');
    hornFire.addColorStop(0.65, '#d91600');
    hornFire.addColorStop(1.0, 'rgba(120, 4, 0, 0)');
    ctx.fillStyle = hornFire;
    ctx.fill(bladePath);

    // ========================================================================
    // CAMADA 2: TEXTURA DENSA DE CROSTA VULCÂNICA RACHADA E PINCELADAS DE BRASA
    // Em vez de círculos isolados ("onça"), pintamos centenas de lascas angulares
    // pequenas (4 a 14px) de carvão/ferro e pinceladas de lava entrelaçadas!
    // ========================================================================
    for (let i = 0; i < 380; i++) {
      const cx = 52 + rng() * 305;
      const cy = 410 + rng() * 320;

      // Posição da borda externa esquerda para preservar a faixa de fogo branco/amarelo puro
      let edgeX;
      if (cy < 520) {
        const u = Math.max(0, (cy - 410) / 110);
        edgeX = 68 - Math.sin(u * Math.PI * 0.5) * 26;
      } else {
        const u = (cy - 520) / 225;
        edgeX = 42 + u * u * 135;
      }
      const distFromOuter = cx - edgeX;

      // Também preservamos o fogo puro nos dentes inferiores internos
      const nearInnerTeeth = (cy > 578 && cy < 640 && cx > 165 && cx < 305 && (cy > 592 + (cx - 195) * 0.25));

      if (distFromOuter > 16 && !nearInnerTeeth) {
        const coreFactor = Math.min(1.0, (distFromOuter - 16) / 75);
        const roll = rng();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.45 + (rng() - 0.5) * 1.2);

        const rw = 6 + rng() * 15;
        const rh = 4 + rng() * 9;

        if (roll < 0.58 * coreFactor) {
          // Bloco orgânico de ferro vulcânico escuro com borda vermelho-sangue suave
          ctx.fillStyle = 'rgba(145, 10, 2, 0.55)';
          ctx.beginPath();
          ctx.ellipse(0, 0, rw * 0.85, rh * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = rng() > 0.42 ? 'rgba(26, 7, 5, 0.88)' : 'rgba(46, 12, 9, 0.84)';
          ctx.beginPath();
          ctx.moveTo(-rw * 0.7, -rh * 0.4);
          ctx.lineTo(rw * 0.3, -rh * 0.75);
          ctx.lineTo(rw * 0.75, rh * 0.25);
          ctx.lineTo(-rw * 0.25, rh * 0.75);
          ctx.closePath();
          ctx.fill();
        } else if (roll < 0.85) {
          // Brasa vermelho-sangue / carmim incandescente
          ctx.fillStyle = rng() > 0.48 ? 'rgba(205, 18, 2, 0.72)' : 'rgba(138, 8, 3, 0.72)';
          ctx.beginPath();
          ctx.ellipse(0, 0, rw * 0.7, rh * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Fissura/brasa viva laranja-ouro
          ctx.fillStyle = rng() > 0.38 ? 'rgba(255, 118, 0, 0.85)' : 'rgba(255, 228, 98, 0.85)';
          ctx.beginPath();
          ctx.ellipse(0, 0, rw * 0.55, rh * 0.38, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Veias finas e irregulares de lava amarelo-laranja cortando as lascas escuras
    const drawLavaCrack = (pts, width = 3.6) => {
      const sub = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[i + 1];
        const steps = 6;
        for (let s = 1; s <= steps; s++) {
          const u = s / steps;
          const jx = s < steps ? (rng() - 0.5) * 9 : 0;
          const jy = s < steps ? (rng() - 0.5) * 9 : 0;
          sub.push([x0 + (x1 - x0) * u + jx, y0 + (y1 - y0) * u + jy]);
        }
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.strokeStyle = 'rgba(225, 24, 0, 0.82)';
      ctx.lineWidth = width * 2.4;
      ctx.beginPath();
      sub.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 128, 0, 0.92)';
      ctx.lineWidth = width * 1.15;
      ctx.beginPath();
      sub.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 244, 145, 0.95)';
      ctx.lineWidth = width * 0.45;
      ctx.beginPath();
      sub.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.stroke();
    };

    const cracks = [
      [[58, 488], [104, 502], [148, 488], [186, 512], [232, 518]],
      [[148, 488], [172, 462], [208, 468]],
      [[56, 548], [102, 558], [145, 544], [184, 568], [228, 578]],
      [[102, 558], [118, 596], [142, 628]],
      [[72, 612], [112, 638], [138, 678], [164, 722]],
      [[205, 538], [248, 552], [274, 588], [276, 625]]
    ];
    cracks.forEach((c, idx) => drawLavaCrack(c, idx % 2 === 0 ? 3.8 : 2.8));

    // ========================================================================
    // CAMADA 3: FIO DE CORTE EXTERNO E DENTES INFERIORES EM FOGO BRANCO/AMARELO/LARANJA
    // ========================================================================
    const fireEdge = new Path2D();
    fireEdge.moveTo(72, 418);
    fireEdge.bezierCurveTo(40, 475, 32, 545, 58, 615);
    fireEdge.bezierCurveTo(82, 675, 128, 720, 180, 748);
    fireEdge.bezierCurveTo(160, 704, 150, 646, 162, 606);
    fireEdge.bezierCurveTo(168, 590, 180, 584, 196, 588);
    fireEdge.lineTo(224, 606);
    fireEdge.quadraticCurveTo(235, 592, 246, 586);
    fireEdge.quadraticCurveTo(264, 608, 278, 636);
    fireEdge.quadraticCurveTo(288, 618, 304, 608);
    fireEdge.bezierCurveTo(264, 592, 224, 568, 178, 568);
    fireEdge.bezierCurveTo(140, 572, 130, 635, 148, 688);
    fireEdge.bezierCurveTo(110, 655, 80, 598, 74, 535);
    fireEdge.bezierCurveTo(68, 482, 78, 445, 92, 424);
    fireEdge.closePath();

    const feGrad = ctx.createLinearGradient(40, 555, 185, 575);
    feGrad.addColorStop(0.0, '#fffff2');
    feGrad.addColorStop(0.24, '#ffe852');
    feGrad.addColorStop(0.55, '#ff7700');
    feGrad.addColorStop(0.85, '#d41400');
    feGrad.addColorStop(1.0, 'rgba(140, 5, 0, 0)');
    ctx.fillStyle = feGrad;
    ctx.fill(fireEdge);

    // Pinceladas vivas de fogo branco/amarelo/laranja ao longo de toda a curva externa e dentes inferiores
    for (let i = 0; i < 70; i++) {
      const t = i / 69;
      const fy = 420 + t * 320;
      let fx;
      if (fy < 520) {
        const u = (fy - 420) / 100;
        fx = 68 - Math.sin(u * Math.PI * 0.5) * 27;
      } else {
        const u = (fy - 520) / 220;
        fx = 41 + u * u * 134;
      }
      const len = 12 + rng() * 26;
      const ang = -0.12 + t * 0.55 + (rng() - 0.5) * 0.35;

      ctx.strokeStyle = rng() > 0.35 ? 'rgba(255, 252, 210, 0.88)' : 'rgba(255, 166, 0, 0.85)';
      ctx.lineWidth = 2.5 + rng() * 4.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fx + 3, fy);
      ctx.lineTo(fx + 3 + Math.cos(ang) * len, fy + Math.sin(ang) * len);
      ctx.stroke();
    }

    // ========================================================================
    // CAMADA 4: ASA SUPERIOR DE AÇO FORJADO BATIDO E ESCULPIDO (y=272..518)
    // ========================================================================
    const steelWing = new Path2D();
    steelWing.moveTo(246, 272);
    steelWing.bezierCurveTo(158, 304, 88, 368, 64, 434);
    // Dentes inferiores forjados da asa de aço sobre o magma
    steelWing.lineTo(94, 418);
    steelWing.lineTo(106, 456);
    steelWing.lineTo(138, 434);
    steelWing.lineTo(158, 476);
    steelWing.lineTo(194, 454);
    steelWing.lineTo(222, 496);
    steelWing.lineTo(262, 474);
    steelWing.lineTo(294, 514);
    steelWing.lineTo(332, 496);
    steelWing.lineTo(368, 518);
    // Sobe pelos 3 ganchos internos superiores
    steelWing.bezierCurveTo(332, 518, 308, 502, 316, 482);
    steelWing.bezierCurveTo(320, 472, 330, 466, 342, 462);
    steelWing.bezierCurveTo(292, 464, 246, 444, 244, 418);
    steelWing.bezierCurveTo(243, 406, 254, 400, 268, 398);
    steelWing.bezierCurveTo(222, 392, 198, 360, 206, 326);
    steelWing.bezierCurveTo(212, 302, 228, 284, 246, 272);
    steelWing.closePath();

    // Base metálica escura da asa de aço
    const swGrad = ctx.createLinearGradient(72, 325, 310, 485);
    swGrad.addColorStop(0.0, '#fffaf5');
    swGrad.addColorStop(0.28, '#dfd0c4');
    swGrad.addColorStop(0.55, '#856556');
    swGrad.addColorStop(0.78, '#4a2c22');
    swGrad.addColorStop(1.0, '#735244');
    ctx.fillStyle = swGrad;
    ctx.fill(steelWing);

    // Realce prateado/osso nas pontas dos chevrons da asa de aço (como na referência)
    ctx.strokeStyle = 'rgba(238, 220, 206, 0.72)';
    ctx.lineWidth = 3.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(64, 434);
    ctx.lineTo(94, 418);
    ctx.lineTo(106, 456);
    ctx.lineTo(138, 434);
    ctx.lineTo(158, 476);
    ctx.lineTo(194, 454);
    ctx.lineTo(222, 496);
    ctx.lineTo(262, 474);
    ctx.lineTo(294, 514);
    ctx.lineTo(332, 496);
    ctx.lineTo(368, 518);
    ctx.stroke();

    // Pinceladas densas de aço forjado martelado (prata, cinza-osso, carvão e sangue seco)
    ctx.save();
    ctx.clip(steelWing);

    for (let i = 0; i < 240; i++) {
      const px = 62 + rng() * 305;
      const py = 272 + rng() * 245;

      // Distância até a curva externa superior esquerda (onde o aço é branco-prata brilhante)
      const normY = (py - 272) / 165;
      const outerX = 246 - normY * 175;
      const distOuter = px - outerX;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.62 + (rng() - 0.5) * 0.55);

      const w = 6 + rng() * 16;
      const h = 2.5 + rng() * 6;

      if (distOuter < 38) {
        // Bevel externo de prata/osso martelado brilhante
        ctx.fillStyle = rng() > 0.32 ? 'rgba(255, 252, 248, 0.78)' : 'rgba(218, 198, 184, 0.72)';
      } else if (distOuter < 88) {
        // Zona intermediária de aço cinza-acastanhado batido
        ctx.fillStyle = rng() > 0.48 ? 'rgba(186, 162, 146, 0.65)' : 'rgba(72, 44, 34, 0.68)';
      } else {
        // Sulco interno escuro e ganchos internos sombreados com reflexo metálico nas pontas
        const nearHookEdge = (px > 235 && py > 375);
        if (nearHookEdge && rng() > 0.42) {
          ctx.fillStyle = 'rgba(232, 212, 198, 0.70)';
        } else {
          ctx.fillStyle = rng() > 0.45 ? 'rgba(42, 20, 14, 0.78)' : 'rgba(98, 62, 50, 0.65)';
        }
      }

      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Ranhuras escuras e cicatrizes de forja no aço superior
    for (let i = 0; i < 55; i++) {
      const sx = 68 + rng() * 285;
      const sy = 278 + rng() * 235;
      const len = 6 + rng() * 16;
      const ang = -0.6 + (rng() - 0.5) * 0.8;
      ctx.strokeStyle = rng() > 0.4 ? 'rgba(28, 10, 6, 0.68)' : 'rgba(255, 250, 244, 0.62)';
      ctx.lineWidth = 1.4 + rng() * 2.0;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.stroke();
    }

    ctx.restore();

    ctx.restore();

    // 5. CONTORNO EXTERNO ARTESANAL ESCURO E AVERMELHADO DA LÂMINA
    this.mat.strokeArtisanalInk(ctx, bladePath, 6.8, '#1a0402', '#470a04');
  }

  // ==========================================================================
  // CABO ROBUSTO DE 5 SEÇÕES (Mais grosso e texturizado como no anexo!)
  // ==========================================================================
  paintChaosHilt(ctx, seed) {
    const rng = createRNG(seed);

    // 1. Corpo grosso dos dois segmentos de couro escuro enrolado ((326,620) até (522,762))
    const gripLeather = new Path2D();
    gripLeather.moveTo(324, 622);
    gripLeather.lineTo(382, 558);
    gripLeather.bezierCurveTo(446, 608, 498, 674, 544, 744);
    gripLeather.lineTo(472, 796);
    gripLeather.bezierCurveTo(428, 728, 378, 664, 324, 622);
    gripLeather.closePath();

    this.mat.paintDarkLeather(ctx, gripLeather, { x: 320, y: 555, w: 230, h: 245 }, {
      baseColor: '#2b130d',
      highlightColor: '#5c2e20',
      edgeHighlight: '#9c5238',
      shadowColor: '#120503',
      outlineWidth: 6.5,
      ridges: [
        Object.assign([346, 638, 376, 606, 402, 580], { width: 6.2 }),
        Object.assign([364, 654, 394, 622, 418, 596], { width: 6.2 }),
        Object.assign([414, 710, 448, 680, 478, 654], { width: 6.4 }),
        Object.assign([432, 734, 466, 704, 496, 678], { width: 6.4 }),
        Object.assign([450, 758, 484, 728, 514, 702], { width: 6.4 })
      ],
      seed
    });

    // Faixa clara de tecido/couro dourado-envelhecido logo abaixo do colar central
    const goldWrap = new Path2D();
    goldWrap.moveTo(398, 692);
    goldWrap.quadraticCurveTo(430, 664, 462, 636);
    goldWrap.lineTo(478, 654);
    goldWrap.quadraticCurveTo(446, 682, 414, 710);
    goldWrap.closePath();
    const gwGrad = ctx.createLinearGradient(398, 692, 474, 642);
    gwGrad.addColorStop(0.0, '#451f0c');
    gwGrad.addColorStop(0.45, '#e39b54');
    gwGrad.addColorStop(0.75, '#fad898');
    gwGrad.addColorStop(1.0, '#4f220e');
    ctx.fillStyle = gwGrad;
    ctx.fill(goldWrap);
    this.mat.strokeArtisanalInk(ctx, goldWrap, 5.0, '#140503', '#331108');

    // Função auxiliar para pintar colares grossos e rústicos de bronze/cobre forjado
    const paintForgedCollar = (pts, gx0, gy0, gx1, gy1) => {
      const p = new Path2D();
      pts.forEach(([x, y], i) => (i === 0 ? p.moveTo(x, y) : p.lineTo(x, y)));
      p.closePath();

      const g = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
      g.addColorStop(0.0, '#260804');
      g.addColorStop(0.25, '#bd4e20');
      g.addColorStop(0.55, '#f7a258');
      g.addColorStop(0.80, '#c75220');
      g.addColorStop(1.0, '#210603');
      ctx.fillStyle = g;
      ctx.fill(p);

      // Pinceladas rústicas de marteladas escuras, sangue oxidado e brilho cobre
      ctx.save();
      ctx.clip(p);
      for (let k = 0; k < 36; k++) {
        const px = gx0 + (rng() - 0.15) * 95;
        const py = gy0 + (rng() - 0.15) * 95;
        const pick = rng();
        if (pick < 0.45) ctx.fillStyle = 'rgba(22, 5, 3, 0.72)';
        else if (pick < 0.78) ctx.fillStyle = 'rgba(255, 206, 138, 0.58)';
        else ctx.fillStyle = 'rgba(175, 22, 6, 0.55)';
        ctx.beginPath();
        ctx.arc(px, py, 2.2 + rng() * 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      this.mat.strokeArtisanalInk(ctx, p, 6.4, '#140402', '#330c06');
    };

    // 2. Guarda / Colar Superior Grosso de Bronze Forjado (junto à lâmina: (302,614)..(364,538))
    paintForgedCollar(
      [[302, 614], [362, 538], [392, 564], [332, 638]],
      306, 614, 384, 548
    );

    // 3. Colar Central Grosso de Bronze Forjado (onde prende o lado esquerdo da corrente)
    paintForgedCollar(
      [[370, 674], [438, 602], [464, 630], [396, 700]],
      374, 674, 456, 614
    );

    // 4. Colar Inferior + Grande Pomo Anelar Forjado (em (458,778)..(588,822) com furo real em (532,795)!)
    paintForgedCollar(
      [[458, 778], [532, 722], [554, 748], [480, 804]],
      462, 778, 548, 732
    );

    // Grande anel forjado do pomo (grosso e rústico, com furo real para a corrente passar!)
    const pommelRing = new Path2D();
    pommelRing.ellipse(538, 794, 50, 38, 0.42, 0, Math.PI * 2);
    pommelRing.ellipse(532, 794, 14, 9.5, 0.42, 0, Math.PI * 2);

    const prGrad = ctx.createRadialGradient(524, 776, 6, 538, 794, 56);
    prGrad.addColorStop(0.0, '#ffc47e');
    prGrad.addColorStop(0.42, '#d15e28');
    prGrad.addColorStop(0.78, '#6e220c');
    prGrad.addColorStop(1.0, '#1f0603');
    ctx.fillStyle = prGrad;
    ctx.fill(pommelRing, 'evenodd');

    ctx.save();
    ctx.clip(pommelRing, 'evenodd');
    for (let k = 0; k < 38; k++) {
      const a = rng() * Math.PI * 2;
      const r = 16 + rng() * 28;
      const px = 538 + Math.cos(a) * r;
      const py = 794 + Math.sin(a) * r * 0.8;
      const pick = rng();
      if (pick < 0.45) ctx.fillStyle = 'rgba(22, 5, 3, 0.72)';
      else if (pick < 0.78) ctx.fillStyle = 'rgba(255, 192, 118, 0.60)';
      else ctx.fillStyle = 'rgba(185, 24, 6, 0.55)';
      ctx.beginPath();
      ctx.arc(px, py, 2.4 + rng() * 3.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const pommelOuter = new Path2D();
    pommelOuter.ellipse(538, 794, 50, 38, 0.42, 0, Math.PI * 2);
    this.mat.strokeArtisanalInk(ctx, pommelOuter, 6.6, '#140402', '#330c06');

    const pommelInner = new Path2D();
    pommelInner.ellipse(532, 794, 14, 9.5, 0.42, 0, Math.PI * 2);
    this.mat.strokeArtisanalInk(ctx, pommelInner, 5.0, '#140402', '#330c06');
  }

  // ==========================================================================
  // CORRENTE PESADA ENTRELAÇADA ("CORRENTE BOLADA" GROSSA E RÚSTICA)
  // ==========================================================================
  paintHeavyChaosChain(ctx, seed) {
    const rng = createRNG(seed);

    const chainNodes = [
      { x: 382, y: 694, ang: 1.66, type: 'face' },
      { x: 374, y: 728, ang: 1.62, type: 'edge' },
      { x: 368, y: 764, ang: 1.58, type: 'face' },
      { x: 366, y: 800, ang: 1.54, type: 'edge' },
      { x: 366, y: 836, ang: 1.50, type: 'face' },
      { x: 368, y: 872, ang: 1.44, type: 'edge' },
      { x: 376, y: 908, ang: 1.32, type: 'face' },
      { x: 392, y: 940, ang: 1.02, type: 'edge' },
      { x: 418, y: 964, ang: 0.52, type: 'face' },
      { x: 454, y: 970, ang: -0.12, type: 'edge' },
      { x: 488, y: 956, ang: -0.78, type: 'face' },
      { x: 512, y: 926, ang: -1.24, type: 'edge' },
      { x: 526, y: 890, ang: -1.46, type: 'face' },
      { x: 534, y: 852, ang: -1.56, type: 'edge' },
      { x: 534, y: 814, ang: -1.62, type: 'face' }
    ];

    for (const node of chainNodes) {
      if (node.type === 'face') {
        this.paintStadiumChainRing(ctx, node.x, node.y, node.ang, rng);
      }
    }

    for (const node of chainNodes) {
      if (node.type === 'edge') {
        this.paintStadiumSideLink(ctx, node.x, node.y, node.ang, rng);
      }
    }
  }

  paintStadiumChainRing(ctx, x, y, ang, rng, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    if (scale !== 1.0) ctx.scale(scale, scale);

    const makeStadium = (p, hw, hh, r) => {
      p.moveTo(-hw + r, -hh);
      p.lineTo(hw - r, -hh);
      p.quadraticCurveTo(hw, -hh, hw, -hh + r);
      p.lineTo(hw, hh - r);
      p.quadraticCurveTo(hw, hh, hw - r, hh);
      p.lineTo(-hw + r, hh);
      p.quadraticCurveTo(-hw, hh, -hw, hh - r);
      p.lineTo(-hw, -hInnerClamp(hh, r));
      p.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      p.closePath();
    };
    const hInnerClamp = (hh, r) => hh - r;

    const ringPath = new Path2D();
    makeStadium(ringPath, 34, 22, 17);
    makeStadium(ringPath, 13, 5.5, 4.5);

    ctx.fillStyle = 'rgba(12, 3, 2, 0.90)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ferro escuro / aço queimado com reflexo de brasa infernal e bronze oxidado
    const grad = ctx.createRadialGradient(-8, -8, 3, 0, 0, 38);
    grad.addColorStop(0.0, '#ffb974');
    grad.addColorStop(0.28, '#ba4f22');
    grad.addColorStop(0.62, '#4a1d10');
    grad.addColorStop(0.88, '#240b06');
    grad.addColorStop(1.0, '#120302');
    ctx.fillStyle = grad;
    ctx.fill(ringPath, 'evenodd');

    for (let k = 0; k < 14; k++) {
      const a = rng() * Math.PI * 2;
      const r = 10 + rng() * 14;
      const px = Math.cos(a) * r * 1.25;
      const py = Math.sin(a) * r * 0.75;
      const roll = rng();
      if (roll < 0.48) ctx.fillStyle = 'rgba(18, 4, 2, 0.78)';
      else if (roll < 0.80) ctx.fillStyle = 'rgba(255, 176, 98, 0.58)';
      else ctx.fillStyle = 'rgba(185, 20, 6, 0.62)';
      ctx.beginPath();
      ctx.arc(px, py, 2.0 + rng() * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    const outerOutline = new Path2D();
    makeStadium(outerOutline, 34, 22, 17);
    this.mat.strokeArtisanalInk(ctx, outerOutline, 6.2, '#140402', '#300b06');

    const innerOutline = new Path2D();
    makeStadium(innerOutline, 13, 5.5, 4.5);
    this.mat.strokeArtisanalInk(ctx, innerOutline, 4.5, '#140402', '#300b06');

    ctx.restore();
  }

  paintStadiumSideLink(ctx, x, y, ang, rng, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    if (scale !== 1.0) ctx.scale(scale, scale);

    const rx = 28;
    const ry = 13.5;

    const linkPath = new Path2D();
    linkPath.moveTo(-rx, 0);
    linkPath.bezierCurveTo(-rx, -ry * 1.2, rx, -ry * 1.2, rx, 0);
    linkPath.bezierCurveTo(rx, ry * 1.2, -rx, ry * 1.2, -rx, 0);
    linkPath.closePath();

    ctx.fillStyle = 'rgba(12, 3, 2, 0.76)';
    ctx.beginPath();
    ctx.ellipse(2, 4, rx + 2, ry + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createLinearGradient(0, -ry, 0, ry);
    grad.addColorStop(0.0, '#170503');
    grad.addColorStop(0.28, '#9e431c');
    grad.addColorStop(0.50, '#ffba72');
    grad.addColorStop(0.76, '#4d1b0d');
    grad.addColorStop(1.0, '#120302');
    ctx.fillStyle = grad;
    ctx.fill(linkPath);

    for (let k = 0; k < 9; k++) {
      const px = (rng() - 0.5) * rx * 1.3;
      const py = (rng() - 0.5) * ry * 0.85;
      ctx.fillStyle = rng() > 0.48 ? 'rgba(18, 4, 2, 0.72)' : 'rgba(255, 194, 120, 0.58)';
      ctx.beginPath();
      ctx.arc(px, py, 2.0 + rng() * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    this.mat.strokeArtisanalInk(ctx, linkPath, 6.0, '#140402', '#300b06');

    ctx.restore();
  }

  /**
   * Calcula a posição exata no espaço do personagem/mundo do anel do pomo (538, 794)
   * e da ponta da lâmina (120, 560) para correntes dinâmicas, trilhas de ataque e hitboxes.
   */
  getWeaponWorldAnchors(wPose = {}) {
    const {
      x = 475,
      y = 665,
      scale = 1.0,
      rotation = 0,
      side = 'L'
    } = wPose;
    const isLeft = side === 'L';
    const flipX = isLeft ? 1 : -1;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const toWorld = (lx, ly) => {
      const dx = (lx - 395) * scale * flipX;
      const dy = (ly - 638) * scale;
      return {
        x: x + dx * cos - dy * sin,
        y: y + dx * sin + dy * cos
      };
    };

    return {
      grip: { x, y },
      pommel: toWorld(538, 794),
      collar: toWorld(382, 694),
      bladeTipUpper: toWorld(246, 272),
      bladeBelly: toWorld(48, 518),
      bladeTipLower: toWorld(180, 748)
    };
  }

  /**
   * Desenha a corrente infernal contínua que conecta o anel do pomo da arma
   * diretamente às voltas de corrente enroladas no pulso/antebraço do herói,
   * reagindo com folga natural (slack) ou tensão de ataque.
   */
  paintDynamicPommelToWristChain(ctx, wPose, armPose, bodyScale = 0.76) {
    if (!wPose || !armPose || !armPose.wrist || !armPose.elbow) return;
    const isLeft = (wPose.side || 'L') === 'L';
    const anchors = this.getWeaponWorldAnchors(wPose);
    const pommel = anchors.pommel;

    // Ponto de ancoragem da argola no pulso/braçadeira inferior
    const fDx = armPose.wrist.x - armPose.elbow.x;
    const fDy = armPose.wrist.y - armPose.elbow.y;
    const fAng = Math.atan2(fDy, fDx);
    const perpAng = fAng + Math.PI * 0.5;
    const wristOffset = (isLeft ? 1 : -1) * 28 * bodyScale;

    const wristAnchor = {
      x: armPose.wrist.x + Math.cos(perpAng) * wristOffset,
      y: armPose.wrist.y + Math.sin(perpAng) * wristOffset
    };

    const dx = wristAnchor.x - pommel.x;
    const dy = wristAnchor.y - pommel.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) return;

    // Folga gravitacional (catenária) que diminui quando a arma é arremessada longe do punho
    const sway = wPose.chainSway || 0;
    const tension = Math.min(1.0, Math.max(0, (dist - 120) / 220));
    const sag = (1 - tension * 0.82) * (54 * bodyScale) + Math.abs(sway) * 18;
    const swayX = sway * 24 * bodyScale + (isLeft ? 18 : -18) * bodyScale;

    const ctrlX = (pommel.x + wristAnchor.x) * 0.5 + swayX;
    const ctrlY = Math.max(pommel.y, wristAnchor.y) + sag;

    const linkScale = (wPose.scale || 0.62) * 0.74;
    const numLinks = Math.max(5, Math.min(18, Math.round(dist / (24 * linkScale)) + 2));
    const rng = createRNG(isLeft ? 9701 : 9702);

    const sampleBezier = (t) => {
      const u = 1 - t;
      return {
        x: u * u * pommel.x + 2 * u * t * ctrlX + t * t * wristAnchor.x,
        y: u * u * pommel.y + 2 * u * t * ctrlY + t * t * wristAnchor.y
      };
    };

    const nodes = [];
    for (let i = 0; i <= numLinks; i++) {
      const t = i / numLinks;
      const pt = sampleBezier(t);
      const ptNext = sampleBezier(Math.min(1, t + 0.04));
      const ptPrev = sampleBezier(Math.max(0, t - 0.04));
      const ang = Math.atan2(ptNext.y - ptPrev.y, ptNext.x - ptPrev.x);
      nodes.push({ x: pt.x, y: pt.y, ang, type: i % 2 === 0 ? 'face' : 'edge' });
    }

    // Primeiro passe: elos abertos ('face')
    for (const n of nodes) {
      if (n.type === 'face') {
        this.paintStadiumChainRing(ctx, n.x, n.y, n.ang, rng, linkScale);
      }
    }
    // Segundo passe: elos de perfil ('edge') entrelaçando os abertos
    for (const n of nodes) {
      if (n.type === 'edge') {
        this.paintStadiumSideLink(ctx, n.x, n.y, n.ang, rng, linkScale);
      }
    }
  }
}

