# Método de Rafael — reconstrução com evidências

## Fonte e cautela

Canal: https://www.youtube.com/@rafaxlab

Vídeo principal: https://www.youtube.com/watch?v=Vi8wJKNYRp8&t=1s

**Fontes analisadas:** MP4 (27m57s) fornecido pelo usuário, inicialmente sem faixa de áudio, e posteriormente uma transcrição textual presente no repositório `videos/transcricao_Vi8wJKNYRp8.txt`. A transcrição pode conter erros de reconhecimento de nomes/termos. Quando necessário, confirmar palavras contra vídeo original. Os timestamps são aproximados.

## Pipeline reconstruído

### 1. Experimentação anterior + pedido aberto (~02:40–04:50)
Rafael explica que havia tentado diferentes técnicas e já tinha imagens/testes no projeto. Apresentou a Claude um problema real: animações inconsistentes; pediu mini-game de corrida e ataque de espada e deixou o agente escolher o método, usando Hades como linguagem de referência.

**Evidência:** fala transcrita ~03:19–04:35 e ações na tela. **Consequência:** não foi uma folha em branco nem um único comando autossuficiente.

### 2. Agentes inspecionam fontes e criam contratos (~03:50–05:55)
Claude examina sprites existentes, monta pranchas comparativas, testa uma base matemática, prepara contratos para módulos/agentes paralelos e um boneco matemático invisível articulado.

**Evidência:** ~04:00–05:30, transcrição + tela. **Cuidado:** boneco matemático não significa jogo 3D renderizado.

### 3. Comparação de renderers e juízes (~06:02–07:00)
Foram testadas abordagens com renderização 3D e vetor em Canvas 2D. Um julgamento comparativo relatado pelo criador escolheu **vetor Canvas 2D por 2×1**. Depois o agente conferiu screenshots e integrou a proposta.

**Evidência:** fala ~06:02–06:45 e histórico visível. **Cuidado:** esse placar não é benchmark universal nem prova de superioridade para todo projeto.

### 4. Rig + painter como módulos distintos (~07:00–08:30)
O piloto evolui para rig matemático, animação e desenho vetorial em Canvas 2D, criando inicialmente um personagem e cenário simples. Rafael informa que continuou pedindo refinamentos locais ("braço torto", movimento natural), sem mudar a direção artística.

**Evidência:** falas ~07:00–08:30 e histórico de módulos como `rig.ts`, `anim.ts`, `personagem/vetor.ts`, `cenario/`, `efeitos/` (~08:10). **Não confirmar nomes de arquivos adicionais sem fonte.**

### 5. Como usou referências de rosto (~08:34–10:20; ~11:00–12:54)
Apenas uma imagem frontal de uma cabeça serviu como referência. Rafael diz que conectou o Nano Banana para gerar mais referências angulares da cabeça; um crítico julgava semelhança. Houve refinamento detalhado por regiões do rosto, e o processo levou horas.

**Evidência:** fala ~09:04–10:14 e frames de geração de referência. **Importante:** a IA **não sabia o corpo pelo rosto**. No piloto, o usuário especificou **cavaleiro com armadura** e a IA preencheu os detalhes do corpo/roupa; depois o usuário corrigiu o design. A referência é guia de arte, **não imagem renderizada automaticamente pelo jogo**.

### 6. Prompt do piloto menor (~13:50–17:25)
Rafael dita as regras: pequeno RPG isométrico em Canvas 2D; sem WebGL, engine nem imagens no runtime; esqueleto 3D invisível com IK de braços/pernas; pose-chave com antecipação/ataque/recuperação; tinta HQ em 2–3 tons e contorno escuro; cenário estático desenhado uma vez no offscreen; personagem/VFX desenhados durante a execução. Movimento WASD, clique para atacar; rosto de referência; agente crítico e screenshots de navegador antes da entrega.

**Evidência:** fala transcrita ~13:50–17:22. **Cuidado:** requisitos do prompt não comprovam sozinhos a implementação de cada detalhe; a demo e relatórios mostram resultado parcial.

### 7. Execução com tentativas e crítico (~17:45–22:20)
O piloto passa por uma longa execução com criação de referências auxiliares e protótipo. A tela mostra um histórico de **7 mensagens humanas, 55 respostas do Claude, 594 ações, 170 imagens, 6 relatórios críticos**, além de depuração de cache de screenshots, oclusão da capa e profundidade. Rafael diz explicitamente que não foi apenas um prompt perfeito.

**Evidência:** página de auditoria na tela ~20:25; fala ~20:20–22:30.

### 8. Foco estreito no rosto (~22:50–24:45)
Como o rosto ficou distante da referência, o usuário deu uma instrução **bem específica para melhorar somente a vista Sul**. O agente dividiu rosto em landmarks (olhos, boca, nariz, cabelo, contorno), comparou partes visualmente e iterou com crítico até aprimorar. O narrador indica que ainda havia limitações de movimento e arma.

**Evidência:** transcrição ~22:54–24:18 e screenshots do processo.

### 9. Resultado e limites (~24:45–27:55)
O piloto funciona e o personagem anda/ataca no navegador, mas o próprio Rafael reconhece movimentos tortos, espada invertida e necessidade de novas iterações. Ele relata que **a demo e o projeto principal usam desenho por código, e que não há imagens de runtime**; está dizendo como seu jogo foi feito, não exibindo todo o código de Dunloc.

**Evidência:** fala ~24:45–27:25. **Distinção:** `afirmação do autor` ≠ `auditoria integral independente`.

## Sobre o Dunloc (jogo maior) vs piloto de prova

**O que Rafael afirma:** em Dunloc, ele diz que cenários, monstros e personagens são gerados/destacados por código. Parte estática do cenário é pintada quando o jogo carrega; elementos móveis, em tempo de execução, no Canvas 2D (~00:35–02:18).

**O que a filmagem demonstra:** game bonito em funcionamento, muitas cenas, piloto separado com processo de iteração. O vídeo **não fornece código completo do Dunloc para auditarmos**. Não tratar a experiência menor como fonte única de todo o jogo final.

## Lições transferíveis

- Desenho não começa por IK: começa por **linguagem visual codificada** (silhueta, curva, contorno, pintura e proporção).
- IA produz soluções melhores quando pode avaliar alternativas e fazer crítica visual.
- O processo tem estágios: pesquisa → referência → quadro único → avaliação → refinamento → rig/animação → cenário/VFX → testes.
- Animação consistente exige geometria/rig compartilhados; **aparência bonita exige painter próprio**. Um não substitui o outro.
- Cachear estático ajuda desempenho; não é substituto de benchmark no hardware-alvo.
- Criar referências por IA é diferente de exibir assets prontos no Canvas.

## O que não sabemos com certeza

Implementação exata do shader/painter interno de Dunloc, scripts completos, licença de código, todos os prompts, integração do Nano Banana e medições confiáveis de performance cross-device. Não inventar informações ausentes.

Fonte primária de texto: [transcricao_Vi8wJKNYRp8.txt](videos/transcricao_Vi8wJKNYRp8.txt). Ver também [análise da filmagem](videos/Vi8wJKNYRp8.md).
