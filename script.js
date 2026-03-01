let players = [];
let currentPlayer = 0;
let rankings = [];
let activePlayers = [];
let discardPile = [];

function createDeck() {
    const suits = ["♣","♦","♥","♠"];
    const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    let deck = [];

    for (let s of suits) {
        for (let r of ranks) {
            deck.push({ suit: s, rank: r });
        }
    }

    deck.push({ suit: "JOKER", rank: "JOKER" });
    return deck;
}

function shuffle(deck) {
    return deck.sort(() => Math.random() - 0.5);
}

function removePairs(hand) {

    let count = {};
    hand.forEach(c => {
        count[c.rank] = (count[c.rank] || 0) + 1;
    });

    let newHand = [];
    let removed = [];
    let used = {};

    for (let card of hand) {

        if (card.rank === "JOKER") {
            newHand.push(card);
            continue;
        }

        if (!used[card.rank]) used[card.rank] = 0;

        if (count[card.rank] % 2 === 1) {
            if (used[card.rank] === 0) {
                newHand.push(card);
                used[card.rank]++;
            } else {
                removed.push(card);
            }
        } else {
            removed.push(card);
        }
    }

    discardPile.push(...removed);
    return newHand;
}

function startGame() {

    const count = parseInt(
        document.getElementById("playerCount").value
    );

    players = [];
    rankings = [];
    activePlayers = [];
    discardPile = [];

    for (let i = 0; i < count; i++) {
        players.push([]);
        activePlayers.push(i);
    }

    let deck = shuffle(createDeck());

    let index = 0;
    while (deck.length > 0) {
        players[index % count].push(deck.pop());
        index++;
    }

    for (let i = 0; i < count; i++) {
        players[i] = removePairs(players[i]);
    }

    currentPlayer = 0;
    render();
}

function render() {

    const game = document.getElementById("game");
    const status = document.getElementById("status");
    const result = document.getElementById("result");

    game.innerHTML = "";
    result.innerHTML = "";

    if (activePlayers.length === 1) {
        rankings.push(activePlayers[0]);
        showRanking();
        return;
    }

    if (!activePlayers.includes(currentPlayer)) {
        currentPlayer = findNextActive(currentPlayer);
    }

    status.innerHTML =
        `プレイヤー${currentPlayer + 1}のターン`;

    players.forEach((hand, i) => {

        let div = document.createElement("div");
        div.className = "player-area";
        div.innerHTML =
            `<h3>プレイヤー${i + 1} (${hand.length}枚)</h3>`;

        if (i === 0) {

            hand.forEach(card => {

                let img = document.createElement("img");
                img.className = "card-img";

                if (card.rank === "JOKER") {
                    img.src = "cards/joker.jpeg";
                } else {

                    const suitMap = {
                        "♣": "clubs",
                        "♦": "diamonds",
                        "♥": "hearts",
                        "♠": "spades"
                    };

                    const rankMap = {
                        "J": "J",
                        "Q": "Q",
                        "K": "K",
                        "A": "A"
                    };

                    let suitName = suitMap[card.suit];
                    let rankName = rankMap[card.rank] || card.rank;

                    img.src =
                        `cards/${suitName}_${rankName}.png`;
                }

                div.appendChild(img);
            });

        } else {

            for (let j = 0; j < hand.length; j++) {

                let img = document.createElement("img");
                img.className = "card-img";
                img.src = "cards/back_dark.png";

                if (currentPlayer === 0
                    && activePlayers.includes(i)) {

                    img.onclick = () => drawCard(i, j);
                }

                div.appendChild(img);
            }
        }

        game.appendChild(div);
    });

    // 🔥 捨て札表示
    let discardDiv = document.createElement("div");
    discardDiv.className = "player-area";
    discardDiv.innerHTML = "<h3>🗑 捨て札</h3>";

    discardPile.forEach(card => {

        let img = document.createElement("img");
        img.className = "card-img";

        if (card.rank === "JOKER") {
            img.src = "cards/joker.png";
        } else {

            const suitMap = {
                "♣": "clubs",
                "♦": "diamonds",
                "♥": "hearts",
                "♠": "spades"
            };

            const rankMap = {
                "J": "J",
                "Q": "Q",
                "K": "K",
                "A": "A"
            };

            let suitName = suitMap[card.suit];
            let rankName = rankMap[card.rank] || card.rank;

            img.src =
                `cards/${suitName}_${rankName}.png`;
        }

        discardDiv.appendChild(img);
    });

    game.appendChild(discardDiv);

    if (currentPlayer !== 0) {
        setTimeout(cpuTurn, 800);
    }
}

function drawCard(target, index) {

    if (currentPlayer !== 0) return;

    let card = players[target].splice(index, 1)[0];
    players[0].push(card);

    players[0] = removePairs(players[0]);

    checkFinish(0);
    checkFinish(target);

    nextTurn();
}

function cpuTurn() {

    let next = findNextActive(currentPlayer);

    let randIndex =
        Math.floor(Math.random() * players[next].length);

    let card =
        players[next].splice(randIndex, 1)[0];

    players[currentPlayer].push(card);
    players[currentPlayer] =
        removePairs(players[currentPlayer]);

    checkFinish(currentPlayer);
    checkFinish(next);

    nextTurn();
}

function checkFinish(index) {

    if (players[index].length === 0
        && activePlayers.includes(index)) {

        rankings.push(index);

        activePlayers =
            activePlayers.filter(p => p !== index);
    }
}

function findNextActive(index) {

    let i = index;
    do {
        i = (i + 1) % players.length;
    } while (!activePlayers.includes(i));

    return i;
}

function nextTurn() {

    if (activePlayers.length === 1) {
        render();
        return;
    }

    currentPlayer =
        findNextActive(currentPlayer);

    render();
}

function showRanking() {

    const result =
        document.getElementById("result");

    result.innerHTML = "<h2>🏆 最終順位</h2>";

    rankings.forEach((p, i) => {
        result.innerHTML +=
            `${i + 1}位: プレイヤー${p + 1}<br>`;
    });
}