# 06 — Arena e combate implementados

## Loop jogável previsto no código
- \`index.html\`: Canvas nativo 1280×720, CSS responsivo. Scripts clássicos para funcionar offline via duplo clique.
- \`src/game.js\`: fundo tropical criado matematicamente; grama, praia, mar, árvores, píer, sombras e textura sintética. Áreas estáticas pintadas offscreen; ordem de desenho dos atores conforme o eixo Y.
- Teclado WASD/setas: move herói com limites elípticos de arena; mouse: direção do olhar/ataque; clique/J: golpe; Espaço/Shift: dash e invulnerabilidade curta; R: reinício; crase: pivôs.
- 3 inimigos de teste (sentinelas) com barra de vida, telegráfo simples, reação visual a dano, knockback, KO e reaparição após 2,5 segundos.
- Combo mecânico 3 estágios: \`18/23/37\` de dano, alcance e tempos diferentes; fila de entrada durante o ataque; cada alvo só sofre dano **uma vez por golpe** (Set de IDs).
- Hitbox é aproximação radial + cone direcional, não máscara da silhueta física de cada lâmina.
- Ações de inimigos: permanecem em posição, mas fazem ataque telegráfico se herói aproxima, aplicam 8 de dano com i-frames.

## O que não está pronto
Hitboxes precisas da ponta/fio de cada adaga; combo artístico com três poses distintas; câmera móvel; combate com inimigos inteligentes; oito direções reais; física e arremesso das correntes; animações de reação mais avançadas. Esses são objetivos do prompt que **ainda não podemos marcar como concluídos**.

## Verificação da jogabilidade
Requer abrir \`index.html\` num browser real, testar input, observar 3 alvos tomando dano e examinar console. Isso não foi executado aqui.
