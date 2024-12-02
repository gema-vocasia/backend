const express = require("express");
const userRoutes = express.Router();
const { auth } = require("../middleware");
const { userController } = require("../controller");
const { upload } = require("../middleware/upload");

userRoutes.post("/user/login", userController.login);
userRoutes.post("/user/register", userController.register);
userRoutes.post("/user/upload", auth, upload.single("nationalIdentityCard"), userController.Upload);
userRoutes.get("/user/profile", auth, userController.getProfile);
userRoutes.put("/user/profile", auth, userController.updateProfile);
userRoutes.get("/user/verify/:uniqueString", userController.verifyEmail);
userRoutes.get("/user/verifed", auth, userController.verified);

module.exports = userRoutes;
