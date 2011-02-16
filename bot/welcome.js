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
  `Thanks for joining the snooze.supply. I've added you to the private alpha test for the 500 Blush release. Please share any feedback with me at 321-750-7895 or on Twitter at @snzsply.`
);
