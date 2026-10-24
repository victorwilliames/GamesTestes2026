# Continuidade do Projeto — Diretrizes para Agentes

Antes de realizar qualquer alteração, leia obrigatoriamente `AI-MEMORY.md`.

## Escopo Atual (Atualizado em 20/10/2026)
- O projeto do "Carequinha" foi completamente descartado.
- O projeto está **iniciando do zero** para criar o herói novo ("Red-Haired Knight").
- As referências oficiais estão em `ref/novo-heroi/` (`cabeca-ref.png`, `prancha-turnaround-poses.png` e `SPEC-VISUAL.md`).
- A partir dessa referência, a IA implementará proceduralmente todo o personagem (estilo Canvas 2D puro, IK analítica, rig, torso, armadura prateada, membros, espada, arena e combate jogável com WASD).

## Organização do Repositório
- `ref/novo-heroi/`: Referências oficiais ativas do novo herói (cabeça, prancha de turnaround 8 direções e poses de combate).
- `ref/hades1/`: Referências visuais de ambientação e câmera isométrica estilo Hades (só-leitura).
- `RafaxLab-YTB-do-zero/` e `prompts a executar/`: Fontes metodológicas do método do Rafa (só-leitura).
- `AI-MEMORY.md`: Deve ser mantido atualizado ao final de cada bloco de trabalho para garantir continuidade perfeita entre sessões.

## Regras Técnicas Globais
- Canvas 2D nativo puro (sem WebGL, sem engines externas e sem imagens carregadas em runtime).
- Câmera isométrica 3/4 (yaw 45°, pitch 34°).
- IK analítica de 2 ossos com Lei dos Cossenos e preservação de comprimento.
- Testes unitários com Node.js nativo (`node --test tests/*.test.cjs`).
