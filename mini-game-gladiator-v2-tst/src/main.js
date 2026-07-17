import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { Arena } from './scene/Arena.js';
import { Stickman } from './scene/Stickman.js';

// Global variables
let scene, camera, renderer, composer;
let arena, player, enemy1, enemy2, enemy3;
let orbitControls;
let isResettingCamera = false;
let cameraMode = 'diablo'; // 'diablo', 'action', 'cinematic', 'manual'
let clock = new THREE.Clock();

// Game state
let playerStats = {
  health: 312,
  maxHealth: 420,
  stamina: 78,
  maxStamina: 120,
  potions: 2
};

// Joystick state
let joystickActive = false;
let joystickStart = { x: 0, y: 0 };
let joystickDelta = { x: 0, y: 0 };
const joystickBase = document.querySelector('.joystick-base');
const joystickHandle = document.querySelector('.joystick-handle');
const maxJoystickDist = 45; // pixels

// Animation states
let playerVelocity = new THREE.Vector3();
let isAttacking = false;
let attackTimer = 0;
let isDashing = false;
let dashTimer = 0;
let dashDirection = new THREE.Vector3();

// Camera reference position (isometric Diablo angle - positioned further back for exact match)
const defaultCamPos = new THREE.Vector3(-8, 25, 37);
const defaultTarget = new THREE.Vector3(0.5, 0.5, -0.5);

// Performance stats variables
let fps = 0;
let lastFpsUpdate = 0;
let framesThisSecond = 0;
const perfFpsEl = document.getElementById('perf-fps');
const perfTimeEl = document.getElementById('perf-time');
const perfMemEl = document.getElementById('perf-mem');
const perfDrawsEl = document.getElementById('perf-draws');
const perfTrisEl = document.getElementById('perf-tris');

init();
animate();

function init() {
  // 1. Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#201410'); // warm sunset tone
  scene.fog = new THREE.FogExp2('#201410', 0.022); // warm atmospheric fog

  // 2. Camera setup
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
  resetCamera();

  // 3. Renderer setup
  const container = document.getElementById('canvas-container');
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(1.0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  // 4. Orbit Controls (Enabled by default, attached to container to bypass HUD overlays blocking mouse events)
  orbitControls = new OrbitControls(camera, container);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
  orbitControls.minDistance = 5;
  orbitControls.maxDistance = 120; // Allow zooming much further out
  orbitControls.target.copy(defaultTarget);
  orbitControls.enabled = true;

  // Switch to manual mode if user starts dragging to pan/zoom/rotate
  orbitControls.addEventListener('start', () => {
    if (cameraMode !== 'manual' && !isResettingCamera) {
      setCameraMode('manual');
    }
  });

  // 5. Lighting
  createLights();

  // 6. Build Arena Environment
  arena = new Arena(scene);

  // 7. Spawn Stickmen
  createCharacters();

  // 8. Post Processing (Bloom for glows)
  setupPostProcessing();

  // 9. Event Listeners
  setupEventListeners();
  setupUIInteractions();

  // Resize handler
  window.addEventListener('resize', onWindowResize);
}

function createLights() {
  // Ambient light (warm soft ambient fill)
  const ambientLight = new THREE.AmbientLight('#3a251e', 0.6);
  scene.add(ambientLight);

  // Directional Light (Sun - strong warm gold light from top-left)
  const sunLight = new THREE.DirectionalLight('#ffa850', 5.0);
  sunLight.position.set(-18, 22, -12);
  sunLight.castShadow = true;
  
  // Shadow map resolution optimized for 120+ FPS performance
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 60;
  
  const d = 16;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  
  scene.add(sunLight);
  
  // Sky fill light (complementary blue-dusk tint from top-right)
  const hemiLight = new THREE.HemisphereLight('#4b6d93', '#332211', 0.4);
  scene.add(hemiLight);
}

function createCharacters() {
  // 1. Blue Player
  // Color, EyeColor, Scale
  player = new Stickman('#1d68ff', '#ffffff', 1.0);
  player.addCape('#0e50e0');
  player.addPauldrons();
  player.equipSword();
  player.addSwordTrail();
  player.group.position.set(-4.5, 0, 1.2);
  scene.add(player.group);

  // Set Hero Pose matching the screenshot (swinging pose)
  setPlayerSwingPose();

  // 2. Enemy 1 (Top - sword and shield)
  enemy1 = new Stickman('#151515', '#ff1010', 0.95);
  enemy1.equipSword();
  enemy1.equipShield();
  enemy1.group.position.set(2.5, 0, -5.5);
  scene.add(enemy1.group);
  setEnemy1Pose();

  // 3. Enemy 2 (Middle right - spear)
  enemy2 = new Stickman('#151515', '#ff1010', 0.95);
  enemy2.equipSpear();
  enemy2.group.position.set(7.5, 0, -0.5);
  scene.add(enemy2.group);
  setEnemy2Pose();

  // 4. Enemy 3 (Bottom - sword)
  enemy3 = new Stickman('#151515', '#ff1010', 0.95);
  enemy3.equipSword();
  enemy3.group.position.set(4.0, 0, 4.5);
  scene.add(enemy3.group);
  setEnemy3Pose();
}

// POSES RECREATION (Matching print1-gamee.png)
function setPlayerSwingPose() {
  player.setTorsoPose(0, -0.6, 0.15, -0.1);
  
  // Left arm back
  player.setLimbRotations('leftArm', [0.3, 0, -0.6], [0, 0, -0.3]);
  
  // Right arm holding sword forward in swing arc
  player.setLimbRotations('rightArm', [-0.2, 0.4, 1.4], [0, 0.6, 0.4]);
  
  // Left leg extended back
  player.setLimbRotations('leftLeg', [0.8, 0, -0.3], [-0.5, 0, 0]);
  
  // Right leg bent forward
  player.setLimbRotations('rightLeg', [-0.6, 0, 0.2], [-0.9, 0, 0]);
}

function setEnemy1Pose() {
  // Facing player (facing bottom-left)
  enemy1.setTorsoPose(-0.15, 2.2, 0.1, 0.1); // Crouch slightly
  
  // Shield in front
  enemy1.setLimbRotations('leftArm', [-0.6, 0.8, -0.8], [0, -0.4, -0.2]);
  
  // Sword back ready to counter
  enemy1.setLimbRotations('rightArm', [0.4, 0.2, 0.6], [0, 0.4, 0.2]);
  
  // Crouched legs
  enemy1.setLimbRotations('leftLeg', [-0.4, 0, 0.2], [-0.6, 0, 0]);
  enemy1.setLimbRotations('rightLeg', [-0.5, 0, -0.2], [-0.7, 0, 0]);
}

function setEnemy2Pose() {
  // Facing player (facing left/down)
  enemy2.setTorsoPose(0, 1.8, 0.1, -0.05);
  
  // Spear forward with both arms
  enemy2.setLimbRotations('leftArm', [-0.5, 0.5, 0.8], [0, 0.4, 0]);
  enemy2.setLimbRotations('rightArm', [-0.3, 0.2, 1.1], [0, 0.3, 0]);
  
  // Running charge legs
  enemy2.setLimbRotations('leftLeg', [0.6, 0, -0.1], [-0.4, 0, 0]);
  enemy2.setLimbRotations('rightLeg', [-0.8, 0, 0.1], [-0.6, 0, 0]);
}

function setEnemy3Pose() {
  // Facing player (facing top-left)
  enemy3.setTorsoPose(0, 1.2, 0.05, 0);
  
  // Sword hanging down-forward
  enemy3.setLimbRotations('rightArm', [-0.4, -0.2, 0.6], [0, 0.3, 0]);
  
  // Left arm back
  enemy3.setLimbRotations('leftArm', [0.4, 0, -0.4], [0, 0, -0.2]);
  
  // Approach stride
  enemy3.setLimbRotations('leftLeg', [-0.4, 0, 0.1], [-0.3, 0, 0]);
  enemy3.setLimbRotations('rightLeg', [0.5, 0, -0.1], [-0.4, 0, 0]);
}

function setupPostProcessing() {
  const renderPass = new RenderPass(scene, camera);
  
  // Bloom parameters for glorious neon weapons and eyes
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.85,  // strength
    0.35,  // radius
    0.85   // threshold
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
}

function resetCamera() {
  camera.position.copy(defaultCamPos);
  camera.lookAt(defaultTarget);
  if (orbitControls) {
    orbitControls.target.copy(defaultTarget);
    orbitControls.update();
  }
}

function setupEventListeners() {
  // Camera Preset buttons
  const btnDiablo = document.getElementById('cam-diablo');
  const btnAction = document.getElementById('cam-action');
  const btnCinematic = document.getElementById('cam-cinematic');

  btnDiablo.addEventListener('click', () => setCameraMode('diablo'));
  btnAction.addEventListener('click', () => setCameraMode('action'));
  btnCinematic.addEventListener('click', () => setCameraMode('cinematic'));

  // Listen for Spacebar key to reset camera to Diablo style
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault(); // prevent scrolling page
      setCameraMode('diablo');
    }
  });
}

function setCameraMode(mode) {
  if (cameraMode === mode && mode !== 'manual') return;
  
  cameraMode = mode;
  
  // Update button active classes in HUD
  const btnDiablo = document.getElementById('cam-diablo');
  const btnAction = document.getElementById('cam-action');
  const btnCinematic = document.getElementById('cam-cinematic');
  
  btnDiablo.classList.toggle('active', mode === 'diablo');
  btnAction.classList.toggle('active', mode === 'action');
  btnCinematic.classList.toggle('active', mode === 'cinematic');
  
  if (mode === 'diablo') {
    animateCameraTo(defaultCamPos, defaultTarget);
  } else if (mode === 'action') {
    const actionCamPos = new THREE.Vector3(
      player.group.position.x - 4,
      player.group.position.y + 4.5,
      player.group.position.z + 8.5
    );
    animateCameraTo(actionCamPos, player.group.position);
  } else if (mode === 'cinematic') {
    orbitControls.enabled = false;
  } else if (mode === 'manual') {
    orbitControls.enabled = true;
  }
}

function animateCameraTo(targetPos, targetLookAt) {
  if (isResettingCamera) return;
  isResettingCamera = true;
  orbitControls.enabled = false; // Disable controls during transition
  
  const startPos = camera.position.clone();
  const startTarget = orbitControls.target.clone();
  const duration = 800; // ms
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1.0);
    const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

    camera.position.lerpVectors(startPos, targetPos, ease);
    orbitControls.target.lerpVectors(startTarget, targetLookAt, ease);
    camera.lookAt(orbitControls.target);

    if (progress < 1.0) {
      requestAnimationFrame(step);
    } else {
      camera.position.copy(targetPos);
      orbitControls.target.copy(targetLookAt);
      
      if (cameraMode !== 'cinematic') {
        orbitControls.enabled = true;
        orbitControls.update();
      }
      isResettingCamera = false;
    }
  }
  requestAnimationFrame(step);
}

function setupUIInteractions() {
  // Potion Heal
  const potionBtn = document.querySelector('.potion-btn');
  potionBtn.addEventListener('click', () => {
    if (playerStats.potions > 0 && playerStats.health < playerStats.maxHealth) {
      playerStats.potions--;
      playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + 100);
      updateHUD();
      
      // Flash player green for healing feedback
      const originalColor = player.bodyMat.color.getHex();
      player.bodyMat.color.setHex(0x22ff55);
      setTimeout(() => {
        player.bodyMat.color.setHex(originalColor);
      }, 400);
    }
  });

  // Attack Trigger
  const attackBtn = document.querySelector('.attack-btn');
  attackBtn.addEventListener('click', () => {
    if (isAttacking) return;
    triggerPlayerAttack();
  });

  // Dash Trigger
  const dashBtn = document.querySelector('.dash-btn');
  dashBtn.addEventListener('click', () => {
    if (isDashing) return;
    triggerPlayerDash();
  });

  // Joystick Input
  joystickBase.addEventListener('mousedown', onJoystickStart);
  window.addEventListener('mousemove', onJoystickMove);
  window.addEventListener('mouseup', onJoystickEnd);

  joystickBase.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    onJoystickStart({ clientX: touch.clientX, clientY: touch.clientY });
  }, { passive: true });
  
  window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    onJoystickMove({ clientX: touch.clientX, clientY: touch.clientY });
  }, { passive: false });
  
  window.addEventListener('touchend', onJoystickEnd);
}

function updateHUD() {
  document.querySelector('.health-bar').style.width = `${(playerStats.health / playerStats.maxHealth) * 100}%`;
  document.querySelector('.health-bar-wrapper .bar-text').textContent = `${playerStats.health} / ${playerStats.maxHealth}`;
  
  document.querySelector('.potion-count').textContent = playerStats.potions;
  if (playerStats.potions === 0) {
    document.querySelector('.potion-btn-wrapper').style.opacity = '0.5';
  }
}

// ATTACK MECHANICS
function triggerPlayerAttack() {
  isAttacking = true;
  attackTimer = 0;
  
  // Set trail visible
  if (player.trail) player.trail.visible = true;
  
  // Camera Shake
  const originalCamPos = camera.position.clone();
  const shakeIntensity = 0.15;
  const shakeInterval = setInterval(() => {
    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    camera.position.y += (Math.random() - 0.5) * shakeIntensity;
  }, 30);
  
  setTimeout(() => {
    clearInterval(shakeInterval);
    camera.position.copy(originalCamPos);
  }, 250);
}

// DASH MECHANICS
function triggerPlayerDash() {
  isDashing = true;
  dashTimer = 0;
  
  // Get current direction facing
  dashDirection.set(0, 0, 1).applyQuaternion(player.group.quaternion).normalize();
  
  // Use stamina
  playerStats.stamina = Math.max(0, playerStats.stamina - 40);
  document.querySelector('.stamina-bar').style.width = `${(playerStats.stamina / playerStats.maxStamina) * 100}%`;
  document.querySelector('.stamina-bar-wrapper .bar-text').textContent = `${Math.floor(playerStats.stamina)} / ${playerStats.maxStamina}`;
}

// JOYSTICK MECHANICS
function onJoystickStart(e) {
  joystickActive = true;
  const rect = joystickBase.getBoundingClientRect();
  joystickStart = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
  onJoystickMove(e);
}

function onJoystickMove(e) {
  if (!joystickActive) return;
  
  // Prevent scrolling on touch
  if (e.cancelable) e.preventDefault();
  
  const clientX = e.clientX || 0;
  const clientY = e.clientY || 0;
  
  let dx = clientX - joystickStart.x;
  let dy = clientY - joystickStart.y;
  
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist > maxJoystickDist) {
    dx = (dx / dist) * maxJoystickDist;
    dy = (dy / dist) * maxJoystickDist;
  }
  
  joystickDelta = {
    x: dx / maxJoystickDist,
    y: dy / maxJoystickDist
  };
  
  // Move visual handle
  joystickHandle.style.transform = `translate(${dx}px, ${dy}px)`;
  
  // Calculate relative movement vector based on screen projection
  // Joystick Up maps to movement in negative Z, Joystick Right maps to positive X
  playerVelocity.set(joystickDelta.x * 0.12, 0, joystickDelta.y * 0.12);
}

function onJoystickEnd() {
  if (!joystickActive) return;
  joystickActive = false;
  joystickDelta = { x: 0, y: 0 };
  joystickHandle.style.transform = `translate(0px, 0px)`;
  playerVelocity.set(0, 0, 0);
}

function updateCharacterMovement(dt) {
  const time = clock.getElapsedTime();
  
  // 1. Handle Dashing
  if (isDashing) {
    dashTimer += dt;
    const dashSpeed = 0.6;
    player.group.position.addScaledVector(dashDirection, dashSpeed);
    
    // Ghost effect/scaling
    player.group.scale.y = 0.85;
    player.group.scale.z = 1.15;
    
    if (dashTimer >= 0.2) {
      isDashing = false;
      player.group.scale.set(1, 1, 1);
    }
    return; // Don't run/attack during dash
  }

  // 2. Handle Joystick Movement
  const isMoving = playerVelocity.lengthSq() > 0.001;
  
  if (isMoving && !isAttacking) {
    // Add velocity
    player.group.position.add(playerVelocity);
    
    // Constraint player within Arena walls (R = 23.5)
    const currentDist = player.group.position.length();
    if (currentDist > 23.2) {
      player.group.position.normalize().multiplyScalar(23.2);
    }
    
    // Face movement direction (Z is forward)
    const angle = Math.atan2(-playerVelocity.x, -playerVelocity.z);
    player.group.rotation.y = angle;
    
    // Run animation: oscillate limbs
    const runSpeed = 16.0;
    const swingAngle = Math.sin(time * runSpeed) * 0.7;
    
    player.setTorsoPose(Math.abs(Math.sin(time * runSpeed)) * 0.1, angle, 0.1, 0);
    player.setLimbRotations('leftArm', [swingAngle, 0, -0.3], [0, 0, 0]);
    player.setLimbRotations('rightArm', [-swingAngle, 0, 0.3], [0, 0, 0]);
    player.setLimbRotations('leftLeg', [-swingAngle * 0.9, 0, 0], [-Math.abs(swingAngle)*0.3, 0, 0]);
    player.setLimbRotations('rightLeg', [swingAngle * 0.9, 0, 0], [-Math.abs(swingAngle)*0.3, 0, 0]);
    
    if (player.trail) player.trail.visible = false;
  }
  // 3. Handle Swing Attack Animation
  else if (isAttacking) {
    attackTimer += dt;
    const duration = 0.35; // 350ms
    const t = attackTimer / duration;
    
    if (t <= 1.0) {
      // Swipe animation formula
      // Rotate torso rapidly in swing direction
      const baseAngle = player.group.rotation.y;
      player.setTorsoPose(0, baseAngle + Math.sin(t * Math.PI) * 0.8, 0.1, 0);
      
      // Right arm swings sword in a circular sweep
      player.setLimbRotations('rightArm', [-0.4, 0.2, 0.8 + Math.sin(t * Math.PI) * 1.6], [0, 0.2 + t * 0.8, 0]);
      player.setLimbRotations('leftArm', [0.4, 0, -0.8], [0, 0, 0]);
    } else {
      isAttacking = false;
      setPlayerSwingPose(); // Reset to default screenshot pose
    }
  } 
  // 4. Default Idle Pose (if not moving/attacking)
  else {
    setPlayerSwingPose();
  }
  
  // Stamina regeneration
  if (!isDashing && playerStats.stamina < playerStats.maxStamina) {
    playerStats.stamina = Math.min(playerStats.maxStamina, playerStats.stamina + dt * 25);
    document.querySelector('.stamina-bar').style.width = `${(playerStats.stamina / playerStats.maxStamina) * 100}%`;
    document.querySelector('.stamina-bar-wrapper .bar-text').textContent = `${Math.floor(playerStats.stamina)} / ${playerStats.maxStamina}`;
  }
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const time = clock.getElapsedTime();

  // Update Arena (flames/flickers)
  if (arena) arena.update(time);

  // Update player (movement, animations, cape wave)
  if (player) {
    player.update(time);
    updateCharacterMovement(dt);
  }

  // Update enemies (gentle breathing/waiting idle animations)
  if (enemy1) {
    enemy1.update(time);
    enemy1.group.position.y = Math.sin(time * 2.5) * 0.04;
  }
  if (enemy2) {
    enemy2.update(time);
    enemy2.group.position.y = Math.sin(time * 2.8 + 1) * 0.04;
  }
  if (enemy3) {
    enemy3.update(time);
    enemy3.group.position.y = Math.sin(time * 2.2 + 2) * 0.04;
  }

  // Cinematic auto-rotation
  if (cameraMode === 'cinematic') {
    const orbitRadius = 24;
    const speed = 0.12;
    camera.position.x = Math.sin(time * speed) * orbitRadius;
    camera.position.z = Math.cos(time * speed) * orbitRadius;
    camera.position.y = 12 + Math.sin(time * 0.3) * 3; // gentle bobbing
    camera.lookAt(0, 1.5, 0);
    orbitControls.target.set(0, 1.5, 0);
  }
  // Action tracking mode (The Witcher style over-the-shoulder tracking)
  else if (cameraMode === 'action' && !isResettingCamera) {
    const playerPos = player.group.position;
    const playerRot = player.group.rotation.y;
    
    // Position camera behind player facing direction
    const backDist = 6.0;
    const height = 3.2;
    
    const targetCamPos = new THREE.Vector3(
      playerPos.x + Math.sin(playerRot) * backDist,
      playerPos.y + height,
      playerPos.z + Math.cos(playerRot) * backDist
    );
    
    // Look ahead of player
    const targetLookAt = new THREE.Vector3(
      playerPos.x - Math.sin(playerRot) * 2.0,
      playerPos.y + 1.6,
      playerPos.z - Math.cos(playerRot) * 2.0
    );
    
    camera.position.lerp(targetCamPos, 0.08);
    orbitControls.target.lerp(targetLookAt, 0.08);
    camera.lookAt(orbitControls.target);
  }

  // Update OrbitControls if active and not in cinematic/reset
  if (orbitControls && orbitControls.enabled && !isResettingCamera && cameraMode !== 'cinematic') {
    orbitControls.update();
  }

  // Calculate Real-time Performance Stats (MSI Afterburner style)
  framesThisSecond++;
  const now = performance.now();
  if (now > lastFpsUpdate + 1000) {
    fps = Math.round((framesThisSecond * 1000) / (now - lastFpsUpdate));
    
    if (perfFpsEl) {
      perfFpsEl.textContent = fps;
      if (fps >= 90) perfFpsEl.style.color = '#00ff66';
      else if (fps >= 60) perfFpsEl.style.color = '#ffff00';
      else perfFpsEl.style.color = '#ff3333';
    }
    
    if (perfTimeEl) {
      perfTimeEl.textContent = `${(dt * 1000).toFixed(1)} ms`;
    }
    
    if (perfMemEl) {
      const memory = window.performance && window.performance.memory;
      perfMemEl.textContent = memory ? `${Math.round(memory.usedJSHeapSize / 1048576)} MB` : 'N/A';
    }
    
    if (perfDrawsEl && renderer) {
      perfDrawsEl.textContent = renderer.info.render.calls;
    }
    
    if (perfTrisEl && renderer) {
      perfTrisEl.textContent = renderer.info.render.triangles;
    }
    
    framesThisSecond = 0;
    lastFpsUpdate = now;
  }

  // Render composer (bloom)
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}
