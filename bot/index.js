const request = require("request-promise-native");
const { shuffle, head, last } = require("lodash");
const util = require("util");
const fs = require("fs");
const path = require("path");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const cheerio = require("cheerio");

require("dotenv").config();

const notify = require("./notify");

const SERVER_URLS = process.env.SERVER_URLS.split(",");
const HISTORY_PATH = path.resolve(__dirname, "history.json");

const States = {
  PASSWORD: "PASSWORD",
  AVAILABLE: "AVAILABLE",
  UPCOMING: "UPCOMING",
  SOLD_OUT: "SOLD_OUT",
  UNKNOWN: "UNKNOWN"
};

async function getPageState(res) {
  const bodyLowerCase = res.body.toLowerCase();

  if (bodyLowerCase.includes("/password")) {
    return States.PASSWORD;
  }

  if (bodyLowerCase.includes("/cart/add")) {
    return States.AVAILABLE;
  }

  if (bodyLowerCase.includes("tomorrow") || bodyLowerCase.includes("today")) {
    return States.UPCOMING;
  }

  if (bodyLowerCase.includes("sold out")) {
    return States.SOLD_OUT;
  }

  return States.UNKNOWN;
}

async function getHistory() {
  const historyFile = await readFile(HISTORY_PATH, "utf8");
  const history = JSON.parse(historyFile);
  return history;
}

async function getPreviousState() {
  const history = await getHistory();
  const latestUpdate = last(history);
  if (!latestUpdate) {
    return null;
  }
  return latestUpdate.state;
}

async function main() {
  try {
    const url = head(shuffle(SERVER_URLS));
    const res = await request({
      url,
      resolveWithFullResponse: true
    });
    const latestState = await getPageState(res);

    const prevState = await getPreviousState();

    console.log(`${prevState} => ${latestState}`);

    if (prevState !== latestState) {
      const product = await getProduct(res);

      await notifyStateChange(product, prevState, latestState);
      await updateHistory(latestState);
      await saveRes(latestState, res);
    }
  } catch (err) {
    console.error(err);
  }
}

main();

async function getProduct(res) {
  const $ = cheerio.load(res.body);
  const imageSrc = $(".P__img").attr("src");

  return {
    title: $(".PI__title").text().toLowerCase() || null,
    description: $(".PI__desc").text().toLowerCase() || null,
    image: (imageSrc && `https:${imageSrc}`) || null
  };
}

async function notifyStateChange(product, prevState, latestState) {
  if (latestState === States.PASSWORD) {
    notify("Password. Yeezy supply password page is up.");
  }
  if (latestState === States.AVAILABLE) {
    notify(
      `Available! ${product.title} is available on Yeezy Supply.`
    );
  }
  if (latestState === States.SOLD_OUT) {
    notify(`Sold out. ${product.title} is is sold out on Yeezy Supply.`);
  }
  if (latestState === States.UPCOMING) {
    notify(`Coming soon. ${product.title} available soon on Yeezy Supply. ${product.description}`);
  }
  if (latestState === States.UNKNOWN) {
    notify(
      `Unknown state. Yeezy Supply state is in an unknown state. ${product.title} ${product.description}`
    );
  }
}

async function updateHistory(latestState) {
  const history = await getHistory();
  history.push({
    state: latestState,
    created_at: new Date().toISOString()
  });
  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2), "utf8");
}

async function saveRes(latestState, res) {
  await writeFile(
    path.resolve(
      __dirname,
      `ys-${latestState}-${new Date().toISOString()}.html`
    ),
    res.body,
    "utf8"
  );
}
