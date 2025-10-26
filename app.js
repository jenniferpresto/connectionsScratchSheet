import axios from "axios";
import express from "express";
import fs from "fs.promises";

const PORT = process.env.port || 5500;

//  New URL, e.g.:
//  https://www.nytimes.com/svc/connections/v2/2025-09-20.json

const CONNECTIONS_JSON_URL_BASE = "https://www.nytimes.com/svc/connections/v2/";

const CONNECTIONS_DAY_ZERO = new Date("2023/06/12");
const app = express();
const IS_DEV = true;

const getDateForConnectionsNumber = gameNum => {
    const millisToAdd = gameNum * 24 * 60 * 60 * 1000;
    const gameDate = new Date(CONNECTIONS_DAY_ZERO.getTime() + millisToAdd);
    return gameDate;
}

const getDateStringFromDate = (dateObj, timeZone) => {
    const intlDateObj = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
    });

    const dateStr = intlDateObj.format(dateObj);
    const dateParts = dateStr.split("/");
    const year = dateParts[2];
    const month = dateParts[0].length === 1
        ? "0" + dateParts[0]
        : dateParts[0];
    const day = dateParts[1].length === 1
        ? "0" + dateParts[1]
        : dateParts[1];
    
    return year + "-" + month + "-" + day;
}

const getNewYorkDateStringForToday = () => {
    const today = new Date();
    return getDateStringFromDate(today, "America/New_York");
}

const getConnectionsNumberForToday = () => {
    const today = new Date();
    const dateString = getDateStringFromDate(today, "America/New_York");
    const dateParts = dateString.split("-");
    const midnightDate = new Date(dateParts[0] + "/" +  dateParts[1] + "/" + dateParts[2]);
    return Math.floor((midnightDate - CONNECTIONS_DAY_ZERO) / 1000 / 60 / 60 / 24) + 1;
}

const getConnectionsUrl = dateStr => {
    return CONNECTIONS_JSON_URL_BASE + dateStr + ".json";
}

const getUrlForGameNumber = gameNum => {
    const gameDate = getDateForConnectionsNumber(gameNum - 1);
    const dateStr = getDateStringFromDate(gameDate, "UTC");
    return getConnectionsUrl(dateStr);
}

const parseWords = (data) => {
    if (!Array.isArray(data.categories)
        || data.categories.length == 0
        || !Array.isArray(data.categories[0].cards)
        || data.categories[0].cards.length == 0
        || data.categories[0].cards[0].content == null
        || data.categories[0].cards[0].position == null) {
        // console.log("Unexpected data format", data);
        return [];
    }

    return data.categories
        .flatMap(c => c.cards)
        .sort((a, b) => a.position - b.position)
        .map(c => c.content);
}

const getConnectionsJson = async (dateUrl, shouldIncludeFullData) => {
    const jsonData = await axios
        .request({
            timeout: 5000,
            method: "GET",
            url: dateUrl,
        })
        .then(res => {
            return res.data;
        })
        .catch(e => {
            console.log("Error fetching JSON data: ", e);
            return {id: -1, words: []};
        })
    if (shouldIncludeFullData) {
        return jsonData;
    }
    return {
        id: jsonData.id,
        words: parseWords(jsonData),
    }
}

//  middleware to serve up specific path with static files
app.use(express.static("public"));

app.get("/", async (req, res, next) => {});

app.get("/connectionsJson", async (req, res) => {
    console.log("Received request from ", req.header("x-forwarded-for"));
    const todayStr = getNewYorkDateStringForToday();
    const todayNum = getConnectionsNumberForToday();
    const todayUrl = getConnectionsUrl(todayStr);
    if (todayStr == "2025-10-31") {
        console.log("Halloween!");
        const halloweenData = await fs.readFile("./testData/halloween.json", "utf8")
            .then(jsonString => JSON.parse(jsonString));
        res.send({
            id: halloweenData.id,
            words: parseWords(halloweenData),
            gameNum: 872
        });
    } else if (IS_DEV) {
        const testData = await fs.readFile("./testData/testJson2025-09-19.json", "utf8")
            .then(jsonString => JSON.parse(jsonString));
        await setTimeout(() => {
            res.send({
                id: testData.id,
                words: parseWords(testData),
                gameNum: todayNum,
            });
            // res.status(500).send("Whoops"); <-- keep for error testing
        }, 500);
    } else {
        const data = await getConnectionsJson(todayUrl, false);
        res.send({
            ...data,
            gameNum: todayNum,
        });
    }
});

app.get("/resultDay/:gameNum", async (req, res) => {
    const gameNum = parseInt(req.params.gameNum);
    const gameUrl = getUrlForGameNumber(gameNum);
    console.log(`Received request for past results: gameNum: ${gameNum}, url: ${gameUrl}`);

    if (IS_DEV) {
        console.log("Loading test data");
        const testData = await fs.readFile("./testData/testJsonSingleDay.json", "utf8")
            .then(jsonString => JSON.parse(jsonString));

        await setTimeout(() => {
            res.send({...testData, gameNum: gameNum});
            // res.status(500).send("Error");
        }, 1000);
    } else {
        const data = await getConnectionsJson(gameUrl, true);
        if (data) {
            res.send({...data, gameNum: gameNum});
        } else {
            res.status(500).send("Unable to find requested day");
        }
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
