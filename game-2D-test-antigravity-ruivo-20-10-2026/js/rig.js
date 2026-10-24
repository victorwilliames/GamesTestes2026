/**
 * rig.js - Esqueleto 3D e Poses Chibi do Cavaleiro de Cabelo Vermelho
 * Calibrado estritamente para a folha de modelo (prancha-turnaround-poses.png)
 * Proporção: ~3.0 a 3.2 cabeças de altura total
 */

if (typeof require !== 'undefined') {
  const core = require('./core.js');
  Vec3 = core.Vec3;
  MathUtils = core.MathUtils;
}

function solveTwoBoneIK(root, target, l1, l2, poleVec) {
  const dVec = target.sub(root);
  const dist = dVec.length();

  const maxReach = (l1 + l2) * 0.9999;
  const minReach = Math.abs(l1 - l2) * 1.0001;
  const clampedDist = Math.max(minReach, Math.min(maxReach, dist));

  const cosAlpha = (l1 * l1 + clampedDist * clampedDist - l2 * l2) / (2 * l1 * clampedDist);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

  const dir = dist > 0.0001 ? dVec.normalize() : new Vec3(0, 0, -1);

  let normal = dir.cross(poleVec);
  if (normal.lengthSq() < 0.0001) {
    normal = dir.cross(new Vec3(0, 0, 1));
    if (normal.lengthSq() < 0.0001) {
      normal = dir.cross(new Vec3(1, 0, 0));
    }
  }
  normal = normal.normalize();

  const bendDir = normal.cross(dir).normalize();
  const mid = root.add(dir.scale(l1 * Math.cos(alpha))).add(bendDir.scale(l1 * Math.sin(alpha)));
  const end = root.add(dir.scale(clampedDist));

  return { root, mid, end };
}

class KnightRig {
  constructor() {
    // Proporção Chibi Fiel (~3.0 cabeças)
    this.pelvisBaseZ = 24;
    this.neckZ = 44;
    this.headZ = 56;

    this.armL1 = 10;
    this.armL2 = 10;
    this.legL1 = 12;
    this.legL2 = 12;

    this.animTime = 0;
    this.currentAnim = 'idle';
    this.animSpeed = 1.0;
    this.facingAngle = 0; // 0 = Sul (Frente-Câmera)

    this.joints = {};
  }

  setFacing(angle) {
    this.facingAngle = angle;
  }

  setAnimation(animName) {
    if (this.currentAnim !== animName) {
      this.currentAnim = animName;
      this.animTime = 0;
    }
  }

  update(dt) {
    this.animTime += dt * this.animSpeed;
  }

  evaluate(worldPos = new Vec3(0, 0, 0)) {
    const t = this.animTime;
    const cosA = Math.cos(this.facingAngle);
    const sinA = Math.sin(this.facingAngle);

    const toWorld = (localX, localY, localZ) => {
      const rx = localX * cosA - localY * sinA;
      const ry = localX * sinA + localY * cosA;
      return new Vec3(worldPos.x + rx, worldPos.y + ry, worldPos.z + localZ);
    };

    let pelvisOffsetZ = 0;
    let pelvisOffsetY = 0;
    let pelvisOffsetX = 0;

    let footTargetL, footTargetR;
    let handTargetL, handTargetR;
    let poleArmL, poleArmR;
    let poleLegL, poleLegR;
    let swordTip;

    // ==========================================
    // 1. POSE: IDLE (0° Frente-Cam da Prancha)
    // ==========================================
    if (this.currentAnim === 'idle') {
      const breath = Math.sin(t * 3.5);
      pelvisOffsetZ = breath * 0.6;

      footTargetL = new Vec3(-7, 3, 0);
      footTargetR = new Vec3(7, -3, 0);

      // Braço esquerdo erguido em punho; braço direito com espada inclinada para baixo-frente
      handTargetL = new Vec3(-8, 8, 34 + breath * 0.4);
      handTargetR = new Vec3(8, 5, 26 + breath * 0.4);

      poleArmR = new Vec3(1, -0.3, 0);
      poleArmL = new Vec3(-1, 0.4, 0);
      poleLegR = new Vec3(0.2, 1, 0);
      poleLegL = new Vec3(-0.2, 1, 0);

      swordTip = new Vec3(12, 20, 4);
    }

    // ==========================================
    // 2. POSE: CORRIDA (Pose 'Corrida' da Prancha)
    // ==========================================
    else if (this.currentAnim === 'run') {
      const cycle = t * 11;
      const bob = Math.abs(Math.sin(cycle));
      pelvisOffsetZ = bob * 2.5;
      pelvisOffsetY = 3.5;

      const f1 = Math.sin(cycle);
      const f2 = Math.sin(cycle + Math.PI);

      footTargetL = new Vec3(-7, f1 * 12, Math.max(0, -f1 * 8));
      footTargetR = new Vec3(7, f2 * 12, Math.max(0, -f2 * 8));

      handTargetL = new Vec3(-8, -f1 * 8 + 4, 32);
      handTargetR = new Vec3(9, f2 * 6 - 4, 24);

      poleArmR = new Vec3(1, -0.4, 0);
      poleArmL = new Vec3(-1, 0.4, 0);
      poleLegR = new Vec3(0, 1, 0);
      poleLegL = new Vec3(0, 1, 0);

      swordTip = new Vec3(14, -22, 28);
    }

    // ==========================================
    // 3. POSE: COMBO 1 (Corte: Antecipação -> Golpe)
    // ==========================================
    else if (this.currentAnim === 'combo1') {
      const p = Math.min(1, t / 0.38);

      if (p < 0.4) {
        const u = p / 0.4;
        pelvisOffsetX = -2 * u;
        handTargetR = new Vec3(10, -3, 38 + u * 6);
        handTargetL = new Vec3(6, -2, 36 + u * 6);
        swordTip = new Vec3(18, -12, 64); // Erguida acima do ombro direito

        footTargetL = new Vec3(-8, 4, 0);
        footTargetR = new Vec3(7, -4, 0);
      } else {
        const u = (p - 0.4) / 0.6;
        const ease = MathUtils.easeOutBack(u);

        const ang = MathUtils.lerp(-0.4, 2.0, ease);
        handTargetR = new Vec3(Math.cos(ang) * 14, Math.sin(ang) * 14 + 6, 24);
        handTargetL = new Vec3(-7, 2, 28);
        swordTip = new Vec3(Math.cos(ang) * 36, Math.sin(ang) * 36 + 10, 12);

        footTargetL = new Vec3(-9, 6, 0);
        footTargetR = new Vec3(8, -4, 0);
      }

      poleArmR = new Vec3(1, -0.2, 0);
      poleArmL = new Vec3(-1, 0.2, 0);
      poleLegR = new Vec3(0, 1, 0);
      poleLegL = new Vec3(0, 1, 0);
    }

    // ==========================================
    // 4. POSE: COMBO 2 (Revés: Antecipação -> Golpe)
    // ==========================================
    else if (this.currentAnim === 'combo2') {
      const p = Math.min(1, t / 0.40);

      if (p < 0.35) {
        const u = p / 0.35;
        handTargetR = new Vec3(9, -10 * u, 20);
        handTargetL = new Vec3(-8, 9 * u, 32);
        swordTip = new Vec3(20, -26 * u, 14);

        footTargetL = new Vec3(-8, -2, 0);
        footTargetR = new Vec3(8, 5, 0);
      } else {
        const u = (p - 0.35) / 0.65;
        const ease = MathUtils.easeOutCubic(u);

        handTargetR = new Vec3(MathUtils.lerp(9, 2, ease), 16, MathUtils.lerp(20, 32, ease));
        handTargetL = new Vec3(-9, -2, 28);
        swordTip = new Vec3(2, 42, MathUtils.lerp(14, 40, ease));

        footTargetL = new Vec3(-9, -4, 0);
        footTargetR = new Vec3(7, 8, 0);
      }

      poleArmR = new Vec3(1, -0.4, 0);
      poleArmL = new Vec3(-1, 0.4, 0);
      poleLegR = new Vec3(0, 1, 0);
      poleLegL = new Vec3(0, 1, 0);
    }

    // ==========================================
    // 5. POSE: COMBO 3 (Salto: Antecipação -> Salto: Impacto)
    // ==========================================
    else if (this.currentAnim === 'combo3') {
      const p = Math.min(1, t / 0.55);

      if (p < 0.45) {
        const u = p / 0.45;
        const jumpZ = Math.sin(u * Math.PI) * 18;
        pelvisOffsetZ = jumpZ;

        handTargetR = new Vec3(4, 2, 46 + jumpZ * 0.5);
        handTargetL = new Vec3(-4, 2, 46 + jumpZ * 0.5);
        swordTip = new Vec3(0, 3, 76 + jumpZ); // Erguida no ápice do salto

        footTargetL = new Vec3(-6, -2, jumpZ * 0.6);
        footTargetR = new Vec3(6, -2, jumpZ * 0.6);
      } else {
        const u = (p - 0.45) / 0.55;
        pelvisOffsetZ = MathUtils.lerp(-4, 0, u);
        handTargetR = new Vec3(4, 13, 12);
        handTargetL = new Vec3(-4, 13, 12);
        swordTip = new Vec3(0, 16, 0); // Cravada no chão!

        footTargetL = new Vec3(-12, 3, 0);
        footTargetR = new Vec3(12, 3, 0);
      }

      poleArmR = new Vec3(0.5, 0.4, 0);
      poleArmL = new Vec3(-0.5, 0.4, 0);
      poleLegR = new Vec3(0.5, 1, 0);
      poleLegL = new Vec3(-0.5, 1, 0);
    }

    // ==========================================
    // TRANSFORMAÇÃO LOCAL -> MUNDO
    // ==========================================
    const pelvisWorld = toWorld(pelvisOffsetX, pelvisOffsetY, this.pelvisBaseZ + pelvisOffsetZ);
    const chestWorld = toWorld(pelvisOffsetX, pelvisOffsetY, this.neckZ + pelvisOffsetZ);
    const headWorld = toWorld(pelvisOffsetX, pelvisOffsetY, this.headZ + pelvisOffsetZ);

    const shoulderLWorld = toWorld(-8, 0, this.neckZ + pelvisOffsetZ);
    const shoulderRWorld = toWorld(8, 0, this.neckZ + pelvisOffsetZ);
    const hipLWorld = toWorld(-6, 0, this.pelvisBaseZ + pelvisOffsetZ);
    const hipRWorld = toWorld(6, 0, this.pelvisBaseZ + pelvisOffsetZ);

    const handLWorld = toWorld(handTargetL.x, handTargetL.y, handTargetL.z + pelvisOffsetZ);
    const handRWorld = toWorld(handTargetR.x, handTargetR.y, handTargetR.z + pelvisOffsetZ);
    const footLWorld = toWorld(footTargetL.x, footTargetL.y, footTargetL.z);
    const footRWorld = toWorld(footTargetR.x, footTargetR.y, footTargetR.z);

    const poleArmLWorld = new Vec3(poleArmL.x * cosA - poleArmL.y * sinA, poleArmL.x * sinA + poleArmL.y * cosA, poleArmL.z);
    const poleArmRWorld = new Vec3(poleArmR.x * cosA - poleArmR.y * sinA, poleArmR.x * sinA + poleArmR.y * cosA, poleArmR.z);
    const poleLegLWorld = new Vec3(poleLegL.x * cosA - poleLegL.y * sinA, poleLegL.x * sinA + poleLegL.y * cosA, poleLegL.z);
    const poleLegRWorld = new Vec3(poleLegR.x * cosA - poleLegR.y * sinA, poleLegR.x * sinA + poleLegR.y * cosA, poleLegR.z);

    const armL = solveTwoBoneIK(shoulderLWorld, handLWorld, this.armL1, this.armL2, poleArmLWorld);
    const armR = solveTwoBoneIK(shoulderRWorld, handRWorld, this.armL1, this.armL2, poleArmRWorld);
    const legL = solveTwoBoneIK(hipLWorld, footLWorld, this.legL1, this.legL2, poleLegLWorld);
    const legR = solveTwoBoneIK(hipRWorld, footRWorld, this.legL1, this.legL2, poleLegRWorld);

    const swordTipWorld = toWorld(swordTip.x, swordTip.y, swordTip.z + pelvisOffsetZ);

    this.joints = {
      root: worldPos,
      pelvis: pelvisWorld,
      chest: chestWorld,
      head: headWorld,
      shoulderL: armL.root,
      elbowL: armL.mid,
      handL: armL.end,
      shoulderR: armR.root,
      elbowR: armR.mid,
      handR: armR.end,
      hipL: legL.root,
      kneeL: legL.mid,
      footL: legL.end,
      hipR: legR.root,
      kneeR: legR.mid,
      footR: legR.end,
      swordHilt: armR.end,
      swordTip: swordTipWorld,
      facingAngle: this.facingAngle
    };

    return this.joints;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { solveTwoBoneIK, KnightRig };
}
