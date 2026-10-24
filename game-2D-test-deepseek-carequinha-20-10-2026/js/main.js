'use strict';
// main.js — loop principal, entrada WASD + clique com combo de 3 golpes, câmera
// que segue o herói, HUD de retrato, modo esqueleto (B) e câmera lenta (T).
// Também expõe window.DBG para a automação/crítico capturar tudo determinístico.
(() => {
  const { Pilot } = window;
  const DEG = Pilot.DEG, TAU = Math.PI * 2;
  const add = Pilot.add, mul = Pilot.mul;

  const game = document.getElementById('game');
  const portrait = document.getElementById('portrait');
  const ctx = game.getContext('2d');
  const pctx = portrait.getContext('2d');

  Pilot.World.build();

  const state = {
    hero: { x: 0, y: 60, z: 0 }, yaw: Math.PI / 2,
    speed: 0, px: 2.25, paused: false, slow: false, showSkel: false,
    mouse: { x: 0, y: 0 }, keys: {}, attackDir: null, prevIndex: -1, ms: 0,
  };
  const combat = new Pilot.Combat();
  const fx = new Pilot.Effects();
  let clock = 0, dpr = 1;

  const camOffset = () => {
    const s = Pilot.project([state.hero.x, state.hero.y, state.hero.z]);
    return { sx: s[0], sy: s[1] };
  };
  const screenToWorld = (mx, my) => {
    const c = camOffset();
    return Pilot.unproject([(mx * dpr - (game.width * 0.5 - c.sx * state.px * dpr)) / (state.px * dpr),
                            (my * dpr - (game.height * 0.62 - c.sy * state.px * dpr)) / (state.px * dpr)]);
  };

  function inputDir() {
    let sx = 0, sy = 0;
    if (state.keys['KeyW'] || state.keys['ArrowUp']) sy -= 1;
    if (state.keys['KeyS'] || state.keys['ArrowDown']) sy += 1;
    if (state.keys['KeyA'] || state.keys['ArrowLeft']) sx -= 1;
    if (state.keys['KeyD'] || state.keys['ArrowRight']) sx += 1;
    if (!sx && !sy) return null;
    const w = Pilot.unproject([sx, sy]);
    const L = Math.hypot(w[0], w[1]) || 1;
    return [w[0] / L, w[1] / L];
  }

  function attackAtWorld(wx, wy) {
    const dx = wx - state.hero.x, dy = wy - state.hero.y;
    const L = Math.hypot(dx, dy) || 1;
    state.attackDir = [dx / L, dy / L];
    combat.click();
  }

  function makeRigNow() {
    return Pilot.makeRig({
      pos: [state.hero.x, state.hero.y, state.hero.z], yaw: state.yaw, time: clock,
      speed: state.speed, combat: { index: combat.index, time: combat.t },
    });
  }

  function update(dt) {
    dt *= state.slow ? 0.25 : 1;
    clock += dt;
    Pilot.World.update(dt);

    const dir = inputDir();
    const MOVE = 165;
    if (dir && combat.index < 0) {
      state.hero.x += dir[0] * MOVE * dt;
      state.hero.y += dir[1] * MOVE * dt;
      state.yaw = Pilot.angleLerp(state.yaw, Math.atan2(dir[1], dir[0]), 0.25);
      state.speed = 1;
    } else state.speed = 0;

    const r = Math.hypot(state.hero.x, state.hero.y), maxR = Pilot.World.ARENA - 26;
    if (r > maxR) { state.hero.x *= maxR / r; state.hero.y *= maxR / r; }

    if (combat.index >= 0 && state.attackDir) {
      state.yaw = Pilot.angleLerp(state.yaw, Math.atan2(state.attackDir[1], state.attackDir[0]), 0.4);
    }

    combat.update(dt);

    // transições do combo → efeitos
    const ci = combat.index, pi = state.prevIndex;
    if (ci !== pi) {
      if (pi >= 0) fx.endSlash();
      if (ci >= 0) {
        fx.beginSlash();
        const hx = state.hero.x + Math.cos(state.yaw) * 62, hy = state.hero.y + Math.sin(state.yaw) * 62;
        const hs = Pilot.project([hx, hy, 42]);
        fx.impact(hs[0], hs[1], ci === 2 ? 1.6 : 1);
        if (ci === 2) { fx.shockwave(hs[0], hs[1]); fx.krak(hs[0], hs[1]); Pilot.World.shock(hx, hy, 1); }
      }
      state.prevIndex = ci;
    }
    if (ci >= 0) {
      const rig = makeRigNow();
      const tip = Pilot.project(add(rig.handR, mul(rig.swordDir, 54)));
      fx.slash(tip[0], tip[1]);
    }
    fx.update(dt);
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const cv of [game, portrait]) {
      const b = cv.getBoundingClientRect();
      const w = Math.max(1, Math.round(b.width * dpr)), h = Math.max(1, Math.round(b.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
  }

  function drawSkeleton(rig) {
    const seg = (a, b) => { const p = Pilot.project(a), q = Pilot.project(b); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
    ctx.strokeStyle = '#dbb56c'; ctx.lineWidth = 1.2;
    seg(rig.hips, rig.neck); seg(rig.neck, rig.head);
    seg(rig.shoulderR, rig.shoulderL); seg(rig.shoulderR, rig.hips); seg(rig.shoulderL, rig.hips);
    for (const l of rig.limbs) { seg(l.root, l.joint); seg(l.joint, l.end); }
    ctx.strokeStyle = '#ff7ad1';
    for (const l of rig.limbs) { const p = Pilot.project(l.joint), q = Pilot.project(add(l.joint, mul(l.pole, 22))); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    ctx.fillStyle = '#7ad1ff';
    for (const l of rig.limbs) { const p = Pilot.project(l.target); ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, TAU); ctx.fill(); }
  }

  function draw() {
    const t0 = performance.now();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0f1418'; ctx.fillRect(0, 0, game.width, game.height);

    const c = camOffset();
    const px = state.px * dpr;
    ctx.setTransform(px, 0, 0, px, game.width * 0.5 - c.sx * px, game.height * 0.62 - c.sy * px);

    Pilot.World.ground(ctx);
    const rig = makeRigNow();
    const hd = Pilot.project([state.hero.x, state.hero.y, state.hero.z])[2];

    Pilot.World.propsBack(ctx, clock, hd);

    const sh = Pilot.project([state.hero.x, state.hero.y, 1]);
    ctx.fillStyle = 'rgba(0,0,0,.42)';
    const sp = new Path2D(); sp.ellipse(sh[0], sh[1] + 2, 24, 10, 0, 0, TAU); ctx.fill(sp);

    Pilot.drawHero(ctx, rig, { headScale: 1 });
    Pilot.World.propsFront(ctx, clock, hd);
    fx.draw(ctx);
    if (state.showSkel) drawSkeleton(rig);

    // HUD: retrato
    pctx.setTransform(1, 0, 0, 1, 0, 0);
    pctx.fillStyle = '#1a2026'; pctx.fillRect(0, 0, portrait.width, portrait.height);
    const hs = (portrait.height * 0.82) / 64;
    pctx.setTransform(hs, 0, 0, hs, portrait.width * 0.5, portrait.height * 0.55);
    Pilot.drawHead(pctx, { pos: [0, 0, 0], yaw: Math.PI / 4 - 0.30, scale: 1 });

    state.ms = performance.now() - t0;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!state.paused) update(dt);
    resize(); draw();
    requestAnimationFrame(frame);
  }

  // ---- input ---------------------------------------------------------------
  addEventListener('keydown', e => {
    state.keys[e.code] = true;
    if (e.code === 'KeyB') state.showSkel = !state.showSkel;
    if (e.code === 'KeyT') state.slow = !state.slow;
  });
  addEventListener('keyup', e => { state.keys[e.code] = false; });
  game.addEventListener('mousemove', e => { const b = game.getBoundingClientRect(); state.mouse.x = e.clientX - b.left; state.mouse.y = e.clientY - b.top; });
  game.addEventListener('mousedown', e => {
    const b = game.getBoundingClientRect();
    const w = screenToWorld(e.clientX - b.left, e.clientY - b.top);
    attackAtWorld(w[0], w[1]);
  });

  // ---- superfície de automação (crítico headless) --------------------------
  window.DBG = {
    pause: v => { state.paused = !!v; },
    step: (n = 1) => { for (let i = 0; i < n; i++) update(1 / 60); draw(); },
    render: () => draw(),
    key: (code, down) => { state.keys[code] = !!down; },
    click: (wx, wy) => attackAtWorld(wx, wy),
    debug: v => { state.showSkel = !!v; },
    info: () => ({ ms: +state.ms.toFixed(2), state: combat.index, x: +state.hero.x.toFixed(1), y: +state.hero.y.toFixed(1), yaw: +state.yaw.toFixed(2) }),
  };

  addEventListener('resize', () => { resize(); draw(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { resize(); draw(); } });
  resize(); draw();
  requestAnimationFrame(frame);
})();