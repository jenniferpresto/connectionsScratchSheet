import Position from "./Position.js";
import Word from "./Word.js";

export default class WordController {
  constructor(wordStrings, isTouchScreen, isHorizontal) {
    this.initialPositions = [];
    this.existingWords = new Map();
    this.deletedWords = [];
    this.container = document.getElementById("main-container");
    this.activeWord = null;
    this.wordWidth = 0;
    this.wordHeight = 0;
    this.wordSpacing = 0;
    this.setup(wordStrings, isTouchScreen, isHorizontal);
  }

  /**
   * Setup
   */
  setup(wordStrings, isTouchScreen, isHorizontal) {
    const wordAreaWidth = isHorizontal ? screen.width * 0.6 : screen.width - 40;
    this.wordWidth = isTouchScreen ? Math.min(wordAreaWidth / 4, 150) : 150;
    this.wordHeight = this.wordWidth * 0.4;
    this.wordSpacing = this.wordWidth < 150 ? 10 : 20;
    const topPos = isTouchScreen && isHorizontal ? 0 : 75;

    this.setUpInitialPositions(this.wordWidth, this.wordHeight, topPos);
    for (const [idx, wordString] of wordStrings.entries()) {
      this.addWord(wordString);
    }
  }

  setUpInitialPositions(wordWidth, wordHeight, topPos) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const pos = new Position(
          i * (wordWidth + this.wordSpacing) + this.wordSpacing / 2,
          j * (wordHeight + this.wordSpacing) + this.wordSpacing / 2 + topPos
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
    const idx = this.existingWords.size;
    const newWord = new Word(this, wordText, "box" + idx);
    newWord.setPositionFromTouch(
      this.initialPositions[idx].x,
      this.initialPositions[idx].y
    );
    newWord.div.style.width = this.wordWidth + "px";
    newWord.div.style.height = this.wordHeight + "px";
    if (this.wordWidth < 150) {
      newWord.div.style.fontSize = "1.0rem";
    }
    this.container.appendChild(newWord.div);
    this.existingWords.set("box" + idx, newWord);
    this.adjustTextWidth(newWord.div);
  }

  removeAllWords() {
    this.activeWord = null;
    this.existingWords.forEach((word, id) => {
      word.div.remove();
    });
    this.existingWords.clear();
    while (this.deletedWords.length) {
      this.deletedWords.pop();
    }
  }

  adjustTextWidth(div) {
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

  /**
   * Interactions
   */
  onWordClicked(event, word) {
    this.onWordActivated(word, event.clientX, event.clientY);
  }

  onWordTouched(event, word) {
    if (!event.targetTouches) {
      return;
    }
    this.onWordActivated(
      word,
      event.targetTouches[0].clientX,
      event.targetTouches[0].clientY
    );
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
