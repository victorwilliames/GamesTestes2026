# 06 — ARENA E COMBATE

---

## 1. Arena

| Item | Valor | Onde |
|---|---|---|
| Tamanho do mundo | **6000 × 3800 u** | `07-arena.js` |
| Zoom de jogo | **0,24 px/u** (`PLAY`) | `10-game.js` |
| Área visível a 1280×720 | **5333 × 3000 u** | idem |
| Chão | buffer pintado uma vez em `BS = 0,24` → **blit 1:1** | `07-arena.js` |
| Props | árvores, pedras, tocos, arbustos, fogueira, ruínas | idem |
| Rasterização dos props | `BAKE = 0,36` | idem |
| Ordenação | props por `y` (atrás/na frente do herói), inimigos por `y` | `10-game.js` |
| Câmera | segue o herói com lerp `dt·6` e clamp nos limites | idem |
| Espaço de cor | mar → areia → mata → arena de terra | `07-arena.js` |

O chão é dividido em faixas (mar, areia, transição, mata) e pintado **uma única vez** num buffer
offscreen grande; no quadro quente só há um `drawImage` do recorte visível. Como o buffer está na
**mesma escala** do jogo, não há reamostragem: o chão fica nítido e barato.

O cenário não tem colisão física: o herói e os inimigos são limitados apenas pelos limites do
mundo, e os props são puramente visuais (com Y-sort). É uma escolha de escopo: a prioridade era
combate e performance, não navegação com pathfinding.

---

## 2. Controles

| Entrada | Ação |
|---|---|
| **WASD** / setas | mover |
| **J**, **Z** ou **clique esquerdo** | atacar (A1 → A2 → A3 em combo) |
| **Espaço** ou **E** | dash (0,30 s, ×2,1 velocidade, invulnerabilidade curta) |
| **Q** | giro especial (360°, raio 700, 20 de dano, cd 5,5 s) |
| **R** | fúria (7 s, velocidade 1080, cd 16 s) |
| **F1** | liga/desliga hitboxes |
| **P** | pausa |
| **H** | painel de performance |

O movimento usa `speed = (fúria ? 1080 : 880) × (dash ? 2,1 : 1) u/s`. Com `PLAY = 0,24`, isso dá
**211 px/s** andando e **444 px/s** em dash — ágil o suficiente para um jogo de arena.

---

## 3. Golpes (números do código)

| Golpe | Duração | Janela ativa | Dano | Knockback | Hitstop | Tremor |
|---|---|---|---|---|---|---|
| **A1** corte direito | 0,46 s | **0,30 – 0,52** | 12 | 260 | 0,055 s | 5 |
| **A2** backhand esquerdo | 0,44 s | **0,28 – 0,50** | 14 | 290 | 0,06 s | 6 |
| **A3** duplo descendente | 0,70 s | **0,34 – 0,60** | 26 | 420 | 0,10 s | 11 |

- A janela ativa é normalizada (`u ∈ [0,1]`) dentro da duração; o teste só ocorre nesse intervalo.
- **Combo**: `comboT = 0,34 s` após o fim do golpe para encadear; apertar durante o golpe grava
  `buffer = true` e o próximo começa no fim do atual. Sem acerto, o combo volta ao A1.
- **Hitstop**: o mundo congela por `freeze` segundos, mas o FX continua — é o que dá peso ao A3.
- **Fúria** (`R`): multiplica a velocidade e mantém o FX de fogo; `Q` é o "panic button" de área.

### Hitbox = geometria desenhada

```js
const w = DS.bladeWorld(side, wrist, wa);       // root, mid, tip, pommel (espaço do herói)
const a = toWorld(w.root), b = toWorld(w.mid), c = toWorld(w.tip);
// testa os dois segmentos (a-b e b-c) contra o círculo do inimigo
// centroInimigo = (e.x, e.y - HIT_Y·SC), raio = HIT_R·SC
```

Como `BLADE_SCALE` foi calibrada para a ponta desenhada cair em `SK.BLADE_TIP`, **a área que
mata é a área que aparece na tela**. O modo `F1` desenha exatamente os segmentos testados e o
círculo de acerto do inimigo (`screenshots/game-debug.png`).

> O círculo de acerto usa **unidades de mundo**, sem escala: centro em `(e.x, e.y − HIT_Y)` com
> raio `HIT_R` (240 e 205). É o mesmo valor que o combate testa em `09-combat.js`.

---

## 4. Inimigos

| Item | Valor |
|---|---|
| Escala | **SC = 1,52** (≈ 55–60% do herói) |
| Vida | **30** |
| Altura de teste | `HIT_Y = 240` (peito acima do chão, antes da escala) |
| Raio de acerto | `HIT_R = 205` (antes da escala) |
| Alcance de aproximação | **330** |
| Alcance do golpe | **< 420** |
| Janela do golpe | `st 0,40 – 0,62` |
| Dano ao herói | **7** |
| Recarga do golpe | `1,1 + (seed % 4)·0,35 s` |
| Reação a dano | flash branco, knockback 780/−140, sangue, número de dano |
| Morte | queda + deslize + fade; `kill` no HUD |

IA em três estados: **aproximar** (até 330) → **orbitar/separar** (evita empilhar: separação de
~250 u entre inimigos) → **atacar** (entra em < 420). O dano do herói é `< 7` a cada 0,9 s de
invulnerabilidade, então a pressão vem do número de inimigos, não de um golpe letal.

O herói tem **100 HP**, invulnerabilidade de **0,9 s** após tomar dano e **1,2 s** ao renascer.
O respawn reposiciona em `(3000, 2000)` — o centro da arena.

---

## 5. Feedback de combate

- **Faíscas** (`DS.fx.spark`), **sangue** (`blood`), **poeira** (`dust`), **anel** (`ring`).
- **Texto de dano** com escala e cor por golpe; **flash** branco no inimigo atingido.
- **Screen shake** aditivo, decaindo; hitstop separado por golpe.
- **Rastro da lâmina** (slash trail) desenhado a partir dos pontos do FK do quadro anterior.
- **HUD**: retrato cacheado, barra de vida, barra de fúria, contador de combo (A1/A2/A3 acesos),
  kills, ícones Q/E/R com cooldown, e painel de performance (FPS médio, p95, p99, draw, upd).

---

## 6. Fluxo de uma sessão

1. Herói nasce no centro; câmera faz o lerp de entrada.
2. 4 inimigos (padrão) ou `?spawn=N` surgem em anel ao redor.
3. O jogador avança, ataca e encadeia A1→A2→A3; o combo é exibido no HUD.
4. Inimigos flanqueiam, atacam e recuam; o herói usa dash para reposicionar e Q para abrir espaço.
5. Ao morrer, o herói renasce com invulnerabilidade; o contador de kills permanece.

---

## 7. O que eu ajustaria com mais tempo

1. **IK de dois ossos** para pés e mãos em terreno irregular.
2. **Colisão com props** (ou pelo menos com árvores grandes) e um sistema simples de navegação.
3. **Mais arquétipos de inimigo** (atirador, brutamontes) e telegraphs visuais antes do golpe.
4. **Cape/tecido físico** — hoje o cachecol é apenas uma curva autoral.
5. **Balanceamento**: A3 com 26 de dano mata um inimigo de 30 em dois golpes; talvez 24 seja mais
   interessante para forçar o combo completo.
