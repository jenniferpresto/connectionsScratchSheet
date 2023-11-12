export default class LoadingAnimationController {
    constructor() {
        this.animationContainer = document.getElementById("ripple-container");
        this.waves = Array.from(this.animationContainer.children);
        console.log("Number of children = ", this.waves.length);
    }

    stopAnimation() {
        if (!this.animationContainer.classList.contains("hidden")) {
            this.animationContainer.classList.add("hidden");
        }
        console.log("Stopping animation");
        console.log(this.waves);
        console.log("Type: ", typeof this.waves);
        this.waves.forEach(wave => {
            wave.style.animationPlayState = "paused";
        });
        // this.waves.style.animationPlayState = "paused";
    }

}