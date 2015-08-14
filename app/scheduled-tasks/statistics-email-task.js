var CronJob = require('cron').CronJob;
var mailer = require('../mailer/mailer');
var moment = require('moment');
var Visitor = require('../models/visitor');

exports.schedule = function () {
  var job = new CronJob("00 10 21 * * *", sendStatisticsMail);
  job.start();
  console.log("Statistics email scheduled");
}

function sendStatisticsMail() {
  console.log("Statistics email task started");

  var aggregate = [{
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

  Visitor.aggregate(aggregate, function(err, result) {
    if (err) console.log("Error: ", err);
    else {
      var text = formatMailText(result).join("");
      mailer.sendStatistics(text);
    };
  });
}

function formatMailText(data) {
  return data.map(function(data) {
    var day = data._id
    return "Día " + day.d + "/" + day.m + "/" + day.y + " Visitantes: " + data.count + '\n'
  })
}
