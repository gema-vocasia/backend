const errorName = {
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  CONFLICT: "CONFLICT",
};

const errorMsg = {
  USER_NOT_FOUND: "User Not Found",
  WRONG_CREDENTIALS: "Wrong Email or Password",
  NOT_VERIFIED: "User Not Verified",
  USER_ALREADY_EXISTS: "User Already Exists",
  TITLE_DESCRIPTION_REQUIRED: "Title and Description are Required",
  CATEGORY_NOT_FOUND: "Category Not Found",
  CAMPAIGN_NOT_FOUND: "Campaign Not Found",
  DONATION_NOT_FOUND: "Donation Not Found",
  KYC_NOT_FOUND: "KYC Not Found",
  VERIFICATION_LINK_EXPIRED: "Verification Link invalid Or Expired",
  INVALID_URGENT_STATUS: "Invalid urgent status",
};

module.exports = { errorName, errorMsg };
