# 02 — Cronologia técnica Rafa + Claude (reconstituição **parcial**)

## Transparência sobre fontes
Documento derivado de \`RafaxLab-YTB/01-METODO-COM-EVIDENCIAS.md\`, \`03-CRITICO-VISUAL.md\`, \`APRENDIZADOS.md\` e \`FONTES_E_EVIDENCIAS.md\`. Há arquivo primário \`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/index.html\` (~1,3 MB), **mas seu conteúdo não foi fornecido pela leitura do conector nesta execução**. Portanto não afirmamos ter lido a conversa integral nem reconstruído suas 594 ações linha a linha. Timestamps abaixo são do vídeo de referência, segundo as notas auditadas, não IDs das mensagens do HTML.

| Etapa | Evidência citada no repositório | Classificação | Aplicação concreta |
|---|---|---|---|
| 1. Investigação anterior e objetivos abertos | Vídeo ~03:19–04:35; método §§1–2 | Relato/transcrição | Não recomeçar dos PNGs sem examinar os protótipos |
| 2. Inventário de sprites e testes técnicos | ~04:00–05:30; método §2 | Relato + quadros | Exigir linha de base e comparar arte existente |
| 3. Canvas 2D vence comparação 2×1 | ~06:02–06:45; método §3 | Placar relatado por Rafael | Escolher Canvas para este piloto, sem universalizar resultado |
| 4. Rig/animação/desenho separados | ~07:00–08:30; método §4 | Arquitetura descrita | Contrato \`RigAdapter\` + \`HeroRenderer\` + \`Combat\` |
| 5. Construção de vistas e crítica do rosto | ~08:34–10:20; ~11:00–12:54 | Referências auxiliares | Usar face/corpo/armas oficiais apenas como guia; não drawImage de PNG |
| 6. Prompt explícito de piloto | ~13:50–17:25; método §6 | **Requisito**, não teste | Canvas 2D, cache estático, câmera, combate, captura e crítico |
| 7. Muitas rodadas com crítico | ~17:45–22:20; 7 pedidos/55 respostas/594 ações/170 imagens/6 críticas, conforme notas | Registro resumido | Entrega incremental, avaliações separadas, nunca aprovar só porque rodou |
| 8. Cache enganando comparação; oclusão | ~21:10–21:45 | Relato de falha/correção | Evitar cache de scripts errado e validar ordem por profundidade |
| 9. Rosto Sul, correção por landmarks | ~22:50–24:45 | Iteração focal | Revisar cabeça, cabelo, olhos, boca, armas separadamente |
| 10. Piloto jogável com imperfeições | ~24:45–27:55 | Demo + fala do autor | Não alegar IK/espada perfeita antes de testar |

## O que foi reaproveitado e o que não foi
- **Aplicado no novo código:** renderer separado do estado; ilha static-offscreen; personagens por código; dt fixo; entradas claras; crítica/QA rastreáveis; reutilização de arte já aprovada.
- **Não comprovado do histórico original:** geometria final e scripts completos de Dunloc; algoritmo exato de IK/rig da conversa; sequência completa de comandos e seus resultados.
- **Próximo passo obrigatório da investigação:** extrair integralmente o HTML original para arquivo local, identificar pedidos/respostas e conferir a ordem e os algoritmos contra cada trecho, sem atribuir decisões ao Claude sem evidência.

**Não confundir:** Dunloc Online (jogo principal) com o piloto Canvas demonstrado em vídeo. O que o autor afirma sobre Dunloc não é auditoria independente do código.

---
## Adendo de investigação primária — 19/10/2026 (Astra/Sol)

A limitação de acesso ao HTML mencionada acima é histórica: nesta sessão o arquivo original foi acessado e seu texto extraído em `fontes/conversa-extraida.txt`. Foram lidas todas as mensagens principais e os seis relatórios críticos. As 594 ações ainda não foram examinadas integralmente; portanto a cronologia completa continua pendente.

A sequência primária confirma: pedido integrado em17/10 22:25 → módulos core/ink/rig/head/knight → turnaround isolado → mundo/efeitos/main → capturas/duas críticas/correções → piloto relatado como funcional em18/10 00:24 → Rafa rejeita o rosto às09:03 → medição/vetorização/refinamento Sul e quatro críticas faciais até11:28 → polimentos finais até11:31. As quatro etapas do nosso prompt organizam nossa entrega, não descrevem literalmente a ordem histórica original.

Referências verificáveis no HTML original (linhas aproximadas, confirmar com rg antes de citar em outro relatório):
- Pedido inicial: artigo msg-1, linha211.
- Primeira crítica: seção “Critic review with screenshots”; veredito na linha4619.
- Implementação plantFeet: linhas6228–6265, com âncoras no mundo e passo de0,1s.
- Crítica facial2: veredito “não, mas está perto”, linha13453.
- Crítica facial3: “SIM, no sul exato”, linha14700.
- Crítica facial4: artigo report em15122 e veredito final em15146.

Os dados históricos de performance são1,0–1,7ms de trabalho na primeira crítica e1,5–3,0ms a3200×2000 na segunda, com intervalo médio entre frames13,3ms. Não converter esses dados em certificação histórica de200 FPS reais.

Detalhes e próximos passos estão em `00-RETOMADA-SOL.md` (atualização final) e `10-PLANO-CONTINUIDADE.md`.
