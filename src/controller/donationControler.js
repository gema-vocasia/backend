const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const { errorName, errorMsg } = require("../utils/errorMiddlewareMsg");

const Campaign = require("../models/Campaign");
const User = require("../models/User");
const Donation = require("../models/Donation");

const donationController = {
    // Create Donation
    async Create(req, res) {
        try {
            const { campaignId, amount, name, statusPayment } = req.body;

            const userId = req.user._id;

            // Membuat Donation Baru
            const newDonation = await Donation.create({ userId, campaignId, amount, name, statusPayment });

            ResponseAPI.success(res, newDonation);

        } catch (error) {
            next(error);
        }
    },

    // Read Donation by ID
    async ReadById(req, res, next) {
        try {
            const findDonation = await Donation.findOne({ _id: req.params._id, deletedAt: null});

            if (!findDonation) {
                return next({
                    name: errorName.NOT_FOUND,
                    message: errorMsg.DONATION_NOT_FOUND,
                })
            }

        ResponseAPI.success(res, findDonation);
        } catch (error) {
            next(error);
        }
    },

    // Read Donation by UserId
    async ReadByUserId(req, res, next) {
    try {
        const userId = req.user._id;

        // Mencari semua donasi berdasarkan userId dan memastikan donasi aktif (deletedAt: null)
        const findDonationsByUser = await Donation.find({ userId: userId, deletedAt: null });

        if (findDonationsByUser.length === 0) {
        return next({
            name: errorName.NOT_FOUND,
            message: errorMsg.DONATION_NOT_FOUND,
        });
        }

        ResponseAPI.success(res, findDonationsByUser);

    } catch (error) {
        next(error);
    }
    },

    // Read All Donation
    async ReadByCampaignId(req, res, next) {
        try {
        const findDonation = await Donation.find({campaignId: req.params._id, deletedAt: null });

        console.log(req.params._id);
        if (findDonation.length === 0) {
            return next({
                name: errorName.NOT_FOUND,
                message: errorMsg.DONATION_NOT_FOUND,
            })
        }

        ResponseAPI.success(res, findDonation);
        } catch (error) {
            next(error);
        }
    },

    // Update Donation
    async Update(req, res) {
        try {
        const { campaignId, amount, name, statusPayment } = req.body;

        const findDonation = await Donation.findOne({ _id: req.params._id, deletedAt: null });

        if (!findDonation) {
            return next({
                name: errorName.NOT_FOUND,
                message: errorMsg.DONATION_NOT_FOUND,
            })
        }

        // Update properti jika ada
        if (campaignId) findDonation.campaignId = campaignId;
        if (amount) findDonation.amount = amount;
        if (name) findDonation.name = name;
        if (statusPayment) findDonation.statusPayment = statusPayment;

        await findDonation.save();

        ResponseAPI.success(res, findDonation);
        } catch (error) {
        ResponseAPI.serverError(res, error);
        }
    },

    // Soft Delete Donation
    async Delete(req, res) {
        try {
        const findDonation = await Donation.findOneAndUpdate(
            { _id: req.params._id, deletedAt: null },
            { deletedAt: new Date() },
            { new: true }
        );

        if (!findDonation) {
            return ResponseAPI.error(res, "Donasi Tidak Ditemukan", 404);
        }

        ResponseAPI.success(res, findDonation);
        } catch (error) {
        ResponseAPI.serverError(res, error);
        }
    },
};

module.exports = donationController;
