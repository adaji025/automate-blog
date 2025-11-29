const { param, body } = require("express-validator");
const ObjectId = require("mongodb").ObjectId;

exports.validateBlogPostId = [
  param("blogPostId")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .custom(async (blogPostId) => {
      if (!ObjectId.isValid(blogPostId)) {
        throw new Error("blogPostId must be an ObjectId");
      }

      return true;
    }),
];

exports.createPostValidator = [
  body(["title", "content", "duration"])
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
  body(["status"])
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .custom(async (status) => {
      if (!["published", "pending"].includes(status)) {
        throw new Error("Status does not exist");
      }

      return true;
    }),
  body("assets").custom((value, { req }) => {
    if (!req?.files?.assets) {
      throw new Error("Asset is required");
    }

    let newAssets = [];

    if (!Array.isArray(req?.files?.assets)) {
      newAssets.push(req?.files?.assets);
    } else {
      newAssets = req?.files?.assets;
    }

    if (newAssets.length > 3) {
      throw new Error("You cannot add more than 3 files at a time");
    }

    newAssets?.map((v) => {
      if (!["image/png", "image/jpg", "image/jpeg"].includes(v.mimetype)) {
        throw new Error("One of the assets is not in a valid format");
      } else if (v.size > 2000000) {
        throw new Error("One of the asset size is more than 2MB");
      }
    });

    // Update the value of the key in the request body
    req.files.assets = newAssets;

    return true;
  }),
];

exports.updatePostValidator = [
  ...this.validateBlogPostId,
  body(["title", "content", "duration"])
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
  body(["status"])
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .custom(async (status) => {
      if (!["published", "pending"].includes(status)) {
        throw new Error("Status does not exist");
      }

      return true;
    }),
  body("assets").custom((value, { req }) => {
    if (!req?.files?.assets) {
      return true;
    }

    let newAssets = [];

    if (!Array.isArray(req?.files?.assets)) {
      newAssets.push(req?.files?.assets);
    } else {
      newAssets = req?.files?.assets;
    }

    if (newAssets.length > 3) {
      throw new Error("You cannot add more than 3 files at a time");
    }

    newAssets?.map((v) => {
      if (!["image/png", "image/jpg", "image/jpeg"].includes(v.mimetype)) {
        throw new Error("One of the assets is not in a valid format");
      } else if (v.size > 2000000) {
        throw new Error("One of the asset size is more than 2MB");
      }
    });

    // Update the value of the key in the request body
    req.files.assets = newAssets;

    return true;
  }),
];
