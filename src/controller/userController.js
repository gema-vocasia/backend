const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const ResponseAPI = require("../utils/response");
const User = require("../models/User");
const UserVerification = require("../models/UserVerification");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

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
      const uniqueString = `${uuidv4()}_${_id}`;

      // Hash string unik
      const hashedUniqueString = await bcrypt.hash(uniqueString, 10);

      // Simpan ke koleksi verifikasi
      await UserVerification.create({
        userId: _id,
        uniqueString: uniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });

      // Opsi email
      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Account Verification",
        html: `
        <p>Hi there,</p>
        <p>Click the link below to verify your email:</p>
        <a href="${currentUrl}/verify/${uniqueString}">Verify Email</a>
        <p>This link expires in 1 hour.</p>
      `,
      };

      // Kirim email
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email.");
    }
  },

  // **Verify Email**
  async verifyEmail(req, res) {
    const { uniqueString } = req.params;

    try {
      // Cari record berdasarkan userId
      const record = await UserVerification.findOne({ uniqueString });

      if (!record) {
        return res
          .status(404)
          .json({ message: "Verification link is invalid or expired." });
      }

      const { expiresAt, uniqueString: hashedUniqueString, userId } = record;

      // Periksa apakah tautan sudah kadaluarsa
      if (Date.now() > expiresAt) {
        await UserVerification.deleteOne({ userId }); // Hapus record lama
        return res.status(400).json({
          message: "Verification link expired. Please register again.",
        });
      }

      // Bandingkan uniqueString dengan hash
      const isMatch = await bcrypt.compare(uniqueString, hashedUniqueString);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Invalid verification details." });
      }

      // Update status pengguna menjadi "verified"
      await User.findByIdAndUpdate(userId, { verified: true });
      await UserVerification.deleteOne({ userId }); // Hapus record setelah verifikasi

      res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Internal Server Error." });
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
