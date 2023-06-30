function createWord (wordText, id) {
    const wordDiv = document.createElement("div");
    const textNode = document.createTextNode(wordText);
    wordDiv.classList.add("box");
    wordDiv.classList.add("static");
    wordDiv.setAttribute("id", id);
    wordDiv.appendChild(textNode);
    return wordDiv;
}

function activateWordClasses(wordDiv) {
    wordDiv.classList.remove("static");
    wordDiv.classList.add("moving");
}

function deactivateWordClasses(wordDiv) {
    wordDiv.classList.remove("moving");
    wordDiv.classList.add("static");
}

export { createWord, activateWordClasses, deactivateWordClasses };