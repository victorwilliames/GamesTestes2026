import {shape,seeded,stroke,P} from './geometry.js';
// Pintura em camadas, material mate e ranhuras pseudoaleatórias fixas no espaço local.
// O mesmo seed gera SEMPRE as mesmas marcas, mesmo se a peça for rotacionada futuramente.
const defs={hair:{n:950,colors:['#aa684d','#d59670','#0d0a11','#684036','#d0a07a'],length:[3,20],width:[.6,2.35],direction:-.53},skin:{n:390,colors:['#ffe0aa','#b76747','#d98150','#ffebbb'],length:[2,9],width:[.45,1.6],direction:-.3},cloth:{n:640,colors:['#ec3a2e','#390b11','#fc6645','#9d171d'],length:[3,18],width:[.6,2.2],direction:.17},leather:{n:480,colors:['#926849','#1b1416','#bb7e57','#503024'],length:[2,16],width:[.5,2.1],direction:-.32},steel:{n:510,colors:['#ead3b4','#130f14','#b35b49','#656168'],length:[2,18],width:[.4,2],direction:-.85},bone:{n:160,colors:['#f4e4c9','#a48e7b','#fff0d6'],length:[2,8],width:[.5,1.4],direction:.1}};
export function material(ctx,d,{base,shadow,light,kind='leather',box=[-100,-100,200,200],seed=1,ink=3.5,texture=1,inner=[]}={}){
 const path=shape(d); ctx.save();ctx.fillStyle=base;ctx.fill(path);
 ctx.save();ctx.clip(path);
 // Two large organic colour masses per shape are more convincing than a flat fill.
 // Offset internal ink/paint contours are clipped locally, so they stay on the surface under rig transforms.
 if(kind==='hair'||kind==='leather'||kind==='steel'){
   ctx.save();ctx.translate(kind==='hair'?-9:6,kind==='hair'?13:7);
   ctx.strokeStyle=kind==='hair'?'#160c12':kind==='steel'?'#130d13':'#170e13';
   ctx.globalAlpha=kind==='hair'?.72:.38;ctx.lineWidth=kind==='hair'?32:17;ctx.stroke(path);
   ctx.restore();
   ctx.save();ctx.translate(kind==='hair'?8:-4,kind==='hair'?-8:-4);
   ctx.strokeStyle=kind==='hair'?'#e1a07d':kind==='steel'?'#e7baa6':'#d99c71';
   ctx.globalAlpha=kind==='hair'?.15:.15;ctx.lineWidth=kind==='hair'?15:9;ctx.stroke(path);
   ctx.restore();
 }
 for(const it of inner){ctx.fillStyle=it[1];ctx.fill(shape(it[0]))}
 const def=defs[kind],rand=seeded(seed),[x,y,w,h]=box;
 // Manchas pintadas em baixa opacidade, sem ruído de pixel dependente do frame.
 if(shadow){ctx.globalAlpha=.11;ctx.fillStyle=shadow;for(let i=0;i<def.n/7;i++){const px=x+rand()*w,py=y+rand()*h,r=5+rand()*20;ctx.beginPath();ctx.ellipse(px,py,r,r*(.25+rand()*.4),rand()*3,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
 for(let i=0;i<Math.round(def.n*texture);i++){
   const px=x+rand()*w,py=y+rand()*h,lg=def.length[0]+rand()*(def.length[1]-def.length[0]);
   const a=def.direction+(kind==='hair'?((seed%9)-4)*.155:0)+(rand()-.5)*1.55;ctx.strokeStyle=def.colors[Math.floor(rand()*def.colors.length)];
   ctx.globalAlpha=.10+rand()*.46;ctx.lineWidth=def.width[0]+rand()*(def.width[1]-def.width[0]);
   ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+lg*Math.cos(a)*.35+(rand()-.5)*3,py+lg*Math.sin(a)*.35,px+lg*Math.cos(a),py+lg*Math.sin(a));ctx.stroke();
 }
 // Fine painted hatching that follows the material flow, not a live random raster texture.
 if(kind==='hair'||kind==='skin'||kind==='steel'){
   const phase=((seed*17)%91)/91;
   for(let i=0;i<(kind==='hair'?75:40);i++){
    const xx=x+rand()*w,yy=y+rand()*h,lg=5+rand()*(kind==='hair'?46:23);
    const ang=def.direction+(kind==='hair'?((seed%9)-4)*.155:0)+(rand()-.5)*.5;
    ctx.globalAlpha=(kind==='hair'?.06:.04)+rand()*(kind==='hair'?.26:.17);
    ctx.lineWidth=.7+rand()*2.9;ctx.strokeStyle=kind==='hair'?(i%4===0?'#d39a72':'#211217'):kind==='skin'?'#ed884f':i%3?'#f3a87b':'#170e13';
    ctx.beginPath();ctx.moveTo(xx,yy);
    ctx.bezierCurveTo(xx+Math.cos(ang)*lg*.34,yy+Math.sin(ang)*lg*.33-3,xx+Math.cos(ang)*lg*.66,yy+Math.sin(ang)*lg*.66+2,xx+Math.cos(ang)*lg,yy+Math.sin(ang)*lg);
    ctx.stroke();
   }
 }
 ctx.globalAlpha=1;ctx.restore();
 if(light)stroke(ctx,d,light,.65);
 stroke(ctx,d,P.ink,ink);
 // Aresta intencionalmente instável, com trechos de tinta e reforços sobrepostos.
 ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle='#0f0c12';ctx.lineWidth=ink*1.7;ctx.setLineDash([7,16,3,28]);ctx.lineDashOffset=seed%37;ctx.stroke(path);ctx.restore();
 ctx.save();ctx.globalAlpha=.48;ctx.strokeStyle='#9e624b';ctx.lineWidth=Math.max(.6,ink*.28);ctx.setLineDash([13,9,3,28]);ctx.lineDashOffset=(seed*7)%23;ctx.stroke(path);ctx.restore();
 ctx.restore();
}
export function scratches(ctx,arr,color='#d29a72',width=1.6){for(const d of arr)stroke(ctx,d,color,width)}
export function chains(ctx,x1,y1,x2,y2,dir=1){
 // Corrente de elos encaixados ao longo de arco, não pontos desconectados.
 const sag=dir*87;
 const bez=t=>{const u=1-t;return [u*u*x1+2*u*t*((x1+x2)/2)+t*t*x2,u*u*y1+2*u*t*(Math.max(y1,y2)+sag)+t*t*y2]};
 const positions=[];let last=bez(0);positions.push(last);
 for(let i=1;i<=350;i++){const p=bez(i/350);if(Math.hypot(p[0]-last[0],p[1]-last[1])>=7.6){positions.push(p);last=p}}
 ctx.save();for(let i=0;i<positions.length;i++){
 const [x,y]=positions[i],before=positions[Math.max(0,i-1)],after=positions[Math.min(positions.length-1,i+1)];
 const a=Math.atan2(after[1]-before[1],after[0]-before[0]);
 ctx.save();ctx.translate(x,y);ctx.rotate(a+((i%2)? .33:-.33));ctx.lineWidth=4.7;ctx.strokeStyle='#1e1515';ctx.beginPath();ctx.ellipse(0,0,7.8,5.1,0,0,Math.PI*2);ctx.stroke();ctx.lineWidth=2.2;ctx.strokeStyle=(i%2)?'#af7553':'#75472f';ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#dbad7c';ctx.beginPath();ctx.ellipse(-.8,-.6,6.1,3.2,0,Math.PI*1.06,Math.PI*1.90);ctx.stroke();ctx.restore();
 }ctx.restore();
}
