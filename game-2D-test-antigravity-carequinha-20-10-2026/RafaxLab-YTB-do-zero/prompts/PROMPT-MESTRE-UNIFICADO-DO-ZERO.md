# PROMPT MESTRE DE EXECUÇÃO — PROJETO DO ZERO (MÉTODO RAFAXLAB + CLAUDE)

> **Instrução para a IA:** Você é o engenheiro e artista líder deste projeto. Sua missão é criar do zero absoluto um herói procedural 2D (visão fake 2.5D isométrica) em HTML5 Canvas puro, com rig 3D invisível, IK, animação por poses-chave, estilo HQ pintado por código e arena jogável, reproduzindo rigorosamente a engenharia comprovada de **Rafael (RafaxLab)**.

---

## 1. Diretrizes Absolutas e Inegociáveis

1. **100% Canvas 2D Puro:**
   - Proibido usar Three.js, Babylon, Pixi, Phaser ou WebGL.
   - Proibido carregar imagens PNG/JPG no runtime do jogo (`new Image()`, `<img>` ou `drawImage(png)` durante o gameplay). Tudo (personagem, armas, cenário, efeitos) deve ser **desenhado diretamente por código**.

2. **Esqueleto 3D Invisível com IK Analítica de 2 Ossos:**
   - O herói possui um modelo matemático tridimensional invisível (coordenadas locais $X, Y, Z$) projetado para a tela isométrica (câmera 3/4).
   - Membros (braços e pernas) utilizam Cinemática Inversa (IK) analítica de 2 ossos via **Lei dos Cossenos**, com vetores polares para definir o plano de flexão anatômica de cotovelos e joelhos.
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
   - **Teclas de Depuração:**
     - **B:** Alterna visibilidade do esqueleto 3D, eixos, alvos de IK e vetores polares.
     - **T:** Ativa câmera lenta (25%) para auditar transições de pose e impactos.

---

## 2. Nossas Imagens de Referência Locais

Você possui imagens conceituais na pasta local `ref/` que devem servir como **guia artístico estrito de proporções, cores e silhueta** (a serem traduzidas em código no Canvas, nunca carregadas como imagem de jogo):

- **Rosto e Expressão:** `ref/hero-carequinha/head.png`
- **Design de Corpo e Proporções:** `ref/hero-carequinha/model-like-hades-2-5d.png` e pasta `ref/hero-carequinha/other/`
- **Estilo de Iluminação e Atmosfera:** Pasta `ref/hades1/`

---

## 3. Arquitetura Modular Obrigatória

Não crie um arquivo monolítico gigante. Organize o projeto nos seguintes módulos especializados:

```
├── index.html          # Canvas principal, canvas de HUD/retrato, interface e controles
├── turnaround.html     # Visualizador procedural de inspeção do herói em 8 ângulos e poses
├── face.html           # Bancada de teste de fidelidade do rosto em alta resolução
├── .claude/
│   └── serve.py        # Servidor local Python com cabeçalho 'Cache-Control: no-store'
└── js/
    ├── core.js         # Projeção isométrica 3/4 (yaw 45°, pitch 34°), matemática vetorial e ruído
    ├── ink.js          # Paleta de cores, celFill com deslocamento, cascos convexos e pincéis HQ
    ├── rig.js          # Esqueleto 3D invisível, IK analítica de 2 ossos, alvos e poses de animação
    ├── head.js         # Mini-modelo 3D da cabeça, projetando olhos, sobrancelhas e traços faciais
    ├── hero.js         # Montagem do corpo, músculos, trajes e armas sobre o rig
    ├── world.js        # Terreno cacheado em offscreen, vegetação em sprites e simulação de vento
    ├── fx.js           # Rastro de arma em arco, poeira de impacto, ondas de choque e onomatopeias
    └── main.js         # Loop principal (requestAnimationFrame), entrada WASD, combo e HUD
```

---

## 4. O Ciclo de Crítica Visual Automatizado (Antes da Entrega)

Não considere o projeto concluído apenas porque o código executa sem erros de console.

1. Inicie o servidor local sem cache (`python .claude/serve.py 5317`).
2. Utilize automação de navegador (modo headless) para navegar até `http://localhost:5317`.
3. Capture screenshots reais da arena, do herói parado, correndo nas 4 direções e executando o combo.
4. Execute uma análise crítica rigorosa das capturas:
   - A silhueta e as proporções estão fiéis às referências de `ref/hero-carequinha/`?
   - As articulações de braços e pernas dobram de forma anatômica sem esticar ou quebrar?
   - Há algum erro de oclusão (peças ou armas atravessando o corpo incorretamente)?
   - O chão estático está limpo e com alto contraste?
5. Corrija imediatamente qualquer defeito visual encontrado nos arquivos JS antes da validação final do usuário.
