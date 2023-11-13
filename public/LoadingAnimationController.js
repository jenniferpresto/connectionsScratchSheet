export default class LoadingAnimationController {
    constructor() {
        this.animationContainer = document.getElementById("ripple-container");
        this.waves = Array.from(this.animationContainer.children);
    }

    show() {
        if (this.animationContainer.classList.contains("hidden")) {
            this.animationContainer.classList.remove("hidden");
        }
        this.waves.forEach(wave => {
            wave.style.animationPlayState = "running";
        });
    }

    hide() {
        if (!this.animationContainer.classList.contains("hidden")) {
            this.animationContainer.classList.add("hidden");
        }
        this.waves.forEach(wave => {
            wave.style.animationPlayState = "paused";
        });
    }

    setColor(color) {
        this.waves.forEach(wave => {
            wave.style.border = `4px solid ${color}`;
        });
    }
}
