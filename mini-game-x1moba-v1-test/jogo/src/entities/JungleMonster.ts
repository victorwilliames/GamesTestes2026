import * as THREE from 'three';
import { Character } from './Character';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class JungleMonster extends Character {
  private spawnPosition: THREE.Vector3 = new THREE.Vector3();
  private maxLeashDist: number = 14.0; // Distância máxima que o monstro aceita andar antes de resetar (Paciência)
  private isResetting: boolean = false;
  
  constructor(private scene: THREE.Scene, name: string, x: number, z: number) {
    super();
    this.name = name;
    this.team = 3; // Neutro
    
    this.position.set(x, 0, z);
    this.spawnPosition.copy(this.position);
    
    // Atributos de Monstro da Selva (Neutro Forte)
    this.maxHp = 850;
    this.hp = 850;
    this.speed = 4.2;
    this.attackDamage = 28;
    this.attackSpeed = 0.6;
    this.attackRange = 2.0;
    this.height = 2.5;
  }
  
  public loadModel(): Promise<void> {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      
      // Carrega o Warrior.gltf da pasta MiniBoss/glTF
      loader.load(
        './Inimigos/MiniBoss/glTF/Warrior.gltf',
        (gltf) => {
          this.mesh = gltf.scene;
          this.mesh.scale.set(1.8, 1.8, 1.8); // Fazer o monstro parecer grande
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
          console.error('Erro ao carregar modelo do monstro, usando fallback:', err);
          this.createFallbackMesh();
          this.initUI();
          resolve();
        }
      );
    });
  }
  
  private createFallbackMesh() {
    const geo = new THREE.BoxGeometry(0.8, 1.6, 0.8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.7 }); // Roxo
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.8;
    mesh.castShadow = true;
    
    const group = new THREE.Group();
    group.add(mesh);
    this.mesh = group;
    this.scene.add(this.mesh);
    this.mesh.userData = { entity: this };
  }
  
  private autoAttack(target: Character) {
    const now = performance.now();
    const attackInterval = 1000 / this.attackSpeed;
    
    if (now - this.lastAttackTime >= attackInterval) {
      this.lastAttackTime = now;
      this.state = 'ATTACKING';
      
      // Olha para o alvo
      const dir = new THREE.Vector3().subVectors(target.position, this.position);
      this.rotation.y = Math.atan2(dir.x, dir.z);
      
      this.playAnimation('attack', false, 0.1);
      
      setTimeout(() => {
        if (this.state === 'DEAD' || this.isResetting) return;
        const dist = this.position.distanceTo(target.position);
        if (dist <= this.attackRange + 0.5 && target.state !== 'DEAD') {
          target.takeDamage(this.attackDamage, this);
        }
        this.state = 'IDLE';
        this.playAnimation('idle');
      }, 300);
    }
  }
  
  public takeDamage(amount: number, attacker: Character): boolean {
    const dead = super.takeDamage(amount, attacker);
    
    // Se for atacado e não estiver resetando, revida focando o atacante!
    if (!dead && !this.isResetting && attacker.state !== 'DEAD') {
      this.target = attacker;
    }
    
    return dead;
  }
  
  public update(deltaTime: number) {
    if (this.state === 'DEAD') {
      super.update(deltaTime);
      return;
    }
    
    if (this.isResetting) {
      // 1. Está correndo de volta para o spawn
      this.moveTarget = this.spawnPosition;
      
      // Regenera vida extremamente rápido (paciência perdida)
      this.hp = Math.min(this.maxHp, this.hp + 200 * deltaTime);
      this.updateUI();
      
      const distToSpawn = this.position.distanceTo(this.spawnPosition);
      if (distToSpawn < 0.5) {
        this.isResetting = false;
        this.moveTarget = null;
        this.state = 'IDLE';
        this.playAnimation('idle');
      }
    } else if (this.target && this.target.state !== 'DEAD') {
      // 2. Está agressivado contra um alvo
      const distToTarget = this.position.distanceTo(this.target.position);
      const distToSpawn = this.position.distanceTo(this.spawnPosition);
      
      // Se afastar demais do spawn (leash range), desiste e reseta
      if (distToSpawn > this.maxLeashDist) {
        this.target = null;
        this.isResetting = true;
      } else if (distToTarget <= this.attackRange) {
        this.autoAttack(this.target);
      } else {
        this.moveTarget = this.target.position.clone();
      }
    } else {
      // 3. Ocioso em seu acampamento
      this.target = null;
      this.moveTarget = null;
      
      // Regeneração de HP lenta normal
      if (this.hp < this.maxHp) {
        this.hp = Math.min(this.maxHp, this.hp + 5 * deltaTime);
        this.updateUI();
      }
    }
    
    super.update(deltaTime);
  }
}
