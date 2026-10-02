(() => {
const $ = id => document.getElementById(id);
if (typeof THREE === 'undefined') { $('err').textContent = 'Could not load three.js. Check your internet connection and reload.'; return; }
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const M = c => new THREE.MeshLambertMaterial({ color: c });

/* ---------- Rounds: 3 qualifiers + final ---------- */
const ROUNDS = [
  { n: 'Round 1: Bean Dash', type: 'race', len: 110, q: 8, diff: 1, limit: 80 },
  { n: 'Round 2: Spin Cycle', type: 'race', len: 150, q: 5, diff: 2, limit: 90 },
  { n: 'Round 3: Sweeper Survival', type: 'survive', q: 3, time: 35 },
  { n: 'FINAL: Crown Dash', type: 'race', len: 190, q: 1, diff: 3, limit: 100 }
];
const NAMES = ['Bob', 'Jelly', 'Chili', 'Waffle', 'Noodle', 'Pickle', 'Taco', 'Muffin', 'Zip', 'Biscuit', 'Fudge'];

/* ---------- Save data (coins, XP, crowns) ---------- */
const save = Object.assign({ coins: 0, xp: 0, wins: 0, best: 0 }, JSON.parse(localStorage.getItem('beanrush') || '{}'));
const store = () => { localStorage.setItem('beanrush', JSON.stringify(save)); $('stats').textContent = `Coins ${save.coins}  |  XP ${save.xp}  |  Crowns ${save.wins}  |  Best round ${save.best || '-'}`; };
store();

/* ---------- Three.js setup ---------- */
const ren = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true });
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd8ff);
scene.fog = new THREE.Fog(0x8fd8ff, 40, 150);
const cam = new THREE.PerspectiveCamera(60, 1, .1, 300);
scene.add(new THREE.HemisphereLight(0xffffff, 0x88aaff, .9));
const sun = new THREE.DirectionalLight(0xffffff, .6); sun.position.set(10, 30, 10); scene.add(sun);
const resize = () => { ren.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
addEventListener('resize', resize); resize();

/* ---------- Sound (tiny WebAudio beeps) ---------- */
let ac;
const beep = (f, d = .1) => { try { ac = ac || new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch (e) {} };

/* ---------- Bean character ---------- */
function makeBean(color, hat) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(.6, 16, 12), M(color)); b.scale.set(1, 1.4, 1); b.position.y = .85; g.add(b);
  [-.2, .2].forEach(x => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(x, 1.25, -.5);
    const p = new THREE.Mesh(new THREE.SphereGeometry(.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0 })); p.position.set(x, 1.25, -.62); g.add(e, p);
  });
  const h = { cone: [new THREE.ConeGeometry(.3, .6, 12), 0xffd166, 1.95], top: [new THREE.CylinderGeometry(.3, .3, .55, 12), 0x222222, 1.95], crown: [new THREE.CylinderGeometry(.35, .25, .3, 6), 0xffd700, 1.85] }[hat];
  if (h) { const m = new THREE.Mesh(h[0], M(h[1])); m.position.y = h[2]; g.add(m); }
  scene.add(g); return g;
}

/* ---------- Level ---------- */
let lvl = new THREE.Group(), plats = [], spins = [], R = ROUNDS[0], ents = [], me, round = 0, t = 0, cd = 0, state = 'menu', finished = [];
const platAt = (x, z) => plats.find(p => Math.abs(x - p.x) < p.w / 2 && Math.abs(z - p.z) < p.d / 2);

function build(i) {
  scene.remove(lvl); lvl = new THREE.Group(); scene.add(lvl); plats = []; spins = []; R = ROUNDS[i];
  const add = (x, z, w, d, col, mv) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1, d), M(col)); m.position.set(x, -.5, z); lvl.add(m); const p = Object.assign({ x, ox: x, z, w, d, m }, mv); plats.push(p); return p; };
  const spin = (x, z, len, sp, y = .6) => { const m = new THREE.Mesh(new THREE.BoxGeometry(len, 1.2, .8), M(0xff4040)); m.position.set(x, y, z); lvl.add(m); spins.push({ x, z, len, sp, m }); };
  const cols = [0xffd166, 0x06d6a0, 0x118ab2, 0xef476f, 0xb388ff];
  if (R.type === 'survive') { R.p = add(0, 0, 40, 40, 0x06d6a0); spin(0, 0, 38, 1.1); spin(0, 0, 20, -1.8); return; }
  add(0, -5, 24, 14, 0xffffff);
  let z = -12;
  while (z > -R.len) {
    const k = Math.random(), c = cols[Math.random() * 5 | 0], d = R.diff;
    if (k < .4) { add(0, z - 7, 20, 14, c); spin(0, z - 7, 18, (1 + d * .5) * (Math.random() < .5 ? -1 : 1)); z -= 14; }
    else if (k < .8) { const g = 9 + d; add(0, z - g / 2, 7, 5, 0xff9f1c, { amp: 6, spd: 1 + d * .4, ph: rnd(0, 6) }); add(0, z - g - 5, 20, 10, c); z -= g + 10; }
    else { add(0, z - 7, 4, 14, c); z -= 14; }
  }
  R.fz = z; add(0, z - 8, 24, 16, 0xffffff);
  const line = new THREE.Mesh(new THREE.BoxGeometry(24, .2, 1.5), M(0xffd700)); line.position.set(0, .1, z); lvl.add(line);
}

/* ---------- Entities ---------- */
function spawn(e, i) {
  if (R.type === 'survive') { const a = i / 12 * 6.283; e.x = Math.cos(a) * 14; e.z = Math.sin(a) * 14; }
  else { e.x = (i % 6) * 3.4 - 8.5; e.z = -Math.floor(i / 6) * 3; }
  e.y = .5; e.vx = e.vy = e.vz = 0; e.cx = e.x; e.cz = e.z; e.fin = false; e.hit = 0; e.m.visible = true;
}
const spinLocal = (e, s) => { const dx = e.x - s.x, dz = e.z - s.z, a = t * s.sp, c = Math.cos(a), n = Math.sin(a); return { lx: dx * c + dz * n, lz: -dx * n + dz * c, c, n }; };

/* ---------- Input ---------- */
const keys = {};
addEventListener('keydown', e => { keys[e.code] = 1; if (e.code === 'Space') e.preventDefault(); });
addEventListener('keyup', e => keys[e.code] = 0);
function playerIn() {
  const x = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), z = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0), l = Math.hypot(x, z) || 1;
  return { x: x / l, z: z / l, j: !!keys.Space };
}
function botIn(e) {
  const near = spins.some(s => { const p = spinLocal(e, s); return Math.abs(p.lz) < 2.4 && Math.abs(p.lx) < s.len / 2 + 1; });
  if (R.type === 'survive') {
    const a = t * .3 + e.id, tx = Math.cos(a) * 9, tz = Math.sin(a) * 9, l = Math.hypot(tx - e.x, tz - e.z) || 1;
    return { x: (tx - e.x) / l, z: (tz - e.z) / l, j: near || Math.random() < .01 };
  }
  const ah = platAt(e.x + e.vx * .3, e.z - 2.2);
  return { x: clamp(((ah ? ah.x : 0) - e.x) * .4, -1, 1) * .8, z: -1, j: !ah || near || Math.random() < .004 };
}

/* ---------- Physics ---------- */
function phys(e, i, dt) {
  const on = e.y <= .05 && e.y > -.6 && platAt(e.x, e.z), a = Math.min(1, dt * (on ? 10 : 3));
  e.vx += (i.x * 9 * e.sp - e.vx) * a; e.vz += (i.z * 9 * e.sp - e.vz) * a;
  if (i.j && on && e.vy <= .1) { e.vy = 11; if (e.me) beep(520); }
  e.vy -= 30 * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.z += e.vz * dt;
  const p = platAt(e.x, e.z);
  if (p && e.vy <= 0 && e.y <= 0 && e.y > -.6) { e.y = 0; e.vy = 0; if (R.type === 'race' && !p.amp) { e.cx = p.x; e.cz = e.z; } }
  if (t > e.hit) spins.forEach(s => {
    const p = spinLocal(e, s);
    if (Math.abs(p.lx) < s.len / 2 + .4 && Math.abs(p.lz) < .8 && e.y < 1.6 && e.y > -.5) {
      const k = Math.sign(p.lx * s.sp) || 1; e.vx = -p.n * k * 14; e.vz = p.c * k * 14; e.vy = 7; e.hit = t + .5; if (e.me) beep(150, .15);
    }
  });
  if (e.y < -14) {
    if (R.type === 'race') { e.x = e.cx; e.z = e.cz; e.y = 2; e.vx = e.vy = e.vz = 0; if (e.me) beep(200, .2); }
    else { e.out = true; e.m.visible = false; if (e.me) beep(120, .4); }
  }
  if (R.type === 'race' && e.z < R.fz && !e.fin) { e.fin = true; finished.push(e); if (e.me) beep(880, .3); }
}

/* ---------- Round flow ---------- */
const show = s => $('msg').textContent = s;
const alive = () => ents.filter(e => !e.out);

function startRound(i) {
  round = i; build(i); alive().forEach(spawn); finished = []; t = 0; cd = 3; state = 'count';
  $('rn').textContent = R.n;
  show(R.type === 'race' ? `${R.n}\nTop ${R.q} qualify` : `${R.n}\nSurvive ${R.time}s!`);
  save.best = Math.max(save.best, i + 1); store();
}

function endRound() {
  state = 'end';
  let keep;
  if (R.type === 'race') keep = finished.slice(0, R.q);
  else keep = alive().sort(() => Math.random() - .5).slice(0, R.q);
  if (round === 3 && !keep.length) keep = [alive().sort((a, b) => a.z - b.z)[0]];
  alive().forEach(e => { if (!keep.includes(e)) { e.out = true; e.m.visible = false; } });
  const won = !me.out;
  if (won) { save.xp += 25 * (round + 1); save.coins += 10 * (round + 1); beep(660, .3); }
  store();
  if (round === 3) return finish(keep[0]);
  show(won ? 'Qualified!' : 'Eliminated!\nSpectating...');
  setTimeout(() => startRound(round + 1), 3000);
}

function finish(w) {
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(.4, .3, .35, 6), M(0xffd700)); crown.position.y = 2; w.m.add(crown);
  show(w.me ? 'YOU WIN!\nGolden crown!' : `${w.name} wins!`);
  if (w.me) { save.wins++; save.coins += 100; save.xp += 100; store(); }
  for (let i = 0; i < 80; i++) { const c = document.createElement('div'); c.className = 'confetti'; c.style.left = rnd(0, 100) + 'vw'; c.style.background = `hsl(${rnd(0, 360)},90%,60%)`; c.style.animationDelay = rnd(0, 1.5) + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 6000); }
  setTimeout(() => { $('msg').textContent = ''; $('hud').classList.add('hide'); $('menu').classList.remove('hide'); state = 'menu'; refresh(); }, 6000);
}

function newMatch() {
  ents.forEach(e => scene.remove(e.m)); scene.remove(prev);
  ents = [{ me: 1, name: 'You', sp: 1, id: 0, m: makeBean($('col').value, $('hat').value) }];
  for (let i = 0; i < 11; i++) ents.push({ name: NAMES[i], sp: rnd(.82, .98), id: i + 1, m: makeBean(new THREE.Color().setHSL(Math.random(), .8, .6), ['none', 'cone', 'top', 'crown'][i % 4]) });
  me = ents[0]; $('menu').classList.add('hide'); $('hud').classList.remove('hide'); startRound(0);
}
let prev;
const refresh = () => { scene.remove(prev); prev = makeBean($('col').value, $('hat').value); };
['input', 'change'].forEach(ev => { $('col').addEventListener(ev, refresh); $('hat').addEventListener(ev, refresh); });
refresh();
$('play').addEventListener('click', () => {
  try { newMatch(); } catch (err) { console.error(err); $('err').textContent = 'Error: ' + err.message; $('menu').classList.remove('hide'); }
});

/* ---------- Main loop ---------- */
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (state === 'menu') { prev.rotation.y += dt; cam.position.set(0, 2.5, 7); cam.lookAt(0, 3.4, 0); ren.render(scene, cam); return; }
  plats.forEach(p => { if (p.amp) { p.x = p.ox + p.amp * Math.sin(t * p.spd + p.ph); p.m.position.x = p.x; } });
  spins.forEach(s => s.m.rotation.y = -t * s.sp);
  if (state === 'count') {
    cd -= dt; show(cd > 0 ? Math.ceil(cd) + '' : 'GO!'); if (cd <= 0) { state = 'play'; beep(880, .3); setTimeout(() => state === 'play' && show(''), 800); }
  } else if (state === 'play') {
    t += dt;
    if (R.type === 'survive') { const k = 1 - .45 * clamp((t - 4) / R.time, 0, 1); R.p.w = R.p.d = 40 * k; R.p.m.scale.set(k, 1, k); }
    const live = alive().filter(e => !e.fin);
    live.forEach(e => phys(e, e.me ? playerIn() : botIn(e), dt));
    for (let a = 0; a < live.length; a++) for (let b = a + 1; b < live.length; b++) {
      const A = live[a], B = live[b], dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz);
      if (d < 1.1 && d > .001 && Math.abs(A.y - B.y) < 1) { const nx = dx / d, nz = dz / d; A.x -= nx * .3; A.z -= nz * .3; B.x += nx * .3; B.z += nz * .3; A.vx -= nx * 2; A.vz -= nz * 2; B.vx += nx * 2; B.vz += nz * 2; }
    }
    const left = alive().length;
    if (R.type === 'race') {
      $('tm').textContent = `Time ${Math.max(0, R.limit - t) | 0}`; $('ql').textContent = `Qualified ${finished.length}/${R.q}`;
      if (finished.length >= R.q || t > R.limit || !live.length) endRound();
    } else {
      $('tm').textContent = `Time ${Math.max(0, R.time - t) | 0}`; $('ql').textContent = `Players left ${left}`;
      if (t > R.time || left <= R.q) endRound();
    }
  }
  ents.forEach(e => {
    if (!e.m.visible) return;
    e.m.position.set(e.x, e.y, e.z);
    const sp = Math.hypot(e.vx, e.vz);
    if (sp > .8) e.m.rotation.y = Math.atan2(-e.vx, -e.vz);
    e.m.children[0].scale.y = 1.4 + Math.sin(now / 70 + e.id) * .06 * (sp > 1);
  });
  const T = !me.out ? me : (alive().sort((a, b) => a.z - b.z)[0] || me);
  if (R.type === 'survive') { cam.position.lerp(new THREE.Vector3(0, 30, 26), .05); cam.lookAt(0, 0, 0); }
  else { cam.position.lerp(new THREE.Vector3(T.x * .6, 8, T.z + 12), .08); cam.lookAt(T.x * .6, 1, T.z - 6); }
  ren.render(scene, cam);
}
requestAnimationFrame(loop);
})();
