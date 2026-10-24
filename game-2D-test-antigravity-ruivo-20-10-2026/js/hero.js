/**
 * hero.js - Renderizador e Controlador Dinâmico do Herói ("Red-Haired Knight")
 * 100% Canvas 2D nativo puro — Fidelidade milimétrica às referências oficiais:
 * - Retrato Chibi de Cabelos Vermelhos.png
 * - Diagrama de Rigging do Cavaleiro Chibi.png
 * - Folha de poses do cavaleiro ruivo chia.png
 * - Folha de Sprite de Cavaleiro Chibi.png
 * - Guia Isométrico de Corpo, Rig e Movimentação.png
 */

if (typeof require !== 'undefined') {
  const core = require('./core.js');
  const vectors = require('./hero_vectors.js');
  Vec3 = core.Vec3;
  HERO_VECTORS = vectors.HERO_VECTORS;
}

class Hero {
  constructor(rig, camera) {
    this.rig = rig;
    this.camera = camera;
    this.pos = new Vec3(0, 0, 0);
    this.scale = 0.52;
    this.debugSkeleton = false;

    // Dinâmica de animação procedimental
    this.isMoving = false;
    this.dashTimer = 0;
    this.isDashing = false;
    this.ghostTrail = []; // Rastros de sombra estilo Hades
    this.forwardStep = 0; // Passo adiante no golpe
  }

  update(dt) {
    this.rig.update(dt);

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    // Atualiza rastros de fantasma do Dash
    for (let i = this.ghostTrail.length - 1; i >= 0; i--) {
      this.ghostTrail[i].life -= dt * 3.8;
      if (this.ghostTrail[i].life <= 0) {
        this.ghostTrail.splice(i, 1);
      }
    }
  }

  addGhost(screenPos, poseKey, renderScale) {
    this.ghostTrail.push({
      x: screenPos.x,
      y: screenPos.y,
      poseKey: poseKey,
      scale: renderScale,
      life: 1.0
    });
  }

  /**
   * Determina a chave vetorial exata da pose para o quadro atual
   */
  getCurrentPoseKey() {
    const anim = this.rig.currentAnim;
    const t = this.rig.animTime;

    // Combates
    if (anim === 'combo1') {
      return (t / 0.38) < 0.40 ? 'corte_antic' : 'corte_strike';
    }
    if (anim === 'combo2') {
      return (t / 0.40) < 0.35 ? 'reves_antic' : 'reves_strike';
    }
    if (anim === 'combo3') {
      return (t / 0.55) < 0.45 ? 'salto_antic' : 'salto_impact';
    }

    // Ângulo relativo à câmera
    let ang = (this.rig.facingAngle - this.camera.yaw) % (Math.PI * 2);
    if (ang < 0) ang += Math.PI * 2;

    const step = (Math.PI * 2) / 8;
    const idx = Math.round(ang / step) % 8;

    const angleKeys = [
      'dir_0',   // 0° Sul / Frente
      'dir_45',  // 45° Sudeste
      'dir_90',  // 90° Leste
      'dir_135', // 135° Nordeste
      'dir_180', // 180° Costas
      'dir_225', // 225° Noroeste
      'dir_270', // 270° Oeste
      'dir_315'  // 315° Sudoeste
    ];

    // Se estiver em corrida na direção diagonal inferior direita, alterna com a pose 'run'
    if (anim === 'run') {
      if (idx === 7 || idx === 0) {
        const stride = Math.sin(this.rig.animTime * 13);
        if (stride > 0.25) return 'run';
      }
    }

    return angleKeys[idx];
  }

  /**
   * Renderiza o herói com sombras, cel-shading puro e dinâmica contínua
   */
  draw(ctx, customPoseKey = null, customScale = null) {
    const poseKey = customPoseKey || this.getCurrentPoseKey();
    const pose = (typeof HERO_VECTORS !== 'undefined') ? HERO_VECTORS[poseKey] : null;

    const screenPos = this.camera.project(this.pos);
    const renderScale = customScale !== null ? customScale : (this.camera.scale * this.scale);

    // 1. Rastros de Fantasma do Dash (Efeito Hades)
    for (const g of this.ghostTrail) {
      const gPose = HERO_VECTORS[g.poseKey];
      if (gPose && gPose.l) {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.scale(g.scale, g.scale);
        ctx.globalAlpha = g.life * 0.42;

        for (const layer of gPose.l) {
          ctx.fillStyle = '#00F0FF';
          ctx.beginPath();
          for (const poly of layer.p) {
            if (poly.length < 3) continue;
            ctx.moveTo(poly[0][0], poly[0][1]);
            for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
            ctx.closePath();
          }
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 2. Sombra de contato no solo (permanece fixa no chão Z=0 mesmo em saltos)
    ctx.save();
    const groundScreen = this.camera.project(new Vec3(this.pos.x, this.pos.y, 0));
    ctx.translate(groundScreen.x, groundScreen.y);

    let shadowScale = 1.0;
    if (this.rig.currentAnim === 'combo3' && poseKey === 'salto_antic') {
      shadowScale = 0.72; // Sombra encolhe e suaviza no ar
    }

    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * renderScale * shadowScale, 9 * renderScale * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(10, 5, 8, ${0.52 * shadowScale})`;
    ctx.fill();
    ctx.restore();

    // 3. Renderização do Herói com Dinâmica Procedimental
    ctx.save();
    let drawX = screenPos.x;
    let drawY = screenPos.y;

    // Dinâmica de Corrida: Bobbing vertical, squash e inclinação para frente
    let bobY = 0;
    let squashX = 1.0;
    let squashY = 1.0;
    let leanAngle = 0;

    if (this.rig.currentAnim === 'run') {
      const cycle = this.rig.animTime * 13;
      const bob = Math.abs(Math.sin(cycle));
      bobY = -bob * 4.2 * renderScale;

      // Squash and stretch no impacto do passo
      squashX = 1.0 + (0.5 - bob) * 0.05;
      squashY = 1.0 - (0.5 - bob) * 0.05;

      // Leve inclinação na direção da corrida
      leanAngle = Math.sin(cycle) * 0.035;
    } else if (this.rig.currentAnim === 'idle') {
      // Respiração suave no Idle
      bobY = Math.sin(this.rig.animTime * 3.2) * 1.5 * renderScale;
    } else if (this.rig.currentAnim === 'combo3') {
      if (poseKey === 'salto_antic') {
        // Elevação do salto no ar
        const u = Math.min(1, this.rig.animTime / 0.25);
        bobY = -Math.sin(u * Math.PI) * 28 * renderScale;
      }
    }

    ctx.translate(drawX, drawY + bobY);
    ctx.rotate(leanAngle);
    ctx.scale(renderScale * squashX, renderScale * squashY);

    // Renderização em camadas vetoriais calibradas sem jitter
    if (pose && pose.l) {
      for (const layer of pose.l) {
        ctx.fillStyle = layer.c;
        ctx.beginPath();
        for (const poly of layer.p) {
          if (poly.length < 3) continue;
          ctx.moveTo(poly[0][0], poly[0][1]);
          for (let i = 1; i < poly.length; i++) {
            ctx.lineTo(poly[i][0], poly[i][1]);
          }
          ctx.closePath();
        }
        ctx.fill();

        // Linhas de tinta para acabamento cel-shading HQ
        ctx.strokeStyle = layer.c;
        ctx.lineWidth = 0.35;
        ctx.stroke();
      }
    }

    ctx.restore();

    // 4. Modo de Depuração: Esqueleto 3D / Rig (Tecla B)
    if (this.debugSkeleton) {
      this.drawDebugSkeleton(ctx);
    }
  }

  drawDebugSkeleton(ctx) {
    const joints3D = this.rig.evaluate(this.pos);
    const cam = this.camera;
    const p = {};
    for (const key of Object.keys(joints3D)) {
      if (joints3D[key] instanceof Vec3) {
        p[key] = cam.project(joints3D[key]);
      }
    }

    ctx.save();
    ctx.strokeStyle = '#00FFCC';
    ctx.lineWidth = 2.2;

    const bones = [
      [p.pelvis, p.chest], [p.chest, p.head],
      [p.chest, p.shoulderL], [p.shoulderL, p.elbowL], [p.elbowL, p.handL],
      [p.chest, p.shoulderR], [p.shoulderR, p.elbowR], [p.elbowR, p.handR],
      [p.pelvis, p.hipL], [p.hipL, p.kneeL], [p.kneeL, p.footL],
      [p.pelvis, p.hipR], [p.hipR, p.kneeR], [p.kneeR, p.footR],
      [p.handR, p.swordTip]
    ];

    for (const [b1, b2] of bones) {
      if (b1 && b2) {
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.stroke();
      }
    }

    // Juntas anatômicas coloridas
    for (const key of Object.keys(p)) {
      ctx.beginPath();
      ctx.arc(p[key].x, p[key].y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = key.includes('head') ? '#FFD700' : (key.includes('hand') ? '#FF3366' : '#00E5FF');
      ctx.fill();
    }
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Hero };
}
