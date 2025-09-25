/////////////////////////////////////////////////////////////////////////////
////////////////////////     Main Menu Script        ////////////////////////
////////////////////////     22 Sept, 2025           ////////////////////////
////////////////////////     Galang P Mahardhika     ////////////////////////
/////////////////////////////////////////////////////////////////////////////

class MainMenu {
    gameTransition = document.getElementById("curtain");
    panelMenu = document.getElementById("menu-panel");
    panelPlayer = document.getElementById("player-panel");
    panelNavigation = document.getElementById("navigation-panel");

    btnMenus = document.querySelectorAll(".button-menu");
    btnGenders = document.querySelectorAll(".gender button");
    btnAges = document.querySelectorAll(".age button");

    soundCling = document.getElementById("soundCling");
    soundPop = document.getElementById("soundPop");

    playSound(soundId) {
        if (soundId == "cling") {
            this.soundCling.currentTime = 0;
            this.soundCling.play();
        }
        else if (soundId == "pop") {
            this.soundPop.currentTime = 0;
            this.soundPop.play();
        }
    }

    openCurtain() {
        const handlerOpen = () => {
            this.gameTransition.style.display = "none";
            this.gameTransition.classList.remove("ani-transition-out");
            this.gameTransition.removeEventListener("animationend", handlerOpen);
        }
        
        this.gameTransition.classList.add("ani-transition-out");
        this.gameTransition.addEventListener("animationend", handlerOpen);
    }

    closeCurtain() {
        const handlerClose = () => {
            this.gameTransition.classList.remove("ani-transition-in");
            this.gameTransition.removeEventListener("animationend", handlerClose);
            window.location.href = this.destination;
        }

        this.gameTransition.style.display = "flex";
        this.gameTransition.classList.add("ani-transition-in");
        this.gameTransition.addEventListener("animationend", handlerClose);
    }

    constructor() {
        this.destination = undefined;
        this.gender = undefined;
        this.age = undefined;

        this.panelPlayer.style.display = "none";

        this.setPanelMenu();
        this.openCurtain();
    }


    // ======================================================================================> Menu Panel

    setPanelMenu() {
        this.destination = undefined;
        this.gender = undefined;
        this.age = undefined;

        this.panelMenu.style.display = "flex";
        this.panelPlayer.style.display = "none";

        // Menu Buttons
        this.btnMenus.forEach((btn, n) => {
            btn.addEventListener("click", () => {
                if (btn.classList.value == "button-menu active") {
                    this.playSound("pop");

                    this.destination = btn.getAttribute("destination");
                    this.setPlayerPanel();
                }
            });
        });
    }

    setPlayerPanel() {
        this.panelNavigation.innerHTML = "";

        this.panelMenu.style.display = "none";
        this.panelPlayer.style.display = "flex";

        // Gender Buttons
        this.btnGenders.forEach((btn, n) => {
            btn.addEventListener("click", () => {
                this.playSound("pop");

                this.btnGenders.forEach((element) => {
                    element.classList.remove("active");
                });

                btn.classList.add("active");

                if (n == 0) {
                    this.gender = "boy";
                }
                else {
                    this.gender = "girl";
                }

                this.setPlayButton();
            });
        });


        // Age Buttons
        this.btnAges.forEach((btn, n) => {
            btn.addEventListener("click", () => {
                this.playSound("pop");

                this.btnAges.forEach((element) => {
                    element.classList.remove("active");
                });

                btn.classList.add("active");

                this.age = n + 6;

                this.setPlayButton();
            });
        });

        // Cancel Button
        this.btnCancel = document.createElement("button");
        this.btnCancel.className = "button-cancel active";
        this.btnCancel.textContent = "Cancel";
        this.panelNavigation.append(this.btnCancel);

        this.btnCancel.addEventListener("click", () => {
            this.playSound("pop");

            this.setPanelMenu();

            this.btnGenders.forEach((element) => {
                element.classList.remove("active");
            });

            this.btnAges.forEach((element) => {
                element.classList.remove("active");
            });
        });


        // Play Button
        let pages = this.destination.split(",");
        pages = pages.map(item => item.trim().replace(/"/g, ''));

        this.btnPlays = [];

        pages.forEach((page, i) => {
            this.btnPlays[i] = document.createElement("button");
            this.btnPlays[i].className = "button-play";

            if (pages.length == 1) {
                this.btnPlays[i].textContent = "Play";
            }
            else {
                this.btnPlays[i].textContent = "Game " + String.fromCharCode(i + 65);
            }
            
            this.panelNavigation.append(this.btnPlays[i]);

            this.btnPlays[i].addEventListener("click", () => {
                if (this.btnPlays[i].className == "button-play active") {
                    this.playSound("cling");

                    this.destination = pages[i];
                    localStorage.setItem("playerData", `${this.gender}-${this.age}`);

                    this.closeCurtain();
                }
            });
        });
    }

    setPlayButton(){
        if (this.destination !== undefined && this.gender !== undefined && this.age !== undefined) {
            this.btnPlays.forEach((btn) => {
                btn.classList.add("active");
            });
        }
    }

}