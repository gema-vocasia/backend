const mongoose = require("mongoose");
const { mongodbUri } = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbUri);
    console.log("MongoDB Sukses Terhubung");
  } catch (error) {
    console.error("MongoDB Koneksi Gagal:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
