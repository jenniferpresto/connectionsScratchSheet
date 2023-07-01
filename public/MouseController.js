class MouseController {
    constructor() {
        this.activeWord = null;
    }

    setActiveWord(word) {
        this.activeWord = word;
    }

    setUpListeners() {
        document.addEventListener(
            "mousedown",
            function (e) {
              if (this.activeWord) {
                if (e.target.id?.startsWith("delete-active")) {
                  removeWord(this.activeWord);
                } else {
                  setDivPos(this.activeWord, e.clientX, e.clientY);
                  deactivateWord(this.activeWord);
                }
              } else if (e.target.id?.startsWith("box")) {
                activeDiv = e.target;
                setOffsets(this.activeWord, e.clientX, e.clientY);
                activateWord(this.activeWord);
              }
            },
            true
          );
        
          document.addEventListener("mousemove", (e) => {
            if (this.activeWord) {
              setDivPos(activeDiv, e.clientX, e.clientY);
            }
          });
        
          //  listen for space bar or escape button
          document.addEventListener("keydown", function (e) {
            if (!activeDiv) {
              return;
            }
            if (e.keyCode === 27 || e.keyCode === 32) {
              deactivateWord(this.activeWord);
              activeDiv = null;
            } else if (e.keyCode === 8) {
              removeWord(this.activeWord);
            }
          });
        
    }

}