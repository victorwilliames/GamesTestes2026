# 08 — Entrega ao juiz · Fase 1 (incremento parcial)

## Local independente
\`prototypes/chatgpt/fase1-rafa-claude/index.html\`

## Como usar
1. Abra \`index.html\` no Chrome/Edge (duplo clique; script clássico, sem server).
2. WASD para caminhar, mouse para mirar, clique esquerdo ou J para atacar; clique mais vezes para encadear; Espaço para dash.
3. Aproxime-se de qualquer um dos três alvos. Observe barra de HP, dano flutuante, KO, reação de impacto e respawn; inimigo em alcance sinaliza golpe.
4. Aperte crase para ver pivôs; pressione R para reiniciar.
5. Execute \`node tests/test.cjs\` para testar a lógica. No console, \`__GAME2D_QA__.getState()\` mostra estado e \`__GAME2D_QA__.benchmarkUncapped(90)\` avalia throughput de desenho.

## Escopo preservado
Bundle visual procedural de Antigravity **copiado localmente**, sem modificar seu original, e código independente para gameplay do ChatGPT. As duas adagas mantêm o mesmo painter em idle, run e attack; nenhum PNG de personagem usado no render do jogo. Mais detalhes em \`03-COMPARATIVO-DOS-APROVADOS.md\`.

## Gate de aceite: PARCIAL
- Conteúdo operacional **implementado em fonte**: ambiente, locomoção, três estágios de combate, alvos com dano, dash, HUD e benchmark opcional.
- **Não testado neste ambiente**: comportamento no navegador, execução Node, animação real, arte final e desempenho.
- **Ainda incompleto**: confronto artístico rigoroso com as referências; 8 orientações e IK/foot lock; golpe de corrente e combos visualmente diferentes; prova de 200 FPS no alvo; investigação integral do HTML com conversa original Rafa/Claude.

**Veredito sugerido:** candidato para primeira execução de QA, **não aceitar a Fase 1 como concluída**. Não houve vencedor declarado entre agentes.

## Próximas ações (ordem)
1. Validar execução da versão no navegador e corrigir eventuais erros.
2. Capturar telas e comparar com \`hero-parts\` e \`map-island-enemys.png\`, com avaliador artístico.
3. Corrigir orientações, foot lock e três animações de golpe com pegada/correntes persistentes.
4. Melhorar hitboxes/efeitos com evidências.
5. Medir 200 FPS em ambiente/hardware alvo e otimizar o código até o piso exigido.
6. Completar reconstrução com base no conteúdo original integral da conversa Rafa/Claude.
