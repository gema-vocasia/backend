const jwt = require("jsonwebtoken");
const ResponseAPI = require("../utils/response");
const User = require("../models/User");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { errorMsg, errorName } = require("../utils/errorMiddlewareMsg");

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const userController = {
  // Login User
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const findUser = await User.findOne({ email });

      if (!findUser) {
        return next({
          name: errorName.UNAUTHORIZED,
          message: errorMsg.WRONG_CREDENTIALS,
        });
      }

      const isPasswordValid = await findUser.comparePassword(password);

      if (!isPasswordValid) {
        return next({
          name: errorName.UNAUTHORIZED,
          message: errorMsg.WRONG_CREDENTIALS,
        });
      }

      const token = generateToken(findUser._id);

      ResponseAPI.success(res, {
        token,
        user: {
          id: findUser._id,
          name: findUser.name,
          email: findUser.email,
          photo_url: findUser.photo_url,
          nationalIdentityCard: findUser.nationalIdentityCard,
          phoneNumber: findUser.phoneNumber,
          isKYC: findUser.isKYC,
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // User register
  async register(req, res, next) {
    try {
      const { name, email, password, phoneNumber } = req.body;
      
      const findUser = await User.findOne({ email });

      if (findUser) {
        return next({
          name: errorName.CONFLICT,
          message: errorMsg.USER_ALREADY_EXISTS,
        });
      }

      const newUser = await User.create({
        name,
        email,
        password,
        phoneNumber
      });

      ResponseAPI.success(res, {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // User Profile
  async getProfile(req, res, next) {
    try {

      const user = await User.findById(req.user._id).select("-password");

      ResponseAPI.success(res, user);
    } catch (error) {

      next(error);
    }
  },

  // Update User
  async updateProfile(req, res, next) {
    try {
      
      const { name, email, phoneNumber, photo_url, nationalIdentityCard, isKYC, password } = req.body;

      const findUser = await User.findById(req.user._id).select("-password");

      if (req.body.password) findUser.password = password;
      if (name) findUser.name = name;
      if (email) findUser.email = email;
      if (photo_url) findUser.photo_url = photo_url;
      if (nationalIdentityCard) findUser.nationalIdentityCard = nationalIdentityCard;
      if (isKYC) findUser.isKYC = isKYC;
      if (phoneNumber) findUser.phoneNumber = phoneNumber;

      await findUser.save();

      ResponseAPI.success(res, findUser);
    } catch (error) {

      next(error);
    }
  },
};

module.exports = userController;
