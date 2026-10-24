import * as THREE from 'three';
import { Player } from './Player';
import { TrainingDummy } from './TrainingDummy';
import { VFXManager } from './VFXManager';

export class CombatController {
  private player: Player;
  private dummy: TrainingDummy;
  private vfxManager: VFXManager;
  private camera: THREE.Camera;
  
  // Audios
  private audioListener: THREE.AudioListener;
  private sfxSlashLight: THREE.Audio;
  private sfxSlashHeavy: THREE.Audio;
  private sfxHitImpact: THREE.Audio;

  // Estado interno para evitar múltiplos hits no mesmo golpe
  private hasHitThisAttack: boolean = false;

  constructor(
    player: Player,
    dummy: TrainingDummy,
    vfxManager: VFXManager,
    camera: THREE.Camera,
    audioListener: THREE.AudioListener,
    audios: { slash_light: AudioBuffer; slash_heavy: AudioBuffer; hit_impact: AudioBuffer }
  ) {
    this.player = player;
    this.dummy = dummy;
    this.vfxManager = vfxManager;
    this.camera = camera;
    this.audioListener = audioListener;

    // Inicializar áudios
    this.sfxSlashLight = new THREE.Audio(this.audioListener);
    this.sfxSlashLight.setBuffer(audios.slash_light);
    this.sfxSlashLight.setVolume(0.5);

    this.sfxSlashHeavy = new THREE.Audio(this.audioListener);
    this.sfxSlashHeavy.setBuffer(audios.slash_heavy);
    this.sfxSlashHeavy.setVolume(0.7);

    this.sfxHitImpact = new THREE.Audio(this.audioListener);
    this.sfxHitImpact.setBuffer(audios.hit_impact);
    this.sfxHitImpact.setVolume(0.8);
  }

  public update(): void {
    if (!this.player.isAttacking) {
      this.hasHitThisAttack = false;
      return;
    }

    // Calcular em qual frame/fase do ataque estamos
    const timeElapsed = this.player.attackWindup + this.player.attackActive + this.player.attackRecovery - this.player.attackTimer;
    
    if (timeElapsed >= this.player.attackWindup && timeElapsed < this.player.attackWindup + this.player.attackActive) {
      // Fase ATIVA: checar impacto
      this.checkHitDetection();
    }
  }

  /**
   * Tenta iniciar um ataque do jogador
   */
  public executeAttack(type: 'light' | 'heavy'): void {
    const success = this.player.attack(type);
    if (success) {
      this.hasHitThisAttack = false;

      // Tocar som do vento do ataque
      if (type === 'light') {
        if (this.sfxSlashLight.isPlaying) this.sfxSlashLight.stop();
        this.sfxSlashLight.play();
      } else {
        if (this.sfxSlashHeavy.isPlaying) this.sfxSlashHeavy.stop();
        this.sfxSlashHeavy.play();
      }

      // Spawner do VFX de corte na frente do player
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);
      const spawnPos = this.player.mesh.position.clone().addScaledVector(forward, 1.2);
      this.vfxManager.spawnSlash(spawnPos, this.player.mesh.rotation.y, type === 'heavy');
    }
  }

  /**
   * Checa se o ataque do jogador colide com o boneco de treino (hitbox cônica/setor circular)
   */
  private checkHitDetection(): void {
    if (this.hasHitThisAttack) return; // Só registra um acerto por animação de ataque

    const playerPos = this.player.mesh.position;
    const dummyPos = this.dummy.getPosition();

    // 1. Verificar distância
    const dist = playerPos.distanceTo(dummyPos);
    const range = this.player.attackType === 'heavy' ? 2.5 : 1.8;

    if (dist <= range) {
      // 2. Verificar ângulo (ângulo cônico de ataque de 85 graus na frente do jogador)
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);
      const toDummy = new THREE.Vector3().subVectors(dummyPos, playerPos).normalize();
      
      const angle = forward.angleTo(toDummy);
      const maxAngle = (85 * Math.PI) / 180; // 85 graus em radianos

      if (angle <= maxAngle / 2) {
        // HIT CONFRIMADO!
        this.hasHitThisAttack = true;
        
        // Calcular dano
        const isHeavy = this.player.attackType === 'heavy';
        const damage = isHeavy ? 40 : 22; // Mapeado do game_balance_defaults.json

        // Tocar som de impacto
        if (this.sfxHitImpact.isPlaying) this.sfxHitImpact.stop();
        this.sfxHitImpact.play();

        // Aplicar física de balanço e dano no dummy
        const hitDirection = new THREE.Vector3().subVectors(dummyPos, playerPos).normalize();
        this.dummy.takeDamage(damage, hitDirection, isHeavy);

        // VFX Sparks e Sangue
        const impactPos = dummyPos.clone();
        impactPos.y += 1.0; // Ponto médio do dummy
        this.vfxManager.spawnHitSpark(impactPos);
        this.vfxManager.spawnBloodSplatter(dummyPos);

        // Mostrar número de dano flutuante
        this.spawnFloatingDamageNumber(damage, isHeavy);
      }
    }
  }

  /**
   * Projeta as coordenadas 3D para 2D e cria o número de dano flutuante em HTML
   */
  private spawnFloatingDamageNumber(damage: number, isHeavy: boolean): void {
    const dummyPos = this.dummy.getPosition();
    dummyPos.y += 1.8; // Mostrar acima do topo do dummy

    // Projetar 3D para o espaço de tela do navegador (-1 a 1)
    const projected = dummyPos.clone().project(this.camera);
    
    // Converter para pixels absolute
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(projected.y * 0.5) + 0.5) * window.innerHeight;

    // Criar elemento HTML para o número flutuante
    const container = document.getElementById('ui-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `damage-number ${isHeavy ? 'heavy' : 'light'}`;
    el.innerText = damage.toString();
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // Variação randômica para flutuar em direções levemente diferentes
    const xOffset = (Math.random() - 0.5) * 60;
    el.style.setProperty('--x-offset', `${xOffset}px`);

    container.appendChild(el);

    // Remover elemento após animação CSS de 0.8s
    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 800);
  }
}
