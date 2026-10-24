# Prompt 02 — O Refinamento Cirúrgico do Rosto (Fase 2 de Rafa)

Este documento registra a segunda fase crítica do processo de Rafael. Ao testar o primeiro piloto, o criador constatou que o corpo e o combate funcionavam, mas o rosto estava genérico e distante da imagem de referência original.

Em vez de recomeçar o jogo do zero ou tentar refinar o corpo inteiro ao mesmo tempo, Rafael aplicou uma técnica cirúrgica: **congelou o resto e focou 100% no rosto na posição Sul (frontal/câmera)**.

---

## O Prompt na Íntegra (Texto Original de Rafael)

```text
O rosto do personagem não está nada parecido com a imagem de referencia que eu mandei. Eu quero que você trabalhe para melhorar os detalhes do rosto do personagem para que chegue o mais próximo da imagem de referencia. Vamos começar apenas pela posição sul. Analise quadro a quadro os detalhes, posições dos olhos, boca, nariz, cabelos, etc. Coloque um critico para analisar o resultado e só me entregue quando a qualidade estiver próxima ao da imagem de referencia em níveis de detalhe.
```

---

## Os Ajustes Rápidos Adicionais Enviados por Rafael

Durante a execução da Fase 2, Rafael enviou instruções pontuais de correção:

### Mensagem 3: Perspectiva
```text
Não esqueça da posição da camera
```

### Mensagem 4: Execução Silenciosa (Headless)
```text
use o navegador em modo silence sem precisar abrir a janela no meu computador
```
*(Evita abrir janelas do Chrome piscando na tela do desenvolvedor; roda via Playwright/Puppeteer em modo headless).*

### Mensagem 5: Direção do Olhar (Heading)
```text
O personagem tem que olhar para frente e não para camera
```
*(Em câmera isométrica 3/4, olhar "para frente" significa apontar na direção do corpo no espaço 3D, e não fixar os olhos perpendicularmente na tela como se olhasse para a lente da câmera).*

---

## Como o Claude Executou Esse Refinamento

1. **Ferramentas de Comparação Dedicadas:**
   - Criou páginas HTML dedicadas fora do jogo principal:
     - `face.html`: Comparador lado a lado em alta resolução (referência vs modelo renderizado em Canvas 2D).
     - `face_trace.html`: Visualizador de traçado vetorial em camadas de cor.
     - `tools/trace_face.py`: Script offline em Python para vetorizar a referência em curvas e polígonos com coordenadas exatas.

2. **Decomposição em Marcos Anatômicos (Landmarks):**
   - Não tratou o rosto como uma textura ou círculo.
   - Decompôs em subsistemas parametrizados:
     - **Contorno & Mandíbula:** Linha superelíptica marcada, queixo largo.
     - **Laterais Raspadas (Buzzcut):** Gradiente de micropontos/densidade tonal nas têmporas.
     - **Moicano (Hair Spikes):** Mechas pontiagudas estilizadas com volume e tons de sombra.
     - **Olhos:** Formato amendoado, íris azuis, sobrancelhas expressivas e arqueadas.
     - **Nariz & Narinas:** Formas angulares de sombra sem desenhar linhas desnecessárias.
     - **Boca & Barba:** Linha labial com sombreamento de queixo e textura de barba rala (stubble).

3. **Ciclo de 4 Rodadas com Agente Crítico:**
   - A cada rodada, o Claude renderizava o rosto em ângulos 0°, ±8°, ±15° e ±30°, gerava screenshots e passava para o agente crítico.
   - O crítico apontava divergências (ex.: mandíbula fina demais, orelha alta demais, falta de contraste nos olhos).
   - O Claude só concluiu a tarefa quando o crítico confirmou conformidade visual com a referência.
