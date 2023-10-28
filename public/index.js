import WordController from "./WordController.js";
import ResultsController from "./ResultsController.js";
import Position from "./Position.js";

const renderTestWords = () => {
    renderPage({
        id: -1,
        words: [
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
        ],
    });
};

const getDataFromJson = async () => {
    await fetch("/connectionsJson")
        .then((res) => res.json())
        .then((data) => renderPage(data))
        .catch((e) => {
            console.log(e);
            renderPage({ id: -1, words: [] });
        });
    // renderTestWords();
};

const getResultForDay = async (dayNum) => {
    return await fetch(`/resultDay/${dayNum}`)
        .then((res) => res.json())
        .then((data) => {
            return data;
        })
};

const renderPage = (data) => {
    const todayId = data.id;
    const words = data.words;
    const instructions = document.getElementById("instructions");
    const addWordForm = document.getElementById("add-word");
    const addWordInput = document.getElementById("new-word");
    const buttonContainer = document.getElementById("button-container");
    const deleteOneButton = document.getElementById("delete-one");
    const deleteAllButton = document.getElementById("delete-all");
    const getHistoryButton = document.getElementById("get-history");
    const selectDayForm = document.getElementById("select-day");
    const selectDayInput = document.getElementById("input-day");
    const resultsTitle = document.getElementById("results-title");
    const resultsModalContainer = document.getElementById("results-modal-container");

    //  set the day's number in the results modal
    document.getElementById("today-number").innerHTML = (todayId + 1).toString();

    let instructionsDisplayingError = false;
    let pressedSpecialElement = "";
    let pressedGenericElement = null;
    let touchStartPos = new Position();

    const isTouchScreen = navigator.maxTouchPoints > 0;
    const isHorizontal = screen.width > screen.height;
    const wordBoard = new WordController(words, isTouchScreen, isHorizontal);
    const results = new ResultsController();

    const showInput = () => {
        if (addWordForm.classList.contains("hidden")) {
            addWordForm.classList.remove("hidden");
        }
    };

    const activateInput = () => {
        showInput();
        addWordInput.focus();
    };

    const setPreDelete = () => {
        wordBoard.setPreDelete();
        if (!buttonContainer.classList.contains("hidden")) {
            buttonContainer.classList.add("hidden");
        }
        if (instructions.classList.contains("hidden")) {
            instructions.classList.remove("hidden");
            const verb = isTouchScreen ? "tap" : "click";
            instructions.innerHTML = `${
                verb[0].toUpperCase() + verb.substring(1)
            } a word to remove it; ${verb} the background to cancel`;
        }
    };

    const unsetPreDelete = () => {
        wordBoard.unsetPreDelete();
        if (buttonContainer.classList.contains("hidden")) {
            buttonContainer.classList.remove("hidden");
        }
        if (!instructions.classList.contains("hidden")) {
            instructions.classList.add("hidden");
        }
    };

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
    addWordForm.style.left = edgeDist;
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

    addWordInput.value = "";

    const addNewWordFromInput = () => {
        if (!addWordInput.value) {
            return;
        }
        wordBoard.addWord(addWordInput.value);
        addWordInput.value = "";
        if (instructionsDisplayingError) {
            instructions.innerHTML = "";
            instructions.classList.add("hidden");
        }
        if (buttonContainer.classList.contains("hidden")) {
            buttonContainer.classList.remove("hidden");
        }
        if (wordBoard.existingWords.size === 16) {
            addWordInput.blur();
            addWordForm.classList.add("hidden");
        } else {
            addWordInput.focus();
        }
    };

    const requestResultsForDay = () => {
        if (!selectDayInput.value) {
            return;
        }

        let day = 0;
        try  { day = Number(selectDayInput.value);
        } catch (e) {
          console.log("Must enter number", e);
          selectDayInput.value = "";
          return;
        }

        selectDayInput.value = "";
        const dayIdx = day - 1;
        if (dayIdx >= todayId || dayIdx < 0) {
          //  TODO: show error message for out-of-range number
          return;
        }

        selectDayInput.blur();
        getResultForDay(dayIdx)
        .then(data => {
          results.showResults(data);
          resultsTitle.innerHTML = "Results for Connections # " + day.toString();
        })
        .catch(err => {
            console.log("Whoops", err);
        });
    };

    const pressElement = (elementId, x, y) => {
        pressedSpecialElement = elementId;
        touchStartPos.x = x;
        touchStartPos.y = y;
        if (elementId.includes("all")) {
            deleteAllButton.classList.add("pressed");
        } else if (elementId.includes("one")) {
            deleteOneButton.classList.add("pressed");
        } else if (elementId.includes("history")) {
            getHistoryButton.classList.add("pressed");
        } else if (elementId.includes("box")) {
            wordBoard.pressWordForDeletionById(elementId);
        } else {
            console.log("Error in selecting element");
        }
    };

    const unpressElement = () => {
        let deleteButton;
        if (!pressedSpecialElement) {
            return;
        }
        if (
            pressedSpecialElement.includes("delete") ||
            pressedSpecialElement.includes("history")
        ) {
            if (pressedSpecialElement.includes("all")) {
                deleteButton = deleteAllButton;
            } else if (pressedSpecialElement.includes("one")) {
                deleteButton = deleteOneButton;
            } else if (pressedSpecialElement.includes("history")) {
                deleteButton = getHistoryButton;
            }
            if (deleteButton.classList.contains("pressed")) {
                deleteButton.classList.remove("pressed");
            }
        } else if (pressedSpecialElement.includes("box")) {
            wordBoard.unpressWordById(pressedSpecialElement);
        }
        pressedSpecialElement = "";
    };

    const closeResults = () => {
        results.hideResults();
    };

    /**
     * General touch handler
     */
    const touchHandler = (event) => {
        let touches = event.changedTouches;
        if (!touches || !touches.length) {
            return;
        }
        const first = touches[0];
        let type = "";
        let isClick = false;
        switch (event.type) {
            case "touchstart":
                type = "mousedown";
                pressedGenericElement = first.target;
                break;
            case "touchmove":
                type = "mousemove";
                break;
            case "touchend":
                type = "mouseup";
                if (first.target === pressedGenericElement) {
                    isClick = true;
                }
                pressedGenericElement = null;
                break;
            default:
                return;
        }

        const mouseEvent = new MouseEvent(type, {
            screenX: first.screenX,
            screenY: first.screenY,
            clientX: first.clientX,
            clientY: first.clientY,
        });

        first.target.dispatchEvent(mouseEvent);
        if (isClick) {
            const clickEvent = new MouseEvent("click", {
                screenX: first.screenX,
                screenY: first.screenY,
                clientX: first.clientX,
                clientY: first.clientY,
            });
            first.target.dispatchEvent(clickEvent);
        }
    };

    /**
     * Listeners
     */

    /**
     * Key listeners for document
     */
    document.addEventListener("keyup", (e) => {
        if (e.key === "Escape") {
            if (results.getIsVisible()) {
                closeResults();
            }
        }
    });

    /**
     * Mouse listeners for specific elements
     */
    addWordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addNewWordFromInput();
    });

    selectDayForm.addEventListener("submit", (e) => {
        e.preventDefault();
        requestResultsForDay();
    });

    deleteAllButton.addEventListener("click", (e) => {
        e.preventDefault();
        wordBoard.removeAllWords();
        activateInput();
    });

    deleteOneButton.addEventListener("click", (e) => {
        e.preventDefault();
        setPreDelete();
    });

    getHistoryButton.addEventListener("click", (e) => {
        e.preventDefault();
        results.clearResultsAndShow();
    });

    resultsModalContainer.addEventListener("click", (e) => {
        if (e.target !== resultsModalContainer) {
            return;
        }
        e.preventDefault();
        results.hideResults();
    });

    /**
     * Mouse listeners for document
     */
    document.addEventListener("mousedown", (e) => {
        if (e.target.id?.startsWith("box")) {
            if (wordBoard.isInDeleteMode) {
                pressElement(e.target.id, e.clientX, e.clientY);
            } else {
                wordBoard.activateWordById(e.target.id, e.clientX, e.clientY);
            }
            e.preventDefault();
        }
    });

    document.addEventListener("mousemove", (e) => {
        e.preventDefault();
        if (wordBoard.isInDeleteMode) {
            if (
                pressedSpecialElement &&
                pressedSpecialElement.startsWith("box")
            ) {
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
            if (pressedSpecialElement) {
                wordBoard.removeWordById(pressedSpecialElement);
                showInput();
            }
            unsetPreDelete();
        } else {
            wordBoard.onPointerLifted();
        }
        unpressElement();
    });

    /**
     * Touch listeners
     */
    document.addEventListener(
        "touchstart",
        (e) => {
            if (!e.targetTouches) {
                return;
            }
            if (e.target.id === "main-container") {
                document.activeElement?.blur();
                if (wordBoard.isInDeleteMode) {
                    unsetPreDelete();
                }
            } else if (e.target.id?.startsWith("box")) {
                e.preventDefault();
                if (wordBoard.isInDeleteMode) {
                    pressedSpecialElement = e.target.id;
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
            } else if (e.target.classList?.contains("two-step-button")) {
                e.preventDefault();
                pressElement(
                    e.target.id,
                    e.targetTouches[0].clientX,
                    e.targetTouches[0].clientY
                );
            } else if (
                e.target === addWordInput ||
                e.target === selectDayInput
            ) {
                e.target.focus();
            } else {
                touchHandler(e);
            }
        },
        { passive: false }
    );

    document.addEventListener(
        "touchmove",
        (e) => {
            if (!e.targetTouches.length) {
                return;
            }
            //  make sure you don't drag too much before you delete all the words
            if (pressedSpecialElement) {
                if (
                    Math.abs(e.changedTouches[0].clientX - touchStartPos.x) >
                        15 ||
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
                return;
            }
            touchHandler(e);
        },
        { passive: false }
    );

    document.addEventListener("touchend", (e) => {
        wordBoard.onPointerLifted();
        if (pressedSpecialElement) {
            if (
                pressedSpecialElement.includes("delete") ||
                pressedSpecialElement.includes("history")
            ) {
                if (
                    e.target.id === "delete-all" &&
                    pressedSpecialElement === "delete-all"
                ) {
                    if (!e.changedTouches.length) {
                        return;
                    }
                    wordBoard.removeAllWords();
                    activateInput();
                } else if (
                    e.target.id === "delete-one" &&
                    pressedSpecialElement === "delete-one"
                ) {
                    if (!e.changedTouches.length) {
                        return;
                    }
                    setPreDelete();
                } else if (
                    e.target.id === "get-history" &&
                    pressedSpecialElement === "get-history"
                ) {
                    if (!e.changedTouches.length) {
                        return;
                    }
                    results.clearResultsAndShow();
                }
            } else {
                wordBoard.removeWordById(pressedSpecialElement);
                unsetPreDelete();
                showInput();
            }
            unpressElement();
        } else if (wordBoard.isInDeleteMode) {
            unsetPreDelete();
        } else {
            touchHandler(e);
        }
    });

    document.addEventListener("touchcancel", (e) => {
        e.preventDefault();
        wordBoard.onPointerLifted();
    });
};

getDataFromJson();
