# NÃO APROVADO — O que aprendemos (DeepSeek)

> **Status:** entrega `desenho-v1-deepseek/` **reprovada pelo autor**.
> Veredito recebido: *"ficou horrível, tá parecendo que foi uma criança que desenhou… tá tudo podre e o jogo parece um jogo antigo 2D, não um jogo 2.5D isométrico como Hades."*
>
> Este documento é a autópsia técnica para a próxima tentativa (minha ou de outra IA) **não repetir os mesmos erros**. Sem defesa, sem desculpa.

---

## 1. Por que pareceu "desenho de criança"

### 1.1 A projeção 2.5D nunca existiu de verdade
- O que eu chamei de "3/4 fake" era um **billboard de frente** com um único truque: `yaw = 0,25` aplicado só ao rosto/cabeça (`src/06-hero.js` → `yawBucket`). O corpo, os membros e o cenário continuam frontais e chapados.
- **Nunca existiu plano de chão projetado**: nenhuma função `mundo → tela` com escala por profundidade (`scale(z)`), nenhum depth-sort por linha de base (baseline Y).
- Herói, props e inimigos foram desenhados em espaços diferentes e justapostos no mesmo canvas. Cada elemento lê como recorte 2D colado — exatamente a leitura de "jogo 2D antigo".
- A referência oficial (`assets/references/ref-2d-maps/map-island-enemys.png`) pede perspectiva 3/4 fake com **escala de inimigos por profundidade** e arena integrada. Copiei só o tema (palmeiras, praia, ilha) e ignorei a grade de perspectiva — a parte que mais importa.

### 1.2 Pintura sem volume e sem direção de luz
- Formas preenchidas com cor plana. Sem direção de luz única, sem modelagem em 2–3 tons, sem rim light consistente.
- Silhueta fina (braços, pescoço, pernas): a leitura de "desenho infantil" vem disso — Hades é o oposto, tudo é grosso e legível.
- Sombra de contato (personagem ↔ chão) ausente ou fraca na maior parte da cena → tudo "flutua", nada "pisa".
- Sem oclusão interna (cinto/chapa/dobra sobre a forma) → cada membro parece um adesivo.

### 1.3 Câmera e apresentação
- Herói pequeno demais na tela. Detalhe vira ruído; ruído vira "desenho malfeito".
- Hades vence por apresentação: figura grande, contraste forte, luz teatral, chão legível com relevo. Nada disso existia aqui.

### 1.4 Glow como desculpa
- Halo/incandescência aplicados para "vender" a lâmina em cima de formas chatas. Glow sobre superfície sem volume parece adesivo, não fogo.

---

## 2. Por que o processo falhou (mais importante que os sintomas)

1. **Não houve portão visual.** Validei com checklist e cobertura de features em vez de A/B 1:1 contra os dois protótipos aprovados. A primeira comparação lado a lado séria veio tarde demais.
2. **Performance antes de arte.** Cache de bitmaps congelados cedo demais tornou cada mudança de desenho cara — o próprio sistema empurrou para "está bom o suficiente".
3. **Feature acima de fundamento.** Combate, hitboxes, benchmark, 200 FPS… tudo funcionando em cima de uma base visual que nunca esteve de pé.
4. **Reuso raso dos aprovados.** A regra "não começar do zero" foi cumprida só na arma (lâmina + corrente). O que precisava ser herdado primeiro era a **projeção e o pipeline de shading** do ChatGPT/Antigravity.

---

## 3. O que sobreviveu (aproveitável na próxima tentativa)

| Arquivo | O que salvar |
|---|---|
| `src/04-weapon.js` | Lâmina curva + corrente de elos volumétricos (`DS.drawChain`, sprites de elo) |
| `src/05-skeleton.js` | FK, poses (`DS.POSE`), `DS.bladePoints` (hitbox = arte) |
| `src/09-combat.js` | Moves, janelas de hit, colisão segmento-de-lâmina × círculo-em-mundo |
| `src/10-game.js` | Loop, stats de FPS, overlays de bench |
| `tools/` | build (`shell.html` + `build.mjs`) + captura CDP (`shot.mjs`, `eval.mjs`, `perf.mjs`) |
| `AVALIACAO-IA/07` | Números honestos de perf (200 FPS atingido, não estável; ambiente com stalls) |

Perf e engenharia **não foram o problema**. O problema foi a arte/projeção.

---

## 4. Regras para a próxima tentativa (não negociáveis)

1. **Antes de pintar qualquer herói:** montar um protótipo de cena com grade de chão em perspectiva 3/4 real (`proj(x, y, z) → tela`, escala por profundidade, depth-sort por baseline) e um **boneco-caixote cinza**. Se o boneco cinza não parecer Hades, não se pinta arte ainda.
2. **Herdar dos aprovados o pacote visual inteiro** — projeção, shading, apresentação — não apenas a arma.
3. **Luz única + 2–3 tons + rim light.** Silhueta grossa, herói grande em tela, sombra de contato em todo personagem.
4. **Glow só sobre volume já resolvido.**
5. **Portão visual a cada marco:** screenshot A/B 1:1 contra os aprovados. Checklist não substitui olho.
6. **Perf por último:** medir sempre, mas não otimizar contra a arte antes de a arte ser aprovada.

---

## 5. Veredito consolidado

| Aspecto | Resultado |
|---|---|
| Fidelidade visual | ❌ Reprovado |
| Leitura 2.5D (isométrico fake) | ❌ Reprovado — nunca implementada, só simulada |
| Rig / FK / combate / hitbox | ✅ Funcional |
| Correntes / lâminas | ✅ Parcialmente (melhor parte da entrega) |
| Performance | ⚠️ 200 FPS atingido, não estável neste hardware; mobile não testado |

**Entrega final: NÃO APROVADA.** Tecnicamente funcional, visualmente distante do padrão Hades exigido.
