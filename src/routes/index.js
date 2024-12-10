const express = require("express");
const routes = express.Router();
const testRoutes = require("./testRoutes");
const userRoutes = require("./userRoutes");
const categoryRoutes = require("./categoryRoutes");
const campaignRoutes = require("./campaignRoutes");
const donationRoutes = require("./donationRoutes");
const  { errorHandling } = require("../middleware");
const passwordResetRoutes = require("./passwordReset");
const fileRoutes = require("./fileRoutes");

// List of routes
routes.use(passwordResetRoutes);
routes.use(testRoutes);
routes.use(userRoutes);
routes.use(categoryRoutes);
routes.use(campaignRoutes);
routes.use(donationRoutes);
routes.use(errorHandling);
routes.use(fileRoutes);

routes.all("*", (req, res) => {
  res.status(404).send("Page not found");
});

module.exports = routes;
