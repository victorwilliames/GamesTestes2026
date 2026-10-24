#!/usr/bin/env node
// Audit matched full-screen FXAA early-exit threshold data; baseline includes uniform control.
const fs = require('fs');
const path = require('path');

const MODES = ['full', 'fxaa_thr035', 'fxaa_thr050', 'fxaa_thr070', 'no_fxaa'];
const SCENARIOS = ['idle', 'movement', 'kiting', 'combat', 'camera'];
const PAIRS = [
  ['full', 'fxaa_thr035', 'Constant versus uniform: baseline control'],
  ['fxaa_thr035', 'fxaa_thr050', 'Edge exit at 0.050'],
  ['fxaa_thr035', 'fxaa_thr070', 'Edge exit at 0.070'],
  ['full', 'no_fxaa', 'Total cost of FXAA pass'],
];

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function audit(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const doc = JSON.parse(content);
  const info = doc.info || {};
  const recs = doc.results || [];
  const runs = parseInt(info.runs || 3, 10);
  const expected = MODES.length * SCENARIOS.length * runs;

  const configSet = new Set(info.configs || []);
  const modeSet = new Set(MODES);
  const setsEqual = configSet.size === modeSet.size && [...configSet].every(x => modeSet.has(x));

  if (recs.length !== expected || !setsEqual) {
    throw new Error(`${filePath}: incomplete/unexpected run; expected ${expected} records, got ${recs.length}`);
  }

  const grouped = {};
  for (const rec of recs) {
    const { config: mode, scenario, run } = rec;
    if (!MODES.includes(mode) || !SCENARIOS.includes(scenario) || run < 0 || run >= runs) {
      throw new Error(`Unknown configuration/record: ${JSON.stringify(rec)}`);
    }
    const ft = rec.frame_ms_mean;
    if (typeof ft !== 'number' || !Number.isFinite(ft) || ft <= 0) {
      throw new Error(`Invalid frametime: ${ft}`);
    }
    const key = `${scenario}/${run}`;
    if (!grouped[key]) grouped[key] = {};
    if (grouped[key][mode]) {
      throw new Error(`Duplicate mode ${mode} at ${key}`);
    }
    grouped[key][mode] = rec;
  }

  const groupKeys = Object.keys(grouped);
  if (groupKeys.length !== SCENARIOS.length * runs || groupKeys.some(k => Object.keys(grouped[k]).length !== MODES.length)) {
    throw new Error('Missing paired scenario/run');
  }

  console.log(`\n=== ${filePath} | ${info.platform || 'Unknown'} / ${info.gpu || info.user_agent || 'Unknown'} ===`);
  for (const mode of MODES) {
    const avg = mean(groupKeys.map(k => grouped[k][mode].frame_ms_mean));
    const p50 = median(groupKeys.map(k => grouped[k][mode].frame_ms_p50));
    console.log(`${mode.padEnd(18)} mean: ${avg.toFixed(3)} ms | p50: ${p50.toFixed(2)} ms | eq. FPS: ${(1000 / avg).toFixed(1)}`);
  }

  console.log('\nPaired differences: positive = first mode slower (second mode faster)');
  for (const [modeA, modeB, label] of PAIRS) {
    const diffs = groupKeys.map(k => grouped[k][modeA].frame_ms_mean - grouped[k][modeB].frame_ms_mean);
    const posCount = diffs.filter(x => x > 0).length;
    console.log(`${modeA} - ${modeB}: mean ${mean(diffs) >= 0 ? '+' : ''}${mean(diffs).toFixed(3)} ms, median ${median(diffs) >= 0 ? '+' : ''}${median(diffs).toFixed(3)} ms, positive ${posCount}/${diffs.length} (${label})`);

    const gpuDiffs = [];
    for (const k of groupKeys) {
      const recA = grouped[k][modeA];
      const recB = grouped[k][modeB];
      if (recA.gpu_available && recB.gpu_available && recA.gpu_ms_mean > 0 && recB.gpu_ms_mean > 0) {
        gpuDiffs.push(recA.gpu_ms_mean - recB.gpu_ms_mean);
      }
    }
    if (gpuDiffs.length > 0) {
      console.log(`  GPU viewport: mean ${mean(gpuDiffs) >= 0 ? '+' : ''}${mean(gpuDiffs).toFixed(3)} ms over ${gpuDiffs.length} matched pairs`);
    }
  }
  console.log('WARNING: Larger thresholds may skip AA on faint grid lines, transparent rings and thin details. Compare 1x and 4x. No visual equivalence inferred.');
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node tools/analyze_fxaa_threshold.cjs <file1.json> [file2.json ...]');
  process.exit(1);
}
for (const f of args) {
  audit(path.resolve(f));
}
