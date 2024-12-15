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
router.delete("/campaign/:_id", auth, campaignController.Delete);
router.post(
  "/campaign/upload/:_id",
  auth,
  upload.single("photo"),
  campaignController.Upload
);
router.patch(
  "/campaign/:id/statusCampaign/:newStatus",
  auth,
  campaignController.updateStatusCampaign
);

router.patch(
  "/campaign/:id/statusTransfer/:newStatus",
  auth,
  campaignController.updateStatusTransfer
);

module.exports = router;
