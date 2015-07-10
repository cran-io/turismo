var express = require('express');
var config = require('../utils').config();
var path = require('path');
var multer = require('multer');

var multerOpts = {
  dest: path.join(config.photos_dir, '/uploads'),
  rename: function(fieldname, filename) {
    return filename;
  }
};

module.exports = function(app) {
  var router  = express.Router();

  router.post('/upload',[ multer(multerOpts), function(req, res){
    console.log('Form fields: ' + req.body);
    console.log('Form files: ' + req.files);
    res.status(200).end();
  }]);

  app.use("/image", router);
};
