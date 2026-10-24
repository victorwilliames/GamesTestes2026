/* Node >=18: animation contract independent of browser. Run: node tests/test-animation.cjs */
'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'bundle.js'),'utf8'),sandbox,{timeout:10000});
const RigAdapter=sandbox.window.RigAdapter;
const A=require('../src/animation.js');
assert.deepEqual([...Object.keys(A.COUNTS)].sort(),['attack','idle','run','walk']);
const count=Object.values(A.COUNTS).reduce((x,y)=>x+y,0)*3;
assert.equal(count,126,'atlas frame budget per 3 directions');
let samples=0;
for(const state of ['idle','walk','run','attack'])for(const dir of ['S','SE','SW'])for(let i=0;i<64;i++){
 const q=A.makeGaitPose(RigAdapter,state,dir,i/64,state==='attack'?Math.floor(i*3/64):0);
 const coords=[q.head.x,q.head.y,q.legL.knee.x,q.legL.knee.y,
   q.legR.knee.x,q.legR.knee.y,q.armL.handGrip.x,q.armR.handGrip.y,
   q.weaponL.x,q.weaponL.y,q.weaponR.x,q.weaponR.y];
 assert(coords.every(Number.isFinite),state+'/'+dir+'/'+i+' non-finite');
 assert.equal(q.weaponL.x,q.armL.handGrip.x);
 assert.equal(q.weaponR.y,q.armR.handGrip.y);
 for(const side of ['L','R']){
   const leg=q['leg'+side];
   assert(Math.hypot(leg.knee.x-leg.hip.x,leg.knee.y-leg.hip.y)<201);
 }
 samples++;
}
const walk0=A.makeGaitPose(RigAdapter,'walk','S',0);
const walkMid=A.makeGaitPose(RigAdapter,'walk','S',.34);
assert.notEqual(walk0.legL.footSole.y,walkMid.legL.footSole.y,'leg is animated, not dragged');
console.log('PASS: '+samples+' articulated poses, anchor invariants, moving feet, 126-frame atlas budget.');
