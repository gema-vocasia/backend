const express = require("express");
const path = require("path");
const router = express.Router();

// Menyajikan file gambar dari folder 'public/upload'
router.use("/files", express.static(path.join(__dirname, "../../public/upload")));

module.exports = router;
