import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const PORT = process.env.port || 5500;
const URL = "https://nytcrossword.org/category/connections-game/";
const CONNECTIONS_URL = "https://nytimes.com/games/connections";
const app = express();

//
// Just a scratch method for now; not called by frontend
// @returns words
//
const getConnectionsPage = async () => {
  const page = await axios
  .get(CONNECTIONS_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0", 
    }
  })
  .then (res => {
    // console.log(res.data);
    const $ = cheerio.load(res.data);
    const board = $("#board")[0];
    const row0 = $(board).find("div#row-0")[0];
    const row1 = $(board).find("div#row-1")[0];
    const row2 = $(board).find("div#row-2")[0];
    const row3 = $(board).find("div#row-3")[0];
    // const item0 = $(row0).find("div#item-0");
    // console.log(row0);
    // console.log(row0);

    const text0 = $(row0).find(".item");
    const text1 = $(row1).find(".item");
    const text2 = $(row2).find(".item");
    const text3 = $(row3).find(".item");
    console.log(text0);
    const textList0 = $(text0).toArray().map(el => $(el).html());
    const textList1 = $(text1).toArray().map(el => $(el).html());
    const textList2 = $(text2).toArray().map(el => $(el).html());
    const textList3 = $(text3).toArray().map(el => $(el).html());
    console.log("TextList:", textList0);
    console.log("TextList:", textList1);
    console.log("TextList:", textList2);
    console.log("TextList:", textList3);


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

  })
  console.log("Done with async");
  return ["a", "b", "c"];
}

const getFirstLink = async () => {
  const firstLink = await axios
    .get(URL)
    .then((res) => {
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
      console.log("Error getting first link: ", e);
    });
    return firstLink;
};

const getWords = async (link) => {
  const words = [];
  const allWords = await axios
    .get(link)
    .then((res) => {
      const $ = cheerio.load(res.data);
      $(".connections tbody tr td").each((index, element) => {
        words.push($(element).text());
      });
      return words;
    })
    .catch((e) => {
      console.log("Error getting words from link: ", e);
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
  console.log("Received request from ", req.headers["x-forwarded-for"]);
  const link = await getFirstLink();
  const words = await getWords(link);
  console.log("Returning words");
  res.json(words);
});

app.get("/connectionsData", async (req, res) => {
  const page = await getConnectionsPage();
  res.send(page);
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
