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

const getNewYorkDateString = () => {
    const today = new Date();
    const intlDateObj = new Intl.DateTimeFormat('en-US', {
        timeZone: "America/New_York",
    });

    const nyDateString = intlDateObj.format(today);
    console.log("Date string: ", nyDateString);
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

const getConnectionsJsonForDate = async dateUrl => {
    if (IS_DEV) {
        jsonData = await axios
        .request({
            timeout: 5000,
            method: "GET",
            url: dateUrl,
        })
        .then(res => {
            console.log("Returning data: ", res.data);
            return res.data;
        })
        .catch(e => {
            console.log("Error fetching JSON data: ", e);
            return {id: -1, words: []};
        })
    } else {
        return null;
    }
    return jsonData;
}

const getConnectionsJson = async () => {
    if (IS_DEV) {
        console.log("Loading test data");
        jsonData = await fs.readFile("./testData/testJson.json", "utf8")
            .then(jsonString => JSON.parse(jsonString));
        return {id: 11, words: parseWords(jsonData, 11)};
    } else {
        // console.log(`Getting json data from ${CONNECTIONS_JSON_URL}`);
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
    console.log("today url: " + todayUrl);
    const data = await getConnectionsJsonForDate(todayUrl);
    console.log("Finished");
    console.log(data);
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
    console.log(`Received request for past results: gameNum: ${req.params.gameNum}`);
    const dayResult = jsonData.find(
        (obj) => obj.id === Number(req.params.gameNum)
    );

    if (IS_DEV) {
        console.log("NY Date: " + getNewYorkDateString());
        await setTimeout(() => {
            console.log("Sending result from the backend");
            console.log(dayResult);
            res.send(dayResult);
            
            // res.status(500).send("Error");
        }, 1000);
    } else {
        if (dayResult) {
            res.send(dayResult);
        } else {
            res.status(500).send("Unable to find requested day");
        }
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
