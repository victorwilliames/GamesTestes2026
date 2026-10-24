# HERO-02 — Desenho Procedural V1 (Antigravity)

Experimento de reconstrução artística e técnica do **HERO-02** desenhado **100% por código em Canvas 2D**, com fidelidade visual às referências canônicas (`assets/references/ref-2d-hero/`) e arquitetura modular articulável pelo **RIG-01**.

---

## 🚀 Como Abrir no Windows (Sem Servidor e Sem Instalar Nada)

1. Vá até a pasta:
   `D:\.GITHUB\games\game-2d\prototypes\antigravity\desenho-v1-antigravity\`
2. **Dê um duplo-clique em `index.html`** (abre no Chrome, Edge ou qualquer navegador moderno).
3. O arquivo funciona **100% offline via protocolo `file:///`** e em preview da IDE. O script foi empacotado inline sem `type="module"`, eliminando bloqueios de CORS.
4. Para rodar via servidor local (opcional):
   `node capture.mjs` (sobe servidor HTTP local temporário e tira os 10 screenshots de auditoria via Edge Headless CDP).

---

## 🏛️ Arquitetura do Renderer Procedural

O código fonte é modular e fica organizado dentro de `src/`:

```text
prototypes/antigravity/desenho-v1-antigravity/
├── index.html                   # Interface gráfica completa com bundle inline (duplo-clique)
├── bundle.js                    # Bundle compilado de src/ para uso geral
├── build-bundle.mjs             # Script de empacotamento que atualiza bundle.js e index.html
├── capture.mjs                  # Script automatizado de auditoria visual e captura de screenshots
├── FIDELITY_REPORT.md           # Relatório de auditoria dos 3 critérios de aceite
├── VISUAL_SPEC.md               # Especificação visual, paleta cromática e regras estéticas
├── PIVOTS_SPEC.md               # Especificação matemática de pivôs, ossos e camadas Z
├── screenshots/                 # 10 capturas de tela reais em 1280×720 (Edge Headless)
└── src/
    ├── HeroRenderer.js          # Orquestrador Z-order (11 camadas) e renderizador de pivôs
    ├── materials/
    │   └── MaterialPainter.js   # Texturas determinísticas (giz pastel, couro, tecido, magma, aço)
    ├── painters/
    │   ├── HeadPainter.js       # Cabeça completa (pele, orelhas, proporções chibi)
    │   ├── FacePainter.js       # Olhos vermelhos brilhantes, sobrancelhas e cicatrizes
    │   ├── HairPainter.js       # Cabelo castanho escuro volumoso, mechas pontiagudas e iluminação
    │   ├── TorsoPainter.js      # Peitoral estilizado, abdômen sombreado, pescoço e clavícula
    │   ├── ArmPainter.js        # Braços, braçadeiras de couro e HandPainter com grip em 2 camadas
    │   ├── LegPainter.js        # Pernas e BootPainter (botas pesadas com dobras e solado)
    │   ├── ClothPainter.js      # Saiote rasgado e AccessoryPainter (cinto escuro, fivela de caveira)
    │   ├── ScarfPainter.js      # Cachecol enrolado com dobras e CapePainter (capa vermelha rasgada)
    │   └── WeaponPainter.js     # Lâminas do Caos (asa de aço, núcleo vulcânico, fendas de fogo e correntes)
    ├── poses/
    │   └── PosePresets.js       # Poses canônicas estáticas para as 6 peças/vistas oficiais
    └── rig/
        └── RigAdapter.js        # Adaptador matemático entre esqueleto RIG-01 e HeroRenderer
```

---

## 🎮 Modos da Interface (`index.html`)

A interface possui 4 modos de visualização acessíveis pelos botões do topo:

1. **1. Comparação**:
   Exibe lado a lado a imagem oficial de referência (`.png`) e o desenho procedural (`Canvas 2D`) no espaço canônico 1254 × 1254.
2. **2. Procedural Isolado**:
   Renderiza apenas o código procedural com fundo configurável (Neutro Claro, Grid Alfa ou Escuro). Suporta **Multiescala Simultânea** (Grande 500px, Intermediária 330px e Gameplay 185px).
3. **3. Articulações**:
   Sobrepõe os marcadores visuais coloridos de todos os pivôs anatômicos (cabeça, ombros, cotovelos, pulsos, punhos, quadril, joelhos, tornozelos e empunhaduras de armas).
4. **4. Prova RIG-01 (5 Poses)**:
   Exibe as 5 poses dinâmicas processadas pelo mesmo renderer artístico:
   - *1. RIG-01: Pose Idle (Sul 0°)*
   - *2. RIG-01: Pose de Corrida (Mid-Stride)*
   - *3. RIG-01: Pose de Ataque (Slash)*
   - *4. Orientação Sudeste (SE 3/4 sem espelhamento mecânico)*
   - *5. Orientação Sudoeste (SW 3/4 sem espelhamento mecânico)*
   - Inclui botão **Animar RIG** para testar a respiração e oscilação contínua em tempo real.

---

## 🗡️ Lâminas do Caos & Pegada da Mão (Grip)

- **Lâminas**: As lâminas reproduzem fielmente `hero-part-weapons.png`, com gancho inferior curvado até `(180, 748)`, asas superiores dentadas em aço prateado forjado, núcleo vulcânico com fissuras orgânicas de lava incandescente (sem manchas circulares) e elos de corrente de ferro escuro entrelaçados.
- **Pegada da mão (Grip em 2 camadas)**: No [HeroRenderer.js](src/HeroRenderer.js) e [ArmPainter.js](src/painters/ArmPainter.js), a empunhadura é estruturada em sanduíche anatômico:
  1. *Camada 7.5*: Palma e pulso são desenhados atrás do cabo da lâmina.
  2. *Camada 8*: A lâmina com cabo de couro e guarda de bronze é renderizada.
  3. *Camada 9*: Os 4 dedos curvados e o polegar fechado cobrem firmemente o cabo.

---

## 🧪 Como Recompilar ou Atualizar o Bundle

Ao editar qualquer arquivo em `src/`, execute:
```bash
node build-bundle.mjs
```
Isso atualiza automaticamente o `bundle.js` e injeta a versão compilada no `index.html`.
