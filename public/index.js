const fetchAndRender = async () => {
  await fetch('/data')
  .then (res => res.json())
  .then(data => renderPage(data))
  .catch(err => console.log(err));
};

const renderPage = data => {
  console.log("Rendering page with data: ", data);
  const WIDTH = 150;
  const HEIGHT = 60;
  let xOffset, yOffset;
  let activeDiv;

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const boxId = i * 4 + j;

      const xPos = i * 200 + 20;
      const yPos = j * 80 + 20;
      const divId = "box" + (boxId + 1);
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

  document.addEventListener("keydown", function (e) {
    if ((e.keyCode === 27 || e.keyCode === 32) && activeDiv) {
      deactivateDiv(activeDiv);
      activeDiv = null;
    }
  });
};
setTimeout(fetchAndRender, 200);
