import * as THREE from 'three';
import { AssetLoader } from './AssetLoader';

export class Arena {
  private group: THREE.Group;
  private lights: THREE.PointLight[] = [];

  constructor(scene: THREE.Scene, assetLoader: AssetLoader) {
    this.group = new THREE.Group();
    scene.add(this.group);

    // 1. Instanciar o modelo completo da Arena Coliseu (GLB)
    const arenaModel = assetLoader.getModel('arena');
    arenaModel.position.set(0, 0, 0);
    
    // Configurar sombras e materiais para os meshes carregados
    arenaModel.traverse((child: THREE.Object3D) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Ajustar opacidade se for um portal ou grade, por exemplo
        if (mesh.name.toLowerCase().includes('glass') || mesh.name.toLowerCase().includes('water')) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = 0.5;
        }
      }
    });
    this.group.add(arenaModel);

    // 2. Configurar Luzes de Braseiro Dinâmicas
    // Os braseiros estão localizados nas 4 posições diagonais externas da arena
    this.createBrazierLights();

    // 3. Instanciar e Distribuir Props de Decoração (Alinhamento Visual com Print 1)
    try {
      const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
      const distance = 13.5;
      
      // Braseiros 3D
      angles.forEach((angle) => {
        const brazier = assetLoader.getModel('brazier');
        brazier.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
        brazier.scale.setScalar(1.2);
        brazier.traverse(c => { if ((c as any).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        this.group.add(brazier);
      });

      // Barris de madeira
      const barrelPositions = [
        { x: -9.5, z: -9.5, rot: 0.2 },
        { x: -8.8, z: -10.3, rot: 1.5 },
        { x: -10.2, z: -8.7, rot: -0.8 }
      ];
      barrelPositions.forEach((pos) => {
        const barrel = assetLoader.getModel('barrel');
        barrel.position.set(pos.x, 0, pos.z);
        barrel.rotation.y = pos.rot;
        barrel.scale.setScalar(1.25);
        barrel.traverse(c => { if ((c as any).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        this.group.add(barrel);
      });

      // Caixotes
      const cratePositions = [
        { x: -8.0, y: 0, z: -9.5, rot: 0.5, scale: 1.2 },
        { x: -9.1, y: 0.9, z: -9.5, rot: -0.4, scale: 1.05 }
      ];
      cratePositions.forEach((pos) => {
        const crate = assetLoader.getModel('crate');
        crate.position.set(pos.x, pos.y, pos.z);
        crate.rotation.y = pos.rot;
        crate.scale.setScalar(pos.scale);
        crate.traverse(c => { if ((c as any).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        this.group.add(crate);
      });

      // Suportes de Armas
      const spearRack = assetLoader.getModel('spear_rack');
      spearRack.position.set(-11.0, 0, -4.5);
      spearRack.rotation.y = Math.PI / 3;
      spearRack.scale.setScalar(1.2);
      spearRack.traverse(c => { if ((c as any).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.group.add(spearRack);

      const weaponRack = assetLoader.getModel('weapon_rack');
      weaponRack.position.set(-11.5, 0, -2.5);
      weaponRack.rotation.y = Math.PI / 4;
      weaponRack.scale.setScalar(1.2);
      weaponRack.traverse(c => { if ((c as any).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.group.add(weaponRack);

      // Pilares quebrados
      const pillar1 = assetLoader.getModel('broken_pillar');
      pillar1.position.set(-12.0, 0, 6.0);
      pillar1.rotation.y = 1.2;
      pillar1.scale.setScalar(1.3);
      pillar1.traverse(c => { if ((c as any).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.group.add(pillar1);

      const pillar2 = assetLoader.getModel('broken_pillar');
      pillar2.position.set(12.0, 0, -6.0);
      pillar2.rotation.y = -0.5;
      pillar2.scale.setScalar(1.3);
      pillar2.traverse(c => { if ((c as any).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      this.group.add(pillar2);

      // Banners vermelhos de parede
      const bannerAngles = [Math.PI / 2, 5 * Math.PI / 8, 3 * Math.PI / 8, 7 * Math.PI / 8, Math.PI / 8];
      const bannerWallDist = 14.8;
      const bannerHeight = 3.2;
      bannerAngles.forEach((angle) => {
        const banner = assetLoader.getModel('banner');
        const bx = Math.cos(angle) * bannerWallDist;
        const bz = Math.sin(angle) * bannerWallDist;
        banner.position.set(bx, bannerHeight, bz);
        banner.lookAt(0, bannerHeight, 0);
        banner.rotation.y += Math.PI;
        banner.scale.set(1.4, 1.4, 1.4);
        banner.traverse(c => { if ((c as any).isMesh) { c.castShadow = true; c.receiveShadow = true; } });
        this.group.add(banner);
      });

    } catch (err) {
      console.warn('[Arena] Erro ao carregar/posicionar props de decoração:', err);
    }
  }

  private createBrazierLights(): void {
    const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
    const distance = 13.5;
    const height = 2.2;

    angles.forEach((angle) => {
      // Luz pontual quente (laranja de chama)
      const light = new THREE.PointLight('#ff6a00', 3.0, 14);
      light.position.set(
        Math.cos(angle) * distance,
        height,
        Math.sin(angle) * distance
      );
      
      light.castShadow = true;
      light.shadow.bias = -0.002;
      light.shadow.mapSize.width = 512;
      light.shadow.mapSize.height = 512;

      this.group.add(light);
      this.lights.push(light);
    });
  }

  public update(time: number): void {
    // Simular o efeito trêmulo do fogo animando a intensidade das PointLights
    this.lights.forEach((light, idx) => {
      const flicker = Math.sin(time * 12 + idx * 3.1) * 0.45;
      light.intensity = 3.0 + flicker;
    });
  }
}
