const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { reset } = require("nodemon");
const ROLES = require("../utils/roles");
const { adminRegist } = require("../config/env");

const ResponseAPI = require("../utils/response");
const { User, UserVerification, PasswordReset } = require("../models");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { errorMsg, errorName } = require("../utils/errorMiddlewareMsg");

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
  // Login User
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const findUser = await User.findOne({ email });

      if (!findUser) {
        return next({
          name: errorName.UNAUTHORIZED,
          message: errorMsg.WRONG_CREDENTIALS,
        });
      }

      if (!findUser.verified) {
        return next({
          name: errorName.UNAUTHORIZED,
          message: errorMsg.NOT_VERIFIED,
        });
      }

      const isPasswordValid = await findUser.comparePassword(password);

      if (!isPasswordValid) {
        return next({
          name: errorName.UNAUTHORIZED,
          message: errorMsg.WRONG_CREDENTIALS,
        });
      }

      const token = generateToken(findUser._id);

      ResponseAPI.success(res, {
        token,
        user: {
          id: findUser._id,
          name: findUser.name,
          email: findUser.email,
          photo_url: findUser.photo_url,
          nationalIdentityCard: findUser.nationalIdentityCard,
          phoneNumber: findUser.phoneNumber,
          isKYC: findUser.isKYC,
          verified: findUser.verified,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // **Register User**
  async register(req, res, next) {
    try {
      const { name, email, password, phoneNumber, adminRegistrationKey } =
        req.body;
      const isAdminRegistration = adminRegistrationKey === adminRegist;
      const role = isAdminRegistration ? ROLES.ADMIN : ROLES.USER;

      const findUser = await User.findOne({ email });

      if (findUser) {
        return next({
          name: errorName.CONFLICT,
          message: errorMsg.USER_ALREADY_EXISTS,
        });
      }

      const newUser = await User.create({
        name,
        email,
        password,
        phoneNumber,
        joinAt: new Date(),
        verified: isAdminRegistration,
        role,
      });

      if (!isAdminRegistration) {
        await userController.sendVerificationEmail(newUser);
      }

      ResponseAPI.success(res, {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

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

  async verifyEmail(req, res, next) {
    const { uniqueString } = req.params;

    try {
      const record = await UserVerification.findOne({ uniqueString });

      if (!record) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.VERIFICATION_LINK_EXPIRED,
        });
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
      next(error);
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

      // Hapus reset record lama
      await PasswordReset.deleteMany({ userId: user._id });

      const resetString = uuidv4();
      const hashedResetString = await bcrypt.hash(resetString, 12);

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
        html: `<p>Klik link di bawah untuk mereset password:</p>
           <a href="${redirectUrl}?resetString=${resetString}&email=${email}">Reset Password</a>
           <p>Link ini akan kedaluwarsa dalam 1 jam.</p>`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({
        message: "Password reset email sent successfully",
        resetString, // Opsional: untuk debugging
      });
    } catch (error) {
      console.error("Error in requestResetPassword:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async verifyAndResetPassword(req, res) {
    const { email, resetString, newPassword } = req.body;

    console.log("Debug - Received Data:", {
      email,
      resetString,
      resetStringLength: resetString.length,
    });

    if (!email || !resetString || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const resetRecord = await PasswordReset.findOne({
        userId: user._id,
        expiresAt: { $gt: Date.now() }, // Pastikan belum expire
      });

      if (!resetRecord) {
        return res.status(404).json({ error: "No valid reset record found" });
      }

      // Verifikasi reset string
      const isMatch = await bcrypt.compare(
        resetString,
        resetRecord.resetString
      );

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid reset string" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedNewPassword } }
      );

      // Hapus reset record
      await PasswordReset.deleteOne({ _id: resetRecord._id });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Complete Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  // **Get Profile**
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select("-password");
      ResponseAPI.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  // User Profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select("-password");

      ResponseAPI.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  // Update User
  async updateProfile(req, res, next) {
    try {
      const {
        name,
        email,
        phoneNumber,
        nationalIdentityCard,
        isKYC,
        password,
      } = req.body;
      const findUser = await User.findById(req.user._id).select("-password");
      const oldFilePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "upload",
        findUser.photo_url
      );

      if (req.body.password) findUser.password = password;
      if (name) findUser.name = name;
      if (email) findUser.email = email;
      if (nationalIdentityCard)
        findUser.nationalIdentityCard = nationalIdentityCard;
      if (isKYC) findUser.isKYC = isKYC;
      if (phoneNumber) findUser.phoneNumber = phoneNumber;
      if (req.file?.filename) {
        findUser.photo_url = req.file.filename;
        fs.unlink(oldFilePath, (err) => {
          if (err) console.log(err);
          else {
            console.log(`\nDeleted file: ${oldFilePath.photo}`);
          }
        });
      }

      await findUser.save();

      ResponseAPI.success(res, findUser);
    } catch (error) {
      next(error);
    }
  },

  async Upload(req, res, next) {
    try {
      // Cek apakah campaign ada dan belum dihapus
      const checkOldFile = await User.findOne({
        _id: req.user._id,
        deleteAt: null,
      });

      // Jika ada file lama, hapus file tersebut
      if (checkOldFile && checkOldFile.nationalIdentityCard) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "upload",
          checkOldFile.nationalIdentityCard
        );
        console.log("Path yang dibentuk:", oldFilePath);

        // Menggunakan fs.promises.unlink untuk menghapus file dengan menangani error
        fs.unlink(oldFilePath, (err) => {
          if (err) console.log(err);
          else {
            console.log(`\nDeleted file: ${checkOldFile.photo}`);
          }
        });
      }
      // Update User dengan foto baru
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id, deleteAt: null },
        { nationalIdentityCard: req.file.filename, updateAt: new Date() },
        { new: true }
      );

      if (!updatedUser) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.USER_NOT_FOUND,
        });
      }

      // Kirim respons sukses setelah update
      return ResponseAPI.success(res, updatedUser); // Pastikan return di sini
    } catch (error) {
      // Tangani error secara umum
      console.error(error);
      next(error);
    }
  },

  async updateKYC(req, res, next) {
    try {
      if (req.user.role !== "ADMIN")
        return next({
          name: errorName.UNAUTHORIZED,
          message: errorMsg.UNAUTHORIZED,
        });

      const user = await User.findById(req.params._id).select("-password");
      user.isKYC = true;
      await user.save();
      ResponseAPI.success(res, user);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
