import WordController from "./WordController.js";
import ResultsController from "./ResultsController.js";
import Position from "./Position.js";
import LoadingAnimationController from "./LoadingAnimationController.js";

const IS_DEV = false;
const renderTestWords = () => {
    renderPage({
        id: 255,
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
    if (IS_DEV) {
        renderTestWords();
    } else {
        await fetch("/connectionsJson")
        .then(res => res.json())
        .then(data => renderPage(data))
        .catch(err => {
            console.log(err);
            renderPage({ id: -1, words: [] });
        });
    }
};

const loadingAnimation = new LoadingAnimationController();

const renderPage = (data) => {
    const todayGameNum = parseInt(data.gameNum);
    const words = data.words;
    const mainContainer = document.getElementById("main-container");
    const instructions = document.getElementById("instructions");
    const addWordForm = document.getElementById("add-word");
    const addWordInput = document.getElementById("new-word");
    const buttonContainer = document.getElementById("button-container");

    //  two-step buttons at top
    const deleteOneButton = document.getElementById("delete-one");
    const deleteAllButton = document.getElementById("delete-all");
    const resetGridButton = document.getElementById("reset-grid");
    const getHistoryButton = document.getElementById("get-history");

    //  disable resetGridButton until something has moved
    resetGridButton.disabled = true;
    //  TEMP: disable getHistory button until adjusted for v2 data
    getHistoryButton.disabled = true;

    const twoStepButtonMap = new Map();
    twoStepButtonMap.set("delete-one", deleteOneButton);
    twoStepButtonMap.set("delete-all", deleteAllButton);
    // twoStepButtonMap.set("reset-size", resetSizeButton);
    twoStepButtonMap.set("reset-grid", resetGridButton);
    twoStepButtonMap.set("get-history", getHistoryButton);

    const selectDayButton = document.getElementById("select-day-button");
    const selectDayInput = document.getElementById("input-day");
    const resultsModalContainer = document.getElementById("results-modal-container");

    loadingAnimation.hide();

    let instructionsDisplayingError = false;
    let pressedSpecialElement = "";
    let pressedGenericElement = null;
    let touchStartPos = new Position();

    const isTouchScreen = navigator.maxTouchPoints > 0;
    // const isHorizontal = window.innerWidth > window.innerHeight;
    //  TODO: Revisit horizontal positioning
    const isHorizontal = false;
    const wordBoard = new WordController(words, isTouchScreen, isHorizontal);

    const enableGridButton = () => {
        resetGridButton.disabled = false;
    }

    wordBoard.setOnWordMoved(enableGridButton);

    const results = new ResultsController(
        loadingAnimation,
        todayGameNum,
        () => mainContainer.appendChild(loadingAnimation.getContainer()));

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

    //  TODO: Move to ResultsController
    const requestResultsForDay = () => {
        if (!selectDayInput.value) {
            return;
        }

        let requestedGameNum = 0;
        try  { 
            requestedGameNum = Number(selectDayInput.value);
        } catch (e) {
          selectDayInput.value = "";
          return;
        }

        selectDayInput.value = "";
        if (requestedGameNum >= todayGameNum || todayGameNum < 0) {
            results.showError(`Please choose a number between 1 and ${todayGameNum-1}`);
          return;
        }

        selectDayInput.blur();
        results.getPastResults(requestedGameNum);
    };

    const pressElement = (elementId, x, y) => {
        pressedSpecialElement = elementId;
        touchStartPos.x = x;
        touchStartPos.y = y;
        if (twoStepButtonMap.has(elementId)) {
            twoStepButtonMap.get(elementId).classList.add("pressed");
        } else if (elementId.includes("box")) {
            wordBoard.pressWordForDeletionById(elementId);
        } else {
            console.log("Error in selecting element");
        }
    };

    const unpressElement = () => {
        if (!pressedSpecialElement) {
            return;
        }
        if (twoStepButtonMap.has(pressedSpecialElement)) {
            const activeButton = twoStepButtonMap.get(pressedSpecialElement);
            if (activeButton.classList.contains("pressed")) {
                activeButton.classList.remove("pressed");
            }
        } else if (pressedSpecialElement.includes("box")) {
            wordBoard.unpressWordById(pressedSpecialElement);
        }
        pressedSpecialElement = "";
    };

    /**
     * General touch handler
     */
    const touchHandler = event => {
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
    window.addEventListener("resize", () => {
        wordBoard.resetWordSize();
        enableGridButton();
    });

    /**
     * Key listeners for document
     */
    document.addEventListener("keyup", (e) => {
        if (e.key === "Escape") {
            results.hideResults();
        }
    });

    /**
     * Mouse listeners for specific elements
     */
    addWordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addNewWordFromInput();
    });

    selectDayButton.addEventListener("click", (e) => {
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

    // resetSizeButton.addEventListener("click", e => {
    //     e.preventDefault();
    //     wordBoard.resetWordSize();
    // });

    resetGridButton.addEventListener("click", e => {
        e.preventDefault();
        wordBoard.resetGrid();
        resetGridButton.disabled = true;
    });

    getHistoryButton.addEventListener("click", (e) => {
        e.preventDefault();
        results.clearResultsAndShow();
    });

    resultsModalContainer.addEventListener("click", (e) => {
        e.preventDefault();
        if (e.target !== resultsModalContainer) {
            return;
        }
        results.hideResults();
    });

    /**
     * Mouse listeners for document
     */
    document.addEventListener("mousedown", (e) => {
        //  This is a hack to prevent the apple keyboard from popping
        //  up and immediately disappearing on certain iPhones
        //  Similar to discussion here:
        //  https://github.com/select2/select2/issues/3493
        if (isTouchScreen &&
            (!e.target.id ||
                (results.isVisible && e.target.id === "results-content"))) {
            e.preventDefault();
            return;
        }
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
        //  Same hack described above
        //  Prevents apple keyboard from popping up and disappearing
        if (isTouchScreen &&
            (!e.target.id ||
                (results.isVisible && e.target.id === "results-content"))) {
            return;
        }
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
            //  TODO: This is painful
            if (twoStepButtonMap.has(pressedSpecialElement)) {
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
                } else if (
                    e.target.id === "reset-grid" &&
                    pressedSpecialElement === "reset-grid"
                ) {
                    wordBoard.resetGrid();
                    resetGridButton.disabled = true;
                } else if (
                    e.target.id === "reset-size" &&
                    pressedSpecialElement === "reset-size"
                ) {
                    wordBoard.resetWordSize();
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
