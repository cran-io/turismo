var CronJob = require('cron').CronJob;
var Visitor = require('../models/visitor');
var fs = require('fs');
var path = require('path');
var config = require('../utils').config();
var Mandrill = require('mandrill-api/mandrill').Mandrill;
var _ = require('lodash');

var mandrillClient = new Mandrill(process.env.MANDRILL_API_KEY);
var PHOTOS_PATH = config.photos_dir;
var dropboxRoot = config.dropboxRooot;

exports.schedule = function () {
  var job = new CronJob("00 22 18 * * *", function () {
    console.log("Visitors email task started");

      Visitor.find({$or: [{emailSent: false}, {emailSent: {$exists: false} }] }, function (err, result) {
      console.log("Total emails to be sent: ", result.length);

      result.forEach(function (visitor) {
        var visitorPhotosPath = [0, visitor._id].join("/");

        fs.readdir(path.join(PHOTOS_PATH, visitorPhotosPath), function (err, photos) {
          if(photos){
            var cromaPhotos = _.select(photos, function (elem) {
              return _.startsWith(elem, "croma_");
            }).map(filesUrl());

            var expertosPhotos = _.select(photos, function (elem) {
              return _.startsWith(elem, "experto_");
            }).map(filesUrl());

            console.log("Croma photos of visitor %d: ", visitor._id, cromaPhotos);
            console.log("Expertos photos of visitor %d: ", visitor._id, expertosPhotos);
          }
        });
      });
    });

  });

  job.start();
}

function filesUrl() {
  return function(file) {
    return config.dropboxRoot + [0, encodeURIComponent(file)].join("/");
  }
}
