import {createWord, activateWordClasses, deactivateWordClasses} from "./wordHelpers.js";
import WordController from "./WordController.js";

const fetchAndRender = async () => {
  // await fetch("/data")
  //   .then((res) => res.json())
  //   .then((data) => renderPage(data))
  //   .catch((err) => {
  //     console.log(err);
  //     const container = document.getElementById("main-container");
  //     container.innerHTML = "Unable to get today&rsquo;s words";
  //     renderPage([]);
  //   });
  renderPage(["hello", "goodbye", "up", "down", "plenty",
"math", "science", "aggressive", "link",
"one", "two", "three", "how",
"pigeon", "fowl", "foul"]);
};

// const getRealData = async () => {
//   console.log("Navigator touch points: ", navigator.maxTouchPoints);
//   await fetch("/connectionsData")
//   .then(res => res.json())
//   .then(data => console.log(data))
//   .catch(e => console.log(e));
// }

const renderPage = (words) => {
  const Words = new WordController(words);
  const container = document.getElementById("main-container");
  const instructions = document.getElementById("instructions");
  const inputForm = document.getElementById("add-word");
  const inputField = document.getElementById("new-word");
  // const deleteActiveButton = document.getElementById("delete-active");
  const deleteAllButton = document.getElementById("delete-all");
  const IS_MOBILE = navigator.maxTouchPoints > 0;

  const initialPositions = [];
  const existingDivs = new Map();
  const deletedDivs = [];
  let xOffset, yOffset;
  let activeDiv;
  let instructionsDidUpdate = false;

  //  set up initial positions and button states
  // const initialSetup = () => {
  //   inputField.value = "";
  //   for (let i = 0; i < 4; i++) {
  //     for (let j = 0; j < 4; j++) {
  //       const xPos = i * 200 + 20;
  //       const yPos = j * 80 + 80;
  //       initialPositions.push({ left: xPos + "px", top: yPos + "px" });
  //     }
  //   }
  //   console.log("Disabling both buttons");
  //   // deleteActiveButton.disabled = true;
  //   deleteAllButton.disabled = true;
  //   if (IS_MOBILE) {
  //     console.log("Removing hidden");
  //     // deleteActiveButton.classList.remove("hidden");
  //     // console.log("Button itself: ", deleteActiveButton);
  //   }
  //   deleteAllButton.classList.remove("hidden");
  // };

  // const updateInstructions = () => {
  //   instructions.innerHTML =
  //     "If the words aren&rsquo;t correct, select any you want and hit delete, and then you can add more.";
  //   instructionsDidUpdate = true;
  // };

  // const setInitialWords = () => {
  //   if (words.length !== 16) {
  //     console.log("Here's what we got instead of what's expected: ", words);
  //     instructions.innerHTML =
  //       "Unable to get today&rsquo;s words. You can add below.";
  //     inputForm.classList.remove("hidden");
  //     return;
  //   }
  //   updateInstructions();

  //   for (const [idx, wordText] of words.entries()) {
  //     const wordDiv = createWord(wordText, "box" + idx);
  //     container.appendChild(wordDiv);
  //   }
    
  //   for (let i = 0; i < 4; i++) {
  //     for (let j = 0; j < 4; j++) {
  //       const boxId = i * 4 + j;

  //       const xPos = i * 200 + 20;
  //       const yPos = j * 80 + 80;
  //       const divId = "box" + boxId;
  //       const div = document.getElementById(divId);
  //       div.style.left = xPos + "px";
  //       div.style.top = yPos + "px";

  //       existingDivs.set(divId, { left: div.style.left, top: div.style.top });
  //     }
  //   }
  //   deleteAllButton.disabled = false;
  // };

  // const getValue = (style) => {
  //   return parseInt(style.substring(0, style.length - 2));
  // };

  // const setOffsets = (div, mouseX, mouseY) => {
  //   xOffset = mouseX - getValue(div.style.left);
  //   yOffset = mouseY - getValue(div.style.top);
  // };

  // const setDivPos = (div, mouseX, mouseY) => {
  //   div.style.left = mouseX - xOffset + "px";
  //   div.style.top = mouseY - yOffset + "px";
  //   existingDivs.set(div.id, { left: div.style.left, top: div.style.top });
  // };

  // const activateWord = (div) => {
  //   activateWordClasses(div);
  //   // if (IS_MOBILE) {
  //   //   deleteActiveButton.disabled = false;
  //   // }
  //   deleteAllButton.disabled = true;
  // };

  // const deactivateWord = (div) => {
  //   deactivateWordClasses(div);
  //   activeDiv = null;
  //   // if (IS_MOBILE) {
  //   //   deleteActiveButton.disabled = true;
  //   // }

  //   if (existingDivs.size) {
  //     deleteAllButton.disabled = false;
  //   }
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

  // const removeAllWords = () => {
  //   existingDivs.forEach((pos, boxId) => {
  //     const word = document.getElementById(boxId);
  //     word.remove();
  //   });
  //   activeDiv = null;
  //   existingDivs.clear();
  //   while (deletedDivs.length) {
  //     deletedDivs.pop();
  //   }

  //   if (inputForm.classList.contains("hidden")) {
  //     inputForm.classList.remove("hidden");
  //   }
  //   deleteAllButton.disabled = true;
  // };

  /**
   * Listeners
   */
  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addWord(inputField.value);
    if (existingDivs.size >= 16) {
      inputForm.classList.add("hidden");
    }
  });

  // deleteActiveButton.addEventListener("click", (e) => {
  //   e.preventDefault();
  //   if (activeDiv) {
  //     removeWord(activeDiv);
  //   }
  // });

  deleteAllButton.addEventListener("click", (e) => {
    e.preventDefault();
    removeAllWords();
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

  // document.addEventListener("mousemove", (e) => {
  //   if (activeDiv) {
  //     setDivPos(activeDiv, e.clientX, e.clientY);
  //   }
  // });

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
    // console.log(e.targetTouches.length > 0 ? e.targetTouches[0] : "no touches");
    if (!e.targetTouches.length) {
      return;
    }
    Words.onPointerMoved(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  });

  document.addEventListener("touchend", e => {
    e.preventDefault();
    Words.onPointerLifted();
  });

  document.addEventListener("touchcancel", e => {
    e.preventDefault();
    Words.onPointerLifted();
  })

  // initialSetup();
  // setInitialWords();
};
// getRealData();
fetchAndRender();

