var CronJob = require('cron').CronJob;
var mailer = require('../mailer/mailer');
var moment = require('moment');
var Visitor = require('../models/visitor');

exports.schedule = function () {
  var job = new CronJob("00 00 00 * * *", function() {
    console.log("Statistics email task started");
    var today = moment().startOf('day');
    var tomorrow = moment(today).add(1, 'days');

    console.log("Querying visitors between %s and %s", today, tomorrow);

    var lastDayCountQuery = Visitor.where({
      createdAt: {
        $gte: today.toDate(),
        $lt: tomorrow.toDate()
      }
    }).count();

    Visitor.count(function (err, totalCount) {
      lastDayCountQuery.exec(function (err, lastDayCount) {
        mailer.sendStatistics({
          totalVisits: totalCount,
          lastDayVisits: lastDayCount
        });

      });
    });

  });

  job.start();
  console.log("Statistics email scheduled");
}
