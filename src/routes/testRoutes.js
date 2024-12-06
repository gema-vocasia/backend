const express = require("express");
const { testController } = require("../controller");

const testRoutes = express.Router();

testRoutes.get("/test/health", testController.healthCheck);

module.exports = testRoutes;
