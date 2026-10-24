# Game 2D Zero — O Carequinha (Antigravity Engine)

Piloto de RPG de ação 2.5D isométrico rodando em **HTML5 Canvas 2D nativo puro**, sem engines, sem WebGL e sem imagens de runtime.
Engenharia desenvolvida pelo **Antigravity**, reproduzindo integralmente o método do canal **RafaxLab (Rafael + Claude)** e a direção artística inspirada em *Hades* com a identidade visual do **Carequinha** (`ref/hero-carequinha/`).

---

## Como Rodar

```bash
node tools/serve.cjs 5317
```
Abra no navegador:
* **Jogo Principal (Arena, WASD e Combo):** [http://localhost:5317/](http://localhost:5317/)
* **Turnaround (Inspeção 8 Direções):** [http://localhost:5317/turnaround.html](http://localhost:5317/turnaround.html)

---

## Controles de Jogo

| Comando | Ação |
|---|---|
| **W, A, S, D** | Movimentação isométrica fluida |
| **Clique do Mouse** | Ataque na direção do cursor com combo encadeado de 3 golpes (1 → 2 → 3) |
| **Tecla B** | **Modo Esqueleto:** Exibe em tempo real o esqueleto 3D invisível, articulações e vetores polares |
| **Tecla T** | **Câmera Lenta (25%):** Permite inspecionar o easing de cada pose de animação e impacto |
| **Barra de Espaço** | Pausa / Retoma o jogo |

---

## Testes Automatizados

```bash
node --test tests/*.test.cjs
```
> **10 testes unitários passando (0 falhas).**

---

## Arquitetura Modular (`js/`)

* [`js/core.js`](js/core.js): Câmera isométrica 3/4 (`yaw 45°`, `pitch 34°`), vetores 3D, conversão de eixos locais, `project`, `unproject` do plano de chão e **coordenadas cilíndricas** $(\theta, r, z)$ nas mãos.
* [`js/ink.js`](js/ink.js): Pincéis de cel-shading procedural (máscara `clip()` com deslocamento de luz), cápsulas anatômicas e contornos de tinta preta estilo HQ.
* [`js/rig.js`](js/rig.js): Esqueleto 3D invisível com **IK analítica de 2 ossos via Lei dos Cossenos**, vetores polares para cotovelos/joelhos e máquina de estados de combo com buffer de clique. No Golpe 3, aciona a pegada bimanual (*two-handed slam*).
* [`js/head.js`](js/head.js): Rosto 2.5D procedural do Carequinha: crânio 3D calvo, **marca vertical carmesim**, olhos rubros incandescentes, sobrancelhas expressivas e cicatriz, orientado para a frente no espaço 3D (Prompt 5).
* [`js/hero.js`](js/hero.js): Torso musculoso sem camisa com cel-shading anatômico, lenço carmesim esvoaçante, cinto com fivela de caveira de marfim, espada estilo Hades com empunhadura real fechada nos dedos e ordenação rigorosa por profundidade (*depth sorting*).
* [`js/world.js`](js/world.js): Arena do platô gerada **uma única vez** em `OffscreenCanvas`, vegetação em sprites cacheados e vento dinâmico.
* [`js/fx.js`](js/fx.js): Efeitos visuais de combate: rastro curvo da lâmina, faíscas de impacto, anéis de choque no solo, tremor de tela e onomatopeias (*SLASH!*, *CLEAVE!*, *KRAK!*).
* [`js/main.js`](js/main.js): Loop com `requestAnimationFrame`, movimentação WASD no plano isométrico, mira no cursor do mouse, HUD com retrato em tempo real animado e atalhos de depuração (`B` e `T`).
* [`turnaround.html`](turnaround.html): Bancada de inspeção visual procedural em 8 orientações simultâneas.
* [`tools/serve.cjs`](tools/serve.cjs): Servidor local com cabeçalhos `Cache-Control: no-store` para evitar arquivos cacheados no navegador.
