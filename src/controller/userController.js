const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const ResponseAPI = require("../utils/response");
const User = require("../models/User");
const UserVerification = require("../models/UserVerification");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { errorMsg, errorName } = require("../utils/errorMiddlewareMsg");
const fs = require("fs");

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
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // **Register User**
  async register(req, res, next) {
    try {
      const { name, email, password, phoneNumber } = req.body;

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
        verified: false, // Status diverifikasi awal
        phoneNumber,
      });

      // Kirim email verifikasi
      await userController.sendVerificationEmail(newUser);

      ResponseAPI.success(res, {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
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

  async verifyEmail(req, res) {
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
        photo_url,
        nationalIdentityCard,
        isKYC,
        password,
      } = req.body;

      const findUser = await User.findById(req.user._id).select("-password");

      if (req.body.password) findUser.password = password;
      if (name) findUser.name = name;
      if (email) findUser.email = email;
      if (photo_url) findUser.photo_url = photo_url;
      if (nationalIdentityCard)
        findUser.nationalIdentityCard = nationalIdentityCard;
      if (isKYC) findUser.isKYC = isKYC;
      if (phoneNumber) findUser.phoneNumber = phoneNumber;

      await findUser.save();

      ResponseAPI.success(res, findUser);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
