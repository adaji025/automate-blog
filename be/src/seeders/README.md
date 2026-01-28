# Blog Seeder

A seeder script for populating the database with sample blog posts. This seeder follows the same implementation pattern as the automated blog scraper, ensuring consistency in how blog posts are created, stored, and indexed.

## Overview

The blog seeder creates sample blog posts with:
- HTML-formatted content
- Images uploaded to Cloudinary
- Automatic slug generation
- Sitemap updates
- Pinecone vector database indexing

## Prerequisites

Before running the seeder, ensure you have:

1. **Environment Variables** - All required environment variables must be set in your `.env` file:
   - `DB_URI` - MongoDB connection string
   - `ADMIN_ID` - MongoDB ObjectId of an admin user (used as authorId)
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
   - `PINECONE_API_KEY` - Pinecone API key
   - `PINECONE_INDEX_NAME` - Pinecone index name

2. **Database Connection** - MongoDB must be running and accessible

3. **Cloudinary Account** - Valid Cloudinary credentials for image uploads

4. **Pinecone Index** - Pinecone index must exist and be accessible

## Installation

No additional installation is required. The seeder uses existing project dependencies.

## Usage

### Create All Sample Blog Posts

Run the seeder to create all 5 sample blog posts:

```bash
npm run seed:blog
```

### Create a Specific Number of Posts

To create a specific number of blog posts (up to the number available in seed data):

```bash
node src/seeders/blogSeeder.js <number>
```

Example:
```bash
node src/seeders/blogSeeder.js 3
```

This will create the first 3 blog posts from the seed data.

### Create a Single Post

A convenience script is available for creating just one post:

```bash
npm run seed:blog:single
```

## What Gets Created

For each blog post, the seeder:

1. **Uploads Image to Cloudinary**
   - Downloads/processes the image from the provided URL
   - Uploads to Cloudinary folder: `bles-software-blog`
   - Stores the secure URL and public ID

2. **Creates Blog Post in MongoDB**
   - Title (from seed data)
   - HTML content (from seed data)
   - Status: "published" (default)
   - Duration: reading time (from seed data)
   - Author ID: from `ADMIN_ID` environment variable
   - Assets: Cloudinary image URL and public ID
   - Slug: auto-generated from title (via mongoose-slug-updater)
   - Timestamps: automatically added by Mongoose

3. **Updates Sitemap**
   - Regenerates `public/sitemap.xml` with all blog posts
   - Includes the newly created posts

4. **Indexes in Pinecone**
   - Creates vector embeddings from the blog post title
   - Upserts to Pinecone for semantic search functionality
   - Stores metadata (title, slug, assets, timestamps)

## Sample Blog Posts

The seeder includes 5 pre-configured blog posts:

1. **Building Scalable SaaS Applications: A Complete Guide for Founders**
   - Duration: 8 minutes
   - Topics: Architecture, scalability, cloud infrastructure

2. **AI-Powered Development Tools: Revolutionizing Software Creation**
   - Duration: 6 minutes
   - Topics: AI tools, development workflow, automation

3. **Mobile App Development: Choosing the Right Approach for Your SaaS**
   - Duration: 7 minutes
   - Topics: Native vs hybrid, cross-platform, PWA

4. **API Integration Best Practices for Modern SaaS Applications**
   - Duration: 9 minutes
   - Topics: API design, security, monitoring

5. **Cloud Infrastructure: Optimizing Costs While Scaling Your SaaS**
   - Duration: 10 minutes
   - Topics: Cost optimization, auto-scaling, cloud management

## File Structure

```
be/src/seeders/
├── README.md           # This file
├── blogSeedData.js     # Sample blog post data
└── blogSeeder.js       # Main seeder script
```

## How It Works

The seeder follows the same flow as the automated blog scraper (`combineAllFunctions` in `scraper.js`):

1. **Environment Validation** - Checks all required environment variables
2. **Database Connection** - Connects to MongoDB with proper error handling
3. **Cloudinary Configuration** - Sets up Cloudinary client
4. **Post Processing Loop** - For each blog post:
   - Resolves image URL
   - Uploads image to Cloudinary
   - Creates blog post in database
   - Handles errors gracefully (continues with next post if one fails)
5. **Sitemap Update** - Regenerates sitemap with all posts
6. **Pinecone Indexing** - Upserts all created posts to Pinecone
7. **Summary Report** - Displays success/failure counts

## Error Handling

The seeder includes comprehensive error handling:

- **Environment Variables**: Validates all required variables at startup
- **Database Connection**: Provides clear error messages if connection fails
- **Image Upload**: Continues with next post if image upload fails
- **Blog Creation**: Logs errors but continues processing remaining posts
- **Sitemap/Pinecone**: Errors are logged but don't stop the process

If any step fails, the seeder will:
- Log the specific error
- Continue processing remaining posts
- Display a summary of successes and failures at the end

## Output

The seeder provides detailed console output:

```
✅ All required environment variables are set
✅ Database connected successfully

🌱 Starting blog post seeding...

📝 Creating 5 blog post(s)...

[1/5] Processing: "Building Scalable SaaS Applications..."
  🖼️  Resolving image URL...
  ☁️  Uploading image to Cloudinary...
  💾 Saving blog post to database...
  ✅ Blog post created with ID: 507f1f77bcf86cd799439011

...

📊 Seeding Summary:
   ✅ Successfully created: 5
   ❌ Failed: 0

🗺️  Updating sitemap...
✅ Sitemap updated successfully

🔍 Upserting articles to Pinecone...
✅ Successfully upserted 5 article(s) to Pinecone

🎉 Blog seeding completed successfully!
```

## Troubleshooting

### Error: Missing Environment Variables

**Problem**: Seeder exits with "Missing required environment variables"

**Solution**: 
- Ensure your `.env` file is in the `be/` directory
- Verify all required variables are set
- Check for typos in variable names

### Error: Database Connection Failed

**Problem**: "Database connection failed" error

**Solution**:
- Verify MongoDB is running
- Check `DB_URI` connection string is correct
- Ensure network connectivity to MongoDB
- For MongoDB Atlas, verify IP whitelist includes your IP

### Error: Cloudinary Upload Failed

**Problem**: Image upload errors

**Solution**:
- Verify Cloudinary credentials are correct
- Check image URLs are accessible
- Ensure Cloudinary account has sufficient quota
- Verify network connectivity

### Error: Pinecone Upsert Failed

**Problem**: Pinecone indexing errors

**Solution**:
- Verify Pinecone API key is correct
- Check `PINECONE_INDEX_NAME` matches existing index
- Ensure Pinecone index is accessible
- Verify network connectivity to Pinecone

### No Posts Created

**Problem**: Seeder runs but creates 0 posts

**Solution**:
- Check console output for specific error messages
- Verify `ADMIN_ID` is a valid MongoDB ObjectId
- Ensure database connection is successful
- Check that seed data file is accessible

## Customization

### Adding More Sample Posts

Edit `blogSeedData.js` and add more objects to the `sampleBlogPosts` array:

```javascript
{
  title: "Your Blog Post Title",
  content: "<h1>Your HTML Content</h1><p>...</p>",
  imageUrl: "https://example.com/image.jpg",
  duration: "5 minutes",
  status: "published",
}
```

### Modifying Default Behavior

Edit `blogSeeder.js` to:
- Change default number of posts
- Modify Cloudinary folder name
- Adjust error handling behavior
- Add custom validation

## Integration with Main Application

The seeder uses the same utilities and models as the main application:

- **Models**: `BlogPost` from `models/admin/BlogPost.js`
- **Utils**: `uploadImage` from `utils/utils.js`
- **Sitemap**: `generateSitemap` from `sitemap.js`
- **Pinecone**: `upsertArticles` from `utils/scraper.js`

This ensures consistency between seeded data and data created by the automated scraper.

## Best Practices

1. **Run Before Development**: Seed your database before starting development to have sample data
2. **Test Environment**: Use the seeder in development/staging environments
3. **Production Caution**: Be careful when running in production - it will create new posts
4. **Backup First**: Consider backing up your database before seeding
5. **Monitor Output**: Always review the console output for errors

## Related Documentation

- [API Documentation](../README-API-DOCUMENTATION.md) - API endpoints documentation
- [Cron Implementation](../README-CRON-IMPLEMENTATION.md) - Automated blog generation
- [Blog Automation](../utils/README-blogAutomation.md) - Blog automation details

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console output for specific error messages
3. Verify all environment variables are set correctly
4. Ensure all services (MongoDB, Cloudinary, Pinecone) are accessible

---

**Last Updated**: 2024  
**Version**: 1.0.0

