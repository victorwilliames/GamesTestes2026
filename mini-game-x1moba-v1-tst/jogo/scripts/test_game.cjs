const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== INICIANDO TESTE AUTÔNOMO MOBATEST ===');
  
  // Cria pasta de logs e relatórios no workspace
  const workspaceLogDir = path.resolve(__dirname, '../logs');
  if (!fs.existsSync(workspaceLogDir)) {
    fs.mkdirSync(workspaceLogDir);
  }
  
  // Diretório de artefatos da IA
  const artifactDir = 'C:\\Users\\willi\\.gemini\\antigravity\\brain\\0fb723c0-3d64-40c3-9d2b-a135098f5dc7';
  
  let browser;
  let testPassed = true;
  const capturedLogs = [];
  
  try {
    console.log('1. Abrindo navegador headless via Puppeteer...');
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      protocolTimeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--use-gl=swiftshader',
        '--disable-renderer-backgrounding',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });
    
    // Captura e formata logs do console da página
    page.on('console', msg => {
      const text = msg.text();
      capturedLogs.push(text);
      
      if (text.includes('[TEST_ERROR]')) {
        console.error('🔴 ' + text);
        testPassed = false;
      } else if (text.includes('[TEST_OK]')) {
        console.log('🟢 ' + text);
      } else if (text.includes('[COMBAT]') || text.includes('[SKILL]')) {
        console.log('⚔️ ' + text);
      } else if (text.includes('[SYSTEM]')) {
        console.log('⚙️ ' + text);
      } else {
        console.log('💬 ' + text);
      }
    });
    page.on('pageerror', err => {
      console.error('❌ PAGE ERROR CRASH:', err.stack);
      capturedLogs.push('PAGE ERROR CRASH: ' + err.stack);
      testPassed = false;
    });
    
    console.log('2. Acessando http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log('3. Aguardando a tela de carregamento sumir...');
    // Espera até que o loader seja ocultado
    await page.waitForFunction(() => {
      const loader = document.getElementById('loading-screen');
      return loader && loader.classList.contains('hidden');
    }, { timeout: 15000 });
    
    console.log('4. Clicando em "Iniciar com Auto-Play" no Menu Inicial...');
    const startBtnSelector = '#menu-start-auto';
    await page.waitForSelector(startBtnSelector);
    await page.click(startBtnSelector);
    
    console.log('5. Aguardando contagem regressiva e início da batalha (1s)...');
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('6. Executando simulação acelerada de partida inteira de 5min (4s)...');
    await new Promise(r => setTimeout(r, 4000));
    
    console.log('7. Capturando screenshot do gameplay (sem redimensionar para evitar hangs)...');
    const screenshotName = 'gameplay_test.png';
    const workspaceScreenshotPath = path.join(workspaceLogDir, screenshotName);
    const artifactScreenshotPath = path.join(artifactDir, screenshotName);
    
    try {
      // Salva nos dois locais, desabilitando captureBeyondViewport para evitar hangs com canvas WebGL
      await page.screenshot({ path: workspaceScreenshotPath, captureBeyondViewport: false, timeout: 5000 });
      if (fs.existsSync(artifactDir)) {
        fs.copyFileSync(workspaceScreenshotPath, artifactScreenshotPath);
        console.log(`- Screenshot salva em artefatos: ${artifactScreenshotPath}`);
      }
      console.log(`- Screenshot salva no workspace: ${workspaceScreenshotPath}`);
    } catch (screenshotError) {
      console.warn('⚠️ Captura de screenshot ignorada neste ambiente sem aceleração de GPU: ' + screenshotError.message);
    }
    
    console.log('8. Salvando relatório de logs em arquivo .txt...');
    const reportName = 'test_run_report.txt';
    const workspaceReportPath = path.join(workspaceLogDir, reportName);
    const artifactReportPath = path.join(artifactDir, reportName);
    const reportContent = `RELATÓRIO DE EXECUÇÃO DE TESTE - MOBATEST\n` +
                          `Data: ${new Date().toLocaleString()}\n` +
                          `Resultado: ${testPassed ? 'SUCESSO' : 'FALHA (Erros de Asserção Detectados)'}\n` +
                          `==================================================\n\n` +
                          capturedLogs.join('\n');
                          
    fs.writeFileSync(workspaceReportPath, reportContent, 'utf8');
    if (fs.existsSync(artifactDir)) {
      fs.writeFileSync(artifactReportPath, reportContent, 'utf8');
      console.log(`- Relatório de logs em artefatos: ${artifactReportPath}`);
    }
    console.log(`- Relatório de logs no workspace: ${workspaceReportPath}`);
    
  } catch (err) {
    console.error('❌ Ocorreu um erro durante a execução do teste automatizado:', err);
    testPassed = false;
  } finally {
    if (browser) {
      console.log('9. Fechando o navegador...');
      await browser.close();
    }
    
    console.log('=== FIM DO TESTE AUTÔNOMO ===');
    process.exit(testPassed ? 0 : 1);
  }
})();
