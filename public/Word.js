import Position from "./Position.js";

export default class Word {
    constructor(_board, _wordtText, _id, _width, _height) {
        this.board = _board;
        this.isActive = false;
        this.wordText = _wordtText;
        this.id = _id;
        this.dimensions = new Position(_width, _height);
        this.div = document.createElement("div");
        this.position = new Position(0, 0);
        this.offset = new Position(0, 0);

        this.span = document.createElement("span");
        this.span.innerHTML = this.wordText;
        this.div.classList.add("box");
        this.div.classList.add("static");
        this.div.setAttribute("id", this.id);
        this.div.appendChild(this.span);
    }

    setText(text) {
        this.wordText = text;
        this.span.innerHTML = text;
    }

    setPositionFromTouch(touchX, touchY) {
        let posX = touchX - this.offset.x;
        let posY = touchY - this.offset.y;

        //  constrain to the screen
        if (posX < 0) {
            posX = 0;
        } else if (posX + this.dimensions.x > window.innerWidth) {
            posX = window.innerWidth - this.dimensions.x;
        }

        if (posY < 0) {
            posY = 0;
        } else if (posY + this.dimensions.y > window.innerHeight) {
            posY = window.innerHeight - this.dimensions.y;
        }

        this.position.x = posX;
        this.position.y = posY;
        this.div.style.left = posX + "px";
        this.div.style.top = posY + "px";
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
        this.offset.x = 0;
        this.offset.y = 0;
    }
}
