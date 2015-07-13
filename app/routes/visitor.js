 var express = require('express');
 var path = require('path');
 var utils = require('../utils');
 var _ = require('lodash');
 var osc = require('node-osc');

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
       if (err) next(err);

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

     console.log("Checkin received from: ", checkin.qrReaderId);
     console.log("QRCode: ", checkin.qrCode);

     mappingPromise
       .then(function(mapping) {
         var installations = installationsFrom(mapping, checkin.qrReaderId);

         installations.installationAddress.forEach(function(anInstallation) {
           var ipPortArray = anInstallation.split(":");
           var client = new osc.Client(ipPortArray[0], parseInt(ipPortArray[1]));

           if (installations.$.signupTotem) {
             console.log("Sending OSC message to: ", anInstallation);
             client.send('/QRTag', checkin.qrCode, function() {
               client.kill();
             });
           } else {
             Visitor.findByQrCode(checkin.qrCode)
               .then(function(visitor) {
                 if (!visitor) res.status(404).send('Visitor not found');

                 console.log("Sending OSC message to: ", anInstallation);
                 client.send('/QRTag', checkin.qrReaderId, visitor._id, visitor.groupId,
                   visitor.name, visitor.email, visitor.age, visitor.preferenceRegion,
                   function() {

                     client.kill();
                   });
               });
           }

           res.status(200);
           res.send();
         });
       });
   });

   app.use("/visitor", router);

   function installationsFrom(result, qrReaderId) {
     return _.select(result.qrReaders.qrReader, function(element) {
       return element.$.id == qrReaderId;
     })[0];
   }

 };
