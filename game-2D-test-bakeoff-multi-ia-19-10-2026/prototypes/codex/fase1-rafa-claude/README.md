# @game2d — Laboratório Fase 1 · ChatGPT

Experimento jogável independente. Usa **a mesma geometria procedural aprovada do renderer Antigravity** em cópia local imutável de \`bundle.js\`, legalmente e tecnicamente reutilizável dentro deste projeto, mais sistemas novos de arena e combate do ChatGPT. Não altera nenhuma pasta de outro agente.

## Abrir
Abra \`index.html\` por duplo clique no navegador. Sem instalação, rede, engine, WebGL, imagens carregadas ou servidor. O código funciona com \`file://\` porque os scripts são clássicos, não ESM. O fundo é pintado uma vez em canvas offscreen, não é um PNG. O herói e suas armas são redesenhados pelo **mesmo** \`HeroRenderer\` da linha-base aprovada em idle/run/attack.

## Controles
WASD ou setas: andar. Mouse: mirar. Clique esquerdo ou J: ataque; clique novamente para buffer de combo. Espaço/Shift: dash invulnerável curto. R: reset. Crase: pivôs/hitbox de depuração.

## Testes
\`node tests/test.cjs\`: lógica pura de combate, hit único, combos, arcos direcionais, movimento, dash e dano. Em navegador, \`__GAME2D_QA__.getState()\` inspeciona estado e \`__GAME2D_QA__.benchmarkUncapped(90)\` mede render throughput sem vsync. **Não é um teste real em Galaxy S20 FE e não garante 200 FPS sustentados.** A atualização da simulação ocorre em passos fixos de 1/120 s, mas o desenho mostrado usa rAF da tela; portanto contador visual de FPS não é substituto da medição uncapped.

## Limitações explícitas
1. Para evitar recomeçar do zero, esta entrega reutiliza o bundle artístico da base Antigravity sob o diretório independente do ChatGPT; não é uma prova de superioridade artística.
2. Os três estágios de combo possuem timings, danos e arcos distintos, mas a pose gráfica de ataque do renderer existente é compartilhada. Não há ainda transições/8 vistas reais, física dinâmica de correntes, IK de dois ossos com foot lock comprovado, arremesso de correntes ou esquiva acrobática.
3. A ilha é uma interpretação procedural original simplificada da referência: aprovação artística depende de comparação visual por screenshot.
4. Sem prova real de abertura em Windows, sem screenshots auditados e sem benchmark de hardware-alvo neste ambiente.

Fontes: \`AGENTS.md\`, \`docs/prompts a executar/*\`, \`RafaxLab-YTB/01-METODO-COM-EVIDENCIAS.md\`, linhas-base \`prototypes/chatgpt/desenho-v1-chatgpt\` e \`prototypes/antigravity/desenho-v1-antigravity\`.

**Arquivos**: \`bundle.js\` (cópia byte a byte de um blob da base aprovada), \`src/combat.js\` (motor determinístico), \`src/game.js\` (arena/render/entrada), \`index.html\` (UI), \`tests/test.cjs\` e \`AVALIACAO-IA/01..08\`.

## Revisão V2: desempenho e animação

A revisão V2 substitui `HeroRenderer.render()` a cada frame por um atlas gerado proceduralmente em canvas offscreen de **340×290**, com fases específicas para idle (6), caminhada (12), corrida (12) e golpes (12) para S/SE/SW. Interpola por crossfade entre sprites procedurais para evitar saltos. `src/animation.js` usa IK analítico de duas articulações no plano, passada com fase de apoio compensada ao movimento e balanço de braços/cabeça/capa; NÃO há ainda validação de foot lock absoluto ou animação 8 direções. Tecla Shift agora corre; Espaço esquiva. A compilação inicial do atlas pode causar travamentos temporários enquanto as poses são geradas, mas a pintura detalhada não é repetida durante gameplay uma vez aquecida. Cada pose é um cache obtido do renderer por código, e nunca um PNG importado. Nenhum benchmark confiável foi realizado na máquina do usuário. Veja `AVALIACAO-IA/09-CORRECAO-FPS-ANIMACOES.md`.


**Início da aplicação:** a preparação de 126 poses para três direções é feita em etapas na thread principal. Pode haver travadas durante esse período; o rodapé indica o avanço. O benchmark só fica disponível depois de concluído o cache e **não certifica 200 FPS de gameplay**. A avaliação final exige execução real e medição de frame times no seu PC.
