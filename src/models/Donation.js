const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    snapToken: {
      type: String,
    },
    snapRedirectUrl: {
      type: String,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: [true, "Order Number Wajib Diisi"],
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
    },
    campaignId: {
      type: mongoose.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Jumlah Donasi Wajib Diisi"],
    },
    comment: {
      type: String,
      default: null,
      maxLength: [255, "Komentar Tidak Boleh Lebih Dari 255 Karakter"],
    },
    donateDate: {
      type: Date,
      default: Date.now(),
    },
    name: {
      type: String,
      required: [true, "Nama Wajib Diisi"],
      trim: true,
    },
    statusPayment: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    isDone: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Donation = mongoose.model("Donation", donationSchema);
module.exports = Donation;
