const mongoose = require("mongoose");

const PasswordResetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  resetString: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);
