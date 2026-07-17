import * as THREE from 'three';
import { MapManager } from './Map';
import { CameraController } from './Camera';
import { InputManager } from './Input';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Minion } from './entities/Minion';
import { Tower } from './entities/Tower';
import { JungleMonster } from './entities/JungleMonster';
import { Character } from './entities/Character';
import { Projectile } from './entities/Projectile';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TestManager } from './TestManager';

export class Game {
  public static instance: Game;
  public scene!: THREE.Scene;
  public renderer!: THREE.WebGLRenderer;
  private clock: THREE.Clock = new THREE.Clock();
  
  // Gerenciadores
  private mapManager!: MapManager;
  private cameraController!: CameraController;
  private inputManager!: InputManager;
  
  // Entidades
  public player!: Player;
  public enemy!: Enemy;
  public entities: Character[] = [];
  public projectiles: Projectile[] = [];
  
  // Clique Indicador Visual (rts-target)
  private clickIndicator: THREE.Object3D | null = null;
  private clickIndicatorTimer: number = 0;
  
  // Spawn de Tropas (Minions)
  private minionSpawnTimer: number = 0;
  private minionSpawnInterval: number = 20; // Onda a cada 20s
  
  // HUD minimap
  private minimapCtx: CanvasRenderingContext2D | null = null;
  
  // Controle de Fluxo de Partida
  public isMatchActive: boolean = false;
  private matchTimer: number = 0;
  private isCountdownActive: boolean = false;
  private countdownTimer: number = 3.9;
  private lastCountdownSecond: number = 4;
  
  constructor() {
    Game.instance = this;
    this.initThree();
    this.initGame();
  }
  
  private initThree() {
    this.scene = new THREE.Scene();
    
    // Cor de fundo escura do céu
    this.scene.background = new THREE.Color(0x050a12);
    this.scene.fog = new THREE.FogExp2(0x050a12, 0.007);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    dirLight.position.set(40, 60, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 250;
    
    const d = 100;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    
    this.scene.add(dirLight);
    
    // Redimensionamento
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  private async initGame() {
    const loadingStatus = document.getElementById('loading-status');
    const loadingBarFill = document.getElementById('loading-bar-fill');
    
    const updateProgress = (pct: number) => {
      if (loadingBarFill) loadingBarFill.style.width = `${pct}%`;
    };
    
    // 1. Carrega o Mapa
    if (loadingStatus) loadingStatus.innerText = 'Carregando o mapa 5v5...';
    this.mapManager = new MapManager(this.scene);
    await this.mapManager.load((pct) => updateProgress(pct * 0.4));
    
    // 2. Inicializa Câmera
    this.cameraController = new CameraController();
    
    // 3. Inicializa Entrada e Raycast (vinculado ao chão invisível do mapa)
    this.inputManager = new InputManager(
      this.cameraController.camera,
      this.mapManager.groundMesh || this.scene,
      () => this.entities.filter(e => e.mesh && e.state !== 'DEAD').map(e => e.mesh!)
    );
    
    // 4. Cria e carrega a Caitlyn (Player)
    if (loadingStatus) loadingStatus.innerText = 'Invocando Caitlyn...';
    this.player = new Player(this.scene);
    this.player.position.set(-16.0, 0, -16.0); // Spawn na base aliada
    await this.player.loadModel();
    this.entities.push(this.player);
    updateProgress(65);
    
    // 5. Cria e carrega o Master Yi (Inimigo)
    if (loadingStatus) loadingStatus.innerText = 'Invocando Master Yi...';
    this.enemy = new Enemy(this.scene);
    this.enemy.position.set(16.0, 0, 16.0); // Spawn na base inimiga
    await this.enemy.loadModel();
    this.entities.push(this.enemy);
    updateProgress(85);
    
    // 6. Carrega indicador de clique (UI Target)
    if (loadingStatus) loadingStatus.innerText = 'Configurando interface...';
    await this.loadClickIndicator();
    
    // 7. Instancia Torres
    this.spawnTowers();
    
    // 7.5. Instancia Monstros da Selva
    this.spawnJungleMonsters();
    
    // 8. Configura interações de Input
    this.setupInputCallbacks();
    
    // 9. Configura Minimapa
    const minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    if (minimapCanvas) {
      minimapCanvas.width = 120;
      minimapCanvas.height = 120;
      this.minimapCtx = minimapCanvas.getContext('2d');
    }
    
    // 9.5. Inicializa o Módulo de Simulação e Testes
    new TestManager();
    
    // 9.6. Configura inputs de menus
    this.setupMenuInputHandlers();
    
    // Esconde tela de carregamento e inicia o Loop
    updateProgress(100);
    setTimeout(() => {
      const loader = document.getElementById('loading-screen');
      if (loader) loader.style.opacity = '0';
      setTimeout(() => loader?.classList.add('hidden'), 500);
      
      this.cameraController.resetToTarget(this.player.position);
      // Não spawna minions ainda - espera o countdown!
      this.clock.getDelta();
      this.animate();
    }, 400);
  }
  
  private async loadClickIndicator() {
    return new Promise<void>((resolve) => {
      const loader = new GLTFLoader();
      loader.load(
        './UI/rts-target/source/pointTarget.glb',
        (gltf) => {
          this.clickIndicator = gltf.scene;
          this.clickIndicator.scale.set(0.6, 0.6, 0.6);
          this.clickIndicator.visible = false;
          
          this.clickIndicator.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              child.material.color.setHex(0x00ffaa); // indicador verde
              child.material.toneMapped = false;
            }
          });
          
          this.scene.add(this.clickIndicator);
          resolve();
        },
        undefined,
        () => {
          // Fallback se falhar
          const geo = new THREE.RingGeometry(0.1, 0.4, 16);
          const mat = new THREE.MeshBasicMaterial({ color: 0x00ffaa, side: THREE.DoubleSide });
          this.clickIndicator = new THREE.Mesh(geo, mat);
          this.clickIndicator.rotation.x = Math.PI / 2;
          this.clickIndicator.position.y = 0.05;
          this.clickIndicator.visible = false;
          this.scene.add(this.clickIndicator);
          resolve();
        }
      );
    });
  }
  
  private spawnTowers() {
    // Torres Aliadas
    this.mapManager.towerPositions.ally.forEach((pos) => {
      const t = new Tower(this.scene, pos.x, pos.z, 1);
      this.entities.push(t);
    });
    
    // Torres Inimigas
    this.mapManager.towerPositions.enemy.forEach((pos) => {
      const t = new Tower(this.scene, pos.x, pos.z, 2);
      this.entities.push(t);
    });
  }
  
  private spawnJungleMonsters() {
    this.mapManager.jungleCamps.forEach((camp) => {
      const monster = new JungleMonster(this.scene, camp.name, camp.x, camp.z);
      monster.loadModel().then(() => this.entities.push(monster));
    });
  }
  
  public spawnProjectile(proj: Projectile) {
    this.projectiles.push(proj);
  }
  
  private spawnMinionWave() {
    console.log('Spawning Wave of Minions!');
    
    // 2 Melees e 1 Ranged para cada time
    const offsets = [-1.5, 0, 1.5];
    
    // Onda Aliada
    offsets.forEach((offset, idx) => {
      const type = idx < 2 ? 'melee' : 'ranged';
      const m = new Minion(this.scene, type, 1);
      m.position.add(new THREE.Vector3(offset, 0, -offset)); // espalhamento
      m.loadModel().then(() => this.entities.push(m));
    });
    
    // Onda Inimiga
    offsets.forEach((offset, idx) => {
      const type = idx < 2 ? 'melee' : 'ranged';
      const m = new Minion(this.scene, type, 2);
      m.position.add(new THREE.Vector3(offset, 0, -offset));
      m.loadModel().then(() => this.entities.push(m));
    });
  }
  
  private setupInputCallbacks() {
    // 1. Clique Direito (Mover ou Atacar)
    this.inputManager.onRightClick = (point, targetEntity) => {
      if (this.player.state === 'DEAD' || this.player.state === 'CASTING') return;
      if (TestManager.instance && TestManager.instance.isSimulating) return; // ignore if simulating
      
      if (targetEntity) {
        // Clicou num inimigo: foca auto-ataque
        this.player.target = targetEntity;
        this.player.moveTarget = null;
        this.player.path = [];
      } else {
        // Clicou no chão: cancela target e move-se
        this.player.target = null;
        this.player.moveTarget = this.mapManager.resolveCollision(point);
        this.player.path = [];
        
        // Exibe indicador visual de clique
        if (this.clickIndicator) {
          this.clickIndicator.position.copy(point);
          this.clickIndicator.position.y = 0.06; // rente ao chão
          this.clickIndicator.scale.set(0.6, 0.6, 0.6);
          this.clickIndicator.visible = true;
          this.clickIndicatorTimer = 0.4; // dura 0.4s
        }
      }
    };
    
    // 2. Atalhos de Teclado (Habilidades Quickcast)
    this.inputManager.onKeyPress = (key) => {
      if (this.player.state === 'DEAD' || this.player.state === 'CASTING') return;
      
      // Se estiver simulando, bloqueia inputs de skills manuais
      if (TestManager.instance && TestManager.instance.isSimulating && ['Q', 'W', 'E', 'R'].includes(key)) return;
      
      const mouse3D = this.inputManager.mouse3D.clone();
      
      switch (key) {
        case 'Q':
          this.player.castQ(mouse3D, (p) => this.projectiles.push(p));
          break;
        case 'W':
          this.player.castW(mouse3D);
          break;
        case 'E':
          this.player.castE(mouse3D, (p) => this.projectiles.push(p));
          break;
        case 'R':
          // Mira travada no Master Yi se ele estiver vivo
          if (this.enemy.state !== 'DEAD') {
            this.player.castR(this.enemy);
          }
          break;
        case 'Y':
          // Destrava/Trava a câmera
          this.cameraController.toggleLock();
          break;
        case ' ': // Espaço: Centraliza no player
          this.cameraController.resetToTarget(this.player.position);
          break;
        case 'ESCAPE':
          this.toggleGameMenu();
          break;
      }
    };
  }
  
  // Loop Principal
  private animate = () => {
    requestAnimationFrame(this.animate);
    
    try {
      const rawDelta = this.clock.getDelta();
      let deltaTime = Math.min(rawDelta, 0.1);
      
      if (TestManager.instance && TestManager.instance.isSimulating) {
        // Detecta Puppeteer headless (navigator.webdriver = true)
        const isHeadless = !!(navigator as any).webdriver;
        if (isHeadless) {
          // Sub-stepping agressivo APENAS no headless (sem tela pra travar)
          for (let i = 0; i < 10; i++) {
            this.updateGame(0.2);
          }
          this.render();
          return;
        }
        // No navegador normal com Auto-Play, acelera 6x (suave, sem travar)
        deltaTime *= 6.0;
      }
      
      this.updateGame(deltaTime);
      this.render();
    } catch (error: any) {
      console.error('[CRITICAL ERROR] Erro no loop principal animate:', error);
      if (TestManager.instance) {
        TestManager.instance.log('TEST_ERROR', 'Erro no animate: ' + (error.message || error));
      }
    }
  };
  
  private updateGame(deltaTime: number) {
    try {
      // 0. Atualiza o Módulo de Simulação e Testes
      if (TestManager.instance) {
        TestManager.instance.update(deltaTime);
      }
      
      // Se a partida não começou, processa apenas a contagem regressiva
      if (!this.isMatchActive) {
        if (this.isCountdownActive) {
          this.updateCountdown(deltaTime);
        }
        // Sempre atualiza a câmera para focar no player e renderizar a rotação inicial
        this.cameraController.update(deltaTime, this.player.position, this.inputManager.mouseX, this.inputManager.mouseY);
        this.drawMinimap();
        return;
      }
      
      // Incrementa relógio do jogo
      this.matchTimer += deltaTime;
      const minutes = Math.floor(this.matchTimer / 60);
      const seconds = Math.floor(this.matchTimer % 60);
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const clockEl = document.getElementById('game-timer');
      if (clockEl) clockEl.innerText = timeString;
      
      if (this.matchTimer >= 300) { // 5 minutos de partida
        this.endMatchByTime();
        return;
      }
      
      // 1. Spawner de Ondas de Minions
      this.minionSpawnTimer += deltaTime;
      if (this.minionSpawnTimer >= this.minionSpawnInterval) {
        this.minionSpawnTimer = 0;
        this.spawnMinionWave();
      }
      
      // 2. Processa indicador visual de clique
      if (this.clickIndicator && this.clickIndicator.visible) {
        this.clickIndicatorTimer -= deltaTime;
        // Animação de rotação e escala
        this.clickIndicator.rotation.y += deltaTime * 5;
        const s = 0.6 * (this.clickIndicatorTimer / 0.4);
        this.clickIndicator.scale.set(s, s, s);
        
        if (this.clickIndicatorTimer <= 0) {
          this.clickIndicator.visible = false;
        }
      }
      
      // 3. Atualiza Entidades Ativas
      // Remove entidades mortas após as animações
      for (let i = this.entities.length - 1; i >= 0; i--) {
        const entity = this.entities[i];
        
        if (!entity.active) {
          this.entities.splice(i, 1);
          continue;
        }
        
        // Se Caitlyn tiver alvo de ataque automático à distância
        if (entity === this.player && this.player.target) {
          const target = this.player.target;
          if (target.state === 'DEAD') {
            this.player.target = null;
          } else {
            const dist = this.player.position.distanceTo(target.position);
            if (dist <= this.player.attackRange) {
              // No alcance, ataca
              this.player.moveTarget = null;
              this.player.autoAttack(target, (p) => this.projectiles.push(p));
              // Registra ameaça para Torres
              Tower.registerAggroThreat(this.player, target);
            } else {
              // Fora de alcance, anda até lá
              this.player.moveTarget = this.mapManager.resolveCollision(target.position);
            }
          }
        }
        
        // Se Master Yi (Enemy) tiver alvo
        if (entity === this.enemy && this.enemy.target) {
          const target = this.enemy.target;
          if (target.state === 'DEAD') {
            this.enemy.target = null;
          } else {
            // Registra ameaça para Torres
            Tower.registerAggroThreat(this.enemy, target);
          }
        }
        
        // Restringe posições de movimento contra as colisões do mapa
        if (entity.state === 'MOVING') {
          entity.position.copy(this.mapManager.resolveCollision(entity.position));
        }
        
        entity.update(deltaTime);
        
        // Atualiza a barra de vida 2D flutuante na tela
        entity.updateUIPosition(this.cameraController.camera);
      }
      
      // 4. Atualiza Projéteis
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const proj = this.projectiles[i];
        if (!proj.active) {
          this.projectiles.splice(i, 1);
        } else {
          proj.update(deltaTime, this.entities);
        }
      }
      
      // 5. Atualiza Câmera
      this.cameraController.update(
        deltaTime,
        this.player.position,
        this.inputManager.mouseX,
        this.inputManager.mouseY
      );
      
      // 6. Atualiza Minimapa HUD
      this.drawMinimap();
      
      // 7. Checa Condições de Vitória / Derrota
      this.checkGameConditions();
    } catch (error: any) {
      console.error('[CRITICAL ERROR] Erro no loop de atualização updateGame:', error);
      if (TestManager.instance) {
        TestManager.instance.log('TEST_ERROR', 'Erro no updateGame: ' + (error.message || error));
      }
    }
  }
  
  private drawMinimap() {
    if (!this.minimapCtx) return;
    
    const ctx = this.minimapCtx;
    ctx.clearRect(0, 0, 120, 120);
    
    // Desenha fundo da rota (linha diagonal)
    ctx.strokeStyle = 'rgba(194, 157, 83, 0.15)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(10, 110);
    ctx.lineTo(110, 10);
    ctx.stroke();
    
    // Desenha entidades no minimapa (mapeando de -60/60 para 10/110)
    const mapCoord = (val: number) => {
      // Mapeia faixa de [-60, 60] para [10, 110]
      return 60 + (val / 60) * 50;
    };
    
    this.entities.forEach((entity) => {
      if (entity.state === 'DEAD') return;
      
      const x = mapCoord(entity.position.x);
      const z = mapCoord(entity.position.z); // Z no Three.js é vertical no plano
      
      if (entity.name === 'Caitlyn') {
        ctx.fillStyle = '#00d9ff'; // Player
        ctx.beginPath();
        ctx.arc(x, z, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (entity.name === 'MasterYi') {
        ctx.fillStyle = '#ff3b30'; // Enemy Hero
        ctx.beginPath();
        ctx.arc(x, z, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (entity.name === 'Tower') {
        ctx.fillStyle = entity.team === 1 ? '#007acc' : '#cc2929'; // Torres
        ctx.fillRect(x - 3, z - 3, 6, 6);
      } else { // Minions
        ctx.fillStyle = entity.team === 1 ? '#28cd41' : '#ff453a';
        ctx.beginPath();
        ctx.arc(x, z, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  
  private checkGameConditions() {
    // Tela de abates
    const announcement = document.getElementById('announcement');
    const annTitle = document.getElementById('announcement-title');
    const annSubtitle = document.getElementById('announcement-subtitle');
    
    // 1. Abate do Master Yi (Vitória Parcial)
    if (this.enemy.state === 'DEAD' && this.enemy.active) {
      this.enemy.active = false; // desativa para não repetir
      
      // Incrementa Scoreboard Gold
      const killsText = document.getElementById('player-kills');
      if (killsText) killsText.innerText = (parseInt(killsText.innerText) + 1).toString();
      
      const goldText = document.getElementById('player-gold');
      if (goldText) goldText.innerText = (parseInt(goldText.innerText) + 300).toString();
      this.player.gold += 300;
      
      // Anúncio na tela
      if (announcement && annTitle && annSubtitle) {
        annTitle.innerText = 'VOCÊ ABATEU UM INIMIGO!';
        annSubtitle.innerText = 'Caitlyn eliminou Master Yi (+300g)';
        annTitle.style.color = '#ffca28';
        announcement.classList.remove('hidden');
        setTimeout(() => announcement.classList.add('hidden'), 3500);
      }
      
      // Renasce o Master Yi após 10 segundos na base dele
      setTimeout(() => {
        if (this.player.state !== 'DEAD') {
          this.enemy.hp = this.enemy.maxHp;
          this.enemy.position.set(16.0, 0, 16.0);
          this.enemy.state = 'IDLE';
          this.enemy.active = true;
          this.enemy.loadModel().then(() => {
            this.entities.push(this.enemy);
          });
        }
      }, 10000);
    }
    
    // 2. Abate do Player (Derrota Parcial)
    if (this.player.state === 'DEAD' && this.player.active) {
      this.player.active = false;
      
      const deathsText = document.getElementById('player-deaths');
      if (deathsText) deathsText.innerText = (parseInt(deathsText.innerText) + 1).toString();
      
      if (announcement && annTitle && annSubtitle) {
        annTitle.innerText = 'VOCÊ FOI ELIMINADO!';
        annSubtitle.innerText = 'Master Yi obteve um Double Kill!';
        annTitle.style.color = '#ff3b30';
        announcement.classList.remove('hidden');
        setTimeout(() => announcement.classList.add('hidden'), 3500);
      }
      
      // Renasce a Caitlyn após 10 segundos
      setTimeout(() => {
        this.player.hp = this.player.maxHp;
        this.player.mana = this.player.maxMana;
        this.player.position.set(-16.0, 0, -16.0);
        this.player.state = 'IDLE';
        this.player.active = true;
        this.player.loadModel().then(() => {
          this.entities.push(this.player);
          this.cameraController.resetToTarget(this.player.position);
        });
      }, 10000);
    }
    
    // 3. Fim de Jogo: Destruição da última torre inimiga ou aliada (Nexo)
    const enemyNexusTower = this.entities.find(e => e.name === 'Tower' && e.team === 2 && e.position.x === 14.5 && e.state === 'DEAD');
    if (enemyNexusTower) {
      this.showGameOver(true);
    }
    
    const allyNexusTower = this.entities.find(e => e.name === 'Tower' && e.team === 1 && e.position.x === -14.5 && e.state === 'DEAD');
    if (allyNexusTower) {
      this.showGameOver(false);
    }
  }
  
  private showGameOver(win: boolean) {
    const screen = document.getElementById('game-over');
    const title = document.getElementById('game-over-title');
    const desc = document.getElementById('game-over-desc');
    
    if (screen && title && desc) {
      screen.className = win ? 'win' : 'lose';
      title.innerText = win ? 'VITÓRIA' : 'DERROTA';
      desc.innerText = win 
        ? 'Você destruiu o Nexo inimigo e conquistou Summoner\'s Rift!' 
        : 'Sua base foi destruída pelas forças adversárias!';
      screen.classList.remove('hidden');
    }
    
    // Salva automaticamente o arquivo de log físico ao encerrar
    if (TestManager.instance) {
      TestManager.instance.saveLogsToFile();
    }
  }
  
  private setupMenuInputHandlers() {
    // 1. Menu Inicial
    document.getElementById('menu-start-normal')?.addEventListener('click', () => {
      this.startMatch(false);
    });
    
    document.getElementById('menu-start-auto')?.addEventListener('click', () => {
      this.startMatch(true);
    });
    
    document.getElementById('menu-options')?.addEventListener('click', () => {
      this.toggleGameMenu();
    });
    
    document.getElementById('menu-exit')?.addEventListener('click', () => {
      if (confirm('Deseja realmente sair?')) {
        window.location.reload();
      }
    });
    
    // 2. Menu ESC
    const simToggle = document.getElementById('simulation-toggle') as HTMLInputElement;
    simToggle?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      if (TestManager.instance && TestManager.instance.isSimulating !== checked) {
        TestManager.instance.toggleSimulation();
      }
    });
    
    const camToggle = document.getElementById('camera-lock-toggle') as HTMLInputElement;
    camToggle?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      this.cameraController.isLocked = checked;
    });
    
    const qualitySelect = document.getElementById('graphics-quality') as HTMLSelectElement;
    qualitySelect?.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      const dirLight = this.scene.children.find(c => c instanceof THREE.DirectionalLight) as THREE.DirectionalLight;
      if (dirLight) {
        dirLight.castShadow = (value === 'high');
      }
      this.renderer.setPixelRatio(value === 'high' ? Math.min(window.devicePixelRatio, 2) : value === 'medium' ? 1.5 : 1.0);
    });
    
    document.getElementById('resume-btn')?.addEventListener('click', () => {
      this.toggleGameMenu();
    });
    
    document.getElementById('menu-restart-btn')?.addEventListener('click', () => {
      window.location.reload();
    });
    
    // Configura Botão de Reiniciar da tela final
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      window.location.reload();
    });
  }
  
  public toggleGameMenu() {
    const menu = document.getElementById('game-menu');
    if (!menu) return;
    
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      
      const simToggle = document.getElementById('simulation-toggle') as HTMLInputElement;
      if (simToggle && TestManager.instance) {
        simToggle.checked = TestManager.instance.isSimulating;
      }
      
      const camToggle = document.getElementById('camera-lock-toggle') as HTMLInputElement;
      if (camToggle) {
        camToggle.checked = this.cameraController.isLocked;
      }
    } else {
      menu.classList.add('hidden');
    }
  }
  
  private startMatch(autoPlay: boolean) {
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) mainMenu.classList.add('hidden');
    
    if (autoPlay && TestManager.instance) {
      if (!TestManager.instance.isSimulating) {
        TestManager.instance.toggleSimulation();
      }
      this.countdownTimer = 0.5;
      this.lastCountdownSecond = 1;
    } else {
      this.countdownTimer = 3.9;
      this.lastCountdownSecond = 4;
    }
    
    this.isCountdownActive = true;
    const overlay = document.getElementById('countdown-overlay');
    if (overlay) overlay.classList.remove('hidden');
    
    if (TestManager.instance) {
      TestManager.instance.log('SYSTEM', 'Menu Inicial fechado. Iniciando contagem regressiva para a partida!');
    }
  }
  
  private updateCountdown(deltaTime: number) {
    this.countdownTimer -= deltaTime;
    const currentSec = Math.ceil(this.countdownTimer);
    
    const countText = document.getElementById('countdown-text');
    
    if (currentSec > 0 && currentSec !== this.lastCountdownSecond) {
      this.lastCountdownSecond = currentSec;
      if (countText) countText.innerText = currentSec.toString();
      if (TestManager.instance) TestManager.instance.log('SYSTEM', `Contagem regressiva: ${currentSec}...`);
    } else if (currentSec <= 0 && this.lastCountdownSecond > 0) {
      this.lastCountdownSecond = 0;
      if (countText) {
        countText.innerText = 'QUE A BATALHA COMECE!';
      }
      if (TestManager.instance) TestManager.instance.log('SYSTEM', 'QUE A BATALHA COMECE!');
    }
    
    if (this.countdownTimer <= -1.0) {
      this.isCountdownActive = false;
      this.isMatchActive = true;
      const overlay = document.getElementById('countdown-overlay');
      if (overlay) overlay.classList.add('hidden');
      
      this.spawnMinionWave(); // Primeira onda de minions no frame ativo
    }
  }
  
  private endMatchByTime() {
    this.isMatchActive = false;
    
    const killsText = document.getElementById('player-kills');
    const deathsText = document.getElementById('player-deaths');
    const playerKills = killsText ? parseInt(killsText.innerText) : 0;
    const enemyKills = deathsText ? parseInt(deathsText.innerText) : 0;
    
    const playerWins = playerKills >= enemyKills;
    
    if (TestManager.instance) {
      TestManager.instance.log('SYSTEM', `Partida encerrada por limite de tempo de 5 minutos! Placar final: ${playerKills} Abates contra ${enemyKills} Abates.`);
    }
    
    this.showGameOver(playerWins);
  }
  
  private render() {
    this.renderer.render(this.scene, this.cameraController.camera);
  }
}
