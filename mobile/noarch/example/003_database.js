require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('database (general)', function() {
    var db;

    before(function() {
      utils.delete_nonsystem_databases(manager);
      
      // load up the elements db
      utils.install_elements_database(manager);
      db = manager.getExistingDatabase('elements');
    });

    it('must have a documentCount property', function() {
      should(db).have.property('documentCount', 118);
    });
    
    it('must have a lastSequenceNumber property', function() {
      should(db).have.property('lastSequenceNumber', 118);
    });
    
    it('must have a manager property', function() {
      should(db).have.property('manager', manager);
    });
    
    it('must have a name property', function() {
      should(db).have.property('name', 'elements');
      db.name.should.be.a.String;
    });

    it.skip('must have an addChangeListener function', function() {
      should(db.addChangeListener).be.a.Function;
    });

    it.skip('must have an removeChangeListener function', function() {
      should(db.removeChangeListener).be.a.Function;
    });

    it('must have a compact function', function() {
      should(db.compact).be.a.Function;
      db.compact().should.be.ok;
    });
    
    it('must have a deleteDatabase function', function() {
      var doomed = manager.getDatabase('doomed');
      should(doomed.deleteDatabase).be.a.Function;
      doomed.deleteDatabase().should.be.ok;
      
      var gone = manager.getExistingDatabase('doomed');
      should.not.exist(gone);
    });
    
    it.skip('must have an runAsync function', function() {
      should(db.runAsync).be.a.Function;
    });

    it.skip('must have an runInTransaction function', function() {
      should(db.runInTransaction).be.a.Function;
    });
  });


  describe('database (documents)', function() {
    var db;
    
    before(function() {
      db = manager.getExistingDatabase('elements');
    });
    
    it('must have a createDocument function', function() {
      should(db.createDocument).be.a.Function;
      var doc = db.createDocument();
      should.not.exist(db.error);
      should.exist(doc);
    });

    it('must have a getDocument function', function() {
      should(db.getDocument).be.a.Function;
    });
    
    it('must return an existing doc from getDocument() when the doc ID exists', function() {
      var existing = db.getDocument('Fe');
      should.exist(existing);
      should(existing).be.an.Object;
      should.not.exist(db.error);
    });
    
    it('must return a new doc from getDocument() when the doc ID does not exist', function() {
      var newdoc = db.getDocument('getdocument-test-new-doc-id');
      should.exist(newdoc);
      should(newdoc).be.an.Object;
      newdoc.documentID.should.eql('getdocument-test-new-doc-id');
    });
    
    it('must have a getExistingDocument function', function() {
      should(db.getExistingDocument).be.a.Function;
      
      var existing = db.getExistingDocument('I');
      should.exist(existing);
      should(existing).be.an.Object;
      should.not.exist(db.error);
      
      var nonexisting = db.getExistingDocument('this-is-a-doc-id-that-does-not-exist');
      should.not.exist(nonexisting);
    });

    it('must not save a document until a call to putProperties', function() {
      var db2 = manager.getDatabase('writable');
      var c1 = db2.documentCount;
      var doc = db2.getDocument();
      var c2 = db2.documentCount;
      c1.should.be.exactly(c2);
      doc.putProperties({foo:10});
      var c3 = db2.documentCount;
      c3.should.eql(c1+1);
    });
    
    it('must have a getValidation function', function() {
      should(db.getValidation).be.a.Function;
    });
  
    it('must have a setValidation function', function() {
      should(db.setValidation).be.a.Function;
    });
    
    // LOCAL DOCUMENTS
    
    it('must have a deleteLocalDocument function', function() {
      should(db.deleteLocalDocument).be.a.Function;
    });

    it('must have a getExistingLocalDocument function', function() {
      should(db.getExistingLocalDocument).be.a.Function;
    });
    
    it('must have a putLocalDocument function', function() {
      should(db.putLocalDocument).be.a.Function;
    });
  });
  

  describe('database (views)', function() {
    var db = manager.getDatabase('test003_views');
    
    it('must have a createAllDocumentsQuery function', function() {
      should(db.createAllDocumentsQuery).be.a.Function;
      var q = db.createAllDocumentsQuery();
      should.not.exist(db.error);
      should.exist(q);
      should(q).be.an.Object;
    });
    
    it('must have a getExistingView function', function() {
      should(db.getExistingView).be.a.Function;
    });
  
    it('must have a getView function', function() {
      should(db.getView).be.a.Function;
    });
    
  });
  

  describe('database (replications)', function() {
    var db = manager.getDatabase('test003_replications');
    
    it.skip('must have a filterCompiler property', function() {
      should(db).have.property('filterCompiler');
    });
    
    it.skip('must have a getFilter function', function() {
      should(db.getFilter).be.a.Function;
    });
  
    it.skip('must have a setFilter function', function() {
      should(db.setFilter).be.a.Function;
    });
  
    it('must have an allReplications property', function() {
      should(db).have.property('allReplications');
      db.allReplications.should.be.an.Array;
      db.allReplications.should.have.a.lengthOf(0);
    });
    
    it('must have a createPullReplication function', function() {
      should(db.createPullReplication).be.a.Function;
      var rep = db.createPullReplication("http://touchbooks.iriscouch.com/test003_pull");
      should.not.exist(db.error);
      should.exist(rep);
    });
    
    it('must have a createPushReplication function', function() {
      should(db.createPushReplication).be.a.Function;
      var rep = db.createPushReplication("http://touchbooks.iriscouch.com/test003_push");
      should.not.exist(db.error);
      should.exist(rep);
    });
    
    
  });  
  
};
