var expect = require('expect.js');
var request = require('supertest');
var Visitor = require('../app/models/visitor.js');
var app = require('../app/server').app;

describe("VisitorController", function(){
  beforeEach(function(done){
    Visitor.remove(function(err) {
      if(err) done(err);
      done();
    });
  });

  after(function(done){
    Visitor.remove(function(err) {
      if(err) done(err);
      mongoose.connection.close()
      done();
    });
  });

  describe("POST /signup", function(){

    it("should create an unassigned visitor", function(done){
      var aVisitor = {
        qrCode: "1234",
        name: "matias",
        age: 24,
        email: "test@test.com",
        preferenceRegion: 2
      }

      request(app)
        .post("/visitor/signup")
        .send(aVisitor)
        .expect(200)
        .end(function(err, result) {
          Visitor.findUnassigned()
            .then(function(visitors) {
              expect(visitors.length).to.equal(1);
              done();
            }).catch(done);
        });
    });
  });
});
