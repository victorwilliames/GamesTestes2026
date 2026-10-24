/**
 * world.js - Arena Infernal do Templo Subterrâneo (Fidelidade Estrita ao Mapa Hades)
 * Baseado 100% na referência oficial: Arena Infernal do Templo Subterrâneo.png
 * 
 * Elementos Canônicos:
 * 1. Abismo vulcânico e névoa de magma profundo com brasas incandescentes subindo.
 * 2. Plataforma de templo flutuante em lajes de ardósia escura (telas isométricas chanfradas).
 * 3. Grande Medalhão Central: grinalda de louros dourada/bronze, meandro grego e crânio de Hades entalhado.
 * 4. 4 Pirações/Braseiros monumentais de bronze em pedestais de granito canelados,
 *    projetando iluminação radial volumétrica quente e sombras dramáticas.
 * 5. Colunas gregas colossais, estandartes vermelhos com louros dourados, ânforas de cerâmica,
 *    altar sacrificial e grade de lanças de ferro.
 * 6. Inimigos: Esqueletos Hoplitas com elmos coríntios de bronze e pluma vermelha,
 *    escudos redondos (aspis) e lanças de estocada (dory).
 */

if (typeof require !== 'undefined') {
  const core = require('./core.js');
  const inkModule = require('./ink.js');
  Vec3 = core.Vec3;
  PALETTE = inkModule.PALETTE;
  Ink = inkModule.Ink;
}

class World {
  constructor(camera, width = 1920, height = 1400) {
    this.camera = camera;
    this.width = width;
    this.height = height;

    this.groundCanvas = null;
    this.time = 0;

    // 4 Braseiros Monumentais de Bronze da Arena Infernal
    this.braziers = [
      { x: -140, y: -90, z: 0 },
      { x: 140, y: -90, z: 0 },
      { x: -140, y: 90, z: 0 },
      { x: 140, y: 90, z: 0 }
    ];

    // Esqueletos Hoplitas (como na referência Arena Infernal!)
    this.skeletons = [
      new HopliteSkeleton(-85, -25, camera),
      new HopliteSkeleton(80, 30, camera),
      new HopliteSkeleton(30, -75, camera)
    ];

    // Brasas vulcânicas flutuantes
    this.embers = [];
    for (let i = 0; i < 45; i++) {
      this.embers.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 600,
        z: Math.random() * 250,
        size: 1.5 + Math.random() * 2.5,
        speedZ: 25 + Math.random() * 45,
        swaySpeed: 1.2 + Math.random() * 2.0,
        swayAmp: 15 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.3 + Math.random() * 0.7
      });
    }

    // Elementos do templo (colunas, estandartes, ânforas, altar, grade)
    this.props = [
      // Colunas traseiras colossais
      { type: 'column', x: -180, y: -160, z: 0, scale: 1.1 },
      { type: 'column', x: 180, y: -160, z: 0, scale: 1.1 },
      { type: 'column', x: -40, y: -200, z: 0, scale: 1.2 },

      // Estandartes vermelhos imperiais com folhas de louro douradas
      { type: 'banner', x: -176, y: -155, z: 40 },
      { type: 'banner', x: 176, y: -155, z: 40 },
      { type: 'banner', x: -36, y: -195, z: 45 },

      // Altar sacrificial de pedra à esquerda
      { type: 'altar', x: -175, y: -45, z: 0 },

      // Ânforas / Vasos de cerâmica grega preta e vermelha
      { type: 'amphora', x: -145, y: -115, z: 0, variant: 0 },
      { type: 'amphora', x: -160, y: -105, z: 0, variant: 1 },
      { type: 'amphora', x: 145, y: -115, z: 0, variant: 1 },
      { type: 'amphora', x: 160, y: -105, z: 0, variant: 0 },
      { type: 'amphora', x: -155, y: 65, z: 0, variant: 0 },
      { type: 'amphora', x: 155, y: 65, z: 0, variant: 1 },

      // Grade de lanças de ferro na borda frontal-esquerda
      { type: 'spear_fence', x: -90, y: 150, z: 0 },

      // Escadaria quebrada na borda frontal-direita
      { type: 'broken_stairs', x: 95, y: 155, z: 0 }
    ];

    this.bakeGround();
  }

  createCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(w, h);
    } else if (typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c;
    }
    return null;
  }

  /**
   * Pré-renderiza o piso de lajes de ardósia escura com o Medalhão Central de Hades
   */
  bakeGround() {
    this.groundCanvas = this.createCanvas(this.width, this.height);
    if (!this.groundCanvas) return;
    const ctx = this.groundCanvas.getContext('2d');

    const cx = this.width * 0.5;
    const cy = this.height * 0.5;

    // Fundo do abismo de magma
    const bgGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 750);
    bgGrad.addColorStop(0, '#1a070a');
    bgGrad.addColorStop(0.45, '#120406');
    bgGrad.addColorStop(0.85, '#090204');
    bgGrad.addColorStop(1, '#050102');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Rochas e pilares vulcânicos distantes no fundo
    ctx.save();
    ctx.fillStyle = 'rgba(28, 8, 12, 0.65)';
    for (let r = 0; r < 9; r++) {
      const px = cx + (r - 4) * 190 + (r % 2 === 0 ? 30 : -20);
      const py = cy - 260 - (r % 3) * 35;
      ctx.beginPath();
      ctx.moveTo(px - 45, py + 120);
      ctx.lineTo(px, py);
      ctx.lineTo(px + 45, py + 120);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 1. Paredes de alvenaria grossa da plataforma flutuante descendo para o abismo
    const wallDepth = 55;
    ctx.save();
    ctx.translate(cx, cy);

    // Contorno da borda da plataforma octogonal
    const polyPlatform = [];
    const numSides = 8;
    const radius = 265;
    for (let i = 0; i < numSides; i++) {
      const a = (i / numSides) * Math.PI * 2 + Math.PI / 8;
      const wx = Math.cos(a) * radius;
      const wy = Math.sin(a) * radius;
      const rx = (wx - wy) * this.camera.cosYaw;
      const ry = (wx + wy) * this.camera.sinYaw * this.camera.sinPitch;
      polyPlatform.push({ x: rx, y: ry, wx, wy });
    }

    // Desenha parede vertical descendo para o magma
    ctx.fillStyle = '#140c10';
    ctx.strokeStyle = '#080406';
    ctx.lineWidth = 3;
    for (let i = 0; i < numSides; i++) {
      const p1 = polyPlatform[i];
      const p2 = polyPlatform[(i + 1) % numSides];
      // Só desenha faces voltadas para baixo/frente
      if (p2.y >= p1.y || (p1.y > 0 && p2.y > 0)) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p2.x, p2.y + wallDepth);
        ctx.lineTo(p1.x, p1.y + wallDepth);
        ctx.closePath();
        ctx.fillStyle = (i % 2 === 0) ? '#160e12' : '#1c1216';
        ctx.fill();
        ctx.stroke();

        // Ranhuras verticais de cantaria
        ctx.strokeStyle = '#0a0508';
        ctx.lineWidth = 1.5;
        const steps = 4;
        for (let s = 1; s < steps; s++) {
          const u = s / steps;
          const gx = p1.x + (p2.x - p1.x) * u;
          const gy = p1.y + (p2.y - p1.y) * u;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx, gy + wallDepth);
          ctx.stroke();
        }

        // Brilho avermelhado na base da pedra refletido do magma
        const magmaRim = ctx.createLinearGradient(0, p1.y + wallDepth - 18, 0, p1.y + wallDepth);
        magmaRim.addColorStop(0, 'rgba(255, 40, 20, 0)');
        magmaRim.addColorStop(1, 'rgba(255, 60, 20, 0.45)');
        ctx.fillStyle = magmaRim;
        ctx.fillRect(Math.min(p1.x, p2.x), p1.y + wallDepth - 18, Math.abs(p2.x - p1.x), 18);
      }
    }

    // 2. Lajes de Ardósia Escura em Grade Isométrica
    const tileSize = 36;
    const range = 8;

    for (let gx = -range; gx <= range; gx++) {
      for (let gy = -range; gy <= range; gy++) {
        const d = Math.hypot(gx, gy);
        if (d > range + 0.35) continue;

        const p3d = new Vec3(gx * tileSize, gy * tileSize, 0);
        const rx = (p3d.x - p3d.y) * this.camera.cosYaw;
        const ry = (p3d.x + p3d.y) * this.camera.sinYaw * this.camera.sinPitch;

        // Variação de cor da ardósia escura (estilo Hades)
        const hash = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453;
        const rand = hash - Math.floor(hash);

        let slateColor;
        if (rand < 0.35) slateColor = '#181e26';
        else if (rand < 0.70) slateColor = '#1c232c';
        else if (rand < 0.90) slateColor = '#151920';
        else slateColor = '#212933';

        // Laje losango
        const halfW = tileSize * this.camera.cosYaw * 0.96;
        const halfH = tileSize * this.camera.sinYaw * this.camera.sinPitch * 0.96;

        ctx.beginPath();
        ctx.moveTo(rx, ry - halfH);
        ctx.lineTo(rx + halfW, ry);
        ctx.lineTo(rx, ry + halfH);
        ctx.lineTo(rx - halfW, ry);
        ctx.closePath();

        ctx.fillStyle = slateColor;
        ctx.fill();

        // Borda e ranhuras de argamassa escura
        ctx.strokeStyle = '#0d1116';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Chanfro iluminado no topo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx - halfW, ry);
        ctx.lineTo(rx, ry - halfH);
        ctx.lineTo(rx + halfW, ry);
        ctx.stroke();

        // Rachaduras e ranhuras ocasionais
        if (rand > 0.82) {
          ctx.strokeStyle = '#090c10';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(rx - halfW * 0.4, ry - halfH * 0.2);
          ctx.lineTo(rx + halfW * 0.1, ry + halfH * 0.3);
          ctx.lineTo(rx + halfW * 0.4, ry + halfH * 0.1);
          ctx.stroke();
        }

        // Manchas de sangue seco de batalha
        if (rand > 0.92) {
          ctx.fillStyle = 'rgba(74, 12, 18, 0.45)';
          ctx.beginPath();
          ctx.ellipse(rx + 4, ry + 2, 8, 4.5, rand * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Grande Medalhão Central de Hades (Laurel Wreath + Skull + Meandro)
    // Conforme a referência oficial: Arena Infernal do Templo Subterrâneo.png
    this.drawHadesMedallion(ctx, 0, 0);

    ctx.restore();
  }

  /**
   * Desenha o Grande Medalhão Central de Hades em Canvas 2D puro
   */
  drawHadesMedallion(ctx, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    const pitchScale = this.camera.sinYaw * this.camera.sinPitch; // Escala isométrica vertical

    // 1. Disco externo de pedra entalhada
    ctx.beginPath();
    ctx.ellipse(0, 0, 110, 110 * pitchScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#141920';
    ctx.fill();
    ctx.strokeStyle = '#2d3744';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. Anel de Louros Dourados / Bronze (Laurel Wreath Ring)
    const numLeaves = 28;
    for (let i = 0; i < numLeaves; i++) {
      const a = (i / numLeaves) * Math.PI * 2;
      const lx = Math.cos(a) * 94;
      const ly = Math.sin(a) * 94 * pitchScale;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(a + Math.PI / 4);
      ctx.scale(1, pitchScale);

      ctx.beginPath();
      ctx.ellipse(0, 0, 8.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#C49C3C'; // Ouro/Bronze canônico
      ctx.fill();
      ctx.strokeStyle = '#5E4612';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    // Anéis concêntricos dourados de demarcação
    ctx.beginPath();
    ctx.ellipse(0, 0, 102, 102 * pitchScale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 86, 86 * pitchScale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#C49C3C';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Anel intermediário com meandro grego estilizado
    ctx.beginPath();
    ctx.ellipse(0, 0, 72, 72 * pitchScale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#5E4612';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 4. Disco interno com o Crânio de Hades entalhado
    ctx.beginPath();
    ctx.ellipse(0, 0, 58, 58 * pitchScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#10141a';
    ctx.fill();
    ctx.strokeStyle = '#2c3540';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Entalhe do Crânio de Hades estilizado
    ctx.save();
    ctx.scale(1, pitchScale);

    ctx.fillStyle = '#1c2430';
    ctx.strokeStyle = '#0a0d12';
    ctx.lineWidth = 1.8;

    // Caixa craniana
    ctx.beginPath();
    ctx.arc(0, -6, 24, Math.PI * 0.8, Math.PI * 0.2, false);
    ctx.lineTo(16, 12);
    ctx.lineTo(8, 22);
    ctx.lineTo(-8, 22);
    ctx.lineTo(-16, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Órbitas oculares vazadas escuras
    ctx.fillStyle = '#080a0d';
    ctx.beginPath();
    ctx.ellipse(-8, -4, 5.5, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -4, 5.5, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Fossa nasal triangular
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(3, 10);
    ctx.lineTo(-3, 10);
    ctx.closePath();
    ctx.fill();

    // Dentes / Maxilar entalhado
    ctx.strokeStyle = '#080a0d';
    ctx.lineWidth = 2;
    for (let t = -6; t <= 6; t += 4) {
      ctx.beginPath();
      ctx.moveTo(t, 14);
      ctx.lineTo(t, 20);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }

  update(dt) {
    this.time += dt;

    // Atualiza brasas vulcânicas subindo do abismo
    for (const em of this.embers) {
      em.z += em.speedZ * dt;
      em.phase += em.swaySpeed * dt;
      if (em.z > 220) {
        em.z = -20;
        em.x = (Math.random() - 0.5) * 800;
        em.y = (Math.random() - 0.5) * 600;
      }
    }

    // Atualiza Esqueletos Hoplitas
    for (const sk of this.skeletons) {
      sk.update(dt);
    }
  }

  /**
   * Desenha o piso da arena com as 4 luzes radiais volumétricas dos braseiros
   */
  drawGround(ctx) {
    if (!this.groundCanvas) return;

    // 1. Desenha o chão estático pré-renderizado
    ctx.drawImage(
      this.groundCanvas,
      this.camera.origin.x - this.width * 0.5 - this.camera.target.x * this.camera.scale,
      this.camera.origin.y - this.height * 0.5 - this.camera.target.y * this.camera.scale
    );

    // 2. Brasas incandescentes do abismo (desenhadas antes dos objetos sólidos)
    this.drawEmbers(ctx);

    // 3. Iluminação radial volumétrica dos 4 braseiros (Efeito Hades!)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.braziers.length; i++) {
      const b = this.braziers[i];
      const sp = this.camera.project(new Vec3(b.x, b.y, b.z));
      const flicker = Math.sin(this.time * 9 + i * 2.1) * 0.08 + Math.cos(this.time * 14 + i * 1.3) * 0.05;

      const rad = 230 * (1.0 + flicker);
      const grad = ctx.createRadialGradient(sp.x, sp.y, 8, sp.x, sp.y, rad);
      grad.addColorStop(0, 'rgba(255, 140, 20, 0.46)');
      grad.addColorStop(0.35, 'rgba(230, 70, 10, 0.22)');
      grad.addColorStop(0.75, 'rgba(180, 25, 5, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawEmbers(ctx) {
    ctx.save();
    ctx.fillStyle = '#FFA030';
    for (const em of this.embers) {
      const swayX = Math.sin(em.phase) * em.swayAmp;
      const sp = this.camera.project(new Vec3(em.x + swayX, em.y, em.z));
      ctx.globalAlpha = em.alpha * (1 - em.z / 250);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, em.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Retorna todos os elementos da arena para ordenação por profundidade
   */
  getRenderProps() {
    const list = [];

    // Braseiros
    for (const b of this.braziers) {
      const sp = this.camera.project(new Vec3(b.x, b.y, b.z));
      list.push({
        type: 'brazier',
        x: b.x, y: b.y, z: b.z,
        depth: sp.depth,
        draw: (ctx) => this.drawBrazier(ctx, b)
      });
    }

    // Elementos de arquitetura
    for (const p of this.props) {
      const sp = this.camera.project(new Vec3(p.x, p.y, p.z));
      list.push({
        type: p.type,
        x: p.x, y: p.y, z: p.z,
        depth: sp.depth,
        propData: p,
        draw: (ctx) => this.drawProp(ctx, p)
      });
    }

    // Esqueletos Hoplitas
    for (const sk of this.skeletons) {
      const sp = this.camera.project(sk.pos);
      list.push({
        type: 'skeleton',
        x: sk.pos.x, y: sk.pos.y, z: sk.pos.z,
        depth: sp.depth,
        draw: (ctx) => sk.draw(ctx)
      });
    }

    return list;
  }

  /**
   * Desenha um Braseiro Monumental de Bronze com fogo multicamadas animado
   */
  drawBrazier(ctx, b) {
    const sp = this.camera.project(new Vec3(b.x, b.y, b.z));
    const sc = this.camera.scale;

    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.scale(sc, sc);

    // Sombra de contato no solo
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 4, 6, 0.65)';
    ctx.fill();

    // 1. Pedestal de Granito Canelado (Base e Fuste)
    ctx.fillStyle = '#1c222b';
    ctx.strokeStyle = '#0e1217';
    ctx.lineWidth = 1.8;

    // Plinto da base
    ctx.beginPath();
    ctx.moveTo(-22, -4);
    ctx.lineTo(22, -4);
    ctx.lineTo(18, -12);
    ctx.lineTo(-18, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fuste canelado
    ctx.beginPath();
    ctx.moveTo(-16, -12);
    ctx.lineTo(16, -12);
    ctx.lineTo(14, -36);
    ctx.lineTo(-14, -36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Caneluras verticais
    ctx.strokeStyle = '#12161c';
    ctx.lineWidth = 1.2;
    for (let lx = -10; lx <= 10; lx += 5) {
      ctx.beginPath();
      ctx.moveTo(lx, -12);
      ctx.lineTo(lx * 0.9, -36);
      ctx.stroke();
    }

    // Capitel do pedestal
    ctx.fillStyle = '#252e3a';
    ctx.strokeStyle = '#0e1217';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-20, -36);
    ctx.lineTo(20, -36);
    ctx.lineTo(24, -44);
    ctx.lineTo(-24, -44);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Caldeirão / Pira de Bronze Maciço
    ctx.fillStyle = '#8B5A2B';
    ctx.strokeStyle = '#3A1E08';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-22, -44);
    ctx.lineTo(22, -44);
    ctx.lineTo(26, -56);
    ctx.lineTo(-26, -56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Realce dourado na borda do bronze
    ctx.strokeStyle = '#D49B42';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, -56, 26, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Brasas vermelhas incandescentes dentro do caldeirão
    ctx.fillStyle = '#FF3300';
    ctx.beginPath();
    ctx.ellipse(0, -56, 23, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Fogo Multicamadas Procedural Animado
    const fTime = this.time * 7;
    const flameH = 34 + Math.sin(fTime * 2.3) * 6;

    // Labareda exterior carmesim
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.moveTo(-18, -56);
    ctx.quadraticCurveTo(-14 + Math.sin(fTime) * 4, -56 - flameH * 0.6, 0, -56 - flameH);
    ctx.quadraticCurveTo(14 + Math.cos(fTime) * 4, -56 - flameH * 0.6, 18, -56);
    ctx.closePath();
    ctx.fill();

    // Labareda intermediária laranja-dourada
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(-13, -56);
    ctx.quadraticCurveTo(-9 + Math.sin(fTime * 1.4) * 3, -56 - flameH * 0.5, 0, -56 - flameH * 0.85);
    ctx.quadraticCurveTo(9 + Math.cos(fTime * 1.4) * 3, -56 - flameH * 0.5, 13, -56);
    ctx.closePath();
    ctx.fill();

    // Núcleo branco-amarelo incandescente
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.moveTo(-7, -56);
    ctx.quadraticCurveTo(-4, -56 - flameH * 0.35, 0, -56 - flameH * 0.55);
    ctx.quadraticCurveTo(4, -56 - flameH * 0.35, 7, -56);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Renderiza os elementos do templo (colunas, estandartes, ânforas, etc.)
   */
  drawProp(ctx, p) {
    const sp = this.camera.project(new Vec3(p.x, p.y, p.z));
    const sc = this.camera.scale;

    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.scale(sc, sc);

    if (p.type === 'column') {
      this.drawTempleColumn(ctx, p.scale || 1.0);
    } else if (p.type === 'banner') {
      this.drawImperialBanner(ctx);
    } else if (p.type === 'amphora') {
      this.drawAmphora(ctx, p.variant || 0);
    } else if (p.type === 'altar') {
      this.drawStoneAltar(ctx);
    } else if (p.type === 'spear_fence') {
      this.drawSpearFence(ctx);
    } else if (p.type === 'broken_stairs') {
      this.drawBrokenStairs(ctx);
    }

    ctx.restore();
  }

  drawTempleColumn(ctx, scale = 1.0) {
    ctx.scale(scale, scale);

    // Sombra
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 4, 8, 0.7)';
    ctx.fill();

    const colH = 160;

    // Base de cantaria
    ctx.fillStyle = '#222b36';
    ctx.strokeStyle = '#0e1218';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-28, -6);
    ctx.lineTo(28, -6);
    ctx.lineTo(24, -18);
    ctx.lineTo(-24, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fuste da coluna canelada
    ctx.fillStyle = '#1c242e';
    ctx.beginPath();
    ctx.rect(-20, -colH, 40, colH - 18);
    ctx.fill();
    ctx.stroke();

    // Caneluras verticais
    ctx.strokeStyle = '#12171e';
    ctx.lineWidth = 1.5;
    for (let lx = -15; lx <= 15; lx += 6) {
      ctx.beginPath();
      ctx.moveTo(lx, -18);
      ctx.lineTo(lx, -colH);
      ctx.stroke();
    }

    // Capitel Coríntio no topo
    ctx.fillStyle = '#2a3442';
    ctx.strokeStyle = '#0e1218';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, -colH);
    ctx.lineTo(22, -colH);
    ctx.lineTo(30, -colH - 22);
    ctx.lineTo(-30, -colH - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Folhas de acanto esculpidas no capitel
    ctx.strokeStyle = '#C49C3C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -colH - 11, 14, 0, Math.PI);
    ctx.stroke();
  }

  drawImperialBanner(ctx) {
    // Estandarte Vermelho com Ramos de Louro Dourados
    const bannerW = 28;
    const bannerH = 95;
    const flutter = Math.sin(this.time * 2.5) * 3;

    ctx.fillStyle = '#8B0000'; // Vermelho sangue imperial
    ctx.strokeStyle = '#3A0000';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(-bannerW * 0.5, 0);
    ctx.lineTo(bannerW * 0.5, 0);
    ctx.lineTo(bannerW * 0.5 + flutter, bannerH - 12);
    ctx.lineTo(flutter, bannerH);
    ctx.lineTo(-bannerW * 0.5 + flutter, bannerH - 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Emblema dourado de folhas de louro no centro do estandarte
    ctx.save();
    ctx.translate(flutter * 0.5, 38);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#D4AF37';
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.ellipse(i * 9, -2, 3, 6, i * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawAmphora(ctx, variant = 0) {
    // Ânfora grega de cerâmica vermelha e preta
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 5, 8, 0.5)';
    ctx.fill();

    const isRedFigure = variant === 0;
    ctx.fillStyle = isRedFigure ? '#A04020' : '#1A1818';
    ctx.strokeStyle = '#0D0808';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(-14, -14, -11, -24);
    ctx.lineTo(-4, -28);
    ctx.lineTo(-6, -32);
    ctx.lineTo(6, -32);
    ctx.lineTo(4, -28);
    ctx.lineTo(11, -24);
    ctx.quadraticCurveTo(14, -14, 5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Faixa decorativa grega
    ctx.strokeStyle = isRedFigure ? '#1A1818' : '#C06030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -16);
    ctx.lineTo(12, -16);
    ctx.stroke();

    // Alças laterais
    ctx.strokeStyle = '#1A1818';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-10, -22, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10, -22, 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawStoneAltar(ctx) {
    // Altar sacrificial de pedra negra
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 4, 6, 0.6)';
    ctx.fill();

    ctx.fillStyle = '#1c222b';
    ctx.strokeStyle = '#0e1218';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-32, -4);
    ctx.lineTo(32, -4);
    ctx.lineTo(32, -26);
    ctx.lineTo(-32, -26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tampo do altar
    ctx.fillStyle = '#28323f';
    ctx.beginPath();
    ctx.ellipse(0, -26, 35, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pequenas estátuas votivas sobre o altar
    ctx.fillStyle = '#B89040';
    ctx.fillRect(-14, -36, 6, 10);
    ctx.fillRect(8, -36, 6, 10);
  }

  drawSpearFence(ctx) {
    // Grade de lanças de ferro forjado
    ctx.strokeStyle = '#1a2028';
    ctx.lineWidth = 2.5;

    for (let x = -28; x <= 28; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, -36);
      ctx.stroke();

      // Ponta de lança dourada
      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      ctx.moveTo(x, -44);
      ctx.lineTo(x + 4, -36);
      ctx.lineTo(x - 4, -36);
      ctx.closePath();
      ctx.fill();
    }

    // Travessa horizontal
    ctx.beginPath();
    ctx.moveTo(-32, -18);
    ctx.lineTo(32, -18);
    ctx.stroke();
  }

  drawBrokenStairs(ctx) {
    // Degraus de pedra quebrados descendo para o vazio
    ctx.fillStyle = '#181e26';
    ctx.strokeStyle = '#0d1116';
    ctx.lineWidth = 1.6;

    for (let s = 0; s < 3; s++) {
      const dy = s * 7;
      const dx = s * 10;
      ctx.beginPath();
      ctx.rect(-18 + dx, -4 + dy, 32, 8);
      ctx.fill();
      ctx.stroke();
    }
  }
}

/**
 * Inimigo Oficial Canônico: Esqueleto Hoplita com Elmo Coríntio, Escudo Aspis e Lança Dory
 * 100% Canvas 2D puro com Cel-Shading, contorno de tinta e IA responsiva.
 */
class HopliteSkeleton {
  constructor(x, y, camera) {
    this.pos = new Vec3(x, y, 0);
    this.camera = camera;
    this.hp = 100;
    this.maxHp = 100;
    this.hitAnim = 0;
    this.facingAngle = Math.PI * 0.75;
    this.state = 'idle'; // 'idle', 'patrol', 'chase', 'attack', 'dead'
    this.attackTimer = 0;
    this.thrustAnim = 0;
    this.animTime = Math.random() * 10;
    this.shieldBlock = false;
  }

  update(dt) {
    this.animTime += dt;
    if (this.hitAnim > 0) this.hitAnim = Math.max(0, this.hitAnim - dt * 3.5);

    if (this.state === 'attack') {
      this.attackTimer += dt;
      if (this.attackTimer < 0.22) {
        this.thrustAnim = this.attackTimer / 0.22; // Preparação
      } else if (this.attackTimer < 0.45) {
        this.thrustAnim = 1.0 - (this.attackTimer - 0.22) / 0.23; // Estocada rápida
      } else {
        this.state = 'idle';
        this.thrustAnim = 0;
      }
    }
  }

  draw(ctx) {
    const sp = this.camera.project(this.pos);
    const sc = this.camera.scale * 0.52;

    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.scale(sc, sc);

    // Sombra de contato no solo
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 4, 6, 0.48)';
    ctx.fill();

    const isHit = this.hitAnim > 0;
    const boneColor = isHit ? '#FFFFFF' : '#EAE0D0';
    const boneShadow = isHit ? '#FF8888' : '#9E9484';

    // 1. Pernas esqueléticas (fêmur e tíbia)
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Perna esquerda
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.lineTo(-9, -20);
    ctx.lineTo(-7, -40);
    ctx.stroke();

    // Perna direita
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(9, -20);
    ctx.lineTo(7, -40);
    ctx.stroke();

    // 2. Caixa torácica esquelética e coluna vertebral
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(0, -70);
    ctx.lineWidth = 4;
    ctx.stroke();

    // Costelas
    ctx.lineWidth = 2.5;
    for (let r = 0; r < 4; r++) {
      const ry = -48 - r * 6;
      ctx.beginPath();
      ctx.ellipse(0, ry, 11 - r * 0.8, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Braço direito com Lança de Bronze (Dory)
    const thrustOffset = this.thrustAnim * 28;
    ctx.save();
    ctx.translate(14 + thrustOffset, -62);

    // Haste de madeira da lança
    ctx.strokeStyle = '#5c3a21';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-35, 18);
    ctx.lineTo(55, -28);
    ctx.stroke();

    // Ponta de folha de bronze da lança
    ctx.fillStyle = '#D4A030';
    ctx.strokeStyle = '#5E4008';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(55, -28);
    ctx.lineTo(68, -34);
    ctx.lineTo(53, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mão esquelética segurando a lança
    ctx.fillStyle = boneColor;
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Crânio com Elmo Coríntio de Bronze e Pluma Vermelha
    ctx.save();
    ctx.translate(0, -82);

    // Crânio de osso
    ctx.fillStyle = boneColor;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    // Órbitas oculares sinistras
    ctx.fillStyle = '#080608';
    ctx.beginPath();
    ctx.arc(-4, -1, 3, 0, Math.PI * 2);
    ctx.arc(4, -1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Elmo Coríntio de Bronze
    ctx.fillStyle = '#C49C3C';
    ctx.strokeStyle = '#4A3408';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.arc(0, -3, 13.5, Math.PI * 0.9, Math.PI * 0.1, false);
    ctx.lineTo(13, 8);
    ctx.lineTo(4, 5);
    ctx.lineTo(0, 10); // Protetor nasal
    ctx.lineTo(-4, 5);
    ctx.lineTo(-13, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crista / Pluma de crina vermelha do elmo hoplita
    ctx.fillStyle = '#D82030';
    ctx.strokeStyle = '#6B0008';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-11, -15);
    ctx.quadraticCurveTo(0, -32, 14, -15);
    ctx.quadraticCurveTo(0, -22, -11, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // 5. Braço esquerdo segurando o Escudo Hoplita Redondo (Aspis)
    ctx.save();
    ctx.translate(-16, -58);

    // Escudo Redondo Hoplita
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 28, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#A01824'; // Vermelho clássico grego
    ctx.fill();
    ctx.strokeStyle = '#D4A030'; // Borda de bronze dourada
    ctx.lineWidth = 4;
    ctx.stroke();

    // Emblema central de bronze (Boss)
    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#D4A030';
    ctx.fill();
    ctx.strokeStyle = '#4A3408';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { World, HopliteSkeleton };
}
