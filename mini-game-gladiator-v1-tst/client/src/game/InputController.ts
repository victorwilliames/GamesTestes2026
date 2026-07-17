import * as THREE from 'three';

export class InputController {
  private keys: { [key: string]: boolean } = {};
  private prevGamepadButtons: { [key: number]: boolean } = {};
  
  public moveDirection: THREE.Vector3 = new THREE.Vector3();
  
  // Joystick virtual / Gamepad values (-1 a 1)
  public joystickX: number = 0;
  public joystickY: number = 0;
  
  // Ações de gatilho único (resetam após serem consumidas)
  public actions = {
    dash: false,
    attackLight: false,
    attackHeavy: false,
    heal: false
  };

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.key.toLowerCase()] = true;
    
    // Mapeamento de botões de atalho teclado
    if (e.key === ' ' || e.code === 'Space') {
      this.actions.dash = true;
    }
    if (e.key.toLowerCase() === 'j') {
      this.actions.attackLight = true;
    }
    if (e.key.toLowerCase() === 'k') {
      this.actions.attackHeavy = true;
    }
    if (e.key.toLowerCase() === 'h') {
      this.actions.heal = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.key.toLowerCase()] = false;
  };

  public update(): void {
    // 1. Pegar direção do teclado
    let keyboardX = 0;
    let keyboardZ = 0;

    if (this.keys['w'] || this.keys['arrowup']) keyboardZ = -1;
    if (this.keys['s'] || this.keys['arrowdown']) keyboardZ = 1;
    if (this.keys['a'] || this.keys['arrowleft']) keyboardX = -1;
    if (this.keys['d'] || this.keys['arrowright']) keyboardX = 1;

    const keyboardDir = new THREE.Vector3(keyboardX, 0, keyboardZ);
    if (keyboardDir.lengthSq() > 0) {
      keyboardDir.normalize();
    }

    // 2. Mesclar com controles de Gamepad (se houver controle conectado)
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads.find(g => g !== null);
    
    if (gp) {
      // Analógico Esquerdo: eixo 0 (horizontal) e eixo 1 (vertical)
      const axisX = gp.axes[0];
      const axisY = gp.axes[1];
      
      // Aplicar deadzone de 0.18 para evitar drift analógico
      const deadzone = 0.18;
      let padX = 0;
      let padY = 0;
      if (Math.abs(axisX) > deadzone) padX = axisX;
      if (Math.abs(axisY) > deadzone) padY = -axisY; // Inverter Y (para cima ser positivo no joystick)

      // Atualizar o joystick se houver deslocamento no controle físico
      if (Math.abs(padX) > 0.05 || Math.abs(padY) > 0.05) {
        this.joystickX = padX;
        this.joystickY = padY;
      } else {
        // Se soltou o analógico do controle físico (e não estiver usando joystick virtual de toque), zerar
        // Mas atenção: se estiver usando o toque na tela, não queremos zerar.
        // Como o gamepad e o toque na tela compartilham joystickX/Y, damos preferência ao gamepad se ele estiver movendo.
        // Se o analógico físico estiver zerado, permitimos que o joystick de toque continue ditando os valores.
        // Para isso, só limpamos joystickX/Y se o drift anterior era do gamepad físico.
        const wasUsingGamepad = Object.keys(this.prevGamepadButtons).length > 0;
        if (wasUsingGamepad && Math.abs(this.joystickX) > 0.05) {
          // Se o analógico físico estiver no centro, zera
          this.joystickX = 0;
          this.joystickY = 0;
        }
      }

      // Mapeamento de Botões Físicos (Xbox standard layout):
      // Xbox A (Index 0) -> Dash / Esquiva
      // Xbox X (Index 2) -> Ataque Leve
      // Xbox Y (Index 3) -> Ataque Pesado
      // Xbox B (Index 1) -> Cura / Poção
      const checkButton = (btnIndex: number, actionKey: keyof typeof this.actions) => {
        const button = gp.buttons[btnIndex];
        if (button) {
          const isPressed = button.pressed;
          const prevPressed = this.prevGamepadButtons[btnIndex] || false;
          // Trigger de borda de subida (dispara apenas quando aperta o botão)
          if (isPressed && !prevPressed) {
            this.actions[actionKey] = true;
          }
          this.prevGamepadButtons[btnIndex] = isPressed;
        }
      };

      checkButton(0, 'dash');         // Botão A
      checkButton(2, 'attackLight');   // Botão X
      checkButton(3, 'attackHeavy');   // Botão Y
      checkButton(1, 'heal');          // Botão B
    }

    // 3. Mesclar com joystick virtual / analógico físico para aplicar movimento
    if (Math.abs(this.joystickX) > 0.05 || Math.abs(this.joystickY) > 0.05) {
      // Na tela: Y positivo é para cima. No 3D: Z negativo é para frente.
      this.moveDirection.set(this.joystickX, 0, -this.joystickY);
      
      // Limitar tamanho máximo a 1.0
      const len = this.moveDirection.length();
      if (len > 1) {
        this.moveDirection.divideScalar(len);
      }
    } else {
      this.moveDirection.copy(keyboardDir);
    }
  }

  /**
   * Simula a entrada de dados (usado pelo modo autoteste / simulador)
   */
  public simulateInput(moveDir: THREE.Vector3, simulatedActions: Partial<typeof this.actions>): void {
    this.moveDirection.copy(moveDir);
    Object.assign(this.actions, simulatedActions);
  }

  /**
   * Consome uma ação de gatilho (lê e reseta para falso para evitar ativações repetidas no mesmo frame)
   */
  public consumeAction(action: keyof typeof this.actions): boolean {
    const wasPressed = this.actions[action];
    this.actions[action] = false;
    return wasPressed;
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
