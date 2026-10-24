# 02 — Arquitetura e Engenharia do Piloto Procedural

Este documento detalha os fundamentos matemáticos, algoritmos e a engenharia de software empregados na construção do piloto de RPG procedural do RafaxLab.

---

## 1. Sistema de Coordenadas e Câmera Isométrica

### Espaço de Mundo (3D)
- **Eixo X:** Eixo horizontal no plano do chão.
- **Eixo Y:** Eixo de profundidade no plano do chão.
- **Eixo Z:** Eixo vertical (aponta para cima, contra a gravidade).

### Projeção Isométrica 3/4 (`js/core.js`)
A câmera converte qualquer ponto 3D $(x, y, z)$ do mundo para coordenadas 2D $(sx, sy)$ da tela utilizando uma projeção ortográfica com:
- **Yaw (Rotação horizontal):** $45^\circ$ ($\pi / 4$ radianos).
- **Pitch (Inclinação vertical):** $34^\circ$ a $35.26^\circ$ ($\arctan(1/\sqrt{2})$).

As equações de projeção canônicas:
$$sx = (x - y) \cdot \cos(45^\circ) \cdot \text{zoom} + \text{offX}$$
$$sy = \left((x + y) \cdot \sin(45^\circ) \cdot \sin(\text{pitch}) - z \cdot \cos(\text{pitch})\right) \cdot \text{zoom} + \text{offY}$$

A profundidade (para ordenação Z-sort):
$$\text{depth} = (x + y) \cdot \sin(45^\circ) \cdot \cos(\text{pitch}) + z \cdot \sin(\text{pitch})$$

---

## 2. Esqueleto 3D Invisível e Cinemática Inversa (`js/rig.js`)

O herói não é deformado como uma malha poligonal 3D pesada; ele possui uma hierarquia de coordenadas e caixas delimitadoras.

### Hierarquia Anatômica:
```
           [Pé E]            [Pé D]
             ▲                 ▲
        (IK Perna)        (IK Perna)
             │                 │
           [Joelho E]       [Joelho D]
             │                 │
             └─── [Quadril] ───┘
                     │
                  [Tronco] (inclinação pitch/yaw/roll)
                     │
                 [Pescoço]
                     │
                  [Cabeça] (orientação e olhar)
             ┌───────┴───────┐
         [Ombro E]       [Ombro D]
             │               │
         (IK Braço)      (IK Braço)
             │               │
        [Cotovelo E]    [Cotovelo D]
             │               │
          [Mão E]         [Mão D] ──> [Espada]
```

### Cinemática Inversa (IK) Analítica de 2 Ossos:
Para calcular a posição do cotovelo ou joelho quando a mão ou o pé precisa alcançar uma posição alvo $T$ a partir da base $B$:

1. Comprimento do membro superior: $L_1$ (braço/coxa).
2. Comprimento do membro inferior: $L_2$ (antebraço/panturrilha).
3. Distância do ombro ao alvo: $D = \|T - B\|$. Se $D > L_1 + L_2$, estica totalmente ($D = L_1 + L_2$).
4. Pela **Lei dos Cossenos**, o ângulo interno na articulação intermediária $\alpha$:
   $$\cos(\alpha) = \frac{L_1^2 + L_2^2 - D^2}{2 \cdot L_1 \cdot L_2}$$
5. Para evitar ambiguidade (o cotovelo poderia dobrar para dentro ou para fora), utiliza-se um **Vetor Polar (Pole Vector)** que define o plano de flexão anatômica.

### Coordenadas Cilíndricas Para Arcos de Espada:
Em ataques corpo-a-corpo, trajetórias em linha reta $(x,y,z)$ causam deformações artificiais. O piloto define os alvos da mão direita usando coordenadas cilíndricas ao redor do tórax:
- **Ângulo $(\theta)$:** O arco do golpe (ex.: de $-120^\circ$ a $+80^\circ$).
- **Raio $(r)$:** O alcance do braço esticado com a arma.
- **Altura $(z)$:** A elevação da lâmina (descendente, horizontal ou ascendente).

---

## 3. Pincéis HQ e Cel-Shading em Canvas 2D (`js/ink.js`)

O estilo visual é inspirado nos traços de tinta de graphic novels e na estética de *Hades*:

1. **Cascos Convexos (Convex Hulls):**
   - Para placas de armadura (peitoral, ombreiras, manoplas), a IA projeta múltiplos pontos 3D da peça na tela 2D e calcula o invólucro convexo dos pontos projetados via algoritmo de Graham Scan / Monotone Chain.
   - Isso garante uma silhueta angular limpa que se adapta organicamente a qualquer rotação do corpo.

2. **Cel-Shading via Máscara de Deslocamento:**
   - Para sombrear qualquer forma poligonal em 2 tons sem gradientes plásticos:
     1. Preenche a forma com a cor de sombra (`PAL.shadow`).
     2. Salva o contexto (`ctx.save()`) e cria uma região de recorte com a forma original (`ctx.clip()`).
     3. Desenha a mesma forma novamente com a cor base (`PAL.base`), deslocada alguns pixels na direção da fonte de luz:
        $$\Delta x = -\text{lightX} \cdot \text{offset},\quad \Delta y = -\text{lightY} \cdot \text{offset}$$
     4. Restaura o contexto (`ctx.restore()`).
     5. Aplica o traço de contorno preto grosso na borda externa.

3. **Física da Capa (Integração de Verlet):**
   - Grade de nós $5 \times 4$ conectados por molas de distância fixa.
   - Atualização por Verlet a cada quadro:
     $$p_{t+1} = p_t + (p_t - p_{t-1}) \cdot \text{fricção} + \text{vento} + \text{gravidade}$$
   - Restrição rígida de distância para que o tecido não estique.
   - Colisão esferoidal com o tórax para a capa sempre drapejar por fora da armadura.

---

## 4. Otimização de Performance e Cache Offscreen (`js/world.js`)

Para manter mais de 60 FPS estáveis mesmo com dezenas de elementos em cena:

1. **Geração do Terreno no Carregamento:**
   - O platô flutuante é composto por um terreno rochoso com grama e caminhos de pedra.
   - A distribuição da grama sobre a rocha usa ruído determinístico Simplex/Perlin com o algoritmo de **Marching Squares**, criando contornos orgânicos e bordas recortadas estilizadas.
   - Esse cenário inteiro é desenhado em um canvas em memória (`OffscreenCanvas`) com resolução idêntica à do mundo e armazenado.

2. **Sprites Vegetais Reutilizáveis:**
   - Árvores de carvalho, arbustos e tufos de grama são desenhados apenas uma vez em telas auxiliares individuais.
   - Ao desenhar a floresta, o motor reutiliza os mesmos sprites com escalas variadas e espelhamento horizontal (`ctx.scale(-1, 1)`), economizando milhares de operações de desenho por quadro.

3. **Campo Dinâmico de Vento:**
   - O vento não redesenha as árvores; ele simplesmente aplica rotação na copa em torno do pivô do tronco e inclinação angular (`shear`) na grama através de osciladores harmônicos amortecidos.
   - Quando o cavaleiro desfere o terceiro golpe, ele injeta uma onda de choque no campo de vento, fazendo a folhagem ao redor oscilar realisticamente com o impacto.

---

## 5. Máquina de Estados do Combate (`js/main.js`)

O sistema de combate gerencia a transição de poses e tempos de recuperação:

```
[IDLE] ──(WASD)──> [WALK/RUN]
  │                     │
(Clique)             (Clique)
  ▼                     ▼
[GOLPE 1] (Corte rápido horizontal)
  │ (Clique no timing)
  ▼
[GOLPE 2] (Corte reverso ascendente)
  │ (Clique no timing)
  ▼
[GOLPE 3] (Impacto pesado descendente a duas mãos + KRAK + onda de choque)
  │
(Recovery) ──> Volta para [IDLE]
```

- Cada ataque possui **janelas de tolerância para buffer de entrada** (input buffering), permitindo que o jogador encadeie o próximo golpe com precisão rítmica.
- Se o jogador não clicar antes do fim da janela de combo, o cavaleiro entra em recuperação e retorna à pose neutra.
