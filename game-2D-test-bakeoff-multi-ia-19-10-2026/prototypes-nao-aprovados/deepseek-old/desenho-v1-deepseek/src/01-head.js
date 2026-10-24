/* ============================================================================
 * 01-head.js — CABEÇA DO HERÓI (chibi, 3/4 pseudo-2.5D)
 * Origem local (0,0) = articulação do pescoço (pivô do rig).
 * -y = para cima. Rosto ~400 de largura, 290 de altura; juba ~860 de largura.
 * Referência: assets/references/ref-2d-hero/hero-parts/hero-part-head.png
 * Tudo desenhado por geometria + pintura procedural (nenhuma imagem).
 * ========================================================================== */
(function (DS) {
  'use strict';

  /* Espinha de cabelo: pétala curva da base no crânio até a ponta. */
  function spikePath(cx, cy, R, ang, len, wAng, bend, sharp) {
    const a0 = ang - wAng, a1 = ang + wAng;
    const baseL = [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R];
    const baseR = [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R];
    const tipA = ang + (bend || 0);
    const tip = [cx + Math.cos(tipA) * (R + len), cy + Math.sin(tipA) * (R + len)];
    const p = DS.path();
    p.M(baseL[0], baseL[1]);
    const c1r = R + len * (sharp ? 0.42 : 0.58);
    const c1 = [cx + Math.cos(ang - wAng * 0.52) * c1r, cy + Math.sin(ang - wAng * 0.52) * c1r];
    p.Q(c1[0], c1[1], tip[0], tip[1]);
    const c2r = R + len * 0.38;
    const c2 = [cx + Math.cos(ang + wAng * 0.66) * c2r, cy + Math.sin(ang + wAng * 0.66) * c2r];
    p.Q(c2[0], c2[1], baseR[0], baseR[1]);
    p.Z();
    return p;
  }

  function paintSpike(ctx, path, seed, ang, opts) {
    opts = opts || {};
    const rnd = DS.rng(seed);
    const bb = path.bbox();
    const cx = bb[0] + bb[2] / 2, cy = bb[1] + bb[3] / 2;
    const g = ctx.createLinearGradient(cx - Math.cos(ang) * bb[2] * 0.5, cy - Math.sin(ang) * bb[3] * 0.5,
      cx + Math.cos(ang) * bb[2] * 0.6, cy + Math.sin(ang) * bb[3] * 0.6);
    g.addColorStop(0, '#1e1516');
    g.addColorStop(0.42, '#33231f');
    g.addColorStop(0.76, '#5c3a2b');
    g.addColorStop(1, '#7d4d33');
    ctx.save();
    ctx.fillStyle = g;
    ctx.fill(path.build());
    ctx.restore();
    ctx.save();
    ctx.clip(path.build());
    for (let i = 0; i < 24; i++) {
      const px = bb[0] + rnd() * bb[2], py = bb[1] + rnd() * bb[3];
      const L = 14 + rnd() * (bb[2] + bb[3]) * 0.4;
      const a = ang + (rnd() - 0.5) * 0.55;
      ctx.globalAlpha = 0.1 + rnd() * 0.28;
      ctx.strokeStyle = rnd() < 0.42 ? '#a86a44' : (rnd() < 0.6 ? '#171012' : '#c47c4c');
      ctx.lineWidth = 0.7 + rnd() * 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + Math.cos(a) * L * 0.5 + (rnd() - 0.5) * 4,
        py + Math.sin(a) * L * 0.5 + (rnd() - 0.5) * 4,
        px + Math.cos(a) * L, py + Math.sin(a) * L);
      ctx.stroke();
    }
    ctx.restore();
    // luz de borda cobre na lateral superior/esquerda
    ctx.save();
    ctx.globalAlpha = opts.rimAlpha == null ? 0.5 : opts.rimAlpha;
    ctx.strokeStyle = '#c98050';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    const poly = path.flatten(6)[0];
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < Math.max(3, poly.length * 0.55); i++) ctx.lineTo(poly[i][0], poly[i][1]);
    ctx.stroke();
    ctx.restore();
    DS.ink(ctx, path, { color: '#170e10', w: 3.2, seed: seed + 3, jitter: 1.1 });
  }

  /* --------------------------------------------------------------- cabelo */
  // [ângulo°, comprimento, abertura°, curva°]  (0°=direita, -90°=cima)
  const BACK_SPIKES = [
    [-178, 300, 12, 8], [-160, 350, 12, 5], [-142, 330, 11, 2],
    [-125, 300, 10, -2], [-108, 300, 11, -2], [-91, 300, 10, 1],
    [-74, 300, 11, 3], [-58, 330, 11, 4], [-42, 360, 12, 5],
    [-26, 340, 12, 8], [-12, 300, 11, 10],
    [168, 250, 12, -6], [152, 300, 12, -4],
  ];
  const R_HAIR = 250, CY = -250;

  /* Juba: silhueta irregular de espinhos que se sobrepõem (sem buracos). */
  const MANE = [
    [-201, 246], [-192, 452], [-183, 276], [-173, 486], [-161, 300],
    [-151, 512], [-138, 318], [-126, 548], [-113, 330], [-101, 524],
    [-88, 336], [-76, 486], [-63, 326], [-50, 466], [-37, 306],
    [-24, 424], [-12, 276], [0, 356], [10, 246],
    [19, 306], [27, 232],
  ];

  function manaPath() {
    const p = DS.path();
    const R = 252, cy = -250;
    const pt = (i) => {
      const [ad, rr] = MANE[i];
      const a = (ad * Math.PI) / 180;
      return [Math.cos(a) * rr, cy + Math.sin(a) * rr];
    };
    let a0 = pt(0);
    p.M(a0[0], a0[1]);
    for (let i = 1; i < MANE.length; i++) {
      const prev = MANE[i - 1], cur = MANE[i];
      const mid = (prev[0] + cur[0]) / 2;
      const rr = Math.min(prev[1], cur[1]) * 0.66;
      const aa = (mid * Math.PI) / 180;
      p.Q(Math.cos(aa) * rr, cy + Math.sin(aa) * rr, pt(i)[0], pt(i)[1]);
    }
    p.L(pt(0)[0], pt(0)[1] + 40);
    p.Z();
    return p;
  }

  function hairBack(ctx, seed, yaw) {
    const sx = 1 - Math.min(0.42, Math.abs(yaw) * 0.3);
    ctx.save();
    ctx.translate(yaw * 26, 0);
    ctx.scale(sx, 1);
    // 1) juba traseira: uma silhueta espinhosa contínua
    const mane = manaPath();
    const mg = ctx.createLinearGradient(-60, -800, 80, -140);
    mg.addColorStop(0, '#2a1c1a');
    mg.addColorStop(0.42, '#3d2a23');
    mg.addColorStop(0.8, '#57382a');
    mg.addColorStop(1, '#37241f');
    ctx.save(); ctx.fillStyle = mg; ctx.fill(mane.build()); ctx.restore();
    // 2) mechas individuais por dentro da juba (dão a leitura de fios grossos)
    for (let i = 0; i < BACK_SPIKES.length; i++) {
      const [ad, len, wa, bend] = BACK_SPIKES[i];
      const a = (ad * Math.PI) / 180;
      const sp = spikePath(0, CY, R_HAIR * 0.78, a, len * 0.9, (wa * Math.PI) / 180, (bend * Math.PI) / 180, i % 2 === 0);
      paintSpike(ctx, sp, seed + i * 17, a, { rimAlpha: 0.3 });
    }
    DS.fibers(ctx, mane, {
      seed: seed + 91, count: 240, len: [20, 110], spread: 1.4, dir: -1.75, flow: 0.6,
      cols: ['#c98050', '#1b1113', '#6b4231', '#3b2621', '#d99a66'],
      alpha: [0.07, 0.3], w: [0.6, 2.8], box: [-560, -800, 1120, 700],
    });
    DS.ink(ctx, mane, { color: '#170e10', w: 3.8, seed: seed + 33, jitter: 1.7, alpha: 0.95 });
    // 3) cap do crânio (fecha a ligação juba -> testa)
    const cap = DS.path();
    cap.M(-262, -300);
    cap.C(-272, -352, -206, -430, -58, -452);
    cap.C(84, -470, 222, -408, 258, -318);
    cap.C(268, -292, 262, -282, 250, -268);
    cap.C(214, -312, 150, -336, 40, -344);
    cap.C(-80, -352, -190, -330, -232, -282);
    cap.C(-250, -282, -260, -292, -262, -300);
    cap.Z();
    const cg = ctx.createLinearGradient(0, -470, 0, -250);
    cg.addColorStop(0, '#4a2f24');
    cg.addColorStop(0.45, '#33221e');
    cg.addColorStop(1, '#211618');
    ctx.save(); ctx.fillStyle = cg; ctx.fill(cap.build()); ctx.restore();
    DS.fibers(ctx, cap, {
      seed: seed + 95, count: 150, len: [16, 90], spread: 1.5, dir: -1.9, flow: 0.7,
      cols: ['#c98050', '#1b1113', '#6b4231', '#3b2621', '#d99a66'],
      alpha: [0.08, 0.34], w: [0.6, 2.4], box: [-290, -470, 560, 240],
    });
    DS.ink(ctx, cap, { color: '#170e10', w: 3.4, seed: seed + 37, jitter: 1.4, alpha: 0.85 });
    ctx.restore();
  }

  /* Franja: uma massa única de mechas com pontas afiadas sobre a testa. */
  const FRINGE_PATH = 'M -272 -250 C -300 -380 -180 -470 -40 -478 C 120 -486 258 -410 276 -300 ' +
    'C 272 -278 258 -256 236 -240 L 200 -274 L 182 -178 L 146 -280 L 106 -164 L 62 -284 ' +
    'L 16 -188 L -30 -288 L -76 -202 L -124 -292 L -172 -222 L -218 -296 L -254 -200 Z';

  function hairFringe(ctx, seed, yaw) {
    ctx.save();
    ctx.translate(yaw * 22, 0);
    ctx.scale(1 - Math.min(0.4, Math.abs(yaw) * 0.28), 1);
    // sombra projetada da franja na testa
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.filter = 'blur(7px)';
    ctx.fillStyle = '#7a3a24';
    const sh = DS.pc(FRINGE_PATH).transformed((x, y) => [x * 0.98, y + 16]);
    ctx.fill(sh.build());
    ctx.restore();

    const p = DS.pc(FRINGE_PATH);
    const bb = p.bbox();
    const g = ctx.createLinearGradient(-40, -470, 60, -190);
    g.addColorStop(0, '#59382a');
    g.addColorStop(0.38, '#33221f');
    g.addColorStop(1, '#1a1113');
    ctx.save(); ctx.fillStyle = g; ctx.fill(p.build()); ctx.restore();
    ctx.save();
    ctx.clip(p.build());
    for (let k = 0; k < 74; k++) {
      const t = k / 74;
      const px = bb[0] + DS.noise1(k * 0.9, seed) * bb[2];
      const py = bb[1] + 3;
      const L = (bb[3] + 20) * (0.55 + 0.45 * DS.noise1(k * 1.7, seed + 4));
      const lean = (px / bb[2] - 0.42) * 70;
      ctx.globalAlpha = 0.12 + 0.26 * DS.noise1(k * 0.5, seed + 3);
      ctx.strokeStyle = k % 3 === 0 ? '#b07044' : (k % 3 === 1 ? '#120c0e' : '#6b4231');
      ctx.lineWidth = 0.7 + 1.8 * DS.noise1(k * 0.7, seed);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + lean * 0.4, py + L * 0.55, px + lean, py + L);
      ctx.stroke();
    }
    ctx.restore();
    // brilho de cobre nas bordas voltadas para a luz
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = '#d18b56';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    const poly = p.flatten(7)[0];
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    for (let k = 1; k < Math.max(4, poly.length * 0.46); k++) ctx.lineTo(poly[k][0], poly[k][1]);
    ctx.stroke();
    ctx.restore();
    DS.ink(ctx, p, { color: '#150d0f', w: 3.0, seed: seed + 5, jitter: 1.0 });
    ctx.restore();
  }

  /* ------------------------------------------------------------------ olhos */
  // Olho em espaço local do olho: +x para fora do rosto.
  function eyePath(open) {
    const o = open == null ? 1 : open;
    const p = DS.path();
    p.M(-66, 4);
    p.C(-40, -30 * o, 12, -36 * o, 58, -22 * o);
    p.C(70, -18 * o, 74, -10, 70, -6);
    p.C(40, 16, -20, 20, -66, 4);
    p.Z();
    return p;
  }

  function paintEye(ctx, s, seed, open) {
    ctx.save();
    ctx.translate(108 * s, -197);
    ctx.scale(s, 1); // +x = lado externo do rosto
    const ep = eyePath(open);
    // esclera
    ctx.save(); ctx.fillStyle = '#f8ece4'; ctx.fill(ep.build()); ctx.restore();
    ctx.save();
    ctx.clip(ep.build());
    // sombra da pálpebra
    const g = ctx.createLinearGradient(0, -40, 0, 22);
    g.addColorStop(0, 'rgba(96,26,24,0.75)');
    g.addColorStop(0.5, 'rgba(130,44,32,0.06)');
    g.addColorStop(1, 'rgba(130,44,32,0.22)');
    ctx.fillStyle = g; ctx.fill(ep.build());
    // íris
    const ix = 8, iy = -2, rx = 31, ry = 37;
    const gi = ctx.createRadialGradient(ix - 7, iy - 9, 2, ix, iy, ry);
    gi.addColorStop(0, '#ff7a52');
    gi.addColorStop(0.3, '#e3221a');
    gi.addColorStop(0.66, '#a80609');
    gi.addColorStop(1, '#4a0004');
    ctx.beginPath(); ctx.ellipse(ix, iy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = gi; ctx.fill();
    ctx.strokeStyle = '#380003'; ctx.lineWidth = 3; ctx.stroke();
    // pupila
    ctx.beginPath(); ctx.ellipse(ix, iy + 2, 11, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#220008'; ctx.fill();
    // brilhos
    ctx.save();
    ctx.globalAlpha = 0.92; ctx.fillStyle = '#fff6e8';
    ctx.beginPath(); ctx.ellipse(ix - 10, iy - 13, 7, 8.5, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.ellipse(ix + 11, iy + 12, 4.5, 3, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore(); // fim clip

    // pálpebra superior grossa e angular (massa preta)
    const lid = DS.path();
    lid.M(-70, 6);
    lid.C(-40, -34 * open, 14, -44 * open, 62, -26 * open);
    lid.C(72, -22 * open, 78, -10, 74, -4);
    lid.C(52, -24 * open, 4, -26 * open, -70, 6);
    lid.Z();
    ctx.save(); ctx.fillStyle = '#1a0f11'; ctx.fill(lid.build()); ctx.restore();
    // cílio externo pontudo
    const lash = DS.path();
    lash.M(48, -22); lash.C(62, -30, 72, -38, 78, -46);
    lash.C(66, -30, 60, -20, 56, -14); lash.Z();
    ctx.save(); ctx.fillStyle = '#1a0f11'; ctx.fill(lash.build()); ctx.restore();
    // linha inferior
    ctx.save();
    ctx.globalAlpha = 0.5; ctx.strokeStyle = '#5d2a24'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-58, 6); ctx.quadraticCurveTo(6, 24 * open, 58, 0); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function paintBrow(ctx, s, seed) {
    ctx.save();
    ctx.translate(108 * s, -197);
    ctx.scale(s, 1);
    const p = DS.path();
    p.M(-62, -34);                       // ponta interna (baixa = bravo)
    p.C(-20, -64, 40, -76, 82, -70);     // borda superior
    p.C(56, -60, 0, -50, -52, -26);      // borda inferior
    p.Z();
    ctx.save(); ctx.fillStyle = '#160f10'; ctx.fill(p.build()); ctx.restore();
    ctx.save();
    ctx.clip(p.build());
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      ctx.globalAlpha = 0.16 + 0.26 * ((i * 7) % 5) / 5;
      ctx.strokeStyle = i % 3 ? '#3b2621' : '#6b4231';
      ctx.lineWidth = 0.8 + (i % 4) * 0.4;
      ctx.beginPath();
      ctx.moveTo(-50 + t * 120, -34 - t * 28);
      ctx.lineTo(-44 + t * 120, -70 - t * 6);
      ctx.stroke();
    }
    ctx.restore();
    DS.ink(ctx, p, { color: '#120c0e', w: 2.4, seed: seed + 2, jitter: 0.8, alpha: 0.6 });
    ctx.restore();
  }

  /* ------------------------------------------------------------------ orelha */
  function paintEar(ctx, side, yaw) {
    const s = side;
    const hidden = side > 0 ? yaw < -0.62 : yaw > 0.62;
    if (hidden) return;
    const p = DS.path();
    p.M(-196 * s, -186);
    p.C(-238 * s, -202, -262 * s, -154, -252 * s, -118);
    p.C(-246 * s, -92, -222 * s, -80, -204 * s, -92);
    p.C(-186 * s, -108, -186 * s, -158, -196 * s, -186);
    p.Z();
    DS.wash(ctx, p, {
      kind: 'skin', base: '#e89962', shadow: '#bd6b44', deep: '#a3553a', seed: 610 + side,
      box: [-270, -215, 90, 140], inkW: 2.6, shadeAlpha: 0.5, blur: 5,
      masses: [
        [DS.path().M(-228 * s, -166).C(-246 * s, -168, -250 * s, -130, -240 * s, -108)
          .C(-228 * s, -118, -226 * s, -142, -228 * s, -166).Z(), '#8f4a33', 0.5, 4],
        [DS.path().M(-232 * s, -158).C(-240 * s, -140, -238 * s, -118, -232 * s, -106)
          .C(-228 * s, -120, -228 * s, -138, -232 * s, -158).Z(), '#5d2a24', 0.42, 3],
      ],
    });
    DS.ink(ctx, p, { color: '#3a1b16', w: 2.2, seed: 613 + side, jitter: 0.8, alpha: 0.6 });
  }

  /* ------------------------------------------------------------------ rosto */
  function facePath() {
    const p = DS.path();
    p.M(-196, -300);
    p.C(-218, -232, -216, -150, -186, -84);
    p.C(-156, -24, -92, 2, 0, 4);
    p.C(92, 2, 156, -24, 186, -84);
    p.C(216, -150, 218, -232, 196, -300);
    p.C(140, -344, -140, -344, -196, -300);
    p.Z();
    return p;
  }

  function paintFace(ctx, seed, yaw) {
    const sx = Math.cos(DS.clamp(yaw, -1, 1) * 1.15);
    ctx.save();
    ctx.translate(-yaw * 18, 0);
    ctx.scale(Math.max(0.42, sx), 1);
    const face = facePath();
    DS.wash(ctx, face, {
      kind: 'skin', base: '#f2ab72', shadow: '#d1774b', deep: '#b45f3e', seed: seed + 5,
      box: [-230, -350, 460, 360], inkW: 3.4, shadeAlpha: 0.42, blur: 12,
      hatch: { hatch: 60, len: [4, 22], w: [0.5, 1.8], dir: -0.4, cols: ['#ffd2a0', '#c9714a', '#ffc68d', '#a3553a'], alpha: [0.04, 0.2] },
      masses: [
        [DS.pc('M 120 -330 C 192 -260 206 -160 168 -70 C 150 -40 120 -14 90 0 C 150 -40 178 -150 168 -248 C 162 -298 144 -326 120 -330 Z'), '#c9714a', 0.35, 12],
        [DS.pc('M -196 -300 C -120 -320 120 -320 196 -300 C 150 -262 -150 -262 -196 -300 Z'), '#b45f3e', 0.4, 10],
        [DS.pc('M -172 -182 C -152 -122 -120 -72 -70 -40 C -120 -52 -162 -102 -178 -162 Z'), '#ffcf9a', 0.26, 10],
      ],
    });
    ctx.save();
    ctx.clip(face.build());
    for (const s of [-1, 1]) {
      const g = ctx.createRadialGradient(100 * s - 24, -128, 4, 100 * s, -128, 96);
      g.addColorStop(0, 'rgba(212,96,72,0.2)');
      g.addColorStop(1, 'rgba(212,96,72,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(100 * s, -128, 98, 0, Math.PI * 2); ctx.fill();
    }
    // sombra do maxilar e do pescoço
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#a3553a';
    ctx.beginPath(); ctx.ellipse(0, -8, 120, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  function paintNose(ctx, seed) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#c06f45';
    ctx.beginPath();
    ctx.moveTo(-3, -148);
    ctx.quadraticCurveTo(4, -146, 5, -136);
    ctx.quadraticCurveTo(-3, -139, -7, -144);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = '#ffd9a8';
    ctx.beginPath(); ctx.ellipse(-1, -152, 5.2, 2.4, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function paintMouth(ctx, seed) {
    ctx.save();
    ctx.strokeStyle = '#5d2a24';
    ctx.globalAlpha = 0.88;
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-24, -96);
    ctx.quadraticCurveTo(0, -91, 24, -96);
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#8f4a33';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-17, -87);
    ctx.quadraticCurveTo(0, -83, 17, -87);
    ctx.stroke();
    ctx.restore();
  }

  function paintScar(ctx, seed) {
    ctx.save();
    ctx.strokeStyle = '#b4633f';
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(150, -158); ctx.lineTo(168, -136); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(166, -160); ctx.lineTo(150, -134); ctx.stroke();
    ctx.restore();
  }

  /* ----------------------------------------------------------- API principal */
  DS.drawHead = function (ctx, opts) {
    opts = opts || {};
    const yaw = DS.clamp(opts.yaw || 0, -1, 1);
    const back = Math.abs(yaw) > 0.86;
    const seed = 700;
    const blink = opts.blink || 0;
    const open = 1 - blink * 0.92;

    ctx.save();
    // pescoço
    ctx.save();
    ctx.fillStyle = '#dd8b58';
    ctx.beginPath();
    ctx.moveTo(-50, 40); ctx.lineTo(-42, -28);
    ctx.lineTo(42, -28); ctx.lineTo(50, 40);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    hairBack(ctx, seed, yaw);

    if (!back) {
      paintEar(ctx, -1, yaw);
      paintEar(ctx, 1, yaw);
      paintFace(ctx, seed, yaw);
      ctx.save();
      ctx.translate(-yaw * 18, 0);
      ctx.scale(Math.max(0.42, Math.cos(DS.clamp(yaw, -1, 1) * 1.15)), 1);
      const visL = !(yaw > 0.64), visR = !(yaw < -0.64);
      if (visL) paintEye(ctx, -1, seed + 11, open);
      if (visR) paintEye(ctx, 1, seed + 23, open);
      if (visL) paintBrow(ctx, -1, seed + 31);
      if (visR) paintBrow(ctx, 1, seed + 37);
      paintNose(ctx, seed);
      paintMouth(ctx, seed);
      paintScar(ctx, seed);
      ctx.restore();
    } else {
      const skull = DS.path();
      skull.M(-196, -300);
      skull.C(-218, -232, -212, -140, -180, -70);
      skull.C(-130, 10, -60, 6, 0, 6);
      skull.C(60, 6, 130, 10, 180, -70);
      skull.C(212, -140, 218, -232, 196, -300);
      skull.C(140, -344, -140, -344, -196, -300);
      skull.Z();
      ctx.save(); ctx.fillStyle = '#2a1c1a'; ctx.fill(skull.build()); ctx.restore();
      DS.fibers(ctx, skull, {
        seed: seed + 61, count: 150, len: [14, 80], spread: 1.4, dir: 1.4,
        cols: ['#5c3a2b', '#1a1113', '#7a4a31'], alpha: [0.08, 0.34], w: [0.7, 2.4],
        box: [-220, -350, 440, 370],
      });
      DS.ink(ctx, skull, { color: '#150d0f', w: 3.2, seed: seed + 67, jitter: 1.4 });
    }

    hairFringe(ctx, seed, yaw);
    ctx.restore();
  };

  DS.headMetrics = { faceW: 400, faceH: 300, hairW: 860, hairH: 700 };
})(window.DS);
