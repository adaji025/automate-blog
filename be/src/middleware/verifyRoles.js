const handleResponse = require("../utils/response");

exports.verifyRoles = (permissions) => {
  return (req, res, next) => {
    const { user } = req;
    if (!permissions) {
      return handleResponse(res, 400, "Permission is absent");
    }

    if (permissions.includes(user.role)) {
      return next();
    }
    return handleResponse(res, 400, "Access Denied");
  };
};
