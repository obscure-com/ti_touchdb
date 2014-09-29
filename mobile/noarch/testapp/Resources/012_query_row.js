require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;


  describe('query row (API)', function() {
    var db, doc, view, e, row;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test011');
      var docs = utils.create_test_documents(db, 10);
      doc = docs[0];
      view = db.getView('test');
      view.setMap(function(doc) { emit(doc.sequence, doc.testName); }, '1');
      var q = view.createQuery();
      q.prefetch = true;
      e = q.run();
      row = e.next();
    });
    
    it('must have a conflictingRevisions property', function() {
      should(row).have.property('conflictingRevisions');
    });
    
    it('must have a database property', function() {
      should(row).have.property('database', db);
    });
    
    it('must have a documentID property', function() {
      should(row).have.property('documentID', doc.documentID);
    });
    
    it('must have a documentProperties property', function() {
      should(row).have.property('documentProperties');
      row.documentProperties.should.have.properties( { '_id': doc.documentID, '_rev': doc.currentRevisionID, 'sequence': 0, testName: 'someTest'});
    });
    
    it('must have a documentRevisionID property', function() {
      should(row).have.property('documentRevisionID', doc.currentRevisionID);
    });
    
    it('must have a key property', function() {
      should(row).have.property('key', 0);
    });
    
    it('must have a sequenceNumber property', function() {
      should(row).have.property('sequenceNumber', 1);
    });
    
    it('must have a sourceDocumentID property', function() {
      should(row).have.property('sourceDocumentID');
    });
    
    it('must have a value property', function() {
      should(row).have.property('value', 'someTest');
    });
    
    it('must have a getDocument() method', function() {
      should(row.getDocument).be.a.Function;
    });
    
  });
};