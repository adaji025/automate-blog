const { body } = require("express-validator");

exports.getLocationFromIpValidator = [
  body("ip").notEmpty().withMessage("IP is required"),
];
