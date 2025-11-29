const handleResponse = require("../utils/response");
const jwt = require("jsonwebtoken");

exports.authToken = async (req, res, next) => {
  const auth = req.header("Authorization");

  if (!auth) {
    return handleResponse(res, 400, "Unauthorized, Please login");
  }

  const token = auth.split(" ")[1];

  if (!token) {
    return handleResponse(res, 400, "Invalid token, Please login");
  }

  let user = {};

  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return handleResponse(res, 400, "Invalid token, Please login", undefined, {
      error,
    });
  }

  req.user = user;
  res.locals.user = user;
  next();
};
