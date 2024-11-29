const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const Donation = require("../models/Donation");

const donationController = {
    // Create Donation
    async Create(req, res) {
        try {
            const { campaignId, amount, name, statusPayment } = req.body;

            const userId = req.user._id;

            // Validasi user yang membuat Donate
            const findUser = await User.findOne({ _id: userId, deletedAt: null });

            if (!findUser) {
                return ResponseAPI.error(res, "User Tidak Ditemukan", 404);
            }

            // Validasi campaign
            const findCampaign = await Campaign.findOne({ _id: campaignId, deletedAt: null});

            if (!findCampaign) {
                return ResponseAPI.error(res, "Campaign Tidak Ditemukan", 404);
            }

            // Membuat Donation Baru
            const newDonation = await Donation.create({ userId, campaignId, amount, name, statusPayment });

            ResponseAPI.success(res, newDonation);

        } catch (error) {
        ResponseAPI.serverError(res, error);
        }
    },

    // Read Donation by ID
    async ReadById(req, res) {
        try {
            const findDonation = await Donation.findOne({ _id: req.params._id, deletedAt: null});

            if (!findDonation) {
                return ResponseAPI.error(res, "Donasi Tidak Ditemukan", 404);
            }

        ResponseAPI.success(res, findDonation);
        } catch (error) {
        ResponseAPI.serverError(res, error);
        }
    },

    // Read All Donation
    async ReadByCampaignId(req, res) {
        try {
        const findDonation = await Donation.find({campaignId: req.params._id, deletedAt: null });

        console.log(req.params._id);
        if (findDonation.length === 0) {
            return ResponseAPI.error(res, "Donation Tidak Ditemukan", 404);
        }

        ResponseAPI.success(res, findDonation);
        } catch (error) {
        ResponseAPI.serverError(res, error);
        }
    },

    // Update Donation
    async Update(req, res) {
        try {
        const { campaignId, amount, name, statusPayment } = req.body;

        const userId = req.user._id;

        // Validasi user yang membuat Donation
        const findUser = await User.findOne({ _id: userId, deletedAt: null });

        if (!findUser) {
            return ResponseAPI.error(res, "User Tidak Ditemukan", 404);
        }

        // Validasi campaign
        if(campaignId){
            const findCampaign = await Campaign.findOne({ _id: campaignId, deletedAt: null });

            if (!findCampaign) {
            return ResponseAPI.error(res, "Campaign Tidak Ditemukan", 404);
            }
        }

        const findDonation = await Donation.findOne({ _id: req.params._id, deletedAt: null });

        if (!findDonation) {
            return ResponseAPI.error(res, "Donasi Tidak Ditemukan", 404);
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
