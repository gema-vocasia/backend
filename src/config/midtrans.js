const midtransClient = require("midtrans-client");
const { midtransServerKey } = require("./env");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: midtransServerKey,
});

module.exports = snap;
