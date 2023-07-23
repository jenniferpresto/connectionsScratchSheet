function setup() {
    // put setup code here
    const cnv = createCanvas(innerWidth, innerHeight);
    cnv.parent("main-container");

  }
  
  function draw() {
    clear();
    fill(255);
    // put drawing code here
    if (mouseIsPressed) {
        ellipse(mouseX, mouseY, 80, 80);
    }
  }
  