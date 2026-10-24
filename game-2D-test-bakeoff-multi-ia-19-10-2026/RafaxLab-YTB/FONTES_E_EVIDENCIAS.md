# Fontes, evidências e grau de confiança

## Canal
- https://www.youtube.com/@rafaxlab — canal indicado pelo usuário. Não presumir descrição ou estatísticas atuais sem consulta.

## Vídeos incluídos

| YouTube ID | Link | Material acessado | Grau de cobertura |
|---|---|---|---|
| `Vi8wJKNYRp8` | https://www.youtube.com/watch?v=Vi8wJKNYRp8&t=1s | MP4 enviado pelo usuário, aproximadamente 27m57s, sem faixa de áudio; quadros e texto em tela revisados | Visual em várias cenas e momentos-chave; **áudio não analisado** |
| `mp5Z2z2FcBg` | https://www.youtube.com/watch?v=mp5Z2z2FcBg | Prints/menções nas conversas e no fluxo relacionado; vídeo não revisado integralmente | **Parcial, pendente** |

## Convenções de classificação

- **OBSERVADO:** diretamente legível/visível em um frame ou arquivo fornecido; citar vídeo e timestamp aproximado.
- **PROMPT:** aparece como solicitação ao agente, mas não confirma que foi implementado.
- **RELATADO:** o agente afirma ter criado algo; confirmação exige arquivo, screenshot ou teste específico.
- **INFERÊNCIA:** dedução técnica plausível com limites declarados.
- **PROPOSTA:** solução desenhada para o @game2d; **não atribuir ao Rafael**.
- **VALIDADO NO @game2d:** exige caminho no repositório, commit, evidência de execução e critério de aceitação; não usar esse rótulo só por relato de agente.

## Resumo de evidências com timestamp — Tech Bite #002

- ~03:00 — Claude inspeciona projeto e sprites/folhas de contato.
- ~06:15 — texto mostra avaliação comparativa 'Vetor (Canvas 2D) venceu por 2×1'.
- ~08:10 — descreve rig, animação, renderer em módulos.
- ~14:00 — prompt de piloto com Canvas 2D, IK e pintura HQ.
- ~20:25 — histórico de conversas: 7 mensagens do usuário, 55 respostas do Claude, 594 ações, 170 imagens, 6 relatórios de crítico.
- ~20:45 — uso relatado de imagem conceitual como guia (Nano Banana Pro / Higgsfield).
- ~21:10 — problemas de cache do browser e testes.
- ~21:45 — agente crítico de profundidade/oclusão/capa.
- ~23:05 — comparação do rosto por marcos visuais; refinamento por parte.
- ~24:45–26:00 — piloto Canvas demonstrado no navegador.

Para o contexto e ressalvas, consultar [análise detalhada](videos/Vi8wJKNYRp8.md). Os timestamps são aproximados, baseados nos quadros inspecionados.

- [Conversa na íntegra de Rafa e Claude](CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/).
- [Protótipos aprovados de linha de base](../prototypes/).
- [Direção artística oficial do @game2d](../docs/ART_DIRECTION.md).
- [Especificação técnica procedural e checklist](../docs/TECHNICAL_OPTIONS.md).

## Lacunas ainda abertas
- Áudio/narração do vídeo Tech Bite #002 não está presente no MP4.
- Código-fonte real do piloto de Rafael não foi fornecido/verificado; interfaces sugeridas são apenas reconstruções.
- Tech Bite #001 precisa de análise própria em frames/audio.
- Não há base para concluir que os cenários de Dunloc são o mesmo runtime do piloto Canvas.


## ATUALIZAÇÃO — fonte textual posterior (19/10/2026)

Já existe em `videos/transcricao_Vi8wJKNYRp8.txt` uma transcrição em português (cerca de 674 linhas, timestamps de 00:00 a 27:54). **A origem exata desse texto ainda precisa de confirmação**; existem possíveis erros de transcrição automática. A informação anterior de que não havia áudio continua correta para **aquele MP4**, mas não significa que não há acesso ao conteúdo falado pelo novo arquivo de texto.

Use este arquivo para **afirmações atribuídas ao próprio Rafael**, sempre identificadas como 'segundo ele', não auditoria do código. Especialmente ~00:35–02:18 (Dunloc e cenário/entidades Canvas 2D), ~03:04–04:45 (contexto), ~06:02–06:45 (vetor 2×1), ~08:34–10:20 (referências de rosto e crítico), ~13:50–17:25 (prompt piloto), ~22:50–24:15 (refinamento por região), ~24:45–27:00 (limites do piloto).

Índice atualizado: [01-METODO-COM-EVIDENCIAS.md](01-METODO-COM-EVIDENCIAS.md).
