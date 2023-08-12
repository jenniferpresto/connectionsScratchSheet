import express from "express";
import axios from "axios";
import pretty from "pretty";
import * as cheerio from "cheerio";

const PORT = process.env.port || 5500;
const URL = "https://nytcrossword.org/category/connections-game/";
const CONNECTIONS_URL = "https://nytimes.com/games/connections";
const CONNECTIONS_JSON_URL = "https://www.nytimes.com/games-assets/connections/game-data-by-day.json";
const CONNECTIONS_DAY_ZERO = new Date("2023/06/11");
const app = express();


const getConnectionsDay = () => {
  const today = new Date();
  const daysSinceDayZero = Math.floor((today - CONNECTIONS_DAY_ZERO) / (1000 * 60 * 60 * 24));
  //  subtract one to account for index starting at zero
  return daysSinceDayZero - 1;
}

const parseWords = (data, idx) => {
  if (!Array.isArray(data[idx]?.startingGroups)) {
    return [];
  }
  const words = [];
  data[idx].startingGroups.forEach(row => {
    if (Array.isArray(row)) {
      row.forEach(word => words.push(word));
    }
  });

  //  These SHOULD be pre-scrambled, but go ahead and
  //  scramble them again for good measure
  const shuffledWords = words
  .map((val) => ({ val, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ val }) => val);

  return shuffledWords;
}

const getConnectionsJson = async () => {
  console.log(`Getting json data from ${CONNECTIONS_JSON_URL}`);
  getConnectionsDay();
  const data = await axios
  .request({
    timeout:5000,
    method: "GET",
    url: CONNECTIONS_JSON_URL,
  })
  .then(res => {
    return parseWords(res.data, getConnectionsDay());
  })
  .catch(e => {
    console.log("Error fetching JSON data: ", e);
    return [];
  });
  return data;
}

//
// Just a scratch method for now; not called by frontend
// @returns words
//
const getConnectionsPage = async () => {
  console.log("Getting connections page");
  const page = await axios
  .request({
    timeout: 5000,
    method: "GET",
    url: CONNECTIONS_URL,
  })
  .then (res => {
    // console.log(res.data);
    const $ = cheerio.load(res.data);
    console.log(pretty($.html()));
    const board = $("#board")[0];
    // console.log(board.children);
    const row0 = $(board).find("div#row-0")[0];
    const row1 = $(board).find("div#row-1")[0];
    const row2 = $(board).find("div#row-2")[0];
    const row3 = $(board).find("div#row-3")[0];
    const item0 = $(row0).find("div#item-0");
    // console.log(item0.text());
    // console.log(row0);

    // const text0 = $(row0).find(".item");
    // const text1 = $(row1).find(".item");
    // const text2 = $(row2).find(".item");
    // const text3 = $(row3).find(".item");
    // console.log(text0);
    // const textList0 = $(text0).toArray().map(el => $(el).html());
    // const textList1 = $(text1).toArray().map(el => $(el).html());
    // const textList2 = $(text2).toArray().map(el => $(el).html());
    // const textList3 = $(text3).toArray().map(el => $(el).html());
    // console.log("TextList:", textList0);
    // console.log("TextList:", textList1);
    // console.log("TextList:", textList2);
    // console.log("TextList:", textList3);


    // console.log("Board: ", $("#board")[0]);
    // const board = $("#game > #board");
    // console.log("Game div: ", $("#game > #board"));
    // let element = $("#game");
    // const divs = $(board).find("#row-0 > div").toArray().map(el => $(el).text());
    // console.log("Element text? ", element.text());
    // const divs = $("#row-0 > div").toArray().map(el => $(el).text());
    // console.log("DIVS text: ", divs);
    // const list = board.find(("#row-0 > #item-0"))
    // .toArray()
    // .map(el => el.attr("text"));
    console.log("Done with async");
  });
  console.log("Returning after async");
  return ["a", "b", "c"];
}

const getFirstLink = async () => {
  console.log(`Requesting link from ${URL}`);
  const firstLink = await axios
    .request({
      timeout: 5000,
      method: "GET",
      url: URL,
    })
    .then((res) => {
      console.log(`Parsing response from ${URL}`);
      const $ = cheerio.load(res.data);

      let link = "";
      // return the first link
      $("h2.entry-title a").each((index, element) => {
        console.log("Link retrieved: ", $(element).attr("href"));
        link = $(element).attr("href");
        //  break loop
        return false;
      });
      return link;
    })
    .catch((e) => {
      console.log("Error getting first link: ", e.code);
      return "";
    });
    return firstLink;
};

const getWords = async (link) => {
  console.log(`Requesting words from ${link}`);
  const words = [];
  const allWords = await axios
    .request({
      timeout: 5000,
      method: "GET",
      url: link,
    })
    .then((res) => {
      console.log(`Received word list from ${link}`);
      const $ = cheerio.load(res.data);
      $(".connections tbody tr td").each((index, element) => {
        words.push($(element).text());
      });
      return words;
    })
    .catch((e) => {
      console.log("Error getting words from link: ", e);
      return [];
    });
    if (!allWords || !allWords.length) {
        return [];
    }

    //  strip out theme names
    const cleanedWords = [];
    for (let i = 0; i < allWords.length; i++) {
      if (i % 5 === 0) {
        continue;
      }
      cleanedWords.push(allWords[i]);
    }

    //  scramble the remaining words
    const shuffledWords = cleanedWords
    .map((val) => ({ val, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ val }) => val);

    return shuffledWords;
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
})

app.get("/connectionsJson", async (req, res) => {
  const data = await getConnectionsJson();
  res.send(data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
