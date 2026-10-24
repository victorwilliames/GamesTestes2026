/* ============================================================================
 * 10-game.js — JOGO: laço principal, entrada, câmera, HUD e medição de FPS
 * Render 100% procedural em Canvas 2D (mesmo renderer do herói parado/atacando).
 * ========================================================================== */
(function (DS) {
  'use strict';
  const G = DS.game = {};

  const W = 1280, H = 720;                  // resolução nativa exigida
  G.W = W; G.H = H;

  /* --------------------------------------------------------------- estado */
  G.state = {
    hero: null, enemies: [], cam: { x: 0, y: 0 }, t: 0,
    hp: 100, maxHp: 100, rage: 0, rageT: 0,
    cds: { q: 0, e: 0, r: 0 },
    paused: false, debug: false, over: false,
    kills: 0, seed: 12345,
  };

  function mkHero() {
    return {
      x: 3000, y: 2000, z: 0, vx: 0, vy: 0, hp: 100, maxHp: 100,
      faceDir: 1, atk: -1, atkT: 0, pose: DS.POSE.idle(0), fk: null,
      invuln: 0, dashT: 0, hurtT: 0, moving: 0, runT: 0, dust: 0,
    };
  }

  /* ---------------------------------------------------------------- input */
  const keys = {};
  const input = G.input = { attack: false, attackPressed: false, mx: 0, my: 0, mouseDown: false };

  function bindInput(canvas) {
    window.addEventListener('keydown', (ev) => {
      const k = ev.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) ev.preventDefault();
      if (!keys[k]) {
        if (k === 'j' || k === 'z') input.attackPressed = true;
        if (k === ' ') tryDash();
        if (k === 'q') trySpecial('q');
        if (k === 'e') trySpecial('e');
        if (k === 'r') trySpecial('r');
        if (k === 'f1') G.state.debug = !G.state.debug;
        if (k === 'p') G.state.paused = !G.state.paused;
        if (k === 'h') DS.showPerf = !DS.showPerf;
      }
      keys[k] = true;
    });
    window.addEventListener('keyup', (ev) => { keys[ev.key.toLowerCase()] = false; });
    canvas.addEventListener('mousedown', (ev) => {
      if (ev.button === 0) { input.mouseDown = true; input.attackPressed = true; }
      ev.preventDefault();
    });
    window.addEventListener('mouseup', () => { input.mouseDown = false; });
    canvas.addEventListener('mousemove', (ev) => {
      const r = canvas.getBoundingClientRect();
      input.mx = (ev.clientX - r.left) * (W / r.width);
      input.my = (ev.clientY - r.top) * (H / r.height);
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  function tryDash() {
    const h = G.state.hero;
    if (!h || h.dashT > 0 || G.state.cds.e > 0) return;
    G.state.cds.e = 2.2;
    h.dashT = 0.30;
    h.vx += h.faceDir * 2500;
    DS.fx.dust(h.x, h.y, 14);
    DS.fx.addShake(3);
  }

  function trySpecial(k) {
    const st = G.state, h = st.hero;
    if (!h) return;
    if (k === 'q' && st.cds.q <= 0) {
      st.cds.q = 5.5;
      // giro: acerta em volta
      h.atk = 2; h.atkT = 0; h.hitDone = false; h.spin = true;
      DS.fx.ring(h.x, h.y - 220, 620, '#ffd08a');
      DS.fx.addShake(7);
      for (const e of st.enemies) {
        if (e.dead) continue;
        if (Math.hypot(e.x - h.x, e.y - h.y) < 700) {
          DS.enemy.hurt(e, 20, e.x > h.x ? 1 : -1);
          DS.fx.blood(e.x, e.y - DS.SKEL.HIT_Y, 10, 0);
        }
      }
    } else if (k === 'e' && st.cds.e <= 0) {
      tryDash();
    } else if (k === 'r' && st.cds.r <= 0) {
      st.cds.r = 16;
      st.rageT = 7;
      DS.fx.ring(h.x, h.y - 200, 950, '#ff9a3c');
      DS.fx.dust(h.x, h.y, 30, '#ffb347');
      DS.fx.addShake(6);
    }
  }

  /* ------------------------------------------------------------ câmera + mundo */
  const PLAY = DS.PLAY = 0.24;      // unidades do herói -> pixels de tela
  G.PLAY = PLAY;

  function updateCamera(st, dt) {
    const h = st.hero;
    const vw = W / PLAY, vh = H / PLAY;
    const tx = h.x + h.faceDir * 420 - vw * 0.5;
    const ty = h.y + h.vy * 0.25 - vh * 0.66;
    st.cam.x += (tx - st.cam.x) * Math.min(1, dt * 6);
    st.cam.y += (ty - st.cam.y) * Math.min(1, dt * 6);
    st.cam.x = DS.clamp(st.cam.x, 0, Math.max(0, DS.arena.W - vw));
    st.cam.y = DS.clamp(st.cam.y, 0, Math.max(0, DS.arena.H - vh));
  }

  function spawnEnemies(st, n) {
    let i = 0;
    while (st.enemies.filter((e) => !e.dead).length < n && i < 80) {
      i++;
      const a = (st.kills + i) * 1.7;
      const d = 1900 + (i % 4) * 260;
      const x = DS.clamp(st.hero.x + Math.cos(a) * d, 700, DS.arena.W - 400);
      const y = DS.clamp(st.hero.y + Math.sin(a) * d * 0.7, 600, DS.arena.H - 400);
      if (Math.hypot(x - st.hero.x, y - st.hero.y) < 1300) continue;
      st.enemies.push(DS.enemy.make(x, y, i % 2, 1000 + st.kills * 7 + i * 13));
    }
  }

  /* ------------------------------------------------------------------ HUD */
  /* Avatar do HUD: composto UMA vez (clip circular + cabeça + aro) e blitado. */
  function heroAvatar() {
    return DS.part('hud_avatar', {
      w: 200, h: 200, px: 100, py: 100, ss: 1,
      draw(ctx) {
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 0, 92, 0, 6.3); ctx.clip();
        ctx.fillStyle = '#201614'; ctx.fillRect(-100, -100, 200, 200);
        const g = ctx.createRadialGradient(-34, -46, 8, 0, 0, 130);
        g.addColorStop(0, '#6a4a34');
        g.addColorStop(0.65, '#3a2822');
        g.addColorStop(1, '#1d1412');
        ctx.fillStyle = g; ctx.fillRect(-100, -100, 200, 200);
        ctx.translate(-6, 26);
        ctx.scale(0.16, 0.16);
        DS.drawHead(ctx, { yaw: 0.35 });
        ctx.restore();
        ctx.beginPath(); ctx.arc(0, 0, 92, 0, 6.3);
        ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(12,8,8,0.85)'; ctx.stroke();
        ctx.lineWidth = 3; ctx.strokeStyle = '#e0b070'; ctx.stroke();
      },
    });
  }

  function drawBar(ctx, x, y, w, h, k, col, bg) {
    ctx.save();
    ctx.fillStyle = bg || 'rgba(16,10,10,0.72)';
    ctx.beginPath();
    const r = h / 2;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 3; ctx.stroke();
    if (k > 0) {
      ctx.save();
      ctx.clip();
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w * DS.clamp(k, 0, 1), h);
      ctx.restore();
    }
    ctx.restore();
  }

  const ICONS = [
    { k: 'q', label: 'Q', name: 'GIRO' },
    { k: 'e', label: 'E', name: 'INVESTIDA' },
    { k: 'r', label: 'R', name: 'FÚRIA' },
  ];

  /* Ícones Q/E/R estáticos (aro + letra + nome) cacheados num só bitmap. */
  function hudIcons() {
    return DS.part('hud_icons', {
      w: 340, h: 130, px: 0, py: 0, ss: 1,
      draw(ctx) {
        for (let i = 0; i < ICONS.length; i++) {
          const ic = ICONS[i];
          const x = 20 + i * 94, y = 40;
          ctx.beginPath(); ctx.ellipse(x, y, 38, 30, 0, 0, 6.3);
          ctx.fillStyle = 'rgba(18,12,12,0.78)'; ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = '#e0b070'; ctx.stroke();
          ctx.font = '700 26px "Trebuchet MS", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffe9b0';
          ctx.fillText(ic.label, x, y + 1);
          ctx.font = '600 13px "Trebuchet MS", sans-serif';
          ctx.fillStyle = '#cbb99a';
          ctx.fillText(ic.name, x, y + 44);
        }
      },
    });
  }

  function drawHUD(ctx, st, FPS) {
    const h = st.hero;
    // retrato circular + vida + pips
    ctx.save();
    ctx.translate(112, 112);
    heroAvatar().blit(ctx);
    ctx.restore();
    drawBar(ctx, 250, 44, 340, 26, h.hp / h.maxHp, ['#ff5a3c', '#8d0f10']);
    drawBar(ctx, 250, 78, 210, 14, st.rageT > 0 ? 1 : st.cds.r / 16, ['#ffd75c', '#c25a10']);
    // pips de combo
    for (let i = 0; i < 3; i++) {
      const on = DS.combat.comboIdx >= i && (DS.combat.comboT > 0 || h.atk >= i);
      ctx.save();
      ctx.beginPath(); ctx.arc(624 + i * 40, 57, 15, 0, 6.3);
      ctx.fillStyle = on ? '#ffd75c' : 'rgba(30,20,18,0.75)';
      ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = on ? '#fff3c8' : 'rgba(0,0,0,0.6)'; ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.font = '700 22px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const comboStr = 'x' + (DS.combat.comboIdx + 1) + '   KILLS ' + st.kills;
    ctx.fillStyle = 'rgba(20,8,6,0.9)';
    ctx.fillText('COMBO', 251, 130);
    ctx.fillText(comboStr, 371, 130);
    ctx.fillStyle = '#ffe9b0';
    ctx.fillText('COMBO', 250, 128);
    ctx.fillText(comboStr, 370, 128);
    ctx.restore();

    // ícones Q/E/R (bitmap estático) + recarga dinâmica
    ctx.save();
    ctx.translate(W - 320, H - 118);
    hudIcons().blit(ctx);
    ctx.restore();
    for (let i = 0; i < ICONS.length; i++) {
      const ic = ICONS[i];
      const cd = st.cds[ic.k] || 0;
      if (cd <= 0) continue;
      const maxcd = ic.k === 'q' ? 5.5 : ic.k === 'e' ? 2.2 : 16;
      const x = W - 300 + i * 94, y = H - 78;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(x, y, 38, 30, 0, 0, 6.3); ctx.clip();
      ctx.fillStyle = 'rgba(10,8,8,0.62)';
      ctx.fillRect(x - 40, y - 32, 80, 64 * (cd / maxcd));
      ctx.restore();
      ctx.save();
      ctx.font = '700 20px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffe9b0';
      ctx.fillText(cd.toFixed(1), x, y + 1);
      ctx.restore();
    }

    // painel de performance (cache: atualiza 4x/s; exigência de auditoria)
    if (DS.showPerf !== false) drawPerfPanel(ctx, FPS);
    // aviso de "sem dano recente"
    if (h.hp <= 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '800 62px "Trebuchet MS", sans-serif';
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(20,6,6,0.9)';
      ctx.strokeText('DERROTADO — pressione R para renascer', W / 2, H / 2);
      ctx.fillStyle = '#ffd9a0';
      ctx.fillText('DERROTADO — pressione R para renascer', W / 2, H / 2);
      ctx.restore();
    }
  }

  /* -------------------------------------------------------- laço principal */
  function mkFps() { return { samples: [], acc: 0, n: 0, avg: 0, p95: 0, p99: 0, draw: 0, upd: 0, rawMed: 0 }; }
  function pushFps(F, dt, draw, upd) {
    F.draw = F.draw * 0.9 + draw * 0.1;
    F.upd = F.upd * 0.9 + upd * 0.1;
    // descarta os primeiros quadros (aquecimento: criação de buffers, primeiro blit)
    if (F.n++ < 6) { F.samples.length = 0; return; }
    F.samples.push(dt);
    if (F.samples.length > 240) F.samples.shift();
    if ((F.n % 6) === 0) {
      const s = F.samples.slice().sort((a, b) => a - b);
      const sum = s.reduce((a, b) => a + b, 0);
      F.rawMed = s[Math.floor(s.length / 2)];
      F.avg = 1 / (sum / s.length);
      // p95/p99 = FPS que 95%/99% dos quadros alcançaram (cauda lenta do frame time)
      F.p95 = 1 / s[Math.min(s.length - 1, Math.floor(s.length * 0.95))];
      F.p99 = 1 / s[Math.min(s.length - 1, Math.floor(s.length * 0.99))];
    }
  }

  G.init = function (canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    G.ctx = ctx;
    G.canvas = canvas;
    canvas.width = W; canvas.height = H;
    bindInput(canvas);
    DS.arena.BS = PLAY;     // buffer do chão na escala exata da tela (blit 1:1)
    DS.arena.init();
    const st = G.state;
    st.hero = mkHero();
    st.hero.pose = DS.POSE.idle(0);
    DS.combat.reset();
    DS.fx.reset();
    if (DS.warmup) DS.warmup();
    spawnEnemies(st, G.spawnCount || 4);
    G.FPS = mkFps();
    let last = performance.now();
    let frames = 0;

    // ?benchloop=N — N quadros em LAÇO FECHADO com sync de GPU.
    // Mede o custo puro do motor (update+render), sem apresentação/vsync.
    if (DS.benchLoop) {
      const K = 100;
      const batch = () => {
        const t = performance.now();
        for (let i = 0; i < K; i++) { update(st, 1 / 60); render(st, performance.now()); }
        G.ctx.getImageData(0, 0, 1, 1);      // uma sync: paga o custo de GPU do lote
        return performance.now() - t;
      };
      batch(); batch(); batch();            // aquece shaders/upload do primeiro lote
      const ms = batch() / K;
      window.__BENCHLOOP = {
        n: K, res: W + 'x' + H, enemies: st.enemies.length,
        msPerFrame: +ms.toFixed(3), fps: +(1000 / ms).toFixed(1),
      };
    }

    function frame(now) {
      const raw = Math.max(0.0002, (now - last) / 1000);
      last = now;
      const dt = Math.min(0.05, raw);
      const t0 = performance.now();
      update(st, dt);
      const t1 = performance.now();
      render(st, t0);
      const t2 = performance.now();
      pushFps(G.FPS, raw, t2 - t1, t1 - t0);
      frames++;
    // ---------------------------------------------------- modo benchmark
    // ?bench=10  -> 10 s de jogo automático (andando + atacando) medindo tudo
    // Stalls > 100 ms são contados à parte: no headless não existe compositor
    // de verdade e a apresentação dá travadas que NÃO são custo do motor.
    if (DS.bench) {
      if (G.benchFrames && !G.benchDone) {
        if (frames > 4 && st.t > 2) { G.benchFrames.push(raw); G.benchT += raw; }
        if (st.t - (G.benchStart || 0) > 0.4) {
          G.benchStart = st.t;
          input.attackPressed = true;      // ataque automático no ritmo
        }
        if (G.benchT >= DS.bench) {
          const all = G.benchFrames;
          const slow = all.filter((x) => x > 0.1);
          const s = all.filter((x) => x <= 0.1).sort((a, b) => a - b);
          const pct = (q) => s[Math.min(s.length - 1, Math.floor(s.length * q))];
          const stSum = slow.reduce((a, b) => a + b, 0);
          window.__BENCH = {
            url: location.href, res: W + 'x' + H, seconds: +G.benchT.toFixed(2),
            frames: all.length, framesMeasured: s.length,
            stallsOver100ms: slow.length, stallMsTotal: +(stSum * 1000).toFixed(0),
            fpsAvg: +((all.length - slow.length) / (G.benchT - stSum)).toFixed(1),
            fpsP50: +(1 / pct(0.5)).toFixed(1),
            fpsP95: +(1 / pct(0.95)).toFixed(1),
            fpsP99: +(1 / pct(0.99)).toFixed(1),
            frameP50ms: +(pct(0.5) * 1000).toFixed(2),
            frameP95ms: +(pct(0.95) * 1000).toFixed(2),
            frameP99ms: +(pct(0.99) * 1000).toFixed(2),
            frameMaxMs: +(Math.max.apply(null, all) * 1000).toFixed(2),
            drawMs: +G.FPS.draw.toFixed(2), updMs: +G.FPS.upd.toFixed(2),
            kills: st.kills, hits: DS.combat.hits || 0, enemies: st.enemies.length,
          };
          G.benchDone = true;
        }
      }
    }
      if (frames === 2) { window.__DS_READY = true; }
      window.__DS_INFO = {
        fps: +G.FPS.avg.toFixed(1), p95: +G.FPS.p95.toFixed(1), p99: +G.FPS.p99.toFixed(1),
        draw: +G.FPS.draw.toFixed(2), upd: +G.FPS.upd.toFixed(2), frameMed: +(G.FPS.rawMed * 1000).toFixed(2),
        frames, kills: st.kills, hits: DS.combat.hits || 0,
        hero: { x: Math.round(st.hero.x), y: Math.round(st.hero.y), hp: Math.round(st.hero.hp), atk: st.hero.atk, comboT: +DS.combat.comboT.toFixed(2) },
        enemies: st.enemies.length,
      };
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* --------------------------------------------------------------- update */
  function update(st, dt) {
    if (st.paused) return;
    st.t += dt;
    const h = st.hero;
    const F = DS.fx;
    // timers
    for (const k in st.cds) st.cds[k] = Math.max(0, st.cds[k] - dt);
    if (st.rageT > 0) st.rageT -= dt;
    h.invuln = Math.max(0, h.invuln - dt);
    h.hurtT = Math.max(0, h.hurtT - dt);
    h.dashT = Math.max(0, h.dashT - dt);
    F.update(dt);

    // movimento
    let ix = 0, iy = 0;
    if (keys['a'] || keys['arrowleft']) ix -= 1;
    if (keys['d'] || keys['arrowright']) ix += 1;
    if (keys['w'] || keys['arrowup']) iy -= 1;
    if (keys['s'] || keys['arrowdown']) iy += 1;
    const L = Math.hypot(ix, iy);
    if (L > 0) { ix /= L; iy /= L; }
    const speed = (st.rageT > 0 ? 1080 : 880) * (h.dashT > 0 ? 2.1 : 1);
    h.moving = L > 0 ? 1 : 0;
    if (h.moving > 0 && h.atk < 0) {
      const target = Math.atan2(iy, ix);
      h.faceDir = Math.cos(target) >= 0 ? 1 : -1;
      h.vx += (ix * speed - h.vx) * Math.min(1, dt * 9);
      h.vy += (iy * speed * 0.78 - h.vy) * Math.min(1, dt * 9);
    } else {
      h.vx *= Math.pow(0.0016, dt);
      h.vy *= Math.pow(0.0016, dt);
    }
    h.x = DS.clamp(h.x + h.vx * dt, 700, DS.arena.W - 500);
    h.y = DS.clamp(h.y + h.vy * dt, 600, DS.arena.H - 400);
    // poeira ao andar
    if (h.moving && h.atk < 0) {
      h.dust -= dt;
      if (h.dust <= 0) { h.dust = 0.16; DS.fx.dust(h.x - h.faceDir * 30, h.y, 3); }
    }

    // ataque
    input.attack = input.attackPressed || keys['j'] || input.mouseDown;
    if (input.attackPressed) {
      input.attackPressed = false;
      if (h.atk < 0) DS.combat.start(st); else DS.combat.buffer = true;
    }
    DS.combat.update(st, dt);

    // pose quando não está atacando
    if (h.atk < 0 && h.hurtT <= 0) {
      if (h.moving) {
        h.runT += dt * (st.rageT > 0 ? 1.25 : 1);
        h.pose = DS.mixPose(DS.POSE.walk(h.runT, 1), DS.POSE.run(h.runT, 1), 0.55);
      } else h.pose = DS.POSE.idle(st.t);
    } else if (h.hurtT > 0) {
      h.pose = DS.POSE.hurt(1 - h.hurtT / 0.4);
    }
    if (st.rageT > 0 && DS.fx.parts.length < 220) {
      DS.fx.spark(h.x + (Math.random() - 0.5) * 240, h.y - 380 - Math.random() * 240, 1, -Math.PI / 2, '#ff8a1e');
    }

    // pose travada (evidência / inspeção): ?freeze=attack:0:0.40
    if (G.freeze) {
      const fz = G.freeze;
      const ps = fz.kind === 'attack'
        ? DS.POSE.attack(fz.u, fz.idx)
        : (DS.POSE[fz.kind] ? DS.POSE[fz.kind](fz.u) : DS.POSE.idle(0));
      h.pose = ps; h.fk = DS.fk(ps); h.atk = -1;
    }

    // inimigos
    const ctxw = {
      hero: h, enemies: st.enemies,
      onEnemyHit(e, dmg, dir) {
        if (h.invuln > 0 || h.hp <= 0) return;
        h.hp -= dmg;
        h.hurtT = 0.4;
        h.invuln = 0.9;
        h.vx = -dir * 900; h.vy = -220;
        DS.fx.blood(h.x, h.y - 320, 12, dir > 0 ? Math.PI : 0);
        DS.fx.addShake(8);
        if (h.hp <= 0) { h.hp = 0; }
      },
    };
    for (const e of st.enemies) DS.enemy.update(e, dt, ctxw);
    // limpa e recompõe a horda
    const before = st.enemies.length;
    st.enemies = st.enemies.filter((e) => !(e.dead && e.st >= 1) || false);
    if (st.enemies.length < before) st.kills += before - st.enemies.length;
    if (st.enemies.length < (G.spawnCount || 4)) spawnEnemies(st, G.spawnCount || 4);

    // morte do herói
    if (h.hp <= 0 && (keys['r'])) {
      h.hp = h.maxHp; h.x = 3000; h.y = 2000; h.invuln = 1.2;
      st.kills = 0; st.enemies.length = 0; spawnEnemies(st, 4);
    }
    updateCamera(st, dt);
  }

  /* --------------------------------------------------------------- render */
  /* Folha de poses: o MESMO renderer desenha os 3 ataques em 3 fases.
   * Serve de evidência de ETAPA 2 (rig + animação) e de bancada de ajuste. */
  function drawSheet(ctx) {
    const kind = G.sheet || 'attacks';
    ctx.fillStyle = '#14251f'; ctx.fillRect(0, 0, W, H);
    if (kind === 'hero') {
      /* Régua de proporções: mesma geometria do jogo, ampliada (ETAPA 1/2) */
      const S = 0.42;
      const ox = W * 0.56, oy = H * 0.94;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(S, S);
      DS.drawHero(ctx, { pose: DS.POSE.idle(0.6), x: 0, y: -DS.SK.GROUND, yaw: 0.25, facing: 1, frontArms: true });
      ctx.restore();
      // linhas de referência a cada 200 unidades
      ctx.save();
      ctx.font = '600 15px monospace';
      for (let u = 0; u <= 1400; u += 200) {
        const y = oy - u * S;
        ctx.strokeStyle = u === 0 ? 'rgba(255,217,160,0.85)' : 'rgba(255,217,160,0.18)';
        ctx.lineWidth = u === 0 ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(ox - 420 * S, y); ctx.lineTo(ox + 470 * S, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,217,160,0.65)';
        ctx.fillText(u + ' u', ox - 420 * S - 54, y + 5);
      }
      ctx.fillStyle = '#ffd9a0';
      ctx.font = '700 20px "Trebuchet MS", sans-serif';
      ctx.fillText('HERÓI PROCEDURAL — idle, ampliado 0.42x (pivô na pelve, 1 u = 1 unidade do rig)', 30, 34);
      ctx.font = '600 16px "Trebuchet MS", sans-serif';
      ctx.fillStyle = '#cbb99a';
      ctx.fillText('altura total ≈ 1400 u (pelve em 460 · ombros em 675 · topo do cabelo em 1400)', 30, 60);
      ctx.fillStyle = '#9fb0c0';
      ctx.fillText('renderizado pelo MESMO DS.drawHero do jogo — sem sprite, sem PNG', 30, 84);
      ctx.restore();
      return;
    }
    const cols = 3, rows = 3;
    const cw = W / cols, ch = H / rows;
    const names = ['A1 corte direito', 'A2 backhand esquerdo', 'A3 duplo descendente'];
    const us = [0.14, 0.40, 0.78];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const u = us[j];
        const pose = DS.POSE.attack(u, i);
        ctx.save();
        ctx.beginPath(); ctx.rect(j * cw, i * ch, cw, ch); ctx.clip();
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.020)' : 'rgba(0,0,0,0.10)';
        ctx.fillRect(j * cw, i * ch, cw, ch);
        ctx.translate(j * cw + cw * 0.46, i * ch + ch * 0.94);
        ctx.scale(0.170, 0.170);
        DS.drawHero(ctx, { pose, x: 0, y: -DS.SK.GROUND, yaw: 0.25, facing: 1, frontArms: true });
        ctx.restore();
        ctx.save();
        ctx.fillStyle = '#ffd9a0';
        ctx.font = '600 21px "Trebuchet MS", sans-serif';
        ctx.fillText(names[i] + '   u=' + u.toFixed(2), j * cw + 14, i * ch + 28);
        ctx.strokeStyle = 'rgba(255,217,160,0.22)';
        ctx.strokeRect(j * cw + 0.5, i * ch + 0.5, cw, ch);
        ctx.restore();
      }
    }
  }

  function render(st, t0) {
    if (G.sheet) { drawSheet(G.ctx); return; }
    const ctx = G.ctx;
    const h = st.hero;
    const cam = st.cam;
    const sh = DS.fx.shake;
    const sx = sh ? (Math.random() - 0.5) * sh * 2 : 0;
    const sy = sh ? (Math.random() - 0.5) * sh * 2 : 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const FL = DS.flags || { ground: true, props: true, fx: true, hud: true, enemies: true, hero: true };
    if (!FL.ground) { ctx.fillStyle = '#20463a'; ctx.fillRect(0, 0, W, H); }

    ctx.save();
    ctx.translate(sx, sy);
    if (FL.ground) DS.arena.drawGround(ctx, cam, W, H, W / PLAY);
    ctx.save();
    ctx.scale(PLAY, PLAY);
    ctx.translate(-cam.x, -cam.y);
    const vw = W / PLAY, vh = H / PLAY;
    if (FL.props) DS.arena.drawProps(ctx, cam, vw, vh, h.y, true);

    if (FL.fx) DS.fx.draw(ctx, 'back');
    // inimigos atrás do herói
    const sorted = st.enemies.slice().sort((a, b) => a.y - b.y);
    if (FL.enemies) for (const e of sorted) if (e.y <= h.y) DS.drawEnemy(ctx, e, st.t);
    // herói
    if (FL.hero) {
      DS.drawHero(ctx, { pose: h.pose, x: h.x, y: h.y - DS.SK.GROUND, yaw: 0.25, facing: h.faceDir, frontArms: true });
      h.fk = DS.fk(h.pose);
    }
    if (FL.enemies) for (const e of sorted) if (e.y > h.y) DS.drawEnemy(ctx, e, st.t);
    if (FL.props) DS.arena.drawProps(ctx, cam, vw, vh, h.y, false);
    if (FL.fx) DS.fx.draw(ctx, 'front');

    if (st.debug) debugOverlay(ctx, st);
    ctx.restore();
    ctx.restore();

    if (FL.hud) drawHUD(ctx, st, G.FPS);
    if (window.__BENCH) drawBenchResult(ctx, window.__BENCH);
  }

  /* Resultado fixo do ?bench=N: os números são gravados quando a janela fecha
   * (window.__BENCH) e desenhados em tela cheia de HUD — não mudam depois,
   * então a captura não depende do último quadro do compositor. */
  function drawBenchResult(ctx, B) {
    if (!B || typeof B.fpsAvg !== 'number') return;
    const x = 24, y = H - 226, w = 392, h = 118;
    ctx.save();
    ctx.fillStyle = 'rgba(8,10,12,0.82)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(140,240,140,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 14px monospace';
    ctx.fillStyle = '#9fb0c0';
    ctx.fillText('BENCH ' + B.seconds.toFixed(1) + 's · ' + B.enemies + ' inimigos · ' + B.res, x + 16, y + 24);
    ctx.font = '800 28px monospace';
    ctx.fillStyle = B.fpsAvg >= 200 ? '#8ef08e' : '#ffd27a';
    ctx.fillText(B.fpsAvg.toFixed(1) + ' FPS médio', x + 16, y + 56);
    ctx.font = '600 14px monospace';
    ctx.fillStyle = '#cfe6ff';
    ctx.fillText('p50 ' + B.fpsP50.toFixed(0) + '  p95 ' + B.fpsP95.toFixed(0) + '  p99 ' + B.fpsP99.toFixed(0), x + 16, y + 80);
    ctx.fillText('draw ' + B.drawMs.toFixed(2) + ' ms  ·  upd ' + B.updMs.toFixed(2) + ' ms', x + 16, y + 100);
    ctx.fillStyle = '#8b9aa8';
    ctx.font = '500 12px monospace';
    ctx.fillText(B.stallsOver100ms + ' stalls >100ms · ' + B.framesMeasured + ' quadros', x + 16, y + 114);
    ctx.restore();
  }

  /* Painel de performance em bitmap cacheado: o texto é caro em raster por
   * software. Redesenha no máximo 4x/s; o resto do tempo é um blit. */
  let perfCv = null, perfKey = '', perfAt = -1e9;
  function drawPerfPanel(ctx, FPS) {
    const key = FPS.avg.toFixed(0) + '|' + FPS.p95.toFixed(0) + '|' + FPS.p99.toFixed(0) + '|' + FPS.draw.toFixed(2);
    if (!perfCv) { perfCv = document.createElement('canvas'); perfCv.width = 246; perfCv.height = 92; }
    const now = performance.now();
    if (key !== perfKey && now - perfAt >= 250) {
      perfKey = key; perfAt = now;
      const c = perfCv.getContext('2d');
      c.clearRect(0, 0, 246, 92);
      c.fillStyle = 'rgba(8,10,12,0.55)';
      c.fillRect(0, 0, 246, 92);
      c.font = '600 15px monospace';
      c.fillStyle = FPS.avg >= 200 ? '#8ef08e' : (FPS.avg >= 120 ? '#ffe07a' : '#ff8f7a');
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.fillText('FPS médio ' + FPS.avg.toFixed(0), 12, 22);
      c.fillStyle = '#cfe6ff';
      c.fillText('p95 ' + FPS.p95.toFixed(0) + '   p99 ' + FPS.p99.toFixed(0), 12, 42);
      c.fillText('draw ' + FPS.draw.toFixed(2) + ' ms', 12, 62);
      c.fillStyle = '#9fb0c0';
      c.fillText('1280x720 · buffer nativo', 12, 82);
    }
    ctx.drawImage(perfCv, W - 258, 12);
  }

  function debugOverlay(ctx, st) {
    const h = st.hero;
    const px = 1 / (DS.PLAY || 0.24);   // 1 px de tela em unidades de mundo
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,180,0.85)';
    ctx.lineWidth = 2 * px;
    const seg = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
    const f = DS.fk(h.pose);
    ctx.save();
    ctx.translate(h.x, h.y - DS.SK.GROUND);
    if (h.faceDir < 0) ctx.scale(-1, 1);
    seg(f.pelvis, f.neck);
    seg(f.shoulderR, f.elbowR); seg(f.elbowR, f.wristR);
    seg(f.shoulderL, f.elbowL); seg(f.elbowL, f.wristL);
    seg(f.hipR, f.kneeR); seg(f.kneeR, f.ankleR);
    seg(f.hipL, f.kneeL); seg(f.kneeL, f.ankleL);
    for (const side of [1, -1]) {
      const b = DS.bladeWorld(side, side > 0 ? f.wristR : f.wristL, side > 0 ? h.pose.wR : h.pose.wL);
      ctx.strokeStyle = 'rgba(255,120,40,0.95)';
      ctx.lineWidth = 3 * px;
      seg(b.root, b.tip);
    }
    ctx.restore();
    // círculo de acerto do inimigo: MESMOS valores usados no combate (unidades de mundo)
    ctx.strokeStyle = 'rgba(255,60,180,0.85)';
    ctx.lineWidth = 2 * px;
    for (const e of st.enemies) {
      if (e.dead) continue;
      ctx.beginPath();
      ctx.arc(e.x, e.y - DS.SKEL.HIT_Y, DS.SKEL.HIT_R, 0, Math.PI * 2);
      ctx.stroke();
      const r = 3 * px;
      ctx.fillStyle = 'rgba(0,255,180,0.9)';
      ctx.fillRect(e.x - r, e.y - r, r * 2, r * 2);
    }
    ctx.restore();
  }
})(window.DS);
