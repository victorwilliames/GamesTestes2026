import * as THREE from 'three';
import { Character } from './Character';
import { Projectile } from './Projectile';
import { Game } from '../Game';

export class Tower extends Character {
  private scanInterval: number = 0.25; // Varre a área a cada 0.25s
  private lastScanTime: number = 0;
  
  // Lista de campeões que atacaram aliados recentemente no alcance da torre
  private static threatTable: Map<string, { attacker: Character; time: number }> = new Map();
  
  constructor(private scene: THREE.Scene, x: number, z: number, team: number) {
    super();
    this.name = 'Tower';
    this.team = team;
    
    this.position.set(x, 0, z);
    
    // Atributos de Defesa Estática
    this.maxHp = 2000;
    this.hp = 2000;
    this.speed = 0; // Estacionária
    this.attackDamage = 130; // Dano massivo
    this.attackSpeed = 0.83; // Dispara a cada ~1.2s
    this.attackRange = 11.0;
    this.height = 4.5;
    
    this.createTowerMesh();
    this.initUI();
  }
  
  // Registra um ataque de campeão a campeão para a regra de agro da torre
  public static registerAggroThreat(attacker: Character, victim: Character) {
    if (attacker.team !== victim.team && attacker.name !== 'Tower' && victim.name !== 'Tower') {
      this.threatTable.set(attacker.id, { attacker, time: performance.now() });
    }
  }
  
  private createTowerMesh() {
    // Como a torre física já está fundida no cenário, criamos um cristal flutuante de energia no topo.
    // O cristal ficará flutuando em Y = 4.5 e emitirá luz.
    const crystalGeo = new THREE.OctahedronGeometry(0.5, 0);
    const color = this.team === 1 ? 0x00d9ff : 0xff3b30;
    
    const crystalMat = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: false
    });
    
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = this.height;
    
    // Adiciona anéis orbitais
    const ringGeo = new THREE.TorusGeometry(0.8, 0.05, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = this.height;
    
    const group = new THREE.Group();
    group.add(crystal);
    group.add(ring);
    
    // Luz focal no cristal
    const light = new THREE.PointLight(color, 3, 6);
    light.position.y = this.height;
    group.add(light);
    
    this.mesh = group;
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
    this.mesh.userData = { entity: this };
  }
  
  private autoAttack(targetEntity: Character, spawnProjectile: (proj: Projectile) => void) {
    const now = performance.now();
    const attackInterval = 1000 / this.attackSpeed;
    
    if (now - this.lastAttackTime >= attackInterval) {
      this.lastAttackTime = now;
      this.state = 'ATTACKING';
      
      const startPos = this.position.clone();
      startPos.y += this.height; // Atira de cima do cristal
      
      // Projétil de energia da torre
      const projColor = this.team === 1 ? 0x00d9ff : 0xff3b30;
      const towerProj = new Projectile(
        this.scene,
        startPos,
        'homing',
        14,
        this.attackDamage,
        this,
        targetEntity,
        null,
        0,
        null,
        projColor,
        0.3 // Bola de fogo maior
      );
      
      spawnProjectile(towerProj);
      
      setTimeout(() => {
        if (this.state === 'ATTACKING') this.state = 'IDLE';
      }, 300);
    }
  }
  
  // Regra de Agro do LoL:
  // 1. Prioriza campeões inimigos se eles atacarem um campeão aliado no raio de alcance.
  // 2. Prioriza a tropa (minion) inimiga mais próxima que entrou no raio.
  // 3. Prioriza o campeão inimigo mais próximo caso não haja tropas.
  private selectTarget() {
    const now = performance.now();
    
    // Limpa registros antigos de ameaças de forma segura (sem modificar o Map durante a iteração)
    const keysToDelete: string[] = [];
    Tower.threatTable.forEach((val, key) => {
      if (now - val.time > 3000) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => {
      Tower.threatTable.delete(key);
    });
    
    // 1. Verifica se algum campeão inimigo chamou agro batendo em aliados
    let threatChampion: Character | null = null;
    let minThreatDist = Infinity;
    
    Game.instance.entities.forEach((entity) => {
      // Se for campeão inimigo, vivo e dentro do raio de alcance
      if (entity.team !== this.team && (entity.name === 'Caitlyn' || entity.name === 'MasterYi') && entity.state !== 'DEAD') {
        const dist = this.position.distanceTo(entity.position);
        if (dist <= this.attackRange) {
          // Se esse campeão está na tabela de ameaça (atacou um aliado recentemente)
          if (Tower.threatTable.has(entity.id)) {
            if (dist < minThreatDist) {
              minThreatDist = dist;
              threatChampion = entity;
            }
          }
        }
      }
    });
    
    if (threatChampion) {
      this.target = threatChampion;
      return;
    }
    
    // Se o alvo atual ainda é válido, está no raio e não é campeão (ou não há nova ameaça), mantém o foco
    if (this.target && this.target.state !== 'DEAD') {
      const dist = this.position.distanceTo(this.target.position);
      if (dist <= this.attackRange) {
        // Se o alvo for minion, mantém. Se for campeão, verifica se há minions para resetar agro
        if (this.target.name.includes('Minion')) {
          return;
        }
      }
    }
    
    // 2. Busca Tropas (Minions) Inimigas
    let closestMinion: Character | null = null;
    let minMinionDist = Infinity;
    
    Game.instance.entities.forEach((entity) => {
      if (entity.team !== this.team && entity.name.includes('Minion') && entity.state !== 'DEAD') {
        const dist = this.position.distanceTo(entity.position);
        if (dist <= this.attackRange && dist < minMinionDist) {
          minMinionDist = dist;
          closestMinion = entity;
        }
      }
    });
    
    if (closestMinion) {
      this.target = closestMinion;
      return;
    }
    
    // 3. Busca Campeões Inimigos (se não houver minions)
    let closestChampion: Character | null = null;
    let minChampDist = Infinity;
    
    Game.instance.entities.forEach((entity) => {
      if (entity.team !== this.team && (entity.name === 'Caitlyn' || entity.name === 'MasterYi') && entity.state !== 'DEAD') {
        const dist = this.position.distanceTo(entity.position);
        if (dist <= this.attackRange && dist < minChampDist) {
          minChampDist = dist;
          closestChampion = entity;
        }
      }
    });
    
    this.target = closestChampion;
  }
  
  public update(deltaTime: number) {
    if (this.state === 'DEAD') {
      super.update(deltaTime);
      return;
    }
    
    // Animação do Cristal (Gira e flutua levemente)
    if (this.mesh) {
      const crystal = this.mesh.children[0];
      const ring = this.mesh.children[1];
      
      crystal.rotation.y += deltaTime * 0.8;
      crystal.position.y = this.height + Math.sin(performance.now() * 0.003) * 0.15;
      
      ring.rotation.z -= deltaTime * 0.5;
    }
    
    // Varredura periódica de alvos
    const now = performance.now() / 1000;
    if (now - this.lastScanTime >= this.scanInterval) {
      this.lastScanTime = now;
      this.selectTarget();
    }
    
    // Ataque
    if (this.target && this.target.state !== 'DEAD') {
      const dist = this.position.distanceTo(this.target.position);
      if (dist <= this.attackRange) {
        this.autoAttack(this.target, (p) => Game.instance.spawnProjectile(p));
      } else {
        this.target = null;
      }
    } else {
      this.target = null;
    }
    
    super.update(deltaTime);
  }
}
