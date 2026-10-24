# Especificação de Pivôs, Articulações e Integração RIG-01 (`PIVOTS_SPEC.md`)

## 1. Sistema de Coordenadas e Convenções

O renderer opera em um espaço canônico normalizado de referência **`1254 × 1254`** (com centro horizontal `cx = 627` e linha de chão `groundY = 1230`), podendo ser renderizado em qualquer escala (`1x`, `0.5x`, escala de gameplay `1280 × 720`, ou zoom `2x`) através de transformações afins nativas do `CanvasRenderingContext2D`.

Cada componente (`HeadPainter`, `TorsoPainter`, `ArmPainter`, `HandPainter`, `LegPainter`, `BootPainter`, `ScarfPainter`, `CapePainter`, `ClothPainter`, `AccessoryPainter`, `WeaponPainter`) desenha sua geometria em **coordenadas locais relativas ao seu pivô anatômico** ou interpoladas ao longo do segmento ósseo (`boneStart → boneEnd`), garantindo que rotações e translações do esqueleto movam e deformem a arte sem criar buracos nas juntas.

---

## 2. Mapa de Articulações e Pivôs Anatômicos (Pose Canônica `hero-idle-s`)

| ID do Pivô / Junta | Coordenada Canônica `(x, y)` | Pai Hierárquico | Função Anatômica e Visual |
|---|---|---|---|
| `root` / `ground` | `(627, 1230)` | — | Âncora de solo entre os dois pés |
| `pelvis` / `hipCenter` | `(627, 835)` | `root` | Centro do cinto e da fivela de caveira; origem do saiote e do tronco inferior |
| `chest` / `spineUpper` | `(627, 745)` | `pelvis` | Centro torácico entre os peitorais |
| `neckBase` | `(627, 655)` | `chest` | Base do pescoço e âncora central do cachecol vermelho |
| `headPivot` | `(627, 585)` | `neckBase` | Pivô de rotação/inclinação da cabeça chibi |
| `capeAttach` | `(685, 665)` | `neckBase` | Ponto de fixação dorsal-direito da capa vermelha assimétrica |
| `shoulderL` (Dir. Tela: Esq) | `(468, 692)` | `chest` | Articulação glenoumeral esquerda (com sobreposição circular sob o cachecol) |
| `elbowL` | `(388, 765)` | `shoulderL` | Articulação do cotovelo esquerdo (coberta pela braçadeira superior) |
| `wristL` | `(335, 845)` | `elbowL` | Pulso esquerdo (coberto pela braçadeira inferior) |
| `handGripL` | `(352, 892)` | `wristL` | Centro do punho esquerdo e eixo de empunhadura da lâmina esquerda |
| `weaponChainAttachL` | `(285, 895)` | `handGripL` | Anel intermediário e pomo da lâmina esquerda para suspensão da corrente |
| `shoulderR` (Dir. Tela: Dir) | `(786, 692)` | `chest` | Articulação glenoumeral direita |
| `elbowR` | `(866, 765)` | `shoulderR` | Articulação do cotovelo direito |
| `wristR` | `(919, 845)` | `elbowR` | Pulso direito |
| `handGripR` | `(902, 892)` | `wristR` | Centro do punho direito e eixo de empunhadura da lâmina direita |
| `weaponChainAttachR` | `(969, 895)` | `handGripR` | Anel intermediário e pomo da lâmina direita para suspensão da corrente |
| `hipL` | `(520, 885)` | `pelvis` | Articulação coxofemoral esquerda (sob o saiote rasgado) |
| `kneeL` | `(482, 1020)` | `hipL` | Joelho esquerdo (transição coxa → cano superior da bota) |
| `ankleL` | `(448, 1145)` | `kneeL` | Tornozelo esquerdo (interior da bota) |
| `footSoleL` | `(428, 1225)` | `ankleL` | Base de contato da sola esquerda com o chão |
| `hipR` | `(734, 885)` | `pelvis` | Articulação coxofemoral direita (sob o saiote rasgado) |
| `kneeR` | `(772, 1020)` | `hipR` | Joelho direito |
| `ankleR` | `(806, 1145)` | `kneeR` | Tornozelo direito |
| `footSoleR` | `(826, 1225)` | `ankleR` | Base de contato da sola direita com o chão |

---

## 3. Tratamento de Juntas e Prevenção de Desconexão

1. **Ombros (`shoulderL` / `shoulderR`):** O contorno superior do deltoide é desenhado com cabeça esférica embutida sob a aba inferior do cachecol (`ScarfPainter`), garantindo zero abertura mesmo quando o braço sobe 90° em T-pose (`hero-part-body-tpose`) ou gira em ataques.
2. **Cotovelos (`elbowL` / `elbowR`):** O segmento superior do braço e o antebraço compartilham tangentes suaves no cotovelo, e a braçadeira superior de 3 tiras de couro envolve a região proximal do antebraço, mascarando a dobra.
3. **Pulsos (`wristL` / `wristR`):** Cobertos pelas 5 voltas da braçadeira inferior e pela aba de couro que avança sobre o dorso do punho (`HandPainter`).
4. **Quadril (`hipL` / `hipR`):** O saiote escuro de pontas rasgadas (`ClothPainter`) e as faixas vermelhas cobrem inteiramente a raiz das coxas, permitindo que as pernas rotacionem ou flexionem sem expor recortes geométricos.
5. **Joelhos e Tornozelos (`knee` / `ankle`):** O topo largo das botas de 4 dobras (`BootPainter`) recebe a coxa com chanfro sombreado interno, funcionando como uma junta telescópica orgânica.

---

## 4. Contrato do Adaptador `RigAdapter` (Integração com `RIG-01`)

O módulo `src/rig/RigAdapter.js` conecta o esqueleto matemático 3D/2.5D do `RIG-01` (com IK analítico de 2 ossos nos membros, inclinação de tronco, balanço de passo e rotação `yaw`) diretamente à estrutura de `Pose` consumida pelo `HeroRenderer`:

- **Entrada do `RigAdapter`:** Estado do rig (`poseName`: `'idle' | 'run' | 'attack' | 'tpose'`, `yawDeg`: ângulo em graus como `0° Sul`, `+35° SE`, `-35° SW`, `phase`: fase normalizada do ciclo).
- **Saída do `RigAdapter`:** Objeto `HeroPose` contendo posições 2D projetadas de todas as 22 juntas, ângulos locais de cada segmento, vetor de paralaxe facial/craniana `yawOffset` (`-1 .. +1`) e parâmetros de reação secundária da capa e correntes.
- **Proibição de Espelhamento Mecânico:** Quando `yawDeg !== 0`, o `RigAdapter` desloca os volumes por profundidade (`z`) na projeção 3/4:
  - A franja frontal mantém sua divisão natural da direita para a esquerda da tela.
  - A capa vermelha assimétrica permanece presa ao lado direito e projeta suas pontas rasgadas conforme o `yaw`.
  - A caveira frontal acompanha a rotação da linha média do cinto com escorço horizontal suave.
