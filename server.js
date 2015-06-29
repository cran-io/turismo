var express = require('express'),
    mongoose = require('mongoose'),
    User = require('./models/user'),
    bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var db = mongoose.connect('mongodb://localhost/turismo');

/**
Signup form:
- Name
- Age
- Email
- Preference Zone
-
**/
app.post('/signup', function(req, res) {
  var newUser = new User(req.body);

  newUser.save(function(err) {
    if(err){
      res.status(500);
      res.send(JSON.stringify(err.errors));
    }
  });
});

var killDbConnection = function() {
  mongoose.connection.close(function () {
    process.exit(0);
  });
};

process.on('SIGINT', killDbConnection)
       .on('SIGTERM', killDbConnection);

app.listen(8080);
