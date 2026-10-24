// ============================================================================
// capture.mjs — Servidor estático autocontido + Captura de Screenshots Reais
// e Benchmark Oficial >= 200 FPS (1280x720) via Edge Headless CDP.
// Uso: node prototypes/antigravity/desenho-v1-antigravity/capture.mjs
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import './build-bundle.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(scriptDir, 'screenshots');
const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const SHOTS = [
  { name: '01-compare-head.png', query: '?mode=compare&pose=hero-part-head&scale=560', width: 1280, height: 720 },
  { name: '02-compare-body-nocape.png', query: '?mode=compare&pose=hero-part-body-tpose-nocape&scale=560', width: 1280, height: 720 },
  { name: '03-compare-body.png', query: '?mode=compare&pose=hero-part-body&scale=560', width: 1280, height: 720 },
  { name: '04-compare-weapons.png', query: '?mode=compare&pose=hero-part-weapons&scale=560', width: 1280, height: 720 },
  { name: '05-compare-hero-idle-s.png', query: '?mode=compare&pose=hero-idle-s&scale=560', width: 1280, height: 720 },
  { name: '06-isolated-multiscale.png', query: '?mode=isolated&pose=hero-idle-s&scale=multi', width: 1280, height: 720 },
  { name: '07-articulations-pivots.png', query: '?mode=pivots&pose=hero-idle-s&scale=560', width: 1280, height: 720 },
  { name: '08-rig01-integration-showcase.png', query: '?mode=rig-showcase&scale=560', width: 1280, height: 720 },
  { name: '09-compare-orientation-se.png', query: '?mode=compare&pose=rig-idle-se&scale=560', width: 1280, height: 720 },
  { name: '10-compare-orientation-sw.png', query: '?mode=compare&pose=rig-idle-sw&scale=560', width: 1280, height: 720 },
  { name: '11-combo-4stages-showcase.png', query: '?mode=isolated&pose=rig-combo4-s&scale=560', width: 1280, height: 720 },
  { name: '12-arena-island-idle.png', query: '?mode=arena', width: 1280, height: 720 },
  { name: '13-arena-combat-combo.png', query: '?mode=arena&simframes=22', width: 1280, height: 720 },
  { name: '14-arena-hitboxes-bench.png', query: '?mode=arena&simframes=38&hitboxes=1&bench=1', width: 1280, height: 720 },
  { name: '15-studio-rig-palito.png', path: '/studio-rig.html', query: '', width: 1440, height: 900 },
  { name: '16-arena-medieval-shipwreck.png', query: '?mode=arena&theme=medieval_shipwreck', width: 1280, height: 720 }
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8'
};

// Servidor 100% autocontido na pasta do protótipo (Zero dependência externa!)
function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      const filePath = path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath);
      if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitForCdp(port) {
  for (let i = 0; i < 100; i++) {
    await sleep(100);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find(x => x.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
  }
  throw new Error('CDP timeout');
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const { server, port: httpPort } = await startStaticServer(scriptDir);
  const cdpPort = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-desenho-v1-'));

  const proc = spawn(EDGE, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    '--no-first-run',
    '--hide-scrollbars',
    '--disable-frame-rate-limit',
    '--disable-gpu-vsync',
    '--force-device-scale-factor=1',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let ws;
  const runtimeErrors = [];
  const consoleErrors = [];

  try {
    const wsUrl = await waitForCdp(cdpPort);
    ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

    let nextId = 1;
    const pending = new Map();
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const text = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
        runtimeErrors.push(text);
        console.error('EXCEPTION DETECTED:', text);
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description || '').join(' '));
      }
    };

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    let benchmarkData = null;

    for (const shot of SHOTS) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: shot.width,
        height: shot.height,
        deviceScaleFactor: 1,
        mobile: false
      });
      const url = `http://127.0.0.1:${httpPort}${shot.path || '/index.html'}${shot.query}`;
      await send('Page.navigate', { url });
      await sleep(450);

      // Aguarda imagens de referência (se houver) e um frame estável
      await send('Runtime.evaluate', {
        expression: `new Promise(r => {
          const imgs = Array.from(document.querySelectorAll('img'));
          Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; }))).then(() => {
            setTimeout(r, 80);
          });
        })`,
        awaitPromise: true
      });

      if (shot.query.includes('bench=1')) {
        const evalRes = await send('Runtime.evaluate', {
          expression: `JSON.stringify(window.__ARENA_BENCHMARK__ || null)`,
          returnByValue: true
        });
        if (evalRes?.result?.value) {
          benchmarkData = JSON.parse(evalRes.result.value);
        }
      }

      const snap = await send('Page.captureScreenshot', { format: 'png' });
      const fileOut = path.join(outDir, shot.name);
      fs.writeFileSync(fileOut, Buffer.from(snap.data, 'base64'));
      console.log('Captured:', shot.name);
    }

    if (benchmarkData) {
      const benchFile = path.join(scriptDir, 'benchmark-results.json');
      fs.writeFileSync(benchFile, JSON.stringify(benchmarkData, null, 2), 'utf8');
      console.log('Official 1280x720 Uncapped Benchmark:', JSON.stringify(benchmarkData));
    }

    console.log('Runtime Errors:', runtimeErrors.length, runtimeErrors);
    console.log('Console Errors:', consoleErrors.length, consoleErrors);
  } finally {
    if (ws) ws.close();
    proc.kill();
    server.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
