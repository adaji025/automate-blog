const { Router } = require("express");
const { ALL_ADMIN } = require("../../constants/roles");
const router = Router();
const { validate } = require("../../utils/utils");
const {
  passwordResetValidator,
  confirmEmailResetPasswordValidator,
  resetPasswordValidator,
  loginValidator,
  checkEmailValidator,
  registerValidator,
} = require("../../validators/admin/auth");
const {
  register,
  login,
  checkEmail,
  getAdminRole,
  resetPassword,
  confirmResetPasswordWithEmail,
  passwordReset,
} = require("../../controllers/admin/auth");
const { authToken } = require("../../middleware/authToken");
const { verifyRoles } = require("../../middleware/verifyRoles");

router.post("/register", registerValidator, validate, register);

router.post("/login", loginValidator, validate, login);

router.post("/email/check", checkEmailValidator, validate, checkEmail);

router.get("/role", authToken, verifyRoles(ALL_ADMIN), getAdminRole);

router.post("/password-reset", passwordResetValidator, validate, resetPassword);

router.get(
  "/verify-reset/:token",
  confirmEmailResetPasswordValidator,
  validate,
  confirmResetPasswordWithEmail
);
router.post(
  "/reset-password/:token",
  resetPasswordValidator,
  validate,
  passwordReset
);

module.exports = router;
