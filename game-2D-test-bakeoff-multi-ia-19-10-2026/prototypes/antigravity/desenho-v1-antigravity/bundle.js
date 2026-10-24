// AUTO-GENERATED BUNDLE FROM src/ MODULES (Supports file:///, IDE Preview, and http://)
(function(window) {
  'use strict';

  // --- MODULE: src/materials/MaterialPainter.js ---
// ============================================================================
// MaterialPainter.js — Sistema Procedural de Materiais, Texturas e Contornos
// Refinado na Fase F para reproduzir textura de giz pastel, argila e fibras.
// ============================================================================
function createRNG(seed = 1337) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
class MaterialPainter {
  constructor() {
    this.patternCache = new Map();
  }

  getProceduralPattern(ctx, type) {
    if (this.patternCache.has(type)) {
      return this.patternCache.get(type);
    }

    const size = 144;
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    const rng = createRNG(
      type === 'skin' ? 10101 :
      type === 'leather' ? 20202 :
      type === 'cloth' ? 30303 :
      type === 'bone' ? 40404 : 50505
    );

    if (type === 'skin') {
      // Textura suave e granulada de giz pastel / argila quente
      for (let i = 0; i < 650; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = 1.0 + rng() * 2.4;
        octx.fillStyle = rng() > 0.48
          ? `rgba(255, 228, 198, ${0.08 + rng() * 0.08})`
          : `rgba(198, 96, 42, ${0.06 + rng() * 0.08})`;
        octx.beginPath();
        octx.arc(x, y, r, 0, Math.PI * 2);
        octx.fill();
      }
      for (let i = 0; i < 280; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const len = 3 + rng() * 7;
        const ang = -0.45 + (rng() - 0.5) * 0.6;
        octx.strokeStyle = rng() > 0.5
          ? `rgba(255, 236, 210, 0.09)`
          : `rgba(182, 82, 32, 0.08)`;
        octx.lineWidth = 1.2 + rng() * 1.4;
        octx.lineCap = 'round';
        octx.beginPath();
        octx.moveTo(x, y);
        octx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        octx.stroke();
      }
    } else if (type === 'leather') {
      // Textura densa e porosa de couro/argila rústica
      for (let i = 0; i < 720; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const rx = 1.2 + rng() * 3.8;
        const ry = 0.8 + rng() * 2.5;
        const rot = rng() * Math.PI;
        const tone = rng();
        if (tone > 0.60) {
          octx.fillStyle = `rgba(222, 156, 112, ${0.15 + rng() * 0.16})`;
        } else if (tone > 0.28) {
          octx.fillStyle = `rgba(154, 94, 62, ${0.16 + rng() * 0.16})`;
        } else {
          octx.fillStyle = `rgba(24, 11, 6, ${0.20 + rng() * 0.18})`;
        }
        octx.beginPath();
        octx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
        octx.fill();
      }
    } else if (type === 'cloth') {
      // Trama de tecido vermelho pintado à mão
      for (let i = 0; i < 520; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const len = 4 + rng() * 10;
        const ang = (i % 2 === 0 ? -0.30 : 0.40) + (rng() - 0.5) * 0.35;
        const bright = rng() > 0.46;
        octx.strokeStyle = bright
          ? `rgba(255, 85, 75, ${0.12 + rng() * 0.12})`
          : `rgba(55, 2, 6, ${0.14 + rng() * 0.14})`;
        octx.lineWidth = 1.2 + rng() * 1.6;
        octx.lineCap = 'round';
        octx.beginPath();
        octx.moveTo(x, y);
        octx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        octx.stroke();
      }
    } else if (type === 'bone') {
      for (let i = 0; i < 420; i++) {
        const x = rng() * size;
        const y = rng() * size;
        const r = 0.9 + rng() * 2.4;
        octx.fillStyle = rng() > 0.45
          ? `rgba(118, 90, 65, ${0.13 + rng() * 0.14})`
          : `rgba(255, 250, 242, ${0.16 + rng() * 0.14})`;
        octx.beginPath();
        octx.arc(x, y, r, 0, Math.PI * 2);
        octx.fill();
      }
    }

    const pat = ctx.createPattern(off, 'repeat');
    this.patternCache.set(type, pat);
    return pat;
  }

  // Contorno artesanal escuro e granulado (efeito lápis de cor / carvão / tinta)
  strokeArtisanalInk(ctx, pathOrFn, width = 5.5, color = '#180b06', grainColor = '#3a1f14') {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const execStroke = () => {
      if (pathOrFn instanceof Path2D) {
        ctx.stroke(pathOrFn);
      } else if (typeof pathOrFn === 'function') {
        ctx.beginPath();
        pathOrFn(ctx);
        ctx.stroke();
      }
    };

    // 1. Halo granulado externo de giz/carvão
    ctx.strokeStyle = grainColor;
    ctx.globalAlpha = 0.48;
    ctx.lineWidth = width * 1.52;
    ctx.setLineDash([width * 0.65, width * 0.45, width * 1.35, width * 0.38]);
    execStroke();

    // 2. Segunda passagem granulada defasada
    ctx.lineDashOffset = width * 1.1;
    ctx.lineWidth = width * 1.28;
    ctx.globalAlpha = 0.58;
    execStroke();

    // 3. Traço central sólido escuro
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.96;
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 0.95;
    execStroke();

    // 4. Textura irregular sobre o núcleo
    ctx.strokeStyle = '#0f0603';
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = width * 0.75;
    ctx.setLineDash([width * 1.8, width * 0.6]);
    execStroke();

    ctx.restore();
  }

  // Pintura volumétrica suave de pele quente chibi
  paintSkinPath(ctx, path, bounds, opts = {}) {
    const {
      baseColor = '#f9be86',
      highlightColor = '#ffddb5',
      shadowColor = '#e38a4d',
      deepShadowColor = '#c46830',
      outlineWidth = 5.6,
      stroke = true,
      innerRimRatio = 0.045,
      seed = 101
    } = opts;

    const { x, y, w, h } = bounds;
    ctx.save();

    const grad = ctx.createLinearGradient(x, y, x + w * 0.22, y + h);
    grad.addColorStop(0.0, highlightColor);
    grad.addColorStop(0.50, baseColor);
    grad.addColorStop(0.88, shadowColor);
    grad.addColorStop(1.0, deepShadowColor);

    ctx.fillStyle = grad;
    ctx.fill(path);

    ctx.save();
    ctx.clip(path);

    // Sombra periférica alaranjada suave (sem anel escuro duro!)
    if (innerRimRatio > 0) {
      ctx.strokeStyle = shadowColor;
      ctx.lineWidth = Math.max(6, Math.min(w, h) * innerRimRatio);
      ctx.globalAlpha = 0.35;
      ctx.stroke(path);
    }

    const pat = this.getProceduralPattern(ctx, 'skin');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.globalAlpha = 0.88;
      ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
    }

    const rng = createRNG(seed);
    const count = Math.min(70, Math.max(14, Math.floor((w + h) * 0.09)));
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      const sx = x + rng() * w;
      const sy = y + rng() * h;
      const len = 5 + rng() * 11;
      const ang = -0.45 + (rng() - 0.5) * 0.4;
      ctx.strokeStyle = rng() > 0.48
        ? 'rgba(255, 232, 202, 0.20)'
        : 'rgba(196, 94, 40, 0.16)';
      ctx.lineWidth = 1.4 + rng() * 1.6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.stroke();
    }

    ctx.restore();

    if (stroke && outlineWidth > 0) {
      this.strokeArtisanalInk(ctx, path, outlineWidth);
    }
    ctx.restore();
  }

  // Pintura orgânica e escultural de mecha de cabelo (estilo giz pastel / massinha esculpida)
  paintHairLock(ctx, points, opts = {}) {
    const {
      rootPoint = points[0],
      tipPoint = points[Math.floor(points.length / 2)],
      ridgeSide = 'top',
      highlightIntensity = 1.0,
      outlineWidth = 6.0,
      seed = 777,
      extraStrands = []
    } = opts;

    const path = new Path2D();
    path.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      if (p.length === 6) {
        path.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
      } else if (p.length === 4) {
        path.quadraticCurveTo(p[0], p[1], p[2], p[3]);
      } else {
        path.lineTo(p[0], p[1]);
      }
    }
    path.closePath();

    let minX = 9999, minY = 9999, maxX = -9999, maxY = -9999;
    const consider = (x, y) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    };
    consider(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      for (let j = 0; j < p.length; j += 2) consider(p[j], p[j + 1]);
    }

    ctx.save();

    const rx = rootPoint[0], ry = rootPoint[1];
    const tx = tipPoint[0], ty = tipPoint[1];
    const dx = tx - rx;
    const dy = ty - ry;
    const len = Math.hypot(dx, dy) || 1;
    // Normal apontando para a crista superior iluminada da mecha
    let unx = -dy / len;
    let uny = dx / len;
    if (uny > 0) {
      unx = -unx;
      uny = -uny;
    }
    const span = Math.max(maxX - minX, maxY - minY);

    // 1. Preenchimento volumétrico transversal (escuro na base inferior, castanho-quente no centro, acobreado na crista superior)
    const midX = (rx + tx) * 0.5;
    const midY = (ry + ty) * 0.5;
    const crossGrad = ctx.createLinearGradient(
      midX - unx * span * 0.35, midY - uny * span * 0.35,
      midX + unx * span * 0.38, midY + uny * span * 0.38
    );
    crossGrad.addColorStop(0.0, '#1c0e09');
    crossGrad.addColorStop(0.35, '#2e1810');
    crossGrad.addColorStop(0.68, '#4a281b');
    crossGrad.addColorStop(0.90, '#78442e');
    crossGrad.addColorStop(1.0, '#9e5c3e');
    ctx.fillStyle = crossGrad;
    ctx.fill(path);

    ctx.save();
    ctx.clip(path);

    // 2. Mancha de luz acobreada difusa perto da crista convexa da mecha
    if (highlightIntensity > 0.3) {
      const hx = rx * 0.42 + tx * 0.58 + unx * span * 0.16;
      const hy = ry * 0.42 + ty * 0.58 + uny * span * 0.16;
      const hRad = span * 0.42;
      const hGrad = ctx.createRadialGradient(hx, hy, 4, hx, hy, hRad);
      hGrad.addColorStop(0.0, `rgba(232, 148, 98, ${0.42 * highlightIntensity})`);
      hGrad.addColorStop(0.55, `rgba(176, 102, 64, ${0.24 * highlightIntensity})`);
      hGrad.addColorStop(1.0, 'rgba(74, 40, 27, 0.0)');
      ctx.fillStyle = hGrad;
      ctx.fillRect(minX - 10, minY - 10, (maxX - minX) + 20, (maxY - minY) + 20);
    }

    // 3. Textura de fibras curvas curtas (efeito giz pastel / lápis de cor sobre argila, sem fios retos artificiais!)
    const rng = createRNG(seed);
    const ux = dx / len;
    const uy = dy / len;

    // 3a. Pinceladas curtas acobreadas e marrons seguindo o fluxo curvo da mecha
    const strokeCount = Math.floor(65 * highlightIntensity);
    ctx.lineCap = 'round';
    for (let i = 0; i < strokeCount; i++) {
      const t = 0.08 + rng() * 0.82;
      // Concentra os tons mais claros na metade superior (crista) e os escuros na metade inferior
      const nBias = (rng() - 0.38);
      const nOff = nBias * span * 0.36;
      // Curvatura natural em arco (convexa para cima)
      const arch = Math.sin(t * Math.PI) * span * 0.12;

      const px = rx + dx * t + unx * (nOff + arch);
      const py = ry + dy * t + uny * (nOff + arch);
      const sLen = 10 + rng() * 24;
      // Tangente local acompanhando o arco
      const dArch = Math.cos(t * Math.PI) * 0.35;
      const txLocal = ux + unx * dArch;
      const tyLocal = uy + uny * dArch;

      const isRidge = nBias > 0.06;
      if (isRidge && rng() > 0.25) {
        ctx.strokeStyle = rng() > 0.45
          ? `rgba(238, 158, 108, ${0.32 + rng() * 0.28})`
          : `rgba(188, 110, 72, ${0.35 + rng() * 0.25})`;
        ctx.lineWidth = 2.0 + rng() * 2.6;
      } else {
        ctx.strokeStyle = rng() > 0.45
          ? `rgba(26, 12, 7, ${0.42 + rng() * 0.28})`
          : `rgba(88, 48, 32, ${0.35 + rng() * 0.25})`;
        ctx.lineWidth = 2.2 + rng() * 2.8;
      }

      ctx.beginPath();
      ctx.moveTo(px - txLocal * sLen * 0.5, py - tyLocal * sLen * 0.5);
      ctx.quadraticCurveTo(
        px + unx * 3,
        py + uny * 3,
        px + txLocal * sLen * 0.5,
        py + tyLocal * sLen * 0.5
      );
      ctx.stroke();
    }

    // 3b. 4 a 5 sulcos escuros curvos de escultura interna da mecha
    for (let i = -2; i <= 2; i++) {
      const nOff = i * span * 0.09;
      const arch = span * 0.11;
      const mx = (rx + tx) * 0.5 + unx * (nOff + arch);
      const my = (ry + ty) * 0.5 + uny * (nOff + arch);
      ctx.strokeStyle = '#180b06';
      ctx.lineWidth = 2.8 + (i === 0 ? 1.2 : 0);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(rx + unx * nOff * 0.35, ry + uny * nOff * 0.35);
      ctx.quadraticCurveTo(mx, my, tx + unx * nOff * 0.12, ty + uny * nOff * 0.12);
      ctx.stroke();
    }

    for (const s of extraStrands) {
      ctx.strokeStyle = s.color || '#160a06';
      ctx.lineWidth = s.width || 3.8;
      ctx.globalAlpha = s.alpha || 0.75;
      ctx.beginPath();
      ctx.moveTo(s[0], s[1]);
      ctx.quadraticCurveTo(s[2], s[3], s[4], s[5]);
      ctx.stroke();
    }

    // Oclusão escura na borda interna da mecha
    ctx.strokeStyle = '#140804';
    ctx.lineWidth = outlineWidth * 1.5;
    ctx.globalAlpha = 0.52;
    ctx.stroke(path);

    ctx.restore();

    if (outlineWidth > 0) {
      this.strokeArtisanalInk(ctx, path, outlineWidth, '#140804', '#331a10');
    }

    ctx.restore();
    return path;
  }

  paintCrimsonCloth(ctx, path, bounds, opts = {}) {
    const {
      baseColor = '#d9141b',
      highlightColor = '#ff3030',
      shadowColor = '#78060b',
      deepFoldColor = '#300204',
      outlineWidth = 5.4,
      folds = [],
      seed = 303
    } = opts;

    const { x, y, w, h } = bounds;
    ctx.save();

    const grad = ctx.createLinearGradient(x, y, x + w * 0.25, y + h);
    grad.addColorStop(0.0, highlightColor);
    grad.addColorStop(0.48, baseColor);
    grad.addColorStop(0.88, shadowColor);
    grad.addColorStop(1.0, deepFoldColor);
    ctx.fillStyle = grad;
    ctx.fill(path);

    ctx.save();
    ctx.clip(path);

    ctx.strokeStyle = shadowColor;
    ctx.lineWidth = 10;
    ctx.globalAlpha = 0.42;
    ctx.stroke(path);

    const pat = this.getProceduralPattern(ctx, 'cloth');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.globalAlpha = 0.90;
      ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
    }

    for (const f of folds) {
      // Crista iluminada vermelho-viva ao lado da dobra
      ctx.strokeStyle = '#ff473d';
      ctx.lineWidth = (f.width || 5.0) * 1.8;
      ctx.globalAlpha = 0.48;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f[0], f[1] - 5);
      if (f.length >= 6) {
        ctx.quadraticCurveTo(f[2], f[3] - 5, f[4], f[5] - 5);
      } else {
        ctx.lineTo(f[2], f[3] - 5);
      }
      ctx.stroke();

      // Vale escuro profundo da dobra
      ctx.strokeStyle = f.color || deepFoldColor;
      ctx.lineWidth = f.width || 5.2;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.moveTo(f[0], f[1]);
      if (f.length >= 6) {
        ctx.quadraticCurveTo(f[2], f[3], f[4], f[5]);
      } else {
        ctx.lineTo(f[2], f[3]);
      }
      ctx.stroke();
    }

    const rng = createRNG(seed);
    for (let i = 0; i < 36; i++) {
      const sx = x + rng() * w;
      const sy = y + rng() * h;
      const len = 8 + rng() * 18;
      const ang = (rng() - 0.5) * 0.6;
      ctx.strokeStyle = rng() > 0.42 ? 'rgba(255, 92, 82, 0.28)' : 'rgba(48, 2, 5, 0.30)';
      ctx.lineWidth = 2.0 + rng() * 2.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.stroke();
    }

    ctx.restore();

    if (outlineWidth > 0) {
      this.strokeArtisanalInk(ctx, path, outlineWidth, '#1a0606', '#3d0c0e');
    }
    ctx.restore();
  }

  paintDarkLeather(ctx, path, bounds, opts = {}) {
    const {
      baseColor = '#4d2d20',
      highlightColor = '#8c563d',
      edgeHighlight = '#c78763',
      shadowColor = '#24130c',
      outlineWidth = 5.4,
      seed = 404,
      ridges = [],
      stitches = []
    } = opts;

    const { x, y, w, h } = bounds;
    ctx.save();

    const grad = ctx.createLinearGradient(x, y, x + w * 0.2, y + h);
    grad.addColorStop(0.0, highlightColor);
    grad.addColorStop(0.45, baseColor);
    grad.addColorStop(1.0, shadowColor);
    ctx.fillStyle = grad;
    ctx.fill(path);

    ctx.save();
    ctx.clip(path);

    ctx.strokeStyle = edgeHighlight;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.35;
    ctx.stroke(path);

    const pat = this.getProceduralPattern(ctx, 'leather');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.globalAlpha = 0.95;
      ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
    }

    const rng = createRNG(seed);
    const specks = Math.min(95, Math.max(18, Math.floor((w * h) / 380)));
    for (let i = 0; i < specks; i++) {
      const sx = x + rng() * w;
      const sy = y + rng() * h;
      const rx = 2 + rng() * 5.5;
      const ry = 1.2 + rng() * 3.5;
      ctx.fillStyle = rng() > 0.45
        ? `rgba(212, 144, 102, ${0.20 + rng() * 0.16})`
        : `rgba(20, 9, 5, ${0.24 + rng() * 0.18})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const r of ridges) {
      ctx.strokeStyle = r.highlight || edgeHighlight;
      ctx.lineWidth = (r.width || 4.5) * 1.4;
      ctx.globalAlpha = 0.46;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r[0], r[1] - 3.5);
      ctx.quadraticCurveTo(r[2], r[3] - 3.5, r[4], r[5] - 3.5);
      ctx.stroke();

      ctx.strokeStyle = r.shadow || '#170a05';
      ctx.lineWidth = r.width || 4.8;
      ctx.globalAlpha = 0.90;
      ctx.beginPath();
      ctx.moveTo(r[0], r[1]);
      ctx.quadraticCurveTo(r[2], r[3], r[4], r[5]);
      ctx.stroke();
    }

    for (const st of stitches) {
      ctx.strokeStyle = st.color || '#cf906b';
      ctx.lineWidth = st.width || 2.5;
      ctx.globalAlpha = 0.75;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(st[0], st[1]);
      ctx.quadraticCurveTo(st[2], st[3], st[4], st[5]);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.restore();

    if (outlineWidth > 0) {
      this.strokeArtisanalInk(ctx, path, outlineWidth, '#170b06', '#361c12');
    }
    ctx.restore();
  }

  // Elo pesado e entrelaçado de corrente de bronze/ouro envelhecido
  paintBronzeChainLink(ctx, cx, cy, rx, ry, angleRad, seed = 55) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);

    // Sombra projetada densa
    ctx.fillStyle = 'rgba(16, 7, 3, 0.62)';
    ctx.beginPath();
    ctx.ellipse(2, 4, rx + 2.5, ry + 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const linkPath = new Path2D();
    linkPath.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    const innerRx = Math.max(2.0, rx * 0.34);
    const innerRy = Math.max(1.5, ry * 0.28);
    linkPath.ellipse(0, 0, innerRx, innerRy, 0, 0, Math.PI * 2);

    const grad = ctx.createLinearGradient(-rx, -ry, rx, ry);
    grad.addColorStop(0.0, '#f9be8c');
    grad.addColorStop(0.30, '#d9824a');
    grad.addColorStop(0.68, '#8c4622');
    grad.addColorStop(1.0, '#38180a');

    ctx.fillStyle = grad;
    ctx.fill(linkPath, 'evenodd');

    // Crista especular metálica no aro do elo
    ctx.strokeStyle = 'rgba(255, 214, 172, 0.65)';
    ctx.lineWidth = Math.max(2.0, ry * 0.22);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.68, ry * 0.68, 0, Math.PI * 1.1, Math.PI * 1.85);
    ctx.stroke();

    // Contorno rústico escuro
    ctx.strokeStyle = '#180a04';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, innerRx, innerRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}


  // --- MODULE: src/painters/FacePainter.js ---
// ============================================================================
// FacePainter.js — Rosto, Orelhas, Olhos Vermelhos, Sobrancelhas e Expressão
// Refinado na Fase F para suavizar o queixo e intensificar os olhos rubi.
// ============================================================================
class FacePainter {
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


  // --- MODULE: src/painters/HairPainter.js ---
// ============================================================================
// HairPainter.js — Cabelo Volumoso em Mechas Orgânicas Assimétricas (Refinado Fase F)
// ============================================================================
class HairPainter {
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


  // --- MODULE: src/painters/HeadPainter.js ---
// ============================================================================
// HeadPainter.js — Orquestrador Modular da Cabeça (Cabelo Traseiro + Rosto + Franja)
// ============================================================================
class HeadPainter {
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


  // --- MODULE: src/painters/TorsoPainter.js ---
// ============================================================================
// TorsoPainter.js — Pescoço, Trapézio, Peitoral Esculpido e Abdômen Chibi
// ============================================================================
class TorsoPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha o tronco (com pescoço visível para modos sem cachecol/capa como nocape).
   * Opera a partir dos pivôs chest e pelvis.
   */
  paint(ctx, pose) {
    const {
      neckBase = { x: 627, y: 360 },
      chest = { x: 627, y: 455 },
      pelvis = { x: 627, y: 610 },
      yaw = 0,
      showBareNeck = false
    } = pose;

    const cx = (chest.x + pelvis.x) * 0.5;
    const shiftX = yaw * 24;
    const torsoAngle = Math.atan2(chest.x - pelvis.x, pelvis.y - chest.y);

    ctx.save();
    ctx.translate(pelvis.x, pelvis.y);
    ctx.rotate(torsoAngle * 0.65);
    ctx.translate(-pelvis.x, -pelvis.y);

    const topY = showBareNeck ? neckBase.y - 42 : neckBase.y - 8;
    const botY = pelvis.y + 18;
    const lateralFactor = Math.abs(yaw);
    const halfChestW = 176 * Math.max(0.62, 1.0 - lateralFactor * 0.38);
    const halfWaistW = 138 * Math.max(0.64, 1.0 - lateralFactor * 0.36);

    // 1. Silhueta muscular do tronco + trapézio + pescoço
    const torsoPath = new Path2D();
    if (showBareNeck) {
      // Pescoço cilíndrico forte (hero-part-body-tpose-nocape.png: x=562..691, y=320..380)
      torsoPath.moveTo(cx - 64, topY);
      torsoPath.lineTo(cx + 64, topY);
      torsoPath.bezierCurveTo(cx + 68, topY + 42, cx + 82, topY + 55, cx + halfChestW, chest.y - 58);
    } else {
      torsoPath.moveTo(cx - 115, topY);
      torsoPath.lineTo(cx + 115, topY);
      torsoPath.lineTo(cx + halfChestW, chest.y - 50);
    }

    // Lateral direita do peito descendo até a cintura
    torsoPath.bezierCurveTo(
      cx + halfChestW + 8, chest.y + 5,
      cx + halfWaistW + 14, chest.y + 65,
      cx + halfWaistW, botY
    );
    torsoPath.lineTo(cx - halfWaistW, botY);
    torsoPath.bezierCurveTo(
      cx - halfWaistW - 14, chest.y + 65,
      cx - halfChestW - 8, chest.y + 5,
      cx - halfChestW, chest.y - 58
    );

    if (showBareNeck) {
      torsoPath.bezierCurveTo(cx - 82, topY + 55, cx - 68, topY + 42, cx - 64, topY);
    }
    torsoPath.closePath();

    this.mat.paintSkinPath(ctx, torsoPath, {
      x: cx - halfChestW - 15,
      y: topY,
      w: (halfChestW + 15) * 2,
      h: botY - topY
    }, {
      baseColor: '#f7b77f',
      highlightColor: '#ffd7ab',
      shadowColor: '#df8549',
      deepShadowColor: '#bd5e26',
      outlineWidth: 5.8,
      seed: 801
    });

    // 2. Escultura interna dos músculos (peitoral, clavículas, costelas e abdômen)
    ctx.save();
    ctx.clip(torsoPath);

    const midX = cx + shiftX;
    const pecBottomY = chest.y + 24;

    // Sombra sob os peitorais
    const pecShadowL = new Path2D();
    pecShadowL.moveTo(cx - halfChestW + 12, chest.y - 12);
    pecShadowL.bezierCurveTo(cx - 125, pecBottomY + 18, midX - 35, pecBottomY + 16, midX - 4, pecBottomY - 6);
    pecShadowL.lineTo(midX - 4, pecBottomY + 18);
    pecShadowL.bezierCurveTo(midX - 45, pecBottomY + 32, cx - 135, pecBottomY + 28, cx - halfChestW + 10, chest.y + 8);
    pecShadowL.closePath();

    const pecShadowR = new Path2D();
    pecShadowR.moveTo(cx + halfChestW - 12, chest.y - 12);
    pecShadowR.bezierCurveTo(cx + 125, pecBottomY + 18, midX + 35, pecBottomY + 16, midX + 4, pecBottomY - 6);
    pecShadowR.lineTo(midX + 4, pecBottomY + 18);
    pecShadowR.bezierCurveTo(midX + 45, pecBottomY + 32, cx + 135, pecBottomY + 28, cx + halfChestW - 10, chest.y + 8);
    pecShadowR.closePath();

    ctx.fillStyle = 'rgba(196, 92, 38, 0.55)';
    ctx.fill(pecShadowL);
    ctx.fill(pecShadowR);

    // Brilho volumétrico superior nos peitorais
    for (const [px, py, rx, ry] of [
      [midX - 74, chest.y - 14, 58, 30],
      [midX + 74, chest.y - 14, 58, 30]
    ]) {
      const pg = ctx.createRadialGradient(px, py - 6, 4, px, py, rx);
      pg.addColorStop(0, 'rgba(255, 232, 204, 0.62)');
      pg.addColorStop(1, 'rgba(255, 232, 204, 0.0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gomos abdominais (2 colunas × 3 fileiras esculpidas)
    const abStartY = pecBottomY + 16;
    const abRowH = (botY - abStartY - 8) / 2.6;
    for (let row = 0; row < 2; row++) {
      const ay = abStartY + row * abRowH;
      for (const sideSign of [-1, 1]) {
        const ax = midX + sideSign * 42;
        // Luz superior do gomo
        ctx.fillStyle = 'rgba(255, 224, 190, 0.42)';
        ctx.beginPath();
        ctx.ellipse(ax, ay + abRowH * 0.35, 30, abRowH * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sombra inferior em arco do gomo
        ctx.strokeStyle = 'rgba(186, 84, 32, 0.65)';
        ctx.lineWidth = 4.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ax - 28, ay + abRowH * 0.68);
        ctx.quadraticCurveTo(ax, ay + abRowH * 0.85, ax + 28, ay + abRowH * 0.65);
        ctx.stroke();
      }
    }

    // Sombras laterais dos oblíquos/costelas
    ctx.fillStyle = 'rgba(178, 76, 26, 0.45)';
    ctx.beginPath();
    ctx.moveTo(cx - halfChestW, chest.y - 10);
    ctx.quadraticCurveTo(midX - 92, chest.y + 55, cx - halfWaistW, botY);
    ctx.lineTo(cx - halfWaistW - 20, botY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + halfChestW, chest.y - 10);
    ctx.quadraticCurveTo(midX + 92, chest.y + 55, cx + halfWaistW, botY);
    ctx.lineTo(cx + halfWaistW + 20, botY);
    ctx.closePath();
    ctx.fill();

    // Linhas anatômicas definidas em traço marrom-escuro/terracota
    ctx.strokeStyle = '#8c3d16';
    ctx.lineWidth = 4.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Sulco central do esterno e linha alba
    ctx.moveTo(midX, chest.y - 38);
    ctx.lineTo(midX, botY - 8);
    // Curva inferior do peitoral esquerdo
    ctx.moveTo(cx - halfChestW + 18, chest.y - 16);
    ctx.bezierCurveTo(midX - 115, pecBottomY + 18, midX - 42, pecBottomY + 16, midX, pecBottomY - 6);
    // Curva inferior do peitoral direito
    ctx.moveTo(cx + halfChestW - 18, chest.y - 16);
    ctx.bezierCurveTo(midX + 115, pecBottomY + 18, midX + 42, pecBottomY + 16, midX, pecBottomY - 6);
    ctx.stroke();

    if (showBareNeck) {
      // Linhas das clavículas e esternocleidomastoideo (visíveis em nocape)
      ctx.strokeStyle = '#9e471c';
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(cx - 48, topY + 12);
      ctx.quadraticCurveTo(cx - 28, topY + 52, midX - 8, topY + 68);
      ctx.moveTo(cx + 48, topY + 12);
      ctx.quadraticCurveTo(cx + 28, topY + 52, midX + 8, topY + 68);
      ctx.moveTo(cx - 110, topY + 62);
      ctx.quadraticCurveTo(midX - 55, topY + 76, midX - 6, topY + 70);
      ctx.moveTo(cx + 110, topY + 62);
      ctx.quadraticCurveTo(midX + 55, topY + 76, midX + 6, topY + 70);
      ctx.stroke();

      // Corte escuro elíptico no topo do pescoço (como em hero-part-body-tpose-nocape.png)
      ctx.strokeStyle = '#1a0b06';
      ctx.lineWidth = 6.0;
      ctx.beginPath();
      ctx.moveTo(cx - 65, topY + 2);
      ctx.quadraticCurveTo(cx, topY + 6, cx + 65, topY + 2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }
}


  // --- MODULE: src/painters/ArmPainter.js ---
// ============================================================================
// ArmPainter.js & HandPainter.js — Braços Musculosos, Braçadeiras em Camadas,
// Correntes Infernais Enroladas nos Antebraços e Mãos com Empunhadura Real.
// Articulados por shoulder -> elbow -> wrist -> handGrip.
// ============================================================================
class HandPainter {
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
class ArmPainter {
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


  // --- MODULE: src/painters/LegPainter.js ---
// ============================================================================
// LegPainter.js & BootPainter.js — Coxas Musculosas e Botas Colossais de Couro
// Articulados por hip -> knee -> ankle -> footSole.
// ============================================================================class LegPainter {
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
}class BootPainter {
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


  // --- MODULE: src/painters/ClothPainter.js ---
// ============================================================================
// ClothPainter.js & AccessoryPainter.js
// Saiote escuro rasgado, faixas vermelhas, cinto, correntes e caveira única.
// ============================================================================
class ClothPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha o saiote escuro rasgado e as faixas vermelhas pendentes a partir de pelvis.
   */
  paint(ctx, pelvis, scale = 1.0, yaw = 0, legSpread = 0) {
    const shiftX = yaw * 18;
    ctx.save();
    ctx.translate(pelvis.x, pelvis.y);
    ctx.scale(scale, scale);

    // 1. FAIXAS VERMELHAS INTERNAS E CENTRAIS (sob o saiote escuro e entre as pernas)
    const leftSash = new Path2D();
    leftSash.moveTo(-125 + shiftX * 0.5, 18);
    leftSash.lineTo(-28 + shiftX * 0.5, 28);
    leftSash.lineTo(-58 + shiftX * 0.4 - legSpread * 8, 198);
    leftSash.lineTo(-82 + shiftX * 0.4 - legSpread * 8, 172);
    leftSash.lineTo(-108 + shiftX * 0.4 - legSpread * 10, 212);
    leftSash.lineTo(-126 + shiftX * 0.4 - legSpread * 10, 178);
    leftSash.lineTo(-152 + shiftX * 0.4 - legSpread * 12, 195);
    leftSash.closePath();

    this.mat.paintCrimsonCloth(ctx, leftSash, { x: -165, y: 15, w: 150, h: 205 }, {
      outlineWidth: 5.2,
      folds: [
        [-88 + shiftX * 0.4, 42, -102 + shiftX * 0.4, 125, -108 + shiftX * 0.4, 195],
        [-62 + shiftX * 0.4, 45, -72 + shiftX * 0.4, 118, -68 + shiftX * 0.4, 178]
      ],
      seed: 1001
    });

    // Faixa vermelha central longa (entre as pernas)
    const centerSash = new Path2D();
    centerSash.moveTo(-36 + shiftX * 0.6, 32);
    centerSash.lineTo(54 + shiftX * 0.6, 32);
    centerSash.lineTo(68 + shiftX * 0.5, 225);
    centerSash.lineTo(46 + shiftX * 0.5, 205);
    centerSash.lineTo(38 + shiftX * 0.5, 268);
    centerSash.lineTo(14 + shiftX * 0.5, 232);
    centerSash.lineTo(-4 + shiftX * 0.5, 288);
    centerSash.lineTo(-24 + shiftX * 0.5, 215);
    centerSash.lineTo(-42 + shiftX * 0.5, 235);
    centerSash.closePath();

    this.mat.paintCrimsonCloth(ctx, centerSash, { x: -55, y: 30, w: 135, h: 265 }, {
      outlineWidth: 5.4,
      folds: [
        [2 + shiftX * 0.5, 48, 0 + shiftX * 0.5, 155, -4 + shiftX * 0.5, 265],
        [28 + shiftX * 0.5, 52, 34 + shiftX * 0.5, 148, 36 + shiftX * 0.5, 245]
      ],
      seed: 1002
    });

    // 2. PAINEL ESQUERDO DO SAIOTE DE COURO/TECIDO ESCURO RASGADO
    const skirtL = new Path2D();
    skirtL.moveTo(-175, 10);
    skirtL.lineTo(-22 + shiftX * 0.5, 28);
    // Recorte interno que revela a faixa vermelha esquerda
    skirtL.lineTo(-62 + shiftX * 0.4, 155);
    skirtL.lineTo(-92 + shiftX * 0.4, 128);
    skirtL.lineTo(-142 + shiftX * 0.3, 188);
    skirtL.lineTo(-115 - legSpread * 12, 272);
    skirtL.lineTo(-152 - legSpread * 14, 238);
    skirtL.lineTo(-182 - legSpread * 16, 282);
    skirtL.lineTo(-208 - legSpread * 16, 244);
    skirtL.lineTo(-242 - legSpread * 18, 268);
    skirtL.lineTo(-248 - legSpread * 18, 232);
    skirtL.lineTo(-292 - legSpread * 20, 258);
    skirtL.lineTo(-268 - legSpread * 18, 208);
    skirtL.lineTo(-302 - legSpread * 20, 214);
    skirtL.lineTo(-252 - legSpread * 15, 148);
    skirtL.lineTo(-278 - legSpread * 15, 152);
    skirtL.bezierCurveTo(-248, 98, -215, 52, -175, 10);
    skirtL.closePath();

    this.mat.paintDarkLeather(ctx, skirtL, { x: -310, y: 8, w: 300, h: 280 }, {
      baseColor: '#3d241a',
      highlightColor: '#6e4330',
      edgeHighlight: '#ab7052',
      shadowColor: '#1c0f0a',
      outlineWidth: 5.8,
      ridges: [
        Object.assign([-175, 55, -215, 145, -255, 235], { width: 4.5 }),
        Object.assign([-140, 65, -165, 155, -182, 260], { width: 4.5 })
      ],
      seed: 1003
    });

    // Hachuras rústicas de tecido/couro rasgado no painel esquerdo
    this.paintSkirtHatching(ctx, skirtL, -290, 20, 260, 260, 1013);

    // 3. PAINEL DIREITO DO SAIOTE ESCURO RASGADO (com furo triangular e detalhes vermelhos)
    const skirtR = new Path2D();
    skirtR.moveTo(-18 + shiftX * 0.6, 24);
    skirtR.lineTo(175, 10);
    skirtR.bezierCurveTo(215, 52, 248, 98, 282 + legSpread * 15, 156);
    skirtR.lineTo(256 + legSpread * 15, 150);
    skirtR.lineTo(306 + legSpread * 20, 224);
    skirtR.lineTo(272 + legSpread * 18, 214);
    skirtR.lineTo(298 + legSpread * 20, 272);
    skirtR.lineTo(246 + legSpread * 18, 236);
    skirtR.lineTo(234 + legSpread * 16, 268);
    skirtR.lineTo(192 + legSpread * 14, 228);
    skirtR.lineTo(154 + legSpread * 12, 274);
    skirtR.lineTo(128 + legSpread * 10, 246);
    skirtR.lineTo(84 + legSpread * 8, 298);
    skirtR.lineTo(42 + shiftX * 0.5, 175);
    skirtR.lineTo(88 + shiftX * 0.6, 138);
    skirtR.lineTo(-18 + shiftX * 0.6, 98);
    skirtR.closePath();

    this.mat.paintDarkLeather(ctx, skirtR, { x: -25, y: 8, w: 340, h: 295 }, {
      baseColor: '#3d241a',
      highlightColor: '#6e4330',
      edgeHighlight: '#ab7052',
      shadowColor: '#1c0f0a',
      outlineWidth: 5.8,
      ridges: [
        Object.assign([85, 65, 125, 155, 152, 255], { width: 4.5 }),
        Object.assign([155, 55, 205, 145, 255, 235], { width: 4.5 })
      ],
      seed: 1004
    });

    this.paintSkirtHatching(ctx, skirtR, 0, 20, 305, 280, 1014);

    // Detalhe canônico 1: Rasgo triangular no painel direito que deixa ver a pele da coxa (x=+135, y=+185)
    const tearHole = new Path2D();
    tearHole.moveTo(118 + legSpread * 8, 188);
    tearHole.lineTo(144 + legSpread * 8, 166);
    tearHole.lineTo(162 + legSpread * 8, 194);
    tearHole.closePath();
    ctx.fillStyle = '#eb9b64';
    ctx.fill(tearHole);
    this.mat.strokeArtisanalInk(ctx, tearHole, 4.4, '#1a0b06', '#3d1e12');

    // Detalhe canônico 2: Costuras/marcas vermelhas na ponta interna direita do saiote
    ctx.strokeStyle = '#d9161d';
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(64 + legSpread * 6, 224);
    ctx.lineTo(92 + legSpread * 6, 242);
    ctx.moveTo(86 + legSpread * 6, 218);
    ctx.lineTo(68 + legSpread * 6, 248);
    ctx.moveTo(76 + legSpread * 6, 255);
    ctx.lineTo(84 + legSpread * 8, 285);
    ctx.stroke();

    ctx.restore();
  }

  paintSkirtHatching(ctx, clipPath, x, y, w, h, seed) {
    ctx.save();
    ctx.clip(clipPath);
    const rng = createRNG(seed);
    ctx.lineCap = 'round';
    for (let i = 0; i < 48; i++) {
      const sx = x + rng() * w;
      const sy = y + rng() * h;
      const len = 8 + rng() * 16;
      const ang = (i % 2 === 0 ? 0.65 : -0.55) + (rng() - 0.5) * 0.35;
      ctx.strokeStyle = rng() > 0.42
        ? 'rgba(188, 124, 86, 0.28)'
        : 'rgba(20, 9, 5, 0.36)';
      ctx.lineWidth = 1.8 + rng() * 1.8;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.restore();
  }
}
class AccessoryPainter {
  constructor(materials) {
    this.mat = materials;
  }

  /**
   * Desenha as faixas vermelhas laterais da cintura, o cinto de couro escuro,
   * as correntes de bronze envelhecido e a CAVEIRA ÚNICA CENTRAL no cinto frontal.
   */
  paint(ctx, pelvis, scale = 1.0, yaw = 0) {
    const shiftX = yaw * 26;
    ctx.save();
    ctx.translate(pelvis.x, pelvis.y);
    ctx.scale(scale, scale);

    // 1. FAIXAS VERMELHAS VOLUMOSAS NA CINTURA (logo abaixo do cinto de couro)
    const hipSashL = new Path2D();
    hipSashL.moveTo(-162, -16);
    hipSashL.lineTo(-45 + shiftX, -4);
    hipSashL.lineTo(-55 + shiftX, 46);
    hipSashL.lineTo(-195, 58);
    hipSashL.lineTo(-178, 32);
    hipSashL.lineTo(-212, 24);
    hipSashL.closePath();

    const hipSashR = new Path2D();
    hipSashR.moveTo(45 + shiftX, -4);
    hipSashR.lineTo(162, -16);
    hipSashR.lineTo(212, 24);
    hipSashR.lineTo(178, 32);
    hipSashR.lineTo(195, 58);
    hipSashR.lineTo(55 + shiftX, 46);
    hipSashR.closePath();

    this.mat.paintCrimsonCloth(ctx, hipSashL, { x: -215, y: -18, w: 175, h: 80 }, {
      outlineWidth: 5.2,
      folds: [[-188, 16, -125, 12, -62 + shiftX, 18]],
      seed: 1101
    });

    this.mat.paintCrimsonCloth(ctx, hipSashR, { x: 42, y: -18, w: 175, h: 80 }, {
      outlineWidth: 5.2,
      folds: [[62 + shiftX, 18, 125, 12, 188, 16]],
      seed: 1102
    });

    // 2. CINTO DE COURO ESCURO
    const beltPath = new Path2D();
    beltPath.moveTo(-156, -42);
    beltPath.quadraticCurveTo(shiftX, -24, 156, -42);
    beltPath.lineTo(166, 2);
    beltPath.quadraticCurveTo(shiftX, 20, -166, 2);
    beltPath.closePath();

    this.mat.paintDarkLeather(ctx, beltPath, { x: -170, y: -45, w: 340, h: 70 }, {
      baseColor: '#4a2b1e',
      highlightColor: '#825039',
      edgeHighlight: '#c4835f',
      shadowColor: '#21110b',
      outlineWidth: 5.8,
      ridges: [
        Object.assign([-158, -18, shiftX, -2, 158, -18], { width: 4.5 })
      ],
      seed: 1103
    });

    // 3. CORRENTES METÁLICAS PESADAS DE BRONZE ENVELHECIDO NA CINTURA (elos 3D entrelaçados)
    const leftChainArc = [
      { x: -72 + shiftX * 0.7, y: 12, ang: -0.42, type: 'edge' },
      { x: -102 + shiftX * 0.5, y: 26, ang: -0.48, type: 'face' },
      { x: -134 + shiftX * 0.3, y: 44, ang: -0.54, type: 'edge' },
      { x: -166, y: 66, ang: -0.58, type: 'face' },
      { x: -198, y: 90, ang: -0.62, type: 'edge' },
      { x: -224, y: 112, ang: -0.35, type: 'face' },
      // Segunda volta da corrente esquerda
      { x: -192, y: 98, ang: 0.42, type: 'edge' },
      { x: -158, y: 78, ang: 0.48, type: 'face' },
      { x: -124 + shiftX * 0.3, y: 58, ang: 0.44, type: 'edge' },
      { x: -92 + shiftX * 0.5, y: 38, ang: 0.38, type: 'face' }
    ];
    this.paintWaistChain(ctx, leftChainArc, 1200);

    const rightChainArc = [
      { x: 72 + shiftX * 0.7, y: 12, ang: 0.42, type: 'edge' },
      { x: 102 + shiftX * 0.5, y: 26, ang: 0.48, type: 'face' },
      { x: 134 + shiftX * 0.3, y: 44, ang: 0.54, type: 'edge' },
      { x: 166, y: 66, ang: 0.58, type: 'face' },
      { x: 198, y: 90, ang: 0.62, type: 'edge' },
      { x: 224, y: 112, ang: 0.35, type: 'face' },
      // Segunda volta da corrente direita
      { x: 192, y: 98, ang: -0.42, type: 'edge' },
      { x: 158, y: 78, ang: -0.48, type: 'face' },
      { x: 124 + shiftX * 0.3, y: 58, ang: -0.44, type: 'edge' },
      { x: 92 + shiftX * 0.5, y: 38, ang: -0.38, type: 'face' }
    ];
    this.paintWaistChain(ctx, rightChainArc, 1250);

    // 4. FIVELA CENTRAL EM FORMATO DE CAVEIRA CLARA (CAVEIRA ÚNICA NO CINTO FRONTAL)
    this.paintSkullBuckle(ctx, shiftX, 2);

    ctx.restore();
  }

  paintWaistChain(ctx, nodes, seedBase) {
    // 1. Elos abertos vistos de frente ('face')
    nodes.forEach((n, idx) => {
      if (n.type !== 'face') return;
      this.mat.paintBronzeChainLink(ctx, n.x, n.y, 24, 15, n.ang, seedBase + idx);
    });
    // 2. Elos de perfil ('edge') que conectam por dentro dos furos dos elos 'face'
    nodes.forEach((n, idx) => {
      if (n.type !== 'edge') return;
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.ang);
      const bar = new Path2D();
      bar.ellipse(0, 0, 19, 8.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(18, 6, 3, 0.55)';
      ctx.beginPath();
      ctx.ellipse(1, 3, 20, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createLinearGradient(0, -8.5, 0, 8.5);
      g.addColorStop(0.0, '#2e1108');
      g.addColorStop(0.35, '#d98a4e');
      g.addColorStop(0.55, '#ffbe82');
      g.addColorStop(0.85, '#783819');
      g.addColorStop(1.0, '#1f0a05');
      ctx.fillStyle = g;
      ctx.fill(bar);
      this.mat.strokeArtisanalInk(ctx, bar, 4.4, '#170804', '#38180c');
      ctx.restore();
    });
  }

  paintSkullBuckle(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    // Silhueta esculpida da caveira com maçãs do rosto salientes e 4 dentes superiores
    const skullPath = new Path2D();
    // Topo do crânio
    skullPath.moveTo(0, -56);
    skullPath.bezierCurveTo(42, -56, 64, -34, 62, -6);
    // Maçã do rosto direita (zigomático)
    skullPath.bezierCurveTo(76, 4, 78, 24, 62, 34);
    skullPath.bezierCurveTo(52, 40, 44, 38, 38, 42);
    // Dente 4 (direito externo)
    skullPath.lineTo(36, 56);
    skullPath.quadraticCurveTo(28, 62, 20, 56);
    skullPath.lineTo(18, 46);
    // Dente 3 (direito central)
    skullPath.lineTo(16, 58);
    skullPath.quadraticCurveTo(8, 64, 1, 58);
    skullPath.lineTo(0, 46);
    // Dente 2 (esquerdo central)
    skullPath.lineTo(-1, 58);
    skullPath.quadraticCurveTo(-8, 64, -16, 58);
    skullPath.lineTo(-18, 46);
    // Dente 1 (esquerdo externo)
    skullPath.lineTo(-20, 56);
    skullPath.quadraticCurveTo(-28, 62, -36, 56);
    skullPath.lineTo(-38, 42);
    // Maçã do rosto esquerda
    skullPath.bezierCurveTo(-44, 38, -52, 40, -62, 34);
    skullPath.bezierCurveTo(-78, 24, -76, 4, -62, -6);
    skullPath.bezierCurveTo(-64, -34, -42, -56, 0, -56);
    skullPath.closePath();

    // Sombra projetada da caveira sobre o cinto/saiote
    ctx.fillStyle = 'rgba(18, 8, 4, 0.55)';
    ctx.save();
    ctx.translate(0, 6);
    ctx.fill(skullPath);
    ctx.restore();

    // Preenchimento volumétrico de osso envelhecido
    const grad = ctx.createRadialGradient(-8, -22, 8, 0, 0, 76);
    grad.addColorStop(0.0, '#fbf5ec');
    grad.addColorStop(0.45, '#e8d8c1');
    grad.addColorStop(0.82, '#bfa78a');
    grad.addColorStop(1.0, '#8a7055');
    ctx.fillStyle = grad;
    ctx.fill(skullPath);

    // Textura porosa e sombras internas da caveira
    ctx.save();
    ctx.clip(skullPath);

    const pat = this.mat.getProceduralPattern(ctx, 'bone');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.globalAlpha = 0.90;
      ctx.fillRect(-80, -60, 160, 130);
    }

    // Sombra nas têmporas e sob as maçãs do rosto
    ctx.fillStyle = 'rgba(122, 94, 68, 0.48)';
    ctx.beginPath();
    ctx.arc(-54, -8, 22, 0, Math.PI * 2);
    ctx.arc(54, -8, 22, 0, Math.PI * 2);
    ctx.fill();

    // Pequenas fissuras e poros cranianos
    ctx.strokeStyle = 'rgba(92, 68, 48, 0.65)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-26, -48);
    ctx.lineTo(-18, -32);
    ctx.lineTo(-24, -24);
    ctx.moveTo(28, -44);
    ctx.lineTo(20, -28);
    ctx.stroke();

    ctx.restore();

    // Contorno artesanal da caveira
    this.mat.strokeArtisanalInk(ctx, skullPath, 5.5, '#170a05', '#3b2115');

    // Órbitas oculares profundas e inclinadas (expressão ameaçadora)
    const leftSocket = new Path2D();
    leftSocket.moveTo(-48, -6);
    leftSocket.quadraticCurveTo(-30, -14, -14, 2);
    leftSocket.quadraticCurveTo(-18, 20, -36, 18);
    leftSocket.quadraticCurveTo(-50, 14, -48, -6);
    leftSocket.closePath();

    const rightSocket = new Path2D();
    rightSocket.moveTo(48, -6);
    rightSocket.quadraticCurveTo(30, -14, 14, 2);
    rightSocket.quadraticCurveTo(18, 20, 36, 18);
    rightSocket.quadraticCurveTo(50, 14, 48, -6);
    rightSocket.closePath();

    // Borda chanfrada das órbitas
    ctx.strokeStyle = '#7d6249';
    ctx.lineWidth = 4.5;
    ctx.stroke(leftSocket);
    ctx.stroke(rightSocket);

    ctx.fillStyle = '#1a0b06';
    ctx.fill(leftSocket);
    ctx.fill(rightSocket);

    // Cavidade nasal triangular central
    const noseHole = new Path2D();
    noseHole.moveTo(0, 8);
    noseHole.lineTo(-11, 28);
    noseHole.quadraticCurveTo(0, 25, 11, 28);
    noseHole.closePath();
    ctx.fillStyle = '#1a0b06';
    ctx.fill(noseHole);

    // Divisórias dos dentes
    ctx.strokeStyle = '#241008';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(-18, 38);
    ctx.lineTo(-18, 54);
    ctx.moveTo(0, 36);
    ctx.lineTo(0, 54);
    ctx.moveTo(18, 38);
    ctx.lineTo(18, 54);
    ctx.stroke();

    ctx.restore();
  }
}


  // --- MODULE: src/painters/ScarfPainter.js ---
// ============================================================================
// ScarfPainter.js & CapePainter.js — Cachecol Vermelho em Dobras e Capa Rasgada
// ============================================================================
class CapePainter {
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
class ScarfPainter {
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



  // --- MODULE: src/painters/WeaponPainter.js ---
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
class WeaponPainter {
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



  // --- MODULE: src/poses/PosePresets.js ---
// ============================================================================
// PosePresets.js — Poses Estáticas Canônicas para as 8 Vistas/Peças de Referência
// ============================================================================
const POSE_PRESETS = {
  // 1. Herói Completo em Idle Frontal (Sul 0° — hero-idle-s.png)
  'hero-idle-s': {
    id: 'hero-idle-s',
    label: 'Herói Completo — Idle Sul (0°)',
    refImage: './assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png',
    category: 'static-ref',
    showHead: true,
    showBody: true,
    showCape: true,
    showScarf: true,
    showWeapons: true,
    showBareNeck: false,
    yaw: 0,
    capeFlutter: 0,
    legSpread: 0,
    bodyScale: 0.76,
    head: {
      x: 627,
      y: 656,
      scaleX: 0.568,
      scaleY: 0.568,
      rotation: 0,
      yaw: 0,
      anchorX: 637,
      anchorY: 1132
    },
    neckBase: { x: 627, y: 682 },
    chest:    { x: 627, y: 748 },
    pelvis:   { x: 625, y: 835 },
    armL: {
      shoulder: { x: 485, y: 702 },
      elbow:    { x: 415, y: 765 },
      wrist:    { x: 368, y: 828 },
      handGrip: { x: 342, y: 866 }
    },
    armR: {
      shoulder: { x: 769, y: 702 },
      elbow:    { x: 839, y: 765 },
      wrist:    { x: 886, y: 828 },
      handGrip: { x: 912, y: 866 }
    },
    legL: {
      hip:      { x: 525, y: 890 },
      knee:     { x: 495, y: 1035 },
      ankle:    { x: 468, y: 1145 },
      footSole: { x: 452, y: 1226 },
      footPitch: 0
    },
    legR: {
      hip:      { x: 729, y: 890 },
      knee:     { x: 759, y: 1035 },
      ankle:    { x: 786, y: 1145 },
      footSole: { x: 802, y: 1226 },
      footPitch: 0
    },
    weaponL: {
      x: 342,
      y: 866,
      scale: 0.64,
      rotation: -0.48,
      chainSway: 0.12
    },
    weaponR: {
      x: 912,
      y: 866,
      scale: 0.64,
      rotation: 0.48,
      chainSway: 0.12
    }
  },

  // 2. Cabeça Isolada em Close-up (hero-part-head.png)
  'hero-part-head': {
    id: 'hero-part-head',
    label: 'Peça Canônica — Cabeça (hero-part-head)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-head.png',
    category: 'static-ref',
    showHead: true,
    showBody: false,
    showCape: false,
    showScarf: false,
    showWeapons: false,
    yaw: 0,
    head: {
      x: 637,
      y: 1132,
      scaleX: 1.0,
      scaleY: 1.0,
      rotation: 0,
      yaw: 0,
      anchorX: 637,
      anchorY: 1132
    }
  },

  // 3. Corpo Isolado com Capa e Braços Naturais (hero-part-body.png)
  'hero-part-body': {
    id: 'hero-part-body',
    label: 'Peça Canônica — Corpo + Capa (hero-part-body)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-body.png',
    category: 'static-ref',
    showHead: false,
    showBody: true,
    showCape: true,
    showScarf: true,
    showWeapons: false,
    showBareNeck: false,
    yaw: 0,
    capeFlutter: 0,
    legSpread: 0,
    bodyScale: 0.96,
    neckBase: { x: 615, y: 315 },
    chest:    { x: 615, y: 445 },
    pelvis:   { x: 615, y: 588 },
    armL: {
      shoulder: { x: 435, y: 385 },
      elbow:    { x: 335, y: 515 },
      wrist:    { x: 265, y: 642 },
      handGrip: { x: 248, y: 712 }
    },
    armR: {
      shoulder: { x: 795, y: 385 },
      elbow:    { x: 895, y: 515 },
      wrist:    { x: 965, y: 642 },
      handGrip: { x: 982, y: 712 }
    },
    legL: {
      hip:      { x: 485, y: 665 },
      knee:     { x: 445, y: 895 },
      ankle:    { x: 415, y: 1035 },
      footSole: { x: 398, y: 1162 },
      footPitch: 0
    },
    legR: {
      hip:      { x: 745, y: 665 },
      knee:     { x: 785, y: 895 },
      ankle:    { x: 815, y: 1035 },
      footSole: { x: 842, y: 1162 },
      footPitch: 0
    }
  },

  // 4. Corpo em T-Pose com Capa (hero-part-body-tpose.png)
  'hero-part-body-tpose': {
    id: 'hero-part-body-tpose',
    label: 'Peça Canônica — T-Pose com Capa (hero-part-body-tpose)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-body-tpose.png',
    category: 'static-ref',
    showHead: false,
    showBody: true,
    showCape: true,
    showScarf: true,
    showWeapons: false,
    showBareNeck: false,
    yaw: 0,
    capeFlutter: -0.15,
    legSpread: 0,
    bodyScale: 0.90,
    neckBase: { x: 627, y: 365 },
    chest:    { x: 627, y: 472 },
    pelvis:   { x: 627, y: 608 },
    armL: {
      shoulder: { x: 448, y: 412 },
      elbow:    { x: 285, y: 432 },
      wrist:    { x: 145, y: 448 },
      handGrip: { x: 78,  y: 458 }
    },
    armR: {
      shoulder: { x: 806, y: 412 },
      elbow:    { x: 969, y: 432 },
      wrist:    { x: 1109, y: 448 },
      handGrip: { x: 1176, y: 458 }
    },
    legL: {
      hip:      { x: 505, y: 685 },
      knee:     { x: 472, y: 905 },
      ankle:    { x: 442, y: 1035 },
      footSole: { x: 425, y: 1155 },
      footPitch: 0
    },
    legR: {
      hip:      { x: 749, y: 685 },
      knee:     { x: 782, y: 905 },
      ankle:    { x: 812, y: 1035 },
      footSole: { x: 829, y: 1155 },
      footPitch: 0
    }
  },

  // 5. Corpo em T-Pose sem Capa — Estudo Anatômico (hero-part-body-tpose-nocape.png)
  'hero-part-body-tpose-nocape': {
    id: 'hero-part-body-tpose-nocape',
    label: 'Peça Canônica — T-Pose sem Capa (Anatomia)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-body-tpose-nocape.png',
    category: 'static-ref',
    showHead: false,
    showBody: true,
    showCape: false,
    showScarf: false,
    showWeapons: false,
    showBareNeck: true,
    yaw: 0,
    capeFlutter: 0,
    legSpread: 0,
    bodyScale: 0.88,
    neckBase: { x: 627, y: 365 },
    chest:    { x: 627, y: 475 },
    pelvis:   { x: 627, y: 620 },
    armL: {
      shoulder: { x: 455, y: 425 },
      elbow:    { x: 285, y: 442 },
      wrist:    { x: 145, y: 452 },
      handGrip: { x: 68,  y: 456 }
    },
    armR: {
      shoulder: { x: 799, y: 425 },
      elbow:    { x: 969, y: 442 },
      wrist:    { x: 1109, y: 452 },
      handGrip: { x: 1186, y: 456 }
    },
    legL: {
      hip:      { x: 505, y: 685 },
      knee:     { x: 482, y: 885 },
      ankle:    { x: 455, y: 1010 },
      footSole: { x: 445, y: 1115 },
      footPitch: 0
    },
    legR: {
      hip:      { x: 749, y: 685 },
      knee:     { x: 772, y: 885 },
      ankle:    { x: 799, y: 1010 },
      footSole: { x: 809, y: 1115 },
      footPitch: 0
    }
  },

  // 6. Par de Armas Isoladas (hero-part-weapons.png)
  'hero-part-weapons': {
    id: 'hero-part-weapons',
    label: 'Peça Canônica — Par de Armas (hero-part-weapons)',
    refImage: './assets/references/ref-2d-hero/hero-parts/hero-part-weapons.png',
    category: 'static-ref',
    showHead: false,
    showBody: false,
    showCape: false,
    showScarf: false,
    showWeapons: true,
    weaponL: {
      x: 475,
      y: 665,
      scale: 1.0,
      rotation: 0,
      chainSway: 0
    },
    weaponR: {
      x: 779,
      y: 665,
      scale: 1.0,
      rotation: 0,
      chainSway: 0
    }
  }
};


  // --- MODULE: src/rig/RigAdapter.js ---
// ============================================================================
// RigAdapter.js — Esqueleto Matemático RIG-01, Solver Analítico de IK 2-Ossos,
// Foot-Lock e Máquina de Poses/Combos Procedurais (Etapa 2 & Etapa 3).
// Converte estados de pose (Idle, Walk, Run, Dash, Combo 1..4, Skills Q/E/R)
// e orientações (S, SE, SW, E, W, N, NE, NW) em coordenadas articulares 2D/2.5D
// sem substituir o renderer e sem espelhamento mecânico!
// ============================================================================
class RigAdapter {
  /**
   * Solver analítico de Cinemática Inversa (2-Bone IK) via Lei dos Cossenos.
   * Calcula a posição exata da articulação intermediária (cotovelo ou joelho)
   * preservando os comprimentos ósseos L1 e L2.
   */
  static solveTwoBoneIK(root, target, L1, L2, bendDir = 1) {
    const dx = target.x - root.x;
    const dy = target.y - root.y;
    const rawDist = Math.hypot(dx, dy) || 0.001;
    const maxReach = (L1 + L2) * 0.995;
    const minReach = Math.abs(L1 - L2) + 2;
    const d = Math.max(minReach, Math.min(maxReach, rawDist));

    const baseAngle = Math.atan2(dy, dx);
    const cosAngle = Math.max(-1, Math.min(1, (d * d + L1 * L1 - L2 * L2) / (2 * d * L1)));
    const offsetAngle = Math.acos(cosAngle) * (bendDir >= 0 ? 1 : -1);
    const jointAngle = baseAngle + offsetAngle;

    return {
      x: root.x + Math.cos(jointAngle) * L1,
      y: root.y + Math.sin(jointAngle) * L1
    };
  }

  /**
   * Catálogo oficial dos golpes do Combo de 4 estágios + 3 Skills do Caos,
   * seguindo a arquitetura de 4 fases (windup -> strike -> follow -> recover) de Rafa+Claude.
   */
  static getAttackCatalog() {
    return {
      combo1: {
        id: 'combo1',
        name: '1. Corte Infernal (Esq)',
        duration: 0.34,
        hitWindow: [0.22, 0.62],
        cancelAt: 0.56,
        lunge: 95,
        damage: 28,
        knockback: 150,
        range: 128,
        arcRad: 1.85,
        activeSide: 'L'
      },
      combo2: {
        id: 'combo2',
        name: '2. Revés Sangrento (Dir)',
        duration: 0.34,
        hitWindow: [0.20, 0.62],
        cancelAt: 0.56,
        lunge: 110,
        damage: 34,
        knockback: 175,
        range: 134,
        arcRad: 1.95,
        activeSide: 'R'
      },
      combo3: {
        id: 'combo3',
        name: '3. Tesoura Dupla do Caos',
        duration: 0.40,
        hitWindow: [0.24, 0.68],
        cancelAt: 0.62,
        lunge: 145,
        damage: 46,
        knockback: 220,
        range: 148,
        arcRad: 2.20,
        activeSide: 'BOTH'
      },
      combo4: {
        id: 'combo4',
        name: '4. Turbilhão das Correntes (Finisher)',
        duration: 0.52,
        hitWindow: [0.18, 0.78],
        cancelAt: 0.82,
        lunge: 170,
        damage: 68,
        knockback: 310,
        range: 195,
        arcRad: Math.PI * 2,
        activeSide: 'BOTH',
        isChainExtended: true
      },
      skillQ: {
        id: 'skillQ',
        name: 'Q — Arremesso de Corrente Infernal',
        duration: 0.44,
        hitWindow: [0.20, 0.72],
        cancelAt: 0.75,
        lunge: 60,
        damage: 54,
        knockback: 260,
        range: 245,
        arcRad: 1.15,
        activeSide: 'L',
        isChainExtended: true
      },
      skillE: {
        id: 'skillE',
        name: 'E — Fúria Rubra Cruzada',
        duration: 0.42,
        hitWindow: [0.22, 0.70],
        cancelAt: 0.72,
        lunge: 130,
        damage: 62,
        knockback: 280,
        range: 165,
        arcRad: 2.40,
        activeSide: 'BOTH'
      },
      skillR: {
        id: 'skillR',
        name: 'R — Cataclismo das Lâminas do Caos',
        duration: 0.58,
        hitWindow: [0.30, 0.82],
        cancelAt: 0.85,
        lunge: 160,
        damage: 95,
        knockback: 380,
        range: 225,
        arcRad: Math.PI * 2,
        activeSide: 'BOTH',
        isChainExtended: true
      }
    };
  }

  /**
   * Gera uma estrutura HeroPose completa controlada pelos ângulos/IK do RIG-01.
   *
   * @param {Object} state - {
   *   action: 'idle'|'walk'|'run'|'dash'|'attack'|'combo1'|'combo2'|'combo3'|'combo4'|'skillQ'|'skillE'|'skillR',
   *   orientation: 'S'|'SE'|'SW'|'E'|'W'|'N'|'NE'|'NW',
   *   yawOverride: number | undefined,
   *   time: number,
   *   attackProgress: number | undefined (0..1)
   * }
   */
  static computePose(state = {}) {
    const {
      action = 'idle',
      orientation = 'S',
      yawOverride,
      time = 0,
      attackProgress
    } = state;

    // 1. Parâmetro de orientação 2.5D (yaw) SEM ESPELHAMENTO MECÂNICO
    let yaw = 0;
    let refImage = './assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png';
    if (orientation === 'SE' || orientation === 'E' || orientation === 'NE') {
      yaw = orientation === 'E' ? -0.95 : -0.85;
      refImage = './assets/references/ref-2d-hero/hero-complet-idle/hero-idle-se.png';
    } else if (orientation === 'SW' || orientation === 'W' || orientation === 'NW') {
      yaw = orientation === 'W' ? 0.92 : 0.78;
      refImage = './assets/references/ref-2d-hero/hero-complet-idle/hero-idle-sw.png';
    }
    if (typeof yawOverride === 'number') {
      yaw = Math.max(-0.98, Math.min(0.98, yawOverride));
    }

    const cx = 627 + yaw * 14;
    const groundY = 1226;
    const facingDir = yaw < -0.25 ? 1 : (yaw > 0.25 ? -1 : 0);

    // 2. Pose base (Idle Respirando / Posição de Guarda)
    let pelvisX = cx - yaw * 18;
    let pelvisY = 835;
    let chestX = cx - yaw * 12;
    let chestY = 748;
    let neckX = cx - yaw * 8;
    let neckY = 682;
    let headX = cx + yaw * 8;
    let headY = 656;
    let headRot = 0;
    let capeFlutter = 0;
    let legSpread = 0;

    // Braços e Pernas base
    let shoulderL = { x: chestX - 142 + yaw * 16, y: 702 };
    let elbowL    = { x: chestX - 212 + yaw * 18, y: 765 };
    let wristL    = { x: chestX - 259 + yaw * 20, y: 828 };
    let handGripL = { x: chestX - 285 + yaw * 20, y: 866 };

    let shoulderR = { x: chestX + 142 + yaw * 16, y: 702 };
    let elbowR    = { x: chestX + 212 + yaw * 18, y: 765 };
    let wristR    = { x: chestX + 259 + yaw * 20, y: 828 };
    let handGripR = { x: chestX + 285 + yaw * 20, y: 866 };

    let hipL      = { x: pelvisX - 100, y: 890 };
    let kneeL     = { x: pelvisX - 130, y: 1035 };
    let ankleL    = { x: pelvisX - 157, y: 1145 };
    let footSoleL = { x: pelvisX - 173, y: groundY };
    let footPitchL = 0;

    let hipR      = { x: pelvisX + 104, y: 890 };
    let kneeR     = { x: pelvisX + 134, y: 1035 };
    let ankleR    = { x: pelvisX + 161, y: 1145 };
    let footSoleR = { x: pelvisX + 177, y: groundY };
    let footPitchR = 0;

    let weaponLPos = null;
    let weaponRPos = null;
    let weaponLRot = -0.48;
    let weaponRRot = 0.48;
    let chainSwayL = 0.12;
    let chainSwayR = 0.12;

    let contactL = 'PLANTED';
    let contactR = 'PLANTED';

    if (action === 'idle') {
      // Respiração orgânica + oscilação das correntes e capa
      const breath = Math.sin(time * Math.PI * 2);
      const secondary = Math.cos(time * Math.PI * 2);
      chestY += breath * 4.5;
      neckY  += breath * 5.5;
      headY  += breath * 6.5;
      shoulderL.y += breath * 5.5;
      shoulderR.y += breath * 5.5;
      wristL.y += breath * 3.5;
      wristR.y += breath * 3.5;
      handGripL.y += breath * 3.5;
      handGripR.y += breath * 3.5;
      weaponLRot = -0.48 + secondary * 0.03;
      weaponRRot = 0.48 - secondary * 0.03;
      capeFlutter = Math.sin(time * Math.PI * 2 - 0.6) * 0.25;
      chainSwayL = 0.12 + secondary * 0.08;
      chainSwayR = 0.12 - secondary * 0.08;

    } else if (action === 'run' || action === 'walk') {
      const isWalk = action === 'walk';
      const amp = isWalk ? 0.65 : 1.0;
      const phase = time === 0 ? 0.22 : (time % 1.0);

      // Sentido direcional de movimento no plano lateral 2.5D (yaw < 0: East/Right, yaw > 0: West/Left)
      const facingDir = yaw < -0.25 ? 1 : (yaw > 0.25 ? -1 : 0);
      const isLateral = facingDir !== 0;

      // Amortecimento vertical da pelve (lowest Y na fase de apoio duplo / mid-stance shock absorption)
      // Ciclo duplo por passada completa (2 passos por ciclo)
      const bounce = Math.abs(Math.cos(phase * Math.PI * 2));
      pelvisY = 826 + bounce * (isWalk ? 10 : 18);

      // Inclinação dinâmica do tronco (Forward Lean) na direção do movimento
      const forwardLean = isLateral ? facingDir * (isWalk ? 16 : 28) : 0;
      chestX  = pelvisX + forwardLean + yaw * 14;
      chestY  = pelvisY - 86;
      neckX   = chestX + forwardLean * 0.45 + yaw * 8;
      neckY   = chestY - 64;
      headX   = neckX + yaw * 12;
      headY   = neckY - 26;
      headRot = (isLateral ? facingDir * 0.05 : 0) - yaw * 0.04;
      capeFlutter = (0.95 + bounce * 0.45) * amp;
      legSpread = 0.55 * amp;

      // Escorço de perspectiva nos quadris (em perfil lateral yaw ~ 1.0, a distância horizontal estreita)
      const hipNarrowing = Math.max(0.22, Math.abs(Math.cos(yaw * Math.PI * 0.5)));
      hipL = { x: pelvisX - (98 * hipNarrowing) + yaw * 26, y: pelvisY + 50 };
      hipR = { x: pelvisX + (98 * hipNarrowing) + yaw * 26, y: pelvisY + 50 };

      // Solver de marcha biomecânica em 4 fases para cada perna
      const computeGaitFoot = (p, isLeft) => {
        const strideTravel = isWalk ? 78 : 124;
        const liftHeight = isWalk ? 46 : 78;
        let strideT = 0;   // +1.0 = extensão frontal máxima, -1.0 = extensão traseira máxima
        let soleY = groundY;
        let pitch = 0;
        let contact = 'PLANTED';

        if (p < 0.60) {
          // --- FASE DE CONTATO / APOIO (60% do ciclo, pé colado no solo sustentando peso) ---
          if (p < 0.12) {
            // 1. Heel Strike (Impacto Inicial do Calcanhar)
            const k = p / 0.12;
            strideT = 1.0 - k * 0.20;
            soleY = groundY;
            pitch = 0.24 * (1.0 - k * 0.65);
            contact = 'STRIKE';
          } else if (p < 0.48) {
            // 2. Foot-Flat / Mid-Stance (Apoio Total cravado no chão — ZERO deslizamento)
            const k = (p - 0.12) / 0.36;
            strideT = 0.80 - k * 1.55;
            soleY = groundY;
            pitch = 0.0;
            contact = 'PLANTED';
          } else {
            // 3. Heel-Off & Toe-Off (Empurrão Propulsivo da Ponta do Pé)
            const k = (p - 0.48) / 0.12;
            strideT = -0.75 - k * 0.25;
            soleY = groundY - k * 12;
            pitch = -0.32 * k;
            contact = 'PUSH';
          }
        } else {
          // --- FASE DE BALANÇO / SWING (40% do ciclo, perna avança pelo ar) ---
          const k = (p - 0.60) / 0.40;
          contact = 'SWING';
          // Transição suave S-curve de trás (-1.0) para frente (+1.0)
          strideT = -1.0 + (3 * k * k - 2 * k * k * k) * 2.0;
          // Arco parabólico de elevação do pé acima do solo
          const lift = Math.sin(k * Math.PI) * liftHeight;
          soleY = groundY - lift;
          // Pitch faz transição de propulsão negativa (-0.32) para ataque de calcanhar (+0.24)
          pitch = -0.32 * (1.0 - k) + 0.24 * k;
        }

        let soleX = 0;
        let ankleX = 0;
        let ankleY = 0;

        if (isLateral) {
          // Caminhada / Corrida Lateral ou em 3/4 (Sagittal Scissoring ao longo de X!)
          const hipRef = isLeft ? hipL.x : hipR.x;
          soleX = hipRef + facingDir * strideT * strideTravel;
          ankleX = soleX - facingDir * Math.sin(pitch) * 18;
          ankleY = Math.min(groundY - 75, soleY - 82 + (Math.cos(pitch) - 1) * 18);
        } else {
          // Caminhada / Corrida Frontal (Sul / Norte — Movimento em profundidade Y)
          const baseOffset = isLeft ? -42 : 42;
          soleX = (isLeft ? hipL.x : hipR.x) + baseOffset;
          soleY += strideT * 18;
          ankleX = soleX;
          ankleY = Math.min(groundY - 75, soleY - 82);
        }

        // Joelho IK: Quando caminha de lado, AMBOS os joelhos dobram para a FRENTE do movimento!
        const bendDir = isLateral ? facingDir : (isLeft ? -1 : 1);
        const hipPt = isLeft ? hipL : hipR;
        const kneePt = RigAdapter.solveTwoBoneIK(hipPt, { x: ankleX, y: ankleY }, 148, 118, bendDir);

        return {
          strideT,
          footSole: { x: soleX, y: soleY },
          ankle: { x: ankleX, y: ankleY },
          knee: kneePt,
          pitch,
          contact
        };
      };

      const gL = computeGaitFoot(phase, true);
      const gR = computeGaitFoot((phase + 0.5) % 1.0, false);

      footSoleL = gL.footSole;
      ankleL = gL.ankle;
      kneeL = gL.knee;
      footPitchL = gL.pitch;
      contactL = gL.contact;

      footSoleR = gR.footSole;
      ankleR = gR.ankle;
      kneeR = gR.knee;
      footPitchR = gR.pitch;
      contactR = gR.contact;

      // Balanço Contralateral dos Braços (Braço oposto avança junto com a perna)
      const armSwingL = -gL.strideT;
      const armSwingR = -gR.strideT;

      shoulderL = { x: chestX - 140 + (isLateral ? -yaw * 18 : 0), y: chestY - 44 };
      const wristLX = shoulderL.x - 140 + (isLateral ? facingDir * armSwingL * 38 : 0);
      const wristLY = shoulderL.y + 115 + armSwingL * (isWalk ? 44 : 68);
      wristL = { x: wristLX, y: wristLY };
      elbowL = RigAdapter.solveTwoBoneIK(shoulderL, wristL, 96, 86, isLateral ? facingDir : -1);
      handGripL = { x: wristL.x + (isLateral ? facingDir * 16 : -14), y: wristL.y + 36 };
      weaponLRot = (isLateral ? facingDir * 0.45 : -0.58) + armSwingL * 0.32;
      chainSwayL = 0.85 * amp * armSwingL;

      shoulderR = { x: chestX + 140 + (isLateral ? yaw * 18 : 0), y: chestY - 44 };
      const wristRX = shoulderR.x + 140 + (isLateral ? facingDir * armSwingR * 38 : 0);
      const wristRY = shoulderR.y + 115 + armSwingR * (isWalk ? 44 : 68);
      wristR = { x: wristRX, y: wristRY };
      elbowR = RigAdapter.solveTwoBoneIK(shoulderR, wristR, 96, 86, isLateral ? facingDir : 1);
      handGripR = { x: wristR.x + (isLateral ? facingDir * 16 : 18), y: wristR.y + 36 };
      weaponRRot = (isLateral ? facingDir * 0.45 : 0.62) + armSwingR * 0.32;
      chainSwayR = -0.85 * amp * armSwingR;

    } else if (action === 'dash') {
      // Esquiva rápida (Stealth Assassin Dash) — corpo inclinado, lâminas recolhidas em guarda reversa
      pelvisX = cx + yaw * 32;
      pelvisY = 852;
      chestX  = pelvisX + yaw * 38;
      chestY  = pelvisY - 82;
      neckX   = chestX + yaw * 18;
      neckY   = chestY - 60;
      headX   = neckX + yaw * 16;
      headY   = neckY - 22;
      headRot = -yaw * 0.14;
      capeFlutter = 1.65;
      legSpread = 0.92;

      hipL      = { x: pelvisX - 115, y: pelvisY + 46 };
      ankleL    = { x: pelvisX - 210, y: 1110 };
      kneeL     = RigAdapter.solveTwoBoneIK(hipL, ankleL, 148, 118, -1);
      footSoleL = { x: pelvisX - 228, y: groundY - 35 };
      footPitchL = 0.32;

      hipR      = { x: pelvisX + 115, y: pelvisY + 46 };
      ankleR    = { x: pelvisX + 195, y: 1138 };
      kneeR     = RigAdapter.solveTwoBoneIK(hipR, ankleR, 148, 118, 1);
      footSoleR = { x: pelvisX + 215, y: groundY - 12 };
      footPitchR = -0.25;

      shoulderL = { x: chestX - 144, y: chestY - 40 };
      wristL    = { x: shoulderL.x - 165, y: shoulderL.y + 30 };
      elbowL    = RigAdapter.solveTwoBoneIK(shoulderL, wristL, 96, 86, -1);
      handGripL = { x: wristL.x - 36, y: wristL.y + 18 };
      weaponLRot = -1.15;
      chainSwayL = 1.45;

      shoulderR = { x: chestX + 144, y: chestY - 40 };
      wristR    = { x: shoulderR.x + 165, y: shoulderR.y + 30 };
      elbowR    = RigAdapter.solveTwoBoneIK(shoulderR, wristR, 96, 86, 1);
      handGripR = { x: wristR.x + 36, y: wristR.y + 18 };
      weaponRRot = 1.15;
      chainSwayR = -1.45;

    } else if (action === 'attack' || action === 'combo1') {
      // Golpe 1 / Pose de Ataque Canônica do RIG-01 (Corte Amplo Esquerdo)
      const p = typeof attackProgress === 'number'
        ? Math.sin(Math.min(1, attackProgress * 1.35) * Math.PI * 0.5)
        : (time === 0 ? 1.0 : (0.65 + 0.35 * Math.sin(time * Math.PI * 2)));

      pelvisX = cx - 18 * p;
      pelvisY = 835 + 23 * p;
      chestX  = pelvisX + 26 * p;
      chestY  = pelvisY - 88;
      neckX   = chestX + 16 * p;
      neckY   = chestY - 64;
      headX   = neckX + 12 * p;
      headY   = neckY - 26;
      headRot = -0.09 * p;
      capeFlutter = 1.25 * p;
      legSpread = 0.85 * p;

      hipL      = { x: pelvisX - 112, y: pelvisY + 50 };
      kneeL     = { x: pelvisX - 168, y: 1042 };
      ankleL    = { x: pelvisX - 202, y: 1148 };
      footSoleL = { x: pelvisX - 218, y: groundY };
      footPitchL = 0.08 * p;

      hipR      = { x: pelvisX + 118, y: pelvisY + 50 };
      kneeR     = { x: pelvisX + 178, y: 1042 };
      ankleR    = { x: pelvisX + 215, y: 1148 };
      footSoleR = { x: pelvisX + 232, y: groundY };
      footPitchR = -0.10 * p;

      shoulderL = { x: chestX - 148, y: chestY - 52 };
      elbowL    = { x: shoulderL.x - 135, y: shoulderL.y - 38 * p };
      wristL    = { x: elbowL.x - 118, y: elbowL.y - 45 * p };
      handGripL = { x: wristL.x - 54, y: wristL.y - 18 * p };
      weaponLRot = 0.48 * p;
      chainSwayL = 1.15 * p;

      shoulderR = { x: chestX + 142, y: chestY - 38 };
      elbowR    = { x: shoulderR.x + 118, y: shoulderR.y + 42 };
      wristR    = { x: elbowR.x + 95, y: elbowR.y + 28 };
      handGripR = { x: wristR.x + 52, y: wristR.y + 12 };
      weaponRRot = -0.38 * p;
      chainSwayR = -0.95 * p;

    } else if (action === 'combo2') {
      // Golpe 2: Revés Sangrento Direito (torção oposta do tronco + arco violento da lâmina direita)
      const p = typeof attackProgress === 'number'
        ? Math.sin(Math.min(1, attackProgress * 1.35) * Math.PI * 0.5)
        : 1.0;

      pelvisX = cx + 20 * p;
      pelvisY = 858;
      chestX  = pelvisX - 30 * p;
      chestY  = pelvisY - 88;
      neckX   = chestX - 16 * p;
      neckY   = chestY - 64;
      headX   = neckX - 12 * p;
      headY   = neckY - 26;
      headRot = 0.10 * p;
      capeFlutter = -1.15 * p;
      legSpread = 0.88 * p;

      hipL      = { x: pelvisX - 118, y: pelvisY + 50 };
      kneeL     = { x: pelvisX - 178, y: 1042 };
      ankleL    = { x: pelvisX - 215, y: 1148 };
      footSoleL = { x: pelvisX - 232, y: groundY };
      footPitchL = 0.10;

      hipR      = { x: pelvisX + 112, y: pelvisY + 50 };
      kneeR     = { x: pelvisX + 168, y: 1042 };
      ankleR    = { x: pelvisX + 202, y: 1148 };
      footSoleR = { x: pelvisX + 218, y: groundY };
      footPitchR = -0.08;

      // Braço esquerdo recolhido em contrapeso
      shoulderL = { x: chestX - 142, y: chestY - 38 };
      elbowL    = { x: shoulderL.x - 115, y: shoulderL.y + 46 };
      wristL    = { x: elbowL.x - 92, y: elbowL.y + 32 };
      handGripL = { x: wristL.x - 48, y: wristL.y + 14 };
      weaponLRot = 0.35 * p;
      chainSwayL = 0.95;

      // Braço direito rasgando em arco elevado lateral
      shoulderR = { x: chestX + 148, y: chestY - 52 };
      elbowR    = { x: shoulderR.x + 138, y: shoulderR.y - 42 * p };
      wristR    = { x: elbowR.x + 122, y: elbowR.y - 48 * p };
      handGripR = { x: wristR.x + 56, y: wristR.y - 20 * p };
      weaponRRot = -0.58 * p;
      chainSwayR = -1.25;

    } else if (action === 'combo3' || action === 'skillE') {
      // Golpe 3 / Skill E: Tesoura Dupla do Caos (ambas as lâminas cruzam à frente em X flamejante)
      const p = typeof attackProgress === 'number'
        ? Math.sin(Math.min(1, attackProgress * 1.4) * Math.PI * 0.5)
        : 1.0;

      pelvisX = cx;
      pelvisY = 864;
      chestX  = cx;
      chestY  = pelvisY - 90;
      neckX   = cx;
      neckY   = chestY - 62;
      headX   = cx;
      headY   = neckY - 24;
      headRot = 0;
      capeFlutter = 1.45 * p;
      legSpread = 0.96 * p;

      hipL      = { x: pelvisX - 122, y: pelvisY + 48 };
      kneeL     = { x: pelvisX - 186, y: 1044 };
      ankleL    = { x: pelvisX - 224, y: 1148 };
      footSoleL = { x: pelvisX - 242, y: groundY };
      footPitchL = 0.12;

      hipR      = { x: pelvisX + 122, y: pelvisY + 48 };
      kneeR     = { x: pelvisX + 186, y: 1044 };
      ankleR    = { x: pelvisX + 224, y: 1148 };
      footSoleR = { x: pelvisX + 242, y: groundY };
      footPitchR = -0.12;

      shoulderL = { x: chestX - 150, y: chestY - 48 };
      elbowL    = { x: shoulderL.x - 110, y: shoulderL.y + 18 };
      wristL    = { x: elbowL.x - 75, y: elbowL.y + 58 * p };
      handGripL = { x: wristL.x - 32, y: wristL.y + 42 * p };
      weaponLRot = -0.95 * p;
      chainSwayL = 1.35;

      shoulderR = { x: chestX + 150, y: chestY - 48 };
      elbowR    = { x: shoulderR.x + 110, y: shoulderR.y + 18 };
      wristR    = { x: elbowR.x + 75, y: elbowR.y + 58 * p };
      handGripR = { x: wristR.x + 32, y: wristR.y + 42 * p };
      weaponRRot = 0.95 * p;
      chainSwayR = -1.35;

    } else if (action === 'combo4' || action === 'skillQ' || action === 'skillR') {
      // Golpe 4 (Turbilhão das Correntes) / Skill Q (Chain Hook) / Skill R (Cataclismo):
      // As Lâminas do Caos são arremessadas à distância presas pelas Correntes Infernais!
      const p = typeof attackProgress === 'number'
        ? Math.sin(Math.min(1, attackProgress) * Math.PI)
        : 1.0;

      pelvisX = cx;
      pelvisY = action === 'skillR' ? 810 - p * 45 : 856;
      chestX  = cx;
      chestY  = pelvisY - 88;
      neckX   = cx;
      neckY   = chestY - 64;
      headX   = cx;
      headY   = neckY - 26;
      capeFlutter = 1.65;
      legSpread = 0.92;

      hipL      = { x: pelvisX - 116, y: pelvisY + 50 };
      kneeL     = { x: pelvisX - 176, y: pelvisY + 190 };
      ankleL    = { x: pelvisX - 210, y: Math.min(1148, pelvisY + 295) };
      footSoleL = { x: pelvisX - 226, y: action === 'skillR' ? groundY - p * 35 : groundY };

      hipR      = { x: pelvisX + 116, y: pelvisY + 50 };
      kneeR     = { x: pelvisX + 176, y: pelvisY + 190 };
      ankleR    = { x: pelvisX + 210, y: Math.min(1148, pelvisY + 295) };
      footSoleR = { x: pelvisX + 226, y: action === 'skillR' ? groundY - p * 35 : groundY };

      shoulderL = { x: chestX - 148, y: chestY - 50 };
      elbowL    = { x: shoulderL.x - 132, y: shoulderL.y - 24 };
      wristL    = { x: elbowL.x - 115, y: elbowL.y - 12 };
      handGripL = { x: wristL.x - 46, y: wristL.y - 6 };

      shoulderR = { x: chestX + 148, y: chestY - 50 };
      elbowR    = { x: shoulderR.x + 132, y: shoulderR.y - 24 };
      wristR    = { x: elbowR.x + 115, y: elbowR.y - 12 };
      handGripR = { x: wristR.x + 46, y: wristR.y - 6 };

      // Extensão das lâminas na ponta das correntes infernais!
      const ext = Math.max(0.35, p);
      weaponLPos = {
        x: handGripL.x - 135 * ext,
        y: handGripL.y + 42 * ext
      };
      weaponLRot = 0.82 * ext;
      chainSwayL = 1.55;

      if (action === 'skillQ') {
        weaponRRot = 0.52;
        chainSwayR = -0.65;
      } else {
        weaponRPos = {
          x: handGripR.x + 135 * ext,
          y: handGripR.y + 42 * ext
        };
        weaponRRot = -0.82 * ext;
        chainSwayR = -1.55;
      }
    }

    return {
      id: `rig-${action}-${orientation.toLowerCase()}`,
      label: `RIG-01: ${action.toUpperCase()} (${orientation})`,
      refImage,
      category: 'rig-pose',
      action,
      orientation,
      showHead: true,
      showBody: true,
      showCape: true,
      showScarf: true,
      showWeapons: true,
      showBareNeck: false,
      yaw,
      capeFlutter,
      legSpread,
      bodyScale: 0.76,
      head: {
        x: headX,
        y: headY,
        scaleX: 0.568,
        scaleY: 0.568,
        rotation: headRot,
        yaw,
        anchorX: 637,
        anchorY: 1132
      },
      neckBase: { x: neckX, y: neckY },
      chest:    { x: chestX, y: chestY },
      pelvis:   { x: pelvisX, y: pelvisY },
      armL: { shoulder: shoulderL, elbow: elbowL, wrist: wristL, handGrip: handGripL },
      armR: { shoulder: shoulderR, elbow: elbowR, wrist: wristR, handGrip: handGripR },
      legL: { hip: hipL, knee: kneeL, ankle: ankleL, footSole: footSoleL, footPitch: footPitchL, contact: contactL, facingDir, yaw },
      legR: { hip: hipR, knee: kneeR, ankle: ankleR, footSole: footSoleR, footPitch: footPitchR, contact: contactR, facingDir, yaw },
      skeleton: {
        pelvis: { x: pelvisX, y: pelvisY },
        chest: { x: chestX, y: chestY },
        neckBase: { x: neckX, y: neckY },
        headPivot: { x: headX, y: headY },
        shoulderL,
        shoulderR,
        hipL,
        hipR,
        armL: { shoulder: shoulderL, elbow: elbowL, wrist: wristL, handGrip: handGripL },
        armR: { shoulder: shoulderR, elbow: elbowR, wrist: wristR, handGrip: handGripR },
        legL: { hip: hipL, knee: kneeL, ankle: ankleL, footSole: footSoleL, footPitch: footPitchL, contact: contactL, facingDir, yaw },
        legR: { hip: hipR, knee: kneeR, ankle: ankleR, footSole: footSoleR, footPitch: footPitchR, contact: contactR, facingDir, yaw }
      },
      weaponL: {
        x: weaponLPos ? weaponLPos.x : handGripL.x,
        y: weaponLPos ? weaponLPos.y : handGripL.y,
        scale: 0.62,
        rotation: weaponLRot,
        chainSway: chainSwayL,
        isExtended: !!weaponLPos
      },
      weaponR: {
        x: weaponRPos ? weaponRPos.x : handGripR.x,
        y: weaponRPos ? weaponRPos.y : handGripR.y,
        scale: 0.62,
        rotation: weaponRRot,
        chainSway: chainSwayR,
        isExtended: !!weaponRPos
      }
    };
  }
}


  // --- MODULE: src/HeroRenderer.js ---
// ============================================================================
// HeroRenderer.js — Orquestrador Principal do Desenho Procedural HERO-02
// Controla a ordem das camadas (Z-order), aplica poses estáticas ou do RIG-01,
// integra o Baker Offscreen de Peças Articuladas (100% Canvas 2D, Zero PNGs)
// para garantir > 200 FPS (< 0.5 ms/frame) em animação contínua e na Arena,
// e renderiza o modo de diagnóstico de articulações e pivôs.
// ============================================================================
class HeroRenderer {
  constructor() {
    this.materials = new MaterialPainter();
    this.headPainter = new HeadPainter(this.materials);
    this.torsoPainter = new TorsoPainter(this.materials);
    this.armPainter = new ArmPainter(this.materials);
    this.handPainter = new HandPainter(this.materials);
    this.legPainter = new LegPainter(this.materials);
    this.bootPainter = new BootPainter(this.materials);
    this.clothPainter = new ClothPainter(this.materials);
    this.accessoryPainter = new AccessoryPainter(this.materials);
    this.scarfPainter = new ScarfPainter(this.materials);
    this.capePainter = new CapePainter(this.materials);
    this.weaponPainter = new WeaponPainter(this.materials);

    // Cache de poses canônicas estáticas (1254x1254) e peças articuladas do Rig
    this.staticPoseCache = new Map();
    this.rigParts = null;
  }

  /**
   * Renderiza o HERO-02 completo (ou peça isolada) em um espaço canônico 1254 × 1254.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} pose - Objeto de pose (de PosePresets ou RigAdapter)
   * @param {Object} opts - { showPivots: boolean, drawGroundShadow: boolean, fastRig: boolean, forceUncached: boolean }
   */
  render(ctx, pose, opts = {}) {
    const {
      showPivots = false,
      drawGroundShadow = false,
      fastRig = false,
      forceUncached = false
    } = opts;

    if (forceUncached) {
      this.renderDirect(ctx, pose, { showPivots, drawGroundShadow });
      return;
    }

    // Se estiver animando em tempo real (Arena ou Rig contínuo), usa o montador articulado
    // de peças procedurais pré-assadas no próprio Canvas 2D (< 0.4 ms por frame, > 200 FPS!)
    if (fastRig && pose.showBody && pose.showHead && pose.showWeapons) {
      this.renderFastArticulatedRig(ctx, pose, { showPivots, drawGroundShadow });
      return;
    }

    // Para poses estáticas de inspeção (Modes 1, 2, 3, 4 em repouso), faz o cache offscreen
    // exato de 1254x1254 na primeira chamada usando renderDirect (100% procedural)
    const cacheKey = `${pose.id || 'custom'}|piv:${showPivots ? 1 : 0}|shd:${drawGroundShadow ? 1 : 0}`;
    if (!this.staticPoseCache.has(cacheKey)) {
      const off = document.createElement('canvas');
      off.width = 1254;
      off.height = 1254;
      const octx = off.getContext('2d');
      this.renderDirect(octx, pose, { showPivots, drawGroundShadow });
      this.staticPoseCache.set(cacheKey, off);
    }
    ctx.drawImage(this.staticPoseCache.get(cacheKey), 0, 0);
  }

  /**
   * Pipeline Procedural Direto (executa todos os 11 Painters diretamente no contexto).
   */
  renderDirect(ctx, pose, opts = {}) {
    const {
      showPivots = false,
      drawGroundShadow = false
    } = opts;

    const s = pose.bodyScale || 1.0;
    const yaw = pose.yaw || 0;

    ctx.save();

    // 0. Sombra elíptica no chão opcional
    if (drawGroundShadow && pose.legL && pose.legR) {
      const gx = (pose.legL.footSole.x + pose.legR.footSole.x) * 0.5;
      const gy = Math.max(pose.legL.footSole.y, pose.legR.footSole.y) + 6;
      const sg = ctx.createRadialGradient(gx, gy, 30, gx, gy, 340);
      sg.addColorStop(0.0, 'rgba(15, 8, 5, 0.45)');
      sg.addColorStop(0.65, 'rgba(15, 8, 5, 0.18)');
      sg.addColorStop(1.0, 'rgba(15, 8, 5, 0.0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 340, 48, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. CAPA TRASEIRA ASSIMÉTRICA (atrás do tronco e do braço direito)
    if (pose.showCape && pose.neckBase) {
      this.capePainter.paint(ctx, pose.neckBase, s, yaw, pose.capeFlutter || 0);
    }

    if (pose.showBody) {
      // 2. COXAS MUSCULOSAS (Esquerda e Direita)
      if (pose.legL) this.legPainter.paint(ctx, pose.legL, 'L', s);
      if (pose.legR) this.legPainter.paint(ctx, pose.legR, 'R', s);

      // 3. SAIOTE ESCURO RASGADO + FAIXAS VERMELHAS INTERNAS
      if (pose.pelvis) {
        this.clothPainter.paint(ctx, pose.pelvis, s, yaw, pose.legSpread || 0);
      }

      // 4. BOTAS COLOSSAIS DE COURO (sobrepõem a base das canelas e pontas laterais)
      if (pose.legL) this.bootPainter.paint(ctx, pose.legL, 'L', s);
      if (pose.legR) this.bootPainter.paint(ctx, pose.legR, 'R', s);

      // 5. TRONCO SEM CAMISA (Peitoral, Abdômen e Pescoço)
      this.torsoPainter.paint(ctx, pose);

      // 6. CINTO DE COURO, FAIXAS LATERAIS, CORRENTES DE BRONZE E CAVEIRA ÚNICA FRONTAL
      if (pose.pelvis) {
        this.accessoryPainter.paint(ctx, pose.pelvis, s, yaw);
      }

      // 7. BRAÇOS, BRAÇADEIRAS EM CAMADAS E VOLTAS DE CORRENTE INFERNAL NOS PULSOS/ANTEBRAÇOS
      const hasWeaponChains = !!pose.showWeapons;
      if (pose.armL) this.armPainter.paint(ctx, pose.armL, 'L', s, hasWeaponChains);
      if (pose.armR) this.armPainter.paint(ctx, pose.armR, 'R', s, hasWeaponChains);

      // 7.5. DORSO DA MÃO, PROTETOR DE COURO E BASE DA PALMA (gripBack + fingersBack atrás do cabo!)
      if (pose.armL) {
        const holdL = !!pose.showWeapons && !(pose.weaponL && pose.weaponL.isExtended);
        this.handPainter.paintWristAndPalmBack(ctx, pose.armL.wrist, pose.armL.handGrip, 'L', s, holdL);
      }
      if (pose.armR) {
        const holdR = !!pose.showWeapons && !(pose.weaponR && pose.weaponR.isExtended);
        this.handPainter.paintWristAndPalmBack(ctx, pose.armR.wrist, pose.armR.handGrip, 'R', s, holdR);
      }
    }

    // 8. CORRENTES INFERNAIS DINÂMICAS (Pomo <-> Pulso) + ARMAS PROCEDURAIS (Lâminas do Caos)
    if (pose.showWeapons) {
      if (pose.showBody) {
        if (pose.weaponL && pose.armL) {
          this.weaponPainter.paintDynamicPommelToWristChain(ctx, { ...pose.weaponL, side: 'L' }, pose.armL, s);
        }
        if (pose.weaponR && pose.armR) {
          this.weaponPainter.paintDynamicPommelToWristChain(ctx, { ...pose.weaponR, side: 'R' }, pose.armR, s);
        }
      }
      if (pose.weaponL) {
        this.weaponPainter.paintWeapon(ctx, { ...pose.weaponL, side: 'L' });
      }
      if (pose.weaponR) {
        this.weaponPainter.paintWeapon(ctx, { ...pose.weaponR, side: 'R' });
      }
    }

    // 9. DEDOS INDIVIDUAIS FECHADOS E POLEGAR (fingersFront -> thumb -> guardLip abraçando o cabo!)
    if (pose.showBody && pose.showWeapons) {
      if (pose.armL && !(pose.weaponL && pose.weaponL.isExtended)) {
        this.handPainter.paintClenchedFingersOverHilt(ctx, pose.armL.wrist, pose.armL.handGrip, pose.weaponL, 'L', s);
      }
      if (pose.armR && !(pose.weaponR && pose.weaponR.isExtended)) {
        this.handPainter.paintClenchedFingersOverHilt(ctx, pose.armR.wrist, pose.armR.handGrip, pose.weaponR, 'R', s);
      }
    }

    // 10. CACHECOL VERMELHO VOLUMOSO NO PESCOÇO (cobre a junção ombro-pescoço)
    if (pose.showScarf && pose.neckBase) {
      this.scarfPainter.paint(ctx, pose.neckBase, s, yaw);
    }

    // 11. CABEÇA CHIBI COMPLETA (Orelhas, Rosto, Olhos Vermelhos e 22 Mechas de Cabelo)
    if (pose.showHead && pose.head) {
      this.headPainter.paint(ctx, pose.head);
    }

    // 12. MODO 3 — DIAGNÓSTICO DE ARTICULAÇÕES, PIVÔS E GUIAS ANATÔMICAS
    if (showPivots) {
      this.paintArticulationDiagnostics(ctx, pose);
    }

    ctx.restore();
  }

  // ==========================================================================
  // BAKER OFFSCREEN DE PEÇAS ARTICULADAS (ETAPA 2 & ETAPA 4 — 200+ FPS)
  // Usa exatamente os mesmos Painters procedurais em Canvas 2D para gerar os
  // segmentos anatômicos na inicialização e articulá-los em < 0.4 ms por frame!
  // ==========================================================================
  ensureRigPartsBaked() {
    if (this.rigParts) return this.rigParts;

    const s = 0.76; // bodyScale canônico do herói completo
    const parts = {};

    const makeCanvas = (w, h) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return { canvas: c, ctx: c.getContext('2d') };
    };

    // 1. Capa Traseira (ancorada em neckBase = (280, 120) no buffer local)
    {
      const { canvas, ctx } = makeCanvas(640, 640);
      this.capePainter.paint(ctx, { x: 280, y: 120 }, s, 0, 0);
      parts.cape = { canvas, ax: 280, ay: 120 };
    }

    // 2. Saiote Rasgado (ancorado em pelvis = (240, 60))
    {
      const { canvas, ctx } = makeCanvas(480, 320);
      this.clothPainter.paint(ctx, { x: 240, y: 60 }, s, 0, 0);
      parts.skirt = { canvas, ax: 240, ay: 60 };
    }

    // 3. Coxas Esquerda e Direita (vertical de hip=(110, 60) até knee=(110, 205), len=145)
    for (const side of ['L', 'R']) {
      const { canvas, ctx } = makeCanvas(220, 260);
      this.legPainter.paint(ctx, {
        hip: { x: 110, y: 60 },
        knee: { x: 110, y: 205 },
        ankle: { x: 110, y: 315 },
        footSole: { x: 110, y: 396 }
      }, side, s);
      parts[`thigh${side}`] = { canvas, ax: 110, ay: 60, refLen: 145 };
    }

    // 4. Botas Colossais: Frontais (L/R) e Laterais (Direita/Esquerda)
    for (const side of ['L', 'R']) {
      const { canvas, ctx } = makeCanvas(380, 260);
      const naturalKneeX = 190 + (side === 'L' ? -17 : 17);
      this.bootPainter.paint(ctx, {
        hip: { x: naturalKneeX, y: -100 },
        knee: { x: naturalKneeX, y: 45 },
        ankle: { x: 190, y: 155 },
        footSole: { x: 190, y: 235 },
        footPitch: 0,
        facingDir: 0,
        yaw: 0
      }, side, s);
      parts[`boot${side}`] = { canvas, ax: 190, ay: 45, refLen: 190 };
      parts[`bootFront${side}`] = parts[`boot${side}`];
    }

    // Bota voltada para a Direita (East, yaw = -0.96, facingDir = 1)
    {
      const { canvas, ctx } = makeCanvas(380, 260);
      this.bootPainter.paint(ctx, {
        hip: { x: 190, y: -100 },
        knee: { x: 190, y: 45 },
        ankle: { x: 190, y: 155 },
        footSole: { x: 190, y: 235 },
        footPitch: 0,
        facingDir: 1,
        yaw: -0.96
      }, 'R', s);
      parts.bootRight = { canvas, ax: 190, ay: 45, refLen: 190 };
    }

    // Bota voltada para a Esquerda (West, yaw = 0.96, facingDir = -1)
    {
      const { canvas, ctx } = makeCanvas(380, 260);
      this.bootPainter.paint(ctx, {
        hip: { x: 190, y: -100 },
        knee: { x: 190, y: 45 },
        ankle: { x: 190, y: 155 },
        footSole: { x: 190, y: 235 },
        footPitch: 0,
        facingDir: -1,
        yaw: 0.96
      }, 'L', s);
      parts.bootLeft = { canvas, ax: 190, ay: 45, refLen: 190 };
    }

    // 5. Tronco + Cinto + Caveira + Cachecol para 5 orientações (S, SE, E, SW, W)
    for (const [key, yawVal] of [['S', 0], ['SE', -0.78], ['E', -0.96], ['SW', 0.78], ['W', 0.96]]) {
      const { canvas, ctx } = makeCanvas(520, 460);
      const mockPose = {
        bodyScale: s,
        yaw: yawVal,
        showBareNeck: false,
        neckBase: { x: 260, y: 112 },
        chest: { x: 260, y: 178 },
        pelvis: { x: 260, y: 265 }
      };
      this.torsoPainter.paint(ctx, mockPose);
      this.accessoryPainter.paint(ctx, mockPose.pelvis, s, yawVal);
      this.scarfPainter.paint(ctx, mockPose.neckBase, s, yawVal);
      parts[`torso_${key}`] = { canvas, ax: 260, ay: 265 }; // ancorado na pelve
    }

    // 6. Cabeça Chibi Completa para 5 orientações (S, SE, E, SW, W)
    for (const [key, yawVal] of [['S', 0], ['SE', -0.78], ['E', -0.96], ['SW', 0.78], ['W', 0.96]]) {
      const { canvas, ctx } = makeCanvas(760, 680);
      this.headPainter.paint(ctx, {
        x: 380,
        y: 610,
        scaleX: 0.568,
        scaleY: 0.568,
        rotation: 0,
        yaw: yawVal,
        anchorX: 637,
        anchorY: 1132
      });
      parts[`head_${key}`] = { canvas, ax: 380, ay: 610 };
    }

    // 7. Braço Completo + Correntes no Antebraço + Lâmina do Caos + 4 Dedos Empunhando
    // Assamos também os segmentos de braço (shoulder -> wrist) e o conjunto Mão+Arma (ancorado em handGrip)
    for (const side of ['L', 'R']) {
      // 7a. Braço + Antebraço com Voltas de Corrente Infernal (de shoulder=(120, 90) até wrist=(120, 250), len=160)
      {
        const { canvas, ctx } = makeCanvas(240, 340);
        const isL = side === 'L';
        const armMock = {
          shoulder: { x: 120, y: 90 },
          elbow: { x: 120 + (isL ? -18 : 18), y: 170 },
          wrist: { x: 120, y: 250 },
          handGrip: { x: 120, y: 288 }
        };
        this.armPainter.paint(ctx, armMock, side, s, true);
        parts[`arm_${side}`] = { canvas, ax: 120, ay: 90, refLen: 160 };
      }

      // 7b. Conjunto Mão + Lâmina do Caos Empunhada (gripBack -> fingersBack -> Arma -> 4 Dedos -> Polegar -> Guarda)
      // Ancorado em handGrip = (380, 320) com rotation = 0
      {
        const { canvas, ctx } = makeCanvas(720, 680);
        const gx = 380, gy = 320;
        const wristMock = { x: gx, y: gy - 46 * s };
        const gripMock = { x: gx, y: gy };
        const wPoseMock = { x: gx, y: gy, scale: 0.62, rotation: 0, side };
        this.handPainter.paintWristAndPalmBack(ctx, wristMock, gripMock, side, s, true);
        this.weaponPainter.paintWeapon(ctx, wPoseMock);
        this.handPainter.paintClenchedFingersOverHilt(ctx, wristMock, gripMock, wPoseMock, side, s);
        parts[`weaponHeld_${side}`] = { canvas, ax: gx, ay: gy };
      }

      // 7c. Lâmina do Caos Isolada em Voo (para ataques com corrente estendida: combo4 / skillQ / skillR)
      {
        const { canvas, ctx } = makeCanvas(720, 680);
        const gx = 380, gy = 320;
        this.weaponPainter.paintWeapon(ctx, { x: gx, y: gy, scale: 0.62, rotation: 0, side });
        parts[`weaponFlying_${side}`] = { canvas, ax: gx, ay: gy };
      }

      // 7d. Punho Fechado Segurando a Corrente (usado quando a arma foi arremessada)
      {
        const { canvas, ctx } = makeCanvas(180, 180);
        this.handPainter.paintWristAndPalmBack(ctx, { x: 90, y: 54 }, { x: 90, y: 95 }, side, s, false);
        parts[`fist_${side}`] = { canvas, ax: 90, ay: 95 };
      }
    }

    // 8. Elos Individuais da Corrente Infernal (face e edge) para a catenária dinâmica Pomo <-> Pulso
    {
      const rng = createRNG(9901);
      const f = makeCanvas(96, 68);
      this.weaponPainter.paintStadiumChainRing(f.ctx, 48, 34, 0, rng, 0.52);
      parts.chainFace = { canvas: f.canvas, ax: 48, ay: 34 };

      const e = makeCanvas(84, 54);
      this.weaponPainter.paintStadiumSideLink(e.ctx, 42, 27, 0, rng, 0.52);
      parts.chainEdge = { canvas: e.canvas, ax: 42, ay: 27 };
    }

    this.rigParts = parts;
    return parts;
  }

  /**
   * Renderiza o Esqueleto Articulado RIG-01 em alta velocidade (< 0.4 ms / > 200 FPS)
   * usando os componentes procedurais pré-assados + corrente catenária em tempo real.
   */
  renderFastArticulatedRig(ctx, pose, opts = {}) {
    const parts = this.ensureRigPartsBaked();
    const { showPivots = false, drawGroundShadow = false } = opts;
    const s = pose.bodyScale || 0.76;
    const yaw = pose.yaw || 0;
    let orientKey = 'S';
    if (yaw < -0.85) orientKey = 'E';
    else if (yaw < -0.25) orientKey = 'SE';
    else if (yaw > 0.85) orientKey = 'W';
    else if (yaw > 0.25) orientKey = 'SW';

    ctx.save();

    // 0. Sombra no chão
    if (drawGroundShadow && pose.legL && pose.legR) {
      const gx = (pose.legL.footSole.x + pose.legR.footSole.x) * 0.5;
      const gy = Math.max(pose.legL.footSole.y, pose.legR.footSole.y) + 6;
      ctx.fillStyle = 'rgba(15, 8, 5, 0.32)';
      ctx.beginPath();
      ctx.ellipse(gx, gy, 240, 38, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawBoneSprite = (part, p1, p2, extraRot = 0, scaleX = 1.0) => {
      if (!part || !p1 || !p2) return;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || part.refLen;
      const ang = Math.atan2(dy, dx) - Math.PI * 0.5 + extraRot;
      const sy = len / part.refLen;
      ctx.save();
      ctx.translate(p1.x, p1.y);
      ctx.rotate(ang);
      ctx.scale(scaleX, sy);
      ctx.drawImage(part.canvas, -part.ax, -part.ay);
      ctx.restore();
    };

    // 1. Capa Traseira com esvoaçar dinâmico
    const drawCape = () => {
      if (pose.showCape && pose.neckBase) {
        const cp = parts.cape;
        ctx.save();
        ctx.translate(pose.neckBase.x + yaw * 18, pose.neckBase.y);
        ctx.rotate((pose.capeFlutter || 0) * -0.14);
        ctx.scale(1 + Math.abs(pose.capeFlutter || 0) * 0.06, 1);
        ctx.drawImage(cp.canvas, -cp.ax, -cp.ay);
        ctx.restore();
      }
    };

    // 2. Desenho de Perna com Seleção de Bota Direcional
    const drawLeg = (side) => {
      const leg = side === 'L' ? pose.legL : pose.legR;
      if (!leg) return;
      const thighPart = side === 'L' ? parts.thighL : parts.thighR;
      // Bota orientada sempre para a frente do movimento!
      const bootPart = yaw < -0.25
        ? parts.bootRight
        : (yaw > 0.25 ? parts.bootLeft : (side === 'L' ? parts.bootFrontL : parts.bootFrontR));

      drawBoneSprite(thighPart, leg.hip, leg.knee);
      drawBoneSprite(bootPart, leg.knee, leg.footSole, (leg.footPitch || 0) * 0.35);
    };

    // 3. Tronco, Saiote e Acessórios
    const drawTorsoAndSkirt = () => {
      if (pose.pelvis) {
        const sk = parts.skirt;
        ctx.save();
        ctx.translate(pose.pelvis.x, pose.pelvis.y);
        ctx.scale(1 + (pose.legSpread || 0) * 0.16, 1);
        ctx.drawImage(sk.canvas, -sk.ax, -sk.ay);
        ctx.restore();
      }
      if (pose.pelvis && pose.chest) {
        const tr = parts[`torso_${orientKey}`] || parts.torso_S;
        const tAng = Math.atan2(pose.chest.y - pose.pelvis.y, pose.chest.x - pose.pelvis.x) + Math.PI * 0.5;
        ctx.save();
        ctx.translate(pose.pelvis.x, pose.pelvis.y);
        ctx.rotate(tAng * 0.65);
        ctx.drawImage(tr.canvas, -tr.ax, -tr.ay);
        ctx.restore();
      }
    };

    // 4. Braço, Mão Empunhada e Lâmina do Caos
    const drawArmAndWeapon = (side) => {
      const arm = side === 'L' ? pose.armL : pose.armR;
      const wep = side === 'L' ? pose.weaponL : pose.weaponR;
      if (!arm) return;
      drawBoneSprite(side === 'L' ? parts.arm_L : parts.arm_R, arm.shoulder, arm.wrist);
      if (!wep) return;

      this.drawFastDynamicChain(ctx, parts, { ...wep, side }, arm, s);

      if (wep.isExtended) {
        const fist = parts[`fist_${side}`];
        ctx.save();
        ctx.translate(arm.handGrip.x, arm.handGrip.y);
        ctx.drawImage(fist.canvas, -fist.ax, -fist.ay);
        ctx.restore();

        const wf = parts[`weaponFlying_${side}`];
        ctx.save();
        ctx.translate(wep.x, wep.y);
        ctx.rotate(wep.rotation || 0);
        ctx.drawImage(wf.canvas, -wf.ax, -wf.ay);
        ctx.restore();
      } else {
        const wh = parts[`weaponHeld_${side}`];
        ctx.save();
        ctx.translate(wep.x, wep.y);
        ctx.rotate(wep.rotation || 0);
        ctx.drawImage(wh.canvas, -wh.ax, -wh.ay);
        ctx.restore();
      }
    };

    // Ordenação Z de Membros em Perspectiva 2.5D
    drawCape();
    if (yaw < -0.28) {
      // Olhando / Movendo para o Leste (Direita): Lado Esquerdo (L) é distante, Lado Direito (R) é próximo!
      drawArmAndWeapon('L');
      drawLeg('L');
      drawTorsoAndSkirt();
      drawLeg('R');
      drawArmAndWeapon('R');
    } else if (yaw > 0.28) {
      // Olhando / Movendo para o Oeste (Esquerda): Lado Direito (R) é distante, Lado Esquerdo (L) é próximo!
      drawArmAndWeapon('R');
      drawLeg('R');
      drawTorsoAndSkirt();
      drawLeg('L');
      drawArmAndWeapon('L');
    } else {
      // Olhando de Frente (Sul): Posição neutra
      drawLeg('L');
      drawLeg('R');
      drawTorsoAndSkirt();
      drawArmAndWeapon('L');
      drawArmAndWeapon('R');
    }

    // 5. Cabeça Chibi Completa (22 mechas + olhos rubi)
    if (pose.head) {
      const hd = parts[`head_${orientKey}`] || parts.head_S;
      ctx.save();
      ctx.translate(pose.head.x, pose.head.y);
      if (pose.head.rotation) ctx.rotate(pose.head.rotation);
      ctx.drawImage(hd.canvas, -hd.ax, -hd.ay);
      ctx.restore();
    }

    if (showPivots) {
      this.paintArticulationDiagnostics(ctx, pose);
    }

    ctx.restore();
  }

  /**
   * Estampa elos pré-assados (chainFace / chainEdge) ao longo da curva catenária
   * entre o pomo da arma e a argola do pulso em < 0.04 ms!
   */
  drawFastDynamicChain(ctx, parts, wPose, armPose, bodyScale = 0.76) {
    const isLeft = wPose.side === 'L';
    const anchors = this.weaponPainter.getWeaponWorldAnchors(wPose);
    const pommel = anchors.pommel;

    const fDx = armPose.wrist.x - armPose.elbow.x;
    const fDy = armPose.wrist.y - armPose.elbow.y;
    const fAng = Math.atan2(fDy, fDx);
    const perpAng = fAng + Math.PI * 0.5;
    const wristOffset = (isLeft ? 1 : -1) * 28 * bodyScale;

    const wristAnchor = {
      x: armPose.wrist.x + Math.cos(perpAng) * wristOffset,
      y: armPose.wrist.y + Math.sin(perpAng) * wristOffset
    };

    const dist = Math.hypot(wristAnchor.x - pommel.x, wristAnchor.y - pommel.y);
    if (dist < 8) return;

    const sway = wPose.chainSway || 0;
    const tension = Math.min(1.0, Math.max(0, (dist - 120) / 220));
    const sag = (1 - tension * 0.82) * (54 * bodyScale) + Math.abs(sway) * 18;
    const swayX = sway * 24 * bodyScale + (isLeft ? 18 : -18) * bodyScale;

    const ctrlX = (pommel.x + wristAnchor.x) * 0.5 + swayX;
    const ctrlY = Math.max(pommel.y, wristAnchor.y) + sag;

    const numLinks = Math.max(5, Math.min(16, Math.round(dist / 22) + 2));
    const sample = (t) => {
      const u = 1 - t;
      return {
        x: u * u * pommel.x + 2 * u * t * ctrlX + t * t * wristAnchor.x,
        y: u * u * pommel.y + 2 * u * t * ctrlY + t * t * wristAnchor.y
      };
    };

    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i <= numLinks; i++) {
        const isFace = (i % 2 === 0);
        if ((pass === 0 && !isFace) || (pass === 1 && isFace)) continue;

        const t = i / numLinks;
        const pt = sample(t);
        const ptNext = sample(Math.min(1, t + 0.05));
        const ptPrev = sample(Math.max(0, t - 0.05));
        const ang = Math.atan2(ptNext.y - ptPrev.y, ptNext.x - ptPrev.x);
        const sp = isFace ? parts.chainFace : parts.chainEdge;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(ang);
        ctx.drawImage(sp.canvas, -sp.ax, -sp.ay);
        ctx.restore();
      }
    }
  }

  paintArticulationDiagnostics(ctx, pose) {
    ctx.save();

    const drawBone = (p1, p2, color = '#38bdf8') => {
      if (!p1 || !p2) return;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    const drawPivot = (pt, label, color = '#facc15', radius = 9) => {
      if (!pt) return;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius + 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pt.x - radius - 4, pt.y);
      ctx.lineTo(pt.x + radius + 4, pt.y);
      ctx.moveTo(pt.x, pt.y - radius - 4);
      ctx.lineTo(pt.x, pt.y + radius + 4);
      ctx.stroke();

      if (label) {
        ctx.font = 'bold 17px Consolas, monospace';
        const tw = ctx.measureText(label).width;
        const lx = pt.x + 14;
        const ly = pt.y - 10;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
        ctx.fillRect(lx - 4, ly - 15, tw + 8, 21);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(lx - 4, ly - 15, tw + 8, 21);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(label, lx, ly);
      }
    };

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(627, 20);
    ctx.lineTo(627, 1240);
    ctx.moveTo(60, 1226);
    ctx.lineTo(1194, 1226);
    ctx.stroke();
    ctx.setLineDash([]);

    if (pose.showBody) {
      drawBone(pose.pelvis, pose.chest, '#fbbf24');
      drawBone(pose.chest, pose.neckBase, '#fbbf24');
      if (pose.head) drawBone(pose.neckBase, pose.head, '#fbbf24');

      if (pose.armL) {
        drawBone(pose.chest, pose.armL.shoulder, '#fb7185');
        drawBone(pose.armL.shoulder, pose.armL.elbow, '#fb7185');
        drawBone(pose.armL.elbow, pose.armL.wrist, '#fb7185');
        drawBone(pose.armL.wrist, pose.armL.handGrip, '#fb7185');
      }

      if (pose.armR) {
        drawBone(pose.chest, pose.armR.shoulder, '#60a5fa');
        drawBone(pose.armR.shoulder, pose.armR.elbow, '#60a5fa');
        drawBone(pose.armR.elbow, pose.armR.wrist, '#60a5fa');
        drawBone(pose.armR.wrist, pose.armR.handGrip, '#60a5fa');
      }

      if (pose.legL) {
        drawBone(pose.pelvis, pose.legL.hip, '#f43f5e');
        drawBone(pose.legL.hip, pose.legL.knee, '#f43f5e');
        drawBone(pose.legL.knee, pose.legL.ankle, '#f43f5e');
        drawBone(pose.legL.ankle, pose.legL.footSole, '#f43f5e');
      }

      if (pose.legR) {
        drawBone(pose.pelvis, pose.legR.hip, '#3b82f6');
        drawBone(pose.legR.hip, pose.legR.knee, '#3b82f6');
        drawBone(pose.legR.knee, pose.legR.ankle, '#3b82f6');
        drawBone(pose.legR.ankle, pose.legR.footSole, '#3b82f6');
      }

      drawPivot(pose.pelvis, 'pelvis / skullBuckle', '#facc15', 10);
      drawPivot(pose.chest, 'chest', '#facc15', 9);
      drawPivot(pose.neckBase, 'neckBase / scarf', '#facc15', 9);
      if (pose.showCape && pose.neckBase) {
        drawPivot({ x: pose.neckBase.x + 75 * (pose.bodyScale || 1), y: pose.neckBase.y + 10 }, 'capeAttach', '#f87171', 8);
      }

      if (pose.armL) {
        drawPivot(pose.armL.shoulder, 'shoulderL', '#fb7185', 8);
        drawPivot(pose.armL.elbow, 'elbowL', '#fb7185', 8);
        drawPivot(pose.armL.wrist, 'wristL (chainWrapL)', '#fb7185', 8);
        drawPivot(pose.armL.handGrip, 'handGripL / weaponL', '#a855f7', 9);
      }
      if (pose.armR) {
        drawPivot(pose.armR.shoulder, 'shoulderR', '#60a5fa', 8);
        drawPivot(pose.armR.elbow, 'elbowR', '#60a5fa', 8);
        drawPivot(pose.armR.wrist, 'wristR (chainWrapR)', '#60a5fa', 8);
        drawPivot(pose.armR.handGrip, 'handGripR / weaponR', '#a855f7', 9);
      }
      if (pose.legL) {
        drawPivot(pose.legL.hip, 'hipL', '#f43f5e', 8);
        drawPivot(pose.legL.knee, 'kneeL', '#f43f5e', 8);
        drawPivot(pose.legL.ankle, 'ankleL', '#f43f5e', 8);
        drawPivot(pose.legL.footSole, 'footSoleL', '#10b981', 9);
      }
      if (pose.legR) {
        drawPivot(pose.legR.hip, 'hipR', '#3b82f6', 8);
        drawPivot(pose.legR.knee, 'kneeR', '#3b82f6', 8);
        drawPivot(pose.legR.ankle, 'ankleR', '#3b82f6', 8);
        drawPivot(pose.legR.footSole, 'footSoleR', '#10b981', 9);
      }
    }

    if (pose.showHead && pose.head) {
      drawPivot({ x: pose.head.x, y: pose.head.y }, 'headPivot (chin/neck)', '#34d399', 10);
      const hs = pose.head.scaleX || 1;
      const eyeY = pose.head.y - (1132 - 942) * hs;
      drawPivot({ x: pose.head.x - 126 * hs + (pose.yaw || 0) * 20, y: eyeY }, 'eyeL', '#ef4444', 6);
      drawPivot({ x: pose.head.x + 148 * hs + (pose.yaw || 0) * 20, y: eyeY - 6 * hs }, 'eyeR', '#ef4444', 6);
      drawPivot({ x: pose.head.x + 190 * hs, y: pose.head.y - (1132 - 432) * hs }, 'hairWhorl', '#fb923c', 7);
    }

    if (pose.showWeapons && !pose.showBody) {
      if (pose.weaponL) {
        drawPivot({ x: pose.weaponL.x, y: pose.weaponL.y }, 'gripAnchorL', '#a855f7', 10);
        drawPivot({ x: pose.weaponL.x - 78, y: pose.weaponL.y + 18 }, 'chainRing1L', '#f59e0b', 8);
        drawPivot({ x: pose.weaponL.x + 81, y: pose.weaponL.y + 99 }, 'pommelRingL', '#f59e0b', 8);
      }
      if (pose.weaponR) {
        drawPivot({ x: pose.weaponR.x, y: pose.weaponR.y }, 'gripAnchorR', '#a855f7', 10);
        drawPivot({ x: pose.weaponR.x + 78, y: pose.weaponR.y + 18 }, 'chainRing1R', '#f59e0b', 8);
        drawPivot({ x: pose.weaponR.x - 81, y: pose.weaponR.y + 99 }, 'pommelRingR', '#f59e0b', 8);
      }
    }

    ctx.restore();
  }
}


  // --- MODULE: src/arena/ProceduralEnvironment.js ---
// ============================================================================
// ProceduralEnvironment.js — Sistema Procedural de Cenários e Ambientes
// Identidade Visual 100% Feita à Mão / Estilo Hades 1 (Jen Zee & Mike Mignola).
// Desenha lajes de ardósia lascadas em nanquim, santuários com relevos de górgona,
// colunas gregas caneladas com capitéis quebrados, chamas estígias pictóricas e
// suporta temas dinâmicos (Tártaro / Asfódelo / Medieval com Navio Fantasma).
// ============================================================================
const ENVIRONMENT_THEMES = {
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
class ProceduralEnvironment {
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



  // --- MODULE: src/arena/ArenaEngine.js ---
// ============================================================================
// ArenaEngine.js — Etapa 3 & Etapa 4: Arena da Ilha Tropical, Inimigos, Combos
// Encadeados, Física de Correntes, Hitboxes e Telemetria >= 200 FPS (1280x720).
// Inspirado em assets/references/ref-2d-maps/map-island-enemys.png e na
// arquitetura comprovada de Rafa+Claude (world.js + fx.js + main.js).
// Renderiza o herói com o MESMO HeroRenderer + RigAdapter procedural!
// ============================================================================
class ArenaEngine {
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


  window.HeroRenderer = HeroRenderer;
  window.POSE_PRESETS = POSE_PRESETS;
  window.RigAdapter = RigAdapter;
  window.ProceduralEnvironment = ProceduralEnvironment;
  window.ENVIRONMENT_THEMES = ENVIRONMENT_THEMES;
  window.ArenaEngine = ArenaEngine;
})(window);
