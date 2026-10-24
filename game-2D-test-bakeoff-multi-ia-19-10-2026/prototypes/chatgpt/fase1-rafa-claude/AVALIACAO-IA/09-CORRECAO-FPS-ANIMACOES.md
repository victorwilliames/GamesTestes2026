# 09 — Correção de FPS e animações · 19/10/2026

## Evidência observada
Usuário testou a Fase 1 e relatou **menos de 10 FPS**, caminhada/corrida com aspecto de personagem arrastado e ausência de movimento natural. Esse feedback invalida qualquer leitura anterior de arena pronta.

## Análise de causa
\`src/game.js\` original chamava \`painter.render(ctx,pose)\` **em todo frame**. O renderer modular aprovado tem alto custo de desenho: \`WeaponPainter\` executa centenas de linhas decorativas/veios de lava e cria vários \`Path2D\`/gradientes; \`MaterialPainter\` desenha texturas detalhadas e granulação. Escalar o \`ctx\` para 0.167 NÃO reduz o custo JS de construir as geometrias e suas operações Canvas. O \`RigAdapter.run\` existente tinha poses senoidais, não um ciclo de marcha com fase de apoio sincronizada à locomoção; o motor transladava \`hero.x/y\` sem contato convincente do pé no solo.

## Mudanças reais no código
1. Criado \`src/animation.js\` com gerador de poses que usa a mesma geometria canônica e materiais do renderer aprovado; idle com respiração/cabeça/capa; caminhada/corrida com fases de apoio e retorno da perna, IK analítico (dois ossos) dos joelhos, contrabalanço dos braços e leve deslocamento do tronco; três fases distintas de golpe (variação direita/esquerda/duplo). Não é uma animação perfeita nem 8 direções.
2. Atlas de frames procedurais **renderizados uma vez em memória** em \`canvas\` de escala gameplay, recuperados por \`drawImage\` com crossfade entre dois quadros. Não usa PNG externo nem spritesheet de arte importada; nunca altera o renderer original. Poses geradas progressivamente e cacheadas para reduzir freezes contínuos.
3. Velocidades de caminhada 145 px/s e corrida Shift 235 px/s, com taxa de passada 1,67 e 2,65 ciclos/s. Espaço permanece dash, Shift virou corrida.
4. Telemetria expõe número de poses já cacheadas, \`__GAME2D_QA__.getState().atlas\`, consumo estimado em MB e falhas de criação. Benchmark mede throughput de desenho **com cache** e não prova 200 FPS sustentados.

## Ressalvas técnicas obrigatórias
- Renderização inicial do atlas ainda pode ser custosa, sobretudo no celular; cache gera uma pose de cada vez com folga para a UI.
- Pés seguem trajetória com **compensação aproximada de apoio**, não garantia física absoluta sob mudança brusca de direção/velocidade.
- A arte só tem orientações S/SE/SW; deslocar-se para o Norte pode parecer incorreto. Direções restantes exigem reconstrução artística real, sem espelhamento mecânico.
- O gesto de golpe usa o mesmo \`WeaponPainter\` e conexões do rig, mas a precisão da oclusão e da pegada precisa de screenshot.
- **Ainda não executado em Chromium real nesta sessão e não testado no hardware do usuário.** Os números 200 FPS e abaixo de 10 FPS são respectivamente meta do projeto e feedback humano, não medição nova.
- O padrão ouro continua sendo comparar imagem real das 3 orientações com os PNGs oficiais, testar corrida em várias direções, medir p95/p99 de render e validar FPS sem vsync e 1280×720.

## Próxima etapa
Se a experiência continuar lenta após aquecimento, investigar cache build time, reduzir frames de animação e custo inicial por quadro; opcionalmente mover pré-renderização para Worker/OffscreenCanvas compatível com \`file://\`. Corrigir foot sliding residual com ancoragem física baseada no deslocamento real em mundo; depois criar vistas traseiras autorais.

## Revisão técnica V2.1
- Cache completo limitado a 132 frames para as três orientações (126 poses), sem descarte prematuro e sem renderizações repetidas por evicção.
- Quando um frame já está na fila, solicitações de jogabilidade podem promovê-lo, reduzindo tempo até aparecer a animação solicitada.
- Ajustado blending para respeitar transparência do personagem e acrescentado crossfade de 130 ms entre idle, caminhada, corrida e ataque.
- Inspeção programática em V8 de **768 combinações** (4 estados × 3 orientações × 64 fases) confirmou coordenadas finitas, armas conectadas às mãos e nenhum osso superior do joelho fora da faixa avaliada. **Não é benchmark nem teste visual.**

## Medição protegida
O botão de benchmark agora aguarda as 126 poses estarem cacheadas; não produz FPS teórico enganoso enquanto só desenha a pose placeholder. O rodapé expõe claramente a fase de preparação e eventuais erros. A taxa de atualização de tela continua separada do throughput sem vsync.
