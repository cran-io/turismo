var osc = require('node-osc');

module.exports = function(port) {
  var oscServer = new osc.Server(port, '0.0.0.0');
  oscServer.on("message", function (msg, rinfo) {
        console.log("TUIO message:");
        console.log(msg);
        console.log(rinfo)
  });

  console.log("OSC Server started");
};
