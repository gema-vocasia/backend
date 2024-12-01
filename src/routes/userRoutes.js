const express = require("express");
const userRoutes = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controller/userController");

userRoutes.post("/user/login", userController.login);
userRoutes.post("/user/register", userController.register);
userRoutes.get("/user/profile", auth, userController.getProfile);
userRoutes.put("/user/profile", auth, userController.updateProfile);
userRoutes.get("/user/verify/:uniqueString", userController.verifyEmail);
userRoutes.get("/user/verifed", auth, userController.verified);

module.exports = userRoutes;
