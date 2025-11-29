const BlogPost = require("../models/admin/BlogPost");
const handleResponse = require("../utils/response");
const { querySimilarArticles } = require("../utils/scraper");
exports.getSingleBlogPost = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blogPost = await BlogPost.findOne({ slug }).select({
      authorId: 0,
    });

    return handleResponse(res, 200, "Blog post retrieved", blogPost);
  } catch (error) {
    return next(error);
  }
};

exports.getRelatedBlogPosts = async (req, res, next) => {
  try {
    const { title } = req.body;

    const relatedBlogPosts = await querySimilarArticles(title, 7);

    return handleResponse(
      res,
      200,
      "Related blog posts retrieved",
      relatedBlogPosts
    );
  } catch (error) {
    return next(error);
  }
};
