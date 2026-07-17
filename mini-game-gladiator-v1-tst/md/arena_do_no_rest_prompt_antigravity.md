# PROMPT MASTER PARA ANTIGRAVITY — Projeto “Arena do No Rest for the Wicked”

> **Nome interno do projeto:** Arena do No Rest for the Wicked  
> **Observação importante:** esse nome é apenas um codinome interno de desenvolvimento. Não usar nomes, marcas, assets, logos ou personagens protegidos de jogos existentes no produto final. O objetivo é criar um jogo original inspirado no tipo de câmera, sensação de combate e estrutura de arena vistos nas referências.

---

## 1. Papel do agente

Atue como um **engenheiro sênior de jogos web**, **gameplay programmer**, **network programmer** e **technical game designer**.

Você deve criar um projeto de jogo web/mobile em etapas, com código simples, organizado e compreensível para uma pessoa iniciante que trabalha com vibe code.

O projeto não deve ser construído como um RPG gigante. O objetivo inicial é criar um **MVP jogável** de uma arena 3D isométrica com combate soulslike simplificado, visual ultra low-poly/stick fighter e multiplayer coop para 2 a 3 jogadores.

---

## 2. Objetivo do jogo

Criar um jogo chamado internamente **“Arena do No Rest for the Wicked”**.

A ideia é:

- arena pequena de combate medieval;
- câmera isométrica/inclinada parecida com action RPG isométrico;
- combate com sensação soulslike: ataque com peso, esquiva, stamina, timing, risco e punição;
- visual muito leve, low-poly/stick fighter, com bonecos simples;
- gameplay focado em porrada, impacto e sobrevivência;
- rodar em navegador desktop e celular;
- coop online para 2 ou 3 pessoas na mesma sala;
- fase inicial em arena/coliseu, sem mundo aberto, sem inventário complexo, sem quests e sem MMO.

O jogo deve parecer uma mistura de:

- arena isométrica de action RPG;
- combate pesado de soulslike;
- bonecos simples/stick fighter;
- coliseu medieval com golden hour;
- UI mobile de action RPG.

---

## 3. Referências visuais fornecidas

Use as imagens anexadas pelo usuário como referência visual principal:

- `print1-gamee.png`
- `print2-game.png`

Se essas imagens estiverem disponíveis no workspace, coloque-as em uma pasta:

```txt
reference/
  print1-gamee.png
  print2-game.png
```

Elas mostram a direção desejada:

- câmera isométrica alta;
- arena medieval circular/coliseu;
- chão de areia clara;
- paredes antigas de pedra;
- arquibancadas ou estrutura circular em volta;
- clima golden hour, quente, dourado e épico;
- bonecos stick fighter com espadas, escudos e lanças;
- combate com slash/efeito de espada;
- barras de vida acima dos inimigos;
- UI mobile com joystick no canto inferior esquerdo;
- botões de ataque/habilidade no canto inferior direito;
- barras de vida e stamina no canto superior esquerdo;
- moedas/gemas/menu no canto superior direito;
- atmosfera de arena de luta antiga.

Não copie assets protegidos. Crie a versão inicial com formas primitivas, materiais simples e geometrias low-poly.

---

## 4. Stack técnica obrigatória

Use esta stack:

```txt
Client:
- Vite
- TypeScript
- Three.js
- HTML/CSS simples
- Sem React nesta primeira versão

Server:
- Node.js
- TypeScript
- Colyseus

Mobile:
- PWA primeiro
- Capacitor apenas em fase futura, não agora

Build/Qualidade:
- ESLint se for simples configurar
- Prettier se for simples configurar
- README com comandos claros
```

Não usar Unity, Unreal, Godot ou Three.js com React nesta primeira versão.

---

## 5. Filosofia do projeto

Prioridade máxima:

1. **Jogabilidade primeiro**
2. **Combate com peso**
3. **Performance no celular**
4. **Código simples e modular**
5. **Multiplayer estável para 2 a 3 pessoas**
6. **Visual bonito, mas extremamente leve**

Não criar sistemas grandes cedo demais.

Evitar nesta primeira versão:

- mundo aberto;
- RPG completo;
- inventário complexo;
- crafting;
- login;
- ranking global;
- loja;
- skins;
- NPCs;
- cutscenes;
- banco de dados;
- chat;
- MMO;
- 10 jogadores;
- física complexa demais;
- shaders pesados;
- assets realistas;
- texturas pesadas.

---

## 6. Direção de câmera

A câmera deve ser:

```txt
Tipo: isométrica / top-down inclinada
Controle: fixa, sem rotação manual do jogador
Comportamento: segue o jogador local ou o centro médio do grupo
Campo de visão: suficiente para ver inimigos e arena
Mobile: não exigir controle manual de câmera
```

A câmera deve lembrar jogos isométricos de ação: o jogador vê o personagem, inimigos, arena e golpes com clareza.

Não usar câmera terceira pessoa atrás do personagem nesta versão. Isso deixaria o projeto mais difícil no mobile e no multiplayer.

---

## 7. Direção visual

Visual desejado:

```txt
Estilo: ultra low-poly / stick fighter premium
Ambiente: coliseu medieval circular
Iluminação: golden hour
Clima: quente, épico, medieval e leve
Cores: areia clara, pedra cinza/bege, banners vermelhos, luz dourada
Personagens: bonecos palito/low-poly com cabeça esférica, membros finos e arma visível
Efeitos: slash de espada com arco luminoso, partículas simples, faíscas leves
Sangue: manchas estilizadas no chão, sem gore realista
```

A arena deve ser simples, mas precisa comunicar imediatamente:

> “Esse é um coliseu antigo preparado para combate.”

Elementos do mapa:

- chão circular de areia clara;
- paredes de pedra ao redor;
- arquibancada simplificada/crowd low-poly;
- banners medievais;
- tochas/braseiros;
- barris, armas encostadas, escudos, lanças;
- boneco de treino no centro ou em área visível;
- manchas de sangue estilizadas espalhadas;
- sombras longas de golden hour;
- poucos elementos para manter performance.

---

## 8. Gameplay base

O jogo deve ser um **arena soulslike brawler**.

### Personagem do jogador

Representação inicial:

- cabeça esférica;
- corpo/membros simples;
- espada grande simples;
- capa opcional simples;
- cor diferente por jogador;
- sombra simples no chão.

Stats iniciais:

```txt
Vida máxima: 420
Stamina máxima: 120
Ataque leve: 15 de dano
Ataque pesado: 35 de dano
Dash: consome 25 stamina
Velocidade base: ajustável
Respawn: 3 segundos
```

### Mecânicas obrigatórias

- movimento;
- rotação para direção do movimento/ataque;
- ataque leve;
- ataque pesado;
- dash/esquiva;
- stamina;
- vida;
- dano;
- knockback;
- hit stun curto;
- morte;
- respawn;
- barras de vida acima dos personagens/inimigos;
- UI de vida e stamina no canto superior esquerdo;
- botões mobile no canto inferior direito;
- joystick mobile no canto inferior esquerdo.

---

## 9. Sensação soulslike simplificada

O diferencial do jogo é a sensação de combate. Não deve virar hack-and-slash solto.

Implementar ataques com fases:

```txt
Ataque leve:
- windup: 0.12s
- active: 0.18s
- recovery: 0.28s
- custo de stamina: 12
- dano: 15
- knockback: baixo/médio

Ataque pesado:
- windup: 0.32s
- active: 0.22s
- recovery: 0.55s
- custo de stamina: 28
- dano: 35
- knockback: alto

Dash:
- duração: 0.25s
- custo de stamina: 25
- pequeno período de invulnerabilidade opcional na fase futura
```

Durante recovery, o jogador não deve conseguir atacar de novo imediatamente. O combate precisa ter compromisso de animação/ação.

A sensação esperada:

- errou ataque pesado, fica vulnerável;
- dash salva, mas gasta stamina;
- ataque leve é mais seguro;
- ataque pesado é arriscado e forte;
- spam de botão deve ser punido pela stamina.

---

## 10. Controles

### Desktop

```txt
WASD ou setas: mover
J ou clique esquerdo: ataque leve
K ou clique direito: ataque pesado
Espaço: dash/esquiva
Shift: bloquear ou ação futura, não obrigatório agora
```

### Mobile

```txt
Joystick esquerdo: movimento
Botão grande direito: ataque leve
Botão menor superior: ataque pesado / habilidade
Botão menor lateral: dash
Botão pequeno: poção/cura futura
```

A UI mobile deve parecer com a referência: joystick transparente à esquerda e botões circulares à direita.

---

## 11. Multiplayer online

O jogo deve suportar coop online para 2 a 3 jogadores.

### Estrutura

Use Colyseus.

```txt
Cliente Three.js
↓
Servidor Colyseus
↓
Outros clientes Three.js
```

### Regras

- sala com código;
- máximo de 3 jogadores por sala;
- cada jogador escolhe/aparece com cor diferente;
- sem login;
- sem banco de dados;
- sem matchmaking complexo;
- criar sala;
- entrar em sala;
- sair da sala;
- reconexão simples, se for fácil;
- servidor deve ser autoritativo para vida, dano, morte, respawn e pontuação.

### Cliente envia

O cliente deve enviar apenas comandos/intenção:

```txt
move vector
attackLight
attackHeavy
dash
playerName
```

O cliente não deve decidir dano final sozinho.

### Servidor decide

O servidor deve validar:

```txt
posição oficial
stamina
ataque permitido
hitbox do ataque
dano
knockback
vida
morte
respawn
pontuação
estado dos inimigos
```

### Frequência

Manter simples:

```txt
server tick: 20/s ou 30/s
state sync: padrão Colyseus
interpolação no cliente para jogadores remotos
```

---

## 12. Inimigos e modo de jogo

Primeiro modo recomendado:

# Coop contra ondas simples

Objetivo:

- 1 a 3 jogadores entram na arena;
- inimigos stick fighters aparecem em ondas;
- os jogadores precisam sobreviver;
- boss/dummy especial pode aparecer depois;
- partida termina ao limpar ondas ou todos morrerem.

### Inimigos iniciais

Criar 3 tipos simples:

```txt
EnemySword:
- anda até o jogador mais próximo
- ataque corpo a corpo simples
- vida baixa/média

EnemyShield:
- mais lento
- mais vida
- knockback menor

EnemySpear:
- ataque com alcance maior
- vida baixa
```

Para MVP, pode começar só com `EnemySword`.

### IA simples

FSM no servidor:

```txt
Idle
Chase
WindupAttack
Attack
Recovery
Stunned
Dead
```

O servidor controla os inimigos. Os clientes apenas renderizam.

---

## 13. UI/HUD

Criar HUD parecido com as referências.

### Top-left

- nível do jogador em losango ou círculo;
- barra vermelha de vida com texto: `312 / 420`;
- barra amarela/laranja de stamina com texto: `78 / 120`.

### Top-right

- moedas: `1,235`;
- gema: `3`;
- botão menu hambúrguer.

Esses valores podem ser fake/hardcoded no protótipo.

### Centro/superior ou lateral

- nome da arena: `Coliseum Arena` ou `Arena do Ato 1`;
- danger level opcional.

### Sobre personagens/inimigos

- barra de vida pequena acima da cabeça;
- cor vermelha para inimigos;
- cor azul/verde para aliados/jogadores.

### Inferior esquerdo

- joystick virtual circular translúcido.

### Inferior direito

- botão grande de ataque com ícone de espada;
- botão de dash com ícone de movimento;
- botão de cura/habilidade;
- botão extra opcional.

Não precisa usar SVG perfeito no começo. Pode usar texto/ícones simples.

---

## 14. Estrutura de pastas esperada

Criar monorepo:

```txt
arena-no-rest/
  README.md
  package.json
  .gitignore
  reference/
    print1-gamee.png
    print2-game.png
  docs/
    roadmap.md
    status.md
    controls.md
    architecture.md
  client/
    package.json
    index.html
    vite.config.ts
    tsconfig.json
    src/
      main.ts
      game/
        Game.ts
        SceneManager.ts
        Arena.ts
        CameraController.ts
        Lighting.ts
      player/
        LocalPlayer.ts
        RemotePlayer.ts
        PlayerModelFactory.ts
        PlayerStateTypes.ts
      combat/
        CombatController.ts
        HitboxDebug.ts
        CombatTypes.ts
      input/
        KeyboardInput.ts
        MobileInput.ts
        InputTypes.ts
      network/
        NetworkClient.ts
      ui/
        HUD.ts
        LobbyUI.ts
        MobileControls.ts
        Nameplates.ts
      utils/
        MathUtils.ts
        ObjectPool.ts
        Constants.ts
      styles/
        main.css
  server/
    package.json
    tsconfig.json
    src/
      index.ts
      rooms/
        ArenaRoom.ts
      state/
        GameState.ts
        PlayerState.ts
        EnemyState.ts
      systems/
        MovementSystem.ts
        CombatSystem.ts
        EnemyAISystem.ts
        WaveSystem.ts
      config/
        Balance.ts
```

A estrutura pode ser ajustada se necessário, mas manter separação clara entre client e server.

---

## 15. Roadmap de desenvolvimento por fases

Você deve seguir as fases abaixo. Não tente implementar tudo de uma vez.

Ao final de cada fase:

1. garantir que o projeto roda sem erro;
2. atualizar `docs/status.md`;
3. listar o que foi feito;
4. listar como testar;
5. listar próximos passos;
6. não seguir para a próxima fase se a fase atual estiver quebrada.

---

# FASE 0 — Setup do projeto

## Objetivo

Criar a base do monorepo com client e server.

## Entregáveis

- `client` com Vite + TypeScript + Three.js;
- `server` com Node + TypeScript + Colyseus;
- README principal;
- scripts para rodar client e server;
- `.gitignore`;
- `docs/roadmap.md`;
- `docs/status.md`.

## Critério de aceite

Deve ser possível rodar:

```bash
npm install
npm run dev
```

Ou comandos equivalentes claramente documentados para client e server.

---

# FASE 1 — Arena offline visual

## Objetivo

Criar uma cena 3D offline com a arena do coliseu.

## Entregáveis

- cena Three.js funcionando;
- câmera isométrica fixa;
- chão circular de areia;
- paredes de pedra simplificadas ao redor;
- arquibancada/crowd low-poly simplificado;
- banners vermelhos;
- tochas/braseiros com luz quente;
- golden hour;
- sombras simples;
- barris/armas/escudos decorativos leves;
- boneco de treino no centro;
- manchas de sangue estilizadas no chão.

## Critério de aceite

Ao abrir o client, o usuário deve ver uma arena medieval circular parecida com os prints, mesmo usando formas primitivas.

---

# FASE 2 — Player local e controles

## Objetivo

Criar o jogador local offline com movimento e câmera seguindo.

## Entregáveis

- modelo low-poly/stick fighter do jogador;
- movimento WASD no desktop;
- rotação para direção do movimento;
- câmera seguindo o jogador de forma suave;
- joystick mobile visível em tela touch;
- movimento por joystick no celular;
- colisão simples com limites da arena;
- sombra simples do personagem.

## Critério de aceite

O jogador deve conseguir andar pela arena no desktop e no celular.

---

# FASE 3 — Combate offline soulslike simples

## Objetivo

Criar o primeiro sistema de combate offline contra boneco de treino/inimigo parado.

## Entregáveis

- vida do jogador;
- stamina do jogador;
- ataque leve;
- ataque pesado;
- dash;
- consumo/regeneração de stamina;
- hitbox em arco/caixa à frente do jogador;
- efeito visual de slash;
- faíscas/partículas leves no impacto;
- dano no boneco/inimigo;
- knockback simples;
- barras de vida/stamina no HUD;
- botões mobile de ataque, ataque pesado e dash.

## Critério de aceite

O jogador deve conseguir atacar, gastar stamina, acertar o boneco de treino e ver efeito de impacto.

---

# FASE 4 — Inimigo básico offline

## Objetivo

Criar um inimigo que persegue e ataca o jogador.

## Entregáveis

- `EnemySword`;
- IA simples: idle, chase, attack, recovery, stunned, dead;
- barra de vida acima do inimigo;
- ataque do inimigo causando dano;
- morte e respawn do inimigo;
- knockback ao receber golpe;
- wave simples com 3 inimigos.

## Critério de aceite

O jogador deve conseguir lutar contra inimigos na arena offline.

---

# FASE 5 — UI mobile/action RPG

## Objetivo

Deixar a interface próxima dos prints.

## Entregáveis

- top-left com nível, vida e stamina;
- top-right com moedas/gemas/menu fake;
- joystick mobile translúcido;
- botões circulares de ataque/habilidade/dash;
- barras de vida acima de inimigos;
- layout responsivo para desktop e mobile landscape;
- aviso para girar o celular se estiver em portrait.

## Critério de aceite

A tela deve lembrar visualmente os prints enviados, com UI funcional.

---

# FASE 6 — Multiplayer base com Colyseus

## Objetivo

Permitir que 2 a 3 jogadores entrem na mesma sala.

## Entregáveis

- servidor Colyseus rodando;
- `ArenaRoom`;
- criar sala;
- entrar em sala por código;
- máximo 3 jogadores;
- nome do jogador;
- cor diferente por jogador;
- sincronização de posição/rotação;
- renderização de jogadores remotos;
- interpolação simples para jogadores remotos.

## Critério de aceite

Duas pessoas em lugares diferentes devem conseguir abrir o jogo, entrar na mesma sala e ver uma à outra andando na arena.

---

# FASE 7 — Combate online autoritativo

## Objetivo

Levar o combate para o multiplayer com validação no servidor.

## Entregáveis

- cliente envia comandos, não resultados;
- servidor valida stamina;
- servidor valida ataques;
- servidor calcula hitbox;
- servidor aplica dano;
- servidor aplica knockback;
- servidor sincroniza vida, stamina, ataque, morte e respawn;
- jogadores conseguem se bater ou bater em inimigos sincronizados;
- placar simples.

## Critério de aceite

Jogadores online devem conseguir lutar de forma sincronizada, com dano e morte iguais para todos.

---

# FASE 8 — Coop contra inimigos online

## Objetivo

Criar modo coop contra ondas de inimigos controlados pelo servidor.

## Entregáveis

- inimigos controlados pelo servidor;
- inimigos perseguem jogador mais próximo;
- ataques dos inimigos sincronizados;
- wave de inimigos;
- todos os jogadores veem os mesmos inimigos;
- partida termina ao limpar a onda ou todos morrerem;
- tela de vitória/derrota.

## Critério de aceite

2 a 3 jogadores devem conseguir jogar juntos contra inimigos na arena.

---

# FASE 9 — Polimento visual e performance

## Objetivo

Melhorar sensação de jogo e performance no celular.

## Entregáveis

- slash mais bonito;
- hit stop curto ao acertar;
- screen shake sutil;
- partículas leves;
- som de ataque/impacto temporário;
- redução de draw calls quando possível;
- limitar quantidade de objetos;
- object pooling para efeitos;
- configurações de qualidade simples;
- target mobile: manter o jogo leve.

## Critério de aceite

O jogo deve parecer mais impactante e continuar leve no celular.

---

# FASE 10 — Deploy web/PWA

## Objetivo

Publicar uma versão jogável por link.

## Entregáveis

- client publicado em Vercel/Netlify/Cloudflare Pages ou equivalente;
- server publicado em Railway/Render/Fly.io/VPS ou equivalente;
- instruções de deploy;
- PWA básico;
- ícone temporário;
- manifest;
- tela de loading;
- README atualizado.

## Critério de aceite

O usuário deve conseguir enviar um link para amigos e jogar online pelo navegador do celular/PC.

---

## 16. Definition of Done do MVP

O MVP estará pronto quando existir:

```txt
- 1 arena de coliseu low-poly
- câmera isométrica
- player stick fighter
- movimento desktop/mobile
- vida e stamina
- ataque leve
- ataque pesado
- dash
- slash visual
- dano/knockback
- inimigos simples
- coop online para 2 a 3 jogadores
- sala por código
- UI parecida com os prints
- versão jogável no navegador
- funcionamento aceitável em celular
```

---

## 17. Regras para o agente durante implementação

1. Não criar tudo em um arquivo gigante.
2. Não misturar client e server sem necessidade.
3. Não adicionar dependências pesadas sem justificar.
4. Não usar assets protegidos.
5. Não criar sistemas fora do escopo.
6. Preferir código simples e explícito.
7. Manter constantes de gameplay em arquivos de configuração.
8. Atualizar documentação a cada fase.
9. Depois de cada implementação, explicar como testar.
10. Se algo quebrar, corrigir antes de adicionar features novas.
11. Se houver dúvida técnica, escolher a solução mais simples que funcione.
12. Priorizar jogabilidade, não arquitetura perfeita.

---

## 18. Primeira tarefa que você deve executar agora

Não implemente todas as fases de uma vez.

Comece executando apenas:

```txt
FASE 0 — Setup do projeto
FASE 1 — Arena offline visual
```

Depois pare e entregue:

1. resumo do que foi criado;
2. comandos para rodar;
3. estrutura de arquivos;
4. próximos passos;
5. pendências técnicas.

A primeira entrega deve abrir no navegador e mostrar a arena 3D visual, mesmo que ainda não tenha jogador funcional.

---

## 19. Prompt curto para confirmar a direção antes de codar

Antes de começar a implementação, escreva um plano técnico curto com:

- stack escolhida;
- estrutura de pastas;
- fases;
- riscos técnicos;
- o que será implementado na primeira entrega.

Depois implemente FASE 0 e FASE 1.
