try { (() => {
const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), pick = a => a[Math.random() * a.length | 0];
if (typeof THREE === 'undefined') throw new Error('mini3d.js did not load. Keep index.html, style.css, mini3d.js and game.js in the same folder.');
const M = c => new THREE.MeshLambertMaterial({ color: c });

/* ================= DATA ================= */
const RAR = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'], RC = ['#777', '#1b9e4b', '#2878c8', '#8e44ad', '#d4a000'], PR = [0, 60, 150, 300, 600];
// [slot, id, name, rarity, {lvl: level unlock, cr: crown unlock, mo: months for limited-time}]
const ITEMS = [
 ['face','happy','Happy',0],['face','cool','Cool shades',1],['face','silly','Silly',1],['face','angry','Angry',2],['face','star','Star eyes',3],
 ['hat','none','No hat',0],['hat','cone','Party cone',0],['hat','top','Top hat',1],['hat','helmet','Helmet',1],['hat','pirate','Pirate hat',2],['hat','crown','Golden crown',4,{cr:1}],['hat','pumpkin','Pumpkin hat',2,{mo:[9]}],['hat','santa','Santa hat',2,{mo:[11]}],
 ['pack','none','No backpack',0],['pack','wings','Wings',1],['pack','shell','Turtle shell',2],['pack','rocket','Rocket pack',3],
 ['cos','none','No costume',0],['cos','dino','Dino',1,{lvl:5}],['cos','shark','Shark',3],['cos','pizza','Pizza',2,{lvl:10}],['cos','robot','Robot',4],
 ['vic','spin','Victory spin',0],['vic','hop','Victory hop',1],['vic','flip','Victory flip',3,{lvl:25}],
 ['emo','wiggle','Wiggle',0],['emo','spin','Spin',1],['emo','flip','Back flip',2,{lvl:15}]
].map(([slot, id, name, r, x = {}]) => ({ slot, id, name, r, key: slot + ':' + id, p: x.lvl || x.cr || !r ? 0 : PR[r], ...x }));
const SLOTS = { face: 'Face', hat: 'Hat', pack: 'Backpack', cos: 'Costume', vic: 'Victory', emo: 'Emote (Q)' };
const COS = { dino: { c1: '#4caf50', c2: '#2e7d32', pat: 'stripes' }, shark: { c1: '#5b8def', c2: '#ffffff', pat: 'half' }, pizza: { c1: '#f7c04a', c2: '#d9383a', pat: 'dots' }, robot: { c1: '#b0b7c3', c2: '#555555', pat: 'stripes' } };
const MAPS = {
 jungle: { n: 'Jungle Dash', type: 'race', sky: 0x7bd88f, pal: [0x3fae5a, 0x8bc34a, 0x2e8b57], len: 110, limit: 80, mix: ['solid', 'spin', 'mover', 'bounce', 'conv', 'bridge'] },
 candy: { n: 'Candy Orb Grab (Teams)', type: 'team', sky: 0xffc2e2, pal: [0xff8fc7], time: 30 },
 volcano: { n: 'Volcano Collapse', type: 'survive', sky: 0xff9c6b, pal: [0x6b4a3a, 0x8a5a44], time: 40 },
 space: { n: 'Space Crown Run', type: 'race', sky: 0x1a1a4a, pal: [0x6d5dfc, 0x00d4ff, 0xff4fd8], len: 170, limit: 100, mix: ['solid', 'mover', 'collapse', 'fan', 'conv', 'hammer', 'spin', 'bridge', 'bounce'] }
};
const MODES = { classic: ['jungle', 'candy', 'volcano', 'space'], race: ['jungle', 'jungle', 'space', 'space'], survival: ['volcano', 'volcano', 'volcano', 'volcano'], team: ['candy', 'candy', 'volcano', 'space'], practice: ['jungle', 'candy', 'volcano', 'space'] };
const MODEINFO = { classic: 'Classic: 4 rounds, 16 players', race: 'Race: pure obstacle courses', survival: 'Survival: last beans standing', team: 'Team Battle: orbs, then survive', practice: 'Practice: no eliminations (Esc to quit)' };
const Q = [12, 8, 4, 1], TEAMS = [['Red', 0xff4040], ['Blue', 0x3d7bff], ['Yellow', 0xffc800]], BADGES = [1, 5, 10, 25, 50, 100];

/* ================= SAVE / PROGRESSION ================= */
const today = new Date().toDateString(), month = new Date().getMonth();
const S = Object.assign({ xp: 0, coins: 0, crowns: 0, matches: 0, owned: [], favs: [], presets: [null, null, null], last: '', dq: 0, dj: 0, dd: 0, best: 0,
  look: { c1: '#ff5fa2', c2: '#ffffff', pat: 'none', face: 'happy', hat: 'none', pack: 'none', cos: 'none', vic: 'spin', emo: 'wiggle' } }, JSON.parse(localStorage.getItem('beanrush2') || '{}'));
const store = () => localStorage.setItem('beanrush2', JSON.stringify(S));
const lvlOf = xp => { let l = 1, n = 100; while (xp >= n) { xp -= n; l++; n = 100 + 60 * (l - 1); } return [l, xp, n]; };
const owned = it => (!it.p && !it.lvl && !it.cr && !it.mo) || S.owned.includes(it.key) || (it.lvl && lvlOf(S.xp)[0] >= it.lvl) || (it.cr && S.crowns >= it.cr);
let loginBonus = false;
if (S.last !== today) { S.last = today; S.dq = S.dj = S.dd = 0; S.coins += 50; loginBonus = true; }
store();
function gain(xp, c) { const l0 = lvlOf(S.xp)[0]; S.xp += xp; S.coins += c; store(); const l1 = lvlOf(S.xp)[0]; if (l1 > l0) { flash('LEVEL UP! Lv ' + l1); tone(880, .4); } }
function daily() { if (S.dq >= 3 && !(S.dd & 1)) { S.dd |= 1; gain(100, 50); } if (S.dj >= 100 && !(S.dd & 2)) { S.dd |= 2; gain(100, 50); } store(); }

/* ================= THREE SETUP ================= */
let ren;
try { ren = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true }); } catch (e) { throw new Error('WebGL is not available in this browser.'); }
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x8fd8ff); scene.fog = new THREE.Fog(0x8fd8ff, 40, 150);
const cam = new THREE.PerspectiveCamera(60, 1, .1, 300);
scene.add(new THREE.HemisphereLight(0xffffff, 0x88aaff, .9)); const sun = new THREE.DirectionalLight(0xffffff, .6); sun.position.set(10, 30, 10); scene.add(sun);
const resize = () => { ren.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
addEventListener('resize', resize); resize();

/* ================= AUDIO ================= */
let ac, mute = 0, mus;
const AC = () => ac = ac || new (window.AudioContext || window.webkitAudioContext)();
function tone(f, d = .1, ty = 'square', v = .04) { if (mute) return; try { const c = AC(), o = c.createOscillator(), g = c.createGain(); o.type = ty; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (e) {} }
function cheer() { if (mute) return; try { const c = AC(), n = c.sampleRate * 1.5, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = c.createBufferSource(), g = c.createGain(); g.gain.value = .08; s.buffer = b; s.connect(g); g.connect(c.destination); s.start(); } catch (e) {} }
function music(bpm) { clearInterval(mus); if (!bpm) return; let n = 0; const sc = [0, 4, 7, 9, 12, 9, 7, 4]; mus = setInterval(() => { tone(130.8 * 2 ** (sc[n % 8] / 12) * (n % 16 < 8 ? 1 : 1.5), .12, 'triangle', .05); if (n % 2 == 0) tone(65, .1, 'sine', .08); n++; }, 30000 / bpm); }

/* ================= BEAN BUILDER ================= */
const HAT = { cone: [new THREE.ConeGeometry(.3, .6, 12), 0xffd166, 2.1], top: [new THREE.CylinderGeometry(.3, .3, .6, 12), 0x222222, 2.1], helmet: [new THREE.SphereGeometry(.66, 12, 8, 0, 6.3, 0, 1.5), 0x9aa0a6, 1.2], pirate: [new THREE.CylinderGeometry(.55, .3, .3, 10), 0x2b2b2b, 2], crown: [new THREE.CylinderGeometry(.38, .28, .32, 6), 0xffd700, 2], pumpkin: [new THREE.SphereGeometry(.35, 10, 8), 0xff8c1a, 2], santa: [new THREE.ConeGeometry(.35, .7, 10), 0xe53935, 2.1] };
const lookOf = L => Object.assign({}, L, COS[L.cos] || {});
function makeBean(L0) {
  const L = lookOf(L0), g = new THREE.Group(), cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d');
  x.fillStyle = L.c1; x.fillRect(0, 0, 64, 64); x.fillStyle = L.c2;
  if (L.pat == 'stripes') for (let y = 0; y < 64; y += 16) x.fillRect(0, y, 64, 8);
  if (L.pat == 'dots') for (let a = 8; a < 64; a += 16) for (let b = 8; b < 64; b += 16) { x.beginPath(); x.arc(a + (b % 32 ? 4 : 0), b, 4, 0, 7); x.fill(); }
  if (L.pat == 'half') x.fillRect(0, 0, 32, 64);
  const body = new THREE.Mesh(new THREE.SphereGeometry(.6, 16, 12), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(cv) })); body.scale.set(1, 1.4, 1); body.position.y = .85; g.add(body); g.body = body;
  const B = (geo, c, p, r) => { const m = new THREE.Mesh(geo, M(c)); m.position.set(...p); if (r) m.rotation.set(...r); g.add(m); return m; };
  const sp = r => new THREE.SphereGeometry(r, 8, 8), bx = (a, b, c) => new THREE.BoxGeometry(a, b, c), f = L.face;
  if (f == 'cool') B(bx(.7, .18, .1), 0x111111, [0, 1.25, -.55]);
  else [-.2, .2].forEach(s => { B(sp(f == 'silly' && s > 0 ? .18 : .12), f == 'star' ? 0xffd700 : 0xffffff, [s, 1.25, -.5]); if (f != 'star') B(sp(.06), 0x111111, [s, 1.25, -.61]); if (f == 'angry') B(bx(.25, .05, .05), 0x111111, [s, 1.42, -.55], [0, 0, s > 0 ? .5 : -.5]); });
  if (f == 'silly') B(sp(.1), 0xff6b9d, [0, .95, -.55]);
  const h = HAT[L.hat]; if (h) B(h[0], h[1], [0, h[2], 0]);
  if (L.pack == 'wings') [-1, 1].forEach(s => B(bx(.9, .1, .5), 0xffffff, [s * .6, 1.1, .55], [0, 0, s * .5]));
  if (L.pack == 'shell') B(sp(.5), 0x2e9e4f, [0, 1, .55]).scale.set(1, 1.2, .6);
  if (L.pack == 'rocket') { B(new THREE.CylinderGeometry(.15, .15, .9, 8), 0xdddddd, [0, 1, .65]); B(new THREE.ConeGeometry(.15, .3, 8), 0xff3b3b, [0, 1.6, .65]); }
  if (L0.cos == 'dino') [1.9, 1.5, 1.1].forEach(y => B(new THREE.ConeGeometry(.15, .35, 6), 0x2e7d32, [0, y, .5]));
  if (L0.cos == 'shark') B(new THREE.ConeGeometry(.2, .7, 6), 0x3b6fd0, [0, 1.9, .2]);
  if (L0.cos == 'robot') { B(new THREE.CylinderGeometry(.03, .03, .4, 6), 0x555555, [0, 2.1, 0]); B(sp(.08), 0xff3b3b, [0, 2.35, 0]); }
  scene.add(g); return g;
}
function randLook(any) {
  const L = { c1: new THREE.Color().setHSL(Math.random(), .8, .6).getStyle(), c2: new THREE.Color().setHSL(Math.random(), .8, .85).getStyle(), pat: pick(['none', 'stripes', 'dots', 'half']) };
  Object.keys(SLOTS).forEach(s => L[s] = pick(ITEMS.filter(i => i.slot == s && (any || owned(i)))).id); return L;
}

/* ================= LEVEL BUILDING ================= */
let lvl = new THREE.Group(), plats = [], spins = [], orbs = [], R, ents = [], me, maps, mode, practice, round = 0, t = 0, cd = 0, state = 'menu', finished = [], teamScore = [0, 0, 0], teamN = 3, matchId = 0, jumpsNow = 0;
const platAt = (x, z) => plats.find(p => !p.gone && Math.abs(x - p.x) < p.w / 2 && Math.abs(z - p.z) < p.d / 2);
function build() {
  scene.remove(lvl); lvl = new THREE.Group(); scene.add(lvl); plats = []; spins = []; orbs = [];
  scene.background = new THREE.Color(R.sky); scene.fog.color.set(R.sky);
  const df = R.diff, pc = () => pick(R.pal);
  const add = (x, z, w, d, col, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1, d), M(col)); m.position.set(x, -.5, z); m.renderOrder = -1; lvl.add(m); const p = Object.assign({ x, ox: x, z, w, d, m }, o); plats.push(p); return p; };
  const spin = (x, z, len, sp, osc) => { const m = new THREE.Mesh(new THREE.BoxGeometry(len, 1.2, .8), M(osc ? 0xff9f1c : 0xff4040)); m.position.set(x, .6, z); lvl.add(m); spins.push({ x, z, len, sp, base: sp, osc, a: 0, w: sp, m }); };
  if (R.type == 'survive') {
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) add(i * 6, j * 6, 5.6, 5.6, pc(), { col: 1 });
    spin(0, 0, 44, 1 + df * .1); spin(0, 0, 22, -1.4);
    const lava = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0xff4500 })); lava.rotation.x = -Math.PI / 2; lava.position.y = -8; lava.renderOrder = -2; lvl.add(lava); return;
  }
  if (R.type == 'team') {
    add(0, 0, 44, 44, R.pal[0]); spin(0, 0, 30, .8);
    for (let i = 0; i < 8; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(.5, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd700 })); lvl.add(o); orbs.push(o); moveOrb(o); }
    return;
  }
  add(0, -5, 24, 14, 0xffffff); let z = -12;
  const seg = {
    solid: () => { add(0, z - 7, 20, 14, pc()); z -= 14; },
    spin: () => { add(0, z - 7, 20, 14, pc()); spin(0, z - 7, 18, (1 + df * .5) * pick([-1, 1])); z -= 14; },
    hammer: () => { add(0, z - 7, 20, 14, pc()); spin(0, z - 7, 16, 1.2 + df * .3, 1); z -= 14; },
    bridge: () => { add(0, z - 7, 4, 14, pc()); z -= 14; },
    mover: () => { const g = 9 + df; add(0, z - g / 2, 7, 5, 0xff9f1c, { amp: 6, spd: 1 + df * .4, ph: rnd(0, 6) }); add(0, z - g - 5, 20, 10, pc()); z -= g + 10; },
    bounce: () => { add(0, z - 3, 8, 6, 0xff5fa2, { bn: 1 }); add(0, z - 21, 20, 12, pc()); z -= 27; },
    conv: () => { add(0, z - 7, 20, 14, 0x555566, { cv: [0, 5 + df] }); z -= 14; },
    fan: () => { add(0, z - 7, 20, 14, 0x7fdcff, { fan: [pick([-8, 8]), 0] }); z -= 14; },
    collapse: () => { const s = pick([-1, 0, 1]); [-1, 0, 1].forEach(k => add(k * 7, z - 7, 6, 14, 0xb5651d, k == s ? {} : { col: 1, back: 1 })); z -= 14; }
  };
  while (z > -R.len) seg[pick(R.mix)]();
  R.fz = z; add(0, z - 8, 24, 16, 0xffffff);
  const line = new THREE.Mesh(new THREE.BoxGeometry(24, .2, 1.5), M(0xffd700)); line.position.set(0, .1, z); lvl.add(line);
}
function moveOrb(o) { const a = rnd(0, 6.28), r = rnd(2, 17); o.position.set(Math.cos(a) * r, 1, Math.sin(a) * r); }

/* ================= ENTITIES ================= */
const alive = () => ents.filter(e => !e.out);
function spawn(e, i, n) {
  if (R.type == 'survive') { const a = i / n * 6.283; e.x = Math.cos(a) * 14; e.z = Math.sin(a) * 14; }
  else if (R.type == 'team') { const a = rnd(0, 6.28), r = rnd(3, 15); e.x = Math.cos(a) * r; e.z = Math.sin(a) * r; }
  else { e.x = (i % 6) * 3.4 - 8.5; e.z = -Math.floor(i / 6) * 3; }
  e.y = .5; e.vx = e.vy = e.vz = 0; e.cx = e.x; e.cz = e.z; e.fin = false; e.hit = 0; e.dv = e.sl = e.dc = 0; e.fx = 0; e.fz = -1; e.m.visible = true; e.m.rotation.set(0, 0, 0);
}
const A = s => s.a;
function spinLocal(e, s) { const dx = e.x - s.x, dz = e.z - s.z, c = Math.cos(s.a), n = Math.sin(s.a); return { lx: dx * c + dz * n, lz: -dx * n + dz * c, c, n }; }

const keys = {};
addEventListener('keydown', e => { keys[e.code] = 1; if (e.code == 'Space') e.preventDefault(); if (e.code == 'KeyM') mute = !mute; if (e.code == 'Escape' && state != 'menu') quit(); if (e.code == 'KeyQ' && me && state != 'menu') me.an = { type: S.look.emo, until: performance.now() + 1500 }; });
addEventListener('keyup', e => keys[e.code] = 0);
function playerIn() {
  const x = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), z = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0), l = Math.hypot(x, z) || 1;
  return { x: x / l, z: z / l, j: !!keys.Space, d: !!(keys.ShiftLeft || keys.ShiftRight || keys.KeyE) };
}
function botIn(e) {
  const near = spins.some(s => { const p = spinLocal(e, s); return Math.abs(p.lz) < 2.6 && Math.abs(p.lx) < s.len / 2 + 1; });
  if (R.type == 'team') { const o = orbs.reduce((b, o) => !b || Math.hypot(o.position.x - e.x, o.position.z - e.z) < Math.hypot(b.position.x - e.x, b.position.z - e.z) ? o : b, null), l = Math.hypot(o.position.x - e.x, o.position.z - e.z) || 1; return { x: (o.position.x - e.x) / l, z: (o.position.z - e.z) / l, j: near, d: Math.random() < .004 }; }
  if (R.type == 'survive') { const a = t * .3 + e.id, tx = Math.cos(a) * 9, tz = Math.sin(a) * 9, l = Math.hypot(tx - e.x, tz - e.z) || 1; return { x: (tx - e.x) / l, z: (tz - e.z) / l, j: near || Math.random() < .01 }; }
  const ah = platAt(e.x + e.vx * .3, e.z - 2.2);
  return { x: clamp(((ah ? ah.x : 0) - e.x) * .4, -1, 1) * .8, z: -1, j: !ah || near || Math.random() < .004, d: Math.random() < .002 };
}

/* ================= PHYSICS ================= */
function phys(e, i, dt) {
  const p0 = platAt(e.x, e.z), on = p0 && e.y <= .05 && e.y > -.6, dv = t < e.dv, a = Math.min(1, dt * (on ? 10 : 3)) * (dv ? .08 : t < e.sl ? .4 : 1);
  if (i.x || i.z) { e.fx = i.x; e.fz = i.z; }
  e.vx += (i.x * 9 * e.sp - e.vx) * a; e.vz += (i.z * 9 * e.sp - e.vz) * a;
  if (i.j && on && e.vy <= .1) { e.vy = 11; if (e.me) { tone(520); jumpsNow++; S.dj++; } }
  if (i.d && t >= e.dc && !dv) { e.dc = t + 1.2; e.dv = t + .5; e.sl = t + 1; e.vx = e.fx * 15; e.vz = e.fz * 15; e.vy = Math.max(e.vy, 5); if (e.me) tone(300, .1); }
  e.vy -= 30 * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.z += e.vz * dt;
  const p = platAt(e.x, e.z);
  if (p && p.fan && e.y < 8) { e.x += p.fan[0] * dt; e.z += p.fan[1] * dt; }
  if (p && e.vy <= 0 && e.y <= 0 && e.y > -.6) {
    e.y = 0; e.vy = 0;
    if (p.bn) { e.vy = 22; if (e.me) tone(700, .2, 'sine'); }
    else { if (p.cv) { e.x += p.cv[0] * dt; e.z += p.cv[1] * dt; } if (p.col && !p.cd) p.cd = t + (R.type == 'survive' ? .6 : .8); if (R.type == 'race' && !p.amp && !p.col) { e.cx = p.x; e.cz = e.z; } }
  }
  if (t > e.hit) spins.forEach(s => { const q = spinLocal(e, s); if (Math.abs(q.lx) < s.len / 2 + .4 && Math.abs(q.lz) < .8 && e.y < 1.6 && e.y > -.5) { const k = Math.sign(q.lx * s.w) || 1; e.vx = -q.n * k * 14; e.vz = q.c * k * 14; e.vy = 7; e.hit = t + .5; if (e.me) tone(150, .15); } });
  if (e.y < -14) {
    if (R.type == 'race') { e.x = e.cx; e.z = e.cz; e.y = 2; e.vx = e.vy = e.vz = 0; if (e.me) tone(200, .25, 'sawtooth'); }
    else if (practice || R.type == 'team') { e.x = rnd(-4, 4); e.z = rnd(-4, 4); e.y = 4; e.vx = e.vy = e.vz = 0; }
    else { e.out = true; e.m.visible = false; if (e.me) tone(120, .5, 'sawtooth'); }
  }
  if (R.type == 'race' && e.z < R.fz && !e.fin) { e.fin = true; e.y = 0; e.vx = e.vz = 0; finished.push(e); if (e.me) tone(880, .3); }
}

/* ================= ROUND FLOW ================= */
const show = s => $('msg').textContent = s;
let flT; const flash = s => { show(s); clearTimeout(flT); flT = setTimeout(() => state != 'count' && show(''), 1800); };
const later = (fn, ms) => { const id = matchId; setTimeout(() => id == matchId && fn(), ms); };

function startRound(i) {
  round = i; const id = maps[i % maps.length];
  R = Object.assign({}, MAPS[id], { diff: Math.min(4, i % 4 + 1), q: Q[i] || 1 });
  build(); const al = alive(); al.forEach((e, k) => spawn(e, k, al.length)); finished = []; t = 0; cd = 3; state = 'count'; teamScore = [0, 0, 0];
  if (R.type == 'team') {
    teamN = al.length >= 9 ? 3 : 2; al.sort(() => Math.random() - .5).forEach((e, k) => { e.team = k % teamN; const r = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .05, 16), new THREE.MeshBasicMaterial({ color: TEAMS[e.team][1] })); r.position.y = .03; r.renderOrder = -.5; e.m.add(r); e.ring = r; });
  }
  $('rn').textContent = `Round ${i + 1}/${practice ? '∞' : maps.length}: ${R.n}`;
  show(`${R.n}\n` + (R.type == 'race' ? `Top ${R.q} qualify` : R.type == 'survive' ? `Survive ${R.time}s!` : `You are on the ${TEAMS[me.team || 0][0]} team!`));
  if (R.type == 'team' && !me.out) show(`${R.n}\nYou are on the ${TEAMS[me.team][0]} team!`);
  music([120, 128, 138, 154][i % 4]); S.best = Math.max(S.best, i + 1);
  if (i == 3 && !me.out && !practice) gain(50, 20);
  store();
}
function endRound() {
  state = 'end'; let keep;
  if (R.type == 'race') keep = finished.slice(0, R.q);
  else if (R.type == 'team') { const sc = teamScore.slice(0, teamN), lo = Math.min(...sc), lt = pick(sc.map((v, i) => v == lo ? i : -1).filter(i => i >= 0)); keep = alive().filter(e => e.team !== lt); flash(`${TEAMS[lt][0]} team eliminated!`); }
  else keep = alive().sort(() => Math.random() - .5).slice(0, R.q);
  alive().forEach(e => { if (e.ring) { e.m.remove(e.ring); e.ring = null; } });
  const finalRound = round == maps.length - 1 && !practice;
  if (finalRound && !keep.length) keep = [alive().sort((a, b) => a.z - b.z)[0]];
  if (practice) keep = alive();
  if (!me.out) { const w = keep.includes(me); gain(10 + (w ? 30 : 0) + (me.fin ? Math.max(0, 12 - finished.indexOf(me)) : 0), w ? 10 : 0); if (w) { S.dq++; tone(660, .3); } daily(); }
  alive().forEach(e => { if (!keep.includes(e)) { e.out = true; e.m.visible = false; } });
  if (finalRound) return later(() => finish(keep[0]), 800);
  if (R.type != 'team') show(me.out ? 'Eliminated!\nSpectating...' : 'You qualified!'); else if (me.out) show('Eliminated!\nSpectating...');
  later(() => flash(`${keep.length} players qualified`), 1200); later(() => startRound(round + 1), 4000);
}
function finish(w) {
  state = 'win'; music(170); const crown = new THREE.Mesh(new THREE.CylinderGeometry(.4, .3, .35, 6), M(0xffd700)); crown.position.y = 2.2; w.m.add(crown);
  w.an = { type: w.me ? S.look.vic : pick(['spin', 'hop', 'flip']), until: Infinity }; w.m.visible = true; w.fin = true;
  show(w.me ? 'YOU WIN!\nGolden crown!' : `${w.name} wins!`); cheer(); S.matches++;
  if (w.me) { S.crowns++; gain(300, 150); }
  for (let i = 0; i < 80; i++) { const c = document.createElement('div'); c.className = 'confetti'; c.style.left = rnd(0, 100) + 'vw'; c.style.background = `hsl(${rnd(0, 360)},90%,60%)`; c.style.animationDelay = rnd(0, 1.5) + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 6000); }
  for (let b = 0; b < 5; b++) later(() => { const cx = rnd(15, 85), cy = rnd(10, 45), col = `hsl(${rnd(0, 360)},100%,60%)`; for (let i = 0; i < 30; i++) { const d = document.createElement('div'), a = i / 30 * 6.28, r = rnd(60, 130); d.className = 'fw'; d.style.cssText = `left:${cx}vw;top:${cy}vh;background:${col};--x:${Math.cos(a) * r}px;--y:${Math.sin(a) * r}px`; document.body.appendChild(d); setTimeout(() => d.remove(), 1400); } tone(200 + b * 60, .2, 'sawtooth'); }, b * 700);
  store(); later(quit, 8000);
}
function start(m) {
  try { AC().resume(); } catch (e) {}
  quit(true); matchId++; mode = m; maps = MODES[m]; practice = m == 'practice'; scene.remove(mb);
  ents = [{ me: 1, name: 'You', sp: 1, id: 0, m: makeBean(S.look) }];
  for (let i = 1; i < 16; i++) ents.push({ name: 'Bot' + i, sp: rnd(.82, .98), id: i, m: makeBean(randLook(true)) });
  ents.forEach(e => e.out = false); me = ents[0]; jumpsNow = 0;
  ui.classList.add('hide'); $('hud').classList.remove('hide'); startRound(0);
}
function quit(silent) {
  matchId++; music(0); ents.forEach(e => scene.remove(e.m)); ents = []; me = null; state = 'menu'; show('');
  $('hud').classList.add('hide'); ui.classList.remove('hide'); scene.remove(lvl); lvl = new THREE.Group(); scene.background = new THREE.Color(0x8fd8ff); scene.fog.color.set(0x8fd8ff);
  if (!silent) { refresh(); render(); }
}

/* ================= MENU UI ================= */
const ui = $('ui'); let tab = 'play', pv = null, mb;
function refresh() { scene.remove(mb); const L = Object.assign({}, S.look); if (pv) L[pv.slot] = pv.id; mb = makeBean(L); mb.position.x = 3; }
function seeded() { let sd = (Date.now() / 864e5) | 0; return () => (sd = (sd * 9301 + 49297) % 233280) / 233280; }
function itemCard(it) {
  const o = owned(it);
  return `<div class="card" style="border-color:${RC[it.r]}"><b>${it.name}</b><small style="color:${RC[it.r]}">${RAR[it.r]} · ${SLOTS[it.slot]}</small><div class="row"><button data-a="prev" data-v="${it.key}">Preview</button>${o ? '<b>Owned</b>' : `<button data-a="buy" data-v="${it.key}">${it.p} coins</button>`}<button data-a="fav" data-v="${it.key}">${S.favs.includes(it.key) ? '★' : '☆'}</button></div></div>`;
}
function render() {
  const [lv, cur, need] = lvlOf(S.xp);
  let h = `<h1>Bean Rush</h1><div class="tabs">${['play', 'customize', 'shop', 'profile'].map(k => `<button data-a="tab" data-v="${k}" class="${tab == k ? 'on' : ''}">${k}</button>`).join('')}<span class="chip">Lv ${lv} · ${S.coins} coins · ${S.crowns} crowns</span></div>`;
  if (tab == 'play') {
    h += '<button class="big" data-a="mode" data-v="classic">PLAY</button>' + (loginBonus ? '<p><b>Daily login reward: +50 coins!</b></p>' : '') + Object.keys(MODES).map(m => `<div class="row"><button data-a="mode" data-v="${m}">${m}</button><small>${MODEINFO[m]}</small></div>`).join('') + '<p><small>Move: WASD/arrows · Jump: Space · Dive: Shift or E · Emote: Q · Mute: M · Quit: Esc</small></p>';
  } else if (tab == 'customize') {
    h += `<div class="row"><label>Main color</label><input type="color" data-k="c1" value="${S.look.c1}"><label>Second</label><input type="color" data-k="c2" value="${S.look.c2}"></div><div class="row"><label>Pattern</label><select data-k="pat">${['none', 'stripes', 'dots', 'half'].map(p => `<option ${S.look.pat == p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>`;
    h += Object.keys(SLOTS).map(s => `<div class="row"><label>${SLOTS[s]}</label><select data-k="${s}">${ITEMS.filter(i => i.slot == s).map(i => `<option value="${i.id}" ${S.look[s] == i.id ? 'selected' : ''} ${owned(i) ? '' : 'disabled'}>${i.name}${owned(i) ? '' : ' (locked)'}</option>`).join('')}</select></div>`).join('');
    h += `<div class="row"><button data-a="rand">Randomize</button></div><h3>Presets</h3>` + [0, 1, 2].map(i => `<div class="row"><b>Preset ${i + 1}</b><button data-a="save" data-v="${i}">Save</button><button data-a="load" data-v="${i}" ${S.presets[i] ? '' : 'disabled'}>Load</button></div>`).join('');
  } else if (tab == 'shop') {
    const rn = seeded(), pool = ITEMS.filter(i => i.p && !i.mo).map(i => [rn(), i]).sort((a, b) => a[0] - b[0]).map(x => x[1]), lim = ITEMS.filter(i => i.mo && i.mo.includes(month)), now = new Date(), hrs = 24 - now.getHours();
    const shown = [pool[0], ...pool.slice(1, 6)], favs = ITEMS.filter(i => S.favs.includes(i.key) && !shown.includes(i) && !lim.includes(i));
    h += `<p><small>Rotates in about ${hrs}h. Preview shows the item on the bean.</small></p><h3>Featured</h3><div class="grid">${itemCard(pool[0])}</div><h3>Today's items</h3><div class="grid">${pool.slice(1, 6).map(itemCard).join('')}</div>`;
    if (lim.length) h += `<h3>Limited-time</h3><div class="grid">${lim.map(itemCard).join('')}</div>`;
    if (favs.length) h += `<h3>Favorites</h3><div class="grid">${favs.map(itemCard).join('')}</div>`;
  } else {
    h += `<h3>Level ${lv}</h3><div class="bar"><i style="width:${cur / need * 100}%"></i></div><small>${cur}/${need} XP · total ${S.xp} XP</small><p>Matches: ${S.matches} · Crowns: ${S.crowns} · Best round reached: ${S.best || '-'}</p><h3>Crown badges</h3><p>${BADGES.map(n => S.crowns >= n ? `🏅${n}` : `▫${n}`).join(' ')}</p><h3>Daily challenges</h3><p>Qualify 3 times: ${Math.min(3, S.dq)}/3 ${S.dd & 1 ? '✔' : ''}<br>Jump 100 times: ${Math.min(100, S.dj)}/100 ${S.dd & 2 ? '✔' : ''}</p><small>Level rewards: Lv5 Dino, Lv10 Pizza, Lv15 Back flip emote, Lv25 Victory flip. 1 crown unlocks the Golden crown hat.</small>`;
  }
  ui.innerHTML = h;
}
ui.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a, v = b.dataset.v, it = ITEMS.find(i => i.key == v);
  if (a == 'tab') { tab = v; pv = null; refresh(); }
  if (a == 'mode') return start(v);
  if (a == 'prev') { pv = { slot: it.slot, id: it.id }; refresh(); return; }
  if (a == 'buy' && S.coins >= it.p) { S.coins -= it.p; S.owned.push(it.key); S.look[it.slot] = it.id; pv = null; store(); refresh(); }
  if (a == 'fav') { S.favs = S.favs.includes(v) ? S.favs.filter(k => k != v) : [...S.favs, v]; store(); }
  if (a == 'rand') { Object.assign(S.look, randLook(false)); store(); refresh(); }
  if (a == 'save') { S.presets[+v] = Object.assign({}, S.look); store(); }
  if (a == 'load' && S.presets[+v]) { Object.assign(S.look, S.presets[+v]); store(); refresh(); }
  render();
});
ui.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; S.look[k] = e.target.value; store(); refresh(); });
ui.addEventListener('change', e => { const k = e.target.dataset.k; if (!k) return; S.look[k] = e.target.value; store(); refresh(); });
refresh(); render();

/* ================= MAIN LOOP ================= */
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  try {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (state == 'menu') { mb.rotation.y += dt; cam.position.set(0, 2.4, 8); cam.lookAt(1.5, 1.4, 0); ren.render(scene, cam); return; }
    plats.forEach(p => {
      if (p.amp) { p.x = p.ox + p.amp * Math.sin(t * p.spd + p.ph); p.m.position.x = p.x; }
      if (p.cd && !p.gone && t > p.cd) { p.gone = true; p.m.visible = false; p.rb = t + 3; }
      if (p.gone && p.back && R.type == 'race' && t > p.rb) { p.gone = false; p.cd = 0; p.m.visible = true; }
    });
    if (state == 'count') { cd -= dt; show(cd > 0 ? Math.ceil(cd) + '' : 'GO!'); if (cd <= 0) { state = 'play'; tone(880, .3); later(() => state == 'play' && show(''), 800); } }
    if (state == 'play') {
      t += dt;
      spins.forEach(s => { if (R.type == 'survive') s.sp = s.base * (1 + t * .03); if (s.osc) { s.a = 1.57 + Math.sin(t * s.sp) * 1.1; s.w = Math.cos(t * s.sp); } else { s.w = s.sp; s.a += s.sp * dt; } s.m.rotation.y = -s.a; });
      const live = alive().filter(e => !e.fin);
      live.forEach(e => phys(e, e.me ? playerIn() : botIn(e), dt));
      for (let a = 0; a < live.length; a++) for (let b = a + 1; b < live.length; b++) {
        const P = live[a], Q2 = live[b], dx = Q2.x - P.x, dz = Q2.z - P.z, d = Math.hypot(dx, dz);
        if (d < 1.1 && d > .001 && Math.abs(P.y - Q2.y) < 1) { const nx = dx / d, nz = dz / d, k = (t < P.dv || t < Q2.dv) ? 5 : 2; P.x -= nx * .3; P.z -= nz * .3; Q2.x += nx * .3; Q2.z += nz * .3; P.vx -= nx * k; P.vz -= nz * k; Q2.vx += nx * k; Q2.vz += nz * k; }
      }
      const left = alive().length;
      if (R.type == 'race') { $('tm').textContent = `Time ${Math.max(0, R.limit - t) | 0}`; $('ql').textContent = `Qualified ${finished.length}/${R.q} · Left ${left}`; if (finished.length >= R.q || t > R.limit || !live.length) endRound(); }
      else if (R.type == 'survive') { $('tm').textContent = `Time ${Math.max(0, R.time - t) | 0}`; $('ql').textContent = `Players left ${left}`; if (!practice && left <= R.q && left < 16 || t > R.time) endRound(); }
      else { orbs.forEach(o => { o.position.y = 1 + Math.sin(t * 4) * .2; live.forEach(e => { if (Math.hypot(o.position.x - e.x, o.position.z - e.z) < 1.3 && e.y < 2) { teamScore[e.team]++; moveOrb(o); if (e.me) tone(990, .1); } }); }); $('tm').textContent = `Time ${Math.max(0, R.time - t) | 0}`; $('ql').textContent = TEAMS.slice(0, teamN).map((x, i) => `${x[0]} ${teamScore[i]}`).join(' · '); if (t > R.time) endRound(); }
    }
    ents.forEach(e => {
      const g = e.m; if (!g.visible) return;
      g.position.set(e.x, e.y, e.z); g.rotation.x = g.rotation.z = 0;
      const sp = Math.hypot(e.vx, e.vz); if (sp > .8 && !(e.an && e.an.type == 'spin')) g.rotation.y = Math.atan2(-e.vx, -e.vz);
      g.body.scale.y = 1.4 + Math.sin(now / 70 + e.id) * .06 * (sp > 1);
      if (state == 'play' && t < e.dv) g.rotation.x = -1.2;
      if (e.an) { if (now > e.an.until) e.an = null; else { const k = e.an.type; if (k == 'spin') g.rotation.y += now / 90; if (k == 'hop') g.position.y += Math.abs(Math.sin(now / 150)) * .9; if (k == 'flip') g.rotation.x = (now / 200) % 6.28; if (k == 'wiggle') g.rotation.z = Math.sin(now / 60) * .3; } }
    });
    if (state != 'menu') {
      const T = me && !me.out ? me : (alive().sort((a, b) => a.z - b.z)[0] || me);
      if (state == 'win') { const w = ents.find(e => e.an && e.an.until == Infinity) || T; cam.position.lerp(new THREE.Vector3(w.x, 3, w.z + 7), .08); cam.lookAt(w.x, 1.5, w.z); }
      else if (R.type == 'race') { cam.position.lerp(new THREE.Vector3(T.x * .6, 8, T.z + 12), .08); cam.lookAt(T.x * .6, 1, T.z - 6); }
      else { cam.position.lerp(new THREE.Vector3(0, 32, 28), .05); cam.lookAt(0, 0, 0); }
    }
    ren.render(scene, cam);
  } catch (err) { console.error(err); $('err').textContent = 'Error: ' + err.message; }
}
requestAnimationFrame(loop);
})(); } catch (err) { console.error(err); document.getElementById('err').textContent = 'Error: ' + err.message; }
