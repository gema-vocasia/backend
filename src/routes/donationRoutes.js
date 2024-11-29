const express = require("express");
const router = express.Router();
const donationController = require("../controller/donationControler");
const auth = require("../middleware/auth");

router.post("/donation", auth, donationController.Create);
router.get("/donations/:_id", donationController.ReadByCampaignId);
router.get("/donation/:_id", donationController.ReadById);
router.put("/donation/:_id", auth, donationController.Update);
router.delete("/donation/:_id", auth, donationController.Delete);

module.exports = router;
