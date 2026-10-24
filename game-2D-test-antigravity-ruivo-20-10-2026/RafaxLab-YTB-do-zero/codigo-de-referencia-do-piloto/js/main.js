'use strict';
// =============================================================================
// main.js — laço do jogo: entrada, estado do combo, câmera e composição.
//   Por quadro: 1 drawImage do fundo + 1 do chão (caches) → sprites com
//   balanço do vento → personagem (pintado do zero) → rastro → vento/efeitos.
// =============================================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hudCanvas = document.getElementById('portrait');
const hctx = hudCanvas.getContext('2d');

const RUN_SPEED = 330;

const Game = {
  t: 0, slow: false, debug: false, hitstop: 0, shake: 0,
  props: [], tufts: [], sprites: null, ground: null, bg: null, vignette: null,
  ready: false, frameMs: 16,
};
const Player = {
  pos: [0, 150, 0], vel: [0, 0], facing: Math.PI / 4,
  anim: new Animator(), cape: new Cape(), trail: new SwordTrail(),
  state: 'move', combo: -1, queued: false, queuedAim: null, atkDir: [1, 0], lungePrev: 0,
  rig: null, blink: false, blinkT: 2.5, stepPhase: 0,
};
const Input = { keys: new Set(), mouse: [0, 0], clicked: false, mouseIn: false };

// ---------------------------------------------------------------- entrada --
addEventListener('keydown', e => {
  if (e.repeat) return;
  Input.keys.add(e.code);
  if (e.code === 'KeyB') { Game.debug = !Game.debug; showToast(Game.debug ? 'Esqueleto 3D + IK: visível' : 'Esqueleto 3D + IK: oculto'); }
  if (e.code === 'KeyT') { Game.slow = !Game.slow; showToast(Game.slow ? 'Câmera lenta: 25%' : 'Velocidade normal'); }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => Input.keys.delete(e.code));
addEventListener('blur', () => Input.keys.clear());
canvas.addEventListener('mousemove', e => { Input.mouse = [e.clientX * Cam.dpr, e.clientY * Cam.dpr]; Input.mouseIn = true; });
canvas.addEventListener('mouseleave', () => { Input.mouseIn = false; });
canvas.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  Input.mouse = [e.clientX * Cam.dpr, e.clientY * Cam.dpr];
  Input.clicked = true;
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
const key = c => Input.keys.has(c);

function moveInput() {
  let ix = 0, iy = 0;
  if (key('KeyA') || key('ArrowLeft')) ix -= 1;
  if (key('KeyD') || key('ArrowRight')) ix += 1;
  if (key('KeyW') || key('ArrowUp')) iy -= 1;
  if (key('KeyS') || key('ArrowDown')) iy += 1;
  if (!ix && !iy) return null;
  // direita da tela = mundo (1,-1)/√2 ; baixo da tela = mundo (1,1)/√2
  const wx = (ix + iy) * SQ1_2, wy = (iy - ix) * SQ1_2;
  const l = Math.hypot(wx, wy);
  return [wx / l, wy / l];
}
function aimDir() {
  const g = screenToGround(Input.mouse[0], Input.mouse[1]);
  const dx = g[0] - Player.pos[0], dy = g[1] - Player.pos[1];
  const l = Math.hypot(dx, dy);
  if (l < 4) return [Math.cos(Player.facing), Math.sin(Player.facing)];
  return [dx / l, dy / l];
}

// ---------------------------------------------------------------- combo ----
function startAttack(i, dir) {
  const P = Player;
  P.state = 'attack'; P.combo = i; P.queued = false;
  P.atkDir = dir; P.facing = Math.atan2(dir[1], dir[0]);
  P.lungePrev = 0;
  P.vel[0] *= 0.25; P.vel[1] *= 0.25;
  P.anim.startAttack(i);
  HUD.setCombo(i + 1);
}
function endAttack() {
  Player.state = 'move'; Player.combo = -1; Player.queued = false;
  Player.anim.endAttack();
  HUD.setCombo(0);
}

function onHit(i) {
  const P = Player;
  const rig = P.rig;
  if (i === 2) {
    // golpe final: impacto no chão
    const tip = swordTip(rig);
    const x = lerp(P.pos[0], tip[0], 0.75), y = lerp(P.pos[1], tip[1], 0.75);
    FX.ring(x, y, 250, 0.42, 11);
    FX.ring(x, y, 150, 0.3, 6);
    FX.crack(x, y);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU + Math.random() * 0.3, d = 30 + Math.random() * 30;
      FX.puff(x + Math.cos(a) * d, y + Math.sin(a) * d, 6, 6, 20 + Math.random() * 10, 0.55 + Math.random() * 0.2, Math.cos(a) * 260, Math.sin(a) * 260, 40);
    }
    FX.word('KRAK!', x, y, 120);
    Wind.shock(x, y, 3.2, 950, 0.9, 150);
    Game.shake = 11; Game.hitstop = 0.075;
    kickProps(x, y, 330, 2.6, true);
  } else {
    Game.shake = 3;
    const fx = P.pos[0] + P.atkDir[0] * 90, fy = P.pos[1] + P.atkDir[1] * 90;
    kickProps(fx, fy, 150, 1.6, false);
    Wind.shock(fx, fy, 1.0, 700, 0.45, 90);
  }
}
// sacode vegetação atingida e solta folhas
function kickProps(x, y, radius, strength, radial) {
  for (const p of Game.props.concat(Game.tufts)) {
    const dx = p.x - x, dy = p.y - y;
    const d = Math.hypot(dx, dy);
    if (d > radius + p.r) continue;
    const f = 1 - d / (radius + p.r);
    const dirX = radial ? screenX(dx, dy) / (d || 1) : screenX(Player.atkDir[0], Player.atkDir[1]);
    const gain = p.kind === 'tuft' ? 9 : p.kind === 'bush' ? 7 : p.kind === 'oak' || p.kind === 'cypress' ? 3 : 0;
    p.va += Math.sign(dirX || 1) * strength * gain * f;
    if (p.kind === 'bush' && f > 0.15) FX.leafBurst(p.x, p.y, 40, 5 + Math.round(f * 6), 140);
    if ((p.kind === 'oak' || p.kind === 'cypress') && f > 0.2) FX.leafBurst(p.x, p.y, 260, 6, 160);
  }
}

// ---------------------------------------------------------------- update ---
function collide(p) {
  const r = Math.hypot(p[0], p[1]);
  const R = edgeR(Math.atan2(p[1], p[0])) - 48;
  if (r > R) { p[0] *= R / r; p[1] *= R / r; }
  for (const o of Game.props) {
    if (o.kind === 'bush') continue;
    const cr = o.r + 20;
    const dx = p[0] - o.x, dy = p[1] - o.y, d = Math.hypot(dx, dy);
    if (d < cr && d > 1e-3) { p[0] = o.x + (dx / d) * cr; p[1] = o.y + (dy / d) * cr; }
  }
}

function updatePlayer(dt) {
  const P = Player, A = P.anim;
  const mv = moveInput();
  if (Input.clicked) {
    Input.clicked = false;
    if (P.state === 'move') startAttack(0, aimDir());
    else { P.queued = true; P.queuedAim = aimDir(); }
  }
  if (P.state === 'attack') {
    const def = A.atk.def, t = A.atk.t;
    if (P.queued && t >= def.cancel && P.combo < ATTACKS.length - 1) startAttack(P.combo + 1, P.queuedAim);
    else if (mv && !P.queued && t >= def.hitTime + 0.12) endAttack();
    else if (t >= def.total) {
      if (P.queued && P.combo === ATTACKS.length - 1) { startAttack(0, P.queuedAim); }
      else endAttack();
    }
  }
  // locomoção
  const tv = P.state === 'move' && mv ? [mv[0] * RUN_SPEED, mv[1] * RUN_SPEED] : [0, 0];
  const acc = P.state === 'move' ? (mv ? 11 : 14) : 18;
  P.vel[0] += (tv[0] - P.vel[0]) * Math.min(1, dt * acc);
  P.vel[1] += (tv[1] - P.vel[1]) * Math.min(1, dt * acc);
  P.pos[0] += P.vel[0] * dt; P.pos[1] += P.vel[1] * dt;
  const sp = Math.hypot(P.vel[0], P.vel[1]);
  if (P.state === 'move' && sp > 25) P.facing += angDiff(P.facing, Math.atan2(P.vel[1], P.vel[0])) * Math.min(1, dt * 13);

  // animação
  const prevT = A.atk ? A.atk.t : 0;
  A.update(dt, P.state === 'move' ? sp : 0);
  if (P.state === 'attack') {
    const atk = A.atk, def 
… (16421 caracteres a mais)