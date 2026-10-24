// ============================================================================
// ProceduralEnvironment.js — Sistema Procedural de Cenários e Ambientes
// Identidade Visual 100% Feita à Mão / Estilo Hades 1 (Jen Zee & Mike Mignola).
// Desenha lajes de ardósia lascadas em nanquim, santuários com relevos de górgona,
// colunas gregas caneladas com capitéis quebrados, chamas estígias pictóricas e
// suporta temas dinâmicos (Tártaro / Asfódelo / Medieval com Navio Fantasma).
// ============================================================================

import { createRNG } from '../materials/MaterialPainter.js';

export const ENVIRONMENT_THEMES = {
  hades_tartarus: {
    id: 'hades_tartarus',
    name: 'Câmara do Submundo (Tártaro / Hades 1)',
    floorType: 'chthonic_slate',
    primaryInk: '#070912',
    palette: ['#1c2032', '#23283d', '#181b2b', '#262c43', '#1b1e2f'],
    walkwayCol: '#2f3652',
    edgeCol: '#141624',
    accentGlow: 'rgba(74, 222, 128, 0.42)',
    secondaryGlow: 'rgba(217, 70, 239, 0.42)',
    meanderColorA: '#f0abfc',
    meanderColorB: '#86efac',
    abyssStyle: 'magma_and_void',
    ambientTint: 'rgba(12, 14, 24, 0.45)'
  },
  medieval_shipwreck: {
    id: 'medieval_shipwreck',
    name: 'Convés Medieval do Galeão Fantasma',
    floorType: 'weathered_planks',
    primaryInk: '#0b0806',
    palette: ['#382419', '#442d1f', '#2f1d14', '#4e3323', '#322016'],
    walkwayCol: '#583a28',
    edgeCol: '#1f130d',
    accentGlow: 'rgba(56, 189, 248, 0.38)',
    secondaryGlow: 'rgba(250, 204, 21, 0.45)',
    meanderColorA: '#facc15',
    meanderColorB: '#38bdf8',
    abyssStyle: 'stormy_ocean',
    ambientTint: 'rgba(10, 16, 26, 0.52)'
  }
};

export class ProceduralEnvironment {
  constructor(theme = 'hades_tartarus') {
    this.theme = typeof theme === 'string'
      ? (ENVIRONMENT_THEMES[theme] || ENVIRONMENT_THEMES.hades_tartarus)
      : theme;
  }

  setTheme(themeKey) {
    if (ENVIRONMENT_THEMES[themeKey]) {
      this.theme = ENVIRONMENT_THEMES[themeKey];
    }
  }

  // ==========================================================================
  // 1. PINCÉIS ARTISANAIS A NANQUIM DURO & EFEITO PAPEL (JEN ZEE / MIGNOLA)
  // ==========================================================================

  /**
   * Traça linha com espessura orgânica irregular e desvios de pena/nanquim
   */
  strokeComicInk(ctx, pathOrFn, baseWidth = 3, color = '#06080e') {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = baseWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 3;

    if (typeof pathOrFn === 'function') {
      ctx.beginPath();
      pathOrFn(ctx);
      ctx.stroke();
    } else if (pathOrFn instanceof Path2D) {
      ctx.stroke(pathOrFn);
    }
    ctx.restore();
  }

  /**
   * Pinta hachuras e granulação de giz sobre pedra/madeira
   */
  paintDryBrushHatching(ctx, x, y, w, h, angle = -0.45, count = 18, color = 'rgba(255,255,255,0.08)', rng) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let i = 0; i < count; i++) {
      const rx = x + (rng ? rng() : Math.random()) * w;
      const ry = y + (rng ? rng() : Math.random()) * h;
      const len = 8 + (rng ? rng() : Math.random()) * 18;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + cos * len, ry + sin * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================================
  // 2. GERAÇÃO PROCEDURAL DO PISO ISOMÉTRICO (Lajes de Ardósia do Submundo)
  // ==========================================================================

  bakeGround(width = 1280, height = 720, seed = 66613) {
    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const c = off.getContext('2d');
    const rng = createRNG(seed);

    const cx = 640;
    const cy = 92;
    const tw = 46;
    const th = 23;
    const toIso = (u, v) => ({
      x: cx + (u - v) * tw,
      y: cy + (u + v) * th
    });

    // 1. Fundo do Abismo do Tártaro / Vazio Cósmico
    this.renderAbyssBackdrop(c, width, height, rng);

    // 2. Paredão Chanfrado de Sustentação Isométrica
    const N = 12;
    this.renderChamberFoundationWalls(c, toIso, N);

    // 3. Lajes de Ardósia Negras com Quinas Lascadas e Nanquim
    this.renderChthonicSlateTiles(c, toIso, N, rng);

    // 4. Friso Grego Luminoso (Neon Magenta e Verde Estígio)
    this.renderGreekFrets(c, toIso);

    // 5. Armadilhas de Espinhos e Medalhão Central de Hades
    this.renderSpikeTrapsAndCenterMedallion(c, toIso, rng);

    // 6. Costelas de Basalto e Sombras Duras Projetadas
    this.renderBasaltRibsAndHardShadows(c);

    // 7. Vinheta e Atmosfera Chthonic
    this.renderAtmosphericVignette(c, width, height);

    return off;
  }

  renderAbyssBackdrop(c, width, height, rng) {
    const voidGrad = c.createRadialGradient(640, 360, 120, 640, 360, 820);
    voidGrad.addColorStop(0.0, '#121422');
    voidGrad.addColorStop(0.55, '#090b14');
    voidGrad.addColorStop(1.0, '#030408');
    c.fillStyle = voidGrad;
    c.fillRect(0, 0, width, height);

    // Fagulhas e poeira espectral do submundo
    for (let i = 0; i < 180; i++) {
      const sx = rng() * width;
      const sy = rng() * height;
      c.fillStyle = rng() > 0.4 ? 'rgba(167, 139, 250, 0.22)' : 'rgba(74, 222, 128, 0.24)';
      c.beginPath();
      c.arc(sx, sy, 0.8 + rng() * 1.8, 0, Math.PI * 2);
      c.fill();
    }

    // Rio de Magma de Asfódelo na borda inferior direita com textura de pedra vulcânica
    c.save();
    const lavaGrad = c.createLinearGradient(740, 520, 1280, 720);
    lavaGrad.addColorStop(0.0, 'rgba(180, 24, 6, 0)');
    lavaGrad.addColorStop(0.25, 'rgba(220, 38, 10, 0.88)');
    lavaGrad.addColorStop(0.55, '#f97316');
    lavaGrad.addColorStop(0.82, '#fbbf24');
    lavaGrad.addColorStop(1.0, '#fef08a');
    c.fillStyle = lavaGrad;
    c.beginPath();
    c.moveTo(610, 720);
    c.lineTo(1280, 375);
    c.lineTo(1280, 720);
    c.closePath();
    c.fill();

    // Crostas vulcânicas escuras flutuando na lava com contornos a nanquim
    for (let i = 0; i < 12; i++) {
      const cxLava = 860 + (i % 4) * 110 + rng() * 30;
      const cyLava = 530 + Math.floor(i / 4) * 65 + rng() * 20;
      c.fillStyle = '#26140e';
      c.strokeStyle = '#0a0504';
      c.lineWidth = 2.8;
      c.beginPath();
      c.ellipse(cxLava, cyLava, 28 + rng() * 22, 12 + rng() * 8, rng() * 0.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    c.restore();

    // Correntes Monumentais do Tártaro cruzando o abismo (feitas à mão com elos volumosos)
    this.renderMonumentalChains(c, 15, 290, 285, 145);
    this.renderMonumentalChains(c, 0, 355, 215, 235);
  }

  renderMonumentalChains(c, x0, y0, x1, y1) {
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 16;
      const ang = Math.atan2(y1 - y0, x1 - x0);
      c.save();
      c.translate(x, y);
      c.rotate(ang);

      // Elos maciços de ferro forjado escuro
      c.fillStyle = '#161928';
      c.strokeStyle = '#05070e';
      c.lineWidth = 3.8;
      c.beginPath();
      c.roundRect(-14, -8, 28, 16, 6);
      c.fill();
      c.stroke();

      // Furo central e brilho de aresta
      c.fillStyle = '#080912';
      c.beginPath();
      c.roundRect(-7, -3.5, 14, 7, 3);
      c.fill();

      c.strokeStyle = 'rgba(148, 163, 210, 0.45)';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(-11, -6);
      c.lineTo(11, -6);
      c.stroke();
      c.restore();
    }
  }

  renderChamberFoundationWalls(c, toIso, N) {
    const wallDepth = 78;
    const pRight = toIso(N, 0);
    const pBottom = toIso(N, N);
    const pLeft = toIso(0, N);

    c.save();
    // Face esquerda do paredão (sombra mais escura)
    c.fillStyle = '#0a0d16';
    c.strokeStyle = '#04050a';
    c.lineWidth = 3.5;
    c.beginPath();
    c.moveTo(pLeft.x, pLeft.y);
    c.lineTo(pBottom.x, pBottom.y);
    c.lineTo(pBottom.x, pBottom.y + wallDepth);
    c.lineTo(pLeft.x, pLeft.y + wallDepth);
    c.closePath();
    c.fill();
    c.stroke();

    // Face direita do paredão (com reflexo âmbar da lava)
    const wallRightGrad = c.createLinearGradient(pBottom.x, pBottom.y, pRight.x, pRight.y + wallDepth);
    wallRightGrad.addColorStop(0.0, '#10131e');
    wallRightGrad.addColorStop(0.7, '#241315');
    wallRightGrad.addColorStop(1.0, '#381610');
    c.fillStyle = wallRightGrad;
    c.beginPath();
    c.moveTo(pBottom.x, pBottom.y);
    c.lineTo(pRight.x, pRight.y);
    c.lineTo(pRight.x, pRight.y + wallDepth);
    c.lineTo(pBottom.x, pBottom.y + wallDepth);
    c.closePath();
    c.fill();
    c.stroke();

    // Friso de blocos de alvenaria ciclópica entalhados no paredão
    c.strokeStyle = '#05070e';
    c.lineWidth = 2.4;
    for (let row = 1; row <= 3; row++) {
      const yOff = row * 24;
      c.beginPath();
      c.moveTo(pLeft.x, pLeft.y + yOff);
      c.lineTo(pBottom.x, pBottom.y + yOff);
      c.lineTo(pRight.x, pRight.y + yOff);
      c.stroke();
    }
    c.restore();
  }

  renderChthonicSlateTiles(c, toIso, N, rng) {
    const theme = this.theme;
    const palette = theme.palette;

    for (let u = 0; u < N; u++) {
      for (let v = 0; v < N; v++) {
        const c0 = toIso(u, v);
        const c1 = toIso(u + 1, v);
        const c2 = toIso(u + 1, v + 1);
        const c3 = toIso(u, v + 1);

        const isWalkway = (u === 2 || u === 9 || v === 2 || v === 9);
        const isEdge = (u === 0 || v === 0 || u === N - 1 || v === N - 1);
        let baseCol = palette[(u * 7 + v * 13) % palette.length];
        if (isWalkway) baseCol = theme.walkwayCol;
        if (isEdge) baseCol = theme.edgeCol;

        // Desenha a laje de ardósia com quinas levemente lascadas (não polígono reto estéril!)
        c.save();
        c.fillStyle = baseCol;
        c.beginPath();
        // Canto 0
        c.moveTo(c0.x + (rng() - 0.5) * 2, c0.y + (rng() - 0.5) * 2);
        // Aresta 0 -> 1 com leve chanfro
        c.lineTo(c1.x + (rng() - 0.5) * 2, c1.y + (rng() - 0.5) * 2);
        // Aresta 1 -> 2
        c.lineTo(c2.x + (rng() - 0.5) * 2, c2.y + (rng() - 0.5) * 2);
        // Aresta 2 -> 3
        c.lineTo(c3.x + (rng() - 0.5) * 2, c3.y + (rng() - 0.5) * 2);
        c.closePath();
        c.fill();

        // Junta de tinta preta a nanquim duro (Mike Mignola / Jen Zee)
        c.strokeStyle = theme.primaryInk;
        c.lineWidth = 2.6;
        c.stroke();

        // Chanfro luminoso sutil na aresta superior iluminada
        c.strokeStyle = isWalkway ? 'rgba(216, 180, 254, 0.28)' : 'rgba(148, 163, 210, 0.14)';
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(c3.x + 2, c3.y);
        c.lineTo(c0.x, c0.y + 1);
        c.lineTo(c1.x - 2, c1.y);
        c.stroke();

        // Textura artesanal de granulação de papel / giz seco
        const mx = (c0.x + c2.x) * 0.5;
        const my = (c0.y + c2.y) * 0.5;
        if (rng() < 0.45) {
          this.paintDryBrushHatching(c, mx - 25, my - 12, 50, 24, -0.45, 8, 'rgba(255,255,255,0.06)', rng);
        }

        // Fissuras orgânicas ramificadas a nanquim (rachaduras na ardósia)
        if (!isWalkway && rng() < 0.38) {
          this.renderOrganicRockCrack(c, mx, my, rng);
        }

        // Friso Grego (Greek Key) desenhado à mão nas lajes da passarela
        if (isWalkway) {
          this.renderHandcraftedGreekTileMotif(c, mx, my, u, v);
        }

        c.restore();
      }
    }
  }

  renderOrganicRockCrack(c, mx, my, rng) {
    c.save();
    c.strokeStyle = '#05070d';
    c.lineWidth = 1.8;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(mx - 14, my - 4);
    const midPx = mx + (rng() - 0.5) * 8;
    const midPy = my + (rng() - 0.5) * 4;
    c.lineTo(midPx, midPy);
    c.lineTo(mx + 16, my + 3);
    c.stroke();

    // Ramificação secundária fina
    if (rng() > 0.5) {
      c.lineWidth = 1.0;
      c.beginPath();
      c.moveTo(midPx, midPy);
      c.lineTo(midPx + (rng() - 0.5) * 12, midPy + 6);
      c.stroke();
    }

    // Borda clara da rachadura (chanfro iluminado)
    c.strokeStyle = 'rgba(148, 163, 210, 0.18)';
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(mx - 13, my - 3);
    c.lineTo(midPx, midPy + 1);
    c.lineTo(mx + 15, my + 4);
    c.stroke();
    c.restore();
  }

  renderHandcraftedGreekTileMotif(c, mx, my, u, v) {
    const isNeonMagenta = (v === 2 || u === 2);
    c.save();
    c.strokeStyle = isNeonMagenta ? 'rgba(217, 70, 239, 0.72)' : 'rgba(74, 222, 128, 0.65)';
    c.lineWidth = 2.0;

    // Losango concêntrico duplo com linhas de pincel
    c.beginPath();
    c.moveTo(mx - 15, my);
    c.lineTo(mx, my - 8);
    c.lineTo(mx + 15, my);
    c.lineTo(mx, my + 8);
    c.closePath();
    c.stroke();

    c.strokeStyle = isNeonMagenta ? 'rgba(240, 171, 252, 0.85)' : 'rgba(134, 239, 172, 0.85)';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(mx - 7, my);
    c.lineTo(mx, my - 4);
    c.lineTo(mx + 7, my);
    c.lineTo(mx, my + 4);
    c.closePath();
    c.stroke();
    c.restore();
  }

  renderGreekFrets(c, toIso) {
    const drawFretStrip = (u0, v0, u1, v1, color, glowColor) => {
      const p0 = toIso(u0, v0);
      const p1 = toIso(u1, v1);
      c.save();
      c.strokeStyle = glowColor;
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.stroke();

      c.strokeStyle = color;
      c.lineWidth = 2.8;
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.stroke();
      c.restore();
    };
    drawFretStrip(0, 1.2, 0, 10.8, '#f0abfc', 'rgba(217, 70, 239, 0.38)');
    drawFretStrip(1.2, 0, 10.8, 0, '#86efac', 'rgba(74, 222, 128, 0.32)');
  }

  renderSpikeTrapsAndCenterMedallion(c, toIso, rng) {
    // 1. Armadilhas de Espinhos em perspectiva isométrica (Spike Pads de Hades 1)
    for (const [tu, tv] of [[2.4, 6.2], [7.8, 2.4]]) {
      const p0 = toIso(tu, tv);
      const p1 = toIso(tu + 1.8, tv);
      const p2 = toIso(tu + 1.8, tv + 1.8);
      const p3 = toIso(tu, tv + 1.8);

      c.save();
      // Moldura em bronze/carmim oxidado com contorno a nanquim
      c.fillStyle = '#4c182d';
      c.strokeStyle = '#07080e';
      c.lineWidth = 3.6;
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.lineTo(p2.x, p2.y);
      c.lineTo(p3.x, p3.y);
      c.closePath();
      c.fill();
      c.stroke();

      // Placa interna com chanfros metálicos
      const q0 = toIso(tu + 0.2, tv + 0.2);
      const q1 = toIso(tu + 1.6, tv + 0.2);
      const q2 = toIso(tu + 1.6, tv + 1.6);
      const q3 = toIso(tu + 0.2, tv + 1.6);
      c.fillStyle = '#83284b';
      c.strokeStyle = '#f472b6';
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(q0.x, q0.y);
      c.lineTo(q1.x, q1.y);
      c.lineTo(q2.x, q2.y);
      c.lineTo(q3.x, q3.y);
      c.closePath();
      c.fill();
      c.stroke();

      // 9 Orifícios circulares com espinhos pontiagudos de aço
      for (const du of [0.5, 0.9, 1.3]) {
        for (const dv of [0.5, 0.9, 1.3]) {
          const sp = toIso(tu + du, tv + dv);
          c.fillStyle = '#06070c';
          c.beginPath();
          c.ellipse(sp.x, sp.y, 6.5, 3.8, 0, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#cbd5e1';
          c.beginPath();
          c.moveTo(sp.x - 2.5, sp.y + 1);
          c.lineTo(sp.x, sp.y - 4);
          c.lineTo(sp.x + 2.5, sp.y + 1);
          c.closePath();
          c.fill();
        }
      }
      c.restore();
    }

    // 2. Medalhão Central de Hades / Caos
    const center = toIso(6, 6);
    c.save();
    c.translate(center.x, center.y);
    c.scale(1, 0.5); // Projeção isométrica 2:1

    // Halo circular externo em nanquim e ouro antigo
    c.fillStyle = '#17142b';
    c.strokeStyle = '#06080e';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(0, 0, 118, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    c.strokeStyle = '#c084fc';
    c.lineWidth = 3.5;
    c.beginPath();
    c.arc(0, 0, 112, 0, Math.PI * 2);
    c.stroke();

    // 8 Raios triangulares do Selo Primordial
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      c.save();
      c.rotate(a);
      c.fillStyle = i % 2 === 0 ? '#312e59' : '#221f42';
      c.strokeStyle = '#06080e';
      c.lineWidth = 3.2;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(22, -45);
      c.lineTo(0, -112);
      c.lineTo(-22, -45);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    }

    // Núcleo em brasa incandescente
    const coreGrad = c.createRadialGradient(0, 0, 4, 0, 0, 48);
    coreGrad.addColorStop(0.0, '#fef08a');
    coreGrad.addColorStop(0.42, '#ef4444');
    coreGrad.addColorStop(1.0, '#3b0764');
    c.fillStyle = coreGrad;
    c.beginPath();
    c.arc(0, 0, 48, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 4;
    c.strokeStyle = '#fde68a';
    c.stroke();
    c.restore();
  }

  renderBasaltRibsAndHardShadows(c) {
    // Costelas gigantes de monstro marinho / titã na borda do magma
    const drawBasaltRib = (rx, ry, scale = 1) => {
      c.save();
      c.translate(rx, ry);
      c.scale(scale, scale);
      const ribGrad = c.createLinearGradient(0, 20, 0, -95);
      ribGrad.addColorStop(0.0, '#ea580c');
      ribGrad.addColorStop(0.45, '#785540');
      ribGrad.addColorStop(1.0, '#241e22');
      c.fillStyle = ribGrad;
      c.strokeStyle = '#06070a';
      c.lineWidth = 4.5;
      c.beginPath();
      c.moveTo(-22, 24);
      c.quadraticCurveTo(-28, -42, -8, -92);
      c.lineTo(16, -86);
      c.quadraticCurveTo(8, -32, 20, 24);
      c.closePath();
      c.fill();
      c.stroke();

      // Sombras duras a nanquim (estilo Mignola)
      c.fillStyle = '#06070a';
      c.beginPath();
      c.ellipse(-4, -68, 8, 12, 0.2, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };
    drawBasaltRib(765, 655, 0.92);
    drawBasaltRib(865, 610, 1.02);
    drawBasaltRib(965, 562, 1.08);
    drawBasaltRib(1065, 512, 1.0);
    drawBasaltRib(1160, 462, 0.9);

    // Sombras projetadas duras dos pilares e estátuas a 35°
    const castHardShadow = (px, py, lenX, lenY, width) => {
      c.save();
      c.fillStyle = 'rgba(4, 6, 12, 0.78)';
      c.beginPath();
      c.moveTo(px - width * 0.5, py);
      c.lineTo(px + width * 0.5, py);
      c.lineTo(px + lenX + width * 0.65, py + lenY);
      c.lineTo(px + lenX - width * 0.65, py + lenY);
      c.closePath();
      c.fill();
      c.restore();
    };
    castHardShadow(565, 235, -135, 68, 64);
    castHardShadow(335, 345, -125, 62, 46);
    castHardShadow(910, 310, -125, 62, 46);

    // Poças de luz verde e magenta difusa projetadas nas lajes
    const drawLightPool = (lx, ly, rx, ry, rgbaInner) => {
      const lg = c.createRadialGradient(lx, ly, 8, lx, ly, rx);
      lg.addColorStop(0.0, rgbaInner);
      lg.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      c.save();
      c.translate(lx, ly);
      c.scale(1, ry / rx);
      c.fillStyle = lg;
      c.beginPath();
      c.arc(0, 0, rx, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };
    drawLightPool(565, 265, 195, 110, 'rgba(134, 239, 172, 0.28)');
    drawLightPool(1015, 415, 150, 88, 'rgba(74, 222, 128, 0.24)');
    drawLightPool(245, 445, 145, 85, 'rgba(251, 146, 60, 0.24)');
    drawLightPool(860, 210, 145, 85, 'rgba(217, 70, 239, 0.22)');
  }

  renderAtmosphericVignette(c, width, height) {
    const vig = c.createRadialGradient(640, 360, 390, 640, 360, 760);
    vig.addColorStop(0.0, 'rgba(0,0,0,0)');
    vig.addColorStop(1.0, 'rgba(3, 4, 8, 0.62)');
    c.fillStyle = vig;
    c.fillRect(0, 0, width, height);
  }

  // ==========================================================================
  // 3. GERAÇÃO PROCEDURAL DE PROPS FEITOS À MÃO (SANTUÁRIOS, COLUNAS, BRASEIROS)
  // ==========================================================================

  bakeProps() {
    const props = {};
    const rng = createRNG(98765);

    // 1. Santuário Estígio de Obsidiana com Relevos de Górgona e Fogo Verde
    props.palm = this.bakeStygianGorgonShrine(rng);

    // 2. Coluna Grega Canelada Quebrada com Capitel Dórico (Nanquim e Mármore)
    props.ruin = this.bakeRuinedFlutedColumn(rng);

    // 3. Braseiro de Caveira de Asfódelo em Ferro Forjado
    props.barrel = this.bakeAsphodelSkullBrazier(rng);

    return props;
  }

  bakeStygianGorgonShrine(rng) {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');
    const ax = 120, ay = 230;

    ctx.save();

    // Base de Pedra Escura em Degraus Isométricos com Chanfros Lascados
    ctx.fillStyle = '#161d19';
    ctx.strokeStyle = '#050706';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 16);
    ctx.lineTo(ax + 72, ay - 20);
    ctx.lineTo(ax + 66, ay - 105);
    ctx.lineTo(ax, ay - 138);
    ctx.lineTo(ax - 66, ay - 105);
    ctx.lineTo(ax - 72, ay - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Face lateral esquerda sombreada a nanquim
    const faceGrad = ctx.createLinearGradient(ax - 70, ay - 110, ax, ay);
    faceGrad.addColorStop(0, '#2f4f38');
    faceGrad.addColorStop(1, '#1a271f');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 16);
    ctx.lineTo(ax - 72, ay - 20);
    ctx.lineTo(ax - 66, ay - 105);
    ctx.lineTo(ax, ay - 72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Relevo esculpido na pedra: Máscara da Górgona / Caveira Chthonic
    ctx.fillStyle = '#090d0b';
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2.0;
    // Olhos em amêndoa esculpidos na rocha
    ctx.beginPath();
    ctx.ellipse(ax - 28, ay - 68, 8, 5, -0.2, 0, Math.PI * 2);
    ctx.ellipse(ax - 10, ay - 62, 7, 5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Presas de serpente esculpidas
    ctx.beginPath();
    ctx.moveTo(ax - 32, ay - 52);
    ctx.lineTo(ax - 26, ay - 42);
    ctx.lineTo(ax - 22, ay - 50);
    ctx.stroke();

    // Friso de Meandro Grego fluorescente esculpido no pedestal
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2.4;
    for (let i = -2; i <= 1; i++) {
      const gx = ax + i * 24 + 10;
      const gy = ay - 26 - Math.abs(i) * 9;
      ctx.strokeRect(gx - 8, gy - 8, 16, 16);
    }

    // Grande Chama Estígia Pictórica em 4 Camadas Orgânicas (Béziers dinâmicas)
    this.renderHandcraftedFireFlame(ctx, ax, ay - 138, 52, 95, '#ffffff', '#bef264', '#22c55e', '#15803d');

    ctx.restore();
    return { canvas, ax, ay };
  }

  bakeRuinedFlutedColumn(rng) {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    const ax = 90, ay = 215;

    ctx.save();

    // Pedestal de Mármore e Bronze com Dentes Gravados
    ctx.fillStyle = '#2d2926';
    ctx.strokeStyle = '#05060a';
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 15);
    ctx.lineTo(ax + 54, ay - 14);
    ctx.lineTo(ax + 50, ay - 42);
    ctx.lineTo(ax - 50, ay - 42);
    ctx.lineTo(ax - 54, ay - 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fuste da Coluna com Caneluras Verticais Profundas em Nanquim
    const fusteGrad = ctx.createLinearGradient(ax - 44, 0, ax + 44, 0);
    fusteGrad.addColorStop(0.0, '#383e47');
    fusteGrad.addColorStop(0.35, '#8492a6');
    fusteGrad.addColorStop(0.72, '#4b5563');
    fusteGrad.addColorStop(1.0, '#1f242d');
    ctx.fillStyle = fusteGrad;
    ctx.strokeStyle = '#06070c';
    ctx.lineWidth = 3.8;

    ctx.beginPath();
    ctx.moveTo(ax - 42, ay - 42);
    ctx.lineTo(ax - 40, ay - 175);
    // Topo quebrado irregular com quinas pontiagudas de mármore partido
    ctx.lineTo(ax - 22, ay - 188);
    ctx.lineTo(ax, ay - 165);
    ctx.lineTo(ax + 24, ay - 192);
    ctx.lineTo(ax + 40, ay - 170);
    ctx.lineTo(ax + 42, ay - 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Caneluras verticais profundas (sulcos sombreados)
    ctx.strokeStyle = '#0b0d14';
    ctx.lineWidth = 3.2;
    for (const sx of [-28, -14, 0, 14, 28]) {
      ctx.beginPath();
      ctx.moveTo(ax + sx, ay - 45);
      ctx.lineTo(ax + sx * 0.95, ay - 168);
      ctx.stroke();

      // Realce claro de aresta na canelura
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ax + sx + 1.5, ay - 45);
      ctx.lineTo(ax + sx * 0.95 + 1.5, ay - 168);
      ctx.stroke();
      ctx.strokeStyle = '#0b0d14';
      ctx.lineWidth = 3.2;
    }

    // Tambor de coluna caído quebrado no chão ao lado
    ctx.fillStyle = '#4b5563';
    ctx.strokeStyle = '#06070c';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(ax + 52, ay + 2, 18, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    return { canvas, ax, ay };
  }

  bakeAsphodelSkullBrazier(rng) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 210;
    const ctx = canvas.getContext('2d');
    const ax = 80, ay = 180;

    ctx.save();

    // Tripé de Ferro Forjado Retorcido com Garras
    ctx.strokeStyle = '#05070a';
    ctx.lineWidth = 5.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ax, ay - 35);
    ctx.lineTo(ax - 36, ay + 8);
    ctx.moveTo(ax, ay - 35);
    ctx.lineTo(ax + 36, ay + 8);
    ctx.moveTo(ax, ay - 35);
    ctx.lineTo(ax, ay + 14);
    ctx.stroke();

    // Taça / Caldeirão de Ferro com Crânios Gravados
    const bowlGrad = ctx.createLinearGradient(0, ay - 90, 0, ay - 35);
    bowlGrad.addColorStop(0.0, '#3a1f18');
    bowlGrad.addColorStop(0.55, '#22120e');
    bowlGrad.addColorStop(1.0, '#0c0705');
    ctx.fillStyle = bowlGrad;
    ctx.strokeStyle = '#05070a';
    ctx.lineWidth = 3.8;

    ctx.beginPath();
    ctx.moveTo(ax - 44, ay - 75);
    ctx.bezierCurveTo(ax - 46, ay - 35, ax + 46, ay - 35, ax + 44, ay - 75);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Relevo de Crânio Chthonic na frente da taça
    ctx.fillStyle = '#e2d9cc';
    ctx.strokeStyle = '#05070a';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(ax, ay - 55, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#05070a';
    ctx.beginPath();
    ctx.arc(ax - 4, ay - 56, 2.5, 0, Math.PI * 2);
    ctx.arc(ax + 4, ay - 56, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Chama Incandescente de Asfódelo (Vermelho, Laranja, Dourado)
    this.renderHandcraftedFireFlame(ctx, ax, ay - 78, 38, 75, '#ffffff', '#fed7aa', '#f97316', '#b91c1c');

    ctx.restore();
    return { canvas, ax, ay };
  }

  /**
   * Renderizador de Fogo Procedural Pintado à Mão (sem círculos lisos ou gradientes artificiais)
   */
  renderHandcraftedFireFlame(ctx, x, y, width, height, cWhite, cLime, cBody, cDark) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Labareda externa e silhueta escura
    ctx.fillStyle = cDark;
    ctx.beginPath();
    ctx.moveTo(-width * 0.5, 0);
    ctx.quadraticCurveTo(-width * 0.65, -height * 0.5, -width * 0.2, -height * 0.85);
    ctx.quadraticCurveTo(0, -height, width * 0.25, -height * 0.8);
    ctx.quadraticCurveTo(width * 0.65, -height * 0.45, width * 0.5, 0);
    ctx.closePath();
    ctx.fill();

    // 2. Corpo flamejante principal
    ctx.fillStyle = cBody;
    ctx.beginPath();
    ctx.moveTo(-width * 0.4, 0);
    ctx.quadraticCurveTo(-width * 0.48, -height * 0.45, -width * 0.1, -height * 0.75);
    ctx.quadraticCurveTo(width * 0.1, -height * 0.92, width * 0.2, -height * 0.7);
    ctx.quadraticCurveTo(width * 0.48, -height * 0.4, width * 0.4, 0);
    ctx.closePath();
    ctx.fill();

    // 3. Manto intermediário brilhante
    ctx.fillStyle = cLime;
    ctx.beginPath();
    ctx.moveTo(-width * 0.26, 0);
    ctx.quadraticCurveTo(-width * 0.32, -height * 0.35, 0, -height * 0.62);
    ctx.quadraticCurveTo(width * 0.32, -height * 0.35, width * 0.26, 0);
    ctx.closePath();
    ctx.fill();

    // 4. Núcleo incandescente branco puro
    ctx.fillStyle = cWhite;
    ctx.beginPath();
    ctx.moveTo(-width * 0.14, 0);
    ctx.quadraticCurveTo(-width * 0.16, -height * 0.2, 0, -height * 0.38);
    ctx.quadraticCurveTo(width * 0.16, -height * 0.2, width * 0.14, 0);
    ctx.closePath();
    ctx.fill();

    // Fagulhas e brasas subindo
    ctx.fillStyle = cLime;
    for (const [bx, by, br] of [[-12, -height * 0.95, 3], [8, -height * 1.05, 2.5], [18, -height * 0.88, 2]]) {
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ==========================================================================
  // 4. TEMA DECLARATIVO: CONVÉS DO GALEÃO MEDIEVAL (Estética Nanquim / Hades 1)
  // Permite criar novos mapas instantaneamente mantendo o mesmo estilo visual!
  // ==========================================================================

  bakeMedievalShipwreckGround(width = 1280, height = 720, seed = 44102) {
    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const c = off.getContext('2d');
    const rng = createRNG(seed);

    const cx = 640;
    const cy = 92;
    const tw = 46;
    const th = 23;
    const toIso = (u, v) => ({
      x: cx + (u - v) * tw,
      y: cy + (u + v) * th
    });

    // 1. Oceano Tempestuoso Noturno no Fundo
    const seaGrad = c.createRadialGradient(640, 360, 100, 640, 360, 800);
    seaGrad.addColorStop(0.0, '#0a1526');
    seaGrad.addColorStop(0.5, '#050c18');
    seaGrad.addColorStop(1.0, '#02050a');
    c.fillStyle = seaGrad;
    c.fillRect(0, 0, width, height);

    // Ondas revoltas com cristas de espuma a nanquim e giz branco
    c.save();
    c.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    c.lineWidth = 2.4;
    for (let w = 0; w < 24; w++) {
      const wx = (w * 95 + rng() * 30) % width;
      const wy = 420 + Math.floor(w / 4) * 55 + rng() * 20;
      c.beginPath();
      c.moveTo(wx, wy);
      c.bezierCurveTo(wx + 30, wy - 14, wx + 60, wy + 12, wx + 90, wy);
      c.stroke();
    }
    c.restore();

    // 2. Costado e Casco de Carvalho do Navio
    const N = 12;
    const wallDepth = 85;
    const pRight = toIso(N, 0);
    const pBottom = toIso(N, N);
    const pLeft = toIso(0, N);

    c.save();
    // Casco esquerdo
    c.fillStyle = '#1c120c';
    c.strokeStyle = '#080503';
    c.lineWidth = 3.5;
    c.beginPath();
    c.moveTo(pLeft.x, pLeft.y);
    c.lineTo(pBottom.x, pBottom.y);
    c.lineTo(pBottom.x, pBottom.y + wallDepth);
    c.lineTo(pLeft.x, pLeft.y + wallDepth);
    c.closePath();
    c.fill();
    c.stroke();

    // Casco direito
    c.fillStyle = '#261810';
    c.beginPath();
    c.moveTo(pBottom.x, pBottom.y);
    c.lineTo(pRight.x, pRight.y);
    c.lineTo(pRight.x, pRight.y + wallDepth);
    c.lineTo(pBottom.x, pBottom.y + wallDepth);
    c.closePath();
    c.fill();
    c.stroke();

    // Pranchas longitudinais do casco
    c.strokeStyle = '#0a0604';
    c.lineWidth = 2.2;
    for (let r = 1; r <= 3; r++) {
      const yOff = r * 26;
      c.beginPath();
      c.moveTo(pLeft.x, pLeft.y + yOff);
      c.lineTo(pBottom.x, pBottom.y + yOff);
      c.lineTo(pRight.x, pRight.y + yOff);
      c.stroke();
    }
    c.restore();

    // 3. Tábuas de Madeira do Convés Isométrico com Pregos de Ferro e Nanquim
    const plankPalette = ['#3d271a', '#472f21', '#342116', '#4e3424', '#392518'];
    for (let u = 0; u < N; u++) {
      for (let v = 0; v < N; v++) {
        const c0 = toIso(u, v);
        const c1 = toIso(u + 1, v);
        const c2 = toIso(u + 1, v + 1);
        const c3 = toIso(u, v + 1);

        const col = plankPalette[(u * 5 + v * 11) % plankPalette.length];
        c.save();
        c.fillStyle = col;
        c.beginPath();
        c.moveTo(c0.x, c0.y);
        c.lineTo(c1.x, c1.y);
        c.lineTo(c2.x, c2.y);
        c.lineTo(c3.x, c3.y);
        c.closePath();
        c.fill();

        // Linhas de junção de prancha a nanquim escuro
        c.strokeStyle = '#0c0806';
        c.lineWidth = 2.5;
        c.stroke();

        // Fissuras e veios de madeira desenhados à mão
        if (rng() < 0.5) {
          const mx = (c0.x + c2.x) * 0.5;
          const my = (c0.y + c2.y) * 0.5;
          c.strokeStyle = 'rgba(12, 8, 6, 0.7)';
          c.lineWidth = 1.4;
          c.beginPath();
          c.moveTo(mx - 15, my - 6);
          c.lineTo(mx + 15, my + 6);
          c.stroke();

          // Pregos de ferro forjado nas pontas das pranchas
          c.fillStyle = '#050302';
          c.beginPath();
          c.arc(c0.x + 8, c0.y + 4, 2.2, 0, Math.PI * 2);
          c.arc(c2.x - 8, c2.y - 4, 2.2, 0, Math.PI * 2);
          c.fill();
        }

        // Hachura rústica de giz seco
        if (rng() < 0.35) {
          const mx = (c0.x + c2.x) * 0.5;
          const my = (c0.y + c2.y) * 0.5;
          this.paintDryBrushHatching(c, mx - 20, my - 10, 40, 20, -0.4, 6, 'rgba(255,255,255,0.05)', rng);
        }

        c.restore();
      }
    }

    // 4. Cordas náuticas grossas esticadas pelo convés
    this.renderMonumentalChains(c, 40, 310, 310, 160);

    // 5. Poças de luz âmbar dos lampiões de querosene
    const castGlow = (lx, ly, rad, color) => {
      const g = c.createRadialGradient(lx, ly, 4, lx, ly, rad);
      g.addColorStop(0.0, color);
      g.addColorStop(1.0, 'rgba(0,0,0,0)');
      c.save();
      c.scale(1, 0.5);
      c.fillStyle = g;
      c.beginPath();
      c.arc(lx, ly * 2, rad, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };
    castGlow(565, 265, 180, 'rgba(251, 191, 36, 0.28)');
    castGlow(1015, 415, 140, 'rgba(56, 189, 248, 0.24)');
    castGlow(245, 445, 140, 'rgba(251, 146, 60, 0.25)');

    // 6. Vinheta atmosférica de tempestade
    this.renderAtmosphericVignette(c, width, height);

    return off;
  }

  bakeMedievalProps() {
    const props = {};
    const rng = createRNG(77123);

    // 1. Mastro Central Quebrado com Cordas e Lona Rasgada
    props.palm = this.bakeShipMastProp(rng);

    // 2. Canhão Colonial de Bronze Naval com Pátina
    props.ruin = this.bakeBronzeCannonProp(rng);

    // 3. Baú do Tesouro Quebrado Transbordando Moedas de Ouro
    props.barrel = this.bakeTreasureChestProp(rng);

    return props;
  }

  bakeShipMastProp(rng) {
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');
    const ax = 110, ay = 230;

    ctx.save();
    // Base de carvalho com anéis de ferro
    ctx.fillStyle = '#2d1b12';
    ctx.strokeStyle = '#0a0604';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.ellipse(ax, ay, 46, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tronco maciço do mastro quebrado subindo
    const mastGrad = ctx.createLinearGradient(ax - 28, 0, ax + 28, 0);
    mastGrad.addColorStop(0.0, '#3f2618');
    mastGrad.addColorStop(0.45, '#5e3a25');
    mastGrad.addColorStop(1.0, '#1c100a');
    ctx.fillStyle = mastGrad;
    ctx.beginPath();
    ctx.moveTo(ax - 26, ay - 8);
    ctx.lineTo(ax - 22, ay - 170);
    // Ponta estilhaçada do mastro partido
    ctx.lineTo(ax - 8, ay - 198);
    ctx.lineTo(ax + 6, ay - 175);
    ctx.lineTo(ax + 20, ay - 202);
    ctx.lineTo(ax + 24, ay - 170);
    ctx.lineTo(ax + 26, ay - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cordas grossas de cânhamo enroladas em espiral no mastro
    ctx.strokeStyle = '#d4b483';
    ctx.lineWidth = 4.5;
    for (let r = 0; r < 4; r++) {
      const ry = ay - 45 - r * 30;
      ctx.beginPath();
      ctx.moveTo(ax - 25, ry + 10);
      ctx.quadraticCurveTo(ax, ry - 4, ax + 25, ry + 8);
      ctx.stroke();
    }

    // Lampião naval pendurado com chama dourada
    ctx.strokeStyle = '#0a0604';
    ctx.lineWidth = 3.0;
    ctx.strokeRect(ax + 24, ay - 110, 18, 26);
    this.renderHandcraftedFireFlame(ctx, ax + 33, ay - 90, 16, 26, '#ffffff', '#fef08a', '#f59e0b', '#b45309');

    ctx.restore();
    return { canvas, ax, ay };
  }

  bakeBronzeCannonProp(rng) {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 230;
    const ctx = canvas.getContext('2d');
    const ax = 90, ay = 195;

    ctx.save();
    // Carruagem de madeira com rodas reforçadas de ferro
    ctx.fillStyle = '#3a2215';
    ctx.strokeStyle = '#090503';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.roundRect(ax - 46, ay - 35, 92, 38, 6);
    ctx.fill();
    ctx.stroke();

    // Roda de madeira
    ctx.fillStyle = '#22140d';
    ctx.beginPath();
    ctx.arc(ax - 34, ay + 6, 18, 0, Math.PI * 2);
    ctx.arc(ax + 34, ay + 6, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tubo de Bronze do Canhão com Pátina Verde e Sombra a Nanquim
    ctx.save();
    ctx.translate(ax, ay - 42);
    ctx.rotate(-0.35);
    const cannonGrad = ctx.createLinearGradient(0, -18, 0, 18);
    cannonGrad.addColorStop(0.0, '#34d399'); // Pátina esmeralda
    cannonGrad.addColorStop(0.3, '#d97706'); // Bronze dourado
    cannonGrad.addColorStop(0.75, '#78350f'); // Bronze escuro
    cannonGrad.addColorStop(1.0, '#1c1917');
    ctx.fillStyle = cannonGrad;
    ctx.beginPath();
    ctx.moveTo(-45, -16);
    ctx.lineTo(55, -12);
    ctx.lineTo(55, 12);
    ctx.lineTo(-45, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Boca do canhão
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.ellipse(55, 0, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Balas de canhão de ferro forjado empilhadas em pirâmide
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#05070a';
    ctx.lineWidth = 2.4;
    for (const [bx, by] of [[ax + 42, ay + 10], [ax + 56, ay + 10], [ax + 49, ay - 2]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
    return { canvas, ax, ay };
  }

  bakeTreasureChestProp(rng) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');
    const ax = 80, ay = 160;

    ctx.save();
    // Baú de carvalho escuro em perspectiva isométrica
    ctx.fillStyle = '#452b1b';
    ctx.strokeStyle = '#080504';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.roundRect(ax - 38, ay - 42, 76, 44, 4);
    ctx.fill();
    ctx.stroke();

    // Cintas de ferro forjado e fechadura dourada
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(ax - 28, ay - 42, 10, 44);
    ctx.fillRect(ax + 18, ay - 42, 10, 44);
    ctx.strokeRect(ax - 28, ay - 42, 10, 44);
    ctx.strokeRect(ax + 18, ay - 42, 10, 44);

    // Fechadura em latão
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(ax, ay - 22, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tampa aberta inclinada
    ctx.fillStyle = '#593823';
    ctx.beginPath();
    ctx.moveTo(ax - 40, ay - 42);
    ctx.lineTo(ax - 32, ay - 75);
    ctx.lineTo(ax + 44, ay - 68);
    ctx.lineTo(ax + 38, ay - 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Montanha de dobrões e tesouro de ouro brilhante transbordando
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 28; i++) {
      const gx = ax - 24 + (i % 7) * 7 + (rng() - 0.5) * 4;
      const gy = ay - 44 - Math.floor(i / 7) * 5 + (rng() - 0.5) * 3;
      ctx.beginPath();
      ctx.arc(gx, gy, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
    return { canvas, ax, ay };
  }

  // ==========================================================================
  // 5. API CENTRAL DE GERAÇÃO MODULAR DE MAPAS PROCEDURAIS
  // O usuário pode simplesmente declarar o tema e o motor assa o nível completo!
  // ==========================================================================

  generateLevel(themeKey = 'hades_tartarus', width = 1280, height = 720) {
    this.setTheme(themeKey);
    const isMedieval = themeKey === 'medieval_shipwreck';

    const groundCanvas = isMedieval
      ? this.bakeMedievalShipwreckGround(width, height)
      : this.bakeGround(width, height);

    const propSprites = isMedieval
      ? this.bakeMedievalProps()
      : this.bakeProps();

    const props = isMedieval
      ? [
          { type: 'palm', x: 565, y: 245, seed: 1.1 },  // Mastro Central
          { type: 'palm', x: 1015, y: 405, seed: 2.4 }, // Mastro Secundário Leste
          { type: 'ruin', x: 335, y: 345, seed: 0 },    // Canhão Oeste
          { type: 'ruin', x: 910, y: 305, seed: 0 },    // Canhão Nordeste
          { type: 'barrel', x: 245, y: 445, seed: 0 },  // Baú do Tesouro Sudoeste
          { type: 'barrel', x: 860, y: 205, seed: 0 }   // Baú do Tesouro Norte
        ]
      : [
          { type: 'palm', x: 565, y: 245, seed: 1.1 },  // Santuário Estígio Norte
          { type: 'palm', x: 1015, y: 405, seed: 2.4 }, // Santuário Estígio Leste
          { type: 'ruin', x: 335, y: 345, seed: 0 },    // Coluna Quebrada Oeste
          { type: 'ruin', x: 910, y: 305, seed: 0 },    // Coluna Quebrada Nordeste
          { type: 'barrel', x: 245, y: 445, seed: 0 },  // Braseiro de Asfódelo Sudoeste
          { type: 'barrel', x: 860, y: 205, seed: 0 }   // Braseiro de Asfódelo Norte
        ];

    return {
      theme: this.theme,
      groundCanvas,
      propSprites,
      props
    };
  }
}

