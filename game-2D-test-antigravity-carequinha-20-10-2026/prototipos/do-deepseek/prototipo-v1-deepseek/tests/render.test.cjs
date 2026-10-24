const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Shim de Path2D (o Node não tem Canvas) e um contexto 2D que só conta chamadas.
class P2D { moveTo() {} lineTo() {} quadraticCurveTo() {} arc() {} ellipse() {} closePath() {} rect() {} }
function makeCtx() {
  const c = {
    fills: 0, strokes: 0, fillStyle: '', strokeStyle: '', lineWidth: 1, lineJoin: '', lineCap: '', globalAlpha: 1,
    fill() { c.fills++; }, stroke() { c.strokes++; }, clip() {}, save() {}, restore() {},
    translate() {}, scale() {}, rotate() {}, transform() {}, setTransform() {}, beginPath() {}, moveTo() {}, lineTo() {},
    quadraticCurveTo() {}, arc() {}, ellipse() {}, closePath() {}, rect() {},
    createLinearGradient() { return { addColorStop() {} }; },
  };
  return c;
}

const ctx = vm.createContext({ Path2D: P2D });
const files = ['js/core.js', 'js/ink.js', 'js/rig.js', 'js/head.js', 'js/hero.js'];
for (const f of files) if (fs.existsSync(f)) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const P = ctx.Pilot;

test('painter do herói e da cabeça existe e não lança em 8 direções e 4 poses', () => {
  assert.equal(typeof P.drawHead, 'function', 'head deve fornecer drawHead');
  assert.equal(typeof P.drawHero, 'function', 'hero deve fornecer drawHero');
  const c = makeCtx();
  for (let i = 0; i < 8; i++) {
    for (const index of [-1, 0, 1, 2]) {
      const rig = P.makeRig({ pos: [0, 0, 0], yaw: i * Math.PI / 4, time: 0.3, combat: { index, time: 0.2 } });
      P.drawHead(c, { pos: rig.head, yaw: rig.yaw, scale: 1 });
      P.drawHero(c, rig);
    }
  }
  assert.ok(c.fills > 200, `esperava muitos preenchimentos, veio ${c.fills}`);
  assert.ok(c.strokes > 50, `esperava contornos, veio ${c.strokes}`);
});

test('ink estendido fornece cápsula e traço afunilado', () => {
  assert.equal(typeof P.capsulePath, 'function');
  assert.equal(typeof P.taperPath, 'function');
  assert.ok(P.capsulePath(0, 0, 5, 10, 0, 3) instanceof P2D);
  assert.ok(P.taperPath([[0, 0], [10, 0]], () => 4) instanceof P2D);
});