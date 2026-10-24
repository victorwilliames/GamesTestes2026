# RafaxLab-YTB — Base de conhecimento dos agentes do @game2d

Canal: https://www.youtube.com/@rafaxlab

**Missão:** registrar tudo que aprendermos com Rafael e transformar observações em experimentos **visuais, verificáveis e reproduzíveis** no nosso jogo 2D/fake 2.5D — sem Blender.

## Comece por aqui

**Agente novo? Leia nesta ordem (menos de 10 minutos):**

1. **[00-COMECE-AQUI.md](00-COMECE-AQUI.md)** — resumo executivo, diretrizes da Fase 1, o que é fato e próximas tarefas.
2. **[01-METODO-COM-EVIDENCIAS.md](01-METODO-COM-EVIDENCIAS.md)** — como Rafael descreve o processo, com minutagem e limitações.
3. **[03-CRITICO-VISUAL.md](03-CRITICO-VISUAL.md)** — como revisar e auditar screenshots reais.
4. **[CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/](CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/)** — investigação mandatória da conversa de criação do piloto.

## Biblioteca

| Arquivo / Diretório | Quando ler |
|---|---|
| [CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/](CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/) | **Fonte primária obrigatória**: conversa completa na íntegra de Rafa e Claude |
| [videos/Vi8wJKNYRp8.md](videos/Vi8wJKNYRp8.md) | Auditoria visual cronológica do vídeo #002 |
| [videos/transcricao_Vi8wJKNYRp8.txt](videos/transcricao_Vi8wJKNYRp8.txt) | Transcrição textual com timestamps do #002 |
| [videos/mp5Z2z2FcBg.md](videos/mp5Z2z2FcBg.md) | Vídeo #001: notas de pesquisa |
| [APRENDIZADOS.md](APRENDIZADOS.md) | Síntese técnica cumulativa e arquitetura |
| [FONTES_E_EVIDENCIAS.md](FONTES_E_EVIDENCIAS.md) | Origem e certeza de cada afirmação técnica |
| [MODELO_NOVA_ANALISE.md](MODELO_NOVA_ANALISE.md) | Como cadastrar um próximo vídeo |

## 3 verdades para não repetir nosso erro

1. **Segundo Rafael, Dunloc é feito por desenho por código no Canvas 2D**: cenário estático pintado no carregamento, partes móveis durante o jogo (fala transcrita 00:35–02:18). É um relato do autor; o código completo não foi auditado por nós.
2. O vídeo **mostra tanto o Dunloc maior quanto um piloto menor**. No piloto, Claude usa referências geradas por IA, vetor 2D com tinta HQ, esqueleto matemático, animação por poses e crítica de screenshots. O piloto **não é** a base integral demonstrada do Dunloc.
3. **Não foi um prompt perfeito**: telas do piloto registram 7 mensagens humanas, 55 respostas de Claude, 594 ações, 170 imagens e 6 relatórios críticos. Ele precisou refinar personagem/rosto, oclusão, movimentos e armamento.

## O que é regra no @game2d HOJE

- **Metodologia de Investigação:** Investigar detalhadamente a conversa na íntegra de Rafa e Claude em [`RafaxLab-YTB/CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/`](CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/).
- **Protótipos Aprovados de Linha de Base:** `prototypes/chatgpt/desenho-v1-chatgpt` e `prototypes/antigravity/desenho-v1-antigravity`.
- **Referências Oficiais Vigentes:** `assets/references/ref-2d-hero/hero-parts/` (Rosto + Corpo + Arma) e `assets/references/ref-2d-maps/map-island-enemys.png`.
- **Identidade e Armas:** Rogue/Assassin com duas adagas infernais do caos acorrentadas aos braços (Blades of Chaos / Kratos — **NÃO SÃO MACHADOS**), com pegada anatômica real das mãos e correntes grossas de ferro escuro.
- **As Quatro Etapas da Fase 1:**
  1. Fidelidade visual usando `hero-parts` (superando os aprovados).
  2. Rig e animações procedurais em Canvas 2D.
  3. Arena de testes jogável com inimigos reais e combos.
  4. Refinamento e 200 FPS inegociáveis a 1280 × 720.

## Como manter viva esta biblioteca

Novo vídeo → `videos/<id>.md` com timestamps e rótulos **observado / fala transcrita / pedido no prompt / relato do agente / inferência** → atualizar `APRENDIZADOS.md` → atualizar o handoff do projeto.

**Fontes ≠ implementação validada.** Cada novo teste requer código, screenshot real e aprovação.
