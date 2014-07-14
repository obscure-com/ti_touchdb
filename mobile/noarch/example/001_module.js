require('ti-mocha');

var should = require('should');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb');

  describe('module', function() {
  
    it('must exist', function() {
      should.exist(titouchdb);
    });
  
    it('must have replication constants', function() {
      should.exist(titouchdb.REPLICATION_MODE_STOPPED);
      should.exist(titouchdb.REPLICATION_MODE_OFFLINE);
      should.exist(titouchdb.REPLICATION_MODE_IDLE);
      should.exist(titouchdb.REPLICATION_MODE_ACTIVE);
    });
  
    it('must have query constants', function() {
      should.exist(titouchdb.QUERY_ALL_DOCS);
      should.exist(titouchdb.QUERY_INCLUDE_DELETED);
      should.exist(titouchdb.QUERY_SHOW_CONFLICTS);
      should.exist(titouchdb.QUERY_ONLY_CONFLICTS);
    });
  
    it('must have query update constants', function() {
      should.exist(titouchdb.QUERY_UPDATE_INDEX_BEFORE);
      should.exist(titouchdb.QUERY_UPDATE_INDEX_NEVER);
      should.exist(titouchdb.QUERY_UPDATE_INDEX_AFTER);
    });
  
    it('must have a database manager property', function() {
      should(titouchdb).have.property('databaseManager');
    });
  
  });

  describe('module (authenticators)', function() {
    it('must have a createBasicAuthenticator method', function() {
      should(titouchdb.createBasicAuthenticator).be.a.Function;
    });
    
    it('must have a createFacebookAuthenticator method', function() {
      should(titouchdb.createFacebookAuthenticator).be.a.Function;
    });
    
    it('must have a createPersonaAuthenticator method', function() {
      should(titouchdb.createPersonaAuthenticator).be.a.Function;
    });
  })
};