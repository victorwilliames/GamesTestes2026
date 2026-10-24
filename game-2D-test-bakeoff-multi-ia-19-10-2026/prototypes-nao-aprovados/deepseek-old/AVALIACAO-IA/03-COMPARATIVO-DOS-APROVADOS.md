# 03 — COMPARATIVO TÉCNICO E VISUAL DOS PROTÓTIPOS APROVADOS

Os dois protótipos aprovados são referência **prioritária de qualidade**, não base de código para
copiar. Este documento registra o que cada um provou, o que eu aproveitei como **ideia de
arquitetura** e o que a minha entrega acrescenta.

| | **REFERÊNCIA A — ChatGPT** | **REFERÊNCIA B — Antigravity** | **ESTA ENTREGA — DeepSeek** |
|---|---|---|---|
| Arquivo executável | `index.html` (≈42 kB) com 8 módulos inline | `index.html` (≈305 kB) + `bundle.js` (≈284 kB) | `index.html` (≈189 kB) com 11 módulos inline |
| Build | `tools/build_standalone.py` (Python) | `build-bundle.mjs` (Node) | `tools/build.mjs` (Node) |
| Fontes | `src/` (ES Modules) + `dev.html` | `src/` (11 módulos) | `src/00-core.js` … `10-game.js` (11 módulos) |
| `file://` duplo clique | Sim, inline; **confirmação pendente** no README | Sim, inline sem `type="module"` | **Sim, verificado por CDP** (o build não usa módulos) |
| Evidência | `evidence/`, `reference-preview/` | `screenshots/` (10 × 1280×720 via Edge headless CDP) | `screenshots/` (capturas CDP, `tools/shot.mjs`) |
| Rig | presets estáticos de pose (sem RIG real) | `RigAdapter` + 5 poses RIG-01 | `DS.fk` (FK) + 8 poses procedurais contínuas |
| Pegada da mão | mão por cima da empunhadura | **sanduíche em 2 camadas** (palma atrás → cabo → dedos/polegar) | **mesmo sanduíche** (`drawHandGrip` `back`/`front`) |
| Armas | painter refeito: dentes internos, chapa, metal incandescente, cabo, correntes | "asa de aço" + núcleo vulcânico + fendas de fogo + elos | adaga curva com halo emissivo, sangre, recortes, cabo de couro, correntes de elos |
| Ordem de desenho | — | **11 camadas Z** documentadas | braço de trás → tronco → cabeça → braço da frente; props/inimigos por Y |
| Performance | ~200 ms no 1º render e ~15 ms nos redesenhos (ambiente de teste, não homologado) | **avgDraw 1,7 ms · p95 2,5 ms · avgFps 588 · p95Fps 400 · p99Fps 47** (1280×720, 240 quadros) | **draw EMA 1,0–1,45 ms (cena limpa) · laço fechado 5,425 ms → 184,3 FPS (4) · 6,104 ms → 163,8 FPS (8)** — e 224,9/203,0 no mesmo build antes da degradação da máquina |
| Autoavaliação | fidelidade estática **REPROVADA**; integridade técnica aprovada em teste in-memory | relatório de fidelidade próprio + 9 documentos em `AVALIACAO-IA/` | `04` e `07` deste pacote, com falhas declaradas |
| Escopo | laboratório de personagem (poses estáticas) | laboratório de personagem + RIG-01 de prova | **jogo**: arena, inimigos, combos, HUD, câmera, FX |

---

## 1. O que a Referência A (ChatGPT) provou

**Acertos que se tornaram requisito de projeto:**

1. **Entrega autocontida.** O `index.html` inline resolve o bloqueio de CORS em `file://` — o mesmo
   problema que eu resolvi concatenando `src/*.js` em um único `<script>` clássico.
2. **A arma obedece à transformação local do braço.** O README V1.2 declara: *"Armas agora obedecem
   a mesma transformação local dos braços, sem recalcular um posicionamento isolado incompatível com
   a mão"*. Esse é exatamente o bug que eu tinha na primeira versão (a lâmina "flutuando" fora da
   mão) — foi corrigido colocando a arma no espaço local do punho (`wrist` → `rotate(wa)` → arte).
3. **A mesma arte em todas as poses.** *"Presets `run` e `attack` compartilham este painter, sem
   sprites."* Na minha entrega isso foi levado ao jogo inteiro: **um** `DS.drawHero` desenha idle,
   corrida, ataque, dano e morte.
4. **Cache procedural.** Seis buffers cacheados por peça; o primeiro render é caro e os seguintes
   baratos. Eu medi esse mesmo fenômeno (build da arma ≈ 180 ms no primeiro toque) e resolvi com
   **pré-aquecimento explícito** (`DS.warmup`).

**Limites declarados pelo próprio autor:** fidelidade estática reprovada, fidelidade sob articulação
não validada, sem RIG real. Ou seja: a Referência A é forte em **pipeline de pintura** e fraca em
**rig/animação** — que é justamente onde eu concentrei o esforço.

**O que eu NÃO reaproveitei:** o `reference-preview` (PNG da referência num `<img>`) e o
`tools/qa_v2.py` (depende de Playwright/Python). Minha entrega não carrega nenhum PNG em runtime e
minhas ferramentas são Node puro.

---

## 2. O que a Referência B (Antigravity) provou

**Acertos que se tornaram requisito de projeto:**

1. **Sanduíche anatômico do grip** (camada 7.5 palma/pulso atrás → camada 8 cabo/guarda → camada 9
   dedos e polegar na frente). É a solução correta para "a mão segura de verdade" e eu a adotei
   literalmente na ordem de desenho (`drawHandGrip(ctx, side, 'back'|'front')`).
2. **Camadas Z explícitas** (11 no total). Eu uso a mesma ideia em duas escalas: no herói
   (braço de trás → tronco → cabeça → braço da frente) e no mundo (props e inimigos ordenados por Y
   em relação ao herói).
3. **Materiais determinísticos** (giz pastel, couro, tecido, magma, aço) com sementes. Meu
   `DS.wash` + `DS.hatch` + `DS.rng(semente)` segue o mesmo princípio: mesma pose → mesmos pixels,
   sem cintilação.
4. **Medição no formato que o projeto adotou** (`avgDrawMs`, `p95DrawMs`, `p99DrawMs`, `avgFps`,
   `p95Fps`, `p99Fps`, 1280×720, 240 quadros). Eu mantive **exatamente esse formato** nos modos
   `?bench` e `?benchloop` para permitir comparação direta.
5. **Documentação de entrega** em 9 arquivos + screenshots reais. Estrutura que eu segui (8 docs
   obrigatórios + README).

**O que a Referência B não é:** um jogo. É um laboratório de personagem com UI de inspeção (4 modos,
5 poses, multiescala). Não há arena, inimigos, combos, hitboxes de arma em movimento nem câmera.

**Comparação de performance (mesmo formato, mesma máquina, headless):**

| Métrica | Antigravity | DeepSeek (esta entrega) |
|---|---|---|
| draw médio | 1,7 ms | **1,0–1,45 ms** (EMA; 4 inimigos) |
| p95 draw | 2,5 ms | não publicado separadamente (o bench publica percentis de FPS/quadro) |
| avg FPS (headless) | 588 | **taxa de parede 139,0** (4) · **124,4** (8) — com *stalls*; **252,0 / 147,7** excluindo quadros > 100 ms |
| p95 FPS | 400 | 101,0 (4) · 18,1 (8), sobre os quadros sem stall |
| Custo de quadro completo em laço fechado | não publicado | **5,425 ms (184,3 FPS)** · **6,104 ms (163,8 FPS)** na suíte final; o mesmo build já mediu **4,447 ms (224,9)** e **4,920 ms (203,0)** antes de o ambiente degradar |

> A comparação de **draw** é a mais justa entre os dois: mede o custo do renderer. A de **FPS
> sustentado** depende do compositor do ambiente e está documentada com ressalvas em `07`.

---

## 3. Avanços que eu aproveitei (resumo)

| Avanço | Origem | Como está na minha entrega |
|---|---|---|
| Bundle inline para `file://` | A e B | `tools/build.mjs` + `tools/shell.html` → `index.html` |
| Grip em 2 camadas | B | `04-weapon.js` → `drawHandGrip()` usado **dentro** do bitmap da arma |
| Z-order por camadas + Y-sort | B | `06-hero.js` (braços) e `10-game.js` (inimigos/props) |
| Materiais determinísticos com semente | A e B | `00-core.js` (`rng`, `wash`, `hatch`) |
| Cache offscreen do estático | A e B | `DS.part` para corpo, arma+mão, props, inimigos, HUD |
| Captura por navegador real | A e B | `tools/shot.mjs` + `tools/eval.mjs` (CDP, nunca `toDataURL`) |
| Formato de benchmark avg/p95/p99/draw | B | `?bench=N` e `?benchloop=1` dentro do jogo |

## 4. Avanços que esta entrega acrescenta

1. **O personagem virou jogo**: arena 6000×3800 u, câmera com clamp, 8 inimigos simultâneos, combos
   encadeados, hitstop, knockback, FX, HUD e morte/renascimento.
2. **Hitbox = desenho**: a janela ativa dos golpes testa os segmentos da lâmina **na mesma
   geometria** que foi pintada (`DS.bladeWorld` → `toWorld`). O que acerta na tela é o que acerta no jogo.
3. **Arma+mão cacheadas como UMA peça rígida**: mantém o painter procedural (nada de sprite) mas
   reduz o custo por quadro de **16,3 ms → 2,4 ms** no herói inteiro (medição no `microtest`).
4. **Cenário e inimigos "assados" na escala da tela** (`BAKE 0,36` / `0,50`): o laço fechado caiu de
   **11,6 ms → 4,7 ms** sem perder a arte procedural.
5. **Chão na escala exata do zoom** (`BS = PLAY = 0,24`): um blit 1:1, nítido e sem reamostragem.
6. **Bancada embutida** (`?bench`, `?benchloop`, `?sheet`, `?freeze`, `?debug`, `?spawn`, `?no`):
   o juiz pode reproduzir cada número e cada pose sem instalar nada.

## 5. Onde ainda perco para os aprovados

- **Turnaround**: o Antigravity oferece 4 orientações e 5 poses RIG-01; eu tenho **uma** vista 3/4
  fixa espelhada. É a maior lacuna técnica da minha entrega.
- **IK**: o Antigravity tem um adaptador de RIG; eu tenho FK com curvas. Sem IK de dois ossos, pés e
  mãos não se corrigem sozinhos em terreno irregular.
- **Polimento de pintura da cabeça**: o ChatGPT V1.2 e o Antigravity investiram muitas rodadas na
  cabeça; a minha ainda tem boca/orelhas abaixo do ideal (`04`).
