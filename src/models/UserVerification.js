const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    uniqeId: {
      type: String,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserVerification = mongoose.model(
  "UserVerification",
  userVerificationSchema
);
module.exports = UserVerification;
