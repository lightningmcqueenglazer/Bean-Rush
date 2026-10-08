console.log("BEAN BLAST JAVASCRIPT LOADED!");

/* =========================
   BASIC SETUP
========================= */

const screens = {
  home: document.getElementById("home"),
  game: document.getElementById("gameScreen"),
  shop: document.getElementById("shopScreen"),
  custom: document.getElementById("customScreen"),
  wheel: document.getElementById("wheelScreen"),
  result: document.getElementById("resultScreen"),
  winner: document.getElementById("winnerScreen")
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


/* =========================
   GAME DATA
========================= */

let coins = Number(localStorage.getItem("coins")) || 500;
let xp = Number(localStorage.getItem("xp")) || 0;
let crowns = Number(localStorage.getItem("crowns")) || 0;

let level = Math.floor(xp / 100) + 1;

let round = 1;
let progress = 0;

let gameRunning = false;

let player = {
  x: 50,
  y: 0,
  vy: 0,
  jumping: false
};

let keys = {
  left: false,
  right: false
};

const skins = [
  {
    name: "Classic Bean",
    emoji: "🫘",
    price: 0
  },
  {
    name: "Dinosaur",
    emoji: "🦖",
    price: 300
  },
  {
    name: "Basketball",
    emoji: "🏀",
    price: 400
  },
  {
    name: "Soccer",
    emoji: "⚽",
    price: 400
  },
  {
    name: "Pizza",
    emoji: "🍕",
    price: 500
  },
  {
    name: "Burger",
    emoji: "🍔",
    price: 500
  },
  {
    name: "Astronaut",
    emoji: "👨‍🚀",
    price: 700
  },
  {
    name: "Alien",
    emoji: "👽",
    price: 800
  },
  {
    name: "Shark",
    emoji: "🦈",
    price: 900
  },
  {
    name: "Dragon",
    emoji: "🐉",
    price: 1200
  }
];

let owned = JSON.parse(
  localStorage.getItem("ownedSkins") || '["Classic Bean"]'
);

let equipped = localStorage.getItem("equippedSkin") || "Classic Bean";


/* =========================
   MAPS
========================= */

const maps = [
  "JUNGLE RUN",
  "ICE MOUNTAIN",
  "SPACE STATION",
  "VOLCANO",
  "CANDY CHAOS",
  "PIRATE BAY",
  "CITY DASH",
  "UNDERWATER",
  "CASTLE CRASH",
  "STADIUM"
];


/* =========================
   SCREEN CONTROL
========================= */

function hideAllScreens() {

  Object.values(screens).forEach(screen => {
    screen.classList.add("hidden");
  });

}


function showScreen(name) {

  hideAllScreens();

  screens[name].classList.remove("hidden");

}


/* =========================
   PROFILE
========================= */

function updateProfile() {

  level = Math.floor(xp / 100) + 1;

  document.getElementById("level").textContent = level;
  document.getElementById("xp").textContent = xp;
  document.getElementById("coins").textContent = coins;
  document.getElementById("crowns").textContent = crowns;

  localStorage.setItem("coins", coins);
  localStorage.setItem("xp", xp);
  localStorage.setItem("crowns", crowns);
}


/* =========================
   PLAY
========================= */

function startGame() {

  console.log("PLAY BUTTON WORKED!");

  round = 1;

  startRound();

}


function startRound() {

  gameRunning = true;

  progress = 0;

  player.x = 50;
  player.y = 0;
  player.vy = 0;
  player.jumping = false;

  document.getElementById("roundText").textContent =
    `ROUND ${round} / 4`;

  document.getElementById("mapText").textContent =
    maps[(round - 1) % maps.length];

  showScreen("game");

  resizeCanvas();

}


/* =========================
   CANVAS
========================= */

function resizeCanvas() {

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

  if (gameRunning) {

    updateGame();
    drawGame();

  }

  requestAnimationFrame(gameLoop);

}


/* =========================
   GAME UPDATE
========================= */

function updateGame() {

  if (keys.left) {
    player.x -= 5;
  }

  if (keys.right) {
    player.x += 5;
  }

  player.x = Math.max(30, Math.min(canvas.width - 30, player.x));


  /* Automatic forward progress */

  progress += 0.08 + round * 0.01;

  document.getElementById("progressText").textContent =
    Math.floor(progress) + "%";


  /* Jump physics */

  player.y += player.vy;

  player.vy += 0.8;

  if (player.y >= 0) {

    player.y = 0;
    player.vy = 0;
    player.jumping = false;

  }


  /* Finish */

  if (progress >= 100) {

    gameRunning = false;

    qualify();

  }

}


/* =========================
   DRAW GAME
========================= */

function drawGame() {

  const w = canvas.width;
  const h = canvas.height;


  /* Sky */

  ctx.fillStyle = "#76d7ff";
  ctx.fillRect(0, 0, w, h);


  /* Clouds */

  ctx.fillStyle = "white";

  ctx.beginPath();
  ctx.arc(150, 120, 40, 0, Math.PI * 2);
  ctx.arc(190, 110, 55, 0, Math.PI * 2);
  ctx.arc(240, 125, 35, 0, Math.PI * 2);
  ctx.fill();


  /* Ground */

  ctx.fillStyle = "#55c96b";
  ctx.fillRect(0, h * 0.65, w, h * 0.35);


  /* Track */

  ctx.fillStyle = "#777";
  ctx.fillRect(0, h * 0.65, w, 180);


  /* Track lines */

  ctx.strokeStyle = "white";
  ctx.lineWidth = 6;

  for (let x = 0; x < w; x += 100) {

    ctx.beginPath();
    ctx.moveTo(x, h * 0.74);
    ctx.lineTo(x + 50, h * 0.74);
    ctx.stroke();

  }


  /* Obstacles */

  drawObstacle(w * 0.3, h * 0.62, "🧱");
  drawObstacle(w * 0.55, h * 0.60, "🪵");
  drawObstacle(w * 0.78, h * 0.62, "🔴");


  /* Player */

  const px = player.x;
  const py = h * 0.65 - 55 + player.y;

  ctx.font = "70px Arial";
  ctx.textAlign = "center";

  const skin = skins.find(s => s.name === equipped);

  ctx.fillText(
    skin ? skin.emoji : "🫘",
    px,
    py
  );


  /* Finish */

  if (progress > 85) {

    ctx.font = "60px Arial";

    ctx.fillText(
      "🏁",
      w - 70,
      h * 0.6
    );

  }

}


function drawObstacle(x, y, emoji) {

  ctx.font = "65px Arial";
  ctx.textAlign = "center";

  ctx.fillText(emoji, x, y);

}


/* =========================
   JUMP
========================= */

function jump() {

  if (!gameRunning) return;

  if (!player.jumping) {

    player.vy = -15;
    player.jumping = true;

  }

}


/* =========================
   QUALIFY
========================= */

function qualify() {

  xp += 50;
  coins += 100;

  updateProfile();

  if (round >= 4) {

    winGame();

    return;

  }

  document.getElementById("resultTitle").textContent =
    "🎉 QUALIFIED!";

  document.getElementById("resultMessage").textContent =
    `You finished Round ${round}! +100 coins and +50 XP`;

  showScreen("result");

}


/* =========================
   NEXT ROUND
========================= */

function nextRound() {

  round++;

  startRound();

}


/* =========================
   WIN
========================= */

function winGame() {

  crowns++;

  xp += 250;
  coins += 500;

  updateProfile();

  document.getElementById("resultTitle").textContent =
    "👑 YOU WIN!";

  document.getElementById("resultMessage").textContent =
    "You conquered all 4 rounds! +500 coins +250 XP";

  showScreen("winner");

}


/* =========================
   SHOP
========================= */

function openShop() {

  renderShop();

  showScreen("shop");

}


function renderShop() {

  const container = document.getElementById("shopItems");

  container.innerHTML = "";

  skins.forEach(skin => {

    const div = document.createElement("div");

    div.style.margin = "15px";
    div.style.padding = "15px";
    div.style.background = "rgba(255,255,255,.2)";
    div.style.borderRadius = "15px";

    const ownedSkin = owned.includes(skin.name);

    div.innerHTML = `
      <h2>${skin.emoji} ${skin.name}</h2>
      <p>${ownedSkin ? "OWNED" : skin.price + " 🪙"}</p>
    `;

    const button = document.createElement("button");

    if (ownedSkin) {

      button.textContent =
        equipped === skin.name ? "EQUIPPED" : "EQUIP";

      button.onclick = () => {

        equipped = skin.name;

        localStorage.setItem("equippedSkin", equipped);

        renderShop();

      };

    } else {

      button.textContent = "BUY";

      button.onclick = () => {

        if (coins >= skin.price) {

          coins -= skin.price;

          owned.push(skin.name);

          localStorage.setItem(
            "ownedSkins",
            JSON.stringify(owned)
          );

          updateProfile();

          renderShop();

        } else {

          alert("You don't have enough coins!");

        }

      };

    }

    div.appendChild(button);

    container.appendChild(div);

  });

}


/* =========================
   CUSTOMIZE
========================= */

function openCustomize() {

  renderCustomize();

  showScreen("custom");

}


function renderCustomize() {

  const container =
    document.getElementById("customItems");

  container.innerHTML = `
    <h2>Current Skin</h2>
    <div style="font-size:100px">${getSkinEmoji()}</div>
    <h2>${equipped}</h2>
    <p>Go to the shop to unlock more skins.</p>
  `;

}


function getSkinEmoji() {

  const skin = skins.find(
    s => s.name === equipped
  );

  return skin ? skin.emoji : "🫘";

}


/* =========================
   LUCKY WHEEL
========================= */

function openWheel() {

  document.getElementById("wheelResult").textContent =
    "🎡";

  showScreen("wheel");

}


function spinWheel() {

  const rewards = [
    "100 COINS!",
    "250 COINS!",
    "500 COINS!",
    "50 XP!",
    "100 XP!",
    "MYSTERY REWARD!"
  ];

  const reward =
    rewards[Math.floor(Math.random() * rewards.length)];

  document.getElementById("wheelResult").textContent =
    reward;


  if (reward.includes("100 COINS")) {

    coins += 100;

  } else if (reward.includes("250 COINS")) {

    coins += 250;

  } else if (reward.includes("500 COINS")) {

    coins += 500;

  } else if (reward.includes("50 XP")) {

    xp += 50;

  } else if (reward.includes("100 XP")) {

    xp += 100;

  } else {

    coins += 300;
    xp += 50;

  }

  updateProfile();

}


/* =========================
   BUTTONS
========================= */

document.getElementById("playBtn").onclick =
  startGame;

document.getElementById("shopBtn").onclick =
  openShop;

document.getElementById("customBtn").onclick =
  openCustomize;

document.getElementById("wheelBtn").onclick =
  openWheel;


document.getElementById("shopBackBtn").onclick =
  () => showScreen("home");

document.getElementById("customBackBtn").onclick =
  () => showScreen("home");

document.getElementById("wheelBackBtn").onclick =
  () => showScreen("home");


document.getElementById("nextRoundBtn").onclick =
  nextRound;

document.getElementById("resultHomeBtn").onclick =
  () => showScreen("home");


document.getElementById("winnerAgainBtn").onclick =
  startGame;

document.getElementById("winnerHomeBtn").onclick =
  () => showScreen("home");


document.getElementById("quitBtn").onclick =
  () => {

    gameRunning = false;

    showScreen("home");

  };


/* GAME CONTROLS */

document.getElementById("leftBtn").onmousedown =
  () => keys.left = true;

document.getElementById("leftBtn").onmouseup =
  () => keys.left = false;

document.getElementById("rightBtn").onmousedown =
  () => keys.right = true;

document.getElementById("rightBtn").onmouseup =
  () => keys.right = false;

document.getElementById("jumpBtn").onclick =
  jump;


/* KEYBOARD */

document.addEventListener("keydown", e => {

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    keys.left = true;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = true;
  }

  if (
    e.key === " " ||
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  ) {
    jump();
  }

});


document.addEventListener("keyup", e => {

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    keys.left = false;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = false;
  }

});


/* =========================
   START
========================= */

updateProfile();

showScreen("home");

resizeCanvas();

gameLoop();

console.log("BEAN BLAST READY!");
