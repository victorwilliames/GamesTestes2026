# Fase 1 — plano de implementação

**Objetivo:** entregar uma primeira versão inspecionável do herói estático, seguindo o prompt local e as imagens do carequinha.
**Spec:** `prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`, seção FASE 1.
**Execução:** nesta sessão, por módulos. Sem Git disponível; sem commits/worktrees.
**Onde fica o código:** `prototipos/do-deepseek/prototipo-v1-deepseek/` (bake-off entre IAs — ver `prototipos/README.md`). Todos os caminhos `js/…` e `tests/…` deste plano são **relativos a essa pasta**, não à raiz.
**Arquitetura:** scripts clássicos com namespace `Pilot`, compatíveis com servidor estático e abertura local. Pontos 3D e projeção ortográfica em core; pincéis em ink; cabeça e corpo separados. Pose fixa, sem simular rig/IK que ainda não existem.
**Stack:** HTML, CSS, JavaScript e Canvas 2D nativos. Node apenas para servidor/testes.

## Restrições globais
- Sem imagens no runtime, bibliotecas externas ou gradientes borrados.
- Câmera yaw 45°, pitch 34°. Cel-shading por `clip()` e deslocamento.
- Carequinha, sobrancelhas fortes, torso musculoso, lenço vermelho, caveira e duas adagas curvas acorrentadas; dedos envolvendo cabos.
- Não implementar fases 2–4, mas capturar a fase 1 em navegador para verificar sua entrega.

## Tarefas e interfaces
- [ ] 1. `js/core.js`: `Pilot.project([x,y,z]) -> [sx,sy,depth]`, `Pilot.localPoint([right,forward,up], yaw)` e vetores; testes de projeção/rotação em `tests/core.test.cjs`. Executar `node --test tests/*.test.cjs`.
- [ ] 2. `js/ink.js`: paths, `celFill(ctx,path,tones,offset)`, contornos. `js/head.js`: `drawHead(ctx, anchor, scale)` com marcos de cabeça projetados. `js/hero.js`: `drawHero(ctx)` com pose fixa e detalhes sobre os pontos projetados. Verificar desenho real no Chrome.
- [ ] 3. `index.html`, `styles.css`, `js/studio.js`: prancha estática com canvas grande e detalhe do rosto, ajuste de escala/fundo. Redesenhar só ao redimensionar ou mudar controle. Estados acessíveis, sem controles de gameplay fictícios.
- [ ] 4. `tools/serve.cjs`, testes e screenshots em `artifacts/`; inspeção visual desktop e viewport estreito, revisar mãos/correntes/cabeça e clipping. Atualizar README/memória com limitações.

## Foco da revisão
1. Redimensionamento e DPR não devem cortar o herói nem borrar o canvas.
2. Miniatura e zoom devem usar o mesmo painter, sem arte alternativa.
3. Cabos precisam tocar mãos e correntes precisam terminar nos punhos/armas.
4. Nenhum request externo ou imagem de referência no runtime.
5. Corpo/cabeça legíveis no fundo escuro e claro, com oclusão coerente na pose fixa.

## Evidências
Pendente: testes, screenshots reais e crítica final. Aprovação artística pertence ao usuário.

## ESCOPO ATUAL (substitui o recorte estático acima)
O usuário esclareceu: piloto jogável completo como o Rafa, UMA ESPADA permitida no lugar das adagas para facilitar. A regra de ouro é seguir a conversa original. Implementar as etapas abaixo na sequência; referência visual nossa, arquitetura/método do Rafa.
- [x] Matemática e IK analítica com testes de comprimento/pole/alcance degenerado. (`js/core.js`, `js/rig.js`; `node --test tests/*.test.cjs` verde.)
- [~] Rig 3D + poses-chave e painter HQ do carequinha e espada na mão: **feito** (`rig.js`, `head.js`, `hero.js`, bancada `index.html`; render verificado). Falta `turnaround.html` e `face.html` para inspeção.
- [ ] Campo/ruínas com terreno OffscreenCanvas e sprites de vegetação cacheados.
- [ ] WASD, mira, combo 3 com buffer, B esqueleto/poles/targets e T 25%; FX e vento.
- [ ] Servidor sem cache 5317, screenshots reais headless, crítico independente, correções e regressão.
Interfaces: core proj/localPoint/vec; rig solveIK/makeRig/Combat; hero drawHero(ctx,rig); world World.drawGround/drawProp; fx Effects; main window.DBG pause/step/key/click/debug/info. As bancadas usam os mesmos painters do jogo.
