import * as THREE from 'three';

export class Stickman {
  constructor(color, eyeColor, scale = 1.0) {
    this.color = color;
    this.eyeColor = eyeColor;
    this.scale = scale;
    
    this.group = new THREE.Group();
    
    // Materials
    this.bodyMat = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.8,
      metalness: 0.1
    });
    
    this.eyeMat = new THREE.MeshBasicMaterial({
      color: this.eyeColor
    });
    
    this.jointMat = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.8,
      metalness: 0.1
    });
    
    this.limbs = {};
    this.build();
  }

  build() {
    // 1. Torso
    const torsoHeight = 1.5 * this.scale;
    const torsoGeo = new THREE.CylinderGeometry(0.1 * this.scale, 0.1 * this.scale, torsoHeight, 8);
    this.torso = new THREE.Mesh(torsoGeo, this.bodyMat);
    this.torso.position.y = 2.0 * this.scale;
    this.torso.castShadow = true;
    this.torso.receiveShadow = true;
    this.group.add(this.torso);

    // Joints: Neck & Hips
    this.neckJoint = new THREE.Mesh(new THREE.SphereGeometry(0.12 * this.scale, 8, 8), this.jointMat);
    this.neckJoint.position.y = torsoHeight / 2;
    this.torso.add(this.neckJoint);
    
    this.hipsJoint = new THREE.Mesh(new THREE.SphereGeometry(0.12 * this.scale, 8, 8), this.jointMat);
    this.hipsJoint.position.y = -torsoHeight / 2;
    this.torso.add(this.hipsJoint);

    // 2. Head
    const headRadius = 0.55 * this.scale;
    const headGeo = new THREE.SphereGeometry(headRadius, 16, 16);
    this.head = new THREE.Mesh(headGeo, this.bodyMat);
    this.head.position.y = 0.65 * this.scale;
    this.head.castShadow = true;
    this.neckJoint.add(this.head);

    // Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08 * this.scale, 8, 8);
    this.leftEye = new THREE.Mesh(eyeGeo, this.eyeMat);
    this.rightEye = new THREE.Mesh(eyeGeo, this.eyeMat);
    
    // Position eyes on the front of the head
    this.leftEye.position.set(-0.16 * this.scale, 0.1 * this.scale, 0.42 * this.scale);
    this.rightEye.position.set(0.16 * this.scale, 0.1 * this.scale, 0.42 * this.scale);
    this.head.add(this.leftEye, this.rightEye);

    // 3. Arms (Left & Right)
    this.limbs.leftArm = this.createLimb(1.0 * this.scale, 0.9 * this.scale);
    this.limbs.leftArm.group.position.set(-0.15 * this.scale, torsoHeight / 2 - 0.1 * this.scale, 0);
    this.torso.add(this.limbs.leftArm.group);

    this.limbs.rightArm = this.createLimb(1.0 * this.scale, 0.9 * this.scale);
    this.limbs.rightArm.group.position.set(0.15 * this.scale, torsoHeight / 2 - 0.1 * this.scale, 0);
    this.torso.add(this.limbs.rightArm.group);

    // 4. Legs (Left & Right)
    this.limbs.leftLeg = this.createLimb(1.1 * this.scale, 1.1 * this.scale);
    this.limbs.leftLeg.group.position.set(-0.12 * this.scale, -torsoHeight / 2, 0);
    this.torso.add(this.limbs.leftLeg.group);

    this.limbs.rightLeg = this.createLimb(1.1 * this.scale, 1.1 * this.scale);
    this.limbs.rightLeg.group.position.set(0.12 * this.scale, -torsoHeight / 2, 0);
    this.torso.add(this.limbs.rightLeg.group);
  }

  createLimb(lengthUpper, lengthLower) {
    const group = new THREE.Group();
    
    // Shoulder/Hip Joint
    const joint1 = new THREE.Mesh(new THREE.SphereGeometry(0.1 * this.scale, 8, 8), this.jointMat);
    group.add(joint1);
    
    // Upper segment
    const upperGeo = new THREE.CylinderGeometry(0.07 * this.scale, 0.07 * this.scale, lengthUpper, 8);
    // Offset geometry so rotation point is at the joint
    upperGeo.translate(0, -lengthUpper / 2, 0);
    const upper = new THREE.Mesh(upperGeo, this.bodyMat);
    upper.castShadow = true;
    joint1.add(upper);
    
    // Elbow/Knee Joint
    const joint2 = new THREE.Mesh(new THREE.SphereGeometry(0.09 * this.scale, 8, 8), this.jointMat);
    joint2.position.y = -lengthUpper;
    upper.add(joint2);
    
    // Lower segment
    const lowerGeo = new THREE.CylinderGeometry(0.06 * this.scale, 0.06 * this.scale, lengthLower, 8);
    lowerGeo.translate(0, -lengthLower / 2, 0);
    const lower = new THREE.Mesh(lowerGeo, this.bodyMat);
    lower.castShadow = true;
    joint2.add(lower);
    
    // Hand/Foot Joint (End of limb)
    const handJoint = new THREE.Mesh(new THREE.SphereGeometry(0.08 * this.scale, 8, 8), this.jointMat);
    handJoint.position.y = -lengthLower;
    lower.add(handJoint);
    
    return {
      group: group,
      shoulder: joint1,
      upper: upper,
      elbow: joint2,
      lower: lower,
      hand: handJoint
    };
  }

  // Pose helper: Set rotation angles for limbs
  // rot values are THREE.Euler objects or arrays of [x, y, z] (in radians)
  setLimbRotations(limbName, upperRot, lowerRot) {
    const limb = this.limbs[limbName];
    if (!limb) return;
    
    if (upperRot) {
      limb.shoulder.rotation.set(upperRot[0], upperRot[1], upperRot[2]);
    }
    if (lowerRot) {
      limb.elbow.rotation.set(lowerRot[0], lowerRot[1], lowerRot[2]);
    }
  }

  // Set torso rotation and offset
  setTorsoPose(yOffset, rotation, tiltX = 0, tiltZ = 0) {
    this.torso.position.y = (2.0 * this.scale) + yOffset;
    this.torso.rotation.set(tiltX, rotation, tiltZ);
  }

  // Recreate the flowing cape
  addCape(capeColor = '#0055ff') {
    const capeGroup = new THREE.Group();
    // Position at neck
    capeGroup.position.set(0, 0.65 * this.scale, -0.15 * this.scale);
    
    const capeMat = new THREE.MeshStandardMaterial({
      color: capeColor,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.0
    });
    
    // We make a chain of segments for the cape so we can curve it flowing backward
    const numSegments = 4;
    const segW = 1.0 * this.scale;
    const segH = 0.5 * this.scale;
    
    let parent = capeGroup;
    this.capeSegments = [];
    
    for (let i = 0; i < numSegments; i++) {
      const segGeo = new THREE.PlaneGeometry(segW * (1.0 - i * 0.1), segH);
      // Offset so rotation pivot is at the top edge
      segGeo.translate(0, -segH / 2, 0);
      const segment = new THREE.Mesh(segGeo, capeMat);
      segment.castShadow = true;
      
      if (i > 0) {
        segment.position.y = -segH;
      }
      
      parent.add(segment);
      this.capeSegments.push(segment);
      parent = segment;
    }
    
    this.torso.add(capeGroup);
  }

  // Equip sword in right hand
  equipSword() {
    const swordGroup = new THREE.Group();
    // Rotate so sword points outward from the hand
    swordGroup.rotation.x = Math.PI / 2;
    swordGroup.rotation.z = Math.PI / 2;
    
    const hiltMat = new THREE.MeshStandardMaterial({ color: '#886611', metalness: 0.4 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.9, roughness: 0.2 });
    
    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.04 * this.scale, 0.04 * this.scale, 0.5 * this.scale, 8);
    const handle = new THREE.Mesh(handleGeo, hiltMat);
    handle.position.y = -0.2 * this.scale;
    swordGroup.add(handle);
    
    // Guard
    const guardGeo = new THREE.BoxGeometry(0.4 * this.scale, 0.06 * this.scale, 0.1 * this.scale);
    const guard = new THREE.Mesh(guardGeo, hiltMat);
    guard.position.y = 0.08 * this.scale;
    swordGroup.add(guard);
    
    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.12 * this.scale, 2.2 * this.scale, 0.03 * this.scale);
    bladeGeo.translate(0, 1.1 * this.scale, 0); // pivot at bottom of blade
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.11 * this.scale;
    blade.castShadow = true;
    swordGroup.add(blade);
    
    // Attach sword to hand joint of right arm
    this.limbs.rightArm.hand.add(swordGroup);
    this.swordMesh = swordGroup;
  }

  // Equip shield in left hand
  equipShield() {
    const shieldGroup = new THREE.Group();
    shieldGroup.rotation.y = -Math.PI / 2;
    shieldGroup.position.set(-0.1 * this.scale, 0, 0.25 * this.scale);
    
    const rimMat = new THREE.MeshStandardMaterial({ color: '#ccaa33', metalness: 0.8, roughness: 0.3 });
    const bossMat = new THREE.MeshStandardMaterial({ color: '#ccaa33', metalness: 0.8, roughness: 0.3 });
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#4a4a50', metalness: 0.6, roughness: 0.4 });
    
    // Shield backing (flat cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.8 * this.scale, 0.8 * this.scale, 0.08 * this.scale, 16);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    shieldGroup.add(body);
    
    // Outer Rim
    const rimGeo = new THREE.TorusGeometry(0.76 * this.scale, 0.06 * this.scale, 8, 24);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.z = 0.04 * this.scale;
    body.add(rim);
    
    // Center boss
    const bossGeo = new THREE.SphereGeometry(0.2 * this.scale, 12, 12);
    const boss = new THREE.Mesh(bossGeo, bossMat);
    boss.position.z = 0.04 * this.scale;
    boss.scale.z = 0.5;
    body.add(boss);
    
    this.limbs.leftArm.hand.add(shieldGroup);
  }

  // Equip spear in right hand
  equipSpear() {
    const spearGroup = new THREE.Group();
    spearGroup.rotation.x = Math.PI / 2;
    spearGroup.rotation.z = Math.PI / 2;
    
    const shaftMat = new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.9 });
    const tipMat = new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.9, roughness: 0.2 });
    
    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.04 * this.scale, 0.04 * this.scale, 3.8 * this.scale, 8);
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    spearGroup.add(shaft);
    
    // Tip
    const tipGeo = new THREE.ConeGeometry(0.12 * this.scale, 0.6 * this.scale, 4);
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 2.1 * this.scale;
    tip.castShadow = true;
    spearGroup.add(tip);
    
    this.limbs.rightArm.hand.add(spearGroup);
  }

  // Add glowing sword trail for player swing (Yellow/Orange)
  addSwordTrail() {
    // Recreate the beautiful glowing trail
    const trailGroup = new THREE.Group();
    // Semi-circle ring sector
    // RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength)
    const trailGeo = new THREE.RingGeometry(1.6 * this.scale, 3.4 * this.scale, 32, 1, 0, Math.PI * 0.75);
    
    // Custom material with double side and glow
    const trailMat = new THREE.MeshBasicMaterial({
      color: '#ffd040',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const trail = new THREE.Mesh(trailGeo, trailMat);
    // Rotate to match horizontal swing direction
    trail.rotation.x = Math.PI / 2;
    trail.position.set(-1.0 * this.scale, 0.5 * this.scale, 1.0 * this.scale);
    trailGroup.add(trail);
    
    // Outer highlight ring to make edge glow brighter
    const edgeGeo = new THREE.RingGeometry(3.3 * this.scale, 3.4 * this.scale, 32, 1, 0, Math.PI * 0.75);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.rotation.x = Math.PI / 2;
    edge.position.set(-1.0 * this.scale, 0.5 * this.scale, 1.0 * this.scale);
    trailGroup.add(edge);
    
    this.group.add(trailGroup);
    this.trail = trailGroup;
  }

  // Update cape waving effect
  update(time) {
    if (this.capeSegments) {
      this.capeSegments.forEach((segment, idx) => {
        // Wave angle using math.sin
        const wave = Math.sin(time * 6 - idx * 0.8) * 0.12;
        // Float backward
        segment.rotation.x = 0.6 + Math.sin(time * 3) * 0.08 + wave;
        segment.rotation.z = Math.cos(time * 2 + idx) * 0.05;
      });
    }
    
    // Fade trail in/out slowly or make it wave
    if (this.trail) {
      // Subtle pulse to the glowing swing trail
      const pulse = 0.55 + Math.sin(time * 12) * 0.15;
      this.trail.children.forEach(mesh => {
        mesh.material.opacity = pulse;
      });
    }
  }

  // Apply Shoulder armor pads (Pauldrons)
  addPauldrons() {
    const armorMat = new THREE.MeshStandardMaterial({ color: '#777780', metalness: 0.7, roughness: 0.3 });
    const shoulderGeo = new THREE.SphereGeometry(0.22 * this.scale, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    
    const lp = new THREE.Mesh(shoulderGeo, armorMat);
    lp.position.y = 0.05 * this.scale;
    lp.scale.set(1.2, 0.8, 1.2);
    this.limbs.leftArm.shoulder.add(lp);
    
    const rp = new THREE.Mesh(shoulderGeo, armorMat);
    rp.position.y = 0.05 * this.scale;
    rp.scale.set(1.2, 0.8, 1.2);
    this.limbs.rightArm.shoulder.add(rp);
  }
}
