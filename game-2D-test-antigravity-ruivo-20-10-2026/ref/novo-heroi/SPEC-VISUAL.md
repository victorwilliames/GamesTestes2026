# Especificação Visual do Novo Herói (Red-Haired Knight)

Este documento define todas as características visuais, proporções anatômicas, paleta de cores e guia de animação baseados nas novas imagens de referência fornecidas pelo usuário em 20/10/2026.

---

## 🖼️ Arquivos de Referência
- `ref/novo-heroi/cabeca-ref.png`: Close-up de alta resolução (1024x992) com a expressão frontal, mechas do cabelo, olhos e paleta da cabeça.
- `ref/novo-heroi/prancha-turnaround-poses.png`: Folha completa de modelo (1024x384) contendo:
  - **Turnaround Isométrico 360° em 8 ângulos**: 0° (frente-cam), 45°, 90° (direita), 135°, 180° (costas), 225°, 270° (esquerda), 315°.
  - **Poses de Combate e Movimento**:
    1. Combo 1 (Corte): Antecipação e Golpe.
    2. Combo 2 (Revés): Antecipação e Golpe.
    3. Combo 3 (Salto/Slam bimanual): Salto com espada levantada e Impacto no solo.
    4. Corrida (Run Cycle): Pose dinâmica de locomoção com torso inclinado.

---

## 🎨 Paleta de Cores Oficial

### 1. Cabelo Escarlate (Red Hair)
- **Mecha de Luz / Destaque**: `#F83040` / `#F83840`
- **Tom Principal**: `#D81828` / `#E01828`
- **Sombra Profunda**: `#A80818` / `#B00818`
- **Contorno**: `#380000` / `#400000` (bordô escuro profundo)

### 2. Pele (Skin Tones)
- **Base**: `#F8B080` / `#F8B484` (pele anime clara aquecida)
- **Sombra Suave**: `#E88858` / `#F09060` (sombra em cel-shading)
- **Bochechas**: leve blush sutil `#F89878`

### 3. Olhos e Rosto
- **Olhos**: Formato oval vertical estilizado `#201008` (marrom café profundo)
- **Sobrancelhas**: Espessas e expressivas em tom `#D81828` (acompanha o cabelo)
- **Nariz**: Ponto sutil / triângulo discreto `#E88858`
- **Boca**: Traço horizontal neutro `#201008`

### 4. Armadura Prateada (Knight Armor)
- **Brilho Metálico**: `#D0C8C0` / `#E0D8D0`
- **Meio-tom (Aço Polido)**: `#B8A8A0` / `#B0A8A0`
- **Sombra da Chapa**: `#908888` / `#888080`
- **Frestas e Rebites**: `#504848`

### 5. Tecidos e Adornos
- **Túnica / Aba de Combate (Cintura e Costas)**:
  - Vermelho vivo: `#E02030`
  - Sombra do tecido: `#A81020`
- **Laço no Ombro Esquerdo (Assimetria Charmosa)**:
  - Laranja tangerina: `#F08020` / `#E07018`
- **Calça / Malha Interna**:
  - Marrom escuro couro / linho: `#603028` / `#482820`
- **Cinto com Fivela**:
  - Couro `#482820`, fivela dourada `#C09840`

### 6. Espada de Cavaleiro
- **Lâmina**: Aço prateado de gume duplo `#D0C8C0` com fio claro `#F0E8E0` e corte central
- **Guarda Cruzada**: Latão / ouro antigo `#C09840`
- **Punho / Cabo**: Couro marrom `#482820`
- **Pomo**: Esférico em latão `#C09840`

---

## 📐 Proporções Anatômicas (Estilo Chibi Action RPG 2.5D)
- **Altura Total**: ~3.2 cabeças.
- **Divisão Vertical**:
  - Cabeça + Cabelo: ~38% da altura total (cabeça volumosa, expressiva, cabelo com 4 mechas frontais e volume superior).
  - Torso + Cintura: ~24% da altura total (peitoral metálico compacto, cinto, ombreiras arredondadas).
  - Pernas + Botas: ~38% da altura total (joelheiras convexas, caneleiras articuladas).
- **Câmera**: Projeção isométrica 3/4 clássica (yaw 45°, pitch 34°).
