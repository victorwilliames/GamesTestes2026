# Agente crítico artístico — rubrica e método

## Por que existe

O piloto mostrado por Rafael não é validado apenas por 'executou sem erro'. Há comparação de abordagens, screenshots, críticos, correção de rosto/oclusão e refinamento repetido. **Nosso P0.1 falhou justamente por aprovar o código sem aprovar a imagem.**

## Papéis separados (podem ser a mesma IA em passos independentes)
- **Construtor:** implementa formas, pintura e composição no Canvas.
- **Crítico:** recebe screenshots reais e referências autorizadas, anota problemas verificáveis com prioridade.
- **Validador técnico:** verifica console, Canvas 2D, desenho por código, cache/render e reprodutibilidade.
- **Direção de produto (usuário):** decide aceite artístico final.

## Rubrica 0–4 por critério

| Critério | 0 | 2 | 4 |
|---|---|---|---|
| Silhueta/proporção do herói | Não reconhecível | Parcialmente chibi | Reconhecível como referência mesmo pequeno |
| Cabeça, olhos, cabelo, expressão | Esferas genéricas | Algumas características | Formas autorais claras, raiva e personalidade |
| Corpo/roupa/caveira | Errado/genérico | Parcial | Musculoso sem camisa, roupa simples, caveira só frontal |
| Adagas/correntes | Sem conexão ou invertidas | Legíveis com falhas | Geometria e conexões claras e consistentes |
| Tinta rabiscada + massinha | Vetor liso/plástico | Alguns detalhes | Contorno imperfeito coerente, acabamento fosco artesanal |
| Câmera e leitura em gameplay | Frontal sobre top-down | Parcialmente integrada | Personagem/terreno no mesmo 3/4, escala correta |
| Ilha minimalista | Disco verde ou poluição | Parcial | Ilha maior, espaço limpo, materiais e borda orgânica |

**Esses números são rubrica de trabalho proposta pelo @game2d, não dados do Rafael.**

## Regras de aceite da ART-01

- Não aprovar caso **silhueta**, **estilo/material** ou **câmera** estejam abaixo de 3/4, mesmo que a média seja alta.
- Problema de perspectiva/arma/identidade marcante é bloqueador independentemente da nota total.
- A IA crítica **recomenda** aprovado/reprovado, mas só o usuário aprova.
- Comparar na **escala real do jogo** e também em zoom 2x para textura; não esconder defeitos no enquadramento.

## Formato obrigatório de crítica

```md
### ART-01 — Revisão [1/3] (commit XXXXXXX)
Evidência: screenshot real <caminho> (1280x720, Canvas 2D, render do código)

| Área | Nota 0–4 | Defeito específico | Severidade | Correção mínima |
|---|---:|---|---|---|
| ... | ... | ... | bloqueador/alta/média | ... |

O que funcionou e deve ser PRESERVADO:
...
O que não é comprovado:
...
Veredito: REPROVADO / CANDIDATO A APROVAÇÃO HUMANA
Próxima ação: ...
```

O crítico **não deve**: dizer 'incrível' sem fundamentos; esconder que a referência foi usada como background; confundir testes de FPS com qualidade; prescrever redesign total quando um ajuste localizado resolve.

## Testes técnicos de apoio

- HTML/JS executa no Chrome sem erros relevantes.
- Frame produzido por operações Canvas 2D reais; arte não está sendo apresentada por `drawImage` de PNG pré-renderizado.
- Elementos/ruídos estáticos cacheados; textura determinística e sem shimmer.
- Captura tem dimensões declaradas e contexto visual correto.
- Relatório distingue **teste efetivamente executado** de teste alegado.
- Se alguma dependência falhar, documentar em vez de fingir que passou.

## Evidências de inspiração

- Tech Bite #002 ~06:10–06:45: avaliação de duas estratégias por múltiplos juízes.
- ~09:35–10:00: crítica de semelhança de rostos.
- ~17:12–17:22: prompt manda crítico abrir browser e corrigir.
- ~21:37–21:45: testes com browser e crítico.
- ~22:55–24:20: reparos específicos de rosto, olhar/cabelo.

Referência primária: [transcrição](videos/transcricao_Vi8wJKNYRp8.txt) e [análise detalhada](videos/Vi8wJKNYRp8.md).
