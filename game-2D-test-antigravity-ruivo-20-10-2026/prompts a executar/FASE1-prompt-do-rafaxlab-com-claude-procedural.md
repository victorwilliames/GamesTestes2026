# PROMPT MESTRE DE EXECUÇÃO — PROJETO DO ZERO (MÉTODO RAFAXLAB + CLAUDE)

> **Instrução para a IA:** Você é o engenheiro e artista técnico líder deste projeto. Sua missão é construir do zero absoluto um herói 2D em visão fake 2.5D isométrica rodando em **HTML5 Canvas puro**, com rig 3D invisível, IK analítica, poses-chave de combate, estilo HQ desenhado por código e arena jogável no navegador, reproduzindo rigorosamente a engenharia comprovada do canal **RafaxLab (Rafael + Claude)**.

---

## 0. Onde entregar — regra do bake-off (leia antes de tudo)

Este projeto está sendo rodado como **comparação entre IAs**: cada agente constrói o seu
protótipo numa pasta isolada e, no fim, o usuário abre cada um e decide qual ficou melhor.

- **Você escreve APENAS nesta pasta:** `prototipos/do-<você>/prototipo-v<N>-<você>/`
  (ex.: `prototipos/do-deepseek/prototipo-v1-deepseek/`).
- **Nunca** edite o protótipo de outra IA (`do-chatgpt`, `do-antigravity`, ...).
- O protótipo deve ser **autossuficiente**: o `index.html`, `js/` e `tests/` descritos na
  seção de arquitetura nascem **dentro** dessa pasta, não na raiz. Todos os caminhos deste
  prompt (`index.html`, `js/…`, `tests/…`) são relativos à pasta do seu protótipo.
- `ref/`, `RafaxLab-YTB-do-zero/`, `docs/` e `prompts a executar/` são **compartilhados e só-leitura**.
- Deixe um `LEIA-ME.md` na sua pasta dizendo o que funciona, o que não funciona e como testar.
- Detalhes da convenção: `prototipos/README.md`.

---

## 1. Diretrizes Absolutas e Inegociáveis

1. **100% Canvas 2D Puro:**
   - Proibido usar Three.js, Babylon, Pixi, Phaser, WebGL ou bibliotecas externas.
   - Proibido carregar imagens PNG/JPG no runtime do jogo (`new Image()`, `<img>` ou `drawImage(png)` durante o gameplay). Tudo (personagem, armas, correntes, cenário, efeitos) deve ser **desenhado diretamente por operações de Canvas 2D**.

2. **Esqueleto 3D Invisível com IK Analítica de 2 Ossos:**
   - O herói possui um modelo matemático tridimensional invisível (coordenadas locais $X, Y, Z$) projetado para a câmera isométrica 3/4.
   - Membros (braços e pernas) utilizam Cinemática Inversa (IK) analítica de 2 ossos via **Lei dos Cossenos**, com vetores polares para travar o plano de flexão anatômica de cotovelos e joelhos.
   - As mãos utilizam coordenadas cilíndricas ao redor do corpo para formar arcos de golpe naturais.

3. **Linguagem Visual — Estilo HQ (Cel-Shading):**
   - Formas com sombreamento celular nítido em **2 ou 3 tons** (base, sombra e realce).
   - Sombra gerada via máscara de recorte (`clip()`) com deslocamento da forma em direção à luz.
   - **Contorno de tinta escuro** definindo a silhueta externa de cada peça.
   - Sem gradientes borrados ou esferas plásticas genéricas.

4. **Performance Máxima — Cache em Offscreen Canvas:**
   - O chão da arena é desenhado **uma única vez** no carregamento em um `OffscreenCanvas`. Durante o jogo, é executado apenas um `drawImage` ultrarrápido desse canvas em memória.
   - Elementos estáticos repetidos (árvores, rochas, pilares) são desenhados uma vez em telas auxiliares individuais e carimbados na cena.
   - Apenas o personagem, as armas, o rastro do ataque e os efeitos de vento são atualizados a cada quadro no loop de animação.

5. **Controles e Jogabilidade:**
   - **W, A, S, D:** Movimentação relativa à tela no plano isométrico.
   - **Clique do Mouse:** Ataque na direção do cursor, com combo fluido de 3 golpes encadeados (1 → 2 → 3).
   - **Teclas de Depuração Integradas:**
     - **Tecla B:** Alterna visibilidade do esqueleto 3D, eixos, alvos de IK e vetores polares.
     - **Tecla T:** Ativa câmera lenta (25%) para auditar transições de pose e impactos.

---

## 2. Nossas Imagens de Referência Locais

Você possui imagens conceituais na pasta local `ref/` que devem servir como **guia artístico estrito de proporções, cores e silhueta** (a serem traduzidas em código no Canvas, nunca carregadas como imagem de jogo):

- **Rosto e Expressão:** `ref/hero-carequinha/head.png`
- **Design de Corpo, Proporções e Postura:** `ref/hero-carequinha/model-like-hades-2-5d.png` e pasta `ref/hero-carequinha/other/`
- **Estilo de Iluminação, Cores e Atmosfera:** Pasta `ref/hades1/`
- **Base de Conhecimento e Conversa do Rafa:** Pasta local `RafaxLab-YTB-do-zero/` (consulte caso precise verificar como Claude e Rafael resolveram a matemática de rig, interpolação de poses e shaders).

---

## 3. Identidade Visual do Herói e Armas

- **Identidade:** Assassino / Ladino guerreiro ágil, inspirado na estética de *Hades* (Zagreus) e intensidade de combate.
- **Cabeça e Rosto:** Cabeça expressiva com proporção estilizada, carequinha, sobrancelhas arqueadas e marcadas, olhar focado e determinado (seguindo `ref/hero-carequinha/head.png`).
- **Corpo:** Físico musculoso definido, peito e abdômen descobertos (sem camisa), faixa/lenço vermelho vibrante no pescoço/ombros com pontas drapejando, cinto largo com caveira frontal marcante, calças/faixas escuras.
- **Armas (Adagas Acorentadas):** Duas grandes adagas curvas agressivas com ponta afiada e recortes serrilhados, inspiradas nas *Lâminas do Caos* de God of War. Conectadas permanentemente aos braços por elos individuais de correntes de ferro escuro enroladas nos pulsos e antebraços.
- **Empunhadura Real das Mãos:** As mãos devem realmente segurar o cabo das adagas (dedos fechados e polegar travando a empunhadura, sem arma flutuando).

---

## 4. Arquitetura Modular do Código

Crie os arquivos diretamente na raiz do projeto seguindo esta separação de responsabilidades:

```
├── index.html          # Canvas principal do jogo, canvas de HUD/retrato, CSS e interface
├── turnaround.html     # Visualizador procedural de inspeção do herói em 8 ângulos e poses
├── face.html           # Bancada de teste de fidelidade do rosto em alta resolução
├── .claude/
│   └── serve.py        # Servidor local Python com cabeçalho 'Cache-Control: no-store' (porta 5317)
└── js/
    ├── core.js         # Projeção isométrica 3/4 (yaw 45°, pitch 34°), matemática vetorial e ruído
    ├── ink.js          # Paleta de cores, celFill com deslocamento, cascos convexos e contornos HQ
    ├── rig.js          # Esqueleto 3D invisível, IK analítica de 2 ossos, alvos e poses de animação
    ├── head.js         # Mini-modelo 3D da cabeça, projetando olhos, sobrancelhas e traços faciais
    ├── hero.js         # Montagem do corpo, músculos, lenço vermelho, caveira e adagas sobre o rig
    ├── world.js        # Terreno cacheado em offscreen, vegetação em sprites e simulação de vento
    ├── fx.js           # Rastro de adaga em arco, faíscas de impacto, ondas de choque e poeira
    └── main.js         # Loop principal (requestAnimationFrame), entrada WASD, combo e HUD
```

---

## 5. Roteiro de Execução em 4 Fases

Siga rigorosamente esta ordem para garantir qualidade artística e funcionalidade:

### FASE 1 — O Frame Estático do Herói (Validação Visual)
- Crie `index.html`, `js/core.js`, `js/ink.js`, `js/head.js` e `js/hero.js`.
- Renderize o herói em pose estática na perspectiva 3/4 em Canvas 2D puro.
- Valide o visual: cabeção carequinha, peito musculoso descoberto, lenço vermelho, cinto com caveira e adagas acorrentadas.

### FASE 2 — O Rig 3D e Locomoção (IK e Poses)
- Crie `js/rig.js`. Implemente o esqueleto matemático 3D e a IK analítica de 2 ossos para braços e pernas.
- Desenvolva as poses-chave:
  - **Idle:** Respiração sutil e movimentação orgânica das pontas do lenço.
  - **Walk / Run:** Passada de corrida coordenada com movimentação WASD, sem os pés deslizarem.
- Crie `turnaround.html` para auditar o personagem em 8 direções.

### FASE 3 — O Combate e a Arena Isométrica
- Crie `js/world.js`: desenhe a arena de combate com terreno cacheado em `OffscreenCanvas`, vegetação e vento dinâmico.
- Crie `js/fx.js`: adicione os efeitos de rastro em arco das adagas e impactos de golpe.
- Crie `js/main.js`: integre o combo de 3 ataques no clique do mouse:
  - *Golpe 1:* Corte rápido horizontal com adaga direita.
  - *Golpe 2:* Corte cruzado ascendente com adaga esquerda.
  - *Golpe 3:* Golpe duplo descendente pesado, gerando impacto e onda de choque no vento.

### FASE 4 — Validação Visual Headless e Refinamento
- Inicie o servidor local sem cache (`python .claude/serve.py 5317`).
- Utilize automação de navegador (modo headless) para capturar screenshots reais do jogo rodando.
- Inspecione e corrija:
  - Ordenação Z-Order e oclusão (adagas e correntes na frente/atrás do corpo).
  - Proporções anatômicas durante os ataques.
  - Contraste e nitidez do estilo HQ contra o cenário.
