const express = require("express");
const routes = express.Router();
const testRoutes = require("./testRoutes");
const userRoutes = require("./userRoutes");

//  List of routes
routes.use(testRoutes);
routes.use(userRoutes);

module.exports = routes;