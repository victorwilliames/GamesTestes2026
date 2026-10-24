import * as THREE from 'three';
import { Game } from './Game';
import { Character } from './entities/Character';

export type LogType = 'COMBAT' | 'SKILL' | 'SYSTEM' | 'TEST_OK' | 'TEST_ERROR';

export class TestManager {
  public static instance: TestManager;
  
  public isSimulating: boolean = false;
  
  // Elementos do FPS (Log Superior Esquerdo)
  private fpsDisplay: HTMLDivElement | null = null;
  private fpsFrameCount: number = 0;
  private fpsLastTime: number = 0;
  private currentFps: number = 0;
  private minFps: number = 999;
  private maxFps: number = 0;
  private timeSinceStart: number = 0;
  
  // Elementos de Histórico de Logs (Painel Lateral)
  private logPanel: HTMLDivElement | null = null;
  private logList: HTMLDivElement | null = null;
  
  // Elementos do Botão Superior Direito e Modal Pop-up (Logs de Erros e Eventos)
  private logsButton: HTMLButtonElement | null = null;
  private modalOverlay: HTMLDivElement | null = null;
  private modalLogsList: HTMLDivElement | null = null;
  private errorCount: number = 0;
  
  // Frequência de asserções em segundos
  private assertInterval: number = 1.0;
  private lastAssertTime: number = 0;
  
  constructor() {
    TestManager.instance = this;
    this.fpsLastTime = performance.now();
    
    this.createUI();
    this.setupShortcut();
  }
  
  private createUI() {
    // 1. Painel de FPS (Canto Superior Esquerdo)
    this.fpsDisplay = document.createElement('div');
    this.fpsDisplay.id = 'fps-display';
    this.fpsDisplay.style.position = 'absolute';
    this.fpsDisplay.style.top = '12px';
    this.fpsDisplay.style.left = '12px';
    this.fpsDisplay.style.padding = '6px 12px';
    this.fpsDisplay.style.background = 'rgba(6, 12, 19, 0.85)';
    this.fpsDisplay.style.backdropFilter = 'blur(10px)';
    this.fpsDisplay.style.border = '1px solid rgba(194, 157, 83, 0.4)';
    this.fpsDisplay.style.borderRadius = '6px';
    this.fpsDisplay.style.color = '#ffd88a';
    this.fpsDisplay.style.fontFamily = 'monospace';
    this.fpsDisplay.style.fontSize = '11px';
    this.fpsDisplay.style.fontWeight = 'bold';
    this.fpsDisplay.style.zIndex = '1000';
    this.fpsDisplay.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    this.fpsDisplay.innerText = 'FPS: -- | Min: -- | Max: --';
    document.body.appendChild(this.fpsDisplay);
    
    // 3. Botão do Log Completo (Canto Superior Direito)
    this.logsButton = document.createElement('button');
    this.logsButton.id = 'logs-popup-btn';
    this.logsButton.className = 'premium-button';
    this.logsButton.style.position = 'absolute';
    this.logsButton.style.top = '12px';
    this.logsButton.style.right = '12px';
    this.logsButton.style.zIndex = '1000';
    this.logsButton.style.fontSize = '12px';
    this.logsButton.style.padding = '8px 16px';
    this.logsButton.style.letterSpacing = '1px';
    this.logsButton.innerText = '📋 Logs do Jogo';
    this.logsButton.addEventListener('click', () => this.openLogsModal());
    document.body.appendChild(this.logsButton);
    
    // 4. Painel de Logs Lateral Esquerdo (Histórico compacto)
    this.logPanel = document.createElement('div');
    this.logPanel.id = 'test-log-panel';
    this.logPanel.style.position = 'absolute';
    this.logPanel.style.top = '48px';
    this.logPanel.style.left = '12px';
    this.logPanel.style.width = '280px';
    this.logPanel.style.maxHeight = '240px';
    this.logPanel.style.background = 'rgba(6, 12, 19, 0.7)';
    this.logPanel.style.backdropFilter = 'blur(8px)';
    this.logPanel.style.border = '1px solid rgba(194, 157, 83, 0.3)';
    this.logPanel.style.borderRadius = '8px';
    this.logPanel.style.padding = '8px 12px';
    this.logPanel.style.zIndex = '999';
    this.logPanel.style.display = 'flex';
    this.logPanel.style.flexDirection = 'column';
    this.logPanel.style.gap = '6px';
    this.logPanel.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)';
    
    const title = document.createElement('div');
    title.innerText = 'EVENTOS DO SISTEMA';
    title.style.fontSize = '10px';
    title.style.fontWeight = '700';
    title.style.color = '#c29d53';
    title.style.letterSpacing = '1px';
    title.style.borderBottom = '1px solid rgba(194, 157, 83, 0.15)';
    title.style.paddingBottom = '2px';
    this.logPanel.appendChild(title);
    
    this.logList = document.createElement('div');
    this.logList.id = 'test-log-list';
    this.logList.style.overflowY = 'auto';
    this.logList.style.flexGrow = '1';
    this.logList.style.display = 'flex';
    this.logList.style.flexDirection = 'column';
    this.logList.style.gap = '3px';
    this.logList.style.fontSize = '9px';
    this.logList.style.fontFamily = 'monospace';
    this.logList.style.maxHeight = '180px';
    this.logPanel.appendChild(this.logList);
    document.body.appendChild(this.logPanel);
    
    // 5. Pop-up Modal Central (Logs Completos / Erros)
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.id = 'logs-modal-overlay';
    this.modalOverlay.style.position = 'absolute';
    this.modalOverlay.style.top = '0';
    this.modalOverlay.style.left = '0';
    this.modalOverlay.style.width = '100%';
    this.modalOverlay.style.height = '100%';
    this.modalOverlay.style.background = 'rgba(3, 5, 8, 0.8)';
    this.modalOverlay.style.backdropFilter = 'blur(12px)';
    this.modalOverlay.style.zIndex = '3000';
    this.modalOverlay.style.display = 'none'; // oculto por padrão
    this.modalOverlay.style.alignItems = 'center';
    this.modalOverlay.style.justifyContent = 'center';
    
    const modalContainer = document.createElement('div');
    modalContainer.style.background = 'rgba(6, 12, 19, 0.95)';
    modalContainer.style.border = '2px solid #c29d53';
    modalContainer.style.borderRadius = '12px';
    modalContainer.style.width = '600px';
    modalContainer.style.height = '480px';
    modalContainer.style.padding = '20px';
    modalContainer.style.display = 'flex';
    modalContainer.style.flexDirection = 'column';
    modalContainer.style.gap = '14px';
    modalContainer.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.9)';
    
    const modalHeader = document.createElement('div');
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.borderBottom = '1px solid rgba(194, 157, 83, 0.3)';
    modalHeader.style.paddingBottom = '8px';
    
    const modalTitle = document.createElement('h3');
    modalTitle.innerText = 'HISTÓRICO COMPLETO DA PARTIDA';
    modalTitle.style.color = '#c29d53';
    modalTitle.style.fontSize = '14px';
    modalTitle.style.letterSpacing = '1px';
    modalHeader.appendChild(modalTitle);
    
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#a0aab5';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', () => this.closeLogsModal());
    modalHeader.appendChild(closeBtn);
    modalContainer.appendChild(modalHeader);
    
    this.modalLogsList = document.createElement('div');
    this.modalLogsList.id = 'modal-logs-list';
    this.modalLogsList.style.flexGrow = '1';
    this.modalLogsList.style.overflowY = 'auto';
    this.modalLogsList.style.display = 'flex';
    this.modalLogsList.style.flexDirection = 'column';
    this.modalLogsList.style.gap = '6px';
    this.modalLogsList.style.fontSize = '11px';
    this.modalLogsList.style.fontFamily = 'monospace';
    this.modalLogsList.style.background = 'rgba(0, 0, 0, 0.4)';
    this.modalLogsList.style.padding = '12px';
    this.modalLogsList.style.borderRadius = '6px';
    this.modalLogsList.style.border = '1px solid rgba(194, 157, 83, 0.1)';
    modalContainer.appendChild(this.modalLogsList);
    
    const modalFooter = document.createElement('div');
    modalFooter.style.display = 'flex';
    modalFooter.style.justifyContent = 'flex-end';
    
    const okBtn = document.createElement('button');
    okBtn.className = 'premium-button';
    okBtn.innerText = 'Fechar';
    okBtn.style.fontSize = '12px';
    okBtn.style.padding = '6px 20px';
    okBtn.addEventListener('click', () => this.closeLogsModal());
    modalFooter.appendChild(okBtn);
    modalContainer.appendChild(modalFooter);
    
    this.modalOverlay.appendChild(modalContainer);
    document.body.appendChild(this.modalOverlay);
    
    this.log('SYSTEM', 'Módulo de testes e FPS monitor inicializado.');
  }
  
  private setupShortcut() {
    window.addEventListener('keydown', (e) => {
      if (e.key.toUpperCase() === 'T') {
        this.toggleSimulation();
      }
    });
  }
  
  public toggleSimulation() {
    this.isSimulating = !this.isSimulating;
    
    // Sincroniza com a caixa de seleção do Menu ESC se estiver visível/iniciado
    const simToggle = document.getElementById('simulation-toggle') as HTMLInputElement;
    if (simToggle) {
      simToggle.checked = this.isSimulating;
    }
    
    this.log('SYSTEM', this.isSimulating ? 'Auto-Play ATIVADO. Caitlyn está sendo controlada pela IA de Teste.' : 'Auto-Play DESATIVADO. Controle Caitlyn manualmente.');
    
    if (Game.instance && Game.instance.player) {
      Game.instance.player.target = null;
      Game.instance.player.moveTarget = null;
      Game.instance.player.playAnimation('idle');
    }
  }
  
  public openLogsModal() {
    if (this.modalOverlay) {
      this.modalOverlay.style.display = 'flex';
    }
  }
  
  public closeLogsModal() {
    if (this.modalOverlay) {
      this.modalOverlay.style.display = 'none';
    }
  }
  
  public log(type: LogType, message: string) {
    const time = new Date().toLocaleTimeString();
    const formattedMsg = `[${time}] [${type}] ${message}`;
    
    console.log(formattedMsg);
    
    if (type === 'TEST_ERROR') {
      this.errorCount++;
      if (this.logsButton) {
        this.logsButton.innerText = `⚠️ ${this.errorCount} ERRO(S)`;
        this.logsButton.style.background = 'linear-gradient(135deg, #cc2929 0%, #ff3b30 100%)';
        this.logsButton.style.borderColor = '#ff6b6b';
        // efeito pulsar
        this.logsButton.style.animation = 'spin 1s linear infinite'; // ou piscar
      }
    }
    
    // 1. Adiciona no Painel Compacto da Esquerda
    if (this.logList) {
      const line = document.createElement('div');
      line.innerText = `[${type}] ${message}`;
      this.styleLogElement(line, type);
      this.logList.appendChild(line);
      this.logList.scrollTop = this.logList.scrollHeight;
      
      if (this.logList.children.length > 40) {
        this.logList.removeChild(this.logList.firstChild!);
      }
    }
    
    // 2. Adiciona no Modal Completo do Centro
    if (this.modalLogsList) {
      const line = document.createElement('div');
      line.innerText = `[${time}] [${type}] ${message}`;
      this.styleLogElement(line, type);
      this.modalLogsList.appendChild(line);
      this.modalLogsList.scrollTop = this.modalLogsList.scrollHeight;
    }
  }
  
  private styleLogElement(el: HTMLDivElement, type: LogType) {
    switch (type) {
      case 'COMBAT':
        el.style.color = '#ff6b6b';
        break;
      case 'SKILL':
        el.style.color = '#ffca28';
        break;
      case 'TEST_OK':
        el.style.color = '#28cd41';
        break;
      case 'TEST_ERROR':
        el.style.color = '#ff3b30';
        el.style.fontWeight = 'bold';
        break;
      case 'SYSTEM':
      default:
        el.style.color = '#a0aab5';
        break;
    }
  }
  
  // Atualiza FPS e simulação
  public update(deltaTime: number) {
    if (!Game.instance) return;
    
    const now = performance.now();
    this.timeSinceStart += deltaTime;
    
    // 1. Cálculo de FPS
    this.fpsFrameCount++;
    if (now - this.fpsLastTime >= 1000) {
      this.currentFps = Math.round((this.fpsFrameCount * 1000) / (now - this.fpsLastTime));
      this.fpsFrameCount = 0;
      this.fpsLastTime = now;
      
      // Evita spikes do loading inicial
      if (this.timeSinceStart > 3.0) {
        if (this.currentFps < this.minFps && this.currentFps > 2) this.minFps = this.currentFps;
        if (this.currentFps > this.maxFps) this.maxFps = this.currentFps;
      }
      
      this.updateFpsDisplay();
    }
    
    // 2. Auto-Play da Caitlyn se ativo
    if (this.isSimulating && Game.instance.player && Game.instance.player.state !== 'DEAD') {
      this.updatePlayerAI();
    }
    
    // 3. Checagem periódica de asserções
    const secNow = now / 1000;
    if (secNow - this.lastAssertTime >= this.assertInterval) {
      this.lastAssertTime = secNow;
      this.runAssertions();
    }
  }
  
  private updateFpsDisplay() {
    if (this.fpsDisplay) {
      const minText = this.minFps === 999 ? '--' : this.minFps.toString();
      const maxText = this.maxFps === 0 ? '--' : this.maxFps.toString();
      this.fpsDisplay.innerText = `FPS: ${this.currentFps} | Min: ${minText} | Max: ${maxText}`;
    }
  }
  
  private updatePlayerAI() {
    const player = Game.instance.player;
    const enemy = Game.instance.enemy;
    const activeEntities = Game.instance.entities;
    
    if (player.state === 'CASTING') return;
    
    // Se o Master Yi estiver ativo e vivo
    if (enemy && enemy.state !== 'DEAD' && enemy.active) {
      const dist = player.position.distanceTo(enemy.position);
      
      if (dist <= player.attackRange) {
        player.target = enemy;
        player.moveTarget = null;
        
        // Atira R
        if (enemy.hp < enemy.maxHp * 0.45 && player.cooldowns.R.current === 0 && player.mana >= 100 && dist <= 25.0) {
          player.castR(enemy);
          this.log('SKILL', 'Auto-Play: Caitlyn conjurou R no Master Yi!');
          return;
        }
        
        // Atira E
        if (dist < 4.0 && player.cooldowns.E.current === 0 && player.mana >= 75) {
          player.castE(enemy.position, (p) => Game.instance.spawnProjectile(p));
          this.log('SKILL', 'Auto-Play: Caitlyn conjurou E para se afastar do Master Yi!');
          return;
        }
        
        // Atira Q
        if (player.cooldowns.Q.current === 0 && player.mana >= 60 && dist <= 12.0) {
          player.castQ(enemy.position, (p) => Game.instance.spawnProjectile(p));
          this.log('SKILL', 'Auto-Play: Caitlyn conjurou Q na direção do Master Yi!');
          return;
        }
        
        // Atira W
        if (player.cooldowns.W.current === 0 && player.mana >= 30 && dist <= 8.0) {
          player.castW(enemy.position);
          this.log('SKILL', 'Auto-Play: Caitlyn armou trap W sob o Master Yi!');
          return;
        }
        
        player.autoAttack(enemy, (p) => Game.instance.spawnProjectile(p));
      } else {
        player.target = enemy;
        player.moveTarget = enemy.position.clone();
      }
      return;
    }
    
    // Limpa minions
    let closestMinion: Character | null = null;
    let minDist = Infinity;
    
    for (const entity of activeEntities) {
      if (entity.team === 2 && entity.name.includes('Minion') && entity.state !== 'DEAD') {
        const dist = player.position.distanceTo(entity.position);
        if (dist < minDist) {
          minDist = dist;
          closestMinion = entity;
        }
      }
    }
    
    if (closestMinion) {
      player.target = closestMinion;
      if (minDist <= player.attackRange) {
        player.autoAttack(closestMinion, (p) => Game.instance.spawnProjectile(p));
      } else {
        player.moveTarget = closestMinion.position.clone();
      }
      return;
    }
    
    // Avança pela rota
    const pushTarget = new THREE.Vector3(16.5, 0, 16.5);
    const distToTarget = player.position.distanceTo(pushTarget);
    if (distToTarget > 2.0) {
      player.target = null;
      player.moveTarget = pushTarget;
    } else {
      player.target = null;
      player.moveTarget = null;
      if (player.state === 'MOVING') {
        player.state = 'IDLE';
        player.playAnimation('idle');
      }
    }
  }
  
  private runAssertions() {
    const game = Game.instance;
    if (!game) return;
    
    let assertionsPassed = true;
    
    // HP Check
    game.entities.forEach((entity) => {
      if (entity.state !== 'DEAD') {
        if (entity.hp < 0) {
          this.log('TEST_ERROR', `Asserção falhou: ${entity.name} tem HP inválido (${entity.hp})!`);
          assertionsPassed = false;
        }
        if (entity.hp > entity.maxHp) {
          this.log('TEST_ERROR', `Asserção falhou: ${entity.name} tem HP superior ao limite (${entity.hp}/${entity.maxHp})!`);
          assertionsPassed = false;
        }
      }
    });
    
    // Cooldown check
    if (game.player) {
      const keys: Array<'Q' | 'W' | 'E' | 'R'> = ['Q', 'W', 'E', 'R'];
      keys.forEach((key) => {
        const cd = game.player.cooldowns[key].current;
        const maxCd = game.player.cooldowns[key].max;
        if (cd < 0 || cd > maxCd) {
          this.log('TEST_ERROR', `Asserção falhou: Caitlyn Habilidade ${key} tem cooldown inválido (${cd})!`);
          assertionsPassed = false;
        }
      });
    }
    
    // Mesh Cleanup check
    let foundDeadMesh = false;
    game.entities.forEach((entity) => {
      if (entity.state === 'DEAD' && entity.mesh) {
        if (game.scene.children.includes(entity.mesh)) {
          foundDeadMesh = true;
        }
      }
    });
    
    if (foundDeadMesh) {
      this.log('TEST_ERROR', 'Asserção falhou: Gráficos de entidade morta ainda estão na cena 3D!');
      assertionsPassed = false;
    }
    
    if (assertionsPassed) {
      this.log('TEST_OK', `Validação OK. Sistema íntegro. Entidades ativas: ${game.entities.length}.`);
    }
  }

  // Envia todo o histórico de logs em memória para salvar em arquivo .txt
  public async saveLogsToFile() {
    if (!this.modalLogsList) return;
    const logs: string[] = [];
    this.modalLogsList.querySelectorAll('div').forEach((el) => {
      logs.push(el.innerText);
    });
    
    if (logs.length === 0) return;
    
    this.log('SYSTEM', 'Salvando logs da partida em arquivo de texto...');
    
    try {
      const response = await fetch('/api/save-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs })
      });
      
      const result = await response.text();
      // Mostra apenas no console para não floodar os logs recursivamente
      console.log('[SYSTEM] ' + result);
    } catch (err) {
      console.error('[SYSTEM] Erro ao salvar logs física: ' + err);
    }
  }
}
