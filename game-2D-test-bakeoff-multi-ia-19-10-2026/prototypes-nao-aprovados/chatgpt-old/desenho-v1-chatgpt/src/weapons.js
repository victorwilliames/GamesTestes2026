import {P,stroke,fill} from './geometry.js';
import {material,chains,scratches} from './materials.js';
import {armAngle,ARM_FIST,ARM_SHOULDER} from './rig-adapter.js';
// Weapon local coordinate space: 0,0 at center of palm. Positive X points OUTWARD.
// Blade is deliberately one broad crescent with hooked upper/lower tips, not separate floating spikes.
function blade(ctx,side){
 const outer='M 86 -26 Q 115 -40 136 -59 L 155 -86 Q 159 -49 178 -41 Q 194 -45 205 -81 Q 211 -56 223 -48 Q 245 -77 256 -165 Q 308 -125 318 -62 Q 333 32 284 111 Q 242 171 178 185 Q 212 138 211 89 Q 204 51 188 59 L 177 91 Q 163 82 156 60 Q 145 43 132 47 L 118 62 Q 109 32 87 23 Z';
 material(ctx,outer,{base:'#32262b',shadow:'#140e13',kind:'steel',box:[86,-170,244,350],seed:1280+(side+1),ink:5.1,texture:2.15,inner:[
  ['M 92 -20 Q 127 -30 155 -57 Q 173 -24 179 -16 Q 223 -40 254 -145 Q 246 -79 276 -25 Q 270 28 239 63 Q 182 51 146 37 L 102 15 Z','#61504e'],
  ['M 259 -159 Q 309 -107 308 -42 Q 306 47 258 112 Q 280 54 282 -24 Q 282 -94 259 -159 Z','#d2b6ad'],
  ['M 259 -144 Q 307 -91 310 -25 Q 313 77 196 172 Q 233 116 252 67 Q 293 -33 277 -98 Z','#a51b1b'],
  ['M 282 -116 Q 336 -32 310 68 Q 273 156 179 181 Q 221 132 257 62 Q 308 -24 282 -116 Z','#ee481e'],
  ['M 291 -72 Q 334 6 290 90 Q 261 139 187 180 Q 245 120 275 46 Q 309 -20 291 -72 Z','#ff9d1b'],
  ['M 142 40 Q 189 19 253 41 Q 248 98 201 154 Q 223 82 183 70 Z','#b21419'],
  ['M 157 39 Q 189 35 214 81 L 194 140 Q 206 87 157 39 Z','#d92620'],
  ['M 140 0 Q 190 -20 235 -3 Q 265 24 256 72 Q 233 56 204 45 Q 172 24 132 27 Z','#64302c'],
  ['M 164 16 L 194 22 L 225 59 L 203 53 Z','#9c1e1b'],
  ['M 115 -8 Q 152 -35 201 -18 Q 154 0 121 6 Z','#a98f8a']
 ]});
 // Inner serrations: teeth are cut INTO the hooked edge rather than disconnected triangles.
 fill(ctx,'M 145 -66 Q 141 -37 155 -32 Q 170 -28 187 -52 Q 177 -20 156 -22 Q 141 -31 145 -66 Z','#211920');
 fill(ctx,'M 205 -77 Q 200 -41 215 -38 Q 231 -39 247 -75 Q 246 -38 222 -24 Q 200 -24 205 -77 Z','#211920');
 stroke(ctx,'M 140 -52 Q 149 -18 168 -26 M 198 -55 Q 194 -21 215 -28 M 221 -7 Q 244 -31 251 -74','#d5a299',2.8);
 // Molten lower rim and handmade scabbed steel, all clipped to the silhouette.
 ctx.save();ctx.clip(new Path2D(outer));
 for(let i=0;i<6;i++){
   const yy=5+i*20,xx=170+i*7;
   fill(ctx,`M ${xx-11} ${yy} L ${xx+5} ${yy-10} L ${xx+18} ${yy+7} L ${xx+4} ${yy+17} Z`,i%2?'#b01619':'#631216');
   stroke(ctx,`M ${xx-6} ${yy+5} L ${xx+6} ${yy-6} L ${xx+13} ${yy+4}`,i%2?'#ff5421':'#f3a13f',i%2?2:2.6);
 }
 // Molten pitting and irregular distressed metal patches across the broad inner body.
 for(let i=0;i<44;i++){
  const a=i*2.39996323,rr=Math.sqrt((i+1)/44);const x=219+rr*Math.cos(a)*96,y=19+rr*Math.sin(a)*110;
  const length=4+(i*7)%23;stroke(ctx,`M ${x.toFixed(1)} ${y.toFixed(1)} l ${length.toFixed(1)} ${(-length*.6).toFixed(1)}`,i%3===0?'#fc6827':i%3===1?'#270e18':'#b53024',1.7+(i%4)*.45);
 }
 // Corroded metal relief and painterly directional scratches on top of the existing steel texture.
 scratches(ctx,['M 264 -129 Q 285 -91 281 -55','M 262 -92 L 271 -48','M 251 -35 L 272 1','M 267 23 Q 254 84 213 124','M 236 45 L 224 80','M 185 21 L 213 31','M 172 -12 L 197 -3','M 169 82 L 190 98','M 186 112 L 200 119'], '#ffc3a3',2.1);
 scratches(ctx,['M 253 -111 Q 261 -65 252 -40','M 254 10 L 238 61','M 244 76 L 217 117','M 200 57 L 214 85','M 150 -7 L 179 3'], '#1a1117',3.0);
 ctx.restore();
 // Noticeable hard edge highlights; intentionally not animated flames.
 stroke(ctx,'M 255 -163 Q 289 -132 308 -86','#ffe3c4',3);
 stroke(ctx,'M 311 -44 Q 330 58 231 154','#f5a65b',4);
 stroke(ctx,'M 231 154 Q 204 177 179 184','#ffb34c',3);
}
function grip(ctx,side){
 // Grip attached to palm with visible pommel, wrapped leather and guard.
 material(ctx,'M -21 -13 Q -17 -20 -6 -16 L 98 -19 L 105 -7 L 100 16 L -10 16 Q -25 11 -21 -13 Z',{base:'#302227',shadow:'#0c0b10',kind:'leather',box:[-26,-23,134,44],seed:1151+side,texture:1.1,ink:4});
 for(let i=0;i<9;i++){
   const x=-10+i*11;
   fill(ctx,`M ${x} -16 L ${x+6} -16 L ${x+17} 16 L ${x+10} 17 Z`,i%2?'#79503d':'#442c2a');
   stroke(ctx,`M ${x} -16 L ${x+15} 16`,'#171013',1.35);
 }
 material(ctx,'M 89 -31 Q 104 -34 110 -26 L 114 29 Q 102 35 88 28 L 91 6 Z',{base:'#754934',shadow:'#24171b',kind:'steel',box:[83,-35,39,72],seed:1256+side,ink:3.5,texture:1.1});
 stroke(ctx,'M 94 -25 Q 103 0 97 25','#e2ac70',2);
}
function handCover(ctx){
 // The thumb grips OVER the handle, preventing the "weapon floating at the hand" defect.
 material(ctx,'M -25 -6 Q -23 -22 -9 -24 Q 6 -26 16 -12 L 13 -1 Q 0 1 -4 12 Q -14 20 -24 10 Z',{base:'#e99c66',shadow:'#b46340',kind:'skin',box:[-28,-25,48,47],seed:1356,ink:3.5,texture:1});
 stroke(ctx,'M -20 -9 Q -10 -13 -3 -7 M -22 0 Q -13 -4 -6 2','#ae6241',1.4);
}
// One painter for ALL static/rig poses. Transform derived from EXACT shoulder/arm transform.
export function paintWeapon(ctx,side,pose='neutral',orientation='S'){
 const angle=armAngle(pose,side);
 ctx.save();ctx.translate(side*ARM_SHOULDER[0],ARM_SHOULDER[1]);ctx.scale(side,1);ctx.rotate(angle);
 ctx.translate(...ARM_FIST);
 ctx.save();ctx.rotate(pose==='attack' && side===1?-.22:pose==='attack'?.06:0);
 // Chains are bolted into pommel and droop towards hand/wrist; no floating detached links.
 chains(ctx,2,10,-57,3,1);
 grip(ctx,side);blade(ctx,side);handCover(ctx);
 ctx.restore();ctx.restore();
}
