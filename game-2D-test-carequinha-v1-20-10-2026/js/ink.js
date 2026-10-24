'use strict';
// =============================================================================
// ANTIGRAVITY ENGINE — ink.js
// Pincéis HQ, Cel-Shading Procedural via clip() e Volumes 3D em Canvas 2D
// Inspirado na direção de arte de Hades e no método RafaxLab
// =============================================================================

(() => {
  const { TAU, clamp, project, vNorm, vCross, vSub, vScale, vAdd } = globalThis.Agy.Core;

  // Paleta de Cores Estilo HQ Hades (Guia: ref/hades1/ e ref/hero-carequinha/)
  const Palette = {
    skin: {
      base: '#f0ad6b',
      shadow: '#a2543e',
      highlight: '#ffd9a6'
    },
    scarlet: {
      base: '#c42634',
      shadow: '#6e1322',
      highlight: '#f25244'
    },
    cloth: {
      base: '#2b2d35',
      shadow: '#16181d',
      highlight: '#4b4f5d'
    },
    steel: {
      base: '#a2b4bd',
      shadow: '#4a5e69',
      highlight: '#f0f4f7'
    },
    gold: {
      base: '#d4a34b',
      shadow: '#7d5823',
      highlight: '#fbe18e'
    },
    bone: {
      base: '#e9dec3',
      shadow: '#9c8a6f',
      highlight: '#fffbf0'
    },
    ink: '#141018'
  };

  // Cria um Path2D a partir de polígono 2D
  function createPath(points, close = true) {
    const p = new Path2D();
    if (!points || !points.length) return p;
    p.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      p.lineTo(points[i][0], points[i][1]);
    }
    if (close) p.closePath();
    return p;
  }

  // Cel-shading procedural: máscara de recorte (clip) com translação na direção da luz
  function celFill(ctx, path2d, colorDef, offset = 3.5, strokeWidth = 1.3) {
    ctx.save();
    // 1. Fundo com a cor de sombra
    ctx.fillStyle = colorDef.shadow;
    ctx.fill(path2d);

    // 2. Máscara de recorte e preenchimento da luz deslocada
    ctx.clip(path2d);
    ctx.translate(-offset * 0.7, -offset);
    ctx.fillStyle = colorDef.base;
    ctx.fill(path2d);
    ctx.restore();

    // 3. Contorno externo de tinta nítido
    if (strokeWidth > 0) {
      ctx.strokeStyle = Palette.ink;
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke(path2d);
    }
  }

  // Casco Convexo 2D (Monotone Chain de Andrew)
  function convexHull2D(points) {
    if (points.length <= 2) return points;
    const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

    const lower = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }

    const upper = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  // Projeta nuvem de pontos 3D e extrai silhueta convexa em 2D
  function projectHull(cloud3d) {
    const pts2d = cloud3d.map(p => {
      const s = project(p);
      return [s[0], s[1]];
    });
    return createPath(convexHull2D(pts2d));
  }

  // Cápsula 2D afunilada entre duas circunferências
  function capsule(ax, ay, ra, bx, by, rb) {
    const p = new Path2D();
    const dx = bx - ax;
    const dy = by - ay;
    const d = Math.hypot(dx, dy);
    if (d <= Math.abs(ra - rb) + 0.01) {
      const cx = ra >= rb ? ax : bx;
      const cy = ra >= rb ? ay : by;
      p.arc(cx, cy, Math.max(ra, rb), 0, TAU);
      return p;
    }
    const angle = Math.atan2(dy, dx);
    const offset = Math.acos(clamp((ra - rb) / d, -1, 1));
    p.moveTo(ax + ra * Math.cos(angle + offset), ay + ra * Math.sin(angle + offset));
    p.arc(ax, ay, ra, angle + offset, angle + TAU - offset);
    p.arc(bx, by, rb, angle - offset, angle + offset);
    p.closePath();
    return p;
  }

  // Fita/tira de largura variável ao longo de uma espinha dorsal
  function ribbon(spinePoints, widthFn) {
    const p = new Path2D();
    const count = spinePoints.length;
    if (count < 2) return p;

    const left = [];
    const right = [];
    for (let i = 0; i < count; i++) {
      const prev = spinePoints[Math.max(0, i - 1)];
      const next = spinePoints[Math.min(count - 1, i + 1)];
      let dx = next[0] - prev[0];
      let dy = next[1] - prev[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;

      const halfW = widthFn(i / (count - 1)) * 0.5;
      left.push([spinePoints[i][0] - dy * halfW, spinePoints[i][1] + dx * halfW]);
      right.push([spinePoints[i][0] + dy * halfW, spinePoints[i][1] - dx * halfW]);
    }

    p.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < count; i++) p.lineTo(left[i][0], left[i][1]);
    for (let i = count - 1; i >= 0; i--) p.lineTo(right[i][0], right[i][1]);
    p.closePath();
    return p;
  }

  // Cor com canal alfa
  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ---------- Geradores de Volumes Anatômicos 3D ----------

  // Gera nuvem 3D na superfície de um elipsoide rotacionado
  function ellipsoidCloud(center, radii, yaw = 0, nLat = 8, nLon = 14) {
    const cloud = [];
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);
    for (let i = 0; i <= nLat; i++) {
      const lat = -Math.PI / 2 + (Math.PI * i) / nLat;
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      for (let j = 0; j < nLon; j++) {
        const lon = (TAU * j) / nLon;
        const rx = radii[0] * cosLat * Math.sin(lon);
        const ry = radii[1] * cosLat * Math.cos(lon);
        const rz = radii[2] * sinLat;
        cloud.push([
          center[0] + rx * sinY + ry * cosY,
          center[1] - rx * cosY + ry * sinY,
          center[2] + rz
        ]);
      }
    }
    return cloud;
  }

  // Tubo muscular anatômico entre duas articulações com barriga muscular (bulge)
  function limbTubeCloud(start3d, end3d, rStart, rEnd, muscleBulge = 0, rings = 6, segments = 10) {
    let axis = vSub(end3d, start3d);
    const axisDir = vNorm(axis);
    const ref = Math.abs(axisDir[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u = vNorm(vCross(axisDir, ref));
    const v = vNorm(vCross(axisDir, u));

    const cloud = [];
    for (let i = 0; i <= rings; i++) {
      const t = i / rings;
      const cx = start3d[0] + (end3d[0] - start3d[0]) * t;
      const cy = start3d[1] + (end3d[1] - start3d[1]) * t;
      const cz = start3d[2] + (end3d[2] - start3d[2]) * t;
      // Curva senoidal para volume muscular
      const r = (rStart + (rEnd - rStart) * t) * (1 + muscleBulge * Math.sin(Math.PI * t));

      for (let j = 0; j < segments; j++) {
        const theta = (TAU * j) / segments;
        const cosT = Math.cos(theta) * r;
        const sinT = Math.sin(theta) * r;
        cloud.push([
          cx + u[0] * cosT + v[0] * sinT,
          cy + u[1] * cosT + v[1] * sinT,
          cz + u[2] * cosT + v[2] * sinT
        ]);
      }
    }
    return cloud;
  }

  // Loft de seções transversais para o torso, abdômen e cintura
  function torsoLoftCloud(sections, yaw = 0, basePos = [0, 0, 0]) {
    const cloud = [];
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);
    for (const sec of sections) {
      const ptsCount = sec.points || 16;
      for (let j = 0; j < ptsCount; j++) {
        const th = (TAU * j) / ptsCount;
        const localRight = (sec.offX || 0) + sec.radiusW * Math.sin(th);
        const localFwd = (sec.offY || 0) + sec.radiusF * Math.cos(th);
        cloud.push([
          basePos[0] + localRight * sinY + localFwd * cosY,
          basePos[1] - localRight * cosY + localFwd * sinY,
          basePos[2] + sec.z
        ]);
      }
    }
    return cloud;
  }

  const Ink = {
    Palette,
    createPath,
    celFill,
    convexHull2D,
    projectHull,
    capsule,
    ribbon,
    hexToRgba,
    ellipsoidCloud,
    limbTubeCloud,
    torsoLoftCloud
  };

  globalThis.Agy = globalThis.Agy || {};
  globalThis.Agy.Ink = Ink;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ink;
  }
})();
