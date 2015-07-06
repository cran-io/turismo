var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./utils').config();

var app = express();
app.use(bodyParser.json());

var db = mongoose.connect(config.db);

// routes import
require('./routes')(app);
// Start OSC server
require('./osc-server')(config.osc.port);
/*
* Middleware
*/
app.use(function (err, req, res, next) {
  var errors = [];

  if(err.name !== 'ValidationError') {
    next(err);
  } else {
    Object.keys(err.errors).forEach(function(mongoField) {
      var errorObj = err.errors[mongoField];

      errors.push(errorObj.message);
    })

    res.status(500).send(errors);
  }
});

app.listen(config.port);

module.exports = app;
