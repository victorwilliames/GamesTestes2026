/* Decodificador PNG mínimo (8 bits, não entrelaçado) + métricas de silhueta.
 * Uso: node tools/png.js <arquivo.png> [--rows] */
import fs from 'node:fs';
import zlib from 'node:zlib';

export function decodePNG(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('não é PNG');
  let off = 8, w = 0, h = 0, depth = 0, ctype = 0, interlace = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; ctype = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (depth !== 8 || interlace !== 0) throw new Error(`png depth=${depth} interlace=${interlace} não suportado`);
  const ch = ctype === 6 ? 4 : ctype === 2 ? 3 : ctype === 4 ? 2 : ctype === 0 ? 1 : 0;
  if (!ch) throw new Error('color type ' + ctype);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++];
    const line = Buffer.from(raw.subarray(p, p + stride)); p += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0;
      const b = prev[x];
      const c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      line[x] = v & 255;
    }
    prev = line;
    for (let x = 0; x < w; x++) {
      const si = x * ch, di = (y * w + x) * 4;
      if (ch === 4) { out[di] = line[si]; out[di + 1] = line[si + 1]; out[di + 2] = line[si + 2]; out[di + 3] = line[si + 3]; }
      else if (ch === 3) { out[di] = line[si]; out[di + 1] = line[si + 1]; out[di + 2] = line[si + 2]; out[di + 3] = 255; }
      else if (ch === 2) { out[di] = line[si]; out[di + 1] = line[si + 1]; out[di + 2] = 255; out[di + 3] = line[si + 1]; }
      else { out[di] = out[di + 1] = out[di + 2] = line[si]; out[di + 3] = 255; }
    }
  }
  return { w, h, data: out };
}

export function metrics(img, thresh = 24) {
  const { w, h, data } = img;
  let x0 = w, y0 = h, x1 = -1, y1 = -1, count = 0;
  const rows = [];
  for (let y = 0; y < h; y++) {
    let rx0 = -1, rx1 = -1;
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > thresh) {
        if (rx0 < 0) rx0 = x; rx1 = x; count++;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    rows.push([rx0, rx1]);
  }
  return { w, h, x0, y0, x1, y1, count, rows };
}

if (import.meta.url === 'file:///' + process.argv[1].replace(/\\/g, '/')) {
  const f = process.argv[2];
  const img = decodePNG(f);
  const m = metrics(img);
  if (process.argv.includes('--ascii')) {
    const CW = 96, CH = 56;
    console.log(`# silhueta ${m.w}x${m.h} bbox x${m.x0}..${m.x1} y${m.y0}..${m.y1}`);
    for (let r = 0; r < CH; r++) {
      const ya = Math.floor(m.y0 + (m.y1 - m.y0) * r / CH), yb = Math.floor(m.y0 + (m.y1 - m.y0) * (r + 1) / CH);
      let line = '';
      for (let c = 0; c < CW; c++) {
        const xa = Math.floor(m.x0 + (m.x1 - m.x0) * c / CW), xb = Math.floor(m.x0 + (m.x1 - m.x0) * (c + 1) / CW);
        let n = 0, tot = 0;
        for (let y = ya; y < yb; y += 2) for (let x = xa; x < xb; x += 2) { tot++; if (img.data[(y * m.w + x) * 4 + 3] > 24) n++; }
        const f = tot ? n / tot : 0;
        line += f > 0.6 ? '#' : f > 0.25 ? '+' : f > 0.02 ? '.' : ' ';
      }
      const yPct = ((ya - m.y0) / (m.y1 - m.y0) * 100).toFixed(0).padStart(3);
      console.log(`${yPct}% y${String(ya).padStart(4)} |${line}|`);
    }
    process.exit(0);
  }
  console.log(JSON.stringify({ file: f, w: m.w, h: m.h, bbox: [m.x0, m.y0, m.x1, m.y1], count: m.count }, null, 2));
  const bands = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  for (let i = 0; i < bands.length - 1; i++) {
    const ya = Math.round(bands[i] * m.h), yb = Math.round(bands[i + 1] * m.h);
    let a = 1e9, b = -1;
    for (let y = ya; y < yb; y++) { const r = m.rows[y]; if (r[0] >= 0) { a = Math.min(a, r[0]); b = Math.max(b, r[1]); } }
    console.log(`band ${(bands[i]*100).toFixed(0)}-${(bands[i+1]*100).toFixed(0)}%  x ${a > 1e8 ? '-' : a}..${b < 0 ? '-' : b}  w ${b < 0 ? 0 : b - a + 1}`);
  }
}
