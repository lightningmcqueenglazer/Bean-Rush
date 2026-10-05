const canvas = document.getElementById("canvas");
const engine = new Mini3D(canvas);

const menu = document.getElementById("menu");
const shop = document.getElementById("shop");
const endScreen = document.getElementById("endScreen");

const playButton = document.getElementById("playButton");
const shopButton = document.getElementById("shopButton");
const shopMenuButton = document.getElementById("shopMenuButton");
const closeShop = document.getElementById("closeShop");
const nextButton = document.getElementById("nextButton");

const roundText = document.getElementById("round");
const playersText = document.getElementById("players");
const xpText = document.getElementById("xp");
const crownText = document.getElementById("crowns");
const progressBar = document.getElementById("progressBar");
const message = document.getElementById("message");

const shopXP = document.getElementById("shopXP");
const itemsDiv = document.getElementById("items");


// -------------------------
// PLAYER
// -------------------------

const player = {

    x: 0,
    y: 0,
    z: 0,

    vx: 0,
    vy: 0,
    vz: 0,

    speed: 0.18,
    jump: 0.32,

    color: "#19d9ff",

    grounded: true,

    progress: 0
};


// -------------------------
// GAME DATA
// -------------------------

let gameRunning = false;

let round = 1;

let playersRemaining = 20;

let xp = Number(localStorage.getItem("beanXP")) || 0;

let crowns = Number(localStorage.getItem("beanCrowns")) || 0;

let currentSkin =
    localStorage.getItem("beanSkin") || "blue";

let keys = {};

let obstacles = [];

let bots = [];

let finishZ = 100;


// -------------------------
// SKINS
// -------------------------

const skins = [

    {
        id: "blue",
        name: "Blue Bean",
        price: 0,
        color: "#19d9ff"
    },

    {
        id: "pink",
        name: "Bubblegum Bean",
        price: 500,
        color: "#ff4fc3"
    },

    {
        id: "green",
        name: "Lime Bean",
        price: 1000,
        color: "#6cff4f"
    },

    {
        id: "orange",
        name: "Fire Bean",
        price: 2500,
        color: "#ff8c32"
    },

    {
        id: "purple",
        name: "Galaxy Bean",
        price: 5000,
        color: "#a855ff"
    },

    {
        id: "gold",
        name: "Golden Bean",
        price: 15000,
        color: "#ffd700"
    }
];


// -------------------------
// SHOP
// -------------------------

function renderShop() {

    shopXP.textContent = xp;

    itemsDiv.innerHTML = "";

    skins.forEach(skin => {

        const item = document.createElement("div");

        item.className = "shopItem";

        const owned =
            skin.price === 0 ||
            localStorage.getItem("skin_" + skin.id) === "true";

        item.innerHTML = `

            <div
                class="skinPreview"
                style="background:${skin.color}">
            </div>

            <div class="skinInfo">
                <strong>${skin.name}</strong>
                <span>
                    ${owned ? "Owned" : skin.price + " XP"}
                </span>
            </div>

            <button class="buyButton">
                ${currentSkin === skin.id
                    ? "EQUIPPED"
                    : owned
                        ? "EQUIP"
                        : "BUY"}
            </button>
        `;

        const button = item.querySelector("button");

        button.onclick = () => {

            if (owned) {

                currentSkin = skin.id;

                localStorage.setItem(
                    "beanSkin",
                    skin.id
                );

                player.color = skin.color;

                renderShop();

                return;
            }

            if (xp >= skin.price) {

                xp -= skin.price;

                localStorage.setItem(
                    "beanXP",
                    xp
                );

                localStorage.setItem(
                    "skin_" + skin.id,
                    "true"
                );

                currentSkin = skin.id;

                localStorage.setItem(
                    "beanSkin",
                    skin.id
                );

                player.color = skin.color;

                updateHUD();

                renderShop();
            }
        };

        itemsDiv.appendChild(item);
    });
}


// -------------------------
// XP
// -------------------------

function addXP(amount) {

    xp += amount;

    localStorage.setItem(
        "beanXP",
        xp
    );

    updateHUD();
}


// -------------------------
// HUD
// -------------------------

function updateHUD() {

    roundText.textContent =
        `Round ${round}/4`;

    playersText.textContent =
        `Players: ${playersRemaining}`;

    xpText.textContent =
        `XP: ${xp}`;

    crownText.textContent =
        `👑 ${crowns}`;

    shopXP.textContent = xp;
}


// -------------------------
// INPUT
// -------------------------

window.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (e.code === "Space")
        jump();
});

window.addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;
});


// -------------------------
// PLAYER MOVEMENT
// -------------------------

function updatePlayer() {

    if (!gameRunning)
        return;

    let forward = 0;
    let sideways = 0;

    if (keys["w"] || keys["arrowup"])
        forward = 1;

    if (keys["s"] || keys["arrowdown"])
        forward = -1;

    if (keys["a"] || keys["arrowleft"])
        sideways = -1;

    if (keys["d"] || keys["arrowright"])
        sideways = 1;

    player.vz += forward * 0.025;
    player.vx += sideways * 0.025;

    player.vz *= 0.88;
    player.vx *= 0.80;

    player.vz = Math.max(
        -0.25,
        Math.min(.25, player.vz)
    );

    player.vx = Math.max(
        -0.25,
        Math.min(.25, player.vx)
    );

    player.z += player.vz;
    player.x += player.vx;

    player.x = Math.max(
        -7,
        Math.min(7, player.x)
    );

    player.y += player.vy;

    player.vy -= 0.018;

    if (player.y <= 0) {

        player.y = 0;
        player.vy = 0;
        player.grounded = true;
    }

    player.progress =
        Math.max(
            0,
            Math.min(
                100,
                player.z / finishZ * 100
            )
        );

    progressBar.style.width =
        player.progress + "%";
}


// -------------------------
// JUMP
// -------------------------

function jump() {

    if (!player.grounded)
        return;

    player.vy = player.jump;

    player.grounded = false;
}


// -------------------------
// BOTS
// -------------------------

function createBots() {

    bots = [];

    for (let i = 0; i < playersRemaining - 1; i++) {

        bots.push({

            x: Math.random() * 12 - 6,

            y: 0,

            z: Math.random() * -10,

            speed:
                .08 +
                Math.random() * .08,

            color:
                skins[
                    Math.floor(
                        Math.random() * skins.length
                    )
                ].color,

            alive: true
        });
    }
}


function updateBots() {

    bots.forEach(bot => {

        if (!bot.alive)
            return;

        bot.z += bot.speed;

        bot.x +=
            Math.sin(
                bot.z * .08
            ) * .015;

        if (Math.random() < .003) {

            if (Math.random() < .5)
                bot.alive = false;
        }
    });
}


// -------------------------
// OBSTACLES
// -------------------------

function createCourse() {

    obstacles = [];

    // Main platforms

    for (
        let z = 0;
        z < finishZ;
        z += 10
    ) {

        obstacles.push({

            x: 0,

            y: -0.4,

            z: z,

            w: 16,

            h: .5,

            d: 10,

            color:
                round === 1
                    ? "#43d9ff"
                    : round === 2
                        ? "#ff4fc3"
                        : round === 3
                            ? "#a855ff"
                            : "#ffcc22"
        });
    }


    // Spinning obstacles

    for (
        let z = 15;
        z < finishZ;
        z += 20
    ) {

        obstacles.push({

            type: "spinner",

            x: 0,

            y: .6,

            z: z,

            rotation: Math.random() * 6,

            color: "#ff4d4d"
        });
    }


    // Blocks

    for (
        let z = 10;
        z < finishZ;
        z += 25
    ) {

        obstacles.push({

            type: "block",

            x:
                Math.random() * 8 - 4,

            y: 0,

            z: z + 4,

            w: 2,

            h: 2,

            d: 2,

            color: "#ffe14d"
        });
    }
}


// -------------------------
// COLLISION
// -------------------------

function checkObstacles() {

    for (const obstacle of obstacles) {

        if (!obstacle.type)
            continue;

        const distance =
            Math.sqrt(
                Math.pow(
                    player.x - obstacle.x,
                    2
                ) +
                Math.pow(
                    player.z - obstacle.z,
                    2
                )
            );

        if (distance < 1.8) {

            if (obstacle.type === "spinner") {

                player.vz -= .15;

                player.vx +=
                    Math.random() > .5
                        ? .12
                        : -.12;
            }

            if (obstacle.type === "block") {

                player.vz = -.15;
            }
        }
    }
}


// -------------------------
// ROUND END
// -------------------------

function checkRoundEnd() {

    if (player.z >= finishZ) {

        qualify();
    }

    if (player.z < -15) {

        eliminate();
    }
}


function qualify() {

    gameRunning = false;

    addXP(
        500 * round
    );

    playersRemaining =
        Math.max(
            2,
            Math.floor(
                playersRemaining * .45
            )
        );

    updateHUD();

    if (round === 4) {

        winGame();

    } else {

        document.getElementById(
            "endTitle"
        ).textContent =
            "QUALIFIED! 🎉";

        document.getElementById(
            "endText"
        ).textContent =
            `You survived Round ${round}! +${500 * round} XP`;

        nextButton.textContent =
            "NEXT ROUND";

        endScreen.classList.remove(
            "hidden"
        );
    }
}


function eliminate() {

    gameRunning = false;

    document.getElementById(
        "endTitle"
    ).textContent =
        "ELIMINATED!";

    document.getElementById(
        "endText"
    ).textContent =
        "You fell off the course. Try again!";

    nextButton.textContent =
        "TRY AGAIN";

    endScreen.classList.remove(
        "hidden"
    );
}


// -------------------------
// WIN
// -------------------------

function winGame() {

    crowns++;

    localStorage.setItem(
        "beanCrowns",
        crowns
    );

    addXP(5000);

    updateHUD();

    document.getElementById(
        "endTitle"
    ).textContent =
        "👑 YOU WON! 👑";

    document.getElementById(
        "endText"
    ).textContent =
        "You conquered the final round and earned a crown! +5000 XP";

    nextButton.textContent =
        "PLAY AGAIN";

    endScreen.classList.remove(
        "hidden"
    );
}


// -------------------------
// NEW ROUND
// -------------------------

function startRound() {

    endScreen.classList.add(
        "hidden"
    );

    player.x = 0;
    player.y = 0;
    player.z = 0;

    player.vx = 0;
    player.vy = 0;
    player.vz = 0;

    player.color =
        skins.find(
            s => s.id === currentSkin
        ).color;

    createCourse();

    createBots();

    gameRunning = true;

    message.textContent =
        round === 4
            ? "FINAL ROUND!"
            : `ROUND ${round}`;

    updateHUD();
}


// -------------------------
// NEW GAME
// -------------------------

function newGame() {

    round = 1;

    playersRemaining = 20;

    menu.classList.add(
        "hidden"
    );

    startRound();
}


// -------------------------
// NEXT ROUND
// -------------------------

nextButton.onclick = () => {

    if (
        nextButton.textContent ===
        "TRY AGAIN"
    ) {

        startRound();

        return;
    }

    if (
        nextButton.textContent ===
        "PLAY AGAIN"
    ) {

        newGame();

        return;
    }

    round++;

    startRound();
};


// -------------------------
// SHOP BUTTONS
// -------------------------

function openShop() {

    renderShop();

    shop.classList.remove(
        "hidden"
    );
}

shopButton.onclick = openShop;

shopMenuButton.onclick = openShop;

closeShop.onclick = () => {

    shop.classList.add(
        "hidden"
    );
};


// -------------------------
// PLAY BUTTON
// -------------------------

playButton.onclick = newGame;


// -------------------------
// DRAW
// -------------------------

function drawWorld() {

    engine.clear("#75dcff");

    // Sky

    engine.ctx.fillStyle =
        "#75dcff";

    engine.ctx.fillRect(
        0,
        0,
        engine.width,
        engine.height
    );


    // Clouds

    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const x =
            Math.sin(i * 10) * 20;

        const z =
            20 + i * 25;

        const p =
            engine.project(
                x,
                8,
                z
            );

        if (!p)
            continue;

        engine.ctx.beginPath();

        engine.ctx.arc(
            p.x,
            p.y,
            30,
            0,
            Math.PI * 2
        );

        engine.ctx.fillStyle =
            "rgba(255,255,255,.7)";

        engine.ctx.fill();
    }


    // Ground

    obstacles.forEach(
        obstacle => {

            if (!obstacle.type) {

                engine.cube(
                    obstacle.x,
                    obstacle.y,
                    obstacle.z,
                    obstacle.w,
                    obstacle.h,
                    obstacle.d,
                    obstacle.color
                );
            }
        }
    );


    // Obstacles

    obstacles.forEach(
        obstacle => {

            if (
                obstacle.type ===
                "block"
            ) {

                engine.cube(
                    obstacle.x,
                    obstacle.y,
                    obstacle.z,
                    obstacle.w,
                    obstacle.h,
                    obstacle.d,
                    obstacle.color
                );
            }

            if (
                obstacle.type ===
                "spinner"
            ) {

                const angle =
                    performance.now() *
                    .003;

                const x =
                    obstacle.x +
                    Math.cos(angle) * 3;

                const z =
                    obstacle.z +
                    Math.sin(angle) * 3;

                engine.cube(
                    x,
                    obstacle.y,
                    z,
                    5,
                    .5,
                    .5,
                    obstacle.color
                );
            }
        }
    );


    // Finish line

    for (
        let x = -8;
        x <= 8;
        x += 2
    ) {

        engine.cube(
            x,
            .1,
            finishZ,
            2,
            .2,
            2,
            x % 4 === 0
                ? "#ffffff"
                : "#222222"
        );
    }


    // Bots

    bots.forEach(bot => {

        if (!bot.alive)
            return;

        engine.sphere(
            bot.x,
            1,
            bot.z,
            .65,
            bot.color
        );

        engine.sphere(
            bot.x,
            1.6,
            bot.z,
            .5,
            bot.color
        );
    });


    // Player

    engine.sphere(
        player.x,
        .9 + player.y,
        player.z,
        .7,
        player.color
    );

    engine.sphere(
        player.x,
        1.55 + player.y,
        player.z,
        .55,
        player.color
    );

    // Eyes

    const eyeOffset = .22;

    engine.sphere(
        player.x - eyeOffset,
        1.7 + player.y,
        player.z - .45,
        .09,
        "#111111"
    );

    engine.sphere(
        player.x + eyeOffset,
        1.7 + player.y,
        player.z - .45,
        .09,
        "#111111"
    );
}


// -------------------------
// CAMERA
// -------------------------

function updateCamera() {

    engine.camera.x +=
        (player.x - engine.camera.x)
        * .08;

    engine.camera.y = 6;

    engine.camera.z =
        player.z - 12;
}


// -------------------------
// GAME LOOP
// -------------------------

function gameLoop() {

    updatePlayer();

    updateBots();

    checkObstacles();

    checkRoundEnd();

    updateCamera();

    drawWorld();

    requestAnimationFrame(
        gameLoop
    );
}


// -------------------------
// START
// -------------------------

player.color =
    skins.find(
        s => s.id === currentSkin
    ).color;

updateHUD();

gameLoop();
