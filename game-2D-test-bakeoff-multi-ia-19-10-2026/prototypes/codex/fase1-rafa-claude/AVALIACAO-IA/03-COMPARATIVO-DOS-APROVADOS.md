# 03 — Comparativo dos dois protótipos aprovados

| Critério | ChatGPT V1.2 | Antigravity V1 | Decisão |
|---|---|---|---|
| Estratégia | \`drawHero\`, \`src/head.js\`, \`body.js\`, \`weapons.js\`, HTML inline | \`HeroRenderer\` + pintores modulares + materiais + \`RigAdapter\` | Usar a composição modular da Antigravity como linha de partida |
| Fidelidade visual | Relatório próprio: reprovada | Relatório próprio: melhorias de silhueta e pintura; limitação da vista 3/4 | Não alegar vitória sem comparação de screenshots no mesmo enquadramento |
| Armas | Mudança V1.2 para pivô de mão compartilhado; arte ainda insuficiente | Pintor modular com empunhadura de palma atrás, arma no meio e dedos à frente | Manter arma detalhada e renderer único |
| Correntes | Representação simplificada | Elos procedurais, pontos de conexão relatados | Preservar e auditar continuidade nas animações |
| Articulação | Adaptação estática, \`integratedRig01:false\` | \`RigAdapter.computePose\` idle/run/attack; três vistas | Usar provisoriamente, **não denominar IK real certificado** |
| Execução | V1.2 corrigiu ESM em \`file://\`, mas Windows não testado | \`bundle.js\` encapsulado e script inline, documentação orienta duplo clique | Copiar o bundle clássico localmente |
| Evidência | \`QA_REPORT_V1_2.md\` e capturas | \`FIDELITY_REPORT.md\` e dez capturas | Ambos possuem relatórios prévios, mas nosso protótipo ainda requer QA próprio |

## Reaproveitamento real
Arquivo \`bundle.js\` da implementação Antigravity copiado para esta pasta **sem mudar um byte**. A cópia preserva os módulos e fornece \`window.HeroRenderer\` e \`window.RigAdapter\`; \`src/game.js\` invoca o mesmo renderer para estados ociosos, locomoção e golpes. Os códigos de física de arena, colisão, dano, input e HUD são novos.

## Comparação honesta
Esta é uma **decisão de engenharia por evidência documental e análise de código**, não um julgamento artístico lado a lado validado por screenshots do novo protótipo. A aprovação humana da fidelidade está pendente.
