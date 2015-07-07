var mongoose = require('mongoose'),
    validator = require('validator');
var Sequence = require('./sequence');
var Q = require('q');
var Schema = mongoose.Schema;

var VisitorSchema = new Schema({
  visitorId: Number,
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
  createdAt: {
    type: Date,
    default: Date.now
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

/*
* Hooks
*/
VisitorSchema.pre('save', function(next){
  var thisDoc = this;
  Sequence.findByIdAndUpdate({_id: 'visitor.id'}, {$inc: { seq: 1} }, function(error, sequence)   {
    if(error) return next(error);

    thisDoc.visitorId = sequence.seq;
    next();
  });
});

var Visitor = mongoose.model('Visitor', VisitorSchema);

module.exports = Visitor;
