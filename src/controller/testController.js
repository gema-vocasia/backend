const testController = {};

testController.healthCheck = (req, res) => {
  res.status(200).json({
    ping: "pong !",
  });
};

module.exports = testController;
