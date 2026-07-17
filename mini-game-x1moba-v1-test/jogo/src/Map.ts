import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface Obstacle {
  x: number;
  z: number;
  radius: number;
}

export class MapManager {
  public obstacles: Obstacle[] = [];
  public groundMesh: THREE.Object3D | null = null;
  public mapModel: THREE.Group | null = null;
  
  // Escala do mundo — todos os posicionamentos usam essa escala base
  // Personagens GLB já estão em ~0.035 scale, mapa precisa casar
  static readonly WORLD_SCALE = 0.29; // ratio 0.035/0.12
  
  // Posições pré-definidas para as Torres (Mid Lane diagonal)
  public towerPositions = {
    ally: [
      { x: -5.2, z: -5.2, type: 'outer' },
      { x: -10.2, z: -10.2, type: 'inner' },
      { x: -14.5, z: -14.5, type: 'nexus' }
    ],
    enemy: [
      { x: 5.2, z: 5.2, type: 'outer' },
      { x: 10.2, z: 10.2, type: 'inner' },
      { x: 14.5, z: 14.5, type: 'nexus' }
    ]
  };
  
  // Posições dos Monstros da Selva (Camps neutros nas laterais da rota)
  public jungleCamps = [
    { x: -10, z: 3, type: 'blue_buff', name: 'Blue Buff Aliado' },
    { x: -3, z: 7, type: 'razorbeaks', name: 'Gromp Aliado' },
    { x: 10, z: -3, type: 'red_buff', name: 'Red Buff Inimigo' },
    { x: 3, z: -7, type: 'krugs', name: 'Gromp Inimigo' }
  ];
  
  constructor(private scene: THREE.Scene) {
    this.createStaticObstacles();
  }
  
  // Define obstáculos circulares invisíveis para simular paredes do mapa
  private createStaticObstacles() {
    // Paredes da Jungle - Lateral Superior
    this.obstacles.push({ x: -7, z: 7, radius: 3.5 });
    this.obstacles.push({ x: 0, z: 9, radius: 3 });
    this.obstacles.push({ x: 7, z: 10, radius: 3.5 });
    
    // Paredes da Jungle - Lateral Inferior
    this.obstacles.push({ x: -7, z: -10, radius: 3.5 });
    this.obstacles.push({ x: 0, z: -9, radius: 3 });
    this.obstacles.push({ x: 7, z: -7, radius: 3.5 });
    
    // Obstáculos centrais
    this.obstacles.push({ x: -3, z: 3, radius: 1.5 });
    this.obstacles.push({ x: 3, z: -3, radius: 1.5 });
    
    // Nexos / Limites das bases
    this.obstacles.push({ x: -17, z: -17, radius: 3.5 });
    this.obstacles.push({ x: 17, z: 17, radius: 3.5 });
  }
  
  // Carrega o cenário 3D
  public load(onProgress: (percent: number) => void): Promise<void> {
    return new Promise<void>((resolve) => {
      const loader = new GLTFLoader();
      
      // Carrega o scene.gltf da pasta Mapa
      loader.load(
        './Mapa/5v5_game_map/scene.gltf',
        (gltf) => {
          this.mapModel = gltf.scene;
          
          // Escala do mapa proporcional aos personagens (0.035)
          this.mapModel.scale.set(0.035, 0.035, 0.035);
          this.mapModel.position.set(0, -0.15, 0);
          
          // Ativa sombras no mapa
          this.mapModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.receiveShadow = true;
              child.castShadow = true;
              
              // Otimiza materiais para melhor performance web
              if (child.material) {
                child.material.roughness = 0.8;
                child.material.metalness = 0.1;
              }
            }
          });
          
          this.scene.add(this.mapModel);
          
          // Cria o chão de raycast invisível para garantir cliques precisos
          const groundGeo = new THREE.PlaneGeometry(100, 100);
          const groundMat = new THREE.MeshBasicMaterial({ 
            visible: false, // Invisível, usado apenas para colisão matemática
            color: 0x000000 
          });
          
          const ground = new THREE.Mesh(groundGeo, groundMat);
          ground.rotation.x = -Math.PI / 2; // deitado horizontalmente
          ground.position.y = 0;
          this.scene.add(ground);
          this.groundMesh = ground;
          
          resolve();
        },
        (xhr) => {
          if (xhr.total > 0) {
            const percent = (xhr.loaded / xhr.total) * 100;
            onProgress(percent);
          }
        },
        (error) => {
          console.error('Erro ao carregar o mapa 3D:', error);
          // Fallback para chão visível se falhar
          this.createFallbackGround();
          resolve(); // Resolve mesmo com erro para não travar a aplicação
        }
      );
    });
  }
  
  private createFallbackGround() {
    console.warn('Usando cenário de fallback simplificado.');
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x142010,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.groundMesh = ground;
    
    // Adiciona grid para referência visual
    const grid = new THREE.GridHelper(60, 30, 0xc29d53, 0x1f3420);
    grid.position.y = 0.01;
    this.scene.add(grid);
  }
  
  // Resolve colisões circulares contra as paredes. 
  // Retorna a posição corrigida se houver colisão.
  public resolveCollision(pos: THREE.Vector3, entityRadius: number = 0.3): THREE.Vector3 {
    const corrected = pos.clone();
    
    // Limites extremos do mapa
    corrected.x = THREE.MathUtils.clamp(corrected.x, -18, 18);
    corrected.z = THREE.MathUtils.clamp(corrected.z, -18, 18);
    
    // Verifica colisão contra os círculos de parede
    for (const obs of this.obstacles) {
      const dx = corrected.x - obs.x;
      const dz = corrected.z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = obs.radius + entityRadius;
      
      if (dist < minDist) {
        // Empurra a entidade para fora do obstáculo
        const angle = Math.atan2(dz, dx);
        corrected.x = obs.x + Math.cos(angle) * minDist;
        corrected.z = obs.z + Math.sin(angle) * minDist;
      }
    }
    
    return corrected;
  }
}
