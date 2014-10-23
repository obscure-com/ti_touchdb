require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('document (events)', function() {
    var db, doc;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test006_docevents');
      doc = db.createDocument();
      doc.putProperties({ title: 'Neuromancer', authors: ['William Gibson'] });
      
      var doc1 = db.getDocument('deleteme');
      doc1.putProperties({ purpose: 'to trigger an event on doc deletion'});
    });
    
    it('must fire a "change" event when a new revision is added', function(done) {
      var listener = function(e) {
        should(e).have.property("source");
        should(e.source).eql(doc);
        should(e).have.property("change");
        
        var change = e.change;
        should(change).have.property("documentId");
        should(change).have.property("revisionId");
        should(change).have.property("isCurrentRevision");
        should(change).have.property("isConflict");
        should(change).have.property("sourceUrl");
        
        
        done();
        doc.removeEventListener('change', listener);
      };
      doc.addEventListener('change', listener);
      
      var rev = doc.createRevision();
      var props = rev.userProperties;
      props.genre = 'science fiction';
      rev.userProperties = props;
      rev.save();
    });
    
    it('must fire a "change" event when putProperties is called', function(done) {
      var listener = function(e) {
        done();
        doc.removeEventListener('change', listener);
      };
      doc.addEventListener('change', listener);
      
      var props = doc.properties;
      props.published = [1984, 7, 1];
      doc.putProperties(props);
    });
    
    it('must fire a "change" event when deleteDocument is called', function(done) {
      var d = db.getExistingDocument('deleteme');
      var listener = function(e) {
        done();
        d.removeEventListener('change', listener);
      };
      d.addEventListener('change', listener);
      d.deleteDocument();
    });
    
  });

};
