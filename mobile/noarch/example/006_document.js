require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('document (general)', function() {
    var db, doc, rev;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test006_docgeneral');
      doc = db.createDocument();
      rev = doc.putProperties({ name: "generic doc", tag: 5 });
    });
    
    it.skip('must have a conflictingRevisions property', function() {
      should(doc).have.property('conflictingRevisions');
    });
    
    it('must have a currentRevision property', function() {
      should(doc).have.property('currentRevision');
      should(doc.currentRevision).be.exactly(rev);
    });

    it('must have a currentRevisionID property', function() {
      should(doc).have.property('currentRevisionID');
      doc.currentRevisionID.should.be.a.String;
    });
    
    it('must have a database property', function() {
      should(doc).have.property('database', db);
    });

    it('must have a deleted property', function() {
      should(doc).have.property('deleted', false);
    });
    
    it('must have a documentID property', function() {
      should(doc).have.property('documentID');
      doc.documentID.should.be.a.String;
    });
    
    it('must have a leafRevisions property', function() {
      should(doc).have.property('leafRevisions');
      var leafs = doc.leafRevisions;
      leafs.length.should.eql(1);
      leafs[0].revisionID.should.eql(rev.revisionID);
    });
    
    it.skip('must have a model property', function() {
      should(doc).have.property('model');
    });
    
    it('must have a properties property', function() {
      should(doc).have.property('properties');
      should(doc.properties).have.properties(['_id', '_rev']);
    });
    
    it('must have a revisionHistory property', function() {
      should(doc).have.property('revisionHistory');
      var revs = doc.revisionHistory;
      revs.length.should.eql(1);
      revs[0].revisionID.should.eql(rev.revisionID);
    });

    it('must have a userProperties property', function() {
      should(doc).have.property('userProperties');
      should(doc.userProperties).not.have.properties(['_id', '_rev']);
    });

    it.skip('must have an addChangeListener function', function() {
      should(doc.addChangeListener).be.a.Function;
    });
    
    it('must have a createRevision function', function() {
      should(doc.createRevision).be.a.Function;
    });
    
    it('must have a deleteDocument function', function() {
      should(doc.deleteDocument).be.a.Function;
    });
    
    it('must have a getProperty function', function() {
      should(doc.getProperty).be.a.Function;
    });
    
    it('must have a getRevision function', function() {
      should(doc.getRevision).be.a.Function;
    });
    
    it('must have a purgeDocument function', function() {
      should(doc.purgeDocument).be.a.Function;
    });
    
    it('must have a putProperties function', function() {
      should(doc.putProperties).be.a.Function;
    });
    
    it.skip('must have an removeChangeListener function', function() {
      should(doc.removeChangeListener).be.a.Function;
    });

    it.skip('must have an update function', function() {
      should(doc.update).be.a.Function;
    });
  });
  
  describe('document (properties)', function() {
    var db, doc;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test006_docprops');
      
      doc = db.createDocument();
      doc.putProperties({
        name: 'Paul', 
        born: 1967,
        aliases: ['Paul Egli', 'pegli', 'Igor'],
        married: true
      });
    });
    
    it('must be able to fetch a property', function() {
      doc.getProperty('name').should.eql('Paul');
      doc.getProperty('born').should.eql(1967);
      doc.getProperty('aliases')[1].should.eql('pegli');
      doc.getProperty('married').should.eql(true);
    });
    
    it('must have all props in the properties property', function() {
      doc.properties.should.have.properties(['_id', '_rev', 'name', 'born', 'aliases', 'married']);
    });

    it('must not have _id and _rev in the userProperties property', function() {
      doc.userProperties.should.have.properties(['name', 'born', 'aliases', 'married']);
      doc.userProperties.should.not.have.properties(['_id', '_rev']);
    });

  });

};
