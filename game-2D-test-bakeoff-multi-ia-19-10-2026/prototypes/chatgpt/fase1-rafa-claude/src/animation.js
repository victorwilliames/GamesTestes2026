/* @game2d: articulated poses + procedural animation atlas.
 * Original approved HeroRenderer is used to DRAW every cached pose.
 * Only game-scale caches are reused on normal gameplay frames.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.Game2DAnimation=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const PI=Math.PI;
const COUNTS=Object.freeze({idle:6,walk:12,run:12,attack:12});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const pt=(x,y)=>({x,y});
function twoBone(hip,ankle,a,b,side){
  const dx=ankle.x-hip.x,dy=ankle.y-hip.y,raw=Math.hypot(dx,dy)||1;
  const d=clamp(raw,1,Math.max(a+b-0.5,1)),ux=dx/raw,uy=dy/raw;
  const proj=clamp((a*a-b*b+d*d)/(2*d),-a,a);
  const height=Math.sqrt(Math.max(0,a*a-proj*proj));
  const normal=side==='L'?1:-1;
  return pt(hip.x+ux*proj-uy*height*normal,hip.y+uy*proj+ux*height*normal);
}
function makeGaitPose(rig,action,orientation,phase,stage=0){
  const dir=['S','SE','SW'].includes(orientation)?orientation:'S';
  const t=(((phase%1)+1)%1);
  const base=rig.computePose({action:'idle',orientation:dir,time:0});
  const moving=action==='walk'||action==='run';
  const stride=action==='run'?1.0:0.68;
  const rad=2*PI*t;
  if(moving){
    const bob=Math.sin(rad*2)*5*stride;
    const drift=Math.sin(rad)*9*stride;
    const torsoY=base.pelvis.y;
    base.pelvis.y=torsoY+bob;
    base.chest.y+=bob*.68;base.chest.x+=drift*.55;
    base.neckBase.y+=bob*.5;base.neckBase.x+=drift*.7;
    base.head.y+=bob*.38;base.head.x+=drift*.75;
    base.head.rotation=Math.sin(rad)*.025*stride;
    base.capeFlutter=.35+Math.sin(rad-.55)*(.55*stride);
    base.legSpread=.25+.18*stride;
    const slopeX=dir==='SE'?.64:dir==='SW'?-.64:0.04;
    const slopeY=dir==='S'?0.38:0.23;
    const swing=Math.sin(rad);
    for(const [side,suffix,shift] of [['L',-1,0],['R',1,.5]]){
      const u=(t+shift)%1,stance=u<.62;
      // Locked-support phase moves the planted foot relative to translating torso.
      const travel=stance?1-2*u/.62:-1+2*smooth((u-.62)/.38);
      const lift=stance?0:Math.pow(Math.sin((u-.62)/.38*PI),1.2)*105*stride;
      const reach=(action==='run'?150:137)*travel;
      const hip=pt(base.pelvis.x+suffix*101,base.pelvis.y+51);
      const foot=pt(base.pelvis.x+suffix*166+reach*slopeX,
        1226+reach*slopeY-lift);
      const ankle=pt(foot.x+suffix*18,foot.y-78);
      const knee=twoBone(hip,ankle,175,158,side);
      const leg=base['leg'+side];
      leg.hip=hip;leg.knee=knee;leg.ankle=ankle;leg.footSole=foot;
      leg.footPitch=stance?-.025:(.13*Math.sin((u-.62)/.38*PI))*stride;
      const other=side==='L'?swing:-swing;
      const shoulder=pt(base.chest.x+suffix*140,base.chest.y-46);
      const elbow=pt(shoulder.x+suffix*(76+other*13*stride),
                     shoulder.y+61+other*33*stride);
      const wrist=pt(elbow.x+suffix*(70-other*15*stride),
                     elbow.y+63+other*52*stride);
      const grip=pt(wrist.x+suffix*21,wrist.y+35+other*17*stride);
      const arm=base['arm'+side];
      arm.shoulder=shoulder;arm.elbow=elbow;arm.wrist=wrist;arm.handGrip=grip;
      const blade=base['weapon'+side];
      blade.x=grip.x;blade.y=grip.y;
      blade.rotation=suffix*(.42+other*.23*stride);
      blade.chainSway=other*.23*stride;
    }
    return base;
  }
  if(action==='attack'){
    const local=t;
    const rise=smooth(local/.22);
    const active=Math.sin(PI*clamp((local-.12)/.66,0,1));
    const follow=smooth((local-.64)/.36);
    const opposite=stage===1;
    const spin=stage===2;
    const lead=opposite?'R':'L',trail=opposite?'L':'R';
    base.pelvis.x+=Math.sin(PI*local)*18;
    base.chest.x+=Math.sin(PI*local)*27;
    base.chest.y-=active*15;
    base.neckBase.x+=active*13;
    base.head.x+=active*15;base.head.rotation=active*.06;
    base.capeFlutter=.2+active*.95;
    base.legSpread=.44+active*.19;
    for(const side of ['L','R']){
      const sign=side==='L'?-1:1;
      const arm=base['arm'+side];
      const leading=side===lead;
      const range=leading?1:.35;
      const localDrive=(leading?1:-.52)*active;
      arm.elbow=pt(arm.shoulder.x+sign*(85+35*range*rise),arm.shoulder.y+46-52*range*active);
      arm.wrist=pt(arm.elbow.x+sign*(55+65*range*active),arm.elbow.y+57-90*range*localDrive);
      arm.handGrip=pt(arm.wrist.x+sign*(25+15*range*active),arm.wrist.y+37-35*range*active);
      const weapon=base['weapon'+side];
      weapon.x=arm.handGrip.x;weapon.y=arm.handGrip.y;
      weapon.rotation=sign*(.42+active*(spin?1.15:leading?1.0:-.32))+follow*.08;
      weapon.chainSway=active*.75;
    }
    return base;
  }
  // Idle is a full pose cycle: quiet breathing, head follow-through, arm weight and scarf.
  const breath=Math.sin(rad),secondary=Math.sin(rad*2-.3);
  base.pelvis.y+=breath*1.5;
  base.chest.y+=breath*4;base.neckBase.y+=breath*5;
  base.head.y+=breath*5.5;base.head.rotation=secondary*.012;
  base.capeFlutter=.10+secondary*.14;
  for(const side of ['L','R']){
    const arm=base['arm'+side],w=base['weapon'+side];
    const sign=side==='L'?-1:1;
    arm.elbow.y+=breath*2;arm.wrist.y+=breath*3;
    arm.handGrip.y+=breath*3;
    w.x=arm.handGrip.x;w.y=arm.handGrip.y;w.rotation+=secondary*.012*sign;
  }
  return base;
}
class Atlas{
  constructor(renderer,rig,options={}){
    this.renderer=renderer;this.rig=rig;
    this.frames=new Map();this.queue=[];this.pending=new Set();this.failures=[];
    this.buildMs=0;this.buildCount=0;this.isRendering=false;
    this.width=340;this.height=290;this.anchorX=170;this.anchorY=252;
    this.scale=.167;this.maxFrames=132;this.retryCount=0;
    this.enabled=true;
    this.enqueue('idle','S',0,true);
    // Preload the active gameplay direction first, then the oblique directions.
    for(const dir of ['S','SE','SW']){
      for(const kind of ['walk','run','idle','attack']){
        for(let i=0;i<COUNTS[kind];i++)this.enqueue(kind,dir,i,false);
      }
    }
    this.start();
  }
  key(kind,dir,index){return dir+':'+kind+':'+index;}
  enqueue(kind,dir,index,priority=false){
    const k=this.key(kind,dir,index);
    if(this.frames.has(k))return;
    if(this.pending.has(k)){
      if(priority){const i=this.queue.findIndex(job=>job.k===k);
        if(i>0)this.queue.unshift(...this.queue.splice(i,1));}
      return;
    }
    this.pending.add(k);
    const job={kind,dir,index,k};
    if(priority)this.queue.unshift(job);else this.queue.push(job);
  }
  start(){
    if(this.isRendering)return;
    this.isRendering=true;
    const work=()=>{
      if(!this.queue.length){this.isRendering=false;return;}
      const job=this.queue.shift();this.pending.delete(job.k);
      const start=performance.now();
      try{
        const canvas=document.createElement('canvas');
        canvas.width=this.width;canvas.height=this.height;
        const c=canvas.getContext('2d',{alpha:true,desynchronized:true});
        const n=COUNTS[job.kind],cycle=(job.index+.5)/n;
        const stage=job.kind==='attack'?Math.floor(cycle*3):0;
        const phase=job.kind==='attack'?(cycle*3-stage):cycle;
        const pose=makeGaitPose(this.rig,job.kind,job.dir,phase,stage);
        c.translate(this.anchorX,this.anchorY);
        c.scale(this.scale,this.scale);c.translate(-627,-1226);
        this.renderer.render(c,pose,{drawGroundShadow:false,showPivots:false});
        this.frames.set(job.k,canvas);
        this.buildCount++;
        if(this.frames.size>this.maxFrames){
          // Atlas budget: do not evict the default idle pose during cache churn.
          for(const key of this.frames.keys()){if(key!=='S:idle:0'&&key!==job.k){this.frames.delete(key);break;}}
        }
      }catch(err){this.failures.push(job.k+': '+String(err));}
      this.buildMs+=performance.now()-start;
      // Yield between expensive painter calls instead of blocking EVERY gameplay frame.
      if(this.queue.length)setTimeout(work,16);else this.isRendering=false;
    };
    setTimeout(work,0);
  }
  pick(kind,dir,index){
    const exact=this.frames.get(this.key(kind,dir,index));
    if(exact)return exact;
    this.enqueue(kind,dir,index,true);
    if(!this.isRendering)this.start();
    // Nearest cached frame of current action before falling back to idle.
    const n=COUNTS[kind];
    for(let d=1;d<n;d++){
      const a=this.frames.get(this.key(kind,dir,(index+d)%n));
      const b=this.frames.get(this.key(kind,dir,(index-d+n)%n));
      if(a||b)return a||b;
    }
    for(const fallback of [this.key('idle',dir,0),'S:idle:0'])
      if(this.frames.has(fallback))return this.frames.get(fallback);
    return null;
  }
  paint(ctx,x,y,kind,dir,phase,debug=false){
    const n=COUNTS[kind]||8;
    const cursor=((phase%1)+1)%1*n;
    const i=Math.floor(cursor)%n,frac=cursor-i;
    const a=this.pick(kind,dir,i);
    const b=this.pick(kind,dir,(i+1)%n);
    if(!a){ctx.fillStyle='#d7ae86';ctx.beginPath();ctx.arc(x,y-65,25,0,2*PI);ctx.fill();return;}
    const ox=x-this.anchorX,oy=y-this.anchorY;
    ctx.save();
    // Two cached frames blended = smooth silhouette motion without repainting 1000s of paths.
    const parentAlpha=ctx.globalAlpha;
    ctx.globalAlpha=parentAlpha*(1-frac*.55);ctx.drawImage(a,ox,oy);
    if(b&&b!==a&&frac>.02){ctx.globalAlpha=parentAlpha*frac*.55;ctx.drawImage(b,ox,oy);}
    ctx.restore();
    if(debug){
      ctx.strokeStyle='#f7dc72';ctx.lineWidth=1;
      ctx.strokeRect(ox,oy,this.width,this.height);
      ctx.fillStyle='#fff';ctx.font='11px monospace';
      ctx.fillText(kind+'/'+dir+' '+i+'/'+n,x-50,y+24);
    }
  }
  stats(){return {built:this.buildCount,queued:this.queue.length,
    errors:[...this.failures],totalMs:+this.buildMs.toFixed(1),
    cachedMB:+(this.frames.size*this.width*this.height*4/1048576).toFixed(1)};}
}
return {COUNTS,makeGaitPose,twoBone,Atlas};
});