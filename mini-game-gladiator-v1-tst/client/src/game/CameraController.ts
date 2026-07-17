import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private offset: THREE.Vector3;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      34, // FOV ideal para enquadrar a arena e personagens com escala perfeita
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.target = new THREE.Vector3(0, 0, 0);
    
    // Offset diagonal isométrico ajustado para aproximar e alinhar perfeitamente com print1
    this.offset = new THREE.Vector3(-11.5, 9.8, 11.5);

    this.updatePosition();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  public update(): void {
    this.updatePosition();
  }

  private updatePosition(): void {
    this.camera.position.copy(this.target).add(this.offset);
    this.camera.lookAt(this.target);
  }

  public setTarget(newTarget: THREE.Vector3): void {
    this.target.copy(newTarget);
  }

  public dispose(): void {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
