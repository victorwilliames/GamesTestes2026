# 03 — Aprendizados e Princípios do Método RafaxLab

Este documento consolida os aprendizados práticos e teóricos extraídos da análise das fontes primárias de Rafael (canal RafaxLab e sessão Claude Code).

---

## 1. O Mito do "Prompt Único" Foi Desmistificado

A maior lição do experimento do RafaxLab é que **jogos procedurais de qualidade não nascem de um prompt único milagroso**.

Na auditoria real registrada em tela (20:25 do Tech Bite #002), a entrega bem-sucedida do piloto exigiu:
- **7 mensagens humanas de direcionamento.**
- **55 respostas estruturadas da IA.**
- **594 ações de terminal, escrita, edição e testes.**
- **170 capturas de imagem e screenshots.**
- **6 relatórios formais de agentes críticos.**

A IA atua como uma equipe de engenharia e arte em altíssima velocidade, mas necessita de:
1. Contratos arquiteturais rígidos.
2. Critérios de aceitação explícitos.
3. Ciclos iterativos de inspeção visual e correção de desvios.

---

## 2. A Separação Sagrada: Rig Matemático vs. Painter Artístico

Um dos erros mais comuns em tentativas de jogos procedurais em Canvas é misturar o cálculo de onde o braço está com o desenho dos pixels.

No método de Rafael:
- **O Rig (`rig.js`) é agnóstico em relação à arte:** Ele só conhece números, ângulos, pivôs, distâncias de ossos e matrizes de rotação no espaço 3D.
- **O Painter (`ink.js`, `knight.js`, `head.js`) é agnóstico em relação à cinemática:** Ele recebe as coordenadas projetadas dos nós do rig e aplica contornos pretos de tinta, recortes celulares de luz e cores chapadas.

*Por que isso é vital?*  
Se você quiser mudar o estilo visual de "armadura medieval" para "roupas de tecido", você altera apenas o painter, sem quebrar nenhuma animação de corrida ou combo de ataque.

---

## 3. O Papel das Imagens de Referência: Guias de Criação, Não Assets de Runtime

Existe uma distinção crucial entre:
- **Usar imagens no motor do jogo:** Carregar PNGs pesados com `<img>` ou `new Image()`, o que tornaria o projeto dependente de assets gráficos externos e suscetível a problemas de resolução.
- **Usar imagens como guia de engenharia:** Fornecer uma imagem de conceito à IA durante a fase de desenvolvimento para que ela extraia proporções, cores, silhuetas e coordenadas geométricas.

No piloto de Rafael, a restrição foi mantida: **zero imagens no runtime do jogo**. A IA utilizou a referência externa apenas para parametrizar o mini-modelo 3D do rosto e a paleta de cores.

---

## 4. Oclusão e Ordenação de Profundidade Importam Tanto Quanto a Cinemática

Um modelo com IK perfeita ainda parecerá amador se as partes do corpo forem desenhadas na ordem errada.

No piloto, o Claude Code precisou de múltiplos ajustes finos de **depth sorting**:
- A capa deve passar por trás do tronco quando o herói corre para o Norte, mas drapejar pelos ombros quando ele corre para o Sul.
- A espada deve estar à frente do corpo durante o golpe e recolhida atrás do tronco na pose de antecipação.
- O herói não pode transpassar objetos do cenário ou a figura do oponente ao avançar em um golpe de investida.

---

## 5. Testes Reais em Navegador São Insubstituíveis

Scripts de terminal que apenas verificam sintaxe (`syntax check OK`) não garantem qualidade visual ou gameplay funcional.

No método do RafaxLab:
1. O servidor local roda com desativação total de cache HTTP (`Cache-Control: no-store`).
2. Um navegador headless (Playwright) abre a URL real `http://localhost:5317`.
3. Tiram-se capturas da tela em dimensões nativas (1280 × 720).
4. As imagens são inspecionadas por uma IA crítica antes de declarar a tarefa como concluída.

---

## 6. A Estratégia do Refinamento Cirúrgico por Componente

Quando uma parte do projeto não atingir a fidelidade desejada:
- **Não refaça o projeto inteiro.**
- **Não altere o que já foi aprovado.**

Quando Rafael percebeu que o rosto estava genérico, ele não mexeu na movimentação WASD, nem no terreno, nem no timing da espada. Ele isolou a tarefa:
1. Criou uma ferramenta de bancada (`face.html`).
2. Focou exclusivamente na vista frontal (Sul).
3. Decompôs o problema em marcos específicos: mandíbula, formato dos olhos, contorno das orelhas, laterais raspadas e mechas do moicano.
4. Ajustou milímetro a milímetro até a aprovação visual.
