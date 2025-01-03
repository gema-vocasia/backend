const express = require("express");
const router = express.Router();
const { auth, checkCategory } = require("../middleware");
const { campaignController } = require("../controller");
const { upload } = require("../middleware/upload");

router.post( "/campaign", auth, checkCategory, upload.single("photo"), campaignController.Create ); // Untuk Membuat Campaign
router.post("/campaign/upload/:_id", auth, upload.single("photo"), campaignController.Upload );
router.get("/campaigns", campaignController.Read); // Untuk Mendapatkan Semua Campaign
router.get("/campaign/:_id", campaignController.ReadById); // Untuk Mendapatkan Campaign Berdasarkan ID
router.get("/campaigns/user", auth, campaignController.ReadByUserId); // Untuk Mendapatkan Campaign Berdasarkan User ID
router.get("/campaigns/admin", campaignController.ReadByAdmin);
router.put("/campaign/:_id", auth, checkCategory, campaignController.Update);
router.delete("/campaign/:_id", auth, campaignController.Delete);
router.patch( "/campaign/:_id/status/:newStatus", auth, campaignController.updateStatusCampaign ); // Untuk Memperbarui Status Campaign
router.patch( "/campaign/:_id/transfer/:newStatus", auth, campaignController.updateStatusTransfer ); // Untuk Memperbarui Status Transfer
router.patch( "/campaign/:_id/urgent/:newStatus", auth,campaignController.updateUrgentCampaign );

// Khusus Admin
router.get("/admin/campaigns", auth, campaignController.ReadByAdmin);
router.patch("/admin/campaign/:_id", auth, upload.single("photo"), campaignController.UpdateByAdmin); // Untuk Memperbarui Campaign


module.exports = router;
