require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;
  
  describe('query (all docs)', function() {
    var db, docs;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test004_alldocs');
    });
    
    it('must return no docs in an empty db', function() {
      var q = db.createAllDocumentsQuery();
      var e = q.run();
      should.exist(e);
      e.count.should.eql(0);
    });

    it('must return the correct number of docs', function() {
      docs = utils.create_test_documents(db, 10);
      var e = db.createAllDocumentsQuery().run();
      should.exist(e);
      e.count.should.eql(10);
    });
    
    it('must respect the limit parameter', function() {
      var q = db.createAllDocumentsQuery();
      q.limit = 2;
      var e = q.run();
      e.count.should.eql(2);
    });
    
    it('must respect the skip parameter', function() {
      var q = db.createAllDocumentsQuery();
      q.skip = 6;
      var e = q.run();
      e.count.should.eql(4);
    });
    
    it('must return deleted docs when allDocsMode is QUERY_INCLUDE_DELETED', function() {
      for (var i=0; i < 3; i++) {
        docs[i].deleteDocument();
      }
      
      var q = db.createAllDocumentsQuery();
      q.allDocsMode = titouchdb.QUERY_INCLUDE_DELETED;
      var e = q.run();
      e.count.should.eql(10);
    });
    
  });
  
};
