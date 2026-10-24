# HERO-02 — Desenho V1.2 (correção do V1, sem reiniciar o projeto)

## Abrir no Windows — SEM servidor e SEM instalar dependências

1. Extraia `desenho-v1-chatgpt-v1.2.zip` **com a estrutura interna preservada**.
2. Coloque `desenho-v1-chatgpt` em `D:\.GITHUB\games\game-2d\prototypes\desenho-v1-chatgpt`, ou em outra pasta.
3. **Dê dois cliques em `index.html`** no Chrome/Edge. Esta edição usa script **inline**, não usa `type=module` nem `import` do navegador, evitando o bloqueio CORS típico do `file://` quando o HTML antigo era aberto diretamente.
4. No modo Comparação, a interface procura a referência canônica no repositório. Se não a encontrar, a cópia de visualização de `reference-preview/hero-idle-s-user.png` é carregada **apenas no painel de referência** (elemento HTML `<img>`). A cópia fornecida pelo usuário não é carregada pelo Canvas procedural.
5. Se o painel de referência ficar vazio, use o campo **Carregar referência local** para escolher o PNG no seu computador.

> Limite de QA: neste ambiente houve bloqueio administrativo de navegação `file://` e HTTP pelo navegador automatizado. Foi verificada a execução completa do HTML inline usando `page.set_content` do Chromium real, mas o duplo clique no Windows **ainda depende da sua confirmação**. A página em si não depende de módulos, rede, bundler ou servidores.

## Como trabalhar nos arquivos-fonte

- **`index.html`**: build autocontido de produção/teste local, com 8 módulos concatenados e reescritos em um `<script>` inline.
- **`src/`**: fontes ES Modules originais e organizados. É aqui que devem ser feitos ajustes.
- **`tools/build_standalone.py`**: recria `index.html` automaticamente após editar os fontes (`python tools/build_standalone.py`).
- **`dev.html`**: HTML modular para servidor local somente se desejar desenvolvimento separado.
- **`tools/qa_v2.py`**: teste automatizado via Chromium/Playwright; utiliza carregamento em memória porque a política do ambiente bloqueia navegação do Chromium.
- **`reference-preview/`**: PNG do usuário exclusivamente para comparação; nunca é a imagem final do renderer.
- **`evidence/`**: screenshots do V1 preservados + screenshots reais da revisão V1.2.

## Controles

- Visualização: comparação, isolado e pivôs.
- Enquadramento: herói, cabeça, corpo ou armas.
- Escala: grande/intermediária/gameplay.
- Pose: idle, corrida intermediária, ataque estático, T diagnóstica. **São presets de pose locais**, ainda NÃO fornecidos pelo RIG-01 verdadeiro.
- Orientação: Sul ou uma **projeção Sudeste provisória e não aprovada** (não é um turnaround geométrico verdadeiro).
- Salvar PNG procedural: salva **somente os pixels do Canvas**, sem o PNG da referência.

## Mudanças V1 → V1.2

1. Corrigido o motivo provável da tela vazia ao abrir diretamente em `file://`: agora a execução do renderer está inline no `index.html` autocontido.
2. Reference preview e upload local para a comparação funcionar mesmo fora do repositório.
3. Refizemos o painter de armas: novas silhuetas de lâmina, dentes internos, chapa de aço, metal incandescente estático, cabo, correntes e mão por cima da empunhadura.
4. **Armas agora obedecem à mesma transformação local dos braços**, sem recalcular um posicionamento isolado incompatível com a mão. Presets `run` e `attack` compartilham este painter, sem sprites.
5. Materiais com massas de sombra, direção de arranhões e hachuras por semente; iris vermelha com melhor proporção.
6. Incluídas capturas comparativas verdadeiras e QA de determinismo da mesma pose.

## Status HONESTO

- **A. Fidelidade visual estática: REPROVADA.** O resultado ainda não atinge o estilo artístico e a silhueta exata da referência, sobretudo cabelo, anatomia, tecido, pintura e armas.
- **B. Fidelidade sob articulação: NÃO VALIDADA.** Há presets estáticos `run`/`attack` e desenho idêntico entre poses, mas a integração do RIG-01 real, articulações de cotovelo/joelho, oclusão e rotação 3/4 ainda não passaram.
- **C. Integridade técnica: APROVADA NO TESTE IN-MEMORY.** Canvas 2D puro, Path2D, caches apenas procedurais, sem WebGL, sem sprite base. Um teste de abertura via duplo clique no Windows continua pendente.

**Não houve commit nem push.** Não foram alterados arquivos de jogo, protótipos alheios ou referências originais.

A próxima etapa recomendada é o **checkpoint artístico de silhueta + pintura da cabeça e armas**, e só depois integrar RIG-01, se a qualidade da arte justificar.
