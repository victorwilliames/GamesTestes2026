# Continuidade do projeto

Antes de alterar o projeto, leia `AI-MEMORY.md` e `docs/FASE1-PLANO.md`.
O escopo atual é a fase 1 do prompt local: frame estático do herói em Canvas 2D puro.
Preserve referências originais. Atualize `AI-MEMORY.md` depois de mudanças relevantes e antes de entregar, para permitir troca de modelo sem perder o contexto.
Não afirme que a referência original executa: seus módulos JS estão truncados.

## Escopo confirmado pelo usuário
O alvo é o piloto JOGÁVEL completo (arena, WASD, combo de ESPADA), seguindo a conversa do Rafa como regra de ouro. O recorte estático inicial foi superado. Ler o fim de AI-MEMORY.md e do plano para as correções de escopo.

## Estado real (não confundir com o escopo acima)
Alvo != disco. O código de cada IA vive isolado em `prototipos/do-<autor>/prototipo-v<N>-<autor>/` (bake-off — ver `prototipos/README.md`). No nosso (`prototipos/do-deepseek/prototipo-v1-deepseek/`) existem só `js/core.js`, `js/ink.js` e `js/rig.js` (+ testes verdes). Falta `index.html`, `hero.js`, `head.js`, `world.js`, `fx.js`, `main.js`. Ver a seção "Estado" de AI-MEMORY.md antes de afirmar que algo roda.

## Onde escrever
- Só na **sua** pasta `prototipos/do-<você>/prototipo-v<N>-<você>/`. Nunca edite o protótipo de outra IA.
- `ref/`, `RafaxLab-YTB-do-zero/`, `docs/` e `prompts a executar/` são compartilhados e só-leitura.
- Protótipo deve ser autossuficiente: rode os testes de dentro dele (`node --test tests/*.test.cjs`).
