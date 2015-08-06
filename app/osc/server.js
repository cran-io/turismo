var osc = require('node-osc');
var Group = require('../models/group');
var Visitor = require('../models/visitor');
var utils = require('../utils');
var _ = require("lodash");
var path = require('path');

var InstallationMapping = require(path.join(__dirname, '../../', 'config/installation-mapping'));
var mapping = new InstallationMapping(path.join(__dirname, '../../', 'config/reader-installation-mapping.xml'));

var scheduleOnce = require('../scheduled-tasks/visitors-email-task').scheduleOnce;

var groupIdPlayground;
var groupIdDome;

module.exports = function(port) {
  var oscServer = new osc.Server(port, '0.0.0.0');

  oscServer.on("message", function(msg, rinfo) {
    console.log("TUIO message:");
    console.log(msg);
    console.log(rinfo)
  });

  oscServer.on("/videoMappingDone", function(msg, rinfo) {
    Visitor.assignGroup()
      .then(function(id) {
        groupIdPlayground = id;
        scheduleOnce(groupIdPlayground);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  oscServer.on("/videoClosureStarted", function (msg, rinfo) {
    groupIdDome = groupIdPlayground;
    groupIdPlayground = 0;
  });


  oscServer.on("/videoDomeStarted", function (msg, rinfo) {
    var client = new osc.Client(rinfo.address, 12000);
    client.send('/domeStarted', groupIdDome, function() {
      client.kill();
    });
  })

  console.log("OSC Server listening at port " + port);
};
