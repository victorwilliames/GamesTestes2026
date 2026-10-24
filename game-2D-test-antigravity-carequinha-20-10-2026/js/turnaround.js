'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — turnaround.js
// Bancada de Inspeção do Herói em 8 Ângulos (0° a 315°)
// Usa EXATAMENTE o mesmo motor gráfico (Agy.Hero.drawHero) do jogo principal
// =============================================================================

(() => {
  const canvas = document.getElementById('turn');
  const ctx = canvas.getContext('2d');
  const DEG = globalThis.Agy.Core.DEG;
  let time = 0;

  function drawCell(col, row, totalCols, totalRows) {
    const cellW = canvas.width / totalCols;
    const cellH = canvas.height / totalRows;
    return {
      x: cellW * col,
      y: cellH * row,
      width: cellW,
      height: cellH,
      centerX: cellW * (col + 0.5),
      centerY: cellH * (row + 0.62)
    };
  }

  function renderTurnaround() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0f1418';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cols = 4;
    const rows = 2;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;
    const scale = (cellH * 0.62) / 150;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const yawDeg = (r * cols + c) * 45;
        const cell = drawCell(c, r, cols, rows);

        ctx.save();
        ctx.beginPath();
        ctx.rect(cellW * c, cellH * r, cellW, cellH);
        ctx.clip();

        ctx.setTransform(scale, 0, 0, scale, cell.centerX, cell.centerY);

        const rig = globalThis.Agy.Rig.buildRig({
          pos: [0, 0, 0],
          yaw: yawDeg * DEG,
          time,
          speed: 0,
          combat: { index: -1, time: 0 }
        });

        globalThis.Agy.Hero.drawHero(ctx, rig);
        ctx.restore();

        // Rótulo do ângulo
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#dbb56c';
        ctx.font = `bold ${Math.round(13 * dpr)}px Consolas, monospace`;
        ctx.fillText(`${yawDeg}°`, cellW * c + 14 * dpr, cellH * r + 24 * dpr);

        // Grade divisória
        ctx.strokeStyle = '#222830';
        ctx.lineWidth = 1;
        ctx.strokeRect(cellW * c, cellH * r, cellW, cellH);
      }
    }
  }

  function animate() {
    time += 1 / 60;
    renderTurnaround();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', renderTurnaround);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderTurnaround();
  });

  renderTurnaround();
  requestAnimationFrame(animate);
})();
