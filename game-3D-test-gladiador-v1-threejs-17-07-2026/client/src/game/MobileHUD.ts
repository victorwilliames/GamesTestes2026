import { Player } from './Player';
import { InputController } from './InputController';

export class MobileHUD {
  private inputController: InputController;

  // Referências de Elementos DOM
  private root: HTMLDivElement;
  private joystickBase!: HTMLDivElement;
  private joystickKnob!: HTMLDivElement;
  
  // Elementos do Status
  private healthBarFill!: HTMLDivElement;
  private healthText!: HTMLDivElement;
  private staminaBarFill!: HTMLDivElement;
  private staminaText!: HTMLDivElement;

  // Estado do Toque do Joystick
  private touchId: number | null = null;
  private joystickCenter: { x: number; y: number } = { x: 0, y: 0 };
  private joystickRadius: number = 50; // pixels máximos de deslocamento

  constructor(inputController: InputController) {
    this.inputController = inputController;
    this.root = document.getElementById('ui-container') as HTMLDivElement;
    if (!this.root) {
      throw new Error('Elemento ui-container não encontrado no HTML!');
    }

    this.buildHUD();
    this.setupJoystickEvents();
    this.setupButtonEvents();
  }

  private buildHUD(): void {
    // Limpar UI container (remover tela de loading ou elementos anteriores se houver)
    const elementsToRemove = this.root.querySelectorAll('.hud-element');
    elementsToRemove.forEach(el => el.remove());

    // 1. Criar Barra de Status do Jogador (Canto Superior Esquerdo)
    const statusContainer = document.createElement('div');
    statusContainer.className = 'hud-element player-status-container';
    statusContainer.innerHTML = `
      <!-- Moldura do Nível -->
      <div class="hud-level-diamond">
        <img src="./assets/2d/ui/hud_level_diamond.png" alt="Nível" />
        <span class="level-value">12</span>
      </div>
      <!-- Barras de Vida e Stamina -->
      <div class="bars-container">
        <div class="bar-wrapper health">
          <img class="bar-frame" src="./assets/2d/ui/hud_health_bar_frame.png" />
          <div class="bar-fill-bg">
            <div id="hud-health-fill" class="bar-fill"></div>
          </div>
          <span id="hud-health-text" class="bar-text">420 / 420</span>
        </div>
        <div class="bar-wrapper stamina">
          <img class="bar-frame" src="./assets/2d/ui/hud_stamina_bar_frame.png" />
          <div class="bar-fill-bg">
            <div id="hud-stamina-fill" class="bar-fill"></div>
          </div>
          <span id="hud-stamina-text" class="bar-text">120 / 120</span>
        </div>
      </div>
    `;
    this.root.appendChild(statusContainer);

    this.healthBarFill = document.getElementById('hud-health-fill') as HTMLDivElement;
    this.healthText = document.getElementById('hud-health-text') as HTMLDivElement;
    this.staminaBarFill = document.getElementById('hud-stamina-fill') as HTMLDivElement;
    this.staminaText = document.getElementById('hud-stamina-text') as HTMLDivElement;

    // 2. Criar Indicador de Recursos (Canto Superior Direito)
    const resourcesContainer = document.createElement('div');
    resourcesContainer.className = 'hud-element resources-container';
    resourcesContainer.innerHTML = `
      <div class="resource-item">
        <img src="./assets/2d/ui/icon_coin.png" alt="Ouro" />
        <span id="resource-gold">1,245</span>
      </div>
      <div class="resource-item">
        <img src="./assets/2d/ui/icon_gem.png" alt="Gemas" />
        <span id="resource-gem">3</span>
      </div>
      <button class="hud-menu-btn">
        <img src="./assets/2d/ui/button_menu.png" alt="Menu" />
      </button>
    `;
    this.root.appendChild(resourcesContainer);

    // 3. Criar Joystick Virtual (Canto Inferior Esquerdo)
    this.joystickBase = document.createElement('div');
    this.joystickBase.className = 'hud-element joystick-base';
    this.joystickBase.style.backgroundImage = "url('./assets/2d/ui/joystick_base.png')";
    
    this.joystickKnob = document.createElement('div');
    this.joystickKnob.className = 'joystick-knob';
    this.joystickKnob.style.backgroundImage = "url('./assets/2d/ui/joystick_knob.png')";
    
    this.joystickBase.appendChild(this.joystickKnob);
    this.root.appendChild(this.joystickBase);

    // 4. Criar Botões de Ação (Canto Inferior Direito)
    const actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.className = 'hud-element action-buttons-container';
    actionButtonsContainer.innerHTML = `
      <!-- Botão de Cura / Poção Rápida -->
      <button id="btn-heal" class="action-btn heal">
        <img src="./assets/2d/ui/button_heal_green.png" alt="Curar" />
      </button>
      
      <!-- Botão de Ataque Pesado (Poção Vermelha como placeholder) -->
      <button id="btn-attack-heavy" class="action-btn attack-heavy">
        <img src="./assets/2d/ui/button_potion_red.png" alt="Ataque Pesado" />
        <span class="potion-count">2</span>
      </button>
      
      <!-- Botão de Esquiva / Dash -->
      <button id="btn-dash" class="action-btn dash">
        <img src="./assets/2d/ui/button_dash_blue.png" alt="Dash" />
      </button>
      
      <!-- Botão de Ataque Leve (Central e Maior) -->
      <button id="btn-attack-light" class="action-btn attack-light">
        <img src="./assets/2d/ui/button_attack_sword.png" alt="Atacar" />
      </button>
    `;
    this.root.appendChild(actionButtonsContainer);
  }

  /**
   * Configura eventos de touch e mouse para arrastar o Joystick Virtual
   */
  private setupJoystickEvents(): void {
    const startJoystick = (id: number | null) => {
      this.touchId = id;
      const rect = this.joystickBase.getBoundingClientRect();
      this.joystickCenter.x = rect.left + rect.width / 2;
      this.joystickCenter.y = rect.top + rect.height / 2;
      this.joystickRadius = rect.width / 2;
    };

    const moveJoystick = (clientX: number, clientY: number) => {
      if (this.touchId === null) return;

      const deltaX = clientX - this.joystickCenter.x;
      const deltaY = clientY - this.joystickCenter.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      let normX = 0;
      let normY = 0;

      if (distance > 0) {
        normX = deltaX / distance;
        normY = -deltaY / distance; // inverter Y para cima ser positivo
      }

      // Limitar deslocamento visual do Knob
      const clampDistance = Math.min(distance, this.joystickRadius);
      const visualX = normX * clampDistance;
      const visualY = -normY * clampDistance; // reverter para o CSS

      this.joystickKnob.style.transform = `translate(${visualX}px, ${visualY}px)`;

      // Passar o percentual (-1.0 a 1.0) para o InputController
      this.inputController.joystickX = normX * (clampDistance / this.joystickRadius);
      this.inputController.joystickY = normY * (clampDistance / this.joystickRadius);
    };

    const endJoystick = () => {
      this.touchId = null;
      this.joystickKnob.style.transform = 'translate(0px, 0px)';
      this.inputController.joystickX = 0;
      this.inputController.joystickY = 0;
    };

    // Suporte a Touch Móvel
    this.joystickBase.addEventListener('touchstart', (e) => {
      if (this.touchId !== null) return;
      const touch = e.changedTouches[0];
      startJoystick(touch.identifier);
      e.preventDefault();
    });

    window.addEventListener('touchmove', (e) => {
      if (this.touchId === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.touchId) {
          moveJoystick(e.touches[i].clientX, e.touches[i].clientY);
          break;
        }
      }
    });

    window.addEventListener('touchend', (e) => {
      if (this.touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          endJoystick();
          break;
        }
      }
    });

    // Suporte a Mouse (Para Testes no Desktop)
    this.joystickBase.addEventListener('mousedown', (e) => {
      startJoystick(-99);
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (this.touchId === -99) {
        moveJoystick(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.touchId === -99) {
        endJoystick();
      }
    });
  }

  /**
   * Configura os cliques dos botões de ação e os passa para o InputController
   */
  private setupButtonEvents(): void {
    const bindBtn = (id: string, actionKey: keyof typeof this.inputController.actions) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const triggerAction = (e: Event) => {
        this.inputController.actions[actionKey] = true;
        
        // Efeito de feedback de clique do botão
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 120);

        e.preventDefault();
        e.stopPropagation();
      };

      btn.addEventListener('touchstart', triggerAction);
      btn.addEventListener('mousedown', triggerAction);
    };

    bindBtn('btn-attack-light', 'attackLight');
    bindBtn('btn-attack-heavy', 'attackHeavy');
    bindBtn('btn-dash', 'dash');
    bindBtn('btn-heal', 'heal');
  }

  /**
   * Atualiza as barras de vida, stamina e dados de HUD
   */
  public update(player: Player): void {
    // 1. Atualizar Barra de Vida
    const healthPercent = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
    this.healthBarFill.style.width = `${healthPercent}%`;
    this.healthText.innerText = `${Math.ceil(player.health)} / ${player.maxHealth}`;

    // 2. Atualizar Barra de Stamina
    const staminaPercent = Math.max(0, Math.min(100, (player.stamina / player.maxStamina) * 100));
    this.staminaBarFill.style.width = `${staminaPercent}%`;
    this.staminaText.innerText = `${Math.ceil(player.stamina)} / ${player.maxStamina}`;
    
    // Adicionar efeito visual de esgotado na barra de stamina
    if (player.stamina < 15) {
      this.staminaBarFill.classList.add('stamina-low');
    } else {
      this.staminaBarFill.classList.remove('stamina-low');
    }

    // 3. Atualizar Estado de Cooldown/Stamina nos Botões
    const dashBtn = document.getElementById('btn-dash');
    if (dashBtn) {
      // Dash custa 28 de stamina
      if (player.isDashing || (player as any).dashCooldownTimer > 0 || player.stamina < 28) {
        dashBtn.classList.add('cooldown-inactive');
      } else {
        dashBtn.classList.remove('cooldown-inactive');
      }
    }

    const healBtn = document.getElementById('btn-heal');
    if (healBtn) {
      // Cura custa 14 de stamina e requer HP < Max
      if (player.health >= player.maxHealth || player.stamina < 14) {
        healBtn.classList.add('cooldown-inactive');
      } else {
        healBtn.classList.remove('cooldown-inactive');
      }
    }

    const heavyBtn = document.getElementById('btn-attack-heavy');
    if (heavyBtn) {
      // Ataque pesado custa 28 de stamina
      if (player.stamina < 28 || player.isAttacking) {
        heavyBtn.classList.add('cooldown-inactive');
      } else {
        heavyBtn.classList.remove('cooldown-inactive');
      }
    }

    const lightBtn = document.getElementById('btn-attack-light');
    if (lightBtn) {
      // Ataque leve custa 14 de stamina
      if (player.stamina < 14 || player.isAttacking) {
        lightBtn.classList.add('cooldown-inactive');
      } else {
        lightBtn.classList.remove('cooldown-inactive');
      }
    }
  }
}
