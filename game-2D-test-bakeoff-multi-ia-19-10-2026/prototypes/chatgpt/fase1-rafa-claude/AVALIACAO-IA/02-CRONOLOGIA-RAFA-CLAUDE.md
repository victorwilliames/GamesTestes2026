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
