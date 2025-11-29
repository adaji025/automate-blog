const { body } = require("express-validator");

exports.createClutchValidator = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("service").notEmpty().withMessage("Service is required"),
  body("profileLink")
    .notEmpty()
    .withMessage("Profile link is required")
    .optional(),
  // body("captcha").notEmpty().withMessage("Captcha is required"),
];
