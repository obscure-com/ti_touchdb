require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;
      
  describe('query (general)', function() {
    var db, q;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test004_querygeneral');
      q = db.createAllDocumentsQuery();
    });
    
    it.skip('must have an allDocsMode property', function() {
      should(q).have.property('allDocsMode');
      q.allDocsMode.should.be.a.Number;
    });
    
    it('must have a database property', function() {
      should(q).have.property('database');
      should(q.database).eql(db);
    });
    
    it('must have a descending property', function() {
      should(q).have.property('descending');
      q.descending.should.be.a.Boolean;
      q.descending.should.eql(false);
    });
    
    it('must have an endKey property', function() {
      should(q).have.property('endKey');
      should(q.endKey).be.eql(null);
    });
    
    it('must have an endKeyDocID property', function() {
      should(q).have.property('endKeyDocID');
      should(q.endKeyDocID).be.eql(null);
    });
    
    it('must have a groupLevel property', function() {
      should(q).have.property('groupLevel');
      q.groupLevel.should.be.a.Number;
    });
    
    it('must have a indexUpdateMode property', function() {
      should(q).have.property('indexUpdateMode');
      q.indexUpdateMode.should.be.a.Number;
      q.indexUpdateMode.should.be.eql(titouchdb.QUERY_UPDATE_INDEX_BEFORE);
    });
    
    it('must have a keys property', function() {
      should(q).have.property('keys');
      q.keys.should.be.an.Array;
      q.keys.length.should.eql(0);
    });
    
    it('must have a limit property', function() {
      should(q).have.property('limit', -1);
      q.limit.should.be.a.Number;
    });
    
    it('must have a mapOnly property', function() {
      should(q).have.property('mapOnly');
      q.mapOnly.should.be.a.Boolean;
      q.mapOnly.should.eql(true);
    });
    
    it('must have a prefetch property', function() {
      should(q).have.property('prefetch');
      q.prefetch.should.be.a.Boolean;
      q.prefetch.should.eql(false);
    });
    
    it('must have a skip property', function() {
      should(q).have.property('skip', 0);
      q.skip.should.be.a.Number;
    });
    
    it('must have an startKey property', function() {
      should(q).have.property('startKey');
      should(q.startKey).be.eql(null);
    });
    
    it('must have an startKeyDocID property', function() {
      should(q).have.property('startKeyDocID');
      should(q.startKeyDocID).be.eql(null);
    });
    
    it('must have a run function', function() {
      should(q.run).be.a.Function;
    });
    
    it.skip('must have a runAsync function', function() {
      should(q.runAsync).be.a.Function;
    });
    
    it.skip('must have a toLiveQuery function', function() {
      should(q.toLiveQuery).be.a.Function;
    });
  });
  
  
  describe('query enumerator', function() {
    var db, e;

    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test004_queryenum');
      e = db.createAllDocumentsQuery().run();
    });
    
    it('must have a count property', function() {
      should(e).have.property('count', 0);
    });

    it('must have a sequenceNumber property', function() {
      should(e).have.property('sequenceNumber');
    });

    it('must have a stale property', function() {
      should(e).have.property('stale');
      e.stale.should.be.a.Boolean;
    });
    
    it('must have a getRow function', function() {
      should(e.getRow).be.a.Function;
    });

    it('must have a next function', function() {
      should(e.next).be.a.Function;
    });

    it('must have a reset function', function() {
      should(e.reset).be.a.Function;
    });
  });

  describe('query (all docs)', function() {
    var db;
    
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
      utils.create_test_documents(db, 10);
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
    
  });
  
};
