var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var objectId = Schema.ObjectId;

var StatisticSchema = Schema({
	installation: String,
	visitor: {
    type: Number,
    ref: 'Visitor',
    required: true
  }
});

StatisticSchema.plugin(timestamps);
var Statistic = mongoose.model('Statistic', StatisticSchema);

module.exports = Statistic;
