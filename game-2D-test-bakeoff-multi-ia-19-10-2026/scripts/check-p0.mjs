import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const html=readFileSync(new URL('../prototypes/procedural-p0/index.html',import.meta.url),'utf8');
const inline=html.match(/<script>([\s\S]*?)<\/script>/i);
if(!inline) throw new Error('Missing inline procedural script');
new Script(inline[1],{filename:'procedural-p0-inline.js'});
const required=['getContext("2d")','requestAnimationFrame','Math.atan2','P(x,y,z)','WASD'];
for(const s of required) if(!html.includes(s))throw new Error('Missing requirement: '+s);
if(/getContext\s*\(\s*['"]webgl/i.test(html))throw new Error('WebGL is not allowed in P0');
console.log('P0.1 source syntax and Canvas 2D invariants: PASS');
