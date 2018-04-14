const Twilio = require("twilio");

require("dotenv").config();

const twilio = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function sendText(messageBody, to) {
  const message = await twilio.messages.create({
    body: messageBody,
    to: to,
    from: process.env.TWILIO_NUMBER
  });
  console.log(message);
}

notify(
  `Thanks for joining snooze.supply. You'll get text messages for the Yeezy 500 Blush release.`
);
