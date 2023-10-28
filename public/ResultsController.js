export default class ResultsController {
    constructor() {
        this.container = document.getElementById("results-modal-container");
        this.resultRowContainer = document.getElementById("results-rows");
        this.resultRows = document.getElementsByClassName("result-row");
        this.closeButton = document.getElementById("close-results");
        this.isVisible = false;
        this.setup();
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
    }

    getIsVisible() {
        return this.isVisible;
    }

    hideResults() {
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
        if (!this.container.classList.contains("showing-results")) {
            this.container.classList.add("showing-results");
        }

        if (this.resultRowContainer.classList.contains("hidden")) {
            this.resultRowContainer.classList.remove("hidden");
        }

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
}