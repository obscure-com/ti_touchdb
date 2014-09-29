require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;

  describe('saved revision (general)', function() {
    var db, doc, rev;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_savedrevgeneral');
      doc = db.createDocument();
      rev = doc.putProperties({ name: "saved rev", x: 15, foo: false });
    });
    
    it('must have an propertiesAvailable property', function() {
      should(rev).have.property('propertiesAvailable', true);
    });
    
    it('must have a createRevision method', function() {
      should(rev.createRevision).be.a.Function;
    });
    
    it('must have a deleteDocument method', function() {
      should(rev.deleteDocument).be.a.Function;
    });
    
  });
  
  describe('saved revision (properties)', function() {
    var db, doc, rev1, rev2, rev3;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_savedrevgeneral');
      doc = db.createDocument();
      
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

      db.compact();
    });
    
    it('must have properties available for the current leaf revision', function() {
      rev3.propertiesAvailable.should.be.true;
    });
    
    it.skip('must not have properties available for older, compacted versions', function() {
      rev1.propertiesAvailable.should.be.false;
      rev2.propertiesAvailable.should.be.false;
    });
  });
  
  describe('saved revision (create revision)', function() {
    var db, doc, rev1;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_savedrevcreate');
      doc = db.createDocument();
      rev1 = doc.putProperties({ name: "woot", x: 15, foo: false });
    });

    it('must create a new revision with existing properties', function() {
      var rev2 = rev1.createRevision();
      rev2.userProperties.should.have.properties({ name: "woot", x: 15, foo: false });
    });
    
    it('must create a new revision with new properties', function() {
      var rev2 = rev1.createRevision({ dob: [1967, 5, 14]});
      rev2.userProperties.should.have.properties({ dob: [1967, 5, 14] });
    });
    
  });
  
  describe('saved revision (delete doc)', function() {
    var db, doc, rev1;
    
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test007_savedrevdelete');
      doc = db.createDocument();
      rev1 = doc.putProperties({ name: "woot", x: 15, foo: false });
    });

    it('must create a doc deletion revision', function() {
      var rev2 = rev1.deleteDocument();
      should.exist(rev2);
      rev2.isDeletion.should.be.true;
      // rev2.document.deleted.should.be.true;
    });
  });
};
