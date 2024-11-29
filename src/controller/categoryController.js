const mongoose = require("mongoose");
const Category = require("../models/Category");
const ResponseAPI = require("../utils/response");

const categoryController = {
  createCategory: async (req, res) => {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return ResponseAPI.error(
          res,
          "Title and description are required",
          400
        );
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
      return ResponseAPI.serverError(res, error);
    }
  },

  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find({ isDeleted: false });
      return ResponseAPI.success(res, { categories }, "Categories retrieved");
    } catch (error) {
      console.error("Error fetching categories:", error);
      return ResponseAPI.serverError(res, error);
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );

      if (!category) {
        return ResponseAPI.notFound(res, "Category not found");
      }

      return ResponseAPI.success(
        res,
        { category },
        "Category deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      return ResponseAPI.serverError(res, error);
    }
  },
};

module.exports = categoryController;
