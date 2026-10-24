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
    const shiftX = yaw * 34;

    ctx.save();
    ctx.translate(shiftX, 0);

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
    const halfChestW = 176;
    const halfWaistW = 138;

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
// ArmPainter.js & HandPainter.js — Braços Musculosos, Braçadeiras em Camadas e Punhos
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
   * Ponte do punho + Aba de couro escuro do dorso + Base da palma.
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

    // Quando desarmado (hero-part-body / tpose), desenha o punho fechado completo aqui mesmo.
    // Quando armado (holdingWeapon === true), NÃO desenhamos o punho inteiro atrás do cabo
    // para não vazar pele por baixo do cabo; os 4 dedos e o polegar são desenhados na Camada 2!
    if (!holdingWeapon) {
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
   * Desenha os 4 dedos robustos curvados POR CIMA do cabo de couro e o polegar travando a empunhadura!
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

    // Sombra projetada pelos dedos sobre o cabo da arma
    ctx.fillStyle = 'rgba(18, 5, 3, 0.58)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 54, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bloco esculpido dos 4 dedos fechados abraçando o cabo (com 4 gomos arredondados)
    const fingersPath = new Path2D();
    fingersPath.moveTo(-48, -4);
    fingersPath.bezierCurveTo(-56, 20, -46, 44, -26, 46);
    fingersPath.bezierCurveTo(-10, 48, 14, 48, 30, 42);
    fingersPath.bezierCurveTo(48, 36, 54, 14, 46, -8);
    // Topo ondulado dos 4 dedos sobre o cabo
    fingersPath.bezierCurveTo(36, -22, 22, -20, 16, -10);
    fingersPath.bezierCurveTo(10, -22, -6, -22, -12, -10);
    fingersPath.bezierCurveTo(-18, -22, -36, -20, -48, -4);
    fingersPath.closePath();

    this.mat.paintSkinPath(ctx, fingersPath, { x: -56, y: -24, w: 112, h: 74 }, {
      baseColor: '#f7b880',
      highlightColor: '#ffe0ba',
      shadowColor: '#dc8042',
      deepShadowColor: '#b0521e',
      outlineWidth: 5.6,
      seed: isLeft ? 931 : 932
    });

    // Polegar robusto fechado por cima/dentro travando o cabo logo abaixo da aba de couro da luva
    const thumbPath = new Path2D();
    thumbPath.moveTo(10, -32);
    thumbPath.bezierCurveTo(-18, -32, -34, -14, -22, 4);
    thumbPath.bezierCurveTo(-8, 16, 26, 12, 40, -6);
    thumbPath.bezierCurveTo(46, -20, 32, -32, 10, -32);
    thumbPath.closePath();

    this.mat.paintSkinPath(ctx, thumbPath, { x: -34, y: -34, w: 80, h: 52 }, {
      baseColor: '#f9c18e',
      highlightColor: '#ffe5c4',
      shadowColor: '#e0864a',
      deepShadowColor: '#b55622',
      outlineWidth: 5.2,
      seed: isLeft ? 941 : 942
    });

    // Linhas divisórias artesanais entre os 4 dedos fechados sobre o cabo
    this.mat.strokeArtisanalInk(ctx, (c) => {
      c.moveTo(-24, -10);
      c.quadraticCurveTo(-26, 16, -22, 42);
      c.moveTo(-2, -10);
      c.quadraticCurveTo(-2, 18, 0, 44);
      c.moveTo(20, -8);
      c.quadraticCurveTo(22, 16, 22, 40);
    }, 4.4, '#210c06', '#472012');

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
   * com deltoide, bíceps e as duas braçadeiras de tiras de couro enroladas.
   */
  paint(ctx, armPose, side = 'L', scale = 1.0) {
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
    // Cabeça arredondada do deltoide que entra sob o cachecol/tronco
    upperArmPath.bezierCurveTo(-rShoulder * 1.05, -rShoulder * 0.85, -rShoulder * 1.05, rShoulder * 0.85, -14 * scale, rShoulder * 0.92);
    // Curva inferior (tríceps/axila)
    upperArmPath.bezierCurveTo(uLen * 0.35, rShoulder * 1.02, uLen * 0.72, rElbow * 1.02, uLen + 18 * scale, rElbow * 0.90);
    // Ponta arredondada no cotovelo
    upperArmPath.bezierCurveTo(uLen + 36 * scale, rElbow * 0.45, uLen + 36 * scale, -rElbow * 0.45, uLen + 18 * scale, -rElbow * 0.90);
    // Curva superior (deltoide e bíceps volumoso)
    upperArmPath.bezierCurveTo(uLen * 0.68, -rShoulder * 1.12, uLen * 0.32, -rShoulder * 1.15, -14 * scale, -rShoulder * 0.96);
    upperArmPath.closePath();

    // Preenche sem contorno fechado na raiz interna do ombro para fundir perfeitamente com o peitoral
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

    // Contorno artesanal apenas na borda externa do deltoide/bíceps/tríceps
    const upperArmOutline = new Path2D();
    upperArmOutline.moveTo(4 * scale, -rShoulder * 1.02);
    upperArmOutline.bezierCurveTo(uLen * 0.32, -rShoulder * 1.15, uLen * 0.68, -rShoulder * 1.12, uLen + 18 * scale, -rElbow * 0.90);
    upperArmOutline.bezierCurveTo(uLen + 36 * scale, -rElbow * 0.45, uLen + 36 * scale, rElbow * 0.45, uLen + 18 * scale, rElbow * 0.90);
    upperArmOutline.bezierCurveTo(uLen * 0.72, rElbow * 1.02, uLen * 0.35, rShoulder * 1.02, 12 * scale, rShoulder * 0.92);
    this.mat.strokeArtisanalInk(ctx, upperArmOutline, 5.6, '#210d07', '#421d10');

    // Vinco muscular do deltoide/bíceps
    ctx.strokeStyle = 'rgba(184, 82, 32, 0.58)';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(uLen * 0.16, -rShoulder * 0.38);
    ctx.quadraticCurveTo(uLen * 0.42, 0, uLen * 0.58, rElbow * 0.34);
    ctx.stroke();

    // 2. BRAÇADEIRA SUPERIOR (3 tiras grossas e abauladas de couro enroladas perto do cotovelo)
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

    // 3. ANTEBRAÇO + BRAÇADEIRA INFERIOR EM 4 VOLTAS DE COURO
    ctx.save();
    ctx.translate(elbow.x, elbow.y);
    ctx.rotate(fAng);

    const rForearm = 52 * scale;
    const rWrist = 46 * scale;

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

    // Braçadeira inferior de couro (de t=0.22 até passar ligeiramente do pulso)
    const b2Start = fLen * 0.22;
    const b2End = fLen * 1.06;
    const b2W = b2End - b2Start;
    const b2R = rForearm * 1.10;

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

    ctx.restore();
  }
}



  // --- MODULE: src/painters/LegPainter.js ---
// ============================================================================
// LegPainter.js & BootPainter.js — Coxas Musculosas e Botas Colossais de Couro
// Articulados por hip -> knee -> ankle -> footSole.
// ============================================================================
class LegPainter {
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
class BootPainter {
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

  paintStadiumChainRing(ctx, x, y, ang, rng) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);

    const makeStadium = (p, hw, hh, r) => {
      p.moveTo(-hw + r, -hh);
      p.lineTo(hw - r, -hh);
      p.quadraticCurveTo(hw, -hh, hw, -hh + r);
      p.lineTo(hw, hh - r);
      p.quadraticCurveTo(hw, hh, hw - r, hh);
      p.lineTo(-hw + r, hh);
      p.quadraticCurveTo(-hw, hh, -hw, hh - r);
      p.lineTo(-hw, -hh + r);
      p.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      p.closePath();
    };

    const ringPath = new Path2D();
    makeStadium(ringPath, 34, 22, 17);
    makeStadium(ringPath, 13, 5.5, 4.5);

    ctx.fillStyle = 'rgba(15, 4, 2, 0.88)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(-7, -7, 3, 0, 0, 38);
    grad.addColorStop(0.0, '#ffc27d');
    grad.addColorStop(0.38, '#cf5f28');
    grad.addColorStop(0.75, '#66200c');
    grad.addColorStop(1.0, '#1f0603');
    ctx.fillStyle = grad;
    ctx.fill(ringPath, 'evenodd');

    for (let k = 0; k < 14; k++) {
      const a = rng() * Math.PI * 2;
      const r = 10 + rng() * 14;
      const px = Math.cos(a) * r * 1.25;
      const py = Math.sin(a) * r * 0.75;
      ctx.fillStyle = rng() > 0.45 ? 'rgba(24, 5, 3, 0.72)' : 'rgba(255, 185, 112, 0.60)';
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

  paintStadiumSideLink(ctx, x, y, ang, rng) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);

    const rx = 28;
    const ry = 13.5;

    const linkPath = new Path2D();
    linkPath.moveTo(-rx, 0);
    linkPath.bezierCurveTo(-rx, -ry * 1.2, rx, -ry * 1.2, rx, 0);
    linkPath.bezierCurveTo(rx, ry * 1.2, -rx, ry * 1.2, -rx, 0);
    linkPath.closePath();

    ctx.fillStyle = 'rgba(14, 3, 2, 0.72)';
    ctx.beginPath();
    ctx.ellipse(2, 4, rx + 2, ry + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createLinearGradient(0, -ry, 0, ry);
    grad.addColorStop(0.0, '#260904');
    grad.addColorStop(0.28, '#eb7e3f');
    grad.addColorStop(0.52, '#ffc682');
    grad.addColorStop(0.80, '#873012');
    grad.addColorStop(1.0, '#1a0503');
    ctx.fillStyle = grad;
    ctx.fill(linkPath);

    for (let k = 0; k < 9; k++) {
      const px = (rng() - 0.5) * rx * 1.3;
      const py = (rng() - 0.5) * ry * 0.85;
      ctx.fillStyle = rng() > 0.5 ? 'rgba(22, 5, 3, 0.68)' : 'rgba(255, 204, 132, 0.60)';
      ctx.beginPath();
      ctx.arc(px, py, 2.0 + rng() * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    this.mat.strokeArtisanalInk(ctx, linkPath, 6.0, '#140402', '#300b06');

    ctx.restore();
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
    refImage: '../../../assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png',
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
    refImage: '../../../assets/references/ref-2d-hero/hero-parts/hero-part-head.png',
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
    refImage: '../../../assets/references/ref-2d-hero/hero-parts/hero-part-body.png',
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
    refImage: '../../../assets/references/ref-2d-hero/hero-parts/hero-part-body-tpose.png',
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
    refImage: '../../../assets/references/ref-2d-hero/hero-parts/hero-part-body-tpose-nocape.png',
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
    refImage: '../../../assets/references/ref-2d-hero/hero-parts/hero-part-weapons.png',
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
// RigAdapter.js — Adaptador Matemático entre o Esqueleto RIG-01 e o HeroRenderer
// Converte estados de pose (Idle, Corrida, Ataque) e orientações (Sul, SE, SW)
// em coordenadas articulares 2D/2.5D sem substituir o renderer e sem espelhar!
// ============================================================================
class RigAdapter {
  /**
   * Gera uma estrutura HeroPose completa controlada pelos ângulos/IK do RIG-01.
   *
   * @param {Object} state - { action: 'idle'|'run'|'attack', orientation: 'S'|'SE'|'SW', time: number }
   */
  static computePose(state = {}) {
    const {
      action = 'idle',
      orientation = 'S',
      time = 0
    } = state;

    // 1. Parâmetro de orientação 2.5D (yaw) SEM ESPELHAMENTO MECÂNICO
    // S = 0.0 (frontal), SE = -0.85 (virado 3/4 para a esquerda da tela, como em hero-idle-se.png),
    // SW = -0.45 ou +0.75 (orientação distinta com escorço assimétrico real)
    let yaw = 0;
    let refImage = '../../../assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png';
    if (orientation === 'SE') {
      yaw = -0.85;
      refImage = '../../../assets/references/ref-2d-hero/hero-complet-idle/hero-idle-se.png';
    } else if (orientation === 'SW') {
      yaw = 0.78;
      refImage = '../../../assets/references/ref-2d-hero/hero-complet-idle/hero-idle-sw.png';
    }

    const cx = 627 + yaw * 14;
    const groundY = 1226;

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

    // Braços e Pernas base (alinhamento diagonal contínuo ombro -> cotovelo -> pulso -> punho)
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

    let weaponLRot = -0.48;
    let weaponRRot = 0.48;
    let chainSwayL = 0.12;
    let chainSwayR = 0.12;

    if (action === 'idle') {
      // Respiração sutil determinística do RIG-01
      const breath = Math.sin(time * Math.PI * 2);
      chestY += breath * 4;
      neckY  += breath * 5;
      headY  += breath * 6;
      shoulderL.y += breath * 5;
      shoulderR.y += breath * 5;
      capeFlutter = Math.sin(time * Math.PI * 2 - 0.6) * 0.25;
    } else if (action === 'run') {
      // Pose Intermediária de Corrida (passada dinâmica do RIG-01 com IK de 2 ossos)
      // Em time = 0 (frame estático padrão da prova), usamos a fase de máxima amplitude da passada (phase = 0.22)
      const phase = time === 0 ? 0.22 : (time % 1.0);
      const stride = Math.sin(phase * Math.PI * 2); // ~ +0.98 na pose-chave
      const bounce = Math.abs(Math.cos(phase * Math.PI * 2));

      // Inclinação corporal de corrida e compressão vertical
      pelvisY = 822 - bounce * 18;
      chestX  = pelvisX + yaw * 22 + stride * 14;
      chestY  = pelvisY - 86;
      neckX   = chestX + yaw * 8 + stride * 8;
      neckY   = chestY - 64;
      headX   = neckX + yaw * 14;
      headY   = neckY - 26;
      headRot = stride * 0.06 - yaw * 0.05;
      capeFlutter = 0.85 + bounce * 0.35;
      legSpread = 0.45;

      // Perna esquerda avançando/elevada (joelho flexionado alto) e perna direita impulsionando atrás
      const liftL = Math.max(0, stride);
      const liftR = Math.max(0, -stride);

      hipL      = { x: pelvisX - 96, y: pelvisY + 52 };
      kneeL     = { x: pelvisX - 148 - liftL * 28, y: pelvisY + 155 - liftL * 48 };
      ankleL    = { x: pelvisX - 142 - liftL * 18, y: pelvisY + 265 - liftL * 58 };
      footSoleL = { x: pelvisX - 148 - liftL * 16, y: groundY - liftL * 62 };
      footPitchL = liftL * 0.28 - (1 - liftL) * 0.14;

      hipR      = { x: pelvisX + 102, y: pelvisY + 52 };
      kneeR     = { x: pelvisX + 145 + liftR * 28, y: pelvisY + 165 - liftR * 42 };
      ankleR    = { x: pelvisX + 182 + liftR * 18, y: pelvisY + 275 - liftR * 52 };
      footSoleR = { x: pelvisX + 196 + liftR * 16, y: groundY - liftR * 52 };
      footPitchR = -0.22 + liftR * 0.35;

      // Contra-balanço vigoroso dos braços e lâminas durante a corrida
      shoulderL = { x: chestX - 140, y: chestY - 44 };
      elbowL    = { x: shoulderL.x - 95, y: shoulderL.y + 48 - stride * 28 };
      wristL    = { x: elbowL.x - 52, y: elbowL.y + 62 - stride * 42 };
      handGripL = { x: wristL.x - 14, y: wristL.y + 38 - stride * 18 };
      weaponLRot = -0.58 - stride * 0.25;
      chainSwayL = 0.85;

      shoulderR = { x: chestX + 140, y: chestY - 44 };
      elbowR    = { x: shoulderR.x + 92, y: shoulderR.y + 68 + stride * 24 };
      wristR    = { x: elbowR.x + 68, y: elbowR.y + 72 + stride * 32 };
      handGripR = { x: wristR.x + 18, y: wristR.y + 42 + stride * 16 };
      weaponRRot = 0.62 + stride * 0.28;
      chainSwayR = -0.75;
    } else if (action === 'attack') {
      // Pose de Ataque do RIG-01 (Combo Slash A1/A2 — base baixa de combate, tronco torcido,
      // braço esquerdo abrindo em golpe amplo ascendente/lateral e braço direito armado em guarda agressiva)
      const slash = time === 0 ? 1.0 : (0.65 + 0.35 * Math.sin(time * Math.PI * 2));

      pelvisX = cx - 18;
      pelvisY = 858; // Base baixa e pesada de combate
      chestX  = pelvisX + 26;
      chestY  = pelvisY - 88;
      neckX   = chestX + 16;
      neckY   = chestY - 64;
      headX   = neckX + 12;
      headY   = neckY - 26;
      headRot = -0.09;
      capeFlutter = 1.25 * slash;
      legSpread = 0.85;

      // Base larga das pernas ancoradas no chão (foot-lock analítico)
      hipL      = { x: pelvisX - 112, y: pelvisY + 50 };
      kneeL     = { x: pelvisX - 168, y: 1042 };
      ankleL    = { x: pelvisX - 202, y: 1148 };
      footSoleL = { x: pelvisX - 218, y: groundY };
      footPitchL = 0.08;

      hipR      = { x: pelvisX + 118, y: pelvisY + 50 };
      kneeR     = { x: pelvisX + 178, y: 1042 };
      ankleR    = { x: pelvisX + 215, y: 1148 };
      footSoleR = { x: pelvisX + 232, y: groundY };
      footPitchR = -0.10;

      // Braço esquerdo desferindo corte amplo elevado
      shoulderL = { x: chestX - 148, y: chestY - 52 };
      elbowL    = { x: shoulderL.x - 135, y: shoulderL.y - 38 * slash };
      wristL    = { x: elbowL.x - 118, y: elbowL.y - 45 * slash };
      handGripL = { x: wristL.x - 54, y: wristL.y - 18 * slash };
      weaponLRot = 0.48 * slash;
      chainSwayL = 1.15;

      // Braço direito engatilhado para o segundo golpe cruzado
      shoulderR = { x: chestX + 142, y: chestY - 38 };
      elbowR    = { x: shoulderR.x + 118, y: shoulderR.y + 42 };
      wristR    = { x: elbowR.x + 95, y: elbowR.y + 28 };
      handGripR = { x: wristR.x + 52, y: wristR.y + 12 };
      weaponRRot = -0.38 * slash;
      chainSwayR = -0.95;
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
      legL: { hip: hipL, knee: kneeL, ankle: ankleL, footSole: footSoleL, footPitch: footPitchL },
      legR: { hip: hipR, knee: kneeR, ankle: ankleR, footSole: footSoleR, footPitch: footPitchR },
      weaponL: {
        x: handGripL.x,
        y: handGripL.y,
        scale: 0.62,
        rotation: weaponLRot,
        chainSway: chainSwayL
      },
      weaponR: {
        x: handGripR.x,
        y: handGripR.y,
        scale: 0.62,
        rotation: weaponRRot,
        chainSway: chainSwayR
      }
    };
  }
}


  // --- MODULE: src/HeroRenderer.js ---
// ============================================================================
// HeroRenderer.js — Orquestrador Principal do Desenho Procedural HERO-02
// Controla a ordem das camadas (Z-order), aplica poses estáticas ou do RIG-01
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
  }

  /**
   * Renderiza o HERO-02 completo (ou peça isolada) em um espaço canônico 1254 × 1254.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} pose - Objeto de pose (de PosePresets ou RigAdapter)
   * @param {Object} opts - { showPivots: boolean, drawShadow: boolean }
   */
  render(ctx, pose, opts = {}) {
    const {
      showPivots = false,
      drawGroundShadow = false
    } = opts;

    const s = pose.bodyScale || 1.0;
    const yaw = pose.yaw || 0;

    ctx.save();

    // 0. Sombra elíptica no chão opcional (para visualização isolada / gameplay)
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

      // 7. BRAÇOS E BRAÇADEIRAS EM CAMADAS (Ombro -> Cotovelo -> Pulso)
      if (pose.armL) this.armPainter.paint(ctx, pose.armL, 'L', s);
      if (pose.armR) this.armPainter.paint(ctx, pose.armR, 'R', s);

      // 7.5. DORSO DA MÃO, PROTETOR DE COURO E BASE DA PALMA (atrás do cabo da arma!)
      if (pose.armL) {
        this.handPainter.paintWristAndPalmBack(ctx, pose.armL.wrist, pose.armL.handGrip, 'L', s, !!pose.showWeapons);
      }
      if (pose.armR) {
        this.handPainter.paintWristAndPalmBack(ctx, pose.armR.wrist, pose.armR.handGrip, 'R', s, !!pose.showWeapons);
      }
    }

    // 8. ARMAS PROCEDURAIS (Lâminas do Caos + Cabos passando pela palma + Correntes)
    if (pose.showWeapons) {
      if (pose.weaponL) {
        this.weaponPainter.paintWeapon(ctx, { ...pose.weaponL, side: 'L' });
      }
      if (pose.weaponR) {
        this.weaponPainter.paintWeapon(ctx, { ...pose.weaponR, side: 'R' });
      }
    }

    // 9. DEDOS FECHADOS E POLEGAR (abraçando o cabo da arma por cima com firmeza!)
    if (pose.showBody && pose.showWeapons) {
      if (pose.armL) {
        this.handPainter.paintClenchedFingersOverHilt(ctx, pose.armL.wrist, pose.armL.handGrip, pose.weaponL, 'L', s);
      }
      if (pose.armR) {
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
      // Halo externo
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius + 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Círculo do pivô
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Mira central
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

    // Guia de simetria vertical e linha de chão
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
      // Coluna vertebral (pelvis -> chest -> neckBase -> head)
      drawBone(pose.pelvis, pose.chest, '#fbbf24');
      drawBone(pose.chest, pose.neckBase, '#fbbf24');
      if (pose.head) drawBone(pose.neckBase, pose.head, '#fbbf24');

      // Braço Esquerdo
      if (pose.armL) {
        drawBone(pose.chest, pose.armL.shoulder, '#fb7185');
        drawBone(pose.armL.shoulder, pose.armL.elbow, '#fb7185');
        drawBone(pose.armL.elbow, pose.armL.wrist, '#fb7185');
        drawBone(pose.armL.wrist, pose.armL.handGrip, '#fb7185');
      }

      // Braço Direito
      if (pose.armR) {
        drawBone(pose.chest, pose.armR.shoulder, '#60a5fa');
        drawBone(pose.armR.shoulder, pose.armR.elbow, '#60a5fa');
        drawBone(pose.armR.elbow, pose.armR.wrist, '#60a5fa');
        drawBone(pose.armR.wrist, pose.armR.handGrip, '#60a5fa');
      }

      // Perna Esquerda
      if (pose.legL) {
        drawBone(pose.pelvis, pose.legL.hip, '#f43f5e');
        drawBone(pose.legL.hip, pose.legL.knee, '#f43f5e');
        drawBone(pose.legL.knee, pose.legL.ankle, '#f43f5e');
        drawBone(pose.legL.ankle, pose.legL.footSole, '#f43f5e');
      }

      // Perna Direita
      if (pose.legR) {
        drawBone(pose.pelvis, pose.legR.hip, '#3b82f6');
        drawBone(pose.legR.hip, pose.legR.knee, '#3b82f6');
        drawBone(pose.legR.knee, pose.legR.ankle, '#3b82f6');
        drawBone(pose.legR.ankle, pose.legR.footSole, '#3b82f6');
      }

      // Pivôs principais
      drawPivot(pose.pelvis, 'pelvis / skullBuckle', '#facc15', 10);
      drawPivot(pose.chest, 'chest', '#facc15', 9);
      drawPivot(pose.neckBase, 'neckBase / scarf', '#facc15', 9);
      if (pose.showCape && pose.neckBase) {
        drawPivot({ x: pose.neckBase.x + 75 * (pose.bodyScale || 1), y: pose.neckBase.y + 10 }, 'capeAttach', '#f87171', 8);
      }

      if (pose.armL) {
        drawPivot(pose.armL.shoulder, 'shoulderL', '#fb7185', 8);
        drawPivot(pose.armL.elbow, 'elbowL', '#fb7185', 8);
        drawPivot(pose.armL.wrist, 'wristL', '#fb7185', 8);
        drawPivot(pose.armL.handGrip, 'handGripL / weaponL', '#a855f7', 9);
      }
      if (pose.armR) {
        drawPivot(pose.armR.shoulder, 'shoulderR', '#60a5fa', 8);
        drawPivot(pose.armR.elbow, 'elbowR', '#60a5fa', 8);
        drawPivot(pose.armR.wrist, 'wristR', '#60a5fa', 8);
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


  window.HeroRenderer = HeroRenderer;
  window.POSE_PRESETS = POSE_PRESETS;
  window.RigAdapter = RigAdapter;
})(window);
