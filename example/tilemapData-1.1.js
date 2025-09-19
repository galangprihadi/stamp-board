const gameSet = {
    tileSize : 80,
    tileWidth : 5,
    tileHeight : 5,
    animationCycle : 2,
    moveDelay : 10,

    level1: {
        map: "/images/map.png",
        player: {x:2, y:3, direction: "down", image: "/images/cat.png"},
        goals: {
            goal1: {x:4, y:1, image: "/images/goalFish.png"},
            goal2: {x:3, y:3, image: "/images/goalFish.png"},
        },
        obstacles: {
            obs1: {x:1, y:1, image: "/images/obsBox.png"},
            obs2: {x:1, y:3, image: "/images/obsGrass.png"},
            obs3: {x:4, y:4, image: "/images/obsBox.png"},
        }
    }
}