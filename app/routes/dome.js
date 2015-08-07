var express = require('express');
var config = require('../utils').config();
var path = require('path');
var multer = require('multer');
var mkdirp = require('mkdirp');

var dynamicStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    var match = file.originalname.split('_');
    if (match.length < 3) {
      return cb("Error! Wrong file name.");
    }

    var groupId = match[1];
    var finalPath = path.join(config.photos_dir, '/' + groupId);

    mkdirp(finalPath, function(err) {
      if (err) {
        console.log("Error! Creating folder. Do we have the right permissions?");
        console.log(err);
      }
      return cb(err, finalPath);
    });
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({
  storage: dynamicStorage
});

module.exports = function(app) {
  var router = express.Router();

  router.post('/upload', upload.single('dome_image'), function(req, res) {
    console.log('Form files: ' + req.files);
    res.status(200).end();
  });

  app.use("/dome", router);
};