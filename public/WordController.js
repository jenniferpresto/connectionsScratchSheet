import Position from "./Position.js";
import Word from "./Word.js";

export default class BoardController {
  constructor() {
    this.initialPositions = [];
    this.existingWords = [];
    this.deletedWords;
    this.container = document.getElementById("main-container");
    this.activeWord = null;
    this.setup();
  }

  setup(words) {
    const isTouchScreen = navigator.maxTouchPoints > 0;
    const firstWord = new Word(this, "Hello", "box47", isTouchScreen);
    this.setUpInitialPositions();
    firstWord.setPositionFromTouch(this.initialPositions[0].x, this.initialPositions[0].y);
    this.container.appendChild(firstWord.div);
  }

  setUpInitialPositions() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const pos = new Position(i * 200 + 20, j * 80 + 80);
        this.initialPositions.push(pos);
      }
    }
  }

  onWordClicked = (event, word) => {
    console.log(`Got clicked! ${word.id}, ${word.wordText}`);
  };

  onWordTouched = (event, word) => {
    console.log(`Got touch! ${word.id}, ${word.wordText}`);
    console.log("Event: ", event);
    if (this.activeWord) {
      console.log(
        "Error: Shouldn't have a new touch if there's already an active word"
      );
      this.activeWord.deactivate();
    }
    this.activeWord = word;
    if (!event.targetTouches.length) {
      return;
    }
    word.activate(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
  };

  onTouchMoved(touch) {
    if (!this.activeWord) {
      return;
    }
    this.activeWord.setPositionFromTouch(touch.clientX, touch.clientY);
  }

  onTouchEnded() {
    if (this.activeWord) {
      this.activeWord.deactivate();
      this.activeWord = null;
    }
  }
}
