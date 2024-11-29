const express = require("express");
const routes = express.Router();
const testRoutes = require("./testRoutes");
const userRoutes = require("./userRoutes");
const categoryRoutes = require("./categoryRoutes");
const campaignRoutes = require("./campaignRoutes");

// List of routes
routes.use(testRoutes);
routes.use(userRoutes);
routes.use(categoryRoutes);
routes.use(campaignRoutes);


module.exports = routes;
