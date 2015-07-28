var fs = require('fs');
var watch = require('node-watch');
var config = require('../app/utils').config();
var AWS = require('aws-sdk');
var mime = require('mime');
var gm = require('gm').subClass({ imageMagick: true });

AWS.config.region = "sa-east-1";

var s3 = new AWS.S3({params: {Bucket: "turismo-site"} });

var options = {
  persistent: true
};

watch(config.photos_dir, function (path) {

  try {
    var pathStat = fs.statSync(path);
    if(pathStat.isDirectory()) return;
  } catch (e) {
    return;
  }


  var pathArray = path.split("/");
  var fileName = pathArray[pathArray.length-1];
  var sourceFileName = "sources/" + fileName;


  fs.readFile(path, function (err, file) {
    if(err) throw err;

    var photoMimeType = mime.lookup(path);
    var params = {
      Key: sourceFileName,
      Body: file,
      ContentType: photoMimeType
    };

    s3.upload(params, function (err, data) {
      if(err) throw err;

      console.log(data.Location);
    });

    gm(file)
      .resize(639, 392)
      .toBuffer(function(err, data) {
        if(!err){
          var params = {
            Key: "thumbnails/" + fileName,
            Body: data,
            ContentType: photoMimeType
          };

          s3.upload(params, function (err, data) {
            if(err) throw err;

            console.log(data.Location);
          });
        }
      });
  });

});
