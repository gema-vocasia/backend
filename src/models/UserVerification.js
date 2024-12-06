const mongoose = require("mongoose");

const userVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    uniqueString: {
      type: String,
      required: true,
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
