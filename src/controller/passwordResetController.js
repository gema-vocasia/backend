const jwt = require("jsonwebtoken");
const ResponseAPI = require("../utils/response");
const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

const PasswordResetController = {
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      console.log("Request received for forgot password:", { email });

      // Cari user berdasarkan email
      const user = await User.findOne({ email });
      console.log("User found in database:", user);

      if (!user) {
        console.log("Error: User not found");
        return ResponseAPI.error(res, "user not found", 404);
      }

      // Pastikan user sudah terverifikasi
      if (!user.isVerified) {
        console.log("Error: User is not verified");
        return ResponseAPI.error(res, "user not verified", 400);
      }

      // Kirim email reset password
      const redirectUrl = "http://localhost:8080/reset-password"; // URL redirect Anda
      await sendResetEmail(user, redirectUrl, res);
    } catch (error) {
      console.log("Error in forgotPassword:", error);
      ResponseAPI.serverError(res, error);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;
      console.log("Reset password request received:", { token, password });

      // Cari token di database
      const passwordReset = await PasswordReset.findOne({ token });
      console.log("Password reset entry found:", passwordReset);

      if (!passwordReset) {
        console.log("Error: Invalid token");
        return ResponseAPI.error(res, "invalid token", 400);
      }

      // Cari user berdasarkan token
      const user = await User.findById(passwordReset.userId);
      console.log("User found for token:", user);

      if (!user) {
        console.log("Error: User not found");
        return ResponseAPI.error(res, "user not found", 404);
      }

      // Update password
      user.password = password;
      await user.save();
      console.log("Password updated for user:", user._id);

      // Hapus token yang sudah digunakan
      await PasswordReset.deleteOne({ token });
      console.log("Password reset token deleted:", token);

      ResponseAPI.success(res, "password updated successfully");
    } catch (error) {
      console.log("Error in resetPassword:", error);
      ResponseAPI.serverError(res, error);
    }
  },
};

const sendResetEmail = async (user, redirectUrl, res) => {
  try {
    console.log("Generating reset token for user:", user._id);

    // Buat token reset password
    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "1h", // Token berlaku selama 1 jam
    });
    console.log("Token generated:", token);

    // Hapus token lama dan simpan token baru
    await PasswordReset.deleteMany({ userId: user._id });
    console.log("Old tokens deleted for user:", user._id);

    const passwordReset = new PasswordReset({
      userId: user._id,
      token,
    });
    await passwordReset.save();
    console.log("Token saved to database:", passwordReset);

    // Kirimkan respons sukses
    ResponseAPI.success(res, {
      message: "Password reset link has been sent",
      token,
      redirectUrl: `${redirectUrl}?token=${token}`,
    });
  } catch (error) {
    console.log("Error in sendResetEmail:", error);
    ResponseAPI.serverError(res, error);
  }
};

module.exports = PasswordResetController;
