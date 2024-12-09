const Midtrans = require("midtrans-client");
const { NgrokClient } = require("ngrok");

require("dotenv").config();

module.exports = {
  port: process.env.PORT || 8080,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
  NgrokClient: process.env.NGROK_AUTH_TOKEN,
};
require("dotenv").config();
