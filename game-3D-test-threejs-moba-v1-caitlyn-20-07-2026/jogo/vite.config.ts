import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  base: './',
  publicDir: '../assets',
  plugins: [
    {
      name: 'log-saver',
      configureServer(server) {
        server.middlewares.use('/api/save-log', (req, res, next) => {
          if (req.url === '' || req.url === '/') {
            // Se o middleware for invocado sem sub-rota, passa adiante
            return next();
          }
          
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                // Direciona para a pasta logs no projeto
                const logDir = path.resolve(__dirname, 'logs');
                if (!fs.existsSync(logDir)) {
                  fs.mkdirSync(logDir);
                }
                
                const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `partida_${timeStamp}.txt`;
                const filePath = path.join(logDir, fileName);
                
                fs.writeFileSync(filePath, data.logs.join('\n'), 'utf8');
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Log salvo com sucesso em: ' + filePath);
              } catch (err) {
                res.statusCode = 500;
                res.end('Erro ao processar e salvar logs.');
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ]
});
