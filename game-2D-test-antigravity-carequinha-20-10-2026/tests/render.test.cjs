const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class MockPath2D {
  moveTo() {}
  lineTo() {}
  quadraticCurveTo() {}
  arc() {}
  ellipse() {}
  closePath() {}
  rect() {}
}

function createMockContext() {
  const c = {
    fills: 0,
    strokes: 0,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineJoin: '',
    lineCap: '',
    globalAlpha: 1,
    fill() { c.fills++; },
    stroke() { c.strokes++; },
    clip() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
    rotate() {},
    transform() {},
    setTransform() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    arc() {},
    ellipse() {},
    closePath() {},
    rect() {}
  };
  return c;
}

const ctx = vm.createContext({ Path2D: MockPath2D, globalThis: {} });
ctx.globalThis = ctx;
ctx.Path2D = MockPath2D;

const modules = ['js/core.js', 'js/ink.js', 'js/rig.js', 'js/head.js', 'js/hero.js'];
for (const file of modules) {
  if (fs.existsSync(file)) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  }
}

const { Agy } = ctx;

test('Agy.Head.drawHead e Agy.Hero.drawHero renderizam sem lançar erros em 8 direções e 4 fases de combate', () => {
  assert.equal(typeof Agy.Head.drawHead, 'function');
  assert.equal(typeof Agy.Hero.drawHero, 'function');

  const mockCtx = createMockContext();

  for (let d = 0; d < 8; d++) {
    const yaw = (d * Math.PI) / 4;
    for (const strike of [-1, 0, 1, 2]) {
      const rig = Agy.Rig.buildRig({
        pos: [0, 0, 0],
        yaw,
        time: 0.35,
        speed: 0.5,
        combat: { index: strike, time: 0.2 }
      });

      Agy.Head.drawHead(mockCtx, { pos: rig.head, yaw: rig.yaw, scale: 1.0 });
      Agy.Hero.drawHero(mockCtx, rig);
    }
  }

  assert.ok(mockCtx.fills > 200, `esperava centenas de preenchimentos de cel-shading, obteve ${mockCtx.fills}`);
  assert.ok(mockCtx.strokes > 50, `esperava contornos de tinta preta, obteve ${mockCtx.strokes}`);
});

test('Agy.Ink fornece geradores de cápsula e fita ribbon', () => {
  assert.equal(typeof Agy.Ink.capsule, 'function');
  assert.equal(typeof Agy.Ink.ribbon, 'function');
  assert.ok(Agy.Ink.capsule(0, 0, 5, 20, 0, 3) instanceof MockPath2D);
  assert.ok(Agy.Ink.ribbon([[0, 0], [15, 5]], () => 4) instanceof MockPath2D);
});
