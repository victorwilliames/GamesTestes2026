const fs = require('fs');
const { HERO_VECTORS } = require('../js/hero_vectors.js');

const corrections = {
  dir_0:        { dx: -4.6,  dy: -10.6 },
  dir_45:       { dx: -0.2,  dy: -8.3 },
  dir_90:       { dx: 4.2,   dy: -7.6 },
  dir_135:      { dx: -1.8,  dy: -5.5 },
  dir_180:      { dx: -8.5,  dy: -18.1 },
  dir_225:      { dx: 2.1,   dy: -18.4 },
  dir_270:      { dx: 9.0,   dy: -6.6 },
  dir_315:      { dx: 4.8,   dy: -12.6 },
  corte_antic:  { dx: -1.0,  dy: -15.6 },
  corte_strike: { dx: -11.0, dy: -19.4 },
  reves_antic:  { dx: -11.6, dy: -9.6 },
  reves_strike: { dx: -3.7,  dy: -15.6 },
  salto_antic:  { dx: 36.2,  dy: -16.6 },
  salto_impact: { dx: 3.6,   dy: -24.1 },
  run:          { dx: 25.7,  dy: -9.6 },
};

const updated = {};
for (const [k, v] of Object.entries(HERO_VECTORS)) {
  const corr = corrections[k] || { dx: 0, dy: 0 };
  const newLayers = v.l.map(layer => {
    return {
      c: layer.c,
      p: layer.p.map(poly => {
        return poly.map(([x, y]) => [
          Math.round((x + corr.dx) * 10) / 10,
          Math.round((y + corr.dy) * 10) / 10
        ]);
      })
    };
  });
  updated[k] = {
    cx: v.cx,
    gy: v.gy,
    w: v.w,
    h: v.h,
    l: newLayers
  };
}

const outCode = `/**
 * hero_vectors.js — Vetores Oficiais do Cavaleiro (Calibrados 1:1 sem jitter)
 * 100% Canvas 2D puro — Zero imagens em runtime
 */
const HERO_VECTORS = ${JSON.stringify(updated)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HERO_VECTORS };
}
`;

fs.writeFileSync('js/hero_vectors.js', outCode, 'utf8');
console.log('HERO_VECTORS calibrated with zero jitter!');
