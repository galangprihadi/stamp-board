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

class Utama {
    constructor(param) {
        this.btnKirim = document.getElementById("button-kirim");

        this.formAction = param.formAction;
        this.entry1 = param.entry1;
        this.entry2 = param.entry2;

        this.btnKirim.addEventListener("click", () => {
            this.submitForm();
        });
    }

    async submitForm() {
        const playerId = "John Doe";
        const playerData = "abcd1234";

        const formData = new FormData();
        formData.append(this.entry1, playerId);
        formData.append(this.entry2, playerData);

        try {
            await fetch(this.formAction, {
                method: 'POST',
                mode: 'no-cors',
                body: formData,
            });

            console.log("Seharusnya sudah terkirim!");
        }
        catch (error) {
            console.log(error);
        }
    }
}