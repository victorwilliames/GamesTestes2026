# HERO-02 — Relatório de fidelidade e QA (19/10/2026)

## Veredito

**Renderer: protótipo funcional. Fidelidade artística: NÃO APROVADA. Rig: NÃO IMPLEMENTADO.**

Esta prova reproduz categorias visuais reconhecíveis (cabelo espetado, olhos vermelhos, cachecol e capa vermelhos, torso descoberto, cinto com caveira, duas adagas/correntes) por meio de Canvas 2D com curvas, geometrias autorais e hachuras fixas. Não oferece paridade convincente com a pintura artesanal dos PNGs. O objetivo central ainda precisa de iterações.

## Comparação qualitativa com as vistas canônicas Sul/Sudeste

| Critério | Nota interna 0–4 | Diagnóstico |
|---|---:|---|
| Silhueta / proporções | 2 | Chibi e cabeçudo reconhecível, mas mechas superiores ainda muito regulares e altura/volume não calibrados pelo PNG de partes. |
| Olhos/expressão/cabelo | 2 | Olhos vermelhos, sobrancelhas e mechas presentes; geometria facial e arranjo específico da franja ainda diferem. |
| Torso/roupas/caveira | 2 | Peitoral, abdômen, faixas, botas e caveira única; anatomia e detalhes do couro ainda simplificados. |
| Duas armas / correntes | 2 | Lâminas dentadas e elos desenhados em código. Geometria está distante da silhueta exata e a corrente é estática. |
| Materiais rabiscados/pintados | 1 | Riscos e hachuras determinísticas presentes, mas resultado permanece com leitura vetorial limpa, não pincelada densa da referência. |
| Contornos e profundidade | 2 | Sobreposições e sombra por região; contornos ainda excessivamente contínuos e forma lisa. |
| Leitura reduzida | 2 | Olhos, cachecol e botas legíveis; microtexturas e geometria da lâmina se perdem ao reduzir. |
| Preparação para rig | 2 | Pivôs documentados, braços locais e caches por peça. Cotovelos, pernas e geometria global ainda não estão prontos para rig completo. |

Notas são uma **autoavaliação crítica, não aprovação do usuário nem métrica objetiva de similaridade**. O gate de fidelidade foi **reprovado** pela própria avaliação antes de pedir aprovação.

## Verificações executadas

- `node --check` em todos os arquivos `src/*.js`: **passou**.
- Chromium headless: `CanvasRenderingContext2D` real, sete screenshots em `evidence/`: **passou**.
- Capturas foram feitas via `page.set_content` e injeção do mesmo código, concatenado apenas no harness de teste. Ambiente bloqueia navegação HTTP/file no navegador automatizado; carregamento direto das importações ES Modules em servidor local do Windows: **não testado neste ambiente**.
- `window.__verifyProcedural()`: **sem erros JS** no harness.
- Re-render da mesma pose: `canvas.toDataURL()` exatamente igual antes/depois: **determinismo aprovado**.
- `drawImage()` usado exclusivamente para **caches criados pelos painters** em `src/hero.js`. Referência em elemento HTML `<img>` distinto: **nenhum PNG oficial usado para desenhar o herói**.
- Capturas verificadas visualmente de `hero-full.png`, `hero-head.png`, `hero-gameplay.png`, `hero-tpose.png`. Desenho representa o protótipo, sem confundi-lo com original.
- Seis buffers cacheados por peça; primeiro render observou custo maior (ordem de 200 ms neste Chromium), redesenhos após cache na ordem de ~15 ms no ambiente de teste. Não é medição homologada de FPS/PC fraco nem promessa para runtime.

## O que NÃO foi verificado

1. Os cinco PNGs originais de partes não foram decodificados diretamente neste ambiente, impedindo medição exata de alpha, landmarks e silhueta das peças. Existência no repositório foi confirmada.
2. O modo lado a lado só exibe o PNG ao ser executado **dentro da pasta do repositório onde as referências estão disponíveis**. Captura normalizada original versus procedural não foi possível neste ambiente; não há screenshot comparativo oficial local.
3. Browser/servidor HTTP real, diferentes sistemas e hardware móvel não foram testados.
4. Um rig futuro de cotovelo/joelho ainda precisará separar ossos e refinar a continuidade dos volumes.

## Correções por prioridade para nova iteração artística, se autorizada

1. Medir `hero-part-head.png` pixel a pixel, marcar ~25 landmarks (face, olhos, linha do cabelo, mechas) e refazer principalmente as **6 maiores mechas frontais**. Não ampliar escopo.
2. Substituir preenchimentos lisos por massas internas de pincel seco/hachura mais complexa por material, sem sacrificar cor/forma.
3. Medir a geometria de `hero-part-weapons.png` e refazer dentes, recortes e pontos de corrente por lâmina.
4. Ajustar espessura de braços, separação peitoral/costelas e costuras/botões das botas conforme T-pose original.
5. Produzir painel comparativo com **bounding boxes alfa normalizadas**, para reprovar/aprovar visual com referência real.

**Próximo gate:** inspeção dos PNGs modulares e correção artística antes de desenvolver qualquer IK/rig/animação. Nenhum recurso novo de gameplay foi acrescentado.
