const request = require("request-promise-native");
const { shuffle, head, last } = require("lodash");
const util = require("util");
const fs = require("fs");
const path = require("path");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const cheerio = require("cheerio");

require("dotenv").config();

const { DISPATCH_LEVELS, dispatchNotifications } = require("./notify");

const SERVER_URLS = process.env.SERVER_URLS.split(",");
const HISTORY_PATH = path.resolve(__dirname, "history.json");

const PageStates = {
  PASSWORD: "PASSWORD",
  AVAILABLE: "AVAILABLE",
  SOLD_OUT: "SOLD_OUT",
  TODAY: "TODAY",
  TOMORROW: "TOMORROW",
  UNKNOWN: "UNKNOWN"
};

async function main() {
  try {
    const url = head(shuffle(SERVER_URLS));
    const res = await request({
      url,
      resolveWithFullResponse: true
    });
    const latestState = await getPageState(res);

    const prevState = await getPreviousState();

    console.log(
      `${prevState} => ${latestState} ${new Date().toLocaleString()}`
    );

    if (prevState !== latestState) {
      const product = await getProduct(res);

      const notifications = await getNotificationsForStateChange(
        product,
        prevState,
        latestState
      );
      await dispatchNotifications(notifications);
      await updateHistory(latestState);
      await saveRes(latestState, res);
    }
  } catch (err) {
    console.error(err);
  }
}

if (require.main === module) {
  main();
}

async function getPageState(res) {
  const bodyLowerCase = res.body.toLowerCase();
  const $ = cheerio.load(res.body);

  if (bodyLowerCase.includes("/password")) {
    return PageStates.PASSWORD;
  }

  const $featuredProduct = $(".SingleProduct__special_featured");

  if ($featuredProduct.length) {
    if (
      $featuredProduct
        .html()
        .toLowerCase()
        .includes("/cart/add")
    ) {
      return PageStates.AVAILABLE;
    }
  } else {
    if (bodyLowerCase.includes("/cart/add")) {
      return PageStates.AVAILABLE;
    }
  }

  if (bodyLowerCase.includes("tomorrow")) {
    return PageStates.TOMORROW;
  }

  if (bodyLowerCase.includes("today")) {
    return PageStates.TODAY;
  }

  if (bodyLowerCase.includes("sold out")) {
    return PageStates.SOLD_OUT;
  }

  return PageStates.UNKNOWN;
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

async function getProduct(res) {
  const $ = cheerio.load(res.body);
  const imageSrc = $(".P__img").attr("src");

  return {
    title: $(".PI__title").text(),
    description: $(".PI__desc")
      .text()
      .replace("TODAY", "")
      .replace("TOMORROW", "")
      .replace("COLOR", "")
      .trim(),
    image: (imageSrc && `https:${imageSrc}`) || null
  };
}

async function getNotificationsForStateChange(product, prevState, latestState) {
  if (latestState === PageStates.PASSWORD) {
    return [
      {
        body: "Yeezy supply password page is up.",
        level: DISPATCH_LEVELS.ALL_USERS,
        method: "message"
      }
    ];
  }
  if (latestState === PageStates.AVAILABLE) {
    return [
      {
        body: `Available! ${product.title} ${
          product.description
        } is available on Yeezy Supply.`,
        level: DISPATCH_LEVELS.CALL_USERS,
        method: "call"
      },
      {
        body: `Available! ${product.title} ${
          product.description
        } is available on Yeezy Supply. https://yeezysupply.com/`,
        level: DISPATCH_LEVELS.ALL_USERS,
        method: "message"
      }
    ];
  }
  if (latestState === PageStates.SOLD_OUT) {
    return [
      {
        body: `Sold out. ${product.title} ${
          product.description
        } is is sold out on Yeezy Supply.`,
        level: DISPATCH_LEVELS.ALL_USERS,
        method: "message"
      }
    ];
  }
  if (latestState === PageStates.TOMORROW) {
    return [
      {
        body: `Yeezy Supply updated. ${product.title} ${
          product.description
        } available sometime tomorrow.`,
        level: DISPATCH_LEVELS.ALL_USERS,
        method: "message"
      }
    ];
  }
  if (latestState === PageStates.TODAY) {
    return [
      {
        body: `Yeezy Supply updated. ${product.title} ${
          product.description
        } available sometime today.`,
        level: DISPATCH_LEVELS.ALL_USERS,
        method: "message"
      }
    ];
  }
  if (latestState === PageStates.UNKNOWN) {
    return [
      {
        body: `Yeezy Supply is in an unknown state. ${product.title} ${
          product.description
        }. https://yeezysupply.com`,
        level: DISPATCH_LEVELS.TESTERS,
        method: "message"
      }
    ];
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

module.exports = {
  PageStates,
  getPageState,
  getProduct,
  getNotificationsForStateChange
};
