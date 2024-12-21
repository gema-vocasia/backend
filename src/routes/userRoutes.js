const express = require("express");
const userRoutes = express.Router();
const { auth, adminRegistration } = require("../middleware");
const { userController } = require("../controller");
const { upload } = require("../middleware/upload");

userRoutes.post("/user/login", userController.login); // Untuk Login
userRoutes.post("/user/register", userController.register); // Untuk Register
userRoutes.post("/admin/register", adminRegistration, userController.register); // Untuk Register Admin
userRoutes.post(
  "/user/upload",
  auth,
  upload.single("nationalIdentityCard"),
  userController.Upload
); // Untuk Upload KTP
userRoutes.get("/user/profile", auth, userController.getProfile); // Untuk Mendapatkan Profile
userRoutes.put(
  "/user/profile",
  auth,
  upload.single("profilePhoto"),
  userController.updateProfile
); // Untuk Memperbarui Foto Profile
userRoutes.get("/admin/users", auth, userController.ReadByAdmin); // Untuk Mendapatkan Semua User
userRoutes.delete(
  "/user/profile/photo",
  auth,
  userController.deleteProfilePhoto
); // Untuk Menghapus Foto Profile
userRoutes.get("/user/verify/:uniqueString", userController.verifyEmail); // Untuk Memverifikasi Email
userRoutes.get("/user/verifed", auth, userController.verified); // Untuk Mendapatkan Halaman Verified
userRoutes.patch("/user/kyc/:_id", auth, userController.updateKYC); // Untuk Memverifikasi KTP
userRoutes.post(
  "/user/requestResetPassword",
  userController.requestResetPassword
); // Untuk Meminta Reset Password
userRoutes.post("/user/verifyreset", userController.verifyAndResetPassword); // Untuk Memverifikasi Reset Password
//Khusus admin
userRoutes.put("/admin/update/user/:_id", auth, userController.UpdateByAdmin); // Untuk Membuat User

module.exports = userRoutes;
