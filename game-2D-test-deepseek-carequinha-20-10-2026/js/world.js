'use strict';
// world.js — a arena. O chão é pintado UMA vez num OffscreenCanvas e depois é só
// um drawImage. Árvores/arbustos/pedras são desenhados uma vez em sprites
// individuais e carimbados (com espelhamento). Só o vento é animado.
Object.assign(Pilot, (() => {
  const { project, rng } = Pilot;
  const { INK } = Pilot;
  const TAU = Math.PI * 2;
  const ARENA = 320;          // meia-aresta do platô (unidades do mundo)
  const rnd = rng(1234);

  let groundCv = null, groundOx = 0, groundOy = 0;
  const props = [];
  let gust = 0, gustV = 0, clock = 0;

  const P = (x, y, z = 0) => project([x, y, z]);

  function poly(c, pts, fill, stroke, lw) {
    c.beginPath();
    pts.forEach((p, i) => { const s = P(p[0], p[1], p[2] || 0); i ? c.lineTo(s[0], s[1]) : c.moveTo(s[0], s[1]); });
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  }

  // ---- sprites de vegetação (desenhados uma vez) ---------------------------
  function spriteFrom(draw) {
    const pts = [];
    const track = (dx, dy, dz) => { const s = project([dx, dy, dz]); pts.push(s); return s; };
    const cvs = { w: 0, h: 0 };
    // primeira passada: só mede
    draw({ measure: true, track, cvs });
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (const p of pts) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); }
    const pad = 6;
    const w = Math.ceil(maxx - minx + pad * 2), h = Math.ceil(maxy - miny + pad * 2);
    const cv = new OffscreenCanvas(w, h);
    const c = cv.getContext('2d');
    const off = { x: -minx + pad, y: -miny + pad };
    draw({ measure: false, c, track: (dx, dy, dz) => { const s = project([dx, dy, dz]); return [s[0] + off.x, s[1] + off.y]; }, off });
    return { cv, baseX: off.x, baseY: off.y };
  }

  function makeTree(seed) {
    const rr = rng(seed);
    const blobs = [];
    for (let i = 0; i < 7; i++) {
      const a = rr() * TAU, r = rr() * 24;
      blobs.push([Math.cos(a) * r, Math.sin(a) * r, 96 + rr() * 38, 20 + rr() * 15]);
    }
    return spriteFrom(o => {
      const t = o.track;
      const trunk = [[-6, 0, 0], [6, 0, 0], [5, 0, 82], [-5, 0, 82]].map(p => t(...p));
      const canopy = blobs.map(b => ({ p: t(b[0], b[1], b[2]), r: b[3] }));
      if (o.measure) return;
      const c = o.c;
      c.beginPath(); trunk.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath();
      c.fillStyle = '#5a3a24'; c.fill(); c.strokeStyle = INK; c.lineWidth = 3; c.stroke();
      for (const b of canopy) {
        c.beginPath(); c.ellipse(b.p[0], b.p[1], b.r, b.r * 0.82, 0, 0, TAU);
        c.fillStyle = '#3f6a30'; c.fill(); c.strokeStyle = '#14261b'; c.lineWidth = 2.4; c.stroke();
      }
      for (const b of canopy) { // realce celular
        c.beginPath(); c.ellipse(b.p[0] - b.r * 0.3, b.p[1] - b.r * 0.32, b.r * 0.62, b.r * 0.5, 0, 0, TAU);
        c.fillStyle = '#4f7f3a'; c.fill();
      }
    });
  }

  function makeBush(seed) {
    const rr = rng(seed);
    const blobs = [];
    for (let i = 0; i < 3; i++) blobs.push([(rr() * 2 - 1) * 14, (rr() * 2 - 1) * 14, 12 + rr() * 16, 12 + rr() * 10]);
    return spriteFrom(o => {
      const t = o.track;
      const canopy = blobs.map(b => ({ p: t(b[0], b[1], b[2]), r: b[3] }));
      if (o.measure) return;
      const c = o.c;
      for (const b of canopy) { c.beginPath(); c.ellipse(b.p[0], b.p[1], b.r, b.r * 0.8, 0, 0, TAU); c.fillStyle = '#37602c'; c.fill(); c.strokeStyle = '#14261b'; c.lineWidth = 2.2; c.stroke(); }
    });
  }

  function makeRock(seed) {
    const rr = rng(seed);
    const pts = [];
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; pts.push([Math.cos(a) * (16 + rr() * 8), Math.sin(a) * (12 + rr() * 6), 10 + Math.sin(a * 2) * 4]); }
    return spriteFrom(o => {
      const t = o.track;
      const ring = pts.map(p => t(p[0], p[1], p[2]));
      const base = pts.map(p => t(p[0], p[1], 0));
      if (o.measure) return;
      const c = o.c;
      c.beginPath(); base.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath();
      c.fillStyle = '#6a6670'; c.fill();
      c.beginPath(); ring.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath();
      c.fillStyle = '#8b8794'; c.fill(); c.strokeStyle = '#1d1820'; c.lineWidth = 2.4; c.stroke();
    });
  }

  function buildProps() {
    const sprites = { tree: [makeTree(11), makeTree(29), makeTree(53)], bush: [makeBush(7), makeBush(19)], rock: [makeRock(3), makeRock(31)] };
    const place = (kind, radius) => {
      const a = rnd() * TAU, r = 120 + rnd() * (ARENA - 150);
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (Math.hypot(x, y) < 150) return;                 // não invade a praça
      const set = sprites[kind];
      const sp = set[(rnd() * set.length) | 0];
      props.push({ x, y, sp, scale: 0.86 + rnd() * 0.3, mirror: rnd() < 0.5, phase: rnd() * TAU, depth: project([x, y, 0])[2], sway: kind === 'rock' ? 0 : 1 });
    };
    for (let i = 0; i < 7; i++) place('tree');
    for (let i = 0; i < 6; i++) place('bush');
    for (let i = 0; i < 6; i++) place('rock');
    props.sort((a, b) => a.depth - b.depth);
  }

  function buildGround() {
    const corners = [[-ARENA, -ARENA], [ARENA, -ARENA], [ARENA, ARENA], [-ARENA, ARENA]];
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (const [x, y] of corners) { const p = P(x, y, 0); minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); }
    const pad = 150;
    const W = Math.ceil(maxx - minx + pad * 2), H = Math.ceil(maxy - miny + pad * 2);
    const cv = new OffscreenCanvas(W, H);
    const c = cv.getContext('2d');
    groundOx = -minx + pad; groundOy = -miny + pad;
    c.translate(groundOx, groundOy);

    c.fillStyle = '#0f1418'; c.fillRect(minx - pad, miny - pad, W, H);                 // vazio
    poly(c, [[-ARENA - 30, -ARENA - 30], [ARENA + 30, -ARENA - 30], [ARENA + 30, ARENA + 30], [-ARENA - 30, ARENA + 30]], '#2a2733', INK, 3); // falésia
    poly(c, corners, '#4d7a39', null);                                                  // grama
    for (let i = 0; i < 260; i++) {                                                     // manchas de grama
      const s = P((rnd() * 2 - 1) * ARENA, (rnd() * 2 - 1) * ARENA, 0);
      c.fillStyle = rnd() < 0.5 ? '#456f34' : '#578743';
      c.beginPath(); c.ellipse(s[0], s[1], 8 + rnd() * 22, 5 + rnd() * 12, 0, 0, TAU); c.fill();
    }
    const s0 = P(0, 0, 0);                                                              // praça de lajotas
    c.fillStyle = '#7a7669'; c.beginPath(); c.ellipse(s0[0], s0[1], 120, 69, 0, 0, TAU); c.fill();
    c.strokeStyle = INK; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = 'rgba(20,16,22,.35)'; c.lineWidth = 1;
    for (let r = 1; r <= 3; r++) { c.beginPath(); c.ellipse(s0[0], s0[1], 120 * r / 3, 69 * r / 3, 0, 0, TAU); c.stroke(); }
    for (let a = 0; a < 8; a++) { const ang = a / 8 * TAU; c.beginPath(); c.moveTo(s0[0], s0[1]); c.lineTo(s0[0] + Math.cos(ang) * 120, s0[1] + Math.sin(ang) * 69); c.stroke(); }
    poly(c, [[-24, -ARENA], [24, -ARENA], [24, -66], [-24, -66]], 'rgba(150,146,132,.75)', null); // trilha
    poly(c, corners, null, INK, 3);

    groundCv = cv;
    buildProps();
  }

  // ---- vento ---------------------------------------------------------------
  function baseWind(t, x, y, phase) { return Math.sin(t * 1.6 + phase + (x + y) * 0.01) * 0.045; }

  function drawProps(ctx, t, heroDepth, front) {
    for (const p of props) {
      if ((p.depth > heroDepth) !== front) continue;
      const g = P(p.x, p.y, 0);
      const s = p.sp, sc = p.scale;
      const ang = s.sway ? baseWind(t, p.x, p.y, p.phase) + p.sway * gust * 0.28 : 0;
      ctx.save();
      ctx.translate(g[0], g[1]);
      ctx.rotate(ang);
      ctx.scale(p.mirror ? -sc : sc, sc);
      ctx.drawImage(s.cv, -s.baseX, -s.baseY);
      ctx.restore();
    }
  }

  const World = {
    ARENA,
    build() { if (!groundCv) buildGround(); },
    ground(ctx) { if (groundCv) ctx.drawImage(groundCv, -groundOx, -groundOy); },
    propsBack(ctx, t, heroDepth) { drawProps(ctx, t, heroDepth, false); },
    propsFront(ctx, t, heroDepth) { drawProps(ctx, t, heroDepth, true); },
    update(dt) { clock += dt; gustV += (-gust * 6 - gustV * 2.2) * dt; gust += gustV * dt; },
    shock(x, y, power = 1) { gustV += 5.5 * power; },
    windAt(t, x, y, phase = 0) { return baseWind(t, x, y, phase) + gust * 0.2; },
    get gust() { return gust; },
    get time() { return clock; },
  };
  return { World };
})());