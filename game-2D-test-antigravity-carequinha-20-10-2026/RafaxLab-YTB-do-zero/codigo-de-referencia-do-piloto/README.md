# Cavaleiro — piloto de RPG isométrico (Canvas 2D)

Piloto de um RPG de ação com câmera 3/4 no estilo de *Hades*: um pequeno campo aberto (um platô flutuante) e um cavaleiro de armadura que dá um combo de espada de 3 golpes. Tudo é desenhado por código em **Canvas 2D**: sem WebGL, sem engine e sem nenhuma imagem.

## Como rodar

Abra o `index.html` direto no navegador (funciona via `file://`) ou sirva a pasta:

```bash
python3 -m http.server 5317
```

Depois acesse `http://localhost:5317`.

| Tecla | Ação |
|---|---|
| **W A S D** (ou setas) | andar (relativo à tela) |
| **Clique** | atacar na direção do mouse; clique de novo durante o golpe para encadear o combo (1 → 2 → 3) |
| **B** | mostra o esqueleto 3D invisível (ossos, alvos da IK e vetores polares) |
| **T** | câmera lenta (25%) para ver as poses‑chave |

`turnaround.html` mostra o cavaleiro em 8 direções e as poses‑chave do combo (`?heads=1` mostra só a cabeça em 8 ângulos).

## Como funciona

**Câmera 3/4.** Projeção ortográfica com yaw de 45° e inclinação de 34° (`js/core.js`). O mundo usa x/y no chão e z para cima.

**Esqueleto 3D invisível + IK (`js/rig.js`).** Uma pose é só um conjunto de números: posição e rotação do quadril e do tronco, rotação da cabeça, alvos das mãos e dos pés e a direção da espada. A cada quadro, `solveRig` faz a cinemática direta do tronco e resolve braços e pernas com **IK analítica de 2 ossos** (lei dos cossenos + vetor polar para cotovelos e joelhos). As mãos usam coordenadas cilíndricas (ângulo, distância e altura em volta do corpo), então interpolar o ângulo gera arcos de golpe naturais. No golpe final, a mão esquerda vira alvo de IK no cabo da espada (pegada a duas mãos).

**Poses‑chave.** Cada golpe tem antecipação → golpe → continuação → recuperação, cada trecho com sua curva de easing. A corrida tem 8 poses‑chave (contato, descida, passagem e subida, espelhadas) interpoladas com Catmull‑Rom, e o ritmo acompanha a velocidade para o pé não deslizar. O avanço do corpo no golpe (root motion) também segue as poses.

**Pintura estilo HQ (`js/ink.js`, `js/knight.js`, `js/head.js`).** Cada peça do corpo vira uma forma 2D: cápsulas para os membros, ou o casco convexo de pontos 3D projetados para placas de armadura, mãos e cabeça. O sombreamento celular usa o truque de "deslocar a forma rumo à luz" dentro de um recorte, o que dá 2 a 3 tons chapados. As peças são ordenadas por profundidade, e uma passada de silhueta desenha antes o contorno grosso de tinta. O rosto (moicano com laterais raspadas, olhos azuis, sobrancelhas grossas, maxilar marcado, a partir da referência em `referencias/`) é um mini‑modelo 3D: os traços só aparecem quando estão voltados para a câmera. A mesma rotina desenha o retrato do HUD com outra câmera.

**Capa.** Uma malha Verlet de 5×4 pontos presa às costas, com colisão no corpo, vento e uma mola suave para a forma de repouso.

**Mundo pintado uma vez (`js/world.js`).**
- O **chão** (grama com manchas chapadas feitas por *marching squares* sobre ruído, trilha, praça de lajotas, sombras dos objetos e penhasco com estratos) é pintado **uma única vez** num canvas fora da tela. A cada quadro é só um `drawImage`.
- **Árvores, arbustos, pedras, ruínas e tufos** são pintados uma vez em sprites fora da tela e **reaproveitados** por várias instâncias (espelhados para variar).
- **Só o vento anima o mundo:** um campo de rajadas que viaja pelo platô move molas amortecidas. A copa das árvores gira em torno do topo do tronco, e arbustos e grama inclinam a partir da base. O impacto do golpe final cria uma onda de choque nesse mesmo campo.

**Por quadro** só são redesenhados o personagem, o rastro da espada (amostrado em subpassos ao longo da curva do golpe, para o crescente sair liso) e o vento (linhas e folhas), além dos efeitos rápidos do golpe (poeira, onda e "KRAK!").

## Arquivos

```
index.html        página + HUD
turnaround.html   folha de turnaround procedural (depuração)
js/core.js        matemática, ruído, câmera isométrica
js/ink.js         paleta e pincéis HQ (celFill, contornos, cápsulas, cascos)
js/rig.js         esqueleto, IK de 2 ossos, poses‑chave e animador
js/head.js        cabeça/rosto procedural
js/knight.js      armadura, espada, capa e modo esqueleto
js/world.js       platô, chão em cache, sprites, vento
js/fx.js          rastro, partículas, onomatopeias
js/main.js        loop, entrada, combo, câmera, HUD
referencias/      foto do rosto e turnaround de referência (Nano Banana) — não são usados pelo jogo
```
