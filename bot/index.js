const request = require("request-promise-native");
const { shuffle, head, last } = require("lodash");
const util = require("util");
const fs = require("fs");
const path = require("path");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

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

  if (bodyLowerCase.includes("tomorrow")) {
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
      await notifyStateChange(prevState, latestState);
      await updateHistory(latestState);
      await saveRes(latestState, res);
    }
  } catch (err) {
    console.error(err);
  }
}

main();

async function notifyStateChange(prevState, latestState) {
  if (latestState === States.PASSWORD) {
    notify("Check yeezy supply! Password page is up");
  }
  if (latestState === States.AVAILABLE) {
    notify("Check yeezy supply! Product is available");
  }
  if (latestState === States.SOLD_OUT) {
    notify("Product is sold out");
  }
  if (latestState === States.UPCOMING) {
    notify("Product available soon");
  }
  if (latestState === States.UNKNOWN) {
    notify("Product state is unknown");
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
