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
    });
    
    it.skip('must have a removeChangeListener method', function() {
      should(repl.removeChangeListener).be.a.Function;
    });
    
    it('must have a restart method', function() {
      should(repl.restart).be.a.Function;
    });
    
    it('must have a setCredential method', function() {
      should(repl.setCredential).be.a.Function;
    });
    
    it('must have a start method', function() {
      should(repl.start).be.a.Function;
    });
    
    it('must have a stop method', function() {
      should(repl.stop).be.a.Function;
    });
    
  });

  describe('pull replication (one-shot)', function() {
    // very important! keep a reference to the replication object.
    var conf, repl;
    
    before(function(done) {
      utils.delete_nonsystem_databases(manager);
      conf = utils.verify_couchdb_server(done);
    });
  
    it('must replicate an entire db', function(done) {
      this.timeout(10000);
      var db = manager.getDatabase('repl1');
      var hasStopped = false;
      repl = db.createPullReplication('http://'+conf.host+':'+conf.port+'/'+conf.dbname);
      repl.addEventListener('change', function(e) {
        if (!hasStopped && e.source.status == titouchdb.REPLICATION_MODE_STOPPED) {
          hasStopped = true;
          should.not.exist(repl.lastError);
          db.documentCount.should.eql(118);
          repl.isRunning.should.eql(false);
          done();
        }
      });
      repl.start();
    });
  });
  
  describe('push replication (one-shot)', function() {
    var conf, db, repl;
    
    before(function(done) {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('repl2');
      utils.create_test_documents(db, 12);
      conf = utils.verify_couchdb_server(done);
    });
    
    it('must replicate an entire db', function(done) {
      this.timeout(10000);
      var dbname = "repl2_" + Ti.Platform.createUUID().substring(0, 8).toLowerCase();
      var hasStopped = false;
      repl = db.createPushReplication('http://'+conf.host+':'+conf.port+'/'+dbname);
      repl.createTarget = true;
      repl.addEventListener('change', function(e) {
        if (!hasStopped && e.source.status == titouchdb.REPLICATION_MODE_STOPPED) {
          hasStopped = true;
          should.not.exist(repl.lastError);
          repl.completedChangesCount.should.eql(12);
          repl.isRunning.should.eql(false);
          done();
        }
      });
      repl.start();
    });
  });

  describe('pull replication with auth credentials', function() {
    var conf, repl;
    
    before(function(done) {
      utils.delete_nonsystem_databases(manager);
      conf = utils.verify_couchdb_server(done);
    });
  
    // currently returning a 400 error due to a request for /elements/_session
    it('must replicate with credentials', function(done) {
      this.timeout(10000);
      var db = manager.getDatabase('repl3');
      var hasStopped = false;
      repl = db.createPullReplication('http://'+conf.host+':'+conf.port+'/'+conf.dbname);
      repl.setCredential({ user: 'scott', pass: 'tiger' });
      repl.addEventListener('change', function(e) {
        if (!hasStopped && e.source.status == titouchdb.REPLICATION_MODE_STOPPED) {
          hasStopped = true;
          should.not.exist(repl.lastError);
          db.documentCount.should.eql(118);
          repl.isRunning.should.eql(false);
          done();
        }
      });
      repl.start();
    });
  });
  
  describe('pull replication with authenticator', function() {
    var conf, repl;
    
    before(function(done) {
      utils.delete_nonsystem_databases(manager);
      conf = utils.verify_couchdb_server(done);
    });
  
    // currently returning a 400 error due to a request for /elements/_session
    it('must replicate with a basic authenticator', function(done) {
      this.timeout(10000);
      var db = manager.getDatabase('repl4');
      var hasStopped = false;
      repl = db.createPullReplication('http://'+conf.host+':'+conf.port+'/'+conf.dbname);
      repl.authenticator = titouchdb.createBasicAuthenticator('scott', 'tiger');
      repl.addEventListener('change', function(e) {
        if (!hasStopped && e.source.status == titouchdb.REPLICATION_MODE_STOPPED) {
          hasStopped = true;
          should.not.exist(repl.lastError);
          db.documentCount.should.eql(118);
          repl.isRunning.should.eql(false);
          done();
        }
      });
      repl.start();
    });
  });
  
};