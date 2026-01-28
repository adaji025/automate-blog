const path = require("path");
// Load .env file from be/ directory (same location as main app)
const envPath = path.resolve(__dirname, "../../.env");
require("dotenv").config({ path: envPath });

// Debug: Log if .env file was found (optional, can remove later)
if (require("fs").existsSync(envPath)) {
  console.log(`📄 Loading .env from: ${envPath}`);
} else {
  console.warn(`⚠️  .env file not found at: ${envPath}`);
  console.warn(`💡 Make sure your .env file is in the be/ directory`);
}
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const sampleBlogPosts = require("./blogSeedData");
const BlogPost = require("../models/admin/BlogPost");
const { uploadImage } = require("../utils/utils");
const generateSitemap = require("../sitemap");

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Note: Environment validation is now done inline in main() to ensure it runs first

// Lazy load scraper utilities to avoid initialization errors
function getUpsertArticles() {
  try {
    const { upsertArticles } = require("../utils/scraper");
    return upsertArticles;
  } catch (error) {
    console.error("❌ Error loading upsertArticles:", error.message);
    return null;
  }
}

// Connect to MongoDB
async function connectDatabase() {
  try {
    mongoose.set("debug", false);
    mongoose.set("bufferCommands", false);

    await mongoose.connect(process.env.DB_URI, mongooseOptions);
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
}

// Resolve image URL (handles both URLs and file paths)
async function resolveImageUrl(imageUrl) {
  try {
    // If it's already a URL, return it
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    // Otherwise, assume it's a file path
    return imageUrl;
  } catch (error) {
    console.error("Error resolving image URL:", error);
    return imageUrl;
  }
}

// Seed blog posts
async function seedBlogPosts(count = null) {
  try {
    console.log("\n🌱 Starting blog post seeding...\n");

    // Determine how many posts to create
    const postsToCreate = count
      ? Math.min(count, sampleBlogPosts.length)
      : sampleBlogPosts.length;

    console.log(`📝 Creating ${postsToCreate} blog post(s)...\n`);

    const createdPosts = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < postsToCreate; i++) {
      const postData = sampleBlogPosts[i];
      console.log(
        `\n[${i + 1}/${postsToCreate}] Processing: "${postData.title}"`
      );

      try {
        // Resolve image URL
        console.log("  🖼️  Resolving image URL...");
        const resolvedImageUrl = await resolveImageUrl(postData.imageUrl);

        // Upload image to Cloudinary
        console.log("  ☁️  Uploading image to Cloudinary...");
        const imageResult = await uploadImage(
          resolvedImageUrl,
          "bles-software-blog",
          "raw"
        );

        if (imageResult instanceof Error) {
          throw new Error(`Cloudinary upload failed: ${imageResult.message}`);
        }

        const assets = [
          { url: imageResult.secureUrl, imgId: imageResult.publicId },
        ];

        // Create blog post data
        const dataToCreate = {
          title: postData.title,
          content: postData.content,
          status: postData.status || "published",
          duration: postData.duration || "5 minutes",
          authorId: process.env.ADMIN_ID,
          assets,
          canonicalUrl: postData.canonicalUrl || "",
        };

        // Save to database
        console.log("  💾 Saving blog post to database...");
        const createdBlog = await BlogPost.create(dataToCreate);
        console.log(`  ✅ Blog post created with ID: ${createdBlog._id}`);

        createdPosts.push(createdBlog);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error processing post: ${error.message}`);
        failureCount++;
        // Continue with next post
      }
    }

    console.log(`\n📊 Seeding Summary:`);
    console.log(`   ✅ Successfully created: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);

    if (createdPosts.length === 0) {
      console.log("\n⚠️  No blog posts were created. Exiting...");
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update sitemap
    console.log("\n🗺️  Updating sitemap...");
    try {
      // Ensure public directory exists
      const fs = require("fs");
      const publicDir = path.resolve(__dirname, "../../public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log("  📁 Created public directory");
      }
      await generateSitemap();
      console.log("✅ Sitemap updated successfully");
    } catch (error) {
      console.error("❌ Error updating sitemap:", error.message);
    }

    // Upsert to Pinecone
    console.log("\n🔍 Upserting articles to Pinecone...");
    try {
      const upsertArticles = getUpsertArticles();
      if (upsertArticles) {
        await upsertArticles(createdPosts);
        console.log(`✅ Successfully upserted ${createdPosts.length} article(s) to Pinecone`);
      } else {
        console.warn("⚠️  Skipping Pinecone upsert due to missing dependencies");
      }
    } catch (error) {
      console.error("❌ Error upserting to Pinecone:", error.message);
    }

    console.log("\n🎉 Blog seeding completed successfully!\n");
    return createdPosts;
  } catch (error) {
    console.error("\n❌ Fatal error during seeding:", error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Validate environment FIRST before doing anything else
    // This must happen before any async operations or imports that might fail
    const required = [
      "DB_URI",
      "ADMIN_ID",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "PINECONE_API_KEY",
      "PINECONE_INDEX_NAME",
      "OPENAI_API_KEY", // Required for Pinecone embeddings
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.error("❌ Missing required environment variables:");
      missing.forEach((key) => console.error(`   - ${key}`));
      console.error("\n💡 Please set these variables in your .env file and try again.");
      process.exit(1);
    }

    console.log("✅ All required environment variables are set\n");

    // Get count from command line argument
    const countArg = process.argv[2];
    const count = countArg ? parseInt(countArg, 10) : null;

    if (countArg && (isNaN(count) || count < 1)) {
      console.error("❌ Invalid count argument. Please provide a positive number.");
      process.exit(1);
    }

    // Connect to database
    await connectDatabase();

    // Seed blog posts
    await seedBlogPosts(count);

    // Close database connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  main();
}

module.exports = { seedBlogPosts, connectDatabase };

