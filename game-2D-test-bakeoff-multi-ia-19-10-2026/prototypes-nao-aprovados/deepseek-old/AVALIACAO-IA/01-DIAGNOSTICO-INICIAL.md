# 01 — DIAGNÓSTICO INICIAL (DeepSeek)

**Data:** 19/10/2026
**Pasta da IA:** `prototypes/deepseek/`
**Entrega executável:** `prototypes/deepseek/desenho-v1-deepseek/index.html`
**Fontes:** `prototypes/deepseek/desenho-v1-deepseek/src/00-core.js` … `10-game.js`

---

## 1. O que é esta entrega

Uma reconstrução jogável do HERO-02 **100% procedural em Canvas 2D**, sem sprites, sem PNG
em runtime, sem WebGL, sem bibliotecas. Um único `index.html` autocontido (scripts clássicos
concatenados pelo build) abre por **duplo clique** em `file://`, sem servidor.

O mesmo renderer procedural (`DS.drawHero` / `DS.drawWeapon` / `DS.drawChain`) desenha o herói
parado, andando, correndo, atacando, rolando e levando dano. Não existe troca de arte entre
poses: existe um rig (FK) + curvas de pose + um pintor.

---

## 2. Funcionalidades realmente operacionais (verificadas no navegador)

| Sistema | Estado | Evidência |
|---|---|---|
| Herói montado por partes procedurais (cabeça, tronco, braços, pernas, botas, saia, cinto, cachecol) | **Operacional** | `screenshots/hero-proporcoes.png` |
| Hierarquia de rig com pivôs locais (pelve → tronco → pescoço/cabeça, ombros → cotovelos → punhos, quadris → joelhos → tornozelos) | **Operacional** | `screenshots/poses-ataque.png`, `screenshots/game-debug.png` |
| Animações procedurais: idle (respiração), caminhada, corrida, 3 ataques, dash, giro, dano, morte | **Operacional** | `screenshots/poses-ataque.png`, `screenshots/game-combo.png` |
| Duas adagas curvas incandescentes com halo emissivo, sangue, recortes internos e cabo de couro | **Operacional** | `screenshots/hero-proporcoes.png` |
| Correntes de elos individuais ligando o pomo ao antebraço (com voltas no pulso/antebraço) | **Operacional** | `screenshots/hero-proporcoes.png` |
| Mão segurando o cabo (palma atrás → cabo → dedos/polegar na frente) | **Operacional** | idem, ampliado |
| Hitbox derivada da **mesma** geometria da lâmina desenhada (`DS.bladeWorld` → mundo) | **Operacional** | `screenshots/game-debug.png` (F1) |
| Combos A1 → A2 → A3 com buffer de input e janela de combo | **Operacional** | `screenshots/game-combo.png` |
| Inimigos esqueleto com IA de aproximação, ataque, dano, flash, knockback e morte | **Operacional** | `screenshots/game-horda.png` |
| Arena ilha 6000×3800 u com chão pintado uma vez e props com ordenação por Y | **Operacional** | `screenshots/game-final.png` |
| HUD (retrato, vida, fúria, combo, kills, ícones Q/E/R, painel de performance) | **Operacional** | idem |
| Captura real via CDP (nunca `canvas.toDataURL`) | **Operacional** | `tools/shot.mjs`, `tools/eval.mjs` |
| Modos de bancada: `?bench=N`, `?benchloop=1`, `?sheet=hero|attacks`, `?freeze=`, `?debug=1`, `?spawn=N`, `?no=` | **Operacional** | `07-TESTES-E-VALIDACAO.md` |

---

## 3. Números do estado atual (medidos nesta máquina)

- **Custo de motor (JS) por quadro — cena completa, 4 inimigos:** `draw 1,0–1,45 ms` (EMA, cena
  limpa) + `update 0,02–0,07 ms`; no fim da sessão o mesmo build mediu ~2,2 ms por degradação do
  ambiente.
- **Quadro completo em laço fechado (rasterização inclusa):** suíte oficial **5,425 ms → 184,3 FPS**
  (4 inimigos) e **6,104 ms → 163,8 FPS** (8); repetições do mesmo build variaram de **4,45 ms
  (224,9 FPS)** a **7,19 ms** (4) e de **5,54 a 9,93 ms** (8) conforme a máquina degradou.
- **Sustentado por `requestAnimationFrame`:** **taxa de parede 139,0** (4) e **124,4 FPS** (8);
  sem os quadros > 100 ms, média 252,0 / 147,7 e mediana 714 / 556 FPS, com 31/12 *stalls* de
  apresentação do ambiente documentados em `07`.
- **Tamanho da entrega:** `index.html` ≈ 189 kB (11 módulos).
- **Determinismo:** todas as texturas usam `DS.rng(semente)` — a mesma pose produz os mesmos pixels.

> **Ressalva obrigatória:** celular (Galaxy S20 FE ou mais fraco) **não testado neste hardware**.
> O ambiente de medição é headless e rasteriza por software; números de GPU real não foram colhidos.

---

## 4. O que NÃO está pronto / limitações declaradas

1. **IK de dois ossos não foi implementado.** O rig é FK com curvas de ângulo autorais
   (`DS.POSE`), o que garante o arco desenhado, mas não corrige pé/mão no chão automaticamente.
2. **Turnaround real não existe.** O herói é desenhado de perfil para a direita e espelhado
   (`facing = -1`); há apenas um `yaw ≈ 0,25` fixo (3/4 fake). Não há 8 vistas.
3. **Rosto:** boca/queixo ainda um pouco abaixo do ideal e orelhas estilizadas maiores que a
   referência. Ver `04-FIDELIDADE-VISUAL.md`.
4. **Performance em hardware real:** a meta de 200 FPS é demonstrada no custo de motor e no
   laço fechado; a medição sustentada em GPU real e em celular **não foi realizada**.
5. **Sem áudio.** Os "sons" declarados nos golpes são apenas marcadores de dados.
6. **Não há commit** desta entrega no Git (árvore de trabalho não versionada).

---

## 5. Decisões de arquitetura que condicionam tudo

- **Scripts clássicos + build Node** (`tools/build.mjs`): garante `file://` por duplo clique.
- **Espaço local do herói:** origem na **pelve**, `-y` para cima, herói olhando para `+x`.
- **Espaço local da arma:** origem no **grip**; pomo em `(-70, 8)`; ponta desenhada em
  `pivot + (tip − pivot) · BLADE_SCALE`, calibrada para cair em `SK.BLADE_TIP` (hitbox = desenho).
- **Pintar uma vez, blitar sempre:** peças do corpo, arma+mão, props, inimigos e avatar do HUD
  são bitmaps offscreen determinísticos. O quadro quente só faz `drawImage` + correntes + FX.
- **Chão na escala exata da tela** (`BS = PLAY = 0,24`): um blit 1:1, nítido e barato.
