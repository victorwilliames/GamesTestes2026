Diretório de trabalho corrigido pelo usuário: **prototypes/codex/fase1-rafa-claude/**. Não modificar ChatGPT ou Antigravity. A porta5319 no histórico é baseline ChatGPT; use outra porta para Codex.

# Plano de continuidade — Fase 1 ChatGPT

Estado em 19/10/2026: pausa solicitada pelo usuário. A implementação deste plano NÃO começou. Execução já autorizada pelo usuário ao mandar iniciar os prompts e “faça tudo q vc precisar da melhor forma”. Trabalhar dentro desta pasta e preservar os aprovados.

## Objetivo e decisão técnica
Continuar o herói existente, preservando geometria e materiais. Trocar atlas de poses inteiras por avaliação contínua do rig e cache de materiais/peças locais. Mesma geometria das armas em repouso e ataque, dedos em camadas e correntes ligadas ao furo do pomo e antebraço. Medir e validar antes de afirmar desempenho/fidelidade.

## Ordem para uma IA com menos capacidade

### 1. Fechar investigação e documentar evidências
- [x] Ler prompts obrigatórios, mapear protótipos e executar dois testes existentes.
- [x] Ler mensagens principais da conversa e seis críticas completas.
- [x] Abrir baseline em navegador e salvar captura real.
- [ ] Ler ações primárias restantes em blocos curtos. O HTML tem trechos já truncados; registrar lacunas da fonte.
- [ ] Atualizar cronologia com referências de linhas do HTML, sem transformar propostas em soluções testadas.
- [ ] Ver cabeça, T-pose e mapa oficiais; completar análise comparativa de ambos aprovados. Não confundir screenshots históricos com testes novos.

### 2. Corrigir IK com teste de ambos os ossos
Arquivo: src/animation.js.
Contrato planejado: `solveLimb(root,target,a,b,side) -> {joint,end}`.
- [ ] Reproduzir erro do solver atual em alvo distante/coincidente: ele clampa distância para calcular joelho, mas tornozelo continua no alvo original.
- [ ] Clampar alvo no intervalo [abs(a-b)+epsilon, a+b-epsilon], com direção determinística se coincidente.
- [ ] Calcular joint pela lei dos cossenos e end alcançável na mesma direção. `twoBone` pode permanecer como compatibilidade retornando joint.
- [ ] No gait, atualizar tornozelo para end e compensar footSole pela diferença. Não “corrigir” apenas o teste.
- [ ] Executar testes existentes e as assertivas solveLimb em test-continuous.cjs depois que renderer existir; ou separar teste de IK para poder executá-lo isoladamente.

### 3. Renderer contínuo, sem refazer a arte
Criar src/renderer.js, script clássico UMD como animation.js.
Interfaces já esperadas pelo teste vermelho:
- `weaponPoint(w,side,x,y) -> {x,y}`: aplicar exatamente o transform de paintWeapon. Grip(395,638) vira w.x/y. Pomo(532,794) vira âncora mundial local à pose.
- `chainPoints(w,arm,side) -> [{x,y},...]`: primeiro ponto = pomo, último = arm.wrist, pontos intermediários com folga suave/determinística. Futuro solver físico não é necessário para corrigir conexão inicial; documentar aproximação.
- `new ContinuousRenderer(painter,rig,{cache:false})`: opção cache:false permite teste puro sem DOM.
- `.paint(ctx,x,y,kind,dir,phase,debug=false,stage=0)`: calcular makeGaitPose no phase REAL do golpe, sem converter para índice de atlas; aplicar escala gameplay e chamar renderer uma vez.
- `.stats()`: informar cache de peças, tempo de construção e modo continuous. Nenhuma contagem fictícia de 126 poses.

Implementação incremental:
- [ ] Fazer teste de subframes, três golpes e âncoras passar inicialmente com renderer direto. Verificar visual antes de otimizar.
- [ ] Substituir Atlas no game.js; passar stage explicitamente, phase=attack.t/duration. Não misturar fase de golpe com índice de combo.
- [ ] Eliminar crossfade de imagens completas; se necessário interpolar poses articulares, não duplicar silhueta por alfa.
- [ ] Cachear apenas peças/materiais caros depois de medir. HeadPainter.paint aceita transform separado; weaponPainter.paintChaosBlade/Hilt são geometria fixa local. Um cache local de peça não é atlas de animação. Mesmo caminho para todos os estados.
- [ ] Preservar geometria de blade/hilt; não copiar renderer Antigravity concorrente inteiro sem auditoria.
- [ ] Substituir corrente U fixa por elos individuais entre pomo e punho; múltiplas voltas no antebraço, desenhando parte atrás e parte na frente. Reutilizar pintores de elo, com metal escuro coerente. Elos volumosos, nunca linha.
- [ ] Preservar ordem: braço/palma traseira → corrente/arma → dedos/polegar à frente.
- [ ] Se extrair upper/forearm painters ou caches, manter exatamente os paths aprovados e testar pivôs.

### 4. Movimento e combate
- [ ] Basear passada no deslocamento real após colisão; na borda não correr parado. Pés de apoio devem ter âncoras em mundo (princípio plantFeet original).
- [ ] Conferir timing visual das janelas ativas e dano dos três golpes; um alvo por golpe e buffer já têm testes aprovados.
- [ ] Capturar idle, caminhada/corrida, os três golpes, KO e duas orientações distintas. Norte verdadeiro continua pendente; não anunciar oito vistas sem arte própria.

### 5. Medição confiável
Arquivos: src/game.js e, se útil, módulo src/performance.js.
- [ ] Manter throughput de desenho nomeado como tal; não chamar de FPS sustentado.
- [ ] Adicionar benchmark determinístico de simulação + pose + render, com aquecimento, resolução1280×720 e amostras suficientes. Registrar separadamente update/draw/frame e percentis p95/p99. Se Canvas deferir trabalho, contabilizar sincronização ou explicar o limite.
- [ ] Evitar mutar estado da partida nos testes: snapshot/restore ou cenário de benchmark separado.
- [ ] Medir frame times de rAF no uso normal separadamente (monitor tem limite).
- [ ] Para o requisito sem vsync, declarar claramente ambiente/configuração e limitações; não usar 18750 FPS teóricos para passar o gate.
- [ ] PC real e Galaxy S20 FE: não testado neste hardware até obter evidência. Nenhuma entrega pronta abaixo de200 FPS no ambiente declarado.

### 6. Entrega e documentação
- [ ] Atualizar README e relatórios01..08 para o estado final, preservando histórico; 09 explica atlas antigo e pode ser histórico explicitamente.
- [ ] Copiar referências necessárias de avaliação para a própria pasta; runtime não deve depender de assets/código externos.
- [ ] Registrar comandos, resultados e capturas reais, sem notas artísticas autoatribuídas.
- [ ] Conferir git diff somente da pasta ChatGPT. Não stage/commit mudanças de terceiros.

## Comandos já conhecidos
Na pasta `prototypes/codex/fase1-rafa-claude`:
- `node tests/test.cjs` → passou.
- `node tests/test-animation.cjs` → passou.
- `node tests/test-continuous.cjs` → VERMELHO esperado, renderer.js ainda não existe.
- Servidor ativo: http://127.0.0.1:5319/; tools/serve.cjs com GAME2D_PORT=5319 se reiniciar.
- Evidência: AVALIACAO-IA/evidencias/01-arena-antes.png.

Não executar tudo de uma vez sem olhar resultados. Cada etapa deve deixar estado executável e atualizar este plano.
