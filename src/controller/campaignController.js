const mongoose = require("mongoose");
const ResponseAPI = require("../utils/response");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const Category = require("../models/Category");

const campaignController = {
  // Create Campaign
  async Create(req, res) {
    try {
      const { title, description, photo, startDate, endDate, targetAmount, categoryId } = req.body;
      const userId = req.user._id;

      // Validasi user yang membuat campaign
      const findUser = await User.findOne({_id: userId, deletedAt: null});

      if (!findUser) {
        return ResponseAPI.error(res, "User Tidak Ditemukan", 404);
      }

      // Validasi kategori
      const findCategory = await Category.findOne({_id: categoryId, deletedAt: null});

      if (!findCategory) {
        return ResponseAPI.error(res, "Category Tidak Ditemukan", 404);
      }

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
      ResponseAPI.serverError(res, error);
    }
  },

  // Read Campaign by ID
  async ReadById(req, res) {
    try {
      const findCampaign = await Campaign.findOne({ _id: req.params._id, deletedAt: null });

      if (!findCampaign) {
        return ResponseAPI.error(res, "Campaign Tidak Ditemukan", 404);
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },

  // Read All Campaign
  async Read(req, res) {
    try {
      const findCampaign = await Campaign.find({ deletedAt: null }); // Hanya campaign aktif

      if (findCampaign.length === 0) {
        return ResponseAPI.error(res, "Campaign Tidak Ditemukan", 404);
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },

  // Update Campaign
  async Update(req, res) {
    try {
        const { title, description, photo, startDate, endDate, targetAmount,categoryId } = req.body;

        const userId = req.user._id;

        // Validasi user yang membuat campaign
        const findUser = await User.findOne({ _id: userId, deletedAt: null });

        if (!findUser) {
            return ResponseAPI.error(res, "User Tidak Ditemukan", 404);
        }

      const findCampaign = await Campaign.findOne({ _id: req.params._id, deletedAt: null });

      if (!findCampaign) {
        return ResponseAPI.error(res, "Campaign Tidak Ditemukan", 404);
      }

      // Update properti jika ada
      if (title) findCampaign.title = title;
      if (description) findCampaign.description = description;
      if (photo) findCampaign.photo = photo;
      if (startDate) findCampaign.startDate = startDate;
      if (endDate) findCampaign.endDate = endDate;
      if (targetAmount) findCampaign.targetAmount = targetAmount;

      // Validasi kategori
        if(categoryId){
            const findCategory = await Category.findOne({ _id: categoryId, deletedAt: null });
            
            if (!findCategory) {
                return ResponseAPI.error(res, "Category Tidak Ditemukan", 404);
            }

            findCampaign.categoryId = categoryId;
        }

      await findCampaign.save();

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },

  // Soft Delete Campaign
  async Delete(req, res) {
    try {
      const findCampaign = await Campaign.findOneAndUpdate(
        { _id: req.params._id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true }
      );

      if (!findCampaign) {
        return ResponseAPI.error(res, "Campaign Tidak Ditemukan", 404);
      }

      ResponseAPI.success(res, findCampaign);
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },
};

module.exports = campaignController;
