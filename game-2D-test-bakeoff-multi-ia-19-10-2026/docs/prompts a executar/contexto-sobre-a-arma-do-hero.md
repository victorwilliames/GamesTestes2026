# CONTEXTO — ARMAS DO NOSSO HERÓI

## 1. Conceito e identidade das armas

**ATENÇÃO: ESTA INSTRUÇÃO É OBRIGATÓRIA PARA QUALQUER IA OU AGENTE RESPONSÁVEL POR DESENHAR, PROGRAMAR, REFINAR OU ANIMAR AS ARMAS DO NOSSO HERÓI.**

Nosso herói é o personagem principal controlável do jogo. Sua identidade é a de um **Rogue / Thief / Assassin**, especializado em furtividade, agilidade, combate corpo a corpo e ataques brutais com duas grandes lâminas acorrentadas.

**As armas são diretamente inspiradas visualmente nas Blades of Chaos (Lâminas do Caos) de Kratos, da franquia God of War.**

Essa referência deve orientar o formato, os materiais, o fogo, as empunhaduras e, especialmente, as correntes enroladas nos braços.

**REGRA ABSOLUTA: AS ARMAS NÃO SÃO MACHADOS.**

São duas **facas/adagas gigantes, curvas, sangrentas, incendiárias e infernais**. Embora sejam grandes e agressivas, sua linguagem visual e funcional deve continuar sendo a de uma lâmina assassina, capaz de cortar, perfurar e dilacerar.

Não interpretar as armas como machados, foices convencionais ou espadas retas.

---

## 2. Geometria e silhueta

Cada arma deve possuir:

- Lâmina grande, curva e agressiva, inspirada visualmente nas Blades of Chaos.
- Ponta afiada e facilmente identificável.
- Fio cortante externo e geometria interna dentada.
- Recortes orgânicos, assimétricos e irregulares.
- Transição coerente entre cabo, guarda e lâmina.
- Corpo metálico robusto, mas ainda reconhecível como uma grande adaga.
- Silhueta característica, preservada em todas as poses e orientações.

**Não transformar a lâmina em uma cabeça de machado na extremidade de um cabo.**

As duas armas podem possuir pequenas diferenças artesanais, mas precisam formar um par visualmente consistente.

### Materiais e acabamento

- Metal escuro, grafite e preto queimado.
- Vermelho-sangue em manchas, riscos e superfícies.
- Fogo e incandescência em laranja, vermelho e amarelo.
- Ranhuras, arranhões, desgaste e pequenas fissuras.
- Contornos escuros, artesanais e levemente irregulares.
- Pintura em camadas com sombras e reflexos.
- Cabos escuros envolvidos por tiras de couro.
- Guarda e pomo com elementos metálicos.

O resultado não pode parecer uma forma vetorial simples com um gradiente laranja.

Deve transmitir **metal brutal, ensanguentado, incandescente e pintado artesanalmente**.

O fogo deve reforçar a identidade infernal da arma, sem esconder sua silhueta ou transformar o desenho em uma massa de efeitos visuais.

---

## 3. Correntes infernais

As correntes são parte inseparável das armas.

**Assim como no conceito das Blades of Chaos de Kratos, as lâminas do nosso herói estão permanentemente conectadas aos seus braços por correntes.**

Cada lâmina possui uma corrente presa ao pomo do cabo, estendendo-se até o braço correspondente.

As correntes devem:

- Possuir elos metálicos individuais, grandes e robustos.
- Transmitir peso, espessura e resistência.
- Apresentar volume, contorno, cavidade interna e reflexos.
- Ter aparência de ferro escuro, envelhecido e queimado.
- Ficar enroladas nos pulsos e antebraços em múltiplas voltas.
- Passar visualmente pela frente e por trás dos braços.
- Permanecer conectadas às armas durante qualquer transformação.
- Apresentar folga ou tensão coerente com a pose.

**Não desenhar correntes como cordões, fios, linhas simples ou arcos decorativos.**

As voltas nos braços precisam ser visualmente claras.

As correntes também não devem simplesmente desaparecer dentro da mão ou terminar no vazio.

---

## 4. Mãos e empunhaduras

Este é um dos pontos mais importantes para corrigir no renderer atual.

**As mãos precisam realmente segurar as adagas.**

Não basta posicionar um formato de pele por cima do cabo.

Cada mão deve possuir:

- Palma e dorso com volume.
- Dedos dobrados ao redor da empunhadura.
- Polegar envolvendo o cabo.
- Vincos nas juntas dos dedos.
- Sombras entre dedos e arma.
- Oclusão correta entre pele, cabo e guarda.
- Continuidade anatômica entre antebraço, pulso e mão.

A arma deve utilizar um ponto de empunhadura fixo em seu sistema de coordenadas local.

A mão e a arma devem compartilhar esse ponto de ancoragem.

**O cabo não pode atravessar a palma nem parecer flutuar próximo à mão.**

---

## 5. Comportamento e animação futura

Nosso herói utiliza as lâminas como adagas de assassino.

Elas permitem golpes de curta distância e, futuramente, ataques com o alcance ampliado pelas correntes.

Possibilidades de combate:

- Cortes rápidos.
- Golpes cruzados.
- Estocadas e perfurações.
- Ataques giratórios.
- Lançamento das lâminas acorrentadas.
- Recuperação das armas pelas correntes.
- Combinações acrobáticas.
- Ataques furtivos e execuções.

Esses movimentos representam a identidade futura do personagem, **não uma autorização para implementar todo o sistema de combate agora**.

### Regra técnica fundamental

**O mesmo renderer artístico deve desenhar as armas paradas e em movimento.**

Não é permitido:

- Substituir a arma detalhada por uma versão simplificada ao animar.
- Utilizar PNGs ou spritesheets das lâminas no runtime.
- Trocar de renderer dependendo da pose.
- Reduzir as correntes a linhas durante os ataques.
- Desconectar a lâmina da mão.
- Perder os detalhes da pintura por causa da rotação.
- Substituir a geometria da adaga por uma forma de machado genérica.

---

## 6. Arquitetura procedural obrigatória

O desenho deve ser produzido em **HTML5 Canvas 2D**, utilizando geometrias e materiais definidos por código.

Organização sugerida:

```text
WeaponPainter
├── BladeGeometry
├── BladeMaterial
├── EdgePainter
├── FireAndBloodPainter
├── GuardPainter
├── HandlePainter
├── PommelPainter
└── WeaponAttachments

HandPainter
├── PalmPainter
├── FingerPainter
├── ThumbPainter
└── GripOcclusion

ChainPainter
├── LinkGeometry
├── ChainMaterial
├── ChainPath
├── ForearmWraps
└── ChainAttachments
```

Os nomes são sugestões. A separação de responsabilidades é o requisito.

### Pontos de fixação

Planejar pelo menos:

```js
{
  weapon: {
    grip: { x: 0, y: 0 },
    guard: { x: 0, y: 0 },
    bladeRoot: { x: 0, y: 0 },
    bladeTip: { x: 0, y: 0 },
    chainAnchor: { x: 0, y: 0 }
  },

  arm: {
    wrist: { x: 0, y: 0 },
    forearmStart: { x: 0, y: 0 },
    forearmEnd: { x: 0, y: 0 },
    chainWrapAnchors: []
  }
}
```

*As coordenadas acima são ilustrativas, não valores anatômicos medidos.*

O futuro rig matemático controlará transformações e pontos de fixação.

O renderer continuará responsável por desenhar a mesma arma detalhada, com seus materiais e texturas.

As correntes poderão usar pontos de controle próprios, mas sempre derivados das posições físicas das armas e dos braços.

### Texturas

- Sementes determinísticas.
- Sem flickering.
- Marcas fixadas à geometria local.
- Cache quando apropriado.
- Contornos e sombreamento coerentes sob rotação.
- Sem alterações aleatórias entre frames.

---

## 7. Checklist técnico obrigatório

### A. Identidade e geometria

- [ ] A arma é claramente uma grande adaga/lâmina assassina, e não um machado.
- [ ] A silhueta lembra visualmente o conceito das Blades of Chaos.
- [ ] A ponta está correta e bem definida.
- [ ] Os fios e recortes dentados estão presentes.
- [ ] Cabo, guarda, pomo e lâmina possuem conexão visual coerente.
- [ ] As duas armas apresentam proporções compatíveis.
- [ ] A geometria permanece reconhecível em escala de gameplay.

### B. Materiais e pintura

- [ ] O metal apresenta sombras e textura.
- [ ] Há marcas de desgaste e sangue.
- [ ] O fogo e as áreas incandescentes estão representados.
- [ ] O brilho não encobre a silhueta.
- [ ] Os contornos possuem aparência artesanal.
- [ ] A arma combina artisticamente com o restante do personagem.
- [ ] As texturas são determinísticas.

### C. Mãos e pegada

- [ ] Cada mão segura realmente o cabo.
- [ ] Os dedos envolvem a empunhadura.
- [ ] O polegar aparece na posição correta.
- [ ] A guarda não atravessa os dedos.
- [ ] A arma não flutua.
- [ ] O pulso está conectado ao antebraço.
- [ ] Mão e arma compartilham transformações consistentes.

### D. Correntes

- [ ] Cada arma possui uma corrente conectada ao pomo.
- [ ] Os elos são individuais e legíveis.
- [ ] As correntes parecem metal pesado, não cordão.
- [ ] Existem voltas visíveis nos antebraços.
- [ ] Há oclusão correta ao redor dos braços.
- [ ] As correntes apresentam folga e tensão coerentes.
- [ ] Nenhum trecho nasce ou termina inexplicavelmente no vazio.
- [ ] Os pontos de fixação estão preparados para acompanhar o rig.

### E. Arquitetura e animação

- [ ] Armas desenhadas integralmente por Canvas 2D.
- [ ] Nenhum PNG oficial utilizado como renderer.
- [ ] Geometrias organizadas em coordenadas locais.
- [ ] Materiais independentes da pose.
- [ ] Pontos de pegada e fixação definidos.
- [ ] Mesmas geometrias utilizadas em idle, corrida e ataque.
- [ ] Detalhes preservados durante as transformações.
- [ ] Correntes continuam conectadas durante articulação.
- [ ] Duas orientações distintas foram testadas sem espelhamento artificial.
- [ ] Capturas reais do navegador comprovam o comportamento.

**Importante:** itens não testados devem permanecer desmarcados. Não afirmar que a integração com o rig está concluída apenas porque os pivôs existem.

---

## 8. Regras para continuar o protótipo atual

**Não começar do zero.**

A versão atual do nosso herói já possui lâminas que receberam avaliação positiva do usuário.

Portanto:

1. Preservar as geometrias atuais das lâminas, salvo correção objetiva.
2. Melhorar principalmente mãos, empunhaduras e correntes.
3. Não redesenhar as armas como machados.
4. Não alterar arbitrariamente as proporções ou a identidade visual.
5. Comparar cada refinamento com a versão anterior.
6. Validar a aparência antes de avançar para animações complexas.
7. Integrar posteriormente as transformações do rig sem trocar de renderer.
8. Registrar os defeitos restantes e solicitar avaliação visual.

---

## 9. Critério final de aprovação

O resultado deve deixar evidente, mesmo para alguém que não conheça o projeto, que nosso herói é um assassino chibi empunhando **duas grandes adagas infernais acorrentadas aos braços**.

As mãos precisam agarrar firmemente as empunhaduras.

As correntes precisam parecer pesadas, metálicas e fisicamente conectadas.

As lâminas precisam parecer facas/adagas brutais, com fogo e sangue.

E quando o personagem começar a se mover, **exatamente essas mesmas armas deverão continuar presentes**, com os mesmos detalhes, sem simplificações.

**REFERÊNCIA VISUAL E CONCEITUAL PRINCIPAL: BLADES OF CHAOS, KRATOS, GOD OF WAR.**

**IDENTIDADE DO NOSSO HERÓI: ROGUE / THIEF / ASSASSIN / STEALTH.**

**REGRA FINAL: NÃO SÃO MACHADOS. SÃO GRANDES ADAGAS ASSASSINAS, SANGRENTAS, INCANDESCENTES E ACORRENTADAS AOS BRAÇOS DO NOSSO HERÓI.**