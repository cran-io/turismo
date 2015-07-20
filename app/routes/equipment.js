var express = require('express');
var path = require('path');
var ping = require('ping');
var Q = require('q');
var InstallationMapping = require(path.join(__dirname, '../../', 'config/installation-mapping'));

module.exports = function(app){
  var router = express.Router();

  var installationMapping = new InstallationMapping(path.join(__dirname, '../../', 'config/reader-installation-mapping.xml'));

  router.get("/ping", function (req, res, next) {
    installationMapping.findAllEquipment()
      .then(function (equipment) {
        var responsePromises = [];

        equipment.forEach(function (anEquipment) {
          responsePromises.push( ping.promise.probe(anEquipment.ip) );
        });

        return Q.all(responsePromises);
      })
      .then(function (responses) {
        res.status(200).send(responses);
      });
  });

  app.use("/equipment", router);
}
