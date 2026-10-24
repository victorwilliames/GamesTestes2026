// Gate 2 (HERO-02) Capture & Benchmark script for Antigravity prototype.
// Usage: node prototypes/rig-01-antigravity/capture-hero.mjs

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(scriptDir, '..', '..');
const HTML = path.join(scriptDir, 'index-hero.html');
const OUT = path.join(scriptDir, 'screenshots');
const REPORT = path.join(scriptDir, 'capture-hero-report.json');
const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FILE_URL = 'file:///' + HTML.replace(/\\/g, '/');

const SHOTS = [
  { name: '09-hero-idle-8dir.png', width: 1920, height: 1120, setup: 'RIG01.reset(); RIG01.setPaused(true); RIG01.setMode("contact");' },
  { name: '10-hero-run.png', width: 1280, height: 720, setup: 'RIG01.reset(); RIG01.setPaused(true); RIG01.setMode("arena"); RIG01.setState("run"); RIG01.setYaw(0); RIG01.setTime(0.20);' },
  { name: '11-hero-combo.png', width: 1280, height: 720, setup: 'RIG01.reset(); RIG01.setPaused(true); RIG01.setMode("arena"); RIG01.setState("attack3"); RIG01.setYaw(0); RIG01.setTime(0.22);' },
  { name: '12-hero-debug.png', width: 1280, height: 720, setup: 'RIG01.reset(); RIG01.setPaused(true); RIG01.setMode("arena"); RIG01.setDebug(true); RIG01.setState("run"); RIG01.setYaw(45); RIG01.setTime(0.25);' },
  { name: '13-hero-gallery-g.png', width: 1280, height: 720, setup: 'RIG01.reset(); RIG01.setPaused(true); RIG01.setMode("gallery"); RIG01.setYaw(0);' }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  if (b.length < 24 || b.toString('ascii', 1, 4) !== 'PNG') throw new Error('Not a PNG: ' + file);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), bytes: b.length };
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

async function waitForCdp(port) {
  for (let i = 0; i < 100; i++) {
    await sleep(120);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find(x => x.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
  }
  throw new Error('Edge CDP did not start on port ' + port);
}

async function main() {
  if (!fs.existsSync(HTML)) throw new Error('Missing ' + HTML);
  if (!fs.existsSync(EDGE)) throw new Error('Missing Edge: ' + EDGE);

  fs.mkdirSync(OUT, { recursive: true });

  const hashBefore = sha256(HTML);
  const port = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-hero02-capture-'));
  const proc = spawn(EDGE, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--disable-frame-rate-limit',
    '--disable-gpu-vsync',
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let ws;
  try {
    const wsUrl = await waitForCdp(port);
    ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

    let nextId = 1;
    const pending = new Map();
    const runtimeErrors = [];
    const consoleErrors = [];

    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        runtimeErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description || '').join(' '));
      }
    };

    function send(method, params = {}) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
      return res.result.value;
    }

    await send('Page.enable');
    await send('Runtime.enable');
    const browser = await send('Browser.getVersion');

    await send('Page.navigate', { url: FILE_URL });
    for (let i = 0; i < 50; i++) {
      await sleep(100);
      try {
        const ready = await evaluate(`document.body.dataset.ready === "1" && typeof window.RIG01 !== "undefined"`);
        if (ready) break;
      } catch {}
    }

    // Validação Determinística de Foot Lock (Yaw 0 e Yaw 90)
    console.log('[test] Running deterministic footlock tests on index-hero.html...');
    const testYaw0 = await evaluate(`window.RIG01.runFootLockTest(2.0, 0)`);
    const testYaw90 = await evaluate(`window.RIG01.runFootLockTest(2.0, 90)`);

    console.log(`[test] Yaw 0: max=${testYaw0.footSlipMaxPx.toFixed(4)}px, mean=${testYaw0.footSlipMeanPx.toFixed(4)}px, pass=${testYaw0.footLockPass}`);
    console.log(`[test] Yaw 90: max=${testYaw90.footSlipMaxPx.toFixed(4)}px, mean=${testYaw90.footSlipMeanPx.toFixed(4)}px, pass=${testYaw90.footLockPass}`);

    const captures = [];
    for (const shot of SHOTS) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: shot.width,
        height: shot.height,
        deviceScaleFactor: 1,
        mobile: false
      });
      await evaluate(shot.setup);
      await sleep(200);

      const state = await evaluate(`window.RIG01.getMetrics()`);
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
        clip: { x: 0, y: 0, width: shot.width, height: shot.height, scale: 1 }
      });

      const file = path.join(OUT, shot.name);
      fs.writeFileSync(file, Buffer.from(screenshot.data, 'base64'));
      const dims = pngSize(file);
      const fileHash = sha256(file);

      captures.push({
        file: shot.name,
        width: dims.width,
        height: dims.height,
        bytes: dims.bytes,
        sha256: fileHash,
        state: state.state,
        yaw: state.yaw,
        clipTime: state.clipTime,
        footSlipMaxPx: state.footSlipMaxPx
      });
      console.log(`[capture] ${shot.name} (${dims.width}x${dims.height}) state=${state.state}`);
    }

    // Performance Test (Throughput do Herói + Ilha Tropical em 1280x720)
    const perf = await evaluate(`(() => {
      RIG01.reset();
      RIG01.setMode("arena");
      RIG01.setState("run");
      const t0 = performance.now();
      const iterations = 300;
      for (let i = 0; i < iterations; i++) {
        RIG01.step(0.016);
      }
      const t1 = performance.now();
      const totalMs = t1 - t0;
      const avgFrameMs = totalMs / iterations;
      const fps = Math.round(1000 / avgFrameMs);
      return { avgFps: fps, frameMs: avgFrameMs, iterations, totalMs };
    })()`);

    const hashAfter = sha256(HTML);

    const report = {
      generatedAt: new Date().toISOString(),
      browser: browser.product,
      platform: process.platform,
      node: process.version,
      html: path.relative(ROOT, HTML),
      htmlSha256: hashAfter,
      goldenRule200Fps: {
        floorFps: 200,
        measuredFps: perf.avgFps,
        frameMs: Number(perf.frameMs.toFixed(3)),
        pass: perf.avgFps >= 200
      },
      footLock: {
        yaw0: testYaw0,
        yaw90: testYaw90,
        pass: testYaw0.footLockPass && testYaw90.footLockPass
      },
      captures,
      errors: {
        runtime: runtimeErrors,
        console: consoleErrors
      }
    };

    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`[done] Report written to ${REPORT}`);
    console.log(`[result] All Gate 2 screenshots captured, footlock pass=${report.footLock.pass}, fps=${report.goldenRule200Fps.measuredFps} (Floor >= 200 FPS: ${report.goldenRule200Fps.pass})`);
  } finally {
    if (ws) ws.close();
    proc.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => {
  console.error('[error]', err);
  process.exit(1);
});
