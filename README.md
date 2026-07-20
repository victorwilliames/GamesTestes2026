# Central de Jogos - Testes 2026

Este repositório contém 4 protótipos de jogos desenvolvidos em **Three.js** e **Vite**. Esta central facilita a instalação e execução de todos os projetos a partir da raiz.

---

## Como Começar

### 1. Instalar dependências de todos os projetos
Na raiz deste repositório, execute o comando abaixo para instalar as dependências de todos os 4 subprojetos automaticamente:

```bash
npm run install:all
```

---

## Como Executar os Jogos

Para testar os jogos, inicie o servidor de desenvolvimento correspondente e acesse a URL indicada no navegador.

### 🎮 1. Arena do Gladiador v1 (Offline + Colyseus Multi-ready)
Jogo de combate com barra de vida/stamina, HUD mobile e dummy de treino.
* **Comando para rodar:**
  ```bash
  npm run dev:gladiator-v1
  ```
* **Acesso local:** [http://localhost:5173](http://localhost:5173) (Servidor Colyseus na porta `2567`)

### 🎮 2. Arena do Gladiador v2 (Stickman Procedural)
Versão leve com Stickman modelado via código (Três.js puro) e texturas procedurais.
* **Comando para rodar:**
  ```bash
  npm run dev:gladiator-v2
  ```
* **Acesso local:** [http://localhost:5174](http://localhost:5174)

### 🎮 3. 1v1 MOBATest v1 (Completo)
Simulação completa de MOBA (Caitlyn vs Master Yi IA) com rotas, minions, torres, selva e auto-play.
* **Comando para rodar:**
  ```bash
  npm run dev:x1moba-v1
  ```
* **Acesso local:** [http://localhost:3000](http://localhost:3000)

### 🎮 4. MOBATest v2 (Protótipo/Grid Backup)
Foco em mira, projéteis e movimentação no Grid com dummies de treino estáticos.
* **Comando para rodar:**
  ```bash
  npm run dev:x1moba-v2
  ```
* **Acesso local:** [http://localhost:3005](http://localhost:3005)

---

## Git & Sincronização com o GitHub

Para manter o seu trabalho em sincronia com o GitHub, use os comandos padrão do Git na raiz deste projeto:

1. **Verificar arquivos alterados:**
   ```bash
   git status
   ```
2. **Adicionar alterações para commit:**
   ```bash
   git add .
   ```
3. **Criar um commit:**
   ```bash
   git commit -m "Descreva suas alterações aqui"
   ```
4. **Enviar para o GitHub:**
   ```bash
   git push origin main
   ```
