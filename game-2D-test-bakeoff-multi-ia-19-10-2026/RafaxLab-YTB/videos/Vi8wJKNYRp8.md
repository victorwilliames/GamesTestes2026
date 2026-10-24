> Cópia integral da análise visual realizada em 19/10/2026. Documento original preservado em [docs/RAFAEL_VIDEO_ANALYSIS_2026-10-19.md](../../docs/RAFAEL_VIDEO_ANALYSIS_2026-10-19.md). Quando surgirem correções, atualize o índice, registre a fonte e mantenha a proveniência.

# @game2d — Engenharia reversa do vídeo de Rafael / Dunloc

**Data:** 2026-10-19
**Origem:** MP4 fornecido pelo usuário (`videoplayback.mp4`, 27m57s, vídeo H.264 1280×720, 30 FPS).
**Fonte pública identificada pelo usuário:** https://www.youtube.com/watch?v=Vi8wJKNYRp8&t=1s  
**Transcrição integral em texto:** [transcricao_Vi8wJKNYRp8.txt](transcricao_Vi8wJKNYRp8.txt) (áudio original em português falado por Rafael, 528 falas com minutagem).

> **Atualização de Áudio (19/10/2026):** a limitação de ausência de áudio do MP4 foi superada com a extração da transcrição oficial do YouTube, confirmando as falas e explicações de Rafael sobre a decisão de usar Canvas 2D procedural.

## Principal descoberta: DUAS demos / fluxos distintos no mesmo vídeo

1. **Dunloc Online** (aprox. 00:00–02:50, 08:30–10:50 e 26:15–27:57): RPG online muito mais elaborado, com terreno/sprites/edifícios detalhados, minimapa, combate e cenários variados. O vídeo NÃO comprova que o código/fundo desse produto inteiro foi criado pelo prompt Canvas 2D mostrado depois.
2. **Piloto RPG isométrico independente em Canvas 2D** (a partir de ~11:00; criação Claude Code com histórico de 17–18/10/2026; demos em ~24:45–26:00): um experimento menor, com cavaleiro, cenário/árvores e combate com espadas, feito para investigar desenho/rig por código. O resultado final é estilizado vetorial/HQ e não tem o mesmo acabamento do Dunloc.

### Grande correção sobre a história do 'único prompt'

Na tela em **20:25**, uma página de auditoria da conversa do piloto mostra:
- **7 mensagens do usuário**
- **55 respostas do Claude**
- **594 ações**
- **170 imagens**
- **6 relatórios de crítico**

Isso descreve **um processo extenso de implementação, validação visual e retrabalho**, não um resultado premium gerado sem iteração.

## Linha do tempo com evidências na tela

| Tempo aproximado | Evidência visual / textual | O que podemos concluir |
|---|---|---|
| 00:00–02:50 | Dunloc Online executado no navegador com mundos variados, herói equipado, cenários detalhados. | Demos do jogo maior; não evidencia mecanismo do piloto Canvas. |
| 03:00 | Histórico de Claude com pedido inicial: corrigir animações inconsistentes, correr/espada e usar Hades como inspiração. | Agente começa **inspecionando memórias, estrutura do projeto, sprites existentes e montando folhas de contato**. |
| 03:30–05:30 | Muitas folhas de corrida/ataques, estados de personagens e teste de alternativas. | A IA compara desenhos/animações, não apenas renderiza a primeira versão. |
| ~06:15 | Registro textual: '**Vetor (Canvas 2D) venceu por 2×1!** Antes de integrar, vou olhar as comparações com os próprios olhos.' Também se veem avaliações de 'juízes'. | Há comparação explícita entre abordagens e julgamento visual com mais de um agente. |
| ~07:00–08:10 | Claude integra protótipo isolado e descreve problema de sprite: roupas mudam, espadas mudam, rastro gravado no sprite, número de ângulos inadequado, corrida NW errada. | Diagnóstico de **inconsistência de arte gerada por vista**, semelhante ao nosso B3.2. |
| ~08:10 | Descreve solução: 'esqueleto 3D animado por código e desenhado em estilo 2D pintado, com contorno de tinta, sombreamento em poucos tons e luz de recorte'. Estrutura inclui `src/prototipo/rig.ts`, `anim.ts`, `heroi.ts`, `personagem/vetor.ts`, `cenario/`, `efeitos/`. | **Dados de rig e de animação separados da representação artística**, pintura vetorial em Canvas 2D; geração de efeitos/cenário autônoma. |
| ~11:00–12:45 | ChatGPT cria retrato masculino de referência de rosto (fundo verde). | Imagem gerada por IA como **referência artística**, não há prova de que foi desenhada no canvas de runtime. |
| ~14:00 | Prompt para Claude Code do piloto: `Canvas 2D`; sem WebGL/engine/imagens no jogo; esqueleto 3D invisível, IK braços/pernas; poses-chave antecipação/golpe/recuperação; estilo HQ em 2–3 tons + contorno escuro; chão e vegetação cacheados em offscreen; navegador e agente crítico antes da entrega. | Requisitos explícitos fornecidos pelo usuário no piloto. Não confundir prompt com evidência de implementação concluída. |
| ~20:25 | Página 'Conversa do Piloto RPG' com números de ações/respostas/capturas e 3 fases: primeira versão; rosto na posição; testes, tokens e página. | Mostra enorme número de iterações e mudança de prioridades. |
| ~20:45 | Claude menciona usar Nano Banana Pro via Highsfield para gerar uma **única folha de conceito** do cavaleiro (turnaround); em seguida escreve módulos de motor com 'pincéis HQ, esqueleto com IK, poses-chave'. | O experimento usou uma imagem **como guia**, embora o prompt proibisse imagens no jogo. Essa é a distinção chave entre processo de criação e runtime. |
| ~21:10 | Claude relata screenshots idênticos devido a cache JS; decide usar `Cache-Control: no-store`. Também testa corrida/combo, sombreamento e transparência de capa. | Evidência concreta de debugging de navegador, iteração e inspeção real. |
| ~21:45 | Crítico aponta: touca/raspado claro demais parece careca, herói invade boneco ao avançar; mudanças no depth sorting, limite de altura da capa, shear, front/back hysteresis, ordem das camadas. | Corrigiu **oclusão, anatomia, profundidade e leitura**, não só parâmetros de FPS. |
| ~23:05 | Mensagem do usuário critica rosto por não parecer referência; Claude define grade de landmarks/segmentação de cores, comparação lado-a-lado e plano de reconstruir contorno, nariz, boca, olhos, cabelo, sombra. | **Trabalho artístico direcionado em partes**, medição da referência e rondas de crítico, não 'gradiente clay' genérico. |
| ~24:00–24:40 | Imagens de testes recortados de rosto, sobretudo olhos e cabelos, com críticas e correções. | Ciclo visual focado por componente. |
| ~24:45–26:00 | Piloto rodando no navegador com árvores, círculo de pedras, colunas e cavaleiro; aparência HQ geométrica mas com detalhes/contornos superiores ao nosso P0.1. | Prova visual parcial de desenho por código. Não prova que alcançou a estética premium do Dunloc. |
| ~26:15–27:57 | Retorna ao Dunloc em mapas de pântano/caverna com combate. | Outra vez, não confundir produtos e stacks. |

## Reconstrução técnica fundamentada

### Peças do sistema
1. **Rig/modelo único e estável:** pivôs com coordenadas 3D locais (invisíveis). A projeção exibe volumes e posições em Canvas 2D fake 2.5D. IK em braços/pernas.
2. **Animações como dados:** estados/poses-chave, antecipação, ataque, recuperação e idle/corrida; controle de timings e continuidade, sem regenerar 8 frames independentes.
3. **Pincéis HQ e renderer artístico próprios:** traços escuros imperfeitos, curvas personalizadas, faces em 2–3 tons, sombra de recorte e oclusão; desenhar personagem por superfícies orgânicas (contorno + pintura), não por esfera/gradiente.
4. **Cenário feito por código e cacheado:** chão, árvores, arbustos e pedras desenhados uma vez em canvas auxiliar; atualiza partes móveis e efeitos.
5. **Depth sorting de partes e situações:** capa, tronco, cabeça, braços, adagas/espada, trançado da cena com oponente; corrigir overlap, squash, frente/trás.
6. **Visual QA deliberado:** múltiplos críticos/agentes, navegador, screenshots em diversas posições, comparação visual, feedback detalhado de defeito e correção focada.

### O que explica nosso fracasso P0.1

Nosso código `drawClaySphere()`/`drawClayLimb()` criou círculos, gradientes e cenário de elipse. O piloto de Rafael não depende apenas da rotação e IK: **usa representação gráfica HQ própria, descrições visuais explícitas e centenas de iterações controladas**. A P0.1 resolveu parcialmente projeção e pivôs, mas faltou o renderer artístico.

### Diferença entre 'procedural de ponta a ponta' e material de referência

O prompt da demo pede 'sem imagens' no renderer. Na própria execução o Claude relata criar **turnaround de referência** com Nano Banana Pro. Isso é compatível com geração automática de referência e desenho final no Canvas por código, mas impede afirmar que **nenhuma imagem foi usada em qualquer fase do processo**.

## Nova proposta @game2d — Art-first, ainda Canvas 2D puro

**Não avançar para P0.2 IK no personagem de círculos.** Criar ART-01: 1 único frame estático em ângulo 3/4 de gameplay, personagem chibi e um recorte da ilha. Render todo por código. Avaliar:
- Silhueta e escala do personagem igual referência atual; cabeção, torso musculoso, lenço vermelho, caveira só no cinto, adagas curvas e correntes.
- Pintura HQ + argila/massinha rabiscada: strokes com pressão/falha determinística, contornos imperfeitos, 2–3 tons por material, marcas de dedo por clipping local, textura fosca sem shimmer temporal.
- Ambiente minimalista, mais amplo, com grama/areia/água, 2–3 palmeiras, pedras e píer, nada de quadra elíptica chapada.
- Geometria/contornos definidos como Path2D ou matrizes autorais parametrizadas, efeitos de pincel por código e cache offscreen, sem usar Hades assets e sem Blender.
- Aprovação visual **antes de IK/movimentação**: comparação lado a lado na escala final do jogo com captura real de navegador e explicação das limitações.
- Só depois locomover/rotacionar sem degradar as formas aprovadas.

## Análise adicional necessária
Idealmente conseguir arquivos reais do código do piloto de Rafael (se ele os disponibilizar) para auditoria concreta; vídeo sozinho **não mostra a implementação inteira**. Registrar as hipóteses como hipóteses. Não copiar arte de Hades ou de outros jogos.

## Estado / decisões
- P0.1 técnica: parcialmente útil; **P0.1 arte reprovada**.
- P0.2 IK sobre a arte P0.1: **bloqueada**.
- ART-01 renderer HQ+massinha puro Canvas 2D: **proposto**, aguarda confirmação.


---

## ATUALIZAÇÃO DE EVIDÊNCIA — transcrição disponível (19/10/2026)

**O MP4 originalmente examinado não tinha faixa de áudio.** Agora a pasta também possui [uma transcrição em português com timestamps](transcricao_Vi8wJKNYRp8.txt), cuja origem exata não foi verificada. A análise original de frames acima foi **preservada**. Para pontos que dependam de falas, consulte a transcrição textual e confirme possíveis erros de transcrição.

**Descobertas que não eram possíveis apenas pelos frames:**
- ~00:35–02:18: Rafael **afirma** que o Dunloc exibido foi desenhado por código; cenário estático é preparado quando carrega e personagem/monstros/VFX são desenhados a cada quadro com Canvas 2D. É **declaração do autor**, não auditoria de todos os arquivos do Dunloc.
- ~03:04–04:45: afirma que o pedido aberto teve sucesso apoiado em muitos testes anteriores e referências já no projeto, **não em um único prompt mágico**.
- ~06:02–06:45: compara propostas 3D e vetor Canvas e cita aprovação 2×1 por juízes.
- ~08:34–10:20: uma imagem de cabeça frontal orienta referências de oito direções geradas com Nano Banana; agente crítico refina rosto em detalhes, durante horas.
- ~13:50–17:25: descreve prompt do piloto separado: cavaleiro, Canvas 2D sem WebGL/engine/imagens no runtime, rig matemático, IK, animação por poses, pintura HQ de 2–3 tons, cache do cenário e crítica em screenshots.
- ~22:50–24:15: a IA não acerta rosto bonito de primeira; usuário restringe tarefa à **vista sul**, olhos, nariz, boca e cabelo, comparados por região/landmarks.
- ~24:45–27:00: o **piloto ainda tem movimentos imperfeitos**, mesmo mostrando que o desenho por código funciona. Rafael enfatiza evolução por partes.

Para instruções de onboarding e próximos testes, consultar [00-COMECE-AQUI.md](../00-COMECE-AQUI.md) e [02-PLAYBOOK-ART-01.md](../02-PLAYBOOK-ART-01.md), que têm precedência operacional sobre resumos exploratórios anteriores.
