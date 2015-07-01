var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SequenceSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});

var Sequence = mongoose.model('Sequence', SequenceSchema);

module.exports = Sequence;
