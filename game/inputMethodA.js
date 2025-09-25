const gameSet = {
    tileSize : 80,
    tileWidth : 6,
    tileHeight : 5,
    playerAniCycle : 2,
    playerDelay : 5,
    goalAniCycle : 12,
    obsAniCycle : 12,
    defaultMode : "Tap Mode",
    
    // inputType => "Tap Mode" "Scroll Mode" "Flick Mode" "Drag and Drop" "Stamp Mode"

    level1: {
        map: "../images/map.png",
        commandLength: 8,
        inputType: "Tap Mode",
        player: {x:1, y:1, direction: "down", image: "../images/cat.png"},
        goals: {
            goal1: {x:3, y:1, image: "../images/goalFish.png"},
            goal2: {x:3, y:3, image: "../images/goalFish.png"},
        },
        obstacles: {
            obs1: {x:5, y:1, image: "../images/obsBox.png"},
            obs2: {x:5, y:2, image: "../images/obsBox.png"},
            obs3: {x:0, y:4, image: "../images/obsGrass.png"},
            obs4: {x:1, y:3, image: "../images/obsGrass.png"},
            obs5: {x:2, y:2, image: "../images/obsGrass.png"},
        }
    },

    level2: {
        map: "../images/map.png",
        commandLength: 8,
        inputType: "Scroll Mode",
        player: {x:1, y:1, direction: "down", image: "../images/cat.png"},
        goals: {
            goal1: {x:2, y:2, image: "../images/goalFish.png"},
            goal2: {x:3, y:3, image: "../images/goalFish.png"},
        },
        obstacles: {
            obs1: {x:1, y:2, image: "../images/obsBox.png"},
            obs2: {x:2, y:3, image: "../images/obsBox.png"},
            obs3: {x:3, y:4, image: "../images/obsBox.png"},
            obs4: {x:2, y:0, image: "../images/obsGrass.png"},
            obs5: {x:3, y:1, image: "../images/obsGrass.png"},
            obs6: {x:4, y:2, image: "../images/obsGrass.png"},
        }
    },

    level3: {
        map: "../images/map.png",
        commandLength: 8,
        inputType: "Flick Mode",
        player: {x:1, y:1, direction: "down", image: "../images/cat.png"},
        goals: {
            goal1: {x:2, y:2, image: "../images/goalFish.png"},
            goal2: {x:4, y:2, image: "../images/goalFish.png"},
        },
        obstacles: {
            obs1: {x:1, y:2, image: "../images/obsBox.png"},
            obs2: {x:1, y:3, image: "../images/obsBox.png"},
            obs3: {x:1, y:4, image: "../images/obsBox.png"},
            obs4: {x:3, y:1, image: "../images/obsGrass.png"},
            obs5: {x:4, y:1, image: "../images/obsGrass.png"},
        }
    },

    level4: {
        map: "../images/map.png",
        commandLength: 8,
        inputType: "Drag and Drop",
        player: {x:1, y:3, direction: "down", image: "../images/cat.png"},
        goals: {
            goal1: {x:2, y:2, image: "../images/goalFish.png"},
            goal2: {x:3, y:1, image: "../images/goalFish.png"},
        },
        obstacles: {
            obs1: {x:1, y:2, image: "../images/obsBox.png"},
            obs2: {x:2, y:1, image: "../images/obsBox.png"},
            obs3: {x:3, y:0, image: "../images/obsBox.png"},
            obs4: {x:3, y:3, image: "../images/obsGrass.png"},
            obs5: {x:4, y:2, image: "../images/obsGrass.png"},
            obs6: {x:5, y:1, image: "../images/obsGrass.png"},
        }
    },

    level5: {
        map: "../images/map.png",
        commandLength: 8,
        inputType: "Stamp Mode",
        player: {x:2, y:3, direction: "down", image: "../images/cat.png"},
        goals: {
            goal1: {x:4, y:1, image: "../images/goalFish.png"},
            goal2: {x:4, y:3, image: "../images/goalFish.png"},
        },
        obstacles: {
            obs1: {x:0, y:4, image: "../images/obsBox.png"},
            obs2: {x:1, y:3, image: "../images/obsBox.png"},
            obs3: {x:2, y:2, image: "../images/obsGrass.png"},
            obs4: {x:3, y:1, image: "../images/obsGrass.png"},
            obs5: {x:3, y:2, image: "../images/obsGrass.png"},
        }
    },
}