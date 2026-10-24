import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const PORT = 8085;
const ROOT = process.cwd();

// 1. Static HTTP Server
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/prototypes/procedural-p0/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
console.log(`HTTP Server running at http://127.0.0.1:${PORT}`);

// 2. Launch Chrome Headless
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-p0-'));
const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-first-run',
  '--hide-scrollbars',
  `--user-data-dir=${tmpProfile}`,
  'about:blank'
], { stdio: 'ignore' });

// Wait for Chrome CDP endpoint
let wsUrl = null;
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 200));
  try {
    const res = await fetch('http://127.0.0.1:9222/json');
    const list = await res.json();
    if (list && list[0] && list[0].webSocketDebuggerUrl) {
      wsUrl = list[0].webSocketDebuggerUrl;
      break;
    }
  } catch (e) {}
}

if (!wsUrl) {
  chromeProcess.kill();
  server.close();
  throw new Error('Failed to connect to Chrome remote debugging port 9222');
}

console.log('Connected to Chrome CDP:', wsUrl);

// 3. Simple CDP Client
class CDPClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 1;
    this.callbacks = new Map();
    this.events = new Map();
  }

  async init() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method) {
        const handlers = this.events.get(msg.method) || [];
        handlers.forEach(h => h(msg.params));
      }
    };
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    if (!this.events.has(method)) this.events.set(method, []);
    this.events.get(method).push(handler);
  }

  close() {
    this.ws.close();
  }
}

const cdp = new CDPClient(wsUrl);
await cdp.init();

await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 800,
  deviceScaleFactor: 1,
  mobile: false
});

const consoleLogs = [];
const consoleErrors = [];

cdp.on('Runtime.consoleAPICalled', (params) => {
  const text = params.args.map(a => a.value || JSON.stringify(a)).join(' ');
  consoleLogs.push({ type: params.type, text });
  if (params.type === 'error') consoleErrors.push(text);
});

cdp.on('Runtime.exceptionThrown', (params) => {
  consoleErrors.push(params.exceptionDetails.text + ' ' + (params.exceptionDetails.exception?.description || ''));
});

// Navigate
await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/prototypes/procedural-p0/index.html` });
await new Promise(r => setTimeout(r, 1000));

// Create screenshots directory
const outDir = path.join(ROOT, 'prototypes', 'procedural-p0', 'audit-screenshots');
fs.mkdirSync(outDir, { recursive: true });

// Function to take screenshot
async function takeScreenshot(filename) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
  console.log(`Saved screenshot: ${outPath}`);
  return outPath;
}

// Direction test: S, SW, W, NW, N, NE, E, SE
const directions = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
const auditResults = [];

for (let i = 0; i < 8; i++) {
  const dirName = directions[i];
  // Click "Girar 45°" if i > 0
  if (i > 0) {
    await cdp.send('Runtime.evaluate', {
      expression: 'document.getElementById("spin").click()'
    });
    await new Promise(r => setTimeout(r, 100));
  }
  
  const hudRes = await cdp.send('Runtime.evaluate', {
    expression: 'document.getElementById("stats").textContent'
  });
  const hudText = hudRes.result.value;

  const snapPath = await takeScreenshot(`initial_${i}_${dirName}.png`);
  auditResults.push({
    index: i,
    direction: dirName,
    hud: hudText,
    screenshot: snapPath
  });
}

// Test WASD movement
console.log('Testing WASD movement...');
await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'd' });
await new Promise(r => setTimeout(r, 400));
await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'd' });

await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'w' });
await new Promise(r => setTimeout(r, 400));
await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'w' });

const afterMoveHud = (await cdp.send('Runtime.evaluate', {
  expression: 'document.getElementById("stats").textContent'
})).result.value;

await takeScreenshot('initial_after_wasd_movement.png');

// Test Pivot toggle
await cdp.send('Runtime.evaluate', {
  expression: 'document.getElementById("debug").click()'
});
await new Promise(r => setTimeout(r, 150));
await takeScreenshot('initial_pivots_enabled.png');

// Measure FPS over 1 second
let fpsReadings = [];
for (let j = 0; j < 5; j++) {
  await new Promise(r => setTimeout(r, 200));
  const stats = (await cdp.send('Runtime.evaluate', {
    expression: 'document.getElementById("stats").textContent'
  })).result.value;
  const match = stats.match(/FPS\s+(\d+)/);
  if (match) fpsReadings.push(parseInt(match[1], 10));
}

const avgFps = fpsReadings.length ? Math.round(fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length) : null;

// Write audit report
const report = {
  timestamp: new Date().toISOString(),
  test_environment: {
    browser: 'Google Chrome Headless (CDP)',
    viewport: '1280x800',
    canvas_dimensions: '1024x640',
    rendering_context: 'Canvas 2D'
  },
  console_logs_count: consoleLogs.length,
  console_errors: consoleErrors,
  fps_readings: fpsReadings,
  average_fps: avgFps,
  after_movement_hud: afterMoveHud,
  eight_directions_audit: auditResults
};

fs.writeFileSync(path.join(outDir, 'initial_audit_report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log('Initial audit report saved successfully.');

// Cleanup
cdp.close();
chromeProcess.kill();
try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (e) {}
server.close();
console.log('Audit complete.');
