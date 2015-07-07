
module.exports = function(app) {

  require('./routes/tour')(app);
  require('./routes/visitor')(app);

}
