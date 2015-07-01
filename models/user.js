var mongoose = require('mongoose'),
    validator = require('validator');
var Sequence = require('./sequence');
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
  createdAt: Date
});

UserSchema.pre('save', function(next){
  var thisDoc = this;

  Sequence.findByIdAndUpdate({_id: 'user.id'}, {$inc: { seq: 1} }, function(error, sequence)   {
        if(error) return next(error);

        thisDoc.createdAt = new Date();
        thisDoc.userId = sequence.seq;
        next();
  });
  // next() must be call from the callback!
  //next();
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
