
module.exports = function(app) {

  require('./routes/tour')(app);
  require('./routes/visitor')(app);
  require('./routes/image')(app);
  require('./routes/equipment')(app);

}
