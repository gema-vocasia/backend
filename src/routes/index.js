const express = require("express");
const routes = express.Router();
const testRoutes = require("./testRoutes");
const categoryRoutes = require("./categoryRoutes");

// List of routes
routes.use(testRoutes);
routes.use(categoryRoutes);

module.exports = routes;
