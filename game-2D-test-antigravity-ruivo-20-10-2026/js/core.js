/**
 * core.js - Projeção Isométrica 3/4 e Álgebra Vetorial 3D/2D
 * Desenvolvido para o Herói Procedural (Red-Haired Knight)
 */

class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  clone() {
    return new Vec3(this.x, this.y, this.z);
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(v) {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v) {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  scale(s) {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length() {
    return Math.sqrt(this.lengthSq());
  }

  normalize() {
    const len = this.length();
    if (len > 0.00001) {
      return this.scale(1 / len);
    }
    return new Vec3(0, 0, 1);
  }

  distanceTo(v) {
    return this.sub(v).length();
  }

  lerp(v, t) {
    return new Vec3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }
}

class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  add(v) {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  scale(s) {
    return new Vec2(this.x * s, this.y * s);
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const len = this.length();
    return len > 0.00001 ? this.scale(1 / len) : new Vec2(0, 0);
  }

  lerp(v, t) {
    return new Vec2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t);
  }
}

/**
 * Câmera Isométrica 3/4 estilo Hades
 * Yaw = 45° (rotação no plano horizontal XY)
 * Pitch = 34° (inclinação vertical / 30°~34°)
 */
class IsoCamera {
  constructor(options = {}) {
    this.yaw = options.yaw ?? (45 * Math.PI / 180);
    this.pitch = options.pitch ?? (34 * Math.PI / 180);
    this.scale = options.scale ?? 1.0;
    this.origin = new Vec2(options.originX ?? 0, options.originY ?? 0);
    this.target = new Vec3(0, 0, 0);

    this.cosYaw = Math.cos(this.yaw);
    this.sinYaw = Math.sin(this.yaw);
    this.cosPitch = Math.cos(this.pitch);
    this.sinPitch = Math.sin(this.pitch);
  }

  setTarget(x, y, z = 0) {
    this.target.set(x, y, z);
  }

  /**
   * Converte ponto 3D do mundo para coordenada 2D de tela com profundidade (depth)
   */
  project(v3) {
    // Translação relativa ao alvo da câmera
    const rx = v3.x - this.target.x;
    const ry = v3.y - this.target.y;
    const rz = v3.z - this.target.z;

    // Rotação Yaw (plano XY)
    const x1 = rx * this.cosYaw - ry * this.sinYaw;
    const y1 = rx * this.sinYaw + ry * this.cosYaw;
    const z1 = rz;

    // Projeção isométrica na tela:
    // x_screen = x1 * scale
    // y_screen = (y1 * sinPitch - z1 * cosPitch) * scale
    // depth = y1 * cosPitch + z1 * sinPitch (para ordenação Z)
    const screenX = this.origin.x + x1 * this.scale;
    const screenY = this.origin.y + (y1 * this.sinPitch - z1 * this.cosPitch) * this.scale;
    const depth = y1 * this.cosPitch + z1 * this.sinPitch;

    return { x: screenX, y: screenY, depth };
  }

  /**
   * Desfaz a projeção: dado um ponto (screenX, screenY) na tela e plano Z do chão,
   * calcula a coordenada 3D correspondente (X, Y, Z)
   */
  unproject(screenX, screenY, groundZ = 0) {
    const sx = (screenX - this.origin.x) / this.scale;
    const sy = (screenY - this.origin.y) / this.scale;

    // y1 * sinPitch - (groundZ - target.z) * cosPitch = sy
    const rz = groundZ - this.target.z;
    const y1 = (sy + rz * this.cosPitch) / this.sinPitch;
    const x1 = sx;

    // Inverte a rotação Yaw:
    // rx = x1 * cosYaw + y1 * sinYaw
    // ry = -x1 * sinYaw + y1 * cosYaw
    const rx = x1 * this.cosYaw + y1 * this.sinYaw;
    const ry = -x1 * this.sinYaw + y1 * this.cosYaw;

    return new Vec3(rx + this.target.x, ry + this.target.y, groundZ);
  }
}

/**
 * Funções auxiliares matemáticas
 */
const MathUtils = {
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },

  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  angleDiff(a, b) {
    let diff = (b - a) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    return diff;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Vec3, Vec2, IsoCamera, MathUtils };
}
