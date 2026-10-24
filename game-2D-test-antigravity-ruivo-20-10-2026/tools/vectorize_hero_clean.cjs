/**
 * vectorize_hero_clean.cjs
 * Vetorizador de Alta Fidelidade (Método RafaxLab / Cel-Shading Suave)
 * 
 * - Remove sombra de papel do chão (isPaperShadow)
 * - Classifica cores em 14 camadas cel-shading com pesos de percepção humana (RGB)
 * - Filtro de Maioria (Majority/Mode filter) 3x3 para eliminar ruído, pontilhado e dithering
 * - Suavização subpixel via Marching Squares com interpolação linear (iso = 0.5)
 * - Simplificação RDP (Ramer-Douglas-Peucker) para curvas suaves de HQ
 * - Camadas ordenadas com base sólida para 0 frestas transparentes
 */
const fs = require('fs');
const zlib = require('zlib');

function getRGBA(pngPath) {
  const buf = fs.readFileSync(pngPath);
  let pos = 8, width = 0, height = 0, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idat.push(buf.subarray(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decomp = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4, stride = width * bpp;
  const pixels = new Uint8Array(width * height * 4);
  let rawIdx = 0;
  const curRow = Buffer.alloc(stride);
  const prevRow = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = decomp[rawIdx++];
    for (let x = 0; x < stride; x++) {
      const byte = decomp[rawIdx++];
      let val = byte;
      if (filter === 1) val = (byte + (x >= bpp ? curRow[x - bpp] : 0)) & 0xff;
      else if (filter === 2) val = (byte + prevRow[x]) & 0xff;
      else if (filter === 3) val = (byte + Math.floor(((x >= bpp ? curRow[x - bpp] : 0) + prevRow[x]) / 2)) & 0xff;
      else if (filter === 4) {
        const a = x >= bpp ? curRow[x - bpp] : 0, b_ = prevRow[x], c = x >= bpp ? prevRow[x - bpp] : 0;
        const p = a + b_ - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b_), pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b_ : c);
        val = (byte + pr) & 0xff;
      }
      curRow[x] = val;
    }
    pixels.set(curRow, y * stride);
    curRow.copy(prevRow);
  }
  return { width, height, pixels };
}

const BG = [216, 209, 196];

function isPaperShadow(r, g, b, y, isTop) {
  const minY = isTop ? 140 : 155;
  if (y < minY) return false;
  const scale = (r / BG[0] + g / BG[1] + b / BG[2]) / 3;
  if (scale > 0.68 && scale < 0.98) {
    const dr = Math.abs(r - BG[0] * scale);
    const dg = Math.abs(g - BG[1] * scale);
    const db = Math.abs(b - BG[2] * scale);
    if (dr < 12 && dg < 12 && db < 12) return true;
  }
  return false;
}

// Paleta Oficial Refinada do Novo Herói
const PALETTE = [
  { id: 1,  name: 'ink',          rgb: [30, 16, 12],    hex: '#1E100C', protect: true },  // Linhas de tinta, contorno, olhos
  { id: 2,  name: 'boots_dark',   rgb: [64, 32, 24],    hex: '#402018', protect: false }, // Botas e cintos escuros
  { id: 3,  name: 'pants_mid',    rgb: [100, 48, 38],   hex: '#643026', protect: false }, // Calças / couro marrom-escuro
  { id: 4,  name: 'skin_shadow',  rgb: [220, 130, 90],  hex: '#DC825A', protect: false }, // Sombra da pele
  { id: 5,  name: 'skin_base',    rgb: [248, 180, 136], hex: '#F8B488', protect: false }, // Base da pele (rosto, mãos)
  { id: 6,  name: 'tunic_shadow', rgb: [168, 20, 32],   hex: '#A81420', protect: false }, // Sombra da túnica escarlate
  { id: 7,  name: 'tunic_red',    rgb: [224, 32, 48],   hex: '#E02030', protect: false }, // Túnica vermelha vibrante
  { id: 8,  name: 'hair_dark',    rgb: [156, 16, 28],   hex: '#9C101C', protect: false }, // Raiz e mechas escuras do cabelo
  { id: 9,  name: 'hair_mid',     rgb: [216, 32, 48],   hex: '#D82030', protect: false }, // Tom principal do cabelo escarlate
  { id: 10, name: 'hair_hi',      rgb: [248, 64, 72],   hex: '#F84048', protect: false }, // Mechas iluminadas do cabelo
  { id: 11, name: 'armor_shadow', rgb: [136, 128, 128], hex: '#888080', protect: false }, // Sombra da armadura e lâmina
  { id: 12, name: 'armor_mid',    rgb: [184, 172, 166], hex: '#B8ACA6', protect: false }, // Tom médio da armadura prateada
  { id: 13, name: 'armor_hi',     rgb: [232, 224, 218], hex: '#E8E0DA', protect: false }, // Brilhos da armadura prateada
  { id: 14, name: 'bow_orange',   rgb: [240, 128, 32],  hex: '#F08020', protect: false }, // Laço de ombro laranja
  { id: 15, name: 'gold_guard',   rgb: [196, 156, 60],  hex: '#C49C3C', protect: false }, // Guarda e pomo da espada
  { id: 16, name: 'glint',        rgb: [255, 255, 255], hex: '#FFFFFF', protect: true }   // Brilhos brancos dos olhos e espada
];

// Ordem de renderização empilhada (de baixo para cima)
const RENDER_ORDER = [
  'ink_base',      // Silhueta inteira sólida para evitar qualquer transparência
  'boots_dark',
  'pants_mid',
  'skin_shadow',
  'skin_base',
  'tunic_shadow',
  'tunic_red',
  'armor_shadow',
  'armor_mid',
  'armor_hi',
  'hair_dark',
  'hair_mid',
  'hair_hi',
  'bow_orange',
  'gold_guard',
  'ink',
  'glint'
];

// Peso perceptual ponderado RGB
function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.hypot(dr * 0.9, dg * 1.2, db * 0.8);
}

// Marching Squares com Interpolação Subpixel Suave
function smoothMarchingSquares(field, w, h, iso = 0.5) {
  const pw = w + 2, ph = h + 2;
  const pad = new Float32Array(pw * ph);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      pad[(y + 1) * pw + (x + 1)] = field[y * w + x];
    }
  }

  function interp(v1, v2) {
    if (Math.abs(v2 - v1) < 1e-6) return 0.5;
    return Math.max(0, Math.min(1, (iso - v1) / (v2 - v1)));
  }

  const adj = new Map();
  function addEdge(p1, p2) {
    const k1 = p1[0].toFixed(2) + ',' + p1[1].toFixed(2);
    const k2 = p2[0].toFixed(2) + ',' + p2[1].toFixed(2);
    if (!adj.has(k1)) adj.set(k1, []);
    if (!adj.has(k2)) adj.set(k2, []);
    adj.get(k1).push(k2);
    adj.get(k2).push(k1);
  }

  for (let y = 0; y < ph - 1; y++) {
    for (let x = 0; x < pw - 1; x++) {
      const tl = pad[y * pw + x];
      const tr = pad[y * pw + x + 1];
      const br = pad[(y + 1) * pw + x + 1];
      const bl = pad[(y + 1) * pw + x];

      const b_tl = tl > iso ? 1 : 0;
      const b_tr = tr > iso ? 1 : 0;
      const b_br = br > iso ? 1 : 0;
      const b_bl = bl > iso ? 1 : 0;

      const caseIdx = (b_tl << 3) | (b_tr << 2) | (b_br << 1) | b_bl;
      if (caseIdx === 0 || caseIdx === 15) continue;

      const top = [x + interp(tl, tr) - 1, y - 1];
      const right = [x + 1 - 1, y + interp(tr, br) - 1];
      const bottom = [x + interp(bl, br) - 1, y + 1 - 1];
      const left = [x - 1, y + interp(tl, bl) - 1];

      switch (caseIdx) {
        case 1: addEdge(left, bottom); break;
        case 2: addEdge(bottom, right); break;
        case 3: addEdge(left, right); break;
        case 4: addEdge(top, right); break;
        case 5: addEdge(left, top); addEdge(bottom, right); break;
        case 6: addEdge(top, bottom); break;
        case 7: addEdge(left, top); break;
        case 8: addEdge(top, left); break;
        case 9: addEdge(top, bottom); break;
        case 10: addEdge(top, right); addEdge(left, bottom); break;
        case 11: addEdge(top, right); break;
        case 12: addEdge(left, right); break;
        case 13: addEdge(bottom, right); break;
        case 14: addEdge(left, bottom); break;
      }
    }
  }

  const visited = new Set();
  const loops = [];
  for (const [startKey] of adj) {
    if (visited.has(startKey)) continue;
    const loop = [];
    let cur = startKey;
    let prev = null;

    while (cur && !visited.has(cur)) {
      visited.add(cur);
      const [cx, cy] = cur.split(',').map(Number);
      loop.push([cx, cy]);
      const nextList = adj.get(cur) || [];
      const next = nextList.find(n => n !== prev && (!visited.has(n) || (n === startKey && loop.length > 2)));
      prev = cur;
      cur = next;
      if (cur === startKey) break;
    }
    if (loop.length >= 4) loops.push(loop);
  }
  return loops;
}

// Ramer-Douglas-Peucker (RDP)
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let maxDist = 0, idx = 0;
  const [x1, y1] = pts[0];
  const [x2, y2] = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const num = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
    const den = Math.hypot(y2 - y1, x2 - x1);
    const dist = den === 0 ? Math.hypot(x0 - x1, y0 - y1) : num / den;
    if (dist > maxDist) { maxDist = dist; idx = i; }
  }
  if (maxDist > eps) {
    const rec1 = rdp(pts.slice(0, idx + 1), eps);
    const rec2 = rdp(pts.slice(idx), eps);
    return rec1.slice(0, -1).concat(rec2);
  }
  return [pts[0], pts[pts.length - 1]];
}

// Área do Polígono para descartar ruído minúsculo
function polygonArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    a += poly[i][0] * poly[j][1] - poly[j][0] * poly[i][1];
  }
  return Math.abs(a) * 0.5;
}

// Gaussian / Box Blur suave no campo escalar
function blurField(grid, w, h) {
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      // 3x3 binomial filter:
      // 1 2 1
      // 2 4 2
      // 1 2 1  sum = 16
      const sum = (
        grid[(y - 1) * w + (x - 1)] * 1 + grid[(y - 1) * w + x] * 2 + grid[(y - 1) * w + (x + 1)] * 1 +
        grid[y * w + (x - 1)] * 2       + grid[y * w + x] * 4       + grid[y * w + (x + 1)] * 2 +
        grid[(y + 1) * w + (x - 1)] * 1 + grid[(y + 1) * w + x] * 2 + grid[(y + 1) * w + (x + 1)] * 1
      );
      out[idx] = sum / 16;
    }
  }
  return out;
}

const img = getRGBA('ref/novo-heroi/prancha-turnaround-poses.png');

const CELLS = {
  dir_0:   { x: 0,   y: 0,   w: 128, h: 192, isTop: true },
  dir_45:  { x: 128, y: 0,   w: 128, h: 192, isTop: true },
  dir_90:  { x: 256, y: 0,   w: 128, h: 192, isTop: true },
  dir_135: { x: 384, y: 0,   w: 128, h: 192, isTop: true },
  dir_180: { x: 512, y: 0,   w: 128, h: 192, isTop: true },
  dir_225: { x: 640, y: 0,   w: 128, h: 192, isTop: true },
  dir_270: { x: 768, y: 0,   w: 128, h: 192, isTop: true },
  dir_315: { x: 896, y: 0,   w: 128, h: 192, isTop: true },

  corte_antic:  { x: 0 * 146, y: 192, w: 146, h: 192, isTop: false },
  corte_strike: { x: 1 * 146, y: 192, w: 146, h: 192, isTop: false },
  reves_antic:  { x: 2 * 146, y: 192, w: 146, h: 192, isTop: false },
  reves_strike: { x: 3 * 146, y: 192, w: 146, h: 192, isTop: false },
  salto_antic:  { x: 4 * 146, y: 192, w: 146, h: 192, isTop: false },
  salto_impact: { x: 5 * 146, y: 192, w: 146, h: 192, isTop: false },
  run:          { x: 6 * 146, y: 192, w: 146, h: 192, isTop: false }
};

const result = {};

for (const [cellName, box] of Object.entries(CELLS)) {
  const textCutoffY = box.isTop ? 38 : 22; // Corta rótulos de texto

  // 1. Matriz de rótulos de cores
  const labelMap = new Uint8Array(box.w * box.h); // 0 = transparência/fundo
  let minX = box.x + box.w, maxX = box.x, minY = box.y + box.h, maxY = box.y;

  for (let ly = textCutoffY; ly < box.h - 1; ly++) {
    for (let lx = 5; lx < box.w - 5; lx++) {
      if (lx < 15 && ly > 170) continue; // cursor arrow

      const gx = box.x + lx;
      const gy = box.y + ly;
      const idx = (gy * img.width + gx) * 4;
      const r = img.pixels[idx], g = img.pixels[idx + 1], b = img.pixels[idx + 2];

      const distBg = colorDist(r, g, b, BG[0], BG[1], BG[2]);
      if (distBg < 20 || isPaperShadow(r, g, b, ly, box.isTop)) {
        continue;
      }

      // Encontra a melhor cor da paleta
      let bestDist = 1e9, bestId = 1;
      for (const p of PALETTE) {
        const d = colorDist(r, g, b, p.rgb[0], p.rgb[1], p.rgb[2]);
        if (d < bestDist) {
          bestDist = d;
          bestId = p.id;
        }
      }

      labelMap[ly * box.w + lx] = bestId;

      if (gx < minX) minX = gx;
      if (gx > maxX) maxX = gx;
      if (gy < minY) minY = gy;
      if (gy > maxY) maxY = gy;
    }
  }

  // 2. Filtro de Maioria (Majority Filter) 3x3 para consolidar manchas cel-shading
  const cleanMap = new Uint8Array(box.w * box.h);
  cleanMap.set(labelMap);

  for (let ly = 1; ly < box.h - 1; ly++) {
    for (let lx = 1; lx < box.w - 1; lx++) {
      const cur = labelMap[ly * box.w + lx];
      if (cur === 0) continue; // fundo não altera
      const palInfo = PALETTE.find(p => p.id === cur);
      if (palInfo && palInfo.protect) continue; // não altera linhas finas de tinta ou glint

      // Conta vizinhança 3x3
      const counts = {};
      let maxCount = 0, dominantId = cur;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const neighbor = labelMap[(ly + dy) * box.w + (lx + dx)];
          if (neighbor === 0) continue;
          counts[neighbor] = (counts[neighbor] || 0) + 1;
          if (counts[neighbor] > maxCount) {
            maxCount = counts[neighbor];
            dominantId = neighbor;
          }
        }
      }
      if (maxCount >= 5 && dominantId !== cur) {
        cleanMap[ly * box.w + lx] = dominantId;
      }
    }
  }

  const centerX = Math.round((minX + maxX) / 2);
  const groundY = maxY;

  // 3. Extração das Camadas
  const layers = [];

  // Camada 0: Silhueta de tinta completa (base escura sem frestas)
  const fullSil = new Float32Array(box.w * box.h);
  for (let i = 0; i < cleanMap.length; i++) {
    if (cleanMap[i] > 0) fullSil[i] = 1.0;
  }
  const blurredSil = blurField(fullSil, box.w, box.h);
  const baseLoops = smoothMarchingSquares(blurredSil, box.w, box.h, 0.45);
  const basePolys = [];
  for (const loop of baseLoops) {
    if (loop.length >= 6) {
      const sim = rdp(loop, 0.85);
      if (sim.length >= 3 && polygonArea(sim) > 10) {
        basePolys.push(sim.map(([px, py]) => [
          Math.round(((box.x + px) - centerX) * 10) / 10,
          Math.round(((box.y + py) - groundY) * 10) / 10
        ]));
      }
    }
  }
  if (basePolys.length > 0) {
    layers.push({ c: '#1E100C', p: basePolys });
  }

  // Camadas de Cores Empilhadas
  for (const layerKey of RENDER_ORDER) {
    if (layerKey === 'ink_base') continue;
    const pal = PALETTE.find(p => p.name === layerKey);
    if (!pal) continue;

    const mask = new Float32Array(box.w * box.h);
    let count = 0;
    for (let i = 0; i < cleanMap.length; i++) {
      if (cleanMap[i] === pal.id) {
        mask[i] = 1.0;
        count++;
      }
    }

    if (count < 8) continue; // descarta ruído

    // Para camadas de tinta e glint, não aplica blur forte para preservar a nitidez de olhos e detalhes
    let blurred;
    if (pal.protect) {
      blurred = mask;
    } else {
      blurred = blurField(mask, box.w, box.h);
    }

    const isoVal = pal.protect ? 0.35 : 0.45;
    const loops = smoothMarchingSquares(blurred, box.w, box.h, isoVal);
    const polys = [];

    const eps = pal.protect ? 0.6 : 0.85;
    const minArea = pal.protect ? 1.5 : 5.0;

    for (const loop of loops) {
      if (loop.length < 4) continue;
      const sim = rdp(loop, eps);
      if (sim.length >= 3 && polygonArea(sim) >= minArea) {
        polys.push(sim.map(([px, py]) => [
          Math.round(((box.x + px) - centerX) * 10) / 10,
          Math.round(((box.y + py) - groundY) * 10) / 10
        ]));
      }
    }

    if (polys.length > 0) {
      layers.push({
        c: pal.hex,
        p: polys
      });
    }
  }

  result[cellName] = {
    cx: centerX - box.x,
    gy: groundY - box.y,
    w: maxX - minX,
    h: maxY - minY,
    l: layers
  };
}

const code = `/**
 * hero_vectors.js — Vetores Oficiais do Cavaleiro (Método RafaxLab)
 * 100% Canvas 2D puro — Zero imagens em runtime
 */
const HERO_VECTORS = ${JSON.stringify(result)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HERO_VECTORS };
}
`;

fs.writeFileSync('js/hero_vectors.js', code, 'utf-8');
console.log('Vetorização limpa e cel-shading suave concluída com sucesso!');
