const express = require("express");
const router = express.Router();
const { auth, checkCategory } = require("../middleware");
const { campaignController } = require("../controller");
const { upload } = require("../middleware/upload");

router.post("/campaign", auth, checkCategory, campaignController.Create);
router.get("/campaigns", campaignController.Read);
router.get("/campaign/:_id", campaignController.ReadById);
router.get("/campaigns/user", auth, campaignController.ReadByUserId);
router.put("/campaign/:_id", auth, checkCategory, campaignController.Update);
router.put("/campaign/status/:_id", auth, campaignController.updateStatusCampaign);
router.delete("/campaign/:_id", auth, campaignController.Delete);
router.post("/campaign/upload/:_id", auth, upload.single("photo"), campaignController.Upload);

module.exports = router;