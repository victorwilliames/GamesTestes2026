# Aprendizados acumulados — RafaxLab / @game2d

**Atualização:** 19/10/2026. Este é um documento vivo: novo vídeo → nova evidência → aprendizado → experimento reproduzível.

## 1. A IA não resolveu tudo com um prompt mágico

Na auditoria visual do **Tech Bite #002**, a página interna do piloto exibe 7 mensagens humanas, 55 respostas do Claude, 594 ações, 170 imagens e 6 relatórios de crítico (~20:25). **Aprendizado:** delegar trabalho amplo exige ciclos iterativos; o usuário não precisa desenhar pessoalmente, mas o agente precisa testar e corrigir sistematicamente.

**Aplicação:** revisar screenshots em diferentes escalas/ângulos; crítica visual separada; logar defeitos e revisões. Não aprovar porque scripts dizem PASS.

## 2. O vídeo demonstra dois contextos distintos

**Dunloc Online** tem visual muito mais elaborado, mostrado em gameplay e cenários. O **piloto Canvas 2D** é um teste específico de esqueleto/pintura por código. Não há evidência no vídeo visual de que um único prompt produziu todo o jogo Dunloc.

**Aplicação:** replicar os mecanismos demonstrados pelo piloto sem prometer automaticamente a mesma qualidade de Dunloc.

## 3. Separar rig, animações, pintor e cenário

Por volta de 08:10, o registro descreve um esqueleto matemático projetado em 2D e módulos independentes (`rig.ts`, `anim.ts`, `personagem/vetor.ts`, `cenario/`, `efeitos/`). O prompt mostrado mais tarde exige IK de dois ossos, poses-chave e cache offscreen.

**Aplicação:** projetar interfaces separadas para **pose**, **geom. da figura**, **materiais/pincéis**, **ordem de desenho/oclusão**, **efeitos** e **cenário**. Testar cada módulo independentemente. Nem toda técnica mencionada no prompt foi confirmada em código.

## 4. Renderer artístico é o coração, e NÃO 'gradiente clay'

No vídeo, a estratégia descreve HQ com contorno de tinta, zonas de cor reduzidas, curvas e pintura autoral. A P0.1 do @game2d usou `drawClaySphere()` e `drawClayLimb()`, produzindo formas genéricas e um resultado visual reprovado.

**Aplicação:** exigir contornos orgânicos específicos do personagem, variação de largura de linha, traços deliberadamente imperfeitos, poucas faces de sombra, texturas determinísticas de massinha e leitura inequívoca da silhueta, **antes de implementar IK**.

## 5. Referências visuais servem de guia, não precisam existir no runtime

A execução do piloto exibe criação de retrato e menção a folha conceitual gerada por Nano Banana Pro/Higgsfield (~11:00–12:45; ~20:45). O prompt exige Canvas sem imagens no runtime. São decisões compatíveis quando a imagem é usada apenas como referência de produção.

**Aplicação:** agentes podem criar e analisar concept art sem usar assets de terceiros nem fingir que o concept é screenshot do jogo. A meta inicial ART-01 requer frame de fato pintado por Canvas.

## 6. Z-order e câmera importam tanto quanto IK

Na revisão (~21:45), o agente crítico aponta sobreposição inadequada do herói no oponente, leitura da capa e ordem de desenho. O conserto descrito inclui depth sorting, limites de altura da capa e fronteiras frente/trás.

**Aplicação:** testes explícitos de oclusão a 0°, 45°, 90°, 135°, 180°, 225°, 270° e 315°. Itens no plano frontal não podem aparecer sempre sobre os de trás. O ângulo 3/4 de jogo precisa integrar personagem e chão.

## 7. Testes reais de navegador, sem cache enganoso

Em ~21:10, o histórico relata screenshots aparentemente iguais devido ao cache do JavaScript; o agente muda a política de cache. Esse tipo de bug pode mascarar falhas de iteração.

**Aplicação:** servir arquivos com controle de cache apropriado na bancada de QA; reportar screenshots, versão/commit, parâmetros e diferenças verificáveis. Verificar render em resolução nativa.

## 8. Crítica artística por componente

Em ~23:05, a comparação do rosto usa landmarks e regiões: contorno, nariz, olhos, boca, cabelo e luz/sombra. Outras críticas cobrem proporções, roupa e silhueta.

**Aplicação:** revisar individualmente cabeça/cabelo, tronco, equipamento, adagas/correntes, materiais, escala e mapa. Corrigir cada defeito em pequena rodada, preservando o que foi aprovado.

## 9. Performance: cache do estático, atualização do dinâmico

O prompt do piloto pede árvores, rochas e chão desenhados uma vez em offscreen; personagem, rastro da espada e vento redesenhados a cada quadro. **Isso é requisito mostrado, não benchmark público de dispositivos modestos**.

**Aplicação:** camadas cacheadas e profiling separado para geração vs render. Medir em browser e hardware alvo sem prometer '60 FPS em qualquer PC'.

## 10. Meta de desenho do @game2d é distinta

Nosso visual é **massinha física rabiscada, orgânica, 2D pintada à mão e minimalista**, com nosso herói masculino de cabeça grande, peito descoberto, lenço vermelho, caveira única frontal e duas adagas acorrentadas; ilha de arena ampla, grama central, areia, oceano, poucas palmeiras, pedras e um píer.

**Aplicação:** usar as técnicas de renderização do vídeo como base metodológica, mas criar nossa própria linguagem visual. Estilo e arte de Hades e Dunloc são apenas referências, não fontes para cópia.

## Evidências e incertezas

- [Vídeo #002, análise de frames](videos/Vi8wJKNYRp8.md).
- [Vídeo #001, investigação pendente](videos/mp5Z2z2FcBg.md).
- [Conversa na íntegra de Rafa e Claude](CONVERSA-na-integra-do-rafa-com-claude-pra-fazer-jogo-procedural/).
- [Protótipos aprovados de linha de base](../prototypes/).

O MP4 recebido para #002 **não possui áudio**. Não atribuir falas ao autor. As notas distinguem o que aparece na tela (evidência), o que um prompt pede e nossas hipóteses.


## ATUALIZAÇÃO PRIORITÁRIA — lições confirmadas pela transcrição (19/10/2026)

1. **Rafael diz explicitamente** que o jogo Dunloc exibido usa desenho por código e que ambiente estático é gerado no carregamento, enquanto partes móveis são desenhadas durante a execução (~00:35–02:18). A transcrição é declaração do criador, **não auditoria integral do código**. Corrige a lacuna das primeiras notas que estavam limitadas ao MP4 silencioso.
2. **O método veio de comparação e histórico acumulado**: havia testes de sprites e referências anteriores; o Claude comparou renderer 3D com vetorial Canvas e o vetor venceu 2×1 segundo o relato (~03:20–07:00).
3. **Somente uma cabeça frontal não define um corpo**: na demo, o prompt diz 'cavaleiro com armadura'; a IA decide proporções/equipamento adicionais e o usuário corrige. Nano Banana foi usado para gerar **guias de vista do rosto**, não imagens prontas em runtime (~08:34–10:15; ~16:30–17:10).
4. **Iteração por componente é indispensável**: Rafael concentra depois a IA apenas no rosto Sul, examina olho, boca, nariz, cabelo e feedback crítico. Mesmo o piloto final mostrado tinha problemas de caminhada e espada (~22:50–27:00).

**Conselho operacional:** não interpretar o piloto como uma entrega perfeita. Nosso primeiro marco é um **quadro procedural de alta qualidade artística**, verificado por screenshot real. Consulte [00-COMECE-AQUI.md](00-COMECE-AQUI.md) antes de usar as notas exploratórias acima.
