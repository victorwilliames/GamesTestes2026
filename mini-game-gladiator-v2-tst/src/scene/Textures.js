import * as THREE from 'three';

// Procedural texture generators
export class ProceduralTextures {
  
  // 1. Sand Ground Texture (Diffuse + Normal)
  static createSandTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fill base sand color (warm golden tan)
    ctx.fillStyle = '#dbb887'; // Burlywood
    ctx.fillRect(0, 0, size, size);
    
    // Draw sand grain noise
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Generate noise
      const noise = (Math.random() - 0.5) * 22; // subtle variation
      const r = data[i] + noise;
      const g = data[i+1] + noise * 0.9;
      const b = data[i+2] + noise * 0.7; // slightly yellow-warm tint
      
      data[i] = Math.max(0, Math.min(255, r));
      data[i+1] = Math.max(0, Math.min(255, g));
      data[i+2] = Math.max(0, Math.min(255, b));
    }
    ctx.putImageData(imgData, 0, 0);
    
    // Draw larger dirt patches/spots
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 5 + Math.random() * 25;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const darkColor = Math.random() > 0.5 ? 'rgba(180, 140, 95, 0.25)' : 'rgba(150, 110, 75, 0.2)';
      grad.addColorStop(0, darkColor);
      grad.addColorStop(1, 'rgba(219, 184, 135, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Create Three.js Texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    
    // Generate Normal Map from this canvas
    const normalCanvas = this.generateNormalMap(canvas, 1.2);
    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(10, 10);
    
    return { diffuse: texture, normal: normalTexture };
  }

  // 2. Stone Wall Texture (Diffuse + Normal)
  static createStoneWallTexture() {
    const width = 512;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Mortar color (dark grey-brown)
    ctx.fillStyle = '#3c3530';
    ctx.fillRect(0, 0, width, height);
    
    const rows = 8;
    const cols = 4;
    const brickW = width / cols;
    const brickH = height / rows;
    
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (brickW / 2);
      for (let c = -1; c <= cols; c++) {
        const x = c * brickW + offset;
        const y = r * brickH;
        
        // Random stone colors (medieval warm terracotta/sandstone)
        const rand = Math.random();
        let color = '#9e8072'; // Default warm brick-tan
        if (rand < 0.25) color = '#b89c8c'; // Lighter warm sandstone
        else if (rand < 0.5) color = '#876757'; // Darker terracotta
        else if (rand < 0.75) color = '#ab8b79'; // Sandy reddish-grey
        else color = '#6e5043'; // Dark charcoal-brown stone
        
        ctx.fillStyle = color;
        // Brick rect with rounded mortar gap
        const gap = 3;
        ctx.fillRect(x + gap, y + gap, brickW - gap * 2, brickH - gap * 2);
        
        // Add stone grain inside the brick
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let i = 0; i < 60; i++) {
          const sx = x + gap + Math.random() * (brickW - gap*2);
          const sy = y + gap + Math.random() * (brickH - gap*2);
          const sr = 1 + Math.random() * 4;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 30; i++) {
          const sx = x + gap + Math.random() * (brickW - gap*2);
          const sy = y + gap + Math.random() * (brickH - gap*2);
          const sr = 1 + Math.random() * 2;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Bevel highlights/shadows
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; // highlight top-left
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + gap, y + brickH - gap);
        ctx.lineTo(x + gap, y + gap);
        ctx.lineTo(x + brickW - gap, y + gap);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'; // shadow bottom-right
        ctx.beginPath();
        ctx.moveTo(x + gap, y + brickH - gap);
        ctx.lineTo(x + brickW - gap, y + brickH - gap);
        ctx.lineTo(x + brickW - gap, y + gap);
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Create Normal Map
    const normalCanvas = this.generateNormalMap(canvas, 1.8);
    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    
    return { diffuse: texture, normal: normalTexture };
  }

  // 3. Red Banner with Golden Lion Crest
  static createBannerTexture() {
    const width = 128;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Clear and set red background
    ctx.fillStyle = '#8b0000'; // Dark Red
    ctx.fillRect(0, 0, width, height);
    
    // Vertical dark red stripes
    ctx.fillStyle = '#660000';
    for (let x = 12; x < width; x += 24) {
      ctx.fillRect(x, 0, 8, height);
    }
    
    // Draw golden border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#cca32d'; // Gold
    ctx.strokeRect(6, 6, width - 12, height - 12);
    
    // Swallowtail bottom cut out (draw background overlay to look cut out)
    ctx.fillStyle = '#cca32d';
    // Let's make the border follow a pointed swallowtail:
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10, height - 30);
    ctx.lineTo(width / 2, height - 10);
    ctx.lineTo(width - 10, height - 30);
    ctx.stroke();
    
    // Draw golden crest (Shield with simplified cross/lion)
    ctx.fillStyle = '#cca32d';
    
    // Draw Shield
    ctx.beginPath();
    ctx.moveTo(width / 2 - 20, 50);
    ctx.lineTo(width / 2 + 20, 50);
    ctx.quadraticCurveTo(width / 2 + 20, 80, width / 2, 100);
    ctx.quadraticCurveTo(width / 2 - 20, 80, width / 2 - 20, 50);
    ctx.closePath();
    ctx.fill();
    
    // Draw inner details of the shield (Dark Red cross)
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width / 2, 52);
    ctx.lineTo(width / 2, 95);
    ctx.moveTo(width / 2 - 18, 70);
    ctx.lineTo(width / 2 + 18, 70);
    ctx.stroke();
    
    // Draw a stylized golden crown above the shield
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(width / 2 - 15, 45);
    ctx.lineTo(width / 2 - 18, 35);
    ctx.lineTo(width / 2 - 6, 40);
    ctx.lineTo(width / 2, 30);
    ctx.lineTo(width / 2 + 6, 40);
    ctx.lineTo(width / 2 + 18, 35);
    ctx.lineTo(width / 2 + 15, 45);
    ctx.closePath();
    ctx.fill();
    
    // Create Canvas Texture
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // 4. Arena Floor Markings, Cracks, and Blood Overlay
  static createBloodTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Clear to transparent
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    
    // 4.1. Concentric Arena Rings (Worn circular borders in the sand)
    const drawArenaRing = (radius, strokeColor, lineWidth, isDashed = false) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      if (isDashed) {
        ctx.setLineDash([12, 16, 4, 16]); // irregular wear
      } else {
        ctx.setLineDash([]);
      }
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    };
    
    // Inner circular ring
    drawArenaRing(180, 'rgba(80, 62, 50, 0.45)', 6, true);
    // Mid combat ring
    drawArenaRing(320, 'rgba(75, 58, 46, 0.40)', 8, true);
    // Outer boundary ring (right next to colosseum base wall)
    drawArenaRing(450, 'rgba(70, 54, 42, 0.50)', 12, false);
    
    // 4.2. Ground Cracks (Procedural fractals)
    const drawCrack = (x1, y1, angle, length, depth) => {
      if (depth <= 0 || length < 4) return;
      
      const x2 = x1 + Math.cos(angle) * length;
      const y2 = y1 + Math.sin(angle) * length;
      
      ctx.strokeStyle = 'rgba(60, 44, 32, 0.35)';
      ctx.lineWidth = 1.0 + depth * 0.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Branching
      if (Math.random() > 0.4) {
        drawCrack(x2, y2, angle + (Math.random() - 0.5) * 0.8, length * 0.75, depth - 1);
      }
      if (Math.random() > 0.7) {
        drawCrack(x2, y2, angle + (Math.random() - 0.5) * 1.5, length * 0.60, depth - 1);
      }
    };
    
    // Generate a few cracks shooting outwards from the center and dummy
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      drawCrack(cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 60, angle, 120 + Math.random() * 80, 4);
    }
    
    // 4.3. Blood Splatters Helper
    const drawSplatter = (bx, by, maxRadius) => {
      ctx.fillStyle = 'rgba(110, 0, 0, 0.85)'; // Deep dark blood red
      
      // Main splatter pool
      ctx.beginPath();
      const numPoints = 14 + Math.floor(Math.random() * 8);
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const variance = 0.35 + Math.random() * 0.65;
        const r = maxRadius * variance;
        const x = bx + Math.cos(angle) * r;
        const y = by + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Secondary highlights/wet gloss on the blood
      ctx.fillStyle = 'rgba(80, 0, 0, 0.95)';
      ctx.beginPath();
      ctx.arc(bx + maxRadius * 0.15, by - maxRadius * 0.15, maxRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Splashed droplets flying outward
      const numDrops = 10 + Math.floor(Math.random() * 15);
      ctx.fillStyle = 'rgba(110, 0, 0, 0.8)';
      for (let i = 0; i < numDrops; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = maxRadius * (1.1 + Math.random() * 1.6);
        const dropRadius = 1.5 + Math.random() * (maxRadius * 0.16);
        const dx = bx + Math.cos(angle) * distance;
        const dy = by + Math.sin(angle) * distance;
        
        ctx.beginPath();
        ctx.arc(dx, dy, dropRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Droplet tail
        ctx.lineWidth = dropRadius * 0.4;
        ctx.strokeStyle = 'rgba(110, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx - Math.cos(angle) * dropRadius * 2.5, dy - Math.sin(angle) * dropRadius * 2.5);
        ctx.stroke();
      }
    };
    
    // Draw blood splatters mapped to fight zones
    // 1. Center combat zone (around player and dummy)
    drawSplatter(cx - 90, cy + 30, 45); // Hero's swing spot
    drawSplatter(cx + 40, cy - 25, 30); // Target dummy impact spot
    drawSplatter(cx + 10, cy + 20, 20); // Center overlap
    
    // 2. Enemy combat zones
    drawSplatter(cx + 60, cy - 120, 35); // Enemy 1 (Top)
    drawSplatter(cx + 160, cy - 10, 25);  // Enemy 2 (Right)
    drawSplatter(cx + 90, cy + 100, 38);  // Enemy 3 (Bottom)
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
  
  // Helper: Sobel Filter to generate a normal map from a height/grayscale canvas
  static generateNormalMap(sourceCanvas, strength = 1.0) {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(sourceCanvas, 0, 0);
    
    const srcData = tempCtx.getImageData(0, 0, width, height);
    const src = srcData.data;
    
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = width;
    normalCanvas.height = height;
    const normalCtx = normalCanvas.getContext('2d');
    const normalData = normalCtx.createImageData(width, height);
    const dst = normalData.data;
    
    // Grayscale helper
    const getVal = (x, y) => {
      // Handle wrapping
      const xx = (x + width) % width;
      const yy = (y + height) % height;
      const idx = (yy * width + xx) * 4;
      // Return luminance
      return (src[idx] + src[idx+1] + src[idx+2]) / 3.0 / 255.0;
    };
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Sobel filter kernels
        // dx =
        // [ -1 0 1 ]
        // [ -2 0 2 ]
        // [ -1 0 1 ]
        
        // dy =
        // [ -1 -2 -1 ]
        // [  0  0  0 ]
        // [  1  2  1 ]
        
        const tl = getVal(x - 1, y - 1);
        const t  = getVal(x,     y - 1);
        const tr = getVal(x + 1, y - 1);
        const l  = getVal(x - 1, y);
        const r  = getVal(x + 1, y);
        const bl = getVal(x - 1, y + 1);
        const b  = getVal(x,     y + 1);
        const br = getVal(x + 1, y + 1);
        
        const dX = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
        const dY = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);
        
        // Normalize normal vector (nx, ny, nz)
        // Scale derivatives by strength
        const nx = -dX * strength;
        const ny = -dY * strength;
        const nz = 1.0;
        
        const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
        const nVec = [nx / len, ny / len, nz / len];
        
        // Map normal to RGB
        const idx = (y * width + x) * 4;
        dst[idx]     = Math.floor((nVec[0] * 0.5 + 0.5) * 255); // R
        dst[idx+1]   = Math.floor((nVec[1] * 0.5 + 0.5) * 255); // G
        dst[idx+2]   = Math.floor((nVec[2] * 0.5 + 0.5) * 255); // B
        dst[idx+3]   = 255;                                     // A
      }
    }
    
    normalCtx.putImageData(normalData, 0, 0);
    return normalCanvas;
  }
}
