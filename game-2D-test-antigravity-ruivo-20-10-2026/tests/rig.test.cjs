const test = require('node:test');
const assert = require('node:assert/strict');
const { Vec3 } = require('../js/core.js');
const { KnightRig } = require('../js/rig.js');

test('KnightRig: todas as animações (idle, run, combo1, combo2, combo3) geram juntas válidas', () => {
  const rig = new KnightRig();
  const anims = ['idle', 'run', 'combo1', 'combo2', 'combo3'];

  for (const anim of anims) {
    rig.setAnimation(anim);
    for (let t = 0; t <= 1.0; t += 0.2) {
      rig.animTime = t;
      const joints = rig.evaluate(new Vec3(0, 0, 0));

      assert.ok(joints.head, `Falta junta head em ${anim}`);
      assert.ok(joints.pelvis, `Falta junta pelvis em ${anim}`);
      assert.ok(joints.handR, `Falta junta handR em ${anim}`);
      assert.ok(joints.swordTip, `Falta junta swordTip em ${anim}`);
      assert.ok(!Number.isNaN(joints.head.x), `NaN em head.x para ${anim}`);
      assert.ok(!Number.isNaN(joints.swordTip.z), `NaN em swordTip.z para ${anim}`);
    }
  }
});
