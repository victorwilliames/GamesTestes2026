import * as THREE from 'three';

interface ActiveVFX {
  mesh: THREE.Mesh;
  duration: number;
  maxDuration: number;
  update: (progress: number) => void;
  onComplete?: () => void;
}

export class VFXManager {
  private scene: THREE.Scene;
  private textures: Map<string, THREE.Texture>;
  private activeVFXList: ActiveVFX[] = [];

  constructor(scene: THREE.Scene, textures: Map<string, THREE.Texture>) {
    this.scene = scene;
    this.textures = textures;
  }

  public update(deltaTime: number): void {
    for (let i = this.activeVFXList.length - 1; i >= 0; i--) {
      const vfx = this.activeVFXList[i];
      vfx.duration += deltaTime;

      const progress = Math.min(1.0, vfx.duration / vfx.maxDuration);
      vfx.update(progress);

      if (vfx.duration >= vfx.maxDuration) {
        if (vfx.onComplete) vfx.onComplete();
        this.scene.remove(vfx.mesh);
        vfx.mesh.geometry.dispose();
        if (Array.isArray(vfx.mesh.material)) {
          vfx.mesh.material.forEach(m => m.dispose());
        } else {
          vfx.mesh.material.dispose();
        }
        this.activeVFXList.splice(i, 1);
      }
    }
  }

  /**
   * Dispara o arco luminoso dourado do ataque
   */
  public spawnSlash(position: THREE.Vector3, rotationY: number, isHeavy: boolean): void {
    const textureKey = isHeavy ? 'slash_heavy' : 'slash_light';
    const tex = this.textures.get(textureKey);
    if (!tex) return;

    // Criar plano horizontal
    const size = isHeavy ? 4.5 : 3.0;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geo, mat);
    
    // Posicionar na frente do jogador e levemente acima do chão
    mesh.position.copy(position);
    mesh.position.y = 1.0; // Altura da cintura do stickman
    
    // Rotacionar para deitar no plano horizontal e virar para a direção do player
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rotationY; // Angulação do ataque

    this.scene.add(mesh);

    this.activeVFXList.push({
      mesh,
      duration: 0,
      maxDuration: 0.18, // s
      update: (progress) => {
        // Escala cresce e depois some de leve
        const scaleVal = 0.8 + progress * 0.4;
        mesh.scale.set(scaleVal, scaleVal, 1.0);
        
        // Esmaecimento gradual de opacidade
        mat.opacity = 1.0 - progress;
      }
    });
  }

  /**
   * Dispara faíscas brilhantes ao atingir o inimigo/dummy
   */
  public spawnHitSpark(position: THREE.Vector3): void {
    const tex = this.textures.get('hit_spark');
    if (!tex) return;

    // Criar painel de partículas voltado para a câmera (Billboard)
    const geo = new THREE.PlaneGeometry(1.5, 1.5);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.position.y += 0.5; // Centralizar altura do impacto

    this.scene.add(mesh);

    this.activeVFXList.push({
      mesh,
      duration: 0,
      maxDuration: 0.15,
      update: (progress) => {
        // Billboard rotation para encarar a câmera aproximada (isométrica)
        mesh.rotation.y += progress * 0.1;
        mesh.scale.setScalar(1.2 - progress * 0.6);
        mat.opacity = 1.0 - progress;
      }
    });
  }

  /**
   * Deixa uma poça de sangue permanente no chão da arena
   */
  public spawnBloodSplatter(position: THREE.Vector3): void {
    const tex = this.textures.get('blood_puddle');
    if (!tex) return;

    const size = 0.5 + Math.random() * 0.8;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.position.y = 0.005; // Levemente acima da areia
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.random() * Math.PI * 2;

    this.scene.add(mesh);

    // Sumir muito lentamente ou manter permanente na cena
    this.activeVFXList.push({
      mesh,
      duration: 0,
      maxDuration: 15.0, // some depois de 15 segundos para não poluir a memória
      update: (progress) => {
        if (progress > 0.8) {
          // Desaparece só nos últimos 20% do tempo
          mat.opacity = (1.0 - progress) * 5.0 * 0.8;
        }
      }
    });
  }
}
