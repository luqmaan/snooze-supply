const { DISPATCH_LEVELS, dispatchNotifications } = require("./notify");

async function main() {
  await dispatchNotifications([
    {
      body: `Sorry for another false alarm. I'm pausing snoozesupply until I can make it more reliable with the new yeezysupply design. Thanks for understanding.`,
      level: DISPATCH_LEVELS.ALL_USERS,
      method: "message"
    }
  ]);
}

main();
