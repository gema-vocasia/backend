const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600, // Token expires in 1 hour
  },
});

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
module.exports = PasswordReset;
