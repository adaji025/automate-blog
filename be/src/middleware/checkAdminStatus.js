const handleResponse = require("../utils/response");

exports.checkAdminStatus = (checkType) => {
  return async (req, res, next) => {
    const { user } = req;

    if (!user) {
      return handleResponse(res, 500, "There is no user");
    }

    if (checkType === "revoke") {
      if (user.isRevoke) {
        return handleResponse(
          res,
          400,
          "Access to your account has been revoked"
        );
      }
    }

    return next();
  };
};
