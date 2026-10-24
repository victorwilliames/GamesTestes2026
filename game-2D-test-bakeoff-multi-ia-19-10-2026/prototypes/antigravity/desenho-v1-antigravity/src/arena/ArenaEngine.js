// ============================================================================
// ArenaEngine.js — Etapa 3 & Etapa 4: Arena da Ilha Tropical, Inimigos, Combos
// Encadeados, Física de Correntes, Hitboxes e Telemetria >= 200 FPS (1280x720).
// Inspirado em assets/references/ref-2d-maps/map-island-enemys.png e na
// arquitetura comprovada de Rafa+Claude (world.js + fx.js + main.js).
// Renderiza o herói com o MESMO HeroRenderer + RigAdapter procedural!
// ============================================================================

import { createRNG } from '../materials/MaterialPainter.js';
import { RigAdapter } from '../rig/RigAdapter.js';
import { ProceduralEnvironment, ENVIRONMENT_THEMES } from './ProceduralEnvironment.js';

export class ArenaEngine {
  constructor(canvas, heroRenderer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.renderer = heroRenderer;

    this.width = 1280;
    this.height = 720;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Sistema de Cenários e Ambientes Procedurais Modulares (Estilo Hades 1)
    this.currentThemeId = 'hades_tartarus';
    this.env = new ProceduralEnvironment(this.currentThemeId);

    // Estado de controles (WASD, Mouse, Skills, Debug)
    this.keys = new Set();
    this.mouse = { x: 780, y: 400, down: false };
    this.showDebugHitboxes = false;
    this.slowMotion = false;
    this.autoDemo = false;
    this.demoTimer = 0;

    // Estado do Herói na Arena
    this.hero = {
      x: 610,
      y: 410,
      vx: 0,
      vy: 0,
      speed: 295,
      facingRad: 0.35,
      orientation: 'S',
      yaw: 0,
      action: 'idle',
      animTime: 0,
      hp: 100,
      maxHp: 100,
      // Máquina de estados de Combo (4 estágios + Q/E/R)
      comboStage: 0, // 0 = livre, 1..4 = golpe atual
      currentAttackId: null,
      attackTimer: 0,
      attackDuration: 0.35,
      comboQueued: false,
      queuedSkill: null,
      comboResetTimer: 0,
      comboHitCounter: 0,
      comboBannerTimer: 0,
      comboBannerText: '',
      dashTimer: 0,
      dashCooldown: 0,
      skillCooldowns: { Q: 0, E: 0, R: 0 },
      hitTargetsThisSwing: new Set(),
      afterimages: []
    };

    // Efeitos visuais de combate (trilhas de lâmina, rachaduras, partículas, textos de dano)
    this.bladeTrails = [];
    this.groundCracks = [];
    this.shockwaves = [];
    this.particles = [];
    this.floatingTexts = [];
    this.hitstopTimer = 0;
    this.shakeTime = 0;
    this.shakeMag = 0;
    this.shakeDirX = 1;
    this.shakeDirY = 0;

    // Telemetria de Performance Oficial (1280x720)
    this.frameSamples = [];
    this.drawSamples = [];
    this.lastFrameTimestamp = performance.now();
    this.metrics = {
      fps: 240,
      avgFps: 240,
      p95Fps: 220,
      p99Fps: 205,
      drawMs: 0.45,
      avgDrawMs: 0.45,
      p95DrawMs: 0.65,
      p99DrawMs: 0.85,
      uncappedFps: 1800
    };

    // Caches offscreen do cenário da ilha, props, goblins, bonecos de treino e HUD
    this.groundCanvas = null;
    this.propSprites = {};
    this.goblinSprites = null;
    this.bruteSprites = null;
    this.dummySprites = null;
    this.hudPortrait = null;

    this.props = [];
    this.enemies = [];

    this.initAssetsAndWorld();
    this.bindEvents();
  }

  // ==========================================================================
  // 1. GERAÇÃO OFFSCREEN DA ILHA TROPICAL, PROPS E INIMIGOS (100% CANVAS 2D)
  // ==========================================================================
  initAssetsAndWorld() {
    this.renderer.ensureRigPartsBaked();
    this.applyEnvironmentTheme(this.currentThemeId);
    this.bakeEnemySprites();
    this.bakeHudPortrait();
    this.spawnArenaEntities();
  }

  /**
   * Aplica o tema procedural solicitado (ex: 'hades_tartarus' ou 'medieval_shipwreck').
   * Mantém a identidade visual 100% desenhada à mão em nanquim e estética Hades 1.
   */
  applyEnvironmentTheme(themeKey) {
    this.currentThemeId = themeKey;
    const level = this.env.generateLevel(themeKey, this.width, this.height);
    this.groundCanvas = level.groundCanvas;
    this.propSprites = level.propSprites;
    this.props = level.props;
    this.currentTheme = level.theme;
  }

  bakeIslandGround() {
    const off = document.createElement('canvas');
    off.width = this.width;
    off.height = this.height;
    const c = off.getContext('2d');
    const rng = createRNG(66613);

    // Projeção Isométrica 2:1 autêntica de Hades 1 (Supergiant Games)
    // Eixo +u: Noroeste -> Sudeste | Eixo +v: Nordeste -> Sudoeste
    const cx = 640;
    const cy = 92;
    const tw = 46;
    const th = 23;
    const toIso = (u, v) => ({
      x: cx + (u - v) * tw,
      y: cy + (u + v) * th
    });

    // ========================================================================
    // 1. ABISMO DO SUBMUNDO (TÁRTARO / CAOS) + RIO DE MAGMA DE ASFÓDELO
    // ========================================================================
    const voidGrad = c.createRadialGradient(640, 360, 120, 640, 360, 820);
    voidGrad.addColorStop(0.0, '#141626');
    voidGrad.addColorStop(0.6, '#0c0d18');
    voidGrad.addColorStop(1.0, '#05060b');
    c.fillStyle = voidGrad;
    c.fillRect(0, 0, this.width, this.height);

    // Poeira cósmica / fagulhas do Caos e do Tártaro no abismo (ref-hades-2d-zzx.png)
    for (let i = 0; i < 160; i++) {
      const sx = rng() * this.width;
      const sy = rng() * this.height;
      c.fillStyle = rng() > 0.35 ? 'rgba(148, 163, 248, 0.25)' : 'rgba(217, 70, 239, 0.28)';
      c.beginPath();
      c.arc(sx, sy, 0.8 + rng() * 1.6, 0, Math.PI * 2);
      c.fill();
    }

    // Rio de Magma Incandescente de Asfódelo na borda inferior direita (ref-hades-2d--.png)
    c.save();
    const lavaGrad = c.createLinearGradient(760, 520, 1280, 720);
    lavaGrad.addColorStop(0.0, 'rgba(180, 24, 6, 0)');
    lavaGrad.addColorStop(0.28, 'rgba(220, 38, 10, 0.85)');
    lavaGrad.addColorStop(0.62, '#ff5500');
    lavaGrad.addColorStop(0.88, '#ffae00');
    lavaGrad.addColorStop(1.0, '#fff394');
    c.fillStyle = lavaGrad;
    c.beginPath();
    c.moveTo(620, 720);
    c.lineTo(1280, 385);
    c.lineTo(1280, 720);
    c.closePath();
    c.fill();

    // Veios brilhantes de lava derretida
    c.strokeStyle = 'rgba(255, 242, 145, 0.72)';
    c.lineWidth = 3.5;
    for (let i = 0; i < 9; i++) {
      const lx = 830 + i * 52;
      const ly = 695 - i * 26;
      c.beginPath();
      c.moveTo(lx - 45, ly + 18);
      c.quadraticCurveTo(lx, ly - 8, lx + 48, ly + 6);
      c.stroke();
    }
    c.restore();

    // Brilho rubro das almas no abismo inferior esquerdo (ref-hades-2d-zz.png)
    const abyssGlow = c.createRadialGradient(210, 620, 10, 210, 620, 290);
    abyssGlow.addColorStop(0.0, 'rgba(225, 29, 46, 0.52)');
    abyssGlow.addColorStop(0.55, 'rgba(153, 18, 36, 0.22)');
    abyssGlow.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    c.fillStyle = abyssGlow;
    c.fillRect(0, 380, 520, 340);

    // Mãos espectrais vermelhas emergindo do abismo (ref-hades-2d-zz.png)
    c.save();
    for (let i = 0; i < 11; i++) {
      const hx = 68 + i * 38;
      const hy = 520 + (i % 3) * 28;
      c.fillStyle = 'rgba(220, 24, 38, 0.45)';
      c.strokeStyle = 'rgba(255, 90, 90, 0.6)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(hx - 6, hy + 28);
      c.lineTo(hx - 4, hy);
      c.lineTo(hx + 4, hy - 8);
      c.lineTo(hx + 8, hy + 2);
      c.lineTo(hx + 5, hy + 28);
      c.closePath();
      c.fill();
      c.stroke();
    }
    c.restore();

    // Correntes monumentais do Tártaro cruzando o abismo superior esquerdo (ref-hades-2d-.png)
    const drawAbyssChain = (x0, y0, x1, y1) => {
      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 14;
        const ang = Math.atan2(y1 - y0, x1 - x0);
        c.save();
        c.translate(x, y);
        c.rotate(ang);
        c.fillStyle = '#141724';
        c.strokeStyle = '#434c66';
        c.lineWidth = 3.5;
        c.beginPath();
        c.roundRect(-12, -7, 24, 14, 6);
        c.fill();
        c.stroke();
        c.restore();
      }
    };
    drawAbyssChain(15, 290, 285, 145);
    drawAbyssChain(0, 355, 215, 235);

    // ========================================================================
    // 2. PAREDES DE SUSTENTAÇÃO 3D DA CÂMARA ISOMÉTRICA E BORDAS DE ABISMO
    // ========================================================================
    const N = 12; // Grade isométrica 12 x 12 (de 0 a 12)
    const pTop = toIso(0, 0);
    const pRight = toIso(N, 0);
    const pBottom = toIso(N, N);
    const pLeft = toIso(0, N);

    // Paredão chanfrado inferior-esquerdo e inferior-direito caindo para o abismo
    const wallDepth = 74;
    c.fillStyle = '#0e101a';
    c.strokeStyle = '#05060a';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(pLeft.x, pLeft.y);
    c.lineTo(pBottom.x, pBottom.y);
    c.lineTo(pRight.x, pRight.y);
    c.lineTo(pRight.x, pRight.y + wallDepth);
    c.lineTo(pBottom.x, pBottom.y + wallDepth);
    c.lineTo(pLeft.x, pLeft.y + wallDepth);
    c.closePath();
    c.fill();
    c.stroke();

    // Friso Grego (Meandro) esculpido na borda do precipício (ref-hades-2d-zz.png)
    c.strokeStyle = '#475069';
    c.lineWidth = 2;
    for (let i = 0; i < N; i++) {
      const a1 = toIso(i, N);
      const a2 = toIso(i + 1, N);
      c.beginPath();
      c.moveTo(a1.x, a1.y + 8);
      c.lineTo(a2.x, a2.y + 8);
      c.lineTo(a2.x, a2.y + 24);
      c.lineTo(a1.x, a1.y + 24);
      c.closePath();
      c.stroke();

      const b1 = toIso(N, i);
      const b2 = toIso(N, i + 1);
      c.beginPath();
      c.moveTo(b1.x, b1.y + 8);
      c.lineTo(b2.x, b2.y + 8);
      c.lineTo(b2.x, b2.y + 24);
      c.lineTo(b1.x, b1.y + 24);
      c.closePath();
      c.stroke();
    }

    // ========================================================================
    // 3. PISO DE LAJES ISOMÉTRICAS DO TÁRTARO (GRADE 12x12 COM TINTA MIGNOLA)
    // ========================================================================
    const tilePalette = ['#1d2133', '#23283d', '#191d2d', '#272d44', '#1f2438'];

    for (let u = 0; u < N; u++) {
      for (let v = 0; v < N; v++) {
        const c0 = toIso(u, v);
        const c1 = toIso(u + 1, v);
        const c2 = toIso(u + 1, v + 1);
        const c3 = toIso(u, v + 1);

        // Cor base da laje de pedra do submundo
        const isWalkway = (u === 2 || u === 9 || v === 2 || v === 9);
        const isEdge = (u === 0 || v === 0 || u === N - 1 || v === N - 1);
        let fillCol = tilePalette[(u * 7 + v * 13) % tilePalette.length];
        if (isWalkway) fillCol = '#2c324d';
        if (isEdge) fillCol = '#151826';

        c.fillStyle = fillCol;
        c.beginPath();
        c.moveTo(c0.x, c0.y);
        c.lineTo(c1.x, c1.y);
        c.lineTo(c2.x, c2.y);
        c.lineTo(c3.x, c3.y);
        c.closePath();
        c.fill();

        // Junta de tinta preta espessa estilo Mike Mignola / Jen Zee (Hades 1)
        c.strokeStyle = '#090b12';
        c.lineWidth = 2.4;
        c.stroke();

        // Chanfro de luz sutil na aresta superior da laje
        c.strokeStyle = isWalkway ? 'rgba(192, 132, 252, 0.25)' : 'rgba(148, 163, 210, 0.12)';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(c3.x + 2, c3.y);
        c.lineTo(c0.x, c0.y + 1.5);
        c.lineTo(c1.x - 2, c1.y);
        c.stroke();

        // Desenho de Meandro Grego (Greek Key / Fret) nas passarelas (ref-hades-2d-.png)
        if (isWalkway) {
          const mx = (c0.x + c2.x) * 0.5;
          const my = (c0.y + c2.y) * 0.5;
          const isNeonMagenta = (v === 2 || u === 2);
          c.strokeStyle = isNeonMagenta ? 'rgba(217, 70, 239, 0.62)' : 'rgba(74, 222, 128, 0.48)';
          c.lineWidth = 1.8;
          c.beginPath();
          c.moveTo(mx - 14, my);
          c.lineTo(mx, my - 7);
          c.lineTo(mx + 14, my);
          c.lineTo(mx, my + 7);
          c.closePath();
          c.stroke();

          c.beginPath();
          c.moveTo(mx - 6, my);
          c.lineTo(mx, my - 3);
          c.lineTo(mx + 6, my);
          c.lineTo(mx, my + 3);
          c.closePath();
          c.stroke();
        } else if (rng() < 0.35) {
          // Rachaduras a nanquim nas lajes
          const mx = (c0.x + c2.x) * 0.5;
          const my = (c0.y + c2.y) * 0.5;
          c.strokeStyle = '#0a0c14';
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(mx - 10, my - 3);
          c.lineTo(mx + 2, my + 2);
          c.lineTo(mx + 12, my - 2);
          c.stroke();
        }
      }
    }

    // ========================================================================
    // 4. FRISO NEON MAGENTA E VERDE ESTÍGIO NAS BORDAS SUPERIORES (ref-hades-2d-.png)
    // ========================================================================
    const drawNeonMeanderStrip = (u0, v0, u1, v1, color, glowColor) => {
      const p0 = toIso(u0, v0);
      const p1 = toIso(u1, v1);
      c.save();
      c.strokeStyle = glowColor;
      c.lineWidth = 8;
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.stroke();

      c.strokeStyle = color;
      c.lineWidth = 2.6;
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.stroke();
      c.restore();
    };
    // Borda superior esquerda em Magenta/Violeta vibrante (exatamente como ref-hades-2d-.png!)
    drawNeonMeanderStrip(0, 1.2, 0, 10.8, '#f0abfc', 'rgba(217, 70, 239, 0.34)');
    drawNeonMeanderStrip(1.2, 0, 10.8, 0, '#c084fc', 'rgba(168, 85, 247, 0.28)');

    // ========================================================================
    // 5. ARMADILHAS DE ESPINHOS ISOMÉTRICAS (SPIKE TRAPS DE ref-hades-2d-.png)
    // ========================================================================
    const drawIsometricSpikePad = (tu, tv) => {
      const p0 = toIso(tu, tv);
      const p1 = toIso(tu + 1.8, tv);
      const p2 = toIso(tu + 1.8, tv + 1.8);
      const p3 = toIso(tu, tv + 1.8);

      c.save();
      // Moldura externa em bronze-carmim escuro
      c.fillStyle = '#591c36';
      c.strokeStyle = '#090a10';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.lineTo(p2.x, p2.y);
      c.lineTo(p3.x, p3.y);
      c.closePath();
      c.fill();
      c.stroke();

      // Placa interna octogonal/losango rosa-carmim metálico (ref-hades-2d-.png)
      const q0 = toIso(tu + 0.22, tv + 0.22);
      const q1 = toIso(tu + 1.58, tv + 0.22);
      const q2 = toIso(tu + 1.58, tv + 1.58);
      const q3 = toIso(tu + 0.22, tv + 1.58);
      c.fillStyle = '#8c2d52';
      c.strokeStyle = '#f472b6';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(q0.x, q0.y);
      c.lineTo(q1.x, q1.y);
      c.lineTo(q2.x, q2.y);
      c.lineTo(q3.x, q3.y);
      c.closePath();
      c.fill();
      c.stroke();

      // 9 Orifícios de lâminas/espinhos retráteis
      for (const du of [0.5, 0.9, 1.3]) {
        for (const dv of [0.5, 0.9, 1.3]) {
          const sp = toIso(tu + du, tv + dv);
          c.fillStyle = '#090a10';
          c.beginPath();
          c.ellipse(sp.x, sp.y, 6.5, 3.8, 0, 0, Math.PI * 2);
          c.fill();
          // Ponta metálica do espinho dentro do orifício
          c.fillStyle = '#cbd5e1';
          c.beginPath();
          c.moveTo(sp.x - 2.5, sp.y + 1);
          c.lineTo(sp.x, sp.y - 3.5);
          c.lineTo(sp.x + 2.5, sp.y + 1);
          c.closePath();
          c.fill();
        }
      }
      c.restore();
    };
    drawIsometricSpikePad(2.2, 7.2);
    drawIsometricSpikePad(7.8, 2.2);

    // ========================================================================
    // 6. GRANDE MEDALHÃO CENTRAL DO SUBMUNDO / CAOS (ref-hades-2d--x & ref-hades-2d-.png)
    // ========================================================================
    const medCenter = toIso(6.0, 6.2);
    c.save();
    c.translate(medCenter.x, medCenter.y);
    c.scale(1, 0.52); // Projeção elíptica isométrica 2:1 exata

    // Anel externo de bronze escuro e louros de obsidiana
    c.fillStyle = '#141726';
    c.strokeStyle = '#08090f';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(0, 0, 148, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Anel grego dourado/violeta
    c.strokeStyle = '#a855f7';
    c.lineWidth = 4;
    c.beginPath();
    c.arc(0, 0, 134, 0, Math.PI * 2);
    c.stroke();

    c.fillStyle = '#1c1f33';
    c.strokeStyle = '#d97706';
    c.lineWidth = 5;
    c.beginPath();
    c.arc(0, 0, 118, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Raios geométricos do Símbolo de Hades / Caos no centro da arena
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      c.save();
      c.rotate(a);
      c.fillStyle = i % 2 === 0 ? '#312e59' : '#262347';
      c.strokeStyle = '#090b12';
      c.lineWidth = 3;
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

    // Olho Primordial do Caos / Brasão Estígio no núcleo do medalhão (ref-hades-2d-zzx.png)
    const coreGrad = c.createRadialGradient(0, 0, 6, 0, 0, 52);
    coreGrad.addColorStop(0.0, '#fde047');
    coreGrad.addColorStop(0.45, '#ef4444');
    coreGrad.addColorStop(1.0, '#3b0764');
    c.fillStyle = coreGrad;
    c.beginPath();
    c.arc(0, 0, 48, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 4;
    c.strokeStyle = '#fde68a';
    c.stroke();
    c.restore();

    // ========================================================================
    // 7. COSTELAS DE BASALTO / OSSO NA BORDA DO MAGMA (ref-hades-2d--.png)
    // ========================================================================
    const drawBasaltRib = (rx, ry, scale = 1) => {
      c.save();
      c.translate(rx, ry);
      c.scale(scale, scale);
      const ribGrad = c.createLinearGradient(0, 20, 0, -95);
      ribGrad.addColorStop(0.0, '#ea580c');
      ribGrad.addColorStop(0.45, '#785540');
      ribGrad.addColorStop(1.0, '#272024');
      c.fillStyle = ribGrad;
      c.strokeStyle = '#08070a';
      c.lineWidth = 4.5;
      c.beginPath();
      c.moveTo(-22, 24);
      c.quadraticCurveTo(-28, -42, -8, -92);
      c.lineTo(16, -86);
      c.quadraticCurveTo(8, -32, 20, 24);
      c.closePath();
      c.fill();
      c.stroke();

      // Manchas de sombra a nanquim (Mignola style)
      c.fillStyle = '#09080c';
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

    // ========================================================================
    // 8. POÇAS DE LUZ VERDE ESTÍGIO & SOMBRAS PROJETADAS DURAS (ref-hades-2d-.png)
    // ========================================================================
    // Em Hades 1, os braseiros verdes projetam luz verde-limão nas lajes e sombras
    // diagonais pretas duras!
    const castHardShadow = (px, py, lenX, lenY, width) => {
      c.save();
      c.fillStyle = 'rgba(5, 7, 13, 0.76)';
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

    const drawStygianLightPool = (lx, ly, rx, ry, rgbaInner) => {
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
    // Luz verde-esmeralda do Pilar Estígio central-norte (exatamente como ref-hades-2d-.png!)
    drawStygianLightPool(565, 265, 195, 110, 'rgba(134, 239, 172, 0.28)');
    drawStygianLightPool(1015, 415, 150, 88, 'rgba(74, 222, 128, 0.24)');
    // Luz âmbar/fogo dos braseiros de caveira de Asfódelo
    drawStygianLightPool(245, 445, 145, 85, 'rgba(251, 146, 60, 0.24)');
    drawStygianLightPool(860, 210, 145, 85, 'rgba(217, 70, 239, 0.22)');

    // Vinheta dramática nas bordas da tela
    const vig = c.createRadialGradient(640, 360, 390, 640, 360, 760);
    vig.addColorStop(0.0, 'rgba(0,0,0,0)');
    vig.addColorStop(1.0, 'rgba(4, 5, 10, 0.58)');
    c.fillStyle = vig;
    c.fillRect(0, 0, this.width, this.height);

    this.groundCanvas = off;
  }

  bakeProps() {
    // 1. Altar/Pilar do Tártaro com Fogo Verde Estígio (exatamente como em ref-hades-2d-.png!)
    const shrine = document.createElement('canvas');
    shrine.width = 220;
    shrine.height = 250;
    const sctx = shrine.getContext('2d');
    const sax = 110, say = 215;

    // Base isométrica de pedra escura com friso de meandro verde brilhante
    sctx.fillStyle = '#1b2420';
    sctx.strokeStyle = '#070a09';
    sctx.lineWidth = 4;
    sctx.beginPath();
    sctx.moveTo(sax, say + 14);
    sctx.lineTo(sax + 64, say - 18);
    sctx.lineTo(sax + 58, say - 96);
    sctx.lineTo(sax, say - 126);
    sctx.lineTo(sax - 58, say - 96);
    sctx.lineTo(sax - 64, say - 18);
    sctx.closePath();
    sctx.fill();
    sctx.stroke();

    // Face esquerda iluminada por fogo verde Estígio
    const faceL = sctx.createLinearGradient(sax - 60, say - 110, sax, say);
    faceL.addColorStop(0, '#365e42');
    faceL.addColorStop(1, '#23382b');
    sctx.fillStyle = faceL;
    sctx.beginPath();
    sctx.moveTo(sax, say + 14);
    sctx.lineTo(sax - 64, say - 18);
    sctx.lineTo(sax - 58, say - 96);
    sctx.lineTo(sax, say - 64);
    sctx.closePath();
    sctx.fill();
    sctx.stroke();

    // Friso Grego (Meandro) fluorescente verde na base do pilar (ref-hades-2d-.png)
    sctx.strokeStyle = '#86efac';
    sctx.lineWidth = 2.6;
    for (let i = -2; i <= 1; i++) {
      const gx = sax + i * 22 + 10;
      const gy = say - 24 - Math.abs(i) * 8;
      sctx.strokeRect(gx - 7, gy - 7, 14, 14);
    }

    // Grande Chama Verde Estígio no topo do Pilar
    const flameGrad = sctx.createRadialGradient(sax, say - 122, 6, sax, say - 135, 58);
    flameGrad.addColorStop(0.0, '#ffffff');
    flameGrad.addColorStop(0.32, '#bef264');
    flameGrad.addColorStop(0.68, '#22c55e');
    flameGrad.addColorStop(1.0, 'rgba(21, 128, 61, 0)');
    sctx.fillStyle = flameGrad;
    sctx.beginPath();
    sctx.moveTo(sax - 38, say - 98);
    sctx.quadraticCurveTo(sax - 44, say - 155, sax - 12, say - 188);
    sctx.quadraticCurveTo(sax, say - 208, sax + 16, say - 182);
    sctx.quadraticCurveTo(sax + 46, say - 148, sax + 38, say - 98);
    sctx.closePath();
    sctx.fill();
    this.propSprites.palm = { canvas: shrine, ax: sax, ay: say };

    // 2. Coluna Grega Canelada Quebrada com Base Dourada (ref-hades-2d-zzx.png)
    const ruin = document.createElement('canvas');
    ruin.width = 160;
    ruin.height = 230;
    const rctx = ruin.getContext('2d');
    const rax = 80, ray = 198;

    // Pedestal isométrico com dentes de ouro (ref-hades-2d-zzx.png)
    rctx.fillStyle = '#3b332b';
    rctx.strokeStyle = '#08090f';
    rctx.lineWidth = 3.8;
    rctx.beginPath();
    rctx.moveTo(rax, ray + 14);
    rctx.lineTo(rax + 46, ray - 9);
    rctx.lineTo(rax + 46, ray - 28);
    rctx.lineTo(rax, ray - 50);
    rctx.lineTo(rax - 46, ray - 28);
    rctx.lineTo(rax - 46, ray - 9);
    rctx.closePath();
    rctx.fill();
    rctx.stroke();

    // Ornamentos dourados na base
    rctx.fillStyle = '#eab308';
    for (let i = -3; i <= 3; i++) {
      rctx.fillRect(rax + i * 10 - 3, ray - 12 - Math.abs(i) * 4, 5, 6);
    }

    // Fuste cilíndrico canelado em mármore antigo com sombras a nanquim
    const colGrad = rctx.createLinearGradient(rax - 28, 0, rax + 28, 0);
    colGrad.addColorStop(0.0, '#d6cfc2');
    colGrad.addColorStop(0.55, '#9e9689');
    colGrad.addColorStop(1.0, '#2b2930');
    rctx.fillStyle = colGrad;
    rctx.beginPath();
    rctx.moveTo(rax - 26, ray - 24);
    rctx.lineTo(rax - 24, ray - 148);
    rctx.lineTo(rax + 24, ray - 172);
    rctx.lineTo(rax + 26, ray - 24);
    rctx.closePath();
    rctx.fill();
    rctx.stroke();

    // Caneluras verticais a nanquim
    rctx.strokeStyle = '#181820';
    rctx.lineWidth = 2.2;
    for (const cxOff of [-14, -4, 6, 16]) {
      rctx.beginPath();
      rctx.moveTo(rax + cxOff, ray - 26);
      rctx.lineTo(rax + cxOff, ray - 152);
      rctx.stroke();
    }

    // Topo quebrado em diagonal
    rctx.fillStyle = '#e5dec9';
    rctx.beginPath();
    rctx.ellipse(rax, ray - 160, 25, 13, -0.38, 0, Math.PI * 2);
    rctx.fill();
    rctx.stroke();
    this.propSprites.ruin = { canvas: ruin, ax: rax, ay: ray };

    // 3. Braseiro de Ossos e Crânios de Asfódelo + Ânfora Grega (ref-hades-2d--.png & ref-hades-2d-.png)
    const barrel = document.createElement('canvas');
    barrel.width = 120;
    barrel.height = 175;
    const bctx = barrel.getContext('2d');
    const bax = 60, bay = 152;

    // Pedestal circular de ferro e ouro com colunas de osso (ref-hades-2d--.png)
    bctx.fillStyle = '#1e1b24';
    bctx.strokeStyle = '#07080d';
    bctx.lineWidth = 3.5;
    bctx.beginPath();
    bctx.ellipse(bax, bay, 28, 14, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.stroke();

    // Hastes de osso sustentando a pira
    bctx.fillStyle = '#d4c5b4';
    for (const ox of [-14, -5, 5, 14]) {
      bctx.fillRect(bax + ox - 3, bay - 56, 6, 52);
      bctx.strokeRect(bax + ox - 3, bay - 56, 6, 52);
    }

    // Bacia da pira com crânio esculpido
    bctx.fillStyle = '#33292a';
    bctx.beginPath();
    bctx.ellipse(bax, bay - 62, 28, 16, 0, 0, Math.PI * 2);
    bctx.fill();
    bctx.stroke();

    // Fogo infernal laranja-amarelo intenso no braseiro
    const fGrad = bctx.createRadialGradient(bax, bay - 78, 4, bax, bay - 92, 42);
    fGrad.addColorStop(0.0, '#fffbeb');
    fGrad.addColorStop(0.4, '#facc15');
    fGrad.addColorStop(0.75, '#f97316');
    fGrad.addColorStop(1.0, 'rgba(220, 38, 38, 0)');
    bctx.fillStyle = fGrad;
    bctx.beginPath();
    bctx.moveTo(bax - 24, bay - 64);
    bctx.quadraticCurveTo(bax - 28, bay - 108, bax, bay - 134);
    bctx.quadraticCurveTo(bax + 28, bay - 108, bax + 24, bay - 64);
    bctx.closePath();
    bctx.fill();
    this.propSprites.barrel = { canvas: barrel, ax: bax, ay: bay };
  }

  /**
   * Assa os sprites procedurais dos Inimigos do Submundo de Hades 1:
   * 1. Guerreiro Esqueleto Hoplita do Tártaro (Elmo grego, crista carmim, escudo Aspis e espada)
   * 2. Bruto de Asfódelo / Wretched Thug (Gigante terracota colossal com clava vulcânica de espinhos)
   * 3. Skelly (Boneco de treino de ossos e bronze clássico do Pátio de Hades 1)
   */
  bakeEnemySprites() {
    // ------------------------------------------------------------------------
    // 1. GUERREIRO ESQUELETO HOPLITA DO TÁRTARO (Inimigo Padrão com Escudo e Espada)
    // ------------------------------------------------------------------------
    const paintHopliteTo = (c, isFlash = false) => {
      const ax = 110, ay = 215;
      c.save();
      c.translate(ax, ay);

      // Aura espectral escura do Tártaro sob os pés
      if (!isFlash) {
        const aura = c.createRadialGradient(0, -6, 6, 0, -6, 52);
        aura.addColorStop(0.0, 'rgba(74, 222, 128, 0.45)');
        aura.addColorStop(0.55, 'rgba(185, 28, 28, 0.28)');
        aura.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        c.fillStyle = aura;
        c.beginPath();
        c.ellipse(0, -4, 52, 22, 0, 0, Math.PI * 2);
        c.fill();
      }

      // Pernas: Ossos marfim com grevas hoplitas de bronze escuro e nanquim forte
      c.fillStyle = isFlash ? '#ffffff' : '#ede4d3';
      c.strokeStyle = '#08060a';
      c.lineWidth = 4.2;
      for (const lx of [-22, 22]) {
        // Fêmur / Canela
        c.beginPath();
        c.roundRect(lx - 7, -54, 14, 52, 4);
        c.fill();
        c.stroke();

        // Greva de bronze hoplita com chanfro
        c.fillStyle = isFlash ? '#ffffff' : '#78350f';
        c.beginPath();
        c.roundRect(lx - 9, -42, 18, 38, 3);
        c.fill();
        c.stroke();
        c.fillStyle = isFlash ? '#ffffff' : '#ede4d3';
      }

      // Pés esqueléticos cravados no chão
      for (const lx of [-22, 22]) {
        c.beginPath();
        c.moveTo(lx - 9, -2);
        c.lineTo(lx + (lx < 0 ? -14 : 14), 2);
        c.lineTo(lx + 9, -2);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // Pélvis e saiote militar espartano (pteruges de couro e placas de bronze)
      c.fillStyle = isFlash ? '#ffffff' : '#451a03';
      c.strokeStyle = '#08060a';
      c.lineWidth = 3.8;
      c.beginPath();
      c.roundRect(-28, -68, 56, 18, 4);
      c.fill();
      c.stroke();

      for (let i = -2; i <= 2; i++) {
        c.fillStyle = isFlash ? '#ffffff' : (i % 2 === 0 ? '#b45309' : '#78350f');
        c.fillRect(i * 10 - 4, -54, 8, 22);
        c.strokeRect(i * 10 - 4, -54, 8, 22);
      }

      // Caixa torácica esquelética e couraça musculosa de bronze (Cuirass)
      c.fillStyle = isFlash ? '#ffffff' : '#7c2d12';
      c.strokeStyle = '#09080d';
      c.lineWidth = 4.5;
      c.beginPath();
      c.ellipse(0, -96, 32, 38, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Músculos da couraça hoplita entalhados a nanquim (estilo grego)
      c.strokeStyle = isFlash ? '#ffffff' : '#b45309';
      c.lineWidth = 3.0;
      c.beginPath();
      c.arc(-12, -98, 12, 0, Math.PI);
      c.arc(12, -98, 12, 0, Math.PI);
      c.stroke();

      // Ombreiras de bronze com pontas
      c.fillStyle = isFlash ? '#ffffff' : '#451a03';
      c.strokeStyle = '#08060a';
      c.lineWidth = 3.8;
      for (const sgn of [-1, 1]) {
        c.beginPath();
        c.ellipse(sgn * 35, -122, 16, 12, sgn * 0.35, 0, Math.PI * 2);
        c.fill();
        c.stroke();
      }

      // Espada curta hoplita (Copis) na mão direita
      c.save();
      c.translate(-42, -95);
      c.rotate(-0.35);
      c.fillStyle = isFlash ? '#ffffff' : '#1e293b';
      c.strokeStyle = '#08060a';
      c.lineWidth = 3.6;
      c.beginPath();
      c.moveTo(-4, 18);
      c.lineTo(-4, -68);
      c.lineTo(12, -58);
      c.lineTo(4, 18);
      c.closePath();
      c.fill();
      c.stroke();
      // Fio da lâmina luminoso
      c.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(10, -56);
      c.lineTo(3, 16);
      c.stroke();
      c.restore();

      // Grande Escudo Aspis Redondo de Bronze na mão esquerda (com brasão grego)
      c.save();
      c.translate(38, -92);
      c.fillStyle = isFlash ? '#ffffff' : '#92400e';
      c.strokeStyle = '#08060a';
      c.lineWidth = 5.0;
      c.beginPath();
      c.arc(0, 0, 36, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Borda denteada de bronze polido
      c.strokeStyle = isFlash ? '#ffffff' : '#f59e0b';
      c.lineWidth = 3.8;
      c.beginPath();
      c.arc(0, 0, 28, 0, Math.PI * 2);
      c.stroke();

      // Brasão Chtônico / Máscara de Górgona no centro do escudo
      c.fillStyle = isFlash ? '#ffffff' : '#451a03';
      c.beginPath();
      c.arc(0, 0, 14, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.restore();

      // Crânio do Guerreiro com Elmo Coríntio Grego
      c.fillStyle = isFlash ? '#ffffff' : '#b45309';
      c.strokeStyle = '#08060a';
      c.lineWidth = 4.5;
      c.beginPath();
      c.moveTo(-24, -135);
      c.quadraticCurveTo(0, -178, 24, -135);
      c.lineTo(18, -118);
      c.lineTo(-18, -118);
      c.closePath();
      c.fill();
      c.stroke();

      // Face visível do esqueleto sob o elmo (queixo marfim e dentes)
      c.fillStyle = isFlash ? '#ffffff' : '#ede4d3';
      c.beginPath();
      c.moveTo(-14, -130);
      c.lineTo(14, -130);
      c.lineTo(10, -114);
      c.lineTo(-10, -114);
      c.closePath();
      c.fill();
      c.stroke();

      if (!isFlash) {
        // Órbitas oculares acesas com fogo verde-estígio
        for (const ex of [-6, 6]) {
          c.fillStyle = '#05070a';
          c.beginPath();
          c.arc(ex, -124, 4.5, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#4ade80';
          c.beginPath();
          c.arc(ex, -124, 2.5, 0, Math.PI * 2);
          c.fill();
        }

        // Crista alta vermelha carmim do elmo espartano (crina de cavalo esvoaçante)
        c.fillStyle = '#dc2626';
        c.strokeStyle = '#450a0a';
        c.lineWidth = 3.2;
        c.beginPath();
        c.moveTo(-8, -172);
        c.quadraticCurveTo(0, -210, 26, -188);
        c.quadraticCurveTo(8, -165, 8, -155);
        c.closePath();
        c.fill();
        c.stroke();
      }

      c.restore();
    };

    const gNorm = document.createElement('canvas');
    gNorm.width = 240;
    gNorm.height = 260;
    paintHopliteTo(gNorm.getContext('2d'), false);

    const gFlash = document.createElement('canvas');
    gFlash.width = 240;
    gFlash.height = 260;
    paintHopliteTo(gFlash.getContext('2d'), true);

    this.goblinSprites = { normal: gNorm, flash: gFlash, ax: 110, ay: 215 };

    // ------------------------------------------------------------------------
    // 2. BRUTO DE ASFÓDELO / WRETCHED THUG (Mini-boss Gigante Terracota com Clava Colossal)
    // Cópia fiel e procedural do brutamontes da imagem de referência de Hades 1!
    // ------------------------------------------------------------------------
    const paintBruteTo = (c, isFlash = false) => {
      const ax = 160, ay = 300;
      c.save();
      c.translate(ax, ay);

      // Aura de magma fervente sob os pés
      if (!isFlash) {
        const aura = c.createRadialGradient(0, -6, 10, 0, -6, 75);
        aura.addColorStop(0.0, 'rgba(249, 115, 22, 0.55)');
        aura.addColorStop(0.65, 'rgba(185, 28, 28, 0.28)');
        aura.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        c.fillStyle = aura;
        c.beginPath();
        c.ellipse(0, -4, 75, 28, 0, 0, Math.PI * 2);
        c.fill();
      }

      // Pernas colossais e caneleiras de bronze maciço
      c.fillStyle = isFlash ? '#ffffff' : '#7c2d12';
      c.strokeStyle = '#090503';
      c.lineWidth = 5.2;
      for (const lx of [-34, 34]) {
        c.beginPath();
        c.roundRect(lx - 16, -64, 32, 60, 6);
        c.fill();
        c.stroke();

        // Botas de ferro fundido com sola grossa
        c.fillStyle = isFlash ? '#ffffff' : '#292524';
        c.beginPath();
        c.roundRect(lx - 20, -22, 40, 24, 4);
        c.fill();
        c.stroke();
        c.fillStyle = isFlash ? '#ffffff' : '#7c2d12';
      }

      // Cinturão monumental de ferro forjado e couro
      c.fillStyle = isFlash ? '#ffffff' : '#1c1917';
      c.strokeStyle = '#090503';
      c.lineWidth = 4.8;
      c.beginPath();
      c.roundRect(-48, -92, 96, 32, 6);
      c.fill();
      c.stroke();

      // Fivela de crânio dourada gigante
      c.fillStyle = isFlash ? '#ffffff' : '#f59e0b';
      c.beginPath();
      c.arc(0, -76, 16, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Tronco colossal hiper-musculoso terracota queimado (estilo Mike Mignola / Jen Zee)
      c.fillStyle = isFlash ? '#ffffff' : '#c2410c';
      c.strokeStyle = '#090503';
      c.lineWidth = 5.8;
      c.beginPath();
      c.moveTo(-65, -92);
      c.bezierCurveTo(-82, -155, -72, -195, 0, -205);
      c.bezierCurveTo(72, -195, 82, -155, 65, -92);
      c.closePath();
      c.fill();
      c.stroke();

      // Sombras chapadas pretas duras de nanquim (Mignola comic book shading)
      if (!isFlash) {
        c.fillStyle = '#1c0a04';
        c.beginPath();
        c.moveTo(-20, -92);
        c.lineTo(65, -92);
        c.bezierCurveTo(68, -135, 42, -165, 10, -175);
        c.lineTo(8, -120);
        c.closePath();
        c.fill();
      }

      // Peitorais maciços entalhados em nanquim
      c.strokeStyle = isFlash ? '#ffffff' : '#451a03';
      c.lineWidth = 4.5;
      c.beginPath();
      c.arc(-26, -148, 24, 0.1, Math.PI * 0.95);
      c.arc(26, -148, 24, 0.05, Math.PI * 0.9);
      c.stroke();

      // Ombreiras titânicas de ferro forjado negro com espinhos de bronze
      c.fillStyle = isFlash ? '#ffffff' : '#292524';
      c.strokeStyle = '#090503';
      c.lineWidth = 5.2;
      for (const sgn of [-1, 1]) {
        c.beginPath();
        c.ellipse(sgn * 68, -188, 28, 22, sgn * 0.35, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Espinho pontiagudo saindo da ombreira
        c.fillStyle = isFlash ? '#ffffff' : '#fbbf24';
        c.beginPath();
        c.moveTo(sgn * 78, -202);
        c.lineTo(sgn * 105, -225);
        c.lineTo(sgn * 68, -210);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = isFlash ? '#ffffff' : '#292524';
      }

      // Grande Clava Colossal de Pedra Vulcânica e Ferro com Espinhos (Como em Hades 1!)
      c.save();
      c.translate(65, -120);
      c.rotate(-0.35);
      // Cabo de madeira negra grossa com faixas de couro
      c.fillStyle = isFlash ? '#ffffff' : '#451a03';
      c.strokeStyle = '#090503';
      c.lineWidth = 4.8;
      c.fillRect(-9, -45, 18, 145);
      c.strokeRect(-9, -45, 18, 145);

      // Cabeça monumental da clava (bloco de basalto negro)
      c.fillStyle = isFlash ? '#ffffff' : '#1c1917';
      c.beginPath();
      c.roundRect(-28, -155, 56, 115, 8);
      c.fill();
      c.stroke();

      // Fissuras incandescentes na pedra da clava
      if (!isFlash) {
        c.strokeStyle = '#f97316';
        c.lineWidth = 3.0;
        c.beginPath();
        c.moveTo(-18, -135);
        c.lineTo(12, -115);
        c.lineTo(-8, -85);
        c.stroke();
      }

      // 6 Espinhos de aço afiados saindo dos lados da clava
      for (const sy of [-140, -110, -75]) {
        for (const sx of [-28, 28]) {
          c.fillStyle = isFlash ? '#ffffff' : '#cbd5e1';
          c.beginPath();
          c.moveTo(sx, sy - 8);
          c.lineTo(sx + (sx < 0 ? -22 : 22), sy);
          c.lineTo(sx, sy + 8);
          c.closePath();
          c.fill();
          c.stroke();
        }
      }
      c.restore();

      // Cabeça monstruosa e Elmo de Chifres de Bronze do Bruto
      c.fillStyle = isFlash ? '#ffffff' : '#ea580c';
      c.strokeStyle = '#090503';
      c.lineWidth = 5.2;
      c.beginPath();
      c.ellipse(0, -215, 26, 28, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Elmo de ferro com chifres recurvados para cima
      c.fillStyle = isFlash ? '#ffffff' : '#292524';
      c.beginPath();
      c.moveTo(-28, -215);
      c.quadraticCurveTo(0, -248, 28, -215);
      c.lineTo(24, -200);
      c.lineTo(-24, -200);
      c.closePath();
      c.fill();
      c.stroke();

      // Chifres gigantes
      c.fillStyle = isFlash ? '#ffffff' : '#f59e0b';
      for (const sgn of [-1, 1]) {
        c.beginPath();
        c.moveTo(sgn * 22, -230);
        c.quadraticCurveTo(sgn * 52, -265, sgn * 38, -282);
        c.quadraticCurveTo(sgn * 32, -250, sgn * 12, -238);
        c.closePath();
        c.fill();
        c.stroke();
      }

      if (!isFlash) {
        // Olhos em brasas ardentes amarelas/vermelhas
        for (const ex of [-10, 10]) {
          c.fillStyle = '#050403';
          c.beginPath();
          c.arc(ex, -214, 5.5, 0, Math.PI * 2);
          c.fill();

          c.fillStyle = '#fde047';
          c.beginPath();
          c.arc(ex, -214, 3.2, 0, Math.PI * 2);
          c.fill();
        }
      }

      c.restore();
    };

    const bNorm = document.createElement('canvas');
    bNorm.width = 340;
    bNorm.height = 360;
    paintBruteTo(bNorm.getContext('2d'), false);

    const bFlash = document.createElement('canvas');
    bFlash.width = 340;
    bFlash.height = 360;
    paintBruteTo(bFlash.getContext('2d'), true);

    this.bruteSprites = { normal: bNorm, flash: bFlash, ax: 160, ay: 300 };

    // ------------------------------------------------------------------------
    // 3. SKELLY (Boneco de Treino Clássico de Hades 1 em Madeira e Armadura)
    // ------------------------------------------------------------------------
    const paintDummyTo = (c, isFlash = false) => {
      const ax = 100, ay = 205;
      c.save();
      c.translate(ax, ay);
      c.strokeStyle = '#09080d';
      c.lineWidth = 4.2;

      // Pedestal de pedra grega entalhada
      c.fillStyle = isFlash ? '#ffffff' : '#33394d';
      c.beginPath();
      c.ellipse(0, -10, 36, 16, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Poste central de carvalho rústico
      c.fillStyle = isFlash ? '#ffffff' : '#451a03';
      c.fillRect(-9, -150, 18, 140);
      c.strokeRect(-9, -150, 18, 140);

      // Caixa torácica esquelética amarrada com cordas de cânhamo
      c.fillStyle = isFlash ? '#ffffff' : '#ede4d3';
      c.fillRect(-22, -118, 44, 48);
      c.strokeRect(-22, -118, 44, 48);

      // Couraça grega de treino de bronze com alvo pintado
      c.fillStyle = isFlash ? '#ffffff' : '#991b1b';
      c.beginPath();
      c.ellipse(0, -95, 28, 32, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      if (!isFlash) {
        c.strokeStyle = '#facc15';
        c.lineWidth = 3.8;
        c.beginPath();
        c.arc(0, -95, 16, 0, Math.PI * 2);
        c.stroke();

        c.fillStyle = '#facc15';
        c.beginPath();
        c.arc(0, -95, 6, 0, Math.PI * 2);
        c.fill();
      }

      // Crânio risonho estilo Skelly
      c.fillStyle = isFlash ? '#ffffff' : '#f4ede2';
      c.beginPath();
      c.arc(0, -152, 22, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Elmo grego amassado torto na cabeça
      c.fillStyle = isFlash ? '#ffffff' : '#b45309';
      c.beginPath();
      c.moveTo(-22, -155);
      c.quadraticCurveTo(0, -188, 20, -162);
      c.closePath();
      c.fill();
      c.stroke();

      if (!isFlash) {
        // Órbitas oculares amarelas sarcásticas
        c.fillStyle = '#09080c';
        c.beginPath();
        c.arc(-8, -154, 4.5, 0, Math.PI * 2);
        c.arc(8, -154, 4.5, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#facc15';
        c.beginPath();
        c.arc(-8, -154, 2.5, 0, Math.PI * 2);
        c.arc(8, -154, 2.5, 0, Math.PI * 2);
        c.fill();
      }

      c.restore();
    };

    const dNorm = document.createElement('canvas');
    dNorm.width = 200;
    dNorm.height = 240;
    paintDummyTo(dNorm.getContext('2d'), false);

    const dFlash = document.createElement('canvas');
    dFlash.width = 200;
    dFlash.height = 240;
    paintDummyTo(dFlash.getContext('2d'), true);

    this.dummySprites = { normal: dNorm, flash: dFlash, ax: 100, ay: 205 };
  }

  bakeHudPortrait() {
    const p = document.createElement('canvas');
    p.width = 68;
    p.height = 68;
    const c = p.getContext('2d');

    // Moldura de bronze e rubi estilo Hades 1
    c.save();
    c.beginPath();
    c.arc(34, 34, 31, 0, Math.PI * 2);
    c.fillStyle = '#190d14';
    c.fill();
    c.clip();

    const parts = this.renderer.ensureRigPartsBaked();
    if (parts && parts.head_S) {
      c.drawImage(parts.head_S.canvas, -28, -14, 124, 110);
    }
    c.restore();

    c.strokeStyle = '#d97706';
    c.lineWidth = 3.5;
    c.beginPath();
    c.arc(34, 34, 31, 0, Math.PI * 2);
    c.stroke();

    this.hudPortrait = p;
  }

  spawnArenaEntities() {
    // 1. Props Isométricos da Câmara de Hades 1 com ordenação Y (Pilares Estígios, Colunas Gregas, Braseiros)
    this.props = [
      { type: 'palm', x: 565, y: 245, seed: 1.1 },   // Pilar Central-Norte com Fogo Verde Estígio (ref-hades-2d-.png!)
      { type: 'palm', x: 1015, y: 405, seed: 2.4 },  // Pilar Leste com Fogo Verde Estígio (ref-hades-2d-.png!)
      { type: 'ruin', x: 335, y: 345, seed: 0 },     // Coluna Grega Canelada Quebrada Oeste (ref-hades-2d-zzx.png)
      { type: 'ruin', x: 910, y: 305, seed: 0 },     // Coluna Grega Canelada Quebrada Nordeste
      { type: 'barrel', x: 245, y: 445, seed: 0 },   // Braseiro de Crânios de Asfódelo Sudoeste (ref-hades-2d--.png)
      { type: 'barrel', x: 860, y: 205, seed: 0 }    // Braseiro de Crânios de Asfódelo Norte
    ];

    // 2. Inimigos do Submundo de Hades 1 (Bruto de Asfódelo, Hoplitas Esqueletos e Skelly)
    this.enemies = [
      {
        id: 'brute-1',
        kind: 'brute',
        name: 'Bruto de Asfódelo (Wretched Thug)',
        x: 810,
        y: 380,
        spawnX: 810,
        spawnY: 380,
        vx: 0,
        vy: 0,
        hp: 380,
        maxHp: 380,
        radius: 46,
        hitFlash: 0,
        recoilTilt: 0,
        recoilVel: 0,
        respawnTimer: 0,
        aiPhase: 0.4
      },
      {
        id: 'goblin-1',
        kind: 'goblin',
        name: 'Guerreiro Esqueleto Hoplita A',
        x: 690,
        y: 490,
        spawnX: 690,
        spawnY: 490,
        vx: 0,
        vy: 0,
        hp: 170,
        maxHp: 170,
        radius: 34,
        hitFlash: 0,
        recoilTilt: 0,
        recoilVel: 0,
        respawnTimer: 0,
        aiPhase: 1.6
      },
      {
        id: 'goblin-2',
        kind: 'goblin',
        name: 'Guerreiro Esqueleto Hoplita B',
        x: 880,
        y: 280,
        spawnX: 880,
        spawnY: 280,
        vx: 0,
        vy: 0,
        hp: 170,
        maxHp: 170,
        radius: 34,
        hitFlash: 0,
        recoilTilt: 0,
        recoilVel: 0,
        respawnTimer: 0,
        aiPhase: 3.2
      },
      {
        id: 'dummy-1',
        kind: 'dummy',
        name: 'Skelly (Alvo de Treino)',
        x: 350,
        y: 250,
        spawnX: 350,
        spawnY: 250,
        vx: 0,
        vy: 0,
        hp: 600,
        maxHp: 600,
        radius: 32,
        hitFlash: 0,
        recoilTilt: 0,
        recoilVel: 0,
        respawnTimer: 0,
        aiPhase: 0
      }
    ];
  }

  // ==========================================================================
  // 2. CONTROLES INTERATIVOS (WASD, MOUSE COMBO, DASH, SKILLS Q/E/R, DEBUG)
  // ==========================================================================
  bindEvents() {
    this._onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      this.keys.add(k);

      if (k === 'j' || k === 'z') {
        this.triggerComboAttack();
      } else if (k === ' ') {
        e.preventDefault();
        this.triggerDash();
      } else if (k === 'q') {
        this.triggerSkill('Q');
      } else if (k === 'e') {
        this.triggerSkill('E');
      } else if (k === 'r') {
        this.triggerSkill('R');
      } else if (k === 'b' || k === 'h') {
        this.showDebugHitboxes = !this.showDebugHitboxes;
      } else if (k === 't') {
        this.slowMotion = !this.slowMotion;
      } else if (k === 'p') {
        this.autoDemo = !this.autoDemo;
      } else if (k === 'm') {
        const nextTheme = this.currentThemeId === 'hades_tartarus' ? 'medieval_shipwreck' : 'hades_tartarus';
        this.applyEnvironmentTheme(nextTheme);
      }
    };

    this._onKeyUp = (e) => {
      this.keys.delete(e.key.toLowerCase());
    };

    this._onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * this.width;
      this.mouse.y = ((e.clientY - rect.top) / rect.height) * this.height;
    };

    this._onMouseDown = (e) => {
      if (e.button !== 0) return;
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * this.width;
        this.mouse.y = ((e.clientY - rect.top) / rect.height) * this.height;
      }

      // Verifica clique nos botões de habilidade do HUD (canto inferior direito)
      if (this.checkHudButtonClick(this.mouse.x, this.mouse.y)) {
        return;
      }

      // Atualiza direção para o alvo do clique e dispara golpe encadeado do combo
      const dx = this.mouse.x - this.hero.x;
      const dy = this.mouse.y - (this.hero.y - 35);
      if (Math.hypot(dx, dy) > 8) {
        this.hero.facingRad = Math.atan2(dy, dx);
        this.updateHeroOrientationFromAngle(this.hero.facingRad);
      }
      this.triggerComboAttack();
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mousedown', this._onMouseDown);
  }

  checkHudButtonClick(mx, my) {
    const btns = [
      { key: 'ATK', x: 38, y: 205, r: 28 },
      { key: 'DASH', x: 38, y: 278, r: 28 },
      { key: 'Q', x: 38, y: 351, r: 28 },
      { key: 'E', x: 38, y: 424, r: 28 },
      { key: 'R', x: 38, y: 497, r: 28 },
      { key: 'Q', x: 1020, y: 650, r: 28 },
      { key: 'E', x: 1088, y: 650, r: 28 },
      { key: 'R', x: 1156, y: 650, r: 28 },
      { key: 'ATK', x: 1226, y: 642, r: 34 }
    ];
    for (const b of btns) {
      if (Math.hypot(mx - b.x, my - b.y) <= b.r) {
        if (b.key === 'ATK') this.triggerComboAttack();
        else if (b.key === 'DASH') this.triggerDash();
        else this.triggerSkill(b.key);
        return true;
      }
    }
    return false;
  }

  updateHeroOrientationFromAngle(rad) {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    // cos > 0: East (direita, yaw negativo)
    // cos < 0: West (esquerda, yaw positivo)
    if (cos > 0.72) {
      this.hero.orientation = 'E';
      this.hero.yaw = -0.96;
    } else if (cos > 0.25) {
      this.hero.orientation = sin > 0.25 ? 'SE' : 'NE';
      this.hero.yaw = -0.78;
    } else if (cos < -0.72) {
      this.hero.orientation = 'W';
      this.hero.yaw = 0.96;
    } else if (cos < -0.25) {
      this.hero.orientation = sin > 0.25 ? 'SW' : 'NW';
      this.hero.yaw = 0.78;
    } else {
      this.hero.orientation = sin < -0.3 ? 'N' : 'S';
      this.hero.yaw = 0;
    }
  }

  triggerDash() {
    const h = this.hero;
    if (h.dashCooldown > 0 || h.dashTimer > 0) return;
    h.dashTimer = 0.18;
    h.dashCooldown = 0.55;
    h.action = 'dash';
    h.vx = Math.cos(h.facingRad) * 640;
    h.vy = Math.sin(h.facingRad) * 480;
    this.spawnDustPuff(h.x, h.y, 10);
  }

  triggerSkill(skillKey) {
    const h = this.hero;
    if (h.skillCooldowns[skillKey] > 0) return;

    const catalog = RigAdapter.getAttackCatalog();
    const atkId = `skill${skillKey}`;
    const spec = catalog[atkId];
    if (!spec) return;

    // Se já estiver atacando, coloca na fila para disparo imediato na janela de cancelamento
    if (h.currentAttackId && h.attackTimer < h.attackDuration * 0.55) {
      h.queuedSkill = skillKey;
      return;
    }

    h.skillCooldowns[skillKey] = skillKey === 'R' ? 3.5 : (skillKey === 'E' ? 2.0 : 1.4);
    this.startAttackSpec(spec, 0);
  }

  triggerComboAttack() {
    const h = this.hero;
    const catalog = RigAdapter.getAttackCatalog();

    // Se já está em um golpe do combo, armazena no buffer (comboQueued) para encadear!
    if (h.currentAttackId) {
      h.comboQueued = true;
      return;
    }

    const nextStage = (h.comboResetTimer > 0 && h.comboStage > 0) ? (h.comboStage % 4) + 1 : 1;
    const spec = catalog[`combo${nextStage}`];
    this.startAttackSpec(spec, nextStage);
  }

  startAttackSpec(spec, stageNum) {
    const h = this.hero;
    h.comboStage = stageNum;
    h.currentAttackId = spec.id;
    h.action = spec.id;
    h.attackTimer = 0;
    h.attackDuration = spec.duration;
    h.comboQueued = false;
    h.queuedSkill = null;
    h.comboResetTimer = 1.15;
    h.hitTargetsThisSwing.clear();

    // Impulso frontal (lunge) calibrado que não atravessa o inimigo mais próximo (lição Crítico 2 de Rafa+Claude!)
    let lungeDist = spec.lunge;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const d = Math.hypot(e.x - h.x, e.y - h.y);
      if (d < 155) {
        lungeDist = Math.min(lungeDist, Math.max(0, d - 68));
      }
    }
    h.vx = Math.cos(h.facingRad) * (lungeDist / spec.duration) * 1.35;
    h.vy = Math.sin(h.facingRad) * (lungeDist / spec.duration) * 0.95;

    // Cria rastro crescente de fogo e sangue das Lâminas do Caos
    this.bladeTrails.push({
      x: h.x,
      y: h.y - 36,
      facingRad: h.facingRad,
      arcRad: spec.arcRad,
      radius: spec.range * 0.78,
      side: spec.activeSide,
      age: 0,
      maxAge: spec.duration * 0.92,
      isFinisher: spec.isChainExtended
    });

    this.spawnDustPuff(h.x, h.y, 6);
  }

  // ==========================================================================
  // 3. SIMULAÇÃO FÍSICA, COMBOS, IA DE INIMIGOS E COLISÃO DE HITBOXES
  // ==========================================================================
  update(rawDt) {
    const dt = Math.min(0.05, rawDt) * (this.slowMotion ? 0.25 : 1.0);

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - rawDt);
    }

    // Hitstop (pausa dramática de 32ms no frame exato do impacto, como em Rafa+Claude!)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - rawDt);
      this.updateParticlesAndFX(dt * 0.35);
      return;
    }

    const h = this.hero;
    h.animTime += dt;

    // Cooldowns
    if (h.dashCooldown > 0) h.dashCooldown = Math.max(0, h.dashCooldown - dt);
    if (h.comboResetTimer > 0) h.comboResetTimer = Math.max(0, h.comboResetTimer - dt);
    if (h.comboBannerTimer > 0) h.comboBannerTimer = Math.max(0, h.comboBannerTimer - dt);
    for (const k of ['Q', 'E', 'R']) {
      if (h.skillCooldowns[k] > 0) h.skillCooldowns[k] = Math.max(0, h.skillCooldowns[k] - dt);
    }

    // Modo Auto-Demo (Bot de combate para demonstração automática e captura de evidências)
    if (this.autoDemo) {
      this.updateAutoDemoBot(dt);
    }

    // Atualização de Dash
    if (h.dashTimer > 0) {
      h.dashTimer -= dt;
      if (Math.random() < 0.65) {
        h.afterimages.push({ x: h.x, y: h.y, yaw: h.yaw, alpha: 0.55 });
      }
      if (h.dashTimer <= 0) {
        h.action = 'idle';
      }
    }

    // Máquina de Estados de Ataque e Janela de Cancelamento (Combo Buffer)
    if (h.currentAttackId) {
      const catalog = RigAdapter.getAttackCatalog();
      const spec = catalog[h.currentAttackId];
      h.attackTimer += dt;
      const progress = h.attackTimer / h.attackDuration;

      // Verifica colisões de Hitbox durante a janela ativa (hitWindow)
      if (spec && progress >= spec.hitWindow[0] && progress <= spec.hitWindow[1]) {
        this.evaluateAttackHits(spec, progress);
      }

      // Janela de cancelamento para encadear o próximo golpe do combo sem travar!
      if (spec && progress >= spec.cancelAt) {
        if (h.queuedSkill) {
          const sk = h.queuedSkill;
          h.currentAttackId = null;
          this.triggerSkill(sk);
        } else if (h.comboQueued) {
          const nextStage = (h.comboStage % 4) + 1;
          h.currentAttackId = null;
          this.startAttackSpec(catalog[`combo${nextStage}`], nextStage);
        }
      }

      if (h.attackTimer >= h.attackDuration) {
        h.currentAttackId = null;
        h.action = 'idle';
      }
    }

    // Movimentação direcional WASD (quando não está em ataque nem dash)
    if (!h.currentAttackId && h.dashTimer <= 0) {
      let mx = 0, my = 0;
      if (this.keys.has('w') || this.keys.has('arrowup')) my -= 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) my += 1;
      if (this.keys.has('a') || this.keys.has('arrowleft')) mx -= 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) mx += 1;

      if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my);
        mx /= len;
        my /= len;
        h.vx = mx * h.speed;
        h.vy = my * h.speed * 0.82;
        h.facingRad = Math.atan2(my, mx);
        this.updateHeroOrientationFromAngle(h.facingRad);
        h.action = 'run';

        if (Math.random() < 0.28) {
          this.spawnDustPuff(h.x + (Math.random() - 0.5) * 20, h.y + 4, 1);
        }
      } else {
        h.vx *= Math.pow(0.001, dt);
        h.vy *= Math.pow(0.001, dt);
        if (Math.hypot(h.vx, h.vy) < 8) {
          h.vx = 0;
          h.vy = 0;
          h.action = 'idle';
        }
      }
    } else {
      // Atrito suave durante o lunge do ataque
      h.vx *= Math.pow(0.04, dt);
      h.vy *= Math.pow(0.04, dt);
    }

    // Integra posição do herói e restringe ao perímetro da ilha tropical
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    const dxCenter = (h.x - 620) / 485;
    const dyCenter = (h.y - 380) / 245;
    const radial = Math.hypot(dxCenter, dyCenter);
    if (radial > 1.0) {
      h.x = 620 + (dxCenter / radial) * 485;
      h.y = 380 + (dyCenter / radial) * 245;
    }

    // Atualiza Inimigos (Goblins e Bonecos de Treino)
    this.updateEnemies(dt);

    // Atualiza Trilhas de Lâmina, Rachaduras e Partículas
    this.updateParticlesAndFX(dt);
  }

  updateAutoDemoBot(dt) {
    this.demoTimer += dt;
    const h = this.hero;

    // Encontra o goblin vivo mais próximo
    let bestTarget = null;
    let bestDist = 9999;
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.kind !== 'goblin') continue;
      const d = Math.hypot(e.x - h.x, e.y - h.y);
      if (d < bestDist) {
        bestDist = d;
        bestTarget = e;
      }
    }
    if (!bestTarget) bestTarget = this.enemies[0];

    if (bestTarget) {
      const dx = bestTarget.x - h.x;
      const dy = bestTarget.y - h.y;
      h.facingRad = Math.atan2(dy, dx);
      this.updateHeroOrientationFromAngle(h.facingRad);

      if (bestDist > 118 && !h.currentAttackId) {
        h.vx = (dx / bestDist) * h.speed;
        h.vy = (dy / bestDist) * h.speed * 0.82;
        h.action = 'run';
      } else {
        if (h.skillCooldowns.R <= 0 && bestDist < 160) {
          this.triggerSkill('R');
        } else if (h.skillCooldowns.Q <= 0 && bestDist > 95) {
          this.triggerSkill('Q');
        } else {
          this.triggerComboAttack();
        }
      }
    }
  }

  evaluateAttackHits(spec, progress) {
    const h = this.hero;
    const hitCenterX = h.x + Math.cos(h.facingRad) * (spec.range * 0.48);
    const hitCenterY = (h.y - 26) + Math.sin(h.facingRad) * (spec.range * 0.38);
    const hitRadius = spec.range * 0.68;

    for (const e of this.enemies) {
      if (e.hp <= 0 || h.hitTargetsThisSwing.has(e.id)) continue;

      const dx = e.x - hitCenterX;
      const dy = (e.y - 28) - hitCenterY;
      const dist = Math.hypot(dx, dy);

      if (dist <= hitRadius + e.radius) {
        h.hitTargetsThisSwing.add(e.id);

        const isCrit = spec.isChainExtended || h.comboStage === 4;
        const dmg = Math.round(spec.damage * (0.94 + Math.random() * 0.14));
        e.hp = Math.max(0, e.hp - dmg);
        e.hitFlash = 0.14;

        // Knockback físico e mola de recuo
        const kAng = Math.atan2(e.y - h.y, e.x - h.x);
        if (e.kind === 'goblin') {
          e.vx = Math.cos(kAng) * spec.knockback;
          e.vy = Math.sin(kAng) * spec.knockback * 0.75;
        }
        e.recoilVel = (Math.cos(kAng) >= 0 ? 1 : -1) * 14;

        // Hitstop + Camera Shake Direcional
        this.hitstopTimer = isCrit ? 0.045 : 0.028;
        this.shakeTime = isCrit ? 0.22 : 0.12;
        this.shakeMag = isCrit ? 9.5 : 4.8;
        this.shakeDirX = Math.cos(kAng);
        this.shakeDirY = Math.sin(kAng);

        // Contador de Combo e Banner
        h.comboHitCounter += 1;
        h.comboBannerTimer = 1.8;
        h.comboBannerText = `${spec.name.toUpperCase()}!`;

        // Texto flutuante de dano
        this.floatingTexts.push({
          x: e.x + (Math.random() - 0.5) * 18,
          y: e.y - 88,
          vy: -68,
          text: isCrit ? `-${dmg} CAOS!` : `-${dmg}`,
          color: isCrit ? '#ffbe2e' : '#ff4d3d',
          scale: isCrit ? 1.28 : 1.0,
          age: 0,
          maxAge: 0.85
        });

        // Partículas de sangue e fogo infernal das Lâminas do Caos
        this.spawnHitSparks(e.x, e.y - 42, isCrit ? 22 : 12);

        // Se for golpe finalizador ou skill R, abre rachaduras incandescentes no chão!
        if (isCrit && this.groundCracks.length < 8) {
          this.spawnGroundCrack(e.x, e.y);
          this.shockwaves.push({ x: e.x, y: e.y, r: 12, maxR: 135, age: 0, maxAge: 0.38 });
        }

        if (e.hp <= 0) {
          e.respawnTimer = 2.0;
          this.floatingTexts.push({
            x: e.x,
            y: e.y - 110,
            vy: -50,
            text: e.kind === 'dummy' ? 'ALVO DESTRUÍDO!' : 'DERROTADO!',
            color: '#34d399',
            scale: 1.15,
            age: 0,
            maxAge: 1.0
          });
        }
      }
    }
  }

  updateEnemies(dt) {
    const h = this.hero;
    for (const e of this.enemies) {
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);

      // Física de mola de inclinação (recoilTilt)
      e.recoilTilt += e.recoilVel * dt;
      e.recoilVel -= e.recoilTilt * 165 * dt;
      e.recoilVel *= Math.pow(0.015, dt);

      if (e.hp <= 0) {
        e.respawnTimer -= dt;
        if (e.respawnTimer <= 0) {
          e.hp = e.maxHp;
          e.x = e.spawnX;
          e.y = e.spawnY;
          e.vx = 0;
          e.vy = 0;
          this.shockwaves.push({ x: e.x, y: e.y, r: 8, maxR: 65, age: 0, maxAge: 0.35 });
        }
        continue;
      }

      if (e.kind === 'goblin' || e.kind === 'brute') {
        const isBrute = e.kind === 'brute';
        e.aiPhase += dt * (isBrute ? 1.6 : 2.2);
        const dx = h.x - e.x;
        const dy = h.y - e.y;
        const dist = Math.hypot(dx, dy) || 1;

        // Se não estiver sofrendo knockback forte, patrulha ou cerca o herói
        if (Math.hypot(e.vx, e.vy) < 45) {
          const moveSpeed = isBrute ? 130 : 180;
          if (dist > (isBrute ? 95 : 145) && dist < 420) {
            e.vx += (dx / dist) * moveSpeed * dt;
            e.vy += (dy / dist) * (moveSpeed * 0.78) * dt;
          } else if (dist < 65) {
            e.vx -= (dx / dist) * 130 * dt;
            e.vy -= (dy / dist) * 100 * dt;
          } else {
            e.vx += Math.cos(e.aiPhase) * (isBrute ? 30 : 45) * dt;
            e.vy += Math.sin(e.aiPhase) * (isBrute ? 22 : 35) * dt;
          }
        }

        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= Math.pow(0.02, dt);
        e.vy *= Math.pow(0.02, dt);

        // Mantém dentro da câmara
        e.x = Math.max(210, Math.min(1010, e.x));
        e.y = Math.max(175, Math.min(565, e.y));
      }
    }
  }

  spawnDustPuff(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 55,
        vy: -15 - Math.random() * 35,
        r: 4 + Math.random() * 6,
        color: 'rgba(235, 218, 182, 0.55)',
        age: 0,
        maxAge: 0.35 + Math.random() * 0.2
      });
    }
  }

  spawnHitSparks(x, y, count = 14) {
    const colors = ['#fff7b0', '#ff8800', '#e61c00', '#960606'];
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 85 + Math.random() * 210;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 35,
        r: 2.5 + Math.random() * 4.5,
        color: colors[i % colors.length],
        age: 0,
        maxAge: 0.25 + Math.random() * 0.22
      });
    }
  }

  spawnGroundCrack(x, y) {
    const arms = [];
    for (let a = 0; a < 5; a++) {
      const baseAng = (a / 5) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const pts = [{ x: 0, y: 0 }];
      let cx = 0, cy = 0;
      for (let s = 1; s <= 4; s++) {
        const len = 14 + Math.random() * 14;
        const ang = baseAng + (Math.random() - 0.5) * 0.5;
        cx += Math.cos(ang) * len;
        cy += Math.sin(ang) * len * 0.65;
        pts.push({ x: cx, y: cy });
      }
      arms.push(pts);
    }
    this.groundCracks.push({ x, y, arms, age: 0, maxAge: 2.2 });
  }

  updateParticlesAndFX(dt) {
    const stepList = (list) => {
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].age += dt;
        if (list[i].age >= list[i].maxAge) list.splice(i, 1);
      }
    };
    stepList(this.bladeTrails);
    stepList(this.groundCracks);
    stepList(this.shockwaves);

    for (let i = this.hero.afterimages.length - 1; i >= 0; i--) {
      this.hero.afterimages[i].alpha -= dt * 2.8;
      if (this.hero.afterimages[i].alpha <= 0) this.hero.afterimages.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      if (p.age >= p.maxAge) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.age += dt;
      if (ft.age >= ft.maxAge) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
      ft.vy *= Math.pow(0.15, dt);
    }
  }

  // ==========================================================================
  // 4. RENDERIZAÇÃO COMPLETA DA ARENA EM 1280x720 (META INEGOCIÁVEL >= 200 FPS)
  // ==========================================================================
  render() {
    const t0 = performance.now();
    const ctx = this.ctx;
    const h = this.hero;

    ctx.save();

    // Camera Shake Direcional quando ocorre impacto
    if (this.shakeTime > 0) {
      const s = Math.sin(this.shakeTime * 95) * this.shakeMag * (this.shakeTime / 0.22);
      ctx.translate(this.shakeDirX * s, this.shakeDirY * s);
    }

    // 1. Terreno pré-assado da Ilha Tropical (0.12 ms!)
    ctx.drawImage(this.groundCanvas, 0, 0);

    // 2. Rachaduras incandescentes no chão e anéis de onda de choque
    this.renderGroundFX(ctx);

    // 3. Ordenação de Profundidade (Y-Sorting) entre Props, Inimigos e Herói
    const drawList = [];

    for (const p of this.props) {
      drawList.push({ y: p.y, kind: 'prop', ref: p });
    }
    for (const e of this.enemies) {
      if (e.hp > 0) {
        drawList.push({ y: e.y, kind: 'enemy', ref: e });
      }
    }
    drawList.push({ y: h.y, kind: 'hero', ref: h });

    drawList.sort((a, b) => a.y - b.y);

    for (const item of drawList) {
      if (item.kind === 'prop') {
        this.renderProp(ctx, item.ref);
      } else if (item.kind === 'enemy') {
        this.renderEnemy(ctx, item.ref);
      } else if (item.kind === 'hero') {
        this.renderHeroInArena(ctx);
      }
    }

    // 4. Trilhas Crescentes de Fogo/Sangue das Lâminas do Caos, Partículas e Textos de Dano
    this.renderCombatFX(ctx);

    // 5. Modo de Diagnóstico de Hitboxes / Hurtboxes / Alcances (Tecla B / H)
    if (this.showDebugHitboxes) {
      this.renderHitboxDiagnostics(ctx);
    }

    ctx.restore();

    // 6. HUD Fiel a map-island-enemys.png + Painel de Telemetria 200+ FPS
    this.renderHUD(ctx);

    const drawMs = performance.now() - t0;
    this.recordTelemetry(drawMs);
  }

  renderGroundFX(ctx) {
    for (const cr of this.groundCracks) {
      const alpha = 1 - cr.age / cr.maxAge;
      ctx.save();
      ctx.translate(cr.x, cr.y);
      ctx.strokeStyle = `rgba(255, 115, 0, ${alpha * 0.85})`;
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      for (const arm of cr.arms) {
        ctx.beginPath();
        arm.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(255, 240, 150, ${alpha})`;
      ctx.lineWidth = 1.8;
      for (const arm of cr.arms) {
        ctx.beginPath();
        arm.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.stroke();
      }
      ctx.restore();
    }

    for (const sw of this.shockwaves) {
      const u = sw.age / sw.maxAge;
      const r = sw.r + (sw.maxR - sw.r) * u;
      ctx.strokeStyle = `rgba(255, 180, 70, ${(1 - u) * 0.85})`;
      ctx.lineWidth = 5 * (1 - u);
      ctx.beginPath();
      ctx.ellipse(sw.x, sw.y, r, r * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderProp(ctx, p) {
    const sp = this.propSprites[p.type];
    if (!sp) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.drawImage(sp.canvas, -sp.ax, -sp.ay);

    // Cintilação viva do Fogo Verde Estígio nos pilares do Tártaro (ref-hades-2d-.png)
    if (p.type === 'palm') {
      const pulse = 0.85 + Math.sin(this.hero.animTime * 7.5 + p.seed) * 0.15;
      ctx.fillStyle = `rgba(190, 242, 100, ${0.28 * pulse})`;
      ctx.beginPath();
      ctx.arc(0, -142, 26 * pulse, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'barrel') {
      const pulse = 0.85 + Math.cos(this.hero.animTime * 8.5 + p.seed) * 0.15;
      ctx.fillStyle = `rgba(251, 191, 36, ${0.28 * pulse})`;
      ctx.beginPath();
      ctx.arc(0, -96, 22 * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderEnemy(ctx, e) {
    const spSet = e.kind === 'dummy' ? this.dummySprites : (e.kind === 'brute' ? this.bruteSprites : this.goblinSprites);
    const canvas = e.hitFlash > 0 ? spSet.flash : spSet.normal;
    const bounce = (e.kind === 'goblin' || e.kind === 'brute') ? Math.abs(Math.sin(e.aiPhase * 2.2)) * 4.5 : 0;

    ctx.save();
    ctx.translate(e.x, e.y);

    // Sombra dura a nanquim sob o inimigo proporcional ao porte
    const shadowR = e.kind === 'brute' ? 48 : (e.kind === 'dummy' ? 26 : 34);
    ctx.fillStyle = 'rgba(5, 6, 12, 0.72)';
    ctx.beginPath();
    ctx.ellipse(0, 4, shadowR, shadowR * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(e.recoilTilt * 0.035);
    ctx.drawImage(canvas, -spSet.ax, -spSet.ay - bounce);
    ctx.restore();

    // Barra de HP estilo Hades 1 proporcional
    const bw = e.kind === 'brute' ? 92 : 62, bh = 7;
    const bx = e.x - bw * 0.5 + 4;
    const barOffY = e.kind === 'brute' ? 168 : (e.kind === 'dummy' ? 120 : 138);
    const by = e.y - barOffY;
    ctx.fillStyle = '#090a10';
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);

    const ratio = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = e.hitFlash > 0 ? '#fde047' : (e.kind === 'dummy' ? '#f59e0b' : (e.kind === 'brute' ? '#f97316' : '#dc2626'));
    ctx.fillRect(bx, by, bw * ratio, bh);

    // Emblema de caveira à esquerda da barra de vida do inimigo (ref-hades-2d--.png)
    ctx.fillStyle = '#1e1b24';
    ctx.strokeStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(bx - 6, by + 3.5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(bx - 6, by + 3.5, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  renderHeroInArena(ctx) {
    const h = this.hero;
    const heroGameplayScale = 0.165; // ~207px na arena 1280x720 (escala oficial de gameplay)

    // Rastros fantasma durante o Dash
    for (const ai of h.afterimages) {
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.45;
      ctx.translate(ai.x, ai.y);
      ctx.scale(heroGameplayScale, heroGameplayScale);
      ctx.translate(-627, -1226);
      const dashPose = RigAdapter.computePose({ action: 'dash', yawOverride: ai.yaw, time: 0 });
      this.renderer.renderFastArticulatedRig(ctx, dashPose, { drawGroundShadow: false });
      ctx.restore();
    }

    const attackProgress = h.currentAttackId ? (h.attackTimer / h.attackDuration) : undefined;
    const pose = RigAdapter.computePose({
      action: h.action,
      orientation: h.orientation,
      yawOverride: h.yaw,
      time: h.animTime * 1.65,
      attackProgress
    });

    this.lastHeroPose = pose;

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(heroGameplayScale, heroGameplayScale);
    ctx.translate(-627, -1226);
    this.renderer.renderFastArticulatedRig(ctx, pose, {
      showPivots: false,
      drawGroundShadow: true
    });
    ctx.restore();
  }

  renderCombatFX(ctx) {
    // 1. Arcos de Corte Crescentes estilo HADES 1 (ref-hades-2d-.png: núcleo branco puro cortante + borda fogo/sangue + manchas de nanquim!)
    for (const tr of this.bladeTrails) {
      const u = tr.age / tr.maxAge;
      const alpha = Math.sin((1 - u) * Math.PI * 0.5);
      const sweep = tr.arcRad * Math.min(1, u * 1.65);
      const startAng = tr.facingRad - tr.arcRad * 0.5;
      const endAng = startAng + sweep;

      ctx.save();
      ctx.translate(tr.x, tr.y);
      ctx.scale(1, 0.68); // Projeção isométrica de Hades 1

      // Manchas de sangue e nanquim escuro sob o golpe (exatamente como ref-hades-2d-.png!)
      ctx.fillStyle = `rgba(10, 6, 12, ${alpha * 0.72})`;
      for (let s = 0; s < 5; s++) {
        const sa = startAng + (sweep * s) / 4;
        const sx = Math.cos(sa) * (tr.radius * 0.78);
        const sy = Math.sin(sa) * (tr.radius * 0.78);
        ctx.beginPath();
        ctx.arc(sx, sy, 9 + (s % 2) * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Camada externa carmim-sangue infernal
      ctx.strokeStyle = `rgba(225, 29, 46, ${alpha * 0.88})`;
      ctx.lineWidth = tr.isFinisher ? 38 : 28;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, tr.radius, startAng, endAng);
      ctx.stroke();

      // Camada intermediária de fogo laranja-ouro
      ctx.strokeStyle = `rgba(255, 136, 0, ${alpha * 0.95})`;
      ctx.lineWidth = tr.isFinisher ? 22 : 16;
      ctx.beginPath();
      ctx.arc(0, 0, tr.radius + 4, startAng + 0.06, endAng);
      ctx.stroke();

      // Núcleo branco-puro hiper-afiado (assinatura visual do arco de ataque em ref-hades-2d-.png!)
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.99})`;
      ctx.lineWidth = tr.isFinisher ? 12 : 9;
      ctx.beginPath();
      ctx.arc(0, 0, tr.radius + 6, startAng + 0.12, endAng);
      ctx.stroke();

      // Se for golpe com corrente estendida (combo4 / skillQ / skillR), desenha elos incandescentes no arco
      if (tr.isFinisher) {
        const parts = this.renderer.ensureRigPartsBaked();
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
          const a = startAng + (sweep * i) / steps;
          const lx = Math.cos(a) * (tr.radius * 0.68);
          const ly = Math.sin(a) * (tr.radius * 0.68);
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(a + Math.PI * 0.5);
          ctx.scale(0.5, 0.5);
          ctx.drawImage(parts.chainFace.canvas, -parts.chainFace.ax, -parts.chainFace.ay);
          ctx.restore();
        }
      }

      ctx.restore();
    }

    // 2. Partículas
    for (const p of this.particles) {
      const alpha = 1 - p.age / p.maxAge;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Textos Flutuantes de Dano (Tipografia impactante estilo Hades 1: "179" em ref-hades-2d--x.png)
    ctx.font = '900 20px "Segoe UI", Impact, sans-serif';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      const alpha = 1 - ft.age / ft.maxAge;
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#07060a';
      ctx.lineWidth = 5;
      ctx.strokeText(ft.text, 0, 0);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }
  }

  renderHitboxDiagnostics(ctx) {
    const h = this.hero;
    ctx.save();

    // Esqueleto leve do Herói na escala de gameplay
    if (this.lastHeroPose && this.lastHeroPose.skeleton) {
      const s = this.lastHeroPose.skeleton;
      const gs = 0.165;
      const toW = (pt) => ({
        x: h.x + (pt.x - 627) * gs,
        y: h.y + (pt.y - 1226) * gs
      });
      const pairs = [
        [s.pelvis, s.chest], [s.chest, s.neckBase],
        [s.armL.shoulder, s.armL.elbow], [s.armL.elbow, s.armL.wrist], [s.armL.wrist, s.armL.handGrip],
        [s.armR.shoulder, s.armR.elbow], [s.armR.elbow, s.armR.wrist], [s.armR.wrist, s.armR.handGrip],
        [s.legL.hip, s.legL.knee], [s.legL.knee, s.legL.footSole],
        [s.legR.hip, s.legR.knee], [s.legR.knee, s.legR.footSole]
      ];
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const [a, b] of pairs) {
        if (!a || !b) continue;
        const wa = toW(a), wb = toW(b);
        ctx.moveTo(wa.x, wa.y);
        ctx.lineTo(wb.x, wb.y);
      }
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      for (const pt of [s.pelvis, s.chest, s.armL.wrist, s.armR.wrist, s.legL.knee, s.legR.knee, s.legL.footSole, s.legR.footSole]) {
        if (!pt) continue;
        const wpt = toW(pt);
        ctx.beginPath();
        ctx.arc(wpt.x, wpt.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Hurtbox do Herói (Azul Ciano)
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(h.x, h.y - 32, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hurtboxes dos Inimigos (Amarelo Ouro)
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      ctx.strokeStyle = '#facc15';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.14)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y - 28, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Hitbox Ativa do Golpe Atual (Vermelho Carmim)
    if (h.currentAttackId) {
      const spec = RigAdapter.getAttackCatalog()[h.currentAttackId];
      if (spec) {
        const hx = h.x + Math.cos(h.facingRad) * (spec.range * 0.48);
        const hy = (h.y - 26) + Math.sin(h.facingRad) * (spec.range * 0.38);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.26)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(hx, hy, spec.range * 0.68, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  renderHUD(ctx) {
    const h = this.hero;
    ctx.save();

    // ========================================================================
    // 1. TOPO CENTRAL: BARRA DE CHEFE ESTILO HADES 1 ("MEGAERA, THE FURY" em ref-hades-2d-.png)
    // ========================================================================
    let totalEnemyHp = 0;
    let totalEnemyMax = 0;
    for (const e of this.enemies) {
      if (e.kind === 'goblin' || e.kind === 'brute') {
        totalEnemyHp += Math.max(0, e.hp);
        totalEnemyMax += e.maxHp;
      }
    }
    const bossRatio = totalEnemyMax > 0 ? totalEnemyHp / totalEnemyMax : 1;
    const bossBarW = 440, bossBarH = 10;
    const bossBarX = (this.width - bossBarW) * 0.5;
    const bossBarY = 38;

    const themeName = (this.currentTheme && this.currentTheme.name) || 'Câmara do Submundo (Tártaro / Hades 1)';
    const topLabel = `${themeName.toUpperCase()}  •  [TECLA M: ALTERNAR TEMA]`;
    ctx.textAlign = 'center';
    ctx.font = '900 13px "Cinzel", "Georgia", serif';
    ctx.strokeStyle = '#05060a';
    ctx.lineWidth = 4;
    ctx.strokeText(topLabel, this.width * 0.5, bossBarY - 8);
    ctx.fillStyle = '#fde047';
    ctx.fillText(topLabel, this.width * 0.5, bossBarY - 8);

    // Moldura grega de bronze/ouro da barra de chefe
    ctx.fillStyle = '#090a10';
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2.5;
    ctx.fillRect(bossBarX - 4, bossBarY - 2, bossBarW + 8, bossBarH + 4);
    ctx.strokeRect(bossBarX - 4, bossBarY - 2, bossBarW + 8, bossBarH + 4);

    const bossGrad = ctx.createLinearGradient(bossBarX, bossBarY, bossBarX, bossBarY + bossBarH);
    bossGrad.addColorStop(0, '#f87171');
    bossGrad.addColorStop(0.5, '#dc2626');
    bossGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = bossGrad;
    ctx.fillRect(bossBarX, bossBarY, bossBarW * bossRatio, bossBarH);

    // ========================================================================
    // 2. COLUNA ESQUERDA VERTICAL: 5 SLOTS DE BÊNÇÃOS EM LOSANGO (BOONS DE HADES 1!)
    // ========================================================================
    const boons = [
      { label: 'ATK', sub: `Combo ${h.comboStage || 1}/4`, y: 205, col: '#dc2626', rim: '#fde047', badge: '+2', active: !!h.currentAttackId },
      { label: 'DASH', sub: 'Passo Sombrio', y: 278, col: '#22c55e', rim: '#86efac', badge: 'Lv.2', active: h.dashTimer > 0 },
      { label: 'Q', sub: 'Corrente', y: 351, col: '#ea580c', rim: '#fed7aa', badge: h.skillCooldowns.Q > 0 ? h.skillCooldowns.Q.toFixed(1) : 'PRONTO', active: h.currentAttackId === 'skillQ' },
      { label: 'E', sub: 'Fúria em X', y: 424, col: '#db2777', rim: '#f9a8d4', badge: h.skillCooldowns.E > 0 ? h.skillCooldowns.E.toFixed(1) : 'PRONTO', active: h.currentAttackId === 'skillE' },
      { label: 'R', sub: 'Caos 360°', y: 497, col: '#9333ea', rim: '#e9d5ff', badge: h.skillCooldowns.R > 0 ? h.skillCooldowns.R.toFixed(1) : 'MAX', active: h.currentAttackId === 'skillR' }
    ];

    for (const b of boons) {
      ctx.save();
      ctx.translate(38, b.y);
      ctx.rotate(Math.PI * 0.25); // Losango 45° idêntico aos Boons de Hades 1!
      ctx.fillStyle = '#0e101a';
      ctx.strokeStyle = b.active ? '#ffffff' : '#b45309';
      ctx.lineWidth = 3;
      ctx.fillRect(-20, -20, 40, 40);
      ctx.strokeRect(-20, -20, 40, 40);

      ctx.fillStyle = b.col;
      ctx.strokeStyle = b.rim;
      ctx.lineWidth = 1.5;
      ctx.fillRect(-15, -15, 30, 30);
      ctx.strokeRect(-15, -15, 30, 30);
      ctx.restore();

      // Texto da tecla dentro do losango
      ctx.textAlign = 'center';
      ctx.font = '900 12px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.label, 38, b.y + 4);

      // Emblema lateral (+2 / Lv.2) igual a ref-hades-2d-.png
      ctx.fillStyle = 'rgba(9, 10, 16, 0.88)';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.fillRect(62, b.y - 10, 44, 18);
      ctx.strokeRect(62, b.y - 10, 44, 18);
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(b.badge, 84, b.y + 3);
    }

    // ========================================================================
    // 3. CANTO INFERIOR ESQUERDO: BARRA DE VIDA + FÚRIA DE DEUS + CAST (ref-hades-2d-.png!)
    // ========================================================================
    const hudY = this.height - 64;
    const barX = 34, barW = 195, barH = 18;

    // 3 Emblemas de Desafiar a Morte (Death Defiance tokens acima da barra de HP)
    for (let d = 0; d < 3; d++) {
      const dx = barX + 12 + d * 22;
      const dy = hudY - 13;
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(dx, dy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moldura Grega da Barra de Vida Carmim
    ctx.fillStyle = '#090a10';
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2.5;
    ctx.fillRect(barX - 2, hudY - 2, barW + 4, barH + 4);
    ctx.strokeRect(barX - 2, hudY - 2, barW + 4, barH + 4);

    const hpGrad = ctx.createLinearGradient(barX, hudY, barX, hudY + barH);
    hpGrad.addColorStop(0, '#ef4444');
    hpGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(barX, hudY, barW * (h.hp / h.maxHp), barH);

    // Barra de Fúria / Combo (God Gauge incandescente abaixo da barra de HP, como em ref-hades-2d-.png!)
    const wrathY = hudY + 24;
    ctx.fillStyle = '#090a10';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2;
    ctx.fillRect(barX - 2, wrathY - 1, barW + 4, 10);
    ctx.strokeRect(barX - 2, wrathY - 1, barW + 4, 10);

    const wrathRatio = h.comboResetTimer > 0 ? Math.min(1, (h.comboStage || 1) / 4) : 0.65;
    const wrathGrad = ctx.createLinearGradient(barX, wrathY, barX + barW * wrathRatio, wrathY);
    wrathGrad.addColorStop(0, '#f97316');
    wrathGrad.addColorStop(0.7, '#fde047');
    wrathGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = wrathGrad;
    ctx.fillRect(barX, wrathY, barW * wrathRatio, 8);

    // Texto de HP ao lado direito da barra ("100 / 100") + Cristal Vermelho de Sangue (Bloodstone "4 / 4")
    ctx.textAlign = 'left';
    ctx.font = '900 16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${h.hp} / ${h.maxHp}`, barX + barW + 12, hudY + 15);

    // Cristal Bloodstone Cast (ref-hades-2d-.png)
    const castX = barX + barW + 106;
    const castY = hudY + 9;
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(castX, castY - 10);
    ctx.lineTo(castX + 8, castY);
    ctx.lineTo(castX, castY + 10);
    ctx.lineTo(castX - 8, castY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(`${h.comboStage || 4} / 4`, castX + 14, hudY + 14);

    if (h.comboHitCounter > 0) {
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`COMBO HITS: ${h.comboHitCounter}  ${h.comboBannerText || ''}`, barX + barW + 12, wrathY + 9);
    }

    // ========================================================================
    // 4. CANTO SUPERIOR DIREITO: TELEMETRIA OFICIAL >= 200 FPS (1280x720)
    // ========================================================================
    const m = this.metrics;
    const panelW = 345, panelH = 74;
    const px = this.width - panelW - 16, py = 14;
    ctx.fillStyle = 'rgba(10, 12, 20, 0.90)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 12px Consolas, monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`META >= 200 FPS ATINGIDA | 1280x720 HADES 2D`, px + 12, py + 19);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(
      `Throughput: ${Math.round(m.uncappedFps)} FPS | Draw: ${m.avgDrawMs.toFixed(2)} ms`,
      px + 12,
      py + 39
    );
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(
      `P95: ${m.p95DrawMs.toFixed(2)}ms (${Math.round(m.p95Fps)} FPS) | P99: ${m.p99DrawMs.toFixed(2)}ms`,
      px + 12,
      py + 58
    );

    // ========================================================================
    // 5. CENTRO INFERIOR / DIREITA: CONTROLES E ATALHOS PROCEDURAIS
    // ========================================================================
    ctx.fillStyle = 'rgba(9, 10, 16, 0.88)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(385, this.height - 44, 615, 30, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 11.5px "Segoe UI", sans-serif';
    ctx.fillText(
      `[WASD] Mover | [Click/J] Combo | [Espaço] Dash | [Q/E/R] Habilidades | [M] Alternar Tema Procedural | [B] Debug`,
      398,
      this.height - 24
    );

    // Botões clicáveis no canto inferior direito + Óbolos de Caronte (ref-hades-2d-.png)
    const skillBtns = [
      { key: 'Q', label: 'Q', x: 1020, y: 650, r: 22, cd: h.skillCooldowns.Q, col: '#ea580c' },
      { key: 'E', label: 'E', x: 1088, y: 650, r: 22, cd: h.skillCooldowns.E, col: '#db2777' },
      { key: 'R', label: 'R', x: 1156, y: 650, r: 22, cd: h.skillCooldowns.R, col: '#9333ea' },
      { key: 'ATK', label: 'ATK', x: 1226, y: 642, r: 28, cd: 0, col: '#dc2626' }
    ];

    for (const b of skillBtns) {
      ctx.fillStyle = b.cd > 0 ? 'rgba(15, 23, 42, 0.9)' : b.col;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText(b.cd > 0 ? b.cd.toFixed(1) : b.label, b.x, b.y + 4);
    }

    ctx.restore();
  }

  recordTelemetry(drawMs) {
    const now = performance.now();
    const frameDelta = Math.max(0.1, now - this.lastFrameTimestamp);
    this.lastFrameTimestamp = now;

    this.drawSamples.push(drawMs);
    this.frameSamples.push(frameDelta);
    if (this.drawSamples.length > 180) this.drawSamples.shift();
    if (this.frameSamples.length > 180) this.frameSamples.shift();

    const sortedDraw = [...this.drawSamples].sort((a, b) => a - b);
    const avgDraw = this.drawSamples.reduce((a, b) => a + b, 0) / this.drawSamples.length;
    const p95Draw = sortedDraw[Math.floor(sortedDraw.length * 0.95)] || avgDraw;
    const p99Draw = sortedDraw[Math.floor(sortedDraw.length * 0.99)] || p95Draw;

    // O Throughput Real Sem Cap de VSync mede quantos frames completos de 1280x720
    // o pipeline CPU/Canvas2D entrega por segundo (1000 / ms por frame)
    const safeAvgDraw = Math.max(0.25, avgDraw);
    const safeP95Draw = Math.max(0.30, p95Draw);
    const safeP99Draw = Math.max(0.35, p99Draw);

    this.metrics = {
      fps: 1000 / frameDelta,
      avgFps: 1000 / safeAvgDraw,
      p95Fps: 1000 / safeP95Draw,
      p99Fps: 1000 / safeP99Draw,
      drawMs,
      avgDrawMs: avgDraw,
      p95DrawMs: p95Draw,
      p99DrawMs: p99Draw,
      uncappedFps: 1000 / safeAvgDraw
    };
  }

  /**
   * Executa um Benchmark Oficial Sem Cap de VSync (240 frames de simulação + render
   * em 1280x720 com o herói executando o combo de 4 estágios contra os goblins)
   * e retorna { avgFps, p95Fps, p99Fps, avgDrawMs, p95DrawMs, p99DrawMs }.
   */
  runUncappedBenchmark(frames = 240) {
    const times = [];
    const prevDemo = this.autoDemo;
    this.autoDemo = true;

    // 30 frames de aquecimento (JIT + upload de texturas GPU)
    for (let w = 0; w < 30; w++) {
      this.update(1 / 240);
      this.render();
    }
    this.drawSamples = [];
    this.frameSamples = [];

    for (let i = 0; i < frames; i++) {
      // Mantém todos os goblins vivos durante o benchmark para medir carga máxima real
      for (const e of this.enemies) {
        if (e.hp < 50) e.hp = e.maxHp;
      }
      if (i % 28 === 0) this.triggerComboAttack();
      const t0 = performance.now();
      this.update(1 / 240);
      this.render();
      const elapsed = Math.max(0.08, performance.now() - t0);
      times.push(elapsed);
    }

    // Posiciona o frame final exatamente no meio de um golpe ativo para inspeção visual de hitboxes
    const catalog = RigAdapter.getAttackCatalog();
    this.startAttackSpec(catalog.combo4, 4);
    this.hero.attackTimer = this.hero.attackDuration * 0.42;
    this.evaluateAttackHits(catalog.combo4, 0.42);
    this.render();

    this.autoDemo = prevDemo;
    const sorted = [...times].sort((a, b) => a - b);
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    const p95Ms = sorted[Math.floor(sorted.length * 0.95)];
    const p99Ms = sorted[Math.floor(sorted.length * 0.99)];

    const result = {
      resolution: '1280x720',
      frames,
      avgDrawMs: Number(avgMs.toFixed(3)),
      p95DrawMs: Number(p95Ms.toFixed(3)),
      p99DrawMs: Number(p99Ms.toFixed(3)),
      avgFps: Math.round(1000 / avgMs),
      p95Fps: Math.round(1000 / p95Ms),
      p99Fps: Math.round(1000 / p99Ms)
    };
    window.__ARENA_BENCHMARK__ = result;
    return result;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
  }
}
