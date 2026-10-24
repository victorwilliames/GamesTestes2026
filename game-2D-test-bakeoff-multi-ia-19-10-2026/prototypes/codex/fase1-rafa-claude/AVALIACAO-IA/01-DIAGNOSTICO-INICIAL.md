# 01 — Diagnóstico inicial · 19/10/2026

## Escopo e origem
Missão oficial: \`docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md\` e \`contexto-sobre-a-arma-do-hero.md\`. Trabalho restrito a \`prototypes/chatgpt/fase1-rafa-claude/\`. Base Git consultada: \`4f62fdf6f35bbdb6c505276f6d3b037638a3ed76\`.

## Linha de base real
- \`prototypes/chatgpt/desenho-v1-chatgpt\`: renderer original V1.2 procedural (Canvas 2D), poses de referência, HTML standalone; seu \`QA_REPORT_V1_2.md\` declara **gate visual reprovado**, rig real **não comprovado** e execução \`file://\` no Windows **não testada**.
- \`prototypes/antigravity/desenho-v1-antigravity\`: arquitetura modular de pintores, \`HeroRenderer\`, \`WeaponPainter\`, \`RigAdapter.computePose\` com estados idle/run/attack em S/SE/SW; documentação diz que há 10 screenshots auditados e integração de poses, mas essas afirmações **não equivalem à validação do novo jogo**.
- Os experimentos em \`prototypes-nao-aprovados/\` são apenas material de estudo, não ponto de partida artístico.

## Defeitos prioritários já conhecidos
Fidelidade da pintura/manual das peças oficiais, orientação 3/4 completa, mãos/correntes estáveis durante o movimento, IK real de dois ossos, câmera e composição de arena; falta teste efetivo de 200 FPS no dispositivo-alvo.

## Decisão
Reutilizar **uma cópia local byte a byte** do \`bundle.js\` aprovado do Antigravity (blob \`cf56a21e8c32a0a7da78b66318059085945e9ecf\`) para preservar a arte demonstrada. Criar motor separado de arena/combate determinístico, sem alterar implementações de terceiros. Copiar código foi autorizado expressamente pelo prompt; a cópia não deve ser confundida com arte nova do ChatGPT.

## Estado ao preparar a entrega
Arquivos de código e testes foram criados, mas execução do navegador, screenshots, teste de hardware e aprovação artística **não foram obtidos neste ambiente**. Nenhum critério sem evidência foi marcado como aprovado.
