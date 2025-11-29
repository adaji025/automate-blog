const { body } = require("express-validator");

exports.createContactValidator = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("message").notEmpty().withMessage("Message is required"),
  body("phone").notEmpty().withMessage("Phone is required"),
  // Captcha is optional - no validation required
];
