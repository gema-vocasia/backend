const express = require("express");
const routes = express.Router();
const testRoutes = require("./testRoutes");

// List of routes
routes.use(testRoutes);

module.exports = routes;