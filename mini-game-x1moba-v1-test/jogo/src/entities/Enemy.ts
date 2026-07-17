import * as THREE from 'three';
import { Character } from './Character';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Game } from '../Game';

export class Enemy extends Character {
  // Cooldowns de Habilidade (Master Yi)
  private cooldowns = {
    Q: { max: 10, current: 0 },
    W: { max: 16, current: 0 },
    R: { max: 30, current: 0 }
  };
  
  // lastAttackTime is inherited from Character
  
  // Controle de Highlander (R)
  private rActiveTime: number = 0;
  private isHighlanderActive: boolean = false;
  private originalSpeed: number = 6.2;
  private originalAS: number = 0.75;
  
  // Controle de Meditate (W)
  private wHealTimeRemaining: number = 0;
  
  // Controle de Alpha Strike (Q)
  private isAlphaStriking: boolean = false;
  private alphaTarget: Character | null = null;
  private alphaTime: number = 0;
  
  constructor(private scene: THREE.Scene) {
    super();
    this.name = 'MasterYi';
    this.team = 2; // Inimigo
    
    // Atributos base Master Yi
    this.maxHp = 610;
    this.hp = 610;
    this.maxMana = 300;
    this.mana = 300;
    this.speed = this.originalSpeed;
    this.attackDamage = 65;
    this.attackSpeed = this.originalAS;
    this.attackRange = 1.8; // Melee
    this.height = 3.8;
  }
  
  public loadModel(): Promise<void> {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load(
        './Personagens Principais/master-yi/source/masteryi.glb',
        (gltf) => {
          this.mesh = gltf.scene;
          
          // Ajusta a escala do modelo do Master Yi (meio termo ideal para visibilidade LoL)
          this.mesh.scale.set(0.055, 0.055, 0.055);
          this.mesh.position.copy(this.position);
          
          this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              if (child.material) {
                child.material.roughness = 0.7;
              }
            }
          });
          
          this.scene.add(this.mesh);
          
          // Associa referência para cliques
          this.mesh.userData = { entity: this };
          
          this.setupAnimations(gltf.animations);
          this.initUI();
          resolve();
        },
        undefined,
        (err) => {
          console.error('Erro ao carregar masteryi.glb, usando fallback:', err);
          this.createFallbackMesh();
          this.initUI();
          resolve();
        }
      );
    });
  }
  
  private createFallbackMesh() {
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.7, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff3b30, roughness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.85;
    mesh.castShadow = true;
    
    // Indicador frontal
    const frontGeo = new THREE.BoxGeometry(0.2, 0.2, 0.4);
    const frontMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const front = new THREE.Mesh(frontGeo, frontMat);
    front.position.set(0, 0.5, 0.4);
    mesh.add(front);
    
    const group = new THREE.Group();
    group.add(mesh);
    this.mesh = group;
    this.scene.add(this.mesh);
    this.mesh.userData = { entity: this };
  }
  
  // Executa ataque básico corpo a corpo
  public autoAttack(player: Character) {
    if (this.state === 'DEAD' || this.state === 'CASTING' || this.isAlphaStriking) return;
    
    const now = performance.now();
    const attackInterval = 1000 / this.attackSpeed;
    
    if (now - this.lastAttackTime >= attackInterval) {
      this.lastAttackTime = now;
      this.state = 'ATTACKING';
      
      // Olha para o player
      const dir = new THREE.Vector3().subVectors(player.position, this.position);
      this.rotation.y = Math.atan2(dir.x, dir.z);
      
      this.playAnimation('attack', false, 0.1);
      
      setTimeout(() => {
        if (this.state === 'DEAD' || this.isAlphaStriking) return;
        
        // Verifica se ainda está no alcance antes de dar dano
        const dist = this.position.distanceTo(player.position);
        if (dist <= this.attackRange + 0.5 && player.state !== 'DEAD') {
          player.takeDamage(this.attackDamage, this);
        }
        
        setTimeout(() => {
          if (this.state === 'ATTACKING') {
            this.state = 'IDLE';
            this.playAnimation('idle');
          }
        }, 200);
      }, 150);
    }
  }
  
  // HABILIDADE Q: Alpha Strike
  private castQ(target: Character) {
    if (this.cooldowns.Q.current > 0 || this.state === 'DEAD' || this.mana < 70) return;
    
    this.mana -= 70;
    this.cooldowns.Q.current = this.cooldowns.Q.max;
    
    this.isAlphaStriking = true;
    this.alphaTarget = target;
    this.alphaTime = 0.4; // fica invisível por 0.4s
    this.state = 'CASTING';
    
    // Esconde o mesh para simular teletransporte
    if (this.mesh) this.mesh.visible = false;
    
    // Cria efeito visual de faísca amarela na Caitlyn
    this.createAlphaVFX(target.position);
  }
  
  private endAlphaStrike() {
    this.isAlphaStriking = false;
    this.state = 'IDLE';
    
    if (this.mesh) this.mesh.visible = true;
    
    if (this.alphaTarget && this.alphaTarget.state !== 'DEAD') {
      // Reaparece atrás da Caitlyn
      const dir = new THREE.Vector3(0, 0, -1).applyEuler(this.alphaTarget.rotation).normalize();
      this.position.copy(this.alphaTarget.position).addScaledVector(dir, 1.2);
      
      // Causa dano
      this.alphaTarget.takeDamage(110 + this.attackDamage * 0.5, this);
      
      // Força ataque imediato
      this.autoAttack(this.alphaTarget);
    }
    
    this.alphaTarget = null;
  }
  
  private createAlphaVFX(pos: THREE.Vector3) {
    const geo = new THREE.TorusGeometry(1, 0.1, 8, 24);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(pos);
    ring.position.y = 0.2;
    this.scene.add(ring);
    
    let scale = 1.0;
    const animate = () => {
      scale += 0.15;
      ring.scale.set(scale, scale, scale);
      ring.material.opacity -= 0.05;
      if (ring.material.opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(ring);
        geo.dispose();
        mat.dispose();
      }
    };
    requestAnimationFrame(animate);
  }
  
  // HABILIDADE W: Meditate
  private castW() {
    if (this.cooldowns.W.current > 0 || this.state === 'DEAD' || this.mana < 50) return;
    
    this.mana -= 50;
    this.cooldowns.W.current = this.cooldowns.W.max;
    
    this.state = 'CASTING';
    this.wHealTimeRemaining = 3.0; // canaliza por 3 segundos
    this.moveTarget = null;
    this.path = [];
    
    this.playAnimation('cast', true);
    
    // Cria aura verde brilhante ao redor
    this.createMeditateVFX();
  }
  
  private createMeditateVFX() {
    const geo = new THREE.RingGeometry(0.8, 1.0, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x39ff14, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1;
    this.mesh?.add(ring);
    
    const checkVFX = () => {
      if (this.state === 'CASTING' && this.wHealTimeRemaining > 0 && this.mesh) {
        ring.rotation.z += 0.05;
        requestAnimationFrame(checkVFX);
      } else {
        this.mesh?.remove(ring);
        geo.dispose();
        mat.dispose();
      }
    };
    requestAnimationFrame(checkVFX);
  }
  
  // HABILIDADE R: Highlander (Ult)
  private castR() {
    if (this.cooldowns.R.current > 0 || this.state === 'DEAD' || this.mana < 100) return;
    
    this.mana -= 100;
    this.cooldowns.R.current = this.cooldowns.R.max;
    
    this.isHighlanderActive = true;
    this.rActiveTime = 6.0; // dura 6s
    
    // Atribui bônus massivos
    this.speed = this.originalSpeed * 1.45;
    this.attackSpeed = this.originalAS * 1.5;
    
    // Cria efeito de rastro vermelho
    if (this.healthBarElement) {
      this.healthBarElement.style.filter = 'drop-shadow(0 0 8px #ff3b30)';
    }
  }
  
  private endHighlander() {
    this.isHighlanderActive = false;
    this.speed = this.originalSpeed;
    this.attackSpeed = this.originalAS;
    if (this.healthBarElement) {
      this.healthBarElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))';
    }
  }
  
  // Inteligência Artificial do Master Yi (1x1 e Rota)
  private updateAI(deltaTime: number, player: Character, activeEntities: Character[]) {
    if (this.state === 'DEAD' || this.state === 'CASTING' || this.isAlphaStriking) return;
    
    const distToPlayer = this.position.distanceTo(player.position);
    
    // 1. Se vida estiver perigosamente baixa (< 25%), usa Meditar (W) para curar
    if (this.hp < this.maxHp * 0.25 && this.cooldowns.W.current === 0 && this.mana >= 50) {
      this.castW();
      return;
    }
    
    // 2. Se o Player estiver vivo e dentro da área de visão (raio de 18 unidades)
    if (player.state !== 'DEAD' && distToPlayer <= 18.0) {
      // Se estiver no alcance de ataque, bate
      if (distToPlayer <= this.attackRange) {
        // Ativa Highlander (R) para lutar se estiver fora de cooldown
        if (this.cooldowns.R.current === 0 && this.mana >= 100) {
          this.castR();
        }
        this.autoAttack(player);
      } else {
        // Se estiver fora do alcance melee, tenta usar Alpha Strike (Q) para fechar gap
        if (distToPlayer <= 6.0 && this.cooldowns.Q.current === 0 && this.mana >= 70) {
          this.castQ(player);
        } else {
          // Caso contrário, corre atrás do jogador
          this.moveTarget = player.position.clone();
        }
      }
      return;
    }
    
    // 3. Se o Player estiver longe ou morto, procura minions inimigos no caminho
    let closestMinion: Character | null = null;
    let minMinionDist = Infinity;
    
    for (const entity of activeEntities) {
      if (entity.team === 1 && entity.state !== 'DEAD' && entity !== player && entity.name !== 'Tower') {
        const dist = this.position.distanceTo(entity.position);
        if (dist < 10 && dist < minMinionDist) {
          minMinionDist = dist;
          closestMinion = entity;
        }
      }
    }
    
    if (closestMinion) {
      if (minMinionDist <= this.attackRange) {
        this.autoAttack(closestMinion);
      } else {
        this.moveTarget = closestMinion.position.clone();
      }
      return;
    }
    
    // 4. Caso contrário, empurra a rota em direção à base aliada (ponto -16, -16)
    const baseTarget = new THREE.Vector3(-16.0, 0, -16.0);
    const distToBase = this.position.distanceTo(baseTarget);
    
    if (distToBase > 2.0) {
      this.moveTarget = baseTarget;
    } else {
      this.moveTarget = null;
      if (this.state === 'MOVING') {
        this.state = 'IDLE';
        this.playAnimation('idle');
      }
    }
  }
  
  public takeDamage(amount: number, attacker: Character): boolean {
    // Se estiver meditando (W), reduz o dano em 50%
    if (this.state === 'CASTING' && this.wHealTimeRemaining > 0) {
      amount *= 0.5;
    }
    return super.takeDamage(amount, attacker);
  }
  
  public update(deltaTime: number) {
    if (this.state === 'DEAD') {
      super.update(deltaTime);
      return;
    }
    
    // Regeneração de Mana passiva
    this.mana = Math.min(this.maxMana, this.mana + 3 * deltaTime);
    
    // Atualiza cooldowns
    if (this.cooldowns.Q.current > 0) this.cooldowns.Q.current = Math.max(0, this.cooldowns.Q.current - deltaTime);
    if (this.cooldowns.W.current > 0) this.cooldowns.W.current = Math.max(0, this.cooldowns.W.current - deltaTime);
    if (this.cooldowns.R.current > 0) this.cooldowns.R.current = Math.max(0, this.cooldowns.R.current - deltaTime);
    
    // Processa Highlander (R)
    if (this.isHighlanderActive) {
      this.rActiveTime -= deltaTime;
      if (this.rActiveTime <= 0) {
        this.endHighlander();
      }
    }
    
    // Processa Alpha Strike (Q)
    if (this.isAlphaStriking) {
      this.alphaTime -= deltaTime;
      if (this.alphaTime <= 0) {
        this.endAlphaStrike();
      }
      super.update(deltaTime);
      return; // impede qualquer outra ação
    }
    
    // Processa Meditate (W)
    if (this.state === 'CASTING' && this.wHealTimeRemaining > 0) {
      this.wHealTimeRemaining -= deltaTime;
      
      // Cura 60 de HP por segundo
      this.hp = Math.min(this.maxHp, this.hp + 60 * deltaTime);
      this.updateUI();
      
      if (this.wHealTimeRemaining <= 0) {
        this.state = 'IDLE';
        this.playAnimation('idle');
      }
      
      super.update(deltaTime);
      return; // impede movimento/ataques
    }
    
    // Roda a IA para tomar decisões
    this.updateAI(deltaTime, Game.instance.player, Game.instance.entities);
    
    super.update(deltaTime);
  }
}
