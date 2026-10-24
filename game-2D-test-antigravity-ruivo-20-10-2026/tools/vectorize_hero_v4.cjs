/**
 * vectorize_hero_v4.cjs
 * Vetorizador Oficial Chibi Cel-Shading (Método RafaxLab Refinado)
 * 
 * Correção Cirúrgica:
 * 1. Remove sombra de papel do chão.
 * 2. Traços faciais (olhos, sobrancelhas, boca) preservados com precisão cirúrgica na região do rosto.
 * 3. Lâmina da espada e chapas da armadura limpas de ruído de antialiasing (sem pontilhado de tinta falsa).
 * 4. Silhueta externa com contorno de tinta unificado estilo HQ (Hades).
 * 5. Underlays anatômicos 100% sólidos: zero frestas transparentes, mechas escarlates limpas.
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

function isPaperShadow(r, g, b, ly, isTop) {
  const minY = isTop ? 140 : 155;
  if (ly < minY) return false;
  const scale = (r / BG[0] + g / BG[1] + b / BG[2]) / 3;
  if (scale > 0.68 && scale < 0.98) {
    const dr = Math.abs(r - BG[0] * scale);
    const dg = Math.abs(g - BG[1] * scale);
    const db = Math.abs(b - BG[2] * scale);
    if (dr < 12 && dg < 12 && db < 12) return true;
  }
  return false;
}

function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.hypot(dr * 0.9, dg * 1.2, db * 0.8);
}

// Subpixel Marching Squares
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
    if (cur === startKey && loop.length >= 4) {
      loops.push(loop);
    }
  }
  return loops;
}

// Ramer-Douglas-Peucker
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

function polygonArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    a += poly[i][0] * poly[j][1] - poly[j][0] * poly[i][1];
  }
  return Math.abs(a) * 0.5;
}

function blurField(grid, w, h) {
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
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

// IDs semânticos
const ID_BG = 0;
const ID_EYES = 1;
const ID_SKIN_BASE = 2;
const ID_SKIN_SHADOW = 3;
const ID_HAIR_MID = 4;
const ID_HAIR_DARK = 5;
const ID_HAIR_HI = 6;
const ID_ARMOR_MID = 7;
const ID_ARMOR_SHADOW = 8;
const ID_ARMOR_HI = 9;
const ID_TUNIC_RED = 10;
const ID_TUNIC_SHADOW = 11;
const ID_PANTS_MID = 12;
const ID_BOOTS_DARK = 13;
const ID_BOW_ORANGE = 14;
const ID_GOLD_GUARD = 15;
const ID_GLINT = 16;
const ID_OUTLINE = 17;

const result = {};

for (const [cellName, box] of Object.entries(CELLS)) {
  const textCutoffY = box.isTop ? 38 : 22;
  const labelMap = new Uint8Array(box.w * box.h);
  let minX = box.x + box.w, maxX = box.x, minY = box.y + box.h, maxY = box.y;

  for (let ly = textCutoffY; ly < box.h - 1; ly++) {
    for (let lx = 5; lx < box.w - 5; lx++) {
      if (lx < 15 && ly > 170) continue; // seta do cursor

      const gx = box.x + lx;
      const gy = box.y + ly;
      const idx = (gy * img.width + gx) * 4;
      const r = img.pixels[idx], g = img.pixels[idx + 1], b = img.pixels[idx + 2];

      const distBg = colorDist(r, g, b, BG[0], BG[1], BG[2]);
      if (distBg < 20 || isPaperShadow(r, g, b, ly, box.isTop)) {
        continue;
      }

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let assigned = ID_ARMOR_MID;

      const isFaceBox = ly >= (box.isTop ? 65 : 45) && ly <= (box.isTop ? 105 : 95);

      // 1. Olhos e sobrancelhas no rosto
      if (isFaceBox && lum < 58 && (r - b) < 30) {
        assigned = ID_EYES;
      }
      // 2. Glint branco puro
      else if (lum > 248 && Math.abs(r - b) < 15) {
        assigned = ID_GLINT;
      }
      // 3. Pele (tom pêssego)
      else if (r > 190 && g > 115 && b > 75 && r > g && g > b && (r - b) > 35 && (r - g) < 95) {
        assigned = lum > 175 ? ID_SKIN_BASE : ID_SKIN_SHADOW;
      }
      // 4. Laço laranja do ombro
      else if (r > 190 && g > 90 && g < 165 && b < 70 && (r - g) >= 70) {
        assigned = ID_BOW_ORANGE;
      }
      // 5. Guarda dourada da espada
      else if (r > 150 && g > 110 && b < 85 && (r - b) > 65 && (g - b) > 30) {
        assigned = ID_GOLD_GUARD;
      }
      // 6. Vermelho (Cabelo ou Túnica)
      else if (r > 130 && r > g * 1.6 && r > b * 1.6) {
        const isUpperHead = ly < (box.isTop ? 88 : 100);
        if (isUpperHead) {
          if (r > 235 && g > 50) assigned = ID_HAIR_HI;
          else if (r < 175) assigned = ID_HAIR_DARK;
          else assigned = ID_HAIR_MID;
        } else {
          assigned = r < 180 ? ID_TUNIC_SHADOW : ID_TUNIC_RED;
        }
      }
      // 7. Couro / Botas / Cinto marrom escuro
      else if (lum < 115 && r > g && r > b && (r - b) > 15) {
        assigned = lum < 75 ? ID_BOOTS_DARK : ID_PANTS_MID;
      }
      // 8. Armadura e lâmina prateada
      else {
        if (lum > 210) assigned = ID_ARMOR_HI;
        else if (lum < 155) assigned = ID_ARMOR_SHADOW;
        else assigned = ID_ARMOR_MID;
      }

      labelMap[ly * box.w + lx] = assigned;

      if (gx < minX) minX = gx;
      if (gx > maxX) maxX = gx;
      if (gy < minY) minY = gy;
      if (gy > maxY) maxY = gy;
    }
  }

  // Filtro de Maioria 3x3 e consolidação de manchas cel-shading
  const cleanMap = new Uint8Array(box.w * box.h);
  cleanMap.set(labelMap);

  for (let ly = 1; ly < box.h - 1; ly++) {
    for (let lx = 1; lx < box.w - 1; lx++) {
      const cur = labelMap[ly * box.w + lx];
      if (cur === ID_BG || cur === ID_EYES || cur === ID_GLINT) continue;

      const counts = {};
      let maxCount = 0, dominantId = cur;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const neighbor = labelMap[(ly + dy) * box.w + (lx + dx)];
          if (neighbor === ID_BG) continue;
          counts[neighbor] = (counts[neighbor] || 0) + 1;
          if (counts[neighbor] > maxCount) {
            maxCount = counts[neighbor];
            dominantId = neighbor;
          }
        }
      }
      if (maxCount >= 5 && dominantId !== cur && dominantId !== ID_EYES) {
        cleanMap[ly * box.w + lx] = dominantId;
      }
    }
  }

  // Remoção de ilhas pequenas (< 8 pixels)
  const visited = new Uint8Array(box.w * box.h);
  for (let ly = 0; ly < box.h; ly++) {
    for (let lx = 0; lx < box.w; lx++) {
      const idx = ly * box.w + lx;
      const id = cleanMap[idx];
      if (id === ID_BG || visited[idx]) continue;

      const comp = [idx];
      visited[idx] = 1;
      let q = 0;
      while (q < comp.length) {
        const c = comp[q++];
        const cy = Math.floor(c / box.w), cx = c % box.w;
        for (const [dy, dx] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const ny = cy + dy, nx = cx + dx;
          if (nx >= 0 && nx < box.w && ny >= 0 && ny < box.h) {
            const nidx = ny * box.w + nx;
            if (!visited[nidx] && cleanMap[nidx] === id) {
              visited[nidx] = 1;
              comp.push(nidx);
            }
          }
        }
      }

      const isEyeRegion = ly >= 70 && ly <= 100 && lx >= 40 && lx <= 90;
      const threshold = (id === ID_EYES || id === ID_GLINT) && isEyeRegion ? 3 : 8;

      if (comp.length < threshold) {
        let bestCount = 0, bestNeighbor = ID_ARMOR_MID;
        const ncounts = {};
        for (const c of comp) {
          const cy = Math.floor(c / box.w), cx = c % box.w;
          for (const [dy, dx] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const ny = cy + dy, nx = cx + dx;
            if (nx >= 0 && nx < box.w && ny >= 0 && ny < box.h) {
              const nid = cleanMap[ny * box.w + nx];
              if (nid !== id && nid !== ID_BG) {
                ncounts[nid] = (ncounts[nid] || 0) + 1;
                if (ncounts[nid] > bestCount) {
                  bestCount = ncounts[nid];
                  bestNeighbor = nid;
                }
              }
            }
          }
        }
        for (const c of comp) {
          cleanMap[c] = bestNeighbor;
        }
      }
    }
  }

  const centerX = Math.round((minX + maxX) / 2);
  const groundY = maxY;

  function extractPolygons(predicate, isoVal = 0.45, eps = 0.85, minArea = 3.0, doBlur = true) {
    const mask = new Float32Array(box.w * box.h);
    let count = 0;
    for (let i = 0; i < cleanMap.length; i++) {
      if (predicate(cleanMap[i])) {
        mask[i] = 1.0;
        count++;
      }
    }
    if (count < 4) return [];

    const field = doBlur ? blurField(mask, box.w, box.h) : mask;
    const loops = smoothMarchingSquares(field, box.w, box.h, isoVal);
    const polys = [];

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
    return polys;
  }

  const layers = [];

  // ========================================================
  // 0. SILHUETA DE CONTORNO HQ (Hades Dark Ink Outline)
  // Contorno completo que abraça todo o herói
  // ========================================================
  const sil = extractPolygons(id => id > 0, 0.45, 0.85, 10.0, true);
  if (sil.length) layers.push({ c: '#241410', p: sil });

  // 1. Armadura Base (Placas de aço cobrindo ombros, peitoral, braços e pernas)
  const armorBase = extractPolygons(id => id === ID_ARMOR_MID || id === ID_ARMOR_SHADOW || id === ID_ARMOR_HI);
  if (armorBase.length) layers.push({ c: '#B8ACA6', p: armorBase });

  // 2. Armadura Sombra
  const armorShadow = extractPolygons(id => id === ID_ARMOR_SHADOW);
  if (armorShadow.length) layers.push({ c: '#888080', p: armorShadow });

  // 3. Armadura Brilhos / Lâmina Prateada
  const armorHi = extractPolygons(id => id === ID_ARMOR_HI);
  if (armorHi.length) layers.push({ c: '#E8E0DA', p: armorHi });

  // 4. Couro / Calças / Cinto Diagonal / Botas Base
  const leatherBase = extractPolygons(id => id === ID_PANTS_MID || id === ID_BOOTS_DARK);
  if (leatherBase.length) layers.push({ c: '#643026', p: leatherBase });

  // 5. Botas e fivelas sombra
  const bootsDark = extractPolygons(id => id === ID_BOOTS_DARK);
  if (bootsDark.length) layers.push({ c: '#402018', p: bootsDark });

  // 6. Túnica Vermelha (Avental frontal e abas sobre o cinto)
  const tunicBase = extractPolygons(id => id === ID_TUNIC_RED || id === ID_TUNIC_SHADOW);
  if (tunicBase.length) layers.push({ c: '#E02030', p: tunicBase });

  // 7. Túnica Sombra
  const tunicShadow = extractPolygons(id => id === ID_TUNIC_SHADOW);
  if (tunicShadow.length) layers.push({ c: '#A81420', p: tunicShadow });

  // 8. Pele Base (Rosto, bochechas e mãos)
  const skinBase = extractPolygons(id => id === ID_SKIN_BASE || id === ID_SKIN_SHADOW);
  if (skinBase.length) layers.push({ c: '#F8B488', p: skinBase });

  // 9. Pele Sombra (Queixo e laterais do rosto)
  const skinShadow = extractPolygons(id => id === ID_SKIN_SHADOW);
  if (skinShadow.length) layers.push({ c: '#DC825A', p: skinShadow });

  // 10. Cabelo Escarlate Base (Gomos volumosos)
  const hairBase = extractPolygons(id => id === ID_HAIR_MID || id === ID_HAIR_DARK || id === ID_HAIR_HI);
  if (hairBase.length) layers.push({ c: '#D82030', p: hairBase });

  // 11. Cabelo Sombra (Fendas e volume de fundo)
  const hairDark = extractPolygons(id => id === ID_HAIR_DARK);
  if (hairDark.length) layers.push({ c: '#9C101C', p: hairDark });

  // 12. Cabelo Realce (Mechas pontiagudas iluminadas)
  const hairHi = extractPolygons(id => id === ID_HAIR_HI);
  if (hairHi.length) layers.push({ c: '#F84048', p: hairHi });

  // 13. Laço Laranja de Ombro
  const bowOrange = extractPolygons(id => id === ID_BOW_ORANGE);
  if (bowOrange.length) layers.push({ c: '#F08020', p: bowOrange });

  // 14. Guarda Dourada da Espada
  const goldGuard = extractPolygons(id => id === ID_GOLD_GUARD);
  if (goldGuard.length) layers.push({ c: '#C49C3C', p: goldGuard });

  // 15. Olhos e Expressão Facial
  const eyes = extractPolygons(id => id === ID_EYES, 0.40, 0.60, 0.8, true);
  if (eyes.length) layers.push({ c: '#241410', p: eyes });

  // 16. Glints Brancos dos Olhos e Espada
  const glints = extractPolygons(id => id === ID_GLINT, 0.35, 0.5, 0.5, true);
  if (glints.length) layers.push({ c: '#FFFFFF', p: glints });

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
console.log('Vetorização oficial v4 concluída com sucesso!');
