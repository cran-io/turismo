var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var utils = require('./utils');
var osc = require('node-osc');
var _ = require('lodash');
var async = require('async');
// Models
var User = require('./models/user');

var app = express();
app.use(bodyParser.json());

var db = mongoose.connect('mongodb://localhost/sensorium');
var MAPPING_FILE_DIR = __dirname + '/config/reader-installation-mapping.xml';

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
      res.send(JSON.stringify(err.errors));
    }
  });
});

/**
* Checking en lector qr:
*   - qrReaderId
*   - qrCode
**/
app.post('/checkin', function(req, res) {
  var checkin = req.body;

  async.waterfall([
    function(callback) {
      User.findOne({ 'qrCode': checkin.qrCode }).sort({ createdAt: -1 }).
      exec(function(err, user) {
        if(err) callback(err, null);
        callback(null, user);
      });
    },
    function(user, callback) {
      console.log(JSON.stringify(user));
      utils.parseXmlFile(MAPPING_FILE_DIR, function(err, result) {
        if(err) callback(err, null);

        var installations = installationsFrom(result, checkin.qrReaderId);

        installations.forEach(function(anInstallation) {
          var ipPortArray = anInstallation.split(":");
          var client = new osc.Client(ipPortArray[0], parseInt(ipPortArray[1]));

          client.send('/QRTag', 200, function () {
            client.kill();
          });
        });

      });
    }
  ]);
});

function installationsFrom(result, qrReaderId) {
  return _.chain(result.qrReaders.qrReader)
  .select(function(element) {
    return element.$.id == qrReaderId;
  }).first()
  .value().installationAddress;
}

app.listen(3000);
