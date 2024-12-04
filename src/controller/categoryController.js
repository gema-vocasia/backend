const mongoose = require("mongoose");
const { Category } = require("../models");
const ResponseAPI = require("../utils/response");
const { errorName, errorMsg } = require("../utils/errorMiddlewareMsg");


const categoryController = {
  create: async (req, res, next) => {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return next({
          name: errorName.BAD_REQUEST,
          message: errorMsg.TITLE_DESCRIPTION_REQUIRED,
        });
      }

      const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        title,
        description,
      });

      await category.save();
      return ResponseAPI.success(
        res,
        { category },
        "Category created successfully",
        201
      );
    } catch (error) {

      next(error)
    }
  },

  readById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id); 

      if (!category) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CATEGORY_NOT_FOUND,
        })
      }

      return ResponseAPI.success(res, { category }, "Category retrieved");
    } catch (error) {
      console.error("Error fetching category:", error);
      next(error)
    }
  },

  getAll: async (req, res, next) => {
    try {
      const categories = await Category.find({ isDeleted: false });
      return ResponseAPI.success(res, { categories }, "Categories retrieved");

    } catch (error) {
      console.error("Error fetching categories:", error);
      next(error)
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      const category = await Category.findByIdAndUpdate(
        id,
        { title, description },
        { new: true }
      );

      if (!category) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CATEGORY_NOT_FOUND,
        })
      }

      return ResponseAPI.success(
        res,
        { category },
        "Category updated successfully"
      );
    } catch (error) { 

      next(error)
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const category = await Category.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );

      if (!category) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CATEGORY_NOT_FOUND,
        })
      }

      return ResponseAPI.success(
        res,
        { category },
        "Category deleted successfully"
      );

      
    } catch (error) {
      
      next(error)
    }
  },
};

module.exports = categoryController;
