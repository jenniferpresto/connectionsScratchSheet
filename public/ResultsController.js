export default class ResultsController {
    constructor(loadingAnimationController) {
        this.container = document.getElementById("results-modal-container");
        this.resultRowContainer = document.getElementById("results-rows");
        this.resultsTitle = document.getElementById("results-title");
        this.resultRows = document.getElementsByClassName("result-row");
        this.closeButton = document.getElementById("close-results");
        this.isVisible = false;
        this.loadingAnimationController = loadingAnimationController;
        this.setup();
    }

    //  Some references:
    //  https://dmitripavlutin.com/timeout-fetch-request/
    //  https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
    //  https://stackoverflow.com/questions/31061838/how-do-i-cancel-an-http-fetch-request/47250621#47250621
    fetchWithTimeout = async (resource, options = {}) => {
        console.log("Fetching with timeout");
        const { timeout = 8000 } = options;
        const controller = new AbortController();
        console.log("Timeout is ", timeout);
        const id = setTimeout(() => controller.abort(), timeout);
        return await fetch(resource, {
            ...options,
            signal: controller.signal
        })
        .then(res => {
            console.log("Then");
            return res.json();
            // console.log(res);
            // return data;
        })
        .catch(err => {
            console.log("Catch");
            console.log("Name: ", err.name);
            console.log("Message: ", err.message);
            console.log(err);
            const errorMessage = {
                id: err.name,
            };
            return errorMessage;
        })
        .then(data => {
            console.log("Always");
            clearTimeout(id);
            return data;
        });
        // console.log("Clearing timeout");
        // clearTimeout(id);
        // console.log("Response: ", response);
        // return response;
    }

    getResultForDay = async (dayIdx) => {
        console.log("Fetching results");
        // return await fetch("www.google.com:81")
        //     .then(res => console.log(res))
        //     .catch(err => console.log(err));
        return await this.fetchWithTimeout(`/resultDay/${dayIdx}`, { timeout: 5000 })
            // .then((res) => res.json())
            .then((data) => {
                console.log("Received data: ", data);
                return data;
            })
            .catch(err => {
                console.log(err);
                console.log(typeof err);
                console.log(err.statusText);
            })
            .then((data) => {
                this.loadingAnimationController.hide();
                return data;
            });
    };

    getPastResults = async (dayIdx) => {
        this.showLoading(dayIdx + 1);
        this.getResultForDay(dayIdx)
            .then(data => {
                this.showResults(data);
            })
            .catch(err => {
                console.log("Whoops", err);
            });
        console.log("Doing it");
    }

    /**
     * Setup
     */
    setup() {
        this.hideResults();
        this.closeButton.addEventListener("click", e => {
            e.preventDefault();
            this.hideResults();
        });
        console.log(this.loadingAnimationController);
    }

    getIsVisible() {
        return this.isVisible;
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
    }

    clearResultsAndShow() {
        this.isVisible = true;
        if (!this.resultRowContainer.classList.contains("hidden")) {
            this.resultRowContainer.classList.add("hidden");
        }

        if (this.container.classList.contains("hidden")) {
            this.container.classList.remove("hidden");
        }
    }

    showResults(jsonResults) {
        this.isVisible = true;
        console.log(jsonResults);
        if (!this.container.classList.contains("showing-results")) {
            this.container.classList.add("showing-results");
        }

        if (this.resultRowContainer.classList.contains("hidden")) {
            this.resultRowContainer.classList.remove("hidden");
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

    showLoading(dayNum) {
        this.resultsTitle.innerHTML = "Loading results for Connections # " + dayNum.toString();
        this.loadingAnimationController.setColor("red");
        this.loadingAnimationController.show();
    }


}