// Geometrias autorais locais. SVG path strings são interpretadas nativamente pelo Canvas Path2D.
export function shape(d){return new Path2D(d)}
export function stroke(ctx,d,color='#1b1011',w=3){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(typeof d==='string'?shape(d):d);ctx.restore()}
export function fill(ctx,d,color){ctx.save();ctx.fillStyle=color;ctx.fill(typeof d==='string'?shape(d):d);ctx.restore()}
export function layer(ctx,x,y,angle,painter,scale=1){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);painter();ctx.restore()}
export function seeded(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}}
export function line(ctx,coords,color,w=2){ctx.save();ctx.beginPath();ctx.moveTo(coords[0],coords[1]);for(let i=2;i<coords.length;i+=2)ctx.lineTo(coords[i],coords[i+1]);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke();ctx.restore()}
export const P={ink:'#211414',inkSoft:'#482827',skin:'#f1ad79',skinLight:'#ffdaa8',skinOrange:'#dd7849',skinDark:'#a95838',hair:'#332321',hairMid:'#624136',hairLight:'#a86d50',hairDeep:'#1d1719',red:'#a81317',redLight:'#eb2821',redShadow:'#630a13',leather:'#3a2524',leatherHi:'#77503b',metal:'#342b31',metalLight:'#d5aaa0',metalHot:'#dc512b',gold:'#866044',bone:'#e6d5b9',boneDark:'#967e6c'};
