/* ============================================================================
 * 00-core.js — Núcleo do renderer procedural do @deepseek
 * Paleta amostrada das referências oficiais, RNG determinístico, paths
 * amostráveis (para contorno à mão) e o kit de pincéis pintados.
 * Nenhuma imagem é usada pelo renderer: tudo é geometria + pintura em código.
 * ========================================================================== */
window.DS = window.DS || {};
(function (DS) {
  'use strict';

  /* ---------------------------------------------------------------- paleta */
  // Valores tirados por observação das folhas oficiais hero-part-* e hero-idle-*.
  DS.P = {
    // tinta / contorno
    ink: '#1d1113', ink2: '#3a1f1c', inkSoft: '#5d3227', inkWarm: '#8a4a34',
    // pele
    skin: '#f2ab72', skinLit: '#ffd6a2', skinMid: '#e8935b', skinShade: '#c9714a',
    skinDeep: '#a3553a', skinBlood: '#c0453a',
    // cabelo
    hair: '#3b2620', hairMid: '#5d3a2b', hairLit: '#8a543a', hairHi: '#c07f52', hairDeep: '#20161a',
    // vermelho (lenço, capa, tecido)
    red: '#b3151b', redLit: '#e33025', redMid: '#8d0f16', redDeep: '#54060f', redHot: '#ff5a33',
    // couro
    lea: '#4b3229', leaMid: '#6d4632', leaLit: '#9c6a48', leaDeep: '#241719', leaDark: '#33221f',
    // metal / lâmina
    steel: '#43383c', steelLit: '#cdb3ab', steelHot: '#e0703a', steelDeep: '#1b151a', steelMid: '#6d5b58',
    // fogo / sangue
    fire: '#ff8a1e', fireHot: '#ffd75c', fireRed: '#d21f16', blood: '#8d0f10', bloodLit: '#c8231c',
    // osso
    bone: '#e7d6b7', boneMid: '#c2a883', boneDeep: '#8a6f57', boneDark: '#3a2b25',
    // arena
    grass: '#7d9c46', grassLit: '#a8c162', grassDeep: '#4d6b30',
    sand: '#dcb977', sandLit: '#efd79c', sandDeep: '#b78748',
    water: '#1f6f96', waterLit: '#57b6cc', waterDeep: '#0f4a72', foam: '#e8f4f2',
    rock: '#8f8b83', rockLit: '#c0bab0', rockDeep: '#565049',
    wood: '#a5703f', woodLit: '#c9975c', woodDeep: '#5f3d22',
  };

  /* ------------------------------------------------------------------- RNG */
  DS.rng = function (seed) {
    let s = (seed >>> 0) || 0x9e3779b9;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  };
  DS.rrange = function (rnd, a, b) { return a + (b - a) * rnd(); };
  DS.pick = function (rnd, arr) { return arr[Math.floor(rnd() * arr.length) % arr.length]; };

  /* --------------------------------------------------------- matemática útil */
  DS.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  DS.lerp = (a, b, t) => a + (b - a) * t;
  DS.smooth = (t) => t * t * (3 - 2 * t);
  DS.easeIn = (t) => t * t;
  DS.easeOut = (t) => 1 - (1 - t) * (1 - t);
  DS.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  DS.easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
  DS.wrap = (v, n) => ((v % n) + n) % n;
  DS.angleLerp = function (a, b, t) {
    let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return a + d * t;
  };
  // ruído 1D suave determinístico (para contorno trêmulo e ondulações)
  DS.noise1 = function (x, seed) {
    const i = Math.floor(x), f = x - i;
    const h = (n) => {
      let v = Math.sin((n * 127.1 + (seed || 1) * 311.7) * 0.01745) * 43758.5453;
      return v - Math.floor(v);
    };
    const a = h(i), b = h(i + 1), t = DS.smooth(f);
    return a + (b - a) * t;
  };
  DS.noise2 = function (x, y, seed) {
    let v = Math.sin((x * 127.1 + y * 311.7 + (seed || 1) * 74.7) * 0.013) * 43758.5453;
    return v - Math.floor(v);
  };

  /* ------------------------------------------------- paths amostráveis (RPath)
   * Path2D não permite leitura de pontos, então gravamos os comandos para
   * poder reamostrar o contorno e desenhar tinta com espessura irregular. */
  function RPath() {
    const cmds = [];
    const api = {
      cmds,
      M(x, y) { cmds.push(['M', x, y]); return api; },
      L(x, y) { cmds.push(['L', x, y]); return api; },
      Q(cx, cy, x, y) { cmds.push(['Q', cx, cy, x, y]); return api; },
      C(c1x, c1y, c2x, c2y, x, y) { cmds.push(['C', c1x, c1y, c2x, c2y, x, y]); return api; },
      // arco aproximado por cúbicas (suficiente para pintura)
      A(cx, cy, rx, ry, a0, a1, ccw) {
        const span = a1 - a0;
        const steps = Math.max(2, Math.ceil(Math.abs(span) / (Math.PI / 2)));
        let a = a0;
        for (let i = 0; i < steps; i++) {
          const b = a + span / steps;
          const k = (4 / 3) * Math.tan((b - a) / 4);
          const x0 = cx + Math.cos(a) * rx, y0 = cy + Math.sin(a) * ry;
          const x1 = cx + Math.cos(b) * rx, y1 = cy + Math.sin(b) * ry;
          const c1x = x0 - Math.sin(a) * rx * k, c1y = y0 + Math.cos(a) * ry * k;
          const c2x = x1 + Math.sin(b) * rx * k, c2y = y1 - Math.cos(b) * ry * k;
          cmds.push(['C', c1x, c1y, c2x, c2y, x1, y1]);
          a = b;
        }
        return api;
      },
      // polígono fechado a partir de lista [x,y,...]
      poly(pts) {
        api.M(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) api.L(pts[i], pts[i + 1]);
        return api;
      },
      Z() { cmds.push(['Z']); return api; },
      el(cx, cy, rx, ry, rot) {
        if (rot) { /* rotação local por transformação na hora de pintar */ }
        return api.A(cx, cy, rx, ry, 0, Math.PI * 2);
      },
      build() {
        const p = new Path2D();
        for (const c of cmds) {
          switch (c[0]) {
            case 'M': p.moveTo(c[1], c[2]); break;
            case 'L': p.lineTo(c[1], c[2]); break;
            case 'Q': p.quadraticCurveTo(c[1], c[2], c[3], c[4]); break;
            case 'C': p.bezierCurveTo(c[1], c[2], c[3], c[4], c[5], c[6]); break;
            case 'Z': p.closePath(); break;
          }
        }
        return p;
      },
      // Achata em polilinhas (para contorno à mão / amostragem).
      flatten(step) {
        step = step || 5;
        const out = [];
        let cur = [], px = 0, py = 0, sx = 0, sy = 0;
        const push = (x, y) => { cur.push([x, y]); };
        for (const c of cmds) {
          if (c[0] === 'M') {
            if (cur.length > 1) out.push(cur);
            cur = []; px = c[1]; py = c[2]; sx = px; sy = py; push(px, py);
          } else if (c[0] === 'L') { px = c[1]; py = c[2]; push(px, py); }
          else if (c[0] === 'Q' || c[0] === 'C') {
            const isC = c[0] === 'C';
            const x0 = px, y0 = py;
            const c1x = c[1], c1y = c[2];
            const c2x = isC ? c[3] : c[1], c2y = isC ? c[4] : c[2];
            const x1 = isC ? c[5] : c[3], y1 = isC ? c[6] : c[4];
            const len = Math.hypot(x1 - x0, y1 - y0) + Math.hypot(c1x - x0, c1y - y0) + Math.hypot(c2x - x0, c2y - y0);
            const n = DS.clamp(Math.ceil(len / step), 4, 48);
            for (let i = 1; i <= n; i++) {
              const t = i / n, u = 1 - t;
              let x, y;
              if (isC) {
                x = u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x1;
                y = u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y1;
              } else {
                x = u * u * x0 + 2 * u * t * c1x + t * t * x1;
                y = u * u * y0 + 2 * u * t * c1y + t * t * y1;
              }
              push(x, y);
            }
            px = x1; py = y1;
          } else if (c[0] === 'Z') {
            if (cur.length > 1) { push(sx, sy); out.push(cur); cur = []; px = sx; py = sy; }
          }
        }
        if (cur.length > 1) out.push(cur);
        return out;
      },
      bbox() {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const poly of api.flatten(8)) for (const [x, y] of poly) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        return [x0, y0, x1 - x0, y1 - y0];
      },
      clone() { const r = RPath(); r.cmds.push(...cmds.map(c => c.slice())); return r; },
      transformed(fn) { const r = RPath(); r.cmds.push(...cmds.map(c => c.slice())); r.cmds.forEach(c => {
        for (let i = 1; i < c.length; i += 2) { const p = fn(c[i], c[i + 1]); c[i] = p[0]; c[i + 1] = p[1]; }
      }); return r; },
    };
    return api;
  }
  DS.path = RPath;

  /* ------------------------------------------------------------- pincel: tinta
   * Contorno irregular: reamostra o path, desloca cada ponto pela normal com
   * ruído suave e desenha segmento a segmento modulando a espessura. */
  DS.ink = function (ctx, path, opt) {
    opt = opt || {};
    const color = opt.color || DS.P.ink;
    const w = opt.w == null ? 3 : opt.w;
    const seed = opt.seed || 7;
    const jit = opt.jitter == null ? 1.1 : opt.jitter;
    const alpha = opt.alpha == null ? 1 : opt.alpha;
    const dash = opt.dash || null;
    const step = opt.step || 4;
    const polys = path.flatten ? path.flatten(step) : [path];
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    let k = 0;
    for (const poly of polys) {
      const pts = poly.slice();
      if (opt.close !== false && pts.length > 2) pts.push(pts[0]);
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        if (opt.skip && opt.skip(x0, y0, x1, y1)) { k++; continue; }
        const dx = x1 - x0, dy = y1 - y0;
        const L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L, ny = dx / L;
        const n0 = (DS.noise1(k * 0.35, seed) - 0.5) * 2 * jit;
        const n1 = (DS.noise1((k + 1) * 0.35, seed) - 0.5) * 2 * jit;
        const lw = w * (1 + (DS.noise1(k * 0.21 + 13, seed + 3) - 0.5) * 0.55);
        ctx.beginPath();
        ctx.moveTo(x0 + nx * n0, y0 + ny * n0);
        ctx.quadraticCurveTo(
          (x0 + x1) / 2 + nx * (n0 + n1) * 0.6, (y0 + y1) / 2 + ny * (n0 + n1) * 0.6,
          x1 + nx * n1, y1 + ny * n1);
        ctx.lineWidth = Math.max(0.35, lw);
        ctx.stroke();
        k++;
      }
    }
    ctx.restore();
  };

  /* ---------------------------------------------------------- pincel: material
   * Pintura em camadas: base, massas de sombra (desfocadas), massas internas,
   * hachura direcional, sujeira e, por fim, contorno irregular + luz de borda. */
  const KIND = {
    skin:    { hatch: 46, len: [4, 20], w: [0.5, 1.7], dir: -0.35, cols: ['#ffdcae', '#c9714a', '#ffc68d', '#a3553a'], alpha: [0.05, 0.26] },
    hair:    { hatch: 120, len: [8, 44], w: [0.6, 2.6], dir: -0.55, cols: ['#c07f52', '#20161a', '#8a543a', '#3b2620', '#e0a06a'], alpha: [0.06, 0.34] },
    cloth:   { hatch: 70, len: [4, 24], w: [0.6, 2.3], dir: 0.2, cols: ['#e33025', '#54060f', '#ff6a45', '#8d0f16'], alpha: [0.05, 0.3] },
    leather: { hatch: 78, len: [4, 22], w: [0.6, 2.4], dir: -0.3, cols: ['#9c6a48', '#241719', '#6d4632', '#c08a5c'], alpha: [0.05, 0.3] },
    steel:   { hatch: 90, len: [5, 26], w: [0.5, 2.2], dir: -0.9, cols: ['#cdb3ab', '#1b151a', '#6d5b58', '#e0703a'], alpha: [0.05, 0.32] },
    bone:    { hatch: 40, len: [3, 14], w: [0.5, 1.6], dir: 0.15, cols: ['#f6ecd6', '#8a6f57', '#c2a883'], alpha: [0.05, 0.22] },
    rope:    { hatch: 40, len: [3, 12], w: [0.5, 1.6], dir: 0.9, cols: ['#c9975c', '#5f3d22', '#8a6a3c'], alpha: [0.06, 0.3] },
    fur:     { hatch: 70, len: [4, 18], w: [0.5, 1.9], dir: 0.05, cols: ['#9c6a48', '#241719', '#c08a5c'], alpha: [0.06, 0.3] },
    grass:   { hatch: 90, len: [6, 30], w: [0.6, 2.4], dir: 0.35, cols: ['#a8c162', '#4d6b30', '#c8dc80'], alpha: [0.06, 0.3] },
    wood:    { hatch: 60, len: [5, 24], w: [0.6, 2.6], dir: 1.5, cols: ['#c9975c', '#2b1d0e', '#8a6a3c'], alpha: [0.06, 0.3] },
    stone:   { hatch: 34, len: [3, 16], w: [0.5, 1.8], dir: -0.6, cols: ['#cbc9bd', '#3a3936', '#6f6d66'], alpha: [0.06, 0.26] },
    leaf:    { hatch: 70, len: [6, 28], w: [0.6, 2.2], dir: 0.5, cols: ['#79c05a', '#14310f', '#3d8434'], alpha: [0.06, 0.3] },
    fire:    { hatch: 40, len: [4, 16], w: [0.6, 2.2], dir: -1.2, cols: ['#ffd75c', '#d21f16', '#ff8a1e'], alpha: [0.08, 0.3] },
    sand:    { hatch: 60, len: [3, 14], w: [0.5, 1.8], dir: 0.1, cols: ['#f4e6bf', '#a88f62', '#d8c088'], alpha: [0.05, 0.24] },
  };
  DS.KIND = KIND;

  DS.wash = function (ctx, path, opt) {
    opt = opt || {};
    const kindDef = KIND[opt.kind || 'skin'];
    const rnd = DS.rng(opt.seed || 1);
    const bb = opt.box || path.bbox();
    const [bx, by, bw, bh] = bb;
    const clip = path.build();
    const texture = opt.texture == null ? 1 : opt.texture;

    ctx.save();
    ctx.fillStyle = opt.base || DS.P.skin;
    ctx.fill(clip);

    ctx.save();
    ctx.clip(clip);
    // 1) massas de sombra grandes (desfocadas) para dar volume
    if (opt.shade !== false && opt.shadow) {
      ctx.save();
      if (!opt.noBlur) ctx.filter = 'blur(' + (opt.blur || 10) + 'px)';
      ctx.globalAlpha = opt.shadeAlpha == null ? 0.5 : opt.shadeAlpha;
      ctx.fillStyle = opt.shadow;
      ctx.translate(opt.shadeDx == null ? 0 : opt.shadeDx, opt.shadeDy == null ? -1 : opt.shadeDy);
      ctx.fill(clip);
      ctx.restore();
      // segunda massa mais escura, deslocada (núcleo da sombra)
      if (opt.deep) {
        ctx.save();
        if (!opt.noBlur) ctx.filter = 'blur(' + ((opt.blur || 10) * 0.8) + 'px)';
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = opt.deep;
        ctx.translate(opt.deepDx || 0, opt.deepDy || 0);
        ctx.beginPath();
        ctx.ellipse(bx + bw * (opt.deepCx || 0.5), by + bh * (opt.deepCy || 0.72),
          bw * (opt.deepRx || 0.42), bh * (opt.deepRy || 0.3), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    // 2) massas internas autorais (formas de sombra/luz desenhadas à mão)
    if (opt.masses) for (const m of opt.masses) {
      ctx.save();
      ctx.globalAlpha = m[2] == null ? 1 : m[2];
      ctx.fillStyle = m[1];
      if (m[3] && !opt.noBlur) ctx.filter = 'blur(' + m[3] + 'px)';
      ctx.fill((m[0].build ? m[0].build() : m[0]));
      ctx.restore();
    }
    // 3) hachura direcional (o "grão pictórico" que constrói forma)
    const hd = opt.hatch === false ? null : (opt.hatch || kindDef);
    if (hd) {
      const n = Math.round((hd.hatch || 60) * texture * (opt.hatchScale || 1));
      for (let i = 0; i < n; i++) {
        const px = bx + rnd() * bw, py = by + rnd() * bh;
        const L = DS.rrange(rnd, hd.len[0], hd.len[1]) * (opt.hatchLen || 1);
        const a = hd.dir + (rnd() - 0.5) * (opt.hatchSpread || 1.4);
        ctx.strokeStyle = DS.pick(rnd, hd.cols);
        ctx.globalAlpha = DS.rrange(rnd, hd.alpha[0], hd.alpha[1]) * (opt.hatchAlpha || 1);
        ctx.lineWidth = DS.rrange(rnd, hd.w[0], hd.w[1]);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(
          px + Math.cos(a) * L * 0.45 + (rnd() - 0.5) * 3,
          py + Math.sin(a) * L * 0.45 + (rnd() - 0.5) * 3,
          px + Math.cos(a) * L, py + Math.sin(a) * L);
        ctx.stroke();
      }
      // riscos longos ocasionais, tipo pincel seco
      for (let i = 0; i < Math.round(7 * texture); i++) {
        const px = bx + rnd() * bw, py = by + rnd() * bh;
        const L = DS.rrange(rnd, hd.len[1], hd.len[1] * 3.2);
        const a = hd.dir + (rnd() - 0.5) * 0.6;
        ctx.strokeStyle = rnd() > 0.5 ? hd.cols[0] : hd.cols[1];
        ctx.globalAlpha = DS.rrange(rnd, 0.05, 0.16);
        ctx.lineWidth = DS.rrange(rnd, hd.w[1], hd.w[1] * 2.6);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + Math.cos(a) * L * 0.5, py + Math.sin(a) * L * 0.5 + 3,
          px + Math.cos(a) * L, py + Math.sin(a) * L);
        ctx.stroke();
      }
    }
    // 4) manchas de sujeira/sangue opcionais
    if (opt.dirt) for (let i = 0; i < opt.dirt; i++) {
      const px = bx + rnd() * bw, py = by + rnd() * bh;
      const r = 4 + rnd() * (Math.min(bw, bh) * 0.22);
      ctx.globalAlpha = DS.rrange(rnd, 0.04, 0.16);
      ctx.fillStyle = opt.dirtColor || '#241719';
      ctx.beginPath();
      ctx.ellipse(px, py, r, r * (0.35 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore(); // fim do clip

    // 5) contorno irregular + luz de borda
    if (opt.ink !== false) {
      DS.ink(ctx, path, { color: opt.inkColor || DS.P.ink, w: opt.inkW == null ? 3.4 : opt.inkW, seed: (opt.seed || 1) * 3 + 5, jitter: opt.inkJitter == null ? 1.2 : opt.inkJitter, alpha: opt.inkAlpha == null ? 1 : opt.inkAlpha });
    }
    if (opt.light) {
      ctx.save();
      ctx.globalAlpha = opt.lightAlpha == null ? 0.5 : opt.lightAlpha;
      ctx.strokeStyle = opt.light;
      ctx.lineWidth = opt.lightW == null ? 2.4 : opt.lightW;
      ctx.lineCap = 'round';
      const polys = path.flatten(6);
      for (const poly of polys) {
        if (poly.length < 3) continue;
        const a0 = opt.lightFrom == null ? 0.06 : opt.lightFrom;
        const a1 = opt.lightTo == null ? 0.5 : opt.lightTo;
        const i0 = Math.floor(poly.length * a0), i1 = Math.floor(poly.length * a1);
        ctx.beginPath();
        ctx.moveTo(poly[i0][0], poly[i0][1]);
        for (let i = i0 + 1; i <= i1; i++) ctx.lineTo(poly[i][0], poly[i][1]);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  };

  /* --------------------------------------------------------- pincel: fibras
   * Mechas / pelos: preenche a forma com traços longos seguindo uma direção. */
  DS.fibers = function (ctx, path, opt) {
    opt = opt || {};
    const rnd = DS.rng(opt.seed || 3);
    const bb = opt.box || path.bbox();
    const [bx, by, bw, bh] = bb;
    const clip = path.build();
    ctx.save();
    ctx.clip(clip);
    const dir = opt.dir == null ? -0.6 : opt.dir;
    const n = opt.count || 90;
    for (let i = 0; i < n; i++) {
      const px = bx + rnd() * bw, py = by + rnd() * bh;
      const L = DS.rrange(rnd, opt.len[0], opt.len[1]);
      const a = dir + (rnd() - 0.5) * (opt.spread || 0.9) + (opt.flow ? Math.sin((px - bx) / bw * 2.4) * opt.flow : 0);
      ctx.strokeStyle = DS.pick(rnd, opt.cols);
      ctx.globalAlpha = DS.rrange(rnd, opt.alpha[0], opt.alpha[1]);
      ctx.lineWidth = DS.rrange(rnd, opt.w[0], opt.w[1]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + Math.cos(a) * L * 0.5 + (rnd() - 0.5) * 4,
        py + Math.sin(a) * L * 0.5 + (rnd() - 0.5) * 4,
        px + Math.cos(a) * L, py + Math.sin(a) * L);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------- tinta: riscos */
  DS.strokes = function (ctx, list, color, w, alpha) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
    if (alpha != null) ctx.globalAlpha = alpha;
    for (const d of list) {
      const p = typeof d === 'string' ? DS.pathFromCmds(d) : d;
      if (typeof d === 'string') { ctx.stroke(new Path2D(d)); } else { ctx.stroke(d.build()); }
    }
    ctx.restore();
  };

  // mini parser de path SVG -> RPath (para listas longas e legíveis)
  DS.pathFromCmds = function (str) {
    const p = DS.path();
    const toks = str.match(/[MLQCZ]|-?\d*\.?\d+/g) || [];
    let i = 0;
    while (i < toks.length) {
      const t = toks[i++];
      if (t === 'M') p.M(+toks[i++], +toks[i++]);
      else if (t === 'L') p.L(+toks[i++], +toks[i++]);
      else if (t === 'Q') p.Q(+toks[i++], +toks[i++], +toks[i++], +toks[i++]);
      else if (t === 'C') p.C(+toks[i++], +toks[i++], +toks[i++], +toks[i++], +toks[i++], +toks[i++]);
      else if (t === 'Z') p.Z();
    }
    return p;
  };
  DS.pc = DS.pathFromCmds; // apelido curto

  /* --------------------------------------------------------------- offscreen */
  DS.canvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    return c;
  };
  /* Cache de peças pintadas. drawFn(ctx) desenha a peça com origem no pivô.
   * SS = supersample (nitidez sob rotação). */
  DS.Part = function (opts) {
    this.key = opts.key;
    this.w = opts.w; this.h = opts.h;
    this.px = opts.px; this.py = opts.py;  // pivô dentro do canvas lógico
    this.ss = opts.ss || 2;
    this.canvas = null;
    this.draw = opts.draw;
  };
  DS.Part.prototype.ensure = function () {
    if (this.canvas) return this.canvas;
    const s = this.ss;
    const c = DS.canvas(this.w * s, this.h * s);
    const ctx = c.getContext('2d');
    ctx.save();
    ctx.scale(s, s);
    ctx.translate(this.px, this.py); // pivô lógico -> posição no canvas
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    this.draw(ctx);
    ctx.restore();
    this.canvas = c;
    return c;
  };
  DS.Part.prototype.blit = function (ctx, alpha) {
    const c = this.ensure();
    const s = this.ss;
    if (alpha != null) { ctx.save(); ctx.globalAlpha = alpha; }
    ctx.drawImage(c, -this.px, -this.py, this.w, this.h);
    if (alpha != null) ctx.restore();
  };
  DS.registry = {};
  DS.part = function (key, opts) {
    if (!DS.registry[key]) DS.registry[key] = new DS.Part(Object.assign({ key }, opts));
    return DS.registry[key];
  };

  /* ---------------------------------------------------- sombra / brilho / vfx */
  DS.shadowEllipse = function (ctx, x, y, rx, ry, alpha, col) {
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, 'rgba(' + (col || '20,12,8') + ',' + (alpha == null ? 0.5 : alpha) + ')');
    g.addColorStop(0.62, 'rgba(' + (col || '20,12,8') + ',' + (alpha == null ? 0.5 : alpha) * 0.55 + ')');
    g.addColorStop(1, 'rgba(' + (col || '20,12,8') + ',0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
    ctx.beginPath(); ctx.arc(x, y, rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  DS.glow = function (ctx, x, y, r, colInner, colOuter, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, colInner);
    g.addColorStop(0.45, colOuter);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  DS.star = function (ctx, x, y, r, n, inner, rot) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = rot + (i * Math.PI) / n;
      const rr = i % 2 ? r * inner : r;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };
})(window.DS);
