'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'bundle.js'),'utf8'),sandbox);
const A=require('../src/animation.js');
const R=require('../src/renderer.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const context={save(){},restore(){},translate(){},scale(){}};
const poses=[];
const painter={render(c,p){poses.push(p);}};
const live=new R.ContinuousRenderer(painter,sandbox.window.RigAdapter,{cache:false});
for(const stage of [0,1,2]){
  live.paint(context,640,380,'attack','S',.41,false,stage);
  live.paint(context,640,380,'attack','S',.4101,false,stage);
  assert.notEqual(poses.at(-1).weaponL.rotation,poses.at(-2).weaponL.rotation,'subframe pose must change continuously');
}
assert.equal(poses.length,6,'one procedural render per frame');
for(const pose of poses)for(const side of ['L','R']){
  const arm=pose['arm'+side],w=pose['weapon'+side];
  const grip=R.weaponPoint(w,side,395,638);
  near(grip.x,arm.handGrip.x);near(grip.y,arm.handGrip.y);
  const links=R.chainPoints(w,arm,side);
  const pommel=R.weaponPoint(w,side,532,794);
  near(links[0].x,pommel.x);near(links[0].y,pommel.y);
  near(links.at(-1).x,arm.wrist.x);near(links.at(-1).y,arm.wrist.y);
  assert(links.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
}
// Both bone lengths must hold even for an unreachable target.
for(const target of [{x:0,y:0},{x:1000,y:0},{x:2,y:3},{x:80,y:60}]){
  const limb=A.solveLimb({x:0,y:0},target,100,70,'L');
  near(Math.hypot(limb.joint.x,limb.joint.y),100);
  near(Math.hypot(limb.end.x-limb.joint.x,limb.end.y-limb.joint.y),70);
}
console.log('PASS: continuous subframes, 3 attacks, shared grips, pommel-to-wrist chains, reachable IK endpoints.');
