var CronJob = require('cron').CronJob;
var Visitor = require('../models/visitor');
var fs = require('fs');
var path = require('path');
var config = require('../utils').config();
var Mandrill = require('mandrill-api/mandrill').Mandrill;
var _ = require('lodash');
var request = require('request');
var moment = require('moment');

var mandrillClient = new Mandrill(process.env.MANDRILL_API_KEY);
var PHOTOS_PATH = config.photos_dir;
var MANDRILL_TIME_FORMAT = "YYYY-MM-DD HH:MM:SS";

exports.schedule = function () {
  var job = new CronJob("00 00 00 * * *", function () {
    console.log("Visitors email task started");
      var query = {
        $or: [
          { emailSent: false },
          { emailSent: { $exists: false} }]
      };

      Visitor.find(query, function (err, result) {
      console.log("Total emails to be sent: ", result.length);

      result.forEach(function (visitor) {
        var visitorPhotosPath = ["0", visitor._id].join("/");
        fs.readdir(path.join(PHOTOS_PATH, visitorPhotosPath), function (err, photos) {
          if(photos){
            var cromaPhotos = _.select(photos, function (elem) {
              return _.startsWith(elem, "croma_");
            }).map(filesUrl(visitor._id));

            var expertosPhotos = _.select(photos, function (elem) {
              return _.startsWith(elem, "experto_");
            }).map(filesUrl(visitor._id));


            var recipient = {
              email: visitor.email,
              name: visitor.name,
              type: "to"
            };

            var recipientMergeVar = {
              rcpt: visitor.email,
              vars: [
                {
                  name: "croma",
                  content: cromaPhotos
                },
                {
                  name: "valijas",
                  content: expertosPhotos
                }]
            };

            var message = {
              "to": [recipient],
              "merge_vars": [recipientMergeVar],
              "merge_language": "handlebars"
            };

            var utcTime = moment().utc();

            var opts = {
              "template_name": "turismo-ruta-40",
              "template_content": [],
              "message": message
            };

            console.log(JSON.stringify(opts));

            mandrillClient.messages.sendTemplate(opts, function(result) {
              console.log(result);
            }, function(error) {
              console.log(error);
            });
            Visitor.update({_id: visitor._id}, { emailSent: true }, function (err, n) {
              console.log("Visitors updated: ", n);
            });
          }
        });
      });
    });

  });

  job.start();
}

function filesUrl(visitorId) {
  return function(file) {
    var downCaseFile = file.toLowerCase();
    var relativeDir = ["/sensorium-photos", "0", visitorId, encodeURIComponent(downCaseFile)].join("/");

    request(config.tecnoboxServer + "/sync_image?q=" + relativeDir, function (err, res, body) {
      console.log(err);
    });

    return {
      thumbnail: [config.tecnoboxServer, "thumbnails", encodeURIComponent(downCaseFile)].join("/"),
      photo: config.dropboxRoot + ["0", visitorId, encodeURIComponent(downCaseFile)].join("/")
    }
  }
}
