import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { CameraController } from './CameraController';
import { Lighting } from './Lighting';
import { Arena } from './Arena';
import { AssetLoader } from './AssetLoader';
import { Player } from './Player';
import { TrainingDummy } from './TrainingDummy';
import { InputController } from './InputController';
import { MobileHUD } from './MobileHUD';
import { VFXManager } from './VFXManager';
import { CombatController } from './CombatController';

export class Game {
  // Subsistemas Three.js
  private sceneManager: SceneManager;
  private cameraController: CameraController;
  private clock: THREE.Clock;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;

  // Carregamento de Recursos
  private assetLoader: AssetLoader;

  // Entidades e Controllers
  private arena!: Arena;
  private player!: Player;
  private dummy!: TrainingDummy;
  private inputController!: InputController;
  private mobileHUD!: MobileHUD;
  private vfxManager!: VFXManager;
  private combatController!: CombatController;

  // Áudio Tridimensional
  private audioListener!: THREE.AudioListener;
  private bgmMusic!: THREE.Audio;
  private sfxDash!: THREE.Audio;
  private sfxHeal!: THREE.Audio;

  // Modos de Depuração e Autoteste
  private isTestMode: boolean = false;
  private testState: number = 0;
  private testTimer: number = 0;
  private testChecks: { [key: string]: boolean } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.clock = new THREE.Clock();
    
    // 1. Inicializar subsistemas do Three.js
    this.sceneManager = new SceneManager(canvas);
    this.cameraController = new CameraController();
    new Lighting(this.sceneManager.scene);

    // 2. Criar Barra de Progresso no Loading Screen
    this.setupLoadingUI();

    // 3. Inicializar e executar o AssetLoader
    this.assetLoader = new AssetLoader();
    
    const statusEl = document.getElementById('loading-status');
    const errorEl = document.getElementById('loading-error');

    this.assetLoader.loadAll(
      (progress: number) => {
        this.updateLoadingUI(progress);
      },
      (url: string, loaded: number, total: number) => {
        if (statusEl) {
          const filename = url.substring(url.lastIndexOf('/') + 1);
          statusEl.innerText = `Carregado (${loaded}/${total}): ${filename}`;
        }
      }
    ).then(() => {
      this.initializeGame();
    }).catch((err: any) => {
      console.error('Erro fatal durante o carregamento de assets:', err);
      if (errorEl) {
        errorEl.innerText = `Erro de Carregamento: ${err.message || err}`;
        errorEl.style.display = 'block';
      }
      const titleEl = document.getElementById('loading-title');
      if (titleEl) {
        titleEl.innerText = 'Falha ao Iniciar';
        titleEl.style.color = '#ff5555';
        titleEl.style.textShadow = '0 0 12px rgba(255, 85, 85, 0.4)';
      }
      const spinner = document.querySelector('.spinner') as HTMLElement;
      if (spinner) {
        spinner.style.borderLeftColor = '#ff5555';
        spinner.style.borderTopColor = '#ff5555';
      }
    });
  }

  private setupLoadingUI(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      // Adicionar barra de progresso HTML se não existir
      let progressWrapper = document.getElementById('loading-progress-wrapper');
      if (!progressWrapper) {
        progressWrapper = document.createElement('div');
        progressWrapper.id = 'loading-progress-wrapper';
        progressWrapper.className = 'progress-bar-wrapper';
        progressWrapper.innerHTML = `<div id="loading-progress-fill" class="progress-bar-fill"></div>`;
        loadingScreen.appendChild(progressWrapper);
      }
    }
  }

  private updateLoadingUI(progress: number): void {
    const fill = document.getElementById('loading-progress-fill');
    if (fill) {
      fill.style.width = `${Math.min(100, progress * 100)}%`;
    }
  }

  private initializeGame(): void {
    const scene = this.sceneManager.scene;

    // Verificar se o modo de teste foi requisitado por URL
    if (window.location.search.includes('test=true')) {
      this.isTestMode = true;
      console.log('[TEST] Iniciando simulação de teste automático (Autoplay)...');
    }

    // 1. Carregar Arena GLB
    this.arena = new Arena(scene, this.assetLoader);

    // 2. Carregar Dummy GLB
    const dummyModel = this.assetLoader.getModel('dummy');
    scene.add(dummyModel);
    this.dummy = new TrainingDummy(dummyModel);

    // 3. Carregar Player GLB
    const playerModel = this.assetLoader.getModel('player');
    scene.add(playerModel);
    this.player = new Player(playerModel);

    // 4. Configurar Áudio do Jogo
    this.audioListener = new THREE.AudioListener();
    this.cameraController.camera.add(this.audioListener);

    // Carregar BGM em Loop
    this.bgmMusic = new THREE.Audio(this.audioListener);
    this.bgmMusic.setBuffer(this.assetLoader.getAudio('music_arena'));
    this.bgmMusic.setLoop(true);
    this.bgmMusic.setVolume(0.18);
    
    // Tocar música após interação do usuário (segurança do navegador)
    window.addEventListener('click', () => {
      if (!this.bgmMusic.isPlaying) {
        this.bgmMusic.play();
      }
    }, { once: true });

    // Configurar Efeitos de Áudio do Player
    this.sfxDash = new THREE.Audio(this.audioListener);
    this.sfxDash.setBuffer(this.assetLoader.getAudio('dash'));
    this.sfxDash.setVolume(0.5);

    this.sfxHeal = new THREE.Audio(this.audioListener);
    this.sfxHeal.setBuffer(this.assetLoader.getAudio('heal'));
    this.sfxHeal.setVolume(0.5);

    // 5. Instanciar Controllers e Gerenciadores
    this.inputController = new InputController();
    this.vfxManager = new VFXManager(scene, this.assetLoader.textures);
    this.mobileHUD = new MobileHUD(this.inputController);

    this.combatController = new CombatController(
      this.player,
      this.dummy,
      this.vfxManager,
      this.cameraController.camera,
      this.audioListener,
      {
        slash_light: this.assetLoader.getAudio('slash_light'),
        slash_heavy: this.assetLoader.getAudio('slash_heavy'),
        hit_impact: this.assetLoader.getAudio('hit_impact')
      }
    );

    // 6. Iniciar Loop do Jogo
    this.isRunning = true;
    this.animate();

    // 7. Esconder tela de carregamento
    this.hideLoadingScreen();
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    const deltaTime = Math.min(0.1, this.clock.getDelta()); // capar deltaTime em picos de travamento
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Atualizar entrada de dados
    this.inputController.update();

    if (this.isTestMode) {
      this.runAutoTest(deltaTime);
    }

    // 2. Processar Dash / Esquiva
    if (this.inputController.consumeAction('dash')) {
      const dashed = this.player.dash(this.inputController.moveDirection);
      if (dashed) {
        if (this.sfxDash.isPlaying) this.sfxDash.stop();
        this.sfxDash.play();
      }
    }

    // 3. Processar Ataques
    if (this.inputController.consumeAction('attackLight')) {
      this.combatController.executeAttack('light');
    } else if (this.inputController.consumeAction('attackHeavy')) {
      this.combatController.executeAttack('heavy');
    }

    // 4. Processar Cura
    if (this.inputController.consumeAction('heal')) {
      const healed = this.player.heal();
      if (healed) {
        if (this.sfxHeal.isPlaying) this.sfxHeal.stop();
        this.sfxHeal.play();
        this.vfxManager.spawnHitSpark(this.player.mesh.position); // Reutilizar spark para cura
      }
    }

    // 5. Atualizar entidades e combate
    this.player.update(deltaTime, this.inputController.moveDirection);
    this.dummy.update(deltaTime);
    this.combatController.update();
    this.vfxManager.update(deltaTime);
    this.arena.update(elapsedTime);

    // 6. Focar Câmera no Player de forma isométrica suave (Lerp)
    const targetCamPos = this.player.mesh.position.clone();
    this.cameraController.setTarget(targetCamPos);
    this.cameraController.update();

    // 7. Atualizar interface gráfica móvel com novos status
    this.mobileHUD.update(this.player);

    // 8. Renderizar
    this.sceneManager.render(this.cameraController.camera);
  };

  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 500);
    }
  }

  private runAutoTest(deltaTime: number): void {
    this.testTimer += deltaTime;
    const moveDir = new THREE.Vector3();
    const actions: any = {};

    switch (this.testState) {
      case 0:
        if (this.testTimer > 1.5) {
          this.testState = 1;
          this.testTimer = 0;
          console.log('[TEST] Iniciando movimentação em direção ao dummy...');
        }
        break;

      case 1:
        moveDir.set(1.0, 0, 0);
        if (this.player.mesh.position.x > -2.7) {
          this.testChecks['movimento'] = true;
        }
        if (this.player.mesh.position.distanceTo(this.dummy.getPosition()) < 1.7) {
          this.testState = 2;
          this.testTimer = 0;
          moveDir.set(0, 0, 0);
          console.log('[TEST] Player próximo do dummy. Executando Ataque Leve...');
        }
        break;

      case 2:
        actions.attackLight = true;
        this.testState = 3;
        this.testTimer = 0;
        break;

      case 3:
        if (this.dummy.health < 999) {
          this.testChecks['impacto'] = true;
        }
        if (this.testTimer > 0.8) {
          this.testState = 4;
          this.testTimer = 0;
          console.log('[TEST] Executando Ataque Pesado...');
        }
        break;

      case 4:
        actions.attackHeavy = true;
        this.testState = 5;
        this.testTimer = 0;
        break;

      case 5:
        if (this.testTimer > 0.8) {
          this.testState = 6;
          this.testTimer = 0;
          console.log('[TEST] Executando Dash de fuga...');
        }
        break;

      case 6:
        moveDir.set(-1.0, 0, 0);
        actions.dash = true;
        this.testState = 7;
        this.testTimer = 0;
        break;

      case 7:
        if (this.player.stamina < 120) {
          this.testChecks['dash'] = true;
        }
        if (this.testTimer > 1.0) {
          this.testState = 8;
          this.testTimer = 0;
          console.log('[TEST] Executando Cura...');
        }
        break;

      case 8:
        actions.heal = true;
        this.testState = 9;
        this.testTimer = 0;
        break;

      case 9:
        if (this.testTimer > 1.0) {
          this.testState = 10;
          console.log('[TEST-REPORT]');
          console.log(`[TEST-CHECK] Movimento: ${this.testChecks['movimento'] ? 'PASS' : 'FAIL'}`);
          console.log(`[TEST-CHECK] Impacto no Dummy: ${this.testChecks['impacto'] ? 'PASS' : 'FAIL'}`);
          console.log(`[TEST-CHECK] Dash/Stamina: ${this.testChecks['dash'] ? 'PASS' : 'FAIL'}`);
          
          if (this.testChecks['movimento'] && this.testChecks['impacto'] && this.testChecks['dash']) {
            console.log('[TEST-SUCCESS] Todos os testes passaram!');
            fetch('http://localhost:3000/success')
              .catch(err => console.log('Erro ao enviar feedback para o test-server:', err));
          } else {
            console.error('[TEST-FAILURE] Alguns testes falharam.');
            fetch('http://localhost:3000/failure')
              .catch(err => console.log('Erro ao enviar feedback para o test-server:', err));
          }
        }
        break;
      
      default:
        break;
    }

    this.inputController.simulateInput(moveDir, actions);
  }

  public dispose(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Parar áudios
    if (this.bgmMusic && this.bgmMusic.isPlaying) this.bgmMusic.stop();

    if (this.inputController) this.inputController.dispose();
    this.sceneManager.dispose();
    this.cameraController.dispose();
  }
}
