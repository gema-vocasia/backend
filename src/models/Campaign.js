const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        categoryId: {
            type: mongoose.Types.ObjectId,
            ref: "Category",
            required: true
        },
        title: {
            type: String,
            required: [true, "Judul Wajib Diisi"],
            trim: true,
        },
        photo: {
            type: String,
            default: null,
        },
        description: {
            type: String,
            required: [true, "Deskripsi Wajib Diisi"],
            minlength: [30, "Deskripsi Wajib Minimal 6 Karakter"],
        },
        statusCampaign: {
            type: Number, // 0 = On Going, 1 = Verified, 2 = Done
            enum: [0,1,2],
            default: 0
        },
        targetAmount: {
            type: Number,
            default: 10000,
        },
        totalDonation: {
            type: Number,
            default: 0,
        },
        startDate: {
            type: Date,
            default: Date.now(),
        },
        endDate: {
            type: Date,
            default: Date.now()+30*24*60*60*1000,
        },
        statusTransfer: {
            type: String,
            enum: ["On Request", "On Progress", "Success"],
            default: "On Request",
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

const Campaign = mongoose.model("Campaign", userSchema);
module.exports = Campaign;
