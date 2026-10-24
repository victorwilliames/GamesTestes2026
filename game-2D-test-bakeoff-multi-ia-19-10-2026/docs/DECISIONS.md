# Registro de Decisões — @game2d

Este documento registra decisões consolidadas, hipóteses testadas e direcionamentos substituídos. Novas atualizações devem registrar a evolução das decisões sem apagar o histórico de aprendizado.

---

## 2026-10-19 — Consolidação Mandatória da Fase 1 (Prompts Oficiais)

- **Decidido pelo Usuário:** Apenas as instruções e requisitos estabelecidos nos prompts em `docs/prompts a executar/` são vigentes e mandatórios para o projeto:
  1. `docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`
  2. `docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`
- **Decidido:** A stack e arquitetura oficial para o herói é **HTML5 Canvas 2D procedural autoral** (geração e animação por código, sem Blender nem WebGL).
- **Decidido:** A metodologia de referência principal é a reconstituição técnica da conversa de **Rafa e Claude** (`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural`).
- **Decidido:** Os protótipos aprovados vigentes que servem de linha de base técnica e visual são exclusivamente:
  - `prototypes/chatgpt/desenho-v1-chatgpt`
  - `prototypes/antigravity/desenho-v1-antigravity`
  - Todos os demais protótipos anteriores foram arquivados em `prototypes-nao-aprovados/` e não devem ser usados como referência de qualidade.
- **Decidido:** As referências visuais oficiais para o herói são as peças modulares em `assets/references/ref-2d-hero/hero-parts/` (dispondo de Rosto, Corpo e Armas). Para a cena e arena de combate, a referência é `assets/references/ref-2d-maps/map-island-enemys.png`.
- **Decidido:** A entrega deve seguir o ciclo obrigatório das **Quatro Etapas**:
  - Etapa 1: Reconstrução do herói com fidelidade visual.
  - Etapa 2: Rig e animações procedurais completas.
  - Etapa 3: Arena de testes jogável, controles WASD, adagas, combos e inimigos de teste que tomam dano.
  - Etapa 4: Correções, refinamento e 200 FPS.
- **Decidido:** Cada IA deve trabalhar em sua pasta própria (`prototypes/<ia>/`) e gerar a pasta de avaliação `AVALIACAO-IA/` com relatórios `01` a `08`.

---

## 2026-10-19 — Diretrizes Mandatórias das Armas, Mãos e Correntes

- **Decidido:** O herói tem identidade de **Rogue / Thief / Assassin / Stealth**.
- **Decidido:** As armas são diretamente inspiradas nas **Blades of Chaos (Lâminas do Caos)** de Kratos (God of War).
- **REGRA ABSOLUTA:** **AS ARMAS NÃO SÃO MACHADOS.** São duas grandes adagas/facas gigantes curvas, sangrentas, incendiárias e infernais.
- **Decidido:** Materiais e acabamento de metal escuro queimado/grafite, incandescência em laranja/vermelho/amarelo, marcas e riscos de sangue, ranhuras e dentes na borda interna.
- **Decidido:** Correntes permanentes presas ao pomo das lâminas e aos braços do herói, com elos individuais robustos de ferro envelhecido, enroladas nos pulsos e antebraços com oclusão correta.
- **Decidido:** As mãos devem **realmente agarrar** as empunhaduras (dedos e polegar envolvendo o cabo, pontos de fixação anatômica compartilhados).
- **Decidido:** O mesmo renderer procedural Canvas 2D deve desenhar as armas estáticas e em movimento.

---

## 2026-10-19 — Regra de Ouro de Performance (Piso 200 FPS)

- **Decidido pelo Usuário:** A meta e piso inegociável é de **200 fps** em **1280 × 720** nativo, sem cap de vsync.
- **Portabilidade Obrigatória:** PC no navegador e celulares na faixa de um **Samsung Galaxy S20 FE ou inferior**.
- Abaixo de 200 FPS no ambiente de teste declarado, o critério técnico falha automaticamente.

---

## 2026-10-19 — Governança e Diretrizes Globais

- **Decidido:** O foco do trabalho é 100% no repositório local, integridade de código, navegador e GitHub. Nenhum fluxo externo de deploy ou sincronização de banco de dados é utilizado.
- **Decidido:** Todo o processo deve ser reproduzível e auditável com capturas reais de tela e relatórios detalhados.
