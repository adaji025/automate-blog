const BlogPost = require("../models/admin/BlogPost");
const generateSitemap = require("../sitemap");
const { deleteAnArticleFromPinecone } = require("./scraper");

exports.deleteBulkBlogPostsBySlug = async () => {
  const blogUrls = [
    "https://bles-software.com/blog/nyc-tech-startup-funding-sparks-innovation-for-app-developer-company-growth",
  ];

  const blogs = await BlogPost.find({
    slug: { $in: blogUrls.map((url) => url.split("blog/").pop()) },
  })
    .lean()
    .select("slug _id");

  for (const blog of blogs) {
    await BlogPost.findByIdAndDelete(blog._id);

    // delete from pinecone
    await deleteAnArticleFromPinecone(blog._id);
  }

  //   // update sitemap
  await generateSitemap();

  console.log("completed");

  return;
};
