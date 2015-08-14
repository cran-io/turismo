var CronJob = require('cron').CronJob;
var mailer = require('../mailer/mailer');
var moment = require('moment');
var async = require('async');
var _ = require('underscore');

// MODELS
var Visitor = require('../models/visitor');
var Statistic = require('../models/statistic')

exports.schedule = function () {
  // var job = new CronJob("00 10 21 * * *", sendStatisticsMail);
  // job.start();
  // console.log("Statistics email scheduled");
  sendStatisticsMail();
}

function sendStatisticsMail() {
  console.log("Statistics email task started");

  async.parallel([function(cb) {
    Visitor.aggregate(visitorAggregate(), function(err, result) {
      if (err) cb(err, null);
      else cb(null, result);
        // var text = formatMailText(result).join("");
        // mailer.sendStatistics(text);
    });
  }, function(cb) {
    Statistic.aggregate(statisticAggregate(), function(err, result) {
      if (err) cb(err, null);
      else cb(null, result);
    });
  }], function(err, result) {
    console.log("Error: ", err);
    console.log("Result: ", result);
    var visitors = result[0];
    var statistics = result[1];
  });
}

function formatMailText(data) {
  return data.map(function(data) {
    var day = data._id
    return "Día " + day.d + "/" + day.m + "/" + day.y + " Visitantes: " + data.count + '\n'
  })
}

function visitorAggregate() {
  return [{
    $group : {
      _id: {
        y: { "$year": "$createdAt" },
        m: { "$month": "$createdAt" },
        d: { "$dayOfMonth": "$createdAt" }
      },
      count: { $sum:1 } }
    },{
      $sort: { _id: 1 }
  }];
}

function statisticAggregate() {
  return [{
    $group : {
      _id: {
        name: "$installation",
        day: {
          y: { "$year": "$createdAt" },
          m: { "$month": "$createdAt" },
          d: { "$dayOfMonth": "$createdAt" }
        }
      },
      count: { $sum:1 } }
  }];
}
