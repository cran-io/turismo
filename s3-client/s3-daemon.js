var fs = require('fs');
var watch = require('node-watch');
var config = require('../app/utils').config();
var AWS = require('aws-sdk');
var mime = require('mime');
var gm = require('gm').subClass({ imageMagick: true });
var walk = require('walk');

AWS.config.region = "sa-east-1";

var s3 = new AWS.S3({params: {Bucket: "turismo-site"} });
var walker = walk.walk(config.photos_dir, { followLinks: false });

var separator = process.platform === "win32" ? "\\" : "/";

walker.on("file", function (root, fileStat, next) {
  var path = [root, fileStat.name].join(separator);
  uploadPhotos(path);
  next();
});

watch(config.photos_dir, function (path) {
  uploadPhotos(path);
});

function uploadPhotos(path) {
  try {
    var pathStat = fs.statSync(path);
    if(pathStat.isDirectory()) return;
  } catch (e) {
    console.log(e);
    return;
  }


  var pathArray = path.split(separator);
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

      console.log("Uploaded: ", data.Location);
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

            console.log("Uploaded: ", data.Location);
          });
        }
      });
  });
}
