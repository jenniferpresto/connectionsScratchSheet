const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const PORT = process.env.port || 5500;
const URL = "https://nytcrossword.org/category/connections-game/";
const app = express();

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
      console.log("We're in the second async portion with words: ", words);
      return words;
    })
    .catch((e) => {
      console.log("Error getting link: ", link);
    });
    if (!allWords || !allWords.length) {
        return [];
    }

    //  strip out theme names
    const cleanedWords = [];
    for (i in allWords) {
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
app.use(express.static(__dirname + "/public"));

app.get("/", async (req, res, next) => {});

//  route to request data, called by frontend
app.get("/data", async (req, res) => {
  const link = await getFirstLink();
  const words = await getWords(link);
  res.json(words);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
