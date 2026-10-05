// =====================================================
// BEAN RUSH 3D
// game.js
// =====================================================

// -------------------------
// GET HTML ELEMENTS
// -------------------------

const canvas = document.getElementById("canvas");

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
// CHECK THAT HTML EXISTS
// -------------------------

if (!canvas) {
    console.error("Canvas was not found.");
}

if (!playButton) {
    console.error("Play button was not found.");
}


// -------------------------
// 3D ENGINE
// -------------------------

const engine = new Mini3D(canvas);


// -------------------------
// GAME VARIABLES
// -------------------------

let gameRunning = false;

let round = 1;

let playersRemaining = 20;

let finishZ = 100;

let obstacles = [];

let bots = [];

let keys = {};


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

    grounded: true,

    progress: 0,

    color: "#19d9ff"
};


// -------------------------
// XP / CROWNS
// -------------------------

let xp =
    Number(localStorage.getItem("beanXP")) || 0;

let crowns =
    Number(localStorage.getItem("beanCrowns")) || 0;

let currentSkin =
    localStorage.getItem("beanSkin") || "blue";


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


// =====================================================
// HUD
// =====================================================

function updateHUD() {

    if (roundText) {
        roundText.textContent =
            `Round ${round}/4`;
    }

    if (playersText) {
        playersText.textContent =
            `Players: ${playersRemaining}`;
    }

    if (xpText) {
        xpText.textContent =
            `XP: ${xp}`;
    }

    if (crownText) {
        crownText.textContent =
            `👑 ${crowns}`;
    }

    if (shopXP) {
        shopXP.textContent = xp;
    }
}


// =====================================================
// XP
// =====================================================

function addXP(amount) {

    xp += amount;

    localStorage.setItem(
        "beanXP",
        xp
    );

    updateHUD();
}


// =====================================================
// INPUT
// =====================================================

window.addEventListener("keydown", function(event) {

    keys[event.key.toLowerCase()] = true;

    if (event.code === "Space") {

        event.preventDefault();

        jump();
    }

});


window.addEventListener("keyup", function(event) {

    keys[event.key.toLowerCase()] = false;

});


// =====================================================
// PLAYER MOVEMENT
// =====================================================

function updatePlayer() {

    if (!gameRunning) {
        return;
    }

    let forward = 0;

    let sideways = 0;


    // Forward

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        forward = 1;
    }


    // Backward

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        forward = -1;
    }


    // Left

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        sideways = -1;
    }


    // Right

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        sideways = 1;
    }


    // Movement

    player.vz +=
        forward * 0.025;

    player.vx +=
        sideways * 0.025;


    // Friction

    player.vz *= 0.88;

    player.vx *= 0.80;


    // Speed limit

    player.vz =
        Math.max(
            -0.25,
            Math.min(
                0.25,
                player.vz
            )
        );

    player.vx =
        Math.max(
            -0.25,
            Math.min(
                0.25,
                player.vx
            )
        );


    // Position

    player.z += player.vz;

    player.x += player.vx;


    // Keep player on course

    player.x =
        Math.max(
            -7,
            Math.min(
                7,
                player.x
            )
        );


    // Gravity

    player.y += player.vy;

    player.vy -= 0.018;


    // Ground collision

    if (player.y <= 0) {

        player.y = 0;

        player.vy = 0;

        player.grounded = true;
    }


    // Progress

    player.progress =
        Math.max(
            0,
            Math.min(
                100,
                (player.z / finishZ) * 100
            )
        );


    if (progressBar) {

        progressBar.style.width =
            player.progress + "%";
    }

}


// =====================================================
// JUMP
// =====================================================

function jump() {

    if (!gameRunning) {
        return;
    }

    if (!player.grounded) {
        return;
    }

    player.vy = player.jump;

    player.grounded = false;
}


// =====================================================
// CREATE BOTS
// =====================================================

function createBots() {

    bots = [];


    for (
        let i = 0;
        i < playersRemaining - 1;
        i++
    ) {

        const randomSkin =
            skins[
                Math.floor(
                    Math.random() *
                    skins.length
                )
            ];


        bots.push({

            x:
                Math.random() * 12 - 6,

            y: 0,

            z:
                Math.random() * -10,

            speed:
                0.08 +
                Math.random() * 0.08,

            color:
                randomSkin.color,

            alive: true
        });

    }

}


// =====================================================
// UPDATE BOTS
// =====================================================

function updateBots() {

    bots.forEach(function(bot) {

        if (!bot.alive) {
            return;
        }


        bot.z += bot.speed;


        bot.x +=
            Math.sin(
                bot.z * 0.08
            ) * 0.015;


        // Small random chance of falling

        if (
            Math.random() < 0.002
        ) {

            bot.alive = false;
        }

    });

}


// =====================================================
// CREATE COURSE
// =====================================================

function createCourse() {

    obstacles = [];


    // Main course platforms

    for (
        let z = 0;
        z < finishZ;
        z += 10
    ) {

        let platformColor;


        if (round === 1) {

            platformColor =
                "#43d9ff";

        } else if (round === 2) {

            platformColor =
                "#ff4fc3";

        } else if (round === 3) {

            platformColor =
                "#a855ff";

        } else {

            platformColor =
                "#ffcc22";
        }


        obstacles.push({

            x: 0,

            y: -0.4,

            z: z,

            w: 16,

            h: 0.5,

            d: 10,

            color: platformColor

        });

    }


    // Spinning bars

    for (
        let z = 15;
        z < finishZ;
        z += 20
    ) {

        obstacles.push({

            type: "spinner",

            x: 0,

            y: 0.6,

            z: z,

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


// =====================================================
// OBSTACLE COLLISION
// =====================================================

function checkObstacles() {

    obstacles.forEach(function(obstacle) {

        if (!obstacle.type) {
            return;
        }


        const distance =
            Math.sqrt(

                Math.pow(
                    player.x -
                    obstacle.x,
                    2
                )

                +

                Math.pow(
                    player.z -
                    obstacle.z,
                    2
                )

            );


        if (distance < 1.8) {

            // Spinner

            if (
                obstacle.type ===
                "spinner"
            ) {

                player.vz -= 0.15;

                player.vx +=
                    Math.random() > 0.5
                        ? 0.12
                        : -0.12;
            }


            // Block

            if (
                obstacle.type ===
                "block"
            ) {

                player.vz = -0.15;
            }

        }

    });

}


// =====================================================
// CHECK ROUND
// =====================================================

function checkRoundEnd() {

    if (!gameRunning) {
        return;
    }


    // Reached finish

    if (
        player.z >= finishZ
    ) {

        qualify();

        return;
    }


    // Fell far behind

    if (
        player.z < -15
    ) {

        eliminate();

    }

}


// =====================================================
// QUALIFY
// =====================================================

function qualify() {

    gameRunning = false;


    const reward =
        500 * round;

    addXP(reward);


    playersRemaining =
        Math.max(
            2,
            Math.floor(
                playersRemaining *
                0.45
            )
        );


    updateHUD();


    // Final

    if (round === 4) {

        winGame();

        return;
    }


    document.getElementById(
        "endTitle"
    ).textContent =
        "QUALIFIED! 🎉";


    document.getElementById(
        "endText"
    ).textContent =
        `You survived Round ${round}! +${reward} XP`;


    nextButton.textContent =
        "NEXT ROUND";


    endScreen.classList.remove(
        "hidden"
    );

}


// =====================================================
// ELIMINATION
// =====================================================

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


// =====================================================
// WIN
// =====================================================

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


// =====================================================
// START ROUND
// =====================================================

function startRound() {

    console.log(
        "Starting round:",
        round
    );


    endScreen.classList.add(
        "hidden"
    );


    // Reset player

    player.x = 0;

    player.y = 0;

    player.z = 0;

    player.vx = 0;

    player.vy = 0;

    player.vz = 0;

    player.progress = 0;


    // Set skin

    const selectedSkin =
        skins.find(
            skin =>
                skin.id ===
                currentSkin
        );


    if (selectedSkin) {

        player.color =
            selectedSkin.color;

    }


    // Create map

    createCourse();


    // Create other players

    createBots();


    // Start game

    gameRunning = true;


    if (round === 4) {

        message.textContent =
            "👑 FINAL ROUND!";

    } else {

        message.textContent =
            `ROUND ${round}`;
    }


    updateHUD();

}


// =====================================================
// START ENTIRE GAME
// =====================================================

function newGame() {

    console.log(
        "Starting new game..."
    );


    round = 1;

    playersRemaining = 20;


    menu.classList.add(
        "hidden"
    );


    startRound();

}


// =====================================================
// PLAY BUTTON
// =====================================================

if (playButton) {

    playButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            console.log(
                "PLAY BUTTON CLICKED"
            );


            // Hide menu

            menu.classList.add(
                "hidden"
            );


            // Start from Round 1

            round = 1;

            playersRemaining = 20;


            // Reset player

            player.x = 0;

            player.y = 0;

            player.z = 0;

            player.vx = 0;

            player.vy = 0;

            player.vz = 0;


            // Build course

            createCourse();


            // Create opponents

            createBots();


            // Start game

            gameRunning = true;


            message.textContent =
                "ROUND 1";


            updateHUD();


            console.log(
                "GAME STARTED"
            );

        }
    );

}


// =====================================================
// NEXT ROUND BUTTON
// =====================================================

if (nextButton) {

    nextButton.addEventListener(
        "click",
        function() {


            // Retry

            if (
                nextButton.textContent ===
                "TRY AGAIN"
            ) {

                startRound();

                return;
            }


            // Play again after victory

            if (
                nextButton.textContent ===
                "PLAY AGAIN"
            ) {

                newGame();

                return;
            }


            // Move to next round

            round++;


            startRound();

        }
    );

}


// =====================================================
// SHOP
// =====================================================

function renderShop() {

    if (!itemsDiv) {
        return;
    }


    shopXP.textContent =
        xp;


    itemsDiv.innerHTML = "";


    skins.forEach(function(skin) {


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "shopItem";


        const owned =
            skin.price === 0 ||
            localStorage.getItem(
                "skin_" + skin.id
            ) === "true";


        item.innerHTML = `

            <div
                class="skinPreview"
                style="
                    background:${skin.color};
                "
            ></div>

            <div class="skinInfo">

                <strong>
                    ${skin.name}
                </strong>

                <span>
                    ${
                        owned
                            ? "Owned"
                            : skin.price + " XP"
                    }
                </span>

            </div>

            <button class="buyButton">

                ${
                    currentSkin === skin.id
                        ? "EQUIPPED"
                        : owned
                            ? "EQUIP"
                            : "BUY"
                }

            </button>

        `;


        const button =
            item.querySelector(
                ".buyButton"
            );


        button.addEventListener(
            "click",
            function() {


                // Already owned

                if (owned) {

                    currentSkin =
                        skin.id;


                    localStorage.setItem(
                        "beanSkin",
                        currentSkin
                    );


                    player.color =
                        skin.color;


                    renderShop();

                    return;
                }


                // Buy

                if (
                    xp >= skin.price
                ) {

                    xp -=
                        skin.price;


                    localStorage.setItem(
                        "beanXP",
                        xp
                    );


                    localStorage.setItem(
                        "skin_" +
                        skin.id,
                        "true"
                    );


                    currentSkin =
                        skin.id;


                    localStorage.setItem(
                        "beanSkin",
                        currentSkin
                    );


                    player.color =
                        skin.color;


                    updateHUD();

                    renderShop();

                } else {

                    alert(
                        "You don't have enough XP!"
                    );

                }

            }
        );


        itemsDiv.appendChild(
            item
        );

    });

}


// =====================================================
// OPEN SHOP
// =====================================================

function openShop() {

    renderShop();


    shop.classList.remove(
        "hidden"
    );

}


// =====================================================
// SHOP BUTTONS
// =====================================================

if (shopButton) {

    shopButton.addEventListener(
        "click",
        openShop
    );

}


if (shopMenuButton) {

    shopMenuButton.addEventListener(
        "click",
        openShop
    );

}


if (closeShop) {

    closeShop.addEventListener(
        "click",
        function() {

            shop.classList.add(
                "hidden"
            );

        }
    );

}


// =====================================================
// DRAW WORLD
// =====================================================

function drawWorld() {

    engine.clear(
        "#75dcff"
    );


    // -------------------------
    // Clouds
    // -------------------------

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


        if (!p) {
            continue;
        }


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


    // -------------------------
    // Course
    // -------------------------

    obstacles.forEach(
        function(obstacle) {

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


    // -------------------------
    // Obstacles
    // -------------------------

    obstacles.forEach(
        function(obstacle) {


            // Block

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


            // Spinner

            if (
                obstacle.type ===
                "spinner"
            ) {

                const angle =
                    performance.now() *
                    0.003;


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

                    0.5,

                    0.5,

                    obstacle.color

                );

            }

        }
    );


    // -------------------------
    // Finish Line
    // -------------------------

    for (
        let x = -8;
        x <= 8;
        x += 2
    ) {

        engine.cube(

            x,

            0.1,

            finishZ,

            2,

            0.2,

            2,

            x % 4 === 0
                ? "#ffffff"
                : "#222222"

        );

    }


    // -------------------------
    // Bots
    // -------------------------

    bots.forEach(
        function(bot) {

            if (!bot.alive) {
                return;
            }


            engine.sphere(

                bot.x,

                0.9,

                bot.z,

                0.65,

                bot.color

            );


            engine.sphere(

                bot.x,

                1.55,

                bot.z,

                0.55,

                bot.color

            );

        }
    );


    // -------------------------
    // Player Body
    // -------------------------

    engine.sphere(

        player.x,

        0.9 + player.y,

        player.z,

        0.7,

        player.color

    );


    // Player head

    engine.sphere(

        player.x,

        1.55 + player.y,

        player.z,

        0.55,

        player.color

    );


    // -------------------------
    // Eyes
    // -------------------------

    const eyeOffset = 0.22;


    engine.sphere(

        player.x -
        eyeOffset,

        1.7 + player.y,

        player.z - 0.45,

        0.09,

        "#111111"

    );


    engine.sphere(

        player.x +
        eyeOffset,

        1.7 + player.y,

        player.z - 0.45,

        0.09,

        "#111111"

    );

}


// =====================================================
// CAMERA
// =====================================================

function updateCamera() {

    engine.camera.x +=
        (
            player.x -
            engine.camera.x
        ) * 0.08;


    engine.camera.y = 6;


    engine.camera.z =
        player.z - 12;

}


// =====================================================
// GAME LOOP
// =====================================================

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


// =====================================================
// INITIALIZE
// =====================================================

const initialSkin =
    skins.find(
        skin =>
            skin.id ===
            currentSkin
    );


if (initialSkin) {

    player.color =
        initialSkin.color;

}


updateHUD();


// Start rendering immediately

gameLoop();


console.log(
    "Bean Rush loaded successfully!"
);
