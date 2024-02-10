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
const IS_DEV = false;

let jsonData = [];

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

const getDayForConnectionsNumber = gameNum => {
    const millisToAdd = gameNum * 24 * 60 * 60 * 1000;
    const gameDate = new Date(CONNECTIONS_DAY_ZERO.getTime() + millisToAdd);
    console.log("Day zero: ", CONNECTIONS_DAY_ZERO);
    console.log("Day zero time: ", CONNECTIONS_DAY_ZERO.getTime());
    console.log("Date of game: ", gameDate);
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

const getUrlForGameDate = gameDate => {
    const dateStr = getDateStringFromDate(gameDate, "UTC");
    return getConnectionsUrl(dateStr);
}

const getNewYorkDateString = () => {
    const today = new Date();
    const intlDateObj = new Intl.DateTimeFormat('en-US', {
        timeZone: "America/New_York",
    });

    const nyDateString = intlDateObj.format(today);
    const nyDateParts = nyDateString.split("/");
    const year = nyDateParts[2];
    const month = nyDateParts[0].length === 1
        ? "0" + nyDateParts[0]
        : nyDateParts[0];
    const day = nyDateParts[1].length === 1
        ? "0" + nyDateParts[1]
        : nyDateParts[1];
    
    return year + "-" + month + "-" + day;
}

const getConnectionsUrl = (dateStr) => {
    return CONNECTIONS_JSON_URL_BASE + dateStr + ".json";
}

const getUrlForGameNumber = gameNum => {
    const gameDate = getDayForConnectionsNumber(gameNum);
    const dateStr = getDateStringFromDate(gameDate, "UTC");
    const gameUrl = getConnectionsUrl(dateStr);
    return gameUrl;
}

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

const getConnectionsJsonNewFormat = async (dateUrl, fullData) => {
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
    if (fullData) {
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
    const todayStr = getNewYorkDateString();
    const todayUrl = getConnectionsUrl(todayStr);
    const data = await getConnectionsJsonNewFormat(todayUrl, false);
    // const data = await getConnectionsJson();
    if (IS_DEV) {
        await setTimeout(() => {
            res.send(data);
            // res.status(500).send("Whoops");
        }, 500);
    } else {
        res.send(data);
    }
});

app.get("/resultDay/:gameNum", async (req, res) => {
    const gameNum = req.params.gameNum;
    console.log(`Received request for past results: gameNum: ${gameNum}`);

    const gameUrl = getUrlForGameNumber(gameNum);
    console.log("New url: ", gameUrl);

    if (IS_DEV) {
        await setTimeout(() => {
            console.log("Sending result from the backend");
            console.log("Just showing URL without calling", gameUrl);
            // console.log(dayResult);
            // res.send(dayResult);
            
            // res.status(500).send("Error");
        }, 1);
    } else {
        const data = await getConnectionsJsonNewFormat(gameUrl, true);
        if (data) {
            res.send(data);
        } else {
            res.status(500).send("Unable to find requested day");
        }
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
