// ============================================================================
// build-bundle.mjs — Empacota os módulos de src/ em bundle.js E injeta inline
// em index.html para garantir funcionamento em 100% dos ambientes:
// - file:/// (duplo-clique no Windows Explorer)
// - Webview / Preview interno da IDE (Antigravity / VS Code)
// - Servidor HTTP local (Live Server / http-server)
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filesInOrder = [
  'src/materials/MaterialPainter.js',
  'src/painters/FacePainter.js',
  'src/painters/HairPainter.js',
  'src/painters/HeadPainter.js',
  'src/painters/TorsoPainter.js',
  'src/painters/ArmPainter.js',
  'src/painters/LegPainter.js',
  'src/painters/ClothPainter.js',
  'src/painters/ScarfPainter.js',
  'src/painters/WeaponPainter.js',
  'src/poses/PosePresets.js',
  'src/rig/RigAdapter.js',
  'src/HeroRenderer.js',
  'src/arena/ProceduralEnvironment.js',
  'src/arena/ArenaEngine.js'
];

let out = `// AUTO-GENERATED BUNDLE FROM src/ MODULES (Supports file:///, IDE Preview, and http://)\n(function(window) {\n  'use strict';\n\n`;

for (const rel of filesInOrder) {
  const fullPath = path.join(__dirname, rel);
  let code = fs.readFileSync(fullPath, 'utf8');
  code = code.replace(/^\s*import\s+.*?;?\s*$/gm, '');
  code = code.replace(/^\s*export\s+(class|function|const|let|var)\s+/gm, '$1 ');
  out += `  // --- MODULE: ${rel} ---\n` + code + '\n\n';
}

out += `  window.HeroRenderer = HeroRenderer;\n`;
out += `  window.POSE_PRESETS = POSE_PRESETS;\n`;
out += `  window.RigAdapter = RigAdapter;\n`;
out += `  window.ProceduralEnvironment = ProceduralEnvironment;\n`;
out += `  window.ENVIRONMENT_THEMES = ENVIRONMENT_THEMES;\n`;
out += `  window.ArenaEngine = ArenaEngine;\n`;
out += `})(window);\n`;

const bundlePath = path.join(__dirname, 'bundle.js');
fs.writeFileSync(bundlePath, out, 'utf8');

const updateHtmlFile = (fileName) => {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  const startTag = '<!-- BUNDLE_INLINE_START -->';
  const endTag = '<!-- BUNDLE_INLINE_END -->';
  const inlineBlock = `${startTag}\n  <script>\n${out}\n  </script>\n  ${endTag}`;

  if (html.includes(startTag) && html.includes(endTag)) {
    const sIdx = html.indexOf(startTag);
    const eIdx = html.indexOf(endTag) + endTag.length;
    html = html.slice(0, sIdx) + inlineBlock + html.slice(eIdx);
  } else if (html.includes('<script src="./bundle.js"></script>')) {
    html = html.replace('<script src="./bundle.js"></script>', inlineBlock);
  }
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Updated bundle.js and inlined into ${fileName} successfully.`);
};

updateHtmlFile('index.html');
updateHtmlFile('studio-rig.html');
