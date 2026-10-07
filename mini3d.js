/*
  MINI3D
  A tiny dependency-free 3D engine for Bean Rush.

  It uses:
  - HTML Canvas
  - Perspective projection
  - Simple 3D boxes
  - Spheres
  - Cylinders
  - Basic lighting
  - Camera movement
*/

class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(v) {
    return new Vec3(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z
    );
  }

  sub(v) {
    return new Vec3(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z
    );
  }

  multiply(n) {
    return new Vec3(
      this.x * n,
      this.y * n,
      this.z * n
    );
  }

  length() {
    return Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z
    );
  }

  normalize() {
    const l = this.length() || 1;

    return new Vec3(
      this.x / l,
      this.y / l,
      this.z / l
    );
  }

  static distance(a, b) {
    return a.sub(b).length();
  }
}

class Mini3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera = {
      position: new Vec3(0, 7, -13),
      target: new Vec3(0, 1, 12),
      fov: 70
    };

    this.objects = [];

    this.resize();

    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  clear(color = "#79c8ff") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  project(point) {
    const camera = this.camera;

    const forward = camera.target
      .sub(camera.position)
      .normalize();

    const right = new Vec3(
      forward.z,
      0,
      -forward.x
    ).normalize();

    const up = new Vec3(
      0,
      1,
      0
    );

    const relative = point.sub(camera.position);

    const x = relative.x * right.x +
              relative.y * right.y +
              relative.z * right.z;

    const y = relative.x * up.x +
              relative.y * up.y +
              relative.z * up.z;

    const z = relative.x * forward.x +
              relative.y * forward.y +
              relative.z * forward.z;

    if (z <= 0.05) {
      return null;
    }

    const f = 1 / Math.tan(
      camera.fov * Math.PI / 360
    );

    return {
      x: this.width / 2 +
        (x * f / z) *
        this.height / 2,

      y: this.height / 2 -
        (y * f / z) *
        this.height / 2,

      depth: z
    };
  }

  shadeColor(hex, amount) {
    const color = hex.replace("#", "");

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const nr = Math.max(
      0,
      Math.min(255, r + amount)
    );

    const ng = Math.max(
      0,
      Math.min(255, g + amount)
    );

    const nb = Math.max(
      0,
      Math.min(255, b + amount)
    );

    return `rgb(${nr},${ng},${nb})`;
  }

  box(x, y, z, width, height, depth, color, options = {}) {
    const vertices = [
      new Vec3(x - width / 2, y, z - depth / 2),
      new Vec3(x + width / 2, y, z - depth / 2),
      new Vec3(x + width / 2, y + height, z - depth / 2),
      new Vec3(x - width / 2, y + height, z - depth / 2),

      new Vec3(x - width / 2, y, z + depth / 2),
      new Vec3(x + width / 2, y, z + depth / 2),
      new Vec3(x + width / 2, y + height, z + depth / 2),
      new Vec3(x - width / 2, y + height, z + depth / 2)
    ];

    const faces = [
      [0, 1, 2, 3, -15],
      [4, 7, 6, 5, 20],
      [0, 4, 5, 1, -5],
      [3, 2, 6, 7, 15],
      [1, 5, 6, 2, 5],
      [0, 3, 7, 4, -25]
    ];

    this.drawFaces(
      vertices,
      faces,
      color,
      options
    );
  }

  drawFaces(vertices, faces, color, options = {}) {
    const projected = vertices.map(v =>
      this.project(v)
    );

    const drawable = [];

    for (const face of faces) {
      const pts = face
        .slice(0, 4)
        .map(i => projected[i]);

      if (pts.some(p => !p)) continue;

      const depth =
        pts.reduce((sum, p) =>
          sum + p.depth, 0
        ) / 4;

      drawable.push({
        pts,
        depth,
        shade: face[4] || 0
      });
    }

    drawable.sort((a, b) =>
      b.depth - a.depth
    );

    for (const face of drawable) {
      this.ctx.beginPath();

      this.ctx.moveTo(
        face.pts[0].x,
        face.pts[0].y
      );

      for (let i = 1; i < face.pts.length; i++) {
        this.ctx.lineTo(
          face.pts[i].x,
          face.pts[i].y
        );
      }

      this.ctx.closePath();

      this.ctx.fillStyle =
        this.shadeColor(color, face.shade);

      this.ctx.fill();

      if (options.outline !== false) {
        this.ctx.strokeStyle =
          "rgba(0,0,0,.15)";

        this.ctx.lineWidth = 1;

        this.ctx.stroke();
      }
    }
  }

  sphere(x, y, z, radius, color) {
    const p = this.project(
      new Vec3(x, y, z)
    );

    if (!p) return;

    const edge = this.project(
      new Vec3(x + radius, y, z)
    );

    if (!edge) return;

    const screenRadius =
      Math.abs(edge.x - p.x);

    const gradient =
      this.ctx.createRadialGradient(
        p.x - screenRadius * .3,
        p.y - screenRadius * .4,
        2,
        p.x,
        p.y,
        screenRadius
      );

    gradient.addColorStop(
      0,
      "#ffffff"
    );

    gradient.addColorStop(
      .25,
      color
    );

    gradient.addColorStop(
      1,
      this.shadeColor(color, -50)
    );

    this.ctx.beginPath();

    this.ctx.arc(
      p.x,
      p.y,
      screenRadius,
      0,
      Math.PI * 2
    );

    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  cylinder(
    x,
    y,
    z,
    radius,
    height,
    color
  ) {
    this.box(
      x,
      y,
      z,
      radius * 2,
      height,
      radius * 2,
      color
    );

    this.sphere(
      x,
      y + height,
      z,
      radius,
      color
    );
  }

  text3D(
    text,
    x,
    y,
    z,
    size = 20,
    color = "white"
  ) {
    const p = this.project(
      new Vec3(x, y, z)
    );

    if (!p) return;

    this.ctx.font =
      `900 ${size}px Arial`;

    this.ctx.textAlign = "center";

    this.ctx.fillStyle = color;

    this.ctx.fillText(
      text,
      p.x,
      p.y
    );
  }
}

window.Vec3 = Vec3;
window.Mini3D = Mini3D;
