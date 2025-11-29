const Admin = require("../../models/admin/Admin");
const AdminToken = require("../../models/admin/AdminToken");
const jwt = require("jsonwebtoken");
const handleResponse = require("../../utils/response");
const mg = require("../../utils/mailgun");
const randomatic = require("randomatic");

exports.register = async (req, res, next) => {
  try {
    const { email, fullName, password } = req.body;

    const user = await Admin.create({ email, fullName, password });

    //generate access token after registeration
    const details = {
      _id: user._id,
      email: user.email,
      role: user?.role,
      isRevoke: user.isRevoke,
    };

    const accessToken = jwt.sign(details, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return handleResponse(res, 200, "Admin created successfully", {
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;

    const { email } = req.user;

    const user = await Admin.findOne({ email });
    const match = await user.comparePassword(password);

    if (!user) {
      return handleResponse(res, 404, "No account found");
    }

    if (!match) {
      return handleResponse(res, 400, "Incorrect password");
    }

    if (!user?.role) {
      return handleResponse(res, 400, "You have not been assigned a role yet");
    }

    const details = {
      _id: req.user._id,
      email: user.email,
      role: user?.role,
      isRevoke: user.isRevoke,
    };

    // send email to admin
    // await mg.messages.create(process.env.MAILGUN_DOMAIN_NAME, {
    //   from: `Taski <mailgun@${process.env.MAILGUN_DOMAIN_NAME}>`,
    //   to: user?.email,
    //   subject: "Login Notification",
    //   text: "You just logged in as an admin",
    // });

    const token = jwt.sign(details, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return handleResponse(res, 200, "Login successful", {
      user: { ...details, fullName: user.fullName },
      token,
    });
  } catch (error) {
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await Admin.findOne({ email }).lean();

    if (!user) {
      return res.status(400).send("No account with this email address found");
    }

    // create reset password token
    const resetPasswordToken = await AdminToken.create({
      userId: user._id,
      resetPasswordToken: `${randomatic("0", 6)}`,
    });

    // send email to admin
    await mg.messages.create(process.env.MAILGUN_DOMAIN_NAME, {
      from: `Taski <mailgun@${process.env.MAILGUN_DOMAIN_NAME}>`,
      to: user?.email,
      subject: "Reset Password",
      text: `Please use this OTP to reset your password: ${resetPasswordToken?.resetPasswordToken}`,
    });

    return handleResponse(res, 201, "Reset mail sent");
  } catch (error) {
    return next(error);
  }
};

exports.confirmResetPasswordWithEmail = async (req, res, next) => {
  try {
    const otp = req.params.token;

    const resetPasswordToken = await AdminToken.findOne({
      resetPasswordToken: otp,
    }).lean();

    if (!resetPasswordToken) {
      return res.status(400).send("There is an error");
    }

    const user = await Admin.findById(resetPasswordToken.userId);

    if (!user) {
      return res.status(400).send("No account with this otp found");
    }

    //delete otp after verification
    await AdminToken.deleteOne({
      resetPasswordToken: resetPasswordToken.resetPasswordToken,
    });

    //then create a token for resetting the password
    const aResetPasswordToken = await AdminToken.create({
      userId: user._id,
      resetPasswordToken: `${randomatic("0a", 32)}`,
    });

    return handleResponse(res, 200, "Email validated successfully", {
      resetPasswordToken: aResetPasswordToken.resetPasswordToken,
    });
  } catch (error) {
    return next(error);
  }
};

exports.passwordReset = async (req, res, next) => {
  try {
    const { token } = req.params;

    const { password, confirmPassword } = req.body;

    const resetToken = await AdminToken.findOne({
      resetPasswordToken: token,
    }).lean();
    if (!resetToken) {
      return handleResponse(res, 500, "You cannot reset password at this time");
    }

    if (confirmPassword !== password) {
      return handleResponse(res, 500, "Passwords do not match");
    }

    const user = await Admin.findById(resetToken.userId);

    await Admin.updateOne(
      {
        email: user.email,
      },
      {
        $set: {
          password: password,
        },
      },
      {
        upsert: false,
      }
    );

    //delete used reset password token
    await AdminToken.deleteOne({
      resetPasswordToken: token,
    });

    return handleResponse(res, 201, "Password reset successful");
  } catch (error) {
    return next(error);
  }
};

exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await Admin.findOne({ email: email.toLowerCase() }).lean();

    if (user) {
      return handleResponse(res, 400, "Email has been taken");
    }

    return handleResponse(res, 200, "Email is available");
  } catch (error) {
    return next(error);
  }
};

exports.getAdminRole = async (req, res, next) => {
  const token = req.user;

  try {
    //Get some info in admin model
    const user = await Admin.findById(token._id, {
      role: 1,
    });

    return handleResponse(res, 200, "Admin role retrieved successfully", user);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
