import * as THREE from 'three';

export class Lighting {
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;

  constructor(scene: THREE.Scene) {
    // 1. Luz Ambiente: tom avermelhado terroso para dar calor às sombras
    this.ambientLight = new THREE.AmbientLight('#4d3a30', 0.95);
    scene.add(this.ambientLight);

    // 2. Luz de Hemisfério: simula claridade do céu e reflexo do chão
    this.hemiLight = new THREE.HemisphereLight('#ffb870', '#221814', 0.85);
    scene.add(this.hemiLight);

    // 3. Sol Poente (Golden Hour): luz principal vinda do canto esquerdo da tela
    this.sunLight = new THREE.DirectionalLight('#ffa44f', 4.5);
    this.sunLight.position.set(-18, 12, 10); // Ângulo diagonal que projeta sombras longas idênticas ao print1
    
    // Configurações de sombra direcional de alta qualidade
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 40;
    
    const d = 16;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;

    scene.add(this.sunLight);

    // 4. Luz de Recorte (Rim Light): preenchimento azulado de fundo para criar contraste estético
    this.rimLight = new THREE.DirectionalLight('#8bc2ff', 1.8);
    this.rimLight.position.set(18, 10, -10);
    scene.add(this.rimLight);
  }
}
