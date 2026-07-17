import * as THREE from 'three';
import { Character } from './Character';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Projectile } from './Projectile';
import { Game } from '../Game';

export class Minion extends Character {
  private lastScanTime: number = 0;
  private scanInterval: number = 0.5; // Escaneia alvos a cada 0.5s
  private waypoints: THREE.Vector3[] = [];
  
  constructor(private scene: THREE.Scene, type: 'melee' | 'ranged', team: number) {
    super();
    this.name = type === 'melee' ? 'MeleeMinion' : 'RangedMinion';
    this.team = team;
    
    // Atributos base
    if (type === 'melee') {
      this.maxHp = 220;
      this.hp = 220;
      this.speed = 3.4;
      this.attackDamage = 14;
      this.attackSpeed = 0.65;
      this.attackRange = 1.6; // Corpo a corpo
    } else {
      this.maxHp = 150;
      this.hp = 150;
      this.speed = 3.4;
      this.attackDamage = 22;
      this.attackSpeed = 0.65;
      this.attackRange = 6.5; // À distância
    }
    
    this.height = 2.2;
    
    this.setupWaypoints();
  }
  
  private setupWaypoints() {
    // Rota diagonal de midlane alinhada com as torres reais
    if (this.team === 1) { // Aliados vão da base inferior para a superior
      this.position.set(-16.5, 0, -16.5);
      this.waypoints = [
        new THREE.Vector3(-14.5, 0, -14.5),
        new THREE.Vector3(-10.2, 0, -10.2),
        new THREE.Vector3(-5.2, 0, -5.2),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(5.2, 0, 5.2),
        new THREE.Vector3(10.2, 0, 10.2),
        new THREE.Vector3(14.5, 0, 14.5),
        new THREE.Vector3(16.5, 0, 16.5)
      ];
    } else { // Inimigos vão da base superior para a inferior
      this.position.set(16.5, 0, 16.5);
      this.waypoints = [
        new THREE.Vector3(14.5, 0, 14.5),
        new THREE.Vector3(10.2, 0, 10.2),
        new THREE.Vector3(5.2, 0, 5.2),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-5.2, 0, -5.2),
        new THREE.Vector3(-10.2, 0, -10.2),
        new THREE.Vector3(-14.5, 0, -14.5),
        new THREE.Vector3(-16.5, 0, -16.5)
      ];
    }
    
    // Define o primeiro ponto da rota
    this.path = [...this.waypoints];
  }
  
  public loadModel(): Promise<void> {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      
      // Carrega modelos diferentes baseados em time
      const modelPath = this.team === 1 
        ? './Inimigos/Minions/minion-kingscrest-melee-hots/minion_-_kingscrest_-_melee_-_hots.glb'
        : './Inimigos/Minions/minion_-_hell_-_melee_-_hots.glb';
        
      loader.load(
        modelPath,
        (gltf) => {
          this.mesh = gltf.scene;
          this.mesh.scale.set(0.032, 0.032, 0.032); // Minions maiores para visibilidade
          this.mesh.position.copy(this.position);
          
          this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) child.material.roughness = 0.8;
            }
          });
          
          this.scene.add(this.mesh);
          this.mesh.userData = { entity: this };
          
          this.setupAnimations(gltf.animations);
          this.initUI();
          resolve();
        },
        undefined,
        (err) => {
          console.error('Erro ao carregar minion, usando fallback:', err);
          this.createFallbackMesh();
          this.initUI();
          resolve();
        }
      );
    });
  }
  
  private createFallbackMesh() {
    // Cubo pequeno representando o minion
    const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const color = this.team === 1 ? 0x28cd41 : 0xff453a;
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.3;
    mesh.castShadow = true;
    
    const group = new THREE.Group();
    group.add(mesh);
    this.mesh = group;
    this.scene.add(this.mesh);
    this.mesh.userData = { entity: this };
  }
  
  // Realiza ataque automático (melee ou ranged)
  private autoAttack(target: Character, spawnProjectile: (proj: Projectile) => void) {
    const now = performance.now();
    const attackInterval = 1000 / this.attackSpeed;
    
    if (now - this.lastAttackTime >= attackInterval) {
      this.lastAttackTime = now;
      this.state = 'ATTACKING';
      this.moveTarget = null;
      this.path = [];
      
      // Olha para o alvo
      const dir = new THREE.Vector3().subVectors(target.position, this.position);
      this.rotation.y = Math.atan2(dir.x, dir.z);
      
      this.playAnimation('attack', false, 0.1);
      
      if (this.name === 'MeleeMinion') {
        // Ataque Corpo a Corpo (imediato no fim da animação)
        setTimeout(() => {
          if (this.state === 'DEAD' || target.state === 'DEAD') return;
          const dist = this.position.distanceTo(target.position);
          if (dist <= this.attackRange + 0.3) {
            target.takeDamage(this.attackDamage, this);
          }
          this.state = 'IDLE';
          this.playAnimation('idle');
        }, 300);
      } else {
        // Ataque à Distância (projétil)
        setTimeout(() => {
          if (this.state === 'DEAD' || target.state === 'DEAD') return;
          
          const startPos = this.position.clone();
          startPos.y += this.height * 0.7;
          
          const projColor = this.team === 1 ? 0x28cd41 : 0xff453a;
          const minionProj = new Projectile(
            this.scene,
            startPos,
            'homing',
            12,
            this.attackDamage,
            this,
            target,
            null,
            0,
            null,
            projColor,
            0.12
          );
          
          spawnProjectile(minionProj);
          
          this.state = 'IDLE';
          this.playAnimation('idle');
        }, 300);
      }
    }
  }
  
  // Escaneia inimigos mais próximos
  private scanForTargets() {
    let closestTarget: Character | null = null;
    let minDistance = Infinity;
    
    const visionRange = 8.0;
    
    for (const entity of Game.instance.entities) {
      // Procura inimigos ativos (opostos a sua equipe)
      if (entity.team !== this.team && entity.team !== 3 && entity.state !== 'DEAD') {
        const dist = this.position.distanceTo(entity.position);
        if (dist < visionRange && dist < minDistance) {
          minDistance = dist;
          closestTarget = entity;
        }
      }
    }
    
    this.target = closestTarget;
  }
  
  public update(deltaTime: number) {
    if (this.state === 'DEAD') {
      super.update(deltaTime);
      return;
    }
    
    // Atualiza escaneamento periódico
    const now = performance.now() / 1000;
    if (now - this.lastScanTime >= this.scanInterval) {
      this.lastScanTime = now;
      this.scanForTargets();
    }
    
    if (this.target && this.target.state !== 'DEAD') {
      // Se possui alvo, decide se ataca ou aproxima-se
      const dist = this.position.distanceTo(this.target.position);
      
      if (dist <= this.attackRange) {
        this.autoAttack(this.target, (p) => Game.instance.spawnProjectile(p));
      } else {
        // Anda em direção ao inimigo
        this.moveTarget = this.target.position.clone();
      }
    } else {
      // Se não tem alvo, retoma a caminhada pelos waypoints da rota
      if (this.path.length === 0) {
        // Se já chegou no fim, reseta a rota para o nexo
        this.path = [...this.waypoints];
      }
      this.moveTarget = null;
    }
    
    super.update(deltaTime);
  }
}
