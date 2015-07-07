var Q = require('q');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SequenceSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});

SequenceSchema.statics.next = function(sequenceName) {
  var deferred = Q.defer();

  Sequence.findByIdAndUpdate({_id: sequenceName}, {$inc: { seq: 1} }, function(error, sequence)   {
    if(error) deferred.reject(err);
    deferred.resolve(sequence.seq);
  });

  return deferred.promise;
}

var Sequence = mongoose.model('Sequence', SequenceSchema);

module.exports = Sequence;
