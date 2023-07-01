import Position from "./Position.js";
import Word from "./Word.js";

export default class BoardController {
  constructor(wordStrings) {
    this.initialPositions = [];
    this.existingWords = new Map();
    this.deletedWords = [];
    this.container = document.getElementById("main-container");
    this.activeWord = null;
    this.setup(wordStrings);
  }

  /**
   * Setup
  */
  setup(wordStrings) {
    const isTouchScreen = navigator.maxTouchPoints > 0;
    //  assumes word spacing of 10px if touchscreen
    const wordWidth = isTouchScreen
      ? Math.min((screen.width - 40) / 4, 150)
      : 150;
      const wordHeight = wordWidth * 0.4;
    this.setUpInitialPositions(wordWidth, wordHeight);
    for (const [idx, wordString] of wordStrings.entries()) {
      const newWord = new Word(this, wordString, "box" + idx, isTouchScreen);
      newWord.setPositionFromTouch(
        this.initialPositions[idx].x,
        this.initialPositions[idx].y
      );
      newWord.div.style.width = wordWidth + "px";
      newWord.div.style.height = wordHeight + "px";
      if (wordWidth < 150) {
        newWord.div.style.fontSize = "1.0rem";
      }
      this.container.appendChild(newWord.div);
      this.existingWords.set("box" + idx, newWord);
    }
  }

  setUpInitialPositions(wordWidth, wordHeight) {
    const wordSpacing = wordWidth < 150 ? 10 : 20;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const pos = new Position((i * (wordWidth + wordSpacing)) + (wordSpacing / 2), (j * (wordHeight + wordSpacing)) + (wordSpacing / 2) + 60);
        this.initialPositions.push(pos);
      }
    }
  }

  /**
   * General operation
   */
  removeAllWords() {
    this.activeWord = null;
    this.existingWords.forEach((word, id) => {
      word.div.remove();
    });
    this.existingWords.clear();
    while(this.deletedWords.length) {
      this.deletedWords.pop();
    }
  }

  /**
   * Interactions
  */
  onWordClicked(event, word) {
    this.onWordActivated(word, event.clientX, event.clientY);
  };

  onWordTouched(event, word) {
    if (!event.targetTouches) {
      return;
    }
    this.onWordActivated(word, event.targetTouches[0].clientX, event.targetTouches[0].clientY);
  };

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
