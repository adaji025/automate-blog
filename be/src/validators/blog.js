const { param, body } = require("express-validator");

exports.retrieveSinglePublicBlogPostValidator = [
  param(["slug"])
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
];

exports.getRelatedBlogPostsValidator = [
  body("title")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
];
