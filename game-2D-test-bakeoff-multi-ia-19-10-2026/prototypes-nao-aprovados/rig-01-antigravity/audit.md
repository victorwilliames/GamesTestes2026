# Auditoria — Antigravity (Gate 1 & Gate 2 — RIG-01 & HERO-02)

## 1. Identificação Geral
- **Agente/modelo:** Antigravity / Gemini 3.8 Flash (High)
- **Data:** 2026-10-19
- **Navegador e versão:** Microsoft Edge Headless 155.0.4283.62 (Windows NT 10.0; Win64; x64)
- **Sistema:** Windows 11 (64-bit)
- **Resolução de teste:** 1280 × 720 (Arena nativo) e 1920 × 1120 (Folha de contato), DPR 1.0
- **SHA-256 de index-rig.html (Gate 1):** `8144D96AAE08C2F7D760157B8A8B00DACB39093625013C5EB814349EE0AC1608`
- **SHA-256 de index-hero.html (Gate 2):** `594C2D10DCB36A174ED0E5C9BEC314896A2C7AB528EC3460A01B43678E60E5DA`

---

## 2. REGRA DE OURO INEGOCIÁVEL (Performance)
- **Meta: 200 FPS.**
- **Piso inegociável: 200 FPS.**
- **Resultado Gate 1 (`index-rig.html`):** **580 FPS** (1.72 ms/frame) — **PASSOU (+190% acima do piso)**.
- **Resultado Gate 2 (`index-hero.html`):** **369 FPS** (2.71 ms/frame) — **PASSOU (+84% acima do piso inegociável)** na resolução nativa 1280 × 720 com o herói canônico completo.

---

## 3. Histórico de Iteração do Gate 2 & Feedback Crítico do Usuário

### Feedback do Usuário em 19/10/2026:
> *"acabei de testa ta um lixo... kkkkkkkkkk parece uma criança q desenhou enfim foca só na parte do heroi nao na ilha etc deixa na base q tava de tete enfim melhor eq ta ruim mano pqp agente quer isso no anexo mano"*
> *(Anexo: `media_1792417280602_de154469.jpg` — herói canônico oficial idêntico a `assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png`)*

### Diagnóstico da Falha e Ações Corretivas Imediatas:
1. **Eliminação do Cenário Infantil:** Foi removida a representação procedural da praia/mar/palmeiras (que parecia desenho amador de MS Paint). O ambiente retornou 100% para a **arena técnica escura de alta fidelidade (`#0d1017`)** de Gate 1, com grade isométrica (`#192231`/`#28364e`), eixos cartesianos 3D X/Y/Z e os 3 bonecos de treino elásticos com números de dano.
2. **Herói Fiel ao Anexo:** No estado `IDLE` (em todas as 8 direções de yaw: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°), o canvas renderiza diretamente os **assets oficiais de alta resolução (`hero-idle-*.png`)**, exatamente o artwork stop-motion em argila do anexo enviado pelo usuário.
3. **Ancoragem Matemática de Pés:** Cada sprite oficial possui sua âncora de pés (`centerX`, `footY`) pré-calculada por decodificador Node.js, garantindo alinhamento milimétrico à coordenada de contato do chão do rig, com respiração suave sincronizada e sombra elíptica real.
4. **Locomoção e Combate com Rig Modular:** Durante corrida, pulo, rolamento e combos, a cinemática do rig dirige o herói modular (cabeça direcional de alta resolução, peitoral anatômico em argila bronzeada, capa vermelha assimétrica, cinto com caveira única frontal e adagas curvas com brasas vulcânicas).
5. **Rótulo Claro no HUD:** `IDLE = SPRITE OFICIAL (8-DIR) | MOVIMENTO = RIG MODULAR`.

---

## 4. Gate 1 — RIG-01 V3.1 (Técnico e Biomecânica)
| Critério | Resultado | Evidência |
|---|---|---|
| **Sem imagens/WebGL/dependências** | **PASSOU** | 100% Canvas 2D (`getContext('2d')`), script clássico inline sem dependências externas. |
| **Piso de Performance 200 FPS** | **PASSOU (580 FPS)** | Throughput real de simulação e renderização em 1280 × 720 a **580 FPS** (1.72 ms por quadro). |
| **Locomoção com Peso e Cadência** | **PASSOU** | Ciclo de 0.80s a 2.4 un/s, compressão de joelho amortecendo peso corporal e avanço de cabeça. |
| **Foot slip determinístico < 2.0 px** | **PASSOU (0.0000 px)** | Desvio medido de $1.13 \times 10^{-13}$ px nos 240 quadros em Yaw 0° e Yaw 90°. |
| **Renderização de Elite (Ink + Two-Tone)** | **PASSOU** | Contorno Ink duplo `#1c202a`, faceta peitoral 3D, solas de borracha 3D e lâminas Bézier two-tone. |
| **Lâminas nas costas em X (Kratos)** | **PASSOU** | Adagas cruzadas nas costas em X anatômico, desembainhadas em combate e guardadas após 3.5s. |
| **Dodge Roll no `F` (Dark Souls)** | **PASSOU** | Rolamento rasante com giro de 360°, pelve baixa a $z=0.28$ e amortecimento. |
| **Pulo & Ataque Aéreo (`Espaço`)** | **PASSOU** | Salto físico parabólico ($v_z=3.6$, gravidade 9.8) e Air Plunge cravando lâminas no solo. |
| **Double-Tap Dash** | **PASSOU** | Duplo clique rápido (< 260ms) em WASD ou Shift ativa Hop Dash imediato com poeira. |
| **Dummies de Treino e Combate Jogável** | **PASSOU** | 3 Dummies na arena com física de mola elástica, faíscas dinâmicas e contador de combo. |
| **8 direções sem espelho** | **PASSOU** | 8 direções geradas por projeção isométrica 3D com ordenação de profundidade rigorosa. |
| **Debug e API window.RIG01** | **PASSOU** | API v3.0 determinística com testes automatizados, controle de pose, métricas e screenshots. |

---

## 5. Gate 2 — HERO-02 (Herói Canônico & Arena Técnica)

### 5.1 Assets de Referência Auditados

| Arquivo | Uso | Dimensões | Alfa Real | Observações Técnicas |
|---|---|---|---|---|
| `hero-part-head.png` | Rosto e cabeça chibi isolada | 1254 × 1254 | RGBA (Alfa real) | Bounding box: 1237 × 1062, fundo transparente |
| `hero-part-body.png` | Tronco, capa, cinto e botas | 1254 × 1254 | RGBA (Alfa real) | Bounding box: 1063 × 956, fundo transparente |
| `hero-part-weapons.png` | Adagas curvas vulcânicas | 1254 × 1254 | RGBA (Alfa real) | Bounding box: 1188 × 722, correntes conectadas |
| `hero-idle-s.png` | Idle Sul (Frente / Câmera) | 1254 × 1254 | RGBA (Alfa real) | FootY: 1234, CenterX: 627 (100% igual ao anexo do usuário) |
| `hero-idle-se.png` | Idle Sudeste (3/4 frontal dir.) | 1254 × 1254 | RGBA (Alfa real) | FootY: 1237, CenterX: 652 |
| `hero-idle-e.png` | Idle Leste (Lateral direita) | 1254 × 1254 | RGBA (Alfa real) | FootY: 1229, CenterX: 636 |
| `hero-idle-ne.png` | Idle Nordeste (3/4 traseira dir.) | 1254 × 1254 | RGBA (Alfa real) | FootY: 1231, CenterX: 630 |
| `hero-idle-n.png` | Idle Norte (Costas) | 1254 × 1254 | RGBA (Alfa real) | FootY: 1224, CenterX: 626 |
| `hero-idle-nw.png` | Idle Noroeste (3/4 traseira esq.)| 1254 × 1254 | RGBA (Alfa real) | FootY: 1229, CenterX: 632 |
| `hero-idle-w.png` | Idle Oeste (Lateral esquerda) | 1254 × 1254 | RGBA (Alfa real) | FootY: 1235, CenterX: 653 |
| `hero-idle-sw.png` | Idle Sudoeste (3/4 frontal esq.) | 1254 × 1254 | RGBA (Alfa real) | FootY: 1238, CenterX: 637 |

### 5.2 Critérios do Gate 2 Auditados
| Critério | Resultado | Evidência |
|---|---|---|
| **Identidade do herói** | **PASSOU** | Idêntico ao anexo do usuário: rosto chibi, cabelo espetado, olhos vermelhos, sem camisa, capa vermelha, uma caveira no centro do cinto, duas adagas curvas vulcânicas. |
| **Arena técnica (sem desenho infantil)** | **PASSOU** | Fundo escuro `#0d1017`, grade isométrica `#192231`, eixos 3D e dummies com mola física. Sem praias ou palmeiras deformadas. |
| **Alfa e pivôs verificados** | **PASSOU** | Todos os 11 PNGs possuem canal alfa real auditado via script Node. Âncoras `centerX` e `footY` exatas. |
| **Escala e câmera 3/4** | **PASSOU** | Perspectiva isométrica `PITCH = 30°`, `SCALE = 90`, personagem em escala de gameplay com altura de 1.70 unidades (~150 px). |
| **Animação e jogabilidade preservadas** | **PASSOU** | Locomoção pesada, rolamento Dark Souls no `F`, pulo e plunge aéreo no `Espaço`, combos 1-2-3 com contador dinâmico e lâminas nas costas em X no `Q`/`X`. |
| **Foot lock determinístico preservado** | **PASSOU (0.0000 px)** | Teste automatizado de 2s a 120 Hz: **Yaw 0° max = 0.0000 px**; **Yaw 90° max = 0.0000 px**. Zero slip. |
| **Piso de Performance 200 FPS** | **PASSOU (369 FPS)** | Throughput medido de **369 FPS** (2.71 ms/frame) em 1280 × 720 com herói e dummies ativos. |
| **8 direções sem espelho** | **PASSOU** | 8 sprites dedicados no idle e rotação trigonométrica pura no rig modular. |
| **Galeria de Validação (Tecla `G`)** | **PASSOU** | Split screen 1280 × 720 com o sprite oficial de referência à esquerda e o rig modular à direita, alinhados na mesma linha de chão e escala. |
| **Folha de Contato 1920 × 1120 (Tecla `C`)** | **PASSOU** | Matriz 8 × 7 exibindo o sprite oficial na linha 0 e todas as poses/animações nas linhas seguintes. |

---

## 6. Arquivos e Screenshots do Repositório

```text
prototypes/rig-01-antigravity/
  index-rig.html              [Gate 1 — SHA-256: 8144D96AAE08C2F7D760157B8A8B00DACB39093625013C5EB814349EE0AC1608]
  index-hero.html             [Gate 2 — SHA-256: 594C2D10DCB36A174ED0E5C9BEC314896A2C7AB528EC3460A01B43678E60E5DA]
  capture.mjs                 [Script CDP determinístico Gate 1]
  capture-hero.mjs            [Script CDP determinístico Gate 2]
  capture-report.json         [Relatório Gate 1: Footlock 0.0000 px, 580 FPS]
  capture-hero-report.json    [Relatório Gate 2: Footlock 0.0000 px, 369 FPS]
  audit.md                    [Este documento auditado completo]
  screenshots/
    01-rig-arena-idle.png       (1280 × 720 — Gate 1: Idle técnico com adagas em X)
    02-rig-run-footlock.png     (1280 × 720 — Gate 1: Corrida pesada com solas 3D)
    03-rig-dash.png             (1280 × 720 — Gate 1: Hop Dash rasante)
    04-rig-combo-1.png          (1280 × 720 — Gate 1: Corte diagonal azul)
    05-rig-combo-2.png          (1280 × 720 — Gate 1: Corte reverso vermelho)
    06-rig-combo-3.png          (1280 × 720 — Gate 1: Giro 360° com dano crítico)
    07-rig-debug.png            (1280 × 720 — Gate 1: Overlay esqueleto rígido e eixos)
    07-rig-roll-air.png         (1280 × 720 — Gate 1: Rolamento Dark Souls)
    08-rig-contact-sheet.png    (1920 × 1120 — Gate 1: 56 poses 8×7 do rig técnico)
    09-hero-idle-8dir.png       (1920 × 1120 — Gate 2: Folha 8 direções com sprite oficial na linha 0)
    10-hero-run.png             (1280 × 720 — Gate 2: Herói correndo com rig modular na arena escura)
    11-hero-combo.png           (1280 × 720 — Gate 2: Combo 360 com adagas vulcânicas e dano crítico)
    12-hero-debug.png           (1280 × 720 — Gate 2: Esqueleto do rig sob a arte do herói)
    13-hero-gallery-g.png       (1280 × 720 — Gate 2: Galeria Split Sprite Oficial vs Rig na mesma escala)
```
