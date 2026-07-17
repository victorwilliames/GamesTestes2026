# Como usar no Three.js

Instale loaders do Three.js normalmente e carregue os arquivos `.glb` com `GLTFLoader`.

```ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

loader.load('/assets/3d/glb/environment/full_arena_coliseum_blockout.glb', (gltf) => {
  const arena = gltf.scene;
  arena.scale.setScalar(1);
  scene.add(arena);
});
```

## Recomendação para mobile

```ts
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
```

Evite pós-processamento no começo. Use a arena `full_arena_coliseum_blockout.glb` como base visual, mas depois troque por módulos individuais se precisar otimizar draw calls.

## Sprites de UI e VFX

Use `THREE.TextureLoader` para carregar PNGs de VFX em planos transparentes:

```ts
const tex = new THREE.TextureLoader().load('/assets/2d/vfx/slash_arc_gold.png');
const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
const slash = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), mat);
scene.add(slash);
```

Para a UI mobile, use os PNGs diretamente em HTML/CSS por cima do canvas.
