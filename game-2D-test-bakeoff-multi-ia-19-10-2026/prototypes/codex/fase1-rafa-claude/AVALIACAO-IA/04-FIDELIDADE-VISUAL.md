# 04 — Fidelidade visual (gate ainda aberto)

## Referências oficiais
\`assets/references/ref-2d-hero/hero-parts/\`: \`hero-part-head.png\`, \`hero-part-body.png\`, \`hero-part-body-tpose.png\`, \`hero-part-weapons.png\`.
\`assets/references/ref-2d-maps/map-island-enemys.png\`: composição 3/4 para arena.

## O que o código realmente preserva
O \`bundle.js\` local é o mesmo blob da solução Antigravity considerada aprovada como **ponto de partida**: cabeça chibi, olhos vermelhos, cabelo volumoso, peito à mostra, cachecol/capa vermelhos, caveira frontal, botas, duas armas curvas e correntes. \`src/game.js\` alimenta \`RigAdapter.computePose\`, sem rasterizar os PNGs oficiais.

## O que ainda não está confirmado
- Comparação com a referência oficial no mesmo enquadramento, sobretudo na escala de gameplay.
- Aderência absoluta da lâmina a uma **adaga** e não a machado (precisa inspeção visual).
- Fingers/grip e correntes sob todos os ataques, direção norte e giros de 360°.
- Perspectiva do personagem contra a arena tropical.
- Ausência de flicker e variações por frame nas texturas.
- Qualidade no celular.

## Rubrica pendente (0 a 4)
| Critério | Nota |
|---|---|
| Silhueta / proporção | **Não avaliada** |
| Rosto / cabelo / expressão | **Não avaliada** |
| Corpo / tecidos / caveira | **Não avaliada** |
| Adagas / elos / pegada | **Não avaliada** |
| Materiais pictóricos | **Não avaliada** |
| Integração da câmera e arena | **Não avaliada** |

Sem captura real de navegador, seria incorreto atribuir uma nota ou marcar Gate A como aprovado. É necessária revisão humana por screenshots de cabeça, corpo, armas, idle, movimento e ataques.
