require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;
      
  describe('attachment (general)', function() {
    var db, doc, att;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      utils.install_elements_database(manager);
      db = manager.getExistingDatabase('elements');
      
      doc = db.getExistingDocument('1AD71A0D-3213-4059-9D91-8C4A70DD9183');
      att = doc.currentRevision.getAttachment('image.jpg');
    });
    
    it('must have a content property', function() {
      should(att).have.property('content');
      should(att.content).be.an.Object;
    });
    
    it('must have a contentType property', function() {
      should(att).have.property('contentType', 'image/jpeg');
    });
    
    it('must have a document property', function() {
      should(att).have.property('document', doc);
    });

    it('must have a length property', function() {
      should(att).have.property('length');
      att.length.should.be.a.Number;
    });
    
    it('must have a metadata property', function() {
      should(att).have.property('metadata');
      should(att.metadata).be.an.Object;
    });
    
    it('must have a name property', function() {
      should(att).have.property('name', 'image.jpg');
    });
    
    it('must have a revision property', function() {
      should(att).have.property('revision', doc.currentRevision);
    });
    
  });
};
