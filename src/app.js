const express = require("express");
const cors = require("cors");
const connectDB = require("./config/Koneksi");
const { port } = require("./config/env");
const routes = require("./routes");
const morgan = require("morgan");
const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/v1',routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
