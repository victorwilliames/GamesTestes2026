/**
 * tools/vectorize_hero.cjs — Vetorizador Marching Squares do Cavaleiro (Método RafaxLab)
 *
 * Filtra ruídos de texto, fecha costuras e gera polígonos fiéis à prancha oficial.
 */

const fs = require('fs');
const zlib = require('zlib');

function getRGBA(path) {
  const buf = fs.readFileSync(path);
  let pos = 8, width, height, bitDepth, colorType;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = colorType === 6 ? 4 : (colorType === 2 ? 3 : 4);
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  let rawPos = 0;
  const prevRow = Buffer.alloc(stride);
  const curRow = Buffer.alloc(stride);
  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
  }
  for (let y = 0; y < height; y++) {
    const filter = raw[rawPos++];
    for (let x = 0; x < stride; x++) {
      const byte = raw[rawPos++];
      const a = x >= bpp ? curRow[x - bpp] : 0, b = prevRow[x], c = x >= bpp ? prevRow[x - bpp] : 0;
      let val = 0;
      if (filter === 0) val = byte;
      else if (filter === 1) val = (byte + a) & 0xff;
      else if (filter === 2) val = (byte + b) & 0xff;
      else if (filter === 3) val = (byte + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) val = (byte + paeth(a, b, c)) & 0xff;
      curRow[x] = val;
    }
    for (let x = 0; x < width; x++) {
      const pIdx = (y * width + x) * 4;
      const rIdx = x * bpp;
      pixels[pIdx] = curRow[rIdx];
      pixels[pIdx + 1] = curRow[rIdx + 1];
      pixels[pIdx + 2] = curRow[rIdx + 2];
      pixels[pIdx + 3] = bpp === 4 ? curRow[rIdx + 3] : 255;
    }
    curRow.copy(prevRow);
  }
  return { width, height, pixels };
}

function marchingSquares(grid, w, h) {
  const pw = w + 2, ph = h + 2;
  const pad = new Uint8Array(pw * ph);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      pad[(y + 1) * pw + (x + 1)] = grid[y * w + x];
    }
  }

  const adj = new Map();
  function addEdge(p1, p2) {
    const k1 = p1[0] + ',' + p1[1];
    const k2 = p2[0] + ',' + p2[1];
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
      const caseIdx = (tl << 3) | (tr << 2) | (br << 1) | bl;
      if (caseIdx === 0 || caseIdx === 15) continue;

      const top = [x + 0.5 - 1, y - 1];
      const right = [x + 1 - 1, y + 0.5 - 1];
      const bottom = [x + 0.5 - 1, y + 1 - 1];
      const left = [x - 1, y + 0.5 - 1];

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
  for (const [startKey, neighbors] of adj) {
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

// Ordem estrita de renderização cel-shading:
// 1. Silhueta de base (preenchimento escuro total para nunca haver buracos transparentes!)
// 2. Cores de base e sombras (roupas, armadura, pele)
// 3. Cores claras e realces
// 4. Detalhes, tinta escura (olhos, contorno) e pontos de brilho
const PALETTE = [
  { name: 'pants_dark',  rgb: [80, 40, 32],    hex: '#502820' },
  { name: 'armor_shadow',rgb: [136, 128, 128], hex: '#888080' },
  { name: 'armor_mid',   rgb: [184, 168, 160], hex: '#B8A8A0' },
  { name: 'armor_hi',    rgb: [224, 216, 208], hex: '#E0D8D0' },
  { name: 'tunic_red',   rgb: [224, 32, 48],   hex: '#E02030' },
  { name: 'skin_shadow', rgb: [232, 136, 88],  hex: '#E88858' },
  { name: 'skin_base',   rgb: [248, 180, 132], hex: '#F8B484' },
  { name: 'bow_orange',  rgb: [240, 128, 32],  hex: '#F08020' },
  { name: 'hair_shadow', rgb: [168, 8, 24],    hex: '#A80818' },
  { name: 'hair_main',   rgb: [216, 24, 40],   hex: '#D81828' },
  { name: 'hair_hi',     rgb: [248, 56, 64],   hex: '#F83840' },
  { name: 'sword_gold',  rgb: [192, 152, 64],  hex: '#C09840' },
  { name: 'ink',         rgb: [32, 16, 8],     hex: '#201008' },
  { name: 'glint',       rgb: [255, 255, 255], hex: '#FFFFFF' }
];

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

  let minX = box.x + box.w, maxX = box.x, minY = box.y + box.h, maxY = box.y;
  for (let y = box.y + textCutoffY; y < box.y + box.h - 2; y++) {
    for (let x = box.x + 5; x < box.x + box.w - 5; x++) {
      // Ignora seta do cursor no canto inferior esquerdo
      if (x - box.x < 15 && y - box.y > 172) continue;

      const idx = (y * img.width + x) * 4;
      const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
      if (Math.hypot(r - 214, g - 207, b - 194) > 22) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const centerX = Math.round((minX + maxX) / 2);
  const groundY = maxY;

  // 1. Máscara de silhueta total (Underlay de tinta)
  const fullSilhouetteGrid = new Uint8Array(box.w * box.h);
  for (let ly = textCutoffY; ly < box.h - 1; ly++) {
    for (let lx = 5; lx < box.w - 5; lx++) {
      if (lx < 15 && ly > 172) continue;
      const gx = box.x + lx;
      const gy = box.y + ly;
      const idx = (gy * img.width + gx) * 4;
      const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
      if (Math.hypot(r - 214, g - 207, b - 194) > 22) {
        fullSilhouetteGrid[ly * box.w + lx] = 1;
      }
    }
  }

  const layers = [];

  // Adiciona camada 0: silhueta de base preta/tinta para garantir bordas sólidas sem frestas
  const baseLoops = marchingSquares(fullSilhouetteGrid, box.w, box.h);
  const basePolys = [];
  for (const loop of baseLoops) {
    if (loop.length >= 8) {
      const sim = rdp(loop, 1.0);
      if (sim.length >= 3) {
        basePolys.push(sim.map(([px, py]) => [
          Math.round(((box.x + px) - centerX) * 10) / 10,
          Math.round(((box.y + py) - groundY) * 10) / 10
        ]));
      }
    }
  }
  if (basePolys.length > 0) {
    layers.push({ c: '#201008', p: basePolys });
  }

  // Camadas de cores
  for (const pal of PALETTE) {
    const grid = new Uint8Array(box.w * box.h);
    let count = 0;

    for (let ly = textCutoffY; ly < box.h - 1; ly++) {
      for (let lx = 5; lx < box.w - 5; lx++) {
        if (lx < 15 && ly > 172) continue;
        const gx = box.x + lx;
        const gy = box.y + ly;
        const idx = (gy * img.width + gx) * 4;
        const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];

        if (Math.hypot(r - 214, g - 207, b - 194) < 22) continue;

        let bestDist = 1e9, bestName = '';
        for (const p of PALETTE) {
          const d = Math.hypot(r - p.rgb[0], g - p.rgb[1], b - p.rgb[2]);
          if (d < bestDist) {
            bestDist = d;
            bestName = p.name;
          }
        }

        if (bestName === pal.name) {
          grid[ly * box.w + lx] = 1;
          count++;
        }
      }
    }

    if (count >= 10) {
      const rawLoops = marchingSquares(grid, box.w, box.h);
      const filteredPolys = [];

      for (const loop of rawLoops) {
        if (loop.length < 5) continue;
        const sim = rdp(loop, 0.95);
        if (sim.length >= 3) {
          const normPoly = sim.map(([px, py]) => [
            Math.round(((box.x + px) - centerX) * 10) / 10,
            Math.round(((box.y + py) - groundY) * 10) / 10
          ]);
          filteredPolys.push(normPoly);
        }
      }

      if (filteredPolys.length > 0) {
        layers.push({
          c: pal.hex,
          p: filteredPolys
        });
      }
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
console.log('Regeneração com base-silhouette e filtro de ruído concluída!');
