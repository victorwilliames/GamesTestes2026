# 02 — CRONOLOGIA DO PROCESSO DE RAFA + CLAUDE

Reconstrução do processo documentado na conversa original, com **referências verificáveis** e
separação explícita entre **o que está comprovado**, **o que é declaração do autor** e **o que é
hipótese**. Nada aqui foi inventado: quando a fonte não permite afirmar, está escrito que não permite.

### Fontes primárias consultadas

| Fonte | Caminho no repositório |
|---|---|
| Conversa na íntegra (7 mensagens humanas, 55 respostas do Claude, 594 ações, 170 imagens, 6 relatórios de crítico) | `RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/index.html` |
| Transcrição do vídeo #002 (27m57s) | `RafaxLab-YTB/videos/transcricao_Vi8wJKNYRp8.txt` |
| Análise de frames do vídeo #002 | `RafaxLab-YTB/videos/Vi8wJKNYRp8.md` |
| Reconstrução do método com timestamps | `RafaxLab-YTB/01-METODO-COM-EVIDENCIAS.md` |
| Aprendizados consolidados | `RafaxLab-YTB/APRENDIZADOS.md` |
| Síntese de 5 minutos | `RafaxLab-YTB/00-COMECE-AQUI.md` |

> A transcrição é automática e **pode conter erros de reconhecimento** de nomes e termos
> (`01-METODO-COM-EVIDENCIAS.md`, seção "Fonte e cautela"). Os timestamps são aproximados.

---

## Fase 0 — Contexto anterior (antes de ~02:40)

Rafael já tinha tentado outras técnicas e acumulado imagens/testes no projeto. O problema que ele
levou ao Claude era **real e específico**: animações inconsistentes. Ele pediu um mini-game de
corrida e ataque de espada, **deixando o método em aberto**, usando *Hades* como linguagem visual
de referência.

- **Decisão de Rafa:** não pedir "o jogo pronto"; pedir um piloto pequeno que provasse o pipeline.
- **Evidência:** fala transcrita ~03:19–04:35 + ações na tela.

**Lição transferida:** um prompt não gera um jogo; gera um **experimento**. O valor está no ciclo
experimento → crítica → correção.

---

## Fase 1 — Inspeção de fontes e contratos (~03:50–05:55)

Claude examina os sprites existentes, monta **pranchas comparativas**, testa uma base matemática e
prepara **contratos de módulos** para agentes paralelos + um **boneco matemático invisível
articulado**.

- **Decisão do Claude:** separar o "esqueleto" (matemática) do "desenho" (pintura) antes de desenhar bonito.
- **Cuidado de leitura:** "boneco matemático" **não** significa jogo 3D renderizado.
- **Evidência:** ~04:00–05:30 (transcrição + tela).

**Lição transferida:** a ordem correta é *linguagem visual codificada* → *rig* → *animações*, e
nunca "IK primeiro, arte depois".

---

## Fase 2 — Comparação de renderers e o placar 2×1 (~06:02–07:00)

Foram testadas abordagens com renderização 3D e com vetor em Canvas 2D. Um julgamento comparativo
relatado pelo criador escolheu **vetor Canvas 2D por 2×1**. Em seguida o agente conferiu screenshots
e integrou a proposta.

- **Decisão:** Canvas 2D vetorial como renderer principal.
- **Evidência:** fala ~06:02–06:45 + histórico visível.
- **Cuidado:** esse placar **não é benchmark universal** nem prova de superioridade para todo projeto.

**Aplicação na nossa entrega:** seguimos Canvas 2D puro e usamos o mesmo argumento de forma honesta —
Canvas 2D venceu em controle artístico e determinismo para este estilo, não por ser "mais rápido" em
abstrato.

---

## Fase 3 — Rig + painter como módulos distintos (~07:00–08:30)

O piloto evolui para **rig matemático** + **animação** + **desenho vetorial em Canvas 2D**, criando
um personagem e cenário simples. Rafael continua pedindo refinamentos locais ("braço torto",
movimento natural) **sem mudar a direção artística**.

- **Módulos citados no registro (~08:10):** `rig.ts`, `anim.ts`, `personagem/vetor.ts`, `cenario/`, `efeitos/`.
- **Erro/atrito:** membros tortos e movimento não natural — sintoma clássico de ângulos/pivôs
  inconsistentes entre o rig e o painter.
- **Correção:** separar responsabilidades e iterar por componente.
- **Evidência:** falas ~07:00–08:30 + histórico.

**Aplicação na nossa entrega:** `05-skeleton.js` (rig + FK + poses) é independente de
`06-hero.js` (montagem/ordem de desenho) e de `01`–`04` (pintores). O teste de rig é o F1
(`screenshots/game-debug.png`).

---

## Fase 4 — Referências de rosto (~08:34–10:20 e ~11:00–12:54)

Apenas **uma imagem frontal de uma cabeça** serviu de referência. Rafael conectou o **Nano Banana**
para gerar mais vistas angulares da cabeça; um crítico julgava a semelhança; houve refinamento
detalhado **por regiões do rosto** e o processo levou horas.

- **Decisão do Claude:** quebrar o rosto em *landmarks* (contorno, olhos, boca, nariz, cabelo) e
  comparar cada região.
- **Descoberta importante:** **a IA não sabia o corpo pelo rosto.** No piloto o usuário especificou
  "cavaleiro com armadura" e a IA preencheu o resto; depois o usuário corrigiu o design.
- **Cuidado:** a referência é **guia de arte**, não imagem renderizada pelo jogo.

**Aplicação na nossa entrega:** temos referência de **rosto + corpo + arma** oficiais — uma vantagem
que o Rafa não tinha. Ainda assim, cada região (cabeça, tronco, membros, arma) foi implementada e
revisada separadamente, como manda o método.

---

## Fase 5 — O prompt do piloto (~13:50–17:25)

Rafael dita as regras do experimento:

1. pequeno RPG **isométrico** em Canvas 2D;
2. **sem WebGL, sem engine e sem imagens no runtime**;
3. **esqueleto 3D invisível** com **IK de braços e pernas**;
4. poses-chave com **antecipação → ataque → recuperação**;
5. tinta HQ em **2–3 tons** + contorno escuro;
6. cenário **estático desenhado uma vez em offscreen**; personagem/VFX desenhados em runtime;
7. movimento **WASD**, clique para atacar;
8. **rosto de referência**;
9. **agente crítico** + **screenshots de navegador** antes da entrega.

- **Evidência:** fala transcrita ~13:50–17:22.
- **Cuidado:** o prompt **não comprova** que cada detalhe foi implementado; a demo e os relatórios
  mostram resultado **parcial**.

**Aplicação na nossa entrega:** implementamos 1, 2, 4, 5, 6, 7, 8 e 9.
O item 3 foi implementado **parcialmente**: esqueleto 2D + FK com curvas de ângulo; **IK de dois
ossos não foi feita** (declarado em `05` e `07`).

---

## Fase 6 — Execução longa com crítico (~17:45–22:20)

A tela mostra o histórico de auditoria: **7 mensagens humanas, 55 respostas do Claude, 594 ações,
170 imagens, 6 relatórios de crítico** (~20:25). Rafael diz explicitamente que **não foi apenas um
prompt perfeito**.

Dois defeitos técnicos aparecem nesse bloco e são corrigidos:

| Erro | Diagnóstico | Correção descrita |
|---|---|---|
| **Screenshots aparentemente idênticos** (~21:10) | cache do JavaScript mascarava a iteração | mudança da política de cache da bancada de QA |
| **Sobreposição herói/inimigo e leitura da capa** (~21:45) | ordem de desenho e profundidade | *depth sorting*, limites de altura da capa e fronteiras frente/trás |

- **Evidência:** página de auditoria na tela ~20:25; fala ~20:20–22:30; revisão do crítico ~21:45.

**Aplicação na nossa entrega:** o screenshot é sempre **captura real via CDP** com URL/parâmetros
registrados; e existe ordenação por Y explícita (inimigos atrás/na frente do herói, props
atrás/na frente) em `10-game.js` e `07-arena.js`.

---

## Fase 7 — Foco estreito no rosto (~22:50–24:45)

Como o rosto ficou distante da referência, o usuário deu uma instrução **bem específica para
melhorar somente a vista Sul**. O agente dividiu o rosto em landmarks, comparou partes visualmente
e iterou com o crítico. **Mesmo assim**, o narrador indica limitações de movimento e arma.

- **Decisão metodológica:** uma correção por vez, com escopo fechado ("só o rosto Sul").
- **Evidência:** transcrição ~22:54–24:18 + screenshots do processo.

**Aplicação na nossa entrega:** as rodadas de arte foram exatamente assim — uma região por vez
(ex.: orelhas, depois lâminas, depois braço de trás), com captura antes/depois.

---

## Fase 8 — Resultado e limites (~24:45–27:55)

O piloto **funciona**: o personagem anda e ataca no navegador. Mas o próprio Rafael reconhece
**movimentos tortos, espada invertida** e necessidade de novas iterações. Ele relata que a demo e o
projeto principal usam **desenho por código** e que **não há imagens de runtime** — é a declaração
do autor sobre como o jogo foi feito, **não** uma auditoria integral do código de Dunloc.

- **Evidência:** fala ~24:45–27:25.
- **Distinção obrigatória:** `afirmação do autor` ≠ `auditoria independente`.

---

## Dunloc (jogo maior) vs. piloto de prova

- **O que Rafael afirma:** em Dunloc, cenários, monstros e personagens são gerados/desenhados por
  código; a parte estática do cenário é pintada no carregamento e os elementos móveis são desenhados
  em runtime no Canvas 2D (~00:35–02:18).
- **O que a filmagem demonstra:** um jogo bonito em funcionamento e um piloto separado com processo
  de iteração. **O vídeo não entrega o código completo de Dunloc para auditoria.**
- **Consequência:** não tratar o piloto como prova de que um único prompt gerou o jogo final.

---

## O que não sabemos com certeza (não inventar)

- O shader/painter interno exato de Dunloc e seus scripts completos.
- A licença do código e a integração exata do Nano Banana.
- Todos os prompts e o conteúdo integral das 7 mensagens humanas (a página de auditoria é pública,
  mas a leitura completa não foi feita neste entregável — foi usada a reconstrução com timestamps).
- Medições confiáveis de performance cross-device.

---

## Resumo em 10 linhas (o método que replicamos)

1. Referência visual primeiro; código depois.
2. Separar **rig matemático** de **painter**.
3. Comparar alternativas (3D × vetor) e registrar o porquê.
4. Pintar o **estático uma vez** (offscreen) e o **dinâmico por quadro**.
5. Poses com antecipação → golpe → recuperação.
6. Crítica visual por componente, em rodadas pequenas.
7. Corrigir um escopo por vez ("só o rosto").
8. **Screenshots reais** de navegador, com cache controlado, antes de declarar pronto.
9. Assumir limites (movimento torto, arma invertida) em vez de esconder.
10. Meta de performance é requisito de engenharia, não consequência de "ficar bonito".
