# 04 — Fidelidade Visual (Etapa 1: Herói, Lâminas do Caos, Pegada de 4 Dedos e Correntes Infernais)

Este relatório documenta a execução da **ETAPA 1** conforme [`docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`](file:///d:/.GITHUB/games/game-2d/docs/prompts%20a%20executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md) e [`docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`](file:///d:/.GITHUB/games/game-2d/docs/prompts%20a%20executar/contexto-sobre-a-arma-do-hero.md).

---

## 1. Decomposição Anatômica e Materiais Procedurais (`1254 × 1254` Nativo)

Diferente do estudo de caso de Rafa + Claude (que possuía apenas a referência do rosto), nosso projeto conta com **ROSTO + CORPO + ARMA** oficiais em `assets/references/ref-2d-hero/hero-parts/`. Nosso [`HeroRenderer.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/HeroRenderer.js) reconstrói o herói 100% em código HTML5 Canvas 2D:

1. **Cabeça, Rosto e Cabelo ([`HeadPainter.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/painters/HeadPainter.js)):**
   - Rosto anguloso com iluminação tridimensional quente, cicatriz vertical sobre o olho esquerdo, sobrancelhas franzidas, íris em brasa e 4 camadas de mechas espetadas com raiz escura e pontas iluminadas.
   - Evidência: [`01-compare-head.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/01-compare-head.png).
2. **Tronco, Peitoral, Cinto de Caveira e Capa ([`TorsoPainter.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/painters/TorsoPainter.js) & [`CapePainter.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/painters/CapePainter.js)):**
   - Peitoral exposto com tiras cruzadas de couro escuro, ombreiras com rebites metálicos, fivela central de crânio com olhos rubros, saiote de couro laminado e capa carmim desgastada.
   - Evidências: [`02-compare-body-nocape.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/02-compare-body-nocape.png) e [`03-compare-body.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/03-compare-body.png).
3. **Pernas, Joelheiras e Botas ([`LegPainter.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/painters/LegPainter.js)):**
   - Calças escuras com dobras de tensão, caneleiras de couro amarradas por tiras e botas pesadas com sola tratorada.

---

## 2. Fidelidade das Armas — Lâminas do Caos (`contexto-sobre-a-arma-do-hero.md`)

Cumprindo estritamente todas as regras mandatórias de [`contexto-sobre-a-arma-do-hero.md`](file:///d:/.GITHUB/games/game-2d/docs/prompts%20a%20executar/contexto-sobre-a-arma-do-hero.md):

1. **Identidade Absoluta (NUNCA Machados):**
   - As armas em [`WeaponPainter.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/painters/WeaponPainter.js) são duas **grandes adagas/facas curvas infernais** inspiradas diretamente nas **Blades of Chaos** de Kratos (*God of War*).
   - Possuem barriga cortante externa convexa com brilho de magma amarelo/laranja/vermelho, ponta frontal recurvada, dorso interno côncavo com **2 recortes dentados agressivos**, núcleo em ferro grafite queimado com fissuras incandescentes e manchas de sangue seco.
   - Evidência: [`04-compare-weapons.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/04-compare-weapons.png).

2. **Mãos e Empunhaduras com Oclusão Real de 5 Subcamadas ([`ArmPainter.js`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/src/painters/ArmPainter.js)):**
   - A conexão mão ↔ arma foi reconstruída para eliminar qualquer aparência de "arma colada por cima da mão". A ordem exata de pintura em coordenadas locais da empunhadura `(529, 738)` é:
     1. `gripBack`: Base tenar da palma e couro traseiro da luva passando **por trás** do cabo.
     2. `fingersBack`: Pontas dos dedos curvadas na face interna traseira do cabo.
     3. `WeaponPainter.paint`: Cabo de couro trançado, pomo craniano e lâmina.
     4. `fingersFront` (`paintClenchedFingersOverHilt`): **4 dedos individuais esculpidos (Mínimo, Anelar, Médio e Indicador)** abraçando transversalmente o cabo pela frente, com brilhos de falange, dobras articulares e sombras de oclusão entre cada dedo.
     5. `thumbPath` & `guardLip`: **Polegar em oposição** travando a pegada por cima do dedo indicador e **aba metálica inferior da guarda (`guardLip`)** selando o topo da mão.

3. **Correntes Infernais nos Antebraços e no Pomo (`forearmWraps` + Catenária Dinâmica):**
   - **Voltas no Antebraço:** `ArmPainter.paintForearmChainWrapsBack` e `ArmPainter.paintForearmChainWrapsFront` desenham **3 voltas diagonais completas de elos metálicos individuais** de ferro queimado com brasa incandescente cruzando o brarete de couro e presas a uma algema forjada no pulso.
   - **Conexão Pomo ↔ Pulso:** `WeaponPainter.paintDynamicPommelToWristChain` conecta o anel do pomo `(538, 794)` diretamente à algema do pulso em qualquer pose de combate ou extensão de corrente (`chainExtend`), mantendo elos individuais volumosos.
   - Evidência: [`05-compare-hero-idle-s.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/05-compare-hero-idle-s.png) e [`06-isolated-multiscale.png`](file:///d:/.GITHUB/games/game-2d/prototypes/antigravity/desenho-v1-antigravity/screenshots/06-isolated-multiscale.png).
