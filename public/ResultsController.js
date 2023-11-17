export default class ResultsController {
    constructor(loadingAnimationController,
        todayIdx,
        onHide) {
        this.todayIdx = todayIdx;
        this.loadingMessage = document.getElementById("loading-message");
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
    // fetchWithTimeout = async (resource, options = {}) => {
    //     const { timeout = 8000 } = options;
    //     const controller = new AbortController();
    //     console.log("Timeout is ", timeout);
    //     const id = setTimeout(() => controller.abort(), timeout);
    //     return await fetch(resource, {
    //         ...options,
    //         signal: controller.signal
    //     })
    //     .then(res => {
    //         console.log("Then");
    //         return res.json();
    //     })
    //     .catch(err => {
    //         console.log("Catch");
    //         console.log("Name: ", err.name);
    //         console.log("Message: ", err.message);
    //         console.log(err);
    //         const errorMessage = {
    //             id: err.name,
    //         };
    //         return errorMessage;
    //     })
    //     .then(data => {
    //         clearTimeout(id);
    //         return data;
    //     });
    // }

    getResultForDay = async (dayIdx) => {
        console.log("Fetching results");
        // const { timeout = 8000 } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000);
        return await fetch(`/resultDay/${dayIdx}`, {
            // timeout: 5000,
            signal: controller.signal,
        })
        .then(res => res.json())
        .catch(err => {
            console.log("Catch");
            console.log("Name: ", err.name);
            console.log("Message: ", err.message);
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
            // // .then((res) => res.json())
            // .then((data) => {
            //     console.log("Received data: ", data);
            //     return data;
            // })
            // .catch(err => {
            //     console.log(err);
            //     console.log(typeof err);
            //     console.log(err.statusText);
            // })
            // .then((data) => {
            //     this.loadingAnimationController.hide();
            //     return data;
            // });
    };

    getPastResults = async (dayIdx) => {
        this.showLoading(dayIdx + 1);
        this.getResultForDay(dayIdx)
            .then(data => {
                if (data.id === -1) {
                    //  error handling
                    this.showError("Whoops");
                } else {
                    this.showResults(data);
                }
            })
            .catch(err => {
                console.log("Whoops", err);
                this.showError("Unknown whoops");
                //  more error handling
            });
        console.log("Doing it");
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
        this.hideElement(this.loadingMessage);
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
        this.showElement(this.loadingMessage);
        this.loadingMessage.innerHTML = errorMsg;
        this.showElement(this.selectDayForm);
        this.showElement(this.closeButton);
    }

    showLoading(dayNum) {
        this.clearResultsAndShow();
        this.showElement(this.loadingMessage);
        this.hideElement(this.selectDayForm);
        this.hideElement(this.closeButton);
        this.loadingMessage.innerHTML = "Loading results for Connections # " + dayNum.toString();
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
}
