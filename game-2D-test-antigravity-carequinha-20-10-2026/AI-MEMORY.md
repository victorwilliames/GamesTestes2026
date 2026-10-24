# Memória de continuidade — leia primeiro

Atualizado: 19/10/2026 (America/Sao_Paulo).

## Pedido e escopo
O usuário pediu estudar o projeto, executar `prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`, focar na fase 1 piloto e manter memória para trocar de IA/modelo com baixo custo de contexto.
**Fase ativa: 1 — frame estático do nosso herói.** Não confundir com o piloto completo do Rafa. Locomoção/IK são fase 2; arena/combate fase 3. Não avançar automaticamente.

## Fontes e fatos verificados
- `ref/hero-carequinha/head.png`: cabeça grande calva, marca vermelha vertical irregular, olhos vermelhos, sobrancelhas pretas inclinadas, cicatriz na testa.
- `ref/hero-carequinha/model-like-hades-2-5d.png`: corpo compacto musculoso, cabeça ~1/3 da altura, pose firme. O prompt acrescenta lenço, caveira, calças escuras e adagas acorrentadas; prevalece sobre o traje da imagem.
- `RafaxLab-YTB-do-zero/00..04*.md`: método, arquitetura, crítica por screenshot. Material preservado.
- **Todos os nove JS da referência estão truncados** (~7 KB cada, terminam em `… (N caracteres a mais)`). Não copiar como módulos executáveis. README da referência promete mais do que os arquivos contêm.
- Raiz inicialmente sem código próprio, AGENTS.md, package.json ou .git. Não é checkout Git; não há branch/commits. `python` do PATH é alias WindowsApps quebrado; Node v24.16.0 e Chrome estão disponíveis.

## Contratos
Canvas 2D puro, sem bibliotecas, WebGL ou imagens de runtime. Referências são apenas guias. Câmera yaw 45°, pitch 34°. Cel-shading por clip e deslocamento, contornos escuros. Separar matemática, pincéis, cabeça e corpo. Português na interface.

## Entrega e organização (bake-off entre IAs)
O usuário roda um **bake-off**: cada IA/agente entrega o protótipo numa pasta própria e no fim ele compara quem se saiu melhor. Convenção (detalhes em `prototipos/README.md`):
- Caminho: `prototipos/do-<autor>/prototipo-v<N>-<autor>/`.
- Cada protótipo é **autossuficiente** (tem seu `index.html`, `js/`, `tests/` e `LEIA-ME.md`). Os testes usam caminhos relativos — rodar de dentro da pasta: `node --test tests/*.test.cjs`.
- **Nenhum agente escreve na pasta de outro.** `ref/`, `RafaxLab-YTB-do-zero/`, `docs/` e `prompts a executar/` são compartilhados e só-leitura.
- Pastas já existentes: `do-deepseek`, `do-chatgpt`, `do-antigravity`.

## Estado do Protótipo Antigravity (v1)
- Pasta isolada e autossuficiente: `prototipos/do-antigravity/prototipo-v1-antigravity/`.
- Módulos implementados e testados:
  - `js/core.js`: Câmera isométrica 3/4 (yaw 45°, pitch 34°), vetores 3D, projeção `project`, `unproject` do chão z=0 e RNG determinístico.
  - `js/ink.js`: Cel-shading por clip() com deslocamento, contornos `--ink`, cápsulas afuniladas, taperPath, sólidos 3D.
  - `js/rig.js`: IK analítica de 2 ossos com Lei dos Cossenos + vetores polares preservando comprimentos; máquina de combo Combat 1→2→3 com buffer e recuperação; poses do carequinha e espada.
  - `js/head.js`: Cabeça volumosa 2.5D com crânio projetado, marca vermelha frontal, sobrancelhas expressivas, olhos rubros e cicatriz, voltada para a frente no espaço 3D (Prompt 5).
  - `js/hero.js`: Torso musculoso sem camisa, lenço vermelho esvoaçante, cinto com caveira, espada com empunhadura real fechada nos dedos e ordenação rigorosa por profundidade (*depth sorting*).
  - `js/world.js`: Platô da arena desenhado uma vez em `OffscreenCanvas`, vegetação em sprites cacheados e vento dinâmico.
  - `js/fx.js`: Rastro curvo da lâmina, faíscas de impacto, choque no chão e onomatopeias.
  - `js/main.js`: Loop principal jogável com WASD, ataque na direção do mouse com combo 3 tempos, tecla `B` para depuração de esqueleto/IK e `T` para slow-mo 25%.
  - `index.html` (jogo + retrato animado no HUD), `turnaround.html` (8 direções), `styles.css`, `tools/serve.cjs` (sem cache na 5317).
- Testes unitários (`node --test tests/*.test.cjs`): **9 passam, 0 falham**.

## Estado
Fundação matemática pronta e testada. **O código do nosso protótipo vive em `prototipos/do-deepseek/prototipo-v1-deepseek/`** (não mais na raiz).

- `js/core.js` (câmera/projeção/vetores) e `js/ink.js` (paleta/pincéis) já existiam; nesta sessão entraram `js/rig.js`, `js/head.js`, `js/hero.js`, `js/studio.js`, `index.html`, `styles.css`, `tools/serve.cjs` e `tests/render.test.cjs`.
- `js/rig.js`: `Pilot.solveIK(root,target,L1,L2,pole)` (lei dos cossenos + vetor polar; preserva os dois comprimentos mesmo com alvo inalcançável/degenerado), `Pilot.Combat` (combo 1→2→3 com buffer de input, recovery e retorno a idle sem 4º golpe; golpe ativo 0,45s, recovery 0,28s) e `Pilot.makeRig(pose)` (4 membros resolvidos por IK, nós hips/neck/head/ombros/joelhos/cotovelos/mãos/pés e `swordDir`).
- `js/head.js`: `Pilot.drawHead(ctx,{pos,yaw,scale})` — elipsoide de crânio + olhos rubros, sobrancelhas, marca vermelha, cicatriz, orelhas, nariz e boca; traços só aparecem quando a superfície encara a câmera.
- `js/hero.js`: `Pilot.drawHero(ctx, rig)` — torso musculoso, calças, lenço, cinto com caveira, espada e cabeça, com ordenação por profundidade.
- `js/ink.js` estendido: `capsulePath` (cápsula afunilada), `taperPath`, `inkPath`, `TAU`, `alpha`.
- Bancada: `index.html` + `styles.css` + `js/studio.js` (prancha + retrato + controles de ângulo/zoom/pose/fundo). `tools/serve.cjs` serve sem cache na 5317. Desenho síncrono no load (aba oculta suspende `requestAnimationFrame`).
- Testes: de dentro da pasta, `node --test tests/core.test.cjs tests/rig.test.cjs tests/render.test.cjs` → **8 passam, 0 falham**. O `tests/rig.test.cjs` já existia (contrato TDD).
- Render verificado no navegador real (Chrome via automação): canvas 759×775 e 328×275, sem erros no console. Screenshots em `artifacts/v1-prancha.png` e `artifacts/v1-rosto.png`.
- **Ainda NÃO existem**: `turnaround.html`, `face.html`, `js/world.js`, `js/fx.js`, `js/main.js`. Logo **não há WASD, combo jogável nem arena** — o piloto ainda NÃO é jogável.
- Crítica honesta do próprio autor em `prototipos/do-deepseek/prototipo-v1-deepseek/LEIA-ME.md` (mãos, sobrancelhas, cicatriz, espada e postura a melhorar). Fidelidade artística NÃO aprovada pelo usuário.

Próximo passo natural: refinar o painter com o crítico visual, criar `turnaround.html`/`face.html`, e só então `world`/`fx`/`main` para o jogável.

> Nota de escopo: `AGENTS.md` dizia "o piloto agora é JOGÁVEL completo". Isso descreve o ESCOPO desejado (confirmado pelo usuário), não o estado do disco. Corrigido nesta sessão.

## Crítico independente (agente)
- Criado `prototipos/do-deepseek/prototipo-v1-deepseek/.opencode/agents/critico.md`: subagente **somente leitura** (`edit`, `shell` e `subagent` negados) com o prompt formal do Rafa (`RafaxLab-YTB-do-zero/04-CRITICO-VISUAL-E-SCREENSHOTS.md`, seção 3) adaptado. Ele lê a seção "Estado" desta memória para descobrir o estágio e não cobra o que ainda não existe.
- **A descoberta de `.opencode/` é de baixo para cima** (pasta atual até a raiz), então o agente `critico` só existe com a sessão rodando de dentro da pasta do protótipo. Foi por isso que a sessão foi movida (`session_move`) para cá — casa com a regra de rodar os testes de dentro da pasta.
- **Efeito colateral do move:** a raiz do workspace passou a ser esta pasta do protótipo. O `glob` não atravessa para fora (`../../../ref/`); o `read` atravessa, aceita caminhos relativos e **lista diretórios** — é assim que o crítico descobre o conteúdo de `ref/` sem `shell` nem `glob`.
- Referências do crítico: `../../../ref/hades1/` (5 `.jpg` — **referência principal de estilo, mapa/cenário e câmera isométrica**) e `../../../ref/hero-carequinha/` (`head.png`, `model-like-hades-2-5d.png`, `-only.png`, `-onlyy.png`, `other/`).
- **Alvo de estilo esclarecido pelo usuário (19/10/2026):** o resultado NÃO deve ser chapado/plano — tem que LER como 2.5D com aparência de 3D (volume, luz, sombra, profundidade), como o Hades faz. O `DESIGN.md` diz "2–3 tons" e o plano diz "cel-shading por `clip()`": isso descreve a TÉCNICA, mas o RESULTADO exigido é volume, não recorte de papel. O critério A do agente já registra isso como o mais importante.
- Verificado em 19/10/2026: agente descoberto, abriu os 4 arquivos principais sem falha, mediu cabeça ≈1/4,7 da altura e confirmou que a marca vermelha do protótipo é raio estreito, não a faixa larga da referência.
- Crítica da 1ª rodada (ad-hoc, antes do agente): Arte **4/10**, pose estática **5/10**. ALTA: cabeça pequena demais (~1/6), espada atravessando as pernas com o punho cobrindo a mão, marca vermelha errada, rosto sem fúria e sem boca. Relatório **não** persistido em arquivo ainda.

## Protocolo para qualquer IA
1. Leia esta memória e o plano; abra apenas os módulos envolvidos na tarefa.
2. Preserve `ref/`, `prompts a executar/` e `RafaxLab-YTB-do-zero/`. Escreva código **apenas** dentro da sua pasta `prototipos/do-<você>/prototipo-v<N>-<você>/`; nunca altere o protótipo de outra IA.
3. Atualize esta memória ao encerrar cada bloco: arquivos, comandos testados, problemas reais e próximo passo. Não declarar fidelidade visual aprovada pelo usuário sem aprovação dele.
4. Não releia toda a conversa HTML ou transcrição em toda sessão: consulte pontualmente quando necessário.

## Correção explícita de escopo — prioridade máxima
O usuário esclareceu que deseja o PILOTO JOGÁVEL como a fase 1 da conversa do Rafa, com herói, arena e combo, e não apenas o frame estático. Sua regra de ouro é seguir a conversa HTML original. Autoriza UMA ESPADA neste primeiro piloto para facilitar, igual ao Rafa; adagas/correntes ficam para depois. Use ref/ para a identidade do carequinha.
Mensagens da conversa original foram lidas (55 respostas + prompts); trechos de construção core/ink/rig/head/knight/world/main consultados. Método: referência → módulos separados → personagem isolado/turnaround → screenshots e ajustes → arena/combate → crítico independente → correções/teste. Cabeça nivelada, olhar para frente, câmera 34°; nunca inclinar o rosto para encarar a câmera artificialmente.
O recorte estático anterior desta memória/plano está SUPERADO por esta instrução.
