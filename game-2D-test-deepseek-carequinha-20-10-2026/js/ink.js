'use strict';
Object.assign(Pilot, (()=>{
  const project=Pilot.project, sub=Pilot.sub, mul=Pilot.mul, norm=Pilot.norm, cross=Pilot.cross;
  const INK='#211b22';
  const PAL={skin:{base:'#efad6c',shadow:'#a75e46',light:'#ffcf8e'},red:{base:'#bf3039',shadow:'#6d2533',light:'#ed5a47'},cloth:{base:'#353b45',shadow:'#20252f',light:'#59606a'},steel:{base:'#9caeb4',shadow:'#4d6574',light:'#e8eadc'},gold:{base:'#c59b54',shadow:'#785c39',light:'#f3d494'},bone:{base:'#e8d9ad',shadow:'#a09076',light:'#fff2c9'}};
  function path(points,soft=false){const p=new Path2D();if(!points.length)return p;
    if(soft){let a=points.at(-1),b=points[0];p.moveTo((a[0]+b[0])/2,(a[1]+b[1])/2);points.forEach((v,i)=>{const n=points[(i+1)%points.length];p.quadraticCurveTo(...v,(v[0]+n[0])/2,(v[1]+n[1])/2);});}
    else {p.moveTo(...points[0]);points.slice(1).forEach(v=>p.lineTo(...v));}p.closePath();return p;}
  function celFill(c,p,t,offset=3,width=1.2){c.save();c.fillStyle=t.shadow;c.fill(p);c.clip(p);c.translate(-offset*.65,-offset);c.fillStyle=t.base;c.fill(p);c.restore();if(width){c.strokeStyle=INK;c.lineWidth=width;c.lineJoin='round';c.stroke(p);}}
  function flat(c,pts,color,width=0,soft=false){const p=path(pts,soft);c.fillStyle=color;c.fill(p);if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke(p);}return p;}
  function line(c,pts,color=INK,width=.8){if(pts.length<2)return;c.beginPath();c.moveTo(...pts[0]);pts.slice(1).forEach(p=>c.lineTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
  function ellipse(c,x,y,rx,ry,t,rot=0,width=1){const p=new Path2D();p.ellipse(x,y,rx,ry,rot,0,Math.PI*2);celFill(c,p,t,2,width);}
  function hull(points){const a=points.map(p=>p.slice(0,2)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const l=[],u=[];for(const p of a){while(l.length>1&&cr(l.at(-2),l.at(-1),p)<=0)l.pop();l.push(p);}for(const p of a.reverse()){while(u.length>1&&cr(u.at(-2),u.at(-1),p)<=0)u.pop();u.push(p);}return l.slice(0,-1).concat(u.slice(0,-1));}
  const TAU=Math.PI*2;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  // Cápsula afunilada entre dois círculos (membros). Devolve um Path2D.
  function capsulePath(ax,ay,ra,bx,by,rb){const p=new Path2D();
    const dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);
    if(d<=Math.abs(ra-rb)+.01){const big=ra>=rb,cx=big?ax:bx,cy=big?ay:by,r=Math.max(ra,rb);
      p.moveTo(cx+r,cy);p.arc(cx,cy,r,0,TAU);return p;}
    const ang=Math.atan2(dy,dx),off=Math.acos(clamp((ra-rb)/d,-1,1));
    p.moveTo(ax+ra*Math.cos(ang+off),ay+ra*Math.sin(ang+off));
    p.arc(ax,ay,ra,ang+off,ang+TAU-off);
    p.arc(bx,by,rb,ang-off,ang+off);
    p.closePath();return p;}
  // Traço afunilado: polígono em volta de uma polilinha com largura variável.
  function taperPath(pts,widthFn){const p=new Path2D();const n=pts.length;if(n<2)return p;
    const L=[],R=[];for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];
      let dx=b[0]-a[0],dy=b[1]-a[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
      const w=widthFn(i/(n-1))/2;L.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);R.push([pts[i][0]+dy*w,pts[i][1]-dx*w]);}
    p.moveTo(L[0][0],L[0][1]);for(let i=1;i<n;i++)p.lineTo(L[i][0],L[i][1]);
    for(let i=n-1;i>=0;i--)p.lineTo(R[i][0],R[i][1]);p.closePath();return p;}
  // Contorno de tinta sobre um Path2D já preenchido (reuso p/ peças).
  function inkPath(c,p,width=1.1,color=INK){if(!width||!p)return;c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke(p);}
  function alpha(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;}

  // ---- volumes 3D -> silhueta 2D projetada ------------------------------
  // Elipsoide alinhado ao corpo (direita, frente, cima) e girado pelo yaw.
  function ellipsoidPts(c,r,yaw=0,nLat=7,nLon=12){const out=[],sy=Math.sin(yaw),cy=Math.cos(yaw);
    for(let i=0;i<=nLat;i++){const la=-Math.PI/2+Math.PI*i/nLat,cl=Math.cos(la),sl=Math.sin(la);
      for(let j=0;j<nLon;j++){const lo=TAU*j/nLon;
        const lr=r[0]*cl*Math.sin(lo),lf=r[1]*cl*Math.cos(lo),lz=r[2]*sl;
        out.push([c[0]+lr*sy+lf*cy,c[1]-lr*cy+lf*sy,c[2]+lz]);}}
    return out;}
  // Tubo afunilado entre dois pontos com barriga muscular opcional.
  function tubePts(a,b,r0,r1,bulge=0,nSeg=5,nRing=9){
    let ax=sub(b,a);ax=mul(ax,1/(Math.hypot(...ax)||1));
    const ref=Math.abs(ax[2])<0.9?[0,0,1]:[1,0,0];
    const u=norm(cross(ax,ref)),v=norm(cross(ax,u));
    const out=[];
    for(let i=0;i<=nSeg;i++){const t=i/nSeg;
      const cx=a[0]+(b[0]-a[0])*t,cy=a[1]+(b[1]-a[1])*t,cz=a[2]+(b[2]-a[2])*t;
      const rr=(r0+(r1-r0)*t)*(1+bulge*Math.sin(Math.PI*t));
      for(let j=0;j<nRing;j++){const th=TAU*j/nRing,ct=Math.cos(th)*rr,st=Math.sin(th)*rr;
        out.push([cx+u[0]*ct+v[0]*st,cy+u[1]*ct+v[1]*st,cz+u[2]*ct+v[2]*st]);}}
    return out;}
  // "Loft" de seções elípticas horizontais: torso, saia, faixa.
  function loftPts(levels,yaw,pos=[0,0,0]){const out=[],sy=Math.sin(yaw),cy=Math.cos(yaw);
    for(const L of levels){const n=L.n||16;
      for(let j=0;j<n;j++){const th=TAU*j/n;
        const lr=(L.cx||0)+L.rw*Math.sin(th),lf=(L.cf||0)+L.rf*Math.cos(th);
        out.push([pos[0]+lr*sy+lf*cy,pos[1]-lr*cy+lf*sy,pos[2]+L.z]);}}
    return out;}
  function hull3(pts){return path(hull(pts.map(p=>{const s=project(p);return[s[0],s[1]];})));}
  function solid(c,pts,t,offset=3,width=1){const p=hull3(pts);celFill(c,p,t,offset,width);return p;}
  // Tubo ao longo de uma polilinha (membro dobrado) com raio por ponto.
  function polyTubePts(pts,radii,nRing=10,steps=4){const lerp=Pilot.lerp;
    const samples=[];
    for(let i=0;i<pts.length-1;i++){
      const last=i===pts.length-2;
      for(let k=0;k<(last?steps+1:steps);k++){
        const t=k/steps;
        samples.push({
          p:[lerp(pts[i][0],pts[i+1][0],t),lerp(pts[i][1],pts[i+1][1],t),lerp(pts[i][2],pts[i+1][2],t)],
          r:lerp(radii[i],radii[i+1],t),
        });
      }
    }
    const out=[];
    for(let j=0;j<samples.length;j++){
      const a=samples[Math.max(0,j-1)].p,b=samples[Math.min(samples.length-1,j+1)].p;
      let ax=sub(b,a);ax=mul(ax,1/(Math.hypot(...ax)||1));
      const ref=Math.abs(ax[2])<0.9?[0,0,1]:[1,0,0];
      const u=norm(cross(ax,ref)),v=norm(cross(ax,u));
      const c=samples[j].p,r=samples[j].r;
      for(let q=0;q<nRing;q++){const th=TAU*q/nRing,ct=Math.cos(th)*r,st=Math.sin(th)*r;
        out.push([c[0]+u[0]*ct+v[0]*st,c[1]+u[1]*ct+v[1]*st,c[2]+u[2]*ct+v[2]*st]);}
    }
    return out;}

  return {INK,PAL,path,celFill,flat,line,ellipse,hull,TAU,clamp,capsulePath,taperPath,inkPath,alpha,capsule:capsulePath,taper:taperPath,ellipsoidPts,tubePts,polyTubePts,loftPts,hull3,solid};
})());
