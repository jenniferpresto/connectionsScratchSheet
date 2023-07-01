import {createWord, activateWordClasses, deactivateWordClasses} from "./wordHelpers.js";
import WordController from "./WordController.js";
import Position from "./Position.js";

const fetchAndRender = async () => {
  await fetch("/data")
    .then((res) => res.json())
    .then((data) => renderPage(data))
    .catch((err) => {
      console.log(err);
      // const container = document.getElementById("main-container");
      // container.innerHTML = "Unable to get today&rsquo;s words";
      renderPage([]);
    });
//   renderPage(["hello", "goodbye", "up", "down", "plenty",
// "math", "science", "aggressive", "link",
// "one", "two", "three", "how",
// "pigeon", "fowl", "foul"]);
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
  let touchDeleteButtonPos = null;
  const Words = new WordController(words);

  const activateInput = () => {
    if (inputForm.classList.contains("hidden")) {
      inputForm.classList.remove("hidden");
    }
  }

  if (Words.existingWords.size === 0) {
    activateInput();
  }

  instructions.classList.add("hidden");

  // const deletedDivs = [];
  let instructionsDidUpdate = false;

    deleteAllButton.classList.remove("hidden");
    deleteAllButton.style.top = (Words.wordSpacing / 2)+ "px";
    deleteAllButton.style.left = (Words.wordSpacing / 2) + "px";

    inputField.value = "";

  // const updateInstructions = () => {
  //   instructions.innerHTML =
  //     "If the words aren&rsquo;t correct, select any you want and hit delete, and then you can add more.";
  //   instructionsDidUpdate = true;
  // };


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
    Words.addWord(inputField.value);
    inputField.value = "";
  });


  deleteAllButton.addEventListener("click", (e) => {
    e.preventDefault();
    Words.removeAllWords();
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

  document.addEventListener("mousedown", e => {
    if (e.target.id?.startsWith("box")) {
      Words.activateWordById(e.target.id, e.clientX, e.clientY);
      e.preventDefault();
    }
  });

  document.addEventListener("touchstart", e => {
    if (!e.targetTouches) {
      return;
    }
    if (e.target.id?.startsWith("box")) {
      e.preventDefault();
      Words.activateWordById(e.target.id, e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    } else if (e.target.id?.startsWith("delete-all")) {
      e.preventDefault();
      isTouchingDeleteAllButton = true;
      touchDeleteButtonPos = new Position(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
      deleteAllButton.classList.add("pressed");
    } else if (e.target === inputField) {
      console.log("new word, ", e.target);
      e.target.focus();
    } else if (e.target === submitNewWordButton) {
      inputField.blur();
      if (inputField.value != "") {
        Words.addWord(inputField.value);
        inputField.value = "";
      }
    }
  }, {passive: false});

  document.addEventListener("mousemove", (e) => {
    e.preventDefault();
    Words.onPointerMoved(e.clientX, e.clientY);
  });

  document.addEventListener("mouseup", (e) => {
    e.preventDefault();
    Words.onPointerLifted();
  });

  document.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!e.targetTouches.length) {
      return;
    }
    Words.onPointerMoved(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  }, {passive: false});

  document.addEventListener("touchend", e => {
    console.log("e: ", e);
    e.preventDefault();
    Words.onPointerLifted();
    if (e.target.id?.startsWith("delete-all") && isTouchingDeleteAllButton) {
      if (!e.changedTouches.length) {
        return;
      }
      //  make sure you didn't drag too much before you delete all the words
      if ((Math.abs(e.changedTouches[0].clientX - touchDeleteButtonPos.x) < 10)
      && (Math.abs(e.changedTouches[0].clientY - touchDeleteButtonPos.y)) < 10) {
        Words.removeAllWords();
        activateInput();
      }
    }
    isTouchingDeleteAllButton = false;
    touchDeleteButtonPos = null;
    if (deleteAllButton.classList.contains("pressed")) {
      deleteAllButton.classList.remove("pressed");
    }
});

  document.addEventListener("touchcancel", e => {
    e.preventDefault();
    Words.onPointerLifted();
  })

};
// getRealData();
fetchAndRender();

