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
      minlength: 11,
    },
    password: {
      type: String,
      required: [true, "password is required."],
      minlength: [6, "password must be at least 6 characters long."],
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
    this.phoneNumber = this.phoneNumber.replace(/\s+/g, "");

    if (this.phoneNumber.startsWith("0")) {
      this.phoneNumber = "+62" + this.phoneNumber.substring(1);
    }

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
