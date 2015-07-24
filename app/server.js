var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./utils').config();

var app = express();
app.use(bodyParser.json());

console.log("Connecting to db: %s", config.db);
var db = mongoose.connect(config.db);

// Initialize Routes
require('./routes')(app);
// Start OSC server
require('./osc/server')(config.osc.port);
// Schedule taskg
require('./scheduled-tasks/statistics-email-task').schedule();
require('./scheduled-tasks/visitors-email-task').schedule();
/*
* Middleware
*/
app.use(function (err, req, res, next) {
  var errors = [];

  if(err.name !== 'ValidationError') {
    return next(err);
  } else {
    Object.keys(err.errors).forEach(function(mongoField) {
      var errorObj = err.errors[mongoField];

      errors.push(errorObj.message);
    })

    res.status(500).send(errors);
  }
});

app.listen(config.port);
console.log("Server started at %s", config.port);

exports.app = app;
