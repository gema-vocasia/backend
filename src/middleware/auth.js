const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");
const ResponseAPI = require("../utils/response");

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

    req.user = user;
    next();
  } catch (error) {
    return ResponseAPI.unauthorized(res, "Invalid token");
  }
};

module.exports = auth;
