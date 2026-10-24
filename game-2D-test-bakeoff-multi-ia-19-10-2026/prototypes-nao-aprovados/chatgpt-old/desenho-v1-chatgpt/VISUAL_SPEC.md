# HERO-02 — Especificação visual e proveniência · V1

## Referências oficiais conferidas no repositório

Repositório `victorwilliames/game-2d`, pasta `assets/references/ref-2d-hero/`: `hero-parts/hero-part-head.png`, `hero-part-body.png`, `hero-part-body-tpose.png`, `hero-part-body-tpose-nocape.png`, `hero-part-weapons.png` e oito arquivos `hero-complet-idle/hero-idle-*.png`.

**Limite de inspeção real:** confirmei via GitHub a existência, nomes e tamanhos de arquivo dos 13 PNGs e examinei visualmente as versões `hero-idle-s.png` e `hero-idle-se.png` disponíveis na biblioteca da conversa (cenas oficiais do mesmo herói). O acesso deste ambiente não permitiu baixar/decodificar os cinco PNGs *hero-part-*. Logo, medições pixel a pixel e alpha **dessas cinco partes não foram verificadas**, e suas proporções não podem ser declaradas exatas. O aplicativo lê os PNGs diretamente do repositório local do usuário para comparação, sem copiar ou alterar os originais.

## Observações nas vistas Sul e Sudeste

- **Silhueta:** cabeça/cabelo dominam a massa superior. Proporção chibi compacta, tronco curto descoberto, braços espessos abertos lateralmente, botas superdimensionadas e armas externas formando silhueta larga.
- **Cabelo:** castanho escuro quase preto com fios cor de cobre. Mechas **não radiais**, volumes sobrepostos, topete da esquerda maior, pontas com curvaturas orgânicas. Base das mechas produz sombra escura sobre os olhos.
- **Rosto:** máscara oval-achatada, bochechas e orelhas amplas; pares de íris vermelhas longas e afiladas, sobrancelhas muito inclinadas; boca praticamente reta, nariz diminuto.
- **Pele:** tons pêssego e alaranjado, escurecimento em bochechas, contorno grosso não-uniforme; pintura de pequenas marcas quentes sobre as superfícies.
- **Torso:** musculatura estilizada visível sem camisa (peitoral, costelas/abdômen), escondendo pescoço com cachecol vermelho de várias dobras.
- **Vestimentas:** pano vermelho com rasgos, saiote escuro desigual, couro marrom muito escuro, caveira **única central** e correntes envelhecidas pendendo do cinto e dos punhos.
- **Armas:** pares de lâminas curvas recortadas/dentadas, serrilhas para dentro, metal escuro com prata/cobre e vermelho incandescente nas bordas inferiores; corrente presa ao cabo.
- **Aparência:** ilustração texturizada de contorno picotado, marcas de pincel e hachuras irregulares. NÃO um modelo 3D ou vetor perfeitamente liso.

## Sistema procedural adotado (unidades locais, não pixels da referência)

Canvas lógico de `900×1050`, personagem centralizado no eixo `x=0` com eixo `y` positivo para baixo. Altura nominal das formas do personagem: `y≈0–1030`. Cabelo ocupa aproximadamente `x=-337..314`, `y=0..460`; rosto `x≈-185..225`, `y=280..543`. Cachecol: `y≈505..625`; tronco `y≈560..760`; saia/cinto: `y≈710..880`; botas até `≈1030`. Lâminas aumentam a extensão horizontal até `x≈±550` conforme a pose.

Estas coordenadas são **uma primeira construção autoral estimada visualmente**, NÃO a extração de landmarks dos PNGs canônicos de partes. Refinamento quantitativo dependerá da inspeção dos arquivos modulares originais.

## Materiais (aproximação, não amostras colorimétricas dos PNGs)

| Material | Base | Sombra | Acabamento |
|---|---|---|---|
| Cabelo | `#332321` / `#624136` | `#1d1719` | hachura cobre / mechas pintadas |
| Pele | `#f1ad79` / `#f7ac71` | `#a95838` | manchas quentes e riscos finos |
| Lenço/capa | `#a81317` / `#eb2821` | `#630a13` | fibras / dobras e rasgos |
| Couro | `#3a2524` | `#150f15` | tramas e costuras |
| Metal | `#342b31` | `#1b171b` | lascas frias e borda laranja controlada |
| Corrente | `#866044` | `#271817` | elos com reforço claro |
| Caveira | `#e6d5b9` | `#967e6c` | marcas secas e orifícios escuros |

## Leitura de profundidade, oclusão e camadas

Ordem de pintura inicial: **capa → pernas/botas → torso → saia/cinto/correntes/caveira → braços/punhos → cachecol → cabeça/cabelo → armas**. Dentro de cada peça, subcamadas de sombra precedem texturas e contorno. Não há geração aleatória por frame; sementes pseudoaleatórias são fixas por material e geometria, no espaço local da peça.

## Observações de consistência

- T-pose usada **só como verificação estática de ângulos**: a arquitetura ainda não tem esqueleto animado, IK ou interpolação.
- Falta uma calibração rigorosa do tamanho natural de cada PNG canônico (bounding box RGBA), anatomia da T-pose e posicionamento das empunhaduras; o modo comparação poderá auxiliar quando acessado no repositório original.
- A imagem `hero-idle-s.png` é a referência de identidade para o quadro frontal desta rodada. A vista `hero-idle-se.png` é apenas comparação de materiais/volume, não um segundo renderer angular.
