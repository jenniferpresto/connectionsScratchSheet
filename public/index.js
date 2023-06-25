const fetchAndRender = async () => {
  await fetch("/data")
    .then((res) => res.json())
    .then((data) => renderPage(data))
    .catch((err) => {
      console.log(err);
      const container = document.getElementById("main-container");
      container.innerHTML = "Unable to get today&rsquo;s words";
    });
};

const renderPage = (words) => {
  const container = document.getElementById("main-container");
  const instructions = document.getElementById("instructions");
  const inputForm = document.getElementById("add-word");
  const inputField = document.getElementById("new-word");
  const deleteActiveButton = document.getElementById("delete-active");
  const deleteAllButton = document.getElementById("delete-all");

  const initialPositions = [];
  const existingDivs = new Map();
  const deletedDivs = [];
  let xOffset, yOffset;
  let activeDiv;
  let instructionsDidUpdate = false;

  const createWordDiv = (id, word) => {
    const wordDiv = document.createElement("div");
    const textNode = document.createTextNode(word);
    wordDiv.classList.add("box");
    wordDiv.classList.add("static");
    wordDiv.setAttribute("id", id);
    wordDiv.appendChild(textNode);
    return wordDiv;
  };

  const initialSetup = () => {
    inputField.value = "";
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const xPos = i * 200 + 20;
        const yPos = j * 80 + 80;
        initialPositions.push({ left: xPos + "px", top: yPos + "px" });
      }
    }
    deleteActiveButton.disabled = true;
    deleteAllButton.disabled = true;
    deleteActiveButton.disabled = true;
  };

  const updateInstructions = () => {
    instructions.innerHTML =
      "If the words aren&rsquo;t correct, select any you want and hit delete, and then you can add more.";
    instructionsDidUpdate = true;
  };

  const setInitialWords = () => {
    if (words.length !== 16) {
      console.log("Here's what we got instead of what's expected: ", words);
      instructions.innerHTML =
        "Unable to get today&rsquo;s words. You can add below.";
      inputForm.classList.remove("hidden");
      return;
    }
    updateInstructions();

    for (i in words) {
      const wordDiv = createWordDiv("box" + i, words[i]);
      container.appendChild(wordDiv);
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const boxId = i * 4 + j;

        const xPos = i * 200 + 20;
        const yPos = j * 80 + 80;
        const divId = "box" + boxId;
        const div = document.getElementById(divId);
        div.style.left = xPos + "px";
        div.style.top = yPos + "px";

        // initialPositions.push({ x: xPos + "px", y: yPos + "px" });
        existingDivs.set(divId, { left: div.style.left, top: div.style.top });
        deleteAllButton.disabled = false;
      }
    }
  };

  const getValue = (style) => {
    return parseInt(style.substring(0, style.length - 2));
  };

  const setOffsets = (div, mouseX, mouseY) => {
    xOffset = mouseX - getValue(div.style.left);
    yOffset = mouseY - getValue(div.style.top);
  };

  const setDivPos = (div, mouseX, mouseY) => {
    div.style.left = mouseX - xOffset + "px";
    div.style.top = mouseY - yOffset + "px";
    existingDivs.set(div.id, { left: div.style.left, top: div.style.top });
  };

  const activateWord = (div) => {
    activeDiv.classList.remove("static");
    activeDiv.classList.add("moving");
    deleteActiveButton.disabled = false;
    deleteAllButton.disabled = true;
  };

  const deactivateWord = (div) => {
    activeDiv.classList.remove("moving");
    activeDiv.classList.add("static");
    deleteActiveButton.disabled = true;

    if (existingDivs.size) {
      deleteAllButton.disabled = false;
    }
  };

  const addWord = (word) => {
    if (!instructionsDidUpdate) {
      updateInstructions();
    }
    if (existingDivs.size >= 16) {
      console.log("Error keeping track of existing words");
      return;
    }

    let newId, pos;
    if (deletedDivs.length) {
      const lastRemoved = deletedDivs.pop();
      newId = lastRemoved.id;
      pos = lastRemoved.pos;
    } else {
      newId = "box" + existingDivs.size;
      pos = {
        left: initialPositions[existingDivs.size].left,
        top: initialPositions[existingDivs.size].top,
      };
    }
    const newDiv = createWordDiv(newId, word);
    newDiv.style.left = pos.left;
    newDiv.style.top = pos.top;
    container.appendChild(newDiv);
    existingDivs.set(newId, pos);
    inputField.value = "";
    if (deleteAllButton.disabled) {
      deleteAllButton.disabled = false;
    }
  };

  const removeWord = (div) => {
    existingDivs.delete(div.id);
    deletedDivs.push({
      id: div.id,
      pos: { left: div.style.left, top: div.style.top },
    });
    div.remove();
    activeDiv = null;

    if (existingDivs.size < 16) {
      if (inputForm.classList.contains("hidden")) {
        inputForm.classList.remove("hidden");
      }
    }
    
    if (existingDivs.size > 0) {
      deleteAllButton.disabled = false;
    }
  };

  const removeAllWords = () => {
    existingDivs.forEach((pos, boxId) => {
      const word = document.getElementById(boxId);
      word.remove();
    });
    activeDiv = null;
    existingDivs.clear();
    while (deletedDivs.length) {
      deletedDivs.pop();
    }

    if (inputForm.classList.contains("hidden")) {
      inputForm.classList.remove("hidden");
    }
    deleteAllButton.disabled = true;
  }

  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addWord(inputField.value);
    if (existingDivs.size >= 16) {
      inputForm.classList.add("hidden");
    }
  });

  deleteActiveButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (activeDiv) {
      removeWord(activeDiv);
    }
  });

  deleteAllButton.addEventListener("click", e => {
    e.preventDefault();
    removeAllWords();
  });

  document.addEventListener(
    "mousedown",
    function (e) {
      if (activeDiv) {
        setDivPos(activeDiv, e.clientX, e.clientY);
        deactivateWord(activeDiv);
        activeDiv = null;
      } else if (e.target.id?.startsWith("box")) {
        activeDiv = e.target;
        setOffsets(activeDiv, e.clientX, e.clientY);
        activateWord(activeDiv);
      }
    },
    true
  );

  document.addEventListener("mousemove", (e) => {
    if (activeDiv) {
      setDivPos(activeDiv, e.clientX, e.clientY);
    }
  });

  //  listen for space bar or escape button
  document.addEventListener("keydown", function (e) {
    if (!activeDiv) {
      return;
    }
    if (e.keyCode === 27 || e.keyCode === 32) {
      deactivateWord(activeDiv);
      activeDiv = null;
    } else if (e.keyCode === 8) {
      removeWord(activeDiv);
    }
  });

  initialSetup();
  setInitialWords();
};

fetchAndRender();
