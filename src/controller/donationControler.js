const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const { errorName, errorMsg } = require("../utils/errorMiddlewareMsg");
const { Donation } = require("../models");
const { v4: uuidv4 } = require("uuid");
const snap = require("../config/midtrans");
const env = require("../config/env");
const crypto = require("crypto");

const donationController = {
  async validateSignatureKey(signaturekey, orderId, statusCode, grossAmount) {
    //gabungkan data
    const data = `${orderId}${statusCode}${grossAmount}${env.MidtransServerKey}`;

    //hash dengan sha512
    const hash = crypto.createHash("sha512").update(data).digest("hex");
    return signaturekey === hash;
  },
  // Create Donation
  async Create(req, res, next) {
    try {
      const { campaignId, amount, name, comment } = req.body;
      const PRICE = amount || 10000;
      const orderNumber = `TRX-${uuidv4()}`;

      let parameter = {
        transaction_details: {
          order_id: orderNumber,
          gross_amount: PRICE,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: req.user.name || "User",
          email: req.user.email || "User@examaple.com",
        },
      };

      const { token, redirect_url } = await snap.createTransaction(parameter);

      const newDonation = await Donation.create({
        userId: req.user._id,
        campaignId: campaignId,
        orderNumber,
        snapToken: token,
        snapRedirectUrl: redirect_url,
        amount: amount,
        name: name,
        statusPayment: "Pending",
        comment: comment,
      });

      ResponseAPI.success(res, newDonation);
    } catch (error) {
      next(error);
    }
  },

  async orderNotification(req, res, next) {
    try {
      const {
        signature_key,
        order_id,
        status_code,
        transaction_status,
        gross_amount,
      } = req.body;

      const isValid = donationController.validateSignatureKey(
        signature_key,
        order_id,
        status_code,
        gross_amount
      );

      if (!isValid) {
        return ResponseAPI.serverError(res, "Invalid signature key");
      }
      const Order = await Order.findOne({
        orderNumber: order_id,
      });

      if (!Order) {
        return ResponseAPI.error(res, "Order not found", 404);
      }

      if (Order.status == "Success" || Order.status == "Failed") {
        return ResponseAPI.success(res);
      }

      //cek action berikutnya
      if (
        transaction_status == "capture" ||
        transaction_status == "settlement"
      ) {
        //kurang transaction
        Order.status = "Success";
        await Order.save();
        await Donation.create({
          userId: Order.userId,
          isDone: true,
          campaignId: Order.campaignId,
          comment: Order.comment,
        });
      }

      if (
        transaction_status == "cancel" ||
        transaction_status == "deny" ||
        transaction_status == "expire"
      ) {
        // TODO set transaction status on your database to 'failure'
        // and response with 200 OK
        Order.status = "Failed";
        await Order.save();
      }

      return ResponseAPI.success(res);
    } catch (error) {
      next(error);
    }
  },

  // Read Donation by ID
  async ReadById(req, res, next) {
    try {
      const findDonation = await Donation.findOne({
        _id: req.params._id,
        deletedAt: null,
      });

      if (!findDonation) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.DONATION_NOT_FOUND,
        });
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
      const findDonationsByUser = await Donation.find({
        userId: userId,
        deletedAt: null,
      });

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
      const findDonation = await Donation.find({
        campaignId: req.params._id,
        deletedAt: null,
      });

      console.log(req.params._id);
      if (findDonation.length === 0) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.DONATION_NOT_FOUND,
        });
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

      const findDonation = await Donation.findOne({
        _id: req.params._id,
        deletedAt: null,
      });

      if (!findDonation) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.DONATION_NOT_FOUND,
        });
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
