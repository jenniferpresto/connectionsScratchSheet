export default class ResultsController {
    constructor(loadingAnimationController,
        todayIdx,
        onHide) {
        this.todayIdx = todayIdx;
        this.statusMessage = document.getElementById("results-status-message");
        this.container = document.getElementById("results-modal-container");
        this.content = document.getElementById("results-content");
        this.resultsTitle = document.getElementById("results-title");
        this.resultRowContainer = document.getElementById("results-rows");
        this.resultRows = document.getElementsByClassName("result-row");
        this.selectDayForm = document.getElementById("select-day");
        this.closeButton = document.getElementById("close-button");
        this.isVisible = false;
        this.loadingAnimationController = loadingAnimationController;
        this.onHide = onHide;
        this.setup();
    }

    /**
     * Setup
     */
    setup() {
        //  set the day's number in the results modal
        document.getElementById("today-number").innerHTML = (this.todayIdx + 1).toString();
        this.hideResults();
        this.closeButton.addEventListener("click", e => {
            e.preventDefault();
            this.hideResults();
        });
    }
    
    //  Some references:
    //  https://dmitripavlutin.com/timeout-fetch-request/
    //  https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
    //  https://stackoverflow.com/questions/31061838/how-do-i-cancel-an-http-fetch-request/47250621#47250621
    getResultForDay = async (dayIdx) => {
        // const { timeout = 8000 } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        return await fetch(`/resultDay/${dayIdx}`, {
            // timeout: 5000,
            signal: controller.signal,
        })
        .then(res => res.json())
        .catch(err => {
            console.log(err);
            return ({
                id: -1,
                name: err.name,
            })
        })
        .then(data => {
            clearTimeout(id);
            this.loadingAnimationController.hide();
            return data;
        });
    };

    getPastResults = async (dayIdx) => {
        this.showLoading(dayIdx + 1);
        this.getResultForDay(dayIdx)
            .then(data => {

                if (data.id === -1) {
                    let errorMsg;
                    if (data.name === "AbortError") {
                        errorMsg = "Whoops, the server timed out. " +
                        "It goes to sleep after 15 minutes of inactivity, " +
                        "so try refreshing the page to wake it back up.";
                    } else {
                        errorMsg = "Whoops, something went wrong. Try refreshing the page.";
                    }
                    this.showError(errorMsg);
                } else {
                    this.showResults(data);
                }
            })
            .catch(err => {
                console.log("Unknown error: ", err);
                this.showError("Whoops, something went wrong. Try refreshing the page. " +
                "If it keeps happening, feel free to let Jennifer know.");
                //  more error handling
            });
    }

    hideResults() {
        if (!this.isVisible) {
            return;
        }

        this.isVisible = false;
        if (!this.container.classList.contains("hidden")) {
            this.container.classList.add("hidden");
        }

        if (this.container.classList.contains("showing-results")) {
            this.container.classList.remove("showing-results");
        }

        if (typeof this.onHide === "function") {
            this.onHide();
        }
    }

    clearResultsAndShow() {
        this.isVisible = true;
        this.content.appendChild(this.loadingAnimationController.getContainer());
        this.hideElement(this.resultRowContainer);
        this.showElement(this.container);
    }

    showResults(jsonResults) {
        this.hideElement(this.statusMessage);
        this.showElement(this.selectDayForm);
        this.showElement(this.closeButton);
        this.showElement(this.resultRowContainer);

        this.isVisible = true;

        if (!this.container.classList.contains("showing-results")) {
            this.container.classList.add("showing-results");
        }

        this.resultsTitle.innerHTML = "Results for Connections # " + (jsonResults.id + 1).toString();
        const resultsMap = new Map(Object.entries(jsonResults.groups));
        resultsMap.forEach((groupData, groupName) => {
            const level = groupData.level;
            let members = "";
            groupData.members?.forEach(member => {
                if (members === "") {
                    members += member;
                } else {
                    members += ", " + member;
                }
            });

            const groupDiv = this.resultRows[level].querySelector("#group-" + level.toString());
            const membersDiv = this.resultRows[level].querySelector("#members-" + level.toString());

            if (groupDiv) {
                groupDiv.innerHTML = groupName;
            }

            if (membersDiv) {
                membersDiv.innerHTML = members;
            }
        });
    }

    showError(errorMsg) {
        this.clearResultsAndShow();
        this.setErrorColor();
        this.showElement(this.statusMessage);
        this.statusMessage.innerHTML = errorMsg;
        this.showElement(this.selectDayForm);
        this.showElement(this.closeButton);
    }

    showLoading(dayNum) {
        this.clearResultsAndShow();
        this.unsetErrorColor();
        this.showElement(this.statusMessage);
        this.hideElement(this.selectDayForm);
        this.hideElement(this.closeButton);
        this.statusMessage.innerHTML = "Loading results for Connections # " + dayNum.toString();
        this.loadingAnimationController.setColor("#000");
        this.loadingAnimationController.show();
    }

    hideElement = elem => {
        if (!elem.classList.contains("hidden")) {
            elem.classList.add("hidden");
        }
    }

    showElement = elem => {
        if (elem.classList.contains("hidden")) {
            elem.classList.remove("hidden");
        }
    }

    setErrorColor() {
        if (!this.statusMessage.classList.contains("error")) {
            this.statusMessage.classList.add("error");
        }
    }

    unsetErrorColor() {
        if (this.statusMessage.classList.contains("error")) {
            this.statusMessage.classList.remove("error");
        }
    }
}
