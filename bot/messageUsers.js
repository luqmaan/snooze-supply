const { DISPATCH_LEVELS, dispatchNotifications } = require("./notify");

async function main() {
  await dispatchNotifications([
    {
      body: `Sorry for the false alarm. It was caused by the new yeezysupply.com homepage design. I have updated the code to prevent this.`,
      level: DISPATCH_LEVELS.ALL_USERS,
      method: "message"
    }
  ]);
}

main();
