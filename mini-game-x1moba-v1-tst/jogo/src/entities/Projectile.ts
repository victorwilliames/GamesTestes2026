import * as THREE from 'three';
import { Character } from './Character';

export class Projectile {
  public position: THREE.Vector3 = new THREE.Vector3();
  public active: boolean = true;
  public mesh: THREE.Object3D;
  
  private traveledDistance: number = 0;
  
  constructor(
    private scene: THREE.Scene,
    startPos: THREE.Vector3,
    private type: 'homing' | 'linear',
    private speed: number,
    private damage: number,
    private owner: Character,
    private target: Character | null = null,
    private direction: THREE.Vector3 | null = null,
    private maxRange: number = 20,
    private onHitCallback: ((target: Character) => void) | null = null,
    color: number = 0xffaa00,
    radius: number = 0.25
  ) {
    this.position.copy(startPos);
    
    // Cria visual para o projétil
    const geometry = new THREE.SphereGeometry(radius, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      toneMapped: false,
      transparent: true,
      opacity: 0.9
    });
    
    // Para dar visual premium, adicionamos um efeito emissivo (brilho)
    const mesh = new THREE.Mesh(geometry, material);
    
    // Adiciona uma luz pontual fraca para iluminar o cenário ao redor do projétil
    const light = new THREE.PointLight(color, 2, 4);
    mesh.add(light);
    
    this.mesh = mesh;
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }
  
  public update(deltaTime: number, activeEntities: Character[]) {
    if (!this.active) return;
    
    if (this.type === 'homing') {
      // Projétil Teleguiado (Seguidor)
      if (!this.target || this.target.state === 'DEAD') {
        this.destroy();
        return;
      }
      
      const dir = new THREE.Vector3().subVectors(this.target.position, this.position);
      // Mirar um pouco acima da base (no peito do personagem)
      dir.y += this.target.height * 0.4; 
      
      const dist = dir.length();
      const moveDist = this.speed * deltaTime;
      
      if (dist <= moveDist) {
        // Impacto!
        this.hit(this.target);
      } else {
        dir.normalize();
        this.position.addScaledVector(dir, moveDist);
        this.mesh.position.copy(this.position);
      }
    } else {
      // Projétil Linear (Skillshot)
      if (!this.direction) {
        this.destroy();
        return;
      }
      
      const moveDist = this.speed * deltaTime;
      this.position.addScaledVector(this.direction, moveDist);
      this.mesh.position.copy(this.position);
      
      this.traveledDistance += moveDist;
      
      // Verifica colisões com inimigos (equipe adversária)
      for (const entity of activeEntities) {
        if (entity.state !== 'DEAD' && entity.team !== this.owner.team) {
          const entityPos = new THREE.Vector3().copy(entity.position);
          // Distância no plano 2D horizontal
          const dx = entityPos.x - this.position.x;
          const dz = entityPos.z - this.position.z;
          const distHorizontal = Math.sqrt(dx*dx + dz*dz);
          
          // Se colidir com o raio do personagem (aprox 1.0 unidade)
          if (distHorizontal < 1.2 && Math.abs(this.position.y - (entity.position.y + 1)) < 2.0) {
            this.hit(entity);
            return;
          }
        }
      }
      
      // Se passar do alcance máximo, some
      if (this.traveledDistance >= this.maxRange) {
        this.destroy();
      }
    }
  }
  
  private hit(entity: Character) {
    // Aplica o dano
    entity.takeDamage(this.damage, this.owner);
    
    // Executa efeito especial se houver
    if (this.onHitCallback) {
      this.onHitCallback(entity);
    }
    
    // Cria pequenos flashes/partículas de impacto
    this.createImpactParticles();
    
    this.destroy();
  }
  
  private createImpactParticles() {
    const particleCount = 6;
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: (this.mesh as THREE.Mesh).material instanceof THREE.MeshBasicMaterial ? ((this.mesh as THREE.Mesh).material as THREE.MeshBasicMaterial).color : 0xffaa00 });
    
    const group = new THREE.Group();
    group.position.copy(this.position);
    this.scene.add(group);
    
    const particles: THREE.Mesh[] = [];
    const velocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(geometry, material);
      group.add(p);
      particles.push(p);
      
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() * 4) + 2,
        (Math.random() - 0.5) * 6
      ));
    }
    
    // Anima partículas de impacto e remove
    let elapsed = 0;
    const updateParticles = () => {
      elapsed += 0.016;
      for (let i = 0; i < particleCount; i++) {
        particles[i].position.addScaledVector(velocities[i], 0.016);
        velocities[i].y -= 9.8 * 0.016; // gravidade
      }
      
      if (elapsed < 0.4) {
        requestAnimationFrame(updateParticles);
      } else {
        this.scene.remove(group);
        geometry.dispose();
        material.dispose();
      }
    };
    
    requestAnimationFrame(updateParticles);
  }
  
  public destroy() {
    this.active = false;
    this.scene.remove(this.mesh);
    // Libera geometria e material do projétil
    if ((this.mesh as THREE.Mesh).geometry) {
      (this.mesh as THREE.Mesh).geometry.dispose();
    }
    if ((this.mesh as THREE.Mesh).material) {
      const mat = (this.mesh as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        mat.dispose();
      }
    }
  }
}
