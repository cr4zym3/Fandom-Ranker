/*
============================================================
FANDOM RANKER
APP.JS

GitHub Pages compatible routing

Base URL:
https://cr4zym3.github.io/Fandom-Ranker/

Routes:

/Fandom-Ranker/home
/Fandom-Ranker/<ranker-id>
/Fandom-Ranker/<ranker-id>/results

The important part of this version is that ALL routes
stay inside /Fandom-Ranker/.

Do NOT use:
    /home
    /twice
    /results

Use:
    /Fandom-Ranker/home
    /Fandom-Ranker/twice
    /Fandom-Ranker/twice/results

============================================================
*/


/* =========================================================
   CONFIGURATION
========================================================= */

const BASE_PATH = "/Fandom-Ranker";


/*
    GitHub Pages requires the repository name to remain
    in the URL.

    This helper creates a safe URL regardless of whether
    the user is currently on:

        /Fandom-Ranker
        /Fandom-Ranker/
        /Fandom-Ranker/home
        /Fandom-Ranker/twice
        /Fandom-Ranker/twice/results
*/


function appPath(path = "") {

    path = String(path || "").replace(/^\/+/, "");

    if (!path) {
        return BASE_PATH + "/";
    }

    return BASE_PATH + "/" + path;
}


/* =========================================================
   DOM REFERENCES
========================================================= */

const homeScreen =
    document.getElementById("home-screen");

const gameScreen =
    document.getElementById("game-screen");

const resultsScreen =
    document.getElementById("results-screen");

const rankerGrid =
    document.getElementById("ranker-grid");

const gameIcon =
    document.getElementById("game-icon");

const gameTitle =
    document.getElementById("game-title");

const gameSubtitle =
    document.getElementById("game-subtitle");

const comparisonCount =
    document.getElementById("comparison-count");

const maximumComparisons =
    document.getElementById("maximum-comparisons");

const rankingStatus =
    document.getElementById("ranking-status");

const progressFill =
    document.getElementById("progress-fill");

const leftImage =
    document.getElementById("left-image");

const rightImage =
    document.getElementById("right-image");

const leftName =
    document.getElementById("left-name");

const rightName =
    document.getElementById("right-name");

const currentRankingContainer =
    document.getElementById("current-ranking-container");

const currentRankingButton =
    document.getElementById("current-ranking-button");

const currentRanking =
    document.getElementById("current-ranking");

const resultsIcon =
    document.getElementById("results-icon");

const resultsTitle =
    document.getElementById("results-title");

const resultsSubtitle =
    document.getElementById("results-subtitle");

const finalComparisons =
    document.getElementById("final-comparisons");

const resultsList =
    document.getElementById("results-list");


/* =========================================================
   GAME STATE
========================================================= */

let currentRanker = null;

let currentRankerId = null;

let currentLeft = null;

let currentRight = null;

let comparisonCounter = 0;

let ranking = [];

let ratings = {};

let comparisons = {};

let gameFinished = false;

/* =========================================================
   GITHUB PAGES ROUTING
========================================================= */

function getBasePath() {
    return "/Fandom-Ranker";
}


function goToRoute(route) {

    const basePath = getBasePath();

    route = String(route || "")
        .replace(/^\/+/, "");

    window.history.pushState(
        {},
        "",
        basePath + "/" + route
    );

}

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_ELO = 1500;

const ELO_K = 32;


/*
    These values are deliberately separate from the routing
    system.

    Your rankers.js controls the fandom-specific settings.

    If a ranker supplies:

        maxComparisons

    that value is respected.

    Otherwise the game calculates the maximum from the
    number of items.
*/

const DEFAULT_MAX_COMPARISONS = 231;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    renderRankers();

    handleCurrentRoute();

}


/* =========================================================
   ROUTING
========================================================= */

/*
    Convert the browser pathname into a route inside the
    Fandom Ranker application.

    Examples:

        /Fandom-Ranker/
            -> home

        /Fandom-Ranker/home
            -> home

        /Fandom-Ranker/twice
            -> ranker twice

        /Fandom-Ranker/twice/results
            -> results for twice
*/


function getCurrentRoute() {

    let pathname =
        window.location.pathname;

    pathname =
        pathname.replace(/\/+$/, "");

    const base =
        BASE_PATH.replace(/\/+$/, "");

    if (
        pathname === "" ||
        pathname === base
    ) {
        return {
            type: "home",
            rankerId: null
        };
    }


    if (
        pathname === base + "/home"
    ) {
        return {
            type: "home",
            rankerId: null
        };
    }


    let relative =
        pathname.slice(base.length);

    relative =
        relative.replace(/^\/+/, "");


    if (!relative) {

        return {
            type: "home",
            rankerId: null
        };

    }


    const parts =
        relative.split("/");


    const rankerId =
        decodeURIComponent(parts[0]);


    if (
        parts.length >= 2 &&
        parts[1].toLowerCase() === "results"
    ) {

        return {
            type: "results",
            rankerId
        };

    }


    return {
        type: "game",
        rankerId
    };

}


/* =========================================================
   CHANGE URL
========================================================= */

function navigateTo(path) {

    const safePath =
        appPath(path);

    window.history.pushState(
        {},
        "",
        safePath
    );

    handleCurrentRoute();

}


/* =========================================================
   BROWSER BACK / FORWARD
========================================================= */

window.addEventListener(
    "popstate",
    function() {

        handleCurrentRoute();

    }
);


/* =========================================================
   HANDLE ROUTE
========================================================= */

function handleCurrentRoute() {

    const route =
        getCurrentRoute();


    if (route.type === "home") {

        showHome();

        return;

    }


    const ranker =
        findRanker(route.rankerId);


    if (!ranker) {

        /*
            If somebody visits an invalid route, send them
            to the application home page.

            IMPORTANT:

            This uses /Fandom-Ranker/home,
            NOT /home.
        */

        window.history.replaceState(
            {},
            "",
            appPath("home")
        );

        showHome();

        return;

    }


    if (route.type === "results") {

        /*
            Results are reconstructed from the current
            session if possible.
        */

        if (
            currentRankerId === route.rankerId &&
            ranking.length > 0
        ) {

            currentRanker =
                ranker;

            showResults();

        } else {

            /*
                There is no active game for this result URL.

                Start the fandom instead of showing a broken
                results page.
            */

            startRanker(
                ranker,
                false
            );

        }

        return;

    }


    if (route.type === "game") {

        /*
            If this is already the active game, do not
            unnecessarily reset it.
        */

        if (
            currentRankerId === route.rankerId &&
            currentRanker
        ) {

            showGame();

            return;

        }


        startRanker(
            ranker,
            false
        );

    }

}


/* =========================================================
   FIND RANKER
========================================================= */

function findRanker(id) {

    if (
        typeof RANKERS === "undefined" ||
        !Array.isArray(RANKERS)
    ) {

        console.error(
            "RANKERS was not found."
        );

        return null;

    }


    const normalizedId =
        String(id)
            .toLowerCase()
            .trim();


    return (
        RANKERS.find(
            ranker =>
                String(ranker.id)
                    .toLowerCase()
                    .trim() === normalizedId
        ) || null
    );

}


/* =========================================================
   RENDER FANDOMS
========================================================= */

function renderRankers() {

    if (!rankerGrid) {
        return;
    }


    rankerGrid.innerHTML = "";


    if (
        typeof RANKERS === "undefined" ||
        !Array.isArray(RANKERS)
    ) {

        rankerGrid.innerHTML = `
            <p>
                No fandoms available.
            </p>
        `;

        return;

    }


    RANKERS.forEach(
        ranker => {

            const card =
                document.createElement("button");

            card.type = "button";

            card.className =
                "ranker-card";


            /*
                IMPORTANT:

                The card does NOT use:

                    location.href = "/..."

                It calls navigateTo(), which automatically
                keeps the /Fandom-Ranker base path.
            */

            card.addEventListener(
                "click",
                function() {

                    startRanker(
                        ranker,
                        true
                    );

                }
            );


            const image =
                document.createElement("img");

            image.className =
                "ranker-card-image";

            image.alt =
                ranker.name || "Fandom";

            image.loading =
                "lazy";


            const imageURL =
                getRankerImage(
                    ranker
                );


            if (imageURL) {

                image.src =
                    imageURL;

            }


            image.onerror =
                function() {

                    this.style.display =
                        "none";

                };


            const info =
                document.createElement("div");

            info.className =
                "ranker-card-info";


            const icon =
                document.createElement("div");

            icon.className =
                "ranker-card-icon";

            icon.textContent =
                ranker.icon || "⭐";


            const title =
                document.createElement("h3");

            title.textContent =
                ranker.name ||
                ranker.title ||
                "Fandom";


            const description =
                document.createElement("p");

            description.textContent =
                ranker.description ||
                `${getItemCount(ranker)} items to rank`;


            info.appendChild(icon);

            info.appendChild(title);

            info.appendChild(description);


            card.appendChild(image);

            card.appendChild(info);


            rankerGrid.appendChild(card);

        }
    );

}


/* =========================================================
   RANKER IMAGE
========================================================= */

function getRankerImage(ranker) {

    if (!ranker) {
        return "";
    }


    /*
        Support the image property names used by different
        versions of rankers.js.
    */

    const possibleImages = [

        ranker.image,

        ranker.imageUrl,

        ranker.imageURL,

        ranker.cover,

        ranker.thumbnail,

        ranker.banner

    ];


    for (
        const image of possibleImages
    ) {

        if (
            typeof image === "string" &&
            image.trim()
        ) {

            return normalizeAssetURL(
                image
            );

        }

    }


    return "";

}


/* =========================================================
   NORMALIZE ASSET URL
========================================================= */

function normalizeAssetURL(url) {

    if (!url) {
        return "";
    }


    url =
        String(url).trim();


    /*
        Absolute URLs are left alone.

        Example:

        https://example.com/image.jpg
    */

    if (
        /^https?:\/\//i.test(url)
    ) {

        return url;

    }


    /*
        Data URLs are also left alone.
    */

    if (
        /^data:/i.test(url)
    ) {

        return url;

    }


    /*
        Root-relative paths need the repository path.

        /images/twice.jpg

        becomes:

        /Fandom-Ranker/images/twice.jpg
    */

    if (
        url.startsWith("/")
    ) {

        if (
            url.startsWith(
                BASE_PATH + "/"
            )
        ) {

            return url;

        }


        return BASE_PATH + url;

    }


    /*
        Relative asset paths.

        images/twice.jpg

        becomes:

        /Fandom-Ranker/images/twice.jpg
    */

    return (
        BASE_PATH +
        "/" +
        url.replace(/^\.?\//, "")
    );

}


/* =========================================================
   GET ITEMS
========================================================= */

function getItems(ranker) {

    if (!ranker) {
        return [];
    }


    if (
        Array.isArray(ranker.items)
    ) {

        return ranker.items;

    }


    if (
        Array.isArray(ranker.songs)
    ) {

        return ranker.songs;

    }


    if (
        Array.isArray(ranker.characters)
    ) {

        return ranker.characters;

    }


    if (
        Array.isArray(ranker.movies)
    ) {

        return ranker.movies;

    }


    if (
        Array.isArray(ranker.games)
    ) {

        return ranker.games;

    }


    return [];

}


/* =========================================================
   ITEM COUNT
========================================================= */

function getItemCount(ranker) {

    return getItems(ranker).length;

}


/* =========================================================
   ITEM ID
========================================================= */

function getItemId(item) {

    if (
        item &&
        typeof item === "object"
    ) {

        if (
            item.id !== undefined
        ) {

            return String(item.id);

        }


        if (
            item.name !== undefined
        ) {

            return String(item.name);

        }


        if (
            item.title !== undefined
        ) {

            return String(item.title);

        }

    }


    return String(item);

}


/* =========================================================
   ITEM NAME
========================================================= */

function getItemName(item) {

    if (
        item &&
        typeof item === "object"
    ) {

        return (
            item.name ||
            item.title ||
            item.label ||
            item.id ||
            "Unknown"
        );

    }


    return String(item);

}


/* =========================================================
   ITEM IMAGE
========================================================= */

function getItemImage(item) {

    if (!item) {
        return "";
    }


    if (
        typeof item === "object"
    ) {

        const possibleImages = [

            item.image,

            item.imageUrl,

            item.imageURL,

            item.cover,

            item.thumbnail,

            item.artwork,

            item.photo,

            item.poster,

            item.src

        ];


        for (
            const image of possibleImages
        ) {

            if (
                typeof image === "string" &&
                image.trim()
            ) {

                return normalizeAssetURL(
                    image
                );

            }

        }

    }


    return "";

}


/* =========================================================
   START RANKER
========================================================= */

function startRanker(
    ranker,
    updateURL = true
) {

    currentRanker =
        ranker;

    currentRankerId =
        String(ranker.id);


    resetGameState();


    if (updateURL) {

        navigateTo(
            currentRankerId
        );

        return;

    }


    showGame();

}


/* =========================================================
   RESET GAME
========================================================= */

function resetGameState() {

    const items =
        getItems(currentRanker);


    comparisonCounter =
        0;

    currentLeft =
        null;

    currentRight =
        null;

    gameFinished =
        false;


    ranking =
        [...items];


    ratings =
        {};


    comparisons =
        {};


    items.forEach(
        item => {

            ratings[
                getItemId(item)
            ] =
                DEFAULT_ELO;

        }
    );


    if (
        currentRankingContainer
    ) {

        currentRankingContainer
            .classList
            .add("hidden");

    }


    if (
        currentRankingButton
    ) {

        currentRankingButton.textContent =
            "View Current Ranking";

    }

}


/* =========================================================
   SHOW HOME
========================================================= */

function showHome() {

    if (homeScreen) {

        homeScreen.classList.remove(
            "hidden"
        );

    }


    if (gameScreen) {

        gameScreen.classList.add(
            "hidden"
        );

    }


    if (resultsScreen) {

        resultsScreen.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   SHOW GAME
========================================================= */

function showGame() {

    if (homeScreen) {

        homeScreen.classList.add(
            "hidden"
        );

    }


    if (gameScreen) {

        gameScreen.classList.remove(
            "hidden"
        );

    }


    if (resultsScreen) {

        resultsScreen.classList.add(
            "hidden"
        );

    }


    updateGameHeader();

    updateStats();

    chooseNextMatchup();

}


/* =========================================================
   GAME HEADER
========================================================= */

function updateGameHeader() {

    if (!currentRanker) {
        return;
    }


    const title =
        currentRanker.name ||
        currentRanker.title ||
        "Fandom Ranker";


    const subtitle =
        currentRanker.subtitle ||
        currentRanker.description ||
        "Choose your favorite";


    if (gameTitle) {

        gameTitle.textContent =
            title;

    }


    if (gameSubtitle) {

        gameSubtitle.textContent =
            subtitle;

    }


    const icon =
        currentRanker.icon ||
        "⭐";


    if (gameIcon) {

        gameIcon.textContent =
            icon;

    }

}


/* =========================================================
   GET MAX COMPARISONS
========================================================= */

function getMaximum() {

    if (!currentRanker) {

        return DEFAULT_MAX_COMPARISONS;

    }


    if (
        Number.isFinite(
            Number(
                currentRanker.maxComparisons
            )
        )
    ) {

        return Math.max(
            1,
            Number(
                currentRanker.maxComparisons
            )
        );

    }


    if (
        Number.isFinite(
            Number(
                currentRanker.maximumComparisons
            )
        )
    ) {

        return Math.max(
            1,
            Number(
                currentRanker.maximumComparisons
            )
        );

    }


    const count =
        getItemCount(
            currentRanker
        );


    /*
        Full pairwise maximum.

        n(n-1)/2
    */

    if (count > 1) {

        return (
            count *
            (count - 1) /
            2
        );

    }


    return DEFAULT_MAX_COMPARISONS;

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    const maximum =
        getMaximum();


    if (comparisonCount) {

        comparisonCount.textContent =
            comparisonCounter;

    }


    if (maximumComparisons) {

        maximumComparisons.textContent =
            maximum;

    }


    if (progressFill) {

        const percentage =
            Math.min(
                100,
                (
                    comparisonCounter /
                    maximum
                ) * 100
            );


        progressFill.style.width =
            percentage + "%";

    }


    if (rankingStatus) {

        if (gameFinished) {

            rankingStatus.textContent =
                "Complete";

        } else {

            rankingStatus.textContent =
                "In progress";

        }

    }

}


/* =========================================================
   CHOOSE NEXT MATCHUP
========================================================= */

function chooseNextMatchup() {

    if (gameFinished) {
        return;
    }


    const items =
        getItems(currentRanker);


    if (items.length < 2) {

        finishGame();

        return;

    }


    if (
        comparisonCounter >=
        getMaximum()
    ) {

        finishGame();

        return;

    }


    /*
        Find two different items that have not been
        compared recently.

        The scoring system still uses Elo ratings,
        but matchup selection tries to compare items
        that are close in rating.
    */

    const candidates =
        [...items];


    candidates.sort(
        () =>
            Math.random() - 0.5
    );


    let bestPair =
        null;

    let bestDifference =
        Infinity;


    for (
        let i = 0;
        i < candidates.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < candidates.length;
            j++
        ) {

            const a =
                candidates[i];

            const b =
                candidates[j];


            const idA =
                getItemId(a);

            const idB =
                getItemId(b);


            const pairKey =
                makePairKey(
                    idA,
                    idB
                );


            const previous =
                comparisons[
                    pairKey
                ] || 0;


            /*
                Avoid repeatedly asking the exact same pair
                when there are other choices available.
            */

            if (
                previous >= 3
            ) {

                continue;

            }


            const ratingA =
                ratings[idA] ??
                DEFAULT_ELO;

            const ratingB =
                ratings[idB] ??
                DEFAULT_ELO;


            const difference =
                Math.abs(
                    ratingA -
                    ratingB
                );


            if (
                difference <
                bestDifference
            ) {

                bestDifference =
                    difference;

                bestPair =
                    [
                        a,
                        b
                    ];

            }

        }

    }


    /*
        Fallback if all remaining pairs have been used
        multiple times.
    */

    if (!bestPair) {

        let a =
            candidates[0];

        let b =
            candidates[1];


        bestPair =
            [
                a,
                b
            ];

    }


    currentLeft =
        bestPair[0];

    currentRight =
        bestPair[1];


    renderMatchup();

}


/* =========================================================
   PAIR KEY
========================================================= */

function makePairKey(
    idA,
    idB
) {

    return [
        String(idA),
        String(idB)
    ]
        .sort()
        .join("::");

}


/* =========================================================
   RENDER MATCHUP
========================================================= */

function renderMatchup() {

    if (
        !currentLeft ||
        !currentRight
    ) {

        return;

    }


    const leftNameValue =
        getItemName(
            currentLeft
        );


    const rightNameValue =
        getItemName(
            currentRight
        );


    if (leftName) {

        leftName.textContent =
            leftNameValue;

    }


    if (rightName) {

        rightName.textContent =
            rightNameValue;

    }


    const leftURL =
        getItemImage(
            currentLeft
        );


    const rightURL =
        getItemImage(
            currentRight
        );


    if (leftImage) {

        leftImage.src =
            leftURL;

        leftImage.alt =
            leftNameValue;

        leftImage.onerror =
            function() {

                this.removeAttribute(
                    "src"
                );

            };

    }


    if (rightImage) {

        rightImage.src =
            rightURL;

        rightImage.alt =
            rightNameValue;

        rightImage.onerror =
            function() {

                this.removeAttribute(
                    "src"
                );

            };

    }

}


/* =========================================================
   CHOOSE WINNER
========================================================= */

function chooseWinner(side) {

    if (
        gameFinished ||
        !currentLeft ||
        !currentRight
    ) {

        return;

    }


    let winner;

    let loser;


    if (side === "left") {

        winner =
            currentLeft;

        loser =
            currentRight;

    } else {

        winner =
            currentRight;

        loser =
            currentLeft;

    }


    recordComparison(
        winner,
        loser
    );


    comparisonCounter++;


    updateStats();


    /*
        Give the interface a tiny amount of time to update
        before showing the next matchup.
    */

    setTimeout(
        function() {

            if (
                comparisonCounter >=
                getMaximum()
            ) {

                finishGame();

                return;

            }


            if (
                shouldFinishEarly()
            ) {

                finishGame();

                return;

            }


            chooseNextMatchup();

        },
        40
    );

}


/* =========================================================
   RECORD COMPARISON
========================================================= */

function recordComparison(
    winner,
    loser
) {

    const winnerId =
        getItemId(winner);

    const loserId =
        getItemId(loser);


    const pairKey =
        makePairKey(
            winnerId,
            loserId
        );


    comparisons[pairKey] =
        (
            comparisons[pairKey] ||
            0
        ) + 1;


    const winnerRating =
        ratings[winnerId] ??
        DEFAULT_ELO;

    const loserRating =
        ratings[loserId] ??
        DEFAULT_ELO;


    /*
        Standard Elo expected score.
    */

    const expectedWinner =
        1 /
        (
            1 +
            Math.pow(
                10,
                (
                    loserRating -
                    winnerRating
                ) / 400
            )
        );


    const expectedLoser =
        1 -
        expectedWinner;


    ratings[winnerId] =
        winnerRating +
        ELO_K *
        (
            1 -
            expectedWinner
        );


    ratings[loserId] =
        loserRating +
        ELO_K *
        (
            0 -
            expectedLoser
        );


    sortRanking();


    updateCurrentRanking();

}


/* =========================================================
   SORT RANKING
========================================================= */

function sortRanking() {

    ranking.sort(
        function(a, b) {

            const ratingA =
                ratings[
                    getItemId(a)
                ] ??
                DEFAULT_ELO;


            const ratingB =
                ratings[
                    getItemId(b)
                ] ??
                DEFAULT_ELO;


            return ratingB - ratingA;

        }
    );

}


/* =========================================================
   EARLY STOPPING
========================================================= */

/*
    The game should not always force the user to reach the
    full pairwise maximum.

    It can finish once the top portion of the ranking has
    become sufficiently stable.

    The maximum is ALWAYS available as a hard ceiling.
*/

function shouldFinishEarly() {

    const count =
        getItemCount(
            currentRanker
        );


    if (count < 3) {
        return true;
    }


    /*
        Never finish extremely early.
    */

    if (
        comparisonCounter < 60
    ) {

        return false;

    }


    /*
        Give smaller databases a reasonable amount of
        information before stopping.
    */

    const minimum =
        Math.min(
            120,
            Math.floor(
                count *
                2.5
            )
        );


    if (
        comparisonCounter <
        minimum
    ) {

        return false;

    }


    sortRanking();


    /*
        Calculate how many of the top items have ratings
        separated enough to be considered stable.
    */

    const topCount =
        Math.min(
            10,
            count
        );


    let stablePairs =
        0;


    for (
        let i = 0;
        i < topCount - 1;
        i++
    ) {

        const itemA =
            ranking[i];

        const itemB =
            ranking[i + 1];


        const ratingA =
            ratings[
                getItemId(itemA)
            ] ??
            DEFAULT_ELO;


        const ratingB =
            ratings[
                getItemId(itemB)
            ] ??
            DEFAULT_ELO;


        if (
            Math.abs(
                ratingA -
                ratingB
            ) >= 45
        ) {

            stablePairs++;

        }

    }


    /*
        Most of the top ranking has a meaningful separation.
    */

    if (
        stablePairs >=
        Math.max(
            3,
            topCount - 3
        )
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   UPDATE CURRENT RANKING
========================================================= */

function updateCurrentRanking() {

    if (!currentRanking) {
        return;
    }


    sortRanking();


    currentRanking.innerHTML = "";


    ranking.forEach(
        function(item, index) {

            const row =
                document.createElement("div");

            row.className =
                "current-ranking-item";


            const number =
                document.createElement("div");

            number.className =
                "current-ranking-number";

            number.textContent =
                index + 1;


            const image =
                document.createElement("img");

            image.className =
                "current-ranking-image";

            image.alt =
                getItemName(item);


            const imageURL =
                getItemImage(item);


            if (imageURL) {

                image.src =
                    imageURL;

            }


            image.onerror =
                function() {

                    this.style.visibility =
                        "hidden";

                };


            const name =
                document.createElement("div");

            name.className =
                "current-ranking-name";

            name.textContent =
                getItemName(item);


            const rating =
                document.createElement("div");

            rating.className =
                "current-ranking-rating";

            rating.textContent =
                Math.round(
                    ratings[
                        getItemId(item)
                    ] ??
                    DEFAULT_ELO
                );


            row.appendChild(number);

            row.appendChild(image);

            row.appendChild(name);

            row.appendChild(rating);


            currentRanking.appendChild(row);

        }
    );

}


/* =========================================================
   TOGGLE CURRENT RANKING
========================================================= */

function toggleCurrentRanking() {

    if (
        !currentRankingContainer
    ) {

        return;

    }


    const hidden =
        currentRankingContainer
            .classList
            .contains("hidden");


    if (hidden) {

        currentRankingContainer
            .classList
            .remove("hidden");


        if (currentRankingButton) {

            currentRankingButton.textContent =
                "Hide Current Ranking";

        }


        updateCurrentRanking();

    } else {

        currentRankingContainer
            .classList
            .add("hidden");


        if (currentRankingButton) {

            currentRankingButton.textContent =
                "View Current Ranking";

        }

    }

}


/* =========================================================
   FINISH GAME
========================================================= */

function finishGame() {

    if (gameFinished) {
        return;
    }


    gameFinished =
        true;


    sortRanking();


    updateStats();


    showResults();


    /*
        IMPORTANT:

        The URL remains inside:

        /Fandom-Ranker/

        Example:

        /Fandom-Ranker/twice/results
    */

    const resultPath =
        currentRankerId +
        "/results";


    window.history.pushState(
        {},
        "",
        appPath(
            resultPath
        )
    );

}


/* =========================================================
   SHOW RESULTS
========================================================= */

function showResults() {

    if (homeScreen) {

        homeScreen.classList.add(
            "hidden"
        );

    }


    if (gameScreen) {

        gameScreen.classList.add(
            "hidden"
        );

    }


    if (resultsScreen) {

        resultsScreen.classList.remove(
            "hidden"
        );

    }


    sortRanking();


    const title =
        currentRanker
            ? (
                currentRanker.name ||
                currentRanker.title ||
                "Your Ranking"
            )
            : "Your Ranking";


    const icon =
        currentRanker
            ? (
                currentRanker.icon ||
                "⭐"
            )
            : "⭐";


    if (resultsIcon) {

        resultsIcon.textContent =
            icon;

    }


    if (resultsTitle) {

        resultsTitle.textContent =
            title +
            " Ranking";

    }


    if (resultsSubtitle) {

        resultsSubtitle.textContent =
            `You made ${comparisonCounter} choices.`;

    }


    if (finalComparisons) {

        finalComparisons.textContent =
            comparisonCounter;

    }


    renderResults();

}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults() {

    if (!resultsList) {
        return;
    }


    resultsList.innerHTML = "";


    ranking.forEach(
        function(item, index) {

            const row =
                document.createElement("div");

            row.className =
                "result-item";


            const rank =
                document.createElement("div");

            rank.className =
                "result-rank";

            rank.textContent =
                index + 1;


            const image =
                document.createElement("img");

            image.className =
                "result-image";

            image.alt =
                getItemName(item);


            const imageURL =
                getItemImage(item);


            if (imageURL) {

                image.src =
                    imageURL;

            }


            image.onerror =
                function() {

                    this.style.visibility =
                        "hidden";

                };


            const name =
                document.createElement("div");

            name.className =
                "result-name";

            name.textContent =
                getItemName(item);


            const rating =
                document.createElement("div");

            rating.className =
                "result-rating";

            rating.textContent =
                Math.round(
                    ratings[
                        getItemId(item)
                    ] ??
                    DEFAULT_ELO
                );


            row.appendChild(rank);

            row.appendChild(image);

            row.appendChild(name);

            row.appendChild(rating);


            resultsList.appendChild(row);

        }
    );

}


/* =========================================================
   RETURN HOME
========================================================= */

/*
    THIS IS THE MAIN FIX FOR YOUR 404.

    The old version was effectively doing something like:

        history.pushState({}, "", "/home");

    That creates:

        https://cr4zym3.github.io/home

    The new version does:

        navigateTo("home");

    which creates:

        https://cr4zym3.github.io/Fandom-Ranker/home
*/

function returnHome() {

    currentRanker =
        null;

    currentRankerId =
        null;

    gameFinished =
        false;


    window.history.pushState(
        {},
        "",
        appPath("home")
    );


    showHome();

}


/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {

    if (!currentRanker) {

        returnHome();

        return;

    }


    resetGameState();


    /*
        Keep the user inside the fandom route.

        Example:

        /Fandom-Ranker/twice
    */

    window.history.pushState(
        {},
        "",
        appPath(
            currentRankerId
        )
    );


    showGame();

}


/* =========================================================
   EXPOSE FUNCTIONS FOR HTML ONCLICK
========================================================= */

/*
    Your HTML currently uses inline handlers:

        onclick="returnHome()"
        onclick="chooseWinner('left')"
        onclick="toggleCurrentRanking()"
        onclick="restartGame()"

    Explicitly expose them globally so they continue to
    work regardless of browser/module behavior.
*/

window.returnHome =
    returnHome;

window.restartGame =
    restartGame;

window.chooseWinner =
    chooseWinner;

window.toggleCurrentRanking =
    toggleCurrentRanking;


/* =========================================================
   GITHUB PAGES SAFETY
========================================================= */

/*
    GitHub Pages does not natively provide server-side
    history fallback.

    Therefore:

        /Fandom-Ranker/home

    can work while navigating inside the SPA, but a direct
    browser refresh on that URL can still produce a GitHub
    Pages 404 unless the repository has a fallback strategy.

    This script handles client-side routing correctly.

    The safest deployment setup is to also include a
    404.html that redirects unknown GitHub Pages paths back
    into the application.

    See the replacement 404.html below.
*/


/* =========================================================
   DEBUG INFORMATION
========================================================= */

console.log(
    "Fandom Ranker loaded."
);

console.log(
    "Base path:",
    BASE_PATH
);

console.log(
    "Current route:",
    getCurrentRoute()
);