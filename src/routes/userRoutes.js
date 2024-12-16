const express = require("express");
const userRoutes = express.Router();
const { auth, adminRegistration } = require("../middleware");
const { userController } = require("../controller");
const { upload } = require("../middleware/upload");

userRoutes.post("/user/login", userController.login);
userRoutes.post("/user/register", userController.register);
userRoutes.post("/admin/register", adminRegistration, userController.register);
userRoutes.post(
  "/user/upload",
  auth,
  upload.single("nationalIdentityCard"),
  userController.Upload
);
userRoutes.get("/user/profile", auth, userController.getProfile);
userRoutes.put(
  "/user/profile",
  auth,
  upload.single("profilePhoto"),
  userController.updateProfile
);
userRoutes.get("/user/verify/:uniqueString", userController.verifyEmail);
userRoutes.get("/user/verifed", auth, userController.verified);
userRoutes.patch("/user/kyc/:_id", auth, userController.updateKYC);
userRoutes.post(
  "/user/requestResetPassword",
  userController.requestResetPassword
);
userRoutes.post("/user/verifyreset", userController.verifyAndResetPassword);

module.exports = userRoutes;
