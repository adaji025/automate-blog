const { Router } = require("express");
const { ALL_ADMIN } = require("../../constants/roles");
const router = Router();
const { validate } = require("../../utils/utils");
const { authToken } = require("../../middleware/authToken");
const { verifyRoles } = require("../../middleware/verifyRoles");
const {
  createPostValidator,
  validateBlogPostId,
  updatePostValidator,
} = require("../../validators/admin/blog");
const {
  createPost,
  deleteBlogPost,
  getAllBlogPost,
  getSingleBlogPost,
  updatePost,
  bulkCreatePost,
} = require("../../controllers/admin/blog");

router.post(
  "/create",
  authToken,
  verifyRoles(ALL_ADMIN),
  createPostValidator,
  validate,
  createPost
);

router.post("/create/bulk", authToken, verifyRoles(ALL_ADMIN), bulkCreatePost);

router.delete(
  "/delete/:blogPostId",
  authToken,
  verifyRoles(ALL_ADMIN),
  validateBlogPostId,
  validate,
  deleteBlogPost
);

router.put(
  "/update/:blogPostId",
  authToken,
  verifyRoles(ALL_ADMIN),
  updatePostValidator,
  validate,
  updatePost
);

router.get(
  "/single/:blogPostId",
  authToken,
  verifyRoles(ALL_ADMIN),
  validateBlogPostId,
  validate,
  getSingleBlogPost
);

router.get("/list", authToken, verifyRoles(ALL_ADMIN), getAllBlogPost);

module.exports = router;
