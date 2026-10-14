
console.log("BEAN BLAST RACING LOADED!");

const $ = id => document.getElementById(id);

const screens = {
  home: $("home"),
  game: $("gameScreen"),
  shop: $("shopScreen"),
  custom: $("customScreen"),
  wheel: $("wheelScreen"),
  result: $("resultScreen"),
  winner: $("winnerScreen")
};

const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");

const MAPS = [
  { name: "JUNGLE RUSH", sky: "#63d8ff", ground: "#38a84e", road: "#b98b52", accent: "#ffe45e", obstacle: "🌴", theme: "jungle" },
  { name: "UNDERWATER DASH", sky: "#008acb", ground: "#087e9b", road: "#42d6d0", accent: "#ffb7e8", obstacle: "🪸", theme: "underwater" },
  { name: "STADIUM SPRINT", sky: "#69caff", ground: "#25ad69", road: "#69758b", accent: "#ffe54c", obstacle: "⚽", theme: "stadium" },
  { name: "CANDY CHAOS", sky: "#ff9fdb", ground: "#b44cff", road: "#ffdcf4", accent: "#5af4ff", obstacle: "🍭", theme: "candy" },
  { name: "GALAXY RUN", sky: "#10133f", ground: "#35277d", road: "#554d9d", accent: "#45f5ff", obstacle: "🪐", theme: "space" },
  { name: "VOLCANO VELOCITY", sky: "#541b39", ground: "#e34b29", road: "#65505a", accent: "#ffdb49", obstacle: "🌋", theme: "volcano" },
  { name: "ICEBERG ALLEY", sky: "#a8efff", ground: "#b2e9ff", road: "#d9f8ff", accent: "#428bff", obstacle: "🧊", theme: "ice" },
  { name: "PIRATE BAY", sky: "#6acdf5", ground: "#d5c078", road: "#b18a52", accent: "#ffda48", obstacle: "🏴‍☠️", theme: "pirate" },
  { name: "NEON CITY", sky: "#14143e", ground: "#26285b", road: "#44466f", accent: "#ff45d0", obstacle: "🚧", theme: "city" },
  { name: "CASTLE CRASH", sky: "#a9c6ff", ground: "#4eaa70", road: "#9b9cae", accent: "#ffdc65", obstacle: "🏰", theme: "castle" }
];

const SKINS = [
  { name: "Classic Bean", emoji: "🫘", price: 0, body: "#ff4f91", pattern: "spots", accessory: "none" },
  { name: "Dino Ranger", emoji: "🦖", price: 300, body: "#43d17d", pattern: "scales", accessory: "dino" },
  { name: "Basketball Star", emoji: "🏀", price: 400, body: "#ff8738", pattern: "stripes", accessory: "headband" },
  { name: "Soccer Champion", emoji: "⚽", price: 400, body: "#f4f5ff", pattern: "spots", accessory: "headband" },
  { name: "Pizza Party", emoji: "🍕", price: 500, body: "#ffbf3d", pattern: "spots", accessory: "chef" },
  { name: "Burger Boss", emoji: "🍔", price: 500, body: "#b87543", pattern: "stripes", accessory: "chef" },
  { name: "Space Explorer", emoji: "🚀", price: 700, body: "#d9e4ff", pattern: "stripes", accessory: "astronaut" },
  { name: "Alien Invader", emoji: "👽", price: 800, body: "#77fa69", pattern: "spots", accessory: "antenna" },
  { name: "Shark Attack", emoji: "🦈", price: 900, body: "#79c7e8", pattern: "scales", accessory: "fin" },
  { name: "Dragon Flame", emoji: "🐉", price: 1200, body: "#b65bff", pattern: "scales", accessory: "dino" },
  { name: "Golden Knight", emoji: "👑", price: 1500, body: "#ffd44a", pattern: "stripes", accessory: "crown" },
  { name: "Robot Rumble", emoji: "🤖", price: 1000, body: "#83e5f2", pattern: "panels", accessory: "antenna" },
  { name: "Pirate Captain", emoji: "🏴‍☠️", price: 850, body: "#9a67e8", pattern: "stripes", accessory: "pirate" },
  { name: "Frost Legend", emoji: "❄️", price: 1300, body: "#a5f2ff", pattern: "spots", accessory: "crown" }
];

let coins = Number(localStorage.getItem("coins")) || 500;
let xp = Number(localStorage.getItem("xp")) || 0;
let crowns = Number(localStorage.getItem("crowns")) || 0;
let owned = JSON.parse(localStorage.getItem("ownedSkins") || '["Classic Bean"]');
let equipped = localStorage.getItem("equippedSkin") || "Classic Bean";

let currentMap = 0;
let raceRunning = false;
let raceEnded = false;
let raceTime = 0;
let lastTime = 0;
let playerLane = 0;
let playerJump = 0;
let playerJumpVelocity = 0;
let playerProgress = 0;
let playerFinished = false;
let finishPlace = 20;
let raceMessage = "";
let toastText = "";
let toastUntil = 0;

const botNames = [
  "Turbo Tofu", "Wobble", "Captain Jelly", "Speedy Bean",
  "Disco Nugget", "Bouncy Bob", "Rocket Pickle", "Mango",
  "Sir Wiggles", "Pixel", "Noodle", "Blizzard",
  "Cheese Puff", "Zippy", "Banana Split", "Comet",
  "Tiny Tornado", "Pudding", "Mega Muffin"
];

let racers = [];
let obstacles = [];
let particles = [];
let keys = { left: false, right: false };

function persist() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("xp", xp);
  localStorage.setItem("crowns", crowns);
  localStorage.setItem("ownedSkins", JSON.stringify(owned));
  localStorage.setItem("equippedSkin", equipped);
}

function updateProfile() {
  $("level").textContent = Math.floor(xp / 100) + 1;
  $("xp").textContent = xp;
  $("coins").textContent = coins;
  $("crowns").textContent = crowns;
  persist();
}

function showScreen(name) {
  Object.values(screens).forEach(s => s && s.classList.add("hidden"));
  if (screens[name]) screens[name].classList.remove("hidden");
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);

function startGame() {
  currentMap = Math.floor(Math.random() * MAPS.length);
  startRace();
}

function startRace() {
  resizeCanvas();
  raceRunning = true;
  raceEnded = false;
  raceTime = 0;
  lastTime = performance.now();
  playerLane = 0;
  playerJump = 0;
  playerJumpVelocity = 0;
  playerProgress = 0;
  playerFinished = false;
  finishPlace = 20;
  raceMessage = "";
  particles = [];

  racers = [{
    name: "YOU",
    player: true,
    progress: 0,
    lane: 0,
    speed: 0.115,
    skill: 1,
    color: getSkin().body,
    jump: 0,
    jumpVelocity: 0,
    finished: false,
    finishTime: null
  }];

  for (let i = 0; i < 19; i++) {
    racers.push({
      name: botNames[i],
      player: false,
      progress: Math.random() * 2,
      lane: Math.floor(Math.random() * 5) - 2,
      speed: 0.092 + Math.random() * 0.033,
      skill: 0.55 + Math.random() * 0.4,
      color: ["#ff5757", "#ffb52e", "#48e0b5", "#9a70ff", "#5bbcff", "#ff72c9"][i % 6],
      jump: 0,
      jumpVelocity: 0,
      finished: false,
      finishTime: null,
      dodgeCooldown: Math.random()
    });
  }

  makeObstacles();
  $("roundText").textContent = "RACE • 20 PLAYERS";
  $("mapText").textContent = MAPS[currentMap].name;
  $("progressText").textContent = "0%";
  showScreen("game");
}

function makeObstacles() {
  obstacles = [];
  for (let i = 0; i < 32; i++) {
    obstacles.push({
      progress: 5 + i * 2.8 + Math.random() * 1.5,
      lane: Math.floor(Math.random() * 5) - 2,
      type: i % 4,
      hit: false
    });
  }
}

function getSkin() {
  return SKINS.find(s => s.name === equipped) || SKINS[0];
}

function jump() {
  if (!raceRunning || playerFinished || playerJump > 0) return;
  playerJumpVelocity = 390;
}

function updateRace(dt) {
  if (!raceRunning || raceEnded) return;

  raceTime += dt;
  const player = racers[0];

  if (keys.left) playerLane -= 3.5 * dt;
  if (keys.right) playerLane += 3.5 * dt;
  playerLane = Math.max(-2, Math.min(2, playerLane));

  player.lane += (playerLane - player.lane) * Math.min(1, dt * 9);

  if (playerJumpVelocity !== 0 || playerJump > 0) {
    playerJump += playerJumpVelocity * dt;
    playerJumpVelocity -= 950 * dt;
    if (playerJump <= 0) {
      playerJump = 0;
      playerJumpVelocity = 0;
    }
  }
  player.jump = playerJump;

  if (!playerFinished) {
    let speed = 12.4;
    for (const ob of obstacles) {
      if (ob.hit || Math.abs(ob.progress - player.progress) > 1.25) continue;
      if (Math.abs(ob.lane - player.lane) < 0.62) {
        if (playerJump < 42) {
          speed = 5.2;
          showToast("Ouch! Jump over obstacles!");
        }
        ob.hit = true;
      }
    }
    player.progress += speed * dt;
    if (player.progress >= 100) {
      player.progress = 100;
      player.finished = true;
      player.finishTime = raceTime;
      playerFinished = true;
      finishPlace = 1 + racers.filter(r => r !== player && r.finished).length;
    }
  }

  racers.slice(1).forEach(bot => {
    if (bot.finished) return;

    bot.dodgeCooldown -= dt;
    let speed = bot.speed * 100 * (0.9 + bot.skill * 0.16);

    const nextObstacle = obstacles.find(o =>
      !o.hit && o.progress > bot.progress &&
      o.progress - bot.progress < 2.1 &&
      Math.abs(o.lane - bot.lane) < 0.7
    );

    if (nextObstacle && bot.dodgeCooldown <= 0) {
      if (Math.random() < bot.skill) {
        const possible = [-2, -1, 0, 1, 2].filter(l => l !== nextObstacle.lane);
        bot.lane = possible[Math.floor(Math.random() * possible.length)];
      } else {
        bot.jumpVelocity = 300;
      }
      bot.dodgeCooldown = 0.65 + Math.random() * 0.55;
    }

    if (bot.jumpVelocity !== 0 || bot.jump > 0) {
      bot.jump += bot.jumpVelocity * dt;
      bot.jumpVelocity -= 950 * dt;
      if (bot.jump <= 0) {
        bot.jump = 0;
        bot.jumpVelocity = 0;
      }
    }

    bot.progress += speed * dt;

    if (bot.progress >= 100) {
      bot.progress = 100;
      bot.finished = true;
      bot.finishTime = raceTime;
    }
  });

  $("progressText").textContent = Math.floor(player.progress) + "%";

  if (playerFinished) {
    const ahead = racers.filter(r => r !== player &&
      (r.finished && r.finishTime < player.finishTime ||
       !r.finished && r.progress > player.progress));
    finishPlace = ahead.length + 1;
    raceRunning = false;
    raceEnded = true;
    showRaceResult();
  }
}

function showRaceResult() {
  const player = racers[0];
  const place = 1 + racers.slice(1).filter(b => b.finished &&
    b.finishTime < player.finishTime).length;

  finishPlace = place;
  const rewardCoins = Math.max(50, 300 - (place - 1) * 12);
  const rewardXP = Math.max(25, 150 - (place - 1) * 5);
  coins += rewardCoins;
  xp += rewardXP;
  if (place === 1) crowns++;
  updateProfile();

  $("resultTitle").textContent = place === 1 ? "🏆 YOU WON THE RACE!" : `🏁 YOU FINISHED #${place}!`;
  $("resultMessage").textContent =
    `Map: ${MAPS[currentMap].name} • 20 racers • +${rewardCoins} coins • +${rewardXP} XP`;

  const next = $("nextRoundBtn");
  next.textContent = "RACE AGAIN";
  showScreen("result");
}

function drawRace() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;

  const map = MAPS[currentMap];
  const t = raceTime;

  // Sky and environment
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, map.sky);
  sky.addColorStop(1, map.ground);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawEnvironment(map, w, h, t);

  // Perspective race track
  const horizon = h * 0.30;
  ctx.fillStyle = map.road;
  ctx.beginPath();
  ctx.moveTo(w * 0.37, horizon);
  ctx.lineTo(w * 0.63, horizon);
  ctx.lineTo(w * 1.05, h);
  ctx.lineTo(-w * 0.05, h);
  ctx.closePath();
  ctx.fill();

  // Track borders
  ctx.strokeStyle = map.accent;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(w * 0.37, horizon);
  ctx.lineTo(-w * 0.05, h);
  ctx.moveTo(w * 0.63, horizon);
  ctx.lineTo(w * 1.05, h);
  ctx.stroke();

  // Lane markers scroll as racers advance
  ctx.strokeStyle = "rgba(255,255,255,.6)";
  ctx.lineWidth = 3;
  for (let lane = 1; lane < 5; lane++) {
    const topX = w * (0.37 + lane * 0.052);
    const bottomX = w * (lane / 5);
    ctx.beginPath();
    ctx.moveTo(topX, horizon);
    ctx.lineTo(bottomX, h);
    ctx.stroke();
  }

  // Moving track dashes
  for (let i = 0; i < 16; i++) {
    const p = ((i / 16 + (playerProgress / 30) % 1) % 1);
    const y = horizon + p * (h - horizon);
    const spread = p * w * 0.43;
    const dashW = 5 + p * 16;
    ctx.fillStyle = "rgba(255,255,255,.65)";
    for (let lane = 1; lane < 5; lane++) {
      const x = w * 0.37 + lane * (w * 0.052) + (lane - 2.5) * spread * 0.3;
      ctx.fillRect(x, y, dashW, 3 + p * 7);
    }
  }

  // Obstacles approaching the player
  obstacles.forEach(ob => {
    if (ob.hit) return;
    const distance = ob.progress - playerProgress;
    if (distance < -1 || distance > 22) return;
    const p = 1 - distance / 22;
    const y = horizon + p * (h * 0.58);
    const x = w * 0.5 + ob.lane * p * w * 0.085;
    const size = 16 + p * 43;
    drawObstacle(map, ob, x, y, size, t);
  });

  // Other racers: nearby bots drawn around the track
  const visibleBots = racers.slice(1)
    .filter(r => Math.abs(r.progress - playerProgress) < 13)
    .sort((a, b) => b.progress - a.progress);

  visibleBots.forEach(bot => {
    const distance = bot.progress - playerProgress;
    const p = Math.max(0.03, Math.min(0.98, 0.50 + distance * 0.035));
    const y = horizon + p * (h * 0.56);
    const x = w * 0.5 + bot.lane * p * w * 0.09;
    const size = 14 + p * 22;
    drawBean(x, y - bot.jump * 0.25, size, bot.color, "spots", "none", false);
  });

  // Player character
  drawBean(w * 0.5 + playerLane * w * 0.09, h * 0.76 - playerJump,
    58, getSkin().body, getSkin().pattern, getSkin().accessory, true);

  // Race progress bar
  ctx.fillStyle = "rgba(10,15,45,.75)";
  roundRect(ctx, 20, h - 27, w - 40, 12, 6);
  ctx.fillStyle = map.accent;
  roundRect(ctx, 20, h - 27, (w - 40) * playerProgress / 100, 12, 6);

  // Finish line appears near the end
  if (playerProgress > 82) {
    ctx.save();
    ctx.translate(w * 0.5, h * 0.33);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-w * 0.15, 0, w * 0.3, 13);
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? "#16162c" : "#fff";
      ctx.fillRect(-w * 0.15 + i * (w * 0.3 / 12), 0, w * 0.3 / 12, 13);
    }
    ctx.restore();
  }

  // Compact live leaderboard
  const standings = [...racers].sort((a, b) => b.progress - a.progress);
  ctx.fillStyle = "rgba(9,12,35,.78)";
  roundRect(ctx, 12, 75, 155, 156, 14);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "left";
  ctx.fillText("🏁 LIVE RANKING", 23, 97);

  standings.slice(0, 6).forEach((r, i) => {
    ctx.fillStyle = r.player ? "#ffe75e" : "#fff";
    ctx.font = r.player ? "bold 12px Arial" : "12px Arial";
    ctx.fillText(`${i + 1}. ${r.name}`, 23, 119 + i * 20);
    ctx.textAlign = "right";
    ctx.fillText(`${Math.floor(r.progress)}%`, 153, 119 + i * 20);
    ctx.textAlign = "left";
  });

  // Toast
  if (performance.now() < toastUntil) {
    ctx.fillStyle = "rgba(15,15,45,.85)";
    roundRect(ctx, w * 0.25, 100, w * 0.5, 45, 14);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 17px Arial";
    ctx.fillText(toastText, w * 0.5, 128);
  }
}

function drawEnvironment(map, w, h, t) {
  // Decorative scenery changes with every map
  ctx.textAlign = "center";
  const themed = {
    jungle: ["🌴", "🌿", "🪨", "🌴"],
    underwater: ["🐠", "🪸", "🐟", "🫧"],
    stadium: ["🏟️", "🚩", "⚽", "🏟️"],
    candy: ["🍭", "🍬", "🍩", "🍡"],
    space: ["🪐", "⭐", "🌌", "🚀"],
    volcano: ["🌋", "🔥", "🪨", "🌋"],
    ice: ["❄️", "🧊", "🏔️", "❄️"],
    pirate: ["🏝️", "⛵", "🌴", "⚓"],
    city: ["🏙️", "🌆", "💡", "🏢"],
    castle: ["🏰", "🚩", "🌳", "🏰"]
  }[map.theme];

  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = w * 0.5 + side * (w * (0.34 + (i % 3) * 0.11));
    const y = h * (0.18 + (i % 4) * 0.075);
    ctx.globalAlpha = 0.7 + (i % 3) * 0.1;
    ctx.font = `${26 + (i % 3) * 12}px Arial`;
    ctx.fillText(themed[i % themed.length], x, y + Math.sin(t * 1.5 + i) * 4);
  }
  ctx.globalAlpha = 1;
}

function drawObstacle(map, ob, x, y, size, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4 + ob.progress) * 2);
  ctx.fillStyle = "rgba(0,0,0,.2)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.3, size * 0.65, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  const emoji = ["🧱", "🪵", "🔴", map.obstacle][ob.type];
  ctx.font = `${size}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

function drawBean(x, y, size, color, pattern, accessory, isPlayer) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 50;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,.24)";
  ctx.beginPath();
  ctx.ellipse(0, 22 * s, 23 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feet
  ctx.fillStyle = "#292a49";
  ctx.beginPath();
  ctx.ellipse(-11 * s, 18 * s, 9 * s, 6 * s, -0.2, 0, Math.PI * 2);
  ctx.ellipse(11 * s, 18 * s, 9 * s, 6 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.fillStyle = shade(color, -20);
  ctx.beginPath();
  ctx.ellipse(-22 * s, 1 * s, 7 * s, 14 * s, -0.5, 0, Math.PI * 2);
  ctx.ellipse(22 * s, 1 * s, 7 * s, 14 * s, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Body gradient
  const gradient = ctx.createLinearGradient(-20 * s, -25 * s, 20 * s, 20 * s);
  gradient.addColorStop(0, shade(color, 35));
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, shade(color, -30));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-20 * s, 17 * s);
  ctx.quadraticCurveTo(-27 * s, -7 * s, -16 * s, -22 * s);
  ctx.quadraticCurveTo(0, -34 * s, 16 * s, -22 * s);
  ctx.quadraticCurveTo(27 * s, -7 * s, 20 * s, 17 * s);
  ctx.quadraticCurveTo(0, 27 * s, -20 * s, 17 * s);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,.45)";
  ctx.lineWidth = 2 * s;
  ctx.stroke();

  // Costume patterns
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, -2 * s, 20 * s, 25 * s, 0, 0, Math.PI * 2);
  ctx.clip();

  if (pattern === "spots" || pattern === "scales") {
    ctx.fillStyle = "rgba(255,255,255,.3)";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc((-12 + i * 6) * s, (-13 + (i % 2) * 12) * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pattern === "stripes") {
    ctx.strokeStyle = "rgba(255,255,255,.38)";
    ctx.lineWidth = 4 * s;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 10 * s, -28 * s);
      ctx.lineTo(i * 10 * s + 12 * s, 24 * s);
      ctx.stroke();
    }
  } else if (pattern === "panels") {
    ctx.fillStyle = "rgba(20,40,70,.25)";
    ctx.fillRect(-12 * s, -14 * s, 24 * s, 8 * s);
    ctx.fillRect(-12 * s, 0, 24 * s, 8 * s);
  }
  ctx.restore();

  // Face
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-7 * s, -8 * s, 6 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(7 * s, -8 * s, 6 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#20213c";
  ctx.beginPath();
  ctx.arc(-6 * s, -7 * s, 2.7 * s, 0, Math.PI * 2);
  ctx.arc(8 * s, -7 * s, 2.7 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#29213b";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.arc(0, 0, 6 * s, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Accessories
  ctx.fillStyle = shade(color, -40);
  if (accessory === "dino") {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 10 * s, -22 * s);
      ctx.lineTo((i * 10 - 4) * s, -32 * s);
      ctx.lineTo((i * 10 + 5) * s, -24 * s);
      ctx.fill();
    }
  } else if (accessory === "headband") {
    ctx.fillStyle = "#ffed59";
    ctx.fillRect(-18 * s, -19 * s, 36 * s, 5 * s);
  } else if (accessory === "chef") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, -26 * s, 12 * s, Math.PI, 0);
    ctx.fillRect(-12 * s, -27 * s, 24 * s, 6 * s);
  } else if (accessory === "astronaut") {
    ctx.strokeStyle = "#e7faff";
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.ellipse(0, -7 * s, 19 * s, 23 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (accessory === "antenna") {
    ctx.strokeStyle = "#ffed59";
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(0, -24 * s);
    ctx.lineTo(0, -34 * s);
    ctx.stroke();
    ctx.fillStyle = "#ffed59";
    ctx.beginPath();
    ctx.arc(0, -36 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (accessory === "fin") {
    ctx.fillStyle = "#d9f6ff";
    ctx.beginPath();
    ctx.moveTo(-5 * s, -25 * s);
    ctx.lineTo(0, -39 * s);
    ctx.lineTo(7 * s, -24 * s);
    ctx.fill();
  } else if (accessory === "crown") {
    ctx.fillStyle = "#ffdc3d";
    ctx.beginPath();
    ctx.moveTo(-13 * s, -23 * s);
    ctx.lineTo(-14 * s, -35 * s);
    ctx.lineTo(-5 * s, -28 * s);
    ctx.lineTo(0, -38 * s);
    ctx.lineTo(6 * s, -28 * s);
    ctx.lineTo(14 * s, -35 * s);
    ctx.lineTo(13 * s, -23 * s);
    ctx.closePath();
    ctx.fill();
  } else if (accessory === "pirate") {
    ctx.fillStyle = "#242139";
    ctx.beginPath();
    ctx.ellipse(0, -25 * s, 17 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-10 * s, -35 * s, 20 * s, 10 * s);
  }

  if (isPlayer) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("YOU", 0, 38 * s);
  }

  ctx.restore();
}

function shade(hex, amount) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 255) + amount;
  let b = (num & 255) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}

function showToast(message) {
  toastText = message;
  toastUntil = performance.now() + 1000;
}

function gameLoop(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;

  if (raceRunning) updateRace(dt);
  if (!screens.game.classList.contains("hidden")) drawRace();

  requestAnimationFrame(gameLoop);
}

// SHOP
function openShop() {
  renderShop();
  showScreen("shop");
}

function renderShop() {
  const box = $("shopItems");
  box.innerHTML = "";

  SKINS.forEach(skin => {
    const isOwned = owned.includes(skin.name);
    const card = document.createElement("div");
    card.innerHTML = `
      <div style="font-size:56px">${skin.emoji}</div>
      <h2>${skin.name}</h2>
      <p>${isOwned ? "OWNED" : skin.price + " 🪙"}</p>
    `;
    const button = document.createElement("button");
    button.textContent = isOwned
      ? (equipped === skin.name ? "EQUIPPED" : "EQUIP")
      : "BUY";

    button.onclick = () => {
      if (isOwned) {
        equipped = skin.name;
        persist();
        renderShop();
      } else if (coins >= skin.price) {
        coins -= skin.price;
        owned.push(skin.name);
        equipped = skin.name;
        persist();
        updateProfile();
        renderShop();
        showToast("New skin unlocked!");
      } else {
        alert("You need more coins!");
      }
    };

    card.appendChild(button);
    box.appendChild(card);
  });
}

function openCustomize() {
  const box = $("customItems");
  box.innerHTML = "";
  box.style.display = "flex";
  box.style.flexWrap = "wrap";
  box.style.justifyContent = "center";
  box.style.gap = "15px";

  owned.forEach(name => {
    const skin = SKINS.find(s => s.name === name);
    if (!skin) return;

    const button = document.createElement("button");
    button.style.minWidth = "150px";
    button.innerHTML = `<div style="font-size:42px">${skin.emoji}</div>${skin.name}${equipped === name ? " ✓" : ""}`;
    button.onclick = () => {
      equipped = name;
      persist();
      openCustomize();
    };
    box.appendChild(button);
  });

  showScreen("custom");
}

function openWheel() {
  $("wheelResult").textContent = "🎡";
  showScreen("wheel");
}

function spinWheel() {
  const rewards = [
    { text: "100 COINS!", coins: 100, xp: 0 },
    { text: "250 COINS!", coins: 250, xp: 0 },
    { text: "500 COINS!", coins: 500, xp: 0 },
    { text: "50 XP!", coins: 0, xp: 50 },
    { text: "100 XP!", coins: 0, xp: 100 }
  ];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  $("wheelResult").textContent = reward.text;
  coins += reward.coins;
  xp += reward.xp;
  updateProfile();
}

// BUTTONS
$("playBtn").onclick = startGame;
$("shopBtn").onclick = openShop;
$("customBtn").onclick = openCustomize;
$("wheelBtn").onclick = openWheel;

$("shopBackBtn").onclick = () => showScreen("home");
$("customBackBtn").onclick = () => showScreen("home");
$("wheelBackBtn").onclick = () => showScreen("home");

$("spinBtn").onclick = spinWheel;
$("nextRoundBtn").onclick = startGame;
$("resultHomeBtn").onclick = () => showScreen("home");
$("winnerAgainBtn").onclick = startGame;
$("winnerHomeBtn").onclick = () => showScreen("home");

$("quitBtn").onclick = () => {
  raceRunning = false;
  raceEnded = true;
  showScreen("home");
};

$("leftBtn").onpointerdown = e => {
  e.preventDefault();
  keys.left = true;
};
$("leftBtn").onpointerup = () => keys.left = false;
$("leftBtn").onpointerleave = () => keys.left = false;
$("leftBtn").onpointercancel = () => keys.left = false;

$("rightBtn").onpointerdown = e => {
  e.preventDefault();
  keys.right = true;
};
$("rightBtn").onpointerup = () => keys.right = false;
$("rightBtn").onpointerleave = () => keys.right = false;
$("rightBtn").onpointercancel = () => keys.right = false;

$("jumpBtn").onclick = jump;

document.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  if (key === "arrowleft" || key === "a") keys.left = true;
  if (key === "arrowright" || key === "d") keys.right = true;
  if (key === " " || key === "arrowup" || key === "w") {
    e.preventDefault();
    jump();
  }
});
document.addEventListener("keyup", e => {
  const key = e.key.toLowerCase();
  if (key === "arrowleft" || key === "a") keys.left = false;
  if (key === "arrowright" || key === "d") keys.right = false;
});

updateProfile();
resizeCanvas();
showScreen("home");
lastTime = performance.now();
requestAnimationFrame(gameLoop);
