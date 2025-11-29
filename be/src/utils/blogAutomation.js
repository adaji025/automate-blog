const { Cron } = require("croner");
const { combineAllFunctions } = require("./scraper");

exports.runBlogAutomation = async () => {
  new Cron("*/5 * * * *", { timezone: "Africa/Lagos" }, async () => {
    await combineAllFunctions();
  });
};


// Every 8 hours: "0 */8 * * *"
// Every 12 hours: "0 */12 * * *"
// Every 6 hours: "0 */6 * * *"
// Every hour: "0 * * * *"
// Every 30 minutes: "*/30 * * * *"
// Every day at 2 AM: "0 2 * * *"
// Every Monday at 9 AM: "0 9 * * 1"

// after every 5 mins: "*/5 * * * *"