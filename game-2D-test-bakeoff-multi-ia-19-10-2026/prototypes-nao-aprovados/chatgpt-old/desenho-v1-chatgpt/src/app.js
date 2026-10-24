import {drawHero,cacheStats} from './hero.js';
const $=id=>document.getElementById(id);
const c=$('hero'),ctx=c.getContext('2d',{alpha:true});
const mode=$('mode'),view=$('view'),scale=$('scale'),pose=$('pose'),orientation=$('orientation');
const root='../../assets/references/ref-2d-hero/';
const refs={hero:'hero-complet-idle/hero-idle-s.png',head:'hero-parts/hero-part-head.png',body:'hero-parts/hero-part-body-tpose-nocape.png',weapons:'hero-parts/hero-part-weapons.png'};
const stage=$('stage'),ref=$('reference'),missing=$('missing');
window.__heroMetrics={renders:0,lastMS:0,errors:[],integratedRig01:false};
window.addEventListener('error',ev=>window.__heroMetrics.errors.push(String(ev.message)));
let referenceOverride=null;
const localPreview='./reference-preview/hero-idle-s-user.png';
let triedFallback=false;
function paint(){
 const start=performance.now(),v=view.value,sc=+scale.value;
 stage.classList.toggle('single',mode.value!=='compare');
 const official=v==='hero'&&orientation.value==='SE'?'hero-complet-idle/hero-idle-se.png':refs[v];
 const path=referenceOverride ?? root+official;
 if(ref.dataset.path!==path && !(triedFallback && ref.dataset.path===localPreview && !referenceOverride && v==='hero' && orientation.value==='S')){triedFallback=false;ref.dataset.path=path;ref.src=path;}
 const dpr=Math.min(window.devicePixelRatio||1,2);const W=960,H=1060;
 c.width=W*dpr;c.height=H*dpr;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
 const frame={hero:{y:0,h:1040,k:.75},head:{y:0,h:615,k:1.08},body:{y:545,h:510,k:.98},weapons:{y:616,h:368,k:.69}}[v];
 const k=frame.k*sc*(pose.value==='tpose'&&v==='hero'?.89:1);
 ctx.save();ctx.translate(W/2,(H-frame.h*k)/2-frame.y*k);ctx.scale(k,k);
 drawHero(ctx,{view:v,pose:pose.value,orientation:orientation.value,pivots:mode.value==='joints'});
 ctx.restore();
 window.__heroMetrics.renders++;window.__heroMetrics.lastMS=Math.round((performance.now()-start)*10)/10;
 $('metrics').textContent=`Render ${window.__heroMetrics.lastMS} ms · ${cacheStats().layerCount} camadas cacheadas · JavaScript inline, compatível com arquivo local.`;
 $('status').textContent=`Pose ${pose.value.toUpperCase()} · direção ${orientation.value} · Canvas 2D genuíno · protótipo artístico em revisão.`;
}
ref.addEventListener('error',()=>{
 if(!referenceOverride&&!triedFallback && view.value==='hero' && orientation.value==='S'){
   triedFallback=true;ref.dataset.path=localPreview;ref.src=localPreview;return;
 }missing.hidden=false;
});
ref.addEventListener('load',()=>missing.hidden=true);
for(const item of [mode,view,scale,pose,orientation])item.addEventListener('change',paint);
$('chooseRef').addEventListener('change',ev=>{const file=ev.target.files?.[0];if(!file)return;if(referenceOverride)URL.revokeObjectURL(referenceOverride);referenceOverride=URL.createObjectURL(file);paint();});
$('resetRef').addEventListener('click',()=>{if(referenceOverride)URL.revokeObjectURL(referenceOverride);referenceOverride=null;paint();});
$('capture').addEventListener('click',()=>{const a=document.createElement('a');a.download=`HERO02-${pose.value}-${orientation.value}-Canvas.png`;a.href=c.toDataURL('image/png');a.click()});
window.paintHero=paint;
window.__verifyProcedural=()=>({canvasWidth:c.width,canvasHeight:c.height,hasReferenceImageInCanvas:false,pose:pose.value,mode:mode.value,orientation:orientation.value,cache:cacheStats(),...window.__heroMetrics});
paint();
$('boot').textContent='Canvas carregado';$('boot').style.color='#8cd9a2';
