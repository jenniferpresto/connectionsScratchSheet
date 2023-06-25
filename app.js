const express = require("express");
// const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");
// const { first } = require("cheerio/lib/api/traversing");

const PORT = process.env.port || 5500;
const URL = "https://nytcrossword.org/category/connections-game/";
const app = express();

const getFirstLinkWithAxios = async () => {
    console.log("Calling first site");

  axios
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
    .then(link => {
      const words = [];
      console.log("Calling second site");
      axios
        .get(link)
        .then((res) => {
          const $ = cheerio.load(res.data);
          $(".connections tbody tr td").each((index, element) => {
            words.push($(element).text());
          });
          console.log("We're in the second async portion with words: ", words);
          return words;
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .then(words => {
      console.log("These are some words being passed: ", words);
      return words;
    })
    .catch((e) => {
      console.log("Error getting links: ", e);
    });
};

const getWordsUsingAxios = async (link) => {
  console.log("We're getting this!!!!!", link);
  if (!link) {
    return;
  }
  axios
    .get(link)
    .then((res) => {
      const $ = cheerio.load(res.data);

      const cells = $(".connections tbody tr td");
      console.log(cells);

      return ["one", "two", "three"];
      //  get the actual words
    })
    .catch((e) => {
      console.log("Error getting words: ", e);
    });
};

const getWords = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto(URL, {
    waitUntil: "domcontentloaded",
  });

  const links = await page.$$("h2.entry-title a");
  //  grab the first link and go to the page
  let firstLink;
  for (link of links) {
    firstLink = await page.evaluate((el) => el.href, link);
    break;
  }

  await page.goto(firstLink, {
    waitUntil: "domcontentloaded",
  });

  const words = await page.evaluate(() => {
    const cells = Array.from(
      document.querySelectorAll(".connections tbody tr td")
    );
    return cells.map((td) => td.innerText);
  });

  if (words.length !== 20) {
    return [];
  }

  const cleanedWords = [];
  for (let i = 0; i < 20; i++) {
    if (i % 5 === 0) {
      continue;
    }
    cleanedWords.push(words[i]);
  }

  const shuffledWords = cleanedWords
    .map((val) => ({ val, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ val }) => val);

  await browser.close();

  return shuffledWords;
};

//  middleware to serve up specific path with static files
app.use(express.static(__dirname + "/public"));

app.get("/", async (req, res, next) => {});

//  route to request data, called by frontend
app.get("/data", async (req, res) => {
  //   const words = await getWords();
  //   let words = [];
  const words = await getFirstLinkWithAxios();
  console.log("Words at the end: ", words);
  //   .then(async link => {
  //     words = await getWordsUsingAxios(link);
  //   });
  //   console.log("Done with chain");
  //   console.log("first");
  //   const link = await getFirstLinkWithAxios();
  //   console.log("Second");
  //   const words = await getWordsUsingAxios(link);
  //   console.log("Third");
  res.json(words);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
