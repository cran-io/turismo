var mongoose = require('mongoose'),
    validator = require('validator');
var Sequence = require('./sequence');
var Q = require('q');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  userId: Number,
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
UserSchema.statics.findByQrCode = function findByQrCode(qrCode) {
  var deferred = Q.defer();

  User.findOne({ 'qrCode': qrCode }).sort({ createdAt: -1 }).
  exec(function(err, user) {
    if(err) deferred.reject(err);
    deferred.resolve(user);
  });

  return deferred.promise;
}

/*
* Hooks
*/
UserSchema.pre('save', function(next){
  var thisDoc = this;
  Sequence.findByIdAndUpdate({_id: 'user.id'}, {$inc: { seq: 1} }, function(error, sequence)   {
        if(error) return next(error);

        thisDoc.userId = sequence.seq;
        next();
  });
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
