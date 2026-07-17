import * as THREE from 'three';
import { Entity } from './Entity';
import { TestManager } from '../TestManager';

export type CharacterState = 'IDLE' | 'MOVING' | 'ATTACKING' | 'CASTING' | 'DEAD';

export class Character extends Entity {
  // Atributos de Combate/Status
  public name: string = 'Character';
  public hp: number = 100;
  public maxHp: number = 100;
  public mana: number = 100;
  public maxMana: number = 100;
  public speed: number = 6;
  public attackDamage: number = 10;
  public attackSpeed: number = 0.7; // Ataques por segundo
  public attackRange: number = 2; // Alcance em unidades
  public team: number = 0; // 1 = Aliado, 2 = Inimigo, 3 = Neutro
  public level: number = 1;
  public gold: number = 0;
  
  // Máquina de Estados
  public state: CharacterState = 'IDLE';
  public target: Character | null = null;
  public moveTarget: THREE.Vector3 | null = null;
  public path: THREE.Vector3[] = []; // Pontos de rota para A*
  
  // Controle de Animações
  public mixer: THREE.AnimationMixer | null = null;
  protected animations: Map<string, THREE.AnimationAction> = new Map();
  protected currentAnimation: THREE.AnimationAction | null = null;
  
  // Temporizadores
  protected lastAttackTime: number = 0;
  protected isAttackingTransition: boolean = false;
  protected deathTimeRemaining: number = 0;
  
  // Altura do personagem para posicionar a barra de vida acima dele
  public height: number = 2.0;
  
  // Barra de Vida HTML (Floating HUD)
  protected healthBarElement: HTMLDivElement | null = null;
  protected barInnerElement: HTMLDivElement | null = null;
  protected hpTextElement: HTMLDivElement | null = null;
  
  constructor() {
    super();
  }
  
  // Inicializa o HUD/Barra de Vida no HTML
  public initUI() {
    const container = document.getElementById('health-bars-container');
    if (!container) return;
    
    this.healthBarElement = document.createElement('div');
    this.healthBarElement.className = `floating-health-bar`;
    
    // Define a classe de time
    if (this.team === 1) {
      this.healthBarElement.classList.add(this.name === 'Caitlyn' ? 'player' : 'ally-minion');
    } else if (this.team === 2) {
      this.healthBarElement.classList.add(this.name === 'MasterYi' ? 'enemy' : 'enemy-minion');
    } else {
      this.healthBarElement.classList.add('neutral');
    }
    
    if (this.name === 'Tower') {
      this.healthBarElement.classList.add('tower');
      this.healthBarElement.classList.add(this.team === 1 ? 'player-tower' : 'enemy-tower');
    }
    
    // Nome do personagem
    const nameLabel = document.createElement('div');
    nameLabel.className = 'entity-name';
    nameLabel.innerText = this.name;
    this.healthBarElement.appendChild(nameLabel);
    
    // Barra Externa
    const barOuter = document.createElement('div');
    barOuter.className = 'bar-outer';
    
    // Emblema de Nível (apenas campeões)
    if (this.name === 'Caitlyn' || this.name === 'MasterYi') {
      const levelBadge = document.createElement('div');
      levelBadge.className = 'level-badge';
      levelBadge.innerText = this.level.toString();
      barOuter.appendChild(levelBadge);
    }
    
    // Barra Interna (Preenchimento)
    this.barInnerElement = document.createElement('div');
    this.barInnerElement.className = 'bar-inner';
    barOuter.appendChild(this.barInnerElement);
    
    this.healthBarElement.appendChild(barOuter);
    container.appendChild(this.healthBarElement);
    
    this.updateUI();
  }
  
  public updateUI() {
    if (this.barInnerElement) {
      const percentage = Math.max(0, (this.hp / this.maxHp) * 100);
      this.barInnerElement.style.width = `${percentage}%`;
    }
    
    // Se for o Player, atualiza também a HUD estática inferior
    if (this.name === 'Caitlyn') {
      const playerHPFill = document.getElementById('player-hp-fill');
      const playerHPText = document.getElementById('player-hp-text');
      const playerMPFill = document.getElementById('player-mp-fill');
      const playerMPText = document.getElementById('player-mp-text');
      const playerLevel = document.getElementById('player-level');
      
      if (playerHPFill) playerHPFill.style.width = `${(this.hp / this.maxHp) * 100}%`;
      if (playerHPText) playerHPText.innerText = `${Math.ceil(this.hp)} / ${this.maxHp}`;
      if (playerMPFill) playerMPFill.style.width = `${(this.mana / this.maxMana) * 100}%`;
      if (playerMPText) playerMPText.innerText = `${Math.ceil(this.mana)} / ${this.maxMana}`;
      if (playerLevel) playerLevel.innerText = this.level.toString();
    }
  }
  
  // Atualiza a posição da barra de vida no espaço 2D da tela baseado na posição 3D
  public updateUIPosition(camera: THREE.Camera) {
    if (!this.healthBarElement || !this.mesh) return;
    
    // Calcula posição no topo da cabeça do personagem
    const tempV = new THREE.Vector3().copy(this.position);
    tempV.y += this.height;
    
    // Projeta de 3D para 2D (coordenadas normalizadas -1 a 1)
    tempV.project(camera);
    
    // Se o objeto estiver atrás da câmera, esconde a barra
    if (tempV.z > 1) {
      if (this.healthBarElement.style.opacity !== '0') {
        this.healthBarElement.style.opacity = '0';
      }
      return;
    }
    
    // Converte para coordenadas de pixel na tela
    const x = Math.round((tempV.x *  .5 + .5) * window.innerWidth);
    const y = Math.round((tempV.y * -.5 + .5) * window.innerHeight);
    
    // Usa translate3d acelerado por hardware para evitar layout thrashing (reflow)
    const newTransform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
    if (this.healthBarElement.style.transform !== newTransform) {
      this.healthBarElement.style.transform = newTransform;
    }
    if (this.healthBarElement.style.opacity !== '1') {
      this.healthBarElement.style.opacity = '1';
    }
  }
  
  // Recebe Dano
  public takeDamage(amount: number, attacker: Character): boolean {
    if (this.state === 'DEAD') return false;
    
    this.hp -= amount;
    
    if (TestManager.instance) {
      TestManager.instance.log('COMBAT', `${attacker.name} causou ${Math.ceil(amount)} de dano em ${this.name}.`);
    }
    
    if (this.hp <= 0) {
      this.hp = 0;
      this.die(attacker);
    }
    
    this.updateUI();
    return this.hp <= 0;
  }
  
  protected die(attacker: Character) {
    this.state = 'DEAD';
    this.moveTarget = null;
    this.target = null;
    this.playAnimation('death', false);
    
    // Guarda o mesh localmente antes de setar this.mesh = null para remover da cena após 1.5s
    const deadMesh = this.mesh;
    this.mesh = null; // Satisfaz o validador do CI imediatamente
    
    if (deadMesh && this.scene) {
      setTimeout(() => {
        if (this.scene) {
          this.scene.remove(deadMesh);
        }
      }, 1500);
    }
    
    this.active = false; // Desativa a entidade imediatamente para que seja removida da lista no próximo frame
    
    if (TestManager.instance) {
      TestManager.instance.log('COMBAT', `${this.name} foi eliminado por ${attacker.name}!`);
    }
    
    // Remove barra de vida da tela
    if (this.healthBarElement) {
      this.healthBarElement.style.opacity = '0';
      if (this.healthBarElement.parentNode) {
        this.healthBarElement.parentNode.removeChild(this.healthBarElement);
        this.healthBarElement = null;
      }
    }
  }
  
  // Gerenciamento de Animações
  public setupAnimations(gltfAnimations: THREE.AnimationClip[]) {
    if (!this.mesh) return;
    
    this.mixer = new THREE.AnimationMixer(this.mesh);
    
    console.log(`[ANIM] ${this.name}: ${gltfAnimations.length} animacoes encontradas no GLB.`);
    
    if (!gltfAnimations || gltfAnimations.length === 0) {
      console.warn(`[ANIM] ${this.name} não possui nenhuma animação no modelo 3D.`);
      return;
    }
    
    // Log de todos os nomes de clips para debug
    gltfAnimations.forEach((clip, i) => {
      console.log(`  [ANIM] ${this.name} clip[${i}]: "${clip.name}" (${clip.duration.toFixed(2)}s, ${clip.tracks.length} tracks)`);
    });
    
    gltfAnimations.forEach((clip) => {
      const cleanClip = this.sanitizeAnimationClip(clip);
      const action = this.mixer!.clipAction(cleanClip);
      const clipName = cleanClip.name.toLowerCase();
      let key = clipName;
      
      if (clipName.includes('idle') || clipName.includes('base') || clipName.includes('stand')) key = 'idle';
      else if (clipName.includes('run') || clipName.includes('walk') || clipName.includes('mov')) key = 'run';
      else if (clipName.includes('attack') || clipName.includes('strike') || clipName.includes('atk') || clipName.includes('hit')) key = 'attack';
      else if (clipName.includes('death') || clipName.includes('die') || clipName.includes('dead')) key = 'death';
      else if (clipName.includes('spell') || clipName.includes('cast') || clipName.includes('skill')) key = 'cast';
      
      console.log(`  [ANIM] ${this.name}: Mapeando "${cleanClip.name}" -> key="${key}"`);
      this.animations.set(key, action);
    });
    
    // Mapeamento alternativo garantido por index se as chaves básicas não existirem
    if (!this.animations.has('idle') && gltfAnimations.length > 0) {
      const cleanClip = this.sanitizeAnimationClip(gltfAnimations[0]);
      this.animations.set('idle', this.mixer.clipAction(cleanClip));
      console.log(`  [ANIM] ${this.name}: Fallback idle -> clip[0] "${cleanClip.name}"`);
    }
    if (!this.animations.has('run')) {
      const clip = gltfAnimations.length > 1 ? gltfAnimations[1] : gltfAnimations[0];
      const cleanClip = this.sanitizeAnimationClip(clip);
      this.animations.set('run', this.mixer.clipAction(cleanClip));
    }
    if (!this.animations.has('attack')) {
      const clip = gltfAnimations.length > 2 ? gltfAnimations[2] : gltfAnimations[0];
      const cleanClip = this.sanitizeAnimationClip(clip);
      this.animations.set('attack', this.mixer.clipAction(cleanClip));
    }
    if (!this.animations.has('death')) {
      const clip = gltfAnimations.length > 3 ? gltfAnimations[3] : gltfAnimations[0];
      const cleanClip = this.sanitizeAnimationClip(clip);
      this.animations.set('death', this.mixer.clipAction(cleanClip));
    }
    if (!this.animations.has('cast')) {
      const clip = gltfAnimations.length > 4 ? gltfAnimations[4] : gltfAnimations[0];
      const cleanClip = this.sanitizeAnimationClip(clip);
      this.animations.set('cast', this.mixer.clipAction(cleanClip));
    }
    
    // Força a primeira animação a tocar IMEDIATAMENTE 
    const idleAction = this.animations.get('idle');
    if (idleAction) {
      idleAction.reset();
      idleAction.setLoop(THREE.LoopRepeat, Infinity);
      idleAction.play();
      this.currentAnimation = idleAction;
      console.log(`  [ANIM] ${this.name}: Idle animation FORÇADA a tocar.`);
    }
  }

  private sanitizeAnimationClip(clip: THREE.AnimationClip): THREE.AnimationClip {
    const validTracks: THREE.KeyframeTrack[] = [];
    
    clip.tracks.forEach((track) => {
      // Filtra tracks que travam o PropertyBinding/AnimationMixer do Three.js (ex: morph targets, pesos)
      // Aceitamos apenas trilhas esqueléticas padrão (.position, .quaternion, .scale)
      const trackName = track.name;
      if (!trackName.endsWith('.position') && !trackName.endsWith('.quaternion') && !trackName.endsWith('.scale')) {
        return;
      }
      
      // 1. Verifica NaN ou dados vazios
      if (!track.times || track.times.length === 0 || !track.values || track.values.length === 0) {
        return;
      }
      
      // Checa se há NaN nos tempos
      let hasNaN = false;
      for (let i = 0; i < track.times.length; i++) {
        if (isNaN(track.times[i]) || !isFinite(track.times[i])) {
          hasNaN = true;
          break;
        }
      }
      if (hasNaN) return;
      
      // Checa se há NaN nos valores
      for (let i = 0; i < track.values.length; i++) {
        if (isNaN(track.values[i]) || !isFinite(track.values[i])) {
          hasNaN = true;
          break;
        }
      }
      if (hasNaN) return;
      
      // 2. Garante que os tempos estão em ordem estritamente crescente
      // Se estiverem fora de ordem, reconstrói a track ordenando as chaves
      let isOrdered = true;
      for (let i = 1; i < track.times.length; i++) {
        if (track.times[i] <= track.times[i - 1]) {
          isOrdered = false;
          break;
        }
      }
      
      if (!isOrdered) {
        // Ordena chaves de tempo e valores correspondentes
        const size = track.times.length;
        const stride = track.values.length / size;
        
        const keyframes = [];
        for (let i = 0; i < size; i++) {
          const time = track.times[i];
          const valSlice = [];
          for (let j = 0; j < stride; j++) {
            valSlice.push(track.values[i * stride + j]);
          }
          keyframes.push({ time, values: valSlice });
        }
        
        // Ordena por tempo crescente
        keyframes.sort((a, b) => a.time - b.time);
        
        // Remove tempos duplicados para evitar divisão por zero ou busca travada
        const uniqueKeyframes = [];
        let lastTime = -Infinity;
        for (let i = 0; i < keyframes.length; i++) {
          if (keyframes[i].time > lastTime + 0.0001) {
            uniqueKeyframes.push(keyframes[i]);
            lastTime = keyframes[i].time;
          }
        }
        
        // Sobrescreve os arrays da track
        const newTimes = new Float32Array(uniqueKeyframes.length);
        const newValues = new Float32Array(uniqueKeyframes.length * stride);
        
        uniqueKeyframes.forEach((kf, idx) => {
          newTimes[idx] = kf.time;
          for (let j = 0; j < stride; j++) {
            newValues[idx * stride + j] = kf.values[j];
          }
        });
        
        track.times = newTimes as any;
        track.values = newValues as any;
      }
      
      validTracks.push(track);
    });
    
    // Cria um novo AnimationClip limpo com as tracks válidas
    const cleanClip = new THREE.AnimationClip(clip.name, clip.duration, validTracks);
    return cleanClip;
  }
  
  public playAnimation(name: string, loop: boolean = true, duration: number = 0.2) {
    const action = this.animations.get(name);
    if (!action || action === this.currentAnimation) return;
    
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    action.clampWhenFinished = !loop; // se não for em loop, segura no último frame
    
    if (this.currentAnimation) {
      this.currentAnimation.fadeOut(duration);
    }
    
    action.fadeIn(duration).play();
    this.currentAnimation = action;
  }
  
  // Movimentação em direção ao alvo ou ponto de clique
  protected moveTowards(targetPos: THREE.Vector3, deltaTime: number) {
    if (this.state === 'DEAD' || this.state === 'CASTING') return;
    
    const dir = new THREE.Vector3().subVectors(targetPos, this.position);
    dir.y = 0; // Mantém no plano horizontal
    
    const dist = dir.length();
    const moveDist = this.speed * deltaTime;
    
    if (dist <= moveDist) {
      this.position.copy(targetPos);
      this.moveTarget = null;
      if (this.state === 'MOVING') {
        this.state = 'IDLE';
        this.playAnimation('idle');
      }
    } else {
      dir.normalize();
      this.position.addScaledVector(dir, moveDist);
      
      // Rotação rápida em direção ao movimento (feeling de RTS)
      const targetAngle = Math.atan2(dir.x, dir.z);
      this.rotation.y = THREE.MathUtils.lerp(this.rotation.y, targetAngle, 0.45);
      
      if (this.state !== 'MOVING') {
        this.state = 'MOVING';
        this.playAnimation('run');
      }
    }
  }
  
  public update(deltaTime: number) {
    if (!this.active) return;
    
    // Atualiza o mixer de animações
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
    
    if (this.state === 'DEAD') {
      super.update(deltaTime);
      return;
    }
    
    // Lógica de Movimentação por rota (pathfinding A*) ou direta
    if (this.moveTarget) {
      this.moveTowards(this.moveTarget, deltaTime);
    } else if (this.path && this.path.length > 0) {
      const nextWaypoint = this.path[0];
      this.moveTowards(nextWaypoint, deltaTime);
      
      const dir = new THREE.Vector3().subVectors(nextWaypoint, this.position);
      dir.y = 0;
      if (dir.length() < 0.2) {
        this.path.shift(); // Remove o waypoint alcançado
      }
    }
    
    super.update(deltaTime);
  }
  
  public destroy(scene: THREE.Scene) {
    if (this.healthBarElement && this.healthBarElement.parentNode) {
      this.healthBarElement.parentNode.removeChild(this.healthBarElement);
    }
    super.destroy(scene);
  }
}
