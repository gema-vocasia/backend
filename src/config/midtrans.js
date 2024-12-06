const midtransClient = require("midtrans-client");
const { midtransServerKey } = require("./env");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: midtransServerKey,
});

console.log("Midtrans Server Key:", midtransServerKey);

module.exports = snap;
