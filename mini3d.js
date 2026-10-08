class V3 {

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  sub(v) {
    return new V3(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z
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

    return new V3(
      this.x / l,
      this.y / l,
      this.z / l
    );
  }
}


class Mini3D {

  constructor(canvas) {

    this.canvas = canvas;

    this.ctx =
      canvas.getContext("2d");

    this.width =
      window.innerWidth;

    this.height =
      window.innerHeight;

    this.camera = {
      x: 0,
      y: 7,
      z: -15,

      targetX: 0,
      targetY: 1,
      targetZ: 15,

      fov: 70
    };

    this.resize();

    window.addEventListener(
      "resize",
      () => this.resize()
    );
  }


  resize() {

    this.width =
      window.innerWidth;

    this.height =
      window.innerHeight;

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    this.canvas.width =
      this.width * dpr;

    this.canvas.height =
      this.height * dpr;

    this.canvas.style.width =
      this.width + "px";

    this.canvas.style.height =
      this.height + "px";

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }


  project(x, y, z) {

    const cam = this.camera;

    const dx =
      cam.targetX - cam.x;

    const dy =
      cam.targetY - cam.y;

    const dz =
      cam.targetZ - cam.z;

    const len =
      Math.sqrt(
        dx * dx +
        dy * dy +
        dz * dz
      ) || 1;

    const fx = dx / len;
    const fy = dy / len;
    const fz = dz / len;

    const rightX = fz;
    const rightZ = -fx;

    const relX = x - cam.x;
    const relY = y - cam.y;
    const relZ = z - cam.z;

    const screenX =
      relX * rightX +
      relZ * rightZ;

    const screenY =
      relX * -fx * fy +
      relY +
      relZ * -fz * fy;

    const depth =
      relX * fx +
      relY * fy +
      relZ * fz;

    if (depth <= .1)
      return null;

    const focal =
      1 /
      Math.tan(
        cam.fov *
        Math.PI /
        360
      );

    return {

      x:
        this.width / 2 +
        screenX *
        focal /
        depth *
        this.height / 2,

      y:
        this.height / 2 -
        screenY *
        focal /
        depth *
        this.height / 2,

      depth
    };
  }


  shade(hex, amount) {

    hex =
      hex.replace("#", "");

    let r =
      parseInt(
        hex.substring(0, 2),
        16
      );

    let g =
      parseInt(
        hex.substring(2, 4),
        16
      );

    let b =
      parseInt(
        hex.substring(4, 6),
        16
      );

    r =
      Math.max(
        0,
        Math.min(
          255,
          r + amount
        )
      );

    g =
      Math.max(
        0,
        Math.min(
          255,
          g + amount
        )
      );

    b =
      Math.max(
        0,
        Math.min(
          255,
          b + amount
        )
      );

    return `rgb(${r},${g},${b})`;
  }


  box(
    x,
    y,
    z,
    w,
    h,
    d,
    color
  ) {

    const hw = w / 2;
    const hd = d / 2;

    const v = [

      this.project(
        x - hw,
        y,
        z - hd
      ),

      this.project(
        x + hw,
        y,
        z - hd
      ),

      this.project(
        x + hw,
        y + h,
        z - hd
      ),

      this.project(
        x - hw,
        y + h,
        z - hd
      ),

      this.project(
        x - hw,
        y,
        z + hd
      ),

      this.project(
        x + hw,
        y,
        z + hd
      ),

      this.project(
        x + hw,
        y + h,
        z + hd
      ),

      this.project(
        x - hw,
        y + h,
        z + hd
      )
    ];

    const faces = [

      [0, 1, 2, 3, 15],
      [4, 7, 6, 5, -10],
      [0, 4, 5, 1, -5],
      [3, 2, 6, 7, 25],
      [1, 5, 6, 2, 5],
      [0, 3, 7, 4, -20]

    ];

    const draw = [];

    for (
      const face of faces
    ) {

      const points =
        face
          .slice(0, 4)
          .map(i => v[i]);

      if (
        points.some(
          p => !p
        )
      )
        continue;

      const depth =
        points.reduce(
          (a, p) =>
            a + p.depth,
          0
        ) / 4;

      draw.push({
        points,
        depth,
        shade: face[4]
      });
    }

    draw.sort(
      (a, b) =>
        b.depth - a.depth
    );

    for (
      const face of draw
    ) {

      this.ctx.beginPath();

      this.ctx.moveTo(
        face.points[0].x,
        face.points[0].y
      );

      for (
        let i = 1;
        i < face.points.length;
        i++
      ) {

        this.ctx.lineTo(
          face.points[i].x,
          face.points[i].y
        );
      }

      this.ctx.closePath();

      this.ctx.fillStyle =
        this.shade(
          color,
          face.shade
        );

      this.ctx.fill();

      this.ctx.strokeStyle =
        "rgba(0,0,0,.12)";

      this.ctx.stroke();
    }
  }


  sphere(
    x,
    y,
    z,
    radius,
    color
  ) {

    const p =
      this.project(
        x,
        y,
        z
      );

    if (!p)
      return;

    const edge =
      this.project(
        x + radius,
        y,
        z
      );

    if (!edge)
      return;

    const r =
      Math.abs(
        edge.x - p.x
      );

    if (r < .5)
      return;

    const gradient =
      this.ctx.createRadialGradient(
        p.x - r * .35,
        p.y - r * .4,
        1,
        p.x,
        p.y,
        r
      );

    gradient.addColorStop(
      0,
      "#ffffff"
    );

    gradient.addColorStop(
      .2,
      color
    );

    gradient.addColorStop(
      1,
      this.shade(
        color,
        -55
      )
    );

    this.ctx.beginPath();

    this.ctx.arc(
      p.x,
      p.y,
      r,
      0,
      Math.PI * 2
    );

    this.ctx.fillStyle =
      gradient;

    this.ctx.fill();
  }


  line(
    x1,
    y1,
    z1,
    x2,
    y2,
    z2,
    color,
    width = 1
  ) {

    const a =
      this.project(
        x1,
        y1,
        z1
      );

    const b =
      this.project(
        x2,
        y2,
        z2
      );

    if (!a || !b)
      return;

    this.ctx.beginPath();

    this.ctx.moveTo(
      a.x,
      a.y
    );

    this.ctx.lineTo(
      b.x,
      b.y
    );

    this.ctx.strokeStyle =
      color;

    this.ctx.lineWidth =
      width;

    this.ctx.stroke();
  }


  text(
    text,
    x,
    y,
    z,
    size = 20
  ) {

    const p =
      this.project(
        x,
        y,
        z
      );

    if (!p)
      return;

    this.ctx.font =
      `900 ${size}px Arial`;

    this.ctx.textAlign =
      "center";

    this.ctx.fillStyle =
      "white";

    this.ctx.strokeStyle =
      "rgba(0,0,0,.5)";

    this.ctx.lineWidth = 4;

    this.ctx.strokeText(
      text,
      p.x,
      p.y
    );

    this.ctx.fillText(
      text,
      p.x,
      p.y
    );
  }
}
