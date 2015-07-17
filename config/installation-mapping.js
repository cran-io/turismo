var fs = require('fs');
var xmlParser = require('xml2js').Parser();
var Q = require('q');
var _ = require('lodash');

var InstallationMapping = function (filePath) {
  this.xmlFilePromise = readXml(filePath);
}

InstallationMapping.prototype.findByReaderIP = function (ip) {
  return this.xmlFilePromise.then(function (parsedXml) {
    var matchingInstallation;

    parsedXml.installations.installation.forEach(function (installation) {
      var matchesIp = _.any(installation.qrReader, function (reader) {
        return reader._ == ip;
      });

      if(matchesIp){
        matchingInstallation = {
          ip: installation.$.ip,
          port: parseInt(installation.$.port),
          name: installation.$.name,
          isTotem: installation.$.totem
        }
      }
    });

    return matchingInstallation;
  });
};

InstallationMapping.prototype.findAllEquipment = function () {
  return this.xmlFilePromise.then(function (parsedXml) {
    var equipment = [];

    parsedXml.installations.installation.forEach(function (installation) {
      equipment.push({
        ip: installation.$.ip,
        port: parseInt(installation.$.port),
        name: installation.$.name,
        isTotem: installation.$.totem
      });

      installation.qrReader.forEach(function (reader) {
        equipment.push({
          ip: reader._,
          port: parseInt(installation.$.port),
          name: reader.$.name,
          isTotem: reader.$.totem
        });
      });
    });

    return equipment;
  });
};

function readXml(filePath) {
  var deferred = Q.defer();

  fs.readFile(filePath, function(err, data) {
    if (err) deferred.reject(err);
     xmlParser.parseString(data, function(err, result) {
      if (err) deferred.reject(err);

      deferred.resolve(result);
    });
  });

  return deferred.promise;
};

module.exports = InstallationMapping;
