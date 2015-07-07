var express = require('express');
var path = require('path');
var Visitor = require('../../app/models/visitor');

module.exports = function(app) {
  var router  = express.Router();

  router.post("/start", function(req, res, next) {
    Visitor.assignGroup().
      then(function(id) {
        res.status(200).send({groupId: id});
      });
  });

  app.use("/tour", router);
}
