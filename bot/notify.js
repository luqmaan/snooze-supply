const Twilio = require("twilio");

require("dotenv").config();

const twilio = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function sendCall(messageBody, to) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
      <Say voice="woman">${messageBody}. ${messageBody}. ${messageBody}. ${messageBody}. ${messageBody}</Say>
  </Response>`;

  console.log(xml);

  const call = await twilio.calls.create({
    url: `http://twimlets.com/echo?Twiml=${encodeURIComponent(xml)}`,
    to: to,
    from: process.env.TWILIO_NUMBER,
  });

  console.log(call);
}

async function sendText(messageBody, to) {
  const message = await twilio.messages.create({
    body: messageBody,
    to: to,
    from: process.env.TWILIO_NUMBER,
  });

  console.log(message);
}

async function notify(messageBody) {
  messageBody = `TEST: ${messageBody}`;
  await sendText(messageBody, process.env.TESTER_0_NUMBER);
  await sendCall(messageBody, process.env.TESTER_0_NUMBER);
  await sendText(messageBody, process.env.TESTER_1_NUMBER);
}

module.exports = notify;
