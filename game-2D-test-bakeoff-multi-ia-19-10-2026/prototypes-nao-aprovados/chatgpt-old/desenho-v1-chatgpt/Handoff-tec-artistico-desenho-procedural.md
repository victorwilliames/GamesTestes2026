# HERO-02 — Handoff técnico e artístico | Desenho Procedural V1.2

**Projeto:** @game2d / HERO-02  
**Data do checkpoint:** 19/10/2026  
**Experimento:** ChatGPT  
**Diretório:** `prototypes/desenho-v1-chatgpt/`  
**Estado:** protótipo artístico promissor, ainda não aprovado como arte final e ainda não integrado ao RIG-01.

> **REGRA CENTRAL:** O desenho artístico procedural deve ser preservado durante toda a evolução do projeto. Quando implementarmos animações, o RIG-01 deverá controlar exatamente o mesmo personagem, com as mesmas geometrias, materiais e texturas. Jamais substituir o personagem por um boneco simplificado, spritesheets ou PNGs durante o movimento.

---

## 1. Contexto e identidade do personagem

O HERO-02 é um personagem masculino chibi, extremamente cabeçudo, musculoso, compacto e com aparência artesanal, pintada e desenhada à mão.

### Conceito visual e de gameplay

A inspiração central é um **Kratos chibi**, mas com identidade de **Rogue / Thief / Assassin / Stealth**.

Ou seja, um pequeno assassino extremamente perigoso, ágil e brutal, que utiliza grandes adagas acorrentadas.

**Importante:** o personagem não deve ser interpretado como um bárbaro tradicional ou guerreiro que utiliza machados.

Sua identidade deve comunicar:

- Assassino furtivo.
- Rogue / Thief.
- Agilidade e letalidade.
- Combate com duas lâminas.
- Ataques rápidos e violentos.
- Correntes infernais.
- Fogo, sangue e metal queimado.
- Aparência chibi extremamente estilizada.

A inspiração de God of War está na brutalidade, na presença visual e no conceito das armas acorrentadas, sem necessidade de copiar diretamente seus personagens ou designs protegidos.

### As armas: Lâminas do Caos

**Correção conceitual obrigatória: as armas do HERO-02 NÃO SÃO MACHADOS.**

São duas grandes facas/adagas de assassino, com características de Lâminas do Caos (*Blades of Chaos*).

Características obrigatórias:

- Duas lâminas grandes, curvas e agressivas.
- Formato de faca/adaga, mesmo sendo desproporcionalmente grandes.
- Pontas afiadas e geometria dentada.
- Metal escuro, desgastado e queimado.
- Superfícies com fogo, sangue e tonalidades incandescentes.
- Bordas avermelhadas e alaranjadas.
- Cabos escuros envolvidos em tiras.
- Correntes metálicas grossas conectadas às empunhaduras.
- Correntes enroladas nos braços e antebraços do personagem.
- Elos individuais volumosos, com aparência pesada.

**A função visual dessas armas é comunicar adagas assassinas infernais, não machados ou foices genéricas.**

As lâminas da versão V1.2 receberam avaliação positiva do usuário e devem ser preservadas.

---

## 2. Referências oficiais

Diretório canônico:

`assets/references/ref-2d-hero/`

A pasta contém 13 imagens oficiais do protagonista.

### Oito orientações

`hero-complet-idle/`

- hero-idle-n.png
- hero-idle-ne.png
- hero-idle-e.png
- hero-idle-se.png
- hero-idle-s.png
- hero-idle-sw.png
- hero-idle-w.png
- hero-idle-nw.png

### Cinco partes modulares

`hero-parts/`

- hero-part-head.png
- hero-part-weapons.png
- hero-part-body.png
- hero-part-body-tpose.png
- hero-part-body-tpose-nocape.png

As imagens são referências artísticas e anatômicas.

**Não utilizar os PNGs originais para renderizar o personagem procedural.**

Eles podem aparecer em painéis de comparação, mas não como substitutos do desenho por código.

As vistas Sul e Sudeste foram examinadas visualmente no desenvolvimento da V1.2.

As cinco referências modulares foram localizadas, mas suas proporções e pixels não foram integralmente medidos neste ambiente.

### Documentação consultada

- AGENTS.md
- docs/ART_DIRECTION.md
- docs/ART_FIRST_PROCEDURAL_SPEC.md
- docs/P0_1_VISUAL_AUDIT.md
- docs/REFERENCE_PATHS_CURRENT.md
- RafaxLab-YTB/

A metodologia utilizada foi inspirada na pesquisa RafaxLab:

**Referência → Pintura por código → Captura real → Crítica visual → Correção direcionada.**

---

## 3. Histórico: como chegamos à V1.2

### V1 — Primeira implementação procedural

Foi criado um renderer Canvas 2D utilizando:

- Path2D.
- Curvas Bézier.
- Formas orgânicas.
- Geometrias locais.
- Pintura em camadas.
- Texturas determinísticas.
- Materiais reutilizáveis.
- Transformações locais.
- Cache de regiões estáticas.

Foram desenhados:

- Cabeça.
- Cabelo.
- Rosto.
- Tronco musculoso.
- Braços.
- Mãos.
- Pernas.
- Botas.
- Cachecol.
- Capa.
- Saiote.
- Cinto e caveira.
- Correntes.
- Duas armas.

O primeiro resultado comprovou a viabilidade técnica inicial, mas apresentou problemas importantes de fidelidade artística.

Principalmente as armas estavam deformadas, com silhuetas incorretas e aparência de objetos desconectados das mãos.

### V1 — Problemas identificados

O usuário apresentou a comparação entre a referência oficial e o resultado procedural.

Principais diferenças:

1. Armas visualmente incorretas.
2. Cabelo muito simplificado.
3. Rosto diferente do original.
4. Texturas com aparência vetorial.
5. Proporções pouco fiéis.
6. Conexão ruim entre mãos e armas.
7. Problemas de carregamento do HTML local.

A decisão foi **não reiniciar o experimento**, mas corrigir o trabalho existente.

### V1.2 — Reconstrução das armas

O componente de armas passou por uma revisão importante.

Foram melhorados:

- Formato curvo das lâminas.
- Geometria dentada.
- Ponta e recortes.
- Contorno.
- Superfície metálica.
- Tons escuros.
- Áreas incandescentes.
- Empunhaduras.
- Fixação visual aos braços.

**Resultado:** o usuário considerou as lâminas excelentes e aprovou essa direção visual.

Essa é uma das conquistas mais importantes do experimento.

### V1.2 — Refinamentos adicionais

Também foram realizados ajustes em:

- Pintura dos olhos.
- Textura dos materiais.
- Sombras.
- Contornos.
- Mãos.
- Posicionamento das armas.
- Carregamento da página.
- Comparação com a referência oficial.

Foram adicionados presets estáticos de:

- Idle.
- Corrida intermediária.
- Ataque.
- T-pose.

Esses presets utilizam o mesmo painter, mas **não são uma integração funcional com o RIG-01**.

### Avaliação atual do usuário

O usuário considera a V1.2 o melhor desenho procedural produzido até então pelos agentes envolvidos no projeto.

Feedback positivo:

- Lâminas excelentes.
- Roupas boas.
- Conjunto visual promissor.
- Evolução significativa em relação aos protótipos anteriores.

Pontos que incomodam:

- Mãos não parecem segurar firmemente as armas.
- Rosto ainda diferente do oficial.
- Correntes parecem cordões finos.
- Correntes não estão suficientemente conectadas e enroladas nos braços.

**Decisão:** preservar os avanços e continuar refinando.

---

## 4. O que conseguimos tecnicamente

O experimento possui um renderer próprio em Canvas 2D, composto por módulos organizados.

### Componentes existentes

- Geometry Painter.
- Material Painter.
- Head Painter.
- Body Painter.
- Weapon Painter.
- Hero Composition.
- Rig Adapter experimental.
- Interface de comparação.
- Sistema de cache.

### Recursos implementados

- Desenho por comandos Canvas 2D.
- Curvas complexas com Path2D.
- Materiais com hachuras e sombras.
- Ruído e textura determinísticos.
- Transformações locais.
- Organização por camadas.
- Pivôs declarativos.
- Caches de desenho.
- Presets de pose.
- Visualização de pontos anatômicos.

O renderer procedural não depende de PNGs oficiais para compor o personagem.

As imagens de referência são usadas apenas no painel de comparação.

### Cache

Foram utilizados caches para regiões como:

- Capa.
- Pernas.
- Tronco.
- Roupa.
- Cachecol.
- Cabeça.

O objetivo é evitar reconstruir geometrias complexas desnecessariamente.

Essa arquitetura deverá ser revista quando houver articulação real, garantindo que os caches acompanhem as superfícies corretamente.

---

## 5. Pendências artísticas prioritárias

### P0 — Reconstruir mãos e empunhaduras

**Problema atual:**

Embora a arma acompanhe o braço, a mão parece encostar no cabo ou estar desenhada sobre ele.

Não transmite a sensação de um punho realmente fechado segurando a adaga.

A solução atual utiliza uma sobreposição de pele, chamada `handCover()`.

Isso não é suficiente.

**Correção necessária:**

Criar um HandPainter com:

1. Palma.
2. Dorso.
3. Dedos parcialmente separados.
4. Polegar envolvendo o cabo.
5. Vincos das articulações.
6. Sombras entre os dedos.
7. Oclusão correta da empunhadura.
8. Conexão anatômica com o pulso.

A ordem de desenho deve considerar:

`gripBack → fingersBack → handle → fingersFront → thumb → guard`

A geometria da arma deverá ter um ponto físico de empunhadura.

A mão deverá ser desenhada em relação a esse ponto, mantendo a pegada consistente em diferentes poses.

**Critério de aprovação:**

A mão precisa parecer realmente fechada ao redor do cabo, sem dedos desconectados ou objetos atravessando a palma.

### P0 — Reconstruir correntes infernais

**Problema atual:**

As correntes se parecem com fios ou cordões muito finos.

Elas não transmitem peso, espessura ou materialidade.

Também não apresentam uma conexão suficientemente clara entre as adagas e os braços.

**Objetivo visual:**

Correntes pesadas, infernais, com grandes elos metálicos individuais, inspiradas no conceito das correntes das Blades of Chaos.

Precisam parecer capazes de sustentar as armas durante movimentos violentos.

**Correções necessárias:**

1. Aumentar a espessura visual.
2. Criar elos individuais.
3. Alternar a orientação dos elos.
4. Adicionar cavidades internas.
5. Aplicar contornos escuros.
6. Utilizar metal envelhecido.
7. Adicionar pequenas reflexões.
8. Mostrar corrente parcialmente enrolada nos braços.
9. Conectar corretamente a corrente ao pomo das adagas.
10. Garantir percurso coerente e sensação de peso.

A corrente não deve simplesmente nascer da mão e formar um U no ar.

### Pontos de ancoragem

Definir:

- `weaponPommel`
- `wristAnchor`
- `forearmWrapStart`
- `forearmWrapEnd`
- `chainSlack`
- `chainAttachment`

As voltas das correntes precisam passar visualmente por trás e pela frente dos antebraços.

**Futura integração:** esses pontos deverão acompanhar o rig. Não é necessário implementar uma simulação física completa nesta etapa.

### P1 — Melhorar rosto e cabelo

O rosto da V1.2 ainda não corresponde exatamente às referências oficiais.

Prioridades:

- Formato dos olhos vermelhos.
- Distância entre olhos.
- Inclinação das sobrancelhas.
- Tamanho das orelhas.
- Proporção das bochechas.
- Formato do queixo.
- Expressão séria.
- Pequeno nariz.
- Boca discreta.

O personagem não deve parecer outro menino de cabelo espetado.

Deve parecer especificamente o HERO-02.

**Cabelo:**

As mechas precisam ter mais volume, irregularidade e profundidade.

Melhorar:

- Silhueta geral.
- Assimetria.
- Mechas sobrepostas.
- Sombras internas.
- Tons castanhos.
- Texturas orientadas pelo eixo das mechas.
- Contornos de espessura variável.

Evitar cabelo com aparência de estrela vetorial.

### P1 — Refinar materiais

Preservar a roupa atual, mas reforçar:

- Textura de tecido.
- Couro desgastado.
- Costuras.
- Dobras.
- Sombras.
- Marcas artesanais.
- Superfícies foscas.
- Volume pictórico.

As lâminas devem manter fogo, sangue e metal queimado sem esconder sua geometria.

---

## 6. O RIG está pronto?

**Resposta: ainda não.**

O renderer possui fundamentos importantes para receber um rig matemático, mas não está completamente preparado para animação anatômica de alta fidelidade.

### Estado das partes

| Componente | Estado |
|---|---|
| HeadPainter | Implementado |
| BodyPainter | Implementado |
| WeaponPainter | Implementado |
| MaterialPainter | Implementado |
| Pivôs declarativos | Implementados |
| Transformações locais | Parciais |
| Armas acompanhando braços | Parcialmente funcional |
| Ombros independentes | Parciais |
| Cotovelos independentes | Pendente |
| Pulsos independentes | Pendente |
| Joelhos independentes | Pendente |
| Tornozelos independentes | Pendente |
| Rig matemático conectado | Não |
| Animação por IK | Não |
| Duas orientações anatômicas reais | Não |
| Fidelidade sob animação | Não validada |

### Limitação principal

Atualmente, o braço pode ser movimentado por uma transformação mais ampla, mas não está inteiramente dividido em:

- Braço superior.
- Cotovelo.
- Antebraço.
- Pulso.
- Mão.

O mesmo ocorre com as pernas.

Isso significa que conectar o RIG-01 diretamente, sem adaptações, poderá produzir deformações.

**Não podemos aceitar que a qualidade artística diminua para facilitar a articulação.**

### O que precisa ser feito

Separar os componentes anatômicos em regiões locais articuláveis.

Por exemplo:

`Shoulder → UpperArm → Elbow → Forearm → Wrist → Hand → Weapon`

E:

`Hip → Thigh → Knee → Shin → Ankle → Boot`

Cada região precisa conservar suas geometrias, texturas, sombras e detalhes.

As articulações deverão ter sobreposições para evitar buracos e aparência mecânica.

---

## 7. Integração futura com o RIG-01

Existe um protótipo matemático anterior no repositório:

`prototypes/rig-01-chatgpt-v1_1/index-rig.html`

Esse protótipo possui recursos matemáticos e API de controle de poses.

Entre as funções disponíveis:

- `setState()`
- `setTime()`
- `setYaw()`
- `getDebugInfo()`
- `setPaused()`
- `step()`

O RIG-01.1 já é uma base experimental de controle anatômico.

Entretanto, **o desenho V1.2 ainda não está conectado funcionalmente a ele**.

### Adaptador existente

Existe:

`src/rig-adapter.js`

O adaptador atual é preliminar.

Ele consegue representar algumas transformações e presets, mas ainda não converte integralmente as articulações do RIG-01 em transformações do painter.

### Caminho recomendado

1. Preservar os componentes artísticos atuais.
2. Separar braços e pernas em segmentos anatômicos.
3. Consolidar coordenadas e pivôs locais.
4. Definir uma interface de pose.
5. Fazer o adaptador consumir os dados do RIG-01.
6. Aplicar transformações ao mesmo renderer.
7. Corrigir a oclusão das articulações.
8. Garantir que as armas continuem presas às mãos.
9. Garantir que as correntes acompanhem os pontos anatômicos.
10. Validar tudo visualmente.

### Contrato conceitual de pose

O futuro adaptador poderá produzir dados semelhantes a:

```js
{
  partId,
  transform,
  depth,
  visibility,
  material,
  attachments
}
```

A responsabilidade do rig será determinar a transformação.

A responsabilidade do painter será preservar a aparência.

**O rig controla. O painter desenha.**

Nunca criar um segundo personagem simplificado para executar animações.

---

## 8. Validação futura de animação procedural

Depois que a arte estática alcançar qualidade satisfatória, executar uma prova limitada de integração.

O mesmo renderer deverá demonstrar:

### Pose 1 — Idle

Personagem parado, mantendo:

- Proporções.
- Rosto.
- Cabelo.
- Roupas.
- Lâminas.
- Mãos.
- Correntes.

### Pose 2 — Corrida intermediária

O personagem deve alterar a posição dos membros, preservando todas as características artísticas.

Nenhuma parte pode ser substituída por cápsulas ou bonecos geométricos.

### Pose 3 — Ataque

Demonstrar:

- Movimento dos braços.
- Rotação das adagas.
- Pegada preservada.
- Correntes acompanhando as armas.
- Roupas coerentes.
- Articulações sem deformações graves.

### Orientações

Validar pelo menos:

- Sul.
- Sudeste.

A orientação Sudeste atual é apenas provisória e não representa uma reconstrução anatômica completa.

Futuramente, a mudança de orientação deverá considerar:

- Profundidade.
- Oclusão.
- Assimetria.
- Projeção das armas.
- Volume da cabeça.
- Rosto.
- Corpo.
- Roupas.

Não utilizar espelhamento simples como substituto para geometria direcional.

### Critérios de aprovação

**Gate A — Fidelidade estática**

O personagem realmente se parece com o HERO-02 oficial?

**Gate B — Fidelidade sob articulação**

O personagem mantém sua identidade ao movimentar braços, pernas e armas?

**Gate C — Integridade procedural**

O desenho continua sendo produzido por comandos Canvas 2D, sem PNGs ou troca de renderer?

**A missão de animação só poderá ser considerada validada quando os três critérios forem atendidos.**

---

## 9. Estrutura de arquivos

```text
prototypes/desenho-v1-chatgpt/
│
├── index.html
├── dev.html
│
├── src/
│   ├── app.js
│   ├── geometry.js
│   ├── materials.js
│   ├── head.js
│   ├── body.js
│   ├── weapons.js
│   ├── hero.js
│   └── rig-adapter.js
│
├── tools/
│   ├── build_standalone.py
│   └── qa_v2.py
│
├── reference-preview/
│
├── evidence/
│
├── README.md
├── CHANGELOG.md
├── VISUAL_SPEC.md
├── PIVOTS.md
├── QA_REPORT_V1_2.md
│
└── HANDOFF_HERO02_V1_2.md
```

### Responsabilidade dos arquivos

**index.html:** página autocontida para executar o protótipo.

**dev.html:** entrada para desenvolvimento modular.

**geometry.js:** geometrias, curvas e formas.

**materials.js:** sistema de materiais e texturas.

**head.js:** cabeça, cabelo e rosto.

**body.js:** anatomia, roupas e acessórios.

**weapons.js:** lâminas, empunhaduras e correntes.

**hero.js:** montagem, profundidade e caches.

**rig-adapter.js:** presets e preparação de integração.

### Como continuar o desenvolvimento

Editar os arquivos dentro de `src/`.

Depois executar:

```bash
python tools/build_standalone.py
```

Esse processo regenera o HTML autocontido.

Evitar modificar apenas o `index.html` gerado, pois as alterações podem desaparecer na próxima compilação.

---

## 10. Testes executados e limitações

### Verificações realizadas na V1.2

- Execução do renderer em Chromium.
- Captura real de screenshots.
- Nenhuma exceção JavaScript observada no teste registrado.
- Renderização procedural sem uso de sprites oficiais no personagem.
- Teste de textura determinística.
- Dois renders consecutivos com resultado idêntico.
- Renderização de idle.
- Renderização de presets de corrida e ataque.
- Comparação com referência visual.

### Desempenho observado

Foram observadas amostras aproximadas de:

- Idle: 12–14 ms.
- Algumas poses com repintura: 84–100 ms.

Essas medições são amostras preliminares, não benchmarks de FPS sustentado.

O desempenho precisará ser reavaliado quando houver articulação real.

### Limitações não resolvidas

- Abertura por duplo clique no Windows não foi definitivamente validada.
- Não existe integração completa com RIG-01.
- Não existem animações contínuas procedurais finais.
- Não existe IK conectado ao painter.
- Não há validação das oito direções.
- A orientação Sudeste ainda é aproximada.
- A fidelidade artística não está aprovada como final.
- Não foi comprovada preservação completa da arte sob articulação.

---

## 11. Evidências de desenvolvimento

Capturas disponíveis na estrutura do protótipo:

- `evidence/v2-idle-S.png`
- `evidence/v2-procedural-canvas.png`
- `evidence/v2-run-S.png`
- `evidence/v2-attack-S.png`
- `evidence/v2-idle-SE.png`
- `evidence/qa-v2.json`

As capturas de corrida e ataque demonstram presets do painter.

**Não devem ser apresentadas como prova de integração funcional com o RIG-01.**

As evidências devem continuar sendo produzidas diretamente pelo navegador.

---

## 12. O que preservar obrigatoriamente

A V1.2 representa o primeiro checkpoint artisticamente promissor do projeto.

Não descartar:

- Geometrias atuais das lâminas.
- Formato e pintura das armas.
- Cachecol.
- Capa.
- Roupas.
- Cinto e caveira.
- Botas.
- Paleta de cores.
- Texturas procedurais.
- Sistema de materiais.
- Separação entre painter e pose.
- Organização modular.
- Caches e desenhos existentes.

As melhorias devem ser incrementais.

**Não reconstruir o personagem inteiro quando o defeito estiver localizado em uma parte específica.**

---

## 13. O que não repetir

- Personagens feitos de círculos e cápsulas.
- Cabelo vetorial genérico.
- Armas triangulares ou machados genéricos.
- Correntes feitas de linhas finas.
- Mãos coladas superficialmente nas empunhaduras.
- Uso de PNG oficial durante o idle.
- Substituição por desenho simplificado durante animações.
- Redução de detalhes para facilitar rigging.
- Espelhamento automático de orientações assimétricas.
- Avançar para combate antes de resolver a arte.
- Declarar que a existência de pivôs significa integração com rig.

---

## 14. Checklist de continuidade

### Arte

- [x] Renderer procedural V1.2.
- [x] Personagem completo em Canvas 2D.
- [x] Lâminas com direção visual aprovada.
- [x] Roupas com direção visual positiva.
- [x] Texturas determinísticas.
- [ ] Mãos com pegada realmente convincente.
- [ ] Correntes metálicas grossas.
- [ ] Correntes enroladas nos antebraços.
- [ ] Ancoragens físicas das correntes.
- [ ] Ajustes finos do rosto.
- [ ] Refinamento das mechas do cabelo.
- [ ] Melhor correspondência de proporções com referências.

### Arquitetura

- [x] Componentes de pintura separados.
- [x] Pivôs declarativos.
- [x] Transformações locais parciais.
- [x] Presets estáticos.
- [ ] Braço superior e antebraço independentes.
- [ ] Cotovelos articuláveis.
- [ ] Mãos com transformação própria.
- [ ] Coxas e canelas independentes.
- [ ] Joelhos e tornozelos articuláveis.
- [ ] Oclusão adequada das articulações.
- [ ] Adaptador integrado ao RIG-01.
- [ ] Validação do mesmo painter sob movimento.
- [ ] Duas orientações anatômicas reais.
- [ ] Aprovação visual estática.
- [ ] Aprovação visual sob articulação.

---

## 15. Próximo passo recomendado

**Prioridade imediata: mãos + correntes.**

As lâminas já têm uma direção visual aprovada. Não há motivo para redesenhá-las integralmente.

O próximo agente deverá trabalhar de maneira localizada:

**Primeira intervenção:** redesenhar a pegada das mãos, dedos e polegares.

**Segunda intervenção:** reconstruir as correntes para transmitir metal pesado, com elos robustos e voltas pelos antebraços.

**Terceira intervenção:** calibrar o rosto e cabelo contra `hero-part-head.png`.

**Quarta intervenção:** melhorar as articulações locais sem degradar a aparência.

**Quinta intervenção:** conectar progressivamente o renderer ao RIG-01 e validar o mesmo personagem em diferentes poses.

Não implementar novos sistemas de gameplay nesta fase.

---

## 16. Regra final para qualquer agente

O HERO-02 não é apenas uma ilustração bonita.

É um personagem destinado a ser animado proceduralmente, com identidade visual preservada.

O resultado final desejado é um assassino chibi, musculoso, com cabelo volumoso, olhar vermelho, roupas artesanais e duas grandes adagas infernais acorrentadas aos braços.

**As armas não são machados. São grandes lâminas/adagas assassinas, curvas, banhadas em fogo e sangue, ligadas por correntes pesadas.**

O renderer deve continuar sendo procedural.

O futuro rig deve movimentar exatamente a mesma arte.

**Não trocar de personagem durante a animação. Não reduzir os detalhes. Não reiniciar o projeto.**

### Estado final do checkpoint

**HERO-02 V1.2: avanço artístico promissor, com lâminas bem recebidas pelo usuário, mas ainda com pendências de mãos, correntes, rosto e preparação anatômica para rigging.**

**A integração real com RIG-01 permanece pendente.**

O próximo passo é continuar o refinamento visual do mesmo renderer antes de validar animações procedurais.

**Fim do handoff.**