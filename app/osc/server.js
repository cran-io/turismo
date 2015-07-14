var osc = require('node-osc');
var Group = require('../models/group');
var Visitor = require('../models/visitor');
var utils = require('../utils');
var _ = require("lodash");

var groupId;

//TODO: Refactor me!
module.exports = function(port) {
  var oscServer = new osc.Server(port, '0.0.0.0');

  oscServer.on("message", function(msg, rinfo) {
    console.log("TUIO message:");
    console.log(msg);
    console.log(rinfo)
  });

  oscServer.on("/videoDomeDone", function(msg, rinfo) {
    Group.find()
      .sort({
        _id: -1
      })
      .limit(1)
      .exec(function(err, result) {
        if (err) next(err);
        var lastGroup = result[0];

        mailer.sendPhotos(lastGroup);
      });
  });

  oscServer.on("/videoMappingDone", function(msg, rinfo) {
    Visitor.assignGroup()
      .then(function(id) {
        groupId = id;
        utils.mapping()
          .then(function (installations) {
            var filteredInstallations = rejectRegistrationTotems(installations);

            filteredInstallations.forEach(function (installation) {
              var ipPortArray = anInstallation.split(":");
              var client = new osc.Client(ipPortArray[0], parseInt(ipPortArray[1]));
              client.send('/wakeUp', id, function() {
                client.kill();
              });
            });
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  oscServer.on("/videoClosureStarted", function (msg, rinfo) {
    utils.mapping()
      .then(function (installations) {
        var filteredInstallations = rejectRegistrationTotems(installations);

        filteredInstallations.forEach(function (installation) {
          var ipPortArray = anInstallation.split(":");
          var client = new osc.Client(ipPortArray[0], parseInt(ipPortArray[1]));
          client.send('/sleep', id, function() {
            client.kill();
          });
        });
      });
  });


  oscServer.on("/videoDomeStarted", function (msg, rinfo) {
    var client = new osc.Client(rinfo.address, 12000);
    client.send('/domeStarted', groupId, function() {
      client.kill();
    });
  })

  console.log("OSC Server listening at port " + port);
};

function rejectRegistrationTotems(installations) {
  return _(installations.qrReaders.qrReader)
    .reject(function (qrReader) {
      return qrReader.$.signupTotem === "true";
    })
    .map(function (elem) {
      return elem.installationAddress;
    }).value();
}