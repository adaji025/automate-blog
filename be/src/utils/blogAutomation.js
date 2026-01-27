const { Cron } = require("croner");
const { combineAllFunctions } = require("./scraper");

exports.runBlogAutomation = async () => {
  console.log("📅 Blog automation cron job initialized - running every 5 minutes");
  new Cron("*/5 * * * *", { timezone: "Africa/Lagos" }, async () => {
    const startTime = new Date();
    console.log(`⏰ [${startTime.toISOString()}] Cron job triggered - Starting blog generation...`);
    try {
      const result = await combineAllFunctions();
      const endTime = new Date();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`✅ [${endTime.toISOString()}] Blog generation completed in ${duration}s`);
      if (result && result.length > 0) {
        const successful = result.filter(r => r.status === "fulfilled").length;
        console.log(`📊 Results: ${successful}/${result.length} articles processed successfully`);
      } else {
        console.warn("⚠️ No articles were generated or processed");
      }
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Error in cron job:`, error);
    }
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