import WordController from "./WordController.js";
import Position from "./Position.js";

const fetchAndRender = async () => {
  await fetch("/data")
    .then((res) => res.json())
    .then((data) => renderPage(data))
    .catch((err) => {
      console.log(err);
      renderPage([]);
    });
  // renderPage(["one", "two", "three"]);
};

// const getRealData = async () => {
//   console.log("Navigator touch points: ", navigator.maxTouchPoints);
//   await fetch("/connectionsData")
//   .then(res => res.json())
//   .then(data => console.log(data))
//   .catch(e => console.log(e));
// }

const renderPage = (words) => {
  const instructions = document.getElementById("instructions");
  const inputForm = document.getElementById("add-word");
  const inputField = document.getElementById("new-word");
  const submitNewWordButton = document.getElementById("submit-new-word");
  // const deleteActiveButton = document.getElementById("delete-active");
  const deleteAllButton = document.getElementById("delete-all");

  // const IS_MOBILE = navigator.maxTouchPoints > 0;
  let isTouchingDeleteAllButton = false;
  let touchStartPos = new Position();
  let instructionsDisplayingError = false;
  let isDragging = false;
  const wordBoard = new WordController(words);

  const activateInput = () => {
    if (inputForm.classList.contains("hidden")) {
      inputForm.classList.remove("hidden");
    }
    inputField.focus();
  };

  if (wordBoard.existingWords.size === 0) {
    activateInput();
    instructions.innerHTML = "Unable to load words";
    instructionsDisplayingError = true;
  } else {
    instructions.classList.add("hidden");
    deleteAllButton.classList.remove("hidden");
  }

  deleteAllButton.style.top = wordBoard.wordSpacing / 2 + "px";
  deleteAllButton.style.left = wordBoard.wordSpacing / 2 + "px";

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
    if (wordBoard.existingWords.size === 16) {
      inputField.blur();
      inputForm.classList.add("hidden");
    } else {
      inputField.focus();
    }
  };

  const pressDeleteButton = (x, y) => {
    isTouchingDeleteAllButton = true;
    touchStartPos.x = x;
    touchStartPos.y = y;
    deleteAllButton.classList.add("pressed");
  };

  const unpressDeleteButton = () => {
    isTouchingDeleteAllButton = false;
    if (deleteAllButton.classList.contains("pressed")) {
      deleteAllButton.classList.remove("pressed");
    }
  };

  // const addWord = (wordText) => {
  //   if (!instructionsDidUpdate) {
  //     updateInstructions();
  //   }
  //   if (existingDivs.size >= 16) {
  //     console.log("Error keeping track of existing words");
  //     return;
  //   }

  //   let newId, pos;
  //   if (deletedDivs.length) {
  //     const lastRemoved = deletedDivs.pop();
  //     newId = lastRemoved.id;
  //     pos = lastRemoved.pos;
  //   } else {
  //     newId = "box" + existingDivs.size;
  //     pos = {
  //       left: initialPositions[existingDivs.size].left,
  //       top: initialPositions[existingDivs.size].top,
  //     };
  //   }
  //   const newDiv = createWord(wordText, newId);
  //   newDiv.style.left = pos.left;
  //   newDiv.style.top = pos.top;
  //   container.appendChild(newDiv);
  //   existingDivs.set(newId, pos);
  //   inputField.value = "";
  //   if (deleteAllButton.disabled) {
  //     deleteAllButton.disabled = false;
  //   }
  // };

  // const removeWord = (div) => {
  //   existingDivs.delete(div.id);
  //   deletedDivs.push({
  //     id: div.id,
  //     pos: { left: div.style.left, top: div.style.top },
  //   });
  //   div.remove();
  //   activeDiv = null;

  //   if (existingDivs.size < 16) {
  //     if (inputForm.classList.contains("hidden")) {
  //       inputForm.classList.remove("hidden");
  //     }
  //   }

  //   if (existingDivs.size > 0) {
  //     deleteAllButton.disabled = false;
  //   }
  //   // if (IS_MOBILE) {
  //   //   console.log("Disabling");
  //   //   deleteActiveButton.disabled = true;
  //   // }
  // };

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

  // document.addEventListener(
  //   "mousedown",
  //   function (e) {
  //     if (activeDiv) {
  //       if (e.target.id?.startsWith("delete-active")) {
  //         removeWord(activeDiv);
  //       } else {
  //         setDivPos(activeDiv, e.clientX, e.clientY);
  //         deactivateWord(activeDiv);
  //       }
  //     } else if (e.target.id?.startsWith("box")) {
  //       activeDiv = e.target;
  //       setOffsets(activeDiv, e.clientX, e.clientY);
  //       activateWord(activeDiv);
  //     }
  //   },
  //   true
  // );

  // //  listen for space bar or escape button
  // document.addEventListener("keydown", function (e) {
  //   if (!activeDiv) {
  //     return;
  //   }
  //   if (e.keyCode === 27 || e.keyCode === 32) {
  //     deactivateWord(activeDiv);
  //     activeDiv = null;
  //   } else if (e.keyCode === 8) {
  //     removeWord(activeDiv);
  //   }
  // });

  document.addEventListener("mousedown", (e) => {
    if (e.target.id?.startsWith("box")) {
      wordBoard.activateWordById(e.target.id, e.clientX, e.clientY);
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
      } else if (e.target.id?.startsWith("box")) {
        e.preventDefault();
        wordBoard.activateWordById(
          e.target.id,
          e.targetTouches[0].clientX,
          e.targetTouches[0].clientY
        );
      } else if (e.target.id?.startsWith("delete-all")) {
        e.preventDefault();
        pressDeleteButton(
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
    wordBoard.onPointerMoved(e.clientX, e.clientY);
  });

  document.addEventListener("mouseup", (e) => {
    e.preventDefault();
    wordBoard.onPointerLifted();
  });

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!e.targetTouches.length) {
        return;
      }
      if (wordBoard.activeWord) {
        e.preventDefault();
        wordBoard.onPointerMoved(
          e.targetTouches[0].clientX,
          e.targetTouches[0].clientY
        );
      }
      //  make sure you don't drag too much before you delete all the words
      if (isTouchingDeleteAllButton) {
        if (
          Math.abs(e.changedTouches[0].clientX - touchStartPos.x) > 15 ||
          Math.abs(e.changedTouches[0].clientY - touchStartPos.y) > 15
        ) {
          unpressDeleteButton();
        }
      }
    },
    { passive: false }
  );

  document.addEventListener("touchend", (e) => {
    e.preventDefault();
    wordBoard.onPointerLifted();
    if (e.target.id?.startsWith("delete-all") && isTouchingDeleteAllButton) {
      if (!e.changedTouches.length) {
        return;
      }
      if (isTouchingDeleteAllButton) {
        wordBoard.removeAllWords();
        activateInput();
      }
    }
    unpressDeleteButton();
  });

  document.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    wordBoard.onPointerLifted();
  });
};
// getRealData();
fetchAndRender();
