import {paintHead} from './head.js';
import {paintCape,paintTorso,paintLegs,paintArm,paintCloth,paintScarf,ANCHORS} from './body.js';
import {paintWeapon} from './weapons.js';
import {shoulderHand,localBodyPose,armAngle} from './rig-adapter.js';
const painters={cape:paintCape,legs:paintLegs,torso:paintTorso,cloth:paintCloth,scarf:paintScarf,head:paintHead};
const stack=['cape','legs','torso','cloth','arms','scarf','head','weapons'];
const CACHE_BOUNDS={cape:[78,519,365,302],legs:[-195,767,399,285],torso:[-165,550,332,226],cloth:[-155,691,315,197],scarf:[-174,490,351,141],head:[-350,-14,701,564]};
const cache=new Map();
function drawCached(ctx,key,painter){
 let entry=cache.get(key);
 if(!entry){const [x,y,w,h]=CACHE_BOUNDS[key],buffer=document.createElement('canvas');buffer.width=w;buffer.height=h;
 const bc=buffer.getContext('2d');bc.translate(-x,-y);painter(bc);entry={buffer,x,y};cache.set(key,entry);}
 ctx.drawImage(entry.buffer,entry.x,entry.y);
}
export const cacheStats=()=>({layerCount:cache.size,keys:[...cache.keys()]});
function drawRegion(ctx,key,pose){
 if(key==='legs' && !['neutral','idle','tpose'].includes(pose)){paintLegs(ctx,pose);return}
 if(CACHE_BOUNDS[key])drawCached(ctx,key,painters[key]);else painters[key](ctx);
}
export function drawHero(ctx,{view='hero',pose='neutral',orientation='S',pivots=false}={}){
 const b=localBodyPose(pose);
 ctx.save();
 // A second authored 3/4 portrait treatment, not mirror-flipped; still needs directional fidelity QA.
 if(orientation==='SE')ctx.transform(.93,.025,-.075,1,23,0);
 for(const name of stack){
  if(view==='head'&&!['head','scarf'].includes(name))continue;
  if(view==='body'&&['head','weapons'].includes(name))continue;
  if(view==='weapons'&&name!=='weapons')continue;
  if(name==='arms')for(const side of [-1,1])paintArm(ctx,side,pose);
  else if(name==='weapons')for(const side of [-1,1])paintWeapon(ctx,side,pose,orientation);
  else if(name==='head'){ctx.save();ctx.translate(...b.headShift);drawRegion(ctx,name,pose);ctx.restore()}
  else drawRegion(ctx,name,pose);
 }
 if(pivots)paintPivots(ctx,view,pose);
 ctx.restore();
}
function paintPivots(ctx,view,pose){
 const points={...ANCHORS};
 for(const side of [-1,1]){
  const prefix=side<0?'left':'right';points[prefix+'Wrist']=shoulderHand(side,pose);points[prefix+'Weapon']=points[prefix+'Wrist'];
  const a=armAngle(pose,side),u=side*(143+78*Math.cos(a)-100*Math.sin(a)),v=594+78*Math.sin(a)+100*Math.cos(a);
  points[prefix+'Elbow']=[u,v];
 }
 ctx.save();ctx.globalAlpha=.85;ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.strokeStyle='#61dbda';
 for(const [a,b] of [['neck','hip'],['leftShoulder','leftElbow'],['leftElbow','leftWrist'],['rightShoulder','rightElbow'],['rightElbow','rightWrist'],['leftHip','leftKnee'],['leftKnee','leftAnkle'],['rightHip','rightKnee'],['rightKnee','rightAnkle']]){
  const A=points[a],B=points[b];ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...B);ctx.stroke();
 }
 ctx.setLineDash([]);ctx.font='11px monospace';
 for(const [key,p] of Object.entries(points)){if(view==='head'&&!['neck','scarf'].includes(key))continue;
 ctx.fillStyle='#123234';ctx.beginPath();ctx.arc(...p,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7cfff1';ctx.beginPath();ctx.arc(...p,3,0,Math.PI*2);ctx.fill();ctx.fillText(key,p[0]+8,p[1]-8);}
 ctx.restore();
}
export {ANCHORS};
