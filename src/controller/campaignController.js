const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const Category = require("../models/Category");
const { errorName, errorMsg } = require("../utils/errorMiddlewareMsg");

const campaignController = {
  // Create Campaign
  async Create(req, res, next) {
    try {
      const { title, description, photo, startDate, endDate, targetAmount, categoryId } = req.body;

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
      const findCampaignsByUser = await Campaign.find({ userId: userId, deletedAt: null });

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
      const findCampaign = await Campaign.findOne({ _id: req.params._id, deletedAt: null });

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        })
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  // Read All Campaign
  async Read(req, res, next) {
    try {
      const findCampaign = await Campaign.find({ deletedAt: null }); // Hanya campaign aktif

      if (findCampaign.length === 0) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        })
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },

  // Update Campaign
  async Update(req, res, next) {
    try {
      const { title, description, photo, startDate, endDate, targetAmount, categoryId } = req.body;

      // Validasi campaign
      const findCampaign = await Campaign.findOne({ _id: req.params._id, deletedAt: null });

      if (!findCampaign) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CAMPAIGN_NOT_FOUND,
        })
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
        })
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = campaignController;
