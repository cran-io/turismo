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
  var job = new CronJob("00 24 00 * * *", function () {
    console.log("Visitors email task started");
      // var query = {
      //   $or: [
      //     {
      //       emailSent: false
      //     },
      //     {
      //       emailSent: { $exists: false}
      //     }]
      // };

      var query = { _id: 3389 };
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

            var opts = {
              "template_name": "turismo-ruta-40",
              "template_content": [],
              "message": message
            };

            console.log(opts);

            mandrillClient.messages.sendTemplate(opts, function(result) {
              console.log(result);
            }, function(error) {
              console.log(error);
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
    return config.dropboxRoot + ["0", visitorId, encodeURIComponent(file)].join("/");
  }
}
