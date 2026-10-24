import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetLoader {
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private audioLoader: THREE.AudioLoader;

  // Cache de assets carregados
  public models: Map<string, THREE.Group> = new Map();
  public textures: Map<string, THREE.Texture> = new Map();
  public audios: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();
  }

  public loadAll(
    onProgress: (progress: number) => void,
    onItemLoad?: (url: string, loaded: number, total: number) => void
  ): Promise<void> {
    const modelsToLoad = {
      arena: './assets/3d/glb/environment/full_arena_coliseum_blockout.glb',
      dummy: './assets/3d/glb/environment/training_dummy_target.glb',
      player: './assets/3d/glb/characters/player_stick_blue_sword.glb',
      enemy_sword: './assets/3d/glb/characters/enemy_stick_red_sword.glb',
      enemy_spear: './assets/3d/glb/characters/enemy_stick_red_spear.glb',
      enemy_shield: './assets/3d/glb/characters/enemy_stick_red_shield.glb',
      // Novos props de decoração da arena
      brazier: './assets/3d/glb/environment/brazier_fire_lowpoly.glb',
      barrel: './assets/3d/glb/environment/wooden_barrel.glb',
      crate: './assets/3d/glb/environment/wooden_crate_lowpoly.glb',
      banner: './assets/3d/glb/environment/red_banner_gold.glb',
      spear_rack: './assets/3d/glb/environment/spear_rack.glb',
      weapon_rack: './assets/3d/glb/environment/weapon_rack.glb',
      broken_pillar: './assets/3d/glb/environment/pillar_broken.glb'
    };

    const texturesToLoad = {
      slash_light: './assets/2d/vfx/slash_arc_gold.png',
      slash_heavy: './assets/2d/vfx/slash_arc_gold_heavy.png',
      hit_spark: './assets/2d/vfx/hit_spark_gold.png',
      blood_puddle: './assets/2d/vfx/blood_puddle.png',
      shadow_blob: './assets/2d/vfx/soft_shadow_blob.png'
    };

    const audiosToLoad = {
      slash_light: './assets/audio/sfx/slash_light.wav',
      slash_heavy: './assets/audio/sfx/slash_heavy.wav',
      hit_impact: './assets/audio/sfx/hit_impact.wav',
      dash: './assets/audio/sfx/dash.wav',
      heal: './assets/audio/sfx/heal.wav',
      potion: './assets/audio/sfx/potion_use.wav',
      music_arena: './assets/audio/music/arena_ambience_loop.wav'
    };

    const totalItems = Object.keys(modelsToLoad).length + Object.keys(texturesToLoad).length + Object.keys(audiosToLoad).length;
    let loadedItems = 0;

    const incrementProgress = (url: string) => {
      loadedItems++;
      onProgress(loadedItems / totalItems);
      if (onItemLoad) {
        onItemLoad(url, loadedItems, totalItems);
      }
    };

    const promises: Promise<void>[] = [];

    // 1. Carregar Modelos GLB
    for (const [key, path] of Object.entries(modelsToLoad)) {
      promises.push(
        new Promise<void>((resolve, reject) => {
          this.gltfLoader.load(
            path,
            (gltf: GLTF) => {
              this.models.set(key, gltf.scene);
              incrementProgress(path);
              resolve();
            },
            undefined,
            (err: any) => reject(new Error(`Erro ao carregar modelo ${key} (${path}): ${err.message || err}`))
          );
        })
      );
    }

    // 2. Carregar Texturas VFX
    for (const [key, path] of Object.entries(texturesToLoad)) {
      promises.push(
        new Promise<void>((resolve, reject) => {
          this.textureLoader.load(
            path,
            (texture) => {
              this.textures.set(key, texture);
              incrementProgress(path);
              resolve();
            },
            undefined,
            () => reject(new Error(`Erro ao carregar textura ${key} (${path})`))
          );
        })
      );
    }

    // 3. Carregar Áudios e aguardar decodificação
    for (const [key, path] of Object.entries(audiosToLoad)) {
      promises.push(
        new Promise<void>((resolve, reject) => {
          this.audioLoader.load(
            path,
            (buffer) => {
              this.audios.set(key, buffer);
              incrementProgress(path);
              resolve();
            },
            undefined,
            (err: any) => reject(new Error(`Erro ao carregar áudio ${key} (${path}): ${err.message || err}`))
          );
        })
      );
    }

    return Promise.all(promises).then(() => {
      console.log('[AssetLoader] Todos os recursos foram carregados e decodificados.');
    });
  }

  public getModel(key: string): THREE.Group {
    const original = this.models.get(key);
    if (!original) {
      throw new Error(`Modelo não encontrado: ${key}`);
    }
    return original.clone();
  }

  public getTexture(key: string): THREE.Texture {
    const tex = this.textures.get(key);
    if (!tex) {
      throw new Error(`Textura não encontrada: ${key}`);
    }
    return tex;
  }

  public getAudio(key: string): AudioBuffer {
    const buffer = this.audios.get(key);
    if (!buffer) {
      throw new Error(`Áudio não encontrado: ${key}`);
    }
    return buffer;
  }
}
