const express = require("express");
const cors = require("cors");
const connectDB = require("./config/Koneksi");
const { port, NgrokClient } = require("./config/env");
const routes = require("./routes");
const morgan = require("morgan");
const ngrok = require("ngrok");

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Koneksi ke database
connectDB();

// Routing
app.use("/api/v1", routes);

// Menjalankan server dan menghubungkan ke Ngrok
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  // try {
  //   // Autentikasi menggunakan auth token Ngrok
  //   if (NgrokClient) {
  //     await ngrok.authtoken(NgrokClient);
  //   }

  //   // Buat URL publik dengan Ngrok
  //   const url = await ngrok.connect(port);
  //   console.log(`Ngrok is running at: ${url}`);
  // } catch (err) {
  //   console.error("Failed to connect Ngrok:", err);
  // }
});
