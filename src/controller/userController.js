const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const ResponseAPI = require("../utils/response");
const User = require("../models/User");
const UserVerification = require("../models/UserVerification");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const PasswordReset = require("../models/PasswordReset");
const fs = require("fs");
const { reset } = require("nodemon");

require("dotenv").config();

// Konfigurasi Nodemailer
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// Verifikasi koneksi email
transporter.verify((error, success) => {
  if (error) {
    console.log("Error verifying transporter:", error);
  } else {
    console.log("Server is ready to take our messages", success);
  }
});

// Token JWT Generator
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const userController = {
  // **Login User**
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const findUser = await User.findOne({ email });
      if (!findUser) {
        return ResponseAPI.error(res, "Wrong email or password", 401);
      }

      // Validasi apakah email sudah diverifikasi
      if (!findUser.verified) {
        return ResponseAPI.error(
          res,
          "Email hasn't been verified yet. Check your inbox.",
          403
        );
      }

      const isPasswordValid = await findUser.comparePassword(password);
      if (!isPasswordValid) {
        return ResponseAPI.error(res, "Wrong email or password", 401);
      }

      const token = generateToken(findUser._id);

      ResponseAPI.success(res, {
        token,
        user: {
          id: findUser._id,
          name: findUser.name,
          email: findUser.email,
          photo_url: findUser.photo_url,
        },
      });
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },

  // **Register User**
  async register(req, res) {
    try {
      const { name, email, password, phoneNumber } = req.body;

      // Cek apakah email sudah terdaftar
      const checkUser = await User.findOne({ email });
      if (checkUser) {
        return ResponseAPI.error(res, "This user already exists", 409);
      }

      // URL default foto profil
      const defaultPhotoUrl = "https://example.com/default-profile.png";

      // Buat user baru
      const newUser = await User.create({
        name,
        email,
        password,
        phoneNumber,
        photo_url: defaultPhotoUrl,
        joinAt: new Date(),
        verified: false, // Status diverifikasi awal
      });

      // Kirim email verifikasi
      await userController.sendVerificationEmail(newUser);

      ResponseAPI.success(res, {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          photo_url: newUser.photo_url,
        },
      });
    } catch (error) {
      console.error("Error in register:", error);
      ResponseAPI.serverError(res, error);
    }
  },

  // **Send Verification Email**
  async sendVerificationEmail({ _id, email }) {
    try {
      const currentUrl = "http://localhost:8080/api/v1/user";
      const uniqueString = uuidv4();

      // Simpan ke koleksi verifikasi
      await UserVerification.create({
        userId: _id,
        uniqueString: uniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 jam kedepan
      });

      const templatePath = path.join("src", "views", "template.html");
      const emailTemplate = fs.readFileSync(templatePath, "utf-8");
      const customizedTemplate = emailTemplate
        .replace("${currentUrl}", currentUrl)
        .replace("${uniqueString}", uniqueString);

      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Account Verification",
        html: customizedTemplate,
      };

      // Kirim email
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email.");
    }
  },

  async verifyEmail(req, res) {
    const { uniqueString } = req.params;

    try {
      const record = await UserVerification.findOne({ uniqueString });

      if (!record) {
        return res
          .status(404)
          .json({ message: "Verification link is invalid or expired." });
      }

      const { expiresAt, userId } = record;

      // Periksa apakah tautan sudah kadaluarsa
      if (Date.now() > expiresAt) {
        await UserVerification.deleteOne({ userId }); // Hapus record lama
        return res.status(400).json({
          message:
            "Verification link expired. Please request a new verification email.",
        });
      }
      const verifed = path.join(__dirname, "..", "views", "verified.html");
      // Update status pengguna menjadi "verified"
      await User.findByIdAndUpdate(userId, { verified: true });
      await UserVerification.deleteOne({ userId });
      res.status(200).sendFile(verifed);
      // res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  },

  // **Verified Page**
  async verified(req, res) {
    res.sendFile(path.join(__dirname, "../views/verified.html"));
  },

  async requestResetPassword(req, res) {
    const { email, redirectUrl } = req.body;

    if (!email || !redirectUrl) {
      return res
        .status(400)
        .json({ error: "Email and redirectUrl are required" });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const resetString = uuidv4();
      const hashedResetString = await bcrypt.hash(resetString, 12);

      console.log("Reset string yang dibuat:", resetString);
      console.log("Reset string yang di-hash:", hashedResetString);

      await PasswordReset.create({
        userId: user._id,
        resetString: hashedResetString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 jam
      });

      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Password Reset Request",
        html: `<p>Click the link below to reset your password:</p>
             <a href="${redirectUrl}?resetString=${resetString}">Reset Password</a>`,
      };

      console.log(
        "Reset URL dikirim:",
        `${redirectUrl}?resetString=${resetString}`
      );
      await transporter.sendMail(mailOptions);
      res
        .status(200)
        .json({ message: "Password reset email sent successfully" });
    } catch (error) {
      console.error("Error in requestResetPassword:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async verifyAndResetPassword(req, res) {
    const { email, resetString, newPassword } = req.body;
    if (!email || !resetString || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Cari user berdasarkan email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found" });

      // Cari record reset password terkait user
      const resetRecord = await PasswordReset.findOne({ userId: user._id });
      if (!resetRecord)
        return res.status(404).json({ error: "No reset record" });

      // Dapatkan data resetString dan expiredAt
      const { expiresAt, resetString: hashedResetString } = resetRecord;

      // Cek apakah resetString sudah expired
      if (Date.now() > expiresAt) {
        await PasswordReset.deleteOne({ userId: user._id });
        return res.status(400).json({ error: "Reset expired" });
      }

      // Bandingkan reset string dari request dengan yang ada di database
      const isMatch = await bcrypt.compare(resetString, hashedResetString);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid reset string" });

      // Hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password user
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedNewPassword } }
      );

      // Hapus semua record reset password terkait user
      await PasswordReset.deleteMany({ userId: user._id });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // **Get Profile**
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select("-password");
      ResponseAPI.success(res, user);
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },

  // **Update Profile**
  async updateProfile(req, res) {
    try {
      const { name, email, phoneNumber, photo_url, password } = req.body;

      const user = await User.findById(req.user._id).select("-password");

      if (password) {
        user.password = password;
      }
      if (name) {
        user.name = name;
      }
      if (email) {
        user.email = email;
      }
      if (photo_url) {
        user.photo_url = photo_url;
      }
      if (phoneNumber) {
        user.phoneNumber = phoneNumber;
      }

      await user.save();
      ResponseAPI.success(res, user);
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },
};

module.exports = userController;
