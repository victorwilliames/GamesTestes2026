// ============================================================================
// RigAdapter.js — Esqueleto Matemático RIG-01, Solver Analítico de IK 2-Ossos,
// Foot-Lock e Máquina de Poses/Combos Procedurais (Etapa 2 & Etapa 3).
// Converte estados de pose (Idle, Walk, Run, Dash, Combo 1..4, Skills Q/E/R)
// e orientações (S, SE, SW, E, W, N, NE, NW) em coordenadas articulares 2D/2.5D
// sem substituir o renderer e sem espelhamento mecânico!
// ============================================================================

export class RigAdapter {
  /**
   * Solver analítico de Cinemática Inversa (2-Bone IK) via Lei dos Cossenos.
   * Calcula a posição exata da articulação intermediária (cotovelo ou joelho)
   * preservando os comprimentos ósseos L1 e L2.
   */
  static solveTwoBoneIK(root, target, L1, L2, bendDir = 1) {
    const dx = target.x - root.x;
    const dy = target.y - root.y;
    const rawDist = Math.hypot(dx, dy) || 0.001;
    const maxReach = (L1 + L2) * 0.995;
    const minReach = Math.abs(L1 - L2) + 2;
    const d = Math.max(minReach, Math.min(maxReach, rawDist));

    const baseAngle = Math.atan2(dy, dx);
    const cosAngle = Math.max(-1, Math.min(1, (d * d + L1 * L1 - L2 * L2) / (2 * d * L1)));
    const offsetAngle = Math.acos(cosAngle) * (bendDir >= 0 ? 1 : -1);
    const jointAngle = baseAngle + offsetAngle;

    return {
      x: root.x + Math.cos(jointAngle) * L1,
      y: root.y + Math.sin(jointAngle) * L1
    };
  }

  /**
   * Catálogo oficial dos golpes do Combo de 4 estágios + 3 Skills do Caos,
   * seguindo a arquitetura de 4 fases (windup -> strike -> follow -> recover) de Rafa+Claude.
   */
  static getAttackCatalog() {
    return {
      combo1: {
        id: 'combo1',
        name: '1. Corte Infernal (Esq)',
        duration: 0.34,
        hitWindow: [0.22, 0.62],
        cancelAt: 0.56,
        lunge: 95,
        damage: 28,
        knockback: 150,
        range: 128,
        arcRad: 1.85,
        activeSide: 'L'
      },
      combo2: {
        id: 'combo2',
        name: '2. Revés Sangrento (Dir)',
        duration: 0.34,
        hitWindow: [0.20, 0.62],
        cancelAt: 0.56,
        lunge: 110,
        damage: 34,
        knockback: 175,
        range: 134,
        arcRad: 1.95,
        activeSide: 'R'
      },
      combo3: {
        id: 'combo3',
        name: '3. Tesoura Dupla do Caos',
        duration: 0.40,
        hitWindow: [0.24, 0.68],
        cancelAt: 0.62,
        lunge: 145,
        damage: 46,
        knockback: 220,
        range: 148,
        arcRad: 2.20,
        activeSide: 'BOTH'
      },
      combo4: {
        id: 'combo4',
        name: '4. Turbilhão das Correntes (Finisher)',
        duration: 0.52,
        hitWindow: [0.18, 0.78],
        cancelAt: 0.82,
        lunge: 170,
        damage: 68,
        knockback: 310,
        range: 195,
        arcRad: Math.PI * 2,
        activeSide: 'BOTH',
        isChainExtended: true
      },
      skillQ: {
        id: 'skillQ',
        name: 'Q — Arremesso de Corrente Infernal',
        duration: 0.44,
        hitWindow: [0.20, 0.72],
        cancelAt: 0.75,
        lunge: 60,
        damage: 54,
        knockback: 260,
        range: 245,
        arcRad: 1.15,
        activeSide: 'L',
        isChainExtended: true
      },
      skillE: {
        id: 'skillE',
        name: 'E — Fúria Rubra Cruzada',
        duration: 0.42,
        hitWindow: [0.22, 0.70],
        cancelAt: 0.72,
        lunge: 130,
        damage: 62,
        knockback: 280,
        range: 165,
        arcRad: 2.40,
        activeSide: 'BOTH'
      },
      skillR: {
        id: 'skillR',
        name: 'R — Cataclismo das Lâminas do Caos',
        duration: 0.58,
        hitWindow: [0.30, 0.82],
        cancelAt: 0.85,
        lunge: 160,
        damage: 95,
        knockback: 380,
        range: 225,
        arcRad: Math.PI * 2,
        activeSide: 'BOTH',
        isChainExtended: true
      }
    };
  }

  /**
   * Gera uma estrutura HeroPose completa controlada pelos ângulos/IK do RIG-01.
   *
   * @param {Object} state - {
   *   action: 'idle'|'walk'|'run'|'dash'|'attack'|'combo1'|'combo2'|'combo3'|'combo4'|'skillQ'|'skillE'|'skillR',
   *   orientation: 'S'|'SE'|'SW'|'E'|'W'|'N'|'NE'|'NW',
   *   yawOverride: number | undefined,
   *   time: number,
   *   attackProgress: number | undefined (0..1)
   * }
   */
  static computePose(state = {}) {
    const {
      action = 'idle',
      orientation = 'S',
      yawOverride,
      time = 0,
      attackProgress
    } = state;

    // 1. Parâmetro de orientação 2.5D (yaw) SEM ESPELHAMENTO MECÂNICO
    let yaw = 0;
    let refImage = './assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png';
    if (orientation === 'SE' || orientation === 'E' || orientation === 'NE') {
      yaw = orientation === 'E' ? -0.95 : -0.85;
      refImage = './assets/references/ref-2d-hero/hero-complet-idle/hero-idle-se.png';
    } else if (orientation === 'SW' || orientation === 'W' || orientation === 'NW') {
      yaw = orientation === 'W' ? 0.92 : 0.78;
      refImage = './assets/references/ref-2d-hero/hero-complet-idle/hero-idle-sw.png';
    }
    if (typeof yawOverride === 'number') {
      yaw = Math.max(-0.98, Math.min(0.98, yawOverride));
    }

    const cx = 627 + yaw * 14;
    const groundY = 1226;
    const facingDir = yaw < -0.25 ? 1 : (yaw > 0.25 ? -1 : 0);

    // 2. Pose base (Idle Respirando / Posição de Guarda)
    let pelvisX = cx - yaw * 18;
    let pelvisY = 835;
    let chestX = cx - yaw * 12;
    let chestY = 748;
    let neckX = cx - yaw * 8;
    let neckY = 682;
    let headX = cx + yaw * 8;
    let headY = 656;
    let headRot = 0;
    let capeFlutter = 0;
    let legSpread = 0;

    // Braços e Pernas base
    let shoulderL = { x: chestX - 142 + yaw * 16, y: 702 };
    let elbowL    = { x: chestX - 212 + yaw * 18, y: 765 };
    let wristL    = { x: chestX - 259 + yaw * 20, y: 828 };
    let handGripL = { x: chestX - 285 + yaw * 20, y: 866 };

    let shoulderR = { x: chestX + 142 + yaw * 16, y: 702 };
    let elbowR    = { x: chestX + 212 + yaw * 18, y: 765 };
    let wristR    = { x: chestX + 259 + yaw * 20, y: 828 };
    let handGripR = { x: chestX + 285 + yaw * 20, y: 866 };

    let hipL      = { x: pelvisX - 100, y: 890 };
    let kneeL     = { x: pelvisX - 130, y: 1035 };
    let ankleL    = { x: pelvisX - 157, y: 1145 };
    let footSoleL = { x: pelvisX - 173, y: groundY };
    let footPitchL = 0;

    let hipR      = { x: pelvisX + 104, y: 890 };
    let kneeR     = { x: pelvisX + 134, y: 1035 };
    let ankleR    = { x: pelvisX + 161, y: 1145 };
    let footSoleR = { x: pelvisX + 177, y: groundY };
    let footPitchR = 0;

    let weaponLPos = null;
    let weaponRPos = null;
    let weaponLRot = -0.48;
    let weaponRRot = 0.48;
    let chainSwayL = 0.12;
    let chainSwayR = 0.12;

    let contactL = 'PLANTED';
    let contactR = 'PLANTED';

    if (action === 'idle') {
      // Respiração orgânica + oscilação das correntes e capa
      const breath = Math.sin(time * Math.PI * 2);
      const secondary = Math.cos(time * Math.PI * 2);
      chestY += breath * 4.5;
      neckY  += breath * 5.5;
      headY  += breath * 6.5;
      shoulderL.y += breath * 5.5;
      shoulderR.y += breath * 5.5;
      wristL.y += breath * 3.5;
      wristR.y += breath * 3.5;
      handGripL.y += breath * 3.5;
      handGripR.y += breath * 3.5;
      weaponLRot = -0.48 + secondary * 0.03;
      weaponRRot = 0.48 - secondary * 0.03;
      capeFlutter = Math.sin(time * Math.PI * 2 - 0.6) * 0.25;
      chainSwayL = 0.12 + secondary * 0.08;
      chainSwayR = 0.12 - secondary * 0.08;

    } else if (action === 'run' || action === 'walk') {
      const isWalk = action === 'walk';
      const amp = isWalk ? 0.65 : 1.0;
      const phase = time === 0 ? 0.22 : (time % 1.0);

      // Sentido direcional de movimento no plano lateral 2.5D (yaw < 0: East/Right, yaw > 0: West/Left)
      const facingDir = yaw < -0.25 ? 1 : (yaw > 0.25 ? -1 : 0);
      const isLateral = facingDir !== 0;

      // Amortecimento vertical da pelve (lowest Y na fase de apoio duplo / mid-stance shock absorption)
      // Ciclo duplo por passada completa (2 passos por ciclo)
      const bounce = Math.abs(Math.cos(phase * Math.PI * 2));
      pelvisY = 826 + bounce * (isWalk ? 10 : 18);

      // Inclinação dinâmica do tronco (Forward Lean) na direção do movimento
      const forwardLean = isLateral ? facingDir * (isWalk ? 16 : 28) : 0;
      chestX  = pelvisX + forwardLean + yaw * 14;
      chestY  = pelvisY - 86;
      neckX   = chestX + forwardLean * 0.45 + yaw * 8;
      neckY   = chestY - 64;
      headX   = neckX + yaw * 12;
      headY   = neckY - 26;
      headRot = (isLateral ? facingDir * 0.05 : 0) - yaw * 0.04;
      capeFlutter = (0.95 + bounce * 0.45) * amp;
      legSpread = 0.55 * amp;

      // Escorço de perspectiva nos quadris (em perfil lateral yaw ~ 1.0, a distância horizontal estreita)
      const hipNarrowing = Math.max(0.22, Math.abs(Math.cos(yaw * Math.PI * 0.5)));
      hipL = { x: pelvisX - (98 * hipNarrowing) + yaw * 26, y: pelvisY + 50 };
      hipR = { x: pelvisX + (98 * hipNarrowing) + yaw * 26, y: pelvisY + 50 };

      // Solver de marcha biomecânica em 4 fases para cada perna
      const computeGaitFoot = (p, isLeft) => {
        const strideTravel = isWalk ? 78 : 124;
        const liftHeight = isWalk ? 46 : 78;
        let strideT = 0;   // +1.0 = extensão frontal máxima, -1.0 = extensão traseira máxima
        let soleY = groundY;
        let pitch = 0;
        let contact = 'PLANTED';

        if (p < 0.60) {
          // --- FASE DE CONTATO / APOIO (60% do ciclo, pé colado no solo sustentando peso) ---
          if (p < 0.12) {
            // 1. Heel Strike (Impacto Inicial do Calcanhar)
            const k = p / 0.12;
            strideT = 1.0 - k * 0.20;
            soleY = groundY;
            pitch = 0.24 * (1.0 - k * 0.65);
            contact = 'STRIKE';
          } else if (p < 0.48) {
            // 2. Foot-Flat / Mid-Stance (Apoio Total cravado no chão — ZERO deslizamento)
            const k = (p - 0.12) / 0.36;
            strideT = 0.80 - k * 1.55;
            soleY = groundY;
            pitch = 0.0;
            contact = 'PLANTED';
          } else {
            // 3. Heel-Off & Toe-Off (Empurrão Propulsivo da Ponta do Pé)
            const k = (p - 0.48) / 0.12;
            strideT = -0.75 - k * 0.25;
            soleY = groundY - k * 12;
            pitch = -0.32 * k;
            contact = 'PUSH';
          }
        } else {
          // --- FASE DE BALANÇO / SWING (40% do ciclo, perna avança pelo ar) ---
          const k = (p - 0.60) / 0.40;
          contact = 'SWING';
          // Transição suave S-curve de trás (-1.0) para frente (+1.0)
          strideT = -1.0 + (3 * k * k - 2 * k * k * k) * 2.0;
          // Arco parabólico de elevação do pé acima do solo
          const lift = Math.sin(k * Math.PI) * liftHeight;
          soleY = groundY - lift;
          // Pitch faz transição de propulsão negativa (-0.32) para ataque de calcanhar (+0.24)
          pitch = -0.32 * (1.0 - k) + 0.24 * k;
        }

        let soleX = 0;
        let ankleX = 0;
        let ankleY = 0;

        if (isLateral) {
          // Caminhada / Corrida Lateral ou em 3/4 (Sagittal Scissoring ao longo de X!)
          const hipRef = isLeft ? hipL.x : hipR.x;
          soleX = hipRef + facingDir * strideT * strideTravel;
          ankleX = soleX - facingDir * Math.sin(pitch) * 18;
          ankleY = Math.min(groundY - 75, soleY - 82 + (Math.cos(pitch) - 1) * 18);
        } else {
          // Caminhada / Corrida Frontal (Sul / Norte — Movimento em profundidade Y)
          const baseOffset = isLeft ? -42 : 42;
          soleX = (isLeft ? hipL.x : hipR.x) + baseOffset;
          soleY += strideT * 18;
          ankleX = soleX;
          ankleY = Math.min(groundY - 75, soleY - 82);
        }

        // Joelho IK: Quando caminha de lado, AMBOS os joelhos dobram para a FRENTE do movimento!
        const bendDir = isLateral ? facingDir : (isLeft ? -1 : 1);
        const hipPt = isLeft ? hipL : hipR;
        const kneePt = RigAdapter.solveTwoBoneIK(hipPt, { x: ankleX, y: ankleY }, 148, 118, bendDir);

        return {
          strideT,
          footSole: { x: soleX, y: soleY },
          ankle: { x: ankleX, y: ankleY },
          knee: kneePt,
          pitch,
          contact
        };
      };

      const gL = computeGaitFoot(phase, true);
      const gR = computeGaitFoot((phase + 0.5) % 1.0, false);

      footSoleL = gL.footSole;
      ankleL = gL.ankle;
      kneeL = gL.knee;
      footPitchL = gL.pitch;
      contactL = gL.contact;

      footSoleR = gR.footSole;
      ankleR = gR.ankle;
      kneeR = gR.knee;
      footPitchR = gR.pitch;
      contactR = gR.contact;

      // Balanço Contralateral dos Braços (Braço oposto avança junto com a perna)
      const armSwingL = -gL.strideT;
      const armSwingR = -gR.strideT;

      shoulderL = { x: chestX - 140 + (isLateral ? -yaw * 18 : 0), y: chestY - 44 };
      const wristLX = shoulderL.x - 140 + (isLateral ? facingDir * armSwingL * 38 : 0);
      const wristLY = shoulderL.y + 115 + armSwingL * (isWalk ? 44 : 68);
      wristL = { x: wristLX, y: wristLY };
      elbowL = RigAdapter.solveTwoBoneIK(shoulderL, wristL, 96, 86, isLateral ? facingDir : -1);
      handGripL = { x: wristL.x + (isLateral ? facingDir * 16 : -14), y: wristL.y + 36 };
      weaponLRot = (isLateral ? facingDir * 0.45 : -0.58) + armSwingL * 0.32;
      chainSwayL = 0.85 * amp * armSwingL;

      shoulderR = { x: chestX + 140 + (isLateral ? yaw * 18 : 0), y: chestY - 44 };
      const wristRX = shoulderR.x + 140 + (isLateral ? facingDir * armSwingR * 38 : 0);
      const wristRY = shoulderR.y + 115 + armSwingR * (isWalk ? 44 : 68);
      wristR = { x: wristRX, y: wristRY };
      elbowR = RigAdapter.solveTwoBoneIK(shoulderR, wristR, 96, 86, isLateral ? facingDir : 1);
      handGripR = { x: wristR.x + (isLateral ? facingDir * 16 : 18), y: wristR.y + 36 };
      weaponRRot = (isLateral ? facingDir * 0.45 : 0.62) + armSwingR * 0.32;
      chainSwayR = -0.85 * amp * armSwingR;

    } else if (action === 'dash') {
      // Esquiva rápida (Stealth Assassin Dash) — corpo inclinado, lâminas recolhidas em guarda reversa
      pelvisX = cx + yaw * 32;
      pelvisY = 852;
      chestX  = pelvisX + yaw * 38;
      chestY  = pelvisY - 82;
      neckX   = chestX + yaw * 18;
      neckY   = chestY - 60;
      headX   = neckX + yaw * 16;
      headY   = neckY - 22;
      headRot = -yaw * 0.14;
      capeFlutter = 1.65;
      legSpread = 0.92;

      hipL      = { x: pelvisX - 115, y: pelvisY + 46 };
      ankleL    = { x: pelvisX - 210, y: 1110 };
      kneeL     = RigAdapter.solveTwoBoneIK(hipL, ankleL, 148, 118, -1);
      footSoleL = { x: pelvisX - 228, y: groundY - 35 };
      footPitchL = 0.32;

      hipR      = { x: pelvisX + 115, y: pelvisY + 46 };
      ankleR    = { x: pelvisX + 195, y: 1138 };
      kneeR     = RigAdapter.solveTwoBoneIK(hipR, ankleR, 148, 118, 1);
      footSoleR = { x: pelvisX + 215, y: groundY - 12 };
      footPitchR = -0.25;

      shoulderL = { x: chestX - 144, y: chestY - 40 };
      wristL    = { x: shoulderL.x - 165, y: shoulderL.y + 30 };
      elbowL    = RigAdapter.solveTwoBoneIK(shoulderL, wristL, 96, 86, -1);
      handGripL = { x: wristL.x - 36, y: wristL.y + 18 };
      weaponLRot = -1.15;
      chainSwayL = 1.45;

      shoulderR = { x: chestX + 144, y: chestY - 40 };
      wristR    = { x: shoulderR.x + 165, y: shoulderR.y + 30 };
      elbowR    = RigAdapter.solveTwoBoneIK(shoulderR, wristR, 96, 86, 1);
      handGripR = { x: wristR.x + 36, y: wristR.y + 18 };
      weaponRRot = 1.15;
      chainSwayR = -1.45;

    } else if (action === 'attack' || action === 'combo1') {
      // Golpe 1 / Pose de Ataque Canônica do RIG-01 (Corte Amplo Esquerdo)
      const p = typeof attackProgress === 'number'
        ? Math.sin(Math.min(1, attackProgress * 1.35) * Math.PI * 0.5)
        : (time === 0 ? 1.0 : (0.65 + 0.35 * Math.sin(time * Math.PI * 2)));

      pelvisX = cx - 18 * p;
      pelvisY = 835 + 23 * p;
      chestX  = pelvisX + 26 * p;
      chestY  = pelvisY - 88;
      neckX   = chestX + 16 * p;
      neckY   = chestY - 64;
      headX   = neckX + 12 * p;
      headY   = neckY - 26;
      headRot = -0.09 * p;
      capeFlutter = 1.25 * p;
      legSpread = 0.85 * p;

      hipL      = { x: pelvisX - 112, y: pelvisY + 50 };
      kneeL     = { x: pelvisX - 168, y: 1042 };
      ankleL    = { x: pelvisX - 202, y: 1148 };
      footSoleL = { x: pelvisX - 218, y: groundY };
      footPitchL = 0.08 * p;

      hipR      = { x: pelvisX + 118, y: pelvisY + 50 };
      kneeR     = { x: pelvisX + 178, y: 1042 };
      ankleR    = { x: pelvisX + 215, y: 1148 };
      footSoleR = { x: pelvisX + 232, y: groundY };
      footPitchR = -0.10 * p;

      shoulderL = { x: chestX - 148, y: chestY - 52 };
      elbowL    = { x: shoulderL.x - 135, y: shoulderL.y - 38 * p };
      wristL    = { x: elbowL.x - 118, y: elbowL.y - 45 * p };
      handGripL = { x: wristL.x - 54, y: wristL.y - 18 * p };
      weaponLRot = 0.48 * p;
      chainSwayL = 1.15 * p;

      shoulderR = { x: chestX + 142, y: chestY - 38 };
      elbowR    = { x: shoulderR.x + 118, y: shoulderR.y + 42 };
      wristR    = { x: elbowR.x + 95, y: elbowR.y + 28 };
      handGripR = { x: wristR.x + 52, y: wristR.y + 12 };
      weaponRRot = -0.38 * p;
      chainSwayR = -0.95 * p;

    } else if (action === 'combo2') {
      // Golpe 2: Revés Sangrento Direito (torção oposta do tronco + arco violento da lâmina direita)
      const p = typeof attackProgress === 'number'
        ? Math.sin(Math.min(1, attackProgress * 1.35) * Math.PI * 0.5)
        : 1.0;

      pelvisX = cx + 20 * p;
      pelvisY = 858;
      chestX  = pelvisX - 30 * p;
      chestY  = pelvisY - 88;
      neckX   = chestX - 16 * p;
      neckY   = chestY - 64;
      headX   = neckX - 12 * p;
      headY   = neckY - 26;
      headRot = 0.10 * p;
      capeFlutter = -1.15 * p;
      legSpread = 0.88 * p;

      hipL      = { x: pelvisX - 118, y: pelvisY + 50 };
      kneeL     = { x: pelvisX - 178, y: 1042 };
      ankleL    = { x: pelvisX - 215, y: 1148 };
      footSoleL = { x: pelvisX - 232, y: groundY };
      footPitchL = 0.10;

      hipR      = { x: pelvisX + 112, y: pelvisY + 50 };
      kneeR     = { x: pelvisX + 168, y: 1042 };
      ankleR    = { x: pelvisX + 202, y: 1148 };
      footSoleR = { x: pelvisX + 218, y: groundY };
      footPitchR = -0.08;

      // Braço esquerdo recolhido em contrapeso
      shoulderL = { x: chestX - 142, y: chestY - 38 };
      elbowL    = { x: shoulderL.x - 115, y: shoulderL.y + 46 };
      wristL    = { x: elbowL.x - 92, y: elbowL.y + 32 };
      handGripL = { x: wristL.x - 48, y: wristL.y + 14 };
      weaponLRot = 0.35 * p;
      chainSwayL = 0.95;

      // Braço direito rasgando em arco elevado lateral
      shoulderR = { x: chestX + 148, y: chestY - 52 };
      elbowR    = { x: shoulderR.x + 138, y: shoulderR.y - 42 * p };
      wristR    = { x: elbowR.x + 122, y: elbowR.y - 48 * p };
      handGripR = { x: wristR.x + 56, y: wristR.y - 20 * p };
      weaponRRot = -0.58 * p;
      chainSwayR = -1.25;

    } else if (action === 'combo3' || action === 'skillE') {
      // Golpe 3 / Skill E: Tesoura Dupla do Caos (ambas as lâminas cruzam à frente em X flamejante)
      const p = typeof attackProgress === 'number'
        ? Math.sin(Math.min(1, attackProgress * 1.4) * Math.PI * 0.5)
        : 1.0;

      pelvisX = cx;
      pelvisY = 864;
      chestX  = cx;
      chestY  = pelvisY - 90;
      neckX   = cx;
      neckY   = chestY - 62;
      headX   = cx;
      headY   = neckY - 24;
      headRot = 0;
      capeFlutter = 1.45 * p;
      legSpread = 0.96 * p;

      hipL      = { x: pelvisX - 122, y: pelvisY + 48 };
      kneeL     = { x: pelvisX - 186, y: 1044 };
      ankleL    = { x: pelvisX - 224, y: 1148 };
      footSoleL = { x: pelvisX - 242, y: groundY };
      footPitchL = 0.12;

      hipR      = { x: pelvisX + 122, y: pelvisY + 48 };
      kneeR     = { x: pelvisX + 186, y: 1044 };
      ankleR    = { x: pelvisX + 224, y: 1148 };
      footSoleR = { x: pelvisX + 242, y: groundY };
      footPitchR = -0.12;

      shoulderL = { x: chestX - 150, y: chestY - 48 };
      elbowL    = { x: shoulderL.x - 110, y: shoulderL.y + 18 };
      wristL    = { x: elbowL.x - 75, y: elbowL.y + 58 * p };
      handGripL = { x: wristL.x - 32, y: wristL.y + 42 * p };
      weaponLRot = -0.95 * p;
      chainSwayL = 1.35;

      shoulderR = { x: chestX + 150, y: chestY - 48 };
      elbowR    = { x: shoulderR.x + 110, y: shoulderR.y + 18 };
      wristR    = { x: elbowR.x + 75, y: elbowR.y + 58 * p };
      handGripR = { x: wristR.x + 32, y: wristR.y + 42 * p };
      weaponRRot = 0.95 * p;
      chainSwayR = -1.35;

    } else if (action === 'combo4' || action === 'skillQ' || action === 'skillR') {
      // Golpe 4 (Turbilhão das Correntes) / Skill Q (Chain Hook) / Skill R (Cataclismo):
      // As Lâminas do Caos são arremessadas à distância presas pelas Correntes Infernais!
      const p = typeof attackProgress === 'number'
        ? Math.sin(Math.min(1, attackProgress) * Math.PI)
        : 1.0;

      pelvisX = cx;
      pelvisY = action === 'skillR' ? 810 - p * 45 : 856;
      chestX  = cx;
      chestY  = pelvisY - 88;
      neckX   = cx;
      neckY   = chestY - 64;
      headX   = cx;
      headY   = neckY - 26;
      capeFlutter = 1.65;
      legSpread = 0.92;

      hipL      = { x: pelvisX - 116, y: pelvisY + 50 };
      kneeL     = { x: pelvisX - 176, y: pelvisY + 190 };
      ankleL    = { x: pelvisX - 210, y: Math.min(1148, pelvisY + 295) };
      footSoleL = { x: pelvisX - 226, y: action === 'skillR' ? groundY - p * 35 : groundY };

      hipR      = { x: pelvisX + 116, y: pelvisY + 50 };
      kneeR     = { x: pelvisX + 176, y: pelvisY + 190 };
      ankleR    = { x: pelvisX + 210, y: Math.min(1148, pelvisY + 295) };
      footSoleR = { x: pelvisX + 226, y: action === 'skillR' ? groundY - p * 35 : groundY };

      shoulderL = { x: chestX - 148, y: chestY - 50 };
      elbowL    = { x: shoulderL.x - 132, y: shoulderL.y - 24 };
      wristL    = { x: elbowL.x - 115, y: elbowL.y - 12 };
      handGripL = { x: wristL.x - 46, y: wristL.y - 6 };

      shoulderR = { x: chestX + 148, y: chestY - 50 };
      elbowR    = { x: shoulderR.x + 132, y: shoulderR.y - 24 };
      wristR    = { x: elbowR.x + 115, y: elbowR.y - 12 };
      handGripR = { x: wristR.x + 46, y: wristR.y - 6 };

      // Extensão das lâminas na ponta das correntes infernais!
      const ext = Math.max(0.35, p);
      weaponLPos = {
        x: handGripL.x - 135 * ext,
        y: handGripL.y + 42 * ext
      };
      weaponLRot = 0.82 * ext;
      chainSwayL = 1.55;

      if (action === 'skillQ') {
        weaponRRot = 0.52;
        chainSwayR = -0.65;
      } else {
        weaponRPos = {
          x: handGripR.x + 135 * ext,
          y: handGripR.y + 42 * ext
        };
        weaponRRot = -0.82 * ext;
        chainSwayR = -1.55;
      }
    }

    return {
      id: `rig-${action}-${orientation.toLowerCase()}`,
      label: `RIG-01: ${action.toUpperCase()} (${orientation})`,
      refImage,
      category: 'rig-pose',
      action,
      orientation,
      showHead: true,
      showBody: true,
      showCape: true,
      showScarf: true,
      showWeapons: true,
      showBareNeck: false,
      yaw,
      capeFlutter,
      legSpread,
      bodyScale: 0.76,
      head: {
        x: headX,
        y: headY,
        scaleX: 0.568,
        scaleY: 0.568,
        rotation: headRot,
        yaw,
        anchorX: 637,
        anchorY: 1132
      },
      neckBase: { x: neckX, y: neckY },
      chest:    { x: chestX, y: chestY },
      pelvis:   { x: pelvisX, y: pelvisY },
      armL: { shoulder: shoulderL, elbow: elbowL, wrist: wristL, handGrip: handGripL },
      armR: { shoulder: shoulderR, elbow: elbowR, wrist: wristR, handGrip: handGripR },
      legL: { hip: hipL, knee: kneeL, ankle: ankleL, footSole: footSoleL, footPitch: footPitchL, contact: contactL, facingDir, yaw },
      legR: { hip: hipR, knee: kneeR, ankle: ankleR, footSole: footSoleR, footPitch: footPitchR, contact: contactR, facingDir, yaw },
      skeleton: {
        pelvis: { x: pelvisX, y: pelvisY },
        chest: { x: chestX, y: chestY },
        neckBase: { x: neckX, y: neckY },
        headPivot: { x: headX, y: headY },
        shoulderL,
        shoulderR,
        hipL,
        hipR,
        armL: { shoulder: shoulderL, elbow: elbowL, wrist: wristL, handGrip: handGripL },
        armR: { shoulder: shoulderR, elbow: elbowR, wrist: wristR, handGrip: handGripR },
        legL: { hip: hipL, knee: kneeL, ankle: ankleL, footSole: footSoleL, footPitch: footPitchL, contact: contactL, facingDir, yaw },
        legR: { hip: hipR, knee: kneeR, ankle: ankleR, footSole: footSoleR, footPitch: footPitchR, contact: contactR, facingDir, yaw }
      },
      weaponL: {
        x: weaponLPos ? weaponLPos.x : handGripL.x,
        y: weaponLPos ? weaponLPos.y : handGripL.y,
        scale: 0.62,
        rotation: weaponLRot,
        chainSway: chainSwayL,
        isExtended: !!weaponLPos
      },
      weaponR: {
        x: weaponRPos ? weaponRPos.x : handGripR.x,
        y: weaponRPos ? weaponRPos.y : handGripR.y,
        scale: 0.62,
        rotation: weaponRRot,
        chainSway: chainSwayR,
        isExtended: !!weaponRPos
      }
    };
  }
}
