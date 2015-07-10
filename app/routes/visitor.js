 var express = require('express');
 var path = require('path');
 var utils = require('../utils');
 var _ = require('lodash');

 // Models
 var Visitor = require('../models/visitor');

 var MAPPING_FILE_DIR = path.join(__dirname, '../../', 'config/reader-installation-mapping.xml');
 var mappingPromise = utils.parseXmlFile(MAPPING_FILE_DIR);

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
    newVisitor.save(function(err) {
      if(err) next(err);

      res.status(200);
      res.send();
    });
  });

  /**
  * Checking en lector qr:
  *   - qrReaderId
  *   - qrCode
  **/
  router.post('/checkin', function(req, res) {
    var checkin = req.body;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("checkin received from: " + ip);

    Visitor.findByQrCode(checkin.qrCode).
      then(function(visitor) {
        if(!visitor) res.status(404).send('Visitor not found');

        mappingPromise.
          then(function(mapping) {
            var installations = installationsFrom(mapping, ip);

            installations.forEach(function(anInstallation) {
              var ipPortArray = anInstallation.split(":");
              var client = new osc.Client(ipPortArray[0], parseInt(ipPortArray[1]));

              client.send('/QRTag', parseInt(checkin.qrReaderId), visitor.visitorId, visitor.name, visitor.email, visitor.age, visitor.preferenceRegion,
              function () {
                client.kill();
                res.status(200);
                res.send();
              });
            });
          });
      }).
      catch(function(err) {
        next(err);
      });
  });

  app.use("/visitor", router);

  function installationsFrom(result, qrReaderId) {
    return Object.keys(result.qrReaders.qrReader).
                filter(function(element) {
                  return element.$.id == qrReaderId;
                })[0].installationAddress;
  }

};
