# 06 — Arena Isométrica 2D Estilo Hades 1, Inimigos Chtônicos e Combate (Etapa 3)

Este relatório documenta a implementação da **ETAPA 3** em [`src/arena/ArenaEngine.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/arena/ArenaEngine.js), reconstruída seguindo as referências oficiais de **Hades 1 (Supergiant Games)** em [`assets/references/ref-2d-hades/`](file:///d:/.GITHUB/games/game-2d/assets/references/ref-2d-hades/) (`ref-hades-2d-.avif`, `ref-hades-2d--.avif`, `ref-hades-2d--x.avif`, `ref-hades-2d-zz.avif`, `ref-hades-2d-zzx.avif`), bem como [`assets/references/ref-2d-maps/map-island-enemys.png`](file:///d:/.GITHUB/games/game-2d/assets/references/ref-2d-maps/map-island-enemys.png) e a arquitetura de mundo/combate de Rafa + Claude.

---

## 1. Arquitetura Visual da Câmara de Hades 1 em 100% Canvas 2D

A câmara de combate é gerada proceduralmente e pré-assada em buffer `1280 × 720` (`bakeIslandGround` + `bakeProps`):

1. **Projeção Isométrica 2:1 em Losango (`toIso(u, v)`):**
   - Grade isométrica `12 × 12` onde cada laje de pedra do Tártaro possui chanfro de iluminação, rachaduras a nanquim e juntas escuras no estilo *Mike Mignola / Jen Zee*.
2. **Frisos de Meandro Grego (Greek Key / Fret) em Neon Magenta e Verde Estígio (`ref-hades-2d-.avif`):**
   - Passarelas perimetrais com motivos geométricos gregos iluminados em violeta/magenta (`#d946ef`, `#c084fc`) nas bordas superiores e verde-esmeralda Estígio (`#4ade80`) nas rotas internas.
3. **Pilares do Tártaro com Fogo Verde Estígio e Colunas Gregas Caneladas (`ref-hades-2d-.avif` & `ref-hades-2d-zzx.avif`):**
   - Altares de pedra escura com runas gregas fluorescentes e chamas verdes vivas que projetam poças de luz verde-limão nas lajes e **sombras diagonais pretas duras**.
   - Colunas gregas caneladas quebradas em diagonal com dentes de ouro no pedestal.
4. **Armadilhas de Espinhos Isométricas e Grande Medalhão Central do Caos (`ref-hades-2d-.avif` & `ref-hades-2d--x.avif`):**
   - Placas metálicas carmim-bronze embutidas no piso isométrico com 9 orifícios de espinhos retráteis e um medalhão central elíptico 2:1 com raios geométricos e núcleo incandescente.
5. **Abismo do Tártaro, Correntes Monumentais e Rio de Magma de Asfódelo (`ref-hades-2d--.avif` & `ref-hades-2d-zz.avif`):**
   - Correntes gigantes de ferro escuro cruzando o abismo noroeste, mãos espectrais rubras emergindo do abismo sudoeste e rio de lava incandescente com costelas de basalto/osso e braseiros de crânio a sudeste.

---

## 2. Inimigos Chtônicos, Alvos de Treino (Skelly) e Reação de Impacto

A câmara abriga **6 entidades interativas** com ordenação de profundidade (*Y-sorting*) em tempo real junto ao herói e aos pilares:

- **4 Guardiões Chtônicos (Wretched Thugs / Skull-Masked Shades):** Equipados com máscara de crânio rachado, olhos em chama verde-Estígio, grande clava cravada de ferro (`ref-hades-2d-.avif`), escudo grego Aspis e barra de vida estilo Hades 1 com emblema de caveira à esquerda (`ref-hades-2d--.avif`). Possuem IA de patrulha, cerco e recuo.
- **2 Vultos de Treino Chtônicos (inspirados no Skelly de Hades 1):** Esqueletos com armadura grega de treino e alvo no peito para teste contínuo de DPS e alcance.
- **Feedback Completo de Combate:**
  - **Hit-Flash:** O inimigo atingido brilha em branco/laranja intenso por `140 ms`.
  - **Hitstop (`28–45 ms`) & Camera Shake Direcional:** Pausa dramática no frame exato do corte seguida de tremor de câmera alinhado ao vetor do golpe.
  - **Física de Knockback e Mola de Inclinação (`recoilTilt`):** Impulso físico proporcional ao estágio do combo + oscilação elástica amortecida.
  - **Arcos de Corte Estilo Hades 1 (`renderCombatFX`):** Núcleo branco puro hiper-afiado envolto por magma laranja e sangue carmim, acompanhado de manchas escuras de nanquim no piso (`ref-hades-2d-.avif`), rachaduras incandescentes no chão e textos de dano flutuantes (`-54 CAOS!`).

---

## 3. HUD Fiel a Hades 1 e Controles Jogáveis

- **Barra Superior Central de Chefe:** `GUARDIÕES DO TÁRTARO, AS FÚRIAS` com moldura grega de bronze e ouro (`ref-hades-2d-.avif`).
- **Coluna Vertical Esquerda de 5 Bênçãos em Losango (Boons):** Slots rotacionados a `45°` para `ATK (+2)`, `DASH (Lv.2)`, `Q (Corrente)`, `E (Fúria em X)` e `R (Caos 360°)` — clicáveis com o mouse ou acionáveis pelo teclado!
- **Canto Inferior Esquerdo:** 3 emblemas de *Death Defiance*, barra de vida carmim (`100 / 100`), barra incandescente de Fúria (*God Gauge*) logo abaixo e cristal vermelho *Bloodstone Cast* (`4 / 4`).
- **Controles:** `[WASD / Setas]` Movimentação em 8 direções | `[Clique Esquerdo / J / Z]` Combo Encadeado de 4 Golpes | `[Espaço]` Dash Sombrio com Afterimages | `[Q / E / R]` Habilidades das Lâminas do Caos | `[B / H]` Diagnóstico de Hitboxes e Esqueleto | `[P]` Auto-Demo Bot.
- Evidências: [`12-arena-island-idle.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/12-arena-island-idle.png) e [`13-arena-combat-combo.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/13-arena-combat-combo.png).
