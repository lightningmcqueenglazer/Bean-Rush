const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


/* =========================
   GAME DATA
========================= */

let coins = Number(localStorage.getItem("coins")) || 500;
let xp = Number(localStorage.getItem("xp")) || 0;
let crowns = Number(localStorage.getItem("crowns")) || 0;

let ownedSkins =
    JSON.parse(localStorage.getItem("ownedSkins")) ||
    ["classic"];

let equippedSkin =
    localStorage.getItem("equippedSkin") ||
    "classic";

let round = 1;
let gameRunning = false;
let player = {
    x: 0,
    z: 0,
    y: 0,
    vy: 0,
    speed: 7
};

let keys = {};


/* =========================
   SKINS
========================= */

const skins = [

    {
        id: "classic",
        name: "Classic Bean",
        icon: "🫘",
        color: "#ff4773",
        price: 0
    },

    {
        id: "dino",
        name: "Dinosaur",
        icon: "🦖",
        color: "#4dcc65",
        price: 600
    },

    {
        id: "basketball",
        name: "Basketball",
        icon: "🏀",
        color: "#ed7d32",
        price: 750
    },

    {
        id: "soccer",
        name: "Soccer",
        icon: "⚽",
        color: "#eeeeee",
        price: 800
    },

    {
        id: "pizza",
        name: "Pizza",
        icon: "🍕",
        color: "#ff9b32",
        price: 650
    },

    {
        id: "burger",
        name: "Burger",
        icon: "🍔",
        color: "#b96c32",
        price: 700
    },

    {
        id: "astronaut",
        name: "Astronaut",
        icon: "👨‍🚀",
        color: "#e5e5e5",
        price: 1200
    },

    {
        id: "alien",
        name: "Alien",
        icon: "👽",
        color: "#72df50",
        price: 1500
    },

    {
        id: "shark",
        name: "Shark",
        icon: "🦈",
        color: "#5598bd",
        price: 1000
    },

    {
        id: "dragon",
        name: "Dragon",
        icon: "🐲",
        color: "#d93636",
        price: 2500
    },

    {
        id: "robot",
        name: "Robot",
        icon: "🤖",
        color: "#8290a6",
        price: 1800
    },

    {
        id: "pirate",
        name: "Pirate",
        icon: "🏴‍☠️",
        color: "#713d91",
        price: 1400
    }
];


/* =========================
   MAPS
========================= */

const maps = [

    {
        name: "JUNGLE JUMBLE",
        icon: "🌴",
        color: "#45a84f"
    },

    {
        name: "OCEAN ODYSSEY",
        icon: "🌊",
        color: "#168ca8"
    },

    {
        name: "SPORTS STADIUM",
        icon: "🏟️",
        color: "#3f9853"
    },

    {
        name: "FOOD FRENZY",
        icon: "🍕",
        color: "#d98c42"
    },

    {
        name: "SPACE STAMPEDE",
        icon: "🚀",
        color: "#28264e"
    },

    {
        name: "VOLCANO MAYHEM",
        icon: "🌋",
        color: "#71332d"
    },

    {
        name: "ICE INVASION",
        icon: "❄️",
        color: "#80cfe5"
    },

    {
        name: "PIRATE PLUNDER",
        icon: "🏴‍☠️",
        color: "#705638"
    },

    {
        name: "CANDY CHAOS",
        icon: "🍬",
        color: "#d976b5"
    },

    {
        name: "CITY CRASH",
        icon: "🏙️",
        color: "#536786"
    }
];


/* =========================
   SCREEN HELPERS
========================= */

function hide(id) {
    const element = document.getElementById(id);

    if (element) {
        element.classList.add("hidden");
    }
}


function show(id) {
    const element = document.getElementById(id);

    if (element) {
        element.classList.remove("hidden");
    }
}


/* =========================
   PROFILE
========================= */

function updateProfile() {

    const level =
        Math.floor(xp / 1000) + 1;

    const levelElement =
        document.getElementById("levelText");

    const xpElement =
        document.getElementById("xpText");

    const coinsElement =
        document.getElementById("coinsText");

    const crownElement =
        document.getElementById("crownText");

    if (levelElement)
        levelElement.textContent = level;

    if (xpElement)
        xpElement.textContent = xp;

    if (coinsElement)
        coinsElement.textContent = coins;

    if (crownElement)
        crownElement.textContent = crowns;
}


/* =========================
   PLAY
========================= */

function startGame() {

    console.log("PLAY BUTTON WORKED");

    hide("menu");
    hide("result");
    hide("winner");
    hide("shop");
    hide("custom");
    hide("wheel");

    show("hud");

    gameRunning = true;
    round = 1;

    player.x = 0;
    player.z = 0;
    player.y = 0;
    player.vy = 0;

    startRound();
}


/* =========================
   ROUND
========================= */

function startRound() {

    const map =
        maps[
            Math.floor(
                Math.random() * maps.length
            )
        ];

    document.getElementById("roundText").textContent =
        `${round} / 4`;

    document.getElementById("mapName").textContent =
        `${map.icon} ${map.name}`;

    document.getElementById("playersText").textContent =
        round === 1
            ? "20"
            : round === 2
                ? "14"
                : round === 3
                    ? "8"
                    : "4";

    document.getElementById("timer").textContent =
        "60";

    const announcement =
        document.getElementById("announcement");

    announcement.textContent =
        `${map.icon} ${map.name}`;

    setTimeout(() => {
        announcement.textContent = "3";
    }, 1000);

    setTimeout(() => {
        announcement.textContent = "2";
    }, 1600);

    setTimeout(() => {
        announcement.textContent = "1";
    }, 2200);

    setTimeout(() => {
        announcement.textContent = "GO!";
    }, 2800);

    setTimeout(() => {
        announcement.textContent = "";
    }, 3800);
}


/* =========================
   SHOP
========================= */

function openShop() {

    console.log("SHOP BUTTON WORKED");

    hide("menu");
    hide("wheel");
    hide("custom");

    show("shop");

    renderShop();
}


function renderShop() {

    const grid =
        document.getElementById("shopGrid");

    if (!grid)
        return;

    grid.innerHTML = "";

    const balance =
        document.getElementById("shopCoins");

    if (balance)
        balance.textContent = coins;


    skins.forEach(skin => {

        const owned =
            ownedSkins.includes(
                skin.id
            );

        const card =
            document.createElement("div");

        card.className = "item";

        card.innerHTML = `

            <div class="itemIcon">
                ${skin.icon}
            </div>

            <h3>
                ${skin.name}
            </h3>

            <div>
                ${
                    owned
                        ? "OWNED"
                        : "🪙 " + skin.price
                }
            </div>

            <button>
                ${
                    owned
                        ? (
                            equippedSkin === skin.id
                                ? "EQUIPPED"
                                : "EQUIP"
                        )
                        : "BUY"
                }
            </button>
        `;

        const button =
            card.querySelector("button");

        button.onclick = () => {

            if (owned) {

                equippedSkin =
                    skin.id;

                localStorage.setItem(
                    "equippedSkin",
                    equippedSkin
                );

                renderShop();

                showToast(
                    `${skin.name} equipped!`
                );

                return;
            }

            if (coins < skin.price) {

                showToast(
                    "You need more coins!"
                );

                return;
            }

            coins -= skin.price;

            ownedSkins.push(
                skin.id
            );

            equippedSkin =
                skin.id;

            localStorage.setItem(
                "coins",
                coins
            );

            localStorage.setItem(
                "ownedSkins",
                JSON.stringify(
                    ownedSkins
                )
            );

            localStorage.setItem(
                "equippedSkin",
                equippedSkin
            );

            updateProfile();
            renderShop();

            showToast(
                `${skin.icon} ${skin.name} unlocked!`
            );
        };

        grid.appendChild(card);
    });
}


/* =========================
   CUSTOMIZATION
========================= */

function openCustom() {

    console.log(
        "CUSTOMIZE BUTTON WORKED"
    );

    hide("menu");
    hide("shop");
    hide("wheel");

    show("custom");

    renderCustom();
}


function renderCustom() {

    const grid =
        document.getElementById(
            "skinGrid"
        );

    if (!grid)
        return;

    grid.innerHTML = "";


    skins.forEach(skin => {

        const owned =
            ownedSkins.includes(
                skin.id
            );

        if (!owned)
            return;

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "item";

        card.innerHTML = `

            <div class="itemIcon">
                ${skin.icon}
            </div>

            <h3>
                ${skin.name}
            </h3>

            <button>
                ${
                    equippedSkin === skin.id
                        ? "EQUIPPED"
                        : "EQUIP"
                }
            </button>
        `;

        card.querySelector(
            "button"
        ).onclick = () => {

            equippedSkin =
                skin.id;

            localStorage.setItem(
                "equippedSkin",
                equippedSkin
            );

            renderCustom();

            showToast(
                `${skin.name} equipped!`
            );
        };

        grid.appendChild(card);
    });


    const preview =
        document.getElementById(
            "customPreview"
        );

    const skin =
        skins.find(
            s =>
                s.id === equippedSkin
        ) || skins[0];

    preview.innerHTML = `

        <div
            class="previewBean"
            style="
                background:${skin.color};
            "
        >
            ${skin.icon}
        </div>
    `;
}


/* =========================
   DAILY WHEEL
========================= */

function openWheel() {

    console.log(
        "WHEEL BUTTON WORKED"
    );

    hide("menu");
    hide("shop");
    hide("custom");

    show("wheel");

    refreshWheel();
}


function getToday() {

    const date =
        new Date();

    return (
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
        "-" +
        date.getDate()
    );
}


function refreshWheel() {

    const spinButton =
        document.getElementById(
            "spinBtn"
        );

    const lastSpin =
        localStorage.getItem(
            "dailyWheel"
        );

    if (
        lastSpin ===
        getToday()
    ) {

        spinButton.disabled = true;

        spinButton.textContent =
            "COME BACK TOMORROW";

    } else {

        spinButton.disabled = false;

        spinButton.textContent =
            "SPIN FREE";
    }
}


function spinWheel() {

    const spinButton =
        document.getElementById(
            "spinBtn"
        );

    if (
        localStorage.getItem(
            "dailyWheel"
        ) ===
        getToday()
    ) {

        return;
    }

    spinButton.disabled =
        true;

    const wheel =
        document.getElementById(
            "wheelGraphic"
        );

    wheel.style.transform =
        "rotate(1800deg)";

    setTimeout(() => {

        const rewards = [

            {
                text: "+500 XP ⭐",
                action: () => {
                    xp += 500;
                }
            },

            {
                text: "+1000 XP ⭐",
                action: () => {
                    xp += 1000;
                }
            },

            {
                text: "+250 COINS 🪙",
                action: () => {
                    coins += 250;
                }
            },

            {
                text: "+500 COINS 🪙",
                action: () => {
                    coins += 500;
                }
            },

            {
                text: "FREE SKIN 🎨",
                action: () => {

                    const available =
                        skins.filter(
                            skin =>
                                !ownedSkins.includes(
                                    skin.id
                                )
                        );

                    if (
                        available.length === 0
                    ) {

                        coins += 1000;

                        return;
                    }

                    const skin =
                        available[
                            Math.floor(
                                Math.random() *
                                available.length
                            )
                        ];

                    ownedSkins.push(
                        skin.id
                    );

                    localStorage.setItem(
                        "ownedSkins",
                        JSON.stringify(
                            ownedSkins
                        )
                    );
                }
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

        localStorage.setItem(
            "dailyWheel",
            getToday()
        );

        localStorage.setItem(
            "coins",
            coins
        );

        localStorage.setItem(
            "xp",
            xp
        );

        updateProfile();

        document.getElementById(
            "wheelResult"
        ).textContent =
            `🎉 YOU WON: ${reward.text}`;

        spinButton.textContent =
            "COME BACK TOMORROW";

        showToast(
            reward.text
        );

    }, 2500);
}


/* =========================
   RESULT
========================= */

function showResult(
    qualified = true
) {

    gameRunning = false;

    hide("hud");

    show("result");

    if (qualified) {

        document.getElementById(
            "resultIcon"
        ).textContent =
            "🏆";

        document.getElementById(
            "resultTitle"
        ).textContent =
            "QUALIFIED!";

        document.getElementById(
            "resultDescription"
        ).textContent =
            `You survived Round ${round}!`;

        document.getElementById(
            "continueBtn"
        ).textContent =
            "NEXT ROUND";

        document.getElementById(
            "continueBtn"
        ).onclick =
            nextRound;

    } else {

        document.getElementById(
            "resultIcon"
        ).textContent =
            "💥";

        document.getElementById(
            "resultTitle"
        ).textContent =
            "ELIMINATED!";

        document.getElementById(
            "resultDescription"
        ).textContent =
            "The bots beat you this time!";

        document.getElementById(
            "continueBtn"
        ).textContent =
            "PLAY AGAIN";

        document.getElementById(
            "continueBtn"
        ).onclick =
            startGame;
    }
}


function nextRound() {

    if (round >= 4) {

        winGame();

        return;
    }

    round++;

    hide("result");

    show("hud");

    gameRunning = true;

    startRound();
}


function winGame() {

    gameRunning = false;

    crowns++;

    coins += 500;

    xp += 1000;

    localStorage.setItem(
        "crowns",
        crowns
    );

    localStorage.setItem(
        "coins",
        coins
    );

    localStorage.setItem(
        "xp",
        xp
    );

    updateProfile();

    hide("hud");

    show("winner");
}


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2000);
}


/* =========================
   CLOSE BUTTONS
========================= */

document.getElementById(
    "closeShop"
).onclick = () => {

    hide("shop");
    show("menu");
};


document.getElementById(
    "closeCustom"
).onclick = () => {

    hide("custom");
    show("menu");
};


document.getElementById(
    "closeWheel"
).onclick = () => {

    hide("wheel");
    show("menu");
};


/* =========================
   MAIN BUTTONS
========================= */

document.getElementById(
    "playBtn"
).onclick =
    startGame;


document.getElementById(
    "shopBtn"
).onclick =
    openShop;


document.getElementById(
    "customBtn"
).onclick =
    openCustom;


document.getElementById(
    "wheelBtn"
).onclick =
    openWheel;


document.getElementById(
    "spinBtn"
).onclick =
    spinWheel;


document.getElementById(
    "againBtn"
).onclick =
    startGame;


document.getElementById(
    "homeBtn"
).onclick = () => {

    hide("winner");

    show("menu");

    updateProfile();
};


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    event => {

        keys[
            event.key.toLowerCase()
        ] = true;

        if (
            event.code ===
            "Space"
        ) {

            player.vy = 10;
        }
    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;
    }
);


/* =========================
   GAME DRAWING
========================= */

function draw() {

    const map =
        maps[
            (round - 1) %
            maps.length
        ];

    ctx.fillStyle =
        map.color;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // sky

    ctx.fillStyle =
        "rgba(255,255,255,.12)";

    for (
        let i = 0;
        i < 20;
        i++
    ) {

        ctx.beginPath();

        ctx.arc(
            (i * 173) %
                canvas.width,

            80 +
                ((i * 91) %
                    250),

            2,

            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // course

    ctx.fillStyle =
        "rgba(0,0,0,.15)";

    ctx.fillRect(
        canvas.width * .15,
        canvas.height * .5,
        canvas.width * .7,
        canvas.height * .5
    );


    // finish line

    ctx.fillStyle =
        "white";

    ctx.fillRect(
        canvas.width * .25,
        canvas.height * .35,
        canvas.width * .5,
        15
    );


    for (
        let i = 0;
        i < 10;
        i++
    ) {

        ctx.fillStyle =
            i % 2
                ? "black"
                : "white";

        ctx.fillRect(
            canvas.width * .25 +
                i *
                canvas.width *
                .05,

            canvas.height * .35,

            canvas.width * .025,

            15
        );
    }


    // player

    const px =
        canvas.width / 2 +
        player.x * 25;

    const py =
        canvas.height * .65 -
        player.y * 20;

    const skin =
        skins.find(
            s =>
                s.id ===
                equippedSkin
        ) || skins[0];


    ctx.beginPath();

    ctx.ellipse(
        px,
        py,
        32,
        45,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        skin.color;

    ctx.fill();


    // eyes

    ctx.fillStyle =
        "black";

    ctx.beginPath();

    ctx.arc(
        px - 10,
        py - 8,
        5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        px + 10,
        py - 8,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // skin icon

    if (
        skin.id !==
        "classic"
    ) {

        ctx.font =
            "22px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            skin.icon,
            px,
            py - 48
        );
    }


    // bots

    for (
        let i = 0;
        i < 19;
        i++
    ) {

        const botX =
            canvas.width * .2 +
            (
                i % 10
            ) *
            canvas.width *
            .065;

        const botY =
            canvas.height *
            .62 +
            Math.sin(
                performance.now() /
                400 +
                i
            ) *
            8;

        ctx.beginPath();

        ctx.ellipse(
            botX,
            botY,
            20,
            28,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            skins[
                i %
                skins.length
            ].color;

        ctx.fill();

        ctx.fillStyle =
            "black";

        ctx.beginPath();

        ctx.arc(
            botX - 6,
            botY - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            botX + 6,
            botY - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // obstacles

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const ox =
            canvas.width * .25 +
            i *
            canvas.width *
            .075;

        const oy =
            canvas.height * .53;

        ctx.save();

        ctx.translate(
            ox,
            oy
        );

        ctx.rotate(
            performance.now() /
            500 +
            i
        );

        ctx.fillStyle =
            i % 2
                ? "#ffd43d"
                : "#ff4773";

        ctx.fillRect(
            -45,
            -8,
            90,
            16
        );

        ctx.restore();
    }


    // progress

    const progress =
        Math.min(
            player.z / 100,
            1
        );

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.fillRect(
        30,
        canvas.height - 35,
        canvas.width - 60,
        12
    );

    ctx.fillStyle =
        "#ff4773";

    ctx.fillRect(
        30,
        canvas.height - 35,
        (
            canvas.width - 60
        ) *
        progress,
        12
    );
}


/* =========================
   UPDATE
========================= */

let lastTime =
    performance.now();


function update() {

    const now =
        performance.now();

    const dt =
        Math.min(
            (now - lastTime) /
            1000,
            .05
        );

    lastTime =
        now;


    if (
        gameRunning
    ) {

        let dx = 0;
        let dz = 0;


        if (
            keys.a ||
            keys.arrowleft
        )
            dx--;

        if (
            keys.d ||
            keys.arrowright
        )
            dx++;

        if (
            keys.w ||
            keys.arrowup
        )
            dz++;

        if (
            keys.s ||
            keys.arrowdown
        )
            dz--;


        player.x +=
            dx *
            player.speed *
            dt;

        player.z +=
            dz *
            player.speed *
            dt;


        player.vy -=
            25 *
            dt;

        player.y +=
            player.vy *
            dt;


        if (
            player.y < 0
        ) {

            player.y = 0;

            player.vy = 0;
        }


        player.x =
            Math.max(
                -8,
                Math.min(
                    8,
                    player.x
                )
            );


        if (
            player.z >= 100
        ) {

            if (
                round >= 4
            ) {

                winGame();

            } else {

                showResult(
                    true
                );
            }
        }


        if (
            player.z < -10
        ) {

            player.z = -10;
        }
    }


    draw();

    requestAnimationFrame(
        update
    );
}


/* =========================
   START
========================= */

updateProfile();

refreshWheel();

update();
