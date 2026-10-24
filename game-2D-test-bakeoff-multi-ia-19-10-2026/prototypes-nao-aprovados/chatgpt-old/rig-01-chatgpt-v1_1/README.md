# RIG-01.1 • Boneco técnico de ação (Canvas 2D puro)

**Entrega experimental independente do ChatGPT, derivada do RIG-01 inicial. NÃO É ARTE FINAL**. O HTML não carrega PNG, WebGL, biblioteca, engine nem internet. Abre como arquivo único no Chrome, embora esse modo `file://` não tenha sido testável no navegador Linux automatizado (bloqueado por política deste ambiente).

## Como abrir
Abra `index-rig.html` diretamente no Chrome/Edge; a página ocupa a tela, podendo redimensionar o Canvas via CSS. O buffer de render é 1280×720 em arena e 1920×1120 nas duas folhas.

## Controles
- **WASD / setas**: corrida direcional, 3,2 un/s, ciclo 0,65 s.
- **WASD/setas duas vezes em até 260 ms**: hop dash; **Shift**: dash direto.
- **F**: esquiva/rolamento para frente no vetor de movimento, 3 unidades, cerca de 0,66 s, com poeira na entrada e saída.
- **J / clique esquerdo**: sacar se preciso e atacar; encadear até combo 3 com buffer de 250 ms.
- **Q ou X**: alternância manual de saque/embainhar. Interpola posição de **cada uma das duas** adagas entre mão e X nas costas; sem duplicar arma na transição. Saque manual intencional fica ativo até nova tecla ou ataque; após ataque/esquiva o sistema gerencia temporizador automático.
- **C**: alterna `arena` → folha de contato direções (8×7) → folha de fases temporais (8 fases × 7 estados) → arena.
- **F1**: debug (juntas, IK, alvos); **T**: teste travamento dos pés; **Espaço**: pausa; **R**: reset; `[`/`]`: passo de yaw 45°.

## API JavaScript
`window.RIG01` versão 1.1; mantém `setMode`, `setState`, `setTime`, `setYaw`, `setPaused`, `step`, `reset`, `runFootLockTest`, `capturePNG`, `getMetrics`, `getDebugInfo` da Parte 1; acrescenta `setWeaponsDrawn(boolean)`, `setCombatTimer(number)`, `triggerAction('dash'|'roll'|'attack')` e modo `motion`.

## Arquivos
- `index-rig.html`: único runtime necessário.
- `screenshots/01..10`: capturas reais de Chromium, para inspeção e comparação.
- `qa_gate11.py`: script auxiliar (Playwright externo **apenas para QA**, não usado pelo jogo).
- `qa_results.json`, `qa_run_console.txt`: métricas de teste; `audit.md`: autocrítica com bloqueios.

## Limites
É um rig técnico simples, **não o personagem artesanal final**, sem inimigos, hit detection, invencibilidade de dodge, som, colisões de arena ou arte HERO-02. Rig-01 original preservado. Não fizemos push/commit.
