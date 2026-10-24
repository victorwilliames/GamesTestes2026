/* Will Games: startup console and optional CRT overlay. */
(() => {
"use strict";
const SESSION_KEY="vw_games_console_boot_v5", CRT_KEY="vw_games_console_crt_v5";
let intro, powering=false, bootTimers=[], audioContext=null;
const get=id=>document.getElementById(id);
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={
  get:(key,local=false)=>{try{return (local?localStorage:sessionStorage).getItem(key)}catch{return null}},
  set:(key,v,local=false)=>{try{(local?localStorage:sessionStorage).setItem(key,v)}catch{}}
};
function soundAllowed(){try{return typeof soundEnabled==="undefined"||!!soundEnabled}catch{return true}}
function tone(freq,when,len,gain=.025,shape="sine"){
  if(!audioContext)return;
  const osc=audioContext.createOscillator(),g=audioContext.createGain();
  osc.type=shape;osc.frequency.setValueAtTime(freq,when);osc.frequency.exponentialRampToValueAtTime(Math.max(freq*.9,55),when+len);
  g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(gain,when+.03);g.gain.exponentialRampToValueAtTime(.0001,when+len);
  osc.connect(g);g.connect(audioContext.destination);osc.start(when);osc.stop(when+len+.03);
  osc.onended=()=>{try{osc.disconnect();g.disconnect()}catch{}};
}
function audio(type){
  if(!soundAllowed())return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    audioContext ||= new AC();if(audioContext.state==="suspended")audioContext.resume().catch(()=>{});
    const t=audioContext.currentTime+.02;
    if(type==="boot"){tone(94,t,.23,.031,"sawtooth");tone(115,t+.23,.65,.018);tone(164.8,t+.56,.85,.024,"triangle");tone(220,t+.92,1,.024);tone(329.6,t+1.15,.68,.011)}
    else tone(550,t,.09,.009);
  }catch{}
}
function clearTimers(){bootTimers.forEach(clearTimeout);bootTimers=[]}
function enableGameAudio(){try{if(typeof consoleSoundUnlocked!=="undefined")consoleSoundUnlocked=true;if(typeof startConsoleSoundscape==="function"&&typeof currentIndex!=="undefined")startConsoleSoundscape(currentIndex)}catch{}}
function showIntro(){
  clearTimers();powering=false;intro.hidden=false;intro.dataset.state="off";
  try{if(typeof stopConsoleSoundscape==="function")stopConsoleSoundscape()}catch{}
  document.body.classList.add("retro-boot-visible");
  get("retro-power-btn").disabled=false;get("retro-start-btn").disabled=false;
  get("retro-start-btn").textContent="⏻  Ligar console";
  get("retro-boot-note").textContent="Aperte o botão do console para começar.";
  get("retro-power-btn").focus({preventScroll:true});
}
function finishIntro(){
  store.set(SESSION_KEY,"1");intro.dataset.state="leaving";
  document.body.classList.remove("retro-boot-visible");enableGameAudio();
  bootTimers.push(setTimeout(()=>{intro.hidden=true;intro.dataset.state="off";get("retro-fullscreen")?.focus({preventScroll:true})},reduced?50:850));
}
function powerOn(){
  if(powering||!intro||intro.hidden)return;
  powering=true;audio("boot");intro.dataset.state="booting";
  get("retro-power-btn").disabled=true;get("retro-start-btn").disabled=true;
  get("retro-start-btn").textContent="Inicializando…";
  get("retro-boot-note").textContent="Iniciando núcleo de jogos";
  bootTimers.push(setTimeout(()=>{intro.dataset.state="ready";get("retro-boot-note").textContent="Sistemas prontos. Bem-vindo!"},reduced?90:1350));
  bootTimers.push(setTimeout(finishIntro,reduced?450:2720));
}
function skipIntro(){
  if(!intro||intro.hidden)return;
  clearTimers();powering=true;store.set(SESSION_KEY,"1");
  intro.hidden=true;intro.dataset.state="off";document.body.classList.remove("retro-boot-visible");enableGameAudio();
}
function updateFullscreen(){
  const btn=get("retro-fullscreen");if(!btn)return;
  const on=!!(document.fullscreenElement||document.webkitFullscreenElement);
  btn.setAttribute("aria-pressed",String(on));btn.setAttribute("aria-label",on?"Sair da tela cheia":"Entrar em tela cheia");
  btn.title=on?"Sair da tela cheia":"Tela cheia";
  btn.innerHTML=on?
    '<span class="retro-tool-icon" aria-hidden="true">⤡</span><span class="retro-tool-label">Sair</span>':
    '<span class="retro-tool-icon" aria-hidden="true">⛶</span><span class="retro-tool-label">Tela cheia</span>';
}
async function toggleFullscreen(){
  try{
    if(document.fullscreenElement||document.webkitFullscreenElement){
      if(document.exitFullscreen)await document.exitFullscreen();
      else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
    }else{
      if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
      else if(document.documentElement.webkitRequestFullscreen)document.documentElement.webkitRequestFullscreen();
      else throw Error("not supported");
    }
  }catch{
    const b=get("retro-fullscreen");if(b)b.title="Seu navegador bloqueou tela cheia. Experimente F11.";
  }
  updateFullscreen();
}
function toggleCrt(){
  const enabled=document.body.classList.toggle("retro-crt-on"),btn=get("retro-crt");
  btn.setAttribute("aria-pressed",String(enabled));
  btn.setAttribute("aria-label",enabled?"Desligar efeito de TV de tubo":"Ativar efeito de TV de tubo");
  btn.innerHTML='<span class="retro-tool-icon" aria-hidden="true">▤</span><span class="retro-tool-label">CRT '+(enabled?"ON":"OFF")+"</span>";
  store.set(CRT_KEY,enabled?"1":"0",true);audio("click");
}
function setupToolbar(){
  const right=document.querySelector(".ps5-top-right");if(!right)return;
  const tool=document.createElement("div");tool.className="retro-tools";tool.setAttribute("role","group");tool.setAttribute("aria-label","Controles de tela");
  const full=document.createElement("button"),crt=document.createElement("button"),reset=document.createElement("button");
  full.type=crt.type=reset.type="button";
  full.id="retro-fullscreen";crt.id="retro-crt";reset.id="retro-reboot";
  full.className=crt.className=reset.className="retro-tool";
  reset.title="Reiniciar experiência";reset.setAttribute("aria-label","Desligar e ligar console novamente");
  reset.innerHTML='<span class="retro-tool-icon" aria-hidden="true">⏻</span><span class="retro-tool-label">Reiniciar</span>';
  tool.append(full,crt,reset);right.prepend(tool);
  full.addEventListener("click",toggleFullscreen);
  crt.addEventListener("click",toggleCrt);
  reset.addEventListener("click",()=>{audio("click");showIntro()});
  document.addEventListener("fullscreenchange",updateFullscreen);
  document.addEventListener("webkitfullscreenchange",updateFullscreen);
  const active=store.get(CRT_KEY,true)!=="0";
  document.body.classList.toggle("retro-crt-on",active);
  crt.setAttribute("aria-pressed",String(active));
  crt.setAttribute("aria-label",active?"Desligar efeito de TV de tubo":"Ativar efeito de TV de tubo");
  crt.innerHTML='<span class="retro-tool-icon" aria-hidden="true">▤</span><span class="retro-tool-label">CRT '+(active?"ON":"OFF")+"</span>";
  updateFullscreen();
  const overlay=document.createElement("div");overlay.id="retro-crt-filter";overlay.setAttribute("aria-hidden","true");document.body.append(overlay);
}
function setupIntro(){
  intro=document.createElement("div");intro.id="retro-intro";intro.dataset.state="off";
  intro.setAttribute("role","region");intro.setAttribute("aria-label","Ligar console de jogos");
  intro.innerHTML=[
    '<div class="retro-ambient-top"><span class="light"></span> WILL GAMES <span aria-hidden="true">/</span> SYSTEM 2026</div>',
    '<button class="retro-intro-close" id="retro-skip-btn" type="button">Pular introdução ↗</button>',
    '<div class="retro-stage">',
      '<div class="retro-tv">',
        '<div class="retro-tv-screen-shell"><div class="retro-tv-screen">',
          '<div class="retro-tv-powerline"></div><div class="retro-crt-static"></div>',
          '<div class="retro-tv-boot-content"><div class="retro-logo">W</div><div class="retro-boot-brand">WILL GAMES</div><div class="retro-boot-sub">CARREGANDO BIBLIOTECA • 2026</div></div>',
        '</div></div>',
        '<div class="retro-tv-controls" aria-hidden="true"><div class="retro-tv-knob"></div><div class="retro-tv-knob"></div><div class="retro-tv-grill"></div></div>',
      '</div>',
      '<div class="retro-tv-stand" aria-hidden="true"></div>',
      '<div class="retro-console-area">',
        '<div class="retro-console-cable" aria-hidden="true"></div>',
        '<div class="retro-machine">',
          '<div class="retro-machine-brand">W/PLAY <span class="retro-machine-small">DIGITAL GAME SYSTEM</span></div>',
          '<div class="retro-machine-slot"></div><div class="retro-machine-led" aria-hidden="true"></div>',
          '<button type="button" id="retro-power-btn" class="retro-machine-power" aria-label="Ligar console" title="Ligar console">',
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v10"/><path d="M6.2 5.5a9 9 0 1 0 11.6 0"/></svg>',
          '</button>',
        '</div>',
      '</div>',
      '<div class="retro-boot-footer">',
        '<div class="retro-boot-kicker">UMA EXPERIÊNCIA INTERATIVA</div>',
        '<h1 class="retro-boot-title">Bem-vindo à minha biblioteca<span style="color:var(--boot-electric)">.</span></h1>',
        '<p class="retro-boot-note" id="retro-boot-note">Aperte o botão do console para começar.</p>',
        '<button type="button" class="retro-main-power" id="retro-start-btn">⏻ &nbsp;Ligar console</button>',
      '</div>',
    '</div>',
    '<div class="retro-smallprint">FEITO COM HTML, CSS E JAVASCRIPT • TESTES DE GAMEDEV 2026</div>'
  ].join("");
  document.body.append(intro);
  get("retro-power-btn").addEventListener("click",powerOn);
  get("retro-start-btn").addEventListener("click",powerOn);
  get("retro-skip-btn").addEventListener("click",skipIntro);
  if(store.get(SESSION_KEY)==="1"){intro.hidden=true}
  else{document.body.classList.add("retro-boot-visible");get("retro-power-btn").focus({preventScroll:true})}
}
function init(){
  setupToolbar();setupIntro();
  document.addEventListener("keydown",e=>{
    if(intro&&!intro.hidden){
      if(e.key==="Escape"){e.preventDefault();e.stopPropagation();skipIntro()}
      else if((e.key==="Enter"||e.key===" ")&&document.activeElement===get("retro-power-btn")){e.preventDefault();e.stopPropagation();powerOn()}
      else if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();}
      e.stopPropagation();
      return;
    }
    if(e.key.toLowerCase()==="f"&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!e.repeat&&
      !e.target.closest("input,textarea,[contenteditable]")){e.preventDefault();toggleFullscreen();}
  },true);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
