require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;
      
  describe('attachment (general)', function() {
    var db, doc, att;
    
    before(function() {
      this.timeout(10000);

      utils.delete_nonsystem_databases(manager);
      db = utils.install_elements_database(manager);
      
      doc = db.getExistingDocument('Bi');
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
      should(att).have.property('document');
      should(att.document).be.exactly(doc);
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
      should(att).have.property('name');
      att.name.should.eql('image.jpg');
    });

    it('must have a getRevision method', function() {
      should(att.getRevision).be.a.Function;
      should(att.getRevision()).be.exactly(doc.currentRevision);
    });
    
  });
  
  // properties and methods that are not part of the common API
  describe('attachment (extended)', function() {
    var db, doc, att;
    
    before(function() {
      this.timeout(10000);

      utils.delete_nonsystem_databases(manager);
      db = utils.install_elements_database(manager);
      
      doc = db.getExistingDocument('Bi');
      att = doc.currentRevision.getAttachment('image.jpg');
    });

    it('must have a contentURL property', function() {
      should(att).have.property('contentURL');
      var f = Ti.Filesystem.getFile(att.contentURL);
      should.exist(f);
      f.exists().should.be.ok;
    });
  });
};
