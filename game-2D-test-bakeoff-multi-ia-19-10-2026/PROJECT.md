# @game2d — Contexto, Princípios e Objetivos

## Propósito

Desenvolver um jogo autoral de ação/aventura com elementos roguelike, com **identidade visual premium reconhecível**, **perspectiva elevada 3/4 fake 2.5D** e **produção predominantemente procedural automatizável por agentes de IA em HTML5 Canvas 2D**.
O projeto dispensa softwares pesados 3D (sem Blender, sem rigs 3D tradicionais) e WebGL, baseando-se em geração matemática e renderização vetorial orgânica por código.

---

## Princípios de Produto

1. **2D HD com Perspectiva Fake 2.5D:** Desenho e interações no plano 2D sob câmera elevada 3/4 (estilo Hades). Projeções matemáticas de profundidade e oclusão geradas em tempo de execução.
2. **Arte Procedural Autoral:** Renderização por código com contornos orgânicos, sombreamento expressivo em camadas, materiais escuros queimados, sangue, fogo e textura tátil.
3. **Combate Tático e Brutal:** Combate ágil e pesado com duas grandes lâminas acorrentadas inspiradas visualmente nas **Blades of Chaos de Kratos (God of War)**. **REGRA ABSOLUTA: AS ARMAS NÃO SÃO MACHADOS.** São grandes adagas assassinas curvas, ensanguentadas e incandescentes.
4. **Leveza e Portabilidade Extrema (200 FPS Inegociável):** O jogo deve rodar com taxa mínima de **200 fps** em resolução nativa **1280 × 720** no navegador de PC e em smartphones na faixa de um **Samsung Galaxy S20 FE ou inferior**.
5. **Metodologia Comprovada (Rafa + Claude):** A engenharia procedural segue o processo validado em [`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural`](RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/).
6. **Linha de Base Técnica e Visual:** O desenvolvimento toma como referência mínima de qualidade os protótipos aprovados:
   - ChatGPT: `prototypes/chatgpt/desenho-v1-chatgpt`
   - Antigravity: `prototypes/antigravity/desenho-v1-antigravity`
7. **Isolamento de Desenvolvimento entre IAs:** Cada modelo trabalha em sua pasta atribuída em `prototypes/<ia>/`, gerando sua documentação em `AVALIACAO-IA/` sem interferir nos diretórios de outros agentes.
8. **Governança:** Repositório local e GitHub oficial como únicas fontes de verdade. O foco do trabalho é 100% no código local, integridade de arquivos e execução no navegador.

---

## Escopo Atual — Fase 1 (As Quatro Etapas)

Conforme estabelecido em `docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`:

- **ETAPA 1 — Recriação do Herói com Fidelidade Visual:**
  - Fontes oficiais: `assets/references/ref-2d-hero/hero-parts/` (Rosto, Corpo, Armas).
  - Igualar ou superar o visual das referências aprovadas (ChatGPT e Antigravity).
  - Lâminas do caos assassinas, mãos agarrando as empunhaduras de verdade e correntes enroladas nos antebraços.

- **ETAPA 2 — Rig e Animações Procedurais:**
  - Hierarquia de pivôs locais (cabeça, tronco, ombros, braços, pulsos, pernas, pés).
  - Ciclos de idle, caminhada/corrida com passada e contato firme no chão (foot lock).
  - Animações de ataque (cortes rápidos, cruzados, estocadas, ataques giratórios e arremesso de correntes).
  - Mesma geometria e materiais das armas paradas e em movimento.

- **ETAPA 3 — Arena de Testes, Inimigos e Combos:**
  - Arena jogável no navegador baseada em `assets/references/ref-2d-maps/map-island-enemys.png`.
  - Controles WASD e ataques por teclado/mouse.
  - Inimigos de teste interativos que reagem aos golpes e tomam dano.
  - Encadeamento de combos e detecção real de acertos (hitboxes e hurtboxes).

- **ETAPA 4 — Correções, Refinamento e 200 FPS:**
  - Ajuste de hitboxes, fluidez e timings de recuperação.
  - Polimento visual das correntes e mãos.
  - Testes rigorosos de estabilidade e verificação do piso de 200 FPS em 1280 × 720.

---

## Critérios de Sucesso

- O herói deve ser reconhecido imediatamente como um assassino chibi empunhando duas grandes adagas infernais acorrentadas aos braços (Blades of Chaos style).
- Mãos agarrando as armas com dedos e polegar modelados e oclusão correta.
- Correntes visivelmente volumosas com elos de ferro escuro enroladas nos braços.
- Transições de animação sem saltos nem desconexão anatômica.
- Arena de combate interativa com inimigos funcionais.
- 200 FPS sustentados no teste oficial sem cap de vsync.
