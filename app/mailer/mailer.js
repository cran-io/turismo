var Mandrill = require('mandrill-api/mandrill').Mandrill;
var fs = require('fs');
var path = require('path');
var config = require('../utils').config();

// Path to shared folder containing visitor photos.
var ROOT_PATH = "/root";

var apiKey = process.env.MANDRILL_API;
var mancrillClient = new Mandrill(apiKey);

var send = function(group) {

  var pathToDomePhotos = path.join(ROOT_PATH, group._id.toString(), '/dome');

  group.visitors.forEach(function(visitor) {
    var pathToVisitorPhotos = path.join(ROOT_PATH, group._id.toString(), visitor._id.toString());
    console.log("Email sent to: %s", visitor.email)
  });
};

exports.send = send;
