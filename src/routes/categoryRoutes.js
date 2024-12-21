const express = require("express");
const router = express.Router();
const { categoryController } = require("../controller");

router.post("/category", categoryController.createCategory);
router.get("/categories", categoryController.getAllCategories);
router.get("/category/:id", categoryController.getCategoryById);
router.put("/category/edit/:id", categoryController.editCategory);
router.delete("/category/:id", categoryController.deleteCategory);

module.exports = router;
