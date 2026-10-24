# 00 — Comece Aqui do Zero: O Guia Definitivo do RafaxLab

Bem-vindo ao repositório limpo e isolado de reprodução do método de **Rafael (RafaxLab)**.

Se você está em um novo computador para recomeçar o projeto 100% do zero, **este é o seu ponto de partida único**.

Tudo o que está nesta pasta foi extraído diretamente das fontes primárias originais:
1. Os vídeos do canal **RafaxLab** ([Tech Bite #002](https://www.youtube.com/watch?v=Vi8wJKNYRp8) e Tech Bite #001).
2. A transcrição oficial em português de 28 minutos com minutagem exata.
3. A conversa original na íntegra de Rafael com o Claude Code (594 ações, 190 imagens, 7 mensagens humanas e 6 relatórios críticos).
4. O código-fonte de referência e as ferramentas desenvolvidas no experimento.

> [!IMPORTANT]
> **ESTE AMBIENTE É 100% LIMPO E LIVRE DE RUÍDOS ANTERIORES.**  
> Aqui não há discussões do projeto antigo, tentativas falhadas, confusões de armas ou regras conflitantes. O foco aqui é exclusivamente **entender e reproduzir o passo a passo exato que o Rafa mostrou no YouTube**.

---

## 1. O Que Você Tem em Mãos Nesta Pasta

```
RafaxLab-YTB-do-zero/
│
├── 00-COMECE-AQUI-DO-ZERO.md                 <-- (Você está aqui)
├── 01-PASSO-A-PASSO-DO-RAFA-NO-YOUTUBE.md    <-- Manual cronológico detalhado do início ao fim
├── 02-ARQUITETURA-E-ENGENHARIA-DO-PILOTO.md <-- Como funcionam os 10 módulos, rig 3D, IK e Canvas
├── 03-APRENDIZADOS-E-METODO-RAFAXLAB.md     <-- Lições fundamentais e fatos comprovados
├── 04-CRITICO-VISUAL-E-SCREENSHOTS.md       <-- Como rodar o QA visual com screenshots reais
│
├── prompts/                                 <-- Os 7 prompts enviados por Rafael na íntegra
│   ├── 01-PROMPT-MESTRE-PILOTO.md           <-- O prompt inicial que gerou o jogo
│   ├── 02-PROMPT-REFINAMENTO-ROSTO.md       <-- O prompt de foco cirúrgico no rosto Sul
│   └── 03-TODOS-OS-7-PROMPTS-NA-INTEGRA.md  <-- Histórico completo dos 7 prompts
│
├── CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/
│   ├── index.html                           <-- Abra no navegador para ver toda a conversa original
│   └── img/                                 <-- Todas as 190 imagens geradas no experimento do Rafa
│
├── videos/
│   ├── transcricao_Vi8wJKNYRp8.txt          <-- Transcrição completa em português (28 min)
│   ├── Vi8wJKNYRp8.md                       <-- Decodificação do vídeo #002 com minutagem
│   └── mp5Z2z2FcBg.md                       <-- Contexto do vídeo #001
│
└── codigo-de-referencia-do-piloto/          <-- Código original extraído do experimento
    ├── index.html                           <-- Jogo principal (WASD + clique combo)
    ├── turnaround.html                      <-- Visualizador de 8 direções e combo
    ├── face.html                            <-- Comparador lado a lado do rosto
    ├── face_trace.html                      <-- Ferramenta de vetorização de referências
    ├── .claude/serve.py                     <-- Servidor HTTP sem cache
    └── js/                                  <-- Todos os módulos JS (core, rig, ink, knight, etc.)
```

---

## 2. Preparação Rápida no Novo Computador (Menos de 5 Minutos)

Para rodar ou construir o projeto em seu novo computador, você precisa apenas de:

1. **Python 3** (para servir os arquivos locais):
   - Já vem com o módulo HTTP.
2. **Navegador Moderno** (Chrome, Brave, Edge ou Firefox).
3. **Node.js** (opcional, caso queira rodar automações do Claude Code ou scripts Playwright).

### Testando a Referência Imediatamente:

No terminal, dentro da pasta `codigo-de-referencia-do-piloto`:
```bash
python .claude/serve.py 5317
```
Abra seu navegador em:
- **O Jogo:** `http://localhost:5317/index.html`
- **O Turnaround:** `http://localhost:5317/turnaround.html`
- **A Conversa Original:** Abra `CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/index.html` diretamente em qualquer navegador!

---

## 3. Os 5 Passos Para Reproduzir o Rafa do Zero

Para seguir fielmente o processo do Rafa na sua nova máquina:

1. **Leia o Manual:** Abra [`01-PASSO-A-PASSO-DO-RAFA-NO-YOUTUBE.md`](01-PASSO-A-PASSO-DO-RAFA-NO-YOUTUBE.md).
2. **Entenda o Setup:** Crie uma pasta vazia para seu novo código e inicie um servidor sem cache.
3. **Dispare o Prompt 1:** Use o [`prompts/01-PROMPT-MESTRE-PILOTO.md`](prompts/01-PROMPT-MESTRE-PILOTO.md).
4. **Instancie o Crítico Visual:** Tire screenshots reais no navegador e ajuste a profundidade e a oclusão.
5. **Aplique o Refinamento Focado do Rosto:** Use o [`prompts/02-PROMPT-REFINAMENTO-ROSTO.md`](prompts/02-PROMPT-REFINAMENTO-ROSTO.md) para aproximar o rosto da sua imagem de referência.
