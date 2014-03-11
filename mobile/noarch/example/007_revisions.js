require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('base revision (general)', function() {
    var db, doc, rev;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_revgeneral');
      doc = db.getDocument();
      rev = doc.putProperties({ name: "generic doc", tag: 5 });
    });
    
    it('must have an attachmentNames property', function() {
      should(rev).have.property('attachmentNames');
    });
    
    it('must have an attachments property', function() {
      should(rev).have.property('attachments');
    });
    
    it('must have a database property', function() {
      should(rev).have.property('database', db);
    });
    
    it('must have a document property', function() {
      should(rev).have.property('document', doc);
    });
    
    it('must have a revisionID property', function() {
      should(rev).have.property('revisionID');
    });
    
    it('must have an isDeletion property', function() {
      should(rev).have.property('isDeletion', false);
    });
    
    it('must have a parent property', function() {
      should(rev).have.property('parent');
    });
    
    it('must have a parentID property', function() {
      should(rev).have.property('parentID');
    });
    
    it('must have a properties property', function() {
      should(rev).have.property('properties');
    });
    
    it('must have a revisionHistory property', function() {
      should(rev).have.property('revisionHistory');
    });
    
    it('must have a userProperties property', function() {
      should(rev).have.property('userProperties');
    });
    
    it('must have a getAttachment method', function() {
      should(rev.getAttachment).be.a.Function;
    });
    
    it('must have a getProperty method', function() {
      should(rev.getProperty).be.a.Function;
    });
  });
  
  describe('base revision (history)', function() {
    var db, doc, rev1, rev2, rev3, rev4;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_revhistory');
      doc = db.getDocument();
      rev1 = doc.putProperties({
        title: 'There is Nothing Left to Lose',
        artist: 'Foo Fighters'        
      });
      
      rev2 = doc.createRevision();
      // setPropertyForKey is a titouchdb extension
      rev2.setPropertyForKey('release_date', [1999, 11, 2]);
      rev2 = rev2.save();
      
      rev3 = doc.createRevision();
      rev3.setPropertyForKey('label', 'RCA');
      rev3 = rev3.save();
      
      doc.deleteDocument();
      rev4 = doc.currentRevision;
    });
    
    it('must have created a set of revisions', function() {
      should.exist(rev1);
      rev1.revisionID.indexOf('1-').should.eql(0);
      rev1.properties.should.have.properties({
        title: 'There is Nothing Left to Lose',
        artist: 'Foo Fighters'        
      });
      
      should.exist(rev2);
      rev2.revisionID.indexOf('2-').should.eql(0);
      rev2.properties.should.have.properties({
        title: 'There is Nothing Left to Lose',
        artist: 'Foo Fighters',
        release_date: [1999, 11, 2]
      });

      should.exist(rev3);
      rev3.revisionID.indexOf('3-').should.eql(0);
      rev3.properties.should.have.properties({
        title: 'There is Nothing Left to Lose',
        artist: 'Foo Fighters',
        release_date: [1999, 11, 2],
        label: 'RCA'
      });

      should.not.exist(rev4);
    });
    
    it('must have a revision history 1', function() {
      var history = rev1.revisionHistory;
      should.exist(history);
      should(history).be.an.Array;
      history.length.should.eql(1);
      history[0].revisionID.should.eql(rev1.revisionID);
    });
    
    it('must have a revision history 2', function() {
      var history = rev2.revisionHistory;
      should.exist(history);
      should(history).be.an.Array;
      history.length.should.eql(2);
      history[0].revisionID.should.eql(rev1.revisionID);
      history[1].revisionID.should.eql(rev2.revisionID);
    });
    
    it('must have a revision history 3', function() {
      var history = rev3.revisionHistory;
      should.exist(history);
      should(history).be.an.Array;
      history.length.should.eql(3);
      history[0].revisionID.should.eql(rev1.revisionID);
      history[1].revisionID.should.eql(rev2.revisionID);
      history[2].revisionID.should.eql(rev3.revisionID);
    });

    it('must have a parentID 1', function() {
      should(rev1.parentID).be.type('undefined');
    });
    
    it('must have a parentID 2', function() {
      rev2.parentID.should.eql(rev1.revisionID);
    });
    
    it('must have a parentID 3', function() {
      rev3.parentID.should.eql(rev2.revisionID);
    });
    
  });
  
  describe('base revision (props)', function() {
    var db, doc;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_revprops');
      doc = db.getDocument();
    });

    it('must get a property by name', function() {
      var rev = doc.putProperties({
        isActive: false,
        dob: [1995, 12, 14],
        name: 'Angelique Rutledge',
        gender: 'female',
        email: 'angeliquerutledge@knowlysis.com',
        address: '984 Lynch Street, Sena, Rhode Island, 05326',
        latitude: -66.062228,
        longitude: 74.843122,
      });
      
      rev.getProperty('_id').should.be.a.String;
      rev.getProperty('isActive').should.eql(false);
      rev.getProperty('dob').should.eql([1995, 12, 14]);
      rev.getProperty('dob')[1].should.eql(12);
      rev.getProperty('name').should.eql('Angelique Rutledge');
      rev.getProperty('latitude').should.be.approximately(-66.062228, 0.0001);
      
      // nonexistant properties
      should(rev.getProperty('does-not-exist')).be.type('undefined');
    });
  });
  
  describe('base revision (attachments)', function() {
    var db, doc_with_atts, doc_no_atts;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = utils.install_elements_database(manager);
      
      doc_with_atts = db.getExistingDocument('Al');
      doc_no_atts = db.getExistingDocument('Ra');
    });
    
    it('must have an empty attachment array for a doc without attachments', function() {
      var rev = doc_no_atts.currentRevision;
      rev.attachments.length.should.eql(0);
    });

    it('must have an empty attachmentNames array for a doc without attachments', function() {
      var rev = doc_no_atts.currentRevision;
      rev.attachmentNames.length.should.eql(0);
    });
    
    it('must have a non-empty attachments array for a doc with attachments', function() {
      var rev = doc_with_atts.currentRevision;
      rev.attachments.length.should.eql(1);
      should(rev.attachments[0]).be.an.Object;
    });
    
    it('must have a non-empty attachmentNames array for a doc with attachments', function() {
      var rev = doc_with_atts.currentRevision;
      rev.attachmentNames.length.should.eql(1);
      rev.attachmentNames[0].should.eql('image.jpg');
    });
    
    it('must return null from getAttachment() when an attachment does not exist', function() {
      var rev = doc_no_atts.currentRevision;
      should(rev.getAttachment('image.jpg')).be.type('undefined');
    });

    it('must return an object from getAttachment() when an attachment exists', function() {
      var rev = doc_with_atts.currentRevision;
      should(rev.getAttachment('image.jpg')).be.an.Object;
    });
  });
  
};
