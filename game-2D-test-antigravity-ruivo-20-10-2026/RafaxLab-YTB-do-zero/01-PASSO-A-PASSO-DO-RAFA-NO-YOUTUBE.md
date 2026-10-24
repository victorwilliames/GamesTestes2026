# 01 — O Passo a Passo Exato do Rafa no YouTube

Este documento é o manual definitivo de engenharia reversa do método apresentado por Rafael no canal **RafaxLab** (vídeo [Tech Bite #002](https://www.youtube.com/watch?v=Vi8wJKNYRp8)).

Ele descreve em ordem cronológica e técnica exatamente como o projeto foi planejado, instruído, construído, corrigido e validado.

---

## Índice do Roteiro

1. [Etapa 0 — Preparação do Ambiente e Servidor Sem Cache](#etapa-0--preparação-do-ambiente-e-servidor-sem-cache)
2. [Etapa 1 — O Prompt Mestre e a Decomposição Modular](#etapa-1--o-prompt-mestre-e-a-decomposição-modular)
3. [Etapa 2 — A Engenharia do Rig 3D e IK de 2 Ossos](#etapa-2--a-engenharia-do-rig-3d-e-ik-de-2-ossos)
4. [Etapa 3 — O Painter HQ em Canvas 2D (Sem Imagens)](#etapa-3--o-painter-hq-em-canvas-2d-sem-imagens)
5. [Etapa 4 — Performance Máxima por Cache Offscreen](#etapa-4--performance-máxima-por-cache-offscreen)
6. [Etapa 5 — O Ciclo de Crítica Visual com Screenshots Headless](#etapa-5--o-ciclo-de-crítica-visual-com-screenshots-headless)
7. [Etapa 6 — O Refinamento Cirúrgico do Rosto Sul](#etapa-6--o-refinamento-cirúrgico-do-rosto-sul)
8. [Etapa 7 — Validação no Navegador e Ferramentas de Debug](#etapa-7--validação-no-navegador-e-ferramentas-de-debug)

---

## Etapa 0 — Preparação do Ambiente e Servidor Sem Cache

### 1. O Problema Original
Rafael já havia tentado criar spritesheets tradicionais com IA para 8 direções. Os problemas clássicos que o fizeram abandonar sprites foram:
- Inconsistência de detalhes: a espada e o traje mudavam a cada frame ou direção.
- Rastros de ataque queimados nos pixels dos sprites.
- Proporções anatômicas instáveis durante a animação.

### 2. O Ambiente
Rafael utilizou o **Claude Code CLI** rodando diretamente em um terminal local (macOS/Linux ou Windows), dentro de uma pasta dedicada (`demo_youtube`).

### 3. A Regra do Servidor Sem Cache (Crítico!)
Durante o desenvolvimento no navegador, os navegadores costumam cachear arquivos JavaScript agressivamente. Para evitar que a IA inspecionasse código desatualizado, foi criado um script Python dedicado:

```python
# .claude/serve.py
import http.server
import sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 5317
http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCache).serve_forever()
```

---

## Etapa 1 — O Prompt Mestre e a Decomposição Modular

Rafael iniciou o projeto com um **único prompt de escopo delimitado** ([Prompt 01](prompts/01-PROMPT-MESTRE-PILOTO.md)).

Em vez de gerar um arquivo gigante e monolítico, a IA imediatamente estabeleceu contratos claros e distribuiu a arquitetura em **10 arquivos especializados**:

| Arquivo | Responsabilidade Única |
|---|---|
| `js/core.js` | Matemática vetorial, ruído com semente, projeção isométrica 3/4 e iluminação. |
| `js/ink.js` | Estilo HQ: paleta de cores, cel-shading em 2-3 tons, contornos escuros e cascos convexos. |
| `js/rig.js` | Esqueleto 3D invisível, cinemática direta, IK analítica de 2 ossos e poses de animação. |
| `js/head.js` | Mini-modelo 3D da cabeça, projetando traços faciais apenas quando visíveis à câmera. |
| `js/knight.js` | Montagem da armadura sobre o rig, espada, bainha e capa de tecido (mola Verlet). |
| `js/world.js` | Terreno do platô gerado uma vez em offscreen, árvores/rochas em sprites e vento dinâmico. |
| `js/fx.js` | Efeitos de combate: rastro em arco da lâmina, impacto no chão, partículas e onomatopeias. |
| `js/main.js` | Loop principal (`requestAnimationFrame`), entrada de teclado WASD, combo e HUD. |
| `index.html` | Estrutura da página com canvases, HUD de retrato e textos estilizados. |
| `turnaround.html` | Visualizador de inspeção procedural em 8 ângulos simultâneos. |

---

## Etapa 2 — A Engenharia do Rig 3D e IK de 2 Ossos

Esta é a virada técnica fundamental do método: **o personagem é um modelo 3D em coordenadas matemáticas invisíveis, mas desenhado em Canvas 2D puro**.

```
    [Cabeça] (pivô pescoço)
        │
    [Tórax] (chest)
    ┌───┴───┐
 [OmbroE] [OmbroD]
    │       │
  (IK)    (IK) ──> [Espada] (arma presa no espaço local da mão)
    │       │
 [MãoE]   [MãoD]
```

1. **Cinemática Inversa (IK) Analítica de 2 Ossos:**
   - Para braços (ombro → cotovelo → mão) e pernas (quadril → joelho → pé).
   - Usa a **Lei dos Cossenos** para encontrar a flexão exata da articulação intermediária sem iterações lentas.
   - Um **vetor polar** define a direção para onde os cotovelos e joelhos apontam (evitando que dobrem ao contrário).

2. **Coordenadas Cilíndricas nas Mãos:**
   - Em vez de animar coordenadas cartesianas $(x, y, z)$, os alvos das mãos durante ataques usam coordenadas cilíndricas ao redor do tronco: **ângulo $(\theta)$, raio $(r)$ e altura $(z)$**.
   - Interpolar o ângulo gera automaticamente **arcos circulares perfeitos** de golpe, sem que a mão desacelere ou penetre o corpo.

3. **Golpe Bimanual (Combo 3):**
   - No 3º golpe do combo (o impacto pesado), a mão esquerda vira alvo de IK travado diretamente no cabo da espada que a mão direita está empunhando.

4. **Curvas de Animação das Poses-Chave:**
   - Cada golpe é dividido em 4 etapas: **Antecipação → Golpe (Ataque) → Continuação (Follow-through) → Recuperação**.
   - Cada etapa possui curvas de aceleração/desaceleração próprias (easing).

---

## Etapa 3 — O Painter HQ em Canvas 2D (Sem Imagens)

Para criar o visual de HQ no estilo de *Hades* sem usar texturas PNG:

1. **Cel-Shading Procedural via Deslocamento:**
   - A forma do membro ou armadura é desenhada no Canvas.
   - Para criar a sombra celular sem gradiente borrado: a IA desenha uma segunda forma idêntica levemente **deslocada na direção da luz** dentro de uma máscara de recorte (`clip()`). O resultado são sombras nítidas de 2 a 3 tons.

2. **Silhueta de Contorno Escuro:**
   - Antes de pintar o interior de cada peça, o contorno externo é traçado com linhas pretas/grafite espessas (`--ink`), dando legibilidade gráfica instantânea.

3. **Capa com Física Verlet:**
   - A capa é uma malha de $5 \times 4$ nós simulada por integração de Verlet.
   - Sofre ação da gravidade, do vento e tem restrições de colisão com as costas do herói para não atravessar o corpo.

---

## Etapa 4 — Performance Máxima por Cache Offscreen

O segredo para o jogo rodar com extrema leveza no navegador:

1. **Camada Estática Pré-Pintada:**
   - O chão de pedra e grama (com manchas orgânicas geradas por *marching squares* sobre ruído Perlin/Simplex) é pintado **uma única vez** no carregamento em uma tela invisível (`OffscreenCanvas`).
   - Rochas, árvores, pilares e ruínas são desenhados em mini-telas offscreen individuais e reaproveitados (carimbados na cena com `drawImage()`). Para dar variedade, as árvores podem ser espelhadas horizontalmente.

2. **Camada Dinâmica Mínima:**
   - A cada frame do loop de 60 FPS, o Canvas principal apenas faz:
     1. Limpeza rápida.
     2. `drawImage(chaoCanvas, 0, 0)`.
     3. Desenho dos sprites de árvores com leve inclinação de vento.
     4. Desenho do herói na pose atual calculada pela IK.
     5. Desenho do rastro da espada e efeitos dinâmicos.

---

## Etapa 5 — O Ciclo de Crítica Visual com Screenshots Headless

Durante a execução da Fase 1, o Claude Code não apenas programou; ele abriu o navegador em segundo plano (modo headless) e tirou capturas reais da tela.

### O Papel do Agente Crítico:
Um subagente foi instanciado com o papel explícito de **Crítico de Arte e Game Design**. O crítico avaliou:
- **Sobreposição Z-Order:** A capa estava clipando através da armadura?
- **Silhueta:** O herói ficava legível contra o fundo da grama e do abismo?
- **Contraste:** A touca/cabelo estava clara demais, parecendo calvície?
- **Profundidade:** O cavaleiro invadia o espaço de outros objetos?

A IA corrigiu o depth sorting, aumentou o contraste do piso e limitou a altura da capa antes de entregar o primeiro protótipo a Rafael.

---

## Etapa 6 — O Refinamento Cirúrgico do Rosto Sul

Quando Rafael recebeu o primeiro piloto funcional, o combate e o cenário estavam prontos, mas o rosto do herói estava genérico.

Em vez de mudar o jogo todo, Rafael aplicou a técnica que salvou a qualidade artística:

1. **Foco Estrito na Posição Sul:**
   - Pediu para trabalhar apenas na vista frontal (olhando para a câmera do jogo).
2. **Criação da Ferramenta de Bancada (`face.html` e `face_trace.html`):**
   - Criou páginas de teste onde a imagem de referência de rosto ficava ao lado do rosto renderizado por código.
3. **Decomposição em Marcos Anatômicos:**
   - Cabelo moicano estilizado em mechas angulares.
   - Laterais raspadas com micropontos de densidade.
   - Olhos azuis amendoado com sobrancelhas expressivas.
   - Mandíbula e maxilar superelípticos marcados.
4. **Iterações com Crítico:**
   - 4 rodadas consecutivas de screenshots com ajustes de milímetros até alcançar conformidade com a referência.

---

## Etapa 7 — Validação no Navegador e Ferramentas de Debug

O piloto pronto possui controles integrados para auditar todo o sistema:

| Tecla / Comando | Função |
|---|---|
| **W, A, S, D** | Movimentação do herói relativa à tela. |
| **Clique do Mouse** | Ataca na direção do cursor. Clicar repetidamente durante o golpe encadeia o combo de 3 golpes (1 → 2 → 3). |
| **Tecla B** | **Modo Esqueleto:** Torna visível o esqueleto 3D, os eixos das articulações, os alvos de IK e os vetores polares! |
| **Tecla T** | **Câmera Lenta (25%):** Permite ver cada pose-chave, o easing do golpe e a deformação da capa quadro a quadro! |
| `turnaround.html` | Abre uma prancha com o cavaleiro renderizado em 8 orientações simultâneas. |
