import {layer,fill,stroke,P} from './geometry.js';
import {material,scratches} from './materials.js';
const hair=(ctx,d,seed,box,base=P.hair,detail=[])=>{
 material(ctx,d,{base,shadow:P.hairDeep,light:'#6e493c',kind:'hair',seed,box,ink:3.9,texture:1.15});
 scratches(ctx,detail,'#b77c5e',1.75);
};
export function paintHead(ctx){
 ctx.save();
 // Massa de cabelo traseira: silhueta recortada, sem círculos elementares.
 hair(ctx,'M -228 210 C -278 202 -300 165 -328 150 L -274 125 Q -296 98 -288 68 Q -210 108 -150 99 L -187 39 Q -93 55 -48 75 Q -40 8 -28 0 Q 79 33 135 93 L 164 25 Q 205 59 210 128 L 253 93 Q 288 120 260 159 L 312 158 Q 291 214 247 228 L 314 256 L 256 277 L 299 326 L 257 334 L 289 380 L 234 370 L 217 457 Q 0 497 -226 460 L -256 402 L -306 416 Q -293 359 -271 341 L -318 333 L -286 286 L -337 256 Z',81,[-343,0,660,482],P.hairDeep);
 // Mechas traseiras inclinadas à esquerda, cada uma com volume próprio.
 hair(ctx,'M -71 211 Q -172 176 -254 91 Q -266 136 -213 200 Q -180 235 -99 249 Z',11,[-267,85,195,162],P.hair,[ 'M -239 119 Q -210 161 -160 183','M -229 140 Q -184 193 -138 209']);
 hair(ctx,'M -114 239 Q -248 187 -331 151 Q -306 218 -238 244 Q -290 246 -333 255 Q -268 303 -152 290 Z',12,[-330,145,220,170],P.hairMid,['M -291 192 Q -224 235 -158 248','M -298 257 Q -244 273 -197 271']);
 hair(ctx,'M -123 247 Q -225 259 -311 331 Q -239 335 -187 313 Q -238 351 -299 404 Q -197 396 -123 324 Z',13,[-305,245,192,163],P.hair,['M -269 320 Q -223 290 -169 279','M -254 389 Q -204 352 -150 330']);
 hair(ctx,'M 126 244 Q 219 197 309 161 Q 299 235 227 266 Q 292 260 309 296 Q 259 335 178 317 Z',14,[116,155,200,171],P.hairMid,['M 286 183 Q 242 223 195 241','M 290 292 Q 250 302 210 298']);
 hair(ctx,'M 147 307 Q 235 299 294 376 L 224 367 L 249 423 Q 184 406 130 347 Z',15,[120,290,175,140],P.hair,['M 261 363 Q 227 337 188 329']);
 // Orelhas pintadas, fora da máscara facial.
 material(ctx,'M -158 366 C -209 349 -220 404 -196 445 Q -171 475 -135 457 L -125 389 Z',{base:'#ea8f60',shadow:P.skinDark,kind:'skin',seed:202,box:[-216,347,91,125],ink:3.6,inner:[['M -181 389 Q -205 401 -184 439 Q -161 447 -154 413 Z','#cc6c4e'],['M -173 397 Q -186 407 -170 430','#f9b27c']]});
 material(ctx,'M 155 364 C 211 349 225 400 204 443 Q 179 477 136 449 L 128 393 Z',{base:'#f6a36e',shadow:P.skinDark,kind:'skin',seed:205,box:[128,345,95,132],ink:3.6,inner:[['M 175 390 Q 206 389 200 417 Q 196 448 168 443 Q 182 421 175 390 Z','#d77851']]});
 // Face pintada, menor que o crânio de cabelo; queixo baixo e achatado.
 material(ctx,'M -141 297 Q -186 338 -177 433 Q -176 488 -117 518 Q -72 542 0 543 Q 92 545 148 506 Q 181 478 178 414 Q 186 337 131 298 Q 45 273 -44 282 Q -112 281 -141 297 Z',{base:'#f7ac71',shadow:'#c56c49',light:'#fbbe86',kind:'skin',box:[-185,280,371,270],seed:218,ink:4.4,texture:1.3,inner:[['M -161 441 Q -139 503 -70 520 Q 7 544 88 517 Q 148 491 167 452 L 164 487 Q 108 555 -9 540 Q -127 542 -166 477 Z','#e78a54'],['M -148 316 Q -103 295 -65 297 L -102 333 Z','#ffd3a0'],['M 53 297 Q 105 286 147 323 Q 105 306 86 318 Z','#ffd19a']]});
 // Volumes nas bochechas, cicatriz e sombra sob a franja.
 fill(ctx,'M -159 438 Q -144 478 -105 478 Q -138 491 -165 467 Z','#e88659');fill(ctx,'M 153 439 Q 148 479 113 490 L 159 464 Z','#e78755');
 stroke(ctx,'M -93 493 L -77 498','#e18b5d',2);stroke(ctx,'M 99 471 L 115 464','#cf7451',1.4);
 // Brancos dos olhos NÃO redondos: olhos incisivos / angulados.
 material(ctx,'M -118 389 Q -95 376 -50 386 Q -44 414 -59 440 Q -94 452 -115 428 Z',{base:'#f3e4d1',kind:'bone',box:[-118,386,77,67],seed:228,ink:3});
 material(ctx,'M 38 387 Q 83 369 126 389 L 112 431 Q 88 454 55 440 Z',{base:'#f6e8d4',kind:'bone',box:[37,386,94,68],seed:231,ink:3});
 // Íris escarlates, pupilas estreitas, reflexos mínimos.
 material(ctx,'M -110 389 Q -87 383 -58 389 Q -57 416 -75 439 Q -97 445 -108 423 Z',{base:'#b81323',shadow:'#5f0610',kind:'cloth',box:[-111,385,61,61],seed:243,ink:2.6,texture:.65});
 material(ctx,'M 52 387 Q 80 375 113 387 Q 117 413 96 437 Q 73 447 55 425 Z',{base:'#b91320',shadow:'#630b10',kind:'cloth',box:[52,378,65,65],seed:246,ink:2.6,texture:.65});
 fill(ctx,'M -89 393 Q -80 389 -79 398 L -80 431 L -91 427 Z','#4e0916');fill(ctx,'M 82 390 Q 94 390 94 401 L 90 432 L 82 432 Z','#4d0a17');
 fill(ctx,'M -106 393 L -101 390 L -101 405 Z','#e6625a');fill(ctx,'M 107 394 L 113 395 L 107 408 Z','#e36b58');
 // Sobrancelhas angulares cortam a base da franja; expressão canônica séria.
 fill(ctx,'M -137 377 Q -115 365 -98 369 L -33 392 L -62 392 L -104 383 L -128 388 Z',P.hairDeep);
 fill(ctx,'M 23 394 Q 68 358 127 361 L 133 369 Q 90 371 46 401 Z',P.hairDeep);
 stroke(ctx,'M -137 378 Q -103 367 -64 382','#8a4638',1.6);stroke(ctx,'M 58 381 Q 105 366 129 367','#875044',1.2);
 // Nariz e boca discretos, sem sorriso genérico.
 fill(ctx,'M -7 441 Q -1 434 4 439 L 6 444 Q -1 452 -7 446 Z','#d87b50');stroke(ctx,'M -19 484 Q 2 479 23 480','#382022',3.5);stroke(ctx,'M -17 486 Q 0 483 19 484','#bd6852',.85);
 // Camadas frontais enormes sobrepostas e NÃO mechas isósceles.
 hair(ctx,'M -21 148 Q -49 158 -111 189 Q -196 232 -245 357 Q -206 337 -182 334 Q -213 376 -250 427 Q -154 379 -111 313 Q -51 253 3 214 Z',31,[-255,141,261,295],P.hair,[ 'M -13 173 Q -100 190 -179 303','M -34 205 Q -96 253 -176 363','M -80 214 Q -132 273 -200 336','M -119 261 Q -166 329 -215 388']);
 hair(ctx,'M -16 117 Q -110 91 -201 46 Q -202 131 -129 194 Q -83 226 -34 231 L 23 177 Z',32,[-205,40,230,198],P.hairMid,['M -182 83 Q -151 140 -83 183','M -170 109 Q -115 174 -55 199']);
 hair(ctx,'M -12 144 Q -74 110 -46 6 Q 46 30 121 112 Q 149 157 134 205 L 76 185 Q 31 140 -12 144 Z',33,[-56,3,198,213],P.hairMid,['M -30 28 Q 2 99 87 150','M -14 21 Q 53 63 112 124','M 5 67 Q 48 111 116 157']);
 hair(ctx,'M 117 173 Q 140 120 176 37 Q 222 91 197 167 Q 181 202 145 227 Z',34,[111,31,117,200],P.hair,['M 177 63 Q 193 116 166 174','M 165 108 Q 162 149 147 192']);
 hair(ctx,'M 150 204 Q 212 137 270 110 Q 265 185 208 229 Q 255 217 299 231 Q 262 277 189 276 Z',35,[147,107,152,172],P.hairMid,['M 258 137 Q 225 202 176 234','M 261 243 Q 218 261 186 262']);
 hair(ctx,'M 68 177 Q 114 171 177 201 Q 215 255 198 344 Q 164 310 145 283 Q 145 329 145 390 Q 110 356 99 330 Q 50 267 68 177 Z',36,[59,175,167,226],P.hair,['M 95 199 Q 157 228 175 314','M 120 208 Q 158 248 163 291','M 121 274 Q 134 315 136 348']);
 hair(ctx,'M -69 188 Q -27 154 53 171 Q 66 219 26 290 Q -17 344 -61 389 L -109 426 Q -91 369 -88 330 Q -119 359 -159 397 Q -142 295 -69 188 Z',37,[-161,161,225,268],P.hairMid,['M 24 189 Q -56 237 -105 346','M 37 215 Q -28 283 -83 377','M 5 226 Q -38 257 -103 366','M -29 209 Q -91 263 -131 349']);
 // Fios agudos sobre os cantos dos olhos.
 fill(ctx,'M -166 341 Q -148 365 -119 403 Q -147 391 -167 380 Z','#26181a');
 fill(ctx,'M 180 329 Q 163 370 133 407 Q 141 360 159 330 Z','#2a1a1c');
 // Pequenos rabiscos de tinta independentes (registrados no espaço da cabeça).
 scratches(ctx,['M -205 298 L -191 284','M 207 292 L 226 268','M -151 405 L -160 426','M -51 123 L -38 145','M 232 200 L 242 186'],'#bc7957',1.4);
 ctx.restore();
}
