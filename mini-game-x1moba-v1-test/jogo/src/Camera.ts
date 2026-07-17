import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public target: THREE.Vector3 = new THREE.Vector3();
  public isLocked: boolean = true;
  
  private zoomLevel: number = 1.0;
  private targetZoomLevel: number = 1.0;
  private minZoom: number = 0.5;
  private maxZoom: number = 1.6;
  
  // Distância e ângulo da câmera isométrica clássica do LoL
  // A câmera é inclinada para baixo (eixo Y) e afastada no eixo Z
  private offset: THREE.Vector3 = new THREE.Vector3(0, 24, 21); 
  private moveSpeed: number = 45; // Velocidade da câmera solta pelas bordas
  
  constructor() {
    // Usamos PerspectiveCamera com um FOV médio para dar sensação tridimensional correta
    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 1, 1000);
    this.resetToTarget(new THREE.Vector3(0, 0, 0));
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: true });
  }
  
  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
  
  private onWheel(e: WheelEvent) {
    this.targetZoomLevel += e.deltaY * 0.001;
    this.targetZoomLevel = THREE.MathUtils.clamp(this.targetZoomLevel, this.minZoom, this.maxZoom);
  }
  
  public toggleLock() {
    this.isLocked = !this.isLocked;
  }
  
  public resetToTarget(targetPos: THREE.Vector3) {
    this.target.copy(targetPos);
    this.updateCameraPosition();
  }
  
  private updateCameraPosition() {
    const currentOffset = this.offset.clone().multiplyScalar(this.zoomLevel);
    this.camera.position.copy(this.target).add(currentOffset);
    this.camera.lookAt(this.target);
  }
  
  public update(deltaTime: number, playerPos: THREE.Vector3, mouseX: number, mouseY: number) {
    // Suaviza o nível do zoom
    this.zoomLevel = THREE.MathUtils.lerp(this.zoomLevel, this.targetZoomLevel, 0.1);
    
    if (this.isLocked) {
      // Interpolação suave para seguir a posição do jogador
      this.target.lerp(playerPos, 0.1);
    } else {
      // Câmera Solta: Move-se ao posicionar o mouse próximo às bordas da tela
      const edgeSize = 40; // distância em pixels para iniciar a rolagem
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const move = new THREE.Vector3();
      
      // Direções da câmera projetadas no plano X/Z horizontal do jogo
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
      forward.y = 0;
      forward.normalize();
      
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
      right.y = 0;
      right.normalize();
      
      if (mouseX < edgeSize && mouseX >= 0) {
        move.addScaledVector(right, -1);
      } else if (mouseX > width - edgeSize && mouseX <= width) {
        move.addScaledVector(right, 1);
      }
      
      if (mouseY < edgeSize && mouseY >= 0) {
        move.addScaledVector(forward, 1);
      } else if (mouseY > height - edgeSize && mouseY <= height) {
        move.addScaledVector(forward, -1);
      }
      
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(this.moveSpeed * deltaTime);
        this.target.add(move);
        
        // Limita a câmera para não sair dos limites do mapa 5v5
        this.target.x = THREE.MathUtils.clamp(this.target.x, -18, 18);
        this.target.z = THREE.MathUtils.clamp(this.target.z, -18, 18);
      }
    }
    
    this.updateCameraPosition();
  }
}
