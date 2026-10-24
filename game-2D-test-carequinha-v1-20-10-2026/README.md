# Protótipo V1 - Hero Carequinha (Estudo)

Protótipo completo do primeiro ciclo de desenvolvimento, contendo motor isométrico, rig procedural com IK, arena e combate jogável em Canvas 2D nativo.

## Como Executar
1. Inicie o servidor local:
   ```bash
   node tools/serve.cjs
   ```
2. Abra no navegador:
   - Jogo jogável: `http://localhost:5317/index.html`
   - Turnaround em 8 direções: `http://localhost:5317/turnaround.html`

## Como Rodar os Testes
A partir desta pasta:
```bash
node --test tests/*.test.cjs
```
Status: **10 testes passando (100% verdes)**.
