/* ============================================================================
 * 06-hero.js — MONTAGEM DO HERÓI (rig + armas + correntes) com cache offscreen
 * O herói é desenhado de perfil para a DIREITA; opts.facing = -1 espelha.
 * O mesmo renderer procedural desenha parado e atacando (sem sprites).
 * ========================================================================== */
(function (DS) {
  'use strict';
  const SK = DS.SK;

  /* Cache de peças (bitmaps offscreen determinísticos). */
  function mkPart(key, bounds, fn, ss) {
    const [x0, y0, x1, y1] = bounds;
    return DS.part(key, { w: x1 - x0, h: y1 - y0, px: -x0, py: -y0, ss: ss || 2, draw: fn });
  }

  function yawBucket(yaw) {
    const q = Math.round(DS.clamp(yaw, -1, 1) * 2) / 2; // -1, -0.5, 0, 0.5, 1
    return q;
  }

  function headPart(bucket) {
    return mkPart('head|' + bucket, [-620, -940, 620, 140], (ctx) => {
      DS.drawHead(ctx, { yaw: bucket });
    }, 1.6);
  }
  function bodyPart(bucket) {
    return mkPart('body|' + bucket, [-520, -360, 520, 480], (ctx) => {
      ctx.scale(1.1, 1.0);
      DS.drawBody(ctx, { yaw: bucket, t: 0 });
    }, 1.5);
  }
  function upperPart(side) {
    return mkPart('uarm|' + side, [-50, -90, 150, 90], (ctx) => {
      ctx.scale(1.06, 1.5);
      DS.drawUpperArm(ctx, side);
    }, 2);
  }
  function forePart(side) {
    return mkPart('farm|' + side, [-40, -78, 130, 78], (ctx) => {
      ctx.scale(1.02, 1.45);
      DS.drawForearm(ctx, side);
    }, 2);
  }
  function thighPart(side) {
    return mkPart('thigh|' + side, [-60, -104, 210, 106], (ctx) => DS.drawThigh(ctx, side), 2);
  }
  function shinPart(side) {
    return mkPart('shin|' + side, [-50, -84, 180, 84], (ctx) => DS.drawShin(ctx, side), 2);
  }
  function bootPart(side) {
    return mkPart('boot|' + side, [-120, -160, 200, 200], (ctx) => DS.drawBoot(ctx, side), 1.6);
  }
  /* Arma + mão: a adaga é o desenho mais caro do jogo (centenas de paths,
   * clip(), lava e correntes). Como é RÍGIDA em relação ao punho, pinta-se
   * uma vez em offscreen e o quadro só faz um drawImage rotacionado. */
  function weaponPart(side) {
    return mkPart('weapon|' + (side > 0 ? 'r' : 'l'), [-160, -360, 360, 180], (ctx) => {
      DS.drawHandGrip(ctx, 1, 'back');
      DS.drawWeapon(ctx, side, {});
      DS.drawHandGrip(ctx, 1, 'front');
    }, 1.25);
  }

  /* posição de um ponto local da arma no espaço do herói */
  function wpos(side, wrist, wa, lx, ly) {
    const c = Math.cos(wa), s = Math.sin(wa);
    const X = lx * c - ly * s, Y = lx * s + ly * c;
    return [wrist[0] + (side < 0 ? -X : X), wrist[1] + Y];
  }
  DS.wpos = wpos;

  DS.bladeWorld = function (side, wrist, wa) {
    return {
      root: wpos(side, wrist, wa, 60, -8),
      mid: wpos(side, wrist, wa, SK.BLADE_MID[0], SK.BLADE_MID[1]),
      tip: wpos(side, wrist, wa, SK.BLADE_TIP[0], SK.BLADE_TIP[1]),
      pommel: wpos(side, wrist, wa, -74, 14),
    };
  };

  /* Arma + mão + corrente */
  function drawArmWeapon(ctx, side, f, pose, wa, layer) {
    const wrist = side > 0 ? f.wristR : f.wristL;
    const elbow = side > 0 ? f.elbowR : f.elbowL;
    // braço
    const a1 = side > 0 ? pose.aR[0] : pose.aL[0];
    const a2 = side > 0 ? pose.aR[1] : pose.aL[1];
    const sh = side > 0 ? f.shoulderR : f.shoulderL;
    ctx.save();
    ctx.translate(sh[0], sh[1]);
    ctx.rotate(a1);
    upperPart(side).blit(ctx);
    ctx.translate(SK.UPPER, 0);
    ctx.rotate(a2);
    forePart(side).blit(ctx);
    ctx.restore();

    // arma na mão (bitmap cacheado: a mesma arte procedural desenhada uma vez)
    ctx.save();
    ctx.translate(wrist[0], wrist[1]);
    if (side < 0) ctx.scale(-1, 1);
    ctx.rotate(wa);
    weaponPart(side).blit(ctx);
    ctx.restore();

    // corrente do pomo ao antebraço: laço pesado, com folga grande (como a folha)
    const bp = DS.bladeWorld(side, wrist, wa);
    const mx = (elbow[0] + wrist[0]) / 2, my = (elbow[1] + wrist[1]) / 2;
    const d = Math.hypot(bp.pommel[0] - mx, bp.pommel[1] - my);
    const sag = 44 + d * 0.5;
    ctx.save();
    DS.drawChain(ctx, DS.chainPath(bp.pommel[0], bp.pommel[1], mx, my + 6, sag), { pitch: 30, scale: 1.15, lw: 4.4 });
    ctx.restore();
  }

  function drawLeg(ctx, side, f, pose) {
    const hip = side > 0 ? f.hipR : f.hipL;
    const l = side > 0 ? pose.lR : pose.lL;
    ctx.save();
    ctx.translate(hip[0], hip[1]);
    ctx.rotate(l[0]);
    thighPart(side).blit(ctx);
    ctx.translate(SK.THIGH, 0);
    ctx.rotate(l[1]);
    shinPart(side).blit(ctx);
    ctx.restore();
  }

  /* Bota no espaço do herói: ancorada no tornozelo, sola sempre plana. */
  function drawBoot(ctx, side, f, pose) {
    const an = side > 0 ? f.ankleR : f.ankleL;
    const l = side > 0 ? pose.lR : pose.lL;
    const tilt = DS.clamp((l[0] + l[1] - Math.PI / 2) * 0.5, -0.55, 0.55);
    ctx.save();
    ctx.translate(an[0], an[1]);
    ctx.rotate(tilt);
    bootPart(side).blit(ctx);
    ctx.restore();
  }

  /* Pré-aquece todos os bitmaps (evita hitch no primeiro quadro / no 1º ataque) */
  DS.warmup = function () {
    for (const b of [0.5, 0]) { headPart(b).ensure(); bodyPart(b).ensure(); }
    for (const s of [1, -1]) {
      upperPart(s).ensure(); forePart(s).ensure();
      thighPart(s).ensure(); shinPart(s).ensure(); bootPart(s).ensure();
      weaponPart(s).ensure();
    }
    if (DS.warmChainSprites) DS.warmChainSprites();
  };

  /* ------------------------------------------------------------------ API */
  DS.drawHero = function (ctx, opts) {
    opts = opts || {};
    const pose = opts.pose || DS.POSE.idle(0);
    const facing = opts.facing == null ? 1 : (opts.facing < 0 ? -1 : 1);
    const yaw = opts.yaw == null ? 0.25 : opts.yaw;
    const bucket = yawBucket(yaw);
    const f = DS.fk(pose);
    const only = opts.only || 'all';
    const want = (k) => only === 'all' || only === k;

    ctx.save();
    if (opts.x || opts.y) ctx.translate(opts.x || 0, opts.y || 0);
    if (facing < 0) ctx.scale(-1, 1);

    // as duas pernas primeiro: o pano da cintura cobre as duas coxas
    if (want('legs') || only === 'legR' || only === 'legL') {
      if (want('legs') || only === 'legL') drawLeg(ctx, -1, f, pose);
      if (want('legs') || only === 'legR') drawLeg(ctx, 1, f, pose);
      if (want('legs') || only === 'legL') drawBoot(ctx, -1, f, pose);
      if (want('legs') || only === 'legR') drawBoot(ctx, 1, f, pose);
    }

    // braço de trás (na frente do tronco quando está golpeando: o arco precisa ler)
    if (!opts.frontArms && (want('arms') || only === 'armL')) drawArmWeapon(ctx, -1, f, pose, pose.wL, 'back');

    // tronco
    if (want('body')) {
      ctx.save();
      ctx.translate(0, pose.py);
      ctx.rotate(pose.lean);
      bodyPart(bucket).blit(ctx);
      ctx.restore();
    }

    if (opts.frontArms && (want('arms') || only === 'armL')) drawArmWeapon(ctx, -1, f, pose, pose.wL, 'back');

    // cabeça
    if (want('head')) {
      ctx.save();
      ctx.translate(f.neck[0], f.neck[1]);
      ctx.rotate(f.headRot);
      // leve inclinação de "olhar" (yaw) desloca a cabeça
      ctx.translate(-(pose.headYaw || 0) * 14, 0);
      ctx.scale(0.9, 0.9);
      headPart(bucket).blit(ctx);
      ctx.restore();
    }

    // braço da frente
    if (want('arms') || only === 'armR') drawArmWeapon(ctx, 1, f, pose, pose.wR, 'front');

    ctx.restore();
    return f;
  };

  /* Desenha só a silhueta de colisão/depuração */
  DS.heroDebug = function (ctx, pose, facing) {
    const f = DS.fk(pose);
    ctx.save();
    if (facing < 0) ctx.scale(-1, 1);
    ctx.strokeStyle = 'rgba(0,255,180,0.75)';
    ctx.lineWidth = 2;
    const seg = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
    seg(f.pelvis, f.neck);
    seg(f.shoulderR, f.elbowR); seg(f.elbowR, f.wristR);
    seg(f.shoulderL, f.elbowL); seg(f.elbowL, f.wristL);
    seg(f.hipR, f.kneeR); seg(f.kneeR, f.ankleR);
    seg(f.hipL, f.kneeL); seg(f.kneeL, f.ankleL);
    ctx.restore();
  };
})(window.DS);
