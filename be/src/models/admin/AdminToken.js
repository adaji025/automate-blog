const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    confirmEmailToken: {
      required: false,
      type: String,
    },
    resetPasswordToken: {
      required: false,
      type: String,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now(),
      expires: "1h",
    },
  },
  {
    timestamps: true,
  }
);

const AdminToken = new mongoose.model("AdminToken", tokenSchema);

module.exports = AdminToken;
