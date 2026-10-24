/* ============================================================================
 * 04-weapon.js — ADAGA DE SANGUE E FOGO DO CAOS (par de lâminas assassinas)
 * Geometria 100% Canvas 2D em coordenadas locais da arma:
 *   origem (0,0) = ponto de empunhadura (GRIP) compartilhado com a mão
 *   +x = do grip para fora do corpo (em direção à guarda/lâmina)
 *   -y = para cima (a lâmina cresce para cima/fora)
 * Regras do documento da arma: NÃO é machado; é uma adaga grande, crescente,
 * ensanguentada, incandescente, acorrentada pelo pomo ao antebraço.
 * Leitura da folha oficial hero-part-weapons.png:
 *   - borda EXTERNA (convexa) é o fio: brasa laranja/amarela e fissuras de lava
 *   - massa INTERNA é cinza-carvão (cinza frio, fuligem, lascas)
 *   - borda INTERNA côncava com 3 farpas/dentes voltados para fora
 *   - ponta em gancho + chifre inferior curvo
 * ========================================================================== */
(function (DS) {
  'use strict';

  const W = DS.WEAPON = {
    // ponto de empunhadura fixo (regra: mão e arma compartilham o mesmo ponto)
    GRIP: { x: 0, y: 0 },
    POMMEL: { x: -70, y: 8 },        // anel do pomo (entrada da corrente)
    GUARD: { x: 58, y: -4 },         // guarda metálica
    BLADE_ROOT: { x: 70, y: -10 },
    CHAIN_ANCHOR: { x: -78, y: 16 }, // presilha do pomo onde a corrente entra
    HANDLE_A: { x: -60, y: 0 },      // início do cabo (lado do pomo)
    HANDLE_B: { x: 62, y: 0 },       // fim do cabo (lado da guarda)
    /* Escala da lâmina em torno de BLADE_PIVOT. 0.98 foi escolhida para que a
     * ponta DESENHADA caia exatamente sobre SK.BLADE_TIP (usada na hitbox):
     * pivot + (tip - pivot) * s  =  (70 + 202*0.98, -10 - 218*0.98) = (268, -224)
     * -> casar com o desenho é regra: "o que acerta na tela é o que acerta no jogo". */
    BLADE_SCALE: 0.98,               // lâmina grande, como na folha oficial
    BLADE_PIVOT: { x: 70, y: -10 },
  };

  /* ------------------------------------------------------------------ paths */
  function pathFrom(cmds, s) {
    const p = DS.path();
    for (const c of cmds) {
      if (c[0] === 'M') p.M(c[1] * s, c[2]);
      else if (c[0] === 'L') p.L(c[1] * s, c[2]);
      else if (c[0] === 'Q') p.Q(c[1] * s, c[2], c[3] * s, c[4]);
      else if (c[0] === 'C') p.C(c[1] * s, c[2], c[3] * s, c[4], c[5] * s, c[6]);
      else if (c[0] === 'Z') p.Z();
    }
    return p;
  }

  /* Silhueta da lâmina: crescente largo com ponta em gancho, três farpas na
   * borda interna e chifre inferior curvo (leitura da folha oficial). */
  const BLADE_CMDS = [
    ['M', 92, -58],                                     // raiz superior (topo do cabo)
    ['C', 46, -140, 120, -238, 250, -262],              // borda EXTERNA convexa (o fio)
    ['L', 328, -290],                                   // ponta longa e fina
    ['C', 300, -266, 282, -252, 262, -238],             // volta do gancho da ponta
    // serrilha: dentes curtos e afiados na borda interna (leitura da folha oficial)
    ['L', 292, -224], ['L', 266, -216],
    ['L', 286, -196], ['L', 252, -186],
    ['L', 274, -166], ['L', 240, -154],
    ['L', 264, -132], ['L', 230, -118],
    ['L', 256, -94], ['L', 222, -78],
    // borda interna lisa descendo até o entalhe
    ['C', 230, -48, 236, -22, 238, 4],
    // chifre inferior longo, curvo (cúspide de crescente)
    ['C', 252, 36, 254, 70, 238, 98],
    ['L', 224, 118],                                    // ponta do chifre
    ['C', 206, 96, 196, 72, 190, 46],                   // lado de dentro do chifre
    // "mordida": entalhe profundo entre o chifre e a raiz
    ['C', 176, 40, 166, 26, 162, 10],
    ['C', 150, -4, 128, -8, 108, 0],                    // borda inferior até a raiz
    ['Z'],
  ];
  const OUTER_CMDS = [
    ['M', 92, -58],
    ['C', 46, -140, 120, -238, 250, -262],
    ['L', 328, -290],
  ];
  const INNER_CMDS = [
    ['M', 262, -238],
    ['L', 292, -224], ['L', 266, -216],
    ['L', 286, -196], ['L', 252, -186],
    ['L', 274, -166], ['L', 240, -154],
    ['L', 264, -132], ['L', 230, -118],
    ['L', 256, -94], ['L', 222, -78],
    ['C', 230, -48, 236, -22, 238, 4],
    ['C', 252, 36, 254, 70, 238, 98], ['L', 224, 118],
  ];

  DS.bladePath = function (side, variant) { return pathFrom(BLADE_CMDS, side < 0 ? -1 : 1); };
  DS.bladeOuterEdge = function (side) { return pathFrom(OUTER_CMDS, side < 0 ? -1 : 1); };
  DS.bladeInnerEdge = function (side) { return pathFrom(INNER_CMDS, side < 0 ? -1 : 1); };

  /* Utilitários de geometria para prender a pintura à silhueta. */
  DS.pointInPoly = function (poly, x, y) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi)) inside = !inside;
    }
    return inside;
  };
  DS.flattenPoly = function (path) {
    const polys = path.flatten(5);
    let best = polys[0] || [];
    for (const p of polys) if (p.length > best.length) best = p;
    return best;
  };
  // ponto aleatório DENTRO de um path fechado (crosta, sangue, brasa)
  DS.pointInPath = function (path, poly, rnd) {
    const bb = path.bbox();
    for (let i = 0; i < 48; i++) {
      const x = bb[0] + rnd() * bb[2], y = bb[1] + rnd() * bb[3];
      if (DS.pointInPoly(poly, x, y)) return [x, y];
    }
    return [bb[0] + bb[2] / 2, bb[1] + bb[3] / 2];
  };

  /* --------------------------------------------------------------- lâmina */
  // amostra uma borda e devolve pontos + normal que aponta para dentro
  function edgeSamples(path, insidePoly, step) {
    const pts = path.flatten(step || 4)[0];
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
      let nx = -ty, ny = tx;
      const t = i / (pts.length - 1);
      if (!DS.pointInPoly(insidePoly, pts[i][0] + nx * 6, pts[i][1] + ny * 6)) { nx = -nx; ny = -ny; }
      out.push({ x: pts[i][0], y: pts[i][1], nx, ny, t });
    }
    return out;
  }

  function buildBand(samples, widthFn) {
    const p = DS.path();
    const off = samples.map((s, i) => {
      const w = widthFn(s.t, i);
      return [s.x + s.nx * w, s.y + s.ny * w];
    });
    p.M(off[0][0], off[0][1]);
    for (let i = 1; i < off.length; i++) p.L(off[i][0], off[i][1]);
    for (let i = samples.length - 1; i >= 0; i--) p.L(samples[i].x, samples[i].y);
    p.Z();
    return p;
  }

  function paintBlade(ctx, side, seed) {
    const s = side < 0 ? -1 : 1;
    const rnd = DS.rng(seed);
    const path = DS.bladePath(side);
    const poly = DS.flattenPoly(path);
    const clip = path.build();
    const outer = DS.bladeOuterEdge(side);
    const inner = DS.bladeInnerEdge(side);
    const bb = path.bbox();

    /* 1) massa de aço-carvão (fuligem) ------------------------------------ */
    ctx.save();
    const gA = ctx.createLinearGradient(120 * s, -270, 80 * s, 100);
    gA.addColorStop(0, '#7c6c6c');
    gA.addColorStop(0.34, '#544749');
    gA.addColorStop(0.7, '#3a3033');
    gA.addColorStop(1, '#2a2225');
    ctx.fillStyle = gA;
    ctx.fill(clip);
    ctx.restore();

    ctx.save();
    ctx.clip(clip);

    /* 2) brasa seguindo a BORDA EXTERNA (o fio é quente) ------------------ */
    const samples = edgeSamples(outer, poly, 3.5);
    const widthFn = (t) => {
      const k = DS.clamp((t - 0.04) / 0.92, 0, 1);
      const base = 10 + 86 * Math.pow(Math.sin(Math.PI * k), 0.75);
      return base * (0.72 + 0.55 * DS.noise1(t * 9 + 3, seed));
    };
    const band = buildBand(samples, widthFn);
    ctx.save();
    ctx.fillStyle = '#5e0a0d';
    ctx.fill(band.build());
    // rampa de lava: do branco-amarelo no fio até vermelho-escuro para dentro
    const RAMP = [
      [0.03, '#fff3c4', 0.95, 3.0, 0],
      [0.13, '#ffd75c', 0.92, 7, 0],
      [0.26, '#ff9a22', 0.88, 12, 0],
      [0.42, '#f0521a', 0.78, 17, 2],
      [0.62, '#b8141b', 0.68, 21, 3],
      [0.84, '#680a11', 0.6, 24, 4],
      [1.02, '#3a060c', 0.5, 26, 5],
    ];
    ctx.clip(band.build());
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const [d, col, al, lw, bl] of RAMP) {
      const q = DS.path();
      for (let i = 0; i < samples.length; i++) {
        const sm = samples[i];
        const w = widthFn(sm.t, i) * d;
        const x = sm.x + sm.nx * w, y = sm.y + sm.ny * w;
        if (i === 0) q.M(x, y); else q.L(x, y);
      }
      ctx.save();
      if (bl) ctx.filter = 'blur(' + bl + 'px)';
      ctx.globalAlpha = al;
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.stroke(q.build());
      ctx.restore();
    }
    // núcleo incandescente em pontos específicos do fio
    for (let i = 0; i < 6; i++) {
      const sm = samples[Math.floor((0.08 + rnd() * 0.78) * samples.length)];
      DS.glow(ctx, sm.x + sm.nx * 4, sm.y + sm.ny * 4, 20 + rnd() * 26,
        'rgba(255,232,150,0.55)', 'rgba(255,110,20,0.22)', 0.9);
    }
    ctx.restore(); // fim clip da banda

    /* 3) veias de lava (fissuras que entram na massa de carvão) ----------- */
    for (let i = 0; i < 15; i++) {
      const sm = samples[Math.floor((0.05 + rnd() * 0.85) * samples.length)];
      let w0 = widthFn(sm.t) * (0.5 + rnd() * 0.4);
      let x = sm.x + sm.nx * w0, y = sm.y + sm.ny * w0;
      let ang = Math.atan2(sm.ny, sm.nx) + (rnd() - 0.5) * 0.8;
      const segs = 2 + Math.floor(rnd() * 3);
      const pts = [[x, y]];
      for (let k = 0; k < segs; k++) {
        const L = 12 + rnd() * 34;
        ang += (rnd() - 0.5) * 0.7;
        x += Math.cos(ang) * L; y += Math.sin(ang) * L;
        pts.push([x, y]);
      }
      for (const [col, off, lw, al] of [['#1a0c0c', 2.4, 5.4, 0.7], ['#ff8a1e', 0, 2.6, 0.85], ['#ffe08a', 0, 1.0, 0.75]]) {
        ctx.save();
        ctx.globalAlpha = al * (0.6 + rnd() * 0.4);
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1] + off);
        for (let k = 1; k < pts.length; k++) {
          const a = pts[k - 1], b = pts[k];
          ctx.quadraticCurveTo(a[0], a[1] + off, b[0], b[1] + off);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    /* 4) crosta de carvão sobre a brasa (lascas irregulares) -------------- */
    for (let i = 0; i < 30; i++) {
      const sm = samples[Math.floor((0.04 + rnd() * 0.92) * samples.length)];
      const w = widthFn(sm.t) * (0.35 + rnd() * 0.85);
      const x = sm.x + sm.nx * w, y = sm.y + sm.ny * w;
      const r = 6 + rnd() * 20;
      ctx.save();
      ctx.globalAlpha = 0.22 + rnd() * 0.5;
      ctx.fillStyle = rnd() < 0.6 ? '#3a2f31' : '#54494b';
      if (rnd() < 0.4) ctx.filter = 'blur(2.5px)';
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.3 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* 5) fuligem + lascas metálicas no resto da lâmina -------------------- */
    // grandes reflexos de aço (massas claras desfocadas) para não virar silhueta preta
    for (let i = 0; i < 5; i++) {
      const [x, y] = DS.pointInPath(path, poly, rnd);
      ctx.save();
      ctx.globalAlpha = 0.10 + rnd() * 0.16;
      ctx.filter = 'blur(16px)';
      ctx.fillStyle = i % 2 ? '#b0a09a' : '#8d7e7c';
      ctx.beginPath();
      ctx.ellipse(x, y, 24 + rnd() * 46, 12 + rnd() * 26, -0.7 + rnd() * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 58; i++) {
      const [x, y] = DS.pointInPath(path, poly, rnd);
      ctx.save();
      ctx.globalAlpha = 0.12 + rnd() * 0.34;
      ctx.fillStyle = rnd() < 0.5 ? '#191316' : '#6e5f60';
      ctx.beginPath();
      ctx.ellipse(x, y, 3 + rnd() * 13, 2 + rnd() * 8, rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 34; i++) {
      const [x, y] = DS.pointInPath(path, poly, rnd);
      const L = 7 + rnd() * 26;
      const a = -1.15 + rnd() * 0.55;
      ctx.save();
      ctx.globalAlpha = 0.10 + rnd() * 0.26;
      ctx.strokeStyle = rnd() < 0.5 ? '#cdb3ab' : '#8a6a60';
      ctx.lineWidth = 0.7 + rnd() * 1.7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * L * s, y + Math.sin(a) * L);
      ctx.stroke();
      ctx.restore();
    }
    // bisel claro rente à borda interna serrilhada (metal afiado)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.filter = 'blur(4px)';
    ctx.strokeStyle = '#a89690';
    ctx.lineWidth = 9;
    ctx.lineJoin = 'round';
    ctx.stroke(inner.build());
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#cbb6ac';
    ctx.lineWidth = 1.5;
    ctx.stroke(inner.build());
    ctx.restore();

    /* 6) sangue: escorridos e respingos presos à lâmina ------------------- */
    for (let i = 0; i < 10; i++) {
      const [x0, y0] = DS.pointInPath(path, poly, rnd);
      const L = 20 + rnd() * 66;
      ctx.save();
      ctx.globalAlpha = 0.34 + rnd() * 0.4;
      ctx.strokeStyle = i % 4 === 0 ? '#c8231c' : '#6b0a0d';
      ctx.lineWidth = 2.0 + rnd() * 4.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x0 + 5, y0 + L * 0.5, x0 - 3, y0 + L);
      ctx.stroke();
      // realce especular do escorrido
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = '#ff6a58';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x0 - 1.4, y0 + 3);
      ctx.quadraticCurveTo(x0 + 3, y0 + L * 0.5, x0 - 4.6, y0 + L - 3);
      ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < 34; i++) {
      const [x0, y0] = DS.pointInPath(path, poly, rnd);
      ctx.save();
      ctx.globalAlpha = 0.26 + rnd() * 0.44;
      ctx.fillStyle = i % 3 ? '#8d0f10' : '#c8231c';
      ctx.beginPath();
      ctx.ellipse(x0, y0, 1.4 + rnd() * 4.2, 1.0 + rnd() * 3, rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* 7) sombra interna na concavidade (dá a leitura de crescente) -------- */
    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.filter = 'blur(10px)';
    ctx.strokeStyle = '#0d090c';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke(inner.build());
    ctx.restore();
    ctx.restore(); // fim clip principal

    /* 8) fio cortante: luz dura rente à borda externa --------------------- */
    ctx.save();
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#e8d3c6';
    ctx.lineWidth = 2.6;
    ctx.stroke(outer.build());
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#fff0c0';
    ctx.lineWidth = 1.0;
    ctx.stroke(outer.build());
    // fio serrilhado: luz fria curta para os dentes lerem contra a sombra
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#d8c3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke(inner.build());
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#ffb060';
    ctx.lineWidth = 3.2;
    ctx.stroke(inner.build());
    DS.glow(ctx, 328 * s, -288, 30, 'rgba(255,220,150,0.5)', 'rgba(255,90,30,0.2)', 0.9);
    DS.glow(ctx, 226 * s, 116, 26, 'rgba(255,180,100,0.4)', 'rgba(200,60,20,0.16)', 0.9);
    ctx.restore();

    /* 8b) halo emissivo externo: a lâmina lê como fogo mesmo em escala pequena */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ff6a14';
    ctx.lineWidth = 30;
    ctx.stroke(outer.build());
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = '#ffc861';
    ctx.lineWidth = 11;
    ctx.stroke(outer.build());
    ctx.restore();

    /* 9) contorno irregular final (tinta artesanal) ----------------------- */
    DS.ink(ctx, path, { color: '#170e13', w: 5.0, seed: seed + 21, jitter: 1.8 });
    DS.ink(ctx, path, { color: 'rgba(178,140,124,0.22)', w: 1.3, seed: seed + 33, jitter: 2.2, alpha: 0.4 });
    // marcas de batalha no dorso
    for (let i = 0; i < 5; i++) {
      const x = bb[0] + bb[2] * (0.2 + rnd() * 0.55), y = bb[1] + 8 + rnd() * 22;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#0f0a0e';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 12 * s, y + 9 + rnd() * 6);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------------ cabo */
  function handlePath(side) {
    const s = side < 0 ? -1 : 1;
    const p = DS.path();
    p.M(-58 * s, -6);
    p.C(-66 * s, -22, -46 * s, -32, -18 * s, -30);
    p.C(18 * s, -28, 50 * s, -24, 62 * s, -14);
    p.C(70 * s, -8, 70 * s, 8, 62 * s, 14);
    p.C(50 * s, 24, 18 * s, 28, -18 * s, 26);
    p.C(-46 * s, 24, -66 * s, 18, -58 * s, -6);
    p.Z();
    return p;
  }
  function collarPath(side) {
    const s = side < 0 ? -1 : 1;
    const p = DS.path();
    p.M(54 * s, -26);
    p.C(80 * s, -28, 94 * s, -14, 94 * s, 2);
    p.C(94 * s, 20, 82 * s, 30, 56 * s, 28);
    p.C(68 * s, 14, 70 * s, -12, 54 * s, -26);
    p.Z();
    return p;
  }
  function pommelPath(side) {
    const s = side < 0 ? -1 : 1;
    const p = DS.path();
    p.M(-46 * s, -14);
    p.C(-74 * s, -22, -92 * s, -6, -90 * s, 14);
    p.C(-88 * s, 34, -68 * s, 44, -48 * s, 36);
    p.C(-32 * s, 28, -36 * s, 4, -46 * s, -14);
    p.Z();
    return p;
  }

  function paintHandle(ctx, side, seed) {
    const s = side < 0 ? -1 : 1;
    const hp = handlePath(side);
    DS.wash(ctx, hp, {
      kind: 'leather', base: '#4a3226', shadow: '#1b1215', seed: seed + 90,
      box: [-70, -36, 150, 72], inkW: 4.0, shadeAlpha: 0.5, blur: 8, deep: '#160e12',
      hatch: { hatch: 80, len: [3, 15], w: [0.5, 1.9], dir: -0.35, cols: ['#9c6a48', '#241719', '#c08a5c'], alpha: [0.06, 0.3] },
    });
    // tiras de couro enroladas em diagonal + costura
    ctx.save();
    ctx.clip(hp.build());
    for (let i = 0; i < 7; i++) {
      const x = (-44 + i * 16) * s;
      ctx.globalAlpha = 0.92;
      ctx.strokeStyle = i % 2 ? '#2a1a19' : '#6b4630';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(x - 8 * s, -32);
      ctx.quadraticCurveTo(x + 6 * s, 0, x - 6 * s, 32);
      ctx.stroke();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#c08a5c';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - 11 * s, -28);
      ctx.quadraticCurveTo(x + 3 * s, 0, x - 9 * s, 28);
      ctx.stroke();
    }
    ctx.restore();
    DS.ink(ctx, hp, { color: '#180f12', w: 4.0, seed: seed + 95, jitter: 1.2 });

    // guarda metálica com rebites
    const cp = collarPath(side);
    DS.wash(ctx, cp, {
      kind: 'steel', base: '#4c3a35', shadow: '#171116', deep: '#100b10', seed: seed + 100,
      box: [50, -34, 50, 70], inkW: 3.4, shadeAlpha: 0.5, blur: 7,
      hatch: { hatch: 34, len: [2, 10], w: [0.5, 1.6], dir: -0.9, cols: ['#cdb3ab', '#1b151a', '#e0703a'], alpha: [0.06, 0.3] },
    });
    for (let i = 0; i < 3; i++) {
      const x = (62 + i * 8) * s;
      ctx.save();
      ctx.fillStyle = '#a98a72'; ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.ellipse(x, -12 + i * 12, 2.3, 2.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1d1c'; ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.ellipse(x + 0.8 * s, -11 + i * 12, 1.0, 1.0, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // anel do pomo: toro com furo por onde a corrente entra
    const pp = pommelPath(side);
    DS.wash(ctx, pp, {
      kind: 'steel', base: '#493833', shadow: '#150f14', deep: '#0e0a0e', seed: seed + 110,
      box: [-96, -28, 68, 84], inkW: 3.8, shadeAlpha: 0.55, blur: 6,
      hatch: { hatch: 30, len: [2, 10], w: [0.5, 1.5], dir: -0.9, cols: ['#cdb3ab', '#1b151a', '#e0703a'], alpha: [0.06, 0.28] },
    });
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#120d11';
    ctx.beginPath();
    ctx.ellipse(-68 * s, 9, 11, 13, 0.16 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    DS.drawChain(ctx, DS.chainPath(-66 * s, 18, -58 * s, 46, 6), { pitch: 26, scale: 0.92, lw: 3.4 });
  }

  /* --------------------------------------------------- lâmina + cabo completo */
  DS.drawWeapon = function (ctx, side, opts) {
    opts = opts || {};
    const seed = 1300 + (side < 0 ? 7 : 0) + (opts.variant || 0);
    ctx.save();
    if (opts.scale && opts.scale !== 1) ctx.scale(opts.scale, opts.scale);
    // lâmina reduzida em torno da raiz (proporção da referência: ~2,2x o cabo)
    ctx.save();
    ctx.translate(W.BLADE_PIVOT.x, W.BLADE_PIVOT.y);
    ctx.scale(W.BLADE_SCALE, W.BLADE_SCALE);
    ctx.translate(-W.BLADE_PIVOT.x, -W.BLADE_PIVOT.y);
    paintBlade(ctx, side, seed);
    ctx.restore();
    paintHandle(ctx, side, seed);
    ctx.restore();
  };

  /* ------------------------------------------------------------- mão no cabo
   * A mão é desenhada NO MESMO espaço local da arma: o cabo fica entre o dorso
   * da mão (camada 'back') e os dedos/polegar (camada 'front'), produzindo a
   * oclusão correta exigida no documento da arma. Punho compacto (chibi). */
  DS.drawHandGrip = function (ctx, side, layer, opts) {
    opts = opts || {};
    const seed = 1400 + (side < 0 ? 11 : 0);
    ctx.save();
    ctx.scale(side < 0 ? -1 : 1, 1); // autoria no lado canônico

    if (layer === 'back') {
      // antebraço curto + dorso da mão (a corrente e a manga vêm do arm painter)
      const fore = DS.path();
      fore.M(-100, -22);
      fore.C(-84, -30, -66, -28, -52, -20);
      fore.C(-44, -12, -42, -2, -46, 10);
      fore.C(-58, 24, -82, 28, -100, 20);
      fore.C(-108, 8, -108, -12, -100, -22);
      fore.Z();
      DS.wash(ctx, fore, {
        kind: 'skin', base: '#dd8b5b', shadow: '#a3553a', deep: '#8b4832', seed: seed + 7,
        box: [-110, -34, 68, 68], inkW: 3.4, shadeAlpha: 0.5, blur: 8,
      });
      // dorso da mão (massa atrás do cabo, em sombra para não competir com os dedos)
      const back = DS.path();
      back.M(-48, -28);
      back.C(-24, -36, 4, -34, 20, -24);
      back.C(30, -16, 28, -2, 16, 6);
      back.C(-4, 18, -32, 18, -46, 8);
      back.C(-56, -2, -56, -18, -48, -28);
      back.Z();
      DS.wash(ctx, back, {
        kind: 'skin', base: '#c87a4e', shadow: '#9c5238', deep: '#87422e', seed: seed + 3,
        box: [-62, -42, 100, 76], inkW: 3.2, shadeAlpha: 0.45, blur: 7,
        masses: [
          [DS.pc('M -42 -26 C -22 -34 2 -32 16 -24 C 6 -16 -18 -14 -38 -16 Z'), '#e79a66', 0.3, 5],
        ],
      });
      // nós dos dedos (calos) na borda superior do dorso
      for (let i = 0; i < 4; i++) {
        const x = -42 + i * 18;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#e59463';
        ctx.beginPath(); ctx.ellipse(x, -28, 8.4, 6.2, -0.06, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = '#8f4a33'; ctx.lineWidth = 1.1; ctx.stroke();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffd2a0';
        ctx.beginPath(); ctx.ellipse(x - 1.4, -31, 4.2, 2.1, -0.1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      DS.ink(ctx, back, { color: '#5d3227', w: 2.0, seed: seed + 5, jitter: 0.9, alpha: 0.65 });
      ctx.restore();
      return;
    }

    /* camada frontal: 4 dedos enrolados + polegar cruzando por cima ------- */
    const drawFinger = (x0, w, yTop, yBot, lit) => {
      const p = DS.path();
      p.M(x0 - 1, yTop - 8);
      p.C(x0 + w * 0.72, yTop - 12, x0 + w * 1.05, yTop + 8, x0 + w * 0.95, yBot - 6);
      p.C(x0 + w * 0.9, yBot + 2, x0 + w * 0.35, yBot + 6, x0 + 3, yBot + 5);
      p.C(x0 - 5, yBot + 3, x0 - 7, yTop + 8, x0 - 1, yTop - 8);
      p.Z();
      DS.wash(ctx, p, {
        kind: 'skin', base: lit ? '#f2ab72' : '#e59463', shadow: '#a3553a', deep: '#8f4a33',
        seed: seed + Math.round(x0 * 5 + 40), box: [x0 - 12, yTop - 16, w + 26, (yBot - yTop) + 32], inkW: 2.9,
        shadeAlpha: 0.44, blur: 4,
        masses: [
          [DS.path().M(x0 + w * 0.2, yTop - 2).Q(x0 + w * 0.85, yTop + 6, x0 + w * 0.7, yBot - 12)
            .Q(x0 + w * 0.3, yBot - 8, x0 + w * 0.2, yTop - 2).Z(), '#ffd2a0', 0.4, 4],
          [DS.path().M(x0 - 1, yBot - 16).Q(x0 + w * 0.5, yBot - 8, x0 + w * 0.85, yBot - 14)
            .Q(x0 + w * 0.5, yBot + 3, x0 - 1, yBot + 2).Z(), '#8f4a33', 0.38, 3],
        ],
      });
      // ruga da articulação média
      DS.strokes(ctx, [`M ${x0 + 1} ${yTop + 18} Q ${x0 + w * 0.6} ${yTop + 24} ${x0 + w * 0.88} ${yTop + 16}`], '#a3553a', 1.3, 0.65);
      // unha / ponta do dedo sumindo atrás do cabo
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffe0b4';
      ctx.beginPath();
      ctx.ellipse(x0 + w * 0.72, yBot - 3, 3.2, 2.2, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawFinger(-44, 19, -22, 20, false);
    drawFinger(-24, 20, -24, 22, true);
    drawFinger(-3, 20, -24, 22, true);
    drawFinger(17, 19, -22, 20, false);

    // polegar cruzando por cima do cabo (fecha a pegada)
    const th = DS.path();
    th.M(-40, -24);
    th.C(-26, -38, 2, -42, 22, -34);
    th.C(40, -27, 46, -12, 34, -5);
    th.C(16, 5, -16, 2, -34, -4);
    th.C(-46, -8, -47, -17, -40, -24);
    th.Z();
    DS.wash(ctx, th, {
      kind: 'skin', base: '#f4b078', shadow: '#b46340', deep: '#934e37', seed: seed + 41,
      box: [-50, -46, 100, 56], inkW: 3.2, shadeAlpha: 0.44, blur: 5,
      masses: [
        [DS.path().M(-24, -30).C(-8, -42, 14, -40, 26, -30).C(10, -22, -10, -22, -24, -30).Z(), '#ffd2a0', 0.45, 4],
        [DS.path().M(-28, -12).C(-10, -4, 12, -6, 26, -14).C(8, -1, -12, -1, -28, -6).Z(), '#a3553a', 0.45, 4],
      ],
    });
    DS.strokes(ctx, ['M -18 -32 Q 2 -38 18 -32', 'M -6 -36 Q 6 -40 14 -35'], '#a3553a', 1.3, 0.6);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffdcae';
    ctx.beginPath(); ctx.ellipse(26, -26, 5.0, 3.6, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  /* --------------------------------------------------------- corrente de elos
   * Elos individuais, volumosos, de ferro escuro; nunca linha simples.
   * Leitura oficial: elos redondos/ovais gordos com realce de ferrugem. */
  DS.chainPath = function (x0, y0, x1, y1, sag) {
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + (sag || 0);
    return {
      x0, y0, x1, y1, mx, my,
      at(t) {
        const u = 1 - t;
        return [u * u * x0 + 2 * u * t * mx + t * t * x1, u * u * y0 + 2 * u * t * my + t * t * y1];
      },
    };
  };

  /* Um elo pré-renderizado (sprite) — o laço desenha dezenas de elos por quadro;
   * criar 1 gradiente + 8 paths por elo custava ~1,2 ms por corrente. */
  const linkSprites = {};
  function linkSprite(flat, sc, lw) {
    const key = (flat ? 'f' : 'r') + '|' + sc.toFixed(2) + '|' + lw.toFixed(2);
    if (linkSprites[key]) return linkSprites[key];
    const rx = (flat ? 15.5 : 9.2) * sc, ry = (flat ? 11.4 : 12.6) * sc;
    const pad = 6 * sc + lw * sc;
    const W = (rx * 1.16 + pad) * 2, H = (ry * 1.16 + pad) * 2;
    const ss = 2;
    const c = DS.canvas(W * ss, H * ss);
    const ctx = c.getContext('2d');
    ctx.save();
    ctx.scale(ss, ss);
    ctx.translate(W / 2, H / 2);
    ctx.lineCap = 'round';
    // sombra projetada
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#120c0d';
    ctx.beginPath(); ctx.ellipse(1.6 * sc, 2.2 * sc, rx * 1.06, ry * 1.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // corpo do elo (ferro queimado)
    const g = ctx.createLinearGradient(-rx, -ry, rx, ry);
    g.addColorStop(0, '#6b4a3a');
    g.addColorStop(0.42, '#38262a');
    g.addColorStop(1, '#20161a');
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = lw * sc; ctx.strokeStyle = '#160f11'; ctx.stroke();
    // furo interno
    ctx.beginPath(); ctx.ellipse(0.4 * sc, 0.4 * sc, rx * 0.5, ry * 0.48, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#150e10'; ctx.fill();
    ctx.lineWidth = 1.6 * sc; ctx.strokeStyle = '#4a3229'; ctx.stroke();
    // realces de ferrugem/ferro (luz superior esquerda)
    ctx.beginPath(); ctx.ellipse(-0.7 * sc, -1.0 * sc, rx * 0.9, ry * 0.84, 0, Math.PI * 1.04, Math.PI * 1.94);
    ctx.strokeStyle = '#c08a5c'; ctx.lineWidth = 2.2 * sc; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-0.5 * sc, 0.7 * sc, rx * 0.88, ry * 0.82, 0, Math.PI * 0.1, Math.PI * 0.88);
    ctx.strokeStyle = '#6b4636'; ctx.lineWidth = 1.3 * sc; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.96, ry * 0.94, 0, Math.PI * 0.46, Math.PI * 0.6);
    ctx.strokeStyle = '#e0a06a'; ctx.lineWidth = 1.2 * sc; ctx.stroke();
    // mancha de ferrugem
    ctx.beginPath(); ctx.ellipse(rx * 0.28, ry * 0.3, rx * 0.3, ry * 0.26, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(110,52,26,0.5)'; ctx.fill();
    ctx.restore();
    const spr = { c, w: W, h: H, ss };
    linkSprites[key] = spr;
    return spr;
  }

  DS.drawChain = function (ctx, curve, opts) {    opts = opts || {};
    const pitch = opts.pitch || 26;
    const sc = opts.scale || 1;
    const lw = opts.lw || 3.4;
    const N = 260;
    const pts = [];
    let prev = curve.at(0);
    pts.push(prev);
    let acc = 0;
    for (let i = 1; i <= N; i++) {
      const p = curve.at(i / N);
      acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      if (acc >= pitch) { pts.push(p); prev = p; acc = 0; }
    }
    if (pts.length < 2) return;
    ctx.save();
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const flat = i % 2 === 0;
      const spr = linkSprite(flat, sc, lw);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.drawImage(spr.c, -spr.w / 2, -spr.h / 2, spr.w, spr.h);
      ctx.restore();
    }
    ctx.restore();
  };

  /* pré-rasteriza os elos usados pela corrente dinâmica do herói */
  DS.warmChainSprites = function () {
    linkSprite(true, 1.15, 4.4); linkSprite(false, 1.15, 4.4);
    linkSprite(true, 0.9, 3.2); linkSprite(false, 0.9, 3.2);
  };

  /* Voltas de corrente no antebraço (frente/trás para oclusão correta).
   * Espaço local: origem no pulso, +x para o cotovelo (sentido do antebraço). */
  DS.drawForearmCoils = function (ctx, layer, opts) {
    opts = opts || {};
    const loops = opts.loops || 3;
    const len = opts.len || 108; // comprimento do antebraço disponível
    const thick = opts.thick || 30;
    for (let i = 0; i < loops; i++) {
      const t = loops === 1 ? 0 : i / (loops - 1);
      const x = 26 + t * (len - 30);
      const front = i % 2 === 0;
      if ((layer === 'front') !== front) continue;
      const ry = thick - t * 5;
      const curve = {
        at(u) {
          const a = -Math.PI * 0.9 + u * Math.PI * 2;
          return [x + Math.cos(a) * 8 + Math.sin(a * 1.4) * 2.4, Math.sin(a) * ry * (1 - 0.1 * Math.cos(a))];
        },
      };
      DS.drawChain(ctx, curve, { pitch: 24, scale: 0.9, lw: 3.2 });
    }
    // elo com folga pendurado sob o antebraço
    if (layer === 'front') {
      DS.drawChain(ctx, DS.chainPath(52, 24, 60, 64, 10), { pitch: 23, scale: 0.9, lw: 3.2 });
    }
  };
})(window.DS);
