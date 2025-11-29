require("dotenv").config({ path: "../.env" });
const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const debug = require("debug")("bles-software-api");
const handleResponse = require("./utils/response");
const {
  combineAllFunctions,
  // processBlogPostsInBatchesAndUpsertToPinecone,
} = require("./utils/scraper");

const adminAuth = require("./routes/admin/auth");
const adminBlog = require("./routes/admin/blog");
const adminContact = require("./routes/admin/contact");
const adminClutch = require("./routes/admin/clutch");

const contact = require("./routes/contact");
const userBlog = require("./routes/blog");
const ip = require("./routes/ip");
const clutch = require("./routes/clutch");

const { runBlogAutomation } = require("./utils/blogAutomation");
const generateSitemap = require("./sitemap");
const updateBlogWithCanonical = require("./constants/canonicals");
const BlogPost = require("./models/admin/BlogPost");

const app = express();

app.disable("x-powered-by"); // disable X-Powered-By header
app.use(function (req, res, next) {
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("X-Frame-Options", "deny");
  res.header("X-Content-Type-Options", "nosniff");
  next();
});

mongoose.set("debug", true);
mongoose
  .connect(process.env.DB_URI)
  .then(console.log("Database connected"))
  .catch((err) => {
    console.log(err);
    console.error(err);
  });

const PORT = process.env.PORT || 4000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use(
  cors({
    origin:
      process.env.ENVIRONMENT === "development"
        ? [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://bles-software.com",
            "https://services.bles-software.com",
          ]
        : [
            "https://bles-software.com",
            "https://alex-grant-fe.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "https://services.bles-software.com",
          ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

// Set up cloudinary.
(() => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("connected to cloudinary");
})();

// Initialize routes
app.use("/api/v1/contact", contact);
app.use("/api/v1/user/blog", userBlog);
app.use("/api/v1/ip", ip);
app.use("/api/v1/clutch", clutch);
// admin
app.use("/api/v1/admin/auth", adminAuth);
app.use("/api/v1/admin/blog", adminBlog);
app.use("/api/v1/admin/contact", adminContact);
app.use("/api/v1/admin/clutch", adminClutch);
app.get("/", async (req, res, next) => {
  try {
    await generateSitemap();
    return handleResponse(res, 200, "Welcome to bles software api");
  } catch (error) {
    return next(error);
  }
});

app.get("/update-blog-with-canonical", async (req, res, next) => {
  try {
    for (const eachPost of updateBlogWithCanonical) {
      await BlogPost.findOneAndUpdate(
        { slug: eachPost?.slug },
        {
          $set: {
            canonicalUrl: eachPost?.canonicalUrl,
          },
        }
      );
    }

    return handleResponse(res, 200, "Successful");
  } catch (error) {
    next(error);
  }
});

app.get("/fetch-ai-news", async (req, res, next) => {
  try {
    const enrichedArticles = await combineAllFunctions();
    // const seoOptimizedArticles = await Promise.allSettled(enrichedArticles.map(result => result.status === "fulfilled" ? extractSEOKeywords(result.value) : result.value));
    // res.json(seoOptimizedArticles.map(result => result.status === "fulfilled" ? result.value : result.reason));

    return handleResponse(
      res,
      200,
      "AI news fetched successfully",
      enrichedArticles
    );
  } catch (error) {
    console.error("Error in API route:", error);
    next(error);
  }
});

// Add catch all route
app.all("*", (req, res, next) => {
  try {
    return handleResponse(res, 400, "This route does not exist");
  } catch (error) {
    return next(error);
  }
});

// Add global error handler
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _) => {
  console.log(error);
  return handleResponse(res, 500, error.message, undefined, error);
});

/** This events prevent the application from crashing */
process.on("unhandledRejection", (e) => {
  // TODO: log error to file
  debug(e);
});

process.on("uncaughtException", (e) => {
  // TODO: log error to file
  debug(e);
});

app.listen(PORT, async function () {
  console.log(`Server listening on port ${PORT}.`);
  // await processBlogPostsInBatchesAndUpsertToPinecone();

  // // every 8 hrs, check google news
  runBlogAutomation();

  // // delete bulk blog posts by slug
  // deleteBulkBlogPostsBySlug();
});
