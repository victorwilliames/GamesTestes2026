# @game2d — Herói Procedural 2D

Projeto de jogo de ação e aventura 2D HD com perspectiva elevada 3/4 fake 2.5D, estética autoral pintada/rabiscada e combate tático com lâminas acorrentadas. O desenvolvimento é 100% autônomo e procedural em **HTML5 Canvas 2D**, sem engines pesadas, sem WebGL e sem modelagem manual no Blender.

---

> [!IMPORTANT]
> **DIRETRIZES FUNDAMENTAIS DO PROJETO:**
> As instruções ativas e mandatórias de desenvolvimento estão consolidadas nos prompts em:
> - [`docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`](docs/prompts%20a%20executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md)
> - [`docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`](docs/prompts%20a%20executar/contexto-sobre-a-arma-do-hero.md)

---

## Estado Atual do Projeto — Fase 1

O projeto encontra-se na **Fase 1: Reprodução do processo de Rafa + Claude e Conclusão do Herói Procedural**.

O pipeline caminha sobre quatro etapas integradas:
1. **Fidelidade Visual:** Herói reconstruído via Canvas 2D com alta fidelidade às peças oficiais (`hero-parts`), superando as referências aprovadas.
2. **Rig e Animações:** Esqueleto matemático, pivôs locais, rig de membros, idle, passada de corrida/caminhada, ataques e transições.
3. **Arena de Testes e Combate:** Arena jogável no navegador, controles WASD, ataques com as adagas do caos, combos encadeados e inimigos de teste que tomam dano e reagem ao impacto.
4. **Refinamento e Performance:** Ajuste de hitboxes, fluidez, estabilidade e garantia do piso inegociável de 200 FPS.

---

## Linha de Base — Protótipos Aprovados

O desenvolvimento toma como linha de base técnica e visual os dois protótipos aprovados:
- **ChatGPT:** [`prototypes/chatgpt/desenho-v1-chatgpt/`](prototypes/chatgpt/desenho-v1-chatgpt/)
- **Antigravity:** [`prototypes/antigravity/desenho-v1-antigravity/`](prototypes/antigravity/desenho-v1-antigravity/)

> [!NOTE]
> Demais experimentos e estudos prévios que não atingiram os critérios de aprovação foram arquivados em [`prototypes-nao-aprovados/`](prototypes-nao-aprovados/).

---

## Metodologia de Referência

A metodologia técnica de sucesso tem como fonte primária a conversa integral mantida entre Rafa e Claude durante a construção do Dunloc e do piloto procedural:
- **Investigação obrigatória:** [`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/`](RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/)

---

## Referências Oficiais Ativas

- **Herói (Rosto, Corpo, Armas):** [`assets/references/ref-2d-hero/hero-parts/`](assets/references/ref-2d-hero/hero-parts/)
- **Cena, Ilha e Escala de Combate:** [`assets/references/ref-2d-maps/map-island-enemys.png`](assets/references/ref-2d-maps/map-island-enemys.png)

---

## Identidade do Herói e Armas

- **Herói:** Rogue / Thief / Assassin / Stealth chibi muito cabeçudo, musculoso, sem camisa, capa e cachecol vermelhos, caveira única no cinto frontal.
- **Armas:** Diretamente inspiradas nas **Blades of Chaos (Lâminas do Caos)** de Kratos (God of War).
- **REGRA ABSOLUTA:** **AS ARMAS NÃO SÃO MACHADOS.** São duas grandes adagas/facas gigantes curvas, agressivas, ensanguentadas e incandescentes (fogo em laranja/vermelho/amarelo, metal escuro queimado).
- **Correntes:** Elos metálicos grossos de ferro envelhecido, permanentemente conectados ao pomo e enrolados nos pulsos e antebraços com oclusão correta.
- **Mãos e Empunhaduras:** As mãos devem realmente agarrar o cabo da adaga, com dedos e polegar fechando a pegada de forma anatomicamente coerente.
- **Renderer Único:** O mesmo renderer procedural em Canvas 2D desenha as armas estáticas e durante qualquer golpe, sem simplificações ou substituição por PNGs.

---

## Regra de Ouro de Performance

- **Piso e Meta:** **200 FPS** em 1280 × 720 (buffer nativo, sem limitador de vsync).
- **Hardware Alvo:** Navegador de PC e dispositivos móveis na faixa de um **Samsung Galaxy S20 FE ou inferior**.
- Abaixo de 200 FPS, a entrega é reprovada tecnicamente, independente do acabamento visual.

---

## Documentação Chave

- [`AGENTS.md`](AGENTS.md) — Regras mandatórias para agentes e IAs.
- [`PROJECT.md`](PROJECT.md) — Princípios de produto, escopo e requisitos.
- [`docs/HANDOFF.md`](docs/HANDOFF.md) — Guia de continuidade técnica e status do projeto.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — Registro histórico de decisões e regras consolidadas.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — As 4 etapas da Fase 1 e portões de aceite.
