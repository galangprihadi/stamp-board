document.addEventListener("keydown", (event) => {
    // console.log(event.key);
    
    if(event.key === "ArrowUp") {
        game.player.setWalk("up");
    }
    else if(event.key === "ArrowRight") {
        game.player.setWalk("right");
    }
    else if(event.key === "ArrowDown") {
        game.player.setWalk("down");
    }
    else if(event.key === "ArrowLeft") {
        game.player.setWalk("left");
    }
    else if(event.key === " ") {
        game.resetLevel();
    }
});

let commands = [];

function arrowButton(direction) {
    if (direction != "walk") {
        commands.push(direction);
        console.log(commands);
    }
    else {
        console.log("walk");
    }
}

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////  Game Engine

class TilemapGame {
    gameCanvas = document.getElementById("game-canvas");
    gameCtx = document.getElementById("game-canvas").getContext("2d");

    constructor() {
        this.currentLevel = 1;
        this.map = new Map(this);
        this.player = new Player(this);
        this.goals = new Objects(this);
        this.obs = new Objects(this);
        this.objectReady = 0;
        
        this.loadLevel();
    }

    loadLevel() {
        this.gameLevel = gameSet[`level${this.currentLevel}`];

        this.map.loadLevel(this.gameLevel.map);
        this.player.loadLevel(this.gameLevel.player);
        this.goals.loadLevel(this.gameLevel.goals);
        this.obs.loadLevel(this.gameLevel.obstacles);
    }

    resetLevel() {
        this.player.resetLevel();
        this.goals.resetLevel();
        this.obs.resetLevel();
    }

    setObjectReady() {
        this.objectReady += 1;

        if (this.objectReady == 4) {
            this.gameLoop();
        }
    }

    gameLoop() {
        this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        this.map.draw();
        this.obs.draw();
        this.goals.draw();
        this.player.draw();
        
        requestAnimationFrame(() => {
            this.gameLoop();
        });
    }   
}


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////  Map Class

class Map {
    constructor(parent) {
        this.parent = parent;
        this.imageLoaded = false;
    }

    loadLevel(param) {
        this.image = new Image();
        this.image.onload = () => {
            this.imageLoaded = true;
            this.parent.setObjectReady();
        }
        this.image.src = param;
    }

    draw() {
        if (this.imageLoaded) {
            this.parent.gameCtx.drawImage(this.image, 0, 0);
        }
    }
}


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////  Player Class

class Player {
    constructor(parent) {
        this.parent = parent;

        this.animation = "walk-down";
        this.animationCycle = gameSet.animationCycle;
        this.animationProgres = 0;
        this.walkingProgess = 0;
        this.frame = 0;
        this.imageLoaded = false;
        this.pos = {};

        this.keyFrame = {
        // |  keyFrame   | frame 0 | frame 1 | frame 2 | frame 3 | frame 4 | frame 5 
            "idle-down" : [ [0,0] ],
            "idle-right": [ [0,1] ],
            "idle-up"   : [ [0,2] ],
            "idle-left" : [ [0,3] ],
            "walk-down" : [ [0,0],    [1,0],    [2,0],    [3,0],    [4,0],    [5,0] ],
            "walk-right": [ [0,1],    [1,1],    [2,1],    [3,1],    [4,1],    [5,1] ],
            "walk-up"   : [ [0,2],    [1,2],    [2,2],    [3,2],    [4,2],    [5,2] ],
            "walk-left" : [ [0,3],    [1,3],    [2,3],    [3,3],    [4,3],    [5,3] ],
        }
    }

    loadLevel(param) {
        this.image = new Image();
        this.image.onload = () => {
            this.imageLoaded = true;
            this.parent.setObjectReady();
        }
        this.image.src = param.image;

        this.firstPos = {x : param.x * gameSet.tileSize, y : param.y * gameSet.tileSize};
        this.firstDirection = param.direction;

        this.resetLevel();
    }

    resetLevel() {
        this.pos.x = this.firstPos.x;
        this.pos.y = this.firstPos.y;
        this.direction = this.firstDirection;
        this.isActive = true;
        this.goalAchieved = 0;
    }

    setWalk(direction) {
        if (this.walkingProgess == 0) {
            this.direction = direction;
            this.animation = "walk-" + this.direction;
            this.walkingProgess = gameSet.tileSize;
        }
    }

    getFrame() {
        return this.keyFrame[this.animation][this.frame];
    }

    draw() {
        const [frameX, frameY] = this.getFrame();

        if (this.imageLoaded) {
            this.parent.gameCtx.drawImage(
                this.image, 
                frameX * gameSet.tileSize, frameY * gameSet.tileSize,
                gameSet.tileSize, gameSet.tileSize,
                this.pos.x, this.pos.y,
                gameSet.tileSize, gameSet.tileSize
            );
        }
        
        if (this.animationProgres > 0) {
            this.animationProgres -= 1;
        }
        else {
            this.animationProgres = this.animationCycle;
            this.frame += 1;

            if (this.getFrame() === undefined) {
                this.frame = 0;
            }
        }

        if (this.isActive && this.walkingProgess > 0) {
            switch (this.direction) {
                case "up" : this.pos.y -= 1; break;
                case "down" : this.pos.y += 1; break;
                case "left" : this.pos.x -= 1; break;
                case "right" : this.pos.x += 1; break;
            }

            if (this.walkingProgess == 1) {
                for (let i=0; i < this.parent.goals.images.length; i++) {
                    if (this.pos.x == this.parent.goals.pos[i].x && this.pos.y == this.parent.goals.pos[i].y) {
                        this.goalAchieved += 1;
                        this.parent.goals.isVisible[i] = false;

                        if (this.goalAchieved == this.parent.goals.images.length) {
                            this.direction = "down";
                            console.log("game over");
                        }
                    }
                }
            }

            this.walkingProgess -= 1;
        }
        else {
            this.frame = 0;
            this.animation = `idle-${this.direction}`;
        }
    }
}


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////  Objects Class

class Objects {
    constructor(parent) {
        this.parent = parent;
        this.images = [];
        this.pos = [];
        this.frame = [];
        this.isVisible = [];

        this.animationCycle = 12;
        this.animationProgres = 0;
        this.imageLoaded = false;
    }

    loadLevel(param) {
        const imagePaths = Object.values(param).map(obj => obj.image);
        const posX = Object.values(param).map(obj => obj.x);
        const posY = Object.values(param).map(obj => obj.y);

        let loadedImages = 0;

        imagePaths.forEach((path, i) => {
            this.images[i] = new Image();
            this.images[i].onload = () => {
                loadedImages += 1;
                if (loadedImages === imagePaths.length) {
                    this.imageLoaded = true;
                    this.parent.setObjectReady();
                }
            }
            this.images[i].src = path;

            this.pos.push({x:posX[i] * gameSet.tileSize, y:posY[i] * gameSet.tileSize});
            this.frame.push(Math.floor(Math.random() * 6));
        });

        this.resetLevel();
    }

    resetLevel() {
        for (let i=0; i < this.images.length; i++) {
            this.isVisible[i] = true;
        }
    }

    draw() {
        for (let i=0; i < this.images.length; i++) {
            if (this.imageLoaded && this.isVisible[i]){
                this.parent.gameCtx.drawImage(
                    this.images[i], 
                    this.frame[i] * gameSet.tileSize, 0,
                    gameSet.tileSize, gameSet.tileSize,
                    this.pos[i].x, this.pos[i].y,
                    gameSet.tileSize, gameSet.tileSize
                );
            }

            if (this.animationProgres > 0) {
                this.animationProgres -= 1;
            }
            else {
                this.animationProgres = this.animationCycle;
                this.frame[i] += 1;

                if (this.frame[i] === 6) {
                    this.frame[i] = 0;
                }
            }
        }
    }
}