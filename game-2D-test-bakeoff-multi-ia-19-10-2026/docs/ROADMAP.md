# Roadmap de Entregas — @game2d

**Última atualização:** 19/10/2026.
O roadmap segue o planejamento consolidado em `docs/prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`.

---

## Estrutura da Fase 1 — Conclusão do Herói Procedural

| Etapa | Objetivo | Entregáveis | Estado |
|---|---|---|---|
| **0. Investigação e Linha de Base** | Estudar conversa Rafa + Claude (`RafaxLab-YTB/CONVERSA-...`) e auditar protótipos aprovados (`chatgpt` e `antigravity`). | Diagnóstico inicial e cronologia técnica em `AVALIACAO-IA/` | **Concluído / Base Ativa** |
| **1. Fidelidade Visual do Herói** | Reconstruir o herói em Canvas 2D usando `hero-parts` (Rosto + Corpo + Arma), igualando ou superando ChatGPT e Antigravity. | Personagem renderizado por código, proporções fiéis, adagas do caos com pegada real das mãos. | **Em andamento / Prioridade** |
| **2. Rig e Animações Procedurais** | Implementar esqueleto matemático, pivôs locais, hierarquia corporal, idle, passada de corrida/caminhada e ataques com adagas. | Rig funcional, foot lock, física de correntes vinculada e animações contínuas. | **Próximo Passo** |
| **3. Arena de Testes, Inimigos e Combos** | Arena jogável no navegador baseada em `map-island-enemys.png`, controles WASD, ataques encadeados em combos e inimigos interativos com dano. | Protótipo jogável com combate real, hurtboxes, reações e efeitos de impacto. | **Planejado** |
| **4. Correções, Refinamento e 200 FPS** | Polimento de hitboxes, fluidez, eliminação de regressões e validação do piso de 200 FPS em 1280 × 720. | Pacote final validado, relatórios de performance e entrega para avaliação do juiz. | **Planejado** |

---

## Critérios de Aceite por Etapa

1. **Gate Visual (Etapa 1):** O herói renderizado em Canvas 2D deve ter qualidade igual ou superior aos protótipos aprovados de ChatGPT e Antigravity, preservando com precisão a anatomia de `hero-parts` e a identidade das adagas infernais acorrentadas.
2. **Gate de Articulação (Etapa 2):** O rig deve manter proporções estáveis durante giros e passadas, sem deslizamento do pé de apoio e sem quebrar as empunhaduras ou as correntes presas aos braços.
3. **Gate de Jogabilidade (Etapa 3):** O usuário/juiz deve conseguir carregar a página no navegador, mover o personagem por WASD, desferir combos de ataques com as adagas e observar dano/reação real nos inimigos de teste.
4. **Gate de Performance (Etapa 4):** Atingir ou superar 200 FPS sustentados em 1280 × 720 nativo sem cap de vsync.

---

## Entregáveis Documentais Obrigatórios (`AVALIACAO-IA/`)

Cada IA deve estruturar em sua pasta de trabalho:
- `01-DIAGNOSTICO-INICIAL.md`
- `02-CRONOLOGIA-RAFA-CLAUDE.md`
- `03-COMPARATIVO-DOS-APROVADOS.md`
- `04-FIDELIDADE-VISUAL.md`
- `05-IMPLEMENTACAO-E-RIG.md`
- `06-ARENA-E-COMBATE.md`
- `07-TESTES-E-VALIDACAO.md`
- `08-ENTREGA-AO-JUIZ.md`
