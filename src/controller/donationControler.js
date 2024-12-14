const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const { errorName, errorMsg } = require("../utils/errorMiddlewareMsg");
const { Donation } = require("../models");
const { v4: uuidv4 } = require("uuid");
const snap = require("../config/midtrans");
const env = require("../config/env");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const donationController = {
  async validateSignatureKey(signaturekey, orderId, statusCode, grossAmount) {
    //gabungkan data
    const data = `${orderId}${statusCode}${grossAmount}${env.midtransServerKey}`;

    //hash dengan sha512
    const hash = crypto.createHash("sha512").update(data).digest("hex");
    return signaturekey === hash;
  },
  // Create Donation
  async Create(req, res, next) {
    try {
      const { amount, name, comment } = req.body;
      const { _id: campaignId } = req.params;
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
        isDone: false,
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

  async sendDonationNotificationEmail({ email, orderNumber, status }) {
    try {
      // Buat transporter untuk pengiriman email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASS,
        },
      });

      // URL aplikasi
      const currentUrl = process.env.APP_URL || "http://localhost:8080";

      // Baca template email dari file
      const templatePath = path.join("src", "views", "donationTemplate.html");
      const emailTemplate = fs.readFileSync(templatePath, "utf-8");

      // Cari data donasi dan populate data user
      const donation = await Donation.findOne({
        orderNumber: orderNumber,
      }).populate("userId");

      // Validasi data donasi
      if (!donation) {
        throw new Error("Donasi tidak ditemukan dengan nomor pesanan ini.");
      }
      if (!donation.userId) {
        throw new Error("Pengguna tidak ditemukan untuk donasi ini.");
      }

      const username = donation.userId.name; // Nama user
      const amount = donation.amount; // Jumlah donasi

      // Kustomisasi template
      const customizedTemplate = emailTemplate
        .replace("${orderNumber}", orderNumber)
        .replace("${status}", status)
        .replace("${amount}", amount)
        .replace("${name}", username)
        .replace("${currentUrl}", currentUrl);

      // Konfigurasi email
      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: `Donation ${status}`,
        html: customizedTemplate,
      };

      // Kirim email
      await transporter.sendMail(mailOptions);
      console.log(
        `Donation notification sent to ${email} for order ${orderNumber}`
      );
    } catch (error) {
      console.error("Error sending donation notification email:", error);
      throw new Error("Failed to send donation notification email.");
    }
  },

  async donationNotification(req, res, next) {
    try {
      const {
        signature_key,
        order_id,
        status_code,
        transaction_status,
        gross_amount,
      } = req.body;

      const isValid = await donationController.validateSignatureKey(
        signature_key,
        order_id,
        status_code,
        gross_amount
      );

      if (!isValid) {
        return ResponseAPI.serverError(res, "Invalid signature key");
      }

      const donation = await Donation.findOne({
        orderNumber: order_id,
      }).populate("userId");

      if (!donation) {
        return ResponseAPI.error(res, "Order not found", 404);
      }

      const userEmail = donation.userId.email;

      if (
        donation.statusPayment == "Success" ||
        donation.statusPayment == "Failed"
      ) {
        return ResponseAPI.success(res);
      }

      if (
        transaction_status === "capture" ||
        transaction_status === "settlement"
      ) {
        donation.statusPayment = "Success";
        donation.isDone = true;

        // Send success notification email
        await donationController.sendDonationNotificationEmail({
          email: userEmail,
          orderNumber: order_id,
          status: "Success",
        });
      }
      if (
        transaction_status === "cancel" ||
        transaction_status === "deny" ||
        transaction_status === "expire"
      ) {
        donation.statusPayment = "Failed";

        await donationController.sendDonationNotificationEmail({
          email: userEmail,
          orderNumber: order_id,
          status: "Failed",
        });
      }

      await donation.save();

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

      const findDonationsByUser = await Donation.find({
        userId: userId,
        deletedAt: null,
      })
        .populate("userId", "name")
        .populate("campaignId", "title photo");

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
      }).populate("userId", "name photo_url");

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
