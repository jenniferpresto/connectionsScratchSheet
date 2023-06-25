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

  if (words.length !== 16) {
    container.innerHTML = "Unable to get today&rsquo;s words";
    return;
  }

  const WIDTH = 150;
  const HEIGHT = 60;
  let xOffset, yOffset;
  let activeDiv;

  for (i in words) {
    const wordDiv = document.createElement("div");
    const textNode = document.createTextNode(words[i]);
    wordDiv.classList.add("box");
    wordDiv.classList.add("static");
    wordDiv.setAttribute("id", "box" + i);
    wordDiv.appendChild(textNode);
    container.appendChild(wordDiv);
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const boxId = i * 4 + j;

      const xPos = i * 200 + 20;
      const yPos = j * 80 + 20;
      const divId = "box" + boxId;
      const div = document.getElementById(divId);
      div.style.left = xPos + "px";
      div.style.top = yPos + "px";
      div.style.width = WIDTH + "px";
      div.style.height = HEIGHT + "px";
    }
  }

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
  };

  const activateDiv = (div) => {
    activeDiv.classList.remove("static");
    activeDiv.classList.add("moving");
  };

  const deactivateDiv = (div) => {
    activeDiv.classList.remove("moving");
    activeDiv.classList.add("static");
  };

  document.addEventListener(
    "mousedown",
    function (e) {
      if (activeDiv) {
        setDivPos(activeDiv, e.clientX, e.clientY);
        deactivateDiv(activeDiv);
        activeDiv = null;
      } else if (e.target.id?.startsWith("box")) {
        activeDiv = e.target;
        setOffsets(activeDiv, e.clientX, e.clientY);
        activateDiv(activeDiv);
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
    if ((e.keyCode === 27 || e.keyCode === 32) && activeDiv) {
      deactivateDiv(activeDiv);
      activeDiv = null;
    }
  });
};

fetchAndRender();
