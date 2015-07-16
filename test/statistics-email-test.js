var mongoose = require('mongoose');
var expect = require('expect.js');
var Visitor = require('../app/models/visitor');
var config = require('../app/utils').config();
var moment = require('moment');
var sinon = require('sinon');
var mockery = require('mockery');
var mailer = require('../app/mailer/mailer');

mongoose.connect(config.db);

var now = moment();

var visitorTestData = [
  {
    _id: 0,
    groupId: 0,
    name: "TEST1",
    email: "test1@test.com",
    age: 18,
    preferenceRegion: 0,
    qrCode: "123"
  },
  {
    _id: 2,
    groupId: 0,
    name: "TEST1",
    email: "test1@test.com",
    age: 18,
    preferenceRegion: 0,
    qrCode: "123"
  },
  {
    _id: 3,
    groupId: 0,
    name: "TEST1",
    email: "test1@test.com",
    age: 18,
    preferenceRegion: 0,
    qrCode: "123"
  }
];

describe("Statistics Email Task", function(){
  before(function (done) {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    Visitor.collection.insert(visitorTestData, function (err, insert) {
      console.log("%d visitors inserted", insert.result.n);
      done();
    });
  });

  it("Should send email with total and last day visits", function(done){

    var endOfDay = moment().hours(23).minutes(59).seconds(59).toDate().getTime();
    var clock = sinon.useFakeTimers(endOfDay);

    var mockEmailer = {
      sendStatistics: function (statistics) {
        expect(statistics.totalVisits).to.equal(3);
        done();
      }
    };

    mockery.registerMock('../mailer/mailer', mockEmailer);

    require('../app/scheduled-tasks/statistics-email-task').schedule();

		clock.tick(1000);

  });

  after(function (done) {
    mockery.disable();
    Visitor.remove(function(err) {
      if(err) done(err);
      mongoose.connection.close()
      done();
    });
  })
});
