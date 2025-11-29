const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");
const path = require("path");
const fs = require("fs");
const { caseStudyData } = require("./constants/caseStudyData");
const BlogPost = require("./models/admin/BlogPost");

// Define your hostname
const hostname = "https://bles-software.com";

// Define the destination for the sitemap
const dest = path.resolve("./public", "sitemap.xml");

// Define your static routes
const staticRoutes = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/blog", changefreq: "daily", priority: 1.0 },
  { url: "/about-us", changefreq: "monthly", priority: 0.8 },
  { url: "/contact", changefreq: "monthly", priority: 0.8 },
];

// Fetch dynamic routes, e.g., blog slugs
async function fetchBlogRoutes() {
  const blogData = await BlogPost.find({}).lean();

  return blogData.map(({ slug, assets, title }) => ({
    url: `/blog/${slug}`,
    changefreq: "weekly",
    priority: 0.7,
    img: { url: `${assets[0]?.url}`, caption: title, title: title },
  }));
}

function fetchCaseStudyRoutes() {
  return caseStudyData.map(({ slug, image, cardTitle }) => ({
    url: `/case-study/${slug}`,
    changefreq: "weekly",
    priority: 0.7,
    img: { url: `${hostname}${image}`, caption: cardTitle, title: cardTitle },
  }));
}

const generateSitemap = async () => {
  const dynamicBlogRoutes = await fetchBlogRoutes();
  const dynamicCaseStudyRoutes = fetchCaseStudyRoutes();
  const paths = [
    ...staticRoutes,
    ...dynamicBlogRoutes,
    ...dynamicCaseStudyRoutes,
  ];

  // Create a stream to write to
  const sitemap = new SitemapStream({ hostname });

  // Write the sitemap to a file
  const writeStream = fs.createWriteStream(dest);
  sitemap.pipe(writeStream);

  // Convert the stream to a promise and resolve it to get the XML string
  await streamToPromise(Readable.from(paths).pipe(sitemap));

  console.log("Sitemap generated successfully!");
};

module.exports = generateSitemap;
