const test = require('node:test');
const assert = require('node:assert/strict');
const { Vec3 } = require('../js/core.js');
const { KnightRig } = require('../js/rig.js');
const { PALETTE } = require('../js/ink.js');

test('Visual Spec: proporções Chibi (~3.0 cabeças) e estabilidade de altura', () => {
  const rig = new KnightRig();
  const joints = rig.evaluate(new Vec3(0, 0, 0));

  const headRadius = 14;
  const headDiameter = headRadius * 2;
  const totalHeight = (joints.head.z + headRadius) - joints.footL.z;

  // Altura total deve ser de aprox. 2.4 a 3.4 cabeças (chibi da prancha)
  const headRatio = totalHeight / headDiameter;
  assert.ok(headRatio >= 2.4 && headRatio <= 3.4, `Proporção fora do estilo chibi: ${headRatio}`);
});

test('Visual Spec: validação das poses da prancha oficial', () => {
  const rig = new KnightRig();
  const poses = ['idle', 'run', 'combo1', 'combo2', 'combo3'];

  for (const p of poses) {
    rig.setAnimation(p);
    rig.animTime = 0.2;
    const j = rig.evaluate(new Vec3(0, 0, 0));

    assert.ok(j.handR.distanceTo(j.shoulderR) > 0, `Braço colapsou em ${p}`);
    assert.ok(j.swordTip.distanceTo(j.handR) > 10, `Espada não tem comprimento em ${p}`);
  }
});

test('Visual Spec: paleta oficial conforme SPEC-VISUAL.md', () => {
  assert.equal(PALETTE.hairMain, '#D81828');
  assert.equal(PALETTE.shoulderBow, '#F08020');
  assert.equal(PALETTE.tunicRed, '#E02030');
  assert.equal(PALETTE.armorLight, '#E0D8D0');
  assert.equal(PALETTE.eyes, '#201008');
});
