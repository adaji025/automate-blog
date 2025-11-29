const { Router } = require("express");
const { validate } = require("../utils/utils");
const {
  getSingleBlogPost,
  getRelatedBlogPosts,
} = require("../controllers/blog");
const {
  retrieveSinglePublicBlogPostValidator,
  getRelatedBlogPostsValidator,
} = require("../validators/blog");
const { getAllBlogPost } = require("../controllers/admin/blog");
const router = Router();

router.get(
  "/single/:slug",
  retrieveSinglePublicBlogPostValidator,
  validate,
  getSingleBlogPost
);

router.get("/list", getAllBlogPost);

router.post(
  "/related",
  getRelatedBlogPostsValidator,
  validate,
  getRelatedBlogPosts
);

module.exports = router;
