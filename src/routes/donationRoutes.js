const express = require("express");
const router = express.Router();
const { donationController } = require("../controller");
const { auth, checkCampaign } = require("../middleware");

router.post("/donation", auth, checkCampaign, donationController.Create);
router.get("/donations/user", auth, donationController.ReadByUserId);
router.post("/notification", donationController.donationNotification);
router.get("/donations/:_id", donationController.ReadByCampaignId);
router.get("/donation/:_id", donationController.ReadById);
router.put("/donation/:_id", checkCampaign, donationController.Update);
router.delete("/donation/:_id", donationController.Delete);

module.exports = router;
