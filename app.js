import axios from "axios";
import express from "express";
import fs from "fs.promises";

const PORT = process.env.port || 5500;
const CONNECTIONS_JSON_URL =
    "https://www.nytimes.com/games-assets/connections/game-data-by-day.json";

//  New URL, e.g.:
//  https://www.nytimes.com/svc/connections/v1/2023-12-31.json

const CONNECTIONS_JSON_URL_BASE = "https://www.nytimes.com/svc/connections/v1/";

const CONNECTIONS_DAY_ZERO = new Date("2023/06/12");
const app = express();
const IS_DEV = true;

let jsonData = [];

/**
 * @deprecated The NY Times changed its data format; this method is
 * no longer used
 */
const getConnectionsDay = () => {
    const today = new Date();
    const intlDateObj = new Intl.DateTimeFormat('en-US', {
        timeZone: "America/New_York",
    });

    const nyDateString = intlDateObj.format(today);
    const nyDateParts = nyDateString.split("/");
    const convertedNyDateString = nyDateParts[2] + "/" + nyDateParts[0] + "/" + nyDateParts[1];
    const nyDateObj = new Date(convertedNyDateString);
    const daysSinceDayZero = Math.floor(
        (nyDateObj - CONNECTIONS_DAY_ZERO) / (1000 * 60 * 60 * 24)
    );
    return daysSinceDayZero;
};

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

/**
 * @deprecated Old format
 */
const parseWords = (data, idx) => {
    if (!Array.isArray(data[idx]?.startingGroups)) {
        return [];
    }
    const words = [];
    data[idx].startingGroups.forEach((row) => {
        if (Array.isArray(row)) {
            row.forEach((word) => words.push(word));
        }
    });

    //  These SHOULD be pre-scrambled, but go ahead and
    //  scramble them again for good measure
    const shuffledWords = words
        .map((val) => ({ val, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ val }) => val);

    return shuffledWords;
};

const parseWordsNewFormat = (data) => {
    if (!Array.isArray(data.startingGroups)) {
        return [];
    }
    const words = [];
    data.startingGroups.forEach(row => {
        if(Array.isArray(row)) {
            row.forEach(word => words.push(word));
        }
    })
    return words;
}

const getConnectionsJsonNewFormat = async (dateUrl, shouldIncludeFullData) => {
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
        words: parseWordsNewFormat(jsonData),
    }
}

/**
 * @deprecated The NY Times changed its data format; this URL is
 * no longer being updated
 */
const getConnectionsJson = async () => {
    if (IS_DEV) {
        console.log("Loading test data");
        jsonData = await fs.readFile("./testData/testJson.json", "utf8")
            .then(jsonString => JSON.parse(jsonString));
        return {id: 11, words: parseWords(jsonData, 11)};
    } else {
        jsonData = await axios
            .request({
                timeout: 5000,
                method: "GET",
                url: CONNECTIONS_JSON_URL,
            })
            .then((res) => {
                return res.data;
            })
            .catch((e) => {
                console.log("Error fetching JSON data: ", e);
                return {id: -1, words: []};
            });
        const day = getConnectionsDay();
        return {id: day, words: parseWords(jsonData, day)}
    }
  };

//  middleware to serve up specific path with static files
app.use(express.static("public"));

app.get("/", async (req, res, next) => {});

app.get("/connectionsJson", async (req, res) => {
    console.log("Received request from ", req.header("x-forwarded-for"));
    const todayStr = getNewYorkDateStringForToday();
    const todayNum = getConnectionsNumberForToday();
    const todayUrl = getConnectionsUrl(todayStr);
    if (IS_DEV) {
        const testData = await fs.readFile("./testData/testJsonSingleDay.json", "utf8")
            .then(jsonString => JSON.parse(jsonString));
        await setTimeout(() => {
            res.send({
                id: testData.id,
                words: parseWordsNewFormat(testData),
                gameNum: todayNum,
            });
            // res.status(500).send("Whoops"); <-- keep for error testing
        }, 500);
    } else {
        const data = await getConnectionsJsonNewFormat(todayUrl, false);
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
        const data = await getConnectionsJsonNewFormat(gameUrl, true);
        if (data) {
            res.send({...data, gameNum: gameNum});
        } else {
            res.status(500).send("Unable to find requested day");
        }
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
