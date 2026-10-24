/* ============================================================================
 * 02-body.js — TRONCO DO HERÓI (adaga gêmea do rig)
 * Origem local (0,0) = PELVE. -y = para cima.
 * Medidas tiradas de hero-idle-s.png (1254 de altura):
 *   ombros y=-210 (±175), peito -150, cintura -40 (±104), quadril -6 (±140),
 *   pescoço -250, virilha +22, sola do pé +334.
 * Tudo procedural: peito, abdômen, lenço vermelho, cinto, fivela-caveira,
 * tanga rasgada e tiras de couro/peles.
 * ========================================================================== */
(function (DS) {
  'use strict';

  const B = DS.BODY = {
    PELVIS: 0,
    SHOULDER_Y: -210, SHOULDER_X: 175,
    NECK_Y: -250,
    HIP_Y: -8, HIP_X: 68,
    HEAD_Y: -250,
  };

  function torsoPath() {
    const p = DS.path();
    p.M(-58, -252);
    p.C(-112, -246, -152, -232, -172, -210);   // trapézio
    p.C(-194, -194, -196, -170, -190, -140);   // ombro/deltoide
    p.C(-180, -100, -168, -68, -150, -38);     // dorsal → cintura
    p.C(-142, -20, -146, -2, -142, 12);        // quadril
    p.C(-116, 30, -66, 38, 0, 38);             // virilha
    p.C(66, 38, 116, 30, 142, 12);
    p.C(146, -2, 142, -20, 150, -38);
    p.C(168, -68, 180, -100, 190, -140);
    p.C(196, -170, 194, -194, 172, -210);
    p.C(152, -232, 112, -246, 58, -252);
    p.Z();
    return p;
  }

  function paintTorso(ctx, seed) {
    const t = torsoPath();
    DS.wash(ctx, t, {
      kind: 'skin', base: '#f0a46c', shadow: '#c9714a', deep: '#a3553a', seed: seed + 3,
      box: [-210, -270, 420, 330], inkW: 4.2, shadeAlpha: 0.46, blur: 16,
      hatch: { hatch: 90, len: [5, 26], w: [0.5, 2.1], dir: -0.5, cols: ['#ffd2a0', '#c9714a', '#ffc68d', '#a3553a'], alpha: [0.04, 0.22] },
      masses: [
        // sombra do lado direito (luz pela esquerda)
        [DS.pc('M 90 -250 C 168 -220 196 -150 176 -60 C 168 -26 150 4 128 24 C 168 -20 186 -120 168 -200 C 160 -230 130 -244 90 -250 Z'), '#b45f3e', 0.34, 14],
        // sombra sob o peitoral
        [DS.pc('M -150 -128 C -100 -104 -40 -100 0 -108 C 40 -100 100 -104 150 -128 C 110 -92 40 -84 0 -88 C -40 -84 -110 -92 -150 -128 Z'), '#a3553a', 0.32, 10],
        // luz no peitoral esquerdo
        [DS.pc('M -160 -206 C -120 -190 -60 -184 -10 -192 C -60 -168 -130 -172 -166 -188 Z'), '#ffcf9a', 0.3, 10],
      ],
    });
    // peitorais
    for (const s of [-1, 1]) {
      const pec = DS.path();
      pec.M(6 * s, -178);
      pec.C(50 * s, -196, 116 * s, -192, 146 * s, -166);
      pec.C(132 * s, -132, 70 * s, -118, 16 * s, -132);
      pec.C(4 * s, -146, 0, -164, 6 * s, -178);
      pec.Z();
      DS.wash(ctx, pec, {
        kind: 'skin', base: '#f6b078', shadow: '#c9714a', seed: seed + 11 + s,
        box: [-160, -210, 320, 110], inkW: 2.2, shadeAlpha: 0.35, blur: 7,
        ink: true, inkColor: 'rgba(150,80,52,0.5)',
        masses: [[DS.pc('M ' + (10 * s) + ' -160 C ' + (60 * s) + ' -150 ' + (110 * s) + ' -156 ' + (140 * s) + ' -168 C ' + (110 * s) + ' -140 ' + (50 * s) + ' -140 ' + (10 * s) + ' -160 Z'), '#d98a5c', 0.4, 5]],
      });
    }
    // abdômen (três pares) + linha central
    for (let i = 0; i < 3; i++) {
      const y = -96 + i * 34;
      for (const s of [-1, 1]) {
        const ab = DS.path();
        ab.M(10 * s, y);
        ab.C(30 * s, y - 10, 54 * s, y - 8, 62 * s, y + 4);
        ab.C(52 * s, y + 20, 26 * s, y + 22, 10 * s, y + 12);
        ab.Z();
        DS.save = null;
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = '#8f4a33';
        ctx.fill(ab.build());
        ctx.restore();
      }
    }
    DS.strokes(ctx, ['M -6 -172 C -10 -130 -8 -90 -2 -40', 'M 4 -172 C 8 -130 8 -90 2 -40'], '#b45f3e', 1.6, 0.28);
    DS.strokes(ctx, ['M -118 -222 Q 0 -240 118 -222'], '#ffcf9a', 2.0, 0.3);
    // cicatrizes de batalha no peito
    DS.strokes(ctx, ['M -96 -150 L -52 -132', 'M 74 -196 L 112 -176', 'M 42 -96 L 76 -82'], '#a3553a', 1.8, 0.4);
  }

  /* --------------------------------------------------------------- lenço */
  function paintScarf(ctx, seed, yaw) {
    const wind = Math.sin((optsTime || 0) * 1.4) * 0.0;
    // gola enrolada no pescoço
    const col = DS.path();
    col.M(-104, -262);
    col.C(-60, -278, 60, -278, 104, -262);
    col.C(112, -236, 96, -214, 66, -208);
    col.C(20, -200, -22, -200, -68, -208);
    col.C(-98, -216, -112, -238, -104, -262);
    col.Z();
    DS.wash(ctx, col, {
      kind: 'cloth', base: '#b3151b', shadow: '#54060f', deep: '#3d040a', seed: seed + 21,
      box: [-130, -290, 260, 100], inkW: 4.0, shadeAlpha: 0.55, blur: 9,
      hatch: { hatch: 90, len: [4, 22], w: [0.6, 2.4], dir: -0.2, cols: ['#ff6a45', '#54060f', '#e33025', '#8d0f16'], alpha: [0.06, 0.34] },
      masses: [
        [DS.pc('M -100 -256 C -60 -270 40 -270 100 -256 C 60 -242 -60 -242 -100 -256 Z'), '#e33025', 0.4, 6],
        [DS.pc('M -96 -224 C -40 -212 40 -212 96 -226 C 60 -204 -50 -204 -96 -224 Z'), '#54060f', 0.45, 6],
      ],
    });
    // ponta do lenço caindo pelas costas/direita
    const tail = DS.path();
    tail.M(84, -246);
    tail.C(150, -238, 196, -204, 210, -150);
    tail.C(186, -128, 158, -136, 138, -160);
    tail.C(122, -186, 104, -214, 84, -226);
    tail.Z();
    DS.wash(ctx, tail, {
      kind: 'cloth', base: '#9c1017', shadow: '#4a050d', deep: '#32030a', seed: seed + 27,
      box: [70, -260, 170, 150], inkW: 3.6, shadeAlpha: 0.5, blur: 8,
      hatch: { hatch: 54, len: [5, 26], w: [0.6, 2.2], dir: -0.5, cols: ['#ff6a45', '#4a050d', '#e33025'], alpha: [0.06, 0.3] },
    });
    // segunda ponta curta à esquerda (atrás do braço)
    const tail2 = DS.path();
    tail2.M(-88, -244);
    tail2.C(-136, -234, -166, -204, -176, -166);
    tail2.C(-154, -156, -136, -170, -124, -192);
    tail2.C(-112, -214, -98, -230, -88, -236);
    tail2.Z();
    DS.wash(ctx, tail2, {
      kind: 'cloth', base: '#8d0f16', shadow: '#47040c', seed: seed + 31,
      box: [-190, -260, 120, 110], inkW: 3.2, shadeAlpha: 0.5, blur: 7,
    });
  }

  /* ------------------------------------------------------ cinto + fivela */
  function paintBelt(ctx, seed) {
    // tira principal
    const belt = DS.path();
    belt.M(-170, -22);
    belt.C(-90, -36, 90, -36, 170, -22);
    belt.C(174, -2, 172, 12, 166, 22);
    belt.C(86, 36, -86, 36, -166, 22);
    belt.C(-172, 12, -174, -2, -170, -22);
    belt.Z();
    DS.wash(ctx, belt, {
      kind: 'leather', base: '#4a3226', shadow: '#1b1215', deep: '#140d10', seed: seed + 41,
      box: [-190, -44, 380, 88], inkW: 3.8, shadeAlpha: 0.55, blur: 7,
      hatch: { hatch: 70, len: [3, 16], w: [0.5, 2], dir: -0.3, cols: ['#9c6a48', '#241719', '#c08a5c'], alpha: [0.05, 0.3] },
      masses: [[DS.pc('M -168 -16 C -90 -28 90 -28 168 -16 C 90 -8 -90 -8 -168 -16 Z'), '#6d4632', 0.4, 4]],
    });
    // fivela: caveira de osso
    const skull = DS.path();
    skull.M(0, -46);
    skull.C(34, -46, 54, -26, 50, -2);
    skull.C(48, 14, 36, 22, 30, 26);
    skull.L(24, 44); skull.L(12, 34); skull.L(2, 44); skull.L(-8, 32);
    skull.L(-16, 42); skull.L(-24, 26);
    skull.C(-36, 20, -48, 12, -50, -2);
    skull.C(-52, -26, -32, -46, 0, -46);
    skull.Z();
    DS.wash(ctx, skull, {
      kind: 'bone', base: '#e7d6b7', shadow: '#b18f6a', deep: '#8a6f57', seed: seed + 43,
      box: [-60, -56, 120, 110], inkW: 3.4, shadeAlpha: 0.5, blur: 5,
      masses: [
        [DS.pc('M -30 -20 C -18 -30 -2 -30 8 -22 C -2 -8 -18 -8 -30 -20 Z'), '#3a2b25', 0.9, 3],
        [DS.pc('M 16 -22 C 26 -30 40 -28 46 -18 C 36 -8 22 -10 16 -22 Z'), '#3a2b25', 0.9, 3],
        [DS.pc('M -4 4 L 4 4 L 2 16 L -2 16 Z'), '#3a2b25', 0.85, 2],
      ],
    });
    DS.strokes(ctx, ['M -12 26 L 12 26', 'M -8 32 L 8 32'], '#6d5a45', 1.6, 0.7);
  }

  /* ------------------------------------------------------- tanga rasgada */
  function paintLoincloth(ctx, seed, t) {
    const sway = Math.sin((t || 0) * 2.2) * 4;
    // base de couro escuro
    const base = DS.path();
    base.M(-162, 10);
    base.C(-100, 22, 100, 22, 162, 10);
    base.C(158, 60, 152, 94, 146, 120 + sway);
    base.L(110, 98); base.L(88, 128 - sway); base.L(56, 92);
    base.L(30, 122); base.L(-6, 88); base.L(-34, 120 + sway);
    base.L(-64, 86); base.L(-92, 118); base.L(-116, 90); base.L(-140, 116);
    base.C(-154, 90, -162, 36, -162, 10);
    base.Z();
    DS.wash(ctx, base, {
      kind: 'leather', base: '#3f2a22', shadow: '#171012', deep: '#100b0d', seed: seed + 51,
      box: [-180, 0, 360, 110], inkW: 4.0, shadeAlpha: 0.55, blur: 8,
      hatch: { hatch: 80, len: [4, 20], w: [0.5, 2.2], dir: 1.3, cols: ['#9c6a48', '#1b1215', '#6d4632'], alpha: [0.05, 0.28] },
    });
    // pano vermelho rasgado por cima
    const cloth = DS.path();
    cloth.M(-120, 14);
    cloth.C(-70, 26, 70, 26, 120, 14);
    cloth.C(116, 40, 112, 62, 106, 86);
    cloth.L(78, 68); cloth.L(52, 96); cloth.L(24, 62);
    cloth.L(-8, 92); cloth.L(-36, 60); cloth.L(-64, 92); cloth.L(-92, 60); cloth.L(-110, 82);
    cloth.C(-116, 62, -122, 34, -120, 14);
    cloth.Z();
    DS.wash(ctx, cloth, {
      kind: 'cloth', base: '#a51219', shadow: '#4a050d', deep: '#32030a', seed: seed + 53,
      box: [-140, 0, 280, 130], inkW: 3.4, shadeAlpha: 0.5, blur: 7,
      hatch: { hatch: 70, len: [4, 20], w: [0.5, 2.2], dir: 1.4, cols: ['#ff6a45', '#4a050d', '#e33025'], alpha: [0.06, 0.3] },
    });
    // tiras de couro penduradas + argolas
    for (let i = 0; i < 5; i++) {
      const x = -130 + i * 65;
      ctx.save();
      ctx.strokeStyle = i % 2 ? '#2a1a19' : '#6d4632';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.quadraticCurveTo(x + 6, 84, x + 2, 124 + (i % 3) * 10);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(200,150,100,0.35)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - 2, 32);
      ctx.quadraticCurveTo(x + 3, 84, x - 1, 120);
      ctx.stroke();
      ctx.restore();
    }
    DS.drawChain(ctx, DS.chainPath(-130, 30, 130, 60, 16), { pitch: 30, scale: 0.66, lw: 2.6 });
  }

  /* --------------------------------------------------------------- API */
  let optsTime = 0;
  DS.drawBody = function (ctx, opts) {
    opts = opts || {};
    optsTime = opts.t || 0;
    const yaw = DS.clamp(opts.yaw || 0, -1, 1);
    const seed = 900;
    ctx.save();
    ctx.scale(1 - Math.min(0.3, Math.abs(yaw) * 0.22), 1);
    ctx.translate(-yaw * 20, 0);
    paintTorso(ctx, seed);
    paintLoincloth(ctx, seed, opts.t || 0);
    paintBelt(ctx, seed);
    paintScarf(ctx, seed, yaw);
    ctx.restore();
  };
})(window.DS);
