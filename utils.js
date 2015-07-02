var xmlParser = require('xml2js').Parser();
var processors = require('xml2js').processors;
var Q = require('q');
var fs = require('fs');

module.exports = {
  parseXmlFile: function(dirName) {
    var deferred = Q.defer();

    fs.readFile(dirName, function(err, data) {
      xmlParser.parseString(data, function (err, result) {
        if(err) deferred.reject(err);

        deferred.resolve(result);
      });
    });
    
    return deferred.promise;
  }
}
