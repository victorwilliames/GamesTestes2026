/* Ferramenta de captura/sondagem via CDP (Edge/Chrome headless).
 * Uso:
 *   node tools/shot.mjs "<url-relativa-ou-file>" <saida.png> [largura] [altura] [js-antes-da-captura] [espera-ms]
 * Sem dependências externas: usa o WebSocket global do Node 20+.
 * Captura por CDP (Page.captureScreenshot) e nunca por canvas.toDataURL.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');

const args = process.argv.slice(2);
const target = args[0];
const outFile = args[1];
const W = Number(args[2] || 1280);
const H = Number(args[3] || 720);
const pre = args[4] || '';
const waitMs = Number(args[5] || 900);

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
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const p = srv.address().port;
      srv.close(() => resolve(p));
    });
  });
}
async function waitForCdp(port) {
  for (let i = 0; i < 150; i++) {
    await sleep(120);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find((x) => x.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* ainda subindo */ }
  }
  throw new Error('CDP não respondeu na porta ' + port);
}

async function main() {
  if (!BROWSER) throw new Error('Navegador não encontrado (defina BROWSER_PATH).');
  const url = /^[a-z]+:\/\//i.test(target) ? target : 'file:///' + path.resolve(ROOT, target).replace(/\\/g, '/');
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });

  const port = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-shot-'));
  const proc = spawn(BROWSER, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--mute-audio',
    `--window-size=${W},${H}`,
    '--force-device-scale-factor=1',
    '--allow-file-access-from-files',
    '--disable-frame-rate-limit', '--disable-gpu-vsync',
    '--enable-gpu-rasterization', '--ignore-gpu-blocklist',
    `--user-data-dir=${profile}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let ws;
  const out = { url, browser: BROWSER, shots: [] };
  try {
    const wsUrl = await waitForCdp(port);
    ws = new WebSocket(wsUrl);
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
      } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        errors.push(m.params.args.map((a) => a.value || a.description || '').join(' '));
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
    await send('Page.navigate', { url });

    // espera o app sinalizar prontidão (até ~48 s: sob contenção o boot + warmup passa de 14 s)
    let ready = false;
    for (let i = 0; i < 320; i++) {
      await sleep(150);
      try {
        ready = await evaluate('!!(window.__DS_READY || (window.DS && window.DS.ready))');
        if (ready) break;
      } catch { /* página ainda carregando */ }
    }
    if (pre) await evaluate(pre);
    await sleep(waitMs);

    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const buf = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(path.resolve(outFile), buf);
    out.shots.push({ file: outFile, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16) });
    out.ready = ready;
    out.errors = errors;
    out.pageInfo = await evaluate('JSON.stringify(window.__DS_INFO || {})').catch(() => '{}');
    if (!ready) {
      out.pageState = await evaluate(`JSON.stringify({
        href: location.href, rs: document.readyState,
        ds: typeof window.DS, flag: !!window.__DS_READY,
        body: document.body ? document.body.innerHTML.length : -1
      })`).catch(() => '{}');
    }
    console.log(JSON.stringify({
      ok: true, out: outFile, ready, errors,
      info: JSON.parse(out.pageInfo || '{}'),
      ...(out.pageState ? { pageState: JSON.parse(out.pageState) } : {}),
    }, null, 2));
  } finally {
    try { ws && ws.close(); } catch { }
    try { proc.kill(); } catch { }
  }
}

main().catch((e) => { console.error('FALHA:', e.message); process.exit(1); });
