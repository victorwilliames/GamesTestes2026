# 07 — TESTES E VALIDAÇÃO

**Ambiente de medição:** Windows 11, Chrome headless (`--headless=new`) via CDP, 1280×720,
`--disable-frame-rate-limit --disable-gpu-vsync --enable-gpu-rasterization --ignore-gpu-blocklist`.
**Não testado neste hardware:** celular (Galaxy S20 FE ou inferior) e GPU real em modo *headed*
(a tentativa *headed* travou e foi abandonada — ver §6).

---

## 1. Como reproduzir

```bash
cd prototypes/deepseek/desenho-v1-deepseek

node tools/build.mjs                      # regenera index.html a partir de src/*.js

# evidências visuais (CDP, nunca canvas.toDataURL)
node tools/shot.mjs "index.html" screenshots/game-final.png 1280 720 "" 5000
node tools/shot.mjs "index.html?debug=1" screenshots/game-debug.png 1280 720 "" 6000
node tools/shot.mjs "index.html?spawn=8" screenshots/game-horda.png 1280 720 "" 6000
node tools/shot.mjs "index.html?sheet=attacks&spawn=0" screenshots/poses-ataque.png 1280 720 "" 4000

# performance: 8 s de rAF + estatísticas em window.__BENCH
node tools/eval.mjs "index.html?bench=8&spawn=4" \
  "new Promise(r=>{const t=setInterval(()=>{if(window.__BENCH){clearInterval(t);r(JSON.stringify(window.__BENCH,null,2))}},150);setTimeout(()=>{clearInterval(t);r('TIMEOUT')},25000)})" 0

# custo de quadro completo em laço fechado (100 frames)
node tools/eval.mjs "index.html?benchloop=1&spawn=8" "JSON.stringify(window.__BENCHLOOP)" 0
```

Também é possível abrir `index.html?bench=8` no navegador e ler o painel da HUD (tecla **H**
liga/desliga o painel).

---

## 2. Custo de quadro completo (laço fechado)

`?benchloop=1` roda **100 quadros completos** (update + render + raster) após 3 lotes de
aquecimento, com uma sincronia de GPU por lote. É o número que isola o **custo do motor**, sem
depender do compositor.

**Suíte oficial** (`screenshots/perf-final.txt`, build final):

| Inimigos | ms por quadro | FPS equivalente |
|---|---|---|
| **4** | **5,425 ms** | **184,3** |
| **8** | **6,104 ms** | **163,8** |

**Repetições no mesmo build** (a máquina degradou durante a sessão):

| Inimigos | Execuções (ms por quadro) | Faixa |
|---|---|---|
| 4 | 5,24 · 5,42 · 5,72 · 5,87 · 6,55 · 6,84 · 6,86 · 7,19 | 139–191 FPS (mediana 5,87 ms ⇒ **170 FPS**) |
| 8 | 5,54 · 5,60 · 6,10 · 7,16 · 7,50 · 8,95 · 9,35 · 9,93 | 101–181 FPS (mediana 7,33 ms ⇒ **136 FPS**) |

> **Declaração honesta sobre a meta de 200 FPS:** nas primeiras rodadas deste **mesmo build** foram
> medidos **4,447 ms (224,9 FPS)** e **4,920 ms (203,0 FPS)** — o piso de 200 FPS **é alcançável e
> foi observado**. Com o passar da sessão, sem mudança de código que explique, o ambiente passou a
> medir 5,4–7,2 ms (4 inimigos) e 5,5–9,9 ms (8): o `draw` típico do herói subiu de ~1,0 ms para
> ~2,2 ms e o `frameMed` de 1,4 ms para 3,1 ms, inclusive em páginas paradas. **Não declaro a meta
> de 200 FPS como comprovada de forma estável neste hardware.** O que ficou comprovado: (a) o motor
> **já operou a 203–225 FPS** em laço fechado; (b) o computador desta sessão **não é um ambiente de
> medição confiável**. Celular e GPU real: **não testados neste hardware**.

## 3. Sustentado por `requestAnimationFrame` (8 s, suíte oficial)

| | 4 inimigos | 8 inimigos |
|---|---|---|
| Duração | 8,05 s | 8,06 s |
| Quadros | 1119 (1088 medidos) | 1003 (991 medidos) |
| **FPS de parede** (quadros ÷ segundos) | **139,0** | **124,4** |
| **FPS médio (sem stalls > 100 ms)** | **252,0** | **147,7** |
| FPS p50 | **714,3** | **555,6** |
| FPS p95 | 101,0 | 18,1 |
| FPS p99 | 11,2 | 11,1 |
| frame p50 | 1,4 ms | 1,8 ms |
| frame p95 | 9,9 ms | 55,2 ms |
| frame p99 | 89,1 ms | 90,4 ms |
| frame máx | 160,5 ms | 161,6 ms |
| **draw** (EMA ao fim da janela) | 13,11 ms | 3,54 ms |
| **update** | **0,05 ms** | **0,07 ms** |
| *stalls* > 100 ms | **31** (3735 ms no total) | **12** (1350 ms no total) |
| kills / hits na janela | 1 / 2 | 3 / 7 |

**Método (importante):** o `?bench=N` separa os quadros com duração > 100 ms (`stallsOver100ms`) e
calcula `fpsAvg`, p50, p95 e p99 **apenas sobre os quadros saudáveis**; os stalls são reportados à
parte, com o tempo total. Por isso a média "sem stalls" é maior que a **taxa de parede**, que é o
que o jogador veria de fato neste ambiente. As duas estão registradas; nenhuma foi escondida.

**Sobre o `draw`:** o valor da janela (13,11 / 3,54 ms) é um EMA que pode capturar quadros de stall;
o custo típico do renderer, publicado por `__DS_INFO` em cenas limpas, é **1,0–1,45 ms** na primeira
metade da sessão e **~2,2 ms** no fim dela (degradação do ambiente).

**Leitura correta:** `p95Fps = 1 / p95(frameTime)` — quanto **maior**, melhor. O p50 de 555–714 FPS
mostra que o quadro típico é muito barato (1,4–1,8 ms). Os *stalls* de 100–161 ms **não vêm do
motor**: aparecem em todas as configurações de camadas (`?no=ground,props,fx,...`) e somam
1,3–3,7 s em 8 s. São engasgos de apresentação/rasterização do Chromium headless deste computador.

**Repetibilidade (execuções anteriores do mesmo cenário):** 144,3 (4) e 131,2 (8) de parede, com
médias sem stall de 244,3 e 162,3 e p50 de 625 e 526; e as capturas `perf-4.png` / `perf-8.png`
mostraram **207,1** e **162,5 FPS** sem stalls. A dispersão é do ambiente, não do código — o mesmo
binário produziu todas essas medições.

## 4. Cenários de teste funcional

| # | Cenário | Como | Resultado |
|---|---|---|---|
| 1 | Abrir por duplo clique (`file://`) | `index.html` | ✅ `__DS_READY` true, 0 erros de console |
| 2 | Idle na arena com HUD | `screenshots/game-final.png` | ✅ herói, duas adagas, correntes, HUD |
| 3 | Combo A1→A2→A3 com acerto | 3 toques de **J** em sequência | ✅ `hits: 2`, `atk: 2`, HUD de combo |
| 4 | Horda de 8 inimigos | `?spawn=8` | ✅ 8 inimigos, IA, Y-sort |
| 5 | Hitboxes visíveis | **F1** / `?debug=1` | ✅ segmentos da lâmina + círculos dos inimigos |
| 6 | Folha de poses de ataque | `?sheet=attacks` | ✅ 3 golpes × 3 fases |
| 7 | Régua de proporções | `?sheet=hero` | ✅ herói ampliado 0,42× |
| 8 | Congelar pose | `?freeze=attack:1:0.45&spawn=0` | ✅ pose determinística |
| 9 | Desligar camadas | `?no=ground,props,fx,hud,enemies` | ✅ usado para isolar custo |
| 10 | Regenerar build | `node tools/build.mjs` | ✅ 11 módulos → 189 kB |
| 11 | Medir FPS | `?bench=8`, `?benchloop=1` | ✅ ver §2–3 |
| 12 | Erros de runtime | capturas CDP | ✅ `errors: []` em todas as capturas boas |

### Registo de dano (o que prova que a hitbox funciona)

O combo scriptado posiciona 3 inimigos à frente com `hp = 999` e dispara três **J**. A HUD e
`__DS_INFO` registram `hits: 2` e `atk: 2` — ou seja, a janela ativa do A1/A2 encontrou a lâmina
desenhada no mundo. O mesmo teste com `?debug=1` mostra os segmentos testados.

---

## 5. Otimizações e o ganho medido (microtest)

| Otimização | Antes | Depois |
|---|---|---|
| Arma + mão como **um bitmap** cacheado (mesma arte procedural) | herói idle **16,3 ms** | **2,41 ms** |
| idem, em ataque | **263 ms** | **3,46 ms** |
| Props "assados" em `BAKE 0,36` | laço fechado **11,56 ms** | **5,76 ms** |
| Inimigos "assados" em `BAKE 0,50` | **5,14 ms** | **4,71 ms** |
| Chão em `BS = PLAY = 0,24` (blit 1:1) | recorte com reamostragem | blit direto, nítido |
| Elos de corrente pré-renderizados (`linkSprite`) | desenho vetorial por elo | blit de sprite |
| HUD (avatar + ícones) cacheado | repintura por quadro | 2 blits |
| Pré-aquecimento (`DS.warmup`) | 1º golpe ~180 ms | 0 ms perceptível |

> As medições de microtest são de rodadas intermediárias de otimização; os números **oficiais**
> são os de §2–3, medidos no build final.

## 6. Falhas encontradas, causas e correções

| # | Sintoma | Causa | Correção |
|---|---|---|---|
| 1 | FPS/p95/p99 absurdos (ex.: "FPS 2000") | índice de percentil invertido + primeiro quadro caro | descarte dos 6 primeiros quadros; percentis sobre `frameTime`; `1/p` para FPS |
| 2 | Lâmina acertava "no vazio" | hitbox usava `BLADE_TIP` **sem** `BLADE_SCALE` | `BLADE_SCALE = 0,98` calibrada para a ponta desenhada cair em `SK.BLADE_TIP`; `toWorld` explícito |
| 3 | Props não desenhavam / corte errado | assinatura de `drawProps` divergente | API fixada: `drawProps(ctx, cam, viewW, viewH, splitY, behind)` |
| 4 | `restore()` extra quebrava a pilha do canvas | sobra de refatoração | removido |
| 5 | Primeiro ataque travava ~180–260 ms | construção dos buffers no primeiro uso | `DS.warmup()` no boot + cache da arma+mão |
| 6 | Acentos corrompidos nos arquivos | `Set-Content`/replace inline em PowerShell (encoding) | edições via Node `fs` UTF-8 / ferramenta de edição; strings reescritas |
| 7 | Screenshot de debug falhava com `DS is not defined` | a página não ficou pronta em 14 s sob contenção e o preJS rodou numa página vazia | prazo do `shot.mjs` ampliado para ~48 s + diagnóstico de estado; pausa entre capturas |
| 8 | Chrome *headed* travava (timeout de 300 s) | ambiente sem display/GPU estável | medição abandonada; **declarado** que headed/GPU real não foi medido |
| 9 | `game-final.png` antigo mostrava FPS baixo no painel | captura feita antes dos flags de *uncap* e cedo demais | recapturado com `--disable-frame-rate-limit` e 5 s de espera |
| 10 | Capturas saíam em branco (`chrome-error://chromewebdata`) | PowerShell interpolava `$base?debug=1` como variável (`$base?debug`) → URL inválida | uso de `${base}?debug=1`; `shot.mjs` passou a reportar `pageState` (href/readyState) quando não fica pronto |
| 11 | Inimigos se empilhavam parados ao redor do herói | separação só era aplicada durante a perseguição | separação aplicada em **todos** os estados (`08-enemy.js`) |
| 12 | HUD custava ~0,7 ms/quadro (texto redesenhado todo quadro) | raster de texto por software | painel de performance cacheado em bitmap, atualizado 4×/s |

## 7. Evidências

**Capturas reais (CDP, 1280×720):**
`../desenho-v1-deepseek/screenshots/`

| Arquivo | Conteúdo |
|---|---|
| `game-final.png` | idle na arena com HUD completo |
| `game-combo.png` | combo em execução, hits registrados |
| `game-debug.png` | hitboxes (F1): ossos, lâminas e círculos de acerto |
| `game-horda.png` | 8 inimigos simultâneos |
| `poses-ataque.png` | folha 3×3 dos três golpes |
| `perf-4.png` / `perf-8.png` | resultado fixo do bench: 207,1 e 162,5 FPS sem stalls |
| `hero-proporcoes.png` | herói ampliado com régua de unidades |
| `dev-*.png` | iterações de arte/bench (histórico) |
| `perf-final.txt` | saída bruta dos benchmarks finais |
| `perf-headless.json` | medição anterior (build intermediário) |

---

## 8. Veredito de testes

- **Funcional:** aprovado — o jogo abre por duplo clique, anda, ataca, encadeia combo, mata e morre.
- **Hitbox:** aprovado — derivada da geometria desenhada, verificada por contador de hits e por F1.
- **Determinismo:** aprovado — RNG semeado, sem flicker entre quadros.
- **Performance de motor:** **instável neste ambiente** — o mesmo build mediu 4,45–4,92 ms
  (203–225 FPS) no início da sessão e 5,4–7,2 ms / 5,5–9,9 ms depois, sem mudança de código que
  explique. Mediana das repetições finais: **170 FPS** (4 inimigos) e **136 FPS** (8). A meta de
  200 FPS **foi observada e não é comprovada de forma estável** neste hardware.
- **Performance sustentada (taxa de parede):** **139,0 FPS** (4 inimigos) e **124,4 FPS** (8), por
  31/12 *stalls* de 100–161 ms. Excluindo os stalls, a média é 252,0 / 147,7 e o p50 é 714 / 556 FPS.
- **Celular / GPU real:** **não testado neste hardware** — declarado, não estimado.
