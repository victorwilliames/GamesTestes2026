# Arquitetura Técnica, Pipeline e Critérios de Aceite — @game2d

## 1. Runtime e Arquitetura Definida

A arquitetura oficial e mandatória para a implementação do herói e da arena de testes é **HTML5 Canvas 2D procedural autoral**:
- **Zero WebGL** e **zero engines 3D externas**.
- **Sem Blender** e **sem pacotes de assets pré-renderizados**.
- O personagem, o cenário da ilha e os efeitos são renderizados e animados inteiramente por código.

---

## 2. Estrutura Modular de Renderização Procedural

Conforme definido em `docs/prompts a executar/contexto-sobre-a-arma-do-hero.md`, o sistema deve separar responsabilidades em módulos desacoplados:

```text
WeaponPainter
├── BladeGeometry         # Curvatura agressiva, ponta afiada, recortes dentados internos
├── BladeMaterial         # Metal escuro queimado, ranhuras, rascunhos, camadas de sombra
├── EdgePainter           # Fio cortante e arestas afiadas
├── FireAndBloodPainter   # Incandescência (amarelo/laranja/vermelho) e manchas de sangue
├── GuardPainter          # Guarda metálica
├── HandlePainter         # Empunhadura com revestimento de tiras de couro
├── PommelPainter         # Pomo com argola de ancoragem da corrente
└── WeaponAttachments     # Pontos de conexão com a mão e o rig

HandPainter
├── PalmPainter           # Volume da palma e dorso
├── FingerPainter         # Dedos dobrados envolvendo firmemente o cabo
├── ThumbPainter          # Polegar fechando o grip
└── GripOcclusion         # Oclusão e sombras realistas entre mão, guarda e cabo

ChainPainter
├── LinkGeometry          # Elos metálicos individuais, grossos e volumosos
├── ChainMaterial         # Ferro escuro envelhecido e queimado
├── ChainPath             # Trajetória com tensão/folga física calculada
├── ForearmWraps          # Múltiplas voltas ao redor dos pulsos e antebraços
└── ChainAttachments     # Conexão fixa pomo <-> pulso/antebraço
```

---

## 3. Sistema de Coordenadas e Pontos de Ancoragem

A fixação física entre mãos, adagas e braços deve utilizar pontos de ancoragem determinísticos compartilhados:

```javascript
{
  weapon: {
    grip: { x: 0, y: 0 },         // Ponto central de fixação da mão
    guard: { x: 0, y: 0 },        // Base da lâmina e guarda
    bladeRoot: { x: 0, y: 0 },    // Início do corpo cortante
    bladeTip: { x: 0, y: 0 },     // Ponta afiada
    chainAnchor: { x: 0, y: 0 }   // Ponto de fixação no pomo
  },
  arm: {
    wrist: { x: 0, y: 0 },        // Conexão pulso <-> mão
    forearmStart: { x: 0, y: 0 }, // Cotovelo
    forearmEnd: { x: 0, y: 0 },   // Início do pulso
    chainWrapAnchors: []          // Pontos de passagem da corrente ao redor do membro
  }
}
```

---

## 4. Checklist Técnico Obrigatório de Aceite

Qualquer entrega de código e arte procedural do herói deve atender aos seguintes critérios:

### A. Identidade e Geometria das Armas
- [ ] A arma é claramente uma grande adaga/lâmina assassina e **NÃO UM MACHADO**.
- [ ] A silhueta lembra diretamente as Blades of Chaos de Kratos (God of War).
- [ ] Ponta afiada e bem definida; fios externos e recortes dentados internos presentes.
- [ ] Conexão visual coerente entre lâmina, guarda, cabo e pomo.
- [ ] Geometria perfeitamente legível na escala de gameplay.

### B. Materiais e Pintura
- [ ] Metal escuro, grafite e preto queimado com ranhuras e desgaste.
- [ ] Manchas e riscos visíveis de sangue.
- [ ] Fogo e incandescência vibrantes em amarelo, laranja e vermelho.
- [ ] O brilho não encobre a silhueta da lâmina.
- [ ] Contornos escuros artesanais com textura determinística (sem flickering entre quadros).

### C. Mãos e Empunhaduras (Grip Real)
- [ ] As mãos realmente seguram a empunhadura (dedos dobrados e polegar envolvendo o cabo).
- [ ] Vincos anatômicos nas juntas dos dedos e sombras de contato.
- [ ] A arma não flutua e o cabo não atravessa a palma da mão.
- [ ] Mão e arma compartilham ponto de ancoragem fixo em coordenadas locais.

### D. Correntes Infernais
- [ ] Cada arma possui corrente conectada ao pomo do cabo e aos braços.
- [ ] Elos metálicos individuais, grandes e volumosos de ferro escuro/queimado (não cordões).
- [ ] Voltas visíveis ao redor dos pulsos e antebraços com oclusão correta (passando pela frente e por trás).
- [ ] Folga e tensão coerentes com a pose.

### E. Rig e Animação Procedural
- [ ] O mesmo renderer procedural desenha as armas paradas e em movimento.
- [ ] Preservação de detalhes e texturas durante rotações e ataques.
- [ ] Pés firmes no chão durante caminhada/corrida (zero foot slip).
- [ ] Desempenho aferido atingindo o piso inegociável de **200 FPS** em 1280 × 720 sem cap de vsync.
- [ ] Cache offscreen aplicado a elementos estáticos do cenário para manter a taxa de quadros.
