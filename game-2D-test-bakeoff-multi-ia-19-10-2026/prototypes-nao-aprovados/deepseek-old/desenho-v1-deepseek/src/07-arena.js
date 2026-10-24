/* ============================================================================
 * 07-arena.js — ARENA DA ILHA (chão + cenário), 3/4 fake 2.5D
 * O chão é pintado UMA VEZ num buffer offscreen (draw call constante por frame).
 * Os props são peças em cache com sombra e ordenação por Y (profundidade).
 * Nada aqui usa imagem externa: tudo é geometria + pintura procedural.
 * Referência de composição: assets/references/ref-2d-maps/map-island-enemys.png
 * ========================================================================== */
(function (DS) {
  'use strict';

  const A = DS.arena = {
    W: 6000, H: 3800,       // tamanho do mundo em unidades do herói
    BS: 0.24,
    BS: 0.24,               // resolução do buffer de chão (igual ao zoom do jogo = blit 1:1)
    BAKE: 0.36,             // escala em que as peças de cenário são rasterizadas (nitidez x memória)
    SAND_X: 900,            // praia a oeste até este x
    SEA_X: 330,
    ground: null,
    props: [],
  };

  /* ------------------------------------------------------------- pinturas */
  function paintWater(ctx, x0, y0, x1, y1, rnd) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#2b7fa6');
    g.addColorStop(0.55, '#4aa8bd');
    g.addColorStop(1, '#7fd0cf');
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    // faixas de onda
    for (let i = 0; i < 90; i++) {
      const y = y0 + rnd() * (y1 - y0);
      const x = x0 + rnd() * (x1 - x0);
      const len = 30 + rnd() * 130;
      ctx.globalAlpha = 0.1 + rnd() * 0.25;
      ctx.strokeStyle = rnd() < 0.5 ? '#dff6f4' : '#1d6a91';
      ctx.lineWidth = 1 + rnd() * 2.6;
      ctx.beginPath();
      ctx.moveTo(x - len / 2, y);
      ctx.quadraticCurveTo(x, y - 3 - rnd() * 6, x + len / 2, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // espuma na areia
    for (let i = 0; i < 40; i++) {
      const y = y0 + rnd() * (y1 - y0);
      const x = x1 - 6 - rnd() * 46;
      ctx.globalAlpha = 0.25 + rnd() * 0.4;
      ctx.fillStyle = '#f2fbf8';
      ctx.beginPath();
      ctx.ellipse(x, y, 8 + rnd() * 26, 2 + rnd() * 5, 0, 0, 6.3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function paintSand(ctx, x0, x1, W, H, rnd) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#e6d3a4');
    g.addColorStop(0.6, '#d8c088');
    g.addColorStop(1, '#c2a896');
    ctx.fillStyle = g;
    // borda irregular entre areia e grama
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    for (let y = 0; y <= H; y += 40) {
      const x = x1 - 40 + Math.sin(y * 0.011) * 46 + rnd() * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x0, H);
    ctx.closePath();
    ctx.fill();
    // grãos e marcas
    for (let i = 0; i < 900; i++) {
      const x = x0 + rnd() * (x1 - x0);
      const y = rnd() * H;
      ctx.globalAlpha = 0.1 + rnd() * 0.3;
      ctx.fillStyle = rnd() < 0.5 ? '#f4e6bf' : '#a88f62';
      ctx.beginPath();
      ctx.ellipse(x, y, 1 + rnd() * 3, 1 + rnd() * 2, rnd() * 3, 0, 6.3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function paintGrass(ctx, x0, y0, x1, y1, rnd) {
    ctx.fillStyle = '#3f6b32';
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    // manchas grandes de tom
    for (let i = 0; i < 420; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
      const r = 26 + rnd() * 110;
      ctx.globalAlpha = 0.10 + rnd() * 0.2;
      ctx.fillStyle = rnd() < 0.33 ? '#4f8040' : (rnd() < 0.55 ? '#2f5527' : '#5f9448');
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.5 + rnd() * 0.6), rnd() * 3, 0, 6.3);
      ctx.fill();
    }
    // tufos de capim
    for (let i = 0; i < 26000; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
      if (x < A.SAND_X + 30) continue;
      ctx.globalAlpha = 0.25 + rnd() * 0.5;
      ctx.strokeStyle = rnd() < 0.42 ? '#79b45c' : (rnd() < 0.6 ? '#2c4f24' : '#93c46a');
      ctx.lineWidth = 1.4 + rnd() * 2.4;
      const h = 8 + rnd() * 26, a = -1.6 + rnd() * 0.7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * h * 0.5, y + Math.sin(a) * h * 0.5, x + Math.cos(a + 0.5) * h, y + Math.sin(a + 0.5) * h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // terra / folhas caídas
    for (let i = 0; i < 900; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
      if (x < A.SAND_X) continue;
      ctx.globalAlpha = 0.12 + rnd() * 0.3;
      ctx.fillStyle = rnd() < 0.5 ? '#2b2418' : '#7a5a2c';
      ctx.beginPath();
      ctx.ellipse(x, y, 4 + rnd() * 22, 3 + rnd() * 11, rnd() * 3, 0, 6.3);
      ctx.fill();
    }
    // flores e pedrinhas
    for (let i = 0; i < 260; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
      if (x < A.SAND_X) continue;
      const r = 3 + rnd() * 5;
      ctx.globalAlpha = 0.5 + rnd() * 0.4;
      ctx.fillStyle = rnd() < 0.4 ? '#f0d060' : (rnd() < 0.6 ? '#e07a9a' : '#cfd6c0');
      for (let p = 0; p < 5; p++) {
        const a = p / 5 * 6.283;
        ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, r * 0.7, r * 0.45, a, 0, 6.3); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* Caminho de terra batida ligando a praia ao interior. */
  function paintPath(ctx, rnd) {
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = '#9c7f56';
    ctx.beginPath();
    const HW = 150;
    const pts = [
      [A.SEA_X - 40, 2150], [1200, 2020], [2400, 2080], [3500, 1900], [4600, 1860], [A.W + 100, 1780],
    ];
    ctx.moveTo(pts[0][0], pts[0][1] - HW);
    for (let i = 1; i < pts.length; i++) {
      ctx.quadraticCurveTo((pts[i - 1][0] + pts[i][0]) / 2, pts[i][1] - HW - 40, pts[i][0], pts[i][1] - HW + 20);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const prev = pts[Math.max(0, i - 1)];
      ctx.quadraticCurveTo((pts[i][0] + prev[0]) / 2, pts[i][1] + HW + 40, pts[i][0], pts[i][1] + HW - 20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 2200; i++) {
      const t = rnd(), x = A.SEA_X + t * (A.W - A.SEA_X) + (rnd() - 0.5) * 420;
      const y = 2000 - t * 260 + (rnd() - 0.5) * 400;
      ctx.globalAlpha = 0.1 + rnd() * 0.35;
      ctx.fillStyle = rnd() < 0.5 ? '#7b6141' : '#c0a271';
      ctx.beginPath();
      ctx.ellipse(x, y, 4 + rnd() * 24, 3 + rnd() * 12, rnd() * 3, 0, 6.3);
      ctx.fill();
    }
    ctx.restore();
  }

  /* -------------------------------------------------------- peças de cenário */
  function palmPart(id, h, seed) {
    return DS.part('palm|' + id, {
      w: 660, h: h + 420, px: 330, py: h + 40, ss: A.BAKE,
      draw(ctx) {
        const rnd = DS.rng(seed);
        const H = h;
        // tronco curvo com anéis
        const trunk = DS.path();
        trunk.M(-26, 0);
        trunk.C(-30, -H * 0.35, -6 + rnd() * 10, -H * 0.7, 8, -H);
        trunk.C(14, -H * 1.04, 30, -H * 1.06, 40, -H * 0.98);
        trunk.C(30, -H * 0.66, 12, -H * 0.3, 26, 0);
        trunk.Z();
        DS.wash(ctx, trunk, {
          kind: 'wood', base: '#6b5636', shadow: '#332415', deep: '#1e1610', seed: seed + 1,
          box: [-60, -H - 20, 140, H + 40], inkW: 3.4, shadeAlpha: 0.5, blur: 8,
          hatch: { hatch: 26, len: [4, 16], w: [0.5, 1.8], dir: 1.5, cols: ['#a58a5c', '#241a10'], alpha: [0.06, 0.3] },
        });
        for (let i = 0; i < 12; i++) {
          const y = -H * (0.06 + i * 0.078);
          const w = 24 + (i / 12) * 12;
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = i % 2 ? '#3a2a19' : '#927a52';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-w * 0.9, y);
          ctx.quadraticCurveTo(0, y + 6, w * 0.9, y + (i % 2 ? 4 : -4));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // folhas (palmas) no topo
        const top = [20, -H * 1.0];
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI / 2 + (i - 4) * 0.36 + (rnd() - 0.5) * 0.16;
          const L = 190 + rnd() * 130;
          const leaf = DS.path();
          const ex = top[0] + Math.cos(a) * L, ey = top[1] + Math.sin(a) * L * 0.8;
          const nx = -Math.sin(a), ny = Math.cos(a);
          leaf.M(top[0], top[1]);
          leaf.Q(top[0] + Math.cos(a) * L * 0.5 + nx * 54, top[1] + Math.sin(a) * L * 0.42 + ny * 30, ex, ey);
          leaf.Q(top[0] + Math.cos(a) * L * 0.5 - nx * 54, top[1] + Math.sin(a) * L * 0.42 - ny * 30, top[0], top[1]);
          leaf.Z();
          DS.wash(ctx, leaf, {
            kind: 'leaf', base: i % 2 ? '#2f6b2c' : '#3c8434', shadow: '#14310f', deep: '#0d1f0b', seed: seed + 20 + i,
            box: [-320, -H - 260, 700, 400], inkW: 2.6, shadeAlpha: 0.45, blur: 6,
            rib: [top[0], top[1], ex, ey],
          });
        }
        // cocos
        for (let i = 0; i < 4; i++) {
          const cx = top[0] - 16 + rnd() * 32, cy = top[1] + 6 + rnd() * 16;
          ctx.fillStyle = '#4d3a20';
          ctx.beginPath(); ctx.ellipse(cx, cy, 9 + rnd() * 4, 8 + rnd() * 3, 0, 0, 6.3); ctx.fill();
          ctx.strokeStyle = '#1c130c'; ctx.lineWidth = 2; ctx.stroke();
        }
      },
    });
  }

  function bushPart(id, seed, big) {
    const W = big ? 520 : 360, H = big ? 420 : 300;
    return DS.part('bush|' + id, {
      w: W, h: H, px: W / 2, py: H - 30, ss: A.BAKE,
      draw(ctx) {
        const rnd = DS.rng(seed);
        for (let i = 0; i < (big ? 7 : 5); i++) {
          const cx = (rnd() - 0.5) * (big ? 300 : 200);
          const cy = -60 - rnd() * (big ? 210 : 140);
          const r = (big ? 120 : 84) + rnd() * (big ? 120 : 70);
          const blob = DS.path();
          blob.M(cx - r, cy);
          blob.C(cx - r, cy - r, cx + r, cy - r, cx + r, cy);
          blob.C(cx + r, cy + r * 0.9, cx - r, cy + r * 0.9, cx - r, cy);
          blob.Z();
          DS.wash(ctx, blob, {
            kind: 'leaf', base: i % 3 ? '#2d6329' : '#3d7c33', shadow: '#12290f', deep: '#0b1a0a', seed: seed + i * 7,
            box: [-W / 2, -H, W, H], inkW: 2.6, shadeAlpha: 0.5, blur: 7,
          });
        }
        for (let i = 0; i < 90; i++) {
          const x = (rnd() - 0.5) * W * 0.86, y = -20 - rnd() * H * 0.8;
          ctx.globalAlpha = 0.2 + rnd() * 0.4;
          ctx.strokeStyle = rnd() < 0.5 ? '#79c05a' : '#14310f';
          ctx.lineWidth = 1 + rnd() * 2;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 26, y - 8 - rnd() * 22); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      },
    });
  }

  function rockPart(id, seed, big) {
    const S = big ? 300 : 170;
    return DS.part('rock|' + id, {
      w: S * 1.6, h: S * 1.5, px: S * 0.8, py: S * 1.1, ss: A.BAKE,
      draw(ctx) {
        const rnd = DS.rng(seed);
        const r = DS.path();
        const n = 9;
        r.M(-S * 0.5, 0);
        for (let i = 1; i <= n; i++) {
          const a = Math.PI + (i / n) * Math.PI;
          const rad = S * (0.42 + rnd() * 0.2);
          r.L(Math.cos(a) * rad, Math.sin(a) * rad * 0.86);
        }
        r.C(S * 0.42, -S * 0.3, S * 0.34, 0, -S * 0.5, 0);
        r.Z();
        DS.wash(ctx, r, {
          kind: 'stone', base: '#8e8d86', shadow: '#4b4a45', deep: '#2d2c29', seed: seed + 1,
          box: [-S, -S, S * 2, S * 1.6], inkW: 3.4, shadeAlpha: 0.5, blur: 8,
          hatch: { hatch: 30, len: [3, 14], w: [0.5, 1.6], dir: -0.4, cols: ['#c9c7bd', '#3a3936'], alpha: [0.06, 0.26] },
        });
        // limo no topo
        const moss = DS.path();
        moss.M(-S * 0.36, -S * 0.16);
        moss.C(-S * 0.1, -S * 0.3, S * 0.3, -S * 0.26, S * 0.4, -S * 0.05);
        moss.C(S * 0.2, S * 0.06, -S * 0.2, S * 0.06, -S * 0.36, -S * 0.16);
        moss.Z();
        DS.wash(ctx, moss, {
          kind: 'leaf', base: '#4f8040', shadow: '#1d3a16', seed: seed + 5, box: [-S, -S, S * 2, S], inkW: 2, shadeAlpha: 0.5, blur: 4,
        });
      },
    });
  }

  function ruinPart(id, seed) {
    return DS.part('ruin|' + id, {
      w: 420, h: 520, px: 210, py: 430, ss: A.BAKE,
      draw(ctx) {
        const rnd = DS.rng(seed);
        // bloco de pedra + coluna quebrada
        const b = DS.path();
        b.M(-150, 0); b.L(-140, -120); b.L(140, -128); b.L(152, 4); b.Z();
        DS.wash(ctx, b, {
          kind: 'stone', base: '#9c9a8e', shadow: '#57554d', deep: '#33322d', seed: seed + 2,
          box: [-220, -200, 440, 240], inkW: 3.6, shadeAlpha: 0.55, blur: 8,
          hatch: { hatch: 26, len: [4, 16], w: [0.5, 2], dir: 1.2, cols: ['#cbc9bd', '#3d3c37'], alpha: [0.06, 0.3] },
        });
        const c = DS.path();
        c.M(-96, -120); c.L(-88, -330); c.L(24, -338); c.L(30, -124); c.Z();
        DS.wash(ctx, c, {
          kind: 'stone', base: '#a3a196', shadow: '#5b5950', deep: '#35342f', seed: seed + 3,
          box: [-160, -420, 260, 340], inkW: 3.4, shadeAlpha: 0.55, blur: 7,
          hatch: { hatch: 24, len: [4, 18], w: [0.5, 2], dir: 0.2, cols: ['#d3d1c6', '#42413b'], alpha: [0.06, 0.3] },
        });
        // ranhuras e trepadeira
        DS.strokes(ctx, ['M -70 -300 L 6 -296', 'M -66 -262 L 10 -258', 'M -60 -220 L 14 -216'], '#4a4842', 2.4, 0.5);
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = '#2f6329'; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(10, -320); ctx.bezierCurveTo(60, -280, 24, -220, 60, -160);
        ctx.bezierCurveTo(90, -120, 60, -60, 96, -16);
        ctx.stroke();
        for (let i = 0; i < 16; i++) {
          const t = i / 16;
          const x = 10 + Math.sin(t * 6) * 46 + t * 80, y = -320 + t * 300;
          ctx.fillStyle = i % 2 ? '#4d8f3c' : '#356b2c';
          ctx.beginPath(); ctx.ellipse(x, y, 12, 7, rnd() * 3, 0, 6.3); ctx.fill();
        }
        ctx.restore();
      },
    });
  }

  function cratePart(id, seed, barrel) {
    const W = 180, H = 190;
    return DS.part('crate|' + id, {
      w: W, h: H, px: W / 2, py: H - 20, ss: A.BAKE,
      draw(ctx) {
        const rnd = DS.rng(seed);
        const p = DS.path();
        if (barrel) {
          p.M(-52, 0); p.C(-60, -50, -60, -110, -50, -150);
          p.C(-20, -164, 20, -164, 50, -150);
          p.C(60, -110, 60, -50, 52, 0);
          p.Z();
        } else {
          p.M(-60, 0); p.L(-60, -124); p.L(60, -136); p.L(62, 2); p.Z();
        }
        DS.wash(ctx, p, {
          kind: 'wood', base: '#8a6a3f', shadow: '#3f2c17', deep: '#241708', seed: seed + 1,
          box: [-90, -180, 180, 200], inkW: 3.4, shadeAlpha: 0.5, blur: 7,
          hatch: { hatch: 22, len: [4, 20], w: [0.6, 2.4], dir: 1.4, cols: ['#c39a5e', '#2b1d0e'], alpha: [0.06, 0.3] },
        });
        // aros metálicos ou tábuas
        const bands = barrel ? [-40, -92, -138] : [-30, -104];
        for (const y of bands) {
          ctx.globalAlpha = 0.95;
          ctx.strokeStyle = '#2f2a24'; ctx.lineWidth = 8;
          ctx.beginPath(); ctx.moveTo(-58, y); ctx.quadraticCurveTo(0, y + 8, 60, y - 2); ctx.stroke();
          ctx.strokeStyle = 'rgba(200,190,170,0.35)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-56, y - 3); ctx.quadraticCurveTo(0, y + 5, 58, y - 5); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if (!barrel) DS.strokes(ctx, ['M -60 -104 L 60 -116', 'M -60 -30 L 62 -40'], '#3a2a18', 2.6, 0.6);
        else {
          DS.strokes(ctx, ['M -34 -150 L -30 -6', 'M 6 -158 L 10 -4', 'M 34 -152 L 40 -6'], '#3a2a18', 2.2, 0.45);
        }
      },
    });
  }

  function torchPart(id, seed) {
    return DS.part('torch|' + id, {
      w: 160, h: 320, px: 80, py: 280, ss: A.BAKE,
      draw(ctx) {
        const p = DS.path();
        p.M(-14, 0); p.L(-10, -200); p.L(12, -204); p.L(16, 0); p.Z();
        DS.wash(ctx, p, {
          kind: 'wood', base: '#5d4526', shadow: '#2a1c0e', seed: seed + 1, box: [-40, -220, 90, 240],
          inkW: 3, shadeAlpha: 0.5, blur: 5,
        });
        // cuia + brasa
        const cup = DS.path();
        cup.M(-30, -196); cup.C(-10, -208, 14, -208, 34, -196);
        cup.C(30, -172, 22, -156, 0, -154);
        cup.C(-22, -158, -30, -176, -30, -196);
        cup.Z();
        DS.wash(ctx, cup, {
          kind: 'stone', base: '#6e6a5f', shadow: '#33312c', seed: seed + 2, box: [-50, -220, 110, 90], inkW: 2.6, shadeAlpha: 0.5, blur: 4,
        });
        const fire = DS.path();
        fire.M(0, -206);
        fire.C(-24, -226, -18, -262, 0, -292);
        fire.C(20, -258, 26, -226, 0, -206);
        fire.Z();
        DS.wash(ctx, fire, {
          kind: 'fire', base: '#ffb21e', shadow: '#e33b0d', deep: '#76180a', seed: seed + 3,
          box: [-50, -300, 110, 110], inkW: 0, shadeAlpha: 0.6, blur: 6,
        });
      },
    });
  }

  /* ---------------------------------------------------------- chão composto */
  function buildGround() {
    const S = A.BS;
    const c = DS.canvas(A.W * S, A.H * S);
    const ctx = c.getContext('2d');
    const rnd = DS.rng(2027);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.save();
    ctx.scale(S, S);
    paintGrass(ctx, 0, 0, A.W, A.H, rnd);
    paintWater(ctx, 0, 0, A.SEA_X, A.H, rnd);
    paintSand(ctx, A.SEA_X - 60, A.SAND_X + 190, A.W, A.H, rnd);
    paintPath(ctx, rnd);
    // borda de espuma + pedrinhas molhadas
    for (let i = 0; i < 260; i++) {
      const x = A.SEA_X - 90 + rnd() * 180, y = rnd() * A.H;
      ctx.globalAlpha = 0.1 + rnd() * 0.3;
      ctx.fillStyle = rnd() < 0.5 ? '#f4efe0' : '#8b7a58';
      ctx.beginPath(); ctx.ellipse(x, y, 5 + rnd() * 15, 2 + rnd() * 8, 0, 0, 6.3); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // sombra geral nas bordas do mapa (vinheta de selva)
    const vg = ctx.createLinearGradient(0, 0, 0, A.H);
    vg.addColorStop(0, 'rgba(10,20,10,0.55)');
    vg.addColorStop(0.22, 'rgba(10,20,10,0)');
    vg.addColorStop(0.78, 'rgba(10,20,10,0)');
    vg.addColorStop(1, 'rgba(10,20,10,0.5)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, A.W, A.H);
    const hg = ctx.createLinearGradient(A.SAND_X, 0, A.W, 0);
    hg.addColorStop(0, 'rgba(10,20,10,0)');
    hg.addColorStop(1, 'rgba(10,20,10,0.45)');
    ctx.fillStyle = hg; ctx.fillRect(A.SAND_X, 0, A.W - A.SAND_X, A.H);
    ctx.restore();
    return c;
  }

  /* --------------------------------------------------------------- API */
  A.init = function () {
    if (A.ground) return;
    A.ground = buildGround();
    const rnd = DS.rng(777);
    const put = (part, x, y, sc, flip) => A.props.push({ part, x, y, sc: sc || 1, flip: !!flip });
    // palmeiras na orla (oeste e norte)
    for (let i = 0; i < 9; i++) {
      const y = 120 + i * 420 + rnd() * 180;
      put(palmPart(i, 460 + rnd() * 300, 400 + i * 13), 300 + rnd() * 780, y, 0.9 + rnd() * 0.4, rnd() < 0.5);
    }
    for (let i = 0; i < 4; i++) {
      put(palmPart(20 + i, 430 + rnd() * 260, 900 + i * 29), 2600 + i * 900 + rnd() * 380, 120 + rnd() * 260, 0.85 + rnd() * 0.4, rnd() < 0.5);
    }
    // moitas e arbustos no fundo
    for (let i = 0; i < 12; i++) {
      put(bushPart(i, 900 + i * 31, rnd() < 0.5), 1300 + rnd() * (A.W - 1700), 80 + rnd() * 900, 0.6 + rnd() * 0.45, rnd() < 0.5);
    }
    // pedras
    for (let i = 0; i < 11; i++) {
      put(rockPart(i, 1400 + i * 17, rnd() < 0.35), 1000 + rnd() * (A.W - 1400), 500 + rnd() * (A.H - 700), 0.8 + rnd() * 0.9, rnd() < 0.5);
    }
    // ruínas
    put(ruinPart(0, 61), 4100, 2900, 1.1);
    put(ruinPart(1, 62), 5100, 1400, 0.95, true);
    put(ruinPart(2, 63), 2600, 2400, 0.85);
    // caixotes e barril
    put(cratePart(0, 71, false), 3150, 3050, 1.15);
    put(cratePart(1, 72, false), 3330, 2870, 1.0, true);
    put(cratePart(2, 73, true), 2980, 3260, 1.1);
    // tochas na clareira
    put(torchPart(0, 81), 2350, 2300, 1.2);
    put(torchPart(1, 82), 4100, 2480, 1.2);
    put(torchPart(2, 83), 3400, 1600, 1.1);
    A.props.sort((a, b) => a.y - b.y);
  };

  /* desenha o chão dentro da câmera (em pixels de tela, sem transformação)
   * cam = {x,y} canto superior esquerdo do mundo visível (unidades do herói) */
  A.drawGround = function (ctx, cam, w, h, view) {
    A.init();
    const S = A.BS;
    const sx = DS.clamp(cam.x, 0, Math.max(0, A.W - view)), sy = DS.clamp(cam.y, 0, Math.max(0, A.H - view));
    // 1:1 quando o zoom do jogo == BS (sem reamostragem: rápido e nítido)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(A.ground, Math.round(sx * S), Math.round(sy * S), w, h, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    return { sx, sy };
  };

  A.drawProps = function (ctx, cam, viewW, viewH, splitY, behind) {
    const x0 = cam.x - 900, x1 = cam.x + viewW + 900;
    const y0 = cam.y - 1700, y1 = cam.y + viewH + 700;
    for (const p of A.props) {
      if (p.x < x0 || p.x > x1) continue;
      if (p.y < y0 || p.y > y1) continue;
      if ((p.y < splitY) !== behind) continue;
      ctx.save();
      ctx.translate(p.x - cam.x, p.y - cam.y);
      if (p.flip) ctx.scale(-1, 1);
      ctx.scale(p.sc, p.sc);
      p.part.blit(ctx);
      ctx.restore();
    }
  };
})(window.DS);
