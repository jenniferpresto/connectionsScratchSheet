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
        // this.wordAreaWidth = window.innerWidth < 680
        //     ? window.innerWidth - 20
        //     : window.innerWidth - 40;
        // let wordAreaWidth = window.innerWidth - 40;
        // if (isTouchScreen) {
        //     wordAreaWidth = isHorizontal
        //         ? window.innerWidth * 0.6
        //         : window.innerWidth - 40;
        // } else {
        //     this.wordAreaWidth = window.innerWidth - 40;
        // // }
        // this.wordWidth = Math.min(this.wordAreaWidth / 4, 150);
        // this.wordHeight = Math.max(this.wordWidth * 0.4, 42);
        // this.wordSpacing = window.innerWidth < 680 ? 10 : 20;
        // const topPos = isTouchScreen && isHorizontal ? 0 : 75;
        const dimensions = this.calculateWordDimensions();
        this.wordWidth = dimensions.wordWidth;
        this.wordHeight = dimensions.wordHeight;
        this.wordSpacing = dimensions.wordSpacing;

        this.setUpInitialPositions(this.wordWidth, this.wordHeight);
        for (const [idx, wordString] of wordStrings.entries()) {
            this.addWord(wordString);
        }
    }

    setUpInitialPositions(wordWidth, wordHeight) {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const pos = new Position(
                    x * (wordWidth + this.wordSpacing) + this.wordSpacing / 2,
                    y * (wordHeight + this.wordSpacing) +
                        this.wordSpacing / 2 +
                        75
                );
                this.initialPositions.push(pos);
            }
        }
    }

    /**
     * Resetting
     */
    resetWordSize() {
        const newDimensions = this.calculateWordDimensions();
        const widthDiff = this.wordWidth - newDimensions.wordWidth;
        const heightDiff = this.wordHeight - newDimensions.wordHeight;
        console.log("Width diff: " + widthDiff + ", height diff: " + heightDiff);
        this.wordWidth = newDimensions.wordWidth;
        this.wordHeight = newDimensions.wordHeight;
        this.wordSpacing = newDimensions.wordSpacing;

        this.existingWords.forEach(word => {
            console.log("Before: ", word);
            this.setWordAttributes(word);
            const x = word.position.x + widthDiff / 2;
            const y = word.position.y + heightDiff / 2;
            word.setPositionFromTouch(x, y);
            console.log("AFter: ", word);
        });
    }

    resetGrid() {

    }


    /**
     * General operation
     */
    calculateWordDimensions() {
        const areaWidth = window.innerWidth - 40;
        const width = Math.min(areaWidth / 4, 150);
        const height = Math.max(width * 0.4, 42);
        const spacing = window.innerWidth < 680 ? 10 : 20;
        return {
            wordWidth: width,
            wordHeight: height,
            wordSpacing: spacing,
        };
    }

    setWordAttributes(word) {
        word.div.style.width = this.wordWidth + "px";
        word.div.style.height = this.wordHeight + "px";
        word.dimensions.x = this.wordWidth;
        word.dimensions.y = this.wordHeight;
    }

    addWord(wordText) {
        if (this.existingWords.size >= 16) {
            return;
        }
        //  create or recycle existing word
        let newWord;
        //  create a brand new word
        if (!this.deletedWords.length) {
            const idx = this.existingWords.size;
            newWord = new Word(this, wordText, "box" + idx, this.wordWidth, this.wordHeight);
            newWord.setPositionFromTouch(
                this.initialPositions[idx].x,
                this.initialPositions[idx].y
            );
            // newWord.div.style.width = this.wordWidth + "px";
            // newWord.div.style.height = this.wordHeight + "px";
            // if (this.wordWidth < 150) {
            //     newWord.div.style.fontSize = "1.0rem";
            // }
            this.existingWords.set("box" + idx, newWord);
        }
        //  recycle a previously deleted word
        else {
            newWord = this.deletedWords.pop();
            newWord.setText(wordText);
            this.existingWords.set(newWord.id, newWord);
        }
        this.setWordAttributes(newWord);
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
