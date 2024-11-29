const mongoose = require("mongoose");
const Category = require("../models/Category");
const ResponseAPI = require("../utils/response");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validasi input
    if (!title || !description) {
      return ResponseAPI.error(res, "Title and description are required", 400);
    }

    // Buat kategori baru
    const category = new Category({
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
    });

    await category.save(); // Simpan ke database
    return ResponseAPI.success(
      res,
      { category },
      "Category created successfully",
      201
    );
  } catch (error) {
    console.error("Error creating category:", error); // Debug log
    return ResponseAPI.serverError(res, error);
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false }); // Ambil data kategori yang tidak dihapus
    return ResponseAPI.success(res, { categories }, "Categories retrieved");
  } catch (error) {
    console.error("Error fetching categories:", error); // Debug log
    return ResponseAPI.serverError(res, error);
  }
};

// Soft delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Perbarui isDeleted dan deletedAt
    const category = await Category.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true } // Return kategori yang diperbarui
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
    console.error("Error deleting category:", error); // Debug log
    return ResponseAPI.serverError(res, error);
  }
};
