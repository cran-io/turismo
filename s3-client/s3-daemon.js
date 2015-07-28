var fs = require('fs');
var watch = require('node-watch');
var config = require('../app/utils').config();
var AWS = require('aws-sdk');
var mime = require('mime');
var gm = require('gm').subClass({ imageMagick: true });
var walk = require('walk');
var Q = require("q");

AWS.config.region = "sa-east-1";

var s3 = new AWS.S3({params: {Bucket: "turismo-site-test"} });
var walker = walk.walk(config.photos_dir, { followLinks: false });

var separator = process.platform === "win32" ? "\\" : "/";

walker.on("file", function (root, fileStat, next) {
  var path = [root, fileStat.name].join(separator);
  uploadPhotos(path)
    .then(function () {
      next();
    });
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

  var deferred = Q.defer();

  readFile(path)
    .then(function (file) {
      var photoMimeType = mime.lookup(path);
      var params = {
        Key: sourceFileName,
        Body: file,
        ContentType: photoMimeType,
        ACL: 'public-read'
      };

      uploadToS3(params)
        .then(function (data) {
          console.log("Uploaded: ", data.Location);
          return resize(file);
        })
        .then(function (thumbnail) {
          var params = {
            Key: "thumbnails/" + fileName,
            Body: thumbnail,
            ContentType: photoMimeType,
            ACL: 'public-read'
          };
          return uploadToS3(params);
        })
        .then(function (data) {
          console.log("Uploaded: ", data.Location);
          deferred.resolve();
        });
      })
      .catch(function (e) {
        deferred.reject(e);
      });

  return deferred.promise;
}

function uploadToS3(params) {
  var deferred = Q.defer();

  s3.upload(params, function (err, data) {
      if(err) deferred.reject(err);
      deferred.resolve(data);
  });

  return deferred.promise;
}

function resize(file) {
  var deferred = Q.defer();

  gm(file)
    .resize(639, 392)
    .toBuffer(function (err, data) {
        if(err) deferred.reject();
        deferred.resolve(data);
    });

  return deferred.promise;
}

function readFile(path) {
  var deferred = Q.defer();

  fs.readFile(path, function (err, data) {
    if(err) deferred.reject(err);
    deferred.resolve(data);
  });

  return deferred.promise;
}
