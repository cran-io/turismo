var mongoose = require('mongoose'),
    validator = require('validator');
var Sequence = require('./sequence');
var Group = require('./group');
var Q = require('q');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var VisitorSchema = new Schema({
  _id: Number,
  groupId: Number,
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    validate: [ validator.isEmail, 'Invalid Email' ]
  },
  preferenceRegion: {
    type: Number,
    required: true
  },
  qrCode: {
    type: String,
    required: true
  },
  emailSent: {
    default: false
  }
});

/*
* Static model methods
*/
VisitorSchema.statics.findByQrCode = function findByQrCode(qrCode) {
  var deferred = Q.defer();

  Visitor.findOne({ 'qrCode': qrCode }).sort({ createdAt: -1 }).
  exec(function(err, visitor) {
    if(err) deferred.reject(err);
    deferred.resolve(visitor);
  });

  return deferred.promise;
}

VisitorSchema.statics.findUnassigned = function() {
  var deferred = Q.defer();

  this.find({'groupId': null}, function(err, visitors) {
    if(err) deferred.reject(err);
    deferred.resolve(visitors);
  });

  return deferred.promise;
}

VisitorSchema.statics.assignGroup = function() {
  var deferred = Q.defer();

  this.findUnassigned().
    then(function(unassignedVisitors) {
      Sequence.next("group.id")
        .then(function(id) {

          var newGroup = new Group({ _id: id });

          unassignedVisitors.forEach(function(visitor) {

            Visitor.update({_id: visitor._id}, {groupId: id}, function (err, n) {
              if(err) deferred.reject(err);
              console.log("Updated docs: ", n);
            });

            newGroup.visitors.push(visitor);
          });

          newGroup.save();

          deferred.resolve(id);
        });
    });

  return deferred.promise;
}

/*
* Hooks
*/
VisitorSchema.pre('save', function(next){
  var thisDoc = this;
  Sequence.findByIdAndUpdate({_id: 'visitor.id'}, {$inc: { seq: 1} }, function(error, sequence)   {
    if(error) return next(error);

    thisDoc._id = sequence.seq;
    next();
  });
});

VisitorSchema.plugin(timestamps);

var Visitor = mongoose.model('Visitor', VisitorSchema);

Sequence.find({_id: 'visitor.id'}, function (err, results) {
  if(err) console.log(err);
  if(results.length == 0) Sequence.create({_id: 'visitor.id', seq: 0});
})

module.exports = Visitor;
