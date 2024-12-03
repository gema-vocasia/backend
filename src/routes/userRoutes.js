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
userRoutes.post(
  "/user/requestResetPassword",
  userController.requestResetPassword
);
userRoutes.post(
  "/user/verifyreset",
  (req, res, next) => {
    console.log("Request diterima di route /verifyreset"); // Menambahkan log untuk memastikan route diterima
    console.log("Body request:", req.body); // Melihat data body yang dikirim
    next(); // Lanjutkan ke controller
  },
  userController.verifyAndResetPassword
);

module.exports = userRoutes;
