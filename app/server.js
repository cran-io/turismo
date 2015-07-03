var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var db = mongoose.connect('mongodb://localhost/sensorium');

// routes import
require('./routes')(app);

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

app.listen(3000);
