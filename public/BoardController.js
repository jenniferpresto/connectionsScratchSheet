import Word from "./Word.js";

export default class BoardController {
    constructor() {
        this.container = document.getElementById("main-container");
        this.setup();
    }

    setup() {
        console.log("Setting up");
        const firstWord = new Word(this, "Hello", "box47");
        this.container.appendChild(firstWord.div);
    }

    onWordClicked = word => {
        console.log("Got it!", word.id);
    }
}