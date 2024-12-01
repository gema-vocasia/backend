const express = require("express");
const routes = express.Router();
const testRoutes = require("./testRoutes");
const userRoutes = require("./userRoutes");
const categoryRoutes = require("./categoryRoutes");
const passwordResetRoutes = require("./passwordReset");

// List of routes
routes.use(passwordResetRoutes);
routes.use(testRoutes);
routes.use(userRoutes);
routes.use(categoryRoutes);

module.exports = routes;
