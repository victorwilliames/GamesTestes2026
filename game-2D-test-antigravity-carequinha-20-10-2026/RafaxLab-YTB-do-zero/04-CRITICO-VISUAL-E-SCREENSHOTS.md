# 04 — O Agente Crítico Visual e Validação por Screenshots

Este documento detalha como configurar a **bancada de testes visuais automatizados**, o mesmo método utilizado por Rafael e Claude no desenvolvimento do piloto.

---

## 1. Por Que o Agente Crítico É Obrigatório?

Testes unitários tradicionais (Jest, Mocha) e scripts de sintaxe são cegos para:
- Cores desarmônicas ou falta de contraste.
- Silhueta ilegível contra o fundo.
- Oclusão incorreta (ex.: capa penetrando a armadura ou espada sumindo).
- Membros esticados de forma bizarra pela IK.
- Rostos que não se parecem com a referência visual.

No processo do RafaxLab, **uma tarefa só é dada como concluída quando o agente crítico inspeciona screenshots reais do navegador e aprova a imagem**.

---

## 2. A API de Depuração Exposta no Jogo (`window.DBG`)

Para que um script de automação (como Playwright ou Puppeteer) possa capturar qualquer momento do jogo de forma 100% determinística, o motor do jogo expõe a interface `window.DBG`:

```javascript
window.DBG = {
  // Pausa a execução do jogo ou avança exatamente 'n' quadros de 1/60s:
  pause: (state) => { /* ... */ },
  step: (frames) => { /* ... */ },

  // Simula um ataque mirando exatamente nas coordenadas (wx, wy) do chão:
  click: (wx, wy) => { /* ... */ },

  // Simula o pressionamento e soltura de teclas (WASD):
  key: (code, isDown) => { /* ... */ },

  // Liga/desliga o modo esqueleto (ossos, alvos de IK e vetores polares):
  debug: (enabled) => { /* ... */ },

  // Retorna métricas de telemetria (tempo de renderização em ms por quadro):
  info: () => ({ ms: avgDrawTime, state: currentState })
};
```

---

## 3. O Prompt Completo do Agente Crítico (Original de Claude/Rafa)

Quando for disparar a revisão visual da sua IA (em um subagente ou em um novo turno de conversa), use este **prompt de crítico formal**:

```text
Você é um CRÍTICO DE ARTE E DE GAME DESIGN rigoroso. Avalie um piloto de RPG isométrico feito em Canvas 2D e devolva uma lista priorizada de problemas concretos com correções sugeridas. NÃO edite nenhum arquivo do projeto (revisão somente leitura). Responda em português.

## O que é o projeto
- Jogo em Canvas 2D puro com câmera isométrica 3/4.
- Sem WebGL, sem engines externas e sem imagens carregadas no runtime.
- Personagem com esqueleto 3D invisível, IK analítica de 2 ossos em braços e pernas, poses-chave de combo de espada estilo Hades.
- Estilo HQ: 2 a 3 tons chapados (cel-shading) e contorno de tinta escuro.
- Cenário gerado e cacheado em offscreen canvas.

## O que capturar e inspecionar
1. Visão geral da arena e do herói perto das bordas e árvores.
2. Idle de perto (recorte ampliado 2x a 3x): rosto, cabelo, expressão e armadura.
3. Corrida nas 4 direções cardeais (W, A, S, D).
4. Combo completo de 3 golpes em múltiplos ângulos de mira (frontal, lateral, costas).
5. Modo esqueleto ligado (tecla B) durante o impacto do golpe para checar a IK.
6. Console do navegador para checar erros, alertas e tempo de renderização em milissegundos.

## Critérios de Avaliação
A) Arte: Sensação de RPG de ação no estilo Hades; proporções, silhueta e legibilidade; semelhança do rosto com a referência; contraste de luz/sombra.
B) Animação: Poses-chave com antecipação, golpe e recuperação claras; arcos de ataque fluidos; articulações de cotovelo e joelho dobrando para o lado correto (vetores polares).
C) Técnica: Garantir que não há imagens PNG sendo exibidas via drawImage no runtime do jogo; checar cache offscreen do terreno.
D) Bugs Visuais: Ordenação de profundidade (z-order) errada; capa atravessando a armadura; transpassamento de lâmina.

## Formato Obrigatório de Resposta
1. Veredito geral em 3 a 5 linhas (notas de 0 a 10 para Arte e para Animação).
2. Lista priorizada de problemas (Severidade: ALTA / MÉDIA / BAIXA).
   Para cada problema: o que está errado, em qual screenshot aparece e correção concreta sugerida (arquivo, função ou ajuste geométrico).
3. O que já está bom e deve ser PRESERVADO.
Seja específico e honesto; não elogie sem justificativa.
```

---

## 4. O Fluxo de Trabalho do Ciclo de Correção

O ciclo iterativo que garantiu o sucesso do piloto seguiu este laço fechado:

```
[Desenvolvedor / IA]
       │
       ▼
Gera ou altera arquivos JS
       │
       ▼
Servidor local serve sem cache (no-store)
       │
       ▼
Playwright / Puppeteer headless navega e captura screenshots
       │
       ▼
[Agente Crítico] analisa imagens e emite relatório com notas e defeitos
       │
       ├─ Se REPROVADO ──> Desenvolvedor corrige o defeito apontado ──┘
       │
       └─ Se APROVADO ───> Entrega final para o desenvolvedor humano testar!
```
