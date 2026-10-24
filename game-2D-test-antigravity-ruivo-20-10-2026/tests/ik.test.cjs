const test = require('node:test');
const assert = require('node:assert/strict');
const { Vec3 } = require('../js/core.js');
const { solveTwoBoneIK } = require('../js/rig.js');

test('IK: preservação rigorosa do comprimento dos ossos L1 e L2', () => {
  const root = new Vec3(0, 0, 30);
  const target = new Vec3(10, 10, 15);
  const l1 = 12;
  const l2 = 12;
  const pole = new Vec3(1, 0, 0);

  const sol = solveTwoBoneIK(root, target, l1, l2, pole);

  const len1 = sol.root.distanceTo(sol.mid);
  const len2 = sol.mid.distanceTo(sol.end);

  assert.ok(Math.abs(len1 - l1) < 0.001, `Osso 1 esticou/encolheu: ${len1} vs ${l1}`);
  assert.ok(Math.abs(len2 - l2) < 0.001, `Osso 2 esticou/encolheu: ${len2} vs ${l2}`);
});

test('IK: alvo fora do alcance (hiper-extensão) mantém ossos e não quebra com NaN', () => {
  const root = new Vec3(0, 0, 0);
  const target = new Vec3(100, 0, 0); // Muito longe
  const l1 = 10;
  const l2 = 10;
  const pole = new Vec3(0, 1, 0);

  const sol = solveTwoBoneIK(root, target, l1, l2, pole);

  assert.ok(!Number.isNaN(sol.mid.x) && !Number.isNaN(sol.mid.y) && !Number.isNaN(sol.mid.z));
  assert.ok(!Number.isNaN(sol.end.x) && !Number.isNaN(sol.end.y) && !Number.isNaN(sol.end.z));

  const totalLen = sol.root.distanceTo(sol.end);
  assert.ok(totalLen <= l1 + l2, `Comprimento excedeu a soma dos ossos: ${totalLen}`);
});
