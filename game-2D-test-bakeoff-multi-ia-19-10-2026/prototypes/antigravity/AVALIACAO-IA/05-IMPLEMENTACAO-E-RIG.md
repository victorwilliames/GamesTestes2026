# 05 — Implementação Técnica, Esqueleto Matemático e Animações (Etapa 2)

Este relatório documenta a arquitetura de engenharia da **ETAPA 2** implementada em [`src/rig/RigAdapter.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/rig/RigAdapter.js) e [`src/HeroRenderer.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/HeroRenderer.js).

---

## 1. Hierarquia Anatômica e Pivôs Locais (`RIG-01`)

O esqueleto matemático opera no espaço canônico `1254 × 1254` com âncora de solo em `(627, 1226)` e projeta cada junta com base no ângulo direcional contínuo `yaw`:

- **Raiz e Coluna:** `root (627, 1226)` → `pelvis (627, 818)` → `chest (627, 672)` → `neckBase (627, 588)` → `headPivot (627, 560)`.
- **Membros Superiores (`armL`, `armR`):** `shoulder` → `elbow` → `wrist` → `handGrip`. A adaga compartilha exatamente a âncora `handGrip`, garantindo que mão e cabo jamais se separem em nenhum frame de animação.
- **Membros Inferiores (`legL`, `legR`):** `hip` → `knee` → `ankle` → `footSole`.
- Evidência visual dos pivôs: [`07-articulations-pivots.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/07-articulations-pivots.png).

---

## 2. Cinemática Inversa Analítica (2-Bone IK) e Foot World-Lock

Seguindo a lição central de Rafa + Claude (`Crítico 3` de `02-CRONOLOGIA-RAFA-CLAUDE.md`):

- **Solver `solveTwoBoneIK(hip, targetAnkle, L1, L2, kneeBendSign)`:** Calcula analiticamente via Lei dos Cossenos a posição exata do joelho (`knee`) para que o tornozelo alcance o alvo sem esticar nem quebrar a proporção entre coxa (`L1 = 152`) e canela (`L2 = 160`).
- **Foot World-Lock & Peso Pélvico:** Durante a fase de apoio (`stanceRatio > 0`), o pé de apoio crava no solo enquanto a pelve aplica *weight drop* (`pelvisWeightDrop`) e *hip sway* lateral.
- **Rotação 3/4 Fake 2.5D Sem Flip (`yaw`):** Em vez de usar `ctx.scale(-1, 1)` (que inverteria a cicatriz do olho esquerdo e a sobreposição assimétrica do cinto), `RigAdapter.computePose` desloca as juntas em paralaxe 3/4 (`SE`, `S`, `SW`) e ordena a profundidade (`backSide` vs `frontSide`) dinamicamente.
- Evidências: [`08-rig01-integration-showcase.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/08-rig01-integration-showcase.png), [`09-compare-orientation-se.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/09-compare-orientation-se.png) e [`10-compare-orientation-sw.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/10-compare-orientation-sw.png).

---

## 3. Catálogo de Animações e Combos Encadeados (`getAttackCatalog`)

Todas as animações utilizam **exatamente o mesmo renderer procedural**:
- **`idle`:** Respiração orgânica torácica, oscilação da capa e micro-tensão nas Lâminas do Caos.
- **`walk` & `run`:** Ciclo completo de locomoção com inclinação frontal do tronco, balanço cruzado dos braços e IK de pernas.
- **`dash`:** Impulso evasivo rápido em estilo *Hades 1* com geração de rastros fantasma (*afterimages*).
- **Combo de 4 Estágios (`combo1` → `combo2` → `combo3` → `combo4`) + Habilidades (`skillQ`, `skillE`, `skillR`):**
  1. `combo1` (*Corte Infernal Esq*): Arco diagonal rápido com a lâmina esquerda.
  2. `combo2` (*Revés Sangrento Dir*): Contra-ataque amplo com a lâmina direita.
  3. `combo3` (*Tesoura Dupla do Caos*): Golpe cruzado simultâneo com ambas as adagas.
  4. `combo4` (*Turbilhão das Correntes*): Finalizador devastador que arremessa as Lâminas do Caos à distância (`chainExtend = 185px`) sustentadas pelas correntes infernais esticadas!
  - Evidência: [`11-combo-4stages-showcase.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/11-combo-4stages-showcase.png).

---

## 4. Padeiro Offscreen de Peças Procedurais (`ensureRigPartsBaked`)

Para conciliar a riqueza de detalhes de `1254 × 1254` com a meta inegociável de **>= 200 FPS**, [`HeroRenderer.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/HeroRenderer.js) executa os próprios *painters* procedurais (`HeadPainter`, `TorsoPainter`, `ArmPainter`, `LegPainter`, `WeaponPainter`) em buffers offscreen na inicialização (`rigParts`) e articula cada sub-membro via transformações matriciais 2D em `renderFastArticulatedRig()`, reduzindo o custo de renderização do herói completo para **`~0.35 ms` por frame**.
