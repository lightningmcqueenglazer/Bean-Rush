class Mini3D {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.camera = {
            x: 0,
            y: 7,
            z: -12
        };

        this.fov = 700;

        this.resize();

        window.addEventListener("resize", () => this.resize());
    }

    resize() {

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear(color = "#72d7ff") {

        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    project(x, y, z) {

        const rx = x - this.camera.x;
        const ry = y - this.camera.y;
        const rz = z - this.camera.z;

        if (rz <= 0.1) return null;

        const scale = this.fov / rz;

        return {
            x: this.width / 2 + rx * scale,
            y: this.height / 2 - ry * scale,
            scale
        };
    }

    polygon(points, color) {

        this.ctx.beginPath();

        points.forEach((p, i) => {

            if (i === 0)
                this.ctx.moveTo(p.x, p.y);
            else
                this.ctx.lineTo(p.x, p.y);
        });

        this.ctx.closePath();

        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    cube(x, y, z, w, h, d, color) {

        const p1 = this.project(x - w/2, y, z - d/2);
        const p2 = this.project(x + w/2, y, z - d/2);
        const p3 = this.project(x + w/2, y, z + d/2);
        const p4 = this.project(x - w/2, y, z + d/2);

        const top = this.project(x, y + h, z);

        if (!p1 || !p2 || !p3 || !p4 || !top)
            return;

        this.polygon([p1,p2,p3,p4], color);

        this.polygon([
            p1,
            p2,
            top
        ], this.shade(color, 1.15));

        this.polygon([
            p2,
            p3,
            top
        ], this.shade(color, .85));

        this.polygon([
            p3,
            p4,
            top
        ], this.shade(color, .75));

        this.polygon([
            p4,
            p1,
            top
        ], this.shade(color, .95));
    }

    sphere(x, y, z, radius, color) {

        const p = this.project(x, y, z);

        if (!p) return;

        const r = radius * p.scale;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

        this.ctx.fillStyle = color;
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(
            p.x - r * .25,
            p.y - r * .25,
            r * .25,
            0,
            Math.PI * 2
        );

        this.ctx.fillStyle = "rgba(255,255,255,.25)";
        this.ctx.fill();
    }

    shade(hex, amount) {

        hex = hex.replace("#","");

        let r = parseInt(hex.substring(0,2),16);
        let g = parseInt(hex.substring(2,4),16);
        let b = parseInt(hex.substring(4,6),16);

        r = Math.min(255, Math.floor(r * amount));
        g = Math.min(255, Math.floor(g * amount));
        b = Math.min(255, Math.floor(b * amount));

        return `rgb(${r},${g},${b})`;
    }
}
