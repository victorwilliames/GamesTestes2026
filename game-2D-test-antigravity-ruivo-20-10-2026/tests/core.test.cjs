const test = require('node:test');
const assert = require('node:assert/strict');
const { Vec3, Vec2, IsoCamera, MathUtils } = require('../js/core.js');

test('Vec3: operações básicas', () => {
  const v1 = new Vec3(1, 2, 3);
  const v2 = new Vec3(4, 5, 6);

  const sum = v1.add(v2);
  assert.equal(sum.x, 5);
  assert.equal(sum.y, 7);
  assert.equal(sum.z, 9);

  const sub = v2.sub(v1);
  assert.equal(sub.x, 3);
  assert.equal(sub.y, 3);
  assert.equal(sub.z, 3);

  const dot = v1.dot(v2);
  assert.equal(dot, 4 + 10 + 18);

  const cross = v1.cross(v2);
  assert.equal(cross.x, 2 * 6 - 3 * 5); // -3
  assert.equal(cross.y, 3 * 4 - 1 * 6); // 6
  assert.equal(cross.z, 1 * 5 - 2 * 4); // -3
});

test('IsoCamera: project e unproject consistência', () => {
  const cam = new IsoCamera({
    yaw: 45 * Math.PI / 180,
    pitch: 34 * Math.PI / 180,
    scale: 1.5,
    originX: 400,
    originY: 300
  });

  const p3d = new Vec3(50, -30, 0); // No chão Z=0
  const screen = cam.project(p3d);
  const recovered = cam.unproject(screen.x, screen.y, 0);

  assert.ok(Math.abs(recovered.x - p3d.x) < 0.001, `X recuperado difere: ${recovered.x} vs ${p3d.x}`);
  assert.ok(Math.abs(recovered.y - p3d.y) < 0.001, `Y recuperado difere: ${recovered.y} vs ${p3d.y}`);
  assert.ok(Math.abs(recovered.z - p3d.z) < 0.001, `Z recuperado difere: ${recovered.z} vs ${p3d.z}`);
});
