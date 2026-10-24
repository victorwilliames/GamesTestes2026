import * as THREE from 'three';

export class TrainingDummy {
  public mesh: THREE.Group;
  
  // Status
  public maxHealth: number = 999;
  public health: number = 999;
  private isDead: boolean = false;
  private respawnTimer: number = 0;

  // Física de Balanço (Efeito Mola)
  private rotationSpring: THREE.Vector3 = new THREE.Vector3();
  private rotationVelocity: THREE.Vector3 = new THREE.Vector3();
  private springStrength: number = 28.0; // Força de retorno
  private damping: number = 4.5; // Fricção para parar de balançar

  constructor(gltfMesh: THREE.Group) {
    this.mesh = gltfMesh;
    this.mesh.position.set(0, 0, 0); // Posição central do spawn_points_arena.json
    
    // Ativar sombras
    this.mesh.traverse((child) => {
      if ((child as any).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  public update(deltaTime: number): void {
    // 1. Tratamento de morte e regeneração de vida
    if (this.isDead) {
      this.respawnTimer -= deltaTime;
      if (this.respawnTimer <= 0) {
        this.isDead = false;
        this.health = this.maxHealth;
        // Restaurar escala original
        this.mesh.scale.set(1.0, 1.0, 1.0);
      }
    }

    // 2. Física do balanço (Spring Pendulum)
    // Força restauradora da mola: F = -k * x
    const springForceX = -this.springStrength * this.rotationSpring.x;
    const springForceZ = -this.springStrength * this.rotationSpring.z;

    // Aceleração = Força - amortecimento * velocidade
    this.rotationVelocity.x += (springForceX - this.damping * this.rotationVelocity.x) * deltaTime;
    this.rotationVelocity.z += (springForceZ - this.damping * this.rotationVelocity.z) * deltaTime;

    // Atualizar o deslocamento
    this.rotationSpring.x += this.rotationVelocity.x * deltaTime;
    this.rotationSpring.z += this.rotationVelocity.z * deltaTime;

    // Aplicar a rotação de balanço no modelo 3D (afeta rotação X e Z)
    this.mesh.rotation.x = this.rotationSpring.x;
    this.mesh.rotation.z = this.rotationSpring.z;
  }

  /**
   * Aplica um golpe no dummy, fazendo ele sofrer dano e balançar
   * @param damage Quantidade de dano sofrido
   * @param hitDirection Vetor unitário indicando a direção do golpe
   * @param isHeavy Se o golpe é pesado (gera mais balanço)
   */
  public takeDamage(damage: number, hitDirection: THREE.Vector3, isHeavy: boolean): void {
    if (this.isDead) return;

    this.health = Math.max(0, this.health - damage);

    // Calcular o balanço baseando-se na direção do golpe
    // Um golpe na direção +X faz o boneco inclinar no eixo Z de forma negativa, etc.
    const forceFactor = isHeavy ? 0.95 : 0.45;
    
    // Injetar velocidade de rotação imediata
    this.rotationVelocity.x += hitDirection.z * forceFactor * 10;
    this.rotationVelocity.z -= hitDirection.x * forceFactor * 10;

    // Se a vida zerar, "morre"
    if (this.health <= 0) {
      this.isDead = true;
      this.respawnTimer = 2.5; // s
      
      // Animação sutil de colapso (escala achatada) para simular derrota do dummy
      this.mesh.scale.set(1.0, 0.1, 1.0);
      this.rotationSpring.set(0, 0, 0);
      this.rotationVelocity.set(0, 0, 0);
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
}
