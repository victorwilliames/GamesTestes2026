import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const outDir = path.join(process.cwd(), 'prototypes', 'procedural-p0', 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const dirs = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];

console.log('Capturing 8 orientations of P0.1...');

for (let idx = 0; idx < dirs.length; idx++) {
  const name = dirs[idx];
  const targetPng = path.join(outDir, `p0_1_${idx}_${name}.png`);
  const fileUrl = 'file:///' + path.join(process.cwd(), 'prototypes', 'procedural-p0', 'index.html').replace(/\\/g, '/') + `?dir=${idx}`;
  const cmd = `"${chrome}" --headless --screenshot="${targetPng}" --virtual-time-budget=2000 --window-size=1280,800 "${fileUrl}"`;
  execSync(cmd, { stdio: 'pipe' });
  console.log(`[PASS] ${name} (dir=${idx}) -> ${path.basename(targetPng)} (${fs.statSync(targetPng).size} bytes)`);
}

// Capture with pivots visible
const pivotPng = path.join(outDir, 'p0_1_debug_pivots.png');
const pivotUrl = 'file:///' + path.join(process.cwd(), 'prototypes', 'procedural-p0', 'index.html').replace(/\\/g, '/') + '?dir=0&pivots=1';
execSync(`"${chrome}" --headless --screenshot="${pivotPng}" --virtual-time-budget=2000 --window-size=1280,800 "${pivotUrl}"`, { stdio: 'pipe' });
console.log(`[PASS] Pivots debug -> ${path.basename(pivotPng)} (${fs.statSync(pivotPng).size} bytes)`);

// Capture with zoom 1.4x for detail inspection
const zoomPng = path.join(outDir, 'p0_1_zoom_detail.png');
const zoomUrl = 'file:///' + path.join(process.cwd(), 'prototypes', 'procedural-p0', 'index.html').replace(/\\/g, '/') + '?dir=0&zoom=1.4';
execSync(`"${chrome}" --headless --screenshot="${zoomPng}" --virtual-time-budget=2000 --window-size=1280,800 "${zoomUrl}"`, { stdio: 'pipe' });
console.log(`[PASS] Zoom detail -> ${path.basename(zoomPng)} (${fs.statSync(zoomPng).size} bytes)`);

console.log('All screenshots captured successfully.');
