const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const { Campaign, Donation } = require("../models");
const { errorName, errorMsg } = require("../utils/errorMiddlewareMsg");
const path = require("path");
const fs = require("fs");

const updateTotalDonation = async (campaignId) => {
  const donations = await Donation.find({ campaignId, deletedAt: null });

  let totalDonation = 0;
  donations.forEach((donation) => {
    if (donation.isDone === true) {
      totalDonation += donation.amount;
    }
  });

  await Campaign.findOneAndUpdate({ _id: campaignId }, { totalDonation });
};

const updateAllCampaignDonations = async (campaigns) => {
  const updatePromises = campaigns.map((campaign) =>
    updateTotalDonation(campaign._id)
  );
  await Promise.all(updatePromises);
};

const campaignController = {
  // Create Campaign
  async Create(req, res, next) {
    try {
      const {
        title,
        description,
        photo,
        startDate,
        endDate,
        targetAmount,
        categoryId,
      } = req.body;

      const userId = req.user._id;

      // Membuat campaign baru
      const newCampaign = await Campaign.create({
        userId,
        categoryId,
        title,
        description,
        photo,
        startDate,
        endDate,
        targetAmount,
      });

      ResponseAPI.success(res, newCampaign);
    } catch (error) {
      next(error);
    }
  },

  // Get Campaign by User ID
  async ReadByUserId(req, res, next) {
    try {
      const userId = req.user._id;

      // Mencari campaign berdasarkan userId dan memastikan campaign aktif (deletedAt: null)
      const findCampaignsByUser = await Campaign.find({
        userId: userId,
        deletedAt: null,
      });

      // Update total donation untuk semua campaign yang ditemukan
      await updateAllCampaignDonations(findCampaignsByUser);

      if (findCampaignsByUser.length === 0) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      ResponseAPI.success(res, findCampaignsByUser);
    } catch (error) {
      next(error);
    }
  },

  // Read Campaign by ID
  async ReadById(req, res, next) {
    try {
      const campaignId = req.params._id;

      // Update total donation untuk campaign yang diminta
      await updateTotalDonation(campaignId);

      const findCampaign = await Campaign.findOne({
        _id: campaignId,
        deletedAt: null,
      }).populate("userId", "name");

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  // Read All Campaign
  async Read(req, res, next) {
    try {
      const findCampaign = await Campaign.find({ deletedAt: null })
        .populate("userId", "name")
        .populate("categoryId", "title"); // Hanya campaign aktif

      // Update total donation untuk semua campaign yang ditemukan
      await updateAllCampaignDonations(findCampaign);

      if (findCampaign.length === 0) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  async Upload(req, res, next) {
    try {
      // Cek apakah campaign ada dan belum dihapus
      const checkOldFile = await Campaign.findOne({
        _id: req.params._id,
        deleteAt: null,
      });

      // Jika ada file lama, hapus file tersebut
      if (checkOldFile && checkOldFile.photo) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "upload",
          checkOldFile.photo
        );
        console.log("Path yang dibentuk:", oldFilePath);

        // Menggunakan fs.promises.unlink untuk menghapus file dengan menangani error
        fs.unlink(oldFilePath, (err) => {
          if (err) console.log(err);
          else {
            console.log("\nDeleted file: example_file.txt");
          }
        });
      }

      // Update campaign dengan foto baru
      const updatedCampaign = await Campaign.findOneAndUpdate(
        { _id: req.params._id, deleteAt: null },
        { photo: req.file.filename, updateAt: new Date() },
        { new: true }
      );

      // Jika campaign tidak ditemukan
      if (!updatedCampaign) {
        return next({
          name: "NotFoundError",
          message: "Campaign tidak ditemukan",
        });
      }

      // Kirim respons sukses setelah update
      return ResponseAPI.success(res, updatedCampaign); // Pastikan return di sini
    } catch (error) {
      // Tangani error secara umum
      console.error(error);
      next(error);
    }
  },

  // Update Campaign
  async Update(req, res, next) {
    try {
      const {
        title,
        description,
        photo,
        startDate,
        endDate,
        targetAmount,
        categoryId,
      } = req.body;

      // Validasi campaign
      const findCampaign = await Campaign.findOne({
        _id: req.params._id,
        deletedAt: null,
      });

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      // Update properti jika ada
      if (title) findCampaign.title = title;
      if (description) findCampaign.description = description;
      if (photo) findCampaign.photo = photo;
      if (startDate) findCampaign.startDate = startDate;
      if (endDate) findCampaign.endDate = endDate;
      if (targetAmount) findCampaign.targetAmount = targetAmount;
      if (categoryId) findCampaign.categoryId = categoryId;

      await findCampaign.save();

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  // Soft Delete Campaign
  async Delete(req, res, next) {
    try {
      const findCampaign = await Campaign.findOneAndUpdate(
        { _id: req.params._id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        });
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = campaignController;
