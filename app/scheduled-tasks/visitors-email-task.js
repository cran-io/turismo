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

exports.schedule = function () {
  var job = new CronJob("40 11 18 * * *", function () {
    console.log("Visitors email task started");
      var query = {
        $or: [
          { emailSent: false },
          { emailSent: { $exists: false} }]
      };
      var fakeRecipient = [
        {
          email: "nahuel@masotros.com",
          name: "test",
          type: "to"
        },
        {
          email: "martin@masotros.com",
          name: "test",
          type: "cc"
        },
        {
          email: "caro@masotros.com",
          name: "test",
          type: "cc"
        },
        {
          email: "juana@masotros.com",
          name: "test",
          type: "cc"
        },
        {
          email: "agus@masotros.com",
          name: "test",
          type: "cc"
        },
        {
          email: "miguel@cran.io",
          name: "test",
          type: "cc"
        },
        {
          email: "mmaquiel@cran.io",
          name: "test",
          type: "cc"
        },
        {
          email: "javier@cran.io",
          name: "test",
          type: "cc"
        },
        {
          email: "alan@masotros.com",
          name: "test",
          type: "cc"
        }
      ];
      Visitor.find(query).sort({_id:-1}).limit(10).exec(function (err, result) {
        console.log("Total emails to be sent: ", result.length);

        result.forEach(function (visitor) {
          console.log(visitor._id);
          var groupId = visitor.groupId || "0";
          var visitorPhotosPath = [groupId, visitor._id].join("/");
          fs.readdir(path.join(PHOTOS_PATH, visitorPhotosPath), function (err, photos) {
            if(photos){
              var cromaPhotos = _.select(photos, function (elem) {
                return _.startsWith(elem, "croma_");
              }).map(filesUrl());

              var expertosPhotos = _.select(photos, function (elem) {
                return _.startsWith(elem, "experto_");
              }).map(filesUrl());


              var recipient = {
                email: visitor.email,
                name: visitor.name,
                type: "to"
              };

              var message = {
                "to": fakeRecipient,
                "global_merge_vars": [{
                    name: "croma",
                    content: cromaPhotos
                  },
                  {
                    name: "valijas",
                    content: expertosPhotos
                  }],
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

            }
          });
        });
    });

  });

  job.start();
}

function filesUrl() {
  return function(file) {
    return {
      thumbnail: [config.S3.url, "thumbnails", encodeURIComponent(file)].join("/"),
      photo:  [config.S3.url, "sources", encodeURIComponent(file)].join("/")
    }
  }
}
