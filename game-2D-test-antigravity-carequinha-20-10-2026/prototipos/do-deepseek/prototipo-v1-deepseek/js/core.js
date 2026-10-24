'use strict';
globalThis.Pilot = (() => {
  const DEG=Math.PI/180, pitch=34*DEG, q=Math.SQRT1_2;
  const add=(a,b)=>a.map((v,i)=>v+b[i]);
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const mul=(a,s)=>a.map(v=>v*s);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>mul(a,1/(Math.hypot(...a)||1));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const mix=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const project=([x,y,z])=>[(x-y)*q,(x+y)*q*Math.sin(pitch)-z*Math.cos(pitch),(x+y)*q*Math.cos(pitch)+z*Math.sin(pitch)];
  // Local: right, forward, up. Facing angle measured in world XY.
  const localPoint=([r,f,z],yaw)=>[r*Math.sin(yaw)+f*Math.cos(yaw),-r*Math.cos(yaw)+f*Math.sin(yaw),z];
  const unproject=([x,y])=>[(x+y/Math.sin(pitch))*q,(-x+y/Math.sin(pitch))*q,0];
  const angleLerp=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
  function rng(seed=42){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  return {DEG,pitch,add,sub,mul,dot,cross,norm,lerp,mix,clamp,smooth,project,localPoint,unproject,angleLerp,rng,toCamera:[q*Math.cos(pitch),q*Math.cos(pitch),Math.sin(pitch)]};
})();
