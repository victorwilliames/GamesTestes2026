# Em 5 minutos: o que aprendemos com Rafael e o que fazer agora

**Para:** ChatGPT, Claude, Antigravity, DeepSeek e qualquer agente no @game2d.

---

> [!IMPORTANT]
> **DIRETRIZ MANDATÓRIA VIGENTE:**
> As instruções ativas para reprodução do método de Rafa e Claude estão consolidadas no prompt:
> [`docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`](../docs/prompts%20a%20executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md)

---

## 1. Fonte Primária Absoluta

A investigação obrigatória de como Rafa e Claude construíram o projeto procedural está documentada na conversa na íntegra:
- **[`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/`](CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/)**

A qualidade do projeto não veio de um único prompt mágico. A conversa registra **7 mensagens humanas, 55 respostas do Claude, 594 ações, 170 imagens e 6 relatórios de crítico**, mostrando um processo metódico de implementação, testes, correções e refinamento.

---

## 2. Linha de Base Aprovada

Para não começar do zero, o projeto possui dois protótipos aprovados como referência técnica e visual:
- **ChatGPT:** `prototypes/chatgpt/desenho-v1-chatgpt`
- **Antigravity:** `prototypes/antigravity/desenho-v1-antigravity`

*Demais protótipos anteriores foram arquivados em `prototypes-nao-aprovados/`.*

---

## 3. As Quatro Etapas Obrigatórias de Execução

1. **ETAPA 1 — Recriar o herói com fidelidade visual:**
   - Referências oficiais: `assets/references/ref-2d-hero/hero-parts/` (Rosto + Corpo + Arma).
   - Igualar ou superar o visual de ChatGPT e Antigravity aprovados.
2. **ETAPA 2 — Rig e animações procedurais:**
   - Hierarquia de membros e pivôs em Canvas 2D, idle, passada de corrida/caminhada e ataques com adagas.
3. **ETAPA 3 — Mapa de testes, inimigos e combos:**
   - Arena funcional jogável no navegador, movimentação WASD, combos de ataque e inimigos de teste que tomam dano e reagem ao impacto.
4. **ETAPA 4 — Correções, refinamento e 200 FPS:**
   - Ajuste fino de hitboxes, fluidez, estabilidade e validação do piso inegociável de 200 FPS a 1280 × 720.

---

## 4. Diretrizes das Armas e Mãos

Conforme `docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`:
- Inspiração direta: **Blades of Chaos (Lâminas do Caos)** de Kratos (God of War).
- **REGRA ABSOLUTA: NÃO SÃO MACHADOS.** São grandes adagas assassinas sangrentas e incandescentes acorrentadas aos braços.
- As mãos devem segurar o cabo de verdade (dedos e polegar envolvendo a empunhadura).
- Correntes grossas de ferro escuro enroladas nos pulsos e antebraços com elos individuais.
- O mesmo renderer em Canvas 2D desenha o herói parado e em movimento.
