const testController = {
  async healthCheck (req, res){
  res.status(200).json({
    ping: "pong !",
  });
  }
};

module.exports = testController;
