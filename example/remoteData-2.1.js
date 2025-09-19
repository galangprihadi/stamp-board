const gameSet = {
    tileSize : 80,
    tileWidth : 6,
    tileHeight : 5,
    playerAniCycle : 2,
    playerDelay : 5,
    goalAniCycle : 12,
    obsAniCycle : 12,
    defaultMode : "Tap Mode",
    
    // inputType => "Tap Mode" "Scroll Mode" "Flick Mode" "Stamp Mode" "Drag and Drop"

    level1: {
        map: "/images/map.png",
        commandLength: 7,
        inputType: "Drag and Drop",
        player: {x:2, y:3, direction: "down", image: "/images/cat.png"},
        goals: {
            goal1: {x:3, y:3, image: "/images/goalFish.png"},
            // goal2: {x:4, y:2, image: "/images/goalFish.png"},
            // goal3: {x:5, y:1, image: "/images/goalFish.png"},
        },
        obstacles: {
            obs1: {x:1, y:1, image: "/images/obsBox.png"},
            obs2: {x:1, y:3, image: "/images/obsGrass.png"},
            obs3: {x:4, y:4, image: "/images/obsBox.png"},
        }
    },

    level2: {
        map: "/images/map.png",
        commandLength: 7,
        inputType: "Drag and Drop",
        player: {x:2, y:3, direction: "down", image: "/images/cat.png"},
        goals: {
            // goal1: {x:4, y:1, image: "/images/goalFish.png"},
            // goal2: {x:3, y:3, image: "/images/goalFish.png"},
            goal1: {x:2, y:2, image: "/images/goalFish.png"},
        },
        obstacles: {
            obs1: {x:1, y:1, image: "/images/obsBox.png"},
            obs2: {x:1, y:3, image: "/images/obsGrass.png"},
            obs3: {x:4, y:4, image: "/images/obsBox.png"},
        }
    }
}