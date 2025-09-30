
//////////////////////////////////////////////////////////////////////////////////////
////////////////////////     Tilemap Game Engine Ver. 3.1     ////////////////////////
////////////////////////     19 Sept, 2025                    ////////////////////////
////////////////////////     Galang P Mahardhika              ////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

class TilemapGame {
    gameTransition = document.querySelector(".game-transition");
    gameCanvas = document.querySelector("#game-canvas");
    gameCtx = document.getElementById("game-canvas").getContext("2d");
    commandPanel = document.querySelector("#command-panel");
    textLevel = document.getElementById("level-text");
    textTime = document.getElementById("time-text");
    attemptTime = document.getElementById("attempt-text");

    soundBgm = document.getElementById("soundBgm");
    soundCling = document.getElementById("soundCling");
    soundDone = document.getElementById("soundDone");
    soundPop = document.getElementById("soundPop");
    soundShake = document.getElementById("soundShake");
    soundTransition = document.getElementById("soundTransition");
    
    eCommands = undefined;
    eHideOnRun = [];

    playerId = "";
    playerData = "";
    
    btnSwitch = document.getElementById("button-switch");
    btnExit = document.getElementById("button-exit");
    btnFullScreen = document.getElementById("button-fullscreen");
    btnRun = document.getElementById("button-run");


    constructor(param) {
        this.freeMode = param.freeMode ?? false;
        this.switchMode = param.switchMode ?? false;
        this.homePage = param.homePage || "index.html";

        this.formId = param.formId || "no id";
        this.formAction = param.formAction;
        this.entry1 = param.entry1;
        this.entry2 = param.entry2;

        this.playerId = localStorage.getItem("playerData") || "no id";
        this.playerData = this.formId + " ";

        if (!this.switchMode) {
            this.btnSwitch.style.display = "none";
        }      
        
        this.gameCanvas.width = gameSet.tileWidth * gameSet.tileSize;
        this.gameCanvas.height = gameSet.tileHeight * gameSet.tileSize;

        this.currentLevel = 1;
        this.gameLevel = undefined;
        this.isRunning = false;
        this.isGameOver = false;
        this.inputMode = gameSet.defaultMode;

        this.startTime = Date.now();
        this.timerInterval = undefined;
        this.min = "";
        this.sec = "";

        this.levelTime = 0;
        this.attempt = 0;
        this.journey = 0;
        this.step = 0;

        this.mapImage = undefined;

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
            command: [],
            iteration: 0,
            image : undefined,
            frame : 0,
            firstPos : {},
            pos : {},
            firstDirection : undefined,
            direction : undefined,
            animation : undefined,
            aniProgress : 0,
            aniCycle: gameSet.playerAniCycle,
            walkingProgress : 0,
            walkingDelay : 0,
            goalAchieved : undefined,

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

        this.imageLoaded = 0;

        // Buttons
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

                this.resetLevel();
            }
        });

        this.btnExit.addEventListener("click", () => {
            this.playSound("pop");

            if (this.currentLevel != 1) {
                this.submitForm();
            }
            
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

            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
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

        this.btnRun.addEventListener("click", () => {
            if (!this.isGameOver) {
                // Run
                if (!this.isRunning && this.player.command.some(e => e !== null)) {
                    this.playSound("pop");

                    this.isRunning = true;
                    
                    this.btnRun.style.display = "none";
                    this.btnRun.classList.add("reset");
                    this.btnRun.textContent = "Reset";

                    this.attempt += 1;
                    this.attemptTime.textContent = this.attempt;

                    this.journey = this.player.command.filter(item => item !== null).length;

                    this.eHideOnRun.forEach((e) => {
                        e.style.display = "none";
                    });

                    setTimeout(() => {
                        this.btnRun.style.display = "flex";
                    }, 500);
                }

                // Reset
                else if(this.isRunning) {
                    this.playSound("pop");

                    this.resetLevel();

                    this.btnRun.classList.remove("reset");
                    this.btnRun.textContent = "Run";
                }
            }
            // Next level
            else {
                this.playSound("pop");

                this.currentLevel += 1;
                this.gameLevel = gameSet[`level${this.currentLevel}`];

                if (this.gameLevel == undefined) {
                    this.submitForm();

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
                    this.btnRun.textContent = "Run";
                    this.btnRun.style.display = "none";

                    setTimeout(() => {
                        this.btnRun.style.display = "flex";
                    }, 1000);

                    this.nextLevel();
                }
            }
        });
        
        this.loadLevel();
    }

    async submitForm() {
        if (this.formAction != undefined && this.entry1 != undefined && this.entry2 != undefined) {
            const formData = new FormData();
            formData.append(this.entry1, this.playerId);
            formData.append(this.entry2, this.playerData);

            try {
                await fetch(this.formAction, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData,
                });
            }
            catch (error) {
                console.log(error);
            }
        }
    }

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

    setImageLoaded() {
        this.imageLoaded -= 1;

        if (this.imageLoaded == 0 && this.currentLevel == 1) {

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

    loadObject(objectVariable, objectData) {
        const path = Object.values(objectData).map(obj => obj.image);
        const posX = Object.values(objectData).map(obj => obj.x);
        const posY = Object.values(objectData).map(obj => obj.y);

        path.forEach((value, i) => {
            this.imageLoaded += 1;

            objectVariable.image[i] = new Image();
            objectVariable.image[i].onload = () => { this.setImageLoaded(); };
            objectVariable.image[i].src = value;

            objectVariable.frame[i] = Math.floor(Math.random() * 6);
            objectVariable.pos[i] = {x: posX[i] * gameSet.tileSize, y: posY[i] * gameSet.tileSize};
            objectVariable.isVisible[i] = true;
        });
    }

    timerCount() {
        const currentTime = Date.now() - this.startTime;

        this.min = Math.floor((currentTime / (1000 * 60)) % 60);
        this.sec = Math.floor((currentTime / 1000) % 60);
        this.levelTime = Math.floor(currentTime / 1000);

        this.min = String(this.min).padStart(2, "0");
        this.sec = String(this.sec).padStart(2, "0");

        this.textTime.textContent = `${this.min}:${this.sec}`;
    }

    loadLevel() {
        this.playSound("transition");

        this.gameLevel = gameSet[`level${this.currentLevel}`];

        // Game Info
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.timerCount(), 100);
        this.levelTime = 0;
        this.attempt = 0;
        this.attemptTime.textContent = this.attempt;

        // Map
        this.imageLoaded += 1;
        this.mapImage = new Image();
        this.mapImage.onload = () => { this.setImageLoaded(); };
        this.mapImage.src = this.gameLevel.map;

        // Goals and Obstacles
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
        
        this.loadObject(this.goal, this.gameLevel.goals);
        this.loadObject(this.obs, this.gameLevel.obstacles);

        // Player
        this.imageLoaded += 1;
        this.player.image = new Image();
        this.player.image.onload = () => { this.setImageLoaded(); };
        this.player.image.src = this.gameLevel.player.image;
        this.player.firstPos = {x: this.gameLevel.player.x * gameSet.tileSize, y: this.gameLevel.player.y * gameSet.tileSize};
        this.player.firstDirection = this.gameLevel.player.direction;

        this.resetLevel();
    }

    resetLevel() {
        // Game Info
        if (!this.switchMode) {
            this.inputMode = this.gameLevel.inputType;
        }

        this.journey = 0;
        this.step = 0;
        this.textLevel.textContent = `Stage ${this.currentLevel} (${this.inputMode})`;

        // Game
        this.isRunning = false;
        this.isGameOver = false;

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

        // Command Panel
        if (this.freeMode) {
            this.drawCommandPanel(this.inputMode, 12);
        }
        else {
            this.drawCommandPanel(this.inputMode, this.gameLevel.commandLength);
        }
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

    getPlayerFrame() {
        return this.player.keyFrame[this.player.animation][this.player.frame];
    }

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
        if (!this.isGameOver && this.isRunning){
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

                    // Movement checking
                    if (this.player.goalAchieved == 0 || this.player.command.length == 0) {
                        this.player.frame = 0;
                        this.player.direction = "down";
                        this.player.animation = "idle-down";

                        // Game Over
                        if (this.player.goalAchieved == 0) {
                            this.playSound("done");

                            this.isRunning = false;
                            this.isGameOver = true;

                            this.btnRun.classList.remove("reset");
                            this.btnRun.style.display = "none";
                            

                            if (gameSet[`level${this.currentLevel + 1}`] == undefined) {
                                this.btnRun.classList.add("gameover");
                                this.btnRun.textContent = "Finish";
                            }
                            else {
                                this.btnRun.textContent = "Next";
                            }

                            setTimeout(() => {
                                this.btnRun.style.display = "flex";
                            }, 3000);

                            clearInterval(this.timerInterval);

                            // Record player data
                            this.inputMode

                            let inputModeId = 0;

                            switch (this.inputMode) {
                                case "Tap Mode"      : inputModeId = 1; break;
                                case "Scroll Mode"   : inputModeId = 2; break;
                                case "Flick Mode"    : inputModeId = 3; break;
                                case "Drag and Drop" : inputModeId = 4; break;
                                case "Stamp Mode"    : inputModeId = 5; break;
                            }

                            this.playerData += `L${this.currentLevel}I${inputModeId}T${this.levelTime}A${this.attempt}J${this.journey}S${this.step}`;
                        }
                    }
                    else {
                        this.player.walkingDelay = gameSet.playerDelay;
                    }
                }

                this.player.walkingProgress -= 1;
            }
            else if (this.player.walkingDelay > 0) {
                this.player.walkingDelay -= 1;
            }
            else if (this.player.command.length > 0) {
                this.player.iteration += 1;
                const tempDirection = this.player.command.shift();

                if (tempDirection == "up" || tempDirection == "right" || tempDirection == "down" || tempDirection == "left") {
                    this.player.direction = tempDirection;
                    this.player.animation = "walk-" + this.player.direction;
                    this.player.walkingProgress = gameSet.tileSize;
                    this.step += 1;

                    //Debugger
                    this.eCommands[this.player.iteration - 1].classList.add("active");
                }
                else if (this.player.command.length == 0) {
                    this.player.frame = 0;
                    this.player.direction = "down";
                    this.player.animation = "idle-down";
                }
            }
        }
    }

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


    /////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////// Commands

    drawCommandPanel(mode, length) {
        this.commandPanel.classList.remove(...this.commandPanel.classList);
        this.commandPanel.innerHTML = "";
        this.eHideOnRun = [];

        //============================================================================ Tap Mode
        if (mode == "Tap Mode") {
            this.commandPanel.classList.add("tap-mode");

            for (let i=0; i < length; i++) {
                const panel = document.createElement("div");
                panel.classList.add("tap");
                this.commandPanel.append(panel);

                let icon = document.createElement("i");
                panel.append(icon);

                let arrowIndex = 0;
                this.player.command[i] = null;

                panel.addEventListener("click", (event) => {
                    if (!this.isRunning && !this.isGameOver) {
                        this.playSound("pop");

                        arrowIndex += 1;
                        
                        if (arrowIndex > 4) {
                            arrowIndex = 0;
                        }

                        this.setIcon(icon, arrowIndex);
                        this.player.command[i] = this.setCommand(arrowIndex);
                    }
                });
            }

            this.eCommands = document.querySelectorAll(".tap");
        }


        //============================================================================ Scroll Mode
        else if(mode == "Scroll Mode") {
            this.commandPanel.classList.add("scroll-mode");

            for (let i=0; i < length; i++) {
                const panel = document.createElement("div");
                panel.classList.add("scroll");
                this.commandPanel.append(panel);

                const btn1 = document.createElement("button");
                const btn2 = document.createElement("button");

                btn1.innerHTML = '<i class="fa-solid fa-caret-up"></i>';
                btn2.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
                
                panel.append(btn1);
                panel.append(btn2);

                let icon = document.createElement("i");
                panel.append(icon);

                let arrowIndex = 0;
                this.player.command[i] = null;

                btn1.addEventListener("click", () => {
                    if (!this.isRunning && !this.isGameOver) {
                        this.playSound("pop");

                        arrowIndex += 1;

                        if (arrowIndex > 4) {
                            arrowIndex = 0;
                        }

                        this.setIcon(icon, arrowIndex);
                        this.player.command[i] = this.setCommand(arrowIndex);
                    }
                });

                btn2.addEventListener("click", () => {
                    if (!this.isRunning && !this.isGameOver) {
                        this.playSound("pop");

                        arrowIndex -= 1;

                        if (arrowIndex < 0) {
                            arrowIndex = 4;
                        }

                        this.setIcon(icon, arrowIndex);
                        this.player.command[i] = this.setCommand(arrowIndex);
                    }
                });

                this.eHideOnRun.push(btn1);
                this.eHideOnRun.push(btn2);
            }

            this.eCommands = document.querySelectorAll(".scroll");
        }


        //============================================================================ Flick Mode
        else if(mode == "Flick Mode") {
            this.commandPanel.classList.add("flick-mode");

            for (let i=0; i < length; i++) {
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

                this.player.command[i] = null;

                const buttons = panel.querySelectorAll("button");

                panel.addEventListener("click", () => {
                    [...buttons].forEach((e) => {
                        e.classList.toggle("show");
                    });
                });

                btn1.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 0);
                    this.player.command[i] = null;
                });

                btn2.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 1);
                    this.player.command[i] = "up";
                });

                btn3.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 2);
                    this.player.command[i] = "right";
                });

                btn4.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 3);
                    this.player.command[i] = "down";
                });

                btn5.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 4);
                    this.player.command[i] = "left";
                });

                this.eHideOnRun.push(btn1);
                this.eHideOnRun.push(btn2);
                this.eHideOnRun.push(btn3);
                this.eHideOnRun.push(btn4);
                this.eHideOnRun.push(btn5);
            }
            
            this.eCommands = document.querySelectorAll(".flick");
        }


        //============================================================================ Drag and Drop Mode
        else if(mode == "Drag and Drop") {
            this.commandPanel.classList.add("drag-mode");

            let dropper = [];
            let icons = [];

            for (let i=0; i < length; i++) {
                const panel = document.createElement("div");
                panel.classList.add("drag");
                this.commandPanel.append(panel);

                let icon = document.createElement("i");
                panel.append(icon);

                this.player.command[i] = null;
                dropper.push(panel);
                icons.push(icon);
            }

            const dragPanel = document.createElement("div");
            dragPanel.classList.add("drag-panel");
            this.commandPanel.append(dragPanel);

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
                this.eHideOnRun.push(dragger);

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

                    dropper.forEach((e, id) => {
                        const dropperRect = e.getBoundingClientRect();

                        if (Math.abs(draggerRect.left - dropperRect.left) < 30 && Math.abs(draggerRect.top - dropperRect.top) < 30) {
                            this.setIcon(icons[id], i);
                            this.player.command[id] = this.setCommand(i);

                            this.playSound("pop");
                        }
                    });
                };
            }

            this.eCommands = document.querySelectorAll(".drag");
        }


        //============================================================================ Stamp Mode
        else if(mode == "Stamp Mode") {
            this.commandPanel.classList.add("tag-mode");

            for (let i=0; i < length; i++) {
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

                this.player.command[i] = null;

                btn1.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 0);
                    this.player.command[i] = null;
                });

                btn2.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 1);
                    this.player.command[i] = "up";
                });

                btn3.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 2);
                    this.player.command[i] = "right";
                });

                btn4.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 3);
                    this.player.command[i] = "down";
                });
                btn5.addEventListener("click", () => {
                    this.playSound("pop");

                    this.setIcon(icon, 4);
                    this.player.command[i] = "left";
                });

                this.eHideOnRun.push(btn1);
                this.eHideOnRun.push(btn2);
                this.eHideOnRun.push(btn3);
                this.eHideOnRun.push(btn4);
                this.eHideOnRun.push(btn5);
            }

            this.eCommands = document.querySelectorAll(".tag");
        }
    }

    setIcon(iconElement, code) {
        iconElement.classList.remove("fa-solid", "fa-arrow-up", "fa-arrow-right", "fa-arrow-down", "fa-arrow-left");

        switch (code) {
            case 1 : iconElement.classList.add("fa-solid", "fa-arrow-up"); break;
            case 2 : iconElement.classList.add("fa-solid", "fa-arrow-right"); break;
            case 3 : iconElement.classList.add("fa-solid", "fa-arrow-down"); break;
            case 4 : iconElement.classList.add("fa-solid", "fa-arrow-left"); break;
        }
    }

    setCommand(code) {
        switch (code) {
            case 1 : return "up";
            case 2 : return "right";
            case 3 : return "down";
            case 4 : return "left";
        }

        return null;
    }

}