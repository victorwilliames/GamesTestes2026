# AGENTS.md — Instruções de trabalho do @game2d

Este arquivo é a porta de entrada obrigatória para qualquer agente de IA (ChatGPT, Claude, Antigravity, DeepSeek ou outros).

---

> [!IMPORTANT]
> **REGRA FUNDAMENTAL E VIGENTE DE PROJETO:**
> **SÓ O QUE VALE É O QUE ESTÁ ESCRITO E DETERMINADO NOS PROMPTS EM:**
> `docs/prompts a executar/`
>
> 1. `docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md` (Missão principal, metodologia Rafa + Claude, protótipos aprovados, isolamento e 4 etapas de execução).
> 2. `docs/prompts a executar/contexto-sobre-a-arma-do-hero.md` (Identidade e arquitetura mandatória das armas, correntes e pegada das mãos).
>
> Todas as instruções, documentações e decisões do repositório devem seguir rigorosamente esses dois documentos.

---

## 1. Missão Principal — Herói Procedural Completo

Estamos desenvolvendo um herói 2D em **HTML5 Canvas 2D** com geração e montagem procedural, rig, animações e combate.
O objetivo é reproduzir meticulosamente o processo comprovado de **Rafa e Claude** (`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural`), aproveitando também os melhores avanços já alcançados pelos nossos protótipos aprovados.

O fluxo de entrega obrigatório compreende as **Quatro Etapas**:
1. **ETAPA 1 — Recriar o herói com fidelidade visual:** Preservar rosto, corpo e arma das referências oficiais (`hero-parts`), alcançando qualidade igual ou superior aos aprovados.
2. **ETAPA 2 — Rig e animações procedurais:** Hierarquia anatômica, pivôs locais, cabeça, tronco, braços, pernas, adagas acorrentadas, idle, caminhada/corrida, ataques e transições fluidas.
3. **ETAPA 3 — Mapa de testes, inimigos e combos:** Arena jogável no navegador, controles direcionais (WASD), ataques encadeados em combos, inimigos de teste que tomam dano e reagem ao impacto.
4. **ETAPA 4 — Correções, refinamento e 200 FPS:** Ajuste de hitboxes, fluidez, física de correntes e cumprimento inegociável da meta de performance.

---

## 2. Linha de Base — Protótipos Aprovados

Existem exatamente **duas implementações aprovadas** que constituem nossa referência prioritária de qualidade visual e técnica:

- **REFERÊNCIA A — CHATGPT:** `prototypes/chatgpt/desenho-v1-chatgpt`
- **REFERÊNCIA B — ANTIGRAVITY:** `prototypes/antigravity/desenho-v1-antigravity`

Essas duas versões demonstraram os melhores resultados visuais e de engenharia até o momento. **Qualquer IA deve examiná-las, reutilizar seus componentes tecnicamente compatíveis e igualar ou superar seus resultados.**

> [!CAUTION]
> **Outros protótipos em `prototypes-nao-aprovados/` foram rejeitados.** Não os utilize como referência de qualidade ou base artística.

---

## 3. Regra de Isolamento entre IAs

Cada IA trabalha exclusivamente dentro da sua própria pasta atribuída (ex.: `prototypes/antigravity/`, `prototypes/chatgpt/`, `prototypes/deepseek/`).

- **Permitido:** Ler protótipos aprovados, copiar código/algoritmos úteis para sua pasta, reutilizar assets compartilhados, testar e medir.
- **Proibido:** Modificar ou apagar pastas de outras IAs; sobrescrever protótipos de terceiros; alterar arquivos compartilhados da raiz durante sua execução; depender de caminhos externos para executar sua entrega; comandos Git destrutivos.
- Cada IA deve produzir sua entrega completa dentro de sua pasta, incluindo a pasta **`AVALIACAO-IA/`** com os entregáveis `01` a `08`.

---

## 4. Referências Oficiais do Nosso Herói

As referências canônicas ativas e obrigatórias estão em:
- **`assets/references/ref-2d-hero/hero-parts/`** (`hero-part-head.png`, `hero-part-body.png`, `hero-part-body-tpose.png`, `hero-part-weapons.png`).
  - Temos **ROSTO + CORPO + ARMA** oficiais (ao contrário do caso do Rafa, que tinha apenas o rosto).
- **`assets/references/ref-2d-maps/map-island-enemys.png`** (Composição da ilha tropical, arena de combate e escala de inimigos em perspectiva 3/4 fake 2.5D).

---

## 5. Regras Mandatórias das Armas, Mãos e Correntes

Conforme definido em `docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`:

1. **Identidade do Herói:** Rogue / Thief / Assassin / Stealth.
2. **Inspiração Direta:** Visualmente inspiradas nas **Blades of Chaos (Lâminas do Caos)** de Kratos (God of War).
3. **REGRA ABSOLUTA: AS ARMAS NÃO SÃO MACHADOS.** São duas **grandes adagas/facas curvas gigantes, sangrentas, incendiárias e infernais**. Não transformá-las em machados, foices ou espadas retas.
4. **Geometria & Materiais:** Lâmina curva e agressiva, ponta afiada, fio externo e recortes dentados internos; metal escuro queimado/grafite, sangue em manchas/riscos, fogo e incandescência em laranja, vermelho e amarelo; cabos em couro escuro e elementos metálicos na guarda/pomo. Sem gradientes vetoriais simples.
5. **Correntes Infernais Permanentes:** Conectadas permanentemente ao pomo e aos braços do herói; elos individuais, volumosos e metálicos de ferro escuro/queimado; enroladas nos pulsos e antebraços em múltiplas voltas passando pela frente e por trás; nunca desenhar como linhas simples ou cordões.
6. **Mãos e Empunhaduras (CRÍTICO):** As mãos devem **realmente segurar** as empunhaduras (dedos envolvendo o cabo, polegar fechado, oclusão correta, sem flutuar ou atravessar a geometria). Ponto de empunhadura fixo e compartilhado em coordenadas locais.
7. **Continuidade de Renderização:** O **mesmo renderer procedural em Canvas 2D** deve desenhar as armas paradas e em movimento. Proibido substituir por spritesheets, PNGs ou simplificar detalhes durante ataques.
8. **Não Começar do Zero:** Preservar as geometrias de lâmina aprovadas de ChatGPT/Antigravity, aprimorando mãos, empunhaduras e correntes.

---

## 6. Regra de Ouro de Performance (200 FPS)

- **Meta e Piso Inegociável:** **200 FPS**. Nenhuma entrega é declarada pronta abaixo de 200 FPS no ambiente declarado.
- **Portabilidade Obrigatória:** PC navegador e celular na faixa de um **Galaxy S20 FE ou mais fraco**. Quando não houver dispositivo físico para testar, declarar expressamente *“não testado neste hardware”*.
- **Medição Oficial:** Resolução **1280 × 720**, buffer nativo, sem cap de vsync. Registrar FPS médio, p95, p99 e draw time.
- Otimizar o render (cache offscreen, determinismo) antes de adicionar complexidade desnecessária.

---

## 7. Diretrizes Globais Obrigatórias

- **Ambiente 100% Local e GitHub:** O trabalho é 100% focado no repositório GitHub, integridade de arquivos e execução no navegador. Nenhum fluxo externo de deploy ou sincronização de banco de dados é utilizado.
- **Sem Blender / Sem Rigs 3D Tradicionais:** Todo o sistema de desenho, projeção 3/4 fake 2.5D e animação é procedural em HTML5 Canvas 2D puro.
- **Entregáveis Documentados:** Toda IA deve gerar a pasta `AVALIACAO-IA/` com os relatórios `01` a `08` e evidências reais capturadas no navegador.
