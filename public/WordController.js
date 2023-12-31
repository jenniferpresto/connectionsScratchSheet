import Position from "./Position.js";
import Word from "./Word.js";

export default class WordController {
    constructor(wordStrings, isTouchScreen, isHorizontal) {
        this.initialPositions = [];
        this.existingWords = new Map();
        this.deletedWords = [];
        this.container = document.getElementById("word-container");
        this.activeWord = null;
        this.wordWidth = 0;
        this.wordHeight = 0;
        this.wordSpacing = 0;
        this.isInDeleteMode = false;
        this.setup(wordStrings, isTouchScreen, isHorizontal);
    }

    /**
     * Setup
     */
    setup(wordStrings, isTouchScreen, isHorizontal) {
        let wordAreaWidth;
        if (isTouchScreen) {
            wordAreaWidth = isHorizontal
                ? screen.width * 0.6
                : screen.width - 40;
        } else {
            wordAreaWidth = window.innerWidth - 40;
        }
        this.wordWidth = Math.min(wordAreaWidth / 4, 150);
        this.wordHeight = Math.max(this.wordWidth * 0.4, 42);
        this.wordSpacing = this.wordWidth < 150 ? 10 : 20;
        const topPos = isTouchScreen && isHorizontal ? 0 : 75;

        this.setUpInitialPositions(this.wordWidth, this.wordHeight, topPos);
        for (const [idx, wordString] of wordStrings.entries()) {
            this.addWord(wordString);
        }
    }

    setUpInitialPositions(wordWidth, wordHeight, topPos) {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const pos = new Position(
                    x * (wordWidth + this.wordSpacing) + this.wordSpacing / 2,
                    y * (wordHeight + this.wordSpacing) +
                        this.wordSpacing / 2 +
                        topPos
                );
                this.initialPositions.push(pos);
            }
        }
    }

    /**
     * General operation
     */
    addWord(wordText) {
        if (this.existingWords.size >= 16) {
            return;
        }
        //  create or recycle existing word
        let newWord;
        //  create a brand new word
        if (!this.deletedWords.length) {
            const idx = this.existingWords.size;
            newWord = new Word(this, wordText, "box" + idx);
            newWord.setPositionFromTouch(
                this.initialPositions[idx].x,
                this.initialPositions[idx].y
            );
            newWord.div.style.width = this.wordWidth + "px";
            newWord.div.style.height = this.wordHeight + "px";
            if (this.wordWidth < 150) {
                newWord.div.style.fontSize = "1.0rem";
            }
            this.existingWords.set("box" + idx, newWord);
        }
        //  recycle a previously deleted word
        else {
            newWord = this.deletedWords.pop();
            newWord.setText(wordText);
            this.existingWords.set(newWord.id, newWord);
        }
        this.container.appendChild(newWord.div);
        this.adjustTextWidth(newWord.div);
    }

    removeAllWords() {
        this.activeWord = null;
        this.existingWords.forEach((word, idx) => {
            word.div.remove();
            this.deletedWords.push(word);
        });
        this.existingWords.clear();
    }

    adjustTextWidth(div) {
        div.style.fontSize = this.wordWidth < 150 ? "1.0rem" : "1.5rem";
        const sizes = ["1.0rem", "0.825rem", "0.75rem", "0.625rem", "0.5rem"];
        //  allow for inner border
        const maxWordSize = this.wordWidth - 6;
        if (div.childNodes[0].clientWidth <= maxWordSize) {
            return;
        }
        for (let size of sizes) {
            if (div.childNodes[0].clientWidth > maxWordSize) {
                div.style.fontSize = size;
            }
            if (div.childNodes[0].clientWidth <= maxWordSize) {
                break;
            }
        }
    }

    setPreDelete() {
        this.isInDeleteMode = true;
        this.existingWords.forEach((word, idx) => {
            if (!word.div.classList.contains("pre-delete")) {
                word.div.classList.add("pre-delete");
            }
        });
    }

    unsetPreDelete() {
        this.isInDeleteMode = false;
        this.existingWords.forEach((word, idx) => {
            if (word.div.classList.contains("pre-delete")) {
                word.div.classList.remove("pre-delete");
            }
        });
        this.deletedWords.forEach((word, idx) => {
            if (word.div.classList.contains("pre-delete")) {
                word.div.classList.remove("pre-delete");
            }
        });
    }

    pressWordForDeletionById(id) {
        const word = this.existingWords.get(id);
        if (!word.div.classList.contains("pressed")) {
            word.div.classList.add("pressed");
        }
    }

    unpressWordById(id) {
        const word = this.existingWords.get(id);
        if (word) {
            if (word.div.classList.contains("pressed")) {
                word.div.classList.remove("pressed");
            }
        }
    }

    removeWordById(id) {
        const word = this.existingWords.get(id);
        if (this.existingWords.delete(id)) {
            if (word.div.classList.contains("pressed")) {
                word.div.classList.remove("pressed");
            }
            word.div.remove();
            this.deletedWords.push(word);
        } else {
            console.log("Error: Word to delete not in existing words set");
        }
    }

    activateWordById(id, x, y) {
        const word = this.existingWords.get(id);
        this.onWordActivated(word, x, y);
    }

    onWordActivated(word, x, y) {
        if (this.activeWord) {
            console.log(
                "Error: Shouldn't have a new touch if there's already an active word"
            );
            this.activeWord.deactivate();
        }
        this.activeWord = word;
        //  move word to the top
        this.container.removeChild(this.activeWord.div);
        this.container.appendChild(this.activeWord.div);
        word.activate(x, y);
    }

    onPointerMoved(x, y) {
        if (!this.activeWord) {
            return;
        }
        this.activeWord.setPositionFromTouch(x, y);
    }

    onPointerLifted() {
        if (this.activeWord) {
            this.activeWord.deactivate();
            this.activeWord = null;
        }
    }
}
