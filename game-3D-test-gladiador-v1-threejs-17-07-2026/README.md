# Arena do No Rest for the Wicked - MVP

Este projeto é um MVP (Minimum Viable Product) de um jogo de combate medieval isométrico 3D com sensação de combate soulslike e suporte a multiplayer coop (previsto para fases futuras). O visual do jogo é focado em um estilo minimalista ultra low-poly / stick fighter.

## Estrutura do Monorepo

- `client/`: Jogo web rodando no navegador (Vite + TypeScript + Three.js).
- `server/`: Servidor de estado e multiplayer (Node.js + TypeScript + Colyseus).
- `docs/`: Documentações adicionais do projeto.
- `md/`: Especificações originais fornecidas para o desenvolvimento.

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm

### Passos para Rodar

1. **Instalar Dependências**:
   No diretório raiz do projeto, execute:
   ```bash
   npm run install:all
   ```

2. **Iniciar em Modo de Desenvolvimento**:
   Para rodar o cliente e o servidor ao mesmo tempo em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   * O cliente Vite estará rodando em: `http://localhost:5173`
   * O servidor Colyseus estará rodando em: `http://localhost:2567`

### Execução Individual

Se preferir rodar os ambientes separadamente, use:
- **Client**: `npm run dev:client`
- **Server**: `npm run dev:server`

## Fases Implementadas

- **Fase 0 — Setup do Projeto**: Configuração estrutural do monorepo, Vite, TypeScript, Colyseus base.
- **Fase 1 — Arena Offline Visual**: Arena de coliseu em Three.js contendo areia circular, braseiros ativos, iluminação de golden hour e dummy estático.
