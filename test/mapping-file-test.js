var expect = require('expect.js');
var InstallationMaping  = require('../config/installation-mapping');
var path = require('path');

describe("InstallationMapping", function(){

  var installationMapping = new InstallationMaping(path.join(__dirname,'fixtures/installation-mapping-fixture.xml'));
  describe("#findByReaderIP with 192.168.101.101", function(){

    var installationsPromise = installationMapping.findByReaderIP("192.168.101.101");

    it("Should return croma-1 installation with ip 192.168.101.1", function(done){
      installationsPromise
        .then(function (installation) {
          expect(installation.name).to.equal("croma-1");
          expect(installation.ip).to.equal("192.168.101.1");
          expect(installation.port).to.equal(12000);
          expect(installation.isTotem).to.not.be.ok();
          done();
        }).catch(done);
    });

  });

  describe("#findByReaderIP for a totem", function(){
    var installationMapping = new InstallationMaping(path.join(__dirname,'fixtures/totem-fixture.xml'));

    var installationsPromise = installationMapping.findByReaderIP("192.168.101.101");

    it("Should return an installation with isTotem true", function(done){
      installationsPromise
        .then(function (installation) {
          expect(installation.isTotem).to.be.ok();
          expect(installation.name).to.equal("totem-1");
          expect(installation.ip).to.equal("192.168.101.1");
          expect(installation.port).to.equal(12000);
          done();
        }).catch(done);
    });
  });

  describe("#findAll", function(){

    var installationsPromise = installationMapping.findAllEquipment();

    it("Should return an Array with all the equipment", function(done){
      installationsPromise
        .then(function (equipment) {
          expect(equipment[0].ip).to.equal("192.168.101.1");
          expect(equipment[0].port).to.equal(12000);
          expect(equipment[0].name).to.equal("croma-1");

          expect(equipment[1].ip).to.equal("192.168.101.101");
          expect(equipment[1].name).to.equal("raspi_1");

          expect(equipment[2].ip).to.equal("192.168.101.102");
          expect(equipment[2].name).to.equal("raspi_2");
          done();
        })
        .catch(done);
    });
  });
});
