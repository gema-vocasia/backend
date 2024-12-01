const express = require("express");
const router = express.Router();
const { categoryController } = require("../controller");

router.post("/category", categoryController.createCategory);
router.get("/categories", categoryController.getAllCategories);
router.delete("/category/:id", categoryController.deleteCategory);

module.exports = router;
