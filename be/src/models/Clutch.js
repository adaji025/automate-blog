const mongoose = require("mongoose");

const clutchSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    service: {
      type: String,
    },
    profileLink: {
      type: String,
    },
  },
  { timestamps: true }
);

const Clutch = mongoose.model("Clutch", clutchSchema);

module.exports = Clutch;
