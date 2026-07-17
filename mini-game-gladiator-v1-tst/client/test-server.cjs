const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

const port = 3000;
let server;
let browserProcess = null;
let testTimeout = null;

// Encontrar executável do navegador (Chrome ou Edge) no Windows
const paths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let browserPath = paths.find(p => fs.existsSync(p));

if (!browserPath) {
  console.error('[TEST-SERVER] Erro: Não foi possível localizar Google Chrome ou Microsoft Edge no sistema.');
  process.exit(1);
}

console.log(`[TEST-SERVER] Usando navegador: ${browserPath}`);

// Criar Servidor HTTP Receptor de Resultados
server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/success') {
    console.log('\n=========================================');
    console.log('[TEST-SERVER] RESULTADO: SUCESSO!');
    console.log('[TEST-SERVER] O player moveu, acertou o dummy e executou esquivas com sucesso.');
    console.log('=========================================\n');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    cleanup(0);
  } else if (req.url.startsWith('/failure')) {
    console.log('\n=========================================');
    console.log('[TEST-SERVER] RESULTADO: FALHA!');
    console.log('[TEST-SERVER] Um ou mais testes falharam na simulação.');
    console.log('=========================================\n');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    cleanup(1);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, () => {
  console.log(`[TEST-SERVER] Ouvindo na porta ${port}...`);
  
  // Iniciar Navegador Headless
  console.log('[TEST-SERVER] Iniciando navegador em modo headless...');
  const args = [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=1280,720',
    'http://localhost:5173/?test=true'
  ];

  browserProcess = spawn(browserPath, args);

  browserProcess.on('error', (err) => {
    console.error('[TEST-SERVER] Erro ao iniciar processo do navegador:', err);
    cleanup(1);
  });

  // Timeout de segurança após 25 segundos
  testTimeout = setTimeout(() => {
    console.error('\n[TEST-SERVER] TIMEOUT: O teste não respondeu em 25 segundos.');
    cleanup(1);
  }, 25000);
});

function cleanup(exitCode) {
  if (testTimeout) clearTimeout(testTimeout);
  
  if (browserProcess) {
    console.log('[TEST-SERVER] Encerrando navegador...');
    try {
      browserProcess.kill('SIGKILL');
    } catch (e) {}
  }
  
  if (server) {
    console.log('[TEST-SERVER] Parando servidor de testes...');
    server.close(() => {
      console.log(`[TEST-SERVER] Finalizado com código ${exitCode}.`);
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
}
