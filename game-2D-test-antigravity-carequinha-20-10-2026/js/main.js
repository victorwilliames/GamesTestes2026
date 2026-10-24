'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — main.js
// Loop de Jogo, Entrada WASD, Mira e Combo com Buffer (Método RafaxLab)
// Modos de Auditoria: Tecla B (Esqueleto 3D / IK) e Tecla T (Câmera Lenta 25%)
// =============================================================================

(() => {
  const { project, unproject, angleLerp, vAdd, vScale, TAU } = globalThis.Agy.Core;

  const gameCanvas = document.getElementById('game');
  const portraitCanvas = document.getElementById('portrait');
  const ctx = gameCanvas.getContext('2d');
  const pctx = portraitCanvas ? portraitCanvas.getContext('2d') : null;

  globalThis.Agy.World.init();

  const combat = new globalThis.Agy.Rig.CombatEngine();
  const fx = new globalThis.Agy.CombatFX();

  const gameState = {
    hero: { x: 0, y: 30, z: 0 },
    yaw: Math.PI / 2,
    speed: 0,
    zoom: 2.3,
    isPaused: false,
    isSlowMo: false,
    showSkeleton: false,
    mouseScreen: { x: 0, y: 0 },
    activeKeys: {},
    attackDirection: null,
    lastStrikeIndex: -1,
    time: 0
  };

  let dpr = 1;

  function handleResize() {
    dpr = window.devicePixelRatio || 1;
    const gw = gameCanvas.clientWidth;
    const gh = gameCanvas.clientHeight;
    if (gameCanvas.width !== Math.floor(gw * dpr) || gameCanvas.height !== Math.floor(gh * dpr)) {
      gameCanvas.width = Math.floor(gw * dpr);
      gameCanvas.height = Math.floor(gh * dpr);
    }
    if (portraitCanvas) {
      const pw = portraitCanvas.clientWidth;
      const ph = portraitCanvas.clientHeight;
      if (portraitCanvas.width !== Math.floor(pw * dpr) || portraitCanvas.height !== Math.floor(ph * dpr)) {
        portraitCanvas.width = Math.floor(pw * dpr);
        portraitCanvas.height = Math.floor(ph * dpr);
      }
    }
  }

  // Desprojeta o mouse na tela para as coordenadas de chão no mundo
  function getMouseWorldPosition() {
    const heroScreen = project([gameState.hero.x, gameState.hero.y, gameState.hero.z]);
    const originX = gameCanvas.width * 0.5;
    const originY = gameCanvas.height * 0.62;
    const scale = gameState.zoom * dpr;

    const relX = (gameState.mouseScreen.x * dpr - (originX - heroScreen[0] * scale)) / scale;
    const relY = (gameState.mouseScreen.y * dpr - (originY - heroScreen[1] * scale)) / scale;

    return unproject([relX, relY]);
  }

  // Direção de entrada WASD relativa à visão isométrica
  function getMovementVector() {
    let sx = 0, sy = 0;
    const k = gameState.activeKeys;
    if (k['KeyW'] || k['ArrowUp']) sy -= 1;
    if (k['KeyS'] || k['ArrowDown']) sy += 1;
    if (k['KeyA'] || k['ArrowLeft']) sx -= 1;
    if (k['KeyD'] || k['ArrowRight']) sx += 1;

    if (!sx && !sy) return null;
    const worldDir = unproject([sx, sy]);
    const len = Math.hypot(worldDir[0], worldDir[1]) || 1;
    return [worldDir[0] / len, worldDir[1] / len];
  }

  function triggerAttackAtWorld(targetX, targetY) {
    const dx = targetX - gameState.hero.x;
    const dy = targetY - gameState.hero.y;
    const len = Math.hypot(dx, dy) || 1;
    gameState.attackDirection = [dx / len, dy / len];
    combat.triggerAttack();
  }

  // ---------------------------------------------------------------------------
  // Captura de Teclado e Mouse
  // ---------------------------------------------------------------------------
  window.addEventListener('keydown', e => {
    gameState.activeKeys[e.code] = true;
    if (e.code === 'KeyB') gameState.showSkeleton = !gameState.showSkeleton;
    if (e.code === 'KeyT') gameState.isSlowMo = !gameState.isSlowMo;
    if (e.code === 'Space') gameState.isPaused = !gameState.isPaused;
  });

  window.addEventListener('keyup', e => {
    gameState.activeKeys[e.code] = false;
  });

  gameCanvas.addEventListener('mousemove', e => {
    const r = gameCanvas.getBoundingClientRect();
    gameState.mouseScreen.x = e.clientX - r.left;
    gameState.mouseScreen.y = e.clientY - r.top;
  });

  gameCanvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    const mouseWorld = getMouseWorldPosition();
    triggerAttackAtWorld(mouseWorld[0], mouseWorld[1]);
  });

  window.addEventListener('resize', handleResize);
  handleResize();

  // ---------------------------------------------------------------------------
  // Loop Principal (requestAnimationFrame)
  // ---------------------------------------------------------------------------
  let previousTimestamp = performance.now();

  function gameLoop(now) {
    requestAnimationFrame(gameLoop);

    let dt = (now - previousTimestamp) / 1000;
    previousTimestamp = now;

    if (dt > 0.1) dt = 0.1;
    if (gameState.isPaused) dt = 0;
    if (gameState.isSlowMo) dt *= 0.25;

    // Atualização de Movimento e Orientação
    const moveDir = getMovementVector();
    const isAttacking = combat.isAttacking;

    if (isAttacking && gameState.attackDirection) {
      // Trava mira na direção do ataque
      const targetYaw = Math.atan2(gameState.attackDirection[1], gameState.attackDirection[0]);
      gameState.yaw = angleLerp(gameState.yaw, targetYaw, 0.28);
      gameState.speed = Math.max(0, gameState.speed - dt * 8);
    } else if (moveDir) {
      // Movimento coordenado com a rotação suave do herói
      const targetYaw = Math.atan2(moveDir[1], moveDir[0]);
      gameState.yaw = angleLerp(gameState.yaw, targetYaw, 0.22);
      gameState.speed = Math.min(1.0, gameState.speed + dt * 6);

      const moveSpeed = 145 * gameState.speed * dt;
      gameState.hero.x += moveDir[0] * moveSpeed;
      gameState.hero.y += moveDir[1] * moveSpeed;

      // Colisão com os limites da arena
      const maxRadius = globalThis.Agy.World.ARENA_RADIUS - 45;
      const currentRadius = Math.hypot(gameState.hero.x, gameState.hero.y);
      if (currentRadius > maxRadius) {
        gameState.hero.x = (gameState.hero.x / currentRadius) * maxRadius;
        gameState.hero.y = (gameState.hero.y / currentRadius) * maxRadius;
      }
    } else {
      gameState.speed = Math.max(0, gameState.speed - dt * 8);
    }

    combat.update(dt);
    globalThis.Agy.World.update(dt);
    gameState.time += dt;

    // Constrói esqueleto 3D resolvido por IK
    const currentRig = globalThis.Agy.Rig.buildRig({
      pos: [gameState.hero.x, gameState.hero.y, gameState.hero.z],
      yaw: gameState.yaw,
      time: gameState.time,
      speed: gameState.speed,
      combat: { index: combat.strikeIndex, time: combat.elapsed }
    });

    // Gerenciamento dos Efeitos de Lâmina
    if (isAttacking) {
      if (combat.strikeIndex !== gameState.lastStrikeIndex) {
        fx.startSlash();
        gameState.lastStrikeIndex = combat.strikeIndex;

        if (combat.strikeIndex === 0) {
          const s = project(currentRig.handR);
          fx.spawnText('SLASH!', s[0], s[1] - 35);
        } else if (combat.strikeIndex === 1) {
          const s = project(currentRig.handR);
          fx.spawnText('CLEAVE!', s[0], s[1] - 35);
        }
      }

      // Ponta da lâmina traça rastro
      const tip = vAdd(currentRig.handR, vScale(currentRig.swordDir, 65));
      const tipScreen = project(tip);
      fx.addSlashPoint(tipScreen[0], tipScreen[1]);

      // Impacto pesado no clímax do Golpe 3 (Bimanual Slam)
      if (combat.strikeIndex === 2 && combat.progress > 0.45 && combat.progress < 0.56) {
        globalThis.Agy.World.triggerShockwave(1.8);
        const handScreen = project(currentRig.handR);
        fx.spawnImpact(handScreen[0], handScreen[1], 1.8);
        fx.spawnText('KRAK!', handScreen[0], handScreen[1] - 45);
      }
    } else {
      if (gameState.lastStrikeIndex >= 0) {
        fx.endSlash();
        gameState.lastStrikeIndex = -1;
      }
    }

    fx.update(dt);

    // -------------------------------------------------------------------------
    // Renderização no Canvas Principal
    // -------------------------------------------------------------------------
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    const heroScreen = project([gameState.hero.x, gameState.hero.y, gameState.hero.z]);
    const originX = gameCanvas.width * 0.5 + (Math.random() - 0.5) * fx.screenShake;
    const originY = gameCanvas.height * 0.62 + (Math.random() - 0.5) * fx.screenShake;
    const scale = gameState.zoom * dpr;

    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(scale, scale);
    ctx.translate(-heroScreen[0], -heroScreen[1]);

    // Chão Pré-Renderizado em OffscreenCanvas
    globalThis.Agy.World.renderGround(ctx);

    const heroDepth = heroScreen[2];
    globalThis.Agy.World.renderBackProps(ctx, gameState.time, heroDepth);

    // Herói Carequinha Desenhado com Depth Sorting
    globalThis.Agy.Hero.drawHero(ctx, currentRig);

    // Modo Esqueleto / Debug IK (Tecla B)
    if (gameState.showSkeleton) {
      renderSkeletonDebug(ctx, currentRig);
    }

    // Vegetação na frente do herói e efeitos dinâmicos
    globalThis.Agy.World.renderFrontProps(ctx, gameState.time, heroDepth);
    fx.render(ctx);

    ctx.restore();

    // Retrato vivo no HUD
    if (pctx) {
      renderLivePortrait(pctx, gameState.time);
    }
  }

  // ---------------------------------------------------------------------------
  // Depuração Visual do Esqueleto (Tecla B)
  // ---------------------------------------------------------------------------
  function renderSkeletonDebug(c, rig) {
    c.save();
    for (const limb of rig.limbs) {
      const pRoot = project(limb.root);
      const pJoint = project(limb.joint);
      const pEnd = project(limb.end);

      // Ossos (linhas ciano)
      c.strokeStyle = '#00f7ff';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(pRoot[0], pRoot[1]);
      c.lineTo(pJoint[0], pJoint[1]);
      c.lineTo(pEnd[0], pEnd[1]);
      c.stroke();

      // Articulações (nós magenta)
      for (const pt of [pRoot, pJoint, pEnd]) {
        c.fillStyle = '#ff0066';
        c.beginPath();
        c.arc(pt[0], pt[1], 3.8, 0, TAU);
        c.fill();
      }
    }
    c.restore();
  }

  // ---------------------------------------------------------------------------
  // Retrato do Rosto no HUD (Renderizado pelo mesmo Head.drawHead)
  // ---------------------------------------------------------------------------
  function renderLivePortrait(c, t) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, portraitCanvas.width, portraitCanvas.height);

    const cx = portraitCanvas.width * 0.5;
    const cy = portraitCanvas.height * 0.58;
    const s = 1.35 * dpr;

    c.save();
    c.translate(cx, cy);
    c.scale(s, s);

    // Respiração sutil na câmera de close-up
    const breathYaw = Math.PI / 4 + Math.sin(t * 1.8) * 0.05;
    globalThis.Agy.Head.drawHead(c, {
      pos: [0, 0, 0],
      yaw: breathYaw,
      scale: 1.15
    });
    c.restore();
  }

  requestAnimationFrame(gameLoop);

  // Expõe API para automação e testes
  window.AgyDebug = {
    gameState,
    combat,
    fx,
    triggerAttackAtWorld,
    step(dt = 0.016) {
      combat.update(dt);
      gameState.time += dt;
    }
  };
})();
