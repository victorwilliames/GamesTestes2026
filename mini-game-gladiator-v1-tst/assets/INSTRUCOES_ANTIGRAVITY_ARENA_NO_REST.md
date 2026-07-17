# INSTRUÇÕES PARA O ANTIGRAVITY  
## Projeto: Arena do No Rest for the Wicked

Este documento deve ser usado junto com o arquivo:

```txt
arena_no_rest_assets_pack_complete.zip
```

O objetivo é orientar o Antigravity a usar o pacote completo de assets para montar e desenvolver o jogo **Arena do No Rest for the Wicked**, um protótipo web 3D em **Three.js**, com visual medieval low-poly/stick fighter, câmera isométrica, HUD mobile e combate inspirado em **No Rest for the Wicked**.

---

# 1. Objetivo do jogo

Criar um jogo web 3D leve, mobile-first, inspirado em:

```txt
No Rest for the Wicked
+ arena medieval/coliseu
+ stick fighter low-poly
+ combate soulslike simplificado
+ HUD mobile
+ futuro coop online para 2 a 3 jogadores
```

O jogo NÃO deve ser tratado como RPG completo, mundo aberto ou MMO neste momento.

O primeiro objetivo é criar uma **arena jogável offline**, com:

- cenário igual à vibe dos prints de referência;
- câmera isométrica/inclinada;
- personagem jogável;
- vida e stamina;
- ataque leve;
- ataque pesado;
- dash/esquiva;
- hitbox simples;
- boneco de treino recebendo dano;
- HUD mobile funcional;
- VFX e SFX placeholders.

Multiplayer vem somente depois que o combate offline estiver funcionando bem.

---

# 2. Stack técnica obrigatória

Usar:

```txt
Client:
- Vite
- TypeScript
- Three.js
- HTML/CSS simples
- Sem React
- Sem Next.js
- Sem framework de UI

Server futuro:
- Node.js
- TypeScript
- Colyseus
```

Observação:

O Vite deve ser usado apenas como ferramenta de desenvolvimento/build. Ele não é engine do jogo.

```txt
Three.js = renderização 3D
Vite = servidor local/build do projeto
TypeScript = código mais organizado
Colyseus = multiplayer futuro
```

---

# 3. Uso do asset pack

Descompactar o arquivo:

```txt
arena_no_rest_assets_pack_complete.zip
```

Dentro dele existem as seguintes pastas principais:

```txt
3d/glb/environment/   -> cenário e props 3D
3d/glb/characters/    -> personagens stick fighter
3d/glb/weapons/       -> armas, escudos e itens 3D
2d/ui/                -> HUD, botões, joystick e ícones
2d/vfx/               -> efeitos visuais 2D
2d/textures/          -> texturas simples
audio/sfx/            -> efeitos sonoros placeholder
audio/music/          -> ambiência e crowd placeholder
data/                 -> configs JSON de gameplay/layout/render
docs/                 -> documentação auxiliar
reference/            -> prints de referência
```

Ler obrigatoriamente estes arquivos antes de implementar:

```txt
README.md
ASSET_MANIFEST.json
docs/ANTIGRAVITY_ASSET_PROMPT.md
docs/IMPORT_CHECKLIST.md
docs/ASSET_COVERAGE.md
```

---

# 4. Arquivos que devem ser carregados primeiro

Para montar a primeira cena visual, usar obrigatoriamente:

```txt
3d/glb/environment/full_arena_coliseum_blockout.glb
3d/glb/characters/player_stick_blue_sword.glb
3d/glb/environment/training_dummy_target.glb
2d/ui/joystick_base.png
2d/ui/joystick_knob.png
2d/ui/button_attack_sword.png
2d/ui/button_dash_blue.png
2d/ui/button_heal_green.png
2d/ui/button_potion_red.png
2d/vfx/slash_arc_gold.png
2d/vfx/slash_arc_gold_heavy.png
2d/vfx/hit_spark_gold.png
audio/sfx/slash_light.wav
audio/sfx/slash_heavy.wav
audio/sfx/hit_impact.wav
```

Depois, complementar com props e efeitos adicionais.

---

# 5. Visual desejado

O visual deve seguir os prints de referência enviados pelo usuário.

Referência visual:

```txt
- câmera isométrica/inclinada
- arena medieval tipo coliseu
- chão de areia clara
- paredes de pedra
- banners vermelhos
- braseiros/tochas
- golden hour
- sombras longas e dramáticas
- bonecos stick fighter
- HUD mobile com joystick e botões circulares
- combate com slash dourado e impacto visual forte
```

Importante:

Os prints são referência de composição, câmera, atmosfera, UI e estilo.  
Não usar os prints como textura de cenário.  
Recriar tudo usando GLBs, PNGs, geometrias e materiais do asset pack.

---

# 6. Regras de performance mobile

O jogo deve ser mobile-first.

Obrigatório configurar o renderer assim:

```ts
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
```

Regras:

```txt
- evitar pós-processamento nesta fase
- evitar texturas pesadas
- usar materiais simples
- usar poucos objetos com sombra
- sombra apenas na luz direcional principal, se necessário
- não usar dezenas de point lights
- preferir fake shadow/blob quando possível
- usar geometrias low-poly
- evitar partículas pesadas
- canvas deve ocupar 100% da tela
- sem scroll na página
- layout em modo paisagem/horizontal
```

---

# 7. Estrutura de pastas recomendada no client

Criar/organizar assim:

```txt
client/
  src/
    main.ts
    styles/
      main.css
    game/
      Game.ts
      SceneManager.ts
      AssetLoader.ts
      Arena.ts
      Lighting.ts
      CameraController.ts
      entities/
        Player.ts
        TrainingDummy.ts
        EnemyPreview.ts
      combat/
        Health.ts
        Stamina.ts
        CombatController.ts
        Hitbox.ts
        DamageNumber.ts
      input/
        InputController.ts
        KeyboardInput.ts
      mobile/
        MobileControls.ts
      ui/
        HUD.ts
        MobileHUD.ts
      vfx/
        VFXManager.ts
        SlashEffect.ts
        HitSparkEffect.ts
      audio/
        AudioManager.ts
```

Criar o server, mas não implementar multiplayer real ainda:

```txt
server/
  src/
    index.ts
```

---

# 8. Fases do projeto

## Fase 0 — Setup do projeto

Criar:

```txt
- monorepo
- client com Vite + TypeScript + Three.js
- server com Node.js + TypeScript + Colyseus preparado
- scripts npm para rodar client e server
- README com comandos
- docs/status.md
- docs/roadmap.md
```

Critério de aceite:

```txt
- npm install funciona
- npm run dev:client abre o jogo
- npm run dev:server inicia o servidor sem erro
- navegador abre sem erro no console
```

---

## Fase 1 — Arena offline visual

Implementar:

```txt
- carregar full_arena_coliseum_blockout.glb
- configurar câmera isométrica
- configurar iluminação golden hour
- adicionar fog leve se fizer sentido
- carregar props principais
- carregar dummy no centro
- carregar player estático
- adicionar HUD mobile visual por cima do canvas
```

Nesta fase, o player ainda não precisa se mover.

Critério de aceite:

```txt
- cena parece visualmente com os prints
- câmera mostra a arena de cima/inclinada
- HUD aparece nas posições corretas
- canvas ocupa a tela inteira
- roda no desktop
- abre no celular na mesma rede
```

---

## Fase 2 — Player offline + movimento

Implementar:

```txt
- player jogável
- movimento WASD no desktop
- joystick virtual no mobile
- câmera seguindo o player
- rotação do player na direção do movimento
- limite de movimento dentro da arena
- animação simples fake se não houver animação real
```

Critério de aceite:

```txt
- player anda no teclado
- player anda no celular com joystick
- câmera segue suavemente
- player não sai da arena
```

---

## Fase 3 — Stamina, dash e vida

Implementar:

```txt
- vida máxima
- stamina máxima
- stamina regenera com o tempo
- dash consome stamina
- dash tem cooldown curto
- HUD reflete vida e stamina
- botão de dash mobile funcional
```

Usar defaults de:

```txt
data/game_balance_defaults.json
data/ui_layout_mobile.json
```

Critério de aceite:

```txt
- stamina diminui ao usar dash
- stamina regenera
- barra de stamina atualiza
- dash funciona no desktop e mobile
```

---

## Fase 4 — Combate offline base

Implementar:

```txt
- ataque leve
- ataque pesado
- cooldowns
- hitbox simples na frente do player
- dummy recebe dano
- feedback visual com slash e hit spark
- SFX de slash e impacto
- knockback simples no dummy, se possível
```

Atalhos sugeridos:

```txt
Desktop:
J = ataque leve
K = ataque pesado
Espaço = dash

Mobile:
botão espada = ataque leve
botão dash = dash
botão poção/heal = placeholder por enquanto
```

Critério de aceite:

```txt
- ataque leve aparece visualmente
- ataque pesado aparece visualmente diferente
- dummy perde vida
- hit spark aparece ao acertar
- som toca ao atacar/acertar
- player não consegue spammar ataque sem cooldown
```

---

## Fase 5 — HUD mobile completo

Implementar:

```txt
- barra de vida
- barra de stamina
- nível visual no canto esquerdo
- moedas/gemas visual no canto direito
- botão menu
- joystick esquerdo
- botões direito de ataque/dash/heal/potion/block
```

Não precisa implementar moedas/gemas reais agora; podem ser visuais/placeholders.

Critério de aceite:

```txt
- HUD igual vibe dos prints
- botões funcionam no mobile
- HUD não bloqueia visão principal
- layout se adapta a tamanhos de tela
```

---

## Fase 6 — Inimigos offline básicos

Implementar:

```txt
- inimigo sword
- inimigo spear
- inimigo shield
- barras de vida acima dos inimigos
- IA simples: aproximar do player e atacar
- dano no player
- morte/respawn simples
```

Assets:

```txt
3d/glb/characters/enemy_stick_red_sword.glb
3d/glb/characters/enemy_stick_red_spear.glb
3d/glb/characters/enemy_stick_red_shield.glb
3d/glb/characters/enemy_stick_black_elite.glb
```

Critério de aceite:

```txt
- inimigos perseguem o player
- inimigos causam dano
- player consegue matar inimigos
- barras de vida aparecem
```

---

## Fase 7 — Multiplayer básico com Colyseus

Só iniciar esta fase depois que o combate offline estiver aprovado.

Implementar:

```txt
- sala Colyseus
- limite inicial: 2 a 3 jogadores
- criar sala
- entrar por código
- sincronizar posição e rotação
- renderizar outros players
- ainda sem combate autoritativo completo
```

Critério de aceite:

```txt
- dois navegadores entram na mesma sala
- cada player vê o outro
- movimento sincroniza
- funciona entre celulares/computadores na internet se servidor estiver hospedado
```

---

## Fase 8 — Combate online autoritativo

Implementar:

```txt
- cliente envia input
- servidor valida ataque
- servidor calcula dano
- servidor sincroniza vida
- servidor sincroniza morte/respawn
- servidor sincroniza placar
```

Regra:

O cliente não deve decidir dano sozinho.

Errado:

```txt
cliente diz: causei 999 de dano
```

Certo:

```txt
cliente diz: apertei ataque leve
servidor valida se acertou
servidor aplica dano
```

---

# 9. Gameplay desejado

O combate deve parecer soulslike simplificado.

Características:

```txt
- ataque com peso
- cooldown/recuperação
- stamina limita spam
- dash precisa ser usado com timing
- ataque pesado causa mais dano, mas deixa vulnerável
- impacto visual forte
- slash dourado
- hit spark
- som de impacto
```

Não transformar em hack-and-slash rápido demais.

O jogo deve ter ritmo de:

```txt
observar -> esquivar -> atacar -> recuar -> recuperar stamina -> atacar de novo
```

---

# 10. Regras importantes

Não implementar agora:

```txt
- mundo aberto
- história
- quests
- inventário complexo
- loot profundo
- loja
- ranking global
- login
- banco de dados
- MMO
- 10 jogadores
- chat
- guilda
```

Foco absoluto:

```txt
1. arena bonita
2. mobile funcionando
3. player gostoso de controlar
4. combate com peso
5. depois multiplayer
```

---

# 11. Testes obrigatórios

Depois de cada fase, testar:

```txt
- npm install
- npm run dev:client
- abrir http://localhost:5173
- verificar console sem erro
- testar resize da janela
- testar no celular pela mesma rede
- testar modo paisagem
- testar FPS/performance visual
```

No celular, garantir:

```txt
- tela cheia
- sem scroll
- joystick funcionando
- botões clicáveis
- HUD não cortado
- canvas responsivo
```

---

# 12. Atualização obrigatória de documentação

Ao final de cada fase, atualizar:

```txt
docs/status.md
```

Com:

```txt
- fase concluída
- arquivos criados
- arquivos alterados
- como rodar
- como testar
- problemas conhecidos
- próxima fase recomendada
```

Também manter:

```txt
docs/roadmap.md
```

Com as fases do projeto.

---

# 13. Primeira tarefa que você deve executar agora

Execute somente:

```txt
Fase 0 — Setup do projeto
Fase 1 — Arena offline visual
```

Não implementar ainda:

```txt
- movimento
- combate
- multiplayer
- IA
```

Ao terminar, entregue:

```txt
1. resumo do que foi feito
2. lista de arquivos criados/alterados
3. comandos para rodar
4. como testar no navegador
5. como testar no celular
6. próximos passos sugeridos
```

---

# 14. Prompt curto de execução

Use este comando mental como norte:

```txt
Monte primeiro uma cena visual jogável em potencial, baseada no asset pack completo, com arena isométrica medieval low-poly, HUD mobile e estrutura limpa para depois adicionar movimento, combate offline e multiplayer.
```

Não tente criar o jogo completo de uma vez.
