/*
=========================================================
BEAN RUSH 3D
GitHub Pages browser game
=========================================================
*/

const canvas = document.createElement("canvas");

document
  .getElementById("game-container")
  .appendChild(canvas);

const engine = new Mini3D(canvas);

const game = {
  state: "menu",

  round: 1,

  maxRounds: 4,

  totalPlayers: 20,

  playersAlive: 20,

  qualified: 0,

  timer: 0,

  roundDuration: 55,

  xp: Number(localStorage.getItem("beanXP") || 0),

  level: Number(localStorage.getItem("beanLevel") || 1),

  crowns: Number(localStorage.getItem("beanCrowns") || 0),

  owned: JSON.parse(
    localStorage.getItem("beanOwned") ||
    '["default"]'
  ),

  character: JSON.parse(
    localStorage.getItem("beanCharacter") ||
    JSON.stringify({
      color: "#ff4d6d",
      face: "happy",
      hat: "none"
    })
  ),

  objects: [],

  bots: [],

  obstacles: [],

  keys: {},

  lastTime: performance.now(),

  map: null,

  player: {
    x: 0,
    y: 1,
    z: 0,

    vx: 0,
    vy: 0,
    vz: 0,

    speed: 7,

    jumpPower: 10,

    grounded: true,

    diving: false,

    alive: true,

    finished: false,

    checkpoint: 0
  }
};

/* ======================================================
   MAPS
====================================================== */

const maps = [
  {
    name: "ROOFTOP RUSH",
    theme: "city",
    type: "race",
    length: 180,
    color: "#40a9ff"
  },

  {
    name: "JUNGLE JAM",
    theme: "jungle",
    type: "race",
    length: 190,
    color: "#45d483"
  },

  {
    name: "ICE BREAKER",
    theme: "ice",
    type: "survival",
    length: 100,
    color: "#8de7ff"
  },

  {
    name: "VOLCANO FRENZY",
    theme: "volcano",
    type: "race",
    length: 210,
    color: "#ff633d"
  }
];

/* ======================================================
   SHOP
====================================================== */

const shopItems = [
  {
    id: "blue",
    name: "Ocean Bean",
    icon: "🔵",
    price: 250,
    rarity: "Common",
    color: "#2878ff"
  },

  {
    id: "green",
    name: "Lime Bean",
    icon: "🟢",
    price: 400,
    rarity: "Common",
    color: "#43d66f"
  },

  {
    id: "yellow",
    name: "Sun Bean",
    icon: "🟡",
    price: 500,
    rarity: "Uncommon",
    color: "#ffd43d"
  },

  {
    id: "purple",
    name: "Galaxy Bean",
    icon: "🟣",
    price: 900,
    rarity: "Rare",
    color: "#a855f7"
  },

  {
    id: "black",
    name: "Shadow Bean",
    icon: "⚫",
    price: 1300,
    rarity: "Epic",
    color: "#202030"
  },

  {
    id: "dragon",
    name: "Dragon Bean",
    icon: "🐲",
    price: 2500,
    rarity: "Legendary",
    color: "#ef4444"
  }
];

/* ======================================================
   UI
====================================================== */

const $ = id =>
  document.getElementById(id);

function show(id) {
  $(id).classList.remove("hidden");
}

function hide(id) {
  $(id).classList.add("hidden");
}

function saveData() {
  localStorage.setItem(
    "beanXP",
    game.xp
  );

  localStorage.setItem(
    "beanLevel",
    game.level
  );

  localStorage.setItem(
    "beanCrowns",
    game.crowns
  );

  localStorage.setItem(
    "beanOwned",
    JSON.stringify(game.owned)
  );

  localStorage.setItem(
    "beanCharacter",
    JSON.stringify(game.character)
  );
}

function updateProfileUI() {
  $("menuXP").textContent = game.xp;
  $("menuLevel").textContent = game.level;
  $("menuCrowns").textContent = game.crowns;
  $("shopXP").textContent = game.xp;
}

function toast(message) {
  const element = $("toast");

  element.textContent = message;

  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, 1800);
}

/* ======================================================
   XP / LEVELS
====================================================== */

function xpNeeded() {
  return 500 + game.level * 250;
}

function addXP(amount) {
  game.xp += amount;

  while (game.xp >= xpNeeded()) {
    game.xp -= xpNeeded();

    game.level++;

    toast(
      `LEVEL UP! You reached Level ${game.level}!`
    );
  }

  saveData();
  updateProfileUI();
}

/* ======================================================
   SHOP
====================================================== */

function openShop() {
  hide("menu");
  show("shop");

  renderShop();
}

function renderShop() {
  $("shopXP").textContent = game.xp;

  $("shopItems").innerHTML = "";

  for (const item of shopItems) {
    const owned =
      game.owned.includes(item.id);

    const card =
      document.createElement("div");

    card.className = "shop-item";

    card.innerHTML = `
      <div class="shop-icon">
        ${item.icon}
      </div>

      <h3>${item.name}</h3>

      <div class="rarity">
        ${item.rarity}
      </div>

      <div class="price">
        ⭐ ${item.price} XP
      </div>

      <button
        data-id="${item.id}"
        class="${owned ? "owned" : ""}"
      >
        ${owned ? "OWNED" : "BUY"}
      </button>
    `;

    card
      .querySelector("button")
      .addEventListener(
        "click",
        () => buyItem(item)
      );

    $("shopItems").appendChild(card);
  }
}

function buyItem(item) {
  if (game.owned.includes(item.id)) {
    toast("You already own this item!");

    return;
  }

  if (game.xp < item.price) {
    toast("Not enough XP!");

    return;
  }

  game.xp -= item.price;

  game.owned.push(item.id);

  saveData();

  renderShop();

  updateProfileUI();

  toast(
    `${item.name} unlocked!`
  );
}

/* ======================================================
   CUSTOMIZATION
====================================================== */

const colors = [
  "#ff4d6d",
  "#2878ff",
  "#43d66f",
  "#ffd43d",
  "#a855f7",
  "#ff7a18",
  "#28d7d0",
  "#202030"
];

function openCustomization() {
  hide("menu");
  show("customization");

  renderCustomization();
}

function renderCustomization() {
  const container =
    $("colorOptions");

  container.innerHTML = "";

  colors.forEach(color => {
    const button =
      document.createElement("button");

    button.className =
      "color-btn";

    button.style.background =
      color;

    if (
      game.character.color === color
    ) {
      button.classList.add("selected");
    }

    button.addEventListener(
      "click",
      () => {
        game.character.color = color;

        renderCustomization();
      }
    );

    container.appendChild(button);
  });

  document.querySelectorAll(
    ".face-options button"
  ).forEach(button => {
    button.onclick = () => {
      game.character.face =
        button.dataset.face;
    };
  });

  document.querySelectorAll(
    ".hat-options button"
  ).forEach(button => {
    button.onclick = () => {
      game.character.hat =
        button.dataset.hat;
    };
  });

  const preview =
    $("previewBean");

  preview.style.background =
    game.character.color;

  let face = "●ᴗ●";

  if (game.character.face === "cool")
    face = "⌐■_■";

  if (game.character.face === "surprised")
    face = "●o●";

  if (game.character.face === "sleepy")
    face = "-ᴗ-";

  preview.innerHTML =
    `<span>${face}</span>`;

  preview.style.display = "flex";
  preview.style.alignItems = "center";
  preview.style.justifyContent = "center";
  preview.style.color = "white";
  preview.style.fontSize = "25px";
}

$("saveCustom").onclick = () => {
  saveData();

  toast("Character saved!");

  hide("customization");

  show("menu");
};

/* ======================================================
   INPUT
====================================================== */

window.addEventListener(
  "keydown",
  event => {
    game.keys[
      event.key.toLowerCase()
    ] = true;

    if (
      [
        " ",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright"
      ].includes(
        event.key.toLowerCase()
      )
    ) {
      event.preventDefault();
    }

    if (
      game.state === "playing" &&
      event.key === " "
    ) {
      jump();
    }

    if (
      game.state === "playing" &&
      event.key.toLowerCase() === "shift"
    ) {
      dive();
    }
  }
);

window.addEventListener(
  "keyup",
  event => {
    game.keys[
      event.key.toLowerCase()
    ] = false;
  }
);

/* ======================================================
   PLAYER
====================================================== */

function jump() {
  const player = game.player;

  if (
    !player.grounded ||
    !player.alive
  ) {
    return;
  }

  player.vy =
    player.jumpPower;

  player.grounded = false;
}

function dive() {
  const player = game.player;

  if (!player.alive) return;

  player.diving = true;

  player.vz += 8;

  setTimeout(() => {
    player.diving = false;
  }, 450);
}

/* ======================================================
   START MATCH
====================================================== */

function startGame(practice = false) {
  game.state = "playing";

  game.round = 1;

  game.totalPlayers =
    practice ? 1 : 20;

  game.playersAlive =
    game.totalPlayers;

  game.qualified = 0;

  hide("menu");
  hide("shop");
  hide("customization");
  hide("resultScreen");
  hide("winnerScreen");

  show("hud");

  startRound();
}

function startRound() {
  game.timer = 0;

  game.player = {
    x: 0,
    y: 1,
    z: 0,

    vx: 0,
    vy: 0,
    vz: 0,

    speed:
      game.round === 1 ? 7 :
      game.round === 2 ? 7.3 :
      game.round === 3 ? 7.7 :
      8.2,

    jumpPower: 10,

    grounded: true,

    diving: false,

    alive: true,

    finished: false,

    checkpoint: 0
  };

  game.map =
    maps[game.round - 1];

  buildMap();

  createBots();

  updateHUD();

  showRoundIntro();
}

function showRoundIntro() {
  $("roundMessage").textContent =
    `ROUND ${game.round}`;

  setTimeout(() => {
    if (game.state === "playing") {
      $("roundMessage").textContent =
        "GO!";
    }
  }, 1800);

  setTimeout(() => {
    if (game.state === "playing") {
      $("roundMessage").textContent = "";
    }
  }, 3200);
}

/* ======================================================
   MAP CREATION
====================================================== */

function buildMap() {
  game.objects = [];
  game.obstacles = [];

  const map = game.map;

  // Main course
  game.objects.push({
    type: "box",
    x: 0,
    y: -1,
    z: map.length / 2,
    w: 24,
    h: 1,
    d: map.length,
    color: getGroundColor()
  });

  // Side walls
  game.objects.push({
    type: "box",
    x: -13,
    y: 0,
    z: map.length / 2,
    w: 1,
    h: 3,
    d: map.length,
    color: "#34405c"
  });

  game.objects.push({
    type: "box",
    x: 13,
    y: 0,
    z: map.length / 2,
    w: 1,
    h: 3,
    d: map.length,
    color: "#34405c"
  });

  // Starting platform
  game.objects.push({
    type: "box",
    x: 0,
    y: 0,
    z: -5,
    w: 24,
    h: 1,
    d: 8,
    color: "#6b7280"
  });

  if (map.type === "survival") {
    buildSurvivalMap();
  } else {
    buildRaceMap();
  }

  buildFinish();
}

function getGroundColor() {
  switch (game.map.theme) {
    case "jungle":
      return "#49b86e";

    case "ice":
      return "#8de7ff";

    case "volcano":
      return "#7d3c35";

    default:
      return "#576a91";
  }
}

function buildRaceMap() {
  const length =
    game.map.length;

  const difficulty =
    game.round;

  // Moving bars
  for (
    let z = 18;
    z < length - 15;
    z += 28
  ) {
    game.obstacles.push({
      type: "spinner",
      x: 0,
      y: 1.5,
      z,
      length: 11,
      speed:
        1.5 + difficulty * .35
    });
  }

  // Bumpers
  for (
    let z = 30;
    z < length - 10;
    z += 35
  ) {
    game.obstacles.push({
      type: "bumper",
      x: z % 2 === 0 ? -5 : 5,
      y: 1,
      z,
      radius: 1.5,
      speed: 2
    });
  }

  // Walls
  for (
    let z = 42;
    z < length - 15;
    z += 45
  ) {
    game.obstacles.push({
      type: "wall",
      x: 0,
      y: 0,
      z,
      w: 10,
      h: 3,
      gap: 4
    });
  }

  // Jump blocks
  for (
    let z = 22;
    z < length - 20;
    z += 50
  ) {
    game.objects.push({
      type: "box",
      x: 0,
      y: 0,
      z,
      w: 5,
      h: 1.2,
      d: 4,
      color: "#ffcf33"
    });
  }

  // Bouncy pads
  for (
    let z = 35;
    z < length - 20;
    z += 55
  ) {
    game.objects.push({
      type: "box",
      x: 7,
      y: 0,
      z,
      w: 4,
      h: .4,
      d: 4,
      color: "#ff54bd",
      bounce: true
    });
  }
}

function buildSurvivalMap() {
  for (
    let z = 15;
    z < 90;
    z += 18
  ) {
    game.obstacles.push({
      type: "spinner",
      x: 0,
      y: 1.2,
      z,
      length: 10,
      speed: 1.5
    });
  }

  for (
    let i = 0;
    i < 12;
    i++
  ) {
    game.objects.push({
      type: "box",
      x: (i % 2 === 0 ? -5 : 5),
      y: 0,
      z: 12 + i * 7,
      w: 5,
      h: .5,
      d: 5,
      color: "#fff"
    });
  }
}

function buildFinish() {
  const z =
    game.map.length - 5;

  game.objects.push({
    type: "box",
    x: 0,
    y: 0,
    z,
    w: 24,
    h: .2,
    d: 2,
    color: "#ffffff"
  });

  for (let x = -9; x <= 9; x += 3) {
    game.objects.push({
      type: "box",
      x,
      y: .2,
      z: z - .5,
      w: 3,
      h: .05,
      d: 1,
      color:
        Math.round((x + 9) / 3) % 2 === 0
          ? "#111"
          : "#fff"
    });
  }
}

/* ======================================================
   BOTS
====================================================== */

function createBots() {
  game.bots = [];

  if (game.totalPlayers <= 1)
    return;

  for (
    let i = 0;
    i < game.totalPlayers - 1;
    i++
  ) {
    game.bots.push({
      x:
        ((i % 8) - 3.5) * 2.5,

      y: 1,

      z:
        -i * 1.4,

      speed:
        5.5 +
        Math.random() * 2.3 +
        game.round * .2,

      color:
        colors[
          i % colors.length
        ],

      alive: true,

      finished: false,

      wobble:
        Math.random() * 10
    });
  }
}

/* ======================================================
   OBSTACLE LOGIC
====================================================== */

function updateObstacles(dt) {
  for (const obstacle of game.obstacles) {
    if (
      obstacle.type === "spinner"
    ) {
      obstacle.angle =
        (obstacle.angle || 0) +
        obstacle.speed * dt;
    }

    if (
      obstacle.type === "bumper"
    ) {
      obstacle.x =
        obstacle.x +
        Math.sin(
          game.timer * obstacle.speed
        ) * dt * 4;
    }

    if (
      obstacle.type === "wall"
    ) {
      obstacle.gapX =
        Math.sin(game.timer * .8) *
        5;
    }
  }
}

function checkObstacles() {
  const p = game.player;

  for (const o of game.obstacles) {
    if (
      o.type === "spinner"
    ) {
      const dz =
        Math.abs(p.z - o.z);

      if (dz < 2) {
        const angle =
          o.angle || 0;

        const barX =
          Math.cos(angle) *
          o.length;

        const barZ =
          o.z +
          Math.sin(angle) *
          o.length;

        const dx =
          p.x - barX * .35;

        const distance =
          Math.sqrt(
            dx * dx +
            (p.z - barZ * .35) *
            (p.z - barZ * .35)
          );

        if (
          distance < 2 &&
          p.y < 3
        ) {
          p.vx +=
            Math.cos(angle) * 5;

          p.vz +=
            Math.sin(angle) * 5;

          p.vy = 5;
        }
      }
    }

    if (
      o.type === "bumper"
    ) {
      const dx =
        p.x - o.x;

      const dz =
        p.z - o.z;

      const distance =
        Math.sqrt(
          dx * dx + dz * dz
        );

      if (
        distance <
        o.radius + .8
      ) {
        const push =
          new Vec3(
            dx,
            0,
            dz
          ).normalize();

        p.vx += push.x * 8;
        p.vz += push.z * 8;
        p.vy = 4;
      }
    }

    if (
      o.type === "wall"
    ) {
      const dz =
        Math.abs(p.z - o.z);

      if (
        dz < 1.5 &&
        Math.abs(
          p.x - (o.gapX || 0)
        ) > o.gap / 2
      ) {
        p.vz *= -.4;
        p.x +=
          p.x > 0 ? -1 : 1;
      }
    }
  }
}

/* ======================================================
   PLAYER UPDATE
====================================================== */

function updatePlayer(dt) {
  const p = game.player;

  if (!p.alive)
    return;

  let moveX = 0;
  let moveZ = 0;

  if (
    game.keys["a"] ||
    game.keys["arrowleft"]
  ) {
    moveX -= 1;
  }

  if (
    game.keys["d"] ||
    game.keys["arrowright"]
  ) {
    moveX += 1;
  }

  if (
    game.keys["w"] ||
    game.keys["arrowup"]
  ) {
    moveZ += 1;
  }

  if (
    game.keys["s"] ||
    game.keys["arrowdown"]
  ) {
    moveZ -= 1;
  }

  const length =
    Math.sqrt(
      moveX * moveX +
      moveZ * moveZ
    ) || 1;

  moveX /= length;
  moveZ /= length;

  const acceleration = 20;

  p.vx +=
    moveX *
    acceleration *
    dt;

  p.vz +=
    moveZ *
    acceleration *
    dt;

  const maxSpeed =
    p.speed;

  const horizontalSpeed =
    Math.sqrt(
      p.vx * p.vx +
      p.vz * p.vz
    );

  if (
    horizontalSpeed >
    maxSpeed
  ) {
    const scale =
      maxSpeed /
      horizontalSpeed;

    p.vx *= scale;
    p.vz *= scale;
  }

  p.vx *=
    Math.pow(.0005, dt);

  p.vz *=
    Math.pow(.0005, dt);

  p.vy -=
    25 * dt;

  p.x +=
    p.vx * dt;

  p.y +=
    p.vy * dt;

  p.z +=
    p.vz * dt;

  if (
    p.y <= 1
  ) {
    p.y = 1;
    p.vy = 0;
    p.grounded = true;
  }

  if (
    Math.abs(p.x) >
    11.3
  ) {
    p.x =
      Math.sign(p.x) *
      11.3;

    p.vx *= -.4;
  }

  // Bouncy objects
  for (const o of game.objects) {
    if (
      o.bounce &&
      Math.abs(p.x - o.x) < o.w / 2 &&
      Math.abs(p.z - o.z) < o.d / 2 &&
      p.y <= 1.5
    ) {
      p.vy = 14;
      p.grounded = false;
    }
  }

  checkObstacles();

  if (
    p.y < -5
  ) {
    respawnPlayer();
  }

  if (
    p.z >=
    game.map.length - 8
  ) {
    p.finished = true;

    finishPlayer();
  }
}

function respawnPlayer() {
  game.player.x = 0;
  game.player.y = 1;
  game.player.z =
    Math.max(
      0,
      game.player.checkpoint
    );

  game.player.vx = 0;
  game.player.vy = 0;
  game.player.vz = 0;

  toast("Checkpoint!");
}

/* ======================================================
   FINISHING
====================================================== */

function finishPlayer() {
  if (
    game.player.finished &&
    game.state !== "playing"
  ) {
    return;
  }

  game.player.finished = true;

  if (
    game.round < 4
  ) {
    qualifyRound();
  } else {
    winGame();
  }
}

function qualifyRound() {
  if (
    game.state !== "playing"
  ) {
    return;
  }

  game.state = "roundResult";

  let nextPlayers;

  if (game.round === 1)
    nextPlayers = 14;

  else if (game.round === 2)
    nextPlayers = 9;

  else
    nextPlayers = 4;

  if (
    game.totalPlayers === 1
  ) {
    nextPlayers = 1;
  }

  game.playersAlive =
    nextPlayers;

  const reward =
    game.round * 150;

  addXP(reward);

  $("resultIcon").textContent =
    "🏃";

  $("resultTitle").textContent =
    "QUALIFIED!";

  $("resultDescription").textContent =
    `You survived Round ${game.round} and made it to the next round!`;

  $("resultXP").textContent =
    `+${reward}`;

  $("resultPlayers").textContent =
    nextPlayers;

  hide("hud");
  show("resultScreen");
}

function eliminatePlayer() {
  if (
    game.state !== "playing"
  )
    return;

  game.state =
    "roundResult";

  $("resultIcon").textContent =
    "💥";

  $("resultTitle").textContent =
    "ELIMINATED!";

  $("resultDescription").textContent =
    "You didn't qualify this time. Try again!";

  $("resultXP").textContent =
    "+50";

  $("resultPlayers").textContent =
    game.playersAlive;

  addXP(50);

  hide("hud");
  show("resultScreen");
}

function nextRound() {
  if (
    game.round >= 4
  ) {
    winGame();

    return;
  }

  game.round++;

  game.state =
    "playing";

  hide("resultScreen");

  show("hud");

  startRound();
}

/* ======================================================
   FINAL
====================================================== */

function winGame() {
  game.state = "winner";

  game.crowns++;

  addXP(1000);

  saveData();

  hide("hud");
  hide("resultScreen");

  show("winnerScreen");

  updateProfileUI();
}

/* ======================================================
   BOT UPDATE
====================================================== */

function updateBots(dt) {
  for (const bot of game.bots) {
    if (!bot.alive)
      continue;

    bot.z +=
      bot.speed * dt;

    bot.x +=
      Math.sin(
        game.timer * 2 +
        bot.wobble
      ) *
      dt *
      1.2;

    if (
      Math.random() <
      dt * .15
    ) {
      bot.x +=
        (Math.random() - .5) * 3;
    }

    if (
      bot.z >
      game.map.length - 8
    ) {
      bot.finished = true;
    }

    if (
      bot.z >
      game.map.length + 5
    ) {
      bot.alive = false;
    }
  }
}

/* ======================================================
   HUD
====================================================== */

function updateHUD() {
  $("roundText").textContent =
    `${game.round} / 4`;

  $("mapName").textContent =
    game.map.name;

  $("qualifiedText").textContent =
    `${game.qualified} / ${game.playersAlive}`;
}

function updateTimer() {
  const seconds =
    Math.max(
      0,
      Math.ceil(
        game.roundDuration -
        game.timer
      )
    );

  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    seconds % 60;

  $("timer").textContent =
    `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

/* ======================================================
   CAMERA
====================================================== */

function updateCamera() {
  const p = game.player;

  engine.camera.position.x =
    p.x * .45;

  engine.camera.position.y =
    7 + p.y * .15;

  engine.camera.position.z =
    p.z - 15;

  engine.camera.target.x =
    p.x * .15;

  engine.camera.target.y =
    1;

  engine.camera.target.z =
    p.z + 15;
}

/* ======================================================
   DRAW WORLD
====================================================== */

function drawWorld() {
  drawSky();

  drawObjects();

  drawObstacles();

  drawBots();

  drawPlayer();
}

function drawSky() {
  let top = "#75c8ff";
  let bottom = "#d7f4ff";

  if (game.map.theme === "volcano") {
    top = "#32131c";
    bottom = "#e35b32";
  }

  if (game.map.theme === "jungle") {
    top = "#63d8ff";
    bottom = "#b7f5d0";
  }

  if (game.map.theme === "ice") {
    top = "#4bb9ff";
    bottom = "#e9ffff";
  }

  const gradient =
    engine.ctx.createLinearGradient(
      0,
      0,
      0,
      engine.height
    );

  gradient.addColorStop(
    0,
    top
  );

  gradient.addColorStop(
    1,
    bottom
  );

  engine.ctx.fillStyle =
    gradient;

  engine.ctx.fillRect(
    0,
    0,
    engine.width,
    engine.height
  );
}

function drawObjects() {
  const sorted =
    [...game.objects]
      .sort(
        (a, b) =>
          b.z - a.z
      );

  for (const o of sorted) {
    if (o.type !== "box")
      continue;

    engine.box(
      o.x,
      o.y,
      o.z,
      o.w,
      o.h,
      o.d,
      o.color
    );
  }
}

function drawObstacles() {
  for (const o of game.obstacles) {
    if (
      o.type === "spinner"
    ) {
      const angle =
        o.angle || 0;

      const x1 =
        o.x +
        Math.cos(angle) *
        o.length;

      const z1 =
        o.z +
        Math.sin(angle) *
        o.length;

      const x2 =
        o.x -
        Math.cos(angle) *
        o.length;

      const z2 =
        o.z -
        Math.sin(angle) *
        o.length;

      drawBeam(
        o.x,
        o.y,
        o.z,
        x1,
        o.y,
        z1,
        "#ff4d6d"
      );

      drawBeam(
        o.x,
        o.y,
        o.z,
        x2,
        o.y,
        z2,
        "#ffcc33"
      );

      engine.sphere(
        o.x,
        o.y,
        o.z,
        1.1,
        "#fff"
      );
    }

    if (
      o.type === "bumper"
    ) {
      engine.sphere(
        o.x,
        o.y,
        o.z,
        o.radius,
        "#ff4d6d"
      );
    }

    if (
      o.type === "wall"
    ) {
      const gap =
        o.gapX || 0;

      const leftWidth =
        gap - o.gap / 2 + 11;

      const rightWidth =
        11 - gap - o.gap / 2;

      if (leftWidth > 0) {
        engine.box(
          -11 + leftWidth / 2,
          o.y,
          o.z,
          leftWidth,
          o.h,
          2,
          "#a855f7"
        );
      }

      if (rightWidth > 0) {
        engine.box(
          11 - rightWidth / 2,
          o.y,
          o.z,
          rightWidth,
          o.h,
          2,
          "#a855f7"
        );
      }
    }
  }
}

function drawBeam(
  x1,
  y1,
  z1,
  x2,
  y2,
  z2,
  color
) {
  const midX =
    (x1 + x2) / 2;

  const midY =
    (y1 + y2) / 2;

  const midZ =
    (z1 + z2) / 2;

  const length =
    Math.sqrt(
      (x2 - x1) ** 2 +
      (z2 - z1) ** 2
    );

  engine.box(
    midX,
    midY - .3,
    midZ,
    length,
    .6,
    .7,
    color
  );
}

/* ======================================================
   DRAW BOTS
====================================================== */

function drawBots() {
  for (const bot of game.bots) {
    if (!bot.alive)
      continue;

    drawBean(
      bot.x,
      bot.y,
      bot.z,
      bot.color,
      "happy",
      "none"
    );
  }
}

/* ======================================================
   DRAW PLAYER
====================================================== */

function drawPlayer() {
  const p =
    game.player;

  drawBean(
    p.x,
    p.y,
    p.z,
    p.color ||
      game.character.color,
    game.character.face,
    game.character.hat
  );
}

function drawBean(
  x,
  y,
  z,
  color,
  face,
  hat
) {
  // Body
  engine.sphere(
    x,
    y + .7,
    z,
    .9,
    color
  );

  // Head
  engine.sphere(
    x,
    y + 1.35,
    z,
    .8,
    color
  );

  // Eyes
  engine.sphere(
    x - .27,
    y + 1.55,
    z - .7,
    .13,
    "#111"
  );

  engine.sphere(
    x + .27,
    y + 1.55,
    z - .7,
    .13,
    "#111"
  );

  // Face variations
  if (face === "surprised") {
    engine.sphere(
      x,
      y + 1.28,
      z - .75,
      .16,
      "#111"
    );
  }

  if (face === "cool") {
    engine.box(
      x,
      y + 1.58,
      z - .76,
      .9,
      .18,
      .12,
      "#111"
    );
  }

  if (face === "sleepy") {
    engine.box(
      x,
      y + 1.53,
      z - .75,
      .7,
      .07,
      .1,
      "#111"
    );
  }

  // Hat
  if (hat === "cap") {
    engine.box(
      x,
      y + 2.05,
      z,
      1.1,
      .3,
      1,
      "#2878ff"
    );
  }

  if (hat === "crown") {
    engine.text3D(
      "👑",
      x,
      y + 2.5,
      z,
      22
    );
  }

  if (hat === "helmet") {
    engine.sphere(
      x,
      y + 1.95,
      z,
      .9,
      "#ffd43d"
    );
  }

  if (hat === "cowboy") {
    engine.box(
      x,
      y + 2.0,
      z,
      1.5,
      .2,
      1.2,
      "#8b5a2b"
    );
  }
}

/* ======================================================
   GAME LOOP
====================================================== */

function update(dt) {
  if (
    game.state !== "playing"
  ) {
    return;
  }

  game.timer += dt;

  updatePlayer(dt);

  updateBots(dt);

  updateObstacles(dt);

  updateCamera();

  updateTimer();

  updateHUD();

  // Survival elimination
  if (
    game.map.type === "survival" &&
    game.timer >=
    game.roundDuration
  ) {
    qualifyRound();

    return;
  }

  // Race timeout
  if (
    game.map.type === "race" &&
    game.timer >=
    game.roundDuration
  ) {
    eliminatePlayer();

    return;
  }
}

function render() {
  drawWorld();
}

function loop(now) {
  const dt =
    Math.min(
      (now - game.lastTime) /
      1000,
      .05
    );

  game.lastTime = now;

  update(dt);

  render();

  requestAnimationFrame(loop);
}

/* ======================================================
   BUTTONS
====================================================== */

$("playBtn").onclick =
  () => startGame(false);

$("practiceBtn").onclick =
  () => startGame(true);

$("shopBtn").onclick =
  openShop;

$("customBtn").onclick =
  openCustomization;

$("closeShop").onclick =
  () => {
    hide("shop");
    show("menu");
  };

$("closeCustom").onclick =
  () => {
    hide("customization");
    show("menu");
  };

$("continueBtn").onclick =
  nextRound;

$("playAgainBtn").onclick =
  () => startGame(false);

$("menuBtn").onclick =
  () => {
    game.state = "menu";

    hide("winnerScreen");
    hide("hud");
    show("menu");

    updateProfileUI();
  };

/* ======================================================
   INITIALIZATION
====================================================== */

function init() {
  updateProfileUI();

  game.map = maps[0];

  updateCamera();

  requestAnimationFrame(loop);
}

init();
