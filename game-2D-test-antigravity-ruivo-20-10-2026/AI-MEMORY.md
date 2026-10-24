# Memória de continuidade — leia primeiro

Atualizado: 23/10/2026 (America/Sao_Paulo).

## Pedido e Escopo Atual
- **Novo Herói Oficial e Cenário Canônico:**
  - O projeto baseia-se 100% nas referências de `D:\.GITHUB\games\personagens\novo cabeca red`:
    1. `Retrato Chibi de Cabelos Vermelhos.png`: Retrato de altíssima definição facial com cel-shading puro.
    2. `Diagrama de Rigging do Cavaleiro Chibi.png`: Estrutura de juntas anatômicas e proporções.
    3. `Folha de Sprite de Cavaleiro Chibi.png`: Peças modulares (cabeça, peitoral, ombreiras, manoplas, escarcelas, botas, espada e bainha).
    4. `Folha de poses do cavaleiro ruivo chia.png`: Turnaround 8 direções e poses de combate (Combos 1, 2, 3 e Corrida).
    5. `Guia Isométrico de Corpo, Rig e Movimentação.png`: Ciclo de corrida e transições de passos nas 8 direções.
    6. `mapas/Arena Infernal do Templo Subterrâneo.png`: Arena oficial de combate estilo Hades (abismo de magma, plataforma de ardósia escura, medalhão central com louros e crânio de Hades, 4 braseiros com luz radial volumétrica, colunas gregas, estandartes vermelhos imperiais, ânforas e esqueletos hoplitas).

---

## Estrutura do Repositório (Limpo e Focado)
- `ref/novo-heroi/`: Referências visuais do novo cavaleiro de cabelo vermelho.
- `D:\.GITHUB\games\personagens\novo cabeca red`: Pasta de referências estendida (sprites, rigging, animação e mapas infernais).
- `js/`: Código-fonte modular em Canvas 2D puro:
  - `core.js`: Matemática vetorial 3D (`Vec3`, `IsoCamera`, projeção isométrica 3/4).
  - `ink.js`: Cel-shading, paleta oficial e estilo HQ.
  - `hero_vectors.js`: Vetores calibrados com aterramento zero-jitter em Y=0.0 e centro anatômico em X=0.
  - `rig.js`: Esqueleto 3D, IK analítica de 2 ossos com Lei dos Cossenos e vetores polares.
  - `head.js`: Renderizador procedural da cabeça e retrato HUD.
  - `hero.js`: Controlador dinâmico do herói com bobbing de corrida, inclinação, squash/stretch, salto aéreo e rastros de Dash.
  - `world.js`: Arena Infernal do Templo Subterrâneo, iluminação radial dos 4 braseiros e Esqueletos Hoplitas com elmo coríntio, escudo aspis e lança dory.
  - `fx.js`: Arcos de espada curvados azuis/prateados, faíscas metálicas, ondas de choque no solo, poeira de passos e tremor de tela (screen shake).
  - `main.js`: Loop principal a 60 FPS, combate com hit-stop (35ms), combos 1→2→3, dash com esquiva e HUD estilo Hades.
- `tests/`: Testes unitários com Node.js nativo (`tests/core.test.cjs`, `tests/ik.test.cjs`, `tests/rig.test.cjs`, `tests/visual_spec.test.cjs`, `tests/gameplay_and_world.test.cjs`).

---

## Evolução e Resolução de Problemas (Fase 3 - 23/10/2026)
1. **Diagnóstico e Eliminação do Bug de Tremor/Snapping do Herói:**
   - *Causa identificada:* As caixas delimitadoras anteriores calculavam `centerX` e `groundY` pelo retângulo da espada/arma em vez da base dos pés e centro anatômico, causando saltos laterais de até 60px e verticais de até 18px ao girar ou trocar de pose.
   - *Solução aplicada:* Calibração milimétrica dos eixos `anchorX` e `anchorY` baseada no centro da sombra de contato no solo. Resultado: `maxFootY = 0.0` em todas as poses de solo e alinhamento estável em $X=0$.
2. **Dinâmica Contínua de Animação em 8 Direções:**
   - Em vez de uma imagem estática na corrida, o herói agora gira suavemente pelas 8 orientações isométricas, com oscilação vertical rítmica de passos (`bob`), leve inclinação corporal para frente (`lean`), compressão/alongamento de impacto (`squash/stretch`) e partículas de poeira nas lajes.
3. **Mecânica de Esquiva (Dash) Estilo Hades:**
   - Implementado no `Espaço` e `Shift`: aceleração rápida ($360\text{px/s}$ por $0.18\text{s}$) com rastros fantasma de silhueta ciano e poeira direcional.
4. **Reconstrução Fiel da Arena Infernal do Templo Subterrâneo (`world.js`):**
   - Abismo vulcânico profundo com névoa carmesim e partículas de brasas subindo.
   - Lajes de ardósia escura em grade isométrica com juntas de argamassa, chanfros e marcas de batalha.
   - Grande Medalhão Central de Hades com grinalda dupla de louros dourada/bronze, meandro grego e crânio de Hades entalhado.
   - 4 Braseiros monumentais de bronze em pedestais de granito canelados, projetando iluminação radial volumétrica quente (`lighter` blend) que ilumina dinamicamente o piso e o herói.
   - Colunas gregas colossais com capitéis coríntios e estandartes imperiais carmesins bordados a ouro.
   - Altar sacrificial de pedra negra, ânforas gregas de cerâmica preta e vermelha, grade de lanças de ferro forjado e escadas quebradas no abismo.
5. **Esqueletos Hoplitas Oficiais da Referência:**
   - Inimigos refeitos com anatomia esquelética, elmo coríntio de bronze com alta pluma vermelha, escudo hoplita redondo (`aspis`) com borda de bronze e lança longa de estocada (`dory`).
   - Sistema de IA com perseguição, estocadas de lança telegrafadas, bloqueio de escudo, knockback ao sofrer dano e barras de vida flutuantes.
6. **Game Feel Suculento (Combat Juice):**
   - Micro-pausa de impacto (hit-stop de 35 a 55ms) nos acertos de espada.
   - Tremor de tela (*screen shake*) no impacto do Combo 3 (Salto Slam).
   - Arcos de lâmina curvos azuis e brancos com gradientes de brilho.
7. **Testes Unitários:** 13 suítes de testes passando 100% no Node.js nativo (`node --test tests/*.test.cjs`).

---

## Regras de Ouro Técnicas
1. **Canvas 2D Puro:** Zero imagens bitmap no runtime do jogo, zero WebGL, zero bibliotecas externas.
2. **Câmera Isométrica Fiel:** Yaw 45°, pitch 34°, profundidade de ordenação precisa.
3. **IK Analítica:** 2 ossos com Lei dos Cossenos e vetor polar fixo para cotovelos e joelhos.
4. **Cel-Shading 2.5D com Volume:** Underlays sólidos por material, sombras e realces nítidos estilo HQ.
5. **TDD / Testes Automatizados:** Testes unitários com Node.js nativo.
