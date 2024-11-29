const jwt = require("jsonwebtoken");
const ResponseAPI = require("../utils/response");
const User = require("../models/User");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const userController = {
  // Login User
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const findUser = await User.findOne({ email });
      if (!findUser) {
        return ResponseAPI.error(res, "wrong email and password", 401);
      }

      const isPasswordValid = await findUser.comparePassword(password);
      if (!isPasswordValid) {
        return ResponseAPI.error(res, "wrong email and password", 401);
      }

      const token = generateToken(findUser._id);

      ResponseAPI.success(res, {
        token,
        findUser: {
          id: findUser._id,
          name: findUser.name,
          email: findUser.email,
          photo_url: findUser.photo_url,
        },
      });
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },

  // User register
  async register(req, res) {
    try {
      const { name, email, password, phoneNumber, photo_url } = req.body;

      const checkUser = await User.findOne({ email });

      if (checkUser) {
        return ResponseAPI.error(res, "this user already exists", 409);
      }

      const defaultPhotoUrl = "https://example.com/default-profile.png";

      const newUser = await User.create({
        name,
        email,
        password,
        phoneNumber,
        photo_url: defaultPhotoUrl,
        password,
      });

      ResponseAPI.success(res, {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          photo_url: newUser.photo_url,
          password: newUser.password,
        },
      });
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },

  // User Profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select("-password");
      ResponseAPI.success(res, user);
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },

  // Update User
  async updateProfile(req, res) {
    try {
      const {
        name,
        email,
        phoneNumber,
        photo_url,
        nationalIdentityCard,
        isKYC,
        password,
      } = req.body;

      const user = await User.findById(req.user._id).select("-password");

      if (req.body.password) {
        user.password = password;
      }

      if (name) {
        user.name = name;
      }

      if (email) {
        user.email = email;
      }

      if (photo_url) {
        user.photo_url = photo_url;
      }

      if (nationalIdentityCard) {
        user.nationalIdentityCard = nationalIdentityCard;
      }

      if (isKYC) {
        user.isKYC = isKYC;
      }

      if (phoneNumber) {
        user.phoneNumber = phoneNumber;
      }

      await user.save();

      ResponseAPI.success(res, user);
    } catch (error) {
      ResponseAPI.serverError(res, error);
    }
  },
};

module.exports = userController;
