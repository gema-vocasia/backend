const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");
const ResponseAPI = require("../utils/response");
const ROLES = require("../utils/roles");
const { adminRegist } = require("../config/env");
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return ResponseAPI.unauthorized(res, "Authentication required");
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return ResponseAPI.unauthorized(res, "User not found");
    }

    if (user.role !== ROLES.ADMIN) {
      return ResponseAPI.forbidden(
        res,
        "Hanya admin yang dapat mengakses endpoint ini"
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return ResponseAPI.unauthorized(res, "Invalid token");
  }
};

const adminRegistration = (req, res, next) => {
  // Cek apakah ada token admin registrasi atau kode khusus
  const adminRegistrationKey = req.body.adminRegistrationKey;

  if (!adminRegistrationKey || adminRegistrationKey !== adminRegist) {
    return ResponseAPI.forbidden(
      res,
      "Anda tidak memiliki izin untuk mendaftar sebagai admin"
    );
  }

  req.body.role = ROLES.ADMIN;
  next();
};

module.exports = { auth, adminRegistration };
