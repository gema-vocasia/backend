const express = require("express");
const router = express.Router();
const campaignController = require("../controller/campaignController");
const auth = require("../middleware/auth");

router.post("/campaign", auth, campaignController.Create);
router.get("/campaigns", campaignController.Read);
router.get("/campaign/:_id", campaignController.ReadById);
router.put("/campaign/:_id", auth, campaignController.Update);
router.delete("/campaign/:_id", auth, campaignController.Delete);

module.exports = router;