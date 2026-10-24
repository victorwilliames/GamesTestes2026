# Protótipos — comparação entre IAs (bake-off)

Esta pasta existe para **comparar lado a lado** o protótipo jogável que cada IA/agente
constrói a partir do mesmo prompt (`prompts a executar/FASE1-prompt-do-rafaxlab-com-claude-procedural.md`).
No fim, o usuário abre um por um e decide quem se saiu melhor.

## Regra de ouro da organização

**Cada agente escreve SOMENTE na sua própria pasta.** Ninguém edita o protótipo do outro.

```
prototipos/
├── README.md                             <-- (você está aqui)
├── do-deepseek/
│   └── prototipo-v1-deepseek/            <-- versão 1 do DeepSeek
├── do-chatgpt/
│   └── prototipo-v1-chatgpt/             <-- (a criar pelo ChatGPT)
└── do-antigravity/
    └── prototipo-v1-antigravity/         <-- (a criar pelo Antigravity)
```

### Convenção de nomes

```
prototipos/do-<autor>/prototipo-v<N>-<autor>/
```

- `do-<autor>`: pasta do agente/modelo (`do-deepseek`, `do-chatgpt`, `do-antigravity`, ...).
- `prototipo-v<N>-<autor>`: a entrega. Se fizer uma segunda tentativa, crie `prototipo-v2-<autor>/`
  ao lado — **nunca** sobrescreva a v1, o histórico faz parte da comparação.

### Cada protótipo é autossuficiente

Dentro de `prototipo-v<N>-<autor>/` deve haver **tudo** que o protótipo precisa para rodar sozinho:

```
prototipo-v1-<autor>/
├── index.html          # (quando existir)
├── turnaround.html     # (quando existir)
├── face.html           # (quando existir)
├── js/                 # core, ink, rig, head, hero, world, fx, main...
├── tests/              # testes (rodam de dentro desta pasta)
└── LEIA-ME.md          # ficha da entrega (o que funciona, o que não, como testar)
```

- Os testes usam **caminhos relativos**, então rode-os de dentro da pasta do protótipo:
  `node --test tests/*.test.cjs`
- Nada de importar arquivo de outro protótipo. Se precisar de algo, copie para dentro.

## O que é COMPARTILHADO e só-leitura

Estes ficam na raiz e **não pertencem a nenhum agente**. Nenhum protótipo deve escrever neles:

- `ref/` — imagens-guia (rosto e corpo do carequinha, atmosfera Hades).
- `RafaxLab-YTB-do-zero/` — o método do Rafa, a conversa original e o código de referência (truncado).
- `docs/` — plano do projeto.
- `prompts a executar/` — o prompt mestre.
- `AGENTS.md`, `AI-MEMORY.md`, `DESIGN.md` — contexto do projeto.

## Como o usuário compara

Baseado em `RafaxLab-YTB-do-zero/04-CRITICO-VISUAL-E-SCREENSHOTS.md`, com screenshots reais de cada protótipo:

1. **Arte** — silhueta, proporções, semelhança com o carequinha, contraste do estilo HQ.
2. **Animação** — poses-chave (antecipação/golpe/recuperação), arcos, cotovelos e joelhos dobrando certo.
3. **Técnica** — sem imagens no runtime, chão em cache offscreen, sem erro no console.
4. **Bugs visuais** — z-order errado, membro atravessando o corpo, lâmina transpassando.
5. **Jogabilidade** — WASD, combo de 3 golpes com buffer, teclas B (esqueleto) e T (câmera lenta).