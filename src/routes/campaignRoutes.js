const express = require("express");
const router = express.Router();
const { auth, checkCategory } = require("../middleware");
const { campaignController } = require("../controller");
const { upload } = require("../middleware/upload");

router.post( "/campaign", auth, checkCategory, upload.single("photo"), campaignController.Create ); // Untuk Membuat Campaign
router.post( "/campaign/upload/:_id", auth, upload.single("photo"), campaignController.Upload );
router.get("/campaigns", campaignController.Read); // Untuk Mendapatkan Semua Campaign
router.get("/campaign/:_id", campaignController.ReadById); // Untuk Mendapatkan Campaign Berdasarkan ID
router.get("/campaigns/user", auth, campaignController.ReadByUserId); // Untuk Mendapatkan Campaign Berdasarkan User ID
router.put("/campaign/:_id", auth, checkCategory, campaignController.Update); // Untuk Memperbarui Campaign
router.patch("/campaign/:_id/urgent/:newStatus", auth, checkCategory, campaignController.updateUrgentCampaign);
router.patch( "/campaign/:_id/status/:newStatus", auth, campaignController.updateStatusCampaign ); // Untuk Memperbarui Status Campaign
router.patch( "/campaign/:_id/transfer/:newStatus", auth, campaignController.updateStatusTransfer ); // Untuk Memperbarui Status Transfer
router.delete("/campaign/:_id", auth, campaignController.Delete); // Untuk Menghapus Campaign

module.exports = router;
