/* build.mjs — gera o index.html independente (abre com duplo clique, file://)
 * Concatena src/*.js na ordem numérica dentro de tools/shell.html. */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const srcDir = path.join(root, 'src');
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.js')).sort();
const banner = `/* ============================================================================
 * LÂMINAS DO CAOS — herói 2D procedural (Canvas 2D puro, sem sprites)
 * Gerado por tools/build.mjs a partir de src/${'{00..10}'}-*.js
 * Ordem: ${files.join(' -> ')}
 * ========================================================================== */`;

let code = banner + '\n';
for (const f of files) code += `\n/* ---------- ${f} ---------- */\n` + fs.readFileSync(path.join(srcDir, f), 'utf8');

const shell = fs.readFileSync(path.join(here, 'shell.html'), 'utf8');
const out = shell.replace('<!--SCRIPTS-->', '<script>\n' + code + '\n</script>');
fs.writeFileSync(path.join(root, 'index.html'), out);
const kb = (out.length / 1024).toFixed(0);
console.log(`index.html gerado (${kb} kB) com ${files.length} arquivos: ${files.join(', ')}`);
