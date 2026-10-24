# Prompt 01 — O Prompt Mestre do Piloto (Mensagem 1 de Rafa)

Este é o **prompt original e exato** enviado por Rafael ao Claude Code no início do projeto (Fase 1), extraído diretamente da conversa primária arquivada.

---

## O Prompt na Íntegra (Texto Original de Rafael)

```text
Crie um piloto de RPG isométrico (câmera 3/4) para rodar no navegador, usando Canvas 2D. O piloto é só um pequeno campo aberto com um cavaleiro que dá um combo de espada de 3 golpes, no estilo de Hades (https://store.steampowered.com/app/1145360/Hades/).

- Sem WebGL, sem engine e sem imagens: tudo é desenhado por código.
- O personagem é um esqueleto 3D invisível, com IK de 2 ossos em braços e pernas, que é pintado em 2D e dá os movimentos ao personagem.
- Animações como poses-chave, com antecipação, golpe e recuperação.
- Estilo HQ: formas chapadas com 2 ou 3 tons e contorno de tinta escuro.
- Árvores, arbustos e pedras são pintados por código no mesmo estilo HQ, pintados uma vez num canvas fora da tela e reaproveitados. Só o balanço do vento é animado.
- O chão é pintado uma vez num canvas fora da tela. Só o personagem, o rastro da espada e o vento são redesenhados a cada quadro.
- WASD para andar e clique para atacar.

Faça o personagem em uma armadura e use a referencia anexa como rosto do personagem. Você tem o gemini com nano banana para usar caso precise criar referencias.

Antes de entregar, use um agente crítico para avaliar o resultado artistico e geral: abra no navegador, tire screenshots e corrija o que aparecer.
```

---

## Desconstrução das Diretrizes e Por Que Funcionou

1. **Escopo Delimitado:**
   - Não pediu um jogo inteiro nem uma MMO. Pediu um **piloto mínimo**: um pequeno platô aberto com um cavaleiro e um combo de 3 golpes.

2. **Restrições Técnicas Rígidas:**
   - **Canvas 2D puro:** Sem Three.js, Babylon, Pixi ou Phaser.
   - **Zero Imagens no Runtime:** Proibido carregar PNGs/JPGs como texturas de jogo. Tudo desenhado por código (Path2D, arcos, cascos convexos, gradientes chapados).

3. **Arquitetura Anatômica (Rig 3D + IK de 2 Ossos):**
   - O personagem não é um sprite desenhado à mão para 8 direções (o que causaria inconsistência visual entre ângulos).
   - Ele possui um **esqueleto matemático tridimensional invisível**. Os braços e as pernas usam Cinemática Inversa (IK analítica baseada na lei dos cossenos com vetor polar), garantindo articulações sem deformação bizarra.

4. **Curvas de Animação e Poses-Chave:**
   - Estrutura clássica de animação de ação: **Antecipação → Golpe (Impacto) → Continuação/Recuperação**, cada fase com curvas de interpolação distintas (easing/Catmull-Rom).

5. **Linguagem Visual — Estilo HQ (Cel-Shading):**
   - Cores chapadas em **2 ou 3 tons** (base, sombra e realce).
   - **Contorno de tinta escuro** delimitando a silhueta.
   - Sombra celular obtida matematicamente através de máscara de recorte com deslocamento em direção à fonte de luz.

6. **Regra de Performance — Cache Offscreen:**
   - O chão é desenhado **uma única vez** em um `OffscreenCanvas` (ou canvas oculto na memória). A cada frame, o jogo só faz um `drawImage` rápido.
   - Elementos estáticos repetidos (árvores, pedras, ruínas) são gerados em mini-telas offscreen e carimbados na cena (podendo ser espelhados horizontalmente para variedade).
   - Apenas o que é dinâmico (herói, rastro da espada, vento/folhas) é redesenhado no loop de 60+ FPS.

7. **Bancada de Crítica Visual Automatizada:**
   - O prompt não aceitou um simples "código compilou sem erros".
   - Mandou a IA instanciar um **agente crítico independente**, subir o servidor local, abrir o navegador headless, capturar screenshots reais em alta resolução, analisar visualmente os defeitos e aplicar correções antes de entregar.
