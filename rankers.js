/*
============================================================
FANDOM RANKER DATABASE
============================================================

DO NOT put game logic here.

Each ranker needs:

id
slug
title
description
subtitle
icon
image
items

The "slug" controls the clean URL.

Examples:

/Fandom-Ranker/twice
/Fandom-Ranker/star-wars
/Fandom-Ranker/straw-hats
/Fandom-Ranker/mario-kart

============================================================
*/


const RANKERS = [


    /* =====================================================
       TWICE
    ===================================================== */

    {

        id: "twice-title-tracks",

        slug: "twice",

        title: "TWICE Title Tracks",

        description:
            "Rank TWICE title tracks",

        subtitle:
            "Choose your favorite TWICE song",

        icon: "🍭",

        image:
            "images/twice/twice.jpg",


        items: [

            {
                name: "Like OOH-AHH",
                image: "images/twice/like_ooh_ahh.jpg"
            },

            {
                name: "CHEER UP",
                image: "images/twice/cheer_up.jpg"
            },

            {
                name: "TT",
                image: "images/twice/tt.jpg"
            },

            {
                name: "KNOCK KNOCK",
                image: "images/twice/knock_knock.jpg"
            },

            {
                name: "SIGNAL",
                image: "images/twice/signal.jpg"
            },

            {
                name: "LIKEY",
                image: "images/twice/likey.jpg"
            },

            {
                name: "Heart Shaker",
                image: "images/twice/heart_shaker.jpg"
            },

            {
                name: "What Is Love?",
                image: "images/twice/what_is_love.jpg"
            },

            {
                name: "Dance the Night Away",
                image: "images/twice/dance_the_night_away.jpg"
            },

            {
                name: "YES or YES",
                image: "images/twice/yes_or_yes.jpg"
            },

            {
                name: "FANCY",
                image: "images/twice/fancy.jpg"
            },

            {
                name: "Feel Special",
                image: "images/twice/feel_special.jpg"
            },

            {
                name: "MORE & MORE",
                image: "images/twice/more_and_more.jpg"
            },

            {
                name: "I CAN'T STOP ME",
                image: "images/twice/i_cant_stop_me.jpg"
            },

            {
                name: "Alcohol-Free",
                image: "images/twice/alcohol_free.jpg"
            },

            {
                name: "SCIENTIST",
                image: "images/twice/scientist.jpg"
            },

            {
                name: "Talk that Talk",
                image: "images/twice/talk_that_talk.jpg"
            },

            {
                name: "SET ME FREE",
                image: "images/twice/set_me_free.jpg"
            },

            {
                name: "ONE SPARK",
                image: "images/twice/one_spark.jpg"
            },

            {
                name: "Strategy",
                image: "images/twice/strategy.jpg"
            },

            {
                name: "THIS IS FOR",
                image: "images/twice/this_is_for.jpg"
            },

            {
                name: "ME+YOU",
                image: "images/twice/me_you.jpg"
            }

        ]

    },


    /* =====================================================
       STAR WARS MOVIES
    ===================================================== */

    {

        id: "star-wars-movies",

        slug: "star-wars",

        title: "Star Wars Movies",

        description:
            "Rank the Star Wars movies",

        subtitle:
            "Choose your favorite Star Wars movie",

        icon: "🌌",

        image:
            "images/star-wars/movies.jpg",


        items: [

            {
                name: "A New Hope",
                image:
                    "images/star-wars/a_new_hope.jpg"
            },

            {
                name: "The Empire Strikes Back",
                image:
                    "images/star-wars/empire_strikes_back.jpg"
            },

            {
                name: "Return of the Jedi",
                image:
                    "images/star-wars/return_of_the_jedi.jpg"
            },

            {
                name: "The Phantom Menace",
                image:
                    "images/star-wars/phantom_menace.jpg"
            },

            {
                name: "Attack of the Clones",
                image:
                    "images/star-wars/attack_of_the_clones.jpg"
            },

            {
                name: "Revenge of the Sith",
                image:
                    "images/star-wars/revenge_of_the_sith.jpg"
            },

            {
                name: "The Force Awakens",
                image:
                    "images/star-wars/force_awakens.jpg"
            },

            {
                name: "The Last Jedi",
                image:
                    "images/star-wars/last_jedi.jpg"
            },

            {
                name: "The Rise of Skywalker",
                image:
                    "images/star-wars/rise_of_skywalker.jpg"
            },

            {
                name: "Rogue One",
                image:
                    "images/star-wars/rogue_one.jpg"
            },

            {
                name: "Solo",
                image:
                    "images/star-wars/solo.jpg"
            }

        ]

    },


    /* =====================================================
       ONE PIECE STRAW HATS
    ===================================================== */

    {

        id: "one-piece-straw-hats",

        slug: "straw-hats",

        title: "One Piece Straw Hats",

        description:
            "Rank the Straw Hat Pirates",

        subtitle:
            "Rank your favorite Straw Hat Pirates",

        icon: "🏴‍☠️",

        image:
            "images/one_piece.jpg",


        items: [

            {
                name: "Luffy",
                image:
                    "images/one_piece/luffy.jpg"
            },

            {
                name: "Zoro",
                image:
                    "images/one_piece/zoro.jpg"
            },

            {
                name: "Nami",
                image:
                    "images/one_piece/nami.jpg"
            },

            {
                name: "Usopp",
                image:
                    "images/one_piece/usopp.jpg"
            },

            {
                name: "Sanji",
                image:
                    "images/one_piece/sanji.jpg"
            },

            {
                name: "Chopper",
                image:
                    "images/one_piece/chopper.jpg"
            },

            {
                name: "Nico Robin",
                image:
                    "images/one_piece/robin.jpg"
            },

            {
                name: "Franky",
                image:
                    "images/one_piece/franky.jpg"
            },

            {
                name: "Brook",
                image:
                    "images/one_piece/brook.jpg"
            },

            {
                name: "Jinbe",
                image:
                    "images/one_piece/jinbe.jpg"
            }

        ]

    },


    /* =====================================================
       MARIO KART TRACKS
    ===================================================== */

    {

        id: "mario-kart-tracks",

        slug: "mario-kart",

        title: "Mario Kart Tracks",

        description:
            "Rank your favorite Mario Kart tracks",

        subtitle:
            "Rank your favorite Mario Kart tracks",

        icon: "🏎️",

        image:
            "images/mario_kart.jpg",


        items: [

            {
                name: "Mario Kart Stadium",
                image:
                    "images/mario_kart/mario_kart_stadium.jpg"
            },

            {
                name: "Water Park",
                image:
                    "images/mario_kart/water_park.jpg"
            },

            {
                name: "Sweet Sweet Canyon",
                image:
                    "images/mario_kart/sweet_sweet_canyon.jpg"
            },

            {
                name: "Thwomp Ruins",
                image:
                    "images/mario_kart/thwomp_ruins.jpg"
            },

            {
                name: "Mario Circuit",
                image:
                    "images/mario_kart/mario_circuit.jpg"
            },

            {
                name: "Toad Harbor",
                image:
                    "images/mario_kart/toad_harbor.jpg"
            },

            {
                name: "Twisted Mansion",
                image:
                    "images/mario_kart/twisted_mansion.jpg"
            },

            {
                name: "Shy Guy Falls",
                image:
                    "images/mario_kart/shy_guy_falls.jpg"
            },

            {
                name: "Sunshine Airport",
                image:
                    "images/mario_kart/sunshine_airport.jpg"
            },

            {
                name: "Dolphin Shoals",
                image:
                    "images/mario_kart/dolphin_shoals.jpg"
            },

            {
                name: "Electrodrome",
                image:
                    "images/mario_kart/electrodrome.jpg"
            },

            {
                name: "Mount Wario",
                image:
                    "images/mario_kart/mount_wario.jpg"
            },

            {
                name: "Cloudtop Cruise",
                image:
                    "images/mario_kart/cloudtop_cruise.jpg"
            },

            {
                name: "Bone-Dry Dunes",
                image:
                    "images/mario_kart/bone_dry_dunes.jpg"
            },

            {
                name: "Bowser's Castle",
                image:
                    "images/mario_kart/bowsers_castle.jpg"
            },

            {
                name: "Rainbow Road",
                image:
                    "images/mario_kart/rainbow_road.jpg"
            }

        ]

    }

];