/**
 * main.js - Loop Principal do Jogo Isométrico Hades-Style
 * Controles: WASD (Andar), Espaço / Shift (Dash), Clique Esquerdo / J (Combos 1->2->3)
 * Teclas: B (Debug Rig), T (Câmera Lenta), R (Resetar Arena)
 */

(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    camera.origin.set(width * 0.5, height * 0.5);
  });

  const camera = new IsoCamera({
    yaw: 45 * Math.PI / 180,
    pitch: 34 * Math.PI / 180,
    scale: 1.5,
    originX: width * 0.5,
    originY: height * 0.5
  });

  const rig = new KnightRig();
  const hero = new Hero(rig, camera);
  const world = new World(camera);
  const fx = new FXManager();

  const keys = {};
  const mouse = { x: width * 0.5, y: height * 0.5, down: false };
  let slowMotion = false;
  let hitStopTimer = 0; // Micro-pausa de impacto (game feel suculento)

  // Dados dos combos de espada (Corte, Revés, Salto Impacto)
  const COMBO_DATA = {
    combo1: { duration: 0.38, hitTime: 0.16, next: 'combo2', slashRad: 56, arc: Math.PI * 0.88, damage: 30 },
    combo2: { duration: 0.40, hitTime: 0.15, next: 'combo3', slashRad: 62, arc: Math.PI * 0.82, damage: 45 },
    combo3: { duration: 0.55, hitTime: 0.26, next: null, slashRad: 82, arc: Math.PI * 1.15, damage: 85 }
  };

  let comboState = {
    active: false,
    current: null,
    timer: 0,
    hasHit: false,
    bufferedClick: false,
    comboCounter: 0,
    resetTimer: 0
  };

  // Estado do Dash
  let dashState = {
    active: false,
    timer: 0,
    duration: 0.18,
    speed: 360,
    dirX: 0,
    dirY: 0,
    cooldown: 0
  };

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;

    if (k === 'b') {
      hero.debugSkeleton = !hero.debugSkeleton;
    }
    if (k === 't') {
      slowMotion = !slowMotion;
    }
    if (k === 'r') {
      resetGame();
    }
    if (k === ' ' || k === 'shift') {
      triggerDash();
    }
    if (k === 'j') {
      triggerAttack();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      triggerAttack();
    } else if (e.button === 2) {
      triggerDash();
    }
  });

  window.addEventListener('contextmenu', (e) => e.preventDefault());

  function triggerDash() {
    if (dashState.cooldown > 0 || dashState.active) return;

    let moveX = 0;
    let moveY = 0;
    if (keys['w'] || keys['arrowup']) moveY -= 1;
    if (keys['s'] || keys['arrowdown']) moveY += 1;
    if (keys['a'] || keys['arrowleft']) moveX -= 1;
    if (keys['d'] || keys['arrowright']) moveX += 1;

    let dirAngle;
    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;
      const wx = (moveX * camera.cosYaw + (moveY / camera.sinPitch) * camera.sinYaw);
      const wy = (-moveX * camera.sinYaw + (moveY / camera.sinPitch) * camera.cosYaw);
      const wLen = Math.hypot(wx, wy);
      dashState.dirX = wx / wLen;
      dashState.dirY = wy / wLen;
      dirAngle = Math.atan2(dashState.dirY, dashState.dirX);
    } else {
      dashState.dirX = Math.cos(rig.facingAngle);
      dashState.dirY = Math.sin(rig.facingAngle);
      dirAngle = rig.facingAngle;
    }

    dashState.active = true;
    dashState.timer = dashState.duration;
    dashState.cooldown = 0.45;
    hero.isDashing = true;

    // Dispara rastro fantasma e poeira
    const hProj = camera.project(hero.pos);
    hero.addGhost(hProj, hero.getCurrentPoseKey(), camera.scale * hero.scale);
    fx.spawnDust(hProj.x, hProj.y, -dashState.dirX * 40, -dashState.dirY * 40);
    fx.spawnDust(hProj.x + 8, hProj.y, -dashState.dirX * 30, -dashState.dirY * 30);
  }

  function triggerAttack() {
    if (!comboState.active) {
      startCombo('combo1');
    } else {
      comboState.bufferedClick = true;
    }
  }

  function startCombo(animName) {
    comboState.active = true;
    comboState.current = animName;
    comboState.timer = 0;
    comboState.hasHit = false;
    comboState.bufferedClick = false;
    comboState.comboCounter = animName === 'combo1' ? 1 : (animName === 'combo2' ? 2 : 3);
    comboState.resetTimer = 0;
    rig.setAnimation(animName);

    // Vira em direção ao cursor do mouse
    const target3D = camera.unproject(mouse.x, mouse.y, 0);
    const dx = target3D.x - hero.pos.x;
    const dy = target3D.y - hero.pos.y;
    rig.setFacing(Math.atan2(dy, dx));

    // Passo de investida no ataque
    const stepDist = animName === 'combo3' ? 14 : 9;
    const fAngle = rig.facingAngle;
    hero.pos.x += Math.cos(fAngle) * stepDist;
    hero.pos.y += Math.sin(fAngle) * stepDist;
  }

  function resetGame() {
    hero.pos.set(0, 0, 0);
    world.skeletons = [
      new HopliteSkeleton(-85, -25, camera),
      new HopliteSkeleton(80, 30, camera),
      new HopliteSkeleton(30, -75, camera)
    ];
    comboState.active = false;
    comboState.comboCounter = 0;
    rig.setAnimation('idle');
  }

  let lastTime = performance.now();

  function gameLoop(now) {
    requestAnimationFrame(gameLoop);

    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.1) dt = 0.1;

    if (slowMotion) dt *= 0.25;

    // Hit-stop micro pausa
    if (hitStopTimer > 0) {
      hitStopTimer -= dt;
      render();
      return;
    }

    update(dt);
    render();
  }

  let stepDustTimer = 0;

  function update(dt) {
    // 1. Atualiza recarga do Dash
    if (dashState.cooldown > 0) dashState.cooldown -= dt;

    if (dashState.active) {
      dashState.timer -= dt;
      hero.pos.x += dashState.dirX * dashState.speed * dt;
      hero.pos.y += dashState.dirY * dashState.speed * dt;

      // Adiciona rastros fantasmas ao longo do trajeto
      const hProj = camera.project(hero.pos);
      hero.addGhost(hProj, hero.getCurrentPoseKey(), camera.scale * hero.scale);

      if (dashState.timer <= 0) {
        dashState.active = false;
        hero.isDashing = false;
      }
    }

    // 2. Atualiza combos de ataque
    if (comboState.active) {
      const data = COMBO_DATA[comboState.current];
      comboState.timer += dt;

      if (!comboState.hasHit && comboState.timer >= data.hitTime) {
        comboState.hasHit = true;

        const heroProj = camera.project(hero.pos);
        const aimAngle = rig.facingAngle - camera.yaw + Math.PI * 0.5;

        // Disparo de corte estilizado
        fx.spawnSlash(
          { x: heroProj.x, y: heroProj.y - 18 },
          aimAngle,
          data.slashRad,
          data.arc,
          comboState.comboCounter
        );

        // Faíscas brilhantes
        fx.spawnSparks(
          heroProj.x + Math.cos(aimAngle) * 35,
          heroProj.y - 18 + Math.sin(aimAngle) * 18,
          comboState.comboCounter === 3 ? 28 : 16,
          aimAngle
        );

        // Impacto e dano nos esqueletos hoplitas
        let hitAny = false;
        for (const sk of world.skeletons) {
          if (sk.hp <= 0) continue;
          const dist = Math.hypot(sk.pos.x - hero.pos.x, sk.pos.y - hero.pos.y);
          if (dist < data.slashRad + 15) {
            hitAny = true;
            sk.hitAnim = 1.0;
            sk.hp = Math.max(0, sk.hp - data.damage);

            // Empurrão de recuo (knockback)
            const knockDirX = Math.cos(rig.facingAngle);
            const knockDirY = Math.sin(rig.facingAngle);
            const knockForce = comboState.comboCounter === 3 ? 32 : 16;
            sk.pos.x += knockDirX * knockForce;
            sk.pos.y += knockDirY * knockForce;

            const skProj = camera.project(sk.pos);
            fx.spawnSparks(skProj.x, skProj.y - 22, 20, aimAngle);
          }
        }

        if (hitAny) {
          hitStopTimer = comboState.comboCounter === 3 ? 0.055 : 0.035; // Hit-stop punchy!
          fx.triggerShake(comboState.comboCounter === 3 ? 9 : 4, 0.22);
        }

        // Se for o Golpe 3 (Salto Impacto), desencadeia tremor e onda de choque no solo
        if (comboState.comboCounter === 3) {
          fx.spawnShockwave(heroProj.x + Math.cos(aimAngle) * 22, heroProj.y, 85);
        }
      }

      if (comboState.timer >= data.duration) {
        if (comboState.bufferedClick && data.next) {
          startCombo(data.next);
        } else {
          comboState.active = false;
          comboState.current = null;
          rig.setAnimation('idle');
        }
      }
    } else if (!dashState.active) {
      if (comboState.comboCounter > 0) {
        comboState.resetTimer += dt;
        if (comboState.resetTimer > 1.25) {
          comboState.comboCounter = 0;
        }
      }

      let screenMoveX = 0;
      let screenMoveY = 0;

      if (keys['w'] || keys['arrowup']) screenMoveY -= 1;
      if (keys['s'] || keys['arrowdown']) screenMoveY += 1;
      if (keys['a'] || keys['arrowleft']) screenMoveX -= 1;
      if (keys['d'] || keys['arrowright']) screenMoveX += 1;

      const isMoving = screenMoveX !== 0 || screenMoveY !== 0;
      hero.isMoving = isMoving;

      if (isMoving) {
        const len = Math.hypot(screenMoveX, screenMoveY);
        screenMoveX /= len;
        screenMoveY /= len;

        const speed = 125;
        const wx = (screenMoveX * camera.cosYaw + (screenMoveY / camera.sinPitch) * camera.sinYaw);
        const wy = (-screenMoveX * camera.sinYaw + (screenMoveY / camera.sinPitch) * camera.cosYaw);

        const wLen = Math.hypot(wx, wy);
        hero.pos.x += (wx / wLen) * speed * dt;
        hero.pos.y += (wy / wLen) * speed * dt;

        // Limita herói à plataforma octogonal da arena
        const arenaDist = Math.hypot(hero.pos.x, hero.pos.y);
        if (arenaDist > 255) {
          hero.pos.x = (hero.pos.x / arenaDist) * 255;
          hero.pos.y = (hero.pos.y / arenaDist) * 255;
        }

        rig.setFacing(Math.atan2(wy, wx));
        rig.setAnimation('run');

        // Solta pequenas nuvens de poeira nas lajes a cada passo
        stepDustTimer += dt;
        if (stepDustTimer > 0.18) {
          stepDustTimer = 0;
          const hProj = camera.project(hero.pos);
          fx.spawnDust(hProj.x, hProj.y, -wx * 0.1, -wy * 0.1);
        }
      } else {
        // Quando parado, vira em direção ao cursor do mouse
        const target3D = camera.unproject(mouse.x, mouse.y, 0);
        const dx = target3D.x - hero.pos.x;
        const dy = target3D.y - hero.pos.y;
        rig.setFacing(Math.atan2(dy, dx));
        rig.setAnimation('idle');
      }
    }

    hero.update(dt);
    world.update(dt);
    fx.update(dt);

    // Câmera segue o herói suavemente
    camera.target.x += (hero.pos.x - camera.target.x) * 0.14;
    camera.target.y += (hero.pos.y - camera.target.y) * 0.14;
  }

  function render() {
    ctx.save();
    // Aplica tremor de tela nos impactos
    ctx.translate(fx.shakeOffset.x, fx.shakeOffset.y);

    ctx.fillStyle = '#060103';
    ctx.fillRect(0, 0, width, height);

    // 1. Piso da Arena e luzes radiais dos braseiros
    world.drawGround(ctx);

    // 2. Ordenação de profundidade Z-Sort para todos os atores e props
    const heroProj = camera.project(hero.pos);
    const renderList = [];

    renderList.push({
      depth: heroProj.depth,
      draw: () => hero.draw(ctx)
    });

    const props = world.getRenderProps();
    for (const p of props) {
      renderList.push(p);
    }

    renderList.sort((a, b) => a.depth - b.depth);

    for (const item of renderList) {
      item.draw(ctx);
    }

    // 3. Efeitos de combate (arcos de espada, poeira, faíscas, ondas)
    fx.draw(ctx);

    // 4. Barras de vida sobre a cabeça dos esqueletos hoplitas
    drawSkeletonHPBars(ctx);

    ctx.restore();

    // 5. Interface HUD (Hades-Style)
    drawHUD(ctx);
  }

  function drawSkeletonHPBars(ctx) {
    for (const sk of world.skeletons) {
      if (sk.hp <= 0) continue;
      const sp = camera.project(sk.pos);
      const barW = 38;
      const barH = 5;
      const bx = sp.x - barW * 0.5;
      const by = sp.y - 70;

      ctx.save();
      ctx.fillStyle = 'rgba(10, 4, 8, 0.75)';
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

      const hpRatio = sk.hp / sk.maxHp;
      ctx.fillStyle = '#D82030';
      ctx.fillRect(bx, by, barW * hpRatio, barH);

      ctx.strokeStyle = '#3A0808';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.restore();
    }
  }

  function drawHUD(ctx) {
    ctx.save();

    // Painel superior esquerdo: Retrato Chibi e Barra de Vida Ornada
    ctx.fillStyle = 'rgba(15, 10, 14, 0.92)';
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(24, 24, 275, 72, 8);
    ctx.fill();
    ctx.stroke();

    // Retrato do Cavaleiro Chibi
    ctx.save();
    ctx.beginPath();
    ctx.arc(60, 60, 26, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#1c1822';
    ctx.fillRect(34, 34, 52, 52);
    if (typeof HeadRenderer !== 'undefined') {
      HeadRenderer.draw(ctx, { x: 60, y: 66, depth: 0 }, 0, 0, 1.05);
    }
    ctx.restore();

    ctx.strokeStyle = '#D4AF37'; // Moldura de ouro
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(60, 60, 26, 0, Math.PI * 2);
    ctx.stroke();

    // Nome do Herói
    ctx.fillStyle = '#FFF8DC';
    ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('RED-HAIRED KNIGHT', 98, 48);

    // Barra de Vida
    ctx.fillStyle = '#2A080C';
    ctx.fillRect(98, 58, 185, 16);
    ctx.fillStyle = '#E02030'; // Vermelho vibrante
    ctx.fillRect(98, 58, 185, 16);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(98, 58, 185, 16);

    // Estandarte dinâmico de combos
    if (comboState.comboCounter > 0) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '900 24px "Segoe UI", Impact, sans-serif';
      let comboText;
      if (comboState.comboCounter === 1) comboText = 'COMBO 1: CORTE!';
      else if (comboState.comboCounter === 2) comboText = 'COMBO 2: REVÉS!';
      else comboText = 'COMBO 3: GROUND IMPACT SLAM!!';
      ctx.fillText(comboText, 24, 130);
    }

    // Dicas de controle no rodapé
    ctx.fillStyle = 'rgba(255, 245, 235, 0.85)';
    ctx.font = '13px monospace';
    ctx.fillText('WASD: Andar | Espaço / Shift: Dash Esquiva | Clique / J: Combo Espada (Corte → Revés → Salto Slam)', 24, height - 42);
    ctx.fillText(`Tecla B: Rig 3D [${hero.debugSkeleton ? 'LIGADO' : 'DESLIGADO'}] | Tecla T: Câmera Lenta [${slowMotion ? 'LIGADO' : 'DESLIGADO'}] | Tecla R: Resetar Arena`, 24, height - 22);

    ctx.restore();
  }

  requestAnimationFrame(gameLoop);
})();
