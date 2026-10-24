/* @game2d Fase 1 - deterministic, dependency-free combat contracts. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.Game2DCombat=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const STAGES=[
    {wind:0.105,active:0.135,recover:0.155,radius:102,damage:18,arc:0.12},
    {wind:0.09,active:0.14,recover:0.17,radius:111,damage:23,arc:-0.10},
    {wind:0.145,active:0.18,recover:0.23,radius:136,damage:37,arc:0.0}
  ];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function createHero(){return {x:640,y:382,fx:0,fy:1,hp:100,maxHp:100,combo:0,attack:null,buffered:false,dash:0,invuln:0,hurt:0,kills:0};}
  function createDummies(){return [
    {id:1,x:439,y:354,homeX:439,homeY:354,hp:100,maxHp:100,r:29,hit:0,ko:0,wind:0,attackCooldown:0},
    {id:2,x:864,y:383,homeX:864,homeY:383,hp:100,maxHp:100,r:29,hit:0,ko:0,wind:0,attackCooldown:0},
    {id:3,x:660,y:515,homeX:660,homeY:515,hp:140,maxHp:140,r:33,hit:0,ko:0,wind:0,attackCooldown:0}
  ];}
  function requestAttack(h){
    if(h.hp<=0)return false;
    if(h.attack){h.buffered=true;return false;}
    const index=h.combo%3;
    h.attack={index,t:0,hitIds:new Set()};
    h.combo=index+1;h.buffered=false;return true;
  }
  function activeWindow(stage,t){return t>=stage.wind&&t<stage.wind+stage.active;}
  function canHit(h,e,stage){
    if(e.hp<=0)return false;
    const dx=e.x-h.x,dy=e.y-h.y;
    const d=Math.hypot(dx,dy);
    if(d>stage.radius+e.r||d<0.01)return false;
    // Arc widens as an attack approaches stage 3; dot threshold keeps hits directional.
    const dot=(dx*h.fx+dy*h.fy)/d;
    return dot>=stage.arc;
  }
  function stepAttack(h,enemies,dt,onHit){
    if(!h.attack)return;
    const a=h.attack,s=STAGES[a.index];
    const previous=a.t;a.t+=dt;
    // Fixed-step sweep tests the full active interval; contact cannot be skipped.
    const active=a.t>=s.wind&&previous<s.wind+s.active;
    if(active)for(const e of enemies){
      if(!a.hitIds.has(e.id)&&canHit(h,e,s)){
        a.hitIds.add(e.id);
        e.hp=Math.max(0,e.hp-s.damage);
        e.hit=0.21;
        const ux=(e.x-h.x)/(Math.hypot(e.x-h.x,e.y-h.y)||1);
        const uy=(e.y-h.y)/(Math.hypot(e.x-h.x,e.y-h.y)||1);
        e.x+=ux*12;e.y+=uy*8;
        if(e.hp===0){e.ko=2.5;h.kills++;}
        if(onHit)onHit(e,s.damage,a.index);
      }
    }
    if(a.t>=s.wind+s.active+s.recover){
      const buffered=h.buffered;
      h.attack=null;h.buffered=false;
      if(buffered)requestAttack(h);
      else h.combo=0;
    }
  }
  function stepEnemies(h,enemies,dt,onStrike){
    for(const e of enemies){
      e.hit=Math.max(0,e.hit-dt);
      if(e.hp<=0){e.ko-=dt;if(e.ko<=0){e.hp=e.maxHp;e.x=e.homeX;e.y=e.homeY;e.wind=0;e.attackCooldown=1;}continue;}
      e.attackCooldown=Math.max(0,e.attackCooldown-dt);
      const dx=h.x-e.x,dy=h.y-e.y,d=Math.hypot(dx,dy);
      if(e.wind>0){
        e.wind-=dt;
        if(e.wind<=0){
          e.attackCooldown=1.6;
          if(d<82&&h.invuln<=0&&h.hp>0){
            h.hp=Math.max(0,h.hp-8);
            h.hurt=0.25;h.invuln=0.65;
            if(onStrike)onStrike(e);
          }
        }
      }else if(e.attackCooldown===0&&d<85&&h.hp>0)e.wind=0.65;
      // Stationary sentries are deliberate: combat arena must remain readable.
    }
    h.invuln=Math.max(0,h.invuln-dt);
    h.hurt=Math.max(0,h.hurt-dt);
    h.dash=Math.max(0,h.dash-dt);
  }
  function insideArena(x,y){
    const dx=(x-640)/452,dy=(y-376)/216;
    return dx*dx+dy*dy<=1;
  }
  function moveHero(h,dx,dy,dt,running=false){
    const n=Math.hypot(dx,dy);
    if(n<=0||h.hp<=0)return false;
    const nx=dx/n,ny=dy/n;
    h.fx=nx;h.fy=ny;
    const speed=h.dash>0?650:(h.attack?86:(running?235:145));
    const tx=h.x+nx*speed*dt,ty=h.y+ny*speed*dt;
    if(insideArena(tx,h.y))h.x=tx;
    if(insideArena(h.x,ty))h.y=ty;
    return true;
  }
  function dashHero(h){if(h.hp<=0||h.dash>0)return false;h.dash=0.17;h.invuln=Math.max(h.invuln,0.21);return true;}
  return {STAGES,clamp,createHero,createDummies,requestAttack,activeWindow,canHit,stepAttack,stepEnemies,insideArena,moveHero,dashHero};
});