const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('js/core.js','utf8'),ctx);
if(fs.existsSync('js/rig.js'))vm.runInContext(fs.readFileSync('js/rig.js','utf8'),ctx);
const P=ctx.Pilot,dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
test('IK mantém os dois comprimentos inclusive alvo inalcançável e degenerado',()=>{
 assert.equal(typeof P.solveIK,'function');
 for(const target of [[15,3,0],[100,0,0],[0,0,0],[0,0,10]]){
  const r=P.solveIK([0,0,0],target,10,8,[0,0,1]);
  assert.ok(Math.abs(dist(r.root,r.joint)-10)<1e-7);
  assert.ok(Math.abs(dist(r.joint,r.end)-8)<1e-7);
  assert.ok([...r.joint,...r.end].every(Number.isFinite));
 }
});
test('pole escolhe lado da dobra',()=>{
 assert.equal(typeof P.solveIK,'function');
 assert.ok(P.solveIK([0,0,0],[12,0,0],10,10,[0,1,0]).joint[1]>0);
 assert.ok(P.solveIK([0,0,0],[12,0,0],10,10,[0,-1,0]).joint[1]<0);
});
test('combo aceita buffer, percorre 1→2→3 e volta a idle sem quarto golpe',()=>{
 assert.equal(typeof P.Combat,'function');const c=new P.Combat();c.click(0);
 assert.equal(c.index,0);c.update(.2);c.click(1);c.update(.4);assert.equal(c.index,1);
 c.update(.2);c.click(2);c.update(.4);assert.equal(c.index,2);
 c.click(3);c.update(1);assert.equal(c.index,-1);assert.equal(c.queued,false);
});
test('rig produz alvos finitos e comprimentos válidos em oito direções e golpes',()=>{
 assert.equal(typeof P.makeRig,'function');
 for(let i=0;i<8;i++)for(const index of [-1,0,1,2])for(const t of [0,.1,.25,.4]){
  const r=P.makeRig({pos:[0,0,0],yaw:i*Math.PI/4,time:t,combat:{index,time:t}});
  for(const limb of r.limbs){assert.ok(Math.abs(dist(limb.root,limb.joint)-limb.lengths[0])<1e-6);assert.ok(Math.abs(dist(limb.joint,limb.end)-limb.lengths[1])<1e-6);}
 }
});
