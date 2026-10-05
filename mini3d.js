/* mini3d.js - tiny self-contained 3D renderer (Canvas 2D). Implements the small part of the three.js API that game.js uses,
   so the game runs anywhere with no CDN, no WebGL and no downloads. */
(() => {
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], nrm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const LD = nrm([10, 30, 10]);

class Color {
  constructor(c) { this.r = this.g = this.b = 1; if (c !== undefined) this.set(c); }
  set(c) {
    if (c && c.isColor) { this.r = c.r; this.g = c.g; this.b = c.b; }
    else if (typeof c == 'number') { this.r = (c >> 16 & 255) / 255; this.g = (c >> 8 & 255) / 255; this.b = (c & 255) / 255; }
    else if (typeof c == 'string') {
      let m = c.match(/^#([0-9a-f]{6})$/i); if (m) return this.set(parseInt(m[1], 16));
      m = c.match(/rgb\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/); if (m) { this.r = m[1] / 255; this.g = m[2] / 255; this.b = m[3] / 255; }
    }
    return this;
  }
  setHSL(h, s, l) { const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; this.r = f(0); this.g = f(8); this.b = f(4); return this; }
  getStyle() { return `rgb(${Math.round(this.r * 255)},${Math.round(this.g * 255)},${Math.round(this.b * 255)})`; }
}
Color.prototype.isColor = true;
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  lerp(v, a) { this.x += (v.x - this.x) * a; this.y += (v.y - this.y) * a; this.z += (v.z - this.z) * a; return this; }
}
class Object3D {
  constructor() { this.position = new Vector3(); this.rotation = new Vector3(); this.scale = new Vector3(1, 1, 1); this.children = []; this.visible = true; this.parent = null; this.renderOrder = 0; }
  add(...c) { c.forEach(o => { if (o.parent) o.parent.remove(o); o.parent = this; this.children.push(o); }); return this; }
  remove(...c) { c.forEach(o => { const i = this.children.indexOf(o); if (i >= 0) { this.children.splice(i, 1); o.parent = null; } }); return this; }
  lookAt(x, y, z) { this.target = [x, y, z]; }
}
class Mesh extends Object3D { constructor(g, m) { super(); this.geometry = g; this.material = m; } }
class Scene extends Object3D { constructor() { super(); this.background = null; this.fog = null; } }
class Fog { constructor(c, n, f) { this.color = new Color(c); this.near = n; this.far = f; } }
class PerspectiveCamera extends Object3D { constructor(fov = 60, aspect = 1) { super(); this.fov = fov; this.aspect = aspect; } updateProjectionMatrix() {} }
class Light extends Object3D { constructor() { super(); } }
const Geo = type => class { constructor(...a) { this.type = type; this.a = a; } };
class Mat { constructor(o = {}, lit) { this.color = new Color(o.color !== undefined ? o.color : 0xffffff); this.map = o.map || null; this.lit = lit; } }

/* ---- geometry data (convex solids) ---- */
function meshData(g) {
  if (g._m) return g._m; let v = [], f = [];
  if (g.type == 'box') {
    const [w, h, d] = g.a; for (let i = 0; i < 8; i++) v.push([(i & 1 ? 1 : -1) * w / 2, (i & 2 ? 1 : -1) * h / 2, (i & 4 ? 1 : -1) * d / 2]);
    f = [[0, 2, 6, 4], [1, 3, 7, 5], [0, 1, 5, 4], [2, 3, 7, 6], [0, 1, 3, 2], [4, 5, 7, 6]];
  } else if (g.type == 'plane') {
    const [w, h] = g.a; v = [[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]]; f = [[0, 1, 2, 3]];
  } else {
    const cone = g.type == 'cone', rt = cone ? 0 : g.a[0], rb = cone ? g.a[0] : g.a[1], h = cone ? g.a[1] : g.a[2], n = (cone ? g.a[2] : g.a[3]) || 12;
    for (let i = 0; i < n; i++) { const a = i / n * 6.2832; v.push([Math.cos(a) * rt, h / 2, Math.sin(a) * rt]); }
    for (let i = 0; i < n; i++) { const a = i / n * 6.2832; v.push([Math.cos(a) * rb, -h / 2, Math.sin(a) * rb]); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; f.push([i, j, n + j, n + i]); }
    f.push([...Array(n).keys()], [...Array(n).keys()].map(i => n + i));
  }
  return g._m = { v, f };
}

/* ---- transforms: {R: row-major 3x3, t: translation} ---- */
const ID = { R: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] };
function local(o) {
  const a = o.rotation.x, b = o.rotation.y, c = o.rotation.z, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c);
  const m = [cb * cc, -cb * sc, sb, ca * sc + sa * cc * sb, ca * cc - sa * sc * sb, -sa * cb, sa * sc - ca * cc * sb, sa * cc + ca * sc * sb, ca * cb], s = [o.scale.x, o.scale.y, o.scale.z];
  return { R: m.map((x, i) => x * s[i % 3]), t: [o.position.x, o.position.y, o.position.z] };
}
function comp(P, L) {
  const R = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R.push(P.R[i * 3] * L.R[j] + P.R[i * 3 + 1] * L.R[3 + j] + P.R[i * 3 + 2] * L.R[6 + j]);
  return { R, t: [P.R[0] * L.t[0] + P.R[1] * L.t[1] + P.R[2] * L.t[2] + P.t[0], P.R[3] * L.t[0] + P.R[4] * L.t[1] + P.R[5] * L.t[2] + P.t[1], P.R[6] * L.t[0] + P.R[7] * L.t[1] + P.R[8] * L.t[2] + P.t[2]] };
}
const ap = (M, p) => [M.R[0] * p[0] + M.R[1] * p[1] + M.R[2] * p[2] + M.t[0], M.R[3] * p[0] + M.R[4] * p[1] + M.R[5] * p[2] + M.t[1], M.R[6] * p[0] + M.R[7] * p[1] + M.R[8] * p[2] + M.t[2]];
const NEAR = .3;
function clip(P) { const o = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], ia = a[2] >= NEAR, ib = b[2] >= NEAR; if (ia) o.push(a); if (ia !== ib) { const t = (NEAR - a[2]) / (b[2] - a[2]); o.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]); } } return o; }

class WebGLRenderer {
  constructor(o) { this.canvas = o.canvas; this.ctx = this.canvas.getContext('2d'); }
  setSize(w, h) { this.canvas.width = w; this.canvas.height = h; }
  render(scene, cam) {
    const c = this.ctx, W = this.canvas.width, H = this.canvas.height, fog = scene.fog, bg = scene.background || new Color(0x8fd8ff);
    c.fillStyle = bg.getStyle(); c.fillRect(0, 0, W, H); c.lineJoin = 'round';
    const p = [cam.position.x, cam.position.y, cam.position.z], tg = cam.target || [p[0], p[1], p[2] - 1];
    const f = nrm(sub(tg, p)), r = nrm(crs(f, [0, 1, 0])), u = crs(r, f), F = H / 2 / Math.tan(cam.fov * Math.PI / 360);
    const toCam = v => { const d = sub(v, p); return [dot(d, r), dot(d, u), dot(d, f)]; }, pr = q => [W / 2 + q[0] / q[2] * F, H / 2 - q[1] / q[2] * F];
    const ff = z => fog ? clamp((z - fog.near) / (fog.far - fog.near), 0, 1) : 0;
    const css = (col, k, z) => { const t = ff(z), fc = fog ? fog.color : col, m = (v, fv) => Math.round(clamp(v * k * (1 - t) + fv * t, 0, 1) * 255); return `rgb(${m(col.r, fc.r)},${m(col.g, fc.g)},${m(col.b, fc.b)})`; };
    const items = [];
    const walk = (o, P) => { if (!o.visible) return; const M = comp(P, local(o)); if (o.geometry) items.push({ o, M, z: toCam(M.t)[2] }); o.children.forEach(ch => walk(ch, M)); };
    walk(scene, ID);
    items.sort((a, b) => (a.o.renderOrder - b.o.renderOrder) || (b.z - a.z));
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5;
    for (const it of items) {
      const g = it.o.geometry, m = it.o.material, M = it.M;
      if (g.type == 'sphere') {
        if (it.z < NEAR + .2) continue;
        const rr = g.a[0], C = M.t, s0 = pr(toCam(C)), X = [M.R[0], M.R[3], M.R[6]], Y = [M.R[1], M.R[4], M.R[7]];
        const sx = pr(toCam([C[0] + X[0] * rr, C[1] + X[1] * rr, C[2] + X[2] * rr])), sy = pr(toCam([C[0] + Y[0] * rr, C[1] + Y[1] * rr, C[2] + Y[2] * rr]));
        const ex = [sx[0] - s0[0], sx[1] - s0[1]], ey = [sy[0] - s0[0], sy[1] - s0[1]], rx = Math.hypot(...ex), ry = Math.hypot(...ey), rot = Math.atan2(ey[1], ey[0]) + Math.PI / 2, half = g.a[6] !== undefined && g.a[6] < 3;
        if (!(rx > .3 && ry > .3)) continue;
        c.save(); c.translate(s0[0], s0[1]); c.rotate(rot); c.beginPath();
        if (half) { c.ellipse(0, 0, rx, ry, 0, Math.PI, 2 * Math.PI); c.closePath(); } else c.ellipse(0, 0, rx, ry, 0, 0, 6.2832);
        if (m.map) {
          c.save(); c.clip(); c.drawImage(m.map.image, -rx, -ry, 2 * rx, 2 * ry);
          const gr = c.createRadialGradient(-rx * .3, -ry * .4, rx * .1, 0, 0, rx * 1.1); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = gr; c.fillRect(-rx, -ry, 2 * rx, 2 * ry); c.restore();
        } else { c.fillStyle = css(m.color, m.lit ? .9 : 1, it.z); c.fill(); }
        c.stroke(); c.restore(); continue;
      }
      const md = meshData(g), plane = g.type == 'plane';
      for (const fc of md.f) {
        const wv = fc.map(i => ap(M, md.v[i])); let n = crs(sub(wv[1], wv[0]), sub(wv[2], wv[0])); const l = Math.hypot(...n); if (l < 1e-6) continue; n = n.map(x => x / l);
        const cen = [0, 1, 2].map(i => wv.reduce((s, q) => s + q[i], 0) / wv.length), tc = sub(p, cen);
        if (plane) { if (dot(n, tc) < 0) n = n.map(x => -x); } else { if (dot(n, sub(cen, M.t)) < 0) n = n.map(x => -x); if (dot(n, tc) <= 0) continue; }
        const P = clip(wv.map(toCam)); if (P.length < 3) continue;
        c.beginPath(); P.forEach((q, i) => { const s = pr(q); i ? c.lineTo(s[0], s[1]) : c.moveTo(s[0], s[1]); }); c.closePath();
        c.fillStyle = css(m.color, m.lit ? .55 + .45 * Math.max(0, dot(n, LD)) : 1, it.z); c.fill(); if (!plane) c.stroke();
      }
    }
  }
}
window.THREE = { Color, Vector3, Object3D, Group: Object3D, Mesh, Scene, Fog, PerspectiveCamera, WebGLRenderer, HemisphereLight: Light, DirectionalLight: Light,
  BoxGeometry: Geo('box'), SphereGeometry: Geo('sphere'), CylinderGeometry: Geo('cyl'), ConeGeometry: Geo('cone'), PlaneGeometry: Geo('plane'),
  MeshLambertMaterial: class extends Mat { constructor(o) { super(o, true); } }, MeshBasicMaterial: class extends Mat { constructor(o) { super(o, false); } }, CanvasTexture: class { constructor(i) { this.image = i; } } };
})();
