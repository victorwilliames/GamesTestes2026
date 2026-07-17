import * as THREE from 'three';

export class Player {
  public mesh: THREE.Group;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  
  // Status de RPG
  public maxHealth: number = 420;
  public health: number = 420;
  public maxStamina: number = 120;
  public stamina: number = 120;

  // Velocidades e Balanço
  private normalSpeed: number = 6.2;
  private dashSpeed: number = 22.0;
  private currentSpeed: number = 6.2;

  // Estados e Timers do Dash
  public isDashing: boolean = false;
  private dashDuration: number = 0.22; // s
  private dashTimer: number = 0;
  private dashCooldown: number = 0.8; // s
  private dashCooldownTimer: number = 0;
  private dashDirection: THREE.Vector3 = new THREE.Vector3();

  // Estados e Timers de Combate
  public isAttacking: boolean = false;
  public attackType: 'light' | 'heavy' | null = null;
  public attackTimer: number = 0;
  public attackWindup: number = 0;
  public attackActive: number = 0;
  public attackRecovery: number = 0;
  private staminaRegenTimer: number = 0;
  private staminaRegenDelay: number = 1.0; // segundos sem gastar antes de regenerar

  // Colisão
  public radius: number = 0.6;

  constructor(gltfMesh: THREE.Group) {
    this.mesh = gltfMesh;
    this.mesh.position.set(-2.8, 0, 0); // Posição inicial do spawn_points_arena.json
    
    // Configurar materiais para o visual idêntico ao print1 (corpo azul profundo, olhos ciano brilhantes, espada metálica)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#063870'),
      roughness: 0.45,
      metalness: 0.15
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00ffff'),
      emissive: new THREE.Color('#00ffff'),
      emissiveIntensity: 4.0, // Olhos brilhantes/emissivos
      roughness: 0.1
    });

    const scarfMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0b56ad'),
      roughness: 0.8
    });

    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e0e0e0'),
      roughness: 0.15,
      metalness: 0.95 // Aço prateado polido
    });

    const hiltMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#222222'),
      roughness: 0.6
    });

    this.mesh.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        const name = mesh.name.toLowerCase();
        if (name.includes('head') || name.includes('torso') || name.includes('arm') || name.includes('leg')) {
          mesh.material = bodyMaterial;
        } else if (name.includes('eye')) {
          mesh.material = eyeMaterial;
        } else if (name.includes('scarf') || name.includes('cape')) {
          mesh.material = scarfMaterial;
        } else if (name.includes('blade') || name.includes('sword') || name.includes('weapon')) {
          mesh.material = bladeMaterial;
        } else if (name.includes('guard') || name.includes('hilt')) {
          mesh.material = hiltMaterial;
        }
      }
    });
  }

  public update(deltaTime: number, moveDirection: THREE.Vector3): void {
    // 1. Atualizar Timers de Esquiva / Dash
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= deltaTime;
    }

    if (this.isDashing) {
      this.dashTimer -= deltaTime;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.currentSpeed = this.normalSpeed;
      }
    }

    // 2. Atualizar Timers de Ataque (Soulslike Windup -> Active -> Recovery)
    if (this.isAttacking) {
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.attackType = null;
      }
    }

    // 3. Processar Movimentação Física
    if (this.isDashing) {
      // Dash move na direção fixa travada ao iniciar
      this.velocity.copy(this.dashDirection).multiplyScalar(this.currentSpeed);
    } else if (this.isAttacking) {
      // Peso do ataque (Estilo No Rest / Souls-like):
      // Trava movimentação livre e aplica um avanço (lurch) físico durante a fase ativa do golpe.
      const timeElapsed = (this.attackWindup + this.attackActive + this.attackRecovery) - this.attackTimer;
      if (timeElapsed >= this.attackWindup && timeElapsed < this.attackWindup + this.attackActive) {
        const lungeSpeed = this.attackType === 'light' ? 5.2 : 8.0;
        const forwardX = Math.sin(this.mesh.rotation.y);
        const forwardZ = Math.cos(this.mesh.rotation.y);
        this.velocity.set(forwardX, 0, forwardZ).normalize().multiplyScalar(lungeSpeed);
      } else {
        // Travado/parado durante o windup e recovery
        this.velocity.set(0, 0, 0);
      }
    } else {
      // Movimentação normal WASD / Joystick
      this.velocity.copy(moveDirection).multiplyScalar(this.normalSpeed);
    }

    // Aplicar movimento no espaço 3D
    this.mesh.position.addScaledVector(this.velocity, deltaTime);

    // Limitar movimentação dentro das bordas da Arena circular (paredes no raio 14.5)
    const arenaRadiusLimit = 14.3;
    const distanceFromCenter = this.mesh.position.length();
    if (distanceFromCenter > arenaRadiusLimit) {
      this.mesh.position.normalize().multiplyScalar(arenaRadiusLimit);
    }

    // 4. Processar Rotação
    // O jogador vira para a direção do movimento ou do ataque
    if (moveDirection.lengthSq() > 0.01 && !this.isDashing && (!this.isAttacking || this.attackTimer <= this.attackRecovery)) {
      const angle = Math.atan2(moveDirection.x, moveDirection.z);
      this.mesh.rotation.y = angle;
    }

    // 5. Regeneração de Stamina
    if (this.staminaRegenTimer > 0) {
      this.staminaRegenTimer -= deltaTime;
    } else {
      // Regenera 35 de stamina por segundo
      this.stamina = Math.min(this.maxStamina, this.stamina + 35 * deltaTime);
    }
  }

  public dash(moveDirection: THREE.Vector3): boolean {
    if (this.isDashing || this.dashCooldownTimer > 0 || this.stamina < 28) {
      return false; // Cooldown ativo ou sem stamina
    }

    this.isDashing = true;
    this.stamina -= 28;
    this.staminaRegenTimer = this.staminaRegenDelay;
    this.dashTimer = this.dashDuration;
    this.dashCooldownTimer = this.dashCooldown;
    this.currentSpeed = this.dashSpeed;

    // Se o player estiver parado, o dash vai na direção para onde ele está olhando,
    // senão vai na direção em que está andando.
    if (moveDirection.lengthSq() > 0.01) {
      this.dashDirection.copy(moveDirection).normalize();
    } else {
      // Pegar vetor frontal baseado na rotação Y do player
      this.dashDirection.set(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y)).normalize();
    }

    // Cancelar ataques se estiver no windup ou recovery
    this.isAttacking = false;
    this.attackType = null;

    return true;
  }

  public attack(type: 'light' | 'heavy'): boolean {
    if (this.isAttacking || this.isDashing) return false;

    const staminaCost = type === 'light' ? 14 : 28;
    if (this.stamina < staminaCost) return false; // Sem stamina suficiente

    this.stamina -= staminaCost;
    this.staminaRegenTimer = this.staminaRegenDelay;
    
    this.isAttacking = true;
    this.attackType = type;

    // Configurar frames do ataque baseado no balanceamento soulslike
    if (type === 'light') {
      this.attackWindup = 0.12;
      this.attackActive = 0.18;
      this.attackRecovery = 0.28;
    } else {
      this.attackWindup = 0.32;
      this.attackActive = 0.22;
      this.attackRecovery = 0.55;
    }

    this.attackTimer = this.attackWindup + this.attackActive + this.attackRecovery;

    // Rotacionar levemente o modelo na direção que está atacando para dar peso
    return true;
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public heal(): boolean {
    if (this.health >= this.maxHealth) return false;
    this.health = Math.min(this.maxHealth, this.health + 110);
    return true;
  }
}
