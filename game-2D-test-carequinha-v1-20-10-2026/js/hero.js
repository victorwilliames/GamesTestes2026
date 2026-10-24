'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — hero.js
// Renderização Anatômica do Herói Carequinha sobre o Rig 3D
// Torso Musculoso, Lenço Carmesim, Cinto de Caveira, Espada Hades e Depth-Sorting
// =============================================================================

(() => {
  const { project, localToWorld, vAdd, vSub, vScale, vNorm, vCross, TAU } = globalThis.Agy.Core;
  const {
    Palette,
    celFill,
    projectHull,
    createPath,
    ribbon,
    hexToRgba,
    limbTubeCloud,
    torsoLoftCloud
  } = globalThis.Agy.Ink;

  const P2 = pt => {
    const s = project(pt);
    return [s[0], s[1]];
  };

  const D = pt => project(pt)[2];

  // ---------------------------------------------------------------------------
  // Desenho das Mãos com Pegada Real (Dedos Envolvendo o Cabo)
  // ---------------------------------------------------------------------------
  function drawGripHand(ctx, handPos, elbowPos, isHoldingSword = false) {
    const h2 = P2(handPos);
    const e2 = P2(elbowPos);
    let dx = h2[0] - e2[0];
    let dy = h2[1] - e2[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const px = -dy;
    const py = dx;

    const pt = (u, v) => [h2[0] + dx * u + px * v, h2[1] + dy * u + py * v];

    // Palma e dedos fechados
    const fistPath = new Path2D();
    fistPath.moveTo(pt(-6, -5)[0], pt(-6, -5)[1]);
    fistPath.lineTo(pt(6, -4)[0], pt(6, -4)[1]);
    fistPath.lineTo(pt(7, 4.5)[0], pt(7, 4.5)[1]);
    fistPath.lineTo(pt(-6, 5)[0], pt(-6, 5)[1]);
    fistPath.closePath();

    celFill(ctx, fistPath, Palette.skin, 2.5, 1.2);

    // Divisões dos dedos fechados no cabo
    for (const off of [-2, 1, 4]) {
      ctx.strokeStyle = hexToRgba(Palette.skin.shadow, 0.85);
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(pt(off, -4)[0], pt(off, -4)[1]);
      ctx.lineTo(pt(off, 4)[0], pt(off, 4)[1]);
      ctx.stroke();
    }

    // Polegar travando a pegada
    const thumbPath = new Path2D();
    thumbPath.moveTo(pt(-3, -5)[0], pt(-3, -5)[1]);
    thumbPath.lineTo(pt(2, -7)[0], pt(2, -7)[1]);
    thumbPath.lineTo(pt(4, -4)[0], pt(4, -4)[1]);
    thumbPath.closePath();
    celFill(ctx, thumbPath, Palette.skin, 2.0, 1.0);
  }

  // ---------------------------------------------------------------------------
  // Fivela de Caveira do Cinto (Inspirada em Hades / Zagreus)
  // ---------------------------------------------------------------------------
  function drawSkullBuckle(ctx, pos3d) {
    const c = P2(pos3d);

    // Crânio de marfim
    const skull = new Path2D();
    skull.moveTo(c[0] - 6, c[1] - 4);
    skull.quadraticCurveTo(c[0], c[1] - 8, c[0] + 6, c[1] - 4);
    skull.quadraticCurveTo(c[0] + 7, c[1] + 2, c[0] + 4, c[1] + 5);
    skull.lineTo(c[0] + 3, c[1] + 8);
    skull.lineTo(c[0] - 3, c[1] + 8);
    skull.lineTo(c[0] - 4, c[1] + 5);
    skull.quadraticCurveTo(c[0] - 7, c[1] + 2, c[0] - 6, c[1] - 4);
    skull.closePath();

    celFill(ctx, skull, Palette.bone, 2.2, 1.2);

    // Órbitas escuras
    ctx.fillStyle = Palette.ink;
    for (const sx of [-2.4, 2.4]) {
      ctx.beginPath();
      ctx.ellipse(c[0] + sx, c[1] - 1.5, 1.6, 2.0, sx * 0.1, 0, TAU);
      ctx.fill();
    }

    // Cavidade nasal
    ctx.beginPath();
    ctx.moveTo(c[0], c[1] + 2);
    ctx.lineTo(c[0] - 1, c[1] + 3.5);
    ctx.lineTo(c[0] + 1, c[1] + 3.5);
    ctx.closePath();
    ctx.fill();

    // Dentes
    ctx.strokeStyle = Palette.ink;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(c[0] - 2.5, c[1] + 6.5);
    ctx.lineTo(c[0] + 2.5, c[1] + 6.5);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // Espada Hades de Aço e Ouro
  // ---------------------------------------------------------------------------
  function drawSword(ctx, gripPos, swordDir) {
    const dir = vNorm(swordDir);
    const bladeLength = 65;
    const hiltLength = 16;

    const tip = vAdd(gripPos, vScale(dir, bladeLength));
    const pommel = vSub(gripPos, vScale(dir, hiltLength));

    const ref = Math.abs(dir[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const side = vNorm(vCross(dir, ref));

    const guardR = vAdd(gripPos, vScale(side, 10));
    const guardL = vSub(gripPos, vScale(side, 10));

    // Lâmina de Aço Larga
    const bladeR = vAdd(gripPos, vScale(side, 3.8));
    const bladeL = vSub(gripPos, vScale(side, 3.8));
    const bladePath = createPath([P2(bladeL), P2(bladeR), P2(tip)]);
    celFill(ctx, bladePath, Palette.steel, 3.8, 1.3);

    // Fuller (vinco central de sangue)
    ctx.strokeStyle = hexToRgba(Palette.steel.shadow, 0.7);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(P2(gripPos)[0], P2(gripPos)[1]);
    ctx.lineTo(P2(vAdd(gripPos, vScale(dir, 52)))[0], P2(vAdd(gripPos, vScale(dir, 52)))[1]);
    ctx.stroke();

    // Guarda Cruzada em Ouro Envelhecido
    const guardMid = vAdd(gripPos, vScale(dir, 2));
    const guardPath = createPath([
      P2(guardL),
      P2(vSub(guardMid, vScale(side, 2))),
      P2(guardR),
      P2(vAdd(guardMid, vScale(side, 2)))
    ]);
    celFill(ctx, guardPath, Palette.gold, 2.4, 1.2);

    // Cabo de couro escuro
    ctx.strokeStyle = Palette.cloth.base;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(P2(gripPos)[0], P2(gripPos)[1]);
    ctx.lineTo(P2(pommel)[0], P2(pommel)[1]);
    ctx.stroke();

    // Pomo Esférico Dourado
    const pommelPt = P2(pommel);
    const pommelPath = new Path2D();
    pommelPath.arc(pommelPt[0], pommelPt[1], 3.2, 0, TAU);
    celFill(ctx, pommelPath, Palette.gold, 1.8, 1.1);
  }

  // ---------------------------------------------------------------------------
  // Desenho Principal do Herói com Depth Sorting
  // ---------------------------------------------------------------------------
  function drawHero(ctx, rig) {
    if (!rig) return;
    const pos = rig.pos || [0, 0, 0];
    const yaw = rig.yaw || 0;
    const toW = (r, f, z) => vAdd(pos, localToWorld([r, f, z], yaw));

    const renderQueue = [];
    const enqueue = (depth, drawFn) => renderQueue.push({ depth, drawFn });

    const hz = rig.hips[2] - pos[2];

    // Fator de rotação relativo à câmera
    const camAngle = Math.PI / 4;
    let viewAngle = yaw - camAngle;
    viewAngle = Math.atan2(Math.sin(viewAngle), Math.cos(viewAngle));
    const facingFront = Math.cos(viewAngle);

    // ---------- 1. TORSO MUSCULOSO (Peitoral Nu e Costas) ----------
    const torsoSections = [
      { z: hz - 4,  radiusW: 15.5, radiusF: 12.0, offY: 0 },
      { z: hz + 10, radiusW: 14.0, radiusF: 11.0, offY: 0 },
      { z: hz + 22, radiusW: 13.5, radiusF: 10.5, offY: 1 },
      { z: hz + 34, radiusW: 16.0, radiusF: 12.5, offY: 1 },
      { z: hz + 46, radiusW: 21.0, radiusF: 15.5, offY: 2 },  // Peitorais / Ombros
      { z: hz + 58, radiusW: 24.5, radiusF: 16.5, offY: 1 },  // Clavícula
      { z: hz + 66, radiusW: 20.0, radiusF: 13.5, offY: 0 },
      { z: hz + 72, radiusW: 14.5, radiusF: 10.5, offY: 0 }   // Base do pescoço
    ];
    const torsoCloud = torsoLoftCloud(torsoSections, yaw, pos);
    const torsoPath = projectHull(torsoCloud);
    enqueue(D(toW(0, 0, hz + 26)), () => celFill(ctx, torsoPath, Palette.skin, 5.0, 2.4));

    // Definição Muscular Frontal (Peitoral e Abdômen)
    if (facingFront > 0.1) {
      // Peitorais marcados
      for (const side of [1, -1]) {
        enqueue(D(toW(side * 12, 14, hz + 52)) + 0.35, () => {
          const pOuter = P2(toW(side * 22, 15, hz + 55));
          const pLower = P2(toW(side * 13, 18, hz + 48));
          const pInner = P2(toW(side * 2.5, 17.5, hz + 49.5));

          ctx.strokeStyle = hexToRgba(Palette.skin.shadow, 0.2);
          ctx.lineWidth = 8.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pOuter[0], pOuter[1]);
          ctx.quadraticCurveTo(pLower[0], pLower[1], pInner[0], pInner[1]);
          ctx.stroke();

          ctx.strokeStyle = hexToRgba(Palette.skin.shadow, 0.85);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(pOuter[0], pOuter[1]);
          ctx.quadraticCurveTo(pLower[0], pLower[1], pInner[0], pInner[1]);
          ctx.stroke();
        });
      }

      // 6-Pack Abdômen Esculpido
      enqueue(D(toW(0, 13, hz + 26)) + 0.3, () => {
        // Linha Alba central
        ctx.strokeStyle = hexToRgba(Palette.skin.shadow, 0.6);
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(P2(toW(0, 14, hz + 40))[0], P2(toW(0, 14, hz + 40))[1]);
        ctx.lineTo(P2(toW(0, 12.5, hz + 14))[0], P2(toW(0, 12.5, hz + 14))[1]);
        ctx.stroke();

        // Linhas transversais dos gomos abdominais
        for (const zOff of [20, 28, 35]) {
          ctx.strokeStyle = hexToRgba(Palette.skin.shadow, 0.45);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(P2(toW(-7.5, 13, hz + zOff))[0], P2(toW(-7.5, 13, hz + zOff))[1]);
          ctx.lineTo(P2(toW(7.5, 13, hz + zOff))[0], P2(toW(7.5, 13, hz + zOff))[1]);
          ctx.stroke();
        }
      });
    }

    // ---------- 2. CALÇAS E CINTO COM CAVEIRA ----------
    const pantsSections = [
      { z: hz - 5,  radiusW: 17.0, radiusF: 13.5, offY: 0 },
      { z: hz - 15, radiusW: 15.5, radiusF: 12.5, offY: 0 },
      { z: hz - 26, radiusW: 14.0, radiusF: 11.5, offY: 0 }
    ];
    const pantsCloud = torsoLoftCloud(pantsSections, yaw, pos);
    const pantsPath = projectHull(pantsCloud);
    enqueue(D(toW(0, 0, hz - 14)), () => celFill(ctx, pantsPath, Palette.cloth, 3.6, 2.0));

    // Cinto largo e fivela de caveira
    enqueue(D(toW(0, 14, hz - 3)) + 0.45, () => {
      const beltCloud = torsoLoftCloud(
        [{ z: hz - 6, radiusW: 17.5, radiusF: 14.0 }, { z: hz - 1, radiusW: 17.5, radiusF: 14.0 }],
        yaw,
        pos
      );
      celFill(ctx, projectHull(beltCloud), Palette.gold, 2.2, 1.3);
      drawSkullBuckle(ctx, toW(0, 15, hz - 3));
    });

    // ---------- 3. MEMBROS (BRAÇOS E PERNAS) ----------
    for (const limb of rig.limbs) {
      const isArm = limb.name.startsWith('arm');
      const isLeg = limb.name.startsWith('leg');
      const midDepth = (D(limb.root) + D(limb.end)) * 0.5;

      enqueue(midDepth, () => {
        const rUpper = isArm ? 6.0 : 7.6;
        const rJoint = isArm ? 4.9 : 6.2;
        const rLower = isArm ? 4.2 : 4.6;
        const color = isLeg ? Palette.cloth : Palette.skin;

        // Membro Superior (Braço / Coxa)
        const upperCloud = limbTubeCloud(limb.root, limb.joint, rUpper, rJoint, 0.18);
        celFill(ctx, projectHull(upperCloud), color, 3.2, 1.5);

        // Membro Inferior (Antebraço / Canela)
        const lowerCloud = limbTubeCloud(limb.joint, limb.end, rJoint, rLower, 0.12);
        celFill(ctx, projectHull(lowerCloud), color, 2.8, 1.4);

        if (isArm) {
          const isRightArm = limb.name === 'armR';
          drawGripHand(ctx, limb.end, limb.joint, isRightArm || rig.isTwoHanded);
        }
      });
    }

    // ---------- 4. LENÇO VERMELHO CARMESIM (SASH) ----------
    const scarfPos = toW(0, 0, hz + 68);
    enqueue(D(scarfPos) + 0.5, () => {
      // Gola ao redor do pescoço
      const scarfCloud = torsoLoftCloud(
        [{ z: hz + 66, radiusW: 17.0, radiusF: 12.5 }, { z: hz + 73, radiusW: 15.0, radiusF: 11.5 }],
        yaw,
        pos
      );
      celFill(ctx, projectHull(scarfCloud), Palette.scarlet, 3.2, 1.6);

      // Pontas do lenço drapejando ao vento
      const tail1 = [P2(toW(-7, -13, hz + 68)), P2(toW(-16, -29, hz + 54)), P2(toW(-21, -40, hz + 42))];
      const tail2 = [P2(toW(4, -13, hz + 68)), P2(toW(9, -27, hz + 52)), P2(toW(12, -38, hz + 39))];

      celFill(ctx, ribbon(tail1, t => (1 - t) * 7.5 + 2.0), Palette.scarlet, 2.2, 1.2);
      celFill(ctx, ribbon(tail2, t => (1 - t) * 6.5 + 2.0), Palette.scarlet, 2.2, 1.2);
    });

    // ---------- 5. ESPADA DE HADES ----------
    enqueue(D(rig.handR) + 0.65, () => {
      drawSword(ctx, rig.handR, rig.swordDir);
    });

    // ---------- 6. CABEÇA DO CAREQUINHA ----------
    enqueue(D(rig.head), () => {
      globalThis.Agy.Head.drawHead(ctx, { pos: rig.head, yaw: rig.yaw, scale: 1.0 });
    });

    // Executa ordenação estrita de profundidade (back-to-front)
    renderQueue.sort((a, b) => a.depth - b.depth);
    for (const item of renderQueue) {
      item.drawFn();
    }
  }

  const Hero = {
    drawHero,
    drawSword,
    drawGripHand,
    drawSkullBuckle
  };

  globalThis.Agy = globalThis.Agy || {};
  globalThis.Agy.Hero = Hero;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Hero;
  }
})();
