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

var fakeRecipient = [
  {
    email: "miguel@cran.io",
    name: "test",
    type: "cc"
  }
];

exports.schedule = function () {
  var job = new CronJob("40 11 18 * * *", function () {
    console.log("Visitors email task started");
      var query = {
        $or: [
          { emailSent: false },
          { emailSent: { $exists: false} }]
      };
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

exports.testEmail = function() {
  var visitor = new Visitor({
    _id: 0,
    groupId: 0,
    name: "TEST1",
    email: "test1@test.com",
    age: 18,
    preferenceRegion: 0,
    qrCode: "123"
  });

  sendEmailToVisitor(visitor);
}

function sendEmailToVisitor(visitor) {
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

      mandrillClient.messages.sendTemplate(opts, function(result) {
        console.log(result);
      }, function(error) {
        console.log(error);
      });

    }
  });
}

function filesUrl() {
  return function(file) {
    return {
      thumbnail: [config.S3.url, "thumbnails", encodeURIComponent(file)].join("/"),
      photo:  [config.S3.url, "sources", encodeURIComponent(file)].join("/")
    }
  }
}
