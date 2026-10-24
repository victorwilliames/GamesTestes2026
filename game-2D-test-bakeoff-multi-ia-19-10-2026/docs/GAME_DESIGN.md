# Game Design e Sistema de Combate — @game2d

## 1. Visão Geral do Gameplay

Jogo de ação ágil, brutal e tático com perspectiva elevada 3/4 fake 2.5D. O jogador controla nosso herói assassino (Rogue/Thief) enfrentando desafios de combate em uma arena insular, com movimentação fluida, esquivas precisas e encadeamento de golpes brutais com duas adagas curvas acorrentadas.

---

## 2. Sistema de Combate — Adagas Infernais do Caos

O combate é construído em torno das duas adagas acorrentadas inspiradas nas **Blades of Chaos** de Kratos (God of War). **REGRA ABSOLUTA: AS ARMAS NÃO SÃO MACHADOS.**

### 2.1 Ações e Movimentos Básicos
- **Locomoção (WASD):** Caminhada e corrida com resposta imediata e foot lock (sem patinar).
- **Ataque Rápido / Sequência de Combos:** Combinação de 3 a 4 tempos (ex.: corte transversal direito -> corte cruzado esquerdo -> golpe duplo descendente).
- **Ataque Giratório (Spin Attack):** Giro de 360° com as lâminas estendidas pelo raio das correntes.
- **Perfuração / Estocada:** Ataque frontal rápido para quebra de guarda.
- **Lançamento e Retração:** Projeção da lâmina em linha reta conectada pela corrente, seguida de puxão para recuperação ou puxão do alvo.
- **Esquiva / Dash:** Movimento evasivo com janelas de invulnerabilidade (i-frames) calculadas.

### 2.2 Sincronização, Hitboxes e Hurtboxes
- Cada ataque possui fases distintas: **Antecipação (wind-up)**, **Impacto (active frames)** e **Recuperação (recovery)**.
- O dano é aplicado exclusivamente durante a fase de impacto ao interceptar a hurtbox dos inimigos.
- Resposta tátil ao impacto: hit-stop leve, empurrão (knockback) e flash de dano no alvo atingido.

---

## 3. Arena de Testes e Inimigos Interativos (Etapa 3)

Na Etapa 3 da Fase 1, o jogo deve oferecer uma arena funcional no navegador:
- **Cenário:** Arena da ilha tropical baseada em `assets/references/ref-2d-maps/map-island-enemys.png` com limites claros de colisão.
- **Inimigos de Teste:** Alvos de treino interativos que:
  - Tomam dano com números ou indicadores visuais.
  - Reagem fisicamente aos golpes (reação de acerto / pushback).
  - Executam ataques simples com telegrafia visual para validação de esquiva e posicionamento.
- **Controles no Navegador:**
  - Teclado (WASD para andar, Espaço para esquiva, teclas/mouse para atacar).
  - Painel de depuração em tempo real com contador de FPS nativo, frame time e contador de combos.

---

## 4. Requisitos de Performance

- Taxa mínima inegociável de **200 FPS** a **1280 × 720** sem cap de vsync.
- A arena e os inimigos não podem degradar o desempenho abaixo do piso estabelecido.
