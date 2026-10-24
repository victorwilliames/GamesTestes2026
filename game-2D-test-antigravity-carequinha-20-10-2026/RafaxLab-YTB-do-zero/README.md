# RafaxLab-YTB-do-zero — Base Limpa do Método Rafael + Claude

Este diretório contém o repositório consolidado, purificado e 100% independente do método desenvolvido por **Rafael (RafaxLab)** para a criação de um jogo procedural 2D/fake 2.5D em HTML5 Canvas puro com Claude Code.

**Destinado a:** Quem vai reiniciar o projeto do zero absoluto em outro computador, seguindo rigorosamente o passo a passo demonstrado no YouTube, sem qualquer ruído ou contexto contaminado de tentativas anteriores.

---

## Estrutura dos Arquivos

```
RafaxLab-YTB-do-zero/
│
├── 00-COMECE-AQUI-DO-ZERO.md               # Guia de início rápido e visão geral
├── 01-PASSO-A-PASSO-DO-RAFA-NO-YOUTUBE.md  # O manual cronológico completo do vídeo
├── 02-ARQUITETURA-E-ENGENHARIA-DO-PILOTO.md# Rig 3D, IK analítica de 2 ossos, câmera e Canvas
├── 03-APRENDIZADOS-E-METODO-RAFAXLAB.md   # Princípios, desmistificações e lições operacionais
├── 04-CRITICO-VISUAL-E-SCREENSHOTS.md     # Setup da bancada de QA visual e automação headless
│
├── prompts/                               # Os prompts originais enviados por Rafael
│   ├── 01-PROMPT-MESTRE-PILOTO.md         # O prompt inicial completo da Fase 1
│   ├── 02-PROMPT-REFINAMENTO-ROSTO.md     # O prompt de refinamento focado da Fase 2 (Sul)
│   └── 03-TODOS-OS-7-PROMPTS-NA-INTEGRA.md# Todos os 7 prompts humanos na íntegra
│
├── CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/
│   ├── index.html                         # Interface interativa completa da conversa
│   └── img/                               # 190 imagens, screenshots e gráficos do experimento
│
├── videos/                                # Transcrições e engenharia reversa dos vídeos
│   ├── transcricao_Vi8wJKNYRp8.txt        # Transcrição oficial em português (28 min)
│   ├── Vi8wJKNYRp8.md                     # Auditoria visual frame a frame do Tech Bite #002
│   └── mp5Z2z2FcBg.md                     # Notas de pesquisa do Tech Bite #001
│
└── codigo-de-referencia-do-piloto/        # Código-fonte original extraído do experimento
    ├── README.md                          # Documentação técnica do piloto gerada pela IA
    ├── index.html                         # Entrada do jogo no navegador
    ├── turnaround.html                    # Visualizador de inspeção de 8 direções
    ├── face.html                          # Ferramenta de comparação lado a lado do rosto
    ├── face_trace.html                    # Ferramenta de traçado vetorial
    ├── .claude/
    │   └── serve.py                       # Servidor HTTP com no-cache
    └── js/                                # Módulos de lógica, rig, pintura e física
```

---

## O Que Foi Removido (Purificação do Contexto)

Nenhum arquivo ou menção das tentativas antigas que geraram problemas foi incluído aqui:
- Removidos gradientes de massinha plásticos ou funções descontinuadas.
- Removidas disputas de regras de armas (adagas vs machados) que não pertencem ao piloto original do Rafael.
- Removidos relatórios e protocolos de avaliação de outras IAs.
- Removidas diretrizes de 200 FPS artificiais do antigo repositório.

O foco aqui é **100% no que Rafael mostrou no YouTube**:
- Câmera 3/4 e projeção isométrica.
- Rig 3D invisível com IK analítica de 2 ossos.
- Estilo HQ com 2 a 3 tons e contorno de tinta escuro (Canvas 2D sem imagens).
- Cenário gerado e cacheado em offscreen canvas.
- Crítica visual contínua por screenshots headless antes de entregar.
- Refinamento focado em marcos do rosto na posição Sul.

---

## Como Usar no Novo Computador

1. Copie a pasta inteira `RafaxLab-YTB-do-zero` para o seu novo computador.
2. Abra `00-COMECE-AQUI-DO-ZERO.md` para as instruções iniciais.
3. Consulte `prompts/01-PROMPT-MESTRE-PILOTO.md` para iniciar sua nova IA ou Claude Code do zero absoluto.
