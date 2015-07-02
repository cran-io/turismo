var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var utils = require('./utils');
var osc = require('node-osc');
var _ = require('lodash');
var Q = require('q');
// Models
var User = require('./models/user');

var app = express();
app.use(bodyParser.json());

var db = mongoose.connect('mongodb://localhost/sensorium');
var MAPPING_FILE_DIR = __dirname + '/config/reader-installation-mapping.xml';

var mappingPromise = utils.parseXmlFile(MAPPING_FILE_DIR);
/**
* Signup form:
*   - Name
*   - Age
*   - Email
*   - Preference Zone
*  - QR Code
**/
app.post('/signup', function(req, res) {
  var newUser = new User(req.body);
  newUser.save(function(err) {
    if(err){
      res.status(500);
      if(err.errors.email){
        res.send(err.errors.email.message);
      }
    }

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

  User.findByQrCode(checkin.qrCode).
    then(function(user) {
      mappingPromise.
        then(function(mapping) {
          var installations = installationsFrom(mapping, checkin.qrReaderId);

          installations.forEach(function(anInstallation) {
            var ipPortArray = anInstallation.split(":");
            var client = new osc.Client(ipPortArray[0], parseInt(ipPortArray[1]));

            client.send('/QRTag', parseInt(checkin.qrReaderId), user.userId, user.name, user.email, user.age, user.preferenceRegion,
            function () {
              client.kill();
              res.status(200);
              res.send();
            });
          });
        });
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

app.listen(3000);
