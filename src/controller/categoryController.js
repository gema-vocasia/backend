const mongoose = require("mongoose");
const Category = require("../models/Category");
const ResponseAPI = require("../utils/response");
const { errorName, errorMsg } = require("../utils/errorMiddlewareMsg");

const categoryController = {
  createCategory: async (req, res, next) => {
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
      console.error("Error creating category:", error);
      next(error);
    }
  },

  getAllCategories: async (req, res, next) => {
    try {
      const categories = await Category.find({ isDeleted: false });
      return ResponseAPI.success(res, { categories }, "Categories retrieved");
    } catch (error) {
      console.error("Error fetching categories:", error);
      next(error);
    }
  },

  getCategoryById: async (req, res, next) => {
    try {
      const findCategory = await Category.findOne({ _id: req.params.id }); // Perbaikan di sini
      if (!findCategory) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CATEGORY_NOT_FOUND,
        });
      }
      ResponseAPI.success(res, findCategory);
    } catch (error) {
      console.error("Error fetching categories:", error);
      next(error);
    }
  },

  editCategory: async (req, res, next) => {
    try {
      const { id } = req.params; // Ambil ID dari parameter URL
      const { title, description } = req.body; // Ambil data yang akan diperbarui

      if (!title || !description) {
        return next({
          name: errorName.BAD_REQUEST,
          message: errorMsg.TITLE_DESCRIPTION_REQUIRED,
        });
      }

      const category = await Category.findByIdAndUpdate(
        id,
        { title, description },
        { new: true, runValidators: true }
      );

      if (!category) {
        return next({
          name: errorName.NOT_FOUND,
          message: errorMsg.CATEGORY_NOT_FOUND,
        });
      }

      return ResponseAPI.success(
        res,
        { category },
        "Category updated successfully"
      );
    } catch (error) {
      console.error("Error updating category:", error);
      next(error);
    }
  },

  deleteCategory: async (req, res, next) => {
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
        });
      }

      return ResponseAPI.success(
        res,
        { category },
        "Category deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      next(error);
    }
  },
};

module.exports = categoryController;
