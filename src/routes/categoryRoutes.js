const express = require("express");
const router = express.Router();
const { categoryController } = require("../controller");

router.post("/category", categoryController.create);
router.get("/categories", categoryController.getAll);
router.get("/category/:id", categoryController.readById);
router.put("/category/:id", categoryController.update);
router.delete("/category/:id", categoryController.delete);

module.exports = router;
