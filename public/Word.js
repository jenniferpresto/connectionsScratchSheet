export default class Word {
    constructor(_board, _text, _id) {
        this.board = _board;
        this.isActive = false;
        this.text = _text;
        this.id = _id;
        this.div = document.createElement("div");

        const textNode = document.createTextNode(this.text);
        this.div.classList.add("box");
        this.div.classList.add("static");
        this.div.setAttribute("id", this.id);
        this.div.appendChild(textNode);

        this.div.addEventListener("mousedown", e => this.onclick(e, this));
        console.log(this.board);
    }

    activate() {
        this.div.classList.remove("static");
        this.div.classList.add("moving");
    }

    deactivate() {

    }

    onclick(event, self) {
        console.log("event", event);
        console.log("this: ", self);
        console.log("That tickles!", this.board);
        this.board.onWordClicked(this);
    }
}
