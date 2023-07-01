import Position from "./Position.js";
import Word from "./Word.js";

export default class BoardController {
  constructor(wordStrings) {
    this.initialPositions = [];
    this.existingWords = [];
    this.deletedWords;
    this.container = document.getElementById("main-container");
    this.activeWord = null;
    this.setup(wordStrings);
  }

  setup(wordStrings) {
    const isTouchScreen = navigator.maxTouchPoints > 0;
    //  assumes word spacing of 10px if touchscreen
    const wordWidth = isTouchScreen
      ? Math.min((screen.width - 40) / 4, 150)
      : 150;
      const wordHeight = wordWidth * 0.4;
    console.log("WOrd width: ", wordWidth);
    console.log("Screen width: ", screen.width);
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
      this.existingWords.push(newWord);
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
    word.activate(
      event.targetTouches[0].clientX,
      event.targetTouches[0].clientY
    );
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
