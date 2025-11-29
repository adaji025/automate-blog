const { body, param } = require("express-validator");
const Admin = require("../../models/admin/Admin");
const AdminToken = require("../../models/admin/AdminToken");

exports.registerValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .isEmail()
    .withMessage("Must be a valid email")
    .toLowerCase()
    .custom(async (identifier) => {
      let user;
      user = await Admin.findOne({
        email: identifier,
      }).lean();

      if (user) {
        throw new Error("Email has been used");
      }

      return true;
    }),
  body(["fullName", "password"])
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
];

exports.loginValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .isEmail()
    .withMessage("Must be a valid email")
    .toLowerCase()
    .custom(async (identifier, { req }) => {
      let user;
      user = await Admin.findOne({
        email: identifier,
      }).lean();

      if (!user) {
        throw new Error("No account found");
      }

      req.user = user;
      return true;
    }),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
];

exports.passwordResetValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .isEmail()
    .withMessage("Should be an email address")
    .toLowerCase()
    .custom(async (email, { req }) => {
      const user = await Admin.findOne({
        email,
      }).lean();

      if (!user) {
        throw new Error("No account with this email address");
      }

      req.user = user;
      return true;
    }),
];

exports.confirmEmailResetPasswordValidator = [
  param("token")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .custom(async (token, { req }) => {
      const resetToken = await AdminToken.findOne({
        resetPasswordToken: token,
      }).lean();

      if (!resetToken) {
        throw new Error("No valid token");
      }

      req.token = resetToken;
      return true;
    }),
];

exports.resetPasswordValidator = [
  body("password")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
  body("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
  param("token")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .custom(async (token, { req }) => {
      const resetToken = await AdminToken.findOne({
        resetPasswordToken: token,
      }).lean();

      if (!resetToken) {
        throw new Error("No valid token");
      }

      req.token = resetToken;
      return true;
    }),
];

exports.checkEmailValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string"),
];
