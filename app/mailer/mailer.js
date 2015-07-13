var Mandrill = require('mandrill-api/mandrill')
  .Mandrill;
var path = require('path');
var Q = require('q');
var config = require('../utils')
  .config();
var fs = require('fs');

var ROOT_PATH = config.photos_dir;

var apiKey = process.env.MANDRILL_API_KEY;
var mandrillClient = new Mandrill(apiKey);

var sendPhotos = function(group) {

  var domeDir = path.join(ROOT_PATH, group._id.toString(), '/dome');

  var encodedDomePhotos = fs.readdirSync(domeDir)
    .map(readFiles(domeDir))
    .map(encodeBase64);

  var recipients = [];
  var mergeVars = [];

  group.visitors.forEach(function(visitor) {
    var visitorDir = path.join(ROOT_PATH, group._id.toString(), visitor._id.toString());

    var encodedVisitorPhotos = fs.readdirSync(visitorDir)
      .map(readFiles(visitorDir))
      .map(encodeBase64);

    var recipient = {
      email: visitor.email,
      name: visitor.name,
      type: "bcc"
    };

    var recipientMergeVar = {
      rcpt: visitor.email,
      vars: [{
        name: "images",
        content: encodedDomePhotos.concat(encodedVisitorPhotos)
      }]
    };

    mergeVars.push(recipientMergeVar);
    recipients.push(recipient);

  });

  var message = {
    "to": recipients,
    "merge_vars": mergeVars
  };

  console.log(JSON.stringify(message));
  // mandrillClient.messages.sendTemplate({
  //   "template_name": "sensorium",
  //   "message": message
  // }, function(result) {
  //   console.log(result);
  // }, function(error) {
  //   console.log('A mandrill error occurred: ' + error.name + ' - ' + error.message);
  // });
};


function readFiles(baseDir) {
  return function(file) {
    return fs.readFileSync(path.join(baseDir, file));
  }
}

function encodeBase64(photo) {
  return new Buffer(photo)
    .toString('base64');
}

exports.sendPhotos = sendPhotos;
