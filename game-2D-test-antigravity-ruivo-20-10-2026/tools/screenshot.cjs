const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const fullPath = path.join(root, reqPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    const mime = ext === '.html' ? 'text/html' : (ext === '.js' ? 'application/javascript' : (ext === '.png' ? 'image/png' : 'text/plain'));
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(fullPath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8089, () => {
  console.log('Server listening on http://localhost:8089');
  try {
    const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const outFile = path.join(root, 'test_game.png');
    const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome_tmp_' + Date.now());
    execSync(`"${chrome}" --headless=new --screenshot="${outFile}" --window-size=1280,720 --user-data-dir="${tempDir}" --no-first-run --no-default-browser-check --disable-gpu --no-sandbox "http://localhost:8089/index.html"`, { stdio: 'inherit', timeout: 8000 });
    console.log('Screenshot saved to', outFile);
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.error('Error taking screenshot:', err.message);
  } finally {
    server.close();
  }
});
