/* Arena + actor orchestration. The same original procedural HeroRenderer
   draws the official approved hero geometry for idle, running and attacks.
   No PNG/sprite sheet is loaded into the game Canvas. */
(function(){
'use strict';
const C=window.Game2DCombat;
if(!C||!window.HeroRenderer||!window.RigAdapter)throw Error('Dependencia local nao carregada');
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
const W=1280,H=720,PI=Math.PI;
const painter=new HeroRenderer();
const atlas=new Game2DAnimation.Atlas(painter,RigAdapter);
const key=new Set();
const ui={fps:document.getElementById('fps'),frame:document.getElementById('frame'),hp:document.getElementById('hp'),
combo:document.getElementById('combo'),k:document.getElementById('kills'),status:document.getElementById('status'),
bench:document.getElementById('bench-result')};
let hero=C.createHero(),enemies=C.createDummies(),fx=[],tick=0,walk=0,showDebug=false,last=0,acc=0;
let lastRun=false, frameDelta=0;
let visual={kind:'idle',dir:'S',phase:0,old:null,fade:0};
let metrics={fps:0,drawMs:0,frames:0,updateMs:0,headlessBenchmark:null};
const rng=(function(){let s=94213;return function(){s=(1664525*s+1013904223)>>>0;return s/4294967296;};})();
function pathBlob(c,cx,cy,rx,ry,rough=8){
 c.beginPath();
 for(let i=0;i<=44;i++){const t=i*PI*2/44,r=1+Math.sin(t*7+1)*rough/100+Math.sin(t*11-1.2)*rough/180;
 const x=cx+Math.cos(t)*rx*r,y=cy+Math.sin(t)*ry*r;
 if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}
 c.closePath();
}
function paintStatic(){
 const out=document.createElement('canvas');out.width=W;out.height=H;const p=out.getContext('2d',{alpha:false});
 const sea=p.createLinearGradient(0,0,0,H);sea.addColorStop(0,'#0b5366');sea.addColorStop(.5,'#17788b');sea.addColorStop(1,'#0b495f');
 p.fillStyle=sea;p.fillRect(0,0,W,H);
 for(let i=0;i<92;i++){const x=rng()*W,y=rng()*H;p.strokeStyle=i%3?'#3b9dac44':'#6ac5bd55';p.lineWidth=1+rng()*1.8;
 p.beginPath();p.ellipse(x,y,4+rng()*19,1.7+rng()*4,-.2,0,PI*1.2);p.stroke();}
 p.save();p.shadowColor='#021d25';p.shadowBlur=35;p.shadowOffsetY=24;
 pathBlob(p,640,389,550,286,3);p.fillStyle='#86674e';p.fill();p.restore();
 pathBlob(p,640,374,549,281,2);p.fillStyle='#ebc594';p.fill();
 p.strokeStyle='#fff0c270';p.lineWidth=6;p.stroke();
 pathBlob(p,640,366,485,241,2);p.fillStyle='#689b64';p.fill();
 pathBlob(p,648,357,448,212,1);p.fillStyle='#6a9d65';p.fill();
 for(let i=0;i<850;i++){const a=rng()*PI*2,rad=Math.sqrt(rng()),x=640+Math.cos(a)*rad*465,y=365+Math.sin(a)*rad*219;
 p.fillStyle=i%3?'#1b673326':'#d4d78938';p.fillRect(x,y,1+rng()*3,1+rng()*4);}
 // Dry shore pebbles and sparse trees, deliberately outside the combat footprint.
 for(const item of [{x:217,y:284,s:.7},{x:1023,y:292,s:1.0},{x:981,y:536,s:.66},{x:290,y:514,s:.6}]){
  let x=item.x,y=item.y,s=item.s;
  p.save();p.translate(x,y);p.scale(s,s);
  p.fillStyle='#25473566';p.beginPath();p.ellipse(16,20,53,12,.25,0,PI*2);p.fill();
  p.strokeStyle='#705534';p.lineWidth=13;p.lineCap='round';p.beginPath();p.moveTo(0,12);p.quadraticCurveTo(-13,-48,16,-100);p.stroke();
  for(let j=0;j<7;j++){const ang=j*PI*2/7;p.save();p.translate(16,-100);p.rotate(ang);p.fillStyle=j%2?'#235f42':'#326c49';
   p.beginPath();p.moveTo(0,0);p.quadraticCurveTo(37,-31,84,-13);p.quadraticCurveTo(55,-3,0,0);p.fill();p.restore();}
  p.restore();
 }
 // Wooden pier on the right edge, drawn below every actor.
 p.save();p.translate(1153,438);p.rotate(.09);p.fillStyle='#543b31';p.fillRect(-12,-26,126,112);
 for(let j=0;j<8;j++){p.fillStyle=j%2?'#8a6945':'#9d7951';p.fillRect(0,-22+j*16,106,13);}p.restore();
 // Painted vignette for readable HUD.
 const vig=p.createRadialGradient(640,330,130,640,360,760);
 vig.addColorStop(0,'#061b1f00');vig.addColorStop(1,'#021b2e8a');p.fillStyle=vig;p.fillRect(0,0,W,H);
 return out;
}
const terrain=paintStatic();
function initControls(){
 addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  key.add(e.code);
  if(e.repeat)return;
  if(e.code==='KeyJ'||e.code==='Enter')C.requestAttack(hero);
  if(e.code==='Space')C.dashHero(hero);
  if(e.code==='KeyR')reset();
  if(e.code==='Backquote')showDebug=!showDebug;
 });
 addEventListener('keyup',e=>key.delete(e.code));
 addEventListener('blur',()=>key.clear());
 canvas.addEventListener('pointerdown',e=>{aimAt(e);C.requestAttack(hero);});
 canvas.addEventListener('pointermove',aimAt);
 document.getElementById('reset').onclick=reset;
 document.getElementById('benchmark').onclick=()=>{if(atlas.stats().built<126){ui.bench.textContent='Cache de animações em preparação: '+atlas.stats().built+'/126. Benchmark desabilitado até concluir.';return;}ui.bench.textContent='Medindo throughput de desenho sem vsync...';setTimeout(()=>{const b=benchmark(90);ui.bench.textContent='Desenho em cache: '+b.fpsEstimate.toFixed(1)+' FPS teóricos · p95 '+b.p95.toFixed(2)+' ms · NÃO é FPS total de gameplay';},30);};
}
function aimAt(e){
 const r=canvas.getBoundingClientRect();
 const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
 const dx=x-hero.x,dy=y-hero.y,n=Math.hypot(dx,dy);if(n>3){hero.fx=dx/n;hero.fy=dy/n;}
}
function reset(){hero=C.createHero();enemies=C.createDummies();fx.length=0;tick=0;walk=0;visual={kind:'idle',dir:'S',phase:0,old:null,fade:0};ui.status.textContent='Arena reiniciada';}
function splash(x,y,text,color){fx.push({x,y,text,color,t:0.64,life:0.64});}
function update(dt){
 const x=(key.has('KeyD')||key.has('ArrowRight')?1:0)-(key.has('KeyA')||key.has('ArrowLeft')?1:0);
 const y=(key.has('KeyS')||key.has('ArrowDown')?1:0)-(key.has('KeyW')||key.has('ArrowUp')?1:0);
 const running=key.has('ShiftLeft')||key.has('ShiftRight');
 const walking=C.moveHero(hero,x,y,dt,running);
 lastRun=walking&&running;
 if(walking)walk+=dt*(running?2.65:1.67);
 C.stepAttack(hero,enemies,dt,(e,dmg,stage)=>{splash(e.x,e.y-62,'-'+dmg,stage===2?'#ffcd72':'#fff2d0');if(e.hp<=0)splash(e.x,e.y-88,'KO','#ff8d75');});
 C.stepEnemies(hero,enemies,dt,()=>splash(hero.x,hero.y-135,'-8','#ff7c7c'));
 for(const f of fx)f.t-=dt;fx=fx.filter(f=>f.t>0);
 tick+=dt;
 return walking;
}
function drawDummy(e){
 const c=ctx;
 c.save();c.translate(e.x,e.y);
 c.fillStyle='#103a3866';c.beginPath();c.ellipse(0,1,31,13,0,0,PI*2);c.fill();
 if(e.hp<=0){c.globalAlpha=.45;c.rotate(1.15);}
 c.lineWidth=3;c.strokeStyle='#27242b';c.fillStyle=e.hit>0?'#f6d7bb':'#735c4c';
 c.beginPath();c.moveTo(-24,-14);c.lineTo(-27,-85);c.quadraticCurveTo(0,-99,25,-84);c.lineTo(24,-14);c.closePath();c.fill();c.stroke();
 c.strokeStyle='#2e2425';c.lineWidth=7;c.beginPath();c.moveTo(-16,-50);c.lineTo(14,-27);c.moveTo(14,-50);c.lineTo(-15,-27);c.stroke();
 c.fillStyle='#a98b69';c.beginPath();c.arc(0,-101,21,0,PI*2);c.fill();c.strokeStyle='#513629';c.lineWidth=4;c.stroke();
 c.fillStyle='#b5885c';c.fillRect(-26,-15,18,15);c.fillRect(10,-15,18,15);
 c.restore();
 const bw=65,bx=e.x-bw/2,by=e.y-150;
 ctx.fillStyle='#201a1bb5';ctx.fillRect(bx,by,bw,7);
 ctx.fillStyle=e.hp>e.maxHp*.3?'#b2da82':'#e9796e';ctx.fillRect(bx,by,bw*e.hp/e.maxHp,7);
 if(e.wind>0){ctx.strokeStyle='#ffac6680';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y,69,29,0,0,PI*2);ctx.stroke();}
}
function orientation(){
 if(hero.fx>0.25)return 'SE';
 if(hero.fx<-0.25)return 'SW';
 return 'S'; // No true N/E/W rear painter yet; explicit gap.
}
function drawHero(moving){
 const attack=hero.attack;
 const kind=attack?'attack':moving?(lastRun?'run':'walk'):'idle';
 const dir=orientation();
 let phase;
 if(attack){
   const s=C.STAGES[attack.index];
   const duration=s.wind+s.active+s.recover;
   phase=(attack.index+Math.min(.999,attack.t/duration))/3;
 }else phase=moving?(walk%1):tick*.7%1;
 if(visual.kind!==kind||visual.dir!==dir){
   visual.old={kind:visual.kind,dir:visual.dir,phase:visual.phase};
   visual.kind=kind;visual.dir=dir;visual.fade=1;
 }
 visual.phase=phase;
 ctx.save();
 const hurtAlpha=hero.hurt>0&&Math.floor(hero.hurt*35)%2?.75:1;
 if(visual.fade>0&&visual.old){
   ctx.globalAlpha=hurtAlpha*visual.fade;
   atlas.paint(ctx,hero.x,hero.y,visual.old.kind,visual.old.dir,visual.old.phase,false);
   ctx.globalAlpha=hurtAlpha*(1-visual.fade);
   atlas.paint(ctx,hero.x,hero.y,kind,dir,phase,showDebug);
   visual.fade=Math.max(0,visual.fade-Math.max(.008,Math.min(.05,frameDelta))/.13);
 }else{
   ctx.globalAlpha=hurtAlpha;
   atlas.paint(ctx,hero.x,hero.y,kind,dir,phase,showDebug);
 }
 ctx.restore();
 if(hero.dash>0){
   ctx.strokeStyle='#d1f1d688';ctx.lineWidth=4;
   ctx.beginPath();ctx.ellipse(hero.x,hero.y,44,15,0,0,PI*2);ctx.stroke();
 }
 if(showDebug&&attack){
   ctx.strokeStyle='#fdcc6b';ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(hero.x,hero.y,C.STAGES[attack.index].radius,0,PI*2);ctx.stroke();
 }
}
let lastWalk=false;
function draw(){
 const t0=performance.now();ctx.drawImage(terrain,0,0);
 const actors=[...enemies.map(e=>({y:e.y,draw:()=>drawDummy(e)})),{y:hero.y,draw:()=>drawHero(lastWalk)}].sort((a,b)=>a.y-b.y);
 actors.forEach(a=>a.draw());
 for(const f of fx){ctx.save();ctx.globalAlpha=Math.min(1,f.t/.28);ctx.textAlign='center';ctx.font='800 27px system-ui';ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y-30*(1-f.t/f.life));ctx.restore();}
 if(hero.hp===0){ctx.fillStyle='#09101bb8';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 44px system-ui';ctx.fillText('Herói abatido · pressione R',640,352);}
 metrics.drawMs=performance.now()-t0;metrics.frames++;
}
function benchmark(n=90){
 const times=[];for(let i=0;i<n;i++){const t=performance.now();draw();times.push(performance.now()-t);}
 times.sort((a,b)=>a-b);
 const sum=times.reduce((a,b)=>a+b,0),mean=sum/times.length;
 const out={samples:n,mean,p95:times[Math.ceil(.95*n)-1],p99:times[Math.ceil(.99*n)-1],
 fpsEstimate:mean>0?1000/mean:0,resolution:[W,H],unpaced:true,vsync:false,
 caveat:'Cached draw throughput only, not sustained uncapped complete gameplay or device validation',atlas:atlas.stats()};
 metrics.headlessBenchmark=out;return out;
}
let fpsStart=0,fpsCount=0;
function loop(now){
 if(!last)last=now;if(!fpsStart)fpsStart=now;
 let delta=Math.min((now-last)/1000,.06);last=now;acc+=delta;frameDelta=delta;
 const t=performance.now();let steps=0;
 while(acc>=1/120&&steps<8){lastWalk=update(1/120);acc-=1/120;steps++;}
 metrics.updateMs=performance.now()-t;
 draw();
 fpsCount++;if(now-fpsStart>850){metrics.fps=Math.round(fpsCount*1000/(now-fpsStart));fpsCount=0;fpsStart=now;
  ui.fps.textContent=metrics.fps+' FPS (display)';ui.frame.textContent=metrics.drawMs.toFixed(2)+' ms draw · '+atlas.stats().built+' poses cacheadas';
  ui.hp.textContent=hero.hp+'/100';ui.combo.textContent=hero.attack?hero.attack.index+1+'/3':'pronto';ui.k.textContent=hero.kills;
  const st=atlas.stats();
  if(st.errors.length)ui.status.textContent='Atenção: '+st.errors.length+' erros no cache (ver __GAME2D_QA__)';
  else if(st.built<126)ui.status.textContent='Preparando poses procedurais: '+st.built+'/126. Pode travar durante preparação inicial.';
  else ui.status.textContent='Cache pronto: 126 poses. FPS exibido é limitado pelo monitor.';
 }
 requestAnimationFrame(loop);
}
window.__GAME2D_QA__={getState:()=>({hero:{...hero,attack:hero.attack?{index:hero.attack.index,t:hero.attack.t}:null},enemies:enemies.map(e=>({...e})),metrics:{...metrics},atlas:atlas.stats()}),benchmarkUncapped:benchmark,reset};
initControls();requestAnimationFrame(loop);
})();