const Twilio = require("twilio");
const { uniq } = require("lodash");

require("dotenv").config();

const DISPATCH_LEVELS = {
  ALL_USERS: 1,
  SMS_USERS: 2,
  CALL_USERS: 2,
  TESTERS: 3,
  DEVELOPERS: 4
};

const DISPATCH_METHODS = {
  CALL: "call",
  MESSAGE: "message"
};

const twilio = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function sendCall(messageBody, to) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
      <Say voice="woman">${messageBody}. ${messageBody}. ${messageBody}. ${messageBody}. ${messageBody}</Say>
  </Response>`;

  const call = await twilio.calls.create({
    url: `http://twimlets.com/echo?Twiml=${encodeURIComponent(xml)}`,
    to: to,
    from: process.env.TWILIO_NUMBER
  });
}

async function sendMessage(messageBody, to) {
  const message = await twilio.messages.create({
    body: messageBody,
    to: to,
    from: process.env.TWILIO_NUMBER
  });
}

async function dispatch({ body, level, method }) {
  const phoneNumbers = getNumbers(dispatchLevel);
  console.log(`Dispatching ${method} to ${phoneNumbers.length} numbers:`, body);

  for (const phoneNumber of phoneNumbers) {
    console.log(`Dispatching ${method} to ${phoneNumber}`);
    try {
      if (method === DISPATCH_METHODS.CALL) {
        return await sendCall(body, phoneNumber);
      }
      if (method === DISPATCH_METHODS.MESSAGE) {
        return await sendMessage(body, phoneNumber);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

function dispatchCalls({ body, level }) {
  return dispatch({ body, level, method: DISPATCH_METHODS.CALL });
}

function dispatchMessages({ body, level }) {
  return dispatch({ body, level, method: DISPATCH_METHODS.MESSAGE });
}

function dispatchNotifications(notifications) {
  return Promise.all(notifications.map(notification => dispatch(notification)));
}

function getNumbers(level) {
  level = DISPATCH_LEVELS.DEVELOPERS;

  return uniq([
    ...(level <= DISPATCH_LEVELS.DEVELOPERS
      ? process.env.DEVELOPER_NUMBERS.split(",")
      : []),
    ...(level <= DISPATCH_LEVELS.TESTERS
      ? process.env.TESTER_NUMBERS.split(",")
      : []),
    ...(level <= DISPATCH_LEVELS.CALL_USERS
      ? process.env.CALL_NUMBERS.split(",")
      : []),
    ...(level <= DISPATCH_LEVELS.SMS_USERS
      ? process.env.SMS_NUMBERS.split(",")
      : [])
  ]);
}

module.exports = {
  dispatchMessages,
  dispatchCalls,
  DISPATCH_LEVELS
};
