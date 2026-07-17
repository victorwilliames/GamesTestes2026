import * as THREE from 'three';

export class Entity {
  public position: THREE.Vector3 = new THREE.Vector3();
  public rotation: THREE.Euler = new THREE.Euler();
  public mesh: THREE.Group | THREE.Mesh | null = null;
  public id: string;
  public active: boolean = true;
  
  constructor() {
    this.id = Math.random().toString(36).substring(2, 9);
  }
  
  public update(_deltaTime: number) {
    if (this.mesh && this.active) {
      this.mesh.position.copy(this.position);
      this.mesh.rotation.copy(this.rotation);
    }
  }
  
  public destroy(scene: THREE.Scene) {
    this.active = false;
    if (this.mesh) {
      scene.remove(this.mesh);
      // Libera geometria e materiais da memória
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.mesh = null;
    }
  }
}
