var Q = require('q');
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var GroupSchema = Schema({
  _id: Number,
  visitors: []
});

GroupSchema.plugin(timestamps);
var Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
