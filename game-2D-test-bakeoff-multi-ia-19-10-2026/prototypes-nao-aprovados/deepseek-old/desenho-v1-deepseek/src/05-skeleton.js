/* ============================================================================
 * 05-skeleton.js — RIG HIERÁRQUICO + POSES PROCEDURAIS
 * Espaço do herói: origem na PELVE, -y para cima, herói desenhado de perfil
 * para a DIREITA (o espelhamento horizontal resolve a esquerda).
 * Ângulos em radianos no espaço da tela (0 = +x/direita, +pi/2 = baixo).
 * ========================================================================== */
(function (DS) {
  'use strict';

  const SK = DS.SK = {
    UPPER: 96, FORE: 96,
    THIGH: 180, SHIN: 150,
    SHOULDER: [192, -215],
    HIP: [112, -8],
    NECK: [0, -250],
    GROUND: 460,           // distância da pelve ao chão
    SOLE: 130,             // altura da sola abaixo do tornozelo (bota)
    BLADE_TIP: [272, -228], // ponta da lâmina no espaço local da arma (escalada)
    BLADE_MID: [192, -139],
  };

  /* ------------------------------------------------------------------ poses */
  const P = DS.POSE = {};

  function basePose() {
    return {
      py: 0, lean: 0, twist: 0, headYaw: -0.06, headPitch: 0,
      aR: [1.02, 0.10], wR: 0.35,
      aL: [2.10, -0.10], wL: -0.35,
      lR: [1.36, -0.06, 0.03], lL: [1.78, 0.06, -0.03],
      hip: 0,
    };
  }

  P.idle = function (t) {
    const p = basePose();
    const b = Math.sin(t * 1.9), b2 = Math.sin(t * 1.9 + 0.8);
    p.py = b * 3.2;
    p.lean = 0.022 + b * 0.014;
    p.aR = [1.02 + b * 0.035, 0.10 + b2 * 0.03];
    p.wR = 0.35 + b * 0.05;
    p.aL = [2.10 - b * 0.035, -0.10 - b2 * 0.03];
    p.wL = -0.35 - b * 0.05;
    p.lR = [1.36, -0.06 - b * 0.012, 0.03];
    p.lL = [1.78, 0.06 + b * 0.012, -0.03];
    p.headYaw = -0.06 + b * 0.03;
    return p;
  };

  P.walk = function (t, speed) {
    const p = basePose();
    const ph = t * 7.4;
    const sw = Math.sin(ph), cw = Math.cos(ph);
    p.py = -Math.abs(cw) * 5;
    p.lean = 0.09;
    p.lR = [1.36 + sw * 0.46, -0.06 - Math.max(0, -sw) * 0.55, 0.06 + Math.max(0, sw) * 0.25];
    p.lL = [1.78 - sw * 0.46, 0.06 + Math.max(0, sw) * 0.55, -0.06 - Math.max(0, -sw) * 0.25];
    p.aR = [1.02 - sw * 0.14, 0.10];
    p.aL = [2.10 + sw * 0.14, -0.10];
    p.wR = 0.35 + sw * 0.06;
    p.wL = -0.35 - sw * 0.06;
    p.headYaw = -0.06;
    return p;
  };

  P.run = function (t, speed) {
    const p = basePose();
    const ph = t * 10.2;
    const sw = Math.sin(ph), cw = Math.cos(ph);
    p.py = -Math.abs(cw) * 11 - 4;
    p.lean = 0.26;
    p.lR = [1.36 + sw * 0.78, -0.16 - Math.max(0, -sw) * 0.95, 0.10 + Math.max(0, sw) * 0.3];
    p.lL = [1.78 - sw * 0.78, 0.16 + Math.max(0, sw) * 0.95, -0.10 - Math.max(0, -sw) * 0.3];
    p.aR = [1.02 - sw * 0.3, 0.18];
    p.aL = [2.10 + sw * 0.3, -0.18];
    p.headYaw = -0.02;
    return p;
  };

  function mix(a, b, k) { return a + (b - a) * k; }
  function mixPose(p, q, k) {
    const o = {};
    for (const key in p) {
      const a = p[key], b = q[key];
      if (typeof a === 'number') o[key] = mix(a, b, k);
      else if (Array.isArray(a)) o[key] = a.map((v, i) => mix(v, b[i], k));
      else o[key] = b === undefined ? a : (k < 0.5 ? a : b);
    }
    return o;
  }
  DS.mixPose = mixPose;

  /* Ataques: curvas explícitas (u = 0..1) */
  P.attack = function (u, idx) {
    const p = basePose();
    const wave = (a, b) => DS.smooth(DS.clamp((u - a) / (b - a), 0, 1));
    const back = 0.22;   // fim do windup
    const hit = 0.48;    // fim do golpe
    const w = wave(0, back), s = wave(back, hit), r = wave(hit, 1);
    /* Convenção de ângulos (herói olhando para +x):
     *   braço: 0 = para frente, +PI/2 = para baixo, -PI/2 = para cima, PI = para trás
     *   arma (wa): ponta direita = wa - 0.72 rad   /   ponta esquerda = -2.43 - wa
     * Regra de ouro: a PONTA descreve um arco grande e legível na tela. */
    if (idx === 0) {
      // A1 — corte horizontal com a adaga direita: ponta de trás-cima -> frente
      p.lean = -0.14 * w + 0.34 * s - 0.20 * r;
      p.py = -3 * s;
      p.aR = [1.02 - 1.57 * w + 1.77 * s + 0.08 * r, 0.10 + 1.15 * w - 1.13 * s + 0.30 * r];
      p.wR = -0.67 - 1.23 * w + 2.20 * s + 0.30 * r;
      p.aL = [2.10 + 0.30 * w - 0.35 * s, -0.10 - 0.20 * w + 0.25 * s];
      p.wL = -1.77 - 0.25 * w + 0.20 * s;
      p.headYaw = -0.06 - 0.18 * w + 0.34 * s;
      p.lR = [1.30 - 0.10 * w + 0.16 * s, -0.06 - 0.10 * w, 0.03];
      p.lL = [1.84 + 0.10 * w + 0.10 * s, 0.06 + 0.12 * w, -0.03];
      p.twist = -0.14 * w + 0.24 * s;
    } else if (idx === 1) {
      // A2 — backhand ascendente com a adaga esquerda: ponta de baixo-trás -> frente-cima
      p.lean = 0.16 * w - 0.30 * s;
      p.py = -5 * s;
      p.aL = [2.10 + 0.45 * w - 2.20 * s + 0.10 * r, -0.10 + 0.25 * w + 0.20 * s];
      p.wL = -1.77 - 3.26 * w + 3.15 * s + 0.38 * r;
      p.aR = [1.02 + 0.15 * w - 0.25 * s + 0.15 * r, 0.10 + 0.10 * w];
      p.wR = -0.67 - 0.35 * w + 0.25 * s;
      p.headYaw = 0.20 * w - 0.25 * s;
      p.lR = [1.32 - 0.06 * w, -0.06, 0.03];
      p.lL = [1.82 + 0.12 * w - 0.20 * s, 0.06, -0.03];
      p.twist = 0.16 * w - 0.26 * s;
    } else {
      // A3 — golpe duplo descendente: as duas pontas caem juntas de cima
      p.lean = -0.30 * w + 0.60 * s - 0.30 * r;
      p.py = 10 * w - 26 * s + 8 * r;
      p.aR = [1.02 - 2.12 * w + 2.45 * s - 0.15 * r, 0.10 + 0.95 * w - 0.95 * s];
      p.wR = -0.67 - 1.16 * w + 3.10 * s - 0.40 * r;
      p.aL = [2.10 - 2.65 * w + 1.70 * s - 0.20 * r, -0.10 - 0.85 * w + 0.95 * s];
      p.wL = -1.77 + 0.84 * w - 2.90 * s + 0.50 * r;
      p.headYaw = -0.06 - 0.10 * s;
      p.lR = [1.42 - 0.26 * w + 0.30 * s, -0.10 - 0.22 * w + 0.26 * s, 0.03];
      p.lL = [1.72 - 0.26 * w + 0.30 * s, 0.10 - 0.26 * w + 0.30 * s, -0.03];
    }
    return p;
  };

  P.roll = function (u) {
    const p = basePose();
    const k = DS.smooth(u);
    p.py = -Math.sin(u * Math.PI) * 40;
    p.lean = 0.9 * Math.sin(u * Math.PI);
    p.aR = [0.6, 1.1]; p.aL = [2.5, -1.1];
    p.wR = -1.25; p.wL = -1.95;
    p.lR = [1.9, -1.5, 0.3];
    p.lL = [1.3, -1.3, 0.2];
    p.tuck = k;
    return p;
  };

  P.hurt = function (u) {
    const p = basePose();
    const k = Math.sin(Math.min(1, u) * Math.PI);
    p.lean = -0.35 * k;
    p.py = -6 * k;
    p.headPitch = -0.3 * k;
    p.aR = [1.2 + 0.3 * k, 0.2]; p.aL = [1.95 - 0.3 * k, -0.2];
    p.wR = -0.67 - 0.3 * k; p.wL = -1.77 + 0.3 * k;
    return p;
  };

  /* --------------------------------------------------------------------- FK */
  DS.fk = function (p) {
    const c = Math.cos(p.lean || 0), s = Math.sin(p.lean || 0);
    const rot = (x, y) => [x * c - y * s, x * s + y * c];
    const pelvis = [0, p.py || 0];
    const neckL = rot(SK.NECK[0], SK.NECK[1]);
    const neck = [pelvis[0] + neckL[0], pelvis[1] + neckL[1]];
    const shR = rot(SK.SHOULDER[0], SK.SHOULDER[1]);
    /* O braço de trás (esquerdo) fica 34 u mais para fora e 6 u abaixo: sem isso
     * o tronco largo do chibi esconde quase todo o braço/arma na vista 3/4. */
    const shL = rot(-SK.SHOULDER[0] - 34, SK.SHOULDER[1] + 6);
    const shoulderR = [pelvis[0] + shR[0] + (p.twist || 0) * 60, pelvis[1] + shR[1]];
    const shoulderL = [pelvis[0] + shL[0] + (p.twist || 0) * 60, pelvis[1] + shL[1]];
    const hipL = rot(-SK.HIP[0], SK.HIP[1]);
    const hipR = rot(SK.HIP[0], SK.HIP[1]);
    const hipRP = [pelvis[0] + hipR[0], pelvis[1] + hipR[1]];
    const hipLP = [pelvis[0] + hipL[0], pelvis[1] + hipL[1]];

    const elbow = (sh, a) => [sh[0] + Math.cos(a) * SK.UPPER, sh[1] + Math.sin(a) * SK.UPPER];
    const wrist = (el, a) => [el[0] + Math.cos(a) * SK.FORE, el[1] + Math.sin(a) * SK.FORE];
    const elR = elbow(shoulderR, p.aR[0]);
    const elL = elbow(shoulderL, p.aL[0]);
    const wrR = wrist(elR, p.aR[0] + p.aR[1]);
    const wrL = wrist(elL, p.aL[0] + p.aL[1]);

    const knee = (hp, a) => [hp[0] + Math.cos(a) * SK.THIGH, hp[1] + Math.sin(a) * SK.THIGH];
    const ankle = (kn, a) => [kn[0] + Math.cos(a) * SK.SHIN, kn[1] + Math.sin(a) * SK.SHIN];
    const knR = knee(hipRP, p.lR[0]);
    const knL = knee(hipLP, p.lL[0]);
    const anR = ankle(knR, p.lR[0] + p.lR[1]);
    const anL = ankle(knL, p.lL[0] + p.lL[1]);

    return {
      pelvis, neck, shoulderR, shoulderL, elbowR: elR, elbowL: elL, wristR: wrR, wristL: wrL,
      hipR: hipRP, hipL: hipLP, kneeR: knR, kneeL: knL, ankleR: anR, ankleL: anL,
      headRot: (p.lean || 0) * 0.55 + (p.headPitch || 0),
      torsoTop: [neck[0], neck[1]],
    };
  };

  /* Ponta/miolo da lâmina no espaço do herói (para hitbox e rastro) */
  DS.bladePoints = function (wrist, rot) {
    const c = Math.cos(rot), s = Math.sin(rot);
    const tf = (x, y) => [wrist[0] + x * c - y * s, wrist[1] + x * s + y * c];
    return { root: tf(60, -8), mid: tf(SK.BLADE_MID[0], SK.BLADE_MID[1]), tip: tf(SK.BLADE_TIP[0], SK.BLADE_TIP[1]) };
  };
})(window.DS);
