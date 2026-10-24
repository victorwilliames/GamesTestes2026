const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ctx = vm.createContext({ globalThis: {} });
ctx.globalThis = ctx;
vm.runInContext(fs.readFileSync('js/core.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('js/ink.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('js/rig.js', 'utf8'), ctx);

const { solveIK, CombatEngine, buildRig } = ctx.Agy.Rig;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test('IK analítica mantém exatamente os comprimentos em qualquer distância', () => {
  const cases = [
    [20, 0, 0],   // dentro do alcance
    [100, 0, 0],  // inalcançável (esticado)
    [0, 0, 0],    // degenerado na raiz
    [0, 10, -5]   // posição oblíqua
  ];
  for (const target of cases) {
    const res = solveIK([0, 0, 0], target, 18, 14, [0, 1, 0]);
    assert.ok(Math.abs(dist(res.root, res.joint) - 18) < 1e-6);
    assert.ok(Math.abs(dist(res.joint, res.end) - 14) < 1e-6);
    assert.ok([...res.joint, ...res.end].every(Number.isFinite));
  }
});

test('vetor polar trava o plano de dobra de cotovelos e joelhos', () => {
  const up = solveIK([0, 0, 0], [15, 0, 0], 10, 10, [0, 0, 1]);
  const down = solveIK([0, 0, 0], [15, 0, 0], 10, 10, [0, 0, -1]);
  assert.ok(up.joint[2] > 0);
  assert.ok(down.joint[2] < 0);
});

test('máquina de combate encadeia 1 -> 2 -> 3 com buffer e recupera sem 4º golpe', () => {
  const combat = new CombatEngine();
  combat.triggerAttack();
  assert.equal(combat.strikeIndex, 0);

  combat.update(0.2);
  combat.triggerAttack(); // bufferiza próximo golpe
  combat.update(0.3);
  assert.equal(combat.strikeIndex, 1);

  combat.update(0.2);
  combat.triggerAttack(); // bufferiza 3º golpe
  combat.update(0.3);
  assert.equal(combat.strikeIndex, 2);

  combat.triggerAttack(); // não deve existir 4º golpe
  combat.update(0.5);
  assert.equal(combat.strikeIndex, -1);
  assert.equal(combat.hasQueuedClick, false);
});

test('buildRig gera esqueletos matematicamente válidos em todas as 8 direções e poses de ataque', () => {
  for (let d = 0; d < 8; d++) {
    const yaw = (d * Math.PI) / 4;
    for (const strike of [-1, 0, 1, 2]) {
      const rig = buildRig({
        pos: [10, 20, 0],
        yaw,
        time: 0.5,
        speed: 0.8,
        combat: { index: strike, time: 0.2 }
      });
      for (const limb of rig.limbs) {
        assert.ok(Math.abs(dist(limb.root, limb.joint) - limb.lengths[0]) < 1e-5);
        assert.ok(Math.abs(dist(limb.joint, limb.end) - limb.lengths[1]) < 1e-5);
      }
    }
  }
});
