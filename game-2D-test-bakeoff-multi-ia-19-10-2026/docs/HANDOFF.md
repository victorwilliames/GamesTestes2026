# Handoff Operacional do @game2d

**Última consolidação:** 19/10/2026.
Este arquivo é o resumo executivo e imediato para qualquer agente novo que entrar no projeto.

---

> [!IMPORTANT]
> **REGRA DE OURO DO PROJETO:**
> **SÓ O QUE VALE É O QUE ESTÁ ESCRITO NOS PROMPTS EM:**
> `docs/prompts a executar/`
>
> 1. [`docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`](prompts%20a%20executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md)
> 2. [`docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`](prompts%20a%20executar/contexto-sobre-a-arma-do-hero.md)
>
> Todas as instruções antigas, notas dispersas e relatórios anteriores foram unificados e subordinados a esses dois documentos.

---

## 1. Missão Vigente — Fase 1: Concluir o Herói Procedural

Reproduzir o processo técnico que **Rafa e Claude** utilizaram para construir seu jogo procedural, aproveitando os melhores avanços dos nossos protótipos aprovados, e concluir nosso herói em **HTML5 Canvas 2D** através das **Quatro Etapas**:

- **Etapa 1:** Recriar o herói com alta fidelidade visual às referências oficiais (`hero-parts`), superando a linha de base aprovada.
- **Etapa 2:** Rig esquelético matemático e animações completas (idle, passada de corrida/caminhada, ataques e transições).
- **Etapa 3:** Arena de testes jogável no navegador, controles WASD, ataques, combos encadeados e inimigos de teste que tomam dano e reagem ao impacto.
- **Etapa 4:** Correções, refinamento de hitboxes e cumprimento da meta inegociável de 200 FPS.

---

## 2. Linha de Base — Protótipos Aprovados

Nossas principais referências de qualidade técnica e visual são exclusivamente:
- **ChatGPT:** [`prototypes/chatgpt/desenho-v1-chatgpt`](../prototypes/chatgpt/desenho-v1-chatgpt/)
- **Antigravity:** [`prototypes/antigravity/desenho-v1-antigravity`](../prototypes/antigravity/desenho-v1-antigravity/)

> [!CAUTION]
> Experimentos anteriores rejeitados foram arquivados em [`prototypes-nao-aprovados/`](../prototypes-nao-aprovados/). **Não devem ser usados como referência de qualidade.**

---

## 3. Investigação Obrigatória de Metodologia

Estudar meticulosamente a conversa original de Rafa e Claude:
- **Caminho:** [`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural`](../RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/)
- Identificar as decisões de arquitetura, a ordem de montagem das peças, a formulação do rig, os erros enfrentados e como foram solucionados.

---

## 4. Referências Visuais Oficiais

- **Herói Oficial (Peças Anatômicas e Armas):**
  - [`assets/references/ref-2d-hero/hero-parts/`](../assets/references/ref-2d-hero/hero-parts/)
  - Peças: `hero-part-head.png`, `hero-part-body.png`, `hero-part-body-tpose.png`, `hero-part-weapons.png`.
  - Dispomos da tríade completa: **ROSTO + CORPO + ARMA**.
- **Cena, Arena e Escala de Combate:**
  - [`assets/references/ref-2d-maps/map-island-enemys.png`](../assets/references/ref-2d-maps/map-island-enemys.png).

---

## 5. Diretrizes Absolutas da Arma, Mãos e Correntes

- **Identidade:** Rogue / Thief / Assassin / Stealth.
- **Inspiração:** Visualmente inspiradas nas **Blades of Chaos (Lâminas do Caos)** de Kratos (God of War).
- **REGRA ABSOLUTA: AS ARMAS NÃO SÃO MACHADOS.** São duas **grandes adagas/facas curvas gigantes, sangrentas, incendiárias e infernais** (metal escuro queimado, fogo laranja/vermelho/amarelo, riscos de sangue, dentes internos).
- **Mãos e Pegada:** As mãos devem **realmente segurar** o cabo da arma (dedos e polegar fechando a empunhadura, oclusão correta, sem flutuação). Ponto de ancoragem fixo e compartilhado.
- **Correntes Infernais:** Elos individuais, robustos e volumosos de ferro escuro envelhecido; enroladas nos pulsos e antebraços com voltas visíveis pela frente e por trás; presas permanentemente ao pomo.
- **Renderer Único:** O mesmo código Canvas 2D desenha as armas paradas e em movimento, sem simplificações ou troca por PNGs.
- **Não Recomeçar do Zero:** Preservar a geometria de lâmina já aprovada, corrigindo principalmente as mãos e correntes.

---

## 6. Regra de Isolamento e Entregáveis

- Cada IA desenvolve apenas na sua própria pasta atribuída em `prototypes/<ia>/`.
- Proibido modificar código de outras IAs ou arquivos compartilhados da raiz durante o trabalho em sua pasta.
- Cada IA deve criar a pasta `AVALIACAO-IA/` em seu diretório contendo:
  - `01-DIAGNOSTICO-INICIAL.md`
  - `02-CRONOLOGIA-RAFA-CLAUDE.md`
  - `03-COMPARATIVO-DOS-APROVADOS.md`
  - `04-FIDELIDADE-VISUAL.md`
  - `05-IMPLEMENTACAO-E-RIG.md`
  - `06-ARENA-E-COMBATE.md`
  - `07-TESTES-E-VALIDACAO.md`
  - `08-ENTREGA-AO-JUIZ.md`

---

## 7. Performance e Regras Globais

- **Meta e Piso Inegociável:** **200 FPS** em **1280 × 720** (PC e mobile na faixa de um S20 FE ou mais fraco).
- Ambiente 100% focado no repositório GitHub, integridade de arquivos locais e execução no navegador. Nenhum fluxo externo de deploy ou sincronização de banco de dados é utilizado.
