let activeDiv = null;

const setMouseInteractions = activeDiv => {
    // document.addEventListener("click", () => {
    //     console.log("Click");
    //     if (activeDiv) {
    //         console.log("ID: ", activeDiv.id);
    //     }
    // });
//   document.addEventListener(
//     "mousedown",
//     function (e) {
//       if (activeDiv) {
//         if (e.target.id?.startsWith("delete-active")) {
//           removeWord(activeDiv);
//         } else {
//           setDivPos(activeDiv, e.clientX, e.clientY);
//           deactivateWord(activeDiv);
//         }
//       } else if (e.target.id?.startsWith("box")) {
//         activeDiv = e.target;
//         setOffsets(activeDiv, e.clientX, e.clientY);
//         activateWord(activeDiv);
//       }
//     },
//     true
//   );

//   document.addEventListener("mousemove", (e) => {
//     if (activeDiv) {
//       setDivPos(activeDiv, e.clientX, e.clientY);
//     }
//   });

//   //  listen for space bar or escape button
//   document.addEventListener("keydown", function (e) {
//     if (!activeDiv) {
//       return;
//     }
//     if (e.keyCode === 27 || e.keyCode === 32) {
//       deactivateWord(activeDiv);
//       activeDiv = null;
//     } else if (e.keyCode === 8) {
//       removeWord(activeDiv);
//     }
//   });
};

export default setMouseInteractions;
