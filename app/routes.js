var mongoose = require('mongoose');
var utils = require('./utils');
var osc = require('node-osc');
var _ = require('lodash');
var path = require('path');
// Models
var Visitor = require('./models/visitor');

var MAPPING_FILE_DIR = path.join(__dirname, '../', 'config/reader-installation-mapping.xml');
var mappingPromise = utils.parseXmlFile(MAPPING_FILE_DIR);

module.exports = function(app) {
  /**
  * Signup form:
  *   - Name
  *   - Age
  *   - Email
  *   - Preference Zone
  *  - QR Code
  **/
  app.post('/signup', function(req, res, next) {
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
  app.post('/checkin', function(req, res) {
    var checkin = req.body;

    Visitor.findByQrCode(checkin.qrCode).
      then(function(visitor) {
        if(!visitor) res.status(404).send('Visitor not found');

        mappingPromise.
          then(function(mapping) {
            var installations = installationsFrom(mapping, checkin.qrReaderId);

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


  function installationsFrom(result, qrReaderId) {
    return _.chain(result.qrReaders.qrReader).
                select(function(element) {
                  return element.$.id == qrReaderId;
                }).
                first().
                value().installationAddress;
  }
}
