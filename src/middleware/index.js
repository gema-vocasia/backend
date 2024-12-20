const checkUser = require("./checkUser");
const checkCategory = require("./checkCategory");
const checkCampaign = require("./checkCampaign");
const { errorHandling } = require("./errorHandling");
const { auth, adminRegistration, notMandatoryAuth } = require("./auth");
module.exports = {
  checkUser,
  checkCategory,
  checkCampaign,
  errorHandling,
  auth,
  adminRegistration,
  notMandatoryAuth,
};
