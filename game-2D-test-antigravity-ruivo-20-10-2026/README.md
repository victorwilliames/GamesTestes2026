# Game 2D Procedural — Red-Haired Knight (Canvas 2D Puro)

Projeto de desenvolvimento de RPG de ação 2.5D isométrico rodando em **HTML5 Canvas 2D nativo puro**, sem engines externas, sem WebGL e sem imagens de runtime — todo o personagem, rig, armadura, espada, poses e combate são desenhados **proceduralmente via código**, inspirados no método do canal **RafaxLab (Rafael + Claude)** e na direção de arte estilo *Hades*.

---

## 🧭 Referências do Novo Herói

O novo herói é o **Cavaleiro de Cabelo Vermelho (Red-Haired Knight)**:
- [`ref/novo-heroi/cabeca-ref.png`](./ref/novo-heroi/cabeca-ref.png): Close-up frontal com traços, mechas de cabelo e paleta da cabeça.
- [`ref/novo-heroi/prancha-turnaround-poses.png`](./ref/novo-heroi/prancha-turnaround-poses.png): Folha de modelo completa com turnaround isométrico 360° em 8 ângulos e 7 poses de combate/locomoção.
- [`ref/novo-heroi/SPEC-VISUAL.md`](./ref/novo-heroi/SPEC-VISUAL.md): Especificação técnica de cores, proporções (~3.2 cabeças) e detalhes de armadura.

---

## 📁 Estrutura do Repositório

```text
game-2d-antigravity/
├── RafaxLab-YTB-do-zero/      # Documentação original do método do Rafa (prompts, arquitetura, crítico)
├── prompts a executar/        # Fases e prompts detalhados do método
├── docs/                      # Especificações técnicas e planos de implementação
├── ref/                       # Referências visuais ativas
│   ├── hades1/                # Referências de cenário, iluminação e câmera isométrica estilo Hades
│   └── novo-heroi/            # Referências oficiais do novo herói
├── AI-MEMORY.md               # Memória viva de contexto para transição e continuidade entre IAs
├── AGENTS.md                  # Regras de continuidade e diretrizes do repositório
└── README.md                  # Este documento
```

---

## 🎨 Princípios Arquiteturais Centrais
1. **Zero Assets de Imagem no Runtime**: Todos os elementos visuais (pele, mechas de cabelo, armadura, tecidos, espada, sombras) são desenhados proceduralmente com curvas de Bézier, caminhos geométricos e projeção 3D matemática.
2. **Câmera Isométrica Fiel**: Yaw 45°, pitch 34° com ordenação por profundidade coerente.
3. **IK Analítica Preservadora de Comprimento**: Lei dos Cossenos com vetores polares fixos para cotovelos e joelhos, garantindo anatomia sólida sem distorções elásticas.
4. **Cel-Shading Tinta & Luz**: Efeito de luz com 2–3 tons de cel-shading via `ctx.clip()` com deslocamento vetorial e contornos estilizados `--ink`.
