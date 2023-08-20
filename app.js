import axios from "axios";
import express from "express";
import fs from "fs.promises";

const PORT = process.env.port || 5500;
const CONNECTIONS_JSON_URL =
    "https://www.nytimes.com/games-assets/connections/game-data-by-day.json";
const CONNECTIONS_DAY_ZERO = new Date("2023/06/12");
const app = express();
const IS_DEV = true;

let jsonData = [];

const getConnectionsDay = () => {
    const today = new Date();
    const daysSinceDayZero = Math.floor(
        (today - CONNECTIONS_DAY_ZERO) / (1000 * 60 * 60 * 24)
    );
    return daysSinceDayZero;
};

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


const getConnectionsJson = async () => {
    if (IS_DEV) {
        console.log("Returning test data");
        const localData = await fs.readFile("./testData/testJson.json", "utf8")
            .then(jsonString => JSON.parse(jsonString));
        return parseWords(localData, 7);
    } else {
        console.log(`Getting json data from ${CONNECTIONS_JSON_URL}`);
        const data = await axios
            .request({
                timeout: 5000,
                method: "GET",
                url: CONNECTIONS_JSON_URL,
            })
            .then((res) => {
                jsonData = res.data;
                return parseWords(res.data, getConnectionsDay());
            })
            .catch((e) => {
                console.log("Error fetching JSON data: ", e);
                return [];
            });
        return data;
    }
  };

//  middleware to serve up specific path with static files
app.use(express.static("public"));

app.get("/", async (req, res, next) => {});

//  route to request data, called by frontend
app.get("/data", async (req, res) => {
    console.log("Received request from ", req.header("x-forwarded-for"));
    const link = await getFirstLink();
    if (link === "") {
        console.log("Error getting initial link");
        return res.json([]);
    }
    const words = await getWords(link);
    console.log(`Returning words from ${link}`);
    res.json(words);
});

app.get("/connectionsData", async (req, res) => {
    const page = await getConnectionsPage();
    res.send(page);
});

app.get("/connectionsJson", async (req, res) => {
    const data = await getConnectionsJson();
    res.send(data);
});

app.get("/resultDay/:gameNum", (req, res) => {
    const dayResult = jsonData.find(
        (obj) => obj.id === Number(req.params.gameNum)
    );
    const testData = {
        id: 7,
        groups: {
            "BOARD GAMES": {
                level: 0,
                members: ["BACKGAMMON", "CHECKERS", "CHESS", "GO"],
            },
            "MATTRESS SIZES": {
                level: 1,
                members: ["FULL", "KING", "QUEEN", "TWIN"],
            },
            "THINGS THAT ARE RED": {
                level: 2,
                members: ["CHERRY", "FIRE TRUCK", "RUBY", "STOP SIGN"],
            },
            "THINGS WITH KEYS": {
                level: 3,
                members: ["CRYPTOGRAPHY", "FLORIDA", "LOCKSMITH", "PIANO"],
            },
        },
        startingGroups: [
            ["LOCKSMITH", "FIRE TRUCK", "KING", "PIANO"],
            ["CHESS", "RUBY", "FLORIDA", "TWIN"],
            ["CHERRY", "QUEEN", "STOP SIGN", "GO"],
            ["CHECKERS", "CRYPTOGRAPHY", "FULL", "BACKGAMMON"],
        ],
    };

    if (dayResult) {
        res.send(dayResult);
    } else {
        res.send(testData);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
