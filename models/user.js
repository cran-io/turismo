var mongoose = require('mongoose'),
    validator = require('validator');
var Schema = mongoose.Schema;

var userSchema = new Schema({
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
  preferenceZone: {
    type: String,
    required: true
  },
  qrCode: {
    type: String,
    required: true
  }
});

var User = mongoose.model('User', userSchema);

module.exports = User;
