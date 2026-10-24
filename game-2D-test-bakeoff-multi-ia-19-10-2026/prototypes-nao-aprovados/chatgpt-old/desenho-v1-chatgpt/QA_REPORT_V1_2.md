# V1.2 — Auditoria incremental (19/10/2026)

## Falha reportada pelo usuário

- V1: abertura local não carregava o personagem no ambiente do usuário; HTML usava `<script type="module" src="./src/app.js">`, inadequado para muitos browsers em `file://` devido a CORS.
- V1: as duas armas eram visualmente deformadas e as empunhaduras não respeitavam o mesmo pivô de seus braços.
- V1: material, cabelo, rosto, roupas e armas ficavam aquém da pintura artesanal canônica.

## Correções implementadas em V1.2

- `index.html` usa fontes `src/*.js` inline, geradas por build rastreável; não há carregamento externo de módulo para executar o Canvas.
- Preservado `dev.html` com JS modular para quem desejar desenvolvimento via servidor.
- Uma imagem de referência (cópia do PNG enviado pelo usuário) é carregada exclusivamente na `<img>` de comparação; não é usada em `CanvasRenderingContext2D`.
- Armas refeitas com silhueta curva/dentada e cadeia de transformações igual ao braço; mão redesenhada sobre a base da empunhadura; materiais enriquecidos com contornos, zonas de sombra e veios incandescentes.
- Presets estáticos idle, corrida, ataque e T compartilham a mesma arte procedimental. Sudeste é apenas variante projetada, ainda reprovada como orientação geométrica real.

## Testes efetivamente feitos

- Chromium headless usando `page.set_content` do HTML com script inline: **sem exceções JS** no console da página.
- Reference PNG fornecido pelo usuário carregado por `<input type=file>`: **SIM**, foto apenas no painel HTML separado.
- Dois renders sem mudança de estado produziram a mesma string `canvas.toDataURL`: **SIM**, textura estável.
- `window.__verifyProcedural()`: canvas 960×1060, 6 camadas em buffer geradas por código, flag `integratedRig01:false`.
- Capturas reais: `evidence/v2-idle-S.png`, `v2-idle-SE.png`, `v2-run-S.png`, `v2-attack-S.png`; screenshots representam a execução real do código, não render de modelo generativo.
- Navegação direta em `file://` pelo Chromium da sandbox e hospedagem HTTP: **bloqueadas por política do ambiente**; portanto a abertura por duplo clique no Windows ainda deve ser confirmada pelo usuário.
- Nenhum commit/push/alteração do game principal realizada.

## Avaliação por gate

| Gate | Resultado | Observação |
|---|---|---|
| A. Fidelidade estática | **FALHOU** | Referência ainda mais orgânica: cabelo tem cachos grossos pintados, volume maior e sombreamento intenso; corpo/braçadeiras/cinto/capa mais detalhados; armas oficiais têm corpo escuro irregular e crosta vermelha incandescente diferente das crescentes vetoriais atuais. |
| B. Fidelidade sob articulação | **NÃO PROVADA** | Apenas quatro presets locais, não o RIG-01. Juntas ainda não têm cotovelo funcional; escorregamento e oclusão em yaw/ataque não foram validados. Sudeste não é um ângulo modelado individualmente. |
| C. Integridade Canvas | **PASSOU NO RENDER** | Cache de canvas autoral, HTML `img` separado, sem WebGL, sem drawImage de originais no herói, mesma função de pintura nas poses. |

## Próxima correção específica

1. Refazer as 6 mechas frontais de cabelo usando curvas Bézier medidas da referência, com zonas de tinta e direção de relevo única por mecha.
2. Reprojetar cada uma das lâminas com chapa escura mais larga e dentes/ganchos de menor regularidade; aproximar as cadeias de metal em escala com a referência.
3. Construir proporções e materiais do tronco/faixas/saiote/botas em continuidade com a cabeça, não meramente formas de treino.
4. Somente após gate A passar com aprovação humana, conectar o **RIG-01.1 verdadeiro** em três estados e duas orientações reais. Corrigir falhas de pintura quando girar, sem substituir o renderer.

**Decisão: NÃO APROVADO ARTISTICAMENTE. NÃO APROVADO COMO RIG.**
