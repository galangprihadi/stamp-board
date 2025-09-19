
//////////////////////////////////////////////////////////////////////////////////////
////////////////////////     Remote Game Engine Ver. 1.1      ////////////////////////
////////////////////////     17 Sept, 2025                    ////////////////////////
////////////////////////     Galang P Mahardhika              ////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

class TilemapGame {

    // ======================================================================================> Elements
    gameCanvas = document.querySelector("#game-canvas");
    gameCtx = document.getElementById("game-canvas").getContext("2d");
    commandPanel = document.querySelector("#command-panel");
    inputPanel = document.querySelector("#input-panel");
    textLevel = document.getElementById("level-text");

    btnSwitch = document.getElementById("button-switch");
    btnExit = document.getElementById("button-exit");
    btnFullScreen = document.getElementById("button-fullscreen");
    btnReset = document.getElementById("button-reset");


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

        this.buttonInit();
        this.loadImages();
        this.loadLevel();
    }


    // ======================================================================================> Buttons
    
    buttonInit() {
        this.btnSwitch.addEventListener("click", () => {
            this.playSound("pop");

            switch (this.inputMode) {
                case "Tap Mode" : this.inputMode = "Scroll Mode"; break;
                case "Scroll Mode" : this.inputMode = "Flick Mode"; break;
                case "Flick Mode" : this.inputMode = "Stamp Mode"; break;
                case "Stamp Mode" : this.inputMode = "Drag and Drop"; break;
                case "Drag and Drop" : this.inputMode = "Tap Mode"; break;
            }

            this.setInput();
        });

        this.btnExit.addEventListener("click", () => {
            this.playSound("pop");

            setTimeout(() => {
                window.location.href = this.homePage;
            }, 200);
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

        this.btnReset.addEventListener("click", () => {
            if (!this.isGameOver) {
                this.playSound("pop");

                this.resetLevel();
            }
            else {
                this.playSound("pop");

                this.currentLevel += 1;
                this.gameLevel = gameSet[`level${this.currentLevel}`];

                if (this.gameLevel == undefined) {
                    setTimeout(() => {
                        window.location.href = this.homePage;
                    }, 200);
                }
                else {
                    this.btnReset.className = ""
                    this.btnReset.textContent = "Reset";
                    this.loadLevel();
                    this.inputPanel.style.display = "flex";
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
            this.gameLoop();
        }
    }


    // ======================================================================================> Game Loader

    loadLevel() {
        this.playSound("transition");

        this.gameLevel = gameSet[`level${this.currentLevel}`];

        // Game
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
        
        this.setInput();
        this.setCommand();
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

                        this.btnReset.style.display = "none";

                        if (gameSet[`level${this.currentLevel + 1}`] == undefined) {
                            this.btnReset.classList.add("gameover");
                            this.btnReset.textContent = "Game Over";
                        }
                        else {
                            this.btnReset.classList.add("next");
                            this.btnReset.textContent = "Next";
                        }

                        setTimeout(() => {
                            this.btnReset.style.display = "flex";
                        }, 3000);
                    }
                    else {
                        // Show Input Panel
                        this.inputPanel.style.display = "flex";
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

            // Remove delete button
            const lastButton = this.commandPanel.lastElementChild;
            if (lastButton) {
                this.commandPanel.removeChild(lastButton);
            }
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

    setCommand() {
        this.commandPanel.classList.remove(...this.commandPanel.classList);
        this.commandPanel.innerHTML = "";

        this.player.journey.forEach((value) => {
            const command = document.createElement("button");
            
            switch (value.direction) {
                case "up" : command.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`; break;
                case "right" : command.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`; break;
                case "down" : command.innerHTML = `<i class="fa-solid fa-arrow-down"></i>`; break;
                case "left" : command.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`; break;
            }

            this.commandPanel.append(command);
        });

        if (this.player.journey.length > 0) {
            const btnDelete = document.createElement("button");
            btnDelete.classList.add("delete");
            btnDelete.innerHTML = `<i class="fa-solid fa-delete-left"></i>`;
            btnDelete.style.display = "none";
            this.commandPanel.append(btnDelete);
            
            btnDelete.addEventListener("click", () => {
                this.setBack();
            });

            setTimeout(() => {
                btnDelete.style.display = "flex";
            }, 500);
        }
    }


    // ======================================================================================> Inputs

    setInput() {
        if (!this.switchMode) {
            this.inputMode = this.gameLevel.inputType;
        }

        this.textLevel.textContent = `Stage ${this.currentLevel} (${this.inputMode})`;

        this.inputPanel.classList.remove(...this.inputPanel.classList);
        this.inputPanel.innerHTML = "";


        // ======================================================================================> Tap Mode

        if (this.inputMode == "Tap Mode") {
            const panel = document.createElement("div");
            panel.classList.add("tap");
            this.inputPanel.append(panel);

            let panelDirection = "blank";
            let timeOut = null;

            panel.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.playSound("pop");

                    if (panelDirection == "blank") {
                        panelDirection = "up";
                        panel.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`;
                    }
                    else if (panelDirection == "up") {
                        panelDirection = "right";
                        panel.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`;
                    }
                    else if (panelDirection == "right") {
                        panelDirection = "down";
                        panel.innerHTML = `<i class="fa-solid fa-arrow-down"></i>`;
                    }
                    else if (panelDirection == "down") {
                        panelDirection = "left";
                        panel.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
                    }
                    else if (panelDirection == "left") {
                        panelDirection = "blank";
                        panel.innerHTML = "";
                    }

                    if (timeOut != null) {
                        clearTimeout(timeOut);
                    }

                    timeOut = setTimeout(() => {
                        if (panelDirection != "blank") {
                            this.setWalk(panelDirection);
                            this.inputPanel.style.display = "none";
                        }
                        
                        panelDirection = "blank";
                        panel.innerHTML = "";
                        timeOut = null;
                    }, 1500)
                }
            })
        }


        // ======================================================================================> Scroll Mode

        if (this.inputMode == "Scroll Mode") {
            console.log (this.inputMode);
        }


        // ======================================================================================> Flick Mode

        if (this.inputMode == "Flick Mode") {
            console.log (this.inputMode);
        }


        // ======================================================================================> Stamp Mode

        if (this.inputMode == "Stamp Mode") {
            console.log (this.inputMode);
        }


        // ======================================================================================> Drag and Drop

        if (this.inputMode == "Drag and Drop") {
            console.log (this.inputMode);
        }


    }
}