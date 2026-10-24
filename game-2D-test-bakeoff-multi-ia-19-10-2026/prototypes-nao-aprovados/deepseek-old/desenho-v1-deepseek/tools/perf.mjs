/* Medidor de performance — 1280x720, buffer nativo, sem cap de vsync.
 *
 * Uso:
 *   node tools/perf.mjs [url] [segundos] [--headed] [--enemies=N]
 *
 * Lê window.__DS_INFO (média, p95, p99 e draw time medidos DENTRO do jogo,
 * em tempo real) várias vezes e devolve a mediana. O relatório sai em JSON,
 * pronto para colar nos entregáveis de AVALIACAO-IA.
 *
 * --headed roda com GPU real (janela visível). Sem isso, usa o headless.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const argv = process.argv.slice(2);
const target = argv.find((a) => !a.startsWith('--')) || 'index.html';
const secs = Number(argv.filter((a) => !a.startsWith('--') && /^[0-9.]+$/.test(a))[0] || 8);
const HEADED = argv.includes('--headed');
const ENEMIES = (argv.find((a) => a.startsWith('--enemies=')) || '--enemies=4').split('=')[1];
const W = 1280, H = 720;

function candidates() {
  return [
    process.env.BROWSER_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright', 'chromium-1228', 'chrome-win64', 'chrome.exe'),
  ].filter(Boolean);
}
const BROWSER = candidates().find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); });
  });
}
async function waitForCdp(port) {
  for (let i = 0; i < 150; i++) {
    await sleep(120);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find((x) => x.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* subindo */ }
  }
  throw new Error('CDP não respondeu');
}
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

async function main() {
  if (!BROWSER) throw new Error('Navegador não encontrado (defina BROWSER_PATH).');
  const url = /^[a-z]+:\/\//i.test(target) ? target : 'file:///' + path.resolve(ROOT, target).replace(/\\/g, '/');
  const port = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-perf-'));
  const flags = [
    `--remote-debugging-port=${port}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
    `--window-size=${W},${H}`, '--force-device-scale-factor=1',
    '--allow-file-access-from-files', '--disable-frame-rate-limit', '--disable-gpu-vsync',
    '--enable-gpu-rasterization', '--ignore-gpu-blocklist',
    `--user-data-dir=${profile}`,
    'about:blank',
  ];
  if (!HEADED) flags.unshift('--headless=new');
  const proc = spawn(BROWSER, flags, { stdio: 'ignore' });
  let ws;
  try {
    ws = new WebSocket(await waitForCdp(port));
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let nextId = 1;
    const pending = new Map();
    const errors = [];
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const { resolve, reject } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
      } else if (m.method === 'Runtime.exceptionThrown') {
        errors.push(m.params.exceptionDetails.text);
      }
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
      return r.result.value;
    };
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    const sep = url.includes('?') ? '&' : '?';
    await send('Page.navigate', { url: url + sep + 'spawn=' + ENEMIES });
    let ready = false;
    for (let i = 0; i < 150; i++) {
      await sleep(120);
      try { ready = await evaluate('!!window.__DS_READY'); if (ready) break; } catch { /* carregando */ }
    }
    // aquece 2s e depois coleta amostras a cada 1s
    await sleep(2000);
    const samples = [];
    for (let i = 0; i < Math.max(6, Math.round(secs)); i++) {
      await sleep(1000);
      const info = JSON.parse(await evaluate('JSON.stringify(window.__DS_INFO||{})') || '{}');
      if (info.fps != null) samples.push(info);
    }
    const gpu = await evaluate('(()=>{try{const c=document.createElement("canvas");const g=c.getContext("webgl2")||c.getContext("webgl");if(!g)return "sem webgl";const d=g.getExtension("WEBGL_debug_renderer_info");return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):"webgl ok";}catch(e){return "erro";}})()');
    // intervalo real entre rAF (mede o cap de vsync do ambiente)
    const raf = await evaluate(`new Promise(res=>{const t=[];let n=0,last=performance.now();
      const f=()=>{const now=performance.now();t.push(now-last);last=now;if(++n<120)requestAnimationFrame(f);else{
      t.sort((a,b)=>a-b);res(JSON.stringify({n:t.length,med:+t[Math.floor(t.length/2)].toFixed(3),min:+t[0].toFixed(3),max:+t[t.length-1].toFixed(3)}));}};requestAnimationFrame(f);})`);
    const out = {
      url, headless: !HEADED, ready, gpu, browser: BROWSER,
      res: `${W}x${H}`, enemies: Number(ENEMIES), seconds: secs,
      rafGapMs: JSON.parse(raf || '{}'),
      fps: { avg: median(samples.map((s) => s.fps)), p95: median(samples.map((s) => s.p95)), p99: median(samples.map((s) => s.p99)) },
      drawMs: median(samples.map((s) => s.draw)),
      frames: samples.length ? samples[samples.length - 1].frames : 0,
      errors,
      raw: samples,
    };
    fs.mkdirSync(path.join(ROOT, 'screenshots'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'screenshots', 'perf-' + (HEADED ? 'gpu' : 'headless') + '.json'), JSON.stringify(out, null, 2));
    console.log(JSON.stringify({ ...out, raw: undefined }, null, 2));
  } finally {
    try { ws && ws.close(); } catch { }
    try { proc.kill(); } catch { }
  }
}
main().catch((e) => { console.error('FALHA:', e.message); process.exit(1); });
