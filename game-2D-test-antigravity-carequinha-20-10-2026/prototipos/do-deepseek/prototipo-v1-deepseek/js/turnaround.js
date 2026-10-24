'use strict';
// turnaround.js — bancada de inspeção: o herói em 8 direções e nas poses do combo,
// desenhado pelo MESMO painter do jogo.
(() => {
  const canvas = document.getElementById('turn');
  const ctx = canvas.getContext('2d');
  const DEG = Pilot.DEG, TAU = Math.PI * 2;
  let clock = 0;

  function cell(col, row, cols, rows) {
    const cw = canvas.width / cols, ch = canvas.height / rows;
    return { x: cw * col, y: ch * row, w: cw, h: ch, cx: cw * (col + 0.5), cy: ch * (row + 0.62) };
  }

  function draw() {
    const b = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(b.width * dpr); canvas.height = Math.round(b.height * dpr);
    const W = canvas.width, H = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#10161a'; ctx.fillRect(0, 0, W, H);

    const cols = 4, rows = 2;
    const cw = W / cols, ch = H / rows;
    const px = ch * 0.62 / 150;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const yawDeg = (row * cols + col) * 45;
        const c = cell(col, row, cols, rows);
        ctx.save();
        ctx.beginPath(); ctx.rect(cw * col, ch * row, cw, ch); ctx.clip();
        ctx.setTransform(px, 0, 0, px, c.cx, c.cy);
        const rig = Pilot.makeRig({ pos: [0, 0, 0], yaw: yawDeg * DEG, time: clock, combat: { index: -1, time: 0 } });
        Pilot.drawHero(ctx, rig, { headScale: 1.08 });
        ctx.restore();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#aab2b3'; ctx.font = `${Math.round(12 * dpr)}px Consolas, monospace`;
        ctx.fillText(yawDeg + '°', cw * col + 10 * dpr, ch * row + 20 * dpr);
      }
    }
  }

  function frame() { clock += 1 / 60; draw(); requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) draw(); });
  window.addEventListener('resize', draw);
  draw();
  requestAnimationFrame(frame);
})();