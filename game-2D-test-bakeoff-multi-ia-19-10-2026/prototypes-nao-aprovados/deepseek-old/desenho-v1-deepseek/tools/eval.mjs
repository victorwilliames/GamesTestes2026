/* Ferramenta genérica: abre uma página, espera o app, avalia uma expressão JS
 * (que pode devolver Promise) e imprime o resultado.
 *   node tools/eval.mjs <url> "<expressao>" [ms-de-espera]
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const [target, expr, waitMs] = process.argv.slice(2);
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

async function main() {
  const url = /^[a-z]+:\/\//i.test(target) ? target : 'file:///' + path.resolve(ROOT, target).replace(/\\/g, '/');
  const port = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-eval-'));
  const proc = spawn(BROWSER, [
    '--headless=new', `--remote-debugging-port=${port}`, '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--mute-audio', `--window-size=${W},${H}`, '--force-device-scale-factor=1',
    '--allow-file-access-from-files', '--disable-frame-rate-limit', '--disable-gpu-vsync',
    '--enable-gpu-rasterization', '--ignore-gpu-blocklist',
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });
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
        errors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
      }
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (e) => {
      const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 600));
      return r.result.value;
    };
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url });
    for (let i = 0; i < 150; i++) {
      await sleep(120);
      const ready = await evaluate('!!(window.__DS_READY || (window.DS && window.DS.ready) || window.__MICRO_READY)').catch(() => false);
      if (ready) break;
    }
    if (waitMs) await sleep(Number(waitMs));
    const result = await evaluate(expr);
    console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    if (errors.length) console.error('ERROS:', JSON.stringify(errors, null, 2));
  } finally {
    try { ws && ws.close(); } catch { }
    try { proc.kill(); } catch { }
  }
}
main().catch((e) => { console.error('FALHA:', e.message); process.exit(1); });
