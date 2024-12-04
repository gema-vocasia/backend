const { errorMsg, errorName } = require("../utils/errorMiddlewareMsg");
const { Campaign } = require("../models");
const roles = require("../utils/roles");

checkCampaign = async (req, res, next) => {
  try {
    if (!req.body.campaignId) {
      return next();
    }

    // Cek Apakah Campaign Ada
    const checkCampaign = await Campaign.findOne({
      _id: req.body.campaignId,
      deleteAt: null,
    });

    // Jika Campaign Tidak Ada
    if (!checkCampaign) {
      return next({
        name: errorName.NOT_FOUND,
        message: errorMsg.CAMPAIGN_NOT_FOUND,
      });
    }

    if(checkCampaign.userId !== req.user._id && req.user.role !== roles.ADMIN) {
      return next({
        name: errorName.UNAUTHORIZED,
        message: errorMsg.NOT_HAVE_PERMISSION,
      });
    }

    // Jika Campaign Ada Maka Lanjut
    next();
  } catch (error) {
    
    next(error);
  }
};

module.exports = checkCampaign;
