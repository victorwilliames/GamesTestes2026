# Auditoria — RIG-01 DeepSeek

## 1. Identificação

- **Agente/modelo:** DeepSeek V4.1 Flash Free (OpenCode).
- **Data:** 2026-10-19.
- **Pasta:** `prototypes/rig-01-deepseek/`.
- **Navegador:** Microsoft Edge headless **155.0.4283.62** (`Edg/155.0.4283.62`).
- **Sistema:** Windows 11 Pro 10.0.26300, 64 bits; AMD Ryzen 5 5500U (6C/12T); AMD Radeon integrada.
- **Resolução de teste:** canvas nativo **1280 × 720**, `deviceScaleFactor = 1`; folha de contato **1920 × 1120**.
- **SHA-256 de `index-rig.html`:** `44c981e5495d8323f2a36d890c44629b2b4353703866a091855a72db5d708f5f`.
- **Build durante a captura:** o hash antes e depois foi o mesmo (`sameBuild: true` no `capture-report.json`).
- **Escopo:** Gate 1 apenas. Este agente **não criou `index-hero.html`** e não iniciou a Parte 2.

## 2. O que foi realmente executado

- [x] Abri o arquivo local `index-rig.html` no Edge via `file://`; a única requisição de rede registrada foi o próprio arquivo.
- [x] Exercitei controles no navegador via eventos reais de teclado/CDP e via a API determinística. **Não houve uma sessão manual prolongada com mouse**; o clique esquerdo foi verificado no código, não jogado manualmente.
- [x] Rodei o teste de foot lock em yaw 0° e 90° por 2 s de simulação em passo fixo.
- [x] Gerei e inspecionei as 8 capturas reais do mesmo build, incluindo a folha 1920 × 1120.
- [x] Rodei a crítica separada em subagente, corrigi três defeitos reais e registrei antes/depois na seção 7.
- [x] Rodei o teste de performance uncapped em 1280 × 720. O celular não foi testado.

## 3. Gate 1 — RIG-01

| Critério | Resultado | Evidência |
|---|---|---|
| Sem imagens, WebGL, engine ou dependências | **Passou** | 0 elementos `<img>`/`<svg>`, um único script clássico inline, `getContext('2d')`, nenhum `fetch`/`XMLHttpRequest`; a única requisição é o HTML local. |
| Projeção e yaw | **Passou** | Fórmula exata do briefing em `project()`; grade e eixos em `01`/`02`; a folha mostra 8 yaws. O probe de ombros em yaw 0°/180° troca os lados sem flip: L 658,27 → 621,73; R 622,27 → 657,73. |
| Rig, hierarquia e duas adagas | **Passou** | 41 itens de desenho ordenados por profundidade; comprimentos fixos; duas adagas curvas presas às mãos corretas; zero clamps de IK em idle/run/dash/attack1/2/3. |
| Idle | **Passou** | Loop de 2 s, respiração discreta, pés plantados; `01-rig-arena-idle.png`. |
| Corrida + foot lock | **Passou** | Ciclo de 0,8 s a 2,2 u/s; desvio máximo real abaixo da meta; `02-rig-run-footlock.png`. |
| Dash | **Passou** | 0,42 s, 2,4 unidades, cooldown de 0,6 s após o recovery, direção interpolada; `03-rig-dash.png`. |
| Combo de 3 golpes | **Passou (técnico)** | A1/A2/A3 com durações 0,34/0,35/0,56 s, janelas e raízes distintas; impacto amostrado nos keys reais; `04`–`06` e `08`. |
| 8 direções sem espelhamento | **Passou** | Folha 8 × 7, 56 células, rotação por yaw; não há `scale(-1)` nem flip horizontal; `08-rig-contact-sheet.png`. |
| Debug e API | **Passou** | 41/41 itens de ordem de desenho, âncoras dos pés, alvos de IK, hitbox e métricas; API reproduz estados e poses. |
| Performance na regra de ouro | **Passou no desktop testado; não validado em mobile** | 1095,85 fps médios, pior segundo 750,2 fps, p99 1,7 ms no ambiente declarado; celular S20 FE ou mais fraco não testado. |
| Evidência e honestidade | **Passou** | 8 PNGs reais, hash estável, relatório de captura e esta auditoria. |

**Bloqueadores do Gate 1 do briefing:** nenhum dos bloqueadores objetivos está presente (não há imagem no Gate 1, foot lock falso, vistas espelhadas, folha ausente, screenshot ausente ou auditoria inventada). O limite de portabilidade mobile está declarado na seção 6.

## 4. Métricas

### 4.1 Foot lock

| Yaw | Desvio máximo | Desvio médio | Amostras | Clamps | Meta < 2 px |
|---:|---:|---:|---:|---:|---|
| 0° | `5,684341886080802e-14 px` | `1,2357264969740872e-15 px` | 92 | 0 | **Passou** |
| 90° | `5,684341886080802e-14 px` | `3,707179490922262e-15 px` | 92 | 0 | **Passou** |

Os dois lados foram medidos durante 2 s de corrida em linha reta, em passo fixo de 1/120 s, sem depender do desenho. O valor é ruído de ponto flutuante, não deslize visual.

### 4.2 Desempenho — ambiente declarado

- **Método:** `requestAnimationFrame` uncapped, 1,5 s de warm-up + **6 s** de amostra, canvas 1280 × 720 nativo, GPU habilitada.
- **Flags:** `--disable-frame-rate-limit --disable-gpu-vsync`.
- **Medição final:** **1095,85 fps médios**; frame efetivo **0,913 ms**.
- **Frame time:** p50 **0,8 ms**, p95 **1,4 ms**, p99 **1,7 ms**, máximo **138,5 ms** (um hitch de host).
- **Pior segundo:** **750,2 fps**.
- **FPS por segundo:** `[947,5; 1061,5; 750,2; 1041,4; 1431,6]`.
- **Custo de desenho:** **0,412 ms** por frame.
- **Piso de 200 fps:** **atendido com margem** neste ambiente, inclusive no pior segundo. O critério interno de p99 ≤ 5 ms também foi atendido (1,7 ms).
- **Relatório bruto:** `capture-report.json` → `performance`.

O máximo de 138,5 ms é um hitch isolado do host, não o regime do render: p99 de 1,7 ms e pior segundo de 750 fps. Uma execução anterior do mesmo build, com outros navegadores ativos na máquina, mediu 846,74 fps médios, p99 2,6 ms, pior segundo 359,7 fps e máximo 416,2 ms. Os dois piores segundos ficaram acima do piso, mas a variabilidade do host é real e fica registrada; nada foi escondido com blur, shake, redução de resolução ou telemetria falsa. As duas execuções estão em `perf-runs.json`.

### 4.3 Sonda suplementar sem GPU

O arquivo `perf-software.json` registra uma execução forçada com `--disable-gpu`, no mesmo build e viewport:

- média **369,52 fps**; p95 **3,6 ms**, p99 **4,0 ms**, máximo **5,0 ms**; draw **0,374 ms**.

A sonda final passa do piso de 200 fps e do critério de p99 ≤ 5 ms. Uma execução anterior, com a máquina sob carga de outros navegadores, mediu 255,44 fps médios e p99 6,8 ms. Essa variação impede tratar o fallback como garantia; ele **não** substitui a validação em celular/PC fraco real.

### 4.4 Hashes das capturas

| Arquivo | Dimensão | SHA-256 |
|---|---:|---|
| `01-rig-arena-idle.png` | 1280 × 720 | `05BCE25584AADA7A7D4CF0AE533AD44374107A9D69D9E5BCA1214609F0A7D94B` |
| `02-rig-run-footlock.png` | 1280 × 720 | `71234A2EDD69DD050D330659270010A1243D85CD0390965D8B4008434287E75B` |
| `03-rig-dash.png` | 1280 × 720 | `982E9C06788FC250B579769B7D627AB4FA9AA3FC58E94A96151AED7D7E323A2B` |
| `04-rig-combo-1.png` | 1280 × 720 | `DB8FF60641B6284378D2EE1CCF437212F9C3018DA9E5A369FA6D7DB183C2C204` |
| `05-rig-combo-2.png` | 1280 × 720 | `BDFEB72DAE9483A9102D77ECB5C0F0BD4DF1FB02796EBA5F6228D1CD75A02672` |
| `06-rig-combo-3.png` | 1280 × 720 | `B438D42D6B95D929870BA7A0C7C66CC2EB8C9D18D0F8B90185BAC90981A86BB5` |
| `07-rig-debug.png` | 1280 × 720 | `EF606620587145EE6416FF1509A6A5C862A6CF8F4CA60C9A98E3E0C243777A93` |
| `08-rig-contact-sheet.png` | 1920 × 1120 | `90CCE94EB7D422EBB7A6DDB9441B393CC5BCFF9618CEF619BDD5F358DD83FEBB` |

As capturas são frames completos de cena, opacos (24 bpp), não sprites recortados; alfa real não se aplica a elas.

### 4.5 API determinística — resultados reais

- Durações: idle 2 s, run 0,8 s, dash 0,42 s, attack1 0,34 s, attack2 0,35 s, attack3 0,56 s.
- Clamps: **0** em todos os seis estados; ordem de desenho **41** itens em todos.
- Combo: A1 enfileira, A2 enfileira, A2 inicia no fim de A1, A3 inicia no fim de A2 e o estado final volta a idle.
- Dash: estado final idle, deslocamento `(0; 2,4)` em yaw 0°, cooldown 0,6 s, zero clamps.
- `step(0.0167)` avança 0,016666… s e o segundo passo mantém o mesmo delta; não arredonda para 0,025 s.
- Limites de arena: caminhada de 6 s para leste para em x = 5,5; 12 s para oeste para em x = −5,5; o personagem não sai da tela.
- Pose determinística: mesma pose antes/depois do reload (`deterministicPose.equal: true`).

## 5. Defeitos conhecidos

1. **Silhuetas de impacto de A1/A2 ainda compactas.** As mãos cruzam perto do tronco/cabeça nos keys de impacto; são distintas e legíveis o suficiente para o Gate 1, mas não têm a leitura dramática que o Gate 2 deve buscar.
2. **Debug visualmente denso.** Nomes de juntas e rótulos de alvos/âncoras se sobrepõem no personagem de 1,7 u. A ordem de desenho completa e as métricas estão legíveis no painel; a leitura anatômica no corpo pode melhorar.
3. **Portabilidade mobile não comprovada.** Não há S20 FE ou aparelho mais fraco disponível. O piso de 200 fps não pode ser declarado cumprido nessa faixa; o fallback sem GPU também tem p99 acima de 5 ms.
4. **Hitch isolado de 138,5 ms** na amostra final de 6 s (e 416,2 ms em uma execução anterior sob carga). A média, o p99 e o pior segundo passam, mas o frame máximo não é perfeito; o host tinha outros navegadores ativos.
5. **Correntes ausentes por escopo.** O Gate 1 pede as duas adagas; correntes, caveira, capa e acabamento artístico pertencem às etapas seguintes. Isso não é uma aprovação visual do herói.
6. **A folha de contato desliga o overlay de spin do attack3** para comparar yaw, conforme nota no rodapé. A pose do jogo mantém o giro; a folha é uma prova de orientação, não o frame final de arte.

## 6. O que não foi testado

- **Celular real** (S20 FE ou mais fraco), em navegador mobile, com 200 fps e sem cap de refresh: **não testado neste hardware**.
- **PC fraco sem aceleração de GPU**: apenas a sonda suplementar acima; não é validação de portabilidade.
- **Firefox/Safari** e outros motores: não executado.
- **Sessão manual longa com mouse** e clique esquerdo: não executada; `J` e os eventos de teclado foram exercitados, e o caminho de `pointerdown` foi inspecionado.
- **Escala CSS em telas mobile/high-DPI**: não executada; as capturas usam o buffer nativo 1280 × 720.
- **Parte 2 / `index-hero.html` / assets / correntes / visual artístico**: fora deste escopo e não iniciados.

## 7. Crítica separada e correções

A segunda passagem foi feita em subagente separado, que abriu o HTML no Edge, inspecionou as capturas, exercitou a API e apontou três defeitos reais. Não houve elogio sem evidência nem execução inventada.

### Antes/depois

| Defeito apontado | Antes | Depois |
|---|---|---|
| Capturas de A1/A2 rotuladas como impacto, mas amostradas em `0.12`/`0.11` s | HUD e folha mostravam poses de meio do active, próximas entre si | Amostras nos keys reais `A1 = 0.1598 s`, `A2 = 0.150 s`; HUD/folha e relatório registram os novos tempos; silhuetas mais distintas |
| Janela de combo abria 250 ms antes do recovery | Apertar no windup podia enfileirar o próximo golpe; a regra do briefing não era respeitada | A janela abre exatamente em `recoveryStart` (com epsilon de ponto flutuante); o teste de API confirma o encadeamento e que o windup não enfileira |
| Debug sem âncoras de pé fora do foot lock e lista de desenho truncada em 17/41 | Só havia âncoras durante o run travado; o painel mostrava os 17 itens mais próximos | Âncoras de contato desenhadas sempre (mundo travado ou solo atual) e os **41/41** itens da ordem de desenho listados |
| `step(0.0167)` avançava 0,025 s | O laço arredondava o resto para um passo inteiro extra | Acumulador de resto na API: primeiro passo `0,016666…`, segundo delta igual; evidência em `capture-report.json → apiChecks.step` |

### Correções adicionais feitas na mesma rodada

- Sola plantada passou a ficar exatamente em `z = 0` (antes havia um flutuamento de ~1 px).
- HUD da corrida agora mostra root e velocidade coerentes com a captura (`root 1,20`, `speed 2,20`), em vez de root 0 com velocidade 0.
- Adicionado limite de arena para o personagem não sair da tela; teste de API confirma x = ±5,5.
- A captura de performance passou a usar GPU, flags uncapped, 6 s de amostra e pior segundo calculado só em janelas completas; o relatório registra os FPS por segundo.

### Correção pendente

- **Validar 200 fps em celular real da faixa S20 FE ou mais fraco.** Se falhar, a próxima etapa técnica é um gate específico de qualidade adaptativa (orçamento de desenho e resolução), sem mascarar o resultado. Isso não foi executado aqui.

## 8. Pedido de avaliação

**Gate 1 no desktop declarado:** os critérios técnicos e o piso de 200 fps passam com margem. **Gate 1 em mobile:** não validado; não há base honesta para declarar 200 fps nessa faixa.

Este audit **não declara o Gate 1 aprovado**. A aprovação é do usuário. A próxima ação recomendada, sem executá-la, é avaliar esta entrega e autorizar (ou não) um gate de performance mobile em hardware real; a Parte 2 não deve começar antes disso.
