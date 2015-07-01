var xmlParser = require('xml2js').Parser();
var processors = require('xml2js').processors;
var fs = require('fs');

module.exports = {
  parseXmlFile: function(dirName, callback) {
    fs.readFile(dirName, function(err, data) {
      xmlParser.parseString(data, function (err, result) {
        if(err) callback(err, null);
        callback(null, result);
      });
    });
  }
}
