# HERO-02 — Pivôs estáticos planejados

Pivôs são **pontos declarativos no sistema de desenho**, não um rig. Eixo `x` horizontal com centro do herói em `0`, `y` positivo para baixo. Coordenadas abaixo são unidades locais de arte; não pixels da imagem fonte.

| Ponto | (x,y) | Função futura | Cobertura/oclusão |
|---|---|---|---|
| Pescoço | `(0,531)` | pescoço/cabeça | cachecol sobre base da cabeça e torso |
| Ombros | `(-147,600)` / `(147,600)` | braços | massa de deltoide sob cachecol |
| Cotovelos | `(-222,662)` / `(222,662)` | braço/antebraço | faixa de couro / forma carnuda |
| Punhos | `(-279,752)` / `(279,752)` | punhos/armas | tira escura / mão por cima do cabo |
| Quadril central | `(0,751)` | pernas e saia | cinto e tecido sobre origem das coxas |
| Quadris | `(-89,754)` / `(89,754)` | fêmures | tecido solto e cinto |
| Joelhos | `(-103,862)` / `(103,862)` | coxas/canelas | faixas e grevas recobrindo juntas |
| Tornozelos | `(-104,938)` / `(104,938)` | botas | cano alto e tiras de couro |
| Empunhaduras | `(-283,752)` / `(283,752)` | armas/correntes | munhequeira cobrindo mão e cabo |
| Cachecol | `(25,530)` | tecido preso ao pescoço | dobras sobre peito e costas |
| Capa | `(121,542)` | capa presa ao cachecol | se mantém atrás de tronco/braços |

Implementação atual em `src/body.js:ANCHORS`, consumo em `src/hero.js`. O renderer separa o painter da pose estática; apenas os braços e armas respondem aos dois presets de **diagnóstico** (`neutral` e `tpose`). Cabeça, peito, saia e pernas não possuem FK/IK. Os pontos de cotovelo/punho estimados para exibir marcadores não são ainda um sistema de cinemática completo.

### Contrato proposto para o rig, ainda NÃO implementado

Uma pose futura poderá expor transformações locais `{position, rotation, scale}` por parte. O Canvas aplica transformações; cada painter recebe seu contexto com `translate/rotate` e desenha sua geometria inalterada no sistema local. Caches são mantidos **por peça**, nunca um sprite achatado do herói inteiro. Anéis e correntes eventualmente precisariam de um painter entre dois pontos de fixação com interpolação própria; este teste não anima corrente.

### Riscos arquiteturais reais

- Corpo/saia/pernas ainda possuem parte da geometria em coordenadas absolutas canônicas; modularidade existe por região, mas conversão total para locais de cada articulação é uma **pendência**, não uma qualidade já comprovada.
- Ombro e antebraço compartilham forma contínua em `paintArm` e precisariam ser divididos por cotovelo antes do IK. A rotação do preset T atual é no **ombro inteiro**.
- A rotação atual de armas e correntes acompanha a posição da mão em T, mas não preserva orientação da lâmina por IK pois IK não existe.
- Caches estáticos não provam automaticamente ausência de aberturas em rotações extremas.

## Revisão V1.2 / compartilhamento de transformações (19/10/2026)

O arquivo `src/rig-adapter.js` declara `ARM_SHOULDER=[143,594]`, `ARM_FIST=[145,175]` **em coordenadas locais após `scale(side,1)`**. Os dois componentes `paintArm` e `paintWeapon` aplicam os mesmos `translate(side*143,594)`, `scale(side,1)` e `rotate(armAngle(pose,side))`. Assim, a arma mantém contato com a palma nos presets estáticos `neutral`, `tpose`, `run` e `attack`.

`adaptRig01Snapshot(data)` define uma interface exploratória para pontos `shoulderL/R`, `wristL/R` do RIG-01. Este contrato **não está conectado ao runtime do RIG-01** e os dados fornecidos não foram verificados com execução real. Não descrever os presets como integração de RIG-01.

**Débito arquitetural de alta prioridade:** braços continuam como peças inteiras que giram no ombro; joelhos/tornozelos ainda não fornecem deformação artística verdadeira por osso. O Sudeste usa projeção transformada local simples, **não um retrato autoral 3/4**. Ambas as limitações impedem aprovação de fidelidade em articulação.
