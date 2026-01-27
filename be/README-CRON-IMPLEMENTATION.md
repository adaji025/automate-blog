# Blog Automation Cron Job Implementation

## Overview

This document details the implementation of the automated blog generation system using cron scheduling. The system automatically fetches AI-related news articles, enriches them with AI-generated content, and publishes them as blog posts.

## Architecture

### Components

1. **Cron Scheduler** (`be/src/utils/blogAutomation.js`)
   - Uses `croner` library for scheduling
   - Triggers blog generation at specified intervals

2. **Blog Generation Pipeline** (`be/src/utils/scraper.js`)
   - Fetches news articles from Google News
   - Filters and selects top articles
   - Enriches content using OpenAI
   - Uploads images to Cloudinary
   - Saves blog posts to MongoDB
   - Updates Pinecone vector database
   - Generates sitemap

3. **Server Integration** (`be/src/index.js`)
   - Initializes cron job on server startup
   - Provides manual trigger endpoint

## Implementation Details

### 1. Cron Job Setup

**File:** `be/src/utils/blogAutomation.js`

```javascript
const { Cron } = require("croner");
const { combineAllFunctions } = require("./scraper");

exports.runBlogAutomation = async () => {
  new Cron("*/5 * * * *", { timezone: "Africa/Lagos" }, async () => {
    await combineAllFunctions();
  });
};
```

**Current Configuration:**
- **Schedule:** Every 5 minutes (`*/5 * * * *`)
- **Timezone:** Africa/Lagos
- **Trigger:** Automatically executes `combineAllFunctions()`

### 2. Server Initialization

**File:** `be/src/index.js` (Line 179)

```javascript
app.listen(PORT, async function () {
  console.log(`Server listening on port ${PORT}.`);
  runBlogAutomation(); // Starts the cron job
});
```

The cron job is initialized when the Express server starts, ensuring it runs continuously as long as the server is running.

### 3. Blog Generation Workflow

**File:** `be/src/utils/scraper.js`

The `combineAllFunctions()` function orchestrates the entire blog generation process:

#### Step 1: Fetch AI News Articles
```javascript
const articles = await fetchAINews();
```
- Uses `google-news-scraper` to fetch recent AI-related news
- Selects a unique search term from a predefined list
- Filters articles to ensure they have title and link
- Returns array of article objects

#### Step 2: Filter Top Articles
```javascript
const topArticles = await filterTopArticles(articles);
```
- Uses OpenAI `gpt-5-nano` model to analyze articles
- Selects the most trending and relevant articles
- Returns top 1 article (configurable)

#### Step 3: Enrich Articles with OpenAI
```javascript
const enrichedArticles = await Promise.allSettled(
  topArticles.map(enrichWithOpenAI)
);
```
- Uses OpenAI `gpt-5-nano` model to generate:
  - SEO-optimized title (`enrichedTitle`)
  - Comprehensive blog content (`enrichedContent`) - 2350-3450 words
  - HTML-formatted content with proper heading structure
- Includes keyword optimization
- Uses retry mechanism for API failures

#### Step 4: Process Each Article
For each successfully enriched article:
1. **Resolve Image URL** - Extracts image from article
2. **Upload to Cloudinary** - Stores image in cloud storage
3. **Create Blog Post** - Saves to MongoDB with:
   - Title and content
   - Image assets
   - Author ID
   - Status: "published"
   - Duration: "5 minutes"
4. **Upsert to Pinecone** - Adds to vector database for search
5. **Update Sitemap** - Regenerates sitemap.xml

## Dependencies

### Core Libraries

- **croner** (v9.0.0) - Cron job scheduling
- **google-news-scraper** (v2.7.0) - News article fetching
- **openai** (v4.91.1) - AI content generation
- **mongoose** (v8.9.5) - MongoDB database operations
- **@pinecone-database/pinecone** (v5.1.1) - Vector database
- **cloudinary** (v2.5.1) - Image storage
- **axios** (v1.8.0) - HTTP requests

### Environment Variables Required

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database
DB_URI=mongodb://your_mongodb_connection_string
ADMIN_ID=your_admin_user_id

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: DataForSEO
DATAFORSEO_USERNAME=your_username
DATAFORSEO_PASSWORD=your_password
```

## Configuration

### Changing the Schedule

Edit `be/src/utils/blogAutomation.js` line 5:

```javascript
new Cron("*/5 * * * *", { timezone: "Africa/Lagos" }, async () => {
```

**Common Schedule Examples:**

| Frequency | Cron Expression | Description |
|-----------|----------------|-------------|
| Every 5 minutes | `"*/5 * * * *"` | Current setting |
| Every 30 minutes | `"*/30 * * * *"` | Moderate frequency |
| Every hour | `"0 * * * *"` | Hourly |
| Every 6 hours | `"0 */6 * * *"` | 4 times daily |
| Every 8 hours | `"0 */8 * * *"` | 3 times daily |
| Daily at midnight | `"0 0 * * *"` | Once per day |
| Daily at 2 AM | `"0 2 * * *"` | Early morning |
| Every Monday at 9 AM | `"0 9 * * 1"` | Weekly |

**Cron Format:**
```
"minute hour day month day-of-week"
```

### Changing Timezone

Modify the timezone option in the Cron constructor:

```javascript
new Cron("*/5 * * * *", { timezone: "America/New_York" }, async () => {
```

Supported timezones: IANA timezone database names (e.g., "UTC", "America/New_York", "Europe/London")

### Modifying AI Model

The system uses `gpt-5-nano` for content generation. To change:

**File:** `be/src/utils/scraper.js`

1. **Line 217** - `filterTopArticles()` function:
```javascript
model: "gpt-5-nano",
```

2. **Line 382** - `enrichWithOpenAI()` function:
```javascript
model: "gpt-5-nano",
```

## Manual Trigger

You can manually trigger blog generation via API endpoint:

```bash
GET http://localhost:4000/fetch-ai-news
```

This bypasses the cron schedule and immediately executes the blog generation process.

## Error Handling

### Retry Mechanism

The system includes exponential backoff retry logic:

```javascript
async function retryRequest(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, delay * 2 ** i));
    }
  }
}
```

### Error Scenarios

1. **No Articles Fetched**
   - Returns empty array
   - Process stops gracefully

2. **Filtering Fails**
   - Falls back to first article
   - Continues with unfiltered content

3. **Enrichment Fails**
   - Article skipped
   - Error logged to console
   - Process continues with next article

4. **Database Errors**
   - Caught and logged
   - Process continues

## Search Terms

The system uses a rotating list of search terms to fetch diverse content:

- SaaS & Cloud topics
- Mobile Development
- AI & Machine Learning
- Web Development
- Software Engineering
- And more...

**Location:** `be/src/utils/scraper.js` (Lines 37-157)

The system ensures unique search terms are used within a 24-hour cache window to avoid duplicate content.

## Blog Post Structure

Each generated blog post includes:

```javascript
{
  title: "SEO-optimized title",
  content: "HTML-formatted content (2350-3450 words)",
  status: "published",
  duration: "5 minutes",
  authorId: process.env.ADMIN_ID,
  assets: [{
    url: "cloudinary_image_url",
    imgId: "cloudinary_public_id"
  }],
  canonicalUrl: "https://bles-software.com/blog/...",
  slug: "auto-generated-from-title",
  createdAt: Date,
  updatedAt: Date
}
```

## Monitoring & Debugging

### Console Logging

Currently, the system logs:
- Errors during article fetching
- Errors during filtering
- Errors during enrichment
- Errors during blog creation
- General error messages

### Recommended Logging Enhancements

Add detailed logging to track:
- Cron job execution times
- Number of articles fetched
- Success/failure rates
- Processing duration
- API call status

Example enhancement:

```javascript
exports.runBlogAutomation = async () => {
  console.log("📅 Blog automation cron job initialized");
  const cron = new Cron("*/5 * * * *", { timezone: "Africa/Lagos" }, async () => {
    console.log(`⏰ [${new Date().toISOString()}] Cron job triggered`);
    try {
      const result = await combineAllFunctions();
      console.log(`✅ Completed: ${result.length} articles processed`);
    } catch (error) {
      console.error("❌ Error:", error);
    }
  });
  return cron;
};
```

## Troubleshooting

### Cron Job Not Running

1. **Check server is running** - Cron only works when server is active
2. **Verify cron expression** - Test with a simple expression first
3. **Check timezone** - Ensure timezone is correct
4. **Restart server** - Changes require server restart

### No Blog Posts Generated

1. **Check environment variables** - Ensure all required keys are set
2. **Verify API keys** - Test OpenAI API key is valid
3. **Check database connection** - Ensure MongoDB is connected
4. **Review console logs** - Look for error messages
5. **Test manually** - Use `/fetch-ai-news` endpoint to test

### API Rate Limits

If hitting rate limits:
- Increase cron interval (e.g., every 30 minutes instead of 5)
- Implement rate limiting logic
- Add delays between API calls

### Memory Issues

For high-frequency cron jobs:
- Monitor server memory usage
- Consider reducing article processing batch size
- Implement cleanup of old data

## Best Practices

1. **Schedule Frequency**
   - Start with less frequent schedules (hourly or daily)
   - Monitor API usage and costs
   - Adjust based on needs

2. **Error Monitoring**
   - Implement comprehensive logging
   - Set up error alerts
   - Monitor API quota usage

3. **Content Quality**
   - Review generated content regularly
   - Adjust prompts as needed
   - Monitor for duplicate content

4. **Resource Management**
   - Monitor database growth
   - Clean up old/unused data
   - Optimize image storage

## File Structure

```
be/
├── src/
│   ├── index.js                    # Server initialization
│   ├── utils/
│   │   ├── blogAutomation.js       # Cron job setup
│   │   ├── scraper.js              # Blog generation logic
│   │   └── README-blogAutomation.md # Quick reference
│   └── models/
│       └── admin/
│           └── BlogPost.js         # Blog post schema
└── README-CRON-IMPLEMENTATION.md    # This file
```

## Future Enhancements

Potential improvements:

1. **Enhanced Logging** - Comprehensive logging system
2. **Monitoring Dashboard** - Real-time status monitoring
3. **Content Deduplication** - Prevent duplicate posts
4. **Quality Scoring** - Rate content before publishing
5. **A/B Testing** - Test different prompts
6. **Scheduled Publishing** - Queue posts for future publishing
7. **Multi-language Support** - Generate content in multiple languages

## Support

For issues or questions:
1. Check console logs for errors
2. Verify all environment variables
3. Test manual trigger endpoint
4. Review this documentation

---

**Last Updated:** 2024
**Version:** 1.0.0




