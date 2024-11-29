const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama Wajib Diisi"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email Wajib Diisi"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Mohon Masukkan Email Yang Valid",
      ],
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password Wajib Diisi"],
      minlength: [6, "Password Wajib Minimal 6 Karakter"],
    },
    nationalIdentityCard: {
      type: String,
      default: "",
    },
    photo_url: {
      type: String,
      default: "",
    },
    isKYC: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const phoneRegex = /^(?:\+62|62|0)8[1-9]\d{8,9}$/;

userSchema.pre("save", async function (next) {
  if (this.phoneNumber) {
    // Menghapus semua spasi
    this.phoneNumber = this.phoneNumber.replace(/\s+/g, "");

    // Mengganti awalan '0' dengan '+62' jika ada
    if (this.phoneNumber.startsWith("0")) {
      this.phoneNumber = "+62" + this.phoneNumber.substring(1);
    }

    // Validasi nomor telepon menggunakan regex
    if (!phoneRegex.test(this.phoneNumber)) {
      const error = new Error("Nomor telepon tidak valid");
      return next(error);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
