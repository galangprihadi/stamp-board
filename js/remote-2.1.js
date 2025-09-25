
//////////////////////////////////////////////////////////////////////////////////////
////////////////////////     Remote Game Engine Ver. 1.1      ////////////////////////
////////////////////////     17 Sept, 2025                    ////////////////////////
////////////////////////     Galang P Mahardhika              ////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

class TilemapGame {

    // ======================================================================================> Elements
    gameTransition = document.querySelector(".game-transition");
    gameCanvas = document.querySelector("#game-canvas");
    gameCtx = document.getElementById("game-canvas").getContext("2d");
    commandPanel = document.querySelector("#command-panel");
    inputPanel = document.querySelector("#input-panel");
    textLevel = document.getElementById("level-text");

    btnSwitch = document.getElementById("button-switch");
    btnExit = document.getElementById("button-exit");
    btnFullScreen = document.getElementById("button-fullscreen");
    btnUndo = document.getElementById("button-run");


    // ======================================================================================> Sounds
    soundBgm = document.getElementById("soundBgm");
    soundCling = document.getElementById("soundCling");
    soundDone = document.getElementById("soundDone");
    soundPop = document.getElementById("soundPop");
    soundShake = document.getElementById("soundShake");
    soundTransition = document.getElementById("soundTransition");

    playSound(soundId) {
        if (soundId == "bgm") {
            // this.soundBg.currentTime = 0;
            this.soundBgm.play();
        }
        else if (soundId == "cling") {
            this.soundCling.currentTime = 0;
            this.soundCling.play();
        }
        else if (soundId == "done") {
            this.soundDone.currentTime = 0;
            this.soundDone.play();
        }
        else if (soundId == "pop") {
            this.soundPop.currentTime = 0;
            this.soundPop.play();
        }
        else if (soundId == "shake") {
            this.soundShake.currentTime = 0;
            this.soundShake.play();
        }
        else if (soundId == "transition") {
            this.soundBgm.pause();
            this.soundDone.pause();
            this.soundTransition.currentTime = 0;
            this.soundTransition.play();
        }
    }

    setTransition() {
        const handlerOut = () => {
            this.gameTransition.removeAttribute("style");
            this.gameTransition.style.display = "none";
            this.gameTransition.removeEventListener("animationend", handlerOut);
        }

        const handlerIn = () => {
            this.gameTransition.removeAttribute("style");
            this.gameTransition.classList.add("ani-transition-out");
            this.gameTransition.addEventListener("animationend", handlerOut);
            this.gameTransition.removeEventListener("animationend", handlerIn);
        }

        this.gameTransition.removeAttribute("style");
        this.gameTransition.classList.add("ani-transition-in");
        this.gameTransition.addEventListener("animationend", handlerIn);
    }


    // ======================================================================================> Constructor
    constructor (param) {
        this.switchMode = param.switchMode ?? false;
        this.homePage = param.homePage || "index.html";

        if (!this.switchMode) {
            this.btnSwitch.style.display = "none";
        }

        this.gameCanvas.width = gameSet.tileWidth * gameSet.tileSize;
        this.gameCanvas.height = gameSet.tileHeight * gameSet.tileSize;

        this.currentLevel = 1;
        this.gameLevel = undefined;
        this.mapImage = undefined;
        this.inputMode = gameSet.defaultMode;
        
        this.imageLoaded = 0;

        this.isRunning = false;
        this.isGameOver = false;

        this.goal = {
            image : [],
            frame : [],
            pos : [],
            aniProgress : 0,
            aniCycle : gameSet.goalAniCycle,
            isVisible : [],
        }

        this.obs = {
            image : [],
            frame : [],
            pos : [],
            aniProgress : 0,
            aniCycle : gameSet.obsAniCycle,
            isVisible : [],
        }

        this.player = {
            image : undefined,
            frame : 0,
            pos : {},
            aniProgress : 0,
            aniCycle: gameSet.playerAniCycle,
            firstPos : {},
            firstDirection : undefined,
            iteration: 0,
            direction : undefined,
            animation : undefined,
            walkingProgress : 0,
            walkingDelay : 0,
            goalAchieved : undefined,

            journey : [],
            
            keyFrame : {
                //  keyFrame  | frame 0 | frame 1 | frame 2 | frame 3 | frame 4 | frame 5 
                "idle-down"  : [ [0,0] ],
                "idle-right" : [ [0,1] ],
                "idle-up"    : [ [0,2] ],
                "idle-left"  : [ [0,3] ],
                "walk-down"  : [ [0,0],    [1,0],    [2,0],    [3,0],    [4,0],    [5,0] ],
                "walk-right" : [ [0,1],    [1,1],    [2,1],    [3,1],    [4,1],    [5,1] ],
                "walk-up"    : [ [0,2],    [1,2],    [2,2],    [3,2],    [4,2],    [5,2] ],
                "walk-left"  : [ [0,3],    [1,3],    [2,3],    [3,3],    [4,3],    [5,3] ],
            }
        }

        this.btnUndo.classList.add("gameover");

        this.buttonInit();
        this.loadImages();
        this.loadLevel();
    }


    // ======================================================================================> Buttons
    
    buttonInit() {
        this.btnSwitch.addEventListener("click", () => {
            if (!this.isRunning) {
                this.playSound("pop");

                switch (this.inputMode) {
                    case "Tap Mode" : this.inputMode = "Scroll Mode"; break;
                    case "Scroll Mode" : this.inputMode = "Flick Mode"; break;
                    case "Flick Mode" : this.inputMode = "Drag and Drop"; break;
                    case "Drag and Drop" : this.inputMode = "Stamp Mode"; break;
                    case "Stamp Mode" : this.inputMode = "Tap Mode"; break;
                }

                this.setCommand()
            }
        });

        this.btnExit.addEventListener("click", () => {
            this.playSound("pop");

            const handlerClose = () => {
                setTimeout(() => {
                    window.location.href = this.homePage;
                }, 200);
            }

            this.gameTransition.removeAttribute("style");
            this.gameTransition.classList.add("ani-transition-in");
            this.gameTransition.addEventListener("animationend", handlerClose);
        });

        this.btnFullScreen.addEventListener("click", () => {
            this.playSound("pop");

            if (document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement || 
                document.msFullscreenElement) {

                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
            else {
                const eHtml = document.documentElement;

                if (eHtml.requestFullscreen) {
                    eHtml.requestFullscreen();
                } else if (eHtml.webkitRequestFullscreen) {
                    eHtml.webkitRequestFullscreen();
                } else if (eHtml.mozRequestFullScreen) {
                    eHtml.mozRequestFullScreen();
                } else if (eHtml.msRequestFullscreen) {
                    eHtml.msRequestFullscreen();
                }
            }
        });

        this.btnUndo.addEventListener("click", () => {
            // Undo
            if (!this.isGameOver) {
                this.playSound("pop");

                this.setBack();
            }

            // Next or Game Over
            else {
                this.playSound("pop");

                this.currentLevel += 1;
                this.gameLevel = gameSet[`level${this.currentLevel}`];

                if (this.gameLevel == undefined) {
                    const handlerClose = () => {
                        setTimeout(() => {
                            window.location.href = this.homePage;
                        }, 200);
                    }

                    this.gameTransition.removeAttribute("style");
                    this.gameTransition.classList.add("ani-transition-in");
                    this.gameTransition.addEventListener("animationend", handlerClose);
                }
                else {
                    this.btnUndo.classList.remove(this.btnUndo.classList);
                    this.btnUndo.classList.add("gameover");
                    this.btnUndo.textContent = "Undo";
                    this.btnUndo.style.display = "none";

                    setTimeout(() => {
                        this.btnUndo.style.display = "flex";
                    }, 1000);

                    this.nextLevel();
                }
            }
        });
    }


    // ======================================================================================> Image Loader

    loadImages() {
        const uniqueImages = new Set();
        
        for (const key in gameSet) {
            if (key.startsWith("level")) {
                const level = gameSet[key];
                
                if (level.map) {
                    uniqueImages.add(level.map);
                }
                
                if (level.player && level.player.image) {
                    uniqueImages.add(level.player.image);
                }
                
                if (level.goals) {
                    for (const goalKey in level.goals) {
                        uniqueImages.add(level.goals[goalKey].image);
                    }
                }
                
                if (level.obstacles) {
                    for (const obsKey in level.obstacles) {
                        uniqueImages.add(level.obstacles[obsKey].image);
                    }
                }
            }
        }

        const allImages = Array.from(uniqueImages);
        this.imageLoaded = allImages.length;

        allImages.forEach((url, i) => {
            const img = new Image();
            img.onload = () => { this.imageChecker(); };
            img.src = url;
        });
    }

    imageChecker() {
        this.imageLoaded -= 1;

        if (this.imageLoaded == 0) {
            // Open transition layer
            const handlerStart = () => {
                this.gameTransition.style.display = "none";
                this.gameTransition.classList.remove("ani-transition-out");
                this.gameTransition.removeEventListener("animationend", handlerStart);
            }
            
            this.gameTransition.classList.add("ani-transition-out");
            this.gameTransition.addEventListener("animationend", handlerStart);
            
            // Start Game
            this.gameLoop();
        }
    }


    // ======================================================================================> Game Loader

    loadLevel() {
        this.playSound("transition");

        this.gameLevel = gameSet[`level${this.currentLevel}`];

        // Game
        this.goal = {
            image : [],
            frame : [],
            pos : [],
            aniProgress : 0,
            aniCycle : gameSet.goalAniCycle,
            isVisible : [],
        }

        this.obs = {
            image : [],
            frame : [],
            pos : [],
            aniProgress : 0,
            aniCycle : gameSet.obsAniCycle,
            isVisible : [],
        }
        
        this.isRunning = false;
        this.isGameOver = false;

        // Map
        this.mapImage = new Image();
        this.mapImage.src = this.gameLevel.map;

        // Player
        this.player.image = new Image();
        this.player.image.src = this.gameLevel.player.image;
        this.player.firstPos = {x: this.gameLevel.player.x * gameSet.tileSize, y: this.gameLevel.player.y * gameSet.tileSize};
        this.player.firstDirection = this.gameLevel.player.direction;

        // Goals
        const goalPath = Object.values(this.gameLevel.goals).map(goal => goal.image);
        const goalPosX = Object.values(this.gameLevel.goals).map(goal => goal.x);
        const goalPosY = Object.values(this.gameLevel.goals).map(goal => goal.y);

        goalPath.forEach((value, i) => {
            this.goal.image[i] = new Image();
            this.goal.image[i].src = value;
            this.goal.frame[i] = Math.floor(Math.random() * 6);
            this.goal.pos[i] = {x: goalPosX[i] * gameSet.tileSize, y: goalPosY[i] * gameSet.tileSize};
            this.goal.isVisible[i] = true;
        });

        // Obstacles
        const obsPath = Object.values(this.gameLevel.obstacles).map(obs => obs.image);
        const obsPosX = Object.values(this.gameLevel.obstacles).map(obs => obs.x);
        const obsPosY = Object.values(this.gameLevel.obstacles).map(obs => obs.y);

        obsPath.forEach((value, i) => {
            this.obs.image[i] = new Image();
            this.obs.image[i].src = value;
            this.obs.frame[i] = Math.floor(Math.random() * 6);
            this.obs.pos[i] = {x: obsPosX[i] * gameSet.tileSize, y: obsPosY[i] * gameSet.tileSize};
            this.obs.isVisible[i] = true;
        });

        this.resetLevel();
    }

    resetLevel() {
        // Goals
        for (let i=0; i < this.goal.isVisible.length; i++) {
            this.goal.isVisible[i] = true;
        }

        // Player
        this.player.iteration = 0;
        this.player.frame = 0;
        this.player.pos = {x: this.player.firstPos.x, y: this.player.firstPos.y};
        this.player.direction = this.player.firstDirection;
        this.player.animation = `idle-${this.player.direction}`;
        this.player.aniProgress = 0;
        this.player.walkingProgress = 0;
        this.player.goalAchieved = this.goal.image.length;
        this.player.journey = [];
        
        this.setCommand();
    }

    nextLevel() {
        const handlerOut = () => {
            this.gameTransition.removeAttribute("style");
            this.gameTransition.classList.remove("ani-transition-out");
            this.gameTransition.style.display = "none";
            this.gameTransition.removeEventListener("animationend", handlerOut);
        }

        const handlerIn = () => {
            this.gameTransition.removeAttribute("style");
            this.gameTransition.classList.remove("ani-transition-in");
            this.gameTransition.classList.add("ani-transition-out");
            this.gameTransition.addEventListener("animationend", handlerOut);
            this.gameTransition.removeEventListener("animationend", handlerIn);

            this.loadLevel();
        }

        this.gameTransition.removeAttribute("style");
        this.gameTransition.classList.add("ani-transition-in");
        this.gameTransition.addEventListener("animationend", handlerIn);
    }


    // ======================================================================================> Animation

    gameLoop() {
        this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Map
        this.gameCtx.drawImage(this.mapImage, 0, 0);

        // Goals and Obstacles
        this.drawObject(this.goal);
        this.drawObject(this.obs);

        // Player
        this.drawPlayer();

        requestAnimationFrame(() => {
            this.gameLoop();
        });
    }

    drawObject(objectVariable) {
        for (let i=0; i < objectVariable.image.length; i++) {
            if (objectVariable.isVisible[i]) {
                this.gameCtx.drawImage(
                    objectVariable.image[i],
                    objectVariable.frame[i] * gameSet.tileSize, 0,
                    gameSet.tileSize, gameSet.tileSize,
                    objectVariable.pos[i].x, objectVariable.pos[i].y,
                    gameSet.tileSize, gameSet.tileSize
                );
            }
        }

        if (objectVariable.aniProgress > 0) {
            objectVariable.aniProgress -= 1;
        }
        else {
            objectVariable.aniProgress = objectVariable.aniCycle;

            objectVariable.frame.forEach((val, i) => {
                objectVariable.frame[i] += 1;

                if (objectVariable.frame[i] >= 6) {
                    objectVariable.frame[i] = 0;
                }
            });
        }
    }


    // ======================================================================================> Player Animation
    
    walkableArea() {
        let targetPos = {};
        let accesible = true;

        switch (this.player.direction) {
            case "up"    : targetPos = {x: this.player.pos.x, y: this.player.pos.y - gameSet.tileSize}; break;
            case "down"  : targetPos = {x: this.player.pos.x, y: this.player.pos.y + gameSet.tileSize}; break;
            case "left"  : targetPos = {x: this.player.pos.x - gameSet.tileSize, y: this.player.pos.y}; break;
            case "right" : targetPos = {x: this.player.pos.x + gameSet.tileSize, y: this.player.pos.y}; break;
        }

        if (targetPos.x <= -gameSet.tileSize || targetPos.x >= gameSet.tileWidth * gameSet.tileSize) {
            accesible = false;
        }
        else if (targetPos.y <= -gameSet.tileSize || targetPos.y >= gameSet.tileHeight * gameSet.tileSize) {
            accesible = false;
        }

        for (let i=0; i < this.obs.image.length; i++) {
            if (this.obs.pos[i].x == targetPos.x && this.obs.pos[i].y == targetPos.y) {
                accesible = false;
            }
        }

        return accesible;
    }

    getPlayerFrame() {
        return this.player.keyFrame[this.player.animation][this.player.frame];
    }

    drawPlayer(){
        const [frameX, frameY] = this.getPlayerFrame();

        this.gameCtx.drawImage(
            this.player.image,
            frameX * gameSet.tileSize, frameY * gameSet.tileSize,
            gameSet.tileSize, gameSet.tileSize,
            this.player.pos.x, this.player.pos.y,
            gameSet.tileSize, gameSet.tileSize
        );

        // Player Animation
        if (this.player.walkingDelay == 0) {
            if (this.player.aniProgress > 0) {
                this.player.aniProgress -= 1;
            }
            else {
                this.player.aniProgress = this.player.aniCycle;
                this.player.frame += 1;

                if (this.getPlayerFrame() == undefined) {
                    this.player.frame = 0;
                }
            }
        }
        
        // Player Movement
        if (!this.isGameOver){
            if (this.player.walkingProgress > 0) {

                // Coordinate movement
                if (this.walkableArea()) {
                    switch (this.player.direction) {
                        case "up"    : this.player.pos.y -= 1; break;
                        case "down"  : this.player.pos.y += 1; break;
                        case "left"  : this.player.pos.x -= 1; break;
                        case "right" : this.player.pos.x += 1; break;
                    }
                }

                // Last movement
                if (this.player.walkingProgress == 1) {
                    // Position stored
                    this.player.journey.push({...this.player.pos, direction: this.player.direction});

                    // Goal checking
                    for (let i=0; i < this.goal.image.length; i++) {
                        if (this.goal.isVisible[i]) {
                            if (this.player.pos.x == this.goal.pos[i].x && this.player.pos.y == this.goal.pos[i].y) {
                                this.player.goalAchieved -= 1;
                                this.goal.isVisible[i] = false;
                                this.playSound("cling");
                            }
                        }
                    }

                    // Game Over
                    if (this.player.goalAchieved == 0) {
                        this.playSound("done");

                        this.isGameOver = true;
                        this.player.frame = 0;
                        this.player.direction = "down";
                        this.player.animation = "idle-down";

                        this.btnUndo.style.display = "none";

                        if (gameSet[`level${this.currentLevel + 1}`] == undefined) {
                            this.btnUndo.classList.remove(this.btnUndo.classList);
                            this.btnUndo.classList.add("gameover");
                            this.btnUndo.textContent = "Game Over";
                        }
                        else {
                            this.btnUndo.classList.remove(this.btnUndo.classList);
                            this.btnUndo.classList.add("next");
                            this.btnUndo.textContent = "Next";
                        }

                        setTimeout(() => {
                            this.btnUndo.style.display = "flex";
                        }, 3000);
                    }

                    // Commands update
                    this.setCommand();
                }

                this.player.walkingProgress -= 1;
            }
            else if (this.isRunning) {
                this.isRunning = false;
                this.player.frame = 0;
                this.player.animation = "idle-" + this.player.direction;
            }
        }
    }


    // ======================================================================================> Player Control

    setWalk(direction) {
        if (!this.isRunning) {
            this.playSound("shake");

            this.isRunning = true;
            this.player.direction = direction;
            this.player.animation = "walk-" + this.player.direction;
            this.player.walkingProgress = gameSet.tileSize;
        }
    }

    setBack() {
        if (!this.isRunning) {
            this.playSound("shake");

            const lastJourney = this.player.journey[this.player.journey.length - 2];

            if (lastJourney == undefined) {
                this.resetLevel();
            }
            else {
                // Player
                this.player.iteration = 0;
                this.player.frame = 0;
                this.player.pos = {x: lastJourney.x, y: lastJourney.y};
                this.player.direction = lastJourney.direction;
                this.player.animation = `idle-${lastJourney.direction}`;
                this.player.aniProgress = 0;
                this.player.walkingProgress = 0;

                // Goals
                const deletedJourney = this.player.journey.pop();
                this.goal.pos.forEach((goalPos, i) => {
                    if (goalPos.x == deletedJourney.x && goalPos.y == deletedJourney.y) {
                        this.goal.isVisible[i] = true;
                        this.player.goalAchieved += 1;
                    }
                });
            }

            this.setCommand();
        }
    }


    // ======================================================================================> Commands

    setIcon(iconElement, code) {
        iconElement.className = "";

        switch (code) {
            case 1 : iconElement.classList.add("fa-solid", "fa-arrow-up"); break;
            case 2 : iconElement.classList.add("fa-solid", "fa-arrow-right"); break;
            case 3 : iconElement.classList.add("fa-solid", "fa-arrow-down"); break;
            case 4 : iconElement.classList.add("fa-solid", "fa-arrow-left"); break;
        }
    }

    setCommand() {
        if (!this.switchMode) {
            this.inputMode = this.gameLevel.inputType;
        }

        this.textLevel.textContent = `Stage ${this.currentLevel} (${this.inputMode})`;

        this.commandPanel.classList.remove(...this.commandPanel.classList);
        this.commandPanel.innerHTML = "";

        switch (this.inputMode) {
            case "Tap Mode" : this.commandPanel.classList.add("tap-mode"); break;
            case "Scroll Mode" : this.commandPanel.classList.add("scroll-mode"); break;
            case "Flick Mode" : this.commandPanel.classList.add("flick-mode"); break;
            case "Stamp Mode" : this.commandPanel.classList.add("tag-mode"); break;
            case "Drag and Drop" : this.commandPanel.classList.add("drag-mode"); break;
        }

        // Draw Commands
        this.player.journey.forEach((value) => {
            const command = document.createElement("div");
            command.classList.add("active");

            switch (this.inputMode) {
                case "Tap Mode" : command.classList.add("tap"); break;
                case "Scroll Mode" : command.classList.add("scroll"); break;
                case "Flick Mode" : command.classList.add("flick"); break;
                case "Stamp Mode" : command.classList.add("tag"); break;
                case "Drag and Drop" : command.classList.add("drag"); break;
            }

            switch (value.direction) {
                case "up" : command.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`; break;
                case "right" : command.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`; break;
                case "down" : command.innerHTML = `<i class="fa-solid fa-arrow-down"></i>`; break;
                case "left" : command.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`; break;
            }

            this.commandPanel.append(command);
        });


        // ======================================================================================> Tap Mode

        if (!this.isGameOver && this.inputMode == "Tap Mode") {
            const panel = document.createElement("div");
            panel.classList.add("tap");
            this.commandPanel.append(panel);

            const icon = document.createElement("i");
            panel.append(icon);

            panel.style.display = "none";
            setTimeout(() => {
                panel.style.display = "flex";
            }, 500);

            let arrowIndex = 0;
            let timeOut = null;

            panel.addEventListener("click", (event) => {
                if (!this.isRunning) {
                    this.playSound("pop");

                    arrowIndex = (arrowIndex + 1) % 5;
                    this.setIcon(icon, arrowIndex);

                    if (timeOut != null) {
                        clearTimeout(timeOut);
                    }

                    timeOut = setTimeout(() => {
                        switch (arrowIndex) {
                            case 1 : this.setWalk("up");
                            case 2 : this.setWalk("right");
                            case 3 : this.setWalk("down");
                            case 4 : this.setWalk("left");
                        }
                        
                        timeOut = null;
                    }, 1500);
                }
            });
        }


        // ======================================================================================> Scroll Mode

        else if (!this.isGameOver && this.inputMode == "Scroll Mode") {
            const panel = document.createElement("div");
            panel.classList.add("scroll");
            this.commandPanel.append(panel);

            const btn1 = document.createElement("button");
            btn1.innerHTML = '<i class="fa-solid fa-caret-up"></i>';
            panel.append(btn1);

            const btn2 = document.createElement("button");
            btn2.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
            panel.append(btn2);

            let icon = document.createElement("i");
            panel.append(icon);

            panel.style.display = "none";
            setTimeout(() => {
                panel.style.display = "flex";
            }, 500);

            let arrowIndex = 0;
            let timeOut = null;

            btn1.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");

                    arrowIndex = (arrowIndex + 1) % 5;
                    this.setIcon(icon, arrowIndex);

                    if (timeOut != null) {
                        clearTimeout(timeOut);
                    }

                    timeOut = setTimeout(() => {
                        switch (arrowIndex) {
                            case 1 : this.setWalk("up");
                            case 2 : this.setWalk("right");
                            case 3 : this.setWalk("down");
                            case 4 : this.setWalk("left");
                        }
                        
                        timeOut = null;
                    }, 1500);
                }
            });

            btn2.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");

                    arrowIndex = (arrowIndex - 1 + 5) % 5;
                    this.setIcon(icon, arrowIndex);

                    if (timeOut != null) {
                        clearTimeout(timeOut);
                    }

                    timeOut = setTimeout(() => {
                        switch (arrowIndex) {
                            case 1 : this.setWalk("up");
                            case 2 : this.setWalk("right");
                            case 3 : this.setWalk("down");
                            case 4 : this.setWalk("left");
                        }
                        
                        timeOut = null;
                    }, 1500);
                }
            });
        }


        // ======================================================================================> Flick Mode

        else if (!this.isGameOver && this.inputMode == "Flick Mode") {
            const panel = document.createElement("div");
            panel.classList.add("flick");
            this.commandPanel.append(panel);

            const btn1 = document.createElement("button");
            const btn2 = document.createElement("button");
            const btn3 = document.createElement("button");
            const btn4 = document.createElement("button");
            const btn5 = document.createElement("button");

            btn1.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            btn2.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
            btn3.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
            btn4.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
            btn5.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
            
            panel.append(btn1);
            panel.append(btn2);
            panel.append(btn3);
            panel.append(btn4);
            panel.append(btn5);

            let icon = document.createElement("i");
            panel.append(icon);

            panel.style.display = "none";
            setTimeout(() => {
                panel.style.display = "flex";
            }, 500);

            const buttons = panel.querySelectorAll("button");

            panel.addEventListener("click", () => {
                if (!this.isRunning) {
                    [...buttons].forEach((e) => {
                        e.classList.toggle("show");
                    });
                }
            });

            btn1.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 0);
                }
            });

            btn2.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 1);

                    setTimeout(() => {
                        this.setWalk("up");
                    }, 100);
                }
            });

            btn3.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 2);
                    
                    setTimeout(() => {
                        this.setWalk("right");
                    }, 100);
                }
            });

            btn4.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 3);
                    
                    setTimeout(() => {
                        this.setWalk("down");
                    }, 100);
                }
            });

            btn5.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 4);
                    
                    setTimeout(() => {
                        this.setWalk("left");
                    }, 100);
                }
            });
        }


        // ======================================================================================> Drag and Drop Mode

        else if (!this.isGameOver && this.inputMode == "Drag and Drop") {
            const panel = document.createElement("div");
            panel.classList.add("drag");
            this.commandPanel.append(panel);

            let icon = document.createElement("i");
            panel.append(icon);

            const dragPanel = document.createElement("div");
            dragPanel.classList.add("drag-panel");
            this.commandPanel.append(dragPanel);

            panel.style.display = "none";
            dragPanel.style.display = "none";
            setTimeout(() => {
                panel.style.display = "flex";
                dragPanel.style.display = "flex";
            }, 500);

            for (let i=0; i < 5; i++) {
                const dragger = document.createElement("div");
                dragger.classList.add("dragger");
                
                switch (i) {
                    case 0 : dragger.classList.add("fa-solid", "fa-xmark"); break; 
                    case 1 : dragger.classList.add("fa-solid", "fa-arrow-up"); break;
                    case 2 : dragger.classList.add("fa-solid", "fa-arrow-right"); break;
                    case 3 : dragger.classList.add("fa-solid", "fa-arrow-down"); break;
                    case 4 : dragger.classList.add("fa-solid", "fa-arrow-left"); break;
                }

                dragPanel.append(dragger);
                let startPos = {}

                dragger.addEventListener("touchstart", (event) => {
                    event.preventDefault();

                    startPos.x = event.touches[0].clientX;
                    startPos.y = event.touches[0].clientY;

                    dragger.style.transition = "none";

                    dragger.addEventListener("touchmove", moveHandler);
                    dragger.addEventListener("touchend", endHandler)
                });

                const moveHandler = (event) => {
                    event.preventDefault();

                    const deltaPos = {
                        x: event.touches[0].clientX - startPos.x,
                        y: event.touches[0].clientY - startPos.y
                    }

                    dragger.style.transform = `translate(${deltaPos.x}px, ${deltaPos.y}px)`;
                };

                const endHandler = (event) => {
                    event.preventDefault();
                    
                    dragger.removeEventListener("touchmove", moveHandler);
                    dragger.style.transition = "transform 0.3s ease-out";
                    dragger.style.transform = "translate(0px, 0px)";

                    const draggerRect = dragger.getBoundingClientRect();
                    const dropperRect = panel.getBoundingClientRect();

                    if (Math.abs(draggerRect.left - dropperRect.left) < 30 && Math.abs(draggerRect.top - dropperRect.top) < 30) {
                        this.playSound("pop");
                        
                        this.setIcon(icon, i);

                        switch (i) {
                            case 1 : this.setWalk("up");
                            case 2 : this.setWalk("right");
                            case 3 : this.setWalk("down");
                            case 4 : this.setWalk("left");
                        }

                        if (i != 0) {
                            dragPanel.style.display = "none";
                        }
                    }
                };
            }
        }


        // ======================================================================================> Stamp Mode

        else if (!this.isGameOver && this.inputMode == "Stamp Mode") {
            const panel = document.createElement("div");
            panel.classList.add("tag");
            this.commandPanel.append(panel);

            const btn1 = document.createElement("button");
            const btn2 = document.createElement("button");
            const btn3 = document.createElement("button");
            const btn4 = document.createElement("button");
            const btn5 = document.createElement("button");
            
            panel.append(btn1);
            panel.append(btn2);
            panel.append(btn3);
            panel.append(btn4);
            panel.append(btn5);

            let icon = document.createElement("i");
            panel.append(icon);

            panel.style.display = "none";
            setTimeout(() => {
                panel.style.display = "flex";
            }, 500);

            btn1.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.setIcon(icon, 0);
                }
            });

            btn2.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 1);

                    setTimeout(() => {
                        this.setWalk("up");
                    }, 100);
                }
            });

            btn3.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 2);

                    setTimeout(() => {
                        this.setWalk("right");
                    }, 100);
                }
            });

            btn4.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 3);

                    setTimeout(() => {
                        this.setWalk("down");
                    }, 100);
                }
            });
            btn5.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");
                    this.setIcon(icon, 4);

                    setTimeout(() => {
                        this.setWalk("left");
                    }, 100);
                }
            });
        }
    }
}