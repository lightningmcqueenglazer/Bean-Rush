/*
===========================================================
BEAN RUSH
Bots-only 3D obstacle game
Designed for GitHub Pages
===========================================================
*/

const canvas =
  document.getElementById("canvas");

const gfx =
  new Mini3D(canvas);


/* ========================================================
   DATA
======================================================== */

const SKINS = [

  {
    id: "classic",
    name: "Classic Bean",
    icon: "🫘",
    color: "#ff4773",
    price: 0,
    rarity: "Common"
  },

  {
    id: "dino",
    name: "Dinosaur",
    icon: "🦖",
    color: "#42c96b",
    price: 600,
    rarity: "Rare"
  },

  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    color: "#ed7d32",
    price: 750,
    rarity: "Rare"
  },

  {
    id: "soccer",
    name: "Soccer Star",
    icon: "⚽",
    color: "#eeeeee",
    price: 800,
    rarity: "Rare"
  },

  {
    id: "pizza",
    name: "Pizza",
    icon: "🍕",
    color: "#ff8a24",
    price: 650,
    rarity: "Rare"
  },

  {
    id: "burger",
    name: "Burger",
    icon: "🍔",
    color: "#b86c32",
    price: 700,
    rarity: "Rare"
  },

  {
    id: "icecream",
    name: "Ice Cream",
    icon: "🍦",
    color: "#ff9fd2",
    price: 850,
    rarity: "Epic"
  },

  {
    id: "astronaut",
    name: "Astronaut",
    icon: "👨‍🚀",
    color: "#e9eef5",
    price: 1200,
    rarity: "Epic"
  },

  {
    id: "alien",
    name: "Alien",
    icon: "👽",
    color: "#70e34f",
    price: 1500,
    rarity: "Epic"
  },

  {
    id: "shark",
    name: "Shark",
    icon: "🦈",
    color: "#599bbd",
    price: 1000,
    rarity: "Epic"
  },

  {
    id: "penguin",
    name: "Penguin",
    icon: "🐧",
    color: "#303747",
    price: 950,
    rarity: "Rare"
  },

  {
    id: "dragon",
    name: "Dragon",
    icon: "🐲",
    color: "#d93838",
    price: 2500,
    rarity: "Legendary"
  },

  {
    id: "robot",
    name: "Robot",
    icon: "🤖",
    color: "#8290a6",
    price: 1800,
    rarity: "Epic"
  },

  {
    id: "pirate",
    name: "Pirate",
    icon: "🏴‍☠️",
    color: "#743d91",
    price: 1400,
    rarity: "Epic"
  }
];


const MAPS = [

  {
    name: "JUNGLE JUMBLE",
    theme: "jungle",
    type: "race",
    length: 210,
    time: 65,
    icon: "🌴"
  },

  {
    name: "OCEAN ODYSSEY",
    theme: "underwater",
    type: "race",
    length: 220,
    time: 68,
    icon: "🌊"
  },

  {
    name: "SPORTS STADIUM",
    theme: "sports",
    type: "race",
    length: 215,
    time: 65,
    icon: "🏟️"
  },

  {
    name: "FOOD FRENZY",
    theme: "food",
    type: "race",
    length: 220,
    time: 68,
    icon: "🍕"
  },

  {
    name: "SPACE STAMPEDE",
    theme: "space",
    type: "survival",
    length: 120,
    time: 60,
    icon: "🚀"
  },

  {
    name: "VOLCANO MAYHEM",
    theme: "volcano",
    type: "race",
    length: 230,
    time: 70,
    icon: "🌋"
  },

  {
    name: "ICE INVASION",
    theme: "ice",
    type: "race",
    length: 220,
    time: 68,
    icon: "❄️"
  },

  {
    name: "PIRATE PLUNDER",
    theme: "pirate",
    type: "race",
    length: 220,
    time: 68,
    icon: "🏴‍☠️"
  },

  {
    name: "CANDY CHAOS",
    theme: "candy",
    type: "race",
    length: 210,
    time: 65,
    icon: "🍬"
  },

  {
    name: "CITY CRASH",
    theme: "city",
    type: "race",
    length: 225,
    time: 68,
    icon: "🏙️"
  }
];


/* ========================================================
   SAVE DATA
======================================================== */

function loadNumber(key, fallback) {

  const value =
    Number(
      localStorage.getItem(key)
    );

  return Number.isFinite(value)
    ? value
    : fallback;
}


function loadArray(key, fallback) {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(key)
      );

    return Array.isArray(value)
      ? value
      : fallback;

  } catch {

    return fallback;
  }
}


const data = {

  xp:
    loadNumber("br_xp", 0),

  coins:
    loadNumber("br_coins", 500),

  level:
    loadNumber("br_level", 1),

  crowns:
    loadNumber("br_crowns", 0),

  owned:
    loadArray(
      "br_owned",
      ["classic"]
    ),

  skin:
    localStorage.getItem(
      "br_skin"
    ) || "classic",

  face:
    localStorage.getItem(
      "br_face"
    ) || "happy",

  hat:
    localStorage.getItem(
      "br_hat"
    ) || "none",

  lastWheel:
    localStorage.getItem(
      "br_wheel"
    ) || ""

};


function save() {

  localStorage.setItem(
    "br_xp",
    data.xp
  );

  localStorage.setItem(
    "br_coins",
    data.coins
  );

  localStorage.setItem(
    "br_level",
    data.level
  );

  localStorage.setItem(
    "br_crowns",
    data.crowns
  );

  localStorage.setItem(
    "br_owned",
    JSON.stringify(
      data.owned
    )
  );

  localStorage.setItem(
    "br_skin",
    data.skin
  );

  localStorage.setItem(
    "br_face",
    data.face
  );

  localStorage.setItem(
    "br_hat",
    data.hat
  );

  localStorage.setItem(
    "br_wheel",
    data.lastWheel
  );
}


/* ========================================================
   GAME STATE
======================================================== */

const game = {

  state: "menu",

  round: 1,

  players: 20,

  timer: 0,

  map: null,

  objects: [],

  obstacles: [],

  bots: [],

  keys: {},

  announcementTimer: 0,

  player: {

    x: 0,
    y: 1,
    z: -4,

    vx: 0,
    vy: 0,
    vz: 0,

    grounded: true,

    alive: true,

    finished: false,

    checkpoint: 0,

    speed: 8

  }

};


/* ========================================================
   UI HELPERS
======================================================== */

function $(id) {
  return document.getElementById(id);
}


function show(id) {
  $(id).classList.remove("hidden");
}


function hide(id) {
  $(id).classList.add("hidden");
}


function toast(message) {

  const t =
    $("toast");

  t.textContent =
    message;

  t.classList.add("show");

  setTimeout(
    () =>
      t.classList.remove("show"),
    1800
  );
}


function updateProfile() {

  $("levelText").textContent =
    data.level;

  $("xpText").textContent =
    data.xp;

  $("coinsText").textContent =
    data.coins;

  $("crownText").textContent =
    data.crowns;
}


updateProfile();


/* ========================================================
   XP
======================================================== */

function xpRequired() {

  return (
    500 +
    data.level * 250
  );
}


function addXP(amount) {

  data.xp += amount;

  while (
    data.xp >=
    xpRequired()
  ) {

    data.xp -=
      xpRequired();

    data.level++;

    toast(
      `⭐ LEVEL ${data.level}!`
    );
  }

  save();

  updateProfile();
}


/* ========================================================
   SKINS
======================================================== */

function getSkin() {

  return (
    SKINS.find(
      s =>
        s.id === data.skin
    ) ||
    SKINS[0]
  );
}


function renderSkins() {

  const grid =
    $("skinGrid");

  grid.innerHTML = "";

  for (
    const skin of SKINS
  ) {

    const owned =
      data.owned.includes(
        skin.id
      );

    const item =
      document.createElement(
        "div"
      );

    item.className =
      "item";

    item.innerHTML = `

      <div
        class="itemIcon"
        style="
          background:
          linear-gradient(
            135deg,
            ${skin.color},
            #111
          );
          border-radius:16px;
        "
      >
        ${skin.icon}
      </div>

      <h3>${skin.name}</h3>

      <div class="rarity">
        ${skin.rarity}
      </div>

      <div>
        ${
          owned
            ? "OWNED"
            : `🪙 ${skin.price}`
        }
      </div>

      <button>
        ${
          owned
            ? (
              data.skin === skin.id
                ? "EQUIPPED"
                : "EQUIP"
            )
            : "BUY"
        }
      </button>
    `;

    const button =
      item.querySelector(
        "button"
      );

    button.onclick = () => {

      if (owned) {

        data.skin =
          skin.id;

        save();

        renderSkins();

        renderPreview();

        toast(
          `${skin.name} equipped!`
        );

        return;
      }

      if (
        data.coins <
        skin.price
      ) {

        toast(
          "Not enough coins!"
        );

        return;
      }

      data.coins -=
        skin.price;

      data.owned.push(
        skin.id
      );

      data.skin =
        skin.id;

      save();

      updateProfile();

      renderSkins();

      renderPreview();

      toast(
        `${skin.name} unlocked!`
      );
    };

    grid.appendChild(
      item
    );
  }
}


function renderPreview() {

  const skin =
    getSkin();

  const preview =
    $("customPreview");

  let face = "●ᴗ●";

  if (
    data.face === "cool"
  )
    face = "⌐■_■";

  if (
    data.face === "surprised"
  )
    face = "●o●";

  if (
    data.face === "sleepy"
  )
    face = "-ᴗ-";

  preview.innerHTML =
    `<div
      class="previewBean"
      style="
        background:${skin.color};
      "
    >
      ${face}
    </div>`;
}


/* ========================================================
   SHOP
======================================================== */

function renderShop() {

  $("shopCoins").textContent =
    data.coins;

  $("shopXP").textContent =
    data.xp;

  const grid =
    $("shopGrid");

  grid.innerHTML = "";

  for (
    const skin of SKINS
  ) {

    const owned =
      data.owned.includes(
        skin.id
      );

    const item =
      document.createElement(
        "div"
      );

    item.className =
      "item";

    item.innerHTML = `

      <div class="itemIcon">
        ${skin.icon}
      </div>

      <h3>${skin.name}</h3>

      <div class="rarity">
        ${skin.rarity}
      </div>

      <div>
        ${
          owned
            ? "OWNED"
            : `🪙 ${skin.price}`
        }
      </div>

      <button>
        ${
          owned
            ? "EQUIP"
            : "BUY"
        }
      </button>
    `;

    item.querySelector(
      "button"
    ).onclick = () => {

      if (owned) {

        data.skin =
          skin.id;

        save();

        toast(
          `${skin.name} equipped!`
        );

        return;
      }

      if (
        data.coins <
        skin.price
      ) {

        toast(
          "Not enough coins!"
        );

        return;
      }

      data.coins -=
        skin.price;

      data.owned.push(
        skin.id
      );

      data.skin =
        skin.id;

      save();

      updateProfile();

      renderShop();

      toast(
        `${skin.name} purchased!`
      );
    };

    grid.appendChild(
      item
    );
  }
}


/* ========================================================
   DAILY WHEEL
======================================================== */

function todayKey() {

  const d =
    new Date();

  return [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate()
  ].join("-");
}


function wheelAvailable() {

  return (
    data.lastWheel !==
    todayKey()
  );
}


function spinWheel() {

  if (
    !wheelAvailable()
  ) {

    toast(
      "Come back tomorrow!"
    );

    return;
  }

  const wheel =
    $("wheelGraphic");

  wheel.style.transform =
    `rotate(${
      1800 +
      Math.random() * 720
    }deg)`;

  $("spinBtn").disabled =
    true;

  setTimeout(
    () => {

      const rewards = [

        {
          text: "500 XP!",
          action: () =>
            addXP(500)
        },

        {
          text: "1000 XP!",
          action: () =>
            addXP(1000)
        },

        {
          text: "250 Coins!",
          action: () => {

            data.coins += 250;

            save();

            updateProfile();
          }
        },

        {
          text: "500 Coins!",
          action: () => {

            data.coins += 500;

            save();

            updateProfile();
          }
        },

        {
          text: "A FREE SKIN!",
          action: freeSkin
        }

      ];

      const reward =
        rewards[
          Math.floor(
            Math.random() *
            rewards.length
          )
        ];

      reward.action();

      $("wheelResult").textContent =
        `🎉 YOU WON: ${reward.text}`;

      data.lastWheel =
        todayKey();

      save();

      $("spinBtn").textContent =
        "COME BACK TOMORROW";

      $("spinBtn").disabled =
        true;

    },
    3000
  );
}


function freeSkin() {

  const available =
    SKINS.filter(
      skin =>
        !data.owned.includes(
          skin.id
        )
    );

  if (
    available.length === 0
  ) {

    data.coins += 1000;

    toast(
      "You own every skin! +1000 coins!"
    );

    return;
  }

  const skin =
    available[
      Math.floor(
        Math.random() *
        available.length
      )
    ];

  data.owned.push(
    skin.id
  );

  save();

  toast(
    `${skin.icon} ${skin.name} unlocked!`
  );
}


function refreshWheel() {

  $("spinBtn").disabled =
    !wheelAvailable();

  $("spinBtn").textContent =
    wheelAvailable()
      ? "SPIN FREE"
      : "COME BACK TOMORROW";
}


/* ========================================================
   CHARACTER INPUT
======================================================== */

window.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();

    game.keys[key] =
      true;

    if (
      game.state === "playing" &&
      key === " "
    ) {

      event.preventDefault();

      jump();
    }

    if (
      game.state === "playing" &&
      key === "shift"
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


function jump() {

  const p =
    game.player;

  if (
    p.grounded &&
    p.alive
  ) {

    p.vy = 11;

    p.grounded =
      false;
  }
}


function dive() {

  const p =
    game.player;

  if (
    p.alive
  ) {

    p.vz += 5;

    p.vy += 2;
  }
}


/* ========================================================
   START MATCH
======================================================== */

function startMatch() {

  hide("menu");
  hide("shop");
  hide("custom");
  hide("wheel");
  hide("result");
  hide("winner");

  show("hud");

  game.state =
    "playing";

  game.round = 1;

  game.players = 20;

  beginRound();
}


function beginRound() {

  game.map =
    MAPS[
      Math.floor(
        Math.random() *
        MAPS.length
      )
    ];

  game.timer = 0;

  game.objects = [];

  game.obstacles = [];

  game.bots = [];

  game.player = {

    x: 0,
    y: 1,
    z: -5,

    vx: 0,
    vy: 0,
    vz: 0,

    grounded: true,

    alive: true,

    finished: false,

    checkpoint: 0,

    speed:
      7.5 +
      game.round * .35
  };

  buildMap();

  createBots();

  updateHUD();

  announce(
    `ROUND ${game.round} • ${game.map.icon} ${game.map.name}`
  );

  setTimeout(
    () =>
      announce("3..."),
    1000
  );

  setTimeout(
    () =>
      announce("2..."),
    1600
  );

  setTimeout(
    () =>
      announce("1..."),
    2200
  );

  setTimeout(
    () =>
      announce("GO!"),
    2800
  );

  setTimeout(
    () =>
      announce(""),
    3800
  );
}


/* ========================================================
   MAP BUILDING
======================================================== */

function buildMap() {

  const map =
    game.map;

  const ground =
    groundColor(
      map.theme
    );

  game.objects.push({

    type: "box",

    x: 0,
    y: -1,
    z: map.length / 2,

    w: 24,
    h: 1,
    d: map.length,

    color: ground
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

    color: "#253250"
  });


  game.objects.push({

    type: "box",

    x: 13,
    y: 0,
    z: map.length / 2,

    w: 1,
    h: 3,
    d: map.length,

    color: "#253250"
  });


  // Theme decoration

  buildTheme(
    map.theme
  );


  // Obstacles

  for (
    let z = 15;
    z < map.length - 15;
    z += 25
  ) {

    game.obstacles.push({

      type: "spinner",

      x: 0,

      y: 1.2,

      z,

      length:
        6 +
        Math.random() * 3,

      angle:
        Math.random() *
        Math.PI * 2,

      speed:
        1.7 +
        game.round * .25
    });
  }


  // Moving bumpers

  for (
    let z = 28;
    z < map.length - 10;
    z += 40
  ) {

    game.obstacles.push({

      type: "bumper",

      x:
        Math.random() > .5
          ? -6
          : 6,

      y: 1,

      z,

      radius: 1.5,

      phase:
        Math.random() * 5
    });
  }


  // Jump platforms

  for (
    let z = 35;
    z < map.length - 15;
    z += 55
  ) {

    game.objects.push({

      type: "box",

      x:
        Math.random() > .5
          ? -6
          : 6,

      y: 0,

      z,

      w: 5,
      h: 1.2,
      d: 5,

      color:
        randomBright(),

      bounce: true
    });
  }


  // Finish line

  const finish =
    map.length - 7;

  game.objects.push({

    type: "box",

    x: 0,
    y: 0,
    z: finish,

    w: 24,
    h: .2,
    d: 2,

    color: "#ffffff"
  });

  for (
    let x = -10;
    x <= 10;
    x += 4
  ) {

    game.objects.push({

      type: "box",

      x,

      y: .2,

      z:
        finish - .5,

      w: 4,
      h: .1,
      d: 1,

      color:
        Math.floor(
          (x + 10) / 4
        ) % 2
          ? "#111"
          : "#fff"
    });
  }
}


function groundColor(theme) {

  switch (theme) {

    case "underwater":
      return "#1c829c";

    case "jungle":
      return "#4da957";

    case "sports":
      return "#438c52";

    case "food":
      return "#d48b47";

    case "space":
      return "#282842";

    case "volcano":
      return "#723934";

    case "ice":
      return "#9edff2";

    case "pirate":
      return "#6c5439";

    case "candy":
      return "#dc78b8";

    default:
      return "#596b92";
  }
}


function randomBright() {

  const colors = [
    "#ff4773",
    "#ffd43d",
    "#42d77d",
    "#42b9ff",
    "#a855f7",
    "#ff7a18"
  ];

  return colors[
    Math.floor(
      Math.random() *
      colors.length
    )
  ];
}


/* ========================================================
   THEME DECORATIONS
======================================================== */

function buildTheme(theme) {

  const length =
    game.map.length;


  if (
    theme === "underwater"
  ) {

    for (
      let z = 10;
      z < length;
      z += 18
    ) {

      game.objects.push({

        type: "seaweed",

        x:
          -10 +
          Math.random() * 20,

        y: 0,

        z,

        w: 1,
        h: 4 +
          Math.random() * 4,

        d: 1,

        color:
          "#28bd82"
      });
    }


    for (
      let i = 0;
      i < 20;
      i++
    ) {

      game.objects.push({

        type: "bubble",

        x:
          -11 +
          Math.random() * 22,

        y:
          2 +
          Math.random() * 5,

        z:
          Math.random() *
          length,

        w: .4,
        h: .4,
        d: .4,

        color:
          "#b7f7ff"
      });
    }
  }


  if (
    theme === "jungle"
  ) {

    for (
      let z = 10;
      z < length;
      z += 18
    ) {

      game.objects.push({

        type: "tree",

        x: -11,

        y: 0,

        z,

        w: 2,
        h: 7,
        d: 2,

        color:
          "#68452d"
      });

      game.objects.push({

        type: "tree",

        x: 11,

        y: 0,

        z: z + 8,

        w: 2,
        h: 7,
        d: 2,

        color:
          "#68452d"
      });
    }
  }


  if (
    theme === "sports"
  ) {

    for (
      let z = 20;
      z < length;
      z += 45
    ) {

      game.objects.push({

        type: "sports",
        x: -9,
        y: 0,
        z,

        w: 1,
        h: 6,
        d: 1,

        color:
          "#ffffff"
      });

      game.objects.push({

        type: "sports",
        x: 9,
        y: 0,
        z,

        w: 1,
        h: 6,
        d: 1,

        color:
          "#ffffff"
      });
    }
  }


  if (
    theme === "food"
  ) {

    const food =
      ["🍕", "🍔", "🌭", "🍩"];

    for (
      let i = 0;
      i < 18;
      i++
    ) {

      game.objects.push({

        type: "text",

        text:
          food[
            i %
            food.length
          ],

        x:
          -10 +
          Math.random() * 20,

        y:
          2 +
          Math.random() * 4,

        z:
          10 +
          Math.random() *
          (length - 20)
      });
    }
  }


  if (
    theme === "space"
  ) {

    for (
      let i = 0;
      i < 20;
      i++
    ) {

      game.objects.push({

        type: "star",

        x:
          -12 +
          Math.random() * 24,

        y:
          3 +
          Math.random() * 8,

        z:
          Math.random() *
          length
      });
    }
  }


  if (
    theme === "volcano"
  ) {

    for (
      let z = 10;
      z < length;
      z += 20
    ) {

      game.objects.push({

        type: "lava",

        x:
          -10 +
          Math.random() * 20,

        y: 0,

        z,

        w: 3,
        h: .2,
        d: 4,

        color:
          "#ff5a2e"
      });
    }
  }


  if (
    theme === "ice"
  ) {

    for (
      let i = 0;
      i < 20;
      i++
    ) {

      game.objects.push({

        type: "ice",

        x:
          -10 +
          Math.random() * 20,

        y: 0,

        z:
          Math.random() *
          length,

        w: 2,
        h: 3,
        d: 2,

        color:
          "#b8f2ff"
      });
    }
  }


  if (
    theme === "pirate"
  ) {

    for (
      let z = 15;
      z < length;
      z += 35
    ) {

      game.objects.push({

        type: "mast",

        x:
          -9,

        y: 0,

        z,

        w: 1,
        h: 8,
        d: 1,

        color:
          "#4d2e20"
      });
    }
  }


  if (
    theme === "candy"
  ) {

    for (
      let i = 0;
      i < 20;
      i++
    ) {

      game.objects.push({

        type: "candy",

        x:
          -10 +
          Math.random() * 20,

        y: 0,

        z:
          Math.random() *
          length,

        w: 2,
        h: 2,
        d: 2,

        color:
          randomBright()
      });
    }
  }
}


/* ========================================================
   BOTS
======================================================== */

function createBots() {

  game.bots = [];

  for (
    let i = 0;
    i < game.players - 1;
    i++
  ) {

    game.bots.push({

      x:
        -9 +
        (i % 9) * 2.2,

      y: 1,

      z:
        -7 -
        Math.floor(i / 9) * 2,

      speed:
        6.3 +
        Math.random() * 2.4 +
        game.round * .2,

      color:
        randomBright(),

      skin:
        SKINS[
          Math.floor(
            Math.random() *
            SKINS.length
          )
        ],

      alive: true,

      finished: false,

      jumpTimer:
        Math.random() * 4,

      lane:
        -9 +
        (i % 9) * 2.2,

      phase:
        Math.random() * 10
    });
  }
}


function updateBots(dt) {

  for (
    const bot of game.bots
  ) {

    if (!bot.alive)
      continue;

    bot.jumpTimer -=
      dt;

    if (
      bot.jumpTimer <= 0
    ) {

      bot.jumpTimer =
        1.5 +
        Math.random() * 3;

      bot.vy =
        8 +
        Math.random() * 3;
    }


    bot.z +=
      bot.speed * dt;


    bot.x +=
      Math.sin(
        game.timer * 1.5 +
        bot.phase
      ) *
      dt *
      1.5;


    // obstacle avoidance

    for (
      const o of game.obstacles
    ) {

      if (
        Math.abs(
          bot.z - o.z
        ) < 3 &&
        Math.abs(
          bot.x - o.x
        ) < 3
      ) {

        bot.x +=
          bot.x > o.x
            ? 3
            : -3;
      }
    }


    bot.x =
      Math.max(
        -10.5,
        Math.min(
          10.5,
          bot.x
        )
      );


    if (
      bot.z >
      game.map.length - 7
    ) {

      bot.finished =
        true;
    }
  }
}


/* ========================================================
   PLAYER PHYSICS
======================================================== */

function updatePlayer(dt) {

  const p =
    game.player;

  if (!p.alive)
    return;

  let x = 0;
  let z = 0;

  if (
    game.keys.a ||
    game.keys.arrowleft
  )
    x--;

  if (
    game.keys.d ||
    game.keys.arrowright
  )
    x++;

  if (
    game.keys.w ||
    game.keys.arrowup
  )
    z++;

  if (
    game.keys.s ||
    game.keys.arrowdown
  )
    z--;


  const length =
    Math.sqrt(
      x * x +
      z * z
    ) || 1;

  x /= length;
  z /= length;


  p.vx +=
    x *
    24 *
    dt;

  p.vz +=
    z *
    24 *
    dt;


  const max =
    p.speed;


  const horizontal =
    Math.sqrt(
      p.vx * p.vx +
      p.vz * p.vz
    );


  if (
    horizontal > max
  ) {

    const scale =
      max / horizontal;

    p.vx *=
      scale;

    p.vz *=
      scale;
  }


  p.vx *=
    Math.pow(.001, dt);

  p.vz *=
    Math.pow(.001, dt);


  p.vy -=
    26 * dt;


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

    p.grounded =
      true;
  }


  if (
    Math.abs(p.x) >
    11
  ) {

    p.x =
      Math.sign(p.x) *
      11;

    p.vx *=
      -.4;
  }


  // bounce platforms

  for (
    const o of game.objects
  ) {

    if (
      o.bounce &&
      Math.abs(
        p.x - o.x
      ) <
        o.w / 2 &&
      Math.abs(
        p.z - o.z
      ) <
        o.d / 2 &&
      p.y <= 2
    ) {

      p.vy =
        14;

      p.grounded =
        false;
    }
  }


  checkObstacles();


  if (
    p.y < -5
  ) {

    p.x = 0;
    p.y = 1;
    p.z =
      Math.max(
        0,
        p.checkpoint
      );

    p.vx = 0;
    p.vy = 0;
    p.vz = 0;

    toast(
      "💥 You fell! Checkpoint!"
    );
  }


  if (
    p.z >=
    game.map.length - 7
  ) {

    finishPlayer();
  }
}


/* ========================================================
   OBSTACLES
======================================================== */

function updateObstacles(dt) {

  for (
    const o of game.obstacles
  ) {

    if (
      o.type ===
      "spinner"
    ) {

      o.angle +=
        o.speed * dt;
    }

    if (
      o.type ===
      "bumper"
    ) {

      o.x =
        Math.sin(
          game.timer * 1.3 +
          o.phase
        ) *
        8;
    }
  }
}


function checkObstacles() {

  const p =
    game.player;


  for (
    const o of game.obstacles
  ) {

    if (
      o.type ===
      "spinner"
    ) {

      const distanceZ =
        Math.abs(
          p.z - o.z
        );

      if (
        distanceZ < 2
      ) {

        const endX =
          o.x +
          Math.cos(
            o.angle
          ) *
          o.length;

        const endZ =
          o.z +
          Math.sin(
            o.angle
          ) *
          o.length;

        const dx =
          p.x - endX;

        const dz =
          p.z - endZ;

        const distance =
          Math.sqrt(
            dx * dx +
            dz * dz
          );

        if (
          distance < 2
        ) {

          p.vx +=
            Math.cos(
              o.angle
            ) * 7;

          p.vz +=
            Math.sin(
              o.angle
            ) * 7;

          p.vy = 6;
        }
      }
    }


    if (
      o.type ===
      "bumper"
    ) {

      const dx =
        p.x - o.x;

      const dz =
        p.z - o.z;

      const distance =
        Math.sqrt(
          dx * dx +
          dz * dz
        );

      if (
        distance <
        o.radius + .7
      ) {

        const len =
          Math.sqrt(
            dx * dx +
            dz * dz
          ) || 1;

        p.vx +=
          dx / len * 8;

        p.vz +=
          dz / len * 8;

        p.vy = 6;
      }
    }
  }
}


/* ========================================================
   FINISH / ELIMINATION
======================================================== */

function finishPlayer() {

  if (
    game.state !==
    "playing"
  )
    return;

  game.player.finished =
    true;

  const reward =
    150 +
    game.round * 100;

  addXP(reward);

  let remaining;

  if (
    game.round === 1
  )
    remaining = 14;

  else if (
    game.round === 2
  )
    remaining = 9;

  else if (
    game.round === 3
  )
    remaining = 4;

  else
    remaining = 1;


  if (
    game.round === 4
  ) {

    win();

    return;
  }


  game.players =
    Math.min(
      game.players,
      remaining
    );


  showResult(
    true,
    reward,
    remaining
  );
}


function eliminate() {

  if (
    game.state !==
    "playing"
  )
    return;

  game.player.alive =
    false;

  addXP(50);

  showResult(
    false,
    50,
    game.players
  );
}


/* ========================================================
   ROUND RESULT
======================================================== */

function showResult(
  qualified,
  xp,
  remaining
) {

  game.state =
    "result";

  hide("hud");

  show("result");

  $("resultIcon").textContent =
    qualified
      ? "🏃"
      : "💥";

  $("resultTitle").textContent =
    qualified
      ? "QUALIFIED!"
      : "ELIMINATED!";

  $("resultDescription").textContent =
    qualified
      ? `You survived Round ${game.round}!`
      : "You were eliminated!";

  $("resultXP").textContent =
    `+${xp}`;

  $("remainingText").textContent =
    remaining;


  $("continueBtn").textContent =
    qualified
      ? "NEXT ROUND"
      : "TRY AGAIN";


  $("continueBtn").onclick =
    () => {

      if (
        qualified
      ) {

        game.round++;

        hide("result");

        show("hud");

        game.state =
          "playing";

        beginRound();

      } else {

        startMatch();
      }
    };
}


/* ========================================================
   WIN
======================================================== */

function win() {

  game.state =
    "winner";

  data.crowns++;

  data.coins +=
    500;

  addXP(1000);

  save();

  hide("hud");

  show("winner");

  updateProfile();
}


/* ========================================================
   CAMERA
======================================================== */

function updateCamera() {

  const p =
    game.player;

  gfx.camera.x =
    p.x * .35;

  gfx.camera.y =
    7 +
    p.y * .15;

  gfx.camera.z =
    p.z - 15;

  gfx.camera.targetX =
    p.x * .1;

  gfx.camera.targetY =
    1;

  gfx.camera.targetZ =
    p.z + 15;
}


/* ========================================================
   DRAWING
======================================================== */

function drawSky() {

  let top =
    "#62c8ff";

  let bottom =
    "#d8f6ff";


  switch (
    game.map.theme
  ) {

    case "underwater":
      top = "#063e69";
      bottom = "#18b6b1";
      break;

    case "jungle":
      top = "#50d3ff";
      bottom = "#b7efbc";
      break;

    case "sports":
      top = "#65caff";
      bottom = "#dff6ff";
      break;

    case "food":
      top = "#ff9a65";
      bottom = "#ffe1a8";
      break;

    case "space":
      top = "#050516";
      bottom = "#24244e";
      break;

    case "volcano":
      top = "#220d17";
      bottom = "#ef6538";
      break;

    case "ice":
      top = "#55b9ff";
      bottom = "#e9ffff";
      break;

    case "pirate":
      top = "#2576a2";
      bottom = "#9cdded";
      break;

    case "candy":
      top = "#ff9ccf";
      bottom = "#ffd6ef";
      break;
  }


  const gradient =
    gfx.ctx.createLinearGradient(
      0,
      0,
      0,
      gfx.height
    );

  gradient.addColorStop(
    0,
    top
  );

  gradient.addColorStop(
    1,
    bottom
  );

  gfx.ctx.fillStyle =
    gradient;

  gfx.ctx.fillRect(
    0,
    0,
    gfx.width,
    gfx.height
  );
}


function drawWorld() {

  drawSky();

  drawObjects();

  drawObstacles();

  drawBots();

  drawPlayer();
}


function drawObjects() {

  const objects =
    [...game.objects];

  objects.sort(
    (a, b) =>
      b.z - a.z
  );


  for (
    const o of objects
  ) {

    if (
      o.type ===
      "text"
    ) {

      gfx.text(
        o.text,
        o.x,
        o.y,
        o.z,
        28
      );

      continue;
    }


    if (
      o.type ===
      "star"
    ) {

      gfx.sphere(
        o.x,
        o.y,
        o.z,
        .25,
        "#ffffff"
      );

      continue;
    }


    gfx.box(
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

  for (
    const o of
    game.obstacles
  ) {

    if (
      o.type ===
      "spinner"
    ) {

      const a =
        o.angle;

      const x1 =
        o.x +
        Math.cos(a) *
        o.length;

      const z1 =
        o.z +
        Math.sin(a) *
        o.length;

      const x2 =
        o.x -
        Math.cos(a) *
        o.length;

      const z2 =
        o.z -
        Math.sin(a) *
        o.length;


      gfx.line(
        o.x,
        o.y,
        o.z,
        x1,
        o.y,
        z1,
        "#ff4773",
        18
      );

      gfx.line(
        o.x,
        o.y,
        o.z,
        x2,
        o.y,
        z2,
        "#ffd43d",
        18
      );


      gfx.sphere(
        o.x,
        o.y,
        o.z,
        1,
        "#ffffff"
      );
    }


    if (
      o.type ===
      "bumper"
    ) {

      gfx.sphere(
        o.x,
        o.y,
        o.z,
        o.radius,
        "#ff4773"
      );
    }
  }
}


/* ========================================================
   BEANS
======================================================== */

function drawPlayer() {

  const skin =
    getSkin();

  drawBean(
    game.player.x,
    game.player.y,
    game.player.z,
    skin,
    data.face,
    data.hat
  );
}


function drawBots() {

  for (
    const bot of
    game.bots
  ) {

    if (!bot.alive)
      continue;

    drawBean(
      bot.x,
      bot.y,
      bot.z,
      bot.skin,
      "happy",
      "none"
    );
  }
}


function drawBean(
  x,
  y,
  z,
  skin,
  face,
  hat
) {

  const color =
    skin.color;


  // shadow

  gfx.sphere(
    x,
    .02,
    z,
    .9,
    "#182030"
  );


  // body

  gfx.sphere(
    x,
    y + .65,
    z,
    .9,
    color
  );


  // head

  gfx.sphere(
    x,
    y + 1.3,
    z,
    .78,
    color
  );


  // eyes

  gfx.sphere(
    x - .26,
    y + 1.5,
    z - .67,
    .12,
    "#111111"
  );

  gfx.sphere(
    x + .26,
    y + 1.5,
    z - .67,
    .12,
    "#111111"
  );


  if (
    face ===
    "surprised"
  ) {

    gfx.sphere(
      x,
      y + 1.25,
      z - .7,
      .16,
      "#111"
    );
  }


  if (
    face ===
    "cool"
  ) {

    gfx.box(
      x,
      y + 1.55,
      z - .72,
      .95,
      .17,
      .1,
      "#111111"
    );
  }


  if (
    face ===
    "sleepy"
  ) {

    gfx.box(
      x,
      y + 1.52,
      z - .72,
      .65,
      .06,
      .08,
      "#111111"
    );
  }


  // hats

  if (
    hat ===
    "cap"
  ) {

    gfx.box(
      x,
      y + 1.95,
      z,
      1.2,
      .3,
      1,
      "#2878ff"
    );
  }


  if (
    hat ===
    "helmet"
  ) {

    gfx.sphere(
      x,
      y + 1.92,
      z,
      .82,
      "#d8e4ef"
    );
  }


  if (
    hat ===
    "crown"
  ) {

    gfx.text(
      "👑",
      x,
      y + 2.45,
      z,
      24
    );
  }


  if (
    hat ===
    "cowboy"
  ) {

    gfx.box(
      x,
      y + 2,
      z,
      1.5,
      .18,
      1.2,
      "#8b5a2b"
    );
  }


  // special skin icons above players

  if (
    skin.id !==
    "classic"
  ) {

    gfx.text(
      skin.icon,
      x,
      y + 2.45,
      z,
      18
    );
  }
}


/* ========================================================
   HUD
======================================================== */

function updateHUD() {

  $("roundText").textContent =
    `${game.round} / 4`;

  $("mapName").textContent =
    `${game.map.icon} ${game.map.name}`;

  $("playersText").textContent =
    game.players;
}


function announce(text) {

  $("announcement").textContent =
    text;
}


function updateHUDTimer() {

  const remaining =
    Math.max(
      0,
      Math.ceil(
        game.map.time -
        game.timer
      )
    );

  $("timer").textContent =
    remaining;
}


/* ========================================================
   GAME LOOP
======================================================== */

let last =
  performance.now();


function update(dt) {

  if (
    game.state !==
    "playing"
  )
    return;


  game.timer +=
    dt;


  updatePlayer(dt);

  updateBots(dt);

  updateObstacles(dt);

  updateCamera();

  updateHUDTimer();


  // gradually eliminate bots

  if (
    Math.random() <
    dt * .08
  ) {

    const aliveBots =
      game.bots.filter(
        b => b.alive
      );

    if (
      aliveBots.length >
      3
    ) {

      const victim =
        aliveBots[
          Math.floor(
            Math.random() *
            aliveBots.length
          )
        ];

      victim.alive =
        false;
    }
  }


  // timeout

  if (
    game.timer >=
    game.map.time
  ) {

    if (
      game.map.type ===
      "survival"
    ) {

      finishPlayer();

    } else {

      eliminate();
    }
  }
}


function render() {

  drawWorld();
}


function loop(now) {

  const dt =
    Math.min(
      (now - last) /
      1000,
      .05
    );

  last =
    now;

  update(dt);

  render();

  requestAnimationFrame(
    loop
  );
}


/* ========================================================
   BUTTONS
======================================================== */

$("playBtn").onclick =
  startMatch;


$("shopBtn").onclick =
  () => {

    hide("menu");

    show("shop");

    renderShop();
  };


$("customBtn").onclick =
  () => {

    hide("menu");

    show("custom");

    renderSkins();

    renderPreview();
  };


$("wheelBtn").onclick =
  () => {

    hide("menu");

    show("wheel");

    refreshWheel();
  };


$("closeShop").onclick =
  () => {

    hide("shop");

    show("menu");
  };


$("closeCustom").onclick =
  () => {

    hide("custom");

    show("menu");
  };


$("closeWheel").onclick =
  () => {

    hide("wheel");

    show("menu");
  };


$("spinBtn").onclick =
  spinWheel;


$("againBtn").onclick =
  startMatch;


$("homeBtn").onclick =
  () => {

    hide("winner");

    show("menu");

    game.state =
      "menu";

    updateProfile();
  };


/* Faces */

document.querySelectorAll(
  "[data-face]"
).forEach(
  button => {

    button.onclick =
      () => {

        data.face =
          button.dataset.face;

        save();

        renderPreview();
      };
  }
);


/* Hats */

document.querySelectorAll(
  "[data-hat]"
).forEach(
  button => {

    button.onclick =
      () => {

        data.hat =
          button.dataset.hat;

        save();

        renderPreview();
      };
  }
);


/* Mobile controls */

document.querySelectorAll(
  "#mobileControls [data-key]"
).forEach(
  button => {

    const key =
      button.dataset.key;

    button.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        game.keys[key] =
          true;
      }
    );

    button.addEventListener(
      "pointerup",
      () => {

        game.keys[key] =
          false;
      }
    );

    button.addEventListener(
      "pointerleave",
      () => {

        game.keys[key] =
          false;
      }
    );
  }
);


$("mobileJump").onclick =
  jump;


/* ========================================================
   INITIALIZE
======================================================== */

game.map =
  MAPS[0];

updateCamera();

requestAnimationFrame(
  loop
);
