# Roadmap - Arena do No Rest

Este documento detalha o plano de fases para a evolução do desenvolvimento do jogo.

## Fases Planejadas

### [x] FASE 0 — Setup do Projeto
- Configuração do monorepo e dependências.
- Configuração de TypeScript e Vite.
- Servidor Colyseus mínimo.

### [x] FASE 1 — Arena Offline Visual
- Cena 3D básica em Three.js.
- Câmera isométrica inclinada fixa.
- Chão de areia e coliseu low-poly.
- Iluminação golden hour, sombras e braseiros decorativos.
- Dummy estático (boneco de treino) no centro da arena.

### [x] FASE 2 — Player Offline + Combate Base
- Personagem local com movimentação (WASD + Joystick mobile).
- Câmera suave seguindo o jogador.
- Barra de vida e stamina (HUD).
- Dash com consumo de stamina.
- Ataques leve/pesado com pesos (windup, active, recovery) e cooldowns.
- Dano e knockback básico no dummy.

### [ ] FASE 3 — Inimigo Básico Offline
- Implementação de IA de perseguição e ataque.
- Sistema de ondas (waves).

### [ ] FASE 4 — UI Mobile / Action RPG
- Layout de HUD completo simulando a referência visual.
- Polimento dos controles móveis.

### [ ] FASE 5 — Multiplayer Base com Colyseus
- Sincronização de múltiplos jogadores em sala privada via código.
- Interpolação de posições.

### [ ] FASE 6 — Combate Online Autoritativo
- Lógica de combate validada pelo servidor.
- Sincronização de dano e barra de vida.

### [ ] FASE 7 — Coop contra Inimigos Online
- Inimigos spawnados e controlados pelo servidor.

### [ ] FASE 8 — Polimento e Performance
- Efeitos visuais extras (slash, hit stop, screen shake).
- Ajustes de performance para mobile.

### [ ] FASE 9 — Deploy Web / PWA
- Publicação do client e server na nuvem.
