# MISSÃO PRINCIPAL — REPRODUZIR O PROCESSO DE RAFA + CLAUDE E CONCLUIR NOSSO HERÓI PROCEDURAL

## ATENÇÃO — LEIA INTEGRALMENTE ANTES DE EXECUTAR

Estamos desenvolvendo um herói 2D com geração e montagem procedural, rig, animações e combate.

Diferentes IAs estão trabalhando independentemente. Cada uma possui sua própria pasta de desenvolvimento. Ao final, um juiz independente avaliará os resultados.

**Nosso objetivo é reproduzir meticulosamente o processo que Rafa e Claude utilizaram para construir o projeto procedural deles, aproveitando também os melhores avanços já alcançados pelas nossas IAs.**

Não queremos recomeçar do zero.

Não queremos apenas documentação.

Queremos chegar a um resultado visual e funcional igual ou superior aos nossos melhores protótipos e avançar até um herói animado, com rig, adaga, arena de testes, inimigos e combos.

---

# 1. PROTÓTIPOS APROVADOS — REFERÊNCIAS PRIORITÁRIAS

**ATENÇÃO: EXISTEM EXATAMENTE DUAS IMPLEMENTAÇÕES QUE DEVEM SER CONSIDERADAS NOSSAS PRINCIPAIS REFERÊNCIAS DE QUALIDADE ATUAL.**

## REFERÊNCIA A — CHATGPT

`prototypes/chatgpt/desenho-v1-chatgpt`

## REFERÊNCIA B — ANTIGRAVITY

`prototypes/antigravity/desenho-v1-antigravity`

Essas são as implementações que apresentaram os melhores resultados visuais e chegaram mais longe entre as tentativas realizadas até agora.

**Elas são a nossa linha de base visual e técnica.**

Você DEVE:

1. Examinar detalhadamente ambas as implementações.
2. Executá-las, se o ambiente permitir.
3. Analisar o código-fonte, os algoritmos e a arquitetura.
4. Identificar como cada uma produziu o visual do herói.
5. Identificar os sistemas procedurais que funcionam.
6. Identificar o que já existe em relação a rig e animações.
7. Descobrir quais componentes podem ser reutilizados ou aprimorados.
8. Comparar as duas soluções com sua própria implementação.
9. Aproveitar os melhores avanços tecnicamente compatíveis.
10. Buscar resultado visual pelo menos equivalente ao melhor resultado demonstrado entre elas.

## IMPORTANTE SOBRE OS DEMAIS PROTÓTIPOS

Outros protótipos existentes em `prototypes/` foram tentativas anteriores que **não foram aprovadas**.

Eles NÃO devem ser utilizados como referência principal de qualidade.

Podem ser consultados secundariamente para:

- Identificar problemas e limitações.
- Estudar abordagens que falharam.
- Evitar erros já cometidos.
- Entender decisões técnicas que não produziram o resultado desejado.

Não adote uma implementação rejeitada simplesmente porque possui mais arquivos, mais código ou uma arquitetura aparentemente elaborada.

**Os melhores resultados aprovados de ChatGPT e Antigravity são a referência mínima que queremos alcançar ou superar.**

---

# 2. REGRA DE ISOLAMENTO ENTRE IAs

Cada IA trabalha exclusivamente na própria pasta atribuída.

Você tem autorização para:

- Ler os protótipos de ChatGPT e Antigravity.
- Executar suas versões sem modificá-las.
- Copiar código e recursos tecnicamente úteis para sua própria pasta.
- Adaptar e combinar soluções comprovadamente compatíveis.
- Aproveitar seus algoritmos e estruturas.
- Utilizar os assets compartilhados do projeto.

Entretanto:

- NÃO modifique as pastas de outras IAs.
- NÃO apague arquivos de outros protótipos.
- NÃO sobrescreva as referências aprovadas.
- NÃO modifique arquivos compartilhados na raiz do repositório.
- NÃO dependa de caminhos externos à sua pasta para executar sua entrega final.
- NÃO execute comandos Git destrutivos.

Todas as modificações, implementações, testes, dependências locais e evidências devem permanecer em sua própria pasta.

Identifique seu diretório atribuído antes de alterar arquivos. Caso não seja possível identificá-lo inequivocamente, solicite essa informação.

Se uma das referências aprovadas for também sua pasta de trabalho atribuída, você poderá continuar desenvolvendo nela, preservando o estado inicial e sem interferir nos demais projetos.

---

# 3. REFERÊNCIA PRINCIPAL DE METODOLOGIA — RAFA + CLAUDE

Local obrigatório:

`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural`

Caminho local:

`D:\.GITHUB\games\game-2d\RafaxLab-YTB\CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural`

## ESTA É A INVESTIGAÇÃO MAIS IMPORTANTE DA MISSÃO

Queremos entender **exatamente como Rafa e Claude chegaram ao resultado funcional**, e não apenas conhecer o resultado final.

Leia a conversa completa, na ordem cronológica original.

Reconstrua cada etapa importante:

1. O que Rafa pediu.
2. Quais referências foram enviadas.
3. Como Claude interpretou a solicitação.
4. Qual solução técnica Claude escolheu.
5. Por que essa solução foi escolhida, quando houver evidências disso.
6. Quais arquivos, códigos e algoritmos foram utilizados.
7. Quais ferramentas ou procedimentos foram executados.
8. Quais erros aconteceram.
9. Quais tentativas falharam.
10. Como Claude corrigiu esses problemas.
11. O que Rafa testou e confirmou.
12. Qual solução permaneceu funcionando.

**Não atribua ao Claude decisões ou justificativas que não estejam documentadas.**

Não confunda uma proposta de implementação com uma solução efetivamente testada.

Busque identificar o processo técnico reproduzível que levou ao sucesso.

## RESULTADO OBRIGATÓRIO DA INVESTIGAÇÃO

Produza uma cronologia técnica que permita responder:

- Como Claude partiu das referências visuais?
- Como recriou e organizou o personagem?
- Como construiu ou integrou o rig?
- Como resolveu articulações e movimentos?
- Como organizou animações e ataques?
- Como colocou o personagem no ambiente de testes?
- Como testou inimigos, golpes e combos?
- Quais erros precisaram ser resolvidos?
- Quais técnicas foram decisivas para o funcionamento?

Se a sequência real for diferente da nossa hipótese inicial, documente e siga a sequência comprovada.

**A PRIORIDADE É REPRODUZIR OS PRINCÍPIOS E PROCEDIMENTOS QUE REALMENTE FUNCIONARAM, E NÃO IMITAR CEGAMENTE CÓDIGO INCOMPATÍVEL.**

---

# 4. REFERÊNCIAS OFICIAIS DO NOSSO HERÓI

Local:

`assets/references/ref-2d-hero/hero-parts`

Caminho local:

`D:\.GITHUB\games\game-2d\assets\references\ref-2d-hero\hero-parts`

Examine integralmente essa pasta.

É a referência oficial da identidade visual do personagem.

Queremos preservar com fidelidade:

- Rosto.
- Corpo.
- Proporções.
- Silhueta.
- Roupas.
- Cores.
- Detalhes característicos.
- Arma.
- Organização das partes.

Nosso objetivo é alcançar uma aparência o mais próxima possível das referências originais, idealmente com fidelidade visual praticamente total.

Não substitua características importantes por formas genéricas.

## DIFERENÇA ENTRE NOSSO PROCESSO E O DE RAFA

Nosso entendimento inicial é que Rafa forneceu uma referência do rosto e Claude desenvolveu o restante.

No nosso caso, temos referências mais completas:

**ROSTO + CORPO + ARMA.**

Portanto, utilizaremos essas três referências para reduzir ambiguidades e aumentar a fidelidade.

O herói precisa continuar reconhecível durante:

- Montagem procedural.
- Movimentação.
- Animação.
- Ataques.
- Combos.

O sistema procedural deve preservar a identidade do personagem, não gerar heróis aleatórios que descaracterizem as referências.

---

# 5. DOCUMENTO FUNDAMENTAL — ADAGA DE SANGUE E FOGO DO CAOS

Leia integralmente:

`docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`

Caminho local:

`D:\.GITHUB\games\game-2d\docs\prompts a executar\contexto-sobre-a-arma-do-hero.md`

Esse documento define características importantes sobre nosso herói, sua arma e seu comportamento em combate.

## IDENTIDADE DA ARMA

**ADAGA DE SANGUE E FOGO DO CAOS.**

A inspiração conceitual é a intensidade de combate de Kratos, de God of War.

Entretanto, nossa arma NÃO é um machado.

É uma adaga com identidade de assassino/thief.

Ela deve possuir comportamento compatível com as habilidades descritas no documento.

A implementação deverá considerar:

- Forma de empunhar a adaga.
- Posição da arma em relação ao rig.
- Golpes e suas animações.
- Sequências de combos.
- Detecção de acertos.
- Sincronização entre movimento e dano.
- Efeitos associados à arma.
- Características especiais documentadas.

Não invente habilidades incompatíveis com o material oficial.

Não transforme a adaga em espada, machado ou arma genérica.

---

# 6. NOSSA META — AS QUATRO ETAPAS DE RAFA

A organização abaixo representa nosso entendimento inicial sobre o processo utilizado por Rafa e Claude.

**Você deve investigar a conversa e confirmar essa sequência antes de adotá-la como definitiva.**

## ETAPA 1 — RECRIAR O HERÓI COM FIDELIDADE VISUAL

Reproduzir a etapa em que Claude transformou as referências de Rafa em um personagem.

No nosso caso, utilizar:

- Rosto original.
- Corpo original.
- Arma original.

Examine como Claude produziu o personagem e adapte a técnica ao nosso herói.

**Critério de aceitação:**

O resultado visual deve igualar ou superar o melhor dos dois protótipos aprovados de ChatGPT e Antigravity, preservando a identidade das referências oficiais.

Não avance automaticamente para sistemas mais complexos se o visual estiver claramente inferior e ainda for possível corrigi-lo.

## ETAPA 2 — RIG E ANIMAÇÕES

Investigue como Claude estruturou o rig e reproduza os métodos comprovados ou adaptações equivalentes.

Implementar, conforme necessário:

- Hierarquia das partes.
- Pivôs corretos.
- Cabeça, tronco e quadril.
- Braços, cotovelos e mãos.
- Pernas, joelhos e pés.
- Posicionamento da adaga.
- Animações de idle.
- Caminhada e/ou corrida.
- Ataques.
- Transições entre movimentos.

**Critério de aceitação:**

Herói articulado, com movimento funcional e aparência preservada.

Não basta movimentar um sprite inteiro ou desenhar linhas representando ossos sem integração real às partes visuais.

## ETAPA 3 — MAPA DE TESTES, INIMIGOS E COMBOS

Investigue como Rafa e Claude chegaram à fase de testes jogáveis.

Reproduza uma arena equivalente, adaptada ao nosso personagem.

Ela deverá permitir:

- Controlar o herói.
- Caminhar ou correr.
- Executar ataques.
- Utilizar a adaga.
- Encadear combos.
- Atingir inimigos de testes.
- Detectar acertos.
- Aplicar dano.
- Exibir reações dos inimigos.
- Verificar animações e efeitos.

Os inimigos podem ser simples, desde que tenham interações reais suficientes para testar o combate.

**Critério de aceitação:**

O juiz consegue executar o jogo, controlar o personagem, realizar combos e observar efeitos funcionais nos inimigos.

Uma animação de ataque sem colisão, detecção de acerto ou consequência real não é suficiente.

## ETAPA 4 — CORREÇÕES E REFINAMENTO

Após alcançar personagem + rig + arena + combate:

- Corrigir falhas visuais.
- Melhorar fluidez.
- Refinar as animações.
- Ajustar hitboxes.
- Corrigir timing dos combos.
- Melhorar integração da arma.
- Eliminar regressões.
- Validar desempenho.
- Preparar a demonstração final.

Não priorize funcionalidades extras antes de concluir o ciclo funcional principal.

---

# 7. ORDEM OBRIGATÓRIA DE EXECUÇÃO

## FASE A — ENTENDER SEU PRÓPRIO PROJETO

Antes de modificar código, identifique o que já existe e o que funciona.

Execute o protótipo atual quando possível.

Preserve os avanços comprovadamente funcionais.

## FASE B — RECONSTRUIR A CONVERSA DE RAFA

Leia integralmente a conversa e produza uma sequência cronológica com evidências.

Identifique as decisões técnicas, experimentos, erros e soluções finais do Claude.

## FASE C — INVESTIGAR OS DOIS PROTÓTIPOS APROVADOS

Examine:

`prototypes/chatgpt/desenho-v1-chatgpt`

`prototypes/antigravity/desenho-v1-antigravity`

Descubra o que cada um resolveu melhor.

Analise código, renderização, montagem procedural e progresso real do rig.

Não presuma que uma funcionalidade existe apenas porque está mencionada na documentação.

## FASE D — ESTUDAR OS ASSETS E A ARMA

Analise os recursos oficiais de `hero-parts` e o documento da adaga.

Defina os requisitos visuais e funcionais que precisam ser preservados.

## FASE E — MONTAR O PLANO DE REPRODUÇÃO

Associe cada etapa comprovada de Rafa às necessidades do nosso projeto.

Indique:

- Solução original.
- Problema que resolvia.
- Implementação existente equivalente.
- Componentes reutilizáveis.
- Adaptações necessárias.
- Testes que comprovarão o resultado.

## FASE F — IMPLEMENTAR

Execute as alterações reais em sua própria pasta.

Utilize os avanços aprovados disponíveis sempre que isso for tecnicamente vantajoso.

Não reescreva componentes funcionais sem justificativa.

## FASE G — VALIDAR E CORRIGIR

Execute a aplicação e teste:

- Visual.
- Montagem procedural.
- Rig.
- Movimentação.
- Animações.
- Adaga.
- Combos.
- Interação com inimigos.
- Estabilidade.

Quando encontrar defeitos, investigue, corrija e repita os testes.

## FASE H — PREPARAR A ENTREGA

Deixe o projeto executável, com dependências documentadas, testes reproduzíveis e evidências reais.

---

# 8. ENTREGÁVEIS OBRIGATÓRIOS

Dentro da sua própria pasta, crie:

`AVALIACAO-IA/`

Organize os seguintes entregáveis:

**`01-DIAGNOSTICO-INICIAL.md`**

Estado inicial da sua implementação e funcionalidades realmente operacionais.

**`02-CRONOLOGIA-RAFA-CLAUDE.md`**

Reconstrução minuciosa do processo de Rafa, com decisões do Claude, erros, correções e resultados comprovados. Inclua referências verificáveis à conversa original.

**`03-COMPARATIVO-DOS-APROVADOS.md`**

Comparação técnica e visual entre os dois protótipos aprovados de ChatGPT e Antigravity, incluindo quais avanços foram aproveitados.

**`04-FIDELIDADE-VISUAL.md`**

Comparação do herói produzido com os assets oficiais. Identifique correspondências e diferenças restantes.

**`05-IMPLEMENTACAO-E-RIG.md`**

Descrição dos sistemas implementados, arquivos modificados, organização das partes, articulações e animações.

**`06-ARENA-E-COMBATE.md`**

Descrição dos controles, ataques, combos, inimigos, colisões, dano e comportamentos efetivamente implementados.

**`07-TESTES-E-VALIDACAO.md`**

Comandos executados, cenários, resultados, falhas, correções e evidências. Não declare testes que não foram realizados.

**`08-ENTREGA-AO-JUIZ.md`**

Instruções objetivas para executar, testar e avaliar o projeto.

Também entregue:

- Código-fonte integrado.
- Assets necessários dentro da própria pasta.
- Testes executáveis.
- Capturas reais da aplicação.
- Evidências das animações e do rig.
- Evidências dos golpes e combos.
- Demonstração jogável quando o ambiente permitir.

O juiz deve conseguir executar a entrega sem depender das pastas das outras IAs.

---

# 9. O QUE SERÁ CONSIDERADO SUCESSO

O resultado ideal deverá demonstrar:

1. Herói visualmente fiel às referências oficiais.
2. Qualidade visual pelo menos equivalente aos melhores protótipos aprovados.
3. Montagem procedural consistente.
4. Rig corretamente integrado.
5. Animações funcionais.
6. Adaga correta e integrada ao combate.
7. Arena jogável.
8. Inimigos de treinamento.
9. Golpes, combos e dano funcionais.
10. Execução estável e reproduzível.

**Não basta um personagem bonito sem rig.**

**Não basta um rig funcional com personagem visualmente descaracterizado.**

**Não basta uma arena com animações falsas de combate.**

Queremos tudo integrado em uma solução real.

O juiz avaliará os resultados finais de maneira independente. Não atribua a si mesmo uma vitória e não invente comparações que não foram testadas.

---

# 10. REGRAS DE CAMINHOS

Os caminhos começando em:

`D:\.GITHUB\games\game-2d\`

referem-se ao ambiente local Windows.

Em GitHub, Linux, outros computadores ou worktrees, utilize caminhos relativos à raiz do repositório.

Não confunda o prefixo `D:\` com a estrutura obrigatória do projeto.

Localize os arquivos por suas posições reais.

As referências compartilhadas são somente leitura, exceto cópias integradas à sua própria pasta.

---

# 11. PRIORIDADES ABSOLUTAS

**PRIMEIRO:** compreender o processo real de sucesso de Rafa e Claude.

**SEGUNDO:** estudar e aproveitar os avanços aprovados de ChatGPT e Antigravity.

**TERCEIRO:** reconstruir nosso herói com altíssima fidelidade visual usando rosto, corpo e adaga.

**QUARTO:** implementar o rig e as animações com base nas técnicas comprovadas.

**QUINTO:** reproduzir a etapa de mapa de testes, inimigos e combos.

**SEXTO:** corrigir, refinar e validar tudo em execução real.

Não reinicie desnecessariamente o desenvolvimento.

Não privilegie experimentos aleatórios sobre soluções já demonstradas.

Não avance apenas para produzir mais código.

Não entregue somente relatórios quando ainda houver implementação necessária e viável.

---

# 12. INSTRUÇÃO FINAL

Sua missão é reproduzir o caminho de desenvolvimento bem-sucedido de Rafa e Claude, adaptando-o ao nosso herói e aproveitando o que já foi conquistado nas duas implementações aprovadas.

**REFERÊNCIAS APROVADAS:**

`prototypes/chatgpt/desenho-v1-chatgpt`

`prototypes/antigravity/desenho-v1-antigravity`

**REFERÊNCIA METODOLÓGICA PRINCIPAL:**

`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural`

**REFERÊNCIA VISUAL OFICIAL:**

`assets/references/ref-2d-hero/hero-parts`

**REFERÊNCIA DA ARMA E DAS HABILIDADES:**

`docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`

O resultado que buscamos é:

**HERÓI FIEL À REFERÊNCIA → GERAÇÃO/MONTAGEM PROCEDURAL → RIG → ANIMAÇÕES → ADAGA → ARENA → INIMIGOS → COMBOS FUNCIONAIS.**

Cada IA deve desenvolver exclusivamente na sua própria pasta e deixar uma implementação executável e verificável.

Ao concluir, informe precisamente o que foi implementado, testado, validado e o que ainda permanece pendente.

**COMECE PELA INVESTIGAÇÃO CRONOLÓGICA DE RAFA E CLAUDE E PELA AVALIAÇÃO DAS DUAS IMPLEMENTAÇÕES APROVADAS. DEPOIS IMPLEMENTE, EXECUTE, TESTE, CORRIJA E ENTREGUE O MELHOR RESULTADO POSSÍVEL.**