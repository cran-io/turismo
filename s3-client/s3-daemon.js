var fs = require('fs');
var chokidar = require('chokidar');
var config = require('../app/utils').config();
var AWS = require('aws-sdk');
var sharp = require('sharp');
var mime = require('mime');

AWS.config.region = "sa-east-1";

var s3 = new AWS.S3({params: {Bucket: "turismo-site"} });

var options = {
  persistent: true
};

chokidar.watch(config.photos_dir, options).on("add", function (path) {

  var pathArray = path.split("/");
  var fileName = pathArray[pathArray.length-1];
  var sourceFileName = "sources/" + fileName;


  fs.readFile(path, function (err, file) {
    if(err) throw err;

    var params = {
      Key: sourceFileName,
      Body: file,
      ContentType: mime.lookup(path)
    };

    s3.upload(params, function (err, data) {
      if(err) throw err;

      console.log(data.Location);
    });

    sharp(file)
      .resize(639, 392)
      .max()
      .png()
      .toBuffer()
      .then(function(data) {
        var params = {
          Key: "thumbnails/" + fileName,
          Body: data,
          ContentType: "image/png"
        };

        s3.upload(params, function (err, data) {
          if(err) throw err;

          console.log(data.Location);
        });
      });
  });

});
