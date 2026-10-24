# 07 — Testes, medição e lacunas

## Testes preparados, não declarados como executados
Comando: \`node tests/test.cjs\`. O script inclui assertivas puras cobrindo 3 alvos, colisão da ilha, buffer de combo, hit único, danos, arco de impacto, dash/iframes, movimento e ataque de inimigo. **Nenhuma saída PASS foi observada por execução do script nesta sessão**; o sucesso ainda precisa ser verificado.

## QA em navegador (pendente)
1. Abrir por \`file://\` no Windows Chrome/Edge; verificar tela de Canvas não vazia e ausência de erros de console.
2. Mover nas 4 diagonais; checar colisão da costa sem atravessar limites.
3. Apontar para alvos, atacar, encadear três tempos e observar HP/KO/respawn.
4. Examinar separadamente rosto, mãos, correntes e arma ao andar/atacar.
5. Verificar Z-sort e oclusão com personagem acima/abaixo de inimigos.
6. Coletar screenshots **reais** em 1280×720; não usar imagens geradas para simular resultado de código.

## Performance
\`__GAME2D_QA__.benchmarkUncapped(90)\` executa ciclos de desenho não sincronizados com o monitor e expõe média/p95/p99 do draw e throughput estimado. É um teste *microbenchmark de desenho*, **não FPS sustentados de gameplay em hardware real**.
O loop jogável usa \`requestAnimationFrame\` + integração física em 120 passos/s; um monitor a 60 Hz normalmente exibirá cerca de 60 quadros/s. Não confundir taxa da tela com orçamento computacional. Para aprovar 200 FPS em 1280×720, será necessário medição de execução real em navegador sem vsync, incluindo atualização, eventos, render e outras tarefas.

## Resultado nesta sessão
| Gate | Situação |
|---|---|
| Integridade de escopo / paths | Verificado ao preparar árvore Git |
| Presença de lógica e testes automatizados | Fonte criada, **ainda não executada** |
| Console e browser | **Não testado** |
| Screenshots comparativos | **Não capturados** |
| Teste em Galaxy S20 FE / mais fraco | **Não testado neste hardware** |
| Meta 200 FPS sustentados | **Não comprovada** |
| Aprovação visual | **Pendente do usuário** |
