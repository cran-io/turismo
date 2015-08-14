var express = require('express');
var path = require('path');
var utils = require('../utils');
var _ = require('lodash');
var osc = require('node-osc');
var InstallationMapping = require(path.join(__dirname, '../../', 'config/installation-mapping'));

// Models
var Visitor = require('../models/visitor');
var Statistic = require('../models/statistic')

var MAPPING_FILE_DIR = path.join(__dirname, '../../', 'config/reader-installation-mapping.xml');

var installationMapping = new InstallationMapping(MAPPING_FILE_DIR);

module.exports = function(app) {

  var router = express.Router();

  /**
  * Signup form:
  *   - Name
  *   - Age
  *   - Email
  *   - Preference Zone
  *  - QR Code
  **/
  router.post('/signup', function(req, res, next) {
    var newVisitor = new Visitor(req.body);

    newVisitor.save(function(err, visitor) {
      if (err) return next(err);

      res.status(200);
      res.send({
        visitorId: visitor._id
      });
    });
  });

  /**
  * Checking en lector qr:
  *   - qrReaderId
  *   - qrCode
  **/
  router.post('/checkin', function(req, res) {
    var checkin = req.body;

    console.log("Checkin received from: ", checkin.qrReaderId);
    console.log("QRCode: ", checkin.qrCode);

    if (!checkin.qrReaderId || !checkin.qrCode) {
      return res.status(422).send("Missing params");
    }

    installationMapping.findByReaderIP(checkin.qrReaderId)
      .then(function (installation) {
        var client = new osc.Client(installation.ip, installation.port);

        console.log(JSON.stringify(installation));

        if(installation.isTotem){
          console.log("Sending OSC message to: ", installation);
          client.send('/QRTag', checkin.qrCode, function() {
            client.kill();
          });
        } else {
          Visitor.findByQrCode(checkin.qrCode)
            .then(function(visitor) {
              if (!visitor) return res.status(404).send('Visitor not found');

              var groupId = visitor.groupId || 0;
              var readerId = parseInt(checkin.qrReaderId.split(".")[3])%10;
              console.log("ReaderId: ", readerId);
              console.log("Sending OSC message to: ", installation);
              client.send('/QRTag', readerId, visitor._id, groupId,
                visitor.name, visitor.email, visitor.age, visitor.preferenceRegion,
                function() {
                  var statistic = new Statistic({
                    installation: installation.name,
                    visitor: visitor._id
                  })
                  statistic.save();
                  client.kill();
              });
            });
        }

        res.status(200).send();
      });
  });

  app.use("/visitor", router);
};
