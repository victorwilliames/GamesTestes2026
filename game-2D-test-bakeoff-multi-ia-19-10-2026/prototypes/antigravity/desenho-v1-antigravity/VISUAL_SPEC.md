# Especificação Visual Canônica — HERO-02 (`desenho-v1-antigravity`)

## 1. Fontes Canônicas Analisadas (1254 × 1254 RGBA)

Todas as medições abaixo foram extraídas diretamente dos arquivos de referência oficiais em `assets/references/ref-2d-hero/`:

| Arquivo | Dimensões | Bounding Box Útil (`x`, `y`, `w × h`) | Papel na Análise |
|---|---|---|---|
| `hero-parts/hero-part-head.png` | `1254 × 1254` | `x=[6..1242]`, `y=[78..1139]` (`1237 × 1062`) | Geometria detalhada da cabeça, 22 mechas de cabelo, olhos, orelhas e expressão |
| `hero-parts/hero-part-body.png` | `1254 × 1254` | `x=[171..1233]`, `y=[216..1170]` (`1063 × 955`) | Corpo em pose natural com cachecol, capa assimétrica, cinto/caveira, saiote e botas |
| `hero-parts/hero-part-body-tpose.png` | `1254 × 1254` | `x=[21..1231]`, `y=[284..1164]` (`1211 × 881`) | Corpo em T-pose com capa e cachecol |
| `hero-parts/hero-part-body-tpose-nocape.png` | `1254 × 1254` | `x=[7..1246]`, `y=[320..1121]` (`1240 × 802`) | Anatomia pura sem capa: pescoço, trapézio, deltoides, peitoral, abdômen e braçadeiras |
| `hero-parts/hero-part-weapons.png` | `1254 × 1254` | `x=[33..1220]`, `y=[270..990]` (`1188 × 721`) | Par de adagas curvas incandescentes, dentes internos, cabos e correntes |
| `hero-complet-idle/hero-idle-s.png` | `1254 × 1254` | `x=[79..1174]`, `y=[15..1233]` (`1096 × 1219`) | Montagem frontal completa (Sul `0°`) |
| `hero-complet-idle/hero-idle-se.png` | `1254 × 1254` | `x=[110..1193]`, `y=[32..1236]` (`1084 × 1205`) | Orientação 3/4 Sudeste (sem espelhamento mecânico) |
| `hero-complet-idle/hero-idle-sw.png` | `1254 × 1254` | `x=[85..1188]`, `y=[34..1238]` (`1104 × 1205`) | Orientação 3/4 Sudoeste (sem espelhamento mecânico) |

---

## 2. Silhueta, Proporções e Distribuição de Massas

Na montagem completa (`hero-idle-s.png`, altura útil total `1219 px` de `y=15` a `y=1233`, eixo central `cx = 627`):

1. **Relação Cabeça vs. Corpo (Proporção Chibi Extrema ~1:1):**
   - **Cabeça completa (topo do cabelo ao queixo):** `y = 15 .. 634` (`619 px`, **50,8%** da altura total).
   - **Corpo abaixo do queixo (cachecol até a sola das botas):** `y = 634 .. 1233` (`599 px`, **49,2%** da altura total).
   - **Fator de escala exato da peça `hero-part-head.png` na montagem `hero-idle-s.png`:** `0.584×` (distância interpupilar `298 px` na peça isolada → `174 px` no herói completo).
2. **Distribuição Vertical de Marcos Anatômicos (`hero-idle-s.png`, `cx = 627`):**
   - Ponta mais alta da coroa de cabelo: `(505, 15)`
   - Linha das sobrancelhas: `y = 480 .. 535`
   - Centros das íris vermelhas: olho esquerdo `(541, 547)`, olho direito `(715, 539)`
   - Orelhas: `y = 505 .. 608`, largura externa `x = 398 .. 860` (`462 px`)
   - Base do queixo: `(627, 634)`
   - Cachecol vermelho no pescoço: `y = 634 .. 732` (pico inferior central em `(627, 732)`)
   - Tronco exposto (peitoral e abdômen): `y = 732 .. 798`, largura `x = 495 .. 755` (`260 px`)
   - Fivela de caveira frontal e cinto: `y = 794 .. 877`, centro `(625, 835)`
   - Saiote escuro rasgado e faixas vermelhas: `y = 840 .. 1038`
   - Coxas expostas: `y = 980 .. 1055`
   - Botas colossais (4 dobras de cano + tira do peito do pé + biqueira + sola tratorada): `y = 1030 .. 1233`, largura total na base `x = 305 .. 945` (`640 px`)
3. **Distribuição Horizontal de Massas:**
   - Envergadura do cabelo: `x = 218 .. 996` (`778 px`)
   - Envergadura com as duas lâminas em punho: `x = 79 .. 1174` (`1095 px`)
   - Silhueta em duplo trapézio invertido: grande massa superior (cabelo/cabeça), cintura compacta com caveira central e base pesada ancorada pelas botas largas e pelas duas lâminas curvas laterais.

---

## 3. Paleta Hexadecimal Medida por Material

| Material | Sombra Profunda / Contorno | Base / Meio-Tom | Luz / Realce | Detalhes Especiais |
|---|---|---|---|---|
| **Contorno Artesanal (Tinta/Crayon)** | `#140905` | `#24120b` | `#3b2015` | Traço granulado multipassagem com variação de pressão |
| **Cabelo Castanho-Expresso** | `#1c0e09` / `#2b160f` | `#432519` / `#5c3424` | `#8f5338` / `#c77d54` / `#f0b286` | Fibras curvas internas + pincel seco acobreado nas cristas |
| **Pele Quente (Massinha/Pastel)** | `#b85c28` / `#d97c43` | `#f5ad73` / `#fabf8a` | `#ffd7ad` / `#ffe6c9` | Sombra alaranjada/terracota + granulação orgânica fosca |
| **Olhos Vermelhos** | `#2b0305` (cílios/borda) | `#9e060d` / `#d90b16` | `#ff2424` / `#ff6b6b` | Esclera `#f7ebe6` com sombra `#c9aca2`; pupila vertical `#170304` |
| **Tecido Vermelho (Cachecol/Capa/Faixas)** | `#380205` / `#66050a` | `#b80d14` / `#de1720` | `#ff3333` / `#ff6359` | Trama cruzada de tecido + dobras escuras profundas |
| **Couro Escuro (Botas/Braçadeiras/Cinto/Saiote)** | `#1f110c` / `#331d15` | `#4d2d20` / `#663d2c` | `#8c5840` / `#b87a5a` / `#d99b78` | Porosidade de argila/couro + pespontos claros |
| **Caveira (Osso Envelhecido)** | `#1c0f0a` (órbitas/nariz) | `#b89f82` / `#d6c2a7` | `#efe4d2` / `#fbf5eb` | Poros, fissuras cranianas e 4 dentes frontais esculpidos |
| **Correntes e Anéis (Bronze/Cobre)** | `#291309` / `#4f2714` | `#8a4826` / `#b86537` | `#e08e58` / `#f7ba88` | Elos individuais com furo central e luz especular quente |
| **Lâminas — Aço Escovado (Bisel Superior)** | `#3d2e29` / `#634f47` | `#968177` / `#c4b2a7` | `#ebe0d8` / `#ffffff` | Riscos diagonais de batalha e dentes afiados |
| **Lâminas — Ferro Vulcânico e Magma** | `#1c0d0b` / `#301815` | `#cc1100` / `#ff4800` | `#ff9900` / `#ffe600` / `#ffffcc` | Crosta poligonal escura rachada sobre veios incandescentes |

---

## 4. Características de Contorno, Textura e Sobreposição

1. **Contornos Artesanais (`inkBrush`):**
   - Não são linhas vetoriais lisas uniformes; possuem espessura modulada (`3.5 px` a `8.5 px` na escala 1254) e textura seca de giz/lápis (`crayon grain`) ao longo das bordas externas e vincos internos.
2. **Textura Determinística por Superfície (`MaterialPainter`):**
   - **Cabelo:** Estrias direcionais curvas seguindo o eixo Bézier de cada uma das 22 mechas, combinando sulcos escuros e fios claros acobreados na face superior das mechas.
   - **Pele:** Sombreamento volumétrico suave nos peitorais, gomos abdominais, deltoides, bochechas e conchas das orelhas, somado a granulação stipple/hachura pastel determinística.
   - **Couro e Saiote:** Manchas granulares foscas (marcas táteis de modelagem), costuras pontilhadas nos canos das botas e rasgos angulares nas pontas do saiote (incluindo o rasgo triangular característico sobre a coxa direita).
   - **Armas:** Contraste dramático entre o aço frio arranhado no dorso interno dentado e o brilho vulcânico amarelo-laranja-vermelho na borda curva externa, separado por ilhas irregulares de escória metálica preta.
3. **Ordem Estrita de Camadas (Z-Order de Trás para Frente):**
   1. `CapeBack` (capa vermelha assimétrica esvoaçando para a direita/trás)
   2. `HairBackCrown` (mechas traseiras da nuca e coroa superior)
   3. `WeaponsBack` / `Chains` (correntes traseiras das lâminas quando aplicável)
   4. `Legs` (coxas musculosas esquerda e direita)
   5. `SkirtBack` & `SkirtFront` (saiote escuro rasgado + faixas vermelhas pendentes)
   6. `Boots` (botas colossais sobrepondo a base das canelas/saiote lateral)
   7. `Torso` (pescoço, trapézio, peitoral e abdômen)
   8. `BeltAndAccessories` (cinto de couro, faixas vermelhas laterais, correntes de bronze da cintura e **caveira única central**)
   9. `Arms` & `Bracers` (ombros/deltoides, bíceps, antebraços e braçadeiras em camadas)
   10. `Weapons` & `Hands` (punhos fechados empunhando os cabos e lâminas curvas + correntes pendentes)
   11. `Scarf` (cachecol vermelho volumoso cobrindo a junção do pescoço e ombros)
   12. `Head` (`Ears` → `FaceBase` → `FacialFeatures` → `BangsShadow` → `HairMidLocks` → `HairFrontBangs`)
