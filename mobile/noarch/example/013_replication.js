require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('replication (API)', function() {
    var db, repl;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test013');
      repl = db.createPullReplication('http://example.com/'); // not actually started
    });
    
    it.skip('must have an authenticator property', function() {
      should(repl).have.property('authenticator');
    });
    
    it('must have a changesCount property', function() {
      should(repl).have.property('changesCount');
      repl.changesCount.should.be.a.Number;
    });
    
    it.skip('must have a channels property', function() {
      should(repl).have.property('channels');
      repl.channels.should.be.an.Array;
    });
    
    it('must have a completedChangesCount property', function() {
      should(repl).have.property('completedChangesCount');
      repl.completedChangesCount.should.be.a.Number;
    });
    
    it('must have a continuous property', function() {
      should(repl).have.property('continuous');
      repl.continuous.should.be.a.Boolean;
    });
    
    it('must have a createTarget property', function() {
      should(repl).have.property('createTarget');
      repl.createTarget.should.be.a.Boolean;
    });
    
    it('must have a docIds property', function() {
      should(repl).have.property('docIds');
    });
    
    it('must have a filter property', function() {
      should(repl).have.property('filter');
    });
    
    it('must have a filterParams property', function() {
      should(repl).have.property('filterParams');
    });
    
    it('must have a headers property', function() {
      should(repl).have.property('headers');
    });
    
    it('must have an isPull property', function() {
      should(repl).have.property('isPull');
      repl.isPull.should.be.a.Boolean;
    });
    
    it('must have an isRunning property', function() {
      should(repl).have.property('isRunning');
      repl.isRunning.should.be.a.Boolean;
    });
    
    it('must have a lastError property', function() {
      should(repl).have.property('lastError');
    });
    
    it('must have a localDatabase property', function() {
      should(repl).have.property('localDatabase', db);
    });
    
    it('must have a remoteUrl property', function() {
      should(repl).have.property('remoteUrl', 'http://example.com/');
    });
    
    it('must have a status property', function() {
      should(repl).have.property('status');
      repl.status.should.be.a.Number;
    });
    
    it.skip('must have a addChangeListener method', function() {
      should(repl.addChangeListener).be.a.Function;
    })
    
    it.skip('must have a removeChangeListener method', function() {
      should(repl.removeChangeListener).be.a.Function;
    })
    
    it('must have a restart method', function() {
      should(repl.restart).be.a.Function;
    })
    
    it('must have a start method', function() {
      should(repl.start).be.a.Function;
    })
    
    it('must have a stop method', function() {
      should(repl.stop).be.a.Function;
    })
    
  });
  
};