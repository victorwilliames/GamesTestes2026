import * as THREE from 'three';
import { Character } from './Character';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Projectile } from './Projectile';
import { Game } from '../Game';

export class Player extends Character {
  // Cooldowns das Habilidades (em segundos)
  public cooldowns = {
    Q: { max: 8, current: 0 },
    W: { max: 12, current: 0 },
    E: { max: 14, current: 0 },
    R: { max: 35, current: 0 }
  };
  
  // Mana custos
  private manaCosts = { Q: 60, W: 30, E: 75, R: 100 };
  
  // Controle de Recuo (Dash do E)
  private dashDirection: THREE.Vector3 | null = null;
  private dashTimeRemaining: number = 0;
  private dashSpeed: number = 24;
  
  // Canalização do R
  private rChannelTime: number = 0;
  private rTarget: Character | null = null;
  private rLaserLine: THREE.Line | null = null;
  
  // Lista de Armadilhas do W ativas no mapa
  private activeTraps: THREE.Mesh[] = [];
  
  constructor(private scene: THREE.Scene) {
    super();
    this.name = 'Caitlyn';
    this.team = 1; // Aliada / Jogador
    
    // Atributos base Caitlyn
    this.maxHp = 580;
    this.hp = 580;
    this.maxMana = 380;
    this.mana = 380;
    this.speed = 5.8;
    this.attackDamage = 62;
    this.attackSpeed = 0.72;
    this.attackRange = 9.5; // Ataque à distância longo
    this.height = 3.8;
  }
  
  public loadModel(): Promise<void> {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load(
        './Personagens Principais/caitlyn/source/CaitlynComplete.glb',
        (gltf) => {
          this.mesh = gltf.scene;
          
          // Ajusta a escala do modelo da Caitlyn (meio termo ideal para visibilidade LoL)
          this.mesh.scale.set(0.055, 0.055, 0.055);
          this.mesh.position.copy(this.position);
          
          this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Evita que texturas fiquem lavadas
              if (child.material) {
                child.material.roughness = 0.7;
              }
            }
          });
          
          this.scene.add(this.mesh);
          
          // Associa referência da entidade ao mesh para raycast
          this.mesh.userData = { entity: this };
          
          // Inicializa animações
          this.setupAnimations(gltf.animations);
          this.initUI();
          resolve();
        },
        undefined,
        (err) => {
          console.error('Erro ao carregar CaitlynComplete.glb, usando mesh substituto:', err);
          this.createFallbackMesh();
          this.initUI();
          resolve();
        }
      );
    });
  }
  
  private createFallbackMesh() {
    // Cria um cilindro azul estiloso
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.7, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0x1aa3ff, roughness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.85;
    mesh.castShadow = true;
    
    // Adiciona "olhos" ou frente para indicar rotação
    const frontGeo = new THREE.BoxGeometry(0.2, 0.2, 0.4);
    const frontMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const front = new THREE.Mesh(frontGeo, frontMat);
    front.position.set(0, 0.5, 0.4);
    mesh.add(front);
    
    const group = new THREE.Group();
    group.add(mesh);
    this.mesh = group;
    this.scene.add(this.mesh);
    this.mesh.userData = { entity: this };
  }
  
  // Lança o ataque básico contra o alvo
  public autoAttack(enemy: Character, spawnProjectile: (proj: Projectile) => void) {
    if (this.state === 'DEAD' || this.state === 'CASTING') return;
    
    const now = performance.now();
    const attackInterval = 1000 / this.attackSpeed;
    
    if (now - this.lastAttackTime >= attackInterval) {
      this.lastAttackTime = now;
      this.state = 'ATTACKING';
      this.moveTarget = null;
      this.path = [];
      
      // Rotaciona em direção ao alvo
      const dir = new THREE.Vector3().subVectors(enemy.position, this.position);
      this.rotation.y = Math.atan2(dir.x, dir.z);
      
      this.playAnimation('attack', false, 0.1);
      
      // Dispara o projétil após um pequeno delay da animação (0.15s)
      setTimeout(() => {
        if (this.state === 'DEAD' || !enemy || enemy.state === 'DEAD') {
          if (this.state === 'ATTACKING') this.state = 'IDLE';
          return;
        }
        
        const startPos = this.position.clone();
        startPos.y += this.height * 0.6; // sai da altura da arma
        
        const proj = new Projectile(
          this.scene,
          startPos,
          'homing',
          16, // velocidade
          this.attackDamage,
          this,
          enemy,
          null,
          0,
          null,
          0x00d9ff, // Cor azul/ciano do tiro
          0.15
        );
        
        spawnProjectile(proj);
        
        // Retorna ao estado de IDLE após atirar
        setTimeout(() => {
          if (this.state === 'ATTACKING') {
            this.state = 'IDLE';
            this.playAnimation('idle');
          }
        }, 300);
        
      }, 150);
    }
  }
  
  // HABILIDADE Q: Piltover Peacemaker
  public castQ(targetPoint: THREE.Vector3, spawnProjectile: (proj: Projectile) => void) {
    if (this.canCast('Q')) {
      this.useMana(this.manaCosts.Q);
      this.startCooldown('Q');
      
      this.state = 'CASTING';
      this.moveTarget = null;
      this.path = [];
      
      // Mira na direção do clique
      const dir = new THREE.Vector3().subVectors(targetPoint, this.position);
      dir.y = 0;
      dir.normalize();
      this.rotation.y = Math.atan2(dir.x, dir.z);
      
      this.playAnimation('cast', false, 0.1);
      
      // Dispara o tiro de laser após 0.25s de conjuração
      setTimeout(() => {
        if (this.state === 'DEAD') return;
        
        const startPos = this.position.clone();
        startPos.y += this.height * 0.55;
        
        const qProj = new Projectile(
          this.scene,
          startPos,
          'linear',
          22, // Projétil rápido
          this.attackDamage * 1.5, // 150% do AD
          this,
          null,
          dir,
          15, // Alcance longo
          null,
          0xff0055, // Laser avermelhado/rosa brilhante
          0.35 // Projétil mais largo
        );
        
        spawnProjectile(qProj);
        
        this.state = 'IDLE';
        this.playAnimation('idle');
      }, 250);
    }
  }
  
  // HABILIDADE W: Yordle Snap Trap
  public castW(targetPoint: THREE.Vector3) {
    if (this.canCast('W')) {
      // Limita o alcance da conjuração do W
      const dist = this.position.distanceTo(targetPoint);
      const castRange = 8;
      let trapPos = targetPoint.clone();
      
      if (dist > castRange) {
        const dir = new THREE.Vector3().subVectors(targetPoint, this.position).normalize();
        trapPos = this.position.clone().addScaledVector(dir, castRange);
      }
      
      this.useMana(this.manaCosts.W);
      this.startCooldown('W');
      
      this.state = 'CASTING';
      this.moveTarget = null;
      this.path = [];
      
      this.playAnimation('cast', false, 0.1);
      
      setTimeout(() => {
        if (this.state === 'DEAD') return;
        
        // Cria visual da armadilha
        const trapGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12);
        const trapMat = new THREE.MeshBasicMaterial({ color: 0xc29d53, wireframe: true });
        const trapMesh = new THREE.Mesh(trapGeo, trapMat);
        trapMesh.position.copy(trapPos);
        trapMesh.position.y = 0.05;
        
        // Adiciona um pequeno halo de luz
        const light = new THREE.PointLight(0xc29d53, 1, 2);
        trapMesh.add(light);
        
        this.scene.add(trapMesh);
        this.activeTraps.push(trapMesh);
        
        this.state = 'IDLE';
        this.playAnimation('idle');
      }, 200);
    }
  }
  
  // HABILIDADE E: 9-Caliber Net
  public castE(targetPoint: THREE.Vector3, spawnProjectile: (proj: Projectile) => void) {
    if (this.canCast('E')) {
      this.useMana(this.manaCosts.E);
      this.startCooldown('E');
      
      this.state = 'CASTING';
      this.moveTarget = null;
      this.path = [];
      
      // Direção do disparo
      const shootDir = new THREE.Vector3().subVectors(targetPoint, this.position);
      shootDir.y = 0;
      shootDir.normalize();
      
      this.rotation.y = Math.atan2(shootDir.x, shootDir.z);
      
      // O recuo empurra para trás (direção oposta)
      this.dashDirection = shootDir.clone().negate();
      this.dashTimeRemaining = 0.25; // dura 0.25 segundos
      
      this.playAnimation('cast', false, 0.05);
      
      // Dispara a rede imediatamente
      const startPos = this.position.clone();
      startPos.y += this.height * 0.5;
      
      const netProj = new Projectile(
        this.scene,
        startPos,
        'linear',
        16,
        this.attackDamage * 0.8,
        this,
        null,
        shootDir,
        9,
        (hitEnemy) => {
          // Efeito especial: desacelera o inimigo em 60% por 2 segundos
          const originalSpeed = hitEnemy.speed;
          hitEnemy.speed *= 0.4;
          setTimeout(() => {
            if (hitEnemy.state !== 'DEAD') {
              hitEnemy.speed = originalSpeed;
            }
          }, 2000);
        },
        0x00ffcc, // Cor ciano/verde água
        0.3
      );
      
      spawnProjectile(netProj);
    }
  }
  
  // HABILIDADE R: Ace in the Hole (Fusilamento)
  public castR(enemy: Character) {
    if (this.canCast('R') && enemy && enemy.state !== 'DEAD') {
      const dist = this.position.distanceTo(enemy.position);
      const rRange = 25.0; // Alcance massivo
      
      if (dist > rRange) {
        console.warn('Inimigo fora do alcance do R!');
        return;
      }
      
      this.useMana(this.manaCosts.R);
      this.startCooldown('R');
      
      this.state = 'CASTING';
      this.moveTarget = null;
      this.path = [];
      
      this.rTarget = enemy;
      this.rChannelTime = 2.0; // 2 segundos de canalização
      
      // Olha para o alvo
      const dir = new THREE.Vector3().subVectors(enemy.position, this.position);
      this.rotation.y = Math.atan2(dir.x, dir.z);
      
      this.playAnimation('cast', false, 0.1);
      
      // Cria a linha laser vermelha que mira no alvo
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const points = [
        new THREE.Vector3(0, this.height * 0.6, 0),
        new THREE.Vector3().subVectors(enemy.position, this.position).add(new THREE.Vector3(0, enemy.height * 0.5, 0))
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      this.rLaserLine = new THREE.Line(geometry, material);
      this.mesh?.add(this.rLaserLine);
    }
  }
  
  private executeR(spawnProjectile: (proj: Projectile) => void) {
    if (this.state === 'DEAD' || !this.rTarget || this.rTarget.state === 'DEAD') {
      this.cancelR();
      return;
    }
    
    const startPos = this.position.clone();
    startPos.y += this.height * 0.6;
    
    // Dispara a bala teleguiada gigante
    const rBullet = new Projectile(
      this.scene,
      startPos,
      'homing',
      24, // muito rápida
      this.attackDamage * 3.5, // dano crítico altíssimo (3.5x AD)
      this,
      this.rTarget,
      null,
      0,
      null,
      0xff0000, // Vermelha
      0.5 // Bala gigante
    );
    
    spawnProjectile(rBullet);
    this.cancelR();
  }
  
  private cancelR() {
    this.state = 'IDLE';
    this.playAnimation('idle');
    this.rTarget = null;
    this.rChannelTime = 0;
    
    if (this.rLaserLine && this.mesh) {
      this.mesh.remove(this.rLaserLine);
      this.rLaserLine.geometry.dispose();
      this.rLaserLine = null;
    }
  }
  
  private canCast(skillName: 'Q' | 'W' | 'E' | 'R'): boolean {
    if (this.state === 'DEAD' || this.state === 'CASTING') return false;
    if (this.cooldowns[skillName].current > 0) return false;
    if (this.mana < this.manaCosts[skillName]) {
      console.warn(`Mana insuficiente para o ${skillName}!`);
      return false;
    }
    return true;
  }
  
  private useMana(amount: number) {
    this.mana = Math.max(0, this.mana - amount);
    this.updateUI();
  }
  
  private startCooldown(skillName: 'Q' | 'W' | 'E' | 'R') {
    this.cooldowns[skillName].current = this.cooldowns[skillName].max;
  }
  
  public update(deltaTime: number) {
    if (this.state === 'DEAD') {
      super.update(deltaTime);
      return;
    }
    
    // Regeneração de Mana passiva
    this.mana = Math.min(this.maxMana, this.mana + 3 * deltaTime);
    this.updateUI();
    
    // Atualiza timers de Cooldown no HUD
    const keys: Array<'Q' | 'W' | 'E' | 'R'> = ['Q', 'W', 'E', 'R'];
    keys.forEach((key) => {
      if (this.cooldowns[key].current > 0) {
        this.cooldowns[key].current = Math.max(0, this.cooldowns[key].current - deltaTime);
        
        // Atualiza a interface gráfica do HTML
        const slot = document.getElementById(`skill-${key.toLowerCase()}`);
        if (slot) {
          slot.classList.add('on-cooldown');
          const overlayText = slot.querySelector('.cooldown-text');
          if (overlayText) {
            overlayText.textContent = this.cooldowns[key].current > 0 ? Math.ceil(this.cooldowns[key].current).toString() : '';
          }
        }
      } else {
        const slot = document.getElementById(`skill-${key.toLowerCase()}`);
        if (slot) {
          slot.classList.remove('on-cooldown');
          const overlayText = slot.querySelector('.cooldown-text');
          if (overlayText) overlayText.textContent = '';
        }
      }
    });
    
    // Processamento do E (Dash de recuo)
    if (this.dashDirection && this.dashTimeRemaining > 0) {
      const dist = this.dashSpeed * deltaTime;
      const move = this.dashDirection.clone().multiplyScalar(dist);
      this.position.add(move);
      
      this.dashTimeRemaining -= deltaTime;
      if (this.dashTimeRemaining <= 0) {
        this.dashDirection = null;
        this.state = 'IDLE';
        this.playAnimation('idle');
      }
    }
    
    // Processamento de canalização do R
    if (this.state === 'CASTING' && this.rTarget) {
      this.rChannelTime -= deltaTime;
      
      // Atualiza a linha laser vermelha
      if (this.rLaserLine && this.rTarget.mesh) {
        // Redesenha a linha apontando para a posição atualizada do inimigo
        const endPos = new THREE.Vector3().subVectors(this.rTarget.position, this.position);
        endPos.y += this.rTarget.height * 0.5; // foca no peito
        
        const positionAttr = this.rLaserLine.geometry.getAttribute('position') as THREE.BufferAttribute;
        positionAttr.setXYZ(1, endPos.x, endPos.y, endPos.z);
        positionAttr.needsUpdate = true;
      }
      
      if (this.rChannelTime <= 0) {
        this.executeR((p) => Game.instance.spawnProjectile(p));
      }
    }
    
    // Lógica das armadilhas do W (detectar colisão com o Master Yi)
    for (let i = this.activeTraps.length - 1; i >= 0; i--) {
      const trap = this.activeTraps[i];
      
      // Apenas colide se houver inimigos ativos
      for (const entity of Game.instance.entities) {
        if (entity.team === 2 && entity.state !== 'DEAD') {
          const dist = trap.position.distanceTo(entity.position);
          if (dist < 1.2) {
            // Ativou a armadilha!
            this.scene.remove(trap);
            this.activeTraps.splice(i, 1);
            
            // Causa dano e imobiliza por 1.5s
            entity.takeDamage(85, this);
            const originalSpeed = entity.speed;
            entity.speed = 0; // Enraizado!
            
            // Visual de enraizamento
            const ringGeo = new THREE.RingGeometry(0.6, 0.7, 16);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xc29d53, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(entity.position);
            ring.position.y = 0.1;
            this.scene.add(ring);
            
            setTimeout(() => {
              if (entity.state !== 'DEAD') entity.speed = originalSpeed;
              this.scene.remove(ring);
              ringGeo.dispose();
              ringMat.dispose();
            }, 1500);
            
            break;
          }
        }
      }
    }
    
    super.update(deltaTime);
  }
  
  public destroy(scene: THREE.Scene) {
    this.activeTraps.forEach((trap) => scene.remove(trap));
    this.activeTraps = [];
    if (this.rLaserLine && this.mesh) {
      this.mesh.remove(this.rLaserLine);
    }
    super.destroy(scene);
  }
}
