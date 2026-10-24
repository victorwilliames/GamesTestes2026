'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — world.js
// Arena do Platô, Cache OffscreenCanvas e Vegetação Procedural
// Inspirado na atmosfera e iluminação de Hades (ref/hades1/) e no método RafaxLab
// =============================================================================

(() => {
  const { TAU, project, createRNG } = globalThis.Agy.Core;
  const { Palette, hexToRgba } = globalThis.Agy.Ink;

  const ARENA_RADIUS = 330;
  const rng = createRNG(777);

  let groundCanvas = null;
  let groundOffsetX = 0;
  let groundOffsetY = 0;
  const sceneryProps = [];

  let windGust = 0;
  let windVelocity = 0;
  let worldTime = 0;

  const P = (x, y, z = 0) => project([x, y, z]);

  // Cria sprite pré-renderizado em OffscreenCanvas
  function makeSprite(renderFn) {
    const trackedPts = [];
    const tracker = (x, y, z) => {
      const pt = project([x, y, z]);
      trackedPts.push(pt);
      return pt;
    };

    // 1ª passada para medir a bounding box
    renderFn({ isMeasuring: true, track: tracker });

    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (const p of trackedPts) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }

    const padding = 8;
    const width = Math.ceil(maxX - minX + padding * 2);
    const height = Math.ceil(maxY - minY + padding * 2);

    let canvas, ctx;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d');
    } else if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
    }

    const offset = { x: -minX + padding, y: -minY + padding };
    if (ctx) {
      renderFn({
        isMeasuring: false,
        ctx,
        track: (x, y, z) => {
          const pt = project([x, y, z]);
          return [pt[0] + offset.x, pt[1] + offset.y];
        },
        offset
      });
    }

    return { canvas, baseX: offset.x, baseY: offset.y };
  }

  // Árvore Retorcida Estilo Hades
  function createAncientTree(seed) {
    const treeRng = createRNG(seed);
    const foliageClusters = [];
    for (let i = 0; i < 8; i++) {
      const angle = treeRng() * TAU;
      const radius = treeRng() * 26;
      foliageClusters.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        100 + treeRng() * 40,
        22 + treeRng() * 16
      ]);
    }

    return makeSprite(o => {
      const t = o.track;
      const trunkPts = [
        t(-7, 0, 0),
        t(7, 0, 0),
        t(5, 0, 85),
        t(-5, 0, 85)
      ];
      const foliage = foliageClusters.map(c => ({
        pos: t(c[0], c[1], c[2]),
        rad: c[3]
      }));

      if (o.isMeasuring || !o.ctx) return;
      const ctx = o.ctx;

      // Tronco
      ctx.beginPath();
      trunkPts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fillStyle = '#42281a';
      ctx.fill();
      ctx.strokeStyle = Palette.ink;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Copa com Cel-Shading
      for (const f of foliage) {
        ctx.beginPath();
        ctx.ellipse(f.pos[0], f.pos[1], f.rad, f.rad * 0.85, 0, 0, TAU);
        ctx.fillStyle = '#325828';
        ctx.fill();
        ctx.strokeStyle = '#122014';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Realce de luz
        ctx.beginPath();
        ctx.ellipse(f.pos[0] - f.rad * 0.28, f.pos[1] - f.rad * 0.3, f.rad * 0.55, f.rad * 0.45, 0, 0, TAU);
        ctx.fillStyle = '#487538';
        ctx.fill();
      }
    });
  }

  // Arbusto
  function createBush(seed) {
    const bushRng = createRNG(seed);
    const blobs = [];
    for (let i = 0; i < 3; i++) {
      blobs.push([(bushRng() * 2 - 1) * 15, (bushRng() * 2 - 1) * 15, 14 + bushRng() * 16, 13 + bushRng() * 10]);
    }
    return makeSprite(o => {
      const t = o.track;
      const foliage = blobs.map(b => ({ pos: t(b[0], b[1], b[2]), rad: b[3] }));
      if (o.isMeasuring || !o.ctx) return;
      const ctx = o.ctx;
      for (const f of foliage) {
        ctx.beginPath();
        ctx.ellipse(f.pos[0], f.pos[1], f.rad, f.rad * 0.8, 0, 0, TAU);
        ctx.fillStyle = '#2d5022';
        ctx.fill();
        ctx.strokeStyle = '#122014';
        ctx.lineWidth = 2.0;
        ctx.stroke();
      }
    });
  }

  // Rocha de Obsidiana
  function createRock(seed) {
    const rockRng = createRNG(seed);
    const facets = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU;
      facets.push([
        Math.cos(a) * (18 + rockRng() * 8),
        Math.sin(a) * (14 + rockRng() * 6),
        12 + Math.sin(a * 2) * 5
      ]);
    }
    return makeSprite(o => {
      const t = o.track;
      const topPts = facets.map(f => t(f[0], f[1], f[2]));
      const basePts = facets.map(f => t(f[0], f[1], 0));
      if (o.isMeasuring || !o.ctx) return;
      const ctx = o.ctx;

      // Base escura
      ctx.beginPath();
      basePts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fillStyle = '#494452';
      ctx.fill();

      // Topo iluminado
      ctx.beginPath();
      topPts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fillStyle = '#6b6676';
      ctx.fill();
      ctx.strokeStyle = Palette.ink;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    });
  }

  function setupProps() {
    const treeVariations = [createAncientTree(101), createAncientTree(202), createAncientTree(303)];
    const bushVariations = [createBush(55), createBush(88)];
    const rockVariations = [createRock(12), createRock(44)];

    const spawnProp = (kind, set, count) => {
      for (let i = 0; i < count; i++) {
        const angle = rng() * TAU;
        const dist = 130 + rng() * (ARENA_RADIUS - 160);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        if (Math.hypot(x, y) < 140) continue; // Mantém o centro do ringue livre
        const sprite = set[(rng() * set.length) | 0];
        sceneryProps.push({
          x,
          y,
          sprite,
          scale: 0.88 + rng() * 0.28,
          mirror: rng() < 0.5,
          phase: rng() * TAU,
          depth: project([x, y, 0])[2],
          swayFactor: kind === 'rock' ? 0 : 1
        });
      }
    };

    spawnProp('tree', treeVariations, 8);
    spawnProp('bush', bushVariations, 7);
    spawnProp('rock', rockVariations, 6);

    sceneryProps.sort((a, b) => a.depth - b.depth);
  }

  // Gera o chão do platô uma única vez no OffscreenCanvas
  function buildGround() {
    const corners = [
      [-ARENA_RADIUS, -ARENA_RADIUS],
      [ARENA_RADIUS, -ARENA_RADIUS],
      [ARENA_RADIUS, ARENA_RADIUS],
      [-ARENA_RADIUS, ARENA_RADIUS]
    ];

    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (const [x, y] of corners) {
      const p = P(x, y, 0);
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }

    const padding = 160;
    const width = Math.ceil(maxX - minX + padding * 2);
    const height = Math.ceil(maxY - minY + padding * 2);

    let canvas, ctx;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d');
    } else if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
    }

    if (!ctx) return;

    groundOffsetX = -minX + padding;
    groundOffsetY = -minY + padding;
    ctx.translate(groundOffsetX, groundOffsetY);

    // 1. Abismo / Vazio de Fundo
    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(minX - padding, minY - padding, width, height);

    // 2. Falésia e Penhasco do Platô
    const cliffExt = ARENA_RADIUS + 32;
    const cliffCorners = [[-cliffExt, -cliffExt], [cliffExt, -cliffExt], [cliffExt, cliffExt], [-cliffExt, cliffExt]];
    ctx.beginPath();
    cliffCorners.forEach((p, i) => {
      const s = P(p[0], p[1], 0);
      i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]);
    });
    ctx.closePath();
    ctx.fillStyle = '#1c1b24';
    ctx.fill();
    ctx.strokeStyle = Palette.ink;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 3. Platô de Grama Escura
    ctx.beginPath();
    corners.forEach((p, i) => {
      const s = P(p[0], p[1], 0);
      i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]);
    });
    ctx.closePath();
    ctx.fillStyle = '#3f622f';
    ctx.fill();

    // Manchas orgânicas de musgo e terra
    for (let i = 0; i < 280; i++) {
      const s = P((rng() * 2 - 1) * ARENA_RADIUS, (rng() * 2 - 1) * ARENA_RADIUS, 0);
      ctx.fillStyle = rng() < 0.5 ? '#335025' : '#4b7537';
      ctx.beginPath();
      ctx.ellipse(s[0], s[1], 9 + rng() * 22, 6 + rng() * 12, 0, 0, TAU);
      ctx.fill();
    }

    // 4. Praça Central de Lajes de Pedra (Ringue de Combate)
    const center = P(0, 0, 0);
    ctx.fillStyle = '#6a685e';
    ctx.beginPath();
    ctx.ellipse(center[0], center[1], 126, 72, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = Palette.ink;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Círculos concêntricos e lajotas
    ctx.strokeStyle = 'rgba(20, 16, 24, 0.4)';
    ctx.lineWidth = 1.2;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.ellipse(center[0], center[1], (126 * r) / 3, (72 * r) / 3, 0, 0, TAU);
      ctx.stroke();
    }
    for (let a = 0; a < 8; a++) {
      const rad = (a / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(center[0], center[1]);
      ctx.lineTo(center[0] + Math.cos(rad) * 126, center[1] + Math.sin(rad) * 72);
      ctx.stroke();
    }

    // Contorno do Platô
    ctx.beginPath();
    corners.forEach((p, i) => {
      const s = P(p[0], p[1], 0);
      i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]);
    });
    ctx.closePath();
    ctx.strokeStyle = Palette.ink;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    groundCanvas = canvas;
    setupProps();
  }

  function drawPropsLayer(ctx, time, heroDepth, isFront) {
    for (const prop of sceneryProps) {
      if ((prop.depth > heroDepth) !== isFront) continue;
      const groundPos = P(prop.x, prop.y, 0);
      const sprite = prop.sprite;
      const s = prop.scale;

      const sway = prop.swayFactor
        ? Math.sin(time * 1.8 + prop.phase + (prop.x + prop.y) * 0.01) * 0.04 + windGust * 0.22
        : 0;

      ctx.save();
      ctx.translate(groundPos[0], groundPos[1]);
      ctx.rotate(sway);
      ctx.scale(prop.mirror ? -s : s, s);
      if (sprite.canvas) {
        ctx.drawImage(sprite.canvas, -sprite.baseX, -sprite.baseY);
      }
      ctx.restore();
    }
  }

  const World = {
    ARENA_RADIUS,
    init() {
      if (!groundCanvas) buildGround();
    },
    renderGround(ctx) {
      if (groundCanvas) {
        ctx.drawImage(groundCanvas, -groundOffsetX, -groundOffsetY);
      }
    },
    renderBackProps(ctx, time, heroDepth) {
      drawPropsLayer(ctx, time, heroDepth, false);
    },
    renderFrontProps(ctx, time, heroDepth) {
      drawPropsLayer(ctx, time, heroDepth, true);
    },
    update(dt) {
      worldTime += dt;
      // Dinâmica de mola para o vento e rajadas
      windVelocity += (-windGust * 5.5 - windVelocity * 2.4) * dt;
      windGust += windVelocity * dt;
    },
    triggerShockwave(power = 1.0) {
      windVelocity += 6.0 * power;
    },
    get gust() {
      return windGust;
    },
    get time() {
      return worldTime;
    }
  };

  globalThis.Agy = globalThis.Agy || {};
  globalThis.Agy.World = World;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = World;
  }
})();
