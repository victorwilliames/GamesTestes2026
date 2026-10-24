# NÃO FICOU BOM — O QUE APRENDEMOS

**Experimento:** HERO-02 / Parte 2 do RIG-01 DeepSeek  
**Pasta:** `prototypes/rig-01-deepseek/`  
**Data:** 19/10/2026  
**Status:** **ESTUDO DESCARTADO COMO ENTREGA VISUAL**  
**Aprovação:** **não aprovado pelo usuário**; descartado a pedido dele.

> Este arquivo existe para registrar o aprendizado e impedir que o resultado seja confundido com entrega final, asset aprovado ou Gate 2 concluído.  
> A página `index-hero.html` continua no repositório **como estudo**, não como produto.

---

## 1. Veredito curto

A engenharia funcionou; a arte não.

O erro central foi tentar construir o herói misturando **uma cabeça oficial pintada, recortada de PNG**, com um **corpo vetorial desenhado em Canvas 2D**. O resultado tem uma costura visual óbvia: a cabeça parece um adesivo colado em um boneco de formas planas. Ajustar braço, capa, cinto e ilha depois não resolveu a incompatibilidade de linguagem visual.

**Lição principal:** não se corrige mismatch de pipeline com pequenos retoques. Ou o personagem inteiro é pintado na mesma linguagem, ou se usa um sprite completo coerente — não metade de cada.

---

## 2. O que foi tentado

- `index-hero.html` com:
  - rig procedural de 8 direções;
  - cabeça oficial recortada por direção (`derived/head-*.png`);
  - corpo, braços, pernas, cinto, caveira, capa e adagas desenhados em Canvas 2D;
  - ilha tropical procedural em canvas offscreen cacheado;
  - HUD, debug, galeria, combo, foot lock e modos de captura;
  - API `window.RIG01`.
- Ilha inspirada na composição/paleta de `map-island-enemys.png`, sem copiar a imagem e sem inimigos/UI de RPG.
- Capturas via CDP por causa de canvas tainted em `file://`.
- Tentativas de melhorar o visual por partes:
  - aumento de ombros e braços;
  - redução/deslocamento da cabeça;
  - novo cowl/cachecol;
  - capa lateral maior;
  - cinto mais baixo e caveira maior;
  - botas maiores;
  - palmeiras, rochas, arbustos, clareira, pier e doca;
  - armas mais detalhadas.

Nenhuma dessas mudanças mudou o diagnóstico: o conjunto continuou com aparência de **protótipo vetorial com cabeça recortada**, não de arte final no nível das referências.

---

## 3. Por que não ficou bom

### 3.1 A cabeça recortada não integra com o corpo

- A cabeça oficial tem pintura, textura, luz e traço próprios.
- O corpo em Canvas é chapado, com contorno simples e shading em poucos tons.
- A emenda no pescoço/ombros aparece.
- Mesmo com o recorte correto e alfa limpo, a leitura é “cabeça colada”.

**Conclusão:** recortar a cabeça oficial foi tecnicamente permitido, mas artisticamente foi a decisão que mais prejudicou o resultado.

### 3.2 Proporção do rig ficou esquisita

- Cabeça muito grande + torso curto + quadril/cinto alto.
- O torso ficou escondido atrás da cabeça e do cachecol; o personagem lia como “cabeça + saia”.
- Perna e bota escuras demais, sem massa.
- Aumentar ombros e comprimento do torso depois melhorou um pouco, mas não corrigiu a base.
- O corpo continuou com braços finos e silhueta pouco musculosa.

### 3.3 Capa e cachecol ficaram chapados

- A capa lateral virou um triângulo/bandeira vermelha.
- Faltou volume, dobra, peso, tecido e movimento.
- O cachecol não teve a presença larga e assimétrica da referência.
- A cor vermelha ajudou a ler, mas não criou a sensação de tecido.

### 3.4 Armas e cinto não carregaram a identidade

- As adagas desenhadas em código ficaram genéricas perto das adagas oficiais.
- Correntes e detalhes sumiram no tamanho de gameplay.
- A caveira frontal não ficou legível de imediato.
- O cinto virou uma faixa escura; a leitura “caveira única no centro” ficou fraca.

### 3.5 Ilha: composição okay, direção de arte fraca

- A ilha ficou uma “panqueca verde” grande e vazia.
- As palmeiras melhoraram, mas ainda parecem ilustração vetorial simples, não a pintura da referência.
- O pier parecia uma cerca de madeira no gramado.
- A clareira central ficou enorme e clara, competindo com o herói.
- A paleta ficou alegre/cartunesca demais; a referência é mais densa, escura e pictórica.
- O cache offscreen e a construção procedural funcionaram; o problema foi o desenho, não a técnica.

### 3.6 Escala e câmera

- A escala fixa do contrato deixa o herói pequeno no quadro.
- Aumentar a câmera para “resolver” a leitura quebrava o contrato do Gate 1 e foi revertido.
- O problema real não era só tamanho: era **densidade de detalhe e linguagem visual**.
- Um personagem menor pode funcionar se a silhueta, a capa, as armas e a ilha forem pintadas com coesão.

### 3.7 Processo

- Tentei melhorar o resultado por incrementos pequenos (ombro, capa, cinto, cabeça) em vez de parar e mudar o pipeline.
- Isso gerou muitas iterações e pouco ganho percebido.
- O gate visual deveria ter sido um **único frame estático de alta fidelidade**, aprovado antes de construir rig, oito direções, ilha, galeria e capturas.

---

## 4. O que funcionou e deve ser reaproveitado

### 4.1 Foot lock

- Teste em yaw 0° e 90°, 2 s, 92 amostras.
- Desvio máximo observado nas sondas: `5.684e-14 px`.
- Zero clamps.
- O IK analítico de 2 ossos está sólido e deve ser preservado para qualquer próximo rig.

### 4.2 API e determinismo

- `window.RIG01` com `setState`, `setTime`, `setYaw`, `getMetrics`, `runFootLockTest`, `getDebugInfo`.
- O harness determinístico é útil independentemente da arte.
- Ainda faltou fechar a bateria formal de API/determinismo desta Parte 2.

### 4.3 Captura

- `capture-hero.mjs` via CDP resolve o problema de `canvas.toDataURL()` contaminado em `file://`.
- Hashes do HTML antes/depois e capturas do mesmo build são o caminho certo.
- `capturePNG()` direto continua limitado por taint; não usar como prova visual sem screenshot do navegador.

### 4.4 Ilha em cache offscreen

- Build determinístico, uma vez, e `drawImage` do cache por frame.
- Padrão correto para cenário estático.
- Deve ser mantido, mas com uma arte de cenário muito melhor.

### 4.5 Ferramentas de inspeção

- `derived/head-*.png` com alfa real e pivô documentado.
- Scripts de bbox/alfa e probes de assets.
- HUD, galeria, contato e debug são úteis como bancada de validação.

### 4.6 Performance preliminar

- Sondas em Edge headless, 1280 × 720, sem cap de vsync, ficaram na casa de centenas de fps (aprox. 260–570 fps conforme o estado).
- Isso mostra folga de runtime, **não** validação oficial.
- A performance formal da Parte 2 não foi fechada e mobile continua **não testado neste hardware**.

---

## 5. O que NÃO deve ser repetido

1. **Não** usar cabeça oficial recortada + corpo vetorial plano como personagem final.
2. **Não** tentar “resolver” a arte com dezenas de microajustes em um pipeline incompatível.
3. **Não** construir 8 direções, rig e animações antes de aprovar **um** frame estático de alta fidelidade.
4. **Não** usar o sprite idle completo como corrida/ataque.
5. **Não** usar o brilho permanente das lâminas oficiais no idle; brilho infernal agressivo é VFX de ataque.
6. **Não** usar a vista N oficial com caveira nas costas no gameplay sem tratar o defect.
7. **Não** declarar Gate 2 aprovado, “superior ao Antigravity” ou pronto para mobile sem evidência.
8. **Não** promover os derivados de cabeça/armas para `assets/approved/`.
9. **Não** tratar as capturas `09`–`13` atuais como entrega final: elas são de um build anterior às últimas mudanças e estão defasadas.

---

## 6. Caminhos recomendados para a próxima tentativa

### Caminho A — Sprite completo coerente (mais rápido para qualidade)

- Usar o idle oficial completo apenas no idle, com HUD explícito `IDLE = sprite oficial; movimento = rig`.
- Para corrida/ataque, criar frames/sprites próprios na mesma linguagem pictórica.
- Resolver antes:
  - brilho permanente das lâminas no idle (mascarar/derivar ou aceitar e documentar);
  - caveira nas costas na vista N;
  - coerência de pivô e escala entre idle, corrida e ataque.

### Caminho B — Personagem inteiro procedural pintado (mais original, mais lento)

- Nada de recorte de cabeça oficial no personagem final.
- Pintar cabeça, corpo, capa, armas e botas na mesma linguagem e com a mesma luz.
- Fazer primeiro **um** frame ART-01 estático, em escala de gameplay, comparado lado a lado com a referência.
- Só depois abrir rig, IK, oito direções e animações.

### Caminho C — Híbrido controlado

- Usar as **partes oficiais** (cabeça, armas) apenas como referência de proporção/paleta, não como colagem direta.
- Redesenhar tudo com um pincel/estilo único.
- Se usar `drawImage`, que seja com partes realmente integradas e pivô documentado, não como solução de composição.

**Recomendação:** congelar este estudo e seguir pelo **Caminho A** se a prioridade for chegar rápido a uma imagem bonita; pelo **Caminho B** se a prioridade for manter a linguagem 100% procedural original. Nos dois casos, o próximo gate deve ser **um frame estático aprovado**, não uma nova rodada de rig.

---

## 7. Checklist do estado real

| Item | Estado |
|---|---|
| Página `index-hero.html` | Existe, roda e é útil como estudo; **não é entrega** |
| Cabeça oficial recortada | 8 direções em `derived/`; tecnicamente correta, artisticamente problemática |
| Corpo/armas/capa procedurais | Implementados, mas abaixo do padrão de referência |
| Ilha procedural | Cache funcionando; arte descartada |
| Foot lock | Passa nas sondas (yaw 0/90), erro ~`5.68e-14 px` |
| API `RIG01` | Base funcional; bateria formal da Parte 2 não concluída |
| `capture-hero.mjs` | Funcional via CDP; reutilizável |
| Capturas `09`–`13` | Existem, mas são de build antigo/defasado |
| Debug sob a arte | Ainda precisa ser corrigido; ossos estavam sobre a arte |
| Performance formal | Não concluída |
| Mobile S20 FE ou mais fraco | **Não testado neste hardware** |
| Auditoria final da Parte 2 | Não concluída |
| Aprovação do usuário | **Não**; resultado descartado |

---

## 8. Arquivos deste estudo

- `index-hero.html` — página do estudo; **não promover**.
- `capture-hero.mjs` — capturador CDP; pode ser reaproveitado.
- `derived/head-s.png` … `derived/head-sw.png` — recortes de cabeça; WIP, não aprovados.
- `derived/weapon-left-crop.png`, `derived/weapon-right-crop.png` — recortes temporários, não usados na versão final; WIP.
- `screenshots/09-hero-idle-8dir.png` … `13-hero-gallery.png` — capturas de build anterior; defasadas.
- `capture-hero-report.json` — relatório parcial da tentativa; não é auditoria final.
- `probe-hero.png`, `probe-hero-idle.png` (na raiz) e `probe-hero-crop.png` — evidências temporárias de inspeção, não entregáveis.
- `audit.md` e `capture-report.json` — base do Gate 1; não substituem a auditoria final da Parte 2.

---

## 9. Frase para o próximo agente

> O HERO-02 do DeepSeek provou o harness (foot lock, API, cache, captura), mas foi reprovado visualmente. A causa foi misturar cabeça oficial pintada com corpo Canvas plano. Não continuar a partir de `index-hero.html` como base de arte. Preservar os testes e recomeçar a arte por um único frame ART-01 pintado de forma coerente, aprovado antes de qualquer rig ou oito direções.

---

## 10. Decisão registrada

- **Estudo encerrado.** Não há mais iterações previstas neste protótipo.
- O trabalho fica preservado no working tree para consulta.
- Nenhum arquivo em `assets/references/` foi alterado.
- Nenhum asset foi movido para `assets/approved/`.
- Sem commit e sem push.
