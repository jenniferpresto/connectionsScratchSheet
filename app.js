const express = require("express");
const puppeteer = require("puppeteer");

const PORT = process.env.port || 5500;
const URL = "https://nytcrossword.org/category/connections-game/";
const app = express();

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
    const cells = Array.from(document.querySelectorAll(".connections tbody tr td"));
    return cells.map(td => td.innerText);
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
  .map(val => ({val, sort: Math.random()}))
  .sort((a, b) => a.sort - b.sort)
  .map(({val}) => val);

  await browser.close();

  return shuffledWords;
};


//  middleware to serve up specific path with static files
app.use(express.static(__dirname + "/public"));

app.get("/", async (req, res, next) => {});

//  route to request data, called by frontend
app.get("/data", async (req, res) => {
  const words = await getWords();
  res.json(words);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
