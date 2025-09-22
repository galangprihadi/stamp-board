const lib = {
    gameTransition : document.getElementById("game-transition"),

    openTransition() {
        const handlerStart = () => {
            this.gameTransition.style.display = "none";
            this.gameTransition.classList.remove("ani-transition-out");
            this.gameTransition.removeEventListener("animationend", handlerStart);
        }
        
        this.gameTransition.classList.add("ani-transition-out");
        this.gameTransition.addEventListener("animationend", handlerStart);
    },
};