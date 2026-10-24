# CORREÇÃO DE DIRETÓRIO — INSTRUÇÃO MAIS RECENTE DO USUÁRIO

A pasta atribuída a esta execução é **prototypes/codex/fase1-rafa-claude/**. O usuário corrigiu explicitamente a identificação anterior: Codex tem pasta própria, distinta de ChatGPT. Toda continuação deve ocorrer aqui. Os caminhos ChatGPT no histórico abaixo descrevem a origem da investigação e da cópia; NÃO autorizam alterações lá.

A implementação existente de ChatGPT foi copiada como base, sem modificar seu código. Os arquivos novos desta sessão foram retirados da pasta ChatGPT após conferir hashes das cópias. O adendo da cronologia foi preservado apenas nesta cópia Codex. A autoria dos renderers reutilizados permanece reconhecida nos relatórios históricos.

Servidor HTTP antigo na porta5319 ainda aponta para a pasta ChatGPT e é somente baseline histórico. Não usar essa URL como evidência de mudanças Codex. Para retomar, iniciar tools/serve.cjs DESTA pasta em outra porta loopback, por exemplo GAME2D_PORT=5320. Nenhum servidor externo foi publicado.

Leia em seguida o plano10 nesta pasta. A implementação do renderer contínuo continua pendente e seu teste novo permanece vermelho esperado.

---
# Retomada para GPT Sol — 19/10/2026

## Pedido e escopo
O usuário pediu examinar o repositório e iniciar os prompts de `docs/prompts a executar/`. Pediu em seguida preparar a troca de Astra para Sol para reduzir consumo. A investigação começou; a missão NÃO está concluída.

## Regras já lidas integralmente
- `docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`
- `docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`
- AGENTS.md fornecido na conversa. Estes dois prompts prevalecem sobre documentação histórica.
- Trabalhar apenas em `prototypes/chatgpt/`; continuar `fase1-rafa-claude/`. Preservar `desenho-v1-chatgpt/` aprovado. Não modificar raiz nem Antigravity.
- 200 FPS reais em 1280×720, sem vsync, com média/p95/p99/draw time; throughput de draw sozinho não certifica. Galaxy S20 FE: **não testado neste hardware**.

## Estado inicial do Git
Havia mudanças de outro trabalho em Antigravity (bundle/index/ArenaEngine/benchmark/screenshots e relatórios/assets não rastreados). Não foram tocadas. ChatGPT estava limpo no início. Não houve commit nem mudança em código de produto nesta sessão.

## O que existe
`prototypes/chatgpt/fase1-rafa-claude/` já tem index.html, bundle.js (cópia antiga do renderer Antigravity), src/{animation,combat,game}.js, testes e AVALIACAO-IA/01..09. NÃO começar outro projeto nem presumir que os relatórios antigos descrevem o estado atual corretamente.

### Testes realmente executados nesta sessão
Na pasta fase1-rafa-claude:
- `node tests/test.cjs` → PASS: 12+ assertions; hit once, combo buffer, directional arcs, collisions, dash and enemy strike.
- `node tests/test-animation.cjs` → PASS: 768 articulated poses, anchor invariants, moving feet, 126-frame atlas budget.
Esses testes não comprovam visual, navegador, rig anatomicamente correto ou FPS.
`python` do PATH é alias WindowsApps e falhou; Node funciona.

## Leitura efetuada
- README.md, PROJECT.md, parte de docs/HANDOFF.md; inventário dos diretórios raiz, scripts/docs/RafaxLab, fontes dos dois aprovados.
- README e relatórios 01..09 da fase1 (saída agregada teve truncamento; não presumir leitura integral de cada relatório).
- src/animation.js, src/combat.js, src/game.js e tests/test-animation.cjs.
- ChatGPT aprovado: src/hero.js, PIVOTS.md.
- Antigravity atual: início de HeroRenderer.js, MaterialPainter.js e RigAdapter.js. Arquivos atuais estão sendo modificados por outro trabalho; não assumir que correspondem ao bundle copiado na fase1.
- Imagens vistas: hero-part-body.png e hero-part-weapons.png oficiais; screenshot histórico ChatGPT evidence/hero-full.png. Faltam cabeça, T-pose, mapa e comparação visual atual dos dois protótipos.

## Fonte primária Rafa/Claude
HTML: `RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/index.html` (1.330.169 bytes).
Extração local de texto foi salva em `AVALIACAO-IA/fontes/conversa-extraida.txt` (16.196 linhas), removendo style/script/tags e decodificando entidades. É extração mecânica, NÃO comprovação de leitura integral. A fonte já contém trechos truncados ("caracteres a mais"); distinguir ausência na fonte de falta de leitura.
Li todas as mensagens principais extraídas por regex `<article class="msg.*?</article>` (7 mensagens do usuário e respostas do Claude) em ordem. Listei ações cronológicas, porém a saída foi truncada no meio; NÃO li todas as 594 ações nem todos os relatórios críticos. A obrigação de investigação integral continua pendente.

### Cronologia confirmada nas mensagens primárias
1. 17/10 22:25: pedido já era piloto integrado Canvas 2D, esqueleto matemático 3D invisível com IK de dois ossos, poses-chave, cenário cacheado, WASD/clique e crítica visual. É referência metodológica; não autorização para Blender/engine.
2. 22:28–22:43: referência de rosto e turnaround gerado; segunda imagem não gerada por créditos insuficientes.
3. 22:43 core.js; 22:45 ink.js; 22:47 rig.js; 22:53 head.js; 22:57 knight.js/turnaround.html. Primeiro isolou oito vistas e poses.
4. 23:07 world.js; 23:09 fx.js; 23:12 main.js/index. Ajustou excesso de árvores e legibilidade.
5. 23:15 capturas quadro a quadro do combo; 23:18 descobriu JS em cache, adotou no-store; 23:21–22 corrigiu instabilidade Verlet da capa.
6. 23:23 primeira crítica; depois corrigiu projeção espelhada, arcos exagerados, foot planting, profundidade; adicionou bonecos de treino e efeitos. 23:57 segunda crítica.
7. 00:18 segunda crítica: 9/13 itens OK; corrigiu cabelo, capa e invasão do boneco no avanço. 00:24 Claude relatou piloto testado ~1 ms/quadro; file:// permaneceu NÃO testado. São relatos históricos, não medições nossas.
8. 18/10 09:03 Rafa rejeitou fidelidade do rosto e pediu trabalhar só Sul; 09:06 lembrou câmera; 09:43 pediu headless; 09:50 pediu olhar para frente, não para câmera.
9. Refinamento: medir landmarks/paleta, vetorizar em tools/trace_face.py → js/face_trace.js, projetar no volume da cabeça, comparar em face.html e overlay. Corrigiu olhos/cabelo/contornos/mandíbula. Não copiar cegamente a geometria do cavaleiro para nosso rogue.
10. Críticas faciais sucessivas: notas relatadas 7/7,5, depois 8 frontal/7,5 câmera/8 HUD; artefatos em giro de 30° corrigidos. Ações finais até 11:31. Usuário às 16:29 quis testar e consultar uso; isso NÃO é aprovação visual final explícita.
11. 16:39 em diante: exportação da conversa HTML e gráficos, não desenvolvimento do gameplay.
Conclusão: as quatro etapas do nosso prompt são organização de entrega; não são a cronologia literal do piloto. Houve piloto integrado PRIMEIRO e refinamento focal do rosto DEPOIS.

## Achados concretos a tratar
1. animation.js usa atlas achatado de 126 poses (6 idle + 12 walk + 12 run + 12 attack, ×3 direções), canvas 340×290, crossfade entre quadros. Isso deve ser revisto contra proibição de spritesheets das armas e exigência de renderer contínuo; cache de materiais/peças é distinto de trocar toda pose por sprite.
2. Atlas de ataque divide 12 quadros entre três golpes (só quatro por golpe). `paint` interpola para índice seguinte com wrap global; pode misturar golpes distintos no limite e o último com o primeiro.
3. Benchmark chama apenas draw() em loop e devolve FPS teórico; não atualiza simulação/entrada. O botão verifica aquecimento, mas API pública benchmarkUncapped não tem mesma guarda. Não certificar 200 FPS.
4. twoBone clampa distância internamente mas não retorna/corrige alvo do tornozelo; teste atual verifica apenas limite do osso superior, não comprimento de ambos. Alvo inalcançável merece teste específico.
5. Só S/SE/SW. Norte vira S. Correntes físicas e foot lock absoluto não comprovados.
6. Relatórios 05–08 descrevem versão antes do atlas e contêm comandos Markdown com barras invertidas; atualizar após validar a implementação, preservando o histórico.
7. Antigravity atual tem fastRig/cache por peças e renderDirect; bundle antigo local da fase1 tem render direto e não esses métodos. Comparar contrato antes de reaproveitar; não copiar mudanças concorrentes sem registrar origem.

## Bloqueio do navegador — não contornar
Tentativa `cua.createBrowserTab("iab", "file:///D:/.GITHUB/games/game-2d/prototypes/chatgpt/fase1-rafa-claude/index.html", {visible:true})` foi REJEITADA pela política: protocolo file não permitido, apenas http/https. A resposta proibiu alcançar o mesmo resultado por workaround, superfície alternativa, raw CDP ou comandos de navegador. Não lance Playwright/servidor ou outro navegador para contornar essa rejeição. Resolver acesso autorizado com o usuário antes de novas tentativas equivalentes. Nenhuma captura nova ou benchmark real foi obtido.

## Próximo passo recomendado
1. Concluir leitura primária por blocos pequenos, sobretudo código de IK/foot planting e seis críticas; atualizar 02-CRONOLOGIA com referências verificáveis (linhas do HTML ou extração).
2. Completar comparação de fontes e imagens dos aprovados, distinguindo evidência histórica de execução nova.
3. Registrar plano concreto na própria pasta: preservar geometria aprovada; eliminar atlas de pose inteira a favor de rig contínuo com cache adequado de materiais/peças; manter arma/mão/corrente com âncora compartilhada. Testar ataques sem mistura de estágios, limites IK e medição real.
4. Resolver bloqueio visual antes de declarar gate visual aprovado ou avançar cegamente. Usuário já autorizou execução dos prompts; não pedir autorização genérica de novo.
5. Continuar implementação incremental e testes dentro de ChatGPT. Não declarar missão pronta, 200 FPS, fidelidade total ou teste mobile sem evidência.

## Economia de contexto
Comece por este handoff. Não releia as mensagens e regras já resumidas sem necessidade. Use rg e leituras focadas, evite despejar diretórios de imagens ou todos os relatórios de uma vez. Nenhum subagente foi iniciado.

---
# ATUALIZAÇÃO PRIORITÁRIA — RETOMADA APÓS GPT SOL

**Leia esta atualização antes das seções antigas.** O usuário pediu parar a implementação e salvar todas as anotações para outra IA ou para retomar amanhã. Não houve implementação do novo renderer. Missão pendente.

## Bloqueio de navegador RESOLVIDO para HTTP autorizado
O usuário respondeu à pergunta específica sobre servidor local: “faça tudo q vc precisar da melhro forma”. Autorização para servir somente o protótipo em loopback e testar. A proibição inicial de file:// não deve ser contornada; HTTP local foi autorizado depois.
- Criado `tools/serve.cjs`: Node, sem dependências, apenas pasta do protótipo, bind em 127.0.0.1, Cache-Control no-store, checagem básica de caminho.
- Primeiro processo via exec session 53931, porta 5318, ficou inacessível ao navegador. Não gastar tempo repetindo.
- Servidor persistente iniciado fora do sandbox, oculto, via Start-Process. PID retornado **19324**, porta **5319**, env GAME2D_PORT=5319. URL **http://127.0.0.1:5319/**. O usuário está com ela aberta. Não publicar, abrir firewall ou expor em 0.0.0.0.
- Acesso e scripts funcionaram no navegador integrado. Cache chegou a 126 poses; HUD mostrou ~60 FPS de display e 0,20–0,30 ms de draw, limitado pela tela. Esses valores não são aprovação de 200 FPS.
- Cliquei no benchmark antigo: **18750,0 FPS teóricos, p95 0,10 ms**. É apenas desenho cacheado, sem simulação e sem sincronizar trabalho gráfico; NÃO reportar como FPS real.
- Captura REAL salva em `AVALIACAO-IA/evidencias/01-arena-antes.png` (página completa). Imagem mostra o herói aprovado reutilizado ao centro, três bonecos e ilha simplificada. Não é imagem gerada por IA.
- cua_repl: binding `liveGame`, tab 3, browser iab ID 2. `getScreenshot()` falhou; **`liveGame.screenshot({fullPage:true})` funcionou**. Salvei bytes com node:fs/promises. `getAXState()` funciona. Não reiniciar inventário sem necessidade. Se a sessão mudou, readquirir tab pelo URL.
- Servidor persistente permanece iniciado. Se não estiver mais acessível, iniciar novamente: PowerShell `$env:GAME2D_PORT='5319'; node tools/serve.cjs` na pasta do protótipo; para uso em background usar Start-Process -WindowStyle Hidden. Acesso a sockets no sandbox falha; houve autorização de require_escalated para o servidor local.

## Leitura adicional EFETIVAMENTE concluída
Li os **seis relatórios críticos completos** extraídos de `<article class="report">` do HTML original. As 594 ações ainda NÃO foram lidas integralmente.
- Crítica 23:41: arte 6/10, animação 6/10. Pés deslizando, cabeça ambígua fora da frente, capa rígida/instável, rastros na camada errada, arcos 280–300°, contraste baixo. Recomendou foot planting em mundo, separar trail por profundidade, corrigir projeção, aumentar legibilidade e adicionar boneco.
- Segunda crítica 00:18: arte 7/10, animação 6,5/10; corrigiu projeção/ordem/pés (apoio até 0,6 u/quadro), mas herói invadia boneco, cape virava placa, corrida continuava na borda mesmo sem deslocamento real e finalizador acertava atrás do impacto. Mediu 1,5–3 ms de trabalho a 3200×2000 e ~13,3 ms entre frames. Isso NÃO é prova histórica de 200 FPS reais.
- Face round 1 10:02: fidelidade frontal melhor que câmera; contornos grossos fechavam pontas, pupila fundida à pálpebra, máscaras geravam costuras. Sugestão de inclinar rosto foi rejeitada por Claude por contrariar Rafa (olhar adiante).
- Face round 2 10:38: “não, mas perto”; destacou falta de pupila/brilho, manchas de posterização, contorno, barba residual e costura na franja.
- Face round 3 11:09: “SIM no Sul exato”, porém bloqueante no giro de ±30° por volume interno maior que silhueta. Recomendou volume assimétrico e contorno lateral adaptado.
- Face round 4 11:28: “SIM”, sem bloqueantes na escala de jogo. Notas P2 8,5, P3 8, jogo2x Sul 8, ±30° 7,5, jogo1x7,5, retrato8,5. Três polimentos pequenos sugeridos, depois ações finais às11:29–31.

Li ainda o trecho primário de `plantFeet` no HTML (aprox. linhas 6228–6265): cada pé mantém posição de mundo durante apoio, reajusta quando distância do alvo >15, faz passo em arco de 0,1 s e transição de decolagem em 0,06 s. `solveRig` recebe as âncoras de pés; velocidade real é calculada após colisão. É o princípio reutilizável; nosso gait atual não faz isso.

## Código investigado e achados MAIS PRECISOS
Bundle local é o antigo, independente das alterações concorrentes de Antigravity:
- `HeroRenderer.render` (linha~4183) chama painters diretamente. Não contém fastRig/staticPoseCache.
- `WeaponPainter.paintWeapon` (linha~2963) aplica translate(x,y), rotate(rotation), espelhamento da peça R, scale(scale), translate(-395,-638). **Grip local verdadeiro = (395,638)**.
- Pomo: furo em **(532,794)**; anel externo em (538,794) (linha~3464). Usar furo como âncora da corrente.
- `paintLeftWeaponGeometry` chama paintHeavyChaosChain + paintChaosHilt + paintChaosBlade. A corrente antiga é um U fixo da geometria da arma, NÃO liga fisicamente ao punho. `chainSway` da pose não é lido pelo pintor. Esse é um defeito concreto contra o prompt.
- HeadPainter.paint já separa translate(x,y), rotation, scaleX/scaleY, translate(-anchorX,-anchorY), depois pinta a geometria conforme yaw. Pode ter cache de uma peça por yaw, mantendo transformações contínuas.
- ArmPainter.paint desenha braço superior e antebraço em dois blocos independentes com save/restore e vetores shoulder→elbow/elbow→wrist. Dá para extrair métodos por segmento SEM redesenhar a arte.
- LegPainter desenha coxa hip→knee; BootPainter ancora footSole e calcula rotação pela relação knee→footSole. Caches devem respeitar esses contratos.
- HandPainter.paintWristAndPalmBack desenha ponte/palma antes da arma; paintClenchedFingersOverHilt desenha dedos depois, usando rotação da arma. Preservar essa oclusão.

## NOVO TESTE AINDA VERMELHO — NÃO CONFUNDIR COM REGRESSÃO EXISTENTE
Criei **`tests/test-continuous.cjs`** como especificação executável do renderer planejado. Executei e falhou por **Cannot find module ../src/renderer.js**. Isso é esperado: implementação ainda NÃO escrita quando usuário pediu parar.
- Não incluir esse teste num anúncio de “todos passando”.
- Os dois testes existentes haviam passado antes; não houve alteração em combat.js, animation.js, game.js, bundle.js ou index.html nesta retomada.
- O teste novo espera módulo renderer.js com ContinuousRenderer, weaponPoint, chainPoints; animation.js com solveLimb. Lista detalhada no plano 10-PLANO-CONTINUIDADE.md.
- Pode manter como teste vermelho para implementar a seguir; se precisar entregar apenas baseline, deixe explícito que ele é especificação pendente. Não apagar silenciosamente nem enfraquecer asserts.

## Arquivos criados/alterados nesta retomada
1. tools/serve.cjs — servidor local funcional, criado.
2. tests/test-continuous.cjs — teste vermelho de funcionalidade PLANEJADA, criado.
3. AVALIACAO-IA/evidencias/01-arena-antes.png — captura real, criada.
4. AVALIACAO-IA/00-RETOMADA-SOL.md — esta atualização.
5. AVALIACAO-IA/10-PLANO-CONTINUIDADE.md — plano e checklist de retomada.
6. AVALIACAO-IA/02-CRONOLOGIA-RAFA-CLAUDE.md — adendo de fontes primárias.
Nada foi commitado. Outros agentes podem continuar modificando Antigravity; não mexer nessas mudanças.

## Como retomar gastando pouco
Ler esta atualização e o plano 10. Não recomeçar inventário do repositório, não reler os seis relatórios completos, não repetir testes já conhecidos sem mudança. Trabalhar em uma correção mensurável de cada vez, com captura comparativa antes/depois e teste real. Se a IA for menor, executar só a primeira tarefa do plano por vez e atualizar os checkboxes e o handoff.
