# 05 — IMPLEMENTAÇÃO E RIG

**Entrega:** `prototypes/deepseek/desenho-v1-deepseek/`
**Fonte:** 11 arquivos em `src/` → `tools/build.mjs` → `index.html` autocontido.
**Sem dependências de runtime.** Sem `type="module"`, sem `import`, sem `fetch`, sem PNG.

---

## 1. Pipeline

```
src/00-core.js      utilidades: RNG determinístico, paths, wash/hatch, cache offscreen (DS.part)
src/01-head.js      cabeça: crânio, rosto, olhos, boca, orelhas, cabelo (juba)
src/02-body.js      tronco nu, pescoço, cachecol, cinto + caveira, saia/tanga
src/03-limbs.js     braços, mãos (dedos), pernas, botas, bracadeiras
src/04-weapon.js    adaga curva + halo + sangue + cabo + correntes (elos)
src/05-skeleton.js  constantes do rig, FK, poses (idle/walk/run/attack/dash/spin/hurt/dead)
src/06-hero.js      montagem do herói, ordem de desenho, cache arma+mão, espaços locais
src/07-arena.js     ilha 6000×3800: mar, areia, mata, props Y-sort, buffers
src/08-enemy.js     esqueleto inimigo (pintura, rig, IA, dano, morte)
src/09-combat.js    golpes, janelas ativas, hitbox da lâmina, FX, combo
src/10-game.js      loop, câmera, input, HUD, bancada de performance, modos de captura
```

Build:

```bash
node tools/build.mjs
# lê tools/shell.html + src/*.js em ordem e grava index.html (scripts clássicos inline)
```

O `index.html` final tem ~189 kB e **não** referencia nenhum arquivo externo. Os assets oficiais
copiados para `assets/reference/` servem apenas de consulta humana; o jogo não os carrega.

---

## 2. Convenções de coordenadas

| Espaço | Origem | Eixos | Observação |
|---|---|---|---|
| Herói | **pelve** | `+x` = frente, `-y` = cima | desenhado olhando para a direita |
| Arma | **grip** (centro do cabo) | `+x` = em direção à guarda | pomo em `(-70, 8)` |
| Mundo | canto superior esquerdo da arena | `+y` = baixo | `PLAY = 0,24` px por unidade |
| Tela | canto superior esquerdo | `+y` = baixo | 1280×720 lógicos |

- Espelhamento: `facing = -1` aplica `ctx.scale(-1, 1)` no herói — **não** existe turnaround.
- Vista: `yaw = 0,25` fixo (3/4 fake). O mesmo valor é usado em todas as poses.
- Ângulos de membro: radianos, `0` = para frente, `+π/2` = para baixo, `-π/2` = para cima.

---

## 3. Hierarquia e constantes do rig

```js
UPPER: 96,  FORE: 96,          // braço
THIGH: 180, SHIN: 150,         // perna
SHOULDER: [192, -215],         // ombro direito no espaço da pelve
HIP: [112, -8],                // quadril direito
NECK: [0, -250],
GROUND: 460,                   // pelve → chão
SOLE: 130,                     // tornozelo → sola
BLADE_TIP: [272, -228],        // ponta da lâmina (espaço local da arma, já escalada)
BLADE_MID: [192, -139]
```

Cadeia cinemática (`DS.fk(pose)`):

```
pelve
├── tronco (lean, twist) → pescoço → cabeça (headYaw, headPitch)
├── ombro R → cotovelo R → punho R → arma R (wa = wR)
├── ombro L → cotovelo L → punho L → arma L (wa = wL)
├── quadril R → joelho R → tornozelo R (+pé/bota)
└── quadril L → joelho L → tornozelo L (+pé/bota)
```

- **FK puro**: cada junta é um ângulo absoluto no plano (braço = 2 ângulos, perna = 3).
- `DS.fk` devolve `pelvis, neck, shoulderR/L, elbowR/L, wristR/L, kneeR/L, ankleR/L, hipR/L`.
- O braço de trás (esquerdo) saiu **34 u para fora e 6 u para baixo** para não desaparecer atrás
  do tronco chibi na vista 3/4 (correção registrada em `04`, rodada 5).

### Por que FK e não IK

A meta original de Rafa incluía IK de dois ossos. Nesta entrega **não há IK**: as poses são
autoradas em ângulo, o que garante o arco visual da lâmina (prioridade nº 1 das armas) e é
determinístico. A consequência é a declarada em `07`: pé/mão não se corrigem sozinhos em terreno
irregular. Um IK de 2 ossos pode ser acoplado depois de `DS.fk` sem tocar nos painters.

---

## 4. Poses procedurais

| Pose | Como é gerada | Destaques |
|---|---|---|
| `idle` | `POSE.idle(t)` | respiração (`py`), oscilação de braços, `wR = 0,35`, `wL = -0,35`, olhar |
| `walk` | ciclo de passada com `runT` | braços contra-fase, sobe/desce da pelve, poeira nos pés |
| `run` | idem, amplitude maior + inclinação | câmera/velocidade acompanham |
| `attack` A1 | `POSE.attack(0, u)` | corte direito: windup → arco descendente → recuperação |
| `attack` A2 | `POSE.attack(1, u)` | backhand esquerdo, corpo gira |
| `attack` A3 | `POSE.attack(2, u)` | duplo descendente, as duas lâminas, hitstop 0,10 s |
| `dash` | `POSE.dash(u)` | inclinação, pernas recolhidas, rastro |
| `spin` | `POSE.attack` + `spin` | giro de 360° com anel de FX |
| `hurt` | `POSE.hurt(u)` | recuo de tronco/cabeça, invulnerabilidade curta |
| `dead` | queda + deslize | usado nos inimigos |

Transições: `mixPose(a, b, t)` interpola ângulos e deslocamentos; o `idle` mistura com
`walk/run` por `moving`; o ataque tem prioridade absoluta enquanto `atk >= 0`.

Secundários (sem física pesada, determinísticos):
- cachecol e pontas da saia seguem o `lean`/`twist`;
- correntes são **simuladas por quadro** (ver §6);
- poeira, faíscas, sangue e texto de dano vivem em `DS.fx` com sementes.

---

## 5. Arma, mão e hitbox — o mesmo espaço

A arma é desenhada **no espaço local do punho**:

```
ctx.translate(wrist) → ctx.rotate(wa) → [arte da arma + mão]
```

- `drawHandGrip(side, 'back')` → palma/pulso **atrás** do cabo.
- arte do cabo/guarda/lâmina.
- `drawHandGrip(side, 'front')` → dedos e polegar **na frente** (sanduíche do Antigravity).
- A lâmina é pintada com `BLADE_SCALE = 0,98` em torno de `BLADE_PIVOT (70, -10)`, calibrada para
  que a ponta desenhada caia em `SK.BLADE_TIP` — ou seja, **a hitbox usa a geometria desenhada**:

```js
ponta_desenhada = pivot + (tip_arte − pivot) · 0,98 = (268, −224) ≈ SK.BLADE_TIP (272, −228)
```

- `DS.bladeWorld(side, wrist, wa)` devolve `root`, `mid`, `tip`, `pommel` no espaço do herói;
  `09-combat.js` converte com `toWorld()` e testa os segmentos `root→mid→tip` contra o círculo do
  inimigo (`HIT_Y 240`, `HIT_R 205`, escala `SC 1,52`).
- **Proibido substituir por sprite**: a arma cacheada é um bitmap gerado pelo **mesmo**
  `DS.drawWeapon` procedural (nada de PNG), e a mão é desenhada dentro dele.

---

## 6. Correntes

- `DS.drawChain(ctx, pts, side)` desenha **elos individuais**: elos ovais alternados (frente/cima),
  com brilho e sombra, nunca uma linha.
- Trajeto: pomo `(-78, 16)` → voltas no antebraço (2–3 voltas) → presilha no pulso.
- Cada elo usa um **sprite pré-renderizado** (`linkSprite`) em duas orientações; `DS.warmChainSprites`
  aquece todas as variantes no boot. Isso mantém o desenho idêntico e barato.
- A corrente é recalculada por quadro a partir dos pontos do FK (sem skinning), o que garante que
  ela acompanhe qualquer ataque sem "esticar".

---

## 7. Ordem de desenho

**Herói** (`desejo de 3/4`):

```
perna de trás → braço de trás (+arma/corrente) → saia de trás → tronco
→ cabeça → perna da frente → saia da frente → braço da frente (+arma/corrente)
```

- Em ataque (`frontArms = true`), o braço esquerdo é desenhado **depois do tronco e antes da cabeça**,
  para o arco do golpe ler por cima do corpo.
- Fora do ataque, `frontArms = true` também (decisão final): as **duas** adagas ficam visíveis no
  idle; sem isso o tronco chibi escondia a arma de trás.

**Mundo** (`10-game.js`):

```
chão (blit 1:1) → props atrás (Y-sort) → inimigos atrás → herói → inimigos na frente → FX → HUD
```

---

## 8. Determinismo e cache

- **RNG semeado** por peça (`DS.rng(seed)`): sangue, manchas, hatch, poeira e faíscas não mudam
  entre quadros nem entre execuções.
- **`DS.part(w, h, ss, draw)`**: rasteriza a peça uma vez (pode assar em `ss < 1`) e devolve um
  `blit(ctx)`. Usado em corpo, arma+mão, props, inimigos e HUD.
- **Pré-aquecimento** (`DS.warmup`) constrói todas as partes, as variantes de corrente e o avatar
  antes do primeiro quadro — evita o "primeiro golpe travado" (≈180 ms observados).
- Nada de gradiente vetorial simples nas armas: a incandescência é feita em camadas
  (`lighter` + miolo laranja/amarelo + halo) como pede o documento de armas.

---

## 9. Limites técnicos declarados

1. **Sem IK** (ver §3).
2. **Sem turnaround**: uma vista espelhada.
3. **Sem colisão física real** com props: a arena usa limites de mundo + círculos de inimigos.
4. **Sem áudio**.
5. **Sombras** são elipses pintadas, não sombreamento dinâmico.
