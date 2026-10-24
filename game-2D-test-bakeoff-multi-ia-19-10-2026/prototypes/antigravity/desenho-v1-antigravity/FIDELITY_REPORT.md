# FIDELITY_REPORT.md — Avaliação Técnica e Artística (HERO-02 / Desenho Procedural V1)

**Experimento:** `prototypes/desenho-v1-antigravity`
**Renderer:** `HeroRenderer` (100% Canvas 2D programático, determinístico e modular)
**Data:** 19/10/2026

---

## 1. Arquitetura Implementada

O experimento foi estruturado em módulos desacoplados dentro de `prototypes/desenho-v1-antigravity/src/`, sem reutilizar o renderer simplificado anterior e sem alterar arquivos fora do diretório do protótipo:

| Módulo | Responsabilidade |
|---|---|
| [`src/materials/MaterialPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/materials/MaterialPainter.js) | PRNG determinístico (`createRNG`), padrões procedurais offscreen cacheados (`skin`, `leather`, `cloth`, `bone`), contorno artesanal multi-passagem com textura de grafite/nanquim (`strokeArtisanalInk`), shader de mechas de cabelo com gradiente transversal + brilho radial + fios individuais (`paintHairLock`), couro rústico (`paintDarkLeather`), tecido carmim (`paintCrimsonCloth`) e elos de bronze (`paintBronzeChainLink`). |
| [`src/painters/FacePainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/FacePainter.js) | Cabeça chibi, orelhas esculpidas com concha interna, bochechas quentes alaranjadas, olhos vermelhos multifacetados com pestana superior bordô e brilho especular duplo, sobrancelhas agressivas, nariz, boca e cicatriz frontal, com suporte a paralaxe 2.5D (`yaw`). |
| [`src/painters/HairPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/HairPainter.js) | 22 mechas orgânicas assimétricas divididas em 4 camadas (`backSpikes`, `crownAndLeftSpikes`, `rightWhorlSpikes`, `frontBangs`) irradiando do redemoinho superior direito `(825, 432)`. |
| [`src/painters/HeadPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/HeadPainter.js) | Orquestra `HairPainter` + `FacePainter` a partir do pivô anatômico local `headPivot = (637, 1132)`. |
| [`src/painters/TorsoPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/TorsoPainter.js) | Pescoço musculoso (visível em `nocape`), trapézio, peitoral estilizado com sulco esternal e arco costal/abdominal. |
| [`src/painters/ArmPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/ArmPainter.js) | `ArmPainter` (deltoide integrado ao peitoral sem costura, bíceps, antebraço e 2 braçadeiras em tiras de couro abauladas) + `HandPainter` com **empunhadura em 2 camadas** (`paintWristAndPalmBack` atrás do cabo + `paintClenchedFingersOverHilt` com os 4 dedos e polegar abraçando o cabo pela frente). |
| [`src/painters/ClothPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/ClothPainter.js) | `ClothPainter` (saiote escuro rasgado com hachuras de tecido, rasgo triangular na coxa direita, costuras vermelhas e faixas internas carmim) + `AccessoryPainter` (cinto de couro, correntes duplas de bronze 3D entrelaçadas e **caveira única central** esculpida no cinto frontal). |
| [`src/painters/ScarfPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/ScarfPainter.js) | `ScarfPainter` (cachecol vermelho volumoso com dobras arredondadas sobrepostas) + `CapePainter` (capa vermelha assimétrica esvoaçando para a direita com 6 pontas rasgadas). |
| [`src/painters/LegPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/LegPainter.js) | `LegPainter` (coxas musculosas sombreadas pelo saiote) + `BootPainter` (botas colossais de couro com 4 dobras abauladas no cano, 2 tiras arqueadas no peito do pé, biqueira em cúpula e sola tratorada costurada). |
| [`src/painters/WeaponPainter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/painters/WeaponPainter.js) | Par de Lâminas do Caos reconstruídas sobre a geometria medida de `hero-part-weapons.png`: grande arco crescente com chifre inferior longo até `y=748`, 2 dentes inferiores internos, 3 ganchos superiores internos, asa superior de aço forjado batido com chevrons metálicos, leito de magma e sangue com crosta vulcânica e fissuras de lava ramificadas, cabo de 5 seções (guarda de bronze, couro 1, colar central, couro 2 com faixa dourada e pomo anelar vazado) e corrente pesada entrelaçada em formato stadium. |
| [`src/rig/RigAdapter.js`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/src/rig/RigAdapter.js) | Adaptador matemático que converte estados e poses do `RIG-01` (`idle`, `run`, `attack` e orientações `S`, `SE`, `SW` sem espelhamento mecânico) em coordenadas articulares consumidas pelo mesmo `HeroRenderer`. |

---

## 2. Avaliação Separada dos Três Critérios Mandatórios

### Critério A — Fidelidade Visual Estática (`hero-part-*` e `hero-idle-s`)

1. **Cabeça, Cabelo e Rosto ([`01-compare-head.png`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/screenshots/01-compare-head.png)):**
   - **Atingido:** Proporção chibi fiel, 22 mechas volumosas assimétricas com estrias individuais e variação de marrom-café a cobre queimado, olhos rubi intensos com pestana superior bordô, sobrancelhas espessas inclinadas, cicatriz sutil na testa e pele quente texturizada com contorno artesanal granulado.
   - **Diferença residual honesta:** A textura de giz pastel/lápis de cor da imagem original (`hero-part-head.png`) possui micro-granulação orgânica de rasterização ligeiramente mais difusa nas transições entre mechas do que os gradientes + estrias vetoriais do Canvas 2D.
2. **Corpo, Roupas, Caveira Única e Botas ([`02-compare-body-nocape.png`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/screenshots/02-compare-body-nocape.png) e [`03-compare-body.png`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/screenshots/03-compare-body.png)):**
   - **Atingido:** Tronco sem camisa com peitoral e abdômen estilizados, junção ombro-peitoral contínua sem costuras, braçadeiras em camadas, cachecol vermelho e capa assimétrica de 6 pontas, saiote escuro rasgado com furo triangular na coxa direita e costuras vermelhas, correntes de bronze entrelaçadas, **caveira única central** no cinto frontal e botas colossais com 4 gomos abaulados no cano e sola tratorada.
3. **Armas — Lâminas do Caos e Empunhadura ([`04-compare-weapons.png`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/screenshots/04-compare-weapons.png) e [`05-compare-hero-idle-s.png`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/screenshots/05-compare-hero-idle-s.png)):**
   - **Atingido:** Silhueta crescente agressiva com o longo chifre inferior (`y=748`), 3 ganchos superiores internos em aço forjado batido com chevrons inferiores, leito incandescente de fogo amarelo-branco/laranja/vermelho-sangue na borda cortante e nos dentes inferiores, crosta vulcânica escura cortada por veias de lava ramificadas (sem padrão de manchas circulares), cabo robusto de 5 seções com pomo anelar vazado e corrente pesada entrelaçada.
   - **Empunhadura corrigida:** No herói completo (`05-compare-hero-idle-s.png`), o cabo passa por dentro da mão — a aba de couro da luva fica atrás do cabo, a guarda de bronze encosta na lateral externa do punho, o pomo sai na lateral interna e os 4 dedos esculpidos + polegar fecham por cima do cabo.

### Critério B — Fidelidade sob Articulação (`RIG-01` Integrado)

Evidências capturadas em [`08-rig01-integration-showcase.png`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/screenshots/08-rig01-integration-showcase.png), [`09-compare-orientation-se.png`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/screenshots/09-compare-orientation-se.png) e [`10-compare-orientation-sw.png`](file:///D:/.GITHUB/games/game-2d/prototypes/desenho-v1-antigravity/screenshots/10-compare-orientation-sw.png):
- **Mesmo Renderer:** Todas as 5 poses (`Idle Sul`, `Corrida Mid-Stride`, `Ataque Slash`, `Orientação SE` e `Orientação SW`) executam exatamente o mesmo `HeroRenderer.render(ctx, pose)` com todas as 22 mechas de cabelo, texturas, caveira, dobras de roupa e lâminas incandescentes.
- **Sem Espelhamento Mecânico:** Nas orientações `SE` e `SW`, a capa permanece fisicamente no ombro direito, a cicatriz na testa esquerda, o redemoinho do cabelo à direita e o rasgo triangular na coxa direita.
- **Limitação residual conhecida sob rotação extrema (3/4):** Nas vistas `SE` e `SW`, o deslocamento de paralaxe (`yaw`) move olhos, nariz, boca, mechas frontais, peitoral e fivela de caveira sem espelhar, mas a silhueta externa das mechas traseiras do cabelo ainda preserva parte do volume frontal quando comparada à pintura manual dedicada de `hero-idle-se.png`.

### Critério C — Integridade Técnica (100% Canvas 2D Puro)

- **Zero PNGs no Canvas:** O `HeroRenderer` utiliza exclusivamente primitivas nativas do `CanvasRenderingContext2D` (`Path2D`, `bezierCurveTo`, `quadraticCurveTo`, `createLinearGradient`, `createRadialGradient`, `createPattern` gerados proceduralmente em memória via `document.createElement('canvas')`).
- **Transparência na Comparação:** As imagens PNG de referência (`assets/references/ref-2d-hero/...`) são exibidas **apenas** no painel esquerdo (`<img>` HTML identificado com o selo azul `REFERÊNCIA OFICIAL (PNG)`), lado a lado com o `<canvas>` procedural à direita (`100% CÓDIGO CANVAS 2D`).
- **Zero Erros:** Auditable via `node capture.mjs` (`Runtime Errors: 0`, `Console Errors: 0`).

---

## 3. Como Executar e Auditar Localmente

1. **Abrir a Bancada Interativa no Navegador:**
   - Sirva a raiz do repositório `D:\.GITHUB\games\game-2d` via servidor HTTP estático (ex.: `npx http-server -p 8080`) e acesse:
     `http://localhost:8080/prototypes/desenho-v1-antigravity/index.html`
   - Utilize os botões superiores para alternar entre:
     - **Modo 1 (Comparação Lado a Lado)**
     - **Modo 2 (Procedural Isolado + Multiescala 500px / 330px / 185px)**
     - **Modo 3 (Articulações, Ossos e Pivôs Anatômicos)**
     - **Modo 4 (Prova de Integração RIG-01 — 5 Poses + Animação Ao Vivo)**
2. **Regerar as 10 Capturas de Auditoria Automaticamente:**
   ```powershell
   node "D:\.GITHUB\games\game-2d\prototypes\desenho-v1-antigravity\capture.mjs"
   ```
