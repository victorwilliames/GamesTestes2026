# RIG-01.1 — Auditoria de polimento (19/10/2026)

**Status:** engenharia jogável para teste de animação; **não aprovado artisticamente** e ainda aguarda teste local do usuário.
**Fonte:** RIG-01 ChatGPT Gate 1 preservado em `prototypes/rig-01-chatgpt/`. Esta entrega é derivação independente na pasta `rig-01-chatgpt-v1_1/`; nenhuma referência visual ou PNG compõe o renderer.

## Fonte exata / rastreabilidade
- SHA-256 `index-rig.html`: `94b419b65cfb45bcfdb4386b604eb1c384481e35e5293fa9b854d2e959bd3751`
- Chromium headless Linux: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/144.0.0.0 Safari/537.36`
- Resolução nativa arena: **1280×720**; folha **1920×1120**, device scale 1.
- Capturas via `canvas.toDataURL('image/png')` do **mesmo HTML**, com API determinística de estados/yaw/tempo.
- Abrir por `file://` no Chromium automatizado Linux: **bloqueado pela política do ambiente**, não deve ser marcado como validado no Windows. HTML segue inline/autocontido.

## Checklist efetivamente executado
- [x] HTML Canvas 2D puro, sem recursos gráficos externos, engine ou WebGL.
- [x] Dash Shift, dash duplo W, dodge F e alternância de arma X/Q foram exercitados por eventos de teclado reais.
- [x] Saque e transição de volta ao X; auto-embainhar após 3,5 segundos sem ação.
- [x] Oito direções em uma geometria única, sem sprites flipados; contatos 8×7 e oito fases temporais.
- [x] Posição da arma no dorso (4 seções de lâmina para duas adagas) versus arma nas mãos (4 seções).
- [x] Corrida 3,2 un/s com IK analítico e pé travado no plano de mundo, amostras em yaw 0 e 90.
- [x] Combo 1 → 2 → 3 por buffer; arcos durante janela ativa desenhados por pontos locais 3D projetados na câmera.
- [x] Polo de cotovelo no referencial do tórax, posições de braço corrigidas para evitar atravessar o peito.
- [x] Rolamento físico local com rotação em Y/Z na direção de movimento (não giro contrário), 3 unidades, poeira determinística; hop dash com curva vertical curta.
- [x] 10 capturas reais, sem screenshots de IA como se fossem resultado de engine.
- [ ] Teste do próprio arquivo por duplo clique em `file://` no PC do usuário (pendente).
- [ ] Validação artística final do peso e naturalidade da animação pelo usuário (pendente).

## Métricas
| Verificação | Resultado |
|---|---|
| IK, 7 estados × 8 yaws × 5 tempos × 2 lados × 4 ossos | **2240 comparações** |
| Violações de comprimento de osso | **0** |
| Alvos IK fora do alcance na bateria | **0** |
| Foot lock yaw 0°, 2 s | **0 px**, 217 amostras |
| Foot lock yaw 90°, 2 s | **0 px**, 217 amostras |
| Distância percorrida em 2 s de corrida | **6.40 unidades** |
| Dash Shift (esperado aprox. 2,4) | **2.392 unidades** |
| Roll F (esperado 3,0) | **3.000 unidades** |
| Double-tap W | **dash** |
| Combo após buffer | **attack2 → attack3** |
| Armadura X embainhada | **4 partes de lâmina**, duas armas |
| Lâminas nas mãos | **4 partes de lâmina**, duas armas |
| Equipar X / embainhar Q | **True / True** |
| Auto timer perto da expiração | 0.092 s restante, armado=True |
| Timer depois da expiração | armado=False; movimento de recolher continua por ~0,14s |
| Chromium headless observado | ~188.0 callbacks/s nesse ambiente SEM vsync; **não equivale a benchmark de 60 FPS em hardware-alvo** |
| Erros JS/console | **0/0** |

## Capturas do mesmo build
- `01-idle-back-X-south.png`: 1280×720, captura real.
- `02-idle-back-X-north.png`: 1280×720, captura real.
- `03-combat-guard.png`: 1280×720, captura real.
- `04-run.png`: 1280×720, captura real.
- `05-roll.png`: 1280×720, captura real.
- `06-dash.png`: 1280×720, captura real.
- `07-attack-1.png`: 1280×720, captura real.
- `08-attack-3.png`: 1280×720, captura real.
- `09-contact-56.png`: 1920×1120, captura real.
- `10-motion-phases.png`: 1920×1120, captura real.

## Crítica separada e correções reais
1. **Inicialmente a corrida a 3,2 un/s provocava extrapolação IK (yaw 90: 2,018 px)**. Recalibrada para pelvis mais baixa e arco de passada ampla; 0 px nos yaws 0/90 na bateria de referência.
2. **O primeiro saque duplicava armas durante a transição**: passamos a interpolar uma única dupla de adagas entre dorso e mão.
3. **O cotovelo cruzava a caixa torácica em ataques diagonais**: em inspeção anatômica pré-correção houve **32 inversões de lateralidade** em amostras dos golpes 1/2; corrigi o alvo de punho mantendo o cotovelo fora; uma segunda bateria com 400 casos não mostrou essas inversões.
4. **Amostragem do roll:** há passagem de cabeça baixa, corpo invertido e recuperação, mas ainda pode parecer mais acrobático que um rolamento Souls fisicamente perfeito; o balanceamento artístico depende da forma final do corpo.

## Limitações honestas
- O `roll` usa rotação geométrica local 360° e compensação automática do contato com o chão; **não é simulação de colisão de corpo rígido nem física de superfície**.
- O `hop dash` é impulso rasante com componente vertical por curva senoidal; não é um sistema balístico universal.
- Golpes têm input buffer e arcos 3D projetados, **mas não existe inimigo, dano nem detecção de hits**.
- Double-tap foi verificado com **W**, teclas de seta são implementadas pelo mesmo mecanismo, mas não houve QA manual em cada tecla individual.
- QA automatizado não substitui inspeção contínua de animação, diagonais e teclado no Windows real. Algumas transições precisam de ajustes depois de vermos vídeo de gameplay da forma final.
- A arma manual usa alternância persistente até outra ordem manual ou ação; após ataques/rolamento o contador automático reativa.

## Próximo passo recomendado
Instalar o arquivo no Windows por **abertura direta**; assistir a corrida, rolamento, dash, 3 golpes e volta do X. Se o usuário aprovar a mecânica básica, planejar a transição controlada para HERO-02. **Sem commit, push, HERO-02 ou assets novos nesta entrega.**
