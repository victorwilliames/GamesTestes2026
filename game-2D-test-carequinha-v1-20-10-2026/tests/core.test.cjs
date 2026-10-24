const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ctx = vm.createContext({ globalThis: {} });
ctx.globalThis = ctx;
vm.runInContext(fs.readFileSync('js/core.js', 'utf8'), ctx);
const C = ctx.Agy.Core;

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test('câmera isométrica 3/4 preserva simetria ortogonal do solo', () => {
  const pX = C.project([15, 0, 0]);
  const pY = C.project([0, 15, 0]);
  close(pX[0], -pY[0]);
  close(pX[1], pY[1]);
  close(pX[2], pY[2]);
});

test('eixo z projeta exclusivamente em altura vertical e profundidade', () => {
  const pZ = C.project([0, 0, 20]);
  close(pZ[0], 0);
  close(pZ[1], -20 * Math.cos(34 * Math.PI / 180));
  close(pZ[2], 20 * Math.sin(34 * Math.PI / 180));
});

test('desprojeção unproject mapeia a tela de volta ao chão z=0 perfeitamente', () => {
  const original = [42.5, -18.3, 0];
  const screen = C.project(original);
  const unproj = C.unproject([screen[0], screen[1]]);
  close(original[0], unproj[0]);
  close(original[1], unproj[1]);
  close(0, unproj[2]);
});

test('coordenadas cilíndricas mantém raio radial no plano local', () => {
  const p = C.cylindricalToLocal(Math.PI / 3, 25, 10);
  close(Math.hypot(p[0], p[1]), 25);
  close(p[2], 10);
});
