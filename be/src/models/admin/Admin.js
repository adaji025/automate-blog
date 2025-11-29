const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { capitalizeFirstLetter } = require("../../utils/utils");

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: (email) => validator.isEmail(email),
      set: (email) => email.toLowerCase(),
    },
    profilePic: {
      url: { type: String, required: false },
      imgId: { type: String, required: false },
    },
    fullName: {
      type: String,
      required: false,
      set: (fullName) => fullName.toLowerCase(),
      get: (fullName) => capitalizeFirstLetter(fullName),
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      set: (password) => bcrypt.hashSync(password, 10),
    },
    role: {
      type: String,
      required: false,
      enum: ["Super Admin", "Admin", ""],
      default: "",
    },
    isRevoke: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.methods.comparePassword = async function (userPassword, next) {
  try {
    let isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
  } catch (error) {
    return next(error);
  }
};

const Admin = new mongoose.model("Admin", adminSchema);

module.exports = Admin;
