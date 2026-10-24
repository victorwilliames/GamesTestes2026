import fs from 'node:fs';
import zlib from 'node:zlib';

function readPng(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.toString('ascii', 1, 4) !== 'PNG') throw new Error('Not PNG');

  let offset = 8;
  let width = 0, height = 0, colorType = 0;
  const idatChunks = [];

  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(offset + 8);
      height = buf.readUInt32BE(offset + 12);
      colorType = buf[offset + 17];
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(offset + 8, offset + 8 + len));
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + len;
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  // Bytes por pixel
  // colorType 6 = RGBA (4 bpp)
  // colorType 2 = RGB (3 bpp)
  const bpp = colorType === 6 ? 4 : (colorType === 2 ? 3 : 1);
  const stride = width * bpp;

  // Desfazer filtros PNG scanline por scanline
  const uncompressed = Buffer.alloc(width * height * bpp);
  let srcPos = 0;
  let dstPos = 0;

  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcPos++];
    for (let x = 0; x < stride; x++) {
      const val = decompressed[srcPos++];
      let a = 0; // pixel à esquerda
      let b = 0; // pixel acima
      let c = 0; // pixel diagonal acima-esquerda

      if (x >= bpp) a = uncompressed[dstPos - bpp];
      if (y > 0) b = uncompressed[dstPos - stride];
      if (x >= bpp && y > 0) c = uncompressed[dstPos - stride - bpp];

      let raw = 0;
      if (filter === 0) raw = val;
      else if (filter === 1) raw = (val + a) & 0xff;
      else if (filter === 2) raw = (val + b) & 0xff;
      else if (filter === 3) raw = (val + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        raw = (val + pr) & 0xff;
      }
      uncompressed[dstPos++] = raw;
    }
  }

  // Encontrar bounding box de pixels com alfa > 15
  let minX = width, maxX = 0, minY = height, maxY = 0;
  if (colorType === 6) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = uncompressed[(y * width + x) * 4 + 3];
        if (alpha > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  return {
    file: filePath,
    width, height, colorType,
    minX, maxX, minY, maxY,
    boxW: maxX - minX + 1,
    boxH: maxY - minY + 1,
    footY: maxY,
    centerX: Math.round((minX + maxX) / 2)
  };
}

const files = [
  'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png',
  'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-se.png',
  'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-e.png',
  'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-ne.png',
  'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-n.png',
  'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-nw.png',
  'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-w.png',
  'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-sw.png',
  'assets/references/ref-2d-hero/hero-parts/hero-part-head.png',
  'assets/references/ref-2d-hero/hero-parts/hero-part-body.png',
  'assets/references/ref-2d-hero/hero-parts/hero-part-weapons.png'
];

for (const f of files) {
  try {
    const res = readPng(f);
    console.log(JSON.stringify(res));
  } catch (e) {
    console.error(f, e.message);
  }
}
