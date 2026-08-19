/*
============================================================
FANDOM RANKER
GAME ENGINE
============================================================

app.js

Universal comparison-based ranking engine.

Designed to scale across fandoms with different numbers
of items.

Examples:

10 items -> 45 maximum comparisons
11 items -> 55 maximum comparisons
15 items -> 105 maximum comparisons
22 items -> 231 maximum comparisons

The system uses:

- Elo ratings
- Adaptive matchup selection
- Scaled comparison targets
- Ranking confidence
- Top-ranking confidence
- Gradual stopping probability
- Absolute maximum protection

DO NOT put fandom data here.

Fandom data belongs in rankers.js.

============================================================
*/


/* =========================================================
   GAME VARIABLES
========================================================= */

let currentRanker = null;

let items = [];

let comparisons = 0;

let leftItem = null;

let rightItem = null;

let gameFinished = false;

let comparedPairs = new Set();

let pairHistory = new Map();


/* =========================================================
   SETTINGS
========================================================= */

const STARTING_RATING = 1000;

const K_FACTOR = 28;


/*
============================================================
SCALING MODEL
============================================================

The target is deliberately NOT one fixed number.

For small fandoms we compare a larger percentage of all
possible pairs.

For larger fandoms we reduce the percentage because the
number of possible pairs grows very quickly.
*/


function getTargetRatio() {

    const n = items.length;


    /*
        Tiny fandoms.

        These are cheap enough to examine thoroughly.
    */

    if (n <= 8) {

        return 0.75;

    }


    /*
        9-10 items.

        Example:

        10 items
        45 possible
        target = ~34
    */

    if (n <= 10) {

        return 0.75;

    }


    /*
        11-12 items.

        Example:

        11 items
        55 possible
        target = ~40
    */

    if (n <= 12) {

        return 0.72;

    }


    /*
        13-15 items.

        Example:

        15 items
        105 possible
        target = ~68
    */

    if (n <= 15) {

        return 0.65;

    }


    /*
        16-18 items.
    */

    if (n <= 18) {

        return 0.62;

    }


    /*
        19-22 items.

        TWICE has 22 items.

        231 possible comparisons.

        Target:

        231 * .65 = 150.15
    */

    if (n <= 22) {

        return 0.65;

    }


    /*
        23-30 items.

        Begin reducing the percentage because
        pair count grows rapidly.
    */

    if (n <= 30) {

        return 0.55;

    }


    /*
        31-40.
    */

    if (n <= 40) {

        return 0.45;

    }


    /*
        41-60.
    */

    if (n <= 60) {

        return 0.35;

    }


    /*
        Large databases.
    */

    return 0.25;

}


/* =========================================================
   MAXIMUM POSSIBLE COMPARISONS
========================================================= */

function getMaximumComparisons() {

    if (items.length < 2) {

        return 0;

    }


    return Math.floor(
        items.length *
        (items.length - 1) /
        2
    );

}


/* =========================================================
   TARGET COMPARISONS
========================================================= */

function getTargetComparisons() {

    const maximum =
        getMaximumComparisons();


    return Math.min(
        maximum,
        Math.ceil(
            maximum *
            getTargetRatio()
        )
    );

}


/* =========================================================
   PAIR KEY
========================================================= */

function getPairKey(
    itemA,
    itemB
) {

    return [
        itemA.name,
        itemB.name
    ]
        .sort()
        .join("|||");

}


/* =========================================================
   HOME
========================================================= */

function showHome() {

    const home =
        document.getElementById(
            "home-screen"
        );

    const game =
        document.getElementById(
            "game-screen"
        );

    const results =
        document.getElementById(
            "results-screen"
        );


    if (home) {

        home.classList.remove(
            "hidden"
        );

    }


    if (game) {

        game.classList.add(
            "hidden"
        );

    }


    if (results) {

        results.classList.add(
            "hidden"
        );

    }


    renderRankers();


    window.scrollTo(
        0,
        0
    );

}


/* =========================================================
   RENDER RANKERS
========================================================= */

function renderRankers() {

    const grid =
        document.getElementById(
            "ranker-grid"
        );


    if (!grid) {

        console.error(
            "Could not find #ranker-grid"
        );

        return;

    }


    grid.innerHTML = "";


    RANKERS.forEach(
        ranker => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "ranker-card";


            card.addEventListener(
                "click",
                () => {

                    startRanker(
                        ranker.id
                    );

                }
            );


            /* IMAGE */

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "ranker-card-image";


            image.src =
                ranker.image;


            image.alt =
                ranker.title;


            image.onerror =
                function () {

                    this.style.display =
                        "none";

                };


            /* INFO */

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "ranker-card-info";


            /* ICON */

            const icon =
                document.createElement(
                    "div"
                );


            icon.className =
                "ranker-card-icon";


            icon.textContent =
                ranker.icon || "⭐";


            /* TITLE */

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                ranker.title;


            /* ITEM COUNT */

            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                `${ranker.items.length} items`;


            info.appendChild(
                icon
            );


            info.appendChild(
                title
            );


            info.appendChild(
                description
            );


            card.appendChild(
                image
            );


            card.appendChild(
                info
            );


            grid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   START RANKER
========================================================= */

function startRanker(
    rankerId
) {

    currentRanker =
        RANKERS.find(
            ranker =>
                ranker.id === rankerId
        );


    if (!currentRanker) {

        console.error(
            "Ranker not found:",
            rankerId
        );

        return;

    }


    items =
        currentRanker.items.map(
            item => ({

                ...item,

                rating:
                    STARTING_RATING,

                wins: 0,

                losses: 0

            })
        );


    comparisons = 0;

    leftItem = null;

    rightItem = null;

    gameFinished = false;

    comparedPairs =
        new Set();

    pairHistory =
        new Map();


    /* SCREEN */

    const home =
        document.getElementById(
            "home-screen"
        );

    const game =
        document.getElementById(
            "game-screen"
        );

    const results =
        document.getElementById(
            "results-screen"
        );


    if (home) {

        home.classList.add(
            "hidden"
        );

    }


    if (results) {

        results.classList.add(
            "hidden"
        );

    }


    if (game) {

        game.classList.remove(
            "hidden"
        );

    }


    /*
        Reset current ranking panel.
    */

    const rankingContainer =
        document.getElementById(
            "current-ranking-container"
        );


    if (rankingContainer) {

        rankingContainer.classList.add(
            "hidden"
        );

    }


    const rankingButton =
        document.getElementById(
            "current-ranking-button"
        );


    if (rankingButton) {

        rankingButton.textContent =
            "View Current Ranking";

    }


    /* HEADER */

    const icon =
        document.getElementById(
            "game-icon"
        );


    if (icon) {

        icon.textContent =
            currentRanker.icon || "⭐";

    }


    const title =
        document.getElementById(
            "game-title"
        );


    if (title) {

        title.textContent =
            currentRanker.title;

    }


    const subtitle =
        document.getElementById(
            "game-subtitle"
        );


    if (subtitle) {

        subtitle.textContent =
            currentRanker.subtitle ||
            "Choose your favorite";

    }


    updateStats();

    updateCurrentRanking();

    chooseNextMatch();


    window.scrollTo(
        0,
        0
    );

}


/* =========================================================
   NEXT MATCH
========================================================= */

function chooseNextMatch() {

    if (gameFinished) {

        return;

    }


    const pair =
        findBestMatchup();


    if (!pair) {

        finishGame();

        return;

    }


    leftItem =
        pair[0];


    rightItem =
        pair[1];


    renderMatchup();

}


/* =========================================================
   FIND BEST MATCHUP
========================================================= */

function findBestMatchup() {

    if (items.length < 2) {

        return null;

    }


    const maximum =
        getMaximumComparisons();


    if (
        comparedPairs.size >=
        maximum
    ) {

        return null;

    }


    /*
    ========================================================
    EXPLORATION PHASE
    ========================================================

    Early comparisons are spread around the database.

    This prevents the first few choices from dominating
    the Elo ratings.
    */


    const explorationTarget =
        Math.min(
            maximum,
            Math.max(
                items.length * 1.5,
                Math.ceil(
                    maximum * 0.15
                )
            )
        );


    if (
        comparisons <
        explorationTarget
    ) {

        return findUnusedRandomPair();

    }


    /*
    ========================================================
    ADAPTIVE PHASE
    ========================================================

    Find unused pairs whose ratings are close.

    Close ratings = uncertain ordering.

    Those are the most useful comparisons.
    */

    const candidates = [];


    for (
        let i = 0;
        i < items.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < items.length;
            j++
        ) {

            const a =
                items[i];

            const b =
                items[j];


            const key =
                getPairKey(
                    a,
                    b
                );


            if (
                comparedPairs.has(
                    key
                )
            ) {

                continue;

            }


            const difference =
                Math.abs(
                    a.rating -
                    b.rating
                );


            candidates.push({

                a: a,

                b: b,

                difference:
                    difference

            });

        }

    }


    if (
        candidates.length === 0
    ) {

        return null;

    }


    candidates.sort(
        (
            a,
            b
        ) =>
            a.difference -
            b.difference
    );


    /*
        Randomly select from a small group of the
        most uncertain pairs.

        This prevents repetitive deterministic behavior.
    */

    const poolSize =
        Math.min(
            Math.max(
                6,
                Math.ceil(
                    items.length * 0.25
                )
            ),
            candidates.length
        );


    const pool =
        candidates.slice(
            0,
            poolSize
        );


    const selected =
        pool[
            Math.floor(
                Math.random() *
                pool.length
            )
        ];


    return [
        selected.a,
        selected.b
    ];

}


/* =========================================================
   RANDOM UNUSED PAIR
========================================================= */

function findUnusedRandomPair() {

    const pairs = [];


    for (
        let i = 0;
        i < items.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < items.length;
            j++
        ) {

            const key =
                getPairKey(
                    items[i],
                    items[j]
                );


            if (
                !comparedPairs.has(
                    key
                )
            ) {

                pairs.push(
                    [
                        items[i],
                        items[j]
                    ]
                );

            }

        }

    }


    if (
        pairs.length === 0
    ) {

        return null;

    }


    return pairs[
        Math.floor(
            Math.random() *
            pairs.length
        )
    ];

}


/* =========================================================
   DISPLAY MATCHUP
========================================================= */

function renderMatchup() {

    if (
        !leftItem ||
        !rightItem
    ) {

        return;

    }


    const leftImage =
        document.getElementById(
            "left-image"
        );


    const rightImage =
        document.getElementById(
            "right-image"
        );


    if (leftImage) {

        leftImage.src =
            leftItem.image;

        leftImage.alt =
            leftItem.name;

    }


    if (rightImage) {

        rightImage.src =
            rightItem.image;

        rightImage.alt =
            rightItem.name;

    }


    const leftName =
        document.getElementById(
            "left-name"
        );


    const rightName =
        document.getElementById(
            "right-name"
        );


    if (leftName) {

        leftName.textContent =
            leftItem.name;

    }


    if (rightName) {

        rightName.textContent =
            rightItem.name;

    }

}


/* =========================================================
   CHOOSE WINNER
========================================================= */

function chooseWinner(
    side
) {

    if (
        gameFinished ||
        !leftItem ||
        !rightItem
    ) {

        return;

    }


    const winner =
        side === "left"
            ? leftItem
            : rightItem;


    const loser =
        side === "left"
            ? rightItem
            : leftItem;


    /*
        Record pair.
    */

    const key =
        getPairKey(
            winner,
            loser
        );


    comparedPairs.add(
        key
    );


    pairHistory.set(
        key,
        true
    );


    /*
        Update Elo.
    */

    updateElo(
        winner,
        loser
    );


    winner.wins++;

    loser.losses++;

    comparisons++;


    updateStats();

    updateCurrentRanking();


    setTimeout(
        () => {

            if (
                shouldFinish()
            ) {

                finishGame();

            } else {

                chooseNextMatch();

            }

        },
        120
    );

}


/* =========================================================
   ELO
========================================================= */

function expectedScore(
    ratingA,
    ratingB
) {

    return 1 /
        (
            1 +
            Math.pow(
                10,
                (
                    ratingB -
                    ratingA
                ) / 400
            )
        );

}


function updateElo(
    winner,
    loser
) {

    const expectedWinner =
        expectedScore(
            winner.rating,
            loser.rating
        );


    const expectedLoser =
        expectedScore(
            loser.rating,
            winner.rating
        );


    winner.rating +=
        K_FACTOR *
        (
            1 -
            expectedWinner
        );


    loser.rating +=
        K_FACTOR *
        (
            0 -
            expectedLoser
        );

}


/* =========================================================
   RANKING STABILITY
========================================================= */

function getRankingStability() {

    if (
        items.length < 2
    ) {

        return 1;

    }


    const sorted =
        [...items].sort(
            (
                a,
                b
            ) =>
                b.rating -
                a.rating
        );


    let stable = 0;

    let total = 0;


    /*
        Slightly stricter for small fandoms.
    */

    const threshold =
        items.length <= 12
            ? 24
            : items.length <= 22
                ? 28
                : 32;


    for (
        let i = 0;
        i <
        sorted.length - 1;
        i++
    ) {

        const gap =
            Math.abs(
                sorted[i].rating -
                sorted[i + 1].rating
            );


        if (
            gap >= threshold
        ) {

            stable++;

        }


        total++;

    }


    return total === 0
        ? 1
        : stable / total;

}


/* =========================================================
   TOP RANKING STABILITY
========================================================= */

function getTopRankingStability() {

    if (
        items.length < 3
    ) {

        return 1;

    }


    const sorted =
        [...items].sort(
            (
                a,
                b
            ) =>
                b.rating -
                a.rating
        );


    const limit =
        Math.min(
            10,
            sorted.length - 1
        );


    let stable = 0;

    let total = 0;


    const threshold =
        items.length <= 12
            ? 18
            : items.length <= 22
                ? 20
                : 24;


    for (
        let i = 0;
        i < limit;
        i++
    ) {

        const gap =
            Math.abs(
                sorted[i].rating -
                sorted[i + 1].rating
            );


        if (
            gap >= threshold
        ) {

            stable++;

        }


        total++;

    }


    return total === 0
        ? 1
        : stable / total;

}


/* =========================================================
   TOP FIVE STABILITY
========================================================= */

function getTopFiveStability() {

    if (
        items.length < 5
    ) {

        return 1;

    }


    const sorted =
        [...items].sort(
            (
                a,
                b
            ) =>
                b.rating -
                a.rating
        );


    const limit =
        Math.min(
            5,
            sorted.length - 1
        );


    let stable = 0;

    let total = 0;


    for (
        let i = 0;
        i < limit;
        i++
    ) {

        const gap =
            Math.abs(
                sorted[i].rating -
                sorted[i + 1].rating
            );


        if (
            gap >= 22
        ) {

            stable++;

        }


        total++;

    }


    return total === 0
        ? 1
        : stable / total;

}


/* =========================================================
   COMBINED CONFIDENCE
========================================================= */

function getRankingConfidence() {

    const overall =
        getRankingStability();


    const top =
        getTopRankingStability();


    const topFive =
        getTopFiveStability();


    /*
        Overall ranking:
            30%

        Top 10:
            40%

        Top 5:
            30%
    */

    return (
        overall * 0.30
    ) +
    (
        top * 0.40
    ) +
    (
        topFive * 0.30
    );

}


/* =========================================================
   SHOULD FINISH
========================================================= */

function shouldFinish() {

    const maximum =
        getMaximumComparisons();


    /*
        Absolute maximum.

        This is the only guaranteed ending.
    */

    if (
        comparisons >= maximum
    ) {

        return true;

    }


    const target =
        getTargetComparisons();


    /*
        Never finish before the scaled target.
    */

    if (
        comparisons < target
    ) {

        return false;

    }


    const confidence =
        getRankingConfidence();


    const top =
        getTopRankingStability();


    /*
    ========================================================
    CONFIDENCE THRESHOLD
    ========================================================

    This is deliberately easier than the previous version.

    We use ONE combined confidence score instead of requiring
    several independent conditions to all pass.
    */

    let confidenceThreshold;


    if (
        items.length <= 10
    ) {

        confidenceThreshold =
            0.68;

    }

    else if (
        items.length <= 15
    ) {

        confidenceThreshold =
            0.70;

    }

    else if (
        items.length <= 22
    ) {

        confidenceThreshold =
            0.72;

    }

    else if (
        items.length <= 30
    ) {

        confidenceThreshold =
            0.74;

    }

    else {

        confidenceThreshold =
            0.76;

    }


    /*
    ========================================================
    NORMAL STOPPING
    ========================================================

    Once the target has been reached, stopping becomes
    progressively more likely.

    This produces variation between games instead of
    making every game finish at exactly the same number.
    */


    const progress =
        (
            comparisons -
            target
        ) /
        Math.max(
            1,
            maximum -
            target
        );


    /*
        Clamp progress.
    */

    const normalizedProgress =
        Math.max(
            0,
            Math.min(
                1,
                progress
            )
        );


    /*
        Base probability.

        At target:

            ~12%

        Near maximum:

            ~88%
    */

    let stopChance =
        0.12 +
        (
            normalizedProgress *
            0.76
        );


    /*
        Confidence multiplier.

        Stronger ranking = easier to stop.

        Weak ranking = harder to stop.
    */

    if (
        confidence <
        confidenceThreshold
    ) {

        stopChance *=
            0.35;

    }

    else {

        stopChance *=
            0.75 +
            (
                (
                    confidence -
                    confidenceThreshold
                ) /
                Math.max(
                    0.01,
                    1 -
                    confidenceThreshold
                )
            ) *
            0.25;

    }


    /*
        Top ranking still matters.

        If the top of the ranking is unstable,
        reduce the stopping probability.
    */

    if (
        top < 0.55
    ) {

        stopChance *= 0.65;

    }


    /*
    ========================================================
    EXTRA PROTECTION AGAINST EARLY ENDINGS
    ========================================================
    */

    const earlyLimit =
        Math.ceil(
            target * 1.05
        );


    if (
        comparisons <
        earlyLimit
    ) {

        stopChance *= 0.35;

    }


    /*
    ========================================================
    LATE GAME
    ========================================================

    Once we are very close to maximum, increase pressure.

    This prevents difficult rankings from getting stuck
    indefinitely.
    */

    const remaining =
        maximum -
        comparisons;


    const lateThreshold =
        Math.max(
            8,
            Math.ceil(
                maximum * 0.08
            )
        );


    if (
        remaining <=
        lateThreshold
    ) {

        stopChance +=
            0.15;

    }


    /*
        Clamp.
    */

    stopChance =
        Math.max(
            0,
            Math.min(
                0.98,
                stopChance
            )
        );


    return (
        Math.random() <
        stopChance
    );

}


/* =========================================================
   FINISH GAME
========================================================= */

function finishGame() {

    if (gameFinished) {

        return;

    }


    gameFinished = true;


    updateStats();

    showResults();

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    const maximum =
        getMaximumComparisons();


    const count =
        document.getElementById(
            "comparison-count"
        );


    if (count) {

        count.textContent =
            comparisons;

    }


    const status =
        document.getElementById(
            "ranking-status"
        );


    if (status) {

        status.textContent =
            gameFinished
                ? "Complete"
                : "In progress";

    }


    const fill =
        document.getElementById(
            "progress-fill"
        );


    if (fill) {

        let percentage = 0;


        if (
            maximum > 0
        ) {

            percentage =
                (
                    comparisons /
                    maximum
                ) *
                100;

        }


        fill.style.width =
            `${Math.min(
                100,
                percentage
            )}%`;

    }


    const maximumElement =
        document.getElementById(
            "maximum-comparisons"
        );


    if (maximumElement) {

        maximumElement.textContent =
            maximum;

    }

}


/* =========================================================
   CURRENT RANKING
========================================================= */

function updateCurrentRanking() {

    const container =
        document.getElementById(
            "current-ranking"
        );


    if (!container) {

        return;

    }


    const sorted =
        [...items].sort(
            (
                a,
                b
            ) =>
                b.rating -
                a.rating
        );


    container.innerHTML = "";


    sorted.forEach(
        (
            item,
            index
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "current-ranking-item";


            /* RANK */

            const rank =
                document.createElement(
                    "span"
                );


            rank.className =
                "current-ranking-number";


            rank.textContent =
                index + 1;


            /* IMAGE */

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "current-ranking-image";


            image.src =
                item.image;


            image.alt =
                item.name;


            image.onerror =
                function () {

                    this.style.display =
                        "none";

                };


            /* NAME */

            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "current-ranking-name";


            name.textContent =
                item.name;


            /* RATING */

            const rating =
                document.createElement(
                    "span"
                );


            rating.className =
                "current-ranking-rating";


            rating.textContent =
                Math.round(
                    item.rating
                );


            row.appendChild(
                rank
            );


            row.appendChild(
                image
            );


            row.appendChild(
                name
            );


            row.appendChild(
                rating
            );


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   TOGGLE CURRENT RANKING
========================================================= */

function toggleCurrentRanking() {

    const container =
        document.getElementById(
            "current-ranking-container"
        );


    if (!container) {

        console.error(
            "Could not find #current-ranking-container"
        );

        return;

    }


    container.classList.toggle(
        "hidden"
    );


    const button =
        document.getElementById(
            "current-ranking-button"
        );


    if (!button) {

        return;

    }


    if (
        container.classList.contains(
            "hidden"
        )
    ) {

        button.textContent =
            "View Current Ranking";

    }

    else {

        button.textContent =
            "Hide Current Ranking";

    }

}


/* =========================================================
   RESULTS
========================================================= */

function showResults() {

    if (!currentRanker) {

        return;

    }


    const sorted =
        [...items].sort(
            (
                a,
                b
            ) =>
                b.rating -
                a.rating
        );


    const gameScreen =
        document.getElementById(
            "game-screen"
        );


    const homeScreen =
        document.getElementById(
            "home-screen"
        );


    const resultsScreen =
        document.getElementById(
            "results-screen"
        );


    if (gameScreen) {

        gameScreen.classList.add(
            "hidden"
        );

    }


    if (homeScreen) {

        homeScreen.classList.add(
            "hidden"
        );

    }


    if (resultsScreen) {

        resultsScreen.classList.remove(
            "hidden"
        );

    }


    const icon =
        document.getElementById(
            "results-icon"
        );


    if (icon) {

        icon.textContent =
            currentRanker.icon || "⭐";

    }


    const title =
        document.getElementById(
            "results-title"
        );


    if (title) {

        title.textContent =
            `Your ${currentRanker.title} Ranking`;

    }


    const subtitle =
        document.getElementById(
            "results-subtitle"
        );


    if (subtitle) {

        subtitle.textContent =
            `You made ${comparisons} choices.`;

    }


    const finalComparisons =
        document.getElementById(
            "final-comparisons"
        );


    if (finalComparisons) {

        finalComparisons.textContent =
            comparisons;

    }


    const results =
        document.getElementById(
            "results-list"
        );


    if (!results) {

        return;

    }


    results.innerHTML = "";


    sorted.forEach(
        (
            item,
            index
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "result-item";


            /* RANK */

            const rank =
                document.createElement(
                    "div"
                );


            rank.className =
                "result-rank";


            if (
                index === 0
            ) {

                rank.textContent =
                    "🥇";

            }

            else if (
                index === 1
            ) {

                rank.textContent =
                    "🥈";

            }

            else if (
                index === 2
            ) {

                rank.textContent =
                    "🥉";

            }

            else {

                rank.textContent =
                    index + 1;

            }


            /* IMAGE */

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "result-image";


            image.src =
                item.image;


            image.alt =
                item.name;


            image.onerror =
                function () {

                    this.style.display =
                        "none";

                };


            /* NAME */

            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "result-name";


            name.textContent =
                item.name;


            /* RATING */

            const rating =
                document.createElement(
                    "div"
                );


            rating.className =
                "result-rating";


            rating.textContent =
                Math.round(
                    item.rating
                );


            row.appendChild(
                rank
            );


            row.appendChild(
                image
            );


            row.appendChild(
                name
            );


            row.appendChild(
                rating
            );


            results.appendChild(
                row
            );

        }
    );


    window.scrollTo(
        0,
        0
    );

}


/* =========================================================
   RESTART
========================================================= */

function restartGame() {

    if (!currentRanker) {

        return;

    }


    startRanker(
        currentRanker.id
    );

}


/* =========================================================
   RETURN HOME
========================================================= */

function returnHome() {

    currentRanker = null;

    items = [];

    comparisons = 0;

    leftItem = null;

    rightItem = null;

    gameFinished = false;

    comparedPairs =
        new Set();

    pairHistory =
        new Map();


    showHome();

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderRankers();

    }
);