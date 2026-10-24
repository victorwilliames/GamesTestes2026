const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ctx = vm.createContext({});
const file = 'js/core.js';
if (fs.existsSync(file)) vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);
test('câmera preserva simetria do chão e separa altura de profundidade', () => {
  assert.ok(ctx.Pilot, 'core deve fornecer Pilot');
  const a=ctx.Pilot.project([10,0,0]), b=ctx.Pilot.project([0,10,0]);
  close(a[0],-b[0]); close(a[1],b[1]); close(a[2],b[2]);
  const z=ctx.Pilot.project([0,0,10]);
  close(z[0],0); close(z[1],-10*Math.cos(34*Math.PI/180));
  close(z[2],10*Math.sin(34*Math.PI/180));
});
test('referencial local mantém distâncias e eixo vertical', () => {
  assert.ok(ctx.Pilot, 'core deve fornecer Pilot');
  for(const yaw of [0,0.37,Math.PI/2,Math.PI]) {
    const p=ctx.Pilot.localPoint([3,4,12],yaw);
    close(Math.hypot(...p),13); close(p[2],12);
  }
});
