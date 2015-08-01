var fs = require('fs');
var Q = require("q");
var readFile = Q.nfbind(fs.readFile);
var watch = require('node-watch');
var config = require('../app/utils').config();
var AWS = require('aws-sdk');
var mime = require('mime');
var gm = require('gm').subClass({ imageMagick: true });
var walk = require('walk');

AWS.config.region = "sa-east-1";
AWS.config.maxRetries = 5;

var s3 = new AWS.S3({params: {Bucket: config.S3.bucket} });
var walker = walk.walk("C:\\Users\\Usuario\\Desktop\\sensorium-photos", { followLinks: false });

var separator = process.platform === "win32" ? "\\" : "/";

console.log("Watching %s for changes", config.photos_dir);
watch(config.photos_dir, function (path) {
  uploadPhotos(path).then(function () {
    console.log("Sync Done!");
  })
  .catch(function (error) {
    console.log("File deleted.- Error: " + error);
  });
});

function uploadPhotos(path, done) {
  var pathArray = path.split(separator);
  var fileName = pathArray[pathArray.length-1];
  var sourceFileName = "sources/" + fileName;
  var photoMimeType = mime.lookup(path);


  return readFile(path)
    .then(function (file) {
      var params = {
        Key: sourceFileName,
        Body: file,
        ContentType: photoMimeType,
        ACL: "public-read"
      };

      return Q.all([s3Upload(params), resizeImage(file)]);
    })
    .spread(function (uploadResult, resizedImage) {
      console.log("Uploaded: ", uploadResult.Location);
      var params = {
        Key: "thumbnails/" + fileName,
        Body: resizedImage,
        ContentType: photoMimeType,
        ACL: "public-read"
      };
      return s3Upload(params);
    })
    .then(function (uploadResult) {
      console.log("Uploaded: ", uploadResult.Location);
    });
}

function s3Upload(params) {
  var deferred = Q.defer();

  s3.upload(params, function (err, data) {
    if(err) deferred.reject(err);
    deferred.resolve(data);
  });

  return deferred.promise;
}

function resizeImage(file) {
  var deferred = Q.defer();
  gm(file)
    .resize(637, 391, "^")
    .gravity("Center")
    .extent(637, 391)
    .toBuffer(function (err, data) {
      if(err) deferred.reject(err);
      deferred.resolve(data);
    });

  return deferred.promise;
}
