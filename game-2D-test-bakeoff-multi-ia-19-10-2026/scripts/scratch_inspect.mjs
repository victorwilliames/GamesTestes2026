import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function freePort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

async function main() {
  const port = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-inspect-'));
  const proc = spawn(EDGE, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--allow-file-access-from-files',
    '--disable-web-security',
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 100));
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find(x => x.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch {}
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(r => { ws.onopen = r; });

  let nextId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    const handler = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Runtime.enable');

  async function inspect(rel) {
    const abs = path.resolve(rel).replace(/\\/g, '/');
    const code = `
      (async () => {
        const img = new Image();
        img.src = 'file:///${abs}';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
        for (let y = 0; y < c.height; y++) {
          for (let x = 0; x < c.width; x++) {
            if (d[(y * c.width + x) * 4 + 3] > 20) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        return {
          file: '${rel}',
          width: img.width,
          height: img.height,
          minX, maxX, minY, maxY,
          boxW: maxX - minX + 1,
          boxH: maxY - minY + 1,
          footAnchorY: maxY,
          centerX: Math.round((minX + maxX) / 2)
        };
      })()
    `;
    const res = await send('Runtime.evaluate', { expression: code, awaitPromise: true, returnByValue: true });
    return res.result.value;
  }

  const files = [
    'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png',
    'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-se.png',
    'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-e.png',
    'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-ne.png',
    'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-n.png',
    'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-nw.png',
    'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-w.png',
    'assets/references/ref-2d-hero/hero-complet-idle/hero-idle-sw.png',
    'assets/references/ref-2d-hero/hero-parts/hero-part-head.png',
    'assets/references/ref-2d-hero/hero-parts/hero-part-body.png',
    'assets/references/ref-2d-hero/hero-parts/hero-part-weapons.png'
  ];

  for (const f of files) {
    const info = await inspect(f);
    console.log(JSON.stringify(info));
  }

  ws.close();
  proc.kill();
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}

main().catch(console.error);
