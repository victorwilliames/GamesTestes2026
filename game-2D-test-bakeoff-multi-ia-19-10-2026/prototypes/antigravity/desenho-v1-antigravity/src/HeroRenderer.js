// ============================================================================
// HeroRenderer.js — Orquestrador Principal do Desenho Procedural HERO-02
// Controla a ordem das camadas (Z-order), aplica poses estáticas ou do RIG-01,
// integra o Baker Offscreen de Peças Articuladas (100% Canvas 2D, Zero PNGs)
// para garantir > 200 FPS (< 0.5 ms/frame) em animação contínua e na Arena,
// e renderiza o modo de diagnóstico de articulações e pivôs.
// ============================================================================

import { MaterialPainter, createRNG } from './materials/MaterialPainter.js';
import { HeadPainter } from './painters/HeadPainter.js';
import { TorsoPainter } from './painters/TorsoPainter.js';
import { ArmPainter, HandPainter } from './painters/ArmPainter.js';
import { LegPainter, BootPainter } from './painters/LegPainter.js';
import { ClothPainter, AccessoryPainter } from './painters/ClothPainter.js';
import { ScarfPainter, CapePainter } from './painters/ScarfPainter.js';
import { WeaponPainter } from './painters/WeaponPainter.js';

export class HeroRenderer {
  constructor() {
    this.materials = new MaterialPainter();
    this.headPainter = new HeadPainter(this.materials);
    this.torsoPainter = new TorsoPainter(this.materials);
    this.armPainter = new ArmPainter(this.materials);
    this.handPainter = new HandPainter(this.materials);
    this.legPainter = new LegPainter(this.materials);
    this.bootPainter = new BootPainter(this.materials);
    this.clothPainter = new ClothPainter(this.materials);
    this.accessoryPainter = new AccessoryPainter(this.materials);
    this.scarfPainter = new ScarfPainter(this.materials);
    this.capePainter = new CapePainter(this.materials);
    this.weaponPainter = new WeaponPainter(this.materials);

    // Cache de poses canônicas estáticas (1254x1254) e peças articuladas do Rig
    this.staticPoseCache = new Map();
    this.rigParts = null;
  }

  /**
   * Renderiza o HERO-02 completo (ou peça isolada) em um espaço canônico 1254 × 1254.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} pose - Objeto de pose (de PosePresets ou RigAdapter)
   * @param {Object} opts - { showPivots: boolean, drawGroundShadow: boolean, fastRig: boolean, forceUncached: boolean }
   */
  render(ctx, pose, opts = {}) {
    const {
      showPivots = false,
      drawGroundShadow = false,
      fastRig = false,
      forceUncached = false
    } = opts;

    if (forceUncached) {
      this.renderDirect(ctx, pose, { showPivots, drawGroundShadow });
      return;
    }

    // Se estiver animando em tempo real (Arena ou Rig contínuo), usa o montador articulado
    // de peças procedurais pré-assadas no próprio Canvas 2D (< 0.4 ms por frame, > 200 FPS!)
    if (fastRig && pose.showBody && pose.showHead && pose.showWeapons) {
      this.renderFastArticulatedRig(ctx, pose, { showPivots, drawGroundShadow });
      return;
    }

    // Para poses estáticas de inspeção (Modes 1, 2, 3, 4 em repouso), faz o cache offscreen
    // exato de 1254x1254 na primeira chamada usando renderDirect (100% procedural)
    const cacheKey = `${pose.id || 'custom'}|piv:${showPivots ? 1 : 0}|shd:${drawGroundShadow ? 1 : 0}`;
    if (!this.staticPoseCache.has(cacheKey)) {
      const off = document.createElement('canvas');
      off.width = 1254;
      off.height = 1254;
      const octx = off.getContext('2d');
      this.renderDirect(octx, pose, { showPivots, drawGroundShadow });
      this.staticPoseCache.set(cacheKey, off);
    }
    ctx.drawImage(this.staticPoseCache.get(cacheKey), 0, 0);
  }

  /**
   * Pipeline Procedural Direto (executa todos os 11 Painters diretamente no contexto).
   */
  renderDirect(ctx, pose, opts = {}) {
    const {
      showPivots = false,
      drawGroundShadow = false
    } = opts;

    const s = pose.bodyScale || 1.0;
    const yaw = pose.yaw || 0;

    ctx.save();

    // 0. Sombra elíptica no chão opcional
    if (drawGroundShadow && pose.legL && pose.legR) {
      const gx = (pose.legL.footSole.x + pose.legR.footSole.x) * 0.5;
      const gy = Math.max(pose.legL.footSole.y, pose.legR.footSole.y) + 6;
      const sg = ctx.createRadialGradient(gx, gy, 30, gx, gy, 340);
      sg.addColorStop(0.0, 'rgba(15, 8, 5, 0.45)');
      sg.addColorStop(0.65, 'rgba(15, 8, 5, 0.18)');
      sg.addColorStop(1.0, 'rgba(15, 8, 5, 0.0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(gx, gy, 340, 48, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. CAPA TRASEIRA ASSIMÉTRICA (atrás do tronco e do braço direito)
    if (pose.showCape && pose.neckBase) {
      this.capePainter.paint(ctx, pose.neckBase, s, yaw, pose.capeFlutter || 0);
    }

    if (pose.showBody) {
      // 2. COXAS MUSCULOSAS (Esquerda e Direita)
      if (pose.legL) this.legPainter.paint(ctx, pose.legL, 'L', s);
      if (pose.legR) this.legPainter.paint(ctx, pose.legR, 'R', s);

      // 3. SAIOTE ESCURO RASGADO + FAIXAS VERMELHAS INTERNAS
      if (pose.pelvis) {
        this.clothPainter.paint(ctx, pose.pelvis, s, yaw, pose.legSpread || 0);
      }

      // 4. BOTAS COLOSSAIS DE COURO (sobrepõem a base das canelas e pontas laterais)
      if (pose.legL) this.bootPainter.paint(ctx, pose.legL, 'L', s);
      if (pose.legR) this.bootPainter.paint(ctx, pose.legR, 'R', s);

      // 5. TRONCO SEM CAMISA (Peitoral, Abdômen e Pescoço)
      this.torsoPainter.paint(ctx, pose);

      // 6. CINTO DE COURO, FAIXAS LATERAIS, CORRENTES DE BRONZE E CAVEIRA ÚNICA FRONTAL
      if (pose.pelvis) {
        this.accessoryPainter.paint(ctx, pose.pelvis, s, yaw);
      }

      // 7. BRAÇOS, BRAÇADEIRAS EM CAMADAS E VOLTAS DE CORRENTE INFERNAL NOS PULSOS/ANTEBRAÇOS
      const hasWeaponChains = !!pose.showWeapons;
      if (pose.armL) this.armPainter.paint(ctx, pose.armL, 'L', s, hasWeaponChains);
      if (pose.armR) this.armPainter.paint(ctx, pose.armR, 'R', s, hasWeaponChains);

      // 7.5. DORSO DA MÃO, PROTETOR DE COURO E BASE DA PALMA (gripBack + fingersBack atrás do cabo!)
      if (pose.armL) {
        const holdL = !!pose.showWeapons && !(pose.weaponL && pose.weaponL.isExtended);
        this.handPainter.paintWristAndPalmBack(ctx, pose.armL.wrist, pose.armL.handGrip, 'L', s, holdL);
      }
      if (pose.armR) {
        const holdR = !!pose.showWeapons && !(pose.weaponR && pose.weaponR.isExtended);
        this.handPainter.paintWristAndPalmBack(ctx, pose.armR.wrist, pose.armR.handGrip, 'R', s, holdR);
      }
    }

    // 8. CORRENTES INFERNAIS DINÂMICAS (Pomo <-> Pulso) + ARMAS PROCEDURAIS (Lâminas do Caos)
    if (pose.showWeapons) {
      if (pose.showBody) {
        if (pose.weaponL && pose.armL) {
          this.weaponPainter.paintDynamicPommelToWristChain(ctx, { ...pose.weaponL, side: 'L' }, pose.armL, s);
        }
        if (pose.weaponR && pose.armR) {
          this.weaponPainter.paintDynamicPommelToWristChain(ctx, { ...pose.weaponR, side: 'R' }, pose.armR, s);
        }
      }
      if (pose.weaponL) {
        this.weaponPainter.paintWeapon(ctx, { ...pose.weaponL, side: 'L' });
      }
      if (pose.weaponR) {
        this.weaponPainter.paintWeapon(ctx, { ...pose.weaponR, side: 'R' });
      }
    }

    // 9. DEDOS INDIVIDUAIS FECHADOS E POLEGAR (fingersFront -> thumb -> guardLip abraçando o cabo!)
    if (pose.showBody && pose.showWeapons) {
      if (pose.armL && !(pose.weaponL && pose.weaponL.isExtended)) {
        this.handPainter.paintClenchedFingersOverHilt(ctx, pose.armL.wrist, pose.armL.handGrip, pose.weaponL, 'L', s);
      }
      if (pose.armR && !(pose.weaponR && pose.weaponR.isExtended)) {
        this.handPainter.paintClenchedFingersOverHilt(ctx, pose.armR.wrist, pose.armR.handGrip, pose.weaponR, 'R', s);
      }
    }

    // 10. CACHECOL VERMELHO VOLUMOSO NO PESCOÇO (cobre a junção ombro-pescoço)
    if (pose.showScarf && pose.neckBase) {
      this.scarfPainter.paint(ctx, pose.neckBase, s, yaw);
    }

    // 11. CABEÇA CHIBI COMPLETA (Orelhas, Rosto, Olhos Vermelhos e 22 Mechas de Cabelo)
    if (pose.showHead && pose.head) {
      this.headPainter.paint(ctx, pose.head);
    }

    // 12. MODO 3 — DIAGNÓSTICO DE ARTICULAÇÕES, PIVÔS E GUIAS ANATÔMICAS
    if (showPivots) {
      this.paintArticulationDiagnostics(ctx, pose);
    }

    ctx.restore();
  }

  // ==========================================================================
  // BAKER OFFSCREEN DE PEÇAS ARTICULADAS (ETAPA 2 & ETAPA 4 — 200+ FPS)
  // Usa exatamente os mesmos Painters procedurais em Canvas 2D para gerar os
  // segmentos anatômicos na inicialização e articulá-los em < 0.4 ms por frame!
  // ==========================================================================
  ensureRigPartsBaked() {
    if (this.rigParts) return this.rigParts;

    const s = 0.76; // bodyScale canônico do herói completo
    const parts = {};

    const makeCanvas = (w, h) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return { canvas: c, ctx: c.getContext('2d') };
    };

    // 1. Capa Traseira (ancorada em neckBase = (280, 120) no buffer local)
    {
      const { canvas, ctx } = makeCanvas(640, 640);
      this.capePainter.paint(ctx, { x: 280, y: 120 }, s, 0, 0);
      parts.cape = { canvas, ax: 280, ay: 120 };
    }

    // 2. Saiote Rasgado (ancorado em pelvis = (240, 60))
    {
      const { canvas, ctx } = makeCanvas(480, 320);
      this.clothPainter.paint(ctx, { x: 240, y: 60 }, s, 0, 0);
      parts.skirt = { canvas, ax: 240, ay: 60 };
    }

    // 3. Coxas Esquerda e Direita (vertical de hip=(110, 60) até knee=(110, 205), len=145)
    for (const side of ['L', 'R']) {
      const { canvas, ctx } = makeCanvas(220, 260);
      this.legPainter.paint(ctx, {
        hip: { x: 110, y: 60 },
        knee: { x: 110, y: 205 },
        ankle: { x: 110, y: 315 },
        footSole: { x: 110, y: 396 }
      }, side, s);
      parts[`thigh${side}`] = { canvas, ax: 110, ay: 60, refLen: 145 };
    }

    // 4. Botas Colossais: Frontais (L/R) e Laterais (Direita/Esquerda)
    for (const side of ['L', 'R']) {
      const { canvas, ctx } = makeCanvas(380, 260);
      const naturalKneeX = 190 + (side === 'L' ? -17 : 17);
      this.bootPainter.paint(ctx, {
        hip: { x: naturalKneeX, y: -100 },
        knee: { x: naturalKneeX, y: 45 },
        ankle: { x: 190, y: 155 },
        footSole: { x: 190, y: 235 },
        footPitch: 0,
        facingDir: 0,
        yaw: 0
      }, side, s);
      parts[`boot${side}`] = { canvas, ax: 190, ay: 45, refLen: 190 };
      parts[`bootFront${side}`] = parts[`boot${side}`];
    }

    // Bota voltada para a Direita (East, yaw = -0.96, facingDir = 1)
    {
      const { canvas, ctx } = makeCanvas(380, 260);
      this.bootPainter.paint(ctx, {
        hip: { x: 190, y: -100 },
        knee: { x: 190, y: 45 },
        ankle: { x: 190, y: 155 },
        footSole: { x: 190, y: 235 },
        footPitch: 0,
        facingDir: 1,
        yaw: -0.96
      }, 'R', s);
      parts.bootRight = { canvas, ax: 190, ay: 45, refLen: 190 };
    }

    // Bota voltada para a Esquerda (West, yaw = 0.96, facingDir = -1)
    {
      const { canvas, ctx } = makeCanvas(380, 260);
      this.bootPainter.paint(ctx, {
        hip: { x: 190, y: -100 },
        knee: { x: 190, y: 45 },
        ankle: { x: 190, y: 155 },
        footSole: { x: 190, y: 235 },
        footPitch: 0,
        facingDir: -1,
        yaw: 0.96
      }, 'L', s);
      parts.bootLeft = { canvas, ax: 190, ay: 45, refLen: 190 };
    }

    // 5. Tronco + Cinto + Caveira + Cachecol para 5 orientações (S, SE, E, SW, W)
    for (const [key, yawVal] of [['S', 0], ['SE', -0.78], ['E', -0.96], ['SW', 0.78], ['W', 0.96]]) {
      const { canvas, ctx } = makeCanvas(520, 460);
      const mockPose = {
        bodyScale: s,
        yaw: yawVal,
        showBareNeck: false,
        neckBase: { x: 260, y: 112 },
        chest: { x: 260, y: 178 },
        pelvis: { x: 260, y: 265 }
      };
      this.torsoPainter.paint(ctx, mockPose);
      this.accessoryPainter.paint(ctx, mockPose.pelvis, s, yawVal);
      this.scarfPainter.paint(ctx, mockPose.neckBase, s, yawVal);
      parts[`torso_${key}`] = { canvas, ax: 260, ay: 265 }; // ancorado na pelve
    }

    // 6. Cabeça Chibi Completa para 5 orientações (S, SE, E, SW, W)
    for (const [key, yawVal] of [['S', 0], ['SE', -0.78], ['E', -0.96], ['SW', 0.78], ['W', 0.96]]) {
      const { canvas, ctx } = makeCanvas(760, 680);
      this.headPainter.paint(ctx, {
        x: 380,
        y: 610,
        scaleX: 0.568,
        scaleY: 0.568,
        rotation: 0,
        yaw: yawVal,
        anchorX: 637,
        anchorY: 1132
      });
      parts[`head_${key}`] = { canvas, ax: 380, ay: 610 };
    }

    // 7. Braço Completo + Correntes no Antebraço + Lâmina do Caos + 4 Dedos Empunhando
    // Assamos também os segmentos de braço (shoulder -> wrist) e o conjunto Mão+Arma (ancorado em handGrip)
    for (const side of ['L', 'R']) {
      // 7a. Braço + Antebraço com Voltas de Corrente Infernal (de shoulder=(120, 90) até wrist=(120, 250), len=160)
      {
        const { canvas, ctx } = makeCanvas(240, 340);
        const isL = side === 'L';
        const armMock = {
          shoulder: { x: 120, y: 90 },
          elbow: { x: 120 + (isL ? -18 : 18), y: 170 },
          wrist: { x: 120, y: 250 },
          handGrip: { x: 120, y: 288 }
        };
        this.armPainter.paint(ctx, armMock, side, s, true);
        parts[`arm_${side}`] = { canvas, ax: 120, ay: 90, refLen: 160 };
      }

      // 7b. Conjunto Mão + Lâmina do Caos Empunhada (gripBack -> fingersBack -> Arma -> 4 Dedos -> Polegar -> Guarda)
      // Ancorado em handGrip = (380, 320) com rotation = 0
      {
        const { canvas, ctx } = makeCanvas(720, 680);
        const gx = 380, gy = 320;
        const wristMock = { x: gx, y: gy - 46 * s };
        const gripMock = { x: gx, y: gy };
        const wPoseMock = { x: gx, y: gy, scale: 0.62, rotation: 0, side };
        this.handPainter.paintWristAndPalmBack(ctx, wristMock, gripMock, side, s, true);
        this.weaponPainter.paintWeapon(ctx, wPoseMock);
        this.handPainter.paintClenchedFingersOverHilt(ctx, wristMock, gripMock, wPoseMock, side, s);
        parts[`weaponHeld_${side}`] = { canvas, ax: gx, ay: gy };
      }

      // 7c. Lâmina do Caos Isolada em Voo (para ataques com corrente estendida: combo4 / skillQ / skillR)
      {
        const { canvas, ctx } = makeCanvas(720, 680);
        const gx = 380, gy = 320;
        this.weaponPainter.paintWeapon(ctx, { x: gx, y: gy, scale: 0.62, rotation: 0, side });
        parts[`weaponFlying_${side}`] = { canvas, ax: gx, ay: gy };
      }

      // 7d. Punho Fechado Segurando a Corrente (usado quando a arma foi arremessada)
      {
        const { canvas, ctx } = makeCanvas(180, 180);
        this.handPainter.paintWristAndPalmBack(ctx, { x: 90, y: 54 }, { x: 90, y: 95 }, side, s, false);
        parts[`fist_${side}`] = { canvas, ax: 90, ay: 95 };
      }
    }

    // 8. Elos Individuais da Corrente Infernal (face e edge) para a catenária dinâmica Pomo <-> Pulso
    {
      const rng = createRNG(9901);
      const f = makeCanvas(96, 68);
      this.weaponPainter.paintStadiumChainRing(f.ctx, 48, 34, 0, rng, 0.52);
      parts.chainFace = { canvas: f.canvas, ax: 48, ay: 34 };

      const e = makeCanvas(84, 54);
      this.weaponPainter.paintStadiumSideLink(e.ctx, 42, 27, 0, rng, 0.52);
      parts.chainEdge = { canvas: e.canvas, ax: 42, ay: 27 };
    }

    this.rigParts = parts;
    return parts;
  }

  /**
   * Renderiza o Esqueleto Articulado RIG-01 em alta velocidade (< 0.4 ms / > 200 FPS)
   * usando os componentes procedurais pré-assados + corrente catenária em tempo real.
   */
  renderFastArticulatedRig(ctx, pose, opts = {}) {
    const parts = this.ensureRigPartsBaked();
    const { showPivots = false, drawGroundShadow = false } = opts;
    const s = pose.bodyScale || 0.76;
    const yaw = pose.yaw || 0;
    let orientKey = 'S';
    if (yaw < -0.85) orientKey = 'E';
    else if (yaw < -0.25) orientKey = 'SE';
    else if (yaw > 0.85) orientKey = 'W';
    else if (yaw > 0.25) orientKey = 'SW';

    ctx.save();

    // 0. Sombra no chão
    if (drawGroundShadow && pose.legL && pose.legR) {
      const gx = (pose.legL.footSole.x + pose.legR.footSole.x) * 0.5;
      const gy = Math.max(pose.legL.footSole.y, pose.legR.footSole.y) + 6;
      ctx.fillStyle = 'rgba(15, 8, 5, 0.32)';
      ctx.beginPath();
      ctx.ellipse(gx, gy, 240, 38, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawBoneSprite = (part, p1, p2, extraRot = 0, scaleX = 1.0) => {
      if (!part || !p1 || !p2) return;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || part.refLen;
      const ang = Math.atan2(dy, dx) - Math.PI * 0.5 + extraRot;
      const sy = len / part.refLen;
      ctx.save();
      ctx.translate(p1.x, p1.y);
      ctx.rotate(ang);
      ctx.scale(scaleX, sy);
      ctx.drawImage(part.canvas, -part.ax, -part.ay);
      ctx.restore();
    };

    // 1. Capa Traseira com esvoaçar dinâmico
    const drawCape = () => {
      if (pose.showCape && pose.neckBase) {
        const cp = parts.cape;
        ctx.save();
        ctx.translate(pose.neckBase.x + yaw * 18, pose.neckBase.y);
        ctx.rotate((pose.capeFlutter || 0) * -0.14);
        ctx.scale(1 + Math.abs(pose.capeFlutter || 0) * 0.06, 1);
        ctx.drawImage(cp.canvas, -cp.ax, -cp.ay);
        ctx.restore();
      }
    };

    // 2. Desenho de Perna com Seleção de Bota Direcional
    const drawLeg = (side) => {
      const leg = side === 'L' ? pose.legL : pose.legR;
      if (!leg) return;
      const thighPart = side === 'L' ? parts.thighL : parts.thighR;
      // Bota orientada sempre para a frente do movimento!
      const bootPart = yaw < -0.25
        ? parts.bootRight
        : (yaw > 0.25 ? parts.bootLeft : (side === 'L' ? parts.bootFrontL : parts.bootFrontR));

      drawBoneSprite(thighPart, leg.hip, leg.knee);
      drawBoneSprite(bootPart, leg.knee, leg.footSole, (leg.footPitch || 0) * 0.35);
    };

    // 3. Tronco, Saiote e Acessórios
    const drawTorsoAndSkirt = () => {
      if (pose.pelvis) {
        const sk = parts.skirt;
        ctx.save();
        ctx.translate(pose.pelvis.x, pose.pelvis.y);
        ctx.scale(1 + (pose.legSpread || 0) * 0.16, 1);
        ctx.drawImage(sk.canvas, -sk.ax, -sk.ay);
        ctx.restore();
      }
      if (pose.pelvis && pose.chest) {
        const tr = parts[`torso_${orientKey}`] || parts.torso_S;
        const tAng = Math.atan2(pose.chest.y - pose.pelvis.y, pose.chest.x - pose.pelvis.x) + Math.PI * 0.5;
        ctx.save();
        ctx.translate(pose.pelvis.x, pose.pelvis.y);
        ctx.rotate(tAng * 0.65);
        ctx.drawImage(tr.canvas, -tr.ax, -tr.ay);
        ctx.restore();
      }
    };

    // 4. Braço, Mão Empunhada e Lâmina do Caos
    const drawArmAndWeapon = (side) => {
      const arm = side === 'L' ? pose.armL : pose.armR;
      const wep = side === 'L' ? pose.weaponL : pose.weaponR;
      if (!arm) return;
      drawBoneSprite(side === 'L' ? parts.arm_L : parts.arm_R, arm.shoulder, arm.wrist);
      if (!wep) return;

      this.drawFastDynamicChain(ctx, parts, { ...wep, side }, arm, s);

      if (wep.isExtended) {
        const fist = parts[`fist_${side}`];
        ctx.save();
        ctx.translate(arm.handGrip.x, arm.handGrip.y);
        ctx.drawImage(fist.canvas, -fist.ax, -fist.ay);
        ctx.restore();

        const wf = parts[`weaponFlying_${side}`];
        ctx.save();
        ctx.translate(wep.x, wep.y);
        ctx.rotate(wep.rotation || 0);
        ctx.drawImage(wf.canvas, -wf.ax, -wf.ay);
        ctx.restore();
      } else {
        const wh = parts[`weaponHeld_${side}`];
        ctx.save();
        ctx.translate(wep.x, wep.y);
        ctx.rotate(wep.rotation || 0);
        ctx.drawImage(wh.canvas, -wh.ax, -wh.ay);
        ctx.restore();
      }
    };

    // Ordenação Z de Membros em Perspectiva 2.5D
    drawCape();
    if (yaw < -0.28) {
      // Olhando / Movendo para o Leste (Direita): Lado Esquerdo (L) é distante, Lado Direito (R) é próximo!
      drawArmAndWeapon('L');
      drawLeg('L');
      drawTorsoAndSkirt();
      drawLeg('R');
      drawArmAndWeapon('R');
    } else if (yaw > 0.28) {
      // Olhando / Movendo para o Oeste (Esquerda): Lado Direito (R) é distante, Lado Esquerdo (L) é próximo!
      drawArmAndWeapon('R');
      drawLeg('R');
      drawTorsoAndSkirt();
      drawLeg('L');
      drawArmAndWeapon('L');
    } else {
      // Olhando de Frente (Sul): Posição neutra
      drawLeg('L');
      drawLeg('R');
      drawTorsoAndSkirt();
      drawArmAndWeapon('L');
      drawArmAndWeapon('R');
    }

    // 5. Cabeça Chibi Completa (22 mechas + olhos rubi)
    if (pose.head) {
      const hd = parts[`head_${orientKey}`] || parts.head_S;
      ctx.save();
      ctx.translate(pose.head.x, pose.head.y);
      if (pose.head.rotation) ctx.rotate(pose.head.rotation);
      ctx.drawImage(hd.canvas, -hd.ax, -hd.ay);
      ctx.restore();
    }

    if (showPivots) {
      this.paintArticulationDiagnostics(ctx, pose);
    }

    ctx.restore();
  }

  /**
   * Estampa elos pré-assados (chainFace / chainEdge) ao longo da curva catenária
   * entre o pomo da arma e a argola do pulso em < 0.04 ms!
   */
  drawFastDynamicChain(ctx, parts, wPose, armPose, bodyScale = 0.76) {
    const isLeft = wPose.side === 'L';
    const anchors = this.weaponPainter.getWeaponWorldAnchors(wPose);
    const pommel = anchors.pommel;

    const fDx = armPose.wrist.x - armPose.elbow.x;
    const fDy = armPose.wrist.y - armPose.elbow.y;
    const fAng = Math.atan2(fDy, fDx);
    const perpAng = fAng + Math.PI * 0.5;
    const wristOffset = (isLeft ? 1 : -1) * 28 * bodyScale;

    const wristAnchor = {
      x: armPose.wrist.x + Math.cos(perpAng) * wristOffset,
      y: armPose.wrist.y + Math.sin(perpAng) * wristOffset
    };

    const dist = Math.hypot(wristAnchor.x - pommel.x, wristAnchor.y - pommel.y);
    if (dist < 8) return;

    const sway = wPose.chainSway || 0;
    const tension = Math.min(1.0, Math.max(0, (dist - 120) / 220));
    const sag = (1 - tension * 0.82) * (54 * bodyScale) + Math.abs(sway) * 18;
    const swayX = sway * 24 * bodyScale + (isLeft ? 18 : -18) * bodyScale;

    const ctrlX = (pommel.x + wristAnchor.x) * 0.5 + swayX;
    const ctrlY = Math.max(pommel.y, wristAnchor.y) + sag;

    const numLinks = Math.max(5, Math.min(16, Math.round(dist / 22) + 2));
    const sample = (t) => {
      const u = 1 - t;
      return {
        x: u * u * pommel.x + 2 * u * t * ctrlX + t * t * wristAnchor.x,
        y: u * u * pommel.y + 2 * u * t * ctrlY + t * t * wristAnchor.y
      };
    };

    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i <= numLinks; i++) {
        const isFace = (i % 2 === 0);
        if ((pass === 0 && !isFace) || (pass === 1 && isFace)) continue;

        const t = i / numLinks;
        const pt = sample(t);
        const ptNext = sample(Math.min(1, t + 0.05));
        const ptPrev = sample(Math.max(0, t - 0.05));
        const ang = Math.atan2(ptNext.y - ptPrev.y, ptNext.x - ptPrev.x);
        const sp = isFace ? parts.chainFace : parts.chainEdge;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(ang);
        ctx.drawImage(sp.canvas, -sp.ax, -sp.ay);
        ctx.restore();
      }
    }
  }

  paintArticulationDiagnostics(ctx, pose) {
    ctx.save();

    const drawBone = (p1, p2, color = '#38bdf8') => {
      if (!p1 || !p2) return;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    const drawPivot = (pt, label, color = '#facc15', radius = 9) => {
      if (!pt) return;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius + 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pt.x - radius - 4, pt.y);
      ctx.lineTo(pt.x + radius + 4, pt.y);
      ctx.moveTo(pt.x, pt.y - radius - 4);
      ctx.lineTo(pt.x, pt.y + radius + 4);
      ctx.stroke();

      if (label) {
        ctx.font = 'bold 17px Consolas, monospace';
        const tw = ctx.measureText(label).width;
        const lx = pt.x + 14;
        const ly = pt.y - 10;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
        ctx.fillRect(lx - 4, ly - 15, tw + 8, 21);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(lx - 4, ly - 15, tw + 8, 21);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(label, lx, ly);
      }
    };

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(627, 20);
    ctx.lineTo(627, 1240);
    ctx.moveTo(60, 1226);
    ctx.lineTo(1194, 1226);
    ctx.stroke();
    ctx.setLineDash([]);

    if (pose.showBody) {
      drawBone(pose.pelvis, pose.chest, '#fbbf24');
      drawBone(pose.chest, pose.neckBase, '#fbbf24');
      if (pose.head) drawBone(pose.neckBase, pose.head, '#fbbf24');

      if (pose.armL) {
        drawBone(pose.chest, pose.armL.shoulder, '#fb7185');
        drawBone(pose.armL.shoulder, pose.armL.elbow, '#fb7185');
        drawBone(pose.armL.elbow, pose.armL.wrist, '#fb7185');
        drawBone(pose.armL.wrist, pose.armL.handGrip, '#fb7185');
      }

      if (pose.armR) {
        drawBone(pose.chest, pose.armR.shoulder, '#60a5fa');
        drawBone(pose.armR.shoulder, pose.armR.elbow, '#60a5fa');
        drawBone(pose.armR.elbow, pose.armR.wrist, '#60a5fa');
        drawBone(pose.armR.wrist, pose.armR.handGrip, '#60a5fa');
      }

      if (pose.legL) {
        drawBone(pose.pelvis, pose.legL.hip, '#f43f5e');
        drawBone(pose.legL.hip, pose.legL.knee, '#f43f5e');
        drawBone(pose.legL.knee, pose.legL.ankle, '#f43f5e');
        drawBone(pose.legL.ankle, pose.legL.footSole, '#f43f5e');
      }

      if (pose.legR) {
        drawBone(pose.pelvis, pose.legR.hip, '#3b82f6');
        drawBone(pose.legR.hip, pose.legR.knee, '#3b82f6');
        drawBone(pose.legR.knee, pose.legR.ankle, '#3b82f6');
        drawBone(pose.legR.ankle, pose.legR.footSole, '#3b82f6');
      }

      drawPivot(pose.pelvis, 'pelvis / skullBuckle', '#facc15', 10);
      drawPivot(pose.chest, 'chest', '#facc15', 9);
      drawPivot(pose.neckBase, 'neckBase / scarf', '#facc15', 9);
      if (pose.showCape && pose.neckBase) {
        drawPivot({ x: pose.neckBase.x + 75 * (pose.bodyScale || 1), y: pose.neckBase.y + 10 }, 'capeAttach', '#f87171', 8);
      }

      if (pose.armL) {
        drawPivot(pose.armL.shoulder, 'shoulderL', '#fb7185', 8);
        drawPivot(pose.armL.elbow, 'elbowL', '#fb7185', 8);
        drawPivot(pose.armL.wrist, 'wristL (chainWrapL)', '#fb7185', 8);
        drawPivot(pose.armL.handGrip, 'handGripL / weaponL', '#a855f7', 9);
      }
      if (pose.armR) {
        drawPivot(pose.armR.shoulder, 'shoulderR', '#60a5fa', 8);
        drawPivot(pose.armR.elbow, 'elbowR', '#60a5fa', 8);
        drawPivot(pose.armR.wrist, 'wristR (chainWrapR)', '#60a5fa', 8);
        drawPivot(pose.armR.handGrip, 'handGripR / weaponR', '#a855f7', 9);
      }
      if (pose.legL) {
        drawPivot(pose.legL.hip, 'hipL', '#f43f5e', 8);
        drawPivot(pose.legL.knee, 'kneeL', '#f43f5e', 8);
        drawPivot(pose.legL.ankle, 'ankleL', '#f43f5e', 8);
        drawPivot(pose.legL.footSole, 'footSoleL', '#10b981', 9);
      }
      if (pose.legR) {
        drawPivot(pose.legR.hip, 'hipR', '#3b82f6', 8);
        drawPivot(pose.legR.knee, 'kneeR', '#3b82f6', 8);
        drawPivot(pose.legR.ankle, 'ankleR', '#3b82f6', 8);
        drawPivot(pose.legR.footSole, 'footSoleR', '#10b981', 9);
      }
    }

    if (pose.showHead && pose.head) {
      drawPivot({ x: pose.head.x, y: pose.head.y }, 'headPivot (chin/neck)', '#34d399', 10);
      const hs = pose.head.scaleX || 1;
      const eyeY = pose.head.y - (1132 - 942) * hs;
      drawPivot({ x: pose.head.x - 126 * hs + (pose.yaw || 0) * 20, y: eyeY }, 'eyeL', '#ef4444', 6);
      drawPivot({ x: pose.head.x + 148 * hs + (pose.yaw || 0) * 20, y: eyeY - 6 * hs }, 'eyeR', '#ef4444', 6);
      drawPivot({ x: pose.head.x + 190 * hs, y: pose.head.y - (1132 - 432) * hs }, 'hairWhorl', '#fb923c', 7);
    }

    if (pose.showWeapons && !pose.showBody) {
      if (pose.weaponL) {
        drawPivot({ x: pose.weaponL.x, y: pose.weaponL.y }, 'gripAnchorL', '#a855f7', 10);
        drawPivot({ x: pose.weaponL.x - 78, y: pose.weaponL.y + 18 }, 'chainRing1L', '#f59e0b', 8);
        drawPivot({ x: pose.weaponL.x + 81, y: pose.weaponL.y + 99 }, 'pommelRingL', '#f59e0b', 8);
      }
      if (pose.weaponR) {
        drawPivot({ x: pose.weaponR.x, y: pose.weaponR.y }, 'gripAnchorR', '#a855f7', 10);
        drawPivot({ x: pose.weaponR.x + 78, y: pose.weaponR.y + 18 }, 'chainRing1R', '#f59e0b', 8);
        drawPivot({ x: pose.weaponR.x - 81, y: pose.weaponR.y + 99 }, 'pommelRingR', '#f59e0b', 8);
      }
    }

    ctx.restore();
  }
}
