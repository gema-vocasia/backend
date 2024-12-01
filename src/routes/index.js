const express = require("express");
const routes = express.Router();
const testRoutes = require("./testRoutes");
const userRoutes = require("./userRoutes");
const categoryRoutes = require("./categoryRoutes");
const campaignRoutes = require("./campaignRoutes");
const donationRoutes = require("./donationRoutes");
const  { errorHandling } = require("../middleware");

// List of routes
routes.use(testRoutes);
routes.use(userRoutes);
routes.use(categoryRoutes);
routes.use(campaignRoutes);
routes.use(donationRoutes);
routes.use(errorHandling);


module.exports = routes;
