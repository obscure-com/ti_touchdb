require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('document (lifecycle)', function() {
    var db;

    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test006_doclifecycle');
    });

    it('must create a revision', function() {
      var doc = db.createDocument();
      doc.putProperties({ a: 10 });
      doc.deleted.should.eql(false);
      var existing = db.getExistingDocument(doc.documentID);
      should(existing).be.exactly(doc);
    });

    it('must delete a document', function() {
      var doc = db.createDocument();
      var rev = doc.putProperties({name: 'short lived'});
      doc.deleted.should.eql(false);
      var deleted = doc.deleteDocument();
      deleted.should.be.true;
  
      var redoc = db.getExistingDocument(doc.documentID);
      should.not.exist(redoc);
      // TODO deleting a doc no longer leaves a tombstone?
      // redoc.deleted.should.eql(true);
    });

    it('must purge a document', function() {
      var doc = db.createDocument();
      var rev = doc.putProperties({name: 'purgatory'});
      var result = doc.purgeDocument();
      result.should.be.ok;
  
      var redoc = db.getExistingDocument(doc.documentID);
      should.not.exist(redoc);
    });

    it('must support specifying a document ID', function() {
      var doc = db.getDocument('document-with-id');
      var rev = doc.putProperties({ name: 'doc with custom ID' });
      doc.documentID.should.eql('document-with-id');
  
      var redoc = db.getExistingDocument('document-with-id');
      should.exist(redoc);
      should(redoc).be.exactly(doc);
    });
  });
  
};