# Direção de Arte Oficial — @game2d

## 1. Intenção Geral e Estilo Visual

Jogo 2D HD com perspectiva elevada 3/4 fake 2.5D (estilo Hades), combinando desenho artesanal expressivo por código em HTML5 Canvas 2D, com contornos orgânicos, sombreamento em camadas e texturas ricas. Todo o visual é construído por código matemático sem Blender, sem WebGL e sem imagens pré-renderizadas de terceiros.

---

## 2. Protagonista — Identidade e Anatomia

- **Classe e Conceito:** **Rogue / Thief / Assassin / Stealth**, focado em agilidade, furtividade e combate corpo a corpo brutal.
- **Silhueta:** Chibi **extremamente cabeçudo**, tronco curto, musculoso e robusto.
- **Rosto:** Rosto redondo, olhos vermelhos expressivos, sobrancelhas cerradas em expressão séria/bravia; cabelo escuro e volumoso moldado em mechas espessas.
- **Vestuário:**
  - Torso **sem camisa**, exibindo peitorais e musculatura definidos.
  - Cachecol e capa vermelhos em camadas sobre os ombros.
  - Cinto de couro escuro com **uma única caveira central no cinto frontal**. A caveira não aparece nas costas, na capa ou em acessórios.
  - Calção escuro, braçadeiras discretas e botas volumosas e firmes no solo.

---

## 3. Armas Oficiais — Adagas Infernais do Caos

Conforme estabelecido em `docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`:

- **Inspiração Direta:** Visualmente inspiradas nas **Blades of Chaos (Lâminas do Caos)** de Kratos (God of War).
- **REGRA ABSOLUTA: AS ARMAS NÃO SÃO MACHADOS.**
  - São duas **grandes adagas/facas gigantes curvas, sangrentas, incandescentes e infernais**.
  - Não interpretar como machados, foices convencionais ou espadas retas.
- **Geometria da Lâmina:**
  - Lâmina grande, curva e agressiva, com ponta afiada e identificável.
  - Fio cortante externo e geometria interna dentada com recortes orgânicos e irregulares.
  - Transição firme entre cabo, guarda e lâmina.
- **Materiais e Acabamento:**
  - Metal escuro, grafite e preto queimado.
  - Manchas e respingos de sangue nas superfícies e fios de corte.
  - Fogo e incandescência vibrantes em amarelo, laranja e vermelho.
  - Ranhuras, arranhões, desgaste e contornos escuros artesanais.
  - Cabos escuros envolvidos por tiras de couro e elementos metálicos no pomo e guarda.
  - O resultado deve transmitir **metal brutal, ensanguentado e incandescente**, nunca gradientes vetoriais simplórios.

---

## 4. Mãos e Empunhaduras (Anatomia da Pegada)

- **As mãos devem realmente segurar as adagas.**
- Palma e dorso com volume. Dedos dobrados ao redor da empunhadura e polegar fechando o cabo com firmeza.
- Vincos anatômicos nas juntas dos dedos, sombras de contato e oclusão correta entre pele, cabo e guarda.
- Ponto de empunhadura fixo e compartilhado em coordenadas locais. O cabo não pode atravessar a palma nem flutuar.

---

## 5. Correntes Infernais

- As lâminas estão **permanentemente conectadas aos braços** do herói por correntes presas ao pomo do cabo.
- Elos metálicos individuais, grandes, volumosos e robustos, transmitindo peso e solidez.
- Aspecto de ferro escuro envelhecido e queimado.
- Enroladas nos pulsos e antebraços em múltiplas voltas, passando visualmente pela frente e por trás dos braços com oclusão correta.
- Proibido desenhar correntes como linhas finas, cordões ou arcos simplificados.

---

## 6. Ilha Tropical e Arena de Testes

- **Referência Oficial:** `assets/references/ref-2d-maps/map-island-enemys.png`.
- Ilha tropical minimalista: área central de gramado para combate, areia, oceano turquesa, poucas palmeiras e píer simples.
- Enquadramento em câmera elevada 3/4 fake 2.5D, garantindo espaço e legibilidade para movimentação, inimigos e efeitos visuais de impacto.

---

## 7. Referências Canônicas Ativas

1. **Herói Oficial (Peças Modulares):** `assets/references/ref-2d-hero/hero-parts/` (`hero-part-head.png`, `hero-part-body.png`, `hero-part-body-tpose.png`, `hero-part-weapons.png`).
2. **Arena e Composição de Cena:** `assets/references/ref-2d-maps/map-island-enemys.png`.
3. **Linha de Base Aprovada:** `prototypes/chatgpt/desenho-v1-chatgpt` e `prototypes/antigravity/desenho-v1-antigravity`.
