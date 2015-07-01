var xmlParser = require('xml2js').Parser();
var processors = require('xml2js').processors;
var fs = require('fs');

function toCamelCase(aString){
  return aString.replace(/-([a-z])/g, function (char) { return char[1].toUpperCase(); });
}

module.exports = {
  parseXmlFile: function(dirName, callback) {
    var options = {
      tagNameProcessors: [toCamelCase]
    };
    fs.readFile(dirName, options, function(err, data) {
      xmlParser.parseString(data, function (err, result) {
        if(err) callback(err, null);
        callback(null, result);
      });
    });
  }
}
