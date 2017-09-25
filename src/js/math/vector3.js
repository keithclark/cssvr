export default class Vector3 {

  constructor(x = 0, y = 0, z = 0) {
    this.set(x, y, z);
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  mul(v) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  divs(s) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    return this;
  }

  muls(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  cross(v) {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  normalize() {
    this.divs(this.length());
    return this;
  }

  rotate(v, origin) {
    if (origin) {
      this.sub(origin);
    }
    let x1 = this.x,
      y1 = this.y,
      z1 = this.z,
      angleX = v.x / 2,
      angleY = v.y / 2,
      angleZ = v.z / 2,

      cr = Math.cos(angleX),
      cp = Math.cos(angleY),
      cy = Math.cos(angleZ),
      sr = Math.sin(angleX),
      sp = Math.sin(angleY),
      sy = Math.sin(angleZ),

      w = cr * cp * cy + -sr * sp * -sy,
      x = sr * cp * cy - -cr * sp * -sy,
      y = cr * sp * cy + sr * cp * sy,
      z = cr * cp * sy - -sr * sp * -cy,

      m0 = 1 - 2 * (y * y + z * z),
      m1 = 2 * (x * y + z * w),
      m2 = 2 * (x * z - y * w),

      m4 = 2 * (x * y - z * w),
      m5 = 1 - 2 * ( x * x + z * z),
      m6 = 2 * (z * y + x * w),

      m8 = 2 * (x * z + y * w),
      m9 = 2 * (y * z - x * w),
      m10 = 1 - 2 * ( x * x + y * y);

    this.x = x1 * m0 + y1 * m4 + z1 * m8;
    this.y = x1 * m1 + y1 * m5 + z1 * m9;
    this.z = x1 * m2 + y1 * m6 + z1 * m10;

    if (origin) {
      this.add(origin);
    }
    return this;
  }

  static fromCssValueString(str) {
    let values = str.split(/px\s*/);
    return new Vector3(+values[0], +values[1], +values[2]);
  }

};
