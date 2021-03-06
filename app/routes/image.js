var express = require('express');
var config = require('../utils').config();
var path = require('path');
var multer = require('multer');
var mkdirp = require('mkdirp');

var staticStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    var finalPath = path.join(config.photos_dir, '/uploads');

    mkdirp(finalPath, function(err) {
      if (err) {
        console.log("Error! Creating folder. Do we have the right permissions?");
        console.log(err);
      }
      return cb(err, finalPath);
    });
  },
  filename: function(req, file, cb) {
    var i = file.originalname.lastIndexOf('.');
    var name = file.originalname.substr(0, i);
    var ext = (i < 0) ? '.png' : file.originalname.substr(i - 1);
    cb(null, name + "_" + Date.now() + ext);
  }
});

var upload = multer({
  storage: staticStorage
});

module.exports = function(app) {
  var router = express.Router();
  router.post('/upload', upload.single('picture'), function(req, res) {
    res.status(200).end();
  });
  app.use("/image", router);
};