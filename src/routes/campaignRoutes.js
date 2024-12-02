const express = require("express");
const router = express.Router();
const { auth, checkCategory } = require("../middleware");
const { campaignController } = require("../controller");

router.post("/campaign", auth, checkCategory, campaignController.Create);
router.get("/campaigns", campaignController.Read);
router.get("/campaign/:_id", campaignController.ReadById);
router.get("/campaigns/user", auth, campaignController.ReadByUserId);
router.put("/campaign/:_id", auth, checkCategory, campaignController.Update);
router.delete("/campaign/:_id", auth, campaignController.Delete);

module.exports = router;