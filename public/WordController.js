import Position from "./Position.js";
import Word from "./Word.js";

const TOP_POS = 75;

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
        this.onWordMoved = () => {}
    }

    /**
     * Setup
     */
    setup(wordStrings, isTouchScreen, isHorizontal) {
        this.setUpInitialWordPositions(true);
        for (const [idx, wordString] of wordStrings.entries()) {
            this.addWord(wordString);
        }
    }

    setUpInitialWordPositions(shouldSaveDimensions) {
        const dimensions = this.calculateWordDimensions();
        if (shouldSaveDimensions) {
            this.wordWidth = dimensions.wordWidth;
            this.wordHeight = dimensions.wordHeight;
            this.wordSpacing = dimensions.wordSpacing;
        }
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const pos = new Position(
                    x * (dimensions.wordWidth + dimensions.wordSpacing) + dimensions.wordSpacing / 2,
                    y * (dimensions.wordHeight + dimensions.wordSpacing) +
                        dimensions.wordSpacing / 2 +
                        TOP_POS
                );
                this.initialPositions.push(pos);
            }
        }
    }

    setOnWordMoved(onMoved) {
        this.onWordMoved = onMoved;
    }

    /**
     * Resetting
     */
    resetWordSize() {
        const newDimensions = this.calculateWordDimensions(false);
        const widthDiff = this.wordWidth - newDimensions.wordWidth;
        const heightDiff = this.wordHeight - newDimensions.wordHeight;
        this.wordWidth = newDimensions.wordWidth;
        this.wordHeight = newDimensions.wordHeight;
        this.wordSpacing = newDimensions.wordSpacing;

        this.existingWords.forEach(word => {
            this.setWordAttributes(word);
            this.adjustTextWidth(word.div);
            const x = word.position.x + widthDiff / 2;
            const y = word.position.y + heightDiff / 2;
            word.setPositionFromTouch(x, y);
        });
    }

    resetGrid() {
        this.initialPositions = [];
        this.setUpInitialWordPositions(false);
        this.existingWords.forEach(word => {
            const wordIdx = Number(word.id.substr(3));
            if (isNaN(wordIdx) || wordIdx > this.initialPositions.length - 1) {
                console.log("Something has gone horribly wrong reseting the grid");
            } else {
                word.setPositionFromTouch(this.initialPositions[wordIdx].x, this.initialPositions[wordIdx].y);
            }
        });
    }

    /**
     * General operation
     */
    calculateWordDimensions() {
        const areaWidth = window.innerWidth - 40;
        let width = Math.min(areaWidth / 4, 150);
        let height = Math.max(width * 0.4, 42);
        let spacing = window.innerWidth < 680 ? 10 : 20;

        //  short screens; e.g., phone turned sideways
        const totalHeight = (height  * 4) + (spacing * 3.5) + TOP_POS;
        if (totalHeight > window.innerHeight) {
            //  first try a 10px spacing
            spacing = 10;
            const newTotalHeight = (height  * 4) + (spacing * 3.5) + TOP_POS;
            //  if that's not enough, shrink the words
            if (newTotalHeight > window.innerHeight) {
                const newHeight = (window.innerHeight - TOP_POS - 35) / 4;
                height = Math.max(newHeight, 42);
                width = height * 2.5;
            }
        }
    
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
            this.existingWords.set("box" + idx, newWord);
        }
        //  recycle a previously deleted word
        else {
            newWord = this.deletedWords.pop();
            newWord.setText(wordText);
            this.existingWords.set(newWord.id, newWord);
        }
        this.container.appendChild(newWord.div);
        this.setWordAttributes(newWord);
        this.adjustTextWidth(newWord.div);
    }

    removeAllWords() {
        this.activeWord = null;
        this.existingWords.forEach(word => {
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
        this.onWordMoved();
    }

    onPointerLifted() {
        if (this.activeWord) {
            this.activeWord.deactivate();
            this.activeWord = null;
        }
    }
}
