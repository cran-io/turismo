var Q = require('q');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = Schema({
    _id: Number,
    visitors: []
});

var Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
