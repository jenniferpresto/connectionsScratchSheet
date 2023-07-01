import Position from "./Position.js";

export default class Word {
    constructor(_board, _wordtText, _id) {
        this.board = _board;
        this.isActive = false;
        this.wordText = _wordtText;
        this.id = _id;
        this.div = document.createElement("div");
        this.position = new Position(0, 0);
        this.offset = new Position(0, 0);

        const textNode = document.createTextNode(this.wordText);
        this.div.classList.add("box");
        this.div.classList.add("static");
        this.div.setAttribute("id", this.id);
        this.div.appendChild(textNode);
    }

    setPositionFromTouch(touchX, touchY) {
        this.position.x = touchX - this.offset.x;
        this.position.y = touchY - this.offset.y;
        this.div.style.left = (touchX - this.offset.x) + "px";
        this.div.style.top = (touchY - this.offset.y) + "px";
    }

    activate(touchX, touchY) {
        this.div.classList.remove("static");
        this.div.classList.add("moving");
        this.isActive = true;
        this.offset.x = touchX - this.position.x;
        this.offset.y = touchY - this.position.y;
    }

    deactivate() {
        this.div.classList.remove("moving");
        this.div.classList.add("static");
        this.isActive = false;
    }
}
