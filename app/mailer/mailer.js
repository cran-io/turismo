var Mandrill = require('mandrill-api/mandrill')
  .Mandrill;
var path = require('path');
var Q = require('q');
var config = require('../utils')
  .config();
var fs = require('fs');
var moment = require('moment');
var CronJob = require('cron')
  .CronJob;

var ROOT_PATH = config.photos_dir;
var MANDRILL_TIME_FORMAT = "YYYY-MM-DD HH:MM:SS";

var mandrillClient = new Mandrill(process.env.MANDRILL_API_KEY);

var sendPhotos = function(group) {
  var deferred = Q.defer();

  var domeUrl = [group._id, "dome"].join("/");
  var domeDir = path.join(ROOT_PATH, domeUrl);

  var domePhotosURLs = fs.readdirSync(domeDir)
    .map(filesUrl(domeUrl));

  var recipients = [];
  var mergeVars = [];

  group.visitors.forEach(function(visitor) {
    var visitorUrl = [group._id, visitor._id].join("/");
    var visitorDir = path.join(ROOT_PATH, visitorUrl);

    var visitorPhotosURLs = fs.readdirSync(visitorDir)
      .map(filesUrl(visitorUrl));

    var recipient = {
      email: visitor.email,
      name: visitor.name,
      type: "bcc"
    };

    var recipientMergeVar = {
      rcpt: visitor.email,
      vars: [{
        name: "images",
        content: domePhotosURLs.concat(visitorPhotosURLs)
      }]
    };

    mergeVars.push(recipientMergeVar);
    recipients.push(recipient);
  });

  var message = {
    "to": recipients,
    "merge_vars": mergeVars
  };

  var templateContent = [];

  var utcTime = moment()
    .utc();

  mandrillClient.messages.sendTemplate({
    "template_name": "sensorium",
    "template_content": [],
    "message": message,
    "send_at": utcTime.add(1, "hour")
      .format(MANDRILL_TIME_FORMAT)
  }, function(result) {
    console.log(result);
    deferred.resolve(result);
  }, function(error) {
    console.log(error);
    deferred.reject(error);
  });

  return deferred.promise;
};

exports.sendStatistics = function(statistics) {
  console.log(statistics);
  mandrillClient.messages.sendTemplate({
    "template_name": "sensorium-statistics",
    "template_content": [],
    "message": {
      "to": [{
        "email": "mmaquiel@cran.io",
        "name": "matias",
        "type": "to"
      }],
      "global_merge_vars": [{
        name: "totalVisits",
        value: statistics.totalVisits
      },
      {
        name: "lastDayVisits",
        value: statistics. lastDayVisits
      }]
    }
  }, function(result) {
    console.log(result);
  }, function(error) {
    console.log(error);
  });
}

function filesUrl(baseUrl) {
  return function(file) {
    return config.dropboxRoot + [baseUrl, encodeURIComponent(file)].join("/");
  }
}

exports.sendPhotos = sendPhotos;
