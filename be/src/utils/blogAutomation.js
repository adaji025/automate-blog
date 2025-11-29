const { Cron } = require("croner");
const { combineAllFunctions } = require("./scraper");

exports.runBlogAutomation = async () => {
  new Cron("0 0 * * *", { timezone: "Africa/Lagos" }, async () => {
    await combineAllFunctions();
  });
};
