'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — rig.js
// Esqueleto 3D Invisível, IK Analítica de 2 Ossos (Lei dos Cossenos)
// e Animação de Combate com Coordenadas Cilíndricas (Método RafaxLab)
// =============================================================================

(() => {
  const {
    vAdd,
    vSub,
    vScale,
    vDot,
    vCross,
    vNorm,
    vLen,
    vDist,
    vLerp,
    localToWorld,
    cylindricalToLocal,
    clamp,
    lerp,
    Ease
  } = globalThis.Agy.Core;

  // ---------------------------------------------------------------------------
  // 1. Cinemática Inversa (IK) Analítica de 2 Ossos
  // Lei dos Cossenos com Vetor Polar para travar o plano anatômico de dobra.
  // ---------------------------------------------------------------------------
  function solveIK(root, target, len1, len2, pole = [0, 0, 1]) {
    const toTarget = vSub(target, root);
    let dist = vLen(toTarget);

    const minReach = Math.abs(len1 - len2);
    const maxReach = len1 + len2;

    // Determina a direção principal do membro
    let dir;
    if (dist > 1e-7) {
      dir = vScale(toTarget, 1 / dist);
    } else {
      const p = (pole[0] || pole[1] || pole[2]) ? pole : [0, 0, 1];
      dir = vNorm(p);
      if (!dir[0] && !dir[1] && !dir[2]) dir = [0, 0, 1];
    }

    // Trava a distância na faixa viável do triângulo
    dist = clamp(dist, minReach, maxReach);

    // Lei dos Cossenos para o ângulo da articulação
    const a = (len1 * len1 - len2 * len2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(0, len1 * len1 - a * a));

    // Vetor polar projetado ortogonalmente à linha root->target
    let perp = vSub(pole, vScale(dir, vDot(pole, dir)));
    let perpLen = vLen(perp);
    if (perpLen < 1e-6) {
      const ref = Math.abs(dir[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      perp = vCross(dir, ref);
      perpLen = vLen(perp);
    }
    perp = perpLen > 1e-7 ? vScale(perp, 1 / perpLen) : [0, 1, 0];

    // Posição final da articulação intermediária (cotovelo / joelho)
    const joint = vAdd(vAdd(root, vScale(dir, a)), vScale(perp, h));

    // Posição da extremidade garantindo rigorosamente len2
    const toEnd = vSub(target, joint);
    const toEndLen = vLen(toEnd);
    const endDir = toEndLen > 1e-7 ? vScale(toEnd, 1 / toEndLen) : dir;
    const end = vAdd(joint, vScale(endDir, len2));

    return { root, joint, end };
  }

  // ---------------------------------------------------------------------------
  // 2. Proporções Anatômicas do Herói Carequinha (Estilo Hades 2.5D)
  // Medidas em centímetros (altura total ~ 185 cm)
  // ---------------------------------------------------------------------------
  const Anatomy = {
    totalHeight: 185,
    headCenterZ: 158,
    neckZ: 130,
    shoulderZ: 122,
    chestZ: 108,
    waistZ: 82,
    hipZ: 56,
    shoulderWidth: 46,
    hipWidth: 26,
    upperArm: 40,
    forearm: 36,
    thigh: 28,
    calf: 26,
    footZ: 4
  };

  const IDLE_HAND_Z = Anatomy.hipZ - 8;

  // ---------------------------------------------------------------------------
  // 3. Máquina de Combate (Combo 1 -> 2 -> 3)
  // ---------------------------------------------------------------------------
  const STRIKE_TIME = 0.46; // Duração do golpe ativo
  const RECOVERY_TIME = 0.25; // Janela de recuperação

  class CombatEngine {
    constructor() {
      this.strikeIndex = -1; // -1: idle, 0: golpe 1, 1: golpe 2, 2: golpe 3
      this.elapsed = 0;
      this.hasQueuedClick = false;
      this.recoveryLeft = 0;
    }

    triggerAttack() {
      if (this.strikeIndex === -1) {
        this.strikeIndex = 0;
        this.elapsed = 0;
        this.hasQueuedClick = false;
        this.recoveryLeft = 0;
      } else if (this.strikeIndex < 2) {
        // Enfileira próximo golpe se clicado durante a ação
        this.hasQueuedClick = true;
      }
    }

    update(dt) {
      if (this.strikeIndex === -1) {
        if (this.recoveryLeft > 0) {
          this.recoveryLeft = Math.max(0, this.recoveryLeft - dt);
        }
        return;
      }

      this.elapsed += dt;
      if (this.elapsed >= STRIKE_TIME) {
        if (this.strikeIndex < 2 && this.hasQueuedClick) {
          this.strikeIndex++;
          this.elapsed = 0;
          this.hasQueuedClick = false;
        } else {
          this.strikeIndex = -1;
          this.elapsed = 0;
          this.hasQueuedClick = false;
          this.recoveryLeft = RECOVERY_TIME;
        }
      }
    }

    get isAttacking() {
      return this.strikeIndex >= 0;
    }

    get progress() {
      return this.strikeIndex >= 0 ? clamp(this.elapsed / STRIKE_TIME, 0, 1) : 0;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Poses de Ataque por Coordenadas Cilíndricas (Rafa & Claude)
  // Mãos descritas por (theta, radius, z) ao redor do eixo vertical do corpo.
  // ---------------------------------------------------------------------------
  function computeAttackPose(index, progress) {
    if (index < 0) return null;

    // 4 Fases: Antecipação (0..0.28) -> Golpe (0.28..0.58) -> Continuação (0.58..0.78) -> Recuperação (0.78..1.0)
    let phase, phaseT;
    if (progress < 0.28) {
      phase = 'windup';
      phaseT = Ease.inQuad(progress / 0.28);
    } else if (progress < 0.58) {
      phase = 'strike';
      phaseT = Ease.outCubic((progress - 0.28) / 0.30);
    } else if (progress < 0.78) {
      phase = 'follow';
      phaseT = Ease.smooth((progress - 0.58) / 0.20);
    } else {
      phase = 'recovery';
      phaseT = Ease.outQuad((progress - 0.78) / 0.22);
    }

    // Configuração dos 3 golpes:
    // Golpe 0: Corte horizontal amplo
    // Golpe 1: Corte ascendente diagonal em revés
    // Golpe 2: Salto e golpe pesado a duas mãos (Bimanual Slam)
    let rightHandCyl, leftHandCyl, bodyTwist, bodyLean, isTwoHanded;

    if (index === 0) {
      isTwoHanded = false;
      bodyLean = 3.5 * Math.sin(progress * Math.PI);
      if (phase === 'windup') {
        bodyTwist = -0.45 * phaseT;
        rightHandCyl = [-1.4, 38, Anatomy.shoulderZ + 6]; // Puxa espada para trás no ombro direito
        leftHandCyl = [1.2, 26, IDLE_HAND_Z + 4];
      } else if (phase === 'strike') {
        bodyTwist = lerp(-0.45, 0.55, phaseT);
        rightHandCyl = [lerp(-1.4, 0.7, phaseT), lerp(38, 48, phaseT), lerp(Anatomy.shoulderZ + 6, Anatomy.chestZ - 4, phaseT)];
        leftHandCyl = [1.2, 24, IDLE_HAND_Z + 6];
      } else if (phase === 'follow') {
        bodyTwist = 0.55;
        rightHandCyl = [lerp(0.7, 1.2, phaseT), 42, lerp(Anatomy.chestZ - 4, Anatomy.waistZ, phaseT)];
        leftHandCyl = [1.1, 24, IDLE_HAND_Z + 4];
      } else {
        bodyTwist = lerp(0.55, 0, phaseT);
        rightHandCyl = [lerp(1.2, 0.4, phaseT), lerp(42, 28, phaseT), lerp(Anatomy.waistZ, IDLE_HAND_Z, phaseT)];
        leftHandCyl = [-0.4, 28, IDLE_HAND_Z];
      }
    } else if (index === 1) {
      isTwoHanded = false;
      bodyLean = 4.0 * Math.sin(progress * Math.PI);
      if (phase === 'windup') {
        bodyTwist = 0.50 * phaseT;
        rightHandCyl = [1.5, 36, Anatomy.hipZ - 4]; // Agacha a lâmina à esquerda embaixo
        leftHandCyl = [-0.8, 26, IDLE_HAND_Z + 8];
      } else if (phase === 'strike') {
        bodyTwist = lerp(0.50, -0.60, phaseT);
        rightHandCyl = [lerp(1.5, -0.6, phaseT), lerp(36, 46, phaseT), lerp(Anatomy.hipZ - 4, Anatomy.headCenterZ + 8, phaseT)];
        leftHandCyl = [-0.8, 24, IDLE_HAND_Z + 6];
      } else if (phase === 'follow') {
        bodyTwist = -0.60;
        rightHandCyl = [lerp(-0.6, -1.1, phaseT), 40, lerp(Anatomy.headCenterZ + 8, Anatomy.shoulderZ + 12, phaseT)];
        leftHandCyl = [-0.6, 24, IDLE_HAND_Z + 4];
      } else {
        bodyTwist = lerp(-0.60, 0, phaseT);
        rightHandCyl = [lerp(-1.1, 0.4, phaseT), lerp(40, 28, phaseT), lerp(Anatomy.shoulderZ + 12, IDLE_HAND_Z, phaseT)];
        leftHandCyl = [-0.4, 28, IDLE_HAND_Z];
      }
    } else {
      // Golpe 3: Bimanual Slam (pegada a duas mãos com salto)
      isTwoHanded = true;
      bodyTwist = 0;
      if (phase === 'windup') {
        bodyLean = -6.0 * phaseT;
        rightHandCyl = [0.0, 22, lerp(Anatomy.chestZ, Anatomy.headCenterZ + 24, phaseT)];
      } else if (phase === 'strike') {
        bodyLean = lerp(-6.0, 10.0, phaseT);
        rightHandCyl = [0.0, lerp(22, 44, phaseT), lerp(Anatomy.headCenterZ + 24, Anatomy.footZ + 8, phaseT)];
      } else if (phase === 'follow') {
        bodyLean = 10.0;
        rightHandCyl = [0.0, 42, Anatomy.footZ + 6];
      } else {
        bodyLean = lerp(10.0, 0, phaseT);
        rightHandCyl = [lerp(0.0, 0.4, phaseT), lerp(42, 28, phaseT), lerp(Anatomy.footZ + 6, IDLE_HAND_Z, phaseT)];
      }
      // A mão esquerda é travada no cabo ao lado da mão direita
      leftHandCyl = [rightHandCyl[0] - 0.15, rightHandCyl[1] - 3.5, rightHandCyl[2] + 4.0];
    }

    return {
      rightHandPos: cylindricalToLocal(rightHandCyl[0], rightHandCyl[1], rightHandCyl[2]),
      leftHandPos: cylindricalToLocal(leftHandCyl[0], leftHandCyl[1], leftHandCyl[2]),
      bodyTwist,
      bodyLean,
      isTwoHanded
    };
  }

  // ---------------------------------------------------------------------------
  // 5. Construtor do Rig Completo a Cada Quadro
  // ---------------------------------------------------------------------------
  function buildRig(config = {}) {
    const pos = config.pos || [0, 0, 0];
    const yaw = config.yaw || 0;
    const time = config.time || 0;
    const speed = clamp(config.speed || 0, 0, 1);
    const combat = config.combat || { index: -1, time: 0 };

    const toWorld = ([r, f, z]) => vAdd(pos, localToWorld([r, f, z], yaw));

    // Animação de caminhada / corrida (Locomoção)
    const runCycle = time * 7.5;
    const walkBob = speed > 0.05 ? -Math.abs(Math.sin(runCycle)) * 4.2 * speed : Math.sin(time * 2.2) * 1.2;
    const sway = Math.sin(time * 1.8) * 1.6 * (1 - speed);

    const hipZ = Anatomy.hipZ + walkBob;
    const neckZ = Anatomy.neckZ + walkBob;
    const headZ = Anatomy.headCenterZ + walkBob;

    // Passadas das pernas com oposição de 180°
    const strideR = Math.sin(runCycle) * 18 * speed;
    const strideL = Math.sin(runCycle + Math.PI) * 18 * speed;
    const liftR = Math.max(0, Math.sin(runCycle)) * 7 * speed;
    const liftL = Math.max(0, Math.sin(runCycle + Math.PI)) * 7 * speed;

    // Avalia ataque ativo
    const inAttack = combat.index >= 0;
    const attackProg = inAttack ? clamp(combat.time / STRIKE_TIME, 0, 1) : 0;
    const attackData = computeAttackPose(inAttack ? combat.index : -1, attackProg);

    const twist = attackData ? attackData.bodyTwist : Math.sin(runCycle) * 0.15 * speed;
    const lean = attackData ? attackData.bodyLean : speed * 3.5;

    // Posições dos ombros e quadris com torção do tronco
    const halfShoulder = Anatomy.shoulderWidth * 0.5;
    const halfHip = Anatomy.hipWidth * 0.5;

    const shoulderR_local = [
      halfShoulder * Math.cos(twist),
      halfShoulder * Math.sin(twist) + lean * 0.4,
      Anatomy.shoulderZ + walkBob
    ];
    const shoulderL_local = [
      -halfShoulder * Math.cos(twist),
      -halfShoulder * Math.sin(twist) + lean * 0.4,
      Anatomy.shoulderZ + walkBob
    ];
    const hipR_local = [halfHip, 0, hipZ];
    const hipL_local = [-halfHip, 0, hipZ];

    const shoulderR = toWorld(shoulderR_local);
    const shoulderL = toWorld(shoulderL_local);
    const hipR = toWorld(hipR_local);
    const hipL = toWorld(hipL_local);

    // Alvos das mãos
    let targetHandR_local, targetHandL_local;
    if (attackData) {
      targetHandR_local = attackData.rightHandPos;
      targetHandL_local = attackData.leftHandPos;
    } else {
      // Idle / Corrida normal
      const armSwing = Math.sin(runCycle) * 12 * speed;
      targetHandR_local = [halfShoulder + 6, 6 + armSwing, IDLE_HAND_Z + walkBob];
      targetHandL_local = [-halfShoulder - 6, 6 - armSwing, IDLE_HAND_Z + walkBob];
    }

    const handTargetR = toWorld(targetHandR_local);
    const handTargetL = toWorld(targetHandL_local);

    const footTargetR = toWorld([halfHip, strideR, Anatomy.footZ + liftR]);
    const footTargetL = toWorld([-halfHip, strideL, Anatomy.footZ + liftL]);

    // Vetores Polares anatômicos:
    // Cotovelos apontam para fora e para trás; Joelhos apontam estritamente para a frente
    const poleArmR = localToWorld([1.0, -0.85, 0], yaw);
    const poleArmL = localToWorld([-1.0, -0.85, 0], yaw);
    const poleLegR = localToWorld([0.15, 1.0, 0], yaw);
    const poleLegL = localToWorld([-0.15, 1.0, 0], yaw);

    // Resolve as 4 cadeias cinemáticas de IK
    const armR = solveIK(shoulderR, handTargetR, Anatomy.upperArm, Anatomy.forearm, poleArmR);
    const armL = solveIK(shoulderL, handTargetL, Anatomy.upperArm, Anatomy.forearm, poleArmL);
    const legR = solveIK(hipR, footTargetR, Anatomy.thigh, Anatomy.calf, poleLegR);
    const legL = solveIK(hipL, footTargetL, Anatomy.thigh, Anatomy.calf, poleLegL);

    // Direção da espada no espaço 3D (estendida ao longo da linha cotovelo -> mão)
    const forearmDir = vNorm(vSub(armR.end, armR.joint));
    const swordDir = forearmDir;

    return {
      pos,
      yaw,
      time,
      speed,
      combat,
      twist,
      lean,
      isTwoHanded: attackData ? attackData.isTwoHanded : false,
      head: toWorld([0, lean * 0.75, headZ]),
      neck: toWorld([0, lean * 0.55, neckZ]),
      chest: toWorld([0, lean * 0.4, Anatomy.chestZ + walkBob]),
      hips: toWorld([sway * 0.5, 0, hipZ]),
      shoulderR,
      shoulderL,
      hipR,
      hipL,
      handR: armR.end,
      handL: armL.end,
      elbowR: armR.joint,
      elbowL: armL.joint,
      footR: legR.end,
      footL: legL.end,
      kneeR: legR.joint,
      kneeL: legL.joint,
      swordDir,
      limbs: [
        { name: 'armR', ...armR, lengths: [Anatomy.upperArm, Anatomy.forearm], pole: poleArmR },
        { name: 'armL', ...armL, lengths: [Anatomy.upperArm, Anatomy.forearm], pole: poleArmL },
        { name: 'legR', ...legR, lengths: [Anatomy.thigh, Anatomy.calf], pole: poleLegR },
        { name: 'legL', ...legL, lengths: [Anatomy.thigh, Anatomy.calf], pole: poleLegL }
      ]
    };
  }

  const Rig = {
    solveIK,
    Anatomy,
    CombatEngine,
    buildRig,
    STRIKE_TIME,
    RECOVERY_TIME
  };

  globalThis.Agy = globalThis.Agy || {};
  globalThis.Agy.Rig = Rig;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Rig;
  }
})();
