var xmlParser = require('xml2js')
  .Parser();
var Q = require('q');
var fs = require('fs');
var path = require('path');
var env = require(path.join(__dirname, '../', 'config/env.json'));

var MAPPING_FILE_DIR = path.join(__dirname, '../', 'config/reader-installation-mapping.xml');

exports.parseXmlFile = function(dirName) {
  var deferred = Q.defer();

  fs.readFile(dirName, function(err, data) {
    xmlParser.parseString(data, function(err, result) {
      if (err) deferred.reject(err);

      deferred.resolve(result);
    });
  });

  return deferred.promise;
};

exports.config = function() {
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
}

exports.mapping = function () {
  return this.parseXmlFile(MAPPING_FILE_DIR);
}
