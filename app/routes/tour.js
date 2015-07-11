var express = require('express');
var path = require('path');
var Visitor = require('../models/visitor');
var Group = require('../models/group');
var mailer = require('../mailer/mailer');

module.exports = function(app) {
  var router  = express.Router();

  router.post("/begin", function(req, res, next) {
    Visitor.assignGroup().
      then(function(id) {
        res.status(200).send({groupId: id});
      });
  });

  router.post("/end", function(req, res, next) {
    Group.find().sort({ _id: -1 }).limit(1)
      .exec(function(err, result) {
        if(err) next(err);
        var lastGroup = result[0];

        mailer.sendPhotos(lastGroup);
      })
  });

  app.use("/tour", router);
}
