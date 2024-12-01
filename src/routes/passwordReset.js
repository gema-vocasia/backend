const express = require("express");
const router = express.Router();
const PasswordResetController = require("../controller/passwordResetController");

console.log("Password reset routes loaded");

// Forgot Password (Request Reset Token)
router.post(
  "/password-reset",
  (req, res, next) => {
    console.log("POST /password-reset triggered");
    next();
  },
  PasswordResetController.forgotPassword
);

// Reset Password
router.post(
  "/password-reset/:token",
  (req, res, next) => {
    console.log("POST /password-reset/:token triggered");
    next();
  },
  PasswordResetController.resetPassword
);

module.exports = router;
