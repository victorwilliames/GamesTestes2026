/* ============================================================================
 * 03-limbs.js — BRAÇOS E PERNAS (divididos nas articulações para o rig)
 * Convenção: origem na articulação proximal, +x ao longo do osso.
 *   BRAÇO: ombro -> cotovelo (96) -> punho (192). A mão é desenhada pelo
 *          pintor da arma (mesmo ponto de empunhadura do rig).
 *   PERNA: quadril -> joelho (132) -> tornozelo (236) -> bota. O pé aponta -y.
 * ========================================================================== */
(function (DS) {
  'use strict';

  /* --------------------------------------------------------- braço: úmero */
  DS.drawUpperArm = function (ctx, side) {
    const seed = 1100 + (side < 0 ? 3 : 0);
    ctx.save();
    const arm = DS.path();
    arm.M(-8, -34);
    arm.C(24, -42, 58, -40, 84, -32);
    arm.C(98, -26, 104, -14, 102, 0);
    arm.C(104, 14, 98, 26, 84, 32);
    arm.C(58, 40, 24, 42, -8, 34);
    arm.C(-24, 20, -24, -20, -8, -34);
    arm.Z();
    DS.wash(ctx, arm, {
      kind: 'skin', base: '#f2a469', shadow: '#c9714a', deep: '#a3553a', seed: seed + 3,
      box: [-28, -50, 140, 100], inkW: 3.6, shadeAlpha: 0.44, blur: 10,
      hatch: { hatch: 44, len: [4, 22], w: [0.5, 1.9], dir: -0.3, cols: ['#ffd2a0', '#c9714a', '#ffc68d', '#a3553a'], alpha: [0.04, 0.22] },
      masses: [
        [DS.pc('M -4 -32 C 26 -42 62 -40 88 -30 C 70 -16 24 -12 -4 -20 Z'), '#ffcf9a', 0.3, 8],
        [DS.pc('M 6 20 C 34 30 66 28 88 22 C 60 36 26 36 6 28 Z'), '#a3553a', 0.35, 6],
        [DS.pc('M 2 -6 C 18 -14 44 -14 60 -6 C 40 2 18 2 2 -6 Z'), '#d98a5c', 0.28, 5],
      ],
    });
    // banda de couro no bíceps
    const band = DS.path();
    band.M(50, -36);
    band.C(64, -36, 74, -30, 76, -20);
    band.C(68, -6, 68, 8, 76, 20);
    band.C(74, 30, 64, 36, 50, 35);
    band.C(58, 22, 58, -22, 50, -36);
    band.Z();
    DS.wash(ctx, band, {
      kind: 'leather', base: '#4a3226', shadow: '#1b1215', seed: seed + 17,
      box: [44, -42, 42, 84], inkW: 3.0, shadeAlpha: 0.5, blur: 4,
      hatch: { hatch: 20, len: [2, 10], w: [0.4, 1.4], dir: 1.5, cols: ['#9c6a48', '#241719'], alpha: [0.06, 0.28] },
    });
    ctx.restore();
  };

  /* -------------------------------------------------- braço: antebraço+punho */
  DS.drawForearm = function (ctx, side) {
    const seed = 1100 + (side < 0 ? 3 : 0);
    ctx.save();
    // voltas de corrente atrás
    ctx.save();
    ctx.translate(192, 0); ctx.scale(-1, 1);
    DS.drawForearmCoils(ctx, 'back', { len: 96, thick: 26, loops: 3 });
    ctx.restore();
    const fore = DS.path();
    fore.M(-8, -30);
    fore.C(20, -36, 52, -32, 76, -22);
    fore.C(90, -16, 96, -6, 96, 0);
    fore.C(96, 6, 90, 16, 76, 22);
    fore.C(52, 32, 20, 36, -8, 30);
    fore.C(-16, 16, -16, -16, -8, -30);
    fore.Z();
    DS.wash(ctx, fore, {
      kind: 'skin', base: '#e89a63', shadow: '#b45f3e', deep: '#8f4a33', seed: seed + 9,
      box: [-24, -44, 132, 88], inkW: 3.2, shadeAlpha: 0.45, blur: 8,
      hatch: { hatch: 26, len: [4, 20], w: [0.5, 1.8], dir: -0.2, cols: ['#ffd2a0', '#c9714a', '#a3553a'], alpha: [0.04, 0.22] },
    });
    // faixas de couro no antebraço
    const wrap = DS.path();
    wrap.M(6, -32);
    wrap.C(42, -38, 70, -30, 90, -16);
    wrap.C(94, -8, 94, 8, 90, 16);
    wrap.C(70, 30, 42, 38, 6, 32);
    wrap.C(16, 14, 16, -14, 6, -32);
    wrap.Z();
    DS.wash(ctx, wrap, {
      kind: 'leather', base: '#5a3c2c', shadow: '#1e1416', deep: '#181012', seed: seed + 19,
      box: [0, -44, 100, 88], inkW: 3.2, shadeAlpha: 0.5, blur: 6,
      hatch: { hatch: 50, len: [2, 12], w: [0.4, 1.6], dir: 1.55, cols: ['#9c6a48', '#241719', '#c08a5c'], alpha: [0.06, 0.3] },
    });
    ctx.save();
    ctx.clip(wrap.build());
    for (let i = 0; i < 5; i++) {
      const x = 12 + i * 16;
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = i % 2 ? '#2a1a19' : '#7a5335';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(x, -42); ctx.lineTo(x + 10, 42); ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#d0a070';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x + 2, -36); ctx.lineTo(x + 11, 36); ctx.stroke();
    }
    ctx.restore();
    DS.ink(ctx, wrap, { color: '#180f12', w: 3.0, seed: seed + 23, jitter: 1.0 });
    // correntes na frente
    ctx.save();
    ctx.translate(192, 0); ctx.scale(-1, 1);
    DS.drawForearmCoils(ctx, 'front', { len: 96, thick: 26, loops: 3 });
    ctx.restore();
    ctx.restore();
  };

  /* -------------------------------------------------------- perna: coxa */
  DS.drawThigh = function (ctx, side) {
    const seed = 1200 + (side < 0 ? 5 : 0);
    ctx.save();
    /* Arte autoral: osso vai de x=0 (quadril) a x=180 (joelho); a coxa é
     * grossa (~170 de largura) para o chibi ficar como a referência. */
    const thigh = DS.path();
    thigh.M(-26, -70);
    thigh.C(16, -84, 84, -82, 132, -64);
    thigh.C(166, -50, 186, -18, 184, 22);
    thigh.C(182, 60, 156, 78, 108, 82);
    thigh.C(60, 86, 6, 80, -20, 62);
    thigh.C(-38, 44, -42, -18, -26, -70);
    thigh.Z();
    DS.wash(ctx, thigh, {
      kind: 'skin', base: '#e89962', shadow: '#b45f3e', deep: '#8f4a33', seed: seed + 3,
      box: [-56, -98, 256, 200], inkW: 3.8, shadeAlpha: 0.46, blur: 10,
      hatch: { hatch: 46, len: [4, 22], w: [0.5, 2], dir: 0.4, cols: ['#ffd2a0', '#c9714a', '#a3553a'], alpha: [0.04, 0.22] },
      masses: [
        [DS.pc('M 10 -62 C 60 -74 116 -68 146 -50 C 106 -36 48 -32 6 -42 Z'), '#ffcf9a', 0.26, 8],
        [DS.pc('M 20 56 C 70 72 130 66 168 44 C 140 76 76 92 20 78 Z'), '#a3553a', 0.32, 7],
      ],
    });
    ctx.restore();
  };

  /* ------------------------------------------------- perna: canela (joelho 0) */
  DS.drawShin = function (ctx, side) {
    const seed = 1200 + (side < 0 ? 5 : 0);
    const L = DS.SK.SHIN;
    ctx.save();
    /* Osso do joelho (0) ao tornozelo (L); largura ~130. */
    const w = 0.94 * L / 150;
    ctx.scale(w, 1);
    const shin = DS.path();
    shin.M(-30, -56);
    shin.C(20, -68, 76, -66, 118, -50);
    shin.C(146, -38, 160, -14, 158, 16);
    shin.C(156, 46, 132, 62, 92, 66);
    shin.C(48, 70, 0, 64, -22, 48);
    shin.C(-38, 32, -42, -14, -30, -56);
    shin.Z();
    DS.wash(ctx, shin, {
      kind: 'skin', base: '#dd8b58', shadow: '#a3553a', deep: '#87422e', seed: seed + 7,
      box: [-56, -84, 200, 160], inkW: 3.4, shadeAlpha: 0.46, blur: 8,
      hatch: { hatch: 30, len: [4, 18], w: [0.5, 1.8], dir: 0.2, cols: ['#ffd2a0', '#c9714a'], alpha: [0.04, 0.2] },
    });
    ctx.restore();
  };

  /* ------------------------------------------------------------- bota de couro
   * Desenhada no ESPAÇO DO HERÓI com a origem no TORNOZELO, -y para cima e
   * +x no sentido da frente do herói: assim a sola fica sempre plana no chão,
   * independente do ângulo da perna (o rig só aplica um leve "roll").
   * Ajustado para a sola cair em DS.SK.SOLE. */
  DS.drawBoot = function (ctx, side) {
    const seed = 1200 + (side < 0 ? 5 : 0);
    const SOLE = DS.SK.SOLE;      // altura da sola abaixo do tornozelo
    const K = SOLE / 104;         // fator da arte autoral (sola em 104)
    ctx.save();
    ctx.scale(K, K);
    // cano alto
    const boot = DS.path();
    boot.M(-34, -74);
    boot.C(2, -82, 34, -74, 40, -50);
    boot.C(44, -30, 42, -6, 40, 22);
    boot.C(38, 44, 40, 58, 44, 64);
    boot.C(62, 62, 86, 60, 96, 70);
    boot.C(104, 80, 100, 96, 84, 102);
    boot.C(60, 110, 8, 112, -20, 106);
    boot.C(-38, 102, -46, 88, -44, 66);
    boot.C(-42, 30, -40, -20, -38, -52);
    boot.C(-38, -68, -46, -72, -34, -74);
    boot.Z();
    DS.wash(ctx, boot, {
      kind: 'leather', base: '#5a3c2b', shadow: '#1e1416', deep: '#150e11', seed: seed + 11,
      box: [-70, -110, 220, 260], inkW: 4.0, shadeAlpha: 0.5, blur: 9,
      hatch: { hatch: 70, len: [4, 22], w: [0.5, 2.2], dir: 0.7, cols: ['#c08a5c', '#241719', '#9c6a48'], alpha: [0.06, 0.3] },
      masses: [
        [DS.pc('M -30 -64 C 4 -74 32 -66 36 -46 C 14 -38 -12 -36 -32 -44 Z'), '#8a5c3c', 0.4, 6],
        [DS.pc('M -36 84 C 6 100 56 98 92 84 C 62 108 8 112 -30 102 Z'), '#c08a5c', 0.3, 6],
      ],
    });
    // sola
    const sole = DS.path();
    sole.M(-42, 92);
    sole.C(0, 104, 60, 102, 96, 88);
    sole.L(100, 104);
    sole.C(58, 120, -4, 122, -44, 108);
    sole.Z();
    DS.wash(ctx, sole, {
      kind: 'leather', base: '#33221f', shadow: '#120c0e', seed: seed + 13,
      box: [-60, 84, 180, 50], inkW: 3.0, shadeAlpha: 0.5, blur: 4, hatch: false,
    });
    const strap = DS.path();
    strap.M(-40, -30);
    strap.C(-4, -38, 30, -36, 42, -28);
    strap.C(44, -16, 42, -6, 38, -2);
    strap.C(4, -8, -14, -10, -40, -8);
    strap.C(-42, -20, -42, -24, -40, -30);
    strap.Z();
    DS.wash(ctx, strap, {
      kind: 'leather', base: '#6b4630', shadow: '#241719', seed: seed + 29,
      box: [-50, -44, 100, 46], inkW: 3.0, shadeAlpha: 0.5, blur: 3, hatch: false,
    });
    DS.fibers(ctx, boot, {
      seed: seed + 17, count: 30, len: [10, 30], dir: -1.9, spread: 0.7,
      cols: ['#c08a5c', '#241719', '#8a5c3c'], alpha: [0.15, 0.4], w: [0.8, 2.2],
      box: [-46, -80, 130, 180],
    });
    DS.ink(ctx, boot, { color: '#160e11', w: 4.2, seed: seed + 19, jitter: 1.2 });
    DS.ink(ctx, sole, { color: '#100a0c', w: 3.4, seed: seed + 23, jitter: 1.0 });
    ctx.restore();
  };

  /* ---------------------------------------------------- sombra de contato */
  DS.contactShadow = function (ctx, x, y, r, alpha) {
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(18,10,8,' + (alpha == null ? 0.45 : alpha) + ')');
    g.addColorStop(0.6, 'rgba(18,10,8,' + (alpha == null ? 0.45 : alpha) * 0.5 + ')');
    g.addColorStop(1, 'rgba(18,10,8,0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(x, y); ctx.scale(1, 0.34); ctx.translate(-x, -y);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  };
})(window.DS);
