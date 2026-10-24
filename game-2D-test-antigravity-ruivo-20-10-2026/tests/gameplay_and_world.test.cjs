const test = require('node:test');
const assert = require('node:assert/strict');
const { Vec3, IsoCamera } = require('../js/core.js');
const { KnightRig } = require('../js/rig.js');
const { Hero } = require('../js/hero.js');
const { HERO_VECTORS } = require('../js/hero_vectors.js');
const { World, HopliteSkeleton } = require('../js/world.js');
const { FXManager } = require('../js/fx.js');

test('Hero: estabilidade e calibração zero-jitter em todas as poses', () => {
  const poses = Object.keys(HERO_VECTORS);
  assert.ok(poses.length >= 15, `Esperava pelo menos 15 poses, obteve ${poses.length}`);

  for (const poseKey of poses) {
    const pose = HERO_VECTORS[poseKey];
    assert.ok(pose.l && pose.l.length > 0, `Pose ${poseKey} sem camadas`);

    let maxY = -Infinity;
    for (const layer of pose.l) {
      for (const poly of layer.p) {
        for (const [x, y] of poly) {
          if (y > maxY) maxY = y;
        }
      }
    }

    // Todas as poses de contato com o chão devem ter a base do pé em Y = 0.0
    if (poseKey !== 'salto_antic') {
      assert.ok(
        Math.abs(maxY) < 0.1,
        `Pose ${poseKey} não está aterrada em Y=0 (maxY: ${maxY})`
      );
    } else {
      // Salto no ar deve estar elevado
      assert.ok(maxY <= 0, `Salto no ar com pé abaixo do solo: ${maxY}`);
    }
  }
});

test('Hero: resolução correta das 8 direções isométricas em corrida e idle', () => {
  const camera = new IsoCamera({ yaw: 45 * Math.PI / 180, pitch: 34 * Math.PI / 180, scale: 1.5 });
  const rig = new KnightRig();
  const hero = new Hero(rig, camera);

  // Testa as 8 direções cardeais e diagonais
  const testAngles = [
    { yaw: 0, expected: 'dir_0' },
    { yaw: Math.PI * 0.25, expected: 'dir_45' },
    { yaw: Math.PI * 0.50, expected: 'dir_90' },
    { yaw: Math.PI * 0.75, expected: 'dir_135' },
    { yaw: Math.PI, expected: 'dir_180' },
    { yaw: Math.PI * 1.25, expected: 'dir_225' },
    { yaw: Math.PI * 1.50, expected: 'dir_270' },
    { yaw: Math.PI * 1.75, expected: 'dir_315' }
  ];

  rig.setAnimation('idle');
  for (const { yaw, expected } of testAngles) {
    rig.setFacing(yaw + camera.yaw);
    const key = hero.getCurrentPoseKey();
    assert.equal(key, expected, `Ângulo ${yaw} esperava ${expected}, obteve ${key}`);
  }
});

test('Hero: resolução das poses dinâmicas de combate (Combos 1, 2, 3)', () => {
  const camera = new IsoCamera({ yaw: 45 * Math.PI / 180, pitch: 34 * Math.PI / 180, scale: 1.5 });
  const rig = new KnightRig();
  const hero = new Hero(rig, camera);

  // Combo 1: Corte
  rig.setAnimation('combo1');
  rig.animTime = 0.10;
  assert.equal(hero.getCurrentPoseKey(), 'corte_antic');
  rig.animTime = 0.25;
  assert.equal(hero.getCurrentPoseKey(), 'corte_strike');

  // Combo 2: Revés
  rig.setAnimation('combo2');
  rig.animTime = 0.10;
  assert.equal(hero.getCurrentPoseKey(), 'reves_antic');
  rig.animTime = 0.28;
  assert.equal(hero.getCurrentPoseKey(), 'reves_strike');

  // Combo 3: Salto Impacto
  rig.setAnimation('combo3');
  rig.animTime = 0.15;
  assert.equal(hero.getCurrentPoseKey(), 'salto_antic');
  rig.animTime = 0.45;
  assert.equal(hero.getCurrentPoseKey(), 'salto_impact');
});

test('World: inicialização correta da Arena Infernal do Templo Subterrâneo', () => {
  const camera = new IsoCamera({ yaw: 45 * Math.PI / 180, pitch: 34 * Math.PI / 180, scale: 1.5 });
  const world = new World(camera);

  // 4 Braseiros monumentais
  assert.equal(world.braziers.length, 4, 'Deveria ter 4 braseiros nos cantos da arena');

  // Esqueletos Hoplitas com escudo e lança
  assert.ok(world.skeletons.length >= 2, 'Deveria ter esqueletos hoplitas na arena');
  for (const sk of world.skeletons) {
    assert.equal(sk.hp, 100, 'Esqueleto deve iniciar com 100 HP');
    assert.ok(sk.pos instanceof Vec3, 'Posição do esqueleto deve ser Vec3');
  }

  // Brasas vulcânicas subindo do abismo
  assert.ok(world.embers.length >= 30, 'Deveria ter brasas incandescentes subindo do abismo');

  // Elementos do templo
  const props = world.getRenderProps();
  assert.ok(props.length >= 10, 'Deveria ter props do templo para Z-sort');
});

test('FXManager: arcos de espada, faíscas, ondas de impacto e tremor de tela', () => {
  const fx = new FXManager();

  // Tremor de tela
  fx.triggerShake(8, 0.3);
  assert.equal(fx.shakeIntensity, 8);
  assert.ok(fx.shakeDuration > 0);

  fx.update(0.1);
  assert.ok(fx.shakeOffset.x !== 0 || fx.shakeOffset.y !== 0 || fx.shakeTimer < 0.3);

  // Arcos de corte
  fx.spawnSlash({ x: 100, y: 100 }, 0, 50, Math.PI, 1);
  assert.equal(fx.slashes.length, 1);

  // Faíscas
  fx.spawnSparks(100, 100, 15, 0);
  assert.equal(fx.particles.length, 15);

  // Ondas de choque no solo
  fx.spawnShockwave(100, 100, 80);
  assert.equal(fx.shockwaves.length, 1);

  // Poeira de passos
  fx.spawnDust(100, 100, 5, 0);
  assert.equal(fx.dustPuffs.length, 1);
});
