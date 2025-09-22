/////////////////////////////////////////////////////////////////////////////
////////////////////////     Main Menu Script        ////////////////////////
////////////////////////     22 Sept, 2025           ////////////////////////
////////////////////////     Galang P Mahardhika     ////////////////////////
/////////////////////////////////////////////////////////////////////////////

class MainMenu {
    gameTransition = document.getElementById("curtain");
    panelMenu = document.getElementById("menu-panel");
    panelPlayer = document.getElementById("player-panel");

    btnMenus = document.querySelectorAll(".button-menu");
    btnGenders = document.querySelectorAll(".gender button");
    btnAges = document.querySelectorAll(".age button");
    btnCancel = document.getElementById("button-cancel");
    btnPlay = document.getElementById("button-play");

    constructor() {
        this.destination = undefined;
        this.gender = undefined;
        this.age = undefined;

        this.panelPlayer.style.display = "none";

        this.buttonInit();
        this.openCurtain();
    }


    // ======================================================================================> Curtain Management

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


    // ======================================================================================> Buttons

    buttonInit() {

        // Menu Buttons
        this.btnMenus.forEach((btn, n) => {
            let gamePage = undefined;

            switch (n) {
                case 0 : gamePage = "page1.html"; break;
                case 1 : gamePage = "page2.html"; break;
                case 2 : gamePage = "page3.html"; break;
                case 3 : gamePage = "page4.html"; break;
                case 4 : gamePage = "page5.html"; break;
            }

            btn.addEventListener("click", () => {
                this.panelMenu.style.display = "none";
                this.panelPlayer.style.display = "flex";
                this.destination = gamePage;
            });
        });

        // Gender Buttons
        this.btnGenders.forEach((btn, n) => {
            btn.addEventListener("click", () => {
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
                this.btnAges.forEach((element) => {
                    element.classList.remove("active");
                });

                btn.classList.add("active");

                this.age = n + 6;

                this.setPlayButton();
            });
        });

        // Cancel Button
        this.btnCancel.addEventListener("click", () => {
            
            this.btnPlay.classList.remove("active");
            
            this.gender = undefined;
            this.btnGenders.forEach((element) => {
                element.classList.remove("active");
            });

            this.age = undefined;
            this.btnAges.forEach((element) => {
                element.classList.remove("active");
            });

            this.destination = undefined;
            this.panelMenu.style.display = "flex";
            this.panelPlayer.style.display = "none";
        });

        // Play Button
        this.btnPlay.addEventListener("click", () => {
            if (this.btnPlay.className == "active") {
                console.log(`${this.destination} | ${this.gender} | ${this.age}`);
            }
        })
    }

    setPlayButton(){
        if (this.destination !== undefined && this.gender !== undefined && this.age !== undefined) {
            this.btnPlay.classList.add("active");
        }
    }

}