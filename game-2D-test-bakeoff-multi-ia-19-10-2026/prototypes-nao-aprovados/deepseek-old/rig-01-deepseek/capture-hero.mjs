// HERO-02 Gate 2 capture script.
// Usage (from anywhere): node prototypes/rig-01-deepseek/capture-hero.mjs
// Requires Microsoft Edge and Node.js 20+ (global WebSocket + fetch).
// Screenshots are CDP page captures, not canvas.toDataURL: local PNG references
// legitimately taint the canvas under file://, which is documented in the audit.

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
  { preset: 'contact', name: '09-hero-idle-8dir.png', width: 1920, height: 1120 },
  { preset: 'run', name: '10-hero-run.png', width: 1280, height: 720 },
  { preset: 'combo', name: '11-hero-combo.png', width: 1920, height: 720 },
  { preset: 'debug', name: '12-hero-debug.png', width: 1280, height: 720 },
  { preset: 'gallery', name: '13-hero-gallery.png', width: 1280, height: 720 }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
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
  for (let i = 0; i < 120; i++) {
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
  if (!fs.existsSync(EDGE)) throw new Error('Missing Edge executable: ' + EDGE + ' (set EDGE_PATH)');
  fs.mkdirSync(OUT, { recursive: true });
  for (const shot of SHOTS) {
    const f = path.join(OUT, shot.name);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }

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
    const networkRequests = [];
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
      } else if (msg.method === 'Network.requestWillBeSent') {
        networkRequests.push(msg.params.request.url);
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
    async function waitReady(preset) {
      for (let i = 0; i < 160; i++) {
        try {
          const ok = await evaluate(`(async()=>{
            if (location.search.indexOf('capture=${preset}') < 0) return false;
            if (!window.RIG01) return false;
            await window.RIG01.ready;
            if (document.fonts && document.fonts.ready) await document.fonts.ready;
            return document.body.dataset.ready === '1';
          })()`);
          if (ok) return;
        } catch {}
        await sleep(100);
      }
      throw new Error('Page did not become ready for capture=' + preset);
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    const browser = await send('Browser.getVersion');

    const captures = [];
    for (const shot of SHOTS) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: shot.width, height: shot.height, deviceScaleFactor: 1, mobile: false
      });
      await send('Page.navigate', { url: `${FILE_URL}?capture=${shot.preset}` });
      await waitReady(shot.preset);
      await sleep(500);
      const state = await evaluate(`(()=>{
        const c=document.querySelector('canvas');
        const m=RIG01.getMetrics();
        const d=RIG01.getDebugInfo();
        return {
          mode:RIG01.getMode(), state:RIG01.getState(), yaw:RIG01.getYaw(),
          canvas:[c.width,c.height], metrics:m,
          assets:RIG01.getAssetInfo(),
          clamps:d.clamps, jointCount:Object.keys(d.joints).length,
          targetCount:Object.keys(d.targets).length, drawCount:d.drawCount,
          inputBuffer:d.inputBuffer
        };
      })()`);
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png', fromSurface: true, captureBeyondViewport: false,
        clip: { x: 0, y: 0, width: shot.width, height: shot.height, scale: 1 }
      });
      const file = path.join(OUT, shot.name);
      fs.writeFileSync(file, Buffer.from(screenshot.data, 'base64'));
      const dims = pngSize(file);
      if (dims.width !== shot.width || dims.height !== shot.height) {
        throw new Error(`${shot.name}: expected ${shot.width}x${shot.height}, got ${dims.width}x${dims.height}`);
      }
      if (state.canvas[0] !== shot.width || state.canvas[1] !== shot.height) {
        throw new Error(`${shot.name}: canvas buffer ${state.canvas.join('x')} does not match viewport`);
      }
      captures.push({
        file: shot.name, preset: shot.preset, width: dims.width, height: dims.height,
        bytes: dims.bytes, sha256: sha256(file), state: state.state, mode: state.mode,
        yaw: state.yaw, phase: state.metrics.phase, clipTime: state.metrics.clipTime,
        root: state.metrics.root,
        footSlipMaxPx: state.metrics.footSlipMaxPx,
        footSlipMeanPx: state.metrics.footSlipMeanPx,
        footLockSamples: state.metrics.footLockSamples,
        footLockPass: state.metrics.footLockPass,
        footTests: state.metrics.footTests,
        assets: state.assets,
        clamps: state.clamps, jointCount: state.jointCount,
        targetCount: state.targetCount, drawCount: state.drawCount,
        inputBuffer: state.inputBuffer
      });
      console.log(`[capture] ${shot.name} ${dims.width}x${dims.height} ${state.state} phase=${state.metrics.phase} items=${state.drawCount}`);
    }

    // Public API capture probe. Local PNG references taint the file:// canvas;
    // a null result is expected and is not used as evidence for these images.
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: FILE_URL + '?capture=idle' });
    await waitReady('idle');
    const apiCapture = await evaluate(`(()=>{
      try { const u=RIG01.capturePNG(); return u ? {ok:true, length:u.length} : {ok:false, error:'null'}; }
      catch(e) { return {ok:false, error:String(e && e.message || e)}; }
    })()`);

    // Performance: uncapped throughput, 1280x720 native buffer, 6s sample.
    await send('Page.navigate', { url: FILE_URL + '?capture=fps' });
    await waitReady('fps');
    const perf = await evaluate(`(async()=>{
      await new Promise(r=>setTimeout(r,1500));
      const marks=[];
      const start=performance.now();
      await new Promise(resolve=>{
        function tick(){
          marks.push(performance.now());
          if(performance.now()-start < 6000) requestAnimationFrame(tick);
          else resolve();
        }
        requestAnimationFrame(tick);
      });
      const intervals=[];
      for(let i=1;i<marks.length;i++) intervals.push(marks[i]-marks[i-1]);
      intervals.sort((a,b)=>a-b);
      function q(p){ return intervals[Math.min(intervals.length-1,Math.max(0,Math.floor((intervals.length-1)*p)))]; }
      const seconds=(marks[marks.length-1]-marks[0])/1000;
      const avgFps=(marks.length-1)/seconds;
      const perSecondFps=[];
      let bucketStart=marks[0], bucketFrames=0;
      for(let i=0;i<marks.length;i++){
        const elapsed=marks[i]-bucketStart;
        if(elapsed>=1000){
          perSecondFps.push(Number((bucketFrames*1000/elapsed).toFixed(1)));
          bucketStart=marks[i]; bucketFrames=0;
        }
        bucketFrames++;
      }
      const t0=performance.now();
      for(let i=0;i<120;i++){ RIG01.setPaused(true); RIG01.setTime(i*0.0167); }
      const drawMs=(performance.now()-t0)/120;
      const m1=RIG01.getMetrics();
      return {
        samples:marks.length, seconds, avgFps, perSecondFps,
        worstSecondFps:(perSecondFps.length?Math.min.apply(null,perSecondFps):null),
        frameMs:{p50:q(0.5),p95:q(0.95),p99:q(0.99),max:intervals[intervals.length-1]},
        drawMs, apiFps:m1.fps, frameCount:m1.frameCount, errors:m1.errors
      };
    })()`);
    perf.targetFps = 200; perf.floorFps = 200;
    perf.avgFps = Number(perf.avgFps.toFixed(2));
    perf.effectiveFrameMs = Number((1000 / perf.avgFps).toFixed(3));
    Object.keys(perf.frameMs).forEach(k => { perf.frameMs[k] = Number(perf.frameMs[k].toFixed(3)); });
    perf.drawMs = Number(perf.drawMs.toFixed(3));
    perf.targetMet = perf.avgFps >= 200 && perf.frameMs.p99 <= 5.0;

    // API regression checks on the same build.
    const apiChecks = await evaluate(`(()=>{
      const out={};
      RIG01.reset(); RIG01.setPaused(true);
      out.durations={};
      ['idle','run','dash','attack1','attack2','attack3'].forEach(function(s){
        RIG01.setState(s); out.durations[s]=RIG01.getMetrics().clipDuration;
      });
      out.clamps={};
      [['idle',0.35],['run',0.13],['dash',0.16],['attack1',0.1598],['attack2',0.15],['attack3',0.19]].forEach(function(pair){
        RIG01.setState(pair[0]); RIG01.setTime(pair[1]);
        var d=RIG01.getDebugInfo();
        out.clamps[pair[0]]={clamps:d.clamps, drawOrder:d.drawOrder.length, drawCount:d.drawCount};
      });
      RIG01.reset(); RIG01.setPaused(false);
      window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyD'})); RIG01.step(6);
      var east=RIG01.getMetrics().root; window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD'}));
      window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyA'})); RIG01.step(12);
      var west=RIG01.getMetrics().root; window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyA'}));
      out.bounds={east:east, west:west};
      out.assets=RIG01.getAssetInfo();
      out.mode='arena';
      return out;
    })()`);

    const galleryCheck = await evaluate(`(()=>{
      RIG01.setMode('gallery'); var g=RIG01.getMode();
      RIG01.setMode('combo'); var c=RIG01.getMode();
      RIG01.setMode('arena'); return {gallery:g, combo:c, back:RIG01.getMode()};
    })()`);

    // Determinism: same pose after reload.
    const poseA = await evaluate(`(()=>{RIG01.setPaused(true);RIG01.setYaw(0);RIG01.setState('idle');RIG01.setTime(0.35);return RIG01.getDebugInfo().joints.pelvis.screen;})()`);
    await send('Page.navigate', { url: FILE_URL + '?capture=idle' });
    await waitReady('idle');
    const poseB = await evaluate(`(()=>{RIG01.setPaused(true);RIG01.setYaw(0);RIG01.setState('idle');RIG01.setTime(0.35);return RIG01.getDebugInfo().joints.pelvis.screen;})()`);

    const hashAfter = sha256(HTML);
    const report = {
      generatedAt: new Date().toISOString(),
      browser: browser.product,
      userAgent: browser.userAgent,
      platform: process.platform,
      node: process.version,
      html: path.relative(ROOT, HTML),
      htmlSha256: hashBefore,
      htmlSha256After: hashAfter,
      sameBuild: hashBefore === hashAfter,
      viewport: { arena: '1280x720', contact: '1920x1120', combo: '1920x720', gallery: '1280x720', deviceScaleFactor: 1 },
      apiCapture,
      apiCaptureNote: 'file:// + local PNG references taint the canvas; CDP page screenshots are the evidence for 09-13.',
      deterministicPose: { first: poseA, second: poseB, equal: JSON.stringify(poseA) === JSON.stringify(poseB) },
      apiChecks,
      galleryCheck,
      performance: {
        ...perf,
        method: 'Uncapped requestAnimationFrame throughput after 1.5s warm-up; 6s sample; 1280x720 native buffer.',
        flags: ['--disable-frame-rate-limit', '--disable-gpu-vsync'],
        caveat: 'Headless Edge on this host. Mobile/low-end hardware is not validated by this run.'
      },
      networkRequests: [...new Set(networkRequests)],
      runtimeErrors,
      consoleErrors,
      captures
    };
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({
      htmlSha256: report.htmlSha256,
      sameBuild: report.sameBuild,
      screenshots: captures.length,
      apiCapture,
      performance: report.performance,
      deterministicPose: report.deterministicPose.equal,
      assets: report.apiChecks.assets,
      errors: runtimeErrors.length + consoleErrors.length
    }, null, 2));
    if (!perf.targetMet) {
      console.error('PERFORMANCE GATE FAILED: target is >=200 fps with p99 frame time <=5ms.');
      process.exitCode = 1;
    }
  } finally {
    try { ws && ws.close(); } catch {}
    try { proc.kill(); } catch {}
    await sleep(400);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

main().catch(err => { console.error(err); process.exit(1); });
