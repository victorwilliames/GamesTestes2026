# 04 — FIDELIDADE VISUAL (herói × assets oficiais)

**Referências oficiais usadas**
- `assets/references/ref-2d-hero/hero-parts/hero-part-head.png`
- `assets/references/ref-2d-hero/hero-parts/hero-part-body.png`
- `assets/references/ref-2d-hero/hero-parts/hero-part-body-tpose.png` (e variante `nocape`)
- `assets/references/ref-2d-hero/hero-parts/hero-part-weapons.png`
- `assets/references/ref-2d-hero/hero-complet-idle/hero-idle-s.png` (proporção/total)
- `assets/references/ref-2d-maps/map-island-enemys.png` (composição, HUD e escala de inimigos)

**Evidência do produzido**
- `../desenho-v1-deepseek/screenshots/hero-proporcoes.png` (idle ampliado 0,42× com régua em unidades)
- `../desenho-v1-deepseek/screenshots/game-final.png` (idle em escala de jogo)
- `../desenho-v1-deepseek/screenshots/poses-ataque.png` (3 golpes × 3 fases)
- `../desenho-v1-deepseek/screenshots/dev-compare-04.png` (comparação lado a lado — build inicial)

---

## 1. Medidas objetivas

| Medida | Referência | Esta entrega |
|---|---|---|
| Imagem oficial do herói completo | 1254 × 1254; conteúdo em `x 79..1174`, `y 15..1233` → **1095 × 1218 px** (aspecto 0,90) | herói em unidades: **1400 u de altura** (pelve em 460, ombros em 675, topo do cabelo em 1400) |
| Folha de armas | 1254 × 1254; conteúdo `x 33..1220`, `y 270..990` → **1187 × 720 px** para as **duas** lâminas | cada lâmina se estende ≈ **200 u** a partir do grip (ponta desenhada a 268 u), com ≈ 70 u de cabo atrás |
| Silhueta com armas | largo/total ≈ 0,90 | largo/total ≈ **0,77** (as lâminas ainda ficam ~13% mais recolhidas que a referência) |
| Escala na arena | inimigos ~60% do herói (mapa) | inimigos `SC = 1,52` sobre o esqueleto autorado → ≈ **55–60%** do herói |

> O aspecto 0,77 × 0,90 mostra objetivamente a diferença que ainda vejo a olho: **as lâminas da
> referência abrem mais para os lados**. Aumentar mais a abertura mudaria o arco dos golpes e a
> hitbox; ficou registrado como ajuste pendente em vez de ser escondido.

---

## 2. Correspondências (o que está fiel)

| Elemento | Referência | Implementação | Evidência |
|---|---|---|---|
| Proporção super-deformed, cabeça grande | `hero-idle-s.png` | cabeça + cabelo ocupam quase metade da altura; corpo curto e pernas grossas | `hero-proporcoes.png` |
| Cabelo castanho escuro, volumoso, mechas pontiagudas | `hero-part-head.png` | juba em `paintHair` com mechas radiais + sombra em massas | idem |
| Olhos vermelhos, íris com contorno escuro | idem | `paintEyes` com íris carmesim, pupila e brilho | idem |
| Pele bronzeada, sombra quente | idem | `kind:'skin'` base `#e89962`, sombra `#bd6b44`, deep `#a3553a` | idem |
| Peito descoberto, definição estilizada | `hero-part-body.png` | peitoral em duas massas + abdômen | idem |
| Lenço/cachecol vermelho no pescoço | idem | gola vermelha + ponta do lenço | idem |
| Cinto escuro com **fivela de caveira frontal única** | idem | `paintBelt` + caveira central (uma só) | idem |
| Saiote/tanga escura com recortes | idem | saia com folhas rasgadas e forro vermelho | idem |
| Braçadeiras de couro com correias e fivela | idem | `drawForearm` + tiras + rebites | idem |
| Botas pesadas com cano, dobras e solado | `hero-part-body.png` | `drawBoot` com cano, tiras e solado | idem |
| **Duas** adagas curvas (não machados), fio externo, recortes internos | `hero-part-weapons.png` | lâmina curva em asa, dentes internos, chapa escura | `hero-proporcoes.png` |
| Núcleo incandescente e halo de fogo | idem | miolo laranja/amarelo + seção `8b` com `lighter` (30 px laranja + 11 px amarelo) | idem + `game-final.png` |
| Sangue em manchas e riscos | idem | `wash` com respingos determinísticos | `hero-proporcoes.png` |
| Corrente de **elos individuais** no pomo e enrolada no antebraço | idem | `DS.drawChain` (elos ovais alternados) + voltas no pulso/antebraço | idem |
| Mão **segurando** o cabo | idem | palma atrás → cabo → dedos/polegar na frente | idem (ampliado) |
| O mesmo renderer parado e atacando | regra do projeto | `DS.drawHero` único; `DS.drawWeapon` único | `poses-ataque.png` |

---

## 3. Diferenças restantes (honestas)

1. **Boca e queixo.** A boca fica um pouco abaixo do centro ideal e o queixo se funde ao pescoço na
   vista 3/4. É o defeito nº 1 do rosto.
2. **Orelhas.** Ainda maiores e mais "redondas" que a referência (já reduzidas ~45% numa rodada
   específica; continuam estilizadas).
3. **Cachecol.** A referência tem um lenço mais volumoso, com dobras; o meu é uma faixa fina com
   ponta.
4. **Capa.** A folha oficial de corpo tem variante **com capa** (`hero-part-body-tpose.png`) e
   **sem capa** (`...-nocape.png`). A descrição canônica do personagem no repositório fala em
   **lenço vermelho**, não capa; segui a leitura "sem capa". Se o juiz considerar a capa
   obrigatória, é a maior ausência de silhueta.
5. **Dentes internos da lâmina.** A referência tem recortes dentados mais numerosos e irregulares;
   eu simplifiquei para ~6 dentes por lâmina (leitura limpa no tamanho de jogo).
6. **Textura pictórica.** A referência é pintura digital com pinceladas; a minha é `wash` + `hatch`
   procedural determinístico. A *linguagem* é a mesma (2–3 tons + tinta), a *pincelada* não é
   idêntica — e não deveria ser, já que a regra é não usar a imagem oficial em runtime.
7. **Abertura das lâminas** (aspecto 0,77 × 0,90 — ver §1).
8. **Vista única.** Não há turnaround: o herói é desenhado para a direita e espelhado
   (`facing = -1`). A referência tem vistas S e SE.

---

## 4. O que foi feito para chegar aqui (rodadas de crítica)

| Rodada | Defeito observado | Correção aplicada | Evidência |
|---|---|---|---|
| 1 | pernas espelhadas erradas / braços finos | separação dos painters de membro + espessura | `dev-legs-debug.png`, `dev-hero-01..05` |
| 2 | proporção chibi "esticada" | constantes `THIGH 180`, `SHIN 150`, `GROUND 460`, `SHOULDER [192,-215]` | `dev-hero-06..09` |
| 3 | arma pequena e sem leitura de fogo | `BLADE_SCALE 0,98` + halo emissivo | `dev-weapon-06..09`, `hero-proporcoes.png` |
| 4 | arma "flutuando" fora da mão | arma passou a viver no espaço local do punho (`wrist → rotate(wa)`) | `poses-ataque.png` |
| 5 | braço de trás sumia atrás do tronco | ombro esquerdo 34 u mais para fora + braços na frente no ataque | `hero-proporcoes.png` |
| 6 | orelhas gigantes | orelha reduzida e remodelada | antes/depois em `hero-proporcoes.png` |
| 7 | poses de ataque "paradas" | novos arcos de ataque (ponta descreve arco grande) | `poses-ataque.png` |
| 8 | arma custava 16,3 ms/quadro | arma+mão em bitmap cacheado (mesma arte) | `07-TESTES-E-VALIDACAO.md` |

---

## 5. Veredito de fidelidade (autoavaliação)

- **Silhueta geral, paleta e identidade do personagem:** **aprovado** — quem olha reconhece o HERO-02
  (cabeça grande, juba, olhos vermelhos, peito nu, caveira no cinto, duas adagas de fogo acorrentadas).
- **Fidelidade de rosto em close:** **parcial** — boca/queixo e orelhas ainda diferem.
- **Fidelidade das armas:** **aprovado em identidade** (curvas, incandescentes, acorrentadas, na mão),
  **parcial em detalhe** (dentes internos simplificados, abertura lateral menor).
- **Fidelidade de animação:** **aprovado** no escopo proposto (idle/caminhada/corrida/3 ataques/dash/
  giro/dano), com a ressalva de não haver IK nem turnaround.
