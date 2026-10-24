# 05 — Implementação e rig

## Arquitetura entregue
\`\`\`
index.html             UI + Canvas de 1280×720 (offline)
bundle.js              blob inalterado da base Antigravity, copiado para esta pasta
src/combat.js           regras puras: HP, arcos, 3 estágios, buffer de combo, dano, KO e dash
src/game.js             input, loop fixed-step 120Hz, arena procedural, Z-sort, renderer, HUD e benchmark
tests/test.cjs          testes determinísticos de lógica para Node 18+
AVALIACAO-IA/            oito relatórios de continuidade
\`\`\`

## Processo de desenho
A ilha é pintada uma vez num canvas offscreen, copiada via \`ctx.drawImage(terrain)\` a cada quadro. Essa operação utiliza **somente a imagem temporária gerada pelo próprio código**, jamais PNG de personagem ou arma. O \`HeroRenderer\` é chamado a cada desenho do personagem e desenha **sempre a mesma geometria procedural** das lâminas, inclusive durante ataques.

## Rig / orientação
\`RigAdapter.computePose({action,orientation,time})\` entrega posições anatômicas usadas pelos pintores. Para movimentação usa \`run\` com fase por tempo; parado \`idle\`; ataque \`attack\`. Orientações S, SE e SW de projeção parcial, **sem rotação completa em oito vistas**. Nem toda pose tem IK de dois ossos validado, e o movimento dos pés não foi testado contra o chão.

## Contrato e falhas reconhecidas
O novo motor não mistura a lógica de hitbox com a geometria do artista. O contato usa distância e cone na arena de coordenadas 2D. O ataque visual ainda reutiliza um único preset para os três estágios mecânicos. Não foi implementada física independente das correntes nem execução do golpe de arremesso. Antes de avançar à aprovação final, testar estabilidade de punhos, articulações e pivôs durante golpes reais.
