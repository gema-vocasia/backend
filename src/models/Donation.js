const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
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
            type: Number, // 0 = Pending, 1 = Success, 2 = Failed, 3 = Cancel
            enum: [0,1,2,3],
            default: 0,
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
