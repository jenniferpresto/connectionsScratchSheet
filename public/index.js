import WordController from "./WordController.js";
import ResultsController from "./ResultsController.js";
import Position from "./Position.js";

const renderTestWords = () => {
  renderPage([
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
  ]);
}

const getDataFromJson = async () => {
  await fetch("/connectionsJson")
  .then(res => res.json())
  .then(data => renderPage(data))
  .catch(e => {
    console.log(e);
    renderPage([]);
  });
  // renderTestWords();
}

const getResultForDay = async (dayNum) => {
  const resultsData = await (fetch(`/resultDay/${dayNum}`)
  .then(res => res.json())
  .then(data => {
    console.log(data);
    return data;
  })
  .catch(e => {
    console.log("Error: ", e);
    return {};
  }));
  return resultsData;
}

const renderPage = (words) => {
  const instructions = document.getElementById("instructions");
  const inputForm = document.getElementById("add-word");
  const inputField = document.getElementById("new-word");
  const submitNewWordButton = document.getElementById("submit-new-word");
  const buttonContainer = document.getElementById("button-container");
  const deleteOneButton = document.getElementById("delete-one");
  const deleteAllButton = document.getElementById("delete-all");
  const getHistoryButton = document.getElementById("get-history");

  let instructionsDisplayingError = false;
  let pressedElement = "";
  let touchStartPos = new Position();

  const isTouchScreen = navigator.maxTouchPoints > 0;
  const isHorizontal = screen.width > screen.height;
  const wordBoard = new WordController(words, isTouchScreen, isHorizontal);
  const results = new ResultsController();

  const showInput = () => {
    if (inputForm.classList.contains("hidden")) {
      inputForm.classList.remove("hidden");
    }
  }

  const activateInput = () => {
    showInput();
    inputField.focus();
  };

  const setPreDelete = () => {
    wordBoard.setPreDelete();
    if (!buttonContainer.classList.contains("hidden")) {
      buttonContainer.classList.add("hidden");
    }
    if (instructions.classList.contains("hidden")) {
      instructions.classList.remove("hidden");
      const verb = isTouchScreen ? "tap" : "click";
      instructions.innerHTML = `${verb[0].toUpperCase() + verb.substring(1)} a word to remove it; ${verb} the background to cancel`;
    }
  }

  const unsetPreDelete = () => {
    wordBoard.unsetPreDelete();
    if (buttonContainer.classList.contains("hidden")) {
      buttonContainer.classList.remove("hidden");
    }
    if (!instructions.classList.contains("hidden")) {
      instructions.classList.add("hidden");
    }
  }

  if (wordBoard.existingWords.size === 0) {
    activateInput();
    instructions.innerHTML = "Unable to load words";
    instructionsDisplayingError = true;
  } else {
    instructions.classList.add("hidden");
    buttonContainer.classList.remove("hidden");
  }

  //  position elements based on screen
  const edgeDist = wordBoard.wordSpacing / 2 + "px";
  inputForm.style.left = edgeDist;
  if (isTouchScreen) {
    buttonContainer.style.top = edgeDist;
    if (isHorizontal) {
      buttonContainer.style.right = edgeDist;
      buttonContainer.style.width = "110px";
      buttonContainer.style.textAlign = "right";
      deleteOneButton.style.marginLeft = 0;
      deleteOneButton.style.marginTop = edgeDist;
      instructions.style.float = "right";
      instructions.style.textAlign = "right";
      instructions.style.width = "200px";
      instructions.style.fontSize = "1.0rem";
    } else {
      buttonContainer.style.left = edgeDist;
    }
  } else {
    buttonContainer.style.left = edgeDist;
  }

  inputField.value = "";

  const addNewWordFromInput = () => {
    if (!inputField.value) {
      return;
    }
    wordBoard.addWord(inputField.value);
    inputField.value = "";
    if (instructionsDisplayingError) {
      instructions.innerHTML = "";
      instructions.classList.add("hidden");
    }
    if (buttonContainer.classList.contains("hidden")) {
      buttonContainer.classList.remove("hidden");
    }
    if (wordBoard.existingWords.size === 16) {
      inputField.blur();
      inputForm.classList.add("hidden");
    } else {
      inputField.focus();
    }
  };

  const pressElement = (elementId, x, y) => {
    pressedElement = elementId;
    touchStartPos.x = x;
    touchStartPos.y = y;
    if (elementId.includes("all")) {
      deleteAllButton.classList.add("pressed");
    } else if (elementId.includes("one")) {
      deleteOneButton.classList.add("pressed");
    } else if (elementId.includes("history")) {
      getHistoryButton.classList.add("pressed");
    }
    else if (elementId.includes("box")) {
      wordBoard.pressWordForDeletionById(elementId);
    } else {
      console.log("Error in selecting element");
    }
  };

const unpressElement = () => {
    let deleteButton;
    if (!pressedElement) {
      return;
    }
    if (pressedElement.includes("delete") || pressedElement.includes("history")) {
      if (pressedElement.includes("all")) {
        deleteButton = deleteAllButton;
      } else if (pressedElement.includes("one")) {
        deleteButton = deleteOneButton;
      } else if (pressedElement.includes("history")) {
        deleteButton = getHistoryButton;
      }
      if (deleteButton.classList.contains("pressed")) {
        deleteButton.classList.remove("pressed");
      }
    } else if (pressedElement.includes("box")) {
      wordBoard.unpressWordById(pressedElement);
    }
    pressedElement = "";
  };

  /**
   * Listeners
   */
  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addNewWordFromInput();
  });

  deleteAllButton.addEventListener("click", (e) => {
    e.preventDefault();
    wordBoard.removeAllWords();
    activateInput();
  });

  deleteOneButton.addEventListener("click", e => {
    e.preventDefault();
    setPreDelete();
  })

  getHistoryButton.addEventListener("click", e => {
    e.preventDefault();
    getResultForDay(42)
    .then(data => results.showResults(data));
  });

  document.addEventListener("mousedown", (e) => {
    if (e.target.id?.startsWith("box")) {
      if (wordBoard.isInDeleteMode) {
        // pressedElement = e.target.id;
        pressElement(
          e.target.id,
          e.clientX,
          e.clientY
        );
      } else {
        wordBoard.activateWordById(e.target.id, e.clientX, e.clientY);
      }
      e.preventDefault();
    }
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!e.targetTouches) {
        return;
      }
      if (e.target.id?.startsWith("main-container")) {
        document.activeElement?.blur();
        if (wordBoard.isInDeleteMode) {
          unsetPreDelete();
        }
      } else if (e.target.id?.startsWith("box")) {
        e.preventDefault();
        if (wordBoard.isInDeleteMode) {
          pressedElement = e.target.id;
          pressElement(
            e.target.id,
            e.targetTouches[0].clientX,
            e.targetTouches[0].clientY
          );
        } else {
          wordBoard.activateWordById(
            e.target.id,
            e.targetTouches[0].clientX,
            e.targetTouches[0].clientY
          );
        }
      } else if (e.target.id?.startsWith("delete-") ||
      e.target.id?.startsWith("get-history")) {
        e.preventDefault();
        pressElement(
          e.target.id,
          e.targetTouches[0].clientX,
          e.targetTouches[0].clientY
        );
      } else if (e.target === inputField) {
        e.target.focus();
      } else if (e.target === submitNewWordButton) {
        addNewWordFromInput();
      }
    },
    { passive: false }
  );

  document.addEventListener("mousemove", (e) => {
    e.preventDefault();
    if (wordBoard.isInDeleteMode) {
      if (pressedElement && pressedElement.startsWith("box")) {
        if (
          Math.abs(e.clientX - touchStartPos.x) > 15 ||
          Math.abs(e.clientY - touchStartPos.y) > 15
        ) {
          unpressElement();
        }
      }
    } else {
      wordBoard.onPointerMoved(e.clientX, e.clientY);
    }
  });

  document.addEventListener("mouseup", (e) => {
    e.preventDefault();
    if (wordBoard.isInDeleteMode) {
      if (pressedElement) {
        wordBoard.removeWordById(pressedElement);
        showInput();
      }
      unsetPreDelete();
    } else {
      wordBoard.onPointerLifted();
    }
    unpressElement();
  });

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!e.targetTouches.length) {
        return;
      }
      //  make sure you don't drag too much before you delete all the words
      if (pressedElement) {
        if (
          Math.abs(e.changedTouches[0].clientX - touchStartPos.x) > 15 ||
          Math.abs(e.changedTouches[0].clientY - touchStartPos.y) > 15
        ) {
          unpressElement();
        }
        return;
      }

      if (wordBoard.activeWord) {
        e.preventDefault();
        wordBoard.onPointerMoved(
          e.targetTouches[0].clientX,
          e.targetTouches[0].clientY
        );
      }
    },
    { passive: false }
  );

  document.addEventListener("touchend", (e) => {
    e.preventDefault();
    wordBoard.onPointerLifted();
    if (pressedElement) {
      console.log("Pressed eleent: ", pressedElement);
      if (pressedElement.includes("delete") || pressedElement.includes("history")) {
        console.log("if-statement");
        if (
          e.target.id?.startsWith("delete-all") &&
          pressedElement === "delete-all"
        ) {
          if (!e.changedTouches.length) {
            return;
          }
          wordBoard.removeAllWords();
          activateInput();
        } else if (
          e.target.id?.startsWith("delete-one") &&
          pressedElement === "delete-one"
        ) {
          if (!e.changedTouches.length) {
            return;
          }
          setPreDelete();
        } else if (
          e.target.id?.startsWith("get-history") &&
          pressedElement === "get-history"
        ) {
          console.log("History button touch ended");
          if (!e.changedTouches.length) {
            return;
          }
          getResultForDay(35)
          .then(data => results.showResults(data));
        }
      }
      // else if (pressedElement.includes("history")) {
      //   getResultForDay(35);
      // }
      else {
        wordBoard.removeWordById(pressedElement);
        unsetPreDelete();
        showInput();
      }
      unpressElement();
    } else {
      if (wordBoard.isInDeleteMode) {
        unsetPreDelete();
      }
    }
  });

  document.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    wordBoard.onPointerLifted();
  });
};

getDataFromJson();
