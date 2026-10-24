// ============================================================================
// MaterialPainter.js — Sistema Procedural de Materiais, Texturas e Contornos
// Refinado na Fase F para reproduzir textura de giz pastel, argila e fibras.
// ============================================================================

export function createRNG(seed = 1337) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class MaterialPainter {
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
