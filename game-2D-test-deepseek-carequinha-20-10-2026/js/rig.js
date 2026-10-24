'use strict';
// rig.js — esqueleto 3D invisível, IK analítica de 2 ossos e máquina de combo.
// O rig só conhece números: raízes, alvos, comprimentos e polos. Nenhum pixel aqui.
Object.assign(Pilot, (() => {
  const { add, sub, mul, dot, cross, norm, clamp, smooth, lerp, localPoint } = Pilot;

  // ---------------------------------------------------------------------------
  // IK analítica de 2 ossos (lei dos cossenos + vetor polar).
  // Devolve {root, joint, end}. Os comprimentos L1 e L2 são SEMPRE preservados,
  // mesmo com alvo inalcançável (esticado) ou degenerado (dobrado sobre a raiz).
  // ---------------------------------------------------------------------------
  function solveIK(root, target, L1, L2, pole = [0, 0, 1]) {
    const toT = sub(target, root);
    let d = Math.hypot(toT[0], toT[1], toT[2]);
    const minD = Math.abs(L1 - L2), maxD = L1 + L2;

    let dir;
    if (d > 1e-9) dir = mul(toT, 1 / d);
    else {
      const p = (pole[0] || pole[1] || pole[2]) ? pole : [0, 0, 1];
      dir = norm(p);
      if (!dir[0] && !dir[1] && !dir[2]) dir = [0, 0, 1];
    }

    d = clamp(d, minD, maxD);
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d); // projeção do cotovelo/joelho no eixo
    const h = Math.sqrt(Math.max(0, L1 * L1 - a * a)); // deslocamento perpendicular

    // Componente do vetor polar perpendicular ao eixo define o plano de dobra.
    let perp = sub(pole, mul(dir, dot(pole, dir)));
    let pl = Math.hypot(perp[0], perp[1], perp[2]);
    if (pl < 1e-6) {
      const ref = Math.abs(dir[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      perp = cross(dir, ref);
      pl = Math.hypot(perp[0], perp[1], perp[2]);
    }
    perp = pl > 1e-9 ? mul(perp, 1 / pl) : [0, 1, 0];

    const joint = add(add(root, mul(dir, a)), mul(perp, h));
    const toEnd = sub(target, joint);
    const toEndLen = Math.hypot(toEnd[0], toEnd[1], toEnd[2]);
    const endDir = toEndLen > 1e-9 ? mul(toEnd, 1 / toEndLen) : dir;
    const end = add(joint, mul(endDir, L2));
    return { root, joint, end };
  }

  // ---------------------------------------------------------------------------
  // Máquina de estado do combo de 3 golpes.
  // - click(): idle inicia o golpe 1; durante os golpes 1 e 2, bufferiza o próximo.
  // - update(dt): avança o tempo e resolve troca de golpe / recuperação / idle.
  // ---------------------------------------------------------------------------
  const STRIKE = 0.45;   // duração ativa de cada golpe
  const RECOVERY = 0.28; // janela de recuperação antes de voltar ao idle
  class Combat {
    constructor() {
      this.index = -1;      // -1 idle, 0/1/2 golpes
      this.queued = false;  // buffer de input
      this.t = 0;           // tempo dentro do golpe atual
      this.recovery = 0;    // tempo restante de recuperação
    }
    click() {
      if (this.index === -1) {
        this.index = 0; this.t = 0; this.queued = false; this.recovery = 0;
      } else if (this.index < 2) {
        this.queued = true;
      }
      // no 3º golpe não há 4º: cliques extras são ignorados.
    }
    update(dt) {
      if (this.index === -1) {
        if (this.recovery > 0) this.recovery = Math.max(0, this.recovery - dt);
        return;
      }
      this.t += dt;
      let guard = 0;
      while (this.t >= STRIKE && guard++ < 16) {
        this.t -= STRIKE;
        if (this.index < 2 && this.queued) {
          this.index++; this.queued = false;
        } else {
          this.index = -1; this.queued = false; this.t = 0; this.recovery = RECOVERY;
          break;
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Proporções chibi (unidades ~ cm): cabeça ~38% da altura, corpo compacto.
  // ---------------------------------------------------------------------------
  const ANAT = {
    hipZ: 52, neckZ: 110, shoulderZ: 96, headZ: 138,
    shoulderX: 23, hipX: 13,
    armUpper: 21, armFore: 20,
    thigh: 26, shin: 24,
    footZ: 5,
  };

  const rot2 = (r, f, a) => [r * Math.cos(a) - f * Math.sin(a), r * Math.sin(a) + f * Math.cos(a)];
  const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  // Chaves de pose por golpe: preparação -> impacto -> recuperação.
  // Tudo em coordenadas locais [direita, frente, cima] do corpo.
  function idleHands() {
    return [
      [ANAT.shoulderX + 6.5, 7, ANAT.hipZ + 10],
      [-(ANAT.shoulderX + 6.5), 7, ANAT.hipZ + 10],
    ];
  }

  function handKeys(index) {
    const K = {
      0: {
        wind: [[ANAT.shoulderX + 26, -18, ANAT.shoulderZ + 6], [-(ANAT.shoulderX + 5), 10, ANAT.hipZ + 15]],
        hit:  [[ANAT.shoulderX + 30, 32, ANAT.shoulderZ - 4], [-(ANAT.shoulderX + 8), 4, ANAT.hipZ + 16]],
        rec:  [[ANAT.shoulderX + 18, 16, ANAT.shoulderZ - 12], [-(ANAT.shoulderX + 5), 5, ANAT.hipZ + 13]],
      },
      1: {
        wind: [[ANAT.shoulderX + 5, 10, ANAT.hipZ + 15], [-(ANAT.shoulderX + 26), -18, ANAT.shoulderZ + 6]],
        hit:  [[ANAT.shoulderX + 8, 4, ANAT.hipZ + 16], [-(ANAT.shoulderX + 30), 32, ANAT.shoulderZ - 4]],
        rec:  [[ANAT.shoulderX + 5, 5, ANAT.hipZ + 13], [-(ANAT.shoulderX + 18), 16, ANAT.shoulderZ - 12]],
      },
      2: {
        wind: [[12, -14, ANAT.shoulderZ + 26], [-8, -16, ANAT.shoulderZ + 24]],
        hit:  [[10, 38, ANAT.shoulderZ - 20], [-2, 34, ANAT.shoulderZ - 18]],
        rec:  [[18, 18, ANAT.hipZ + 18], [6, 16, ANAT.hipZ + 16]],
      },
    };
    return K[String(index)] || null;
  }

  // u em [0,1] dentro do golpe: 30% antecipação, 32% golpe, 38% recuperação.
  function strikeHands(index, u) {
    const idle = idleHands();
    const k = handKeys(index);
    if (!k) return { handR: idle[0], handL: idle[1] };
    let a, b, t;
    if (u < 0.30) { a = idle; b = [k.wind[0], k.wind[1]]; t = smooth(u / 0.30); }
    else if (u < 0.62) { a = [k.wind[0], k.wind[1]]; b = [k.hit[0], k.hit[1]]; t = smooth((u - 0.30) / 0.32); }
    else { a = [k.hit[0], k.hit[1]]; b = [k.rec[0], k.rec[1]]; t = smooth((u - 0.62) / 0.38); }
    const R = mix3(a[0], b[0], t), L = mix3(a[1], b[1], t);
    return { handR: R, handL: L };
  }

  function strikeTwist(index, u) {
    if (index < 0) return 0;
    const wind = index === 1 ? 0.40 : index === 0 ? -0.40 : -0.10;
    const hit = index === 1 ? -0.52 : index === 0 ? 0.52 : 0.16;
    if (u < 0.30) return wind * smooth(u / 0.30);
    if (u < 0.62) return wind + (hit - wind) * smooth((u - 0.30) / 0.32);
    return hit * (1 - smooth((u - 0.62) / 0.38));
  }

  function strikeLean(index, u) {
    if (index < 0) return 0;
    if (u < 0.30) return -2.5 * smooth(u / 0.30);
    if (u < 0.62) return -2.5 + 9 * smooth((u - 0.30) / 0.32);
    return 6.5 * (1 - smooth((u - 0.62) / 0.38));
  }

  // ---------------------------------------------------------------------------
  // makeRig(pose) -> nós do esqueleto projetáveis e os 4 membros resolvidos por IK.
  // pose: {pos:[x,y,z], yaw, time, speed, combat:{index,time}}
  // ---------------------------------------------------------------------------
  function makeRig(pose = {}) {
    const pos = pose.pos || [0, 0, 0];
    const yaw = pose.yaw || 0;
    const time = pose.time || 0;
    const speed = pose.speed || 0;
    const combat = pose.combat || { index: -1, time: 0 };
    const at = (r, f, z) => add(pos, localPoint([r, f, z], yaw));

    // Respiração/bob sutil; passada quando há velocidade.
    const breathe = Math.sin(time * 2.1) * 1.1;
    const gait = clamp(speed, 0, 1);
    const bob = breathe * (1 - gait) - Math.abs(Math.sin(time * 6)) * 3.5 * gait;
    const swayR = Math.sin(time * 1.6) * 2.2 * (1 - gait);
    const hipZ = ANAT.hipZ + bob;
    const shoulderZ = ANAT.shoulderZ + bob;
    const neckZ = ANAT.neckZ + bob;
    const headZ = ANAT.headZ + bob;

    // Passada: pernas em oposição de fase.
    const stepR = Math.sin(time * 6) * 15 * gait;
    const stepL = Math.sin(time * 6 + Math.PI) * 15 * gait;
    const liftR = Math.max(0, Math.sin(time * 6)) * 6 * gait;
    const liftL = Math.max(0, Math.sin(time * 6 + Math.PI)) * 6 * gait;

    // Golpe ativo: u = progresso dentro do golpe.
    const inStrike = combat.index >= 0;
    const u = inStrike ? clamp(combat.time / STRIKE, 0, 1) : 0;
    const hands = strikeHands(inStrike ? combat.index : -1, u);
    const twist = inStrike ? strikeTwist(combat.index, u) : 0;
    const lean = inStrike ? strikeLean(combat.index, u) : 0;
    const armSwing = Math.sin(time * 6) * 9 * gait * (inStrike ? 0 : 1);

    // Ombros giram com a torção do tronco; o quadril contra-gira.
    const shR = rot2(ANAT.shoulderX, 0, twist);
    const shL = rot2(-ANAT.shoulderX, 0, twist);
    const hpR = rot2(ANAT.hipX, 0, -twist * 0.22);
    const hpL = rot2(-ANAT.hipX, 0, -twist * 0.22);

    const shoulderR = at(shR[0], shR[1] + lean * 0.45, shoulderZ);
    const shoulderL = at(shL[0], shL[1] + lean * 0.45, shoulderZ);
    const hipR = at(hpR[0], hpR[1], hipZ);
    const hipL = at(hpL[0], hpL[1], hipZ);

    const handTargetR = at(hands.handR[0], hands.handR[1] + armSwing, hands.handR[2]);
    const handTargetL = at(hands.handL[0], hands.handL[1] - armSwing, hands.handL[2]);
    const footTargetR = at(ANAT.hipX, stepR, ANAT.footZ + liftR);
    const footTargetL = at(-ANAT.hipX, stepL, ANAT.footZ + liftL);

    // Polos: cotovelos para fora/atrás, joelhos para frente.
    const armPoleR = localPoint([1, -0.8, 0], yaw);
    const armPoleL = localPoint([-1, -0.8, 0], yaw);
    const legPoleR = localPoint([0.25, 1, 0], yaw);
    const legPoleL = localPoint([-0.25, 1, 0], yaw);

    const limbs = [
      { name: 'armR', root: shoulderR, target: handTargetR, lengths: [ANAT.armUpper, ANAT.armFore], pole: armPoleR },
      { name: 'armL', root: shoulderL, target: handTargetL, lengths: [ANAT.armUpper, ANAT.armFore], pole: armPoleL },
      { name: 'legR', root: hipR, target: footTargetR, lengths: [ANAT.thigh, ANAT.shin], pole: legPoleR },
      { name: 'legL', root: hipL, target: footTargetL, lengths: [ANAT.thigh, ANAT.shin], pole: legPoleL },
    ].map(limb => Object.assign(limb, solveIK(limb.root, limb.target, limb.lengths[0], limb.lengths[1], limb.pole)));

    const armR = limbs[0], armL = limbs[1], legR = limbs[2], legL = limbs[3];

    // Direção da espada: do cotovelo para a mão, estendida além da empunhadura.
    const gripRaw = sub(armR.end, armR.joint);
    const gl = Math.hypot(gripRaw[0], gripRaw[1], gripRaw[2]) || 1;
    const swordDir = mul(gripRaw, 1 / gl);

    return {
      pos, yaw, time, speed, combat,
      hips: at(swayR * 0.5, 0, hipZ),
      neck: at(0, lean * 0.65, neckZ),
      head: at(0, lean * 0.85, headZ),
      shoulderR, shoulderL, hipR, hipL,
      handR: armR.end, handL: armL.end,
      footR: legR.end, footL: legL.end,
      elbowR: armR.joint, elbowL: armL.joint,
      kneeR: legR.joint, kneeL: legL.joint,
      swordDir, twist, lean,
      limbs,
    };
  }

  return { solveIK, Combat, makeRig, ANAT, STRIKE, RECOVERY };
})());
