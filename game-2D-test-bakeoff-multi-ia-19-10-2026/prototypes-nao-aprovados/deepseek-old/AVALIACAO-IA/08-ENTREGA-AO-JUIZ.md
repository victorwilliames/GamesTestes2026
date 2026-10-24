# 08 — ENTREGA AO JUIZ

**Candidato:** DeepSeek
**Pasta:** `prototypes/deepseek/`
**Executável:** `prototypes/deepseek/desenho-v1-deepseek/index.html` (≈189 kB, autocontido)
**Avaliação:** `prototypes/deepseek/AVALIACAO-IA/` (este pacote)

---

## 1. Como abrir (30 segundos)

1. Abra `prototypes/deepseek/desenho-v1-deepseek/`.
2. **Dê dois cliques em `index.html`.**
3. Pronto. Não precisa de servidor, Node, Python, internet, WebGL nem instalar nada.

O arquivo funciona em `file:///` porque o build concatena os 11 módulos em **scripts clássicos**
dentro do HTML (sem `type="module"` e sem `fetch`). Não há PNG carregado em runtime: **toda** a arte
é pintada por código no Canvas 2D.

## 2. Controles

| Tecla | Ação |
|---|---|
| **WASD** / setas | mover |
| **J** / **Z** / clique esquerdo | atacar (encadeia A1 → A2 → A3) |
| **Espaço** / **E** | dash |
| **Q** | giro de área (cd 5,5 s) |
| **R** | fúria por 7 s (cd 16 s) |
| **F1** | mostrar hitboxes |
| **P** | pausar |
| **H** | mostrar/ocultar painel de performance |

## 3. Roteiro de inspeção sugerido (5 minutos)

1. **Armas e mãos (30 s).** No idle, observe as **duas adagas curvas** com halo incandescente, os
   recortes internos, o sangue e o cabo de couro. A mão fecha o cabo: palma atrás, dedos e polegar
   na frente. As correntes saem do pomo e dão voltas no antebraço — são **elos individuais**, não
   linhas.
2. **Combo (60 s).** Aproxime-se de um inimigo e aperte **J** três vezes no ritmo. Veja o arco de
   cada golpe, o hitstop do A3, as faíscas, o sangue, o número de dano, o knockback e o contador de
   combo na HUD.
3. **Hitbox = desenho (20 s).** Aperte **F1**: os segmentos exibidos são a própria lâmina
   desenhada, convertidos para o mundo. Ataque e veja o círculo do inimigo interceptar os segmentos.
4. **Horda (60 s).** Recarregue com `file:///.../index.html?spawn=8` e teste o dash (Espaço) e o
   giro (Q) para abrir espaço.
5. **Performance (90 s).** Abra `index.html?bench=8`: o resultado fixo aparece no canto inferior
   esquerdo ao fim da janela (ou aperte **H** para o painel ao vivo). Para o **custo de quadro** use
   `?benchloop=1`; para o sustentado, `?bench=8` (§5).
6. **Arte (60 s).** Abra `index.html?sheet=attacks&spawn=0` (3 golpes × 3 fases) e
   `index.html?sheet=hero&spawn=0` (régua de proporções).

## 4. Onde está cada coisa

```
prototypes/deepseek/
├── AVALIACAO-IA/                 01..08 (este pacote)
└── desenho-v1-deepseek/
    ├── index.html                ENTREGA (duplo clique)
    ├── src/                      00-core … 10-game (11 módulos)
    ├── tools/
    │   ├── build.mjs             gera index.html
    │   ├── shell.html            moldura do HTML final
    │   ├── shot.mjs              captura CDP
    │   ├── eval.mjs              avalia JS na página (bench)
    │   ├── perf.mjs              relatório de FPS sustentado
    │   └── microtest.html        micro-benchmarks por operação
    ├── screenshots/              evidências reais + perf-final.txt
    ├── assets/reference/         cópias das referências oficiais (consulta; não usadas em runtime)
    └── README.md                 guia rápido
```

## 5. Como reproduzir os números

```bash
cd prototypes/deepseek/desenho-v1-deepseek
node tools/build.mjs

# custo de quadro completo (100 frames, sem compositor)
node tools/eval.mjs "index.html?benchloop=1&spawn=4" "JSON.stringify(window.__BENCHLOOP)" 0
node tools/eval.mjs "index.html?benchloop=1&spawn=8" "JSON.stringify(window.__BENCHLOOP)" 0

# sustentado 8 s (rAF): grava window.__BENCH
node tools/eval.mjs "index.html?bench=8&spawn=4" \
  "new Promise(r=>{const t=setInterval(()=>{if(window.__BENCH){clearInterval(t);r(JSON.stringify(window.__BENCH,null,2))}},150);setTimeout(()=>{clearInterval(t);r('TIMEOUT')},25000)})" 0
```

**Resultado final medido (suíte oficial `perf-final.txt`):**

- laço fechado (custo de motor): **5,425 ms → 184,3 FPS** (4 inimigos) e **6,104 ms → 163,8 FPS** (8);
- sustentado: **taxa de parede 139,0 FPS** (4) e **124,4** (8), com 31/12 *stalls* > 100 ms;
  **excluindo os stalls**, a média é **252,0 / 147,7** e o p50 **714 / 556**;
- `draw` (EMA em cena limpa): **1,0–1,45 ms**; `update`: **0,02–0,07 ms**.

**Sobre a meta de 200 FPS:** o piso **foi atingido e medido** neste mesmo build no início da sessão
(**4,447 ms → 224,9 FPS** e **4,920 ms → 203,0 FPS**), mas **não se repetiu de forma estável**
depois (a máquina degradou: 5,4–7,2 ms / 5,5–9,9 ms). Repetições, método do bench e a discussão
completa estão em `07`, §2–3. As capturas `perf-4.png` e `perf-8.png` mostram o resultado fixo na
tela (207,1 e 162,5 FPS sem stalls).

> **Não testado neste hardware:** celular (Galaxy S20 FE ou inferior) e GPU real em modo *headed*.
> Não há estimativa disfarçada de medição: o que não foi medido está declarado como não medido.

## 6. Checklist de requisitos

### Armas, mãos e correntes

- [x] Duas **adagas curvas** gigantes (não machados), com fio externo e recortes dentados internos
- [x] Metal escuro/queimado, sangue em manchas/riscos, incandescência laranja/vermelho/amarelo
- [x] Cabo em couro escuro + guarda/pomo metálicos
- [x] Correntes **permanentes** do pomo ao antebraço, com voltas no pulso
- [x] Elos individuais, volumosos e metálicos (**nunca** linhas ou cordões)
- [x] Mão **segurando de verdade** (palma atrás → cabo → dedos/polegar na frente)
- [x] Ponto de empunhadura fixo e compartilhado entre mão e arma
- [x] **Mesmo renderer procedural** no idle, no ataque e no dash; sem sprites/PNG
- [x] Hitbox derivada da mesma geometria da lâmina desenhada

### Herói e animação

- [x] Rosto, corpo e arma das referências oficiais preservados na identidade (cabeça grande, juba,
      olhos vermelhos, peito nu, cachecol, caveira no cinto, tanga, botas, duas adagas)
- [x] Hierarquia anatômica com pivôs locais (pelve → tronco → pescoço/cabeça; ombros → cotovelos →
      punhos; quadris → joelhos → tornozelos)
- [x] Idle, caminhada, corrida, 3 ataques, dash, giro, dano e morte
- [x] Transições suaves (`mixPose`) e combo com buffer
- [ ] **IK de dois ossos** — não implementada (FK com curvas de ângulo); declarada em `05` e `07`
- [ ] **Turnaround real** — apenas uma vista 3/4 espelhada

### Jogo, arena e combate

- [x] Arena tropical 6000×3800 u, câmera com clamp, chão em buffer 1:1
- [x] Inimigos de teste que tomam dano, reagem, morrem e renascem
- [x] Combos encadeados A1→A2→A3, hitstop, knockback, FX, HUD
- [x] Modos de depuração (`?debug`, `?freeze`, `?spawn`, `?no`, `?sheet`, `?bench`, `?benchloop`)

### Performance e entrega

- [ ] (parcial) **Custo de quadro < 5 ms**: medido 4,447 ms (224,9 FPS) no início da sessão, mas a
      suíte final do mesmo build mediu 5,425/6,104 ms (184,3/163,8) — ambiente degradado
- [x] Média **sem stalls** ≥ 200 FPS com 4 inimigos (252,0) e p50 de 714 FPS
- [ ] **Taxa de parede ≥ 200 FPS** neste ambiente headless — 139,0 (4) e 124,4 (8), limitada por
      31/12 *stalls* de apresentação
- [ ] Celular (Galaxy S20 FE ou inferior) — **não testado neste hardware**
- [x] Executa por **duplo clique** em `file://`, sem dependências
- [x] Evidências por **captura real CDP** (nunca `canvas.toDataURL`)
- [x] Isolamento: nada fora de `prototypes/deepseek/` foi alterado
- [x] `AVALIACAO-IA/01..08` completos

## 7. Entregáveis deste pacote

| Documento | Conteúdo |
|---|---|
| `01-DIAGNOSTICO-INICIAL.md` | o que está operacional, números e limites |
| `02-CRONOLOGIA-RAFA-CLAUDE.md` | processo do Rafa com timestamps e referências verificáveis |
| `03-COMPARATIVO-DOS-APROVADOS.md` | análise técnica/visual de ChatGPT e Antigravity + o que foi aproveitado |
| `04-FIDELIDADE-VISUAL.md` | correspondências e diferenças contra os assets oficiais |
| `05-IMPLEMENTACAO-E-RIG.md` | arquitetura, rig, espaços, armas/mãos/correntes, cache |
| `06-ARENA-E-COMBATE.md` | arena, controles, golpes, inimigos, feedback |
| `07-TESTES-E-VALIDACAO.md` | matriz de testes, benchmarks, falhas e correções |
| `08-ENTREGA-AO-JUIZ.md` | este guia |

## 8. Limites que o juiz deve considerar

1. **Uma vista só** (3/4 espelhada): não há como girar o personagem 360°.
2. **Sem IK**: pés e mãos não se adaptam automaticamente ao terreno.
3. **Sem colisão com props**: árvores e pedras são visuais.
4. **Sem áudio**.
5. **Performance**: o piso de 200 FPS **foi alcançado e medido** (224,9 FPS em laço fechado) no
   início da sessão, mas **não se manteve estável** — a suíte final do mesmo build mediu 184,3/163,8
   FPS e a taxa de parede ficou em 139/124 FPS. O ambiente desta medição **não é confiável para
   números absolutos**. Celular e GPU real não medidos.
6. **Rosto**: boca/queixo e orelhas ainda diferem da referência (ver `04`, §3).
