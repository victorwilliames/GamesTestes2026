import * as THREE from 'three';
import { ProceduralTextures } from './Textures.js';

export class Arena {
  constructor(scene) {
    this.scene = scene;
    
    // Load procedural textures
    this.textures = {
      sand: ProceduralTextures.createSandTexture(),
      stone: ProceduralTextures.createStoneWallTexture(),
      banner: ProceduralTextures.createBannerTexture(),
      blood: ProceduralTextures.createBloodTexture()
    };
    
    this.lights = [];
    this.build();
  }

  build() {
    this.createFloor();
    this.createWalls();
    this.createProps();
    this.createSpectators();
  }

  createFloor() {
    const floorRadius = 26;
    
    // Floor geometry
    const floorGeo = new THREE.CircleGeometry(floorRadius, 64);
    
    // Sand Material
    const sandMaterial = new THREE.MeshStandardMaterial({
      map: this.textures.sand.diffuse,
      normalMap: this.textures.sand.normal,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.95,
      metalness: 0.05
    });
    
    const floor = new THREE.Mesh(floorGeo, sandMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Add Blood Splatter Decals
    const bloodMat = new THREE.MeshBasicMaterial({
      map: this.textures.blood,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      opacity: 0.8
    });
    
    // We can place a few blood planes slightly above the floor
    const bloodGeo = new THREE.PlaneGeometry(52, 52);
    const bloodDecal = new THREE.Mesh(bloodGeo, bloodMat);
    bloodDecal.rotation.x = -Math.PI / 2;
    bloodDecal.position.set(0, 0.01, 0); // slightly offset to prevent z-fighting
    this.scene.add(bloodDecal);
  }

  createWalls() {
    const wallRadius = 24;
    const numSegments = 24; // Circular segments
    
    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.textures.stone.diffuse,
      normalMap: this.textures.stone.normal,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#4e3629',
      roughness: 0.9
    });
    
    const ironMat = new THREE.MeshStandardMaterial({
      color: '#2e2e2e',
      roughness: 0.5,
      metalness: 0.8
    });
    
    const wallGroup = new THREE.Group();
    
    // 1. Base Wall (Circular barrier)
    const baseWallGeo = new THREE.CylinderGeometry(wallRadius + 0.5, wallRadius + 0.8, 2.5, 64, 1, true);
    const baseWall = new THREE.Mesh(baseWallGeo, stoneMat);
    baseWall.position.y = 1.25;
    baseWall.receiveShadow = true;
    baseWall.castShadow = true;
    wallGroup.add(baseWall);
    
    // Top railing on the base wall
    const railingGeo = new THREE.TorusGeometry(wallRadius + 0.6, 0.2, 8, 64);
    const railing = new THREE.Mesh(railingGeo, stoneMat);
    railing.rotation.x = Math.PI / 2;
    railing.position.y = 2.5;
    railing.receiveShadow = true;
    wallGroup.add(railing);

    // 2. High Outer Colosseum Wall and Columns
    for (let i = 0; i < numSegments; i++) {
      const angle = (i / numSegments) * Math.PI * 2;
      const x = Math.cos(angle) * (wallRadius + 2.5);
      const z = Math.sin(angle) * (wallRadius + 2.5);
      
      // Pillars
      const pillarHeight = i % 4 === 0 ? 9 : 7;
      const pillarGeo = new THREE.CylinderGeometry(0.8, 1, pillarHeight, 8);
      const pillar = new THREE.Mesh(pillarGeo, stoneMat);
      pillar.position.set(x, pillarHeight / 2, z);
      pillar.rotation.y = -angle;
      pillar.castShadow = false;
      pillar.receiveShadow = true;
      wallGroup.add(pillar);
      
      // Connect pillars with arches (except for the gate area at the back, angle near Math.PI/2)
      // Angle ~ 1.57 is the back of the arena
      const isGateArea = Math.abs(angle - Math.PI / 2) < 0.35;
      
      if (!isGateArea) {
        // High walls between pillars
        const wallSegmentGeo = new THREE.BoxGeometry(6.5, 5, 1.2);
        const wallSegment = new THREE.Mesh(wallSegmentGeo, stoneMat);
        
        // Position mid-way between current and next pillar
        const nextAngle = ((i + 1) / numSegments) * Math.PI * 2;
        const midAngle = (angle + nextAngle) / 2;
        const wx = Math.cos(midAngle) * (wallRadius + 2.8);
        const wz = Math.sin(midAngle) * (wallRadius + 2.8);
        
        wallSegment.position.set(wx, 2.5, wz);
        wallSegment.rotation.y = -midAngle + Math.PI / 2;
        wallSegment.castShadow = false;
        wallSegment.receiveShadow = true;
        wallGroup.add(wallSegment);
        
        // Add red banners on some pillars (every 4th pillar)
        if (i % 4 === 0) {
          const bannerGeo = new THREE.PlaneGeometry(1.6, 4.2);
          const bannerMat = new THREE.MeshStandardMaterial({
            map: this.textures.banner,
            side: THREE.DoubleSide,
            roughness: 0.95
          });
          const banner = new THREE.Mesh(bannerGeo, bannerMat);
          // Position hanging slightly in front of the pillar
          const bx = Math.cos(angle) * (wallRadius + 1.6);
          const bz = Math.sin(angle) * (wallRadius + 1.6);
          banner.position.set(bx, 5.0, bz);
          banner.rotation.y = -angle + Math.PI;
          banner.castShadow = false;
          wallGroup.add(banner);
        }
        
        // Add fire torches on some pillars
        if (i % 4 === 2) {
          this.createTorch(x, pillarHeight - 0.5, z, angle, wallGroup);
        }
      } else {
        // Recreate the Arch Gate from the print
        // Columns for the gate
        const gatePillarGeo = new THREE.BoxGeometry(1.5, 9, 1.5);
        const gp1 = new THREE.Mesh(gatePillarGeo, stoneMat);
        const gp2 = new THREE.Mesh(gatePillarGeo, stoneMat);
        
        const offsetAngle = 0.16;
        const gpx1 = Math.cos(angle - offsetAngle) * (wallRadius + 2.5);
        const gpz1 = Math.sin(angle - offsetAngle) * (wallRadius + 2.5);
        const gpx2 = Math.cos(angle + offsetAngle) * (wallRadius + 2.5);
        const gpz2 = Math.sin(angle + offsetAngle) * (wallRadius + 2.5);
        
        gp1.position.set(gpx1, 4.5, gpz1);
        gp1.rotation.y = -angle;
        gp2.position.set(gpx2, 4.5, gpz2);
        gp2.rotation.y = -angle;
        gp1.castShadow = false;
        gp2.castShadow = false;
        wallGroup.add(gp1, gp2);
        
        // Arch top block
        const archTopGeo = new THREE.BoxGeometry(5.2, 2.5, 1.8);
        const archTop = new THREE.Mesh(archTopGeo, stoneMat);
        archTop.position.set(x, 9, z);
        archTop.rotation.y = -angle + Math.PI / 2;
        archTop.castShadow = false;
        wallGroup.add(archTop);
        
        // Metal Gate Doors (Iron Bars)
        const gateW = 3.2;
        const gateH = 6.5;
        const gateGeo = new THREE.BoxGeometry(gateW, gateH, 0.1);
        const gateMesh = new THREE.Mesh(gateGeo, ironMat);
        gateMesh.position.set(x, gateH / 2, z);
        gateMesh.rotation.y = -angle + Math.PI / 2;
        wallGroup.add(gateMesh);
        
        // Add red banners on both sides of the gate
        const bannerMat = new THREE.MeshStandardMaterial({
          map: this.textures.banner,
          side: THREE.DoubleSide
        });
        const bannerGeo = new THREE.PlaneGeometry(1.6, 4.2);
        const b1 = new THREE.Mesh(bannerGeo, bannerMat);
        const b2 = new THREE.Mesh(bannerGeo, bannerMat);
        
        b1.position.set(Math.cos(angle - offsetAngle - 0.05) * (wallRadius + 1.5), 5.5, Math.sin(angle - offsetAngle - 0.05) * (wallRadius + 1.5));
        b1.rotation.y = -(angle - offsetAngle - 0.05) + Math.PI;
        
        b2.position.set(Math.cos(angle + offsetAngle + 0.05) * (wallRadius + 1.5), 5.5, Math.sin(angle + offsetAngle + 0.05) * (wallRadius + 1.5));
        b2.rotation.y = -(angle + offsetAngle + 0.05) + Math.PI;
        
        b1.castShadow = false;
        b2.castShadow = false;
        wallGroup.add(b1, b2);
      }
    }
    
    this.scene.add(wallGroup);
  }

  createTorch(x, y, z, angle, group) {
    // Torch bracket
    const bracketGeo = new THREE.BoxGeometry(0.2, 0.2, 0.8);
    const bracketMat = new THREE.MeshStandardMaterial({ color: '#2a2a2a', metalness: 0.8 });
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    
    // Offset slightly towards the inside of the arena
    const ox = Math.cos(angle) * -0.9;
    const oz = Math.sin(angle) * -0.9;
    
    bracket.position.set(x + ox, y, z + oz);
    bracket.rotation.y = -angle;
    group.add(bracket);
    
    // Torch bowl/cage
    const bowlGeo = new THREE.CylinderGeometry(0.4, 0.2, 0.5, 6);
    const bowl = new THREE.Mesh(bowlGeo, bracketMat);
    bowl.position.set(x + ox * 1.5, y + 0.3, z + oz * 1.5);
    group.add(bowl);
    
    // Flame mesh (glowing cone)
    const flameGeo = new THREE.ConeGeometry(0.3, 0.8, 6);
    const flameMat = new THREE.MeshBasicMaterial({
      color: '#ff7700',
      transparent: true,
      opacity: 0.95
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(x + ox * 1.5, y + 0.8, z + oz * 1.5);
    group.add(flame);
    
    // Animated scale helper
    flame.userData = { timeOffset: Math.random() * 100 };
    this.scene.userData = this.scene.userData || {};
    this.scene.userData.torches = this.scene.userData.torches || [];
    this.scene.userData.torches.push(flame);
    
    // Torch light (PointLight)
    const torchLight = new THREE.PointLight('#ff7a00', 4.0, 12);
    torchLight.position.set(x + ox * 1.5, y + 1.0, z + oz * 1.5);
    torchLight.castShadow = false;
    
    group.add(torchLight);
    this.lights.push(torchLight);
  }

  createProps() {
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#5c4033', // Dark wood
      roughness: 0.9
    });
    
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: '#3d251d',
      roughness: 0.95
    });
    
    // 1. Center Wooden Target Dummy
    const dummyGroup = new THREE.Group();
    dummyGroup.position.set(1.5, 0, -1.0); // Slightly off center as in the print
    
    // Base stand
    const baseGeo = new THREE.CylinderGeometry(0.8, 1.0, 0.2, 12);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.y = 0.1;
    base.receiveShadow = true;
    dummyGroup.add(base);
    
    // Main post
    const postGeo = new THREE.CylinderGeometry(0.2, 0.25, 3.2, 10);
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.y = 1.7;
    post.castShadow = true;
    post.receiveShadow = true;
    dummyGroup.add(post);
    
    // Head block
    const headGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.7, 10);
    const head = new THREE.Mesh(headGeo, woodMat);
    head.position.y = 3.55;
    head.castShadow = true;
    dummyGroup.add(head);
    
    // Arms/Crossbar
    const armGeo = new THREE.BoxGeometry(2.0, 0.3, 0.3);
    const arm = new THREE.Mesh(armGeo, woodMat);
    arm.position.y = 2.4;
    arm.castShadow = true;
    dummyGroup.add(arm);
    
    // Target board (Disc on chest)
    const targetGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16);
    targetGeo.rotateX(Math.PI / 2);
    
    // Paint target rings on canvas
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = 64;
    targetCanvas.height = 64;
    const tCtx = targetCanvas.getContext('2d');
    tCtx.fillStyle = '#dbb887'; // straw wood color
    tCtx.fillRect(0,0,64,64);
    tCtx.lineWidth = 4;
    tCtx.strokeStyle = '#8b0000'; // red target ring
    tCtx.beginPath();
    tCtx.arc(32, 32, 24, 0, Math.PI * 2);
    tCtx.stroke();
    tCtx.fillStyle = '#8b0000';
    tCtx.beginPath();
    tCtx.arc(32, 32, 10, 0, Math.PI * 2);
    tCtx.fill();
    
    const targetMat = new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(targetCanvas),
      roughness: 0.9
    });
    
    const target = new THREE.Mesh(targetGeo, targetMat);
    target.position.set(-0.05, 2.0, 0.25);
    target.rotation.y = Math.PI / 12; // tilted slightly
    target.castShadow = true;
    dummyGroup.add(target);
    
    this.scene.add(dummyGroup);
    
    // 2. Weapon Racks (Left side of the screen)
    // Left Weapon Rack
    this.createWeaponRack(-12, 0, 5, Math.PI / 3);
    
    // Wooden barrels/boxes
    this.createBarrel(-10, 0, 8);
    this.createBarrel(16, 0, -18);
    this.createBarrel(18, 0, -16);
  }

  createWeaponRack(x, y, z, rot) {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(x, y, z);
    rackGroup.rotation.y = rot;
    
    const woodMat = new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.9 });
    const steelMat = new THREE.MeshStandardMaterial({ color: '#a0a0a0', metalness: 0.7, roughness: 0.4 });
    
    // Legs
    const legGeo = new THREE.BoxGeometry(0.2, 2.5, 0.8);
    const leg1 = new THREE.Mesh(legGeo, woodMat);
    const leg2 = new THREE.Mesh(legGeo, woodMat);
    leg1.position.set(-2, 1.25, 0);
    leg2.position.set(2, 1.25, 0);
    leg1.castShadow = true;
    leg2.castShadow = true;
    rackGroup.add(leg1, leg2);
    
    // Crossbars
    const barGeo = new THREE.BoxGeometry(4.2, 0.2, 0.2);
    const topBar = new THREE.Mesh(barGeo, woodMat);
    const bottomBar = new THREE.Mesh(barGeo, woodMat);
    topBar.position.set(0, 2.0, 0);
    bottomBar.position.set(0, 0.6, 0);
    topBar.castShadow = true;
    bottomBar.castShadow = true;
    rackGroup.add(topBar, bottomBar);
    
    // Place some spears leaning on the rack
    for (let i = 0; i < 5; i++) {
      const spearGroup = new THREE.Group();
      // Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6);
      const shaft = new THREE.Mesh(shaftGeo, woodMat);
      shaft.position.y = 1.7;
      shaft.castShadow = true;
      spearGroup.add(shaft);
      
      // Tip
      const tipGeo = new THREE.ConeGeometry(0.12, 0.5, 4);
      const tip = new THREE.Mesh(tipGeo, steelMat);
      tip.position.y = 3.55;
      tip.castShadow = true;
      spearGroup.add(tip);
      
      // Leaning position
      const offset = -1.2 + i * 0.6;
      spearGroup.position.set(offset, 0, 0.1);
      spearGroup.rotation.z = 0.08 * (i - 2); // fan out slightly
      spearGroup.rotation.x = -0.15; // lean back
      
      rackGroup.add(spearGroup);
    }
    
    // Add a round shield leaning against the base
    const shieldGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
    shieldGeo.rotateX(Math.PI / 2);
    
    const shieldWoodMat = new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 0.85 });
    const shieldMetalMat = new THREE.MeshStandardMaterial({ color: '#cc9933', metalness: 0.9, roughness: 0.2 });
    
    const shield = new THREE.Mesh(shieldGeo, shieldWoodMat);
    shield.position.set(1.0, 0.8, 0.4);
    shield.rotation.set(0.2, -0.4, 0.3);
    shield.castShadow = true;
    
    // Shield rim
    const rimGeo = new THREE.TorusGeometry(0.78, 0.06, 8, 24);
    const rim = new THREE.Mesh(rimGeo, shieldMetalMat);
    rim.position.z = 0.06;
    shield.add(rim);
    
    // Shield center boss
    const bossGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const boss = new THREE.Mesh(bossGeo, shieldMetalMat);
    boss.position.z = 0.06;
    boss.scale.z = 0.5;
    shield.add(boss);
    
    rackGroup.add(shield);
    this.scene.add(rackGroup);
  }

  createBarrel(x, y, z) {
    const barrelGroup = new THREE.Group();
    barrelGroup.position.set(x, y, z);
    
    const woodMat = new THREE.MeshStandardMaterial({ color: '#6e473b', roughness: 0.95 });
    const steelMat = new THREE.MeshStandardMaterial({ color: '#3a3a3a', metalness: 0.7, roughness: 0.5 });
    
    // Barrel body
    const bodyGeo = new THREE.CylinderGeometry(0.7, 0.9, 2.0, 12);
    const body = new THREE.Mesh(bodyGeo, woodMat);
    body.position.y = 1.0;
    body.castShadow = true;
    body.receiveShadow = true;
    barrelGroup.add(body);
    
    // Metal rings
    const ringGeo1 = new THREE.TorusGeometry(0.85, 0.04, 6, 16);
    const ring1 = new THREE.Mesh(ringGeo1, steelMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.4;
    
    const ringGeo2 = new THREE.TorusGeometry(0.85, 0.04, 6, 16);
    const ring2 = new THREE.Mesh(ringGeo2, steelMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 1.6;
    
    barrelGroup.add(ring1, ring2);
    this.scene.add(barrelGroup);
  }

  createSpectators() {
    // To represent the crowd in the background stands as seen in the print,
    // we can create a series of stepped rings (seats) in the background.
    // And populate them with simple billboard/sprite-like shapes, or tiny low-poly black sphere/stickmen.
    const standGroup = new THREE.Group();
    
    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.textures.stone.diffuse,
      normalMap: this.textures.stone.normal,
      roughness: 0.9
    });
    
    const rows = 4;
    const startRadius = 28;
    const stepW = 1.6;
    const stepH = 1.0;
    
    for (let r = 0; r < rows; r++) {
      const radius = startRadius + r * stepW;
      const height = 4.0 + r * stepH;
      
      const stepGeo = new THREE.CylinderGeometry(radius, radius + stepW, stepH, 64, 1, true);
      const step = new THREE.Mesh(stepGeo, stoneMat);
      step.position.y = height - stepH / 2;
      step.receiveShadow = true;
      standGroup.add(step);
      
      // Populate this row with crowd silhouettes (black spheres)
      const numPeople = 60 + r * 10;
      const spectatorMat = new THREE.MeshBasicMaterial({ color: '#111115' }); // dark silhouettes
      
      for (let p = 0; p < numPeople; p++) {
        // Distribute around the circle
        const angle = (p / numPeople) * Math.PI * 2;
        
        // Skip gate area in the back (crowd wouldn't sit in the open gate)
        const isGateArea = Math.abs(angle - Math.PI / 2) < 0.25;
        if (isGateArea) continue;
        
        const px = Math.cos(angle) * (radius + stepW / 2);
        const pz = Math.sin(angle) * (radius + stepW / 2);
        
        // Dark head sphere
        const headGeo = new THREE.SphereGeometry(0.35 + Math.random()*0.1, 6, 6);
        const head = new THREE.Mesh(headGeo, spectatorMat);
        head.position.set(px, height + 0.4, pz);
        standGroup.add(head);
        
        // Dark shoulder box
        const bodyGeo = new THREE.BoxGeometry(0.7, 0.6, 0.4);
        const body = new THREE.Mesh(bodyGeo, spectatorMat);
        body.position.set(px, height, pz);
        body.rotation.y = -angle;
        standGroup.add(body);
      }
    }
    
    this.scene.add(standGroup);
  }

  // Update animated elements (like torches flickering)
  update(time) {
    if (this.scene.userData.torches) {
      this.scene.userData.torches.forEach((flame) => {
        const offset = flame.userData.timeOffset;
        // Flickering scale
        const scaleY = 1.0 + Math.sin(time * 15 + offset) * 0.15;
        const scaleXZ = 1.0 + Math.cos(time * 20 + offset) * 0.1;
        flame.scale.set(scaleXZ, scaleY, scaleXZ);
      });
    }
  }
}
