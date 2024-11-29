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
            enum: ["Pending", "Complete", "failed"],
            default: "Pending",
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
