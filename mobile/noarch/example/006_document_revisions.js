require('ti-mocha');

var should = require('should');
var utils = require('test_utils');

module.exports = function() {
  var titouchdb = require('com.obscure.titouchdb'),
      manager = titouchdb.databaseManager;


  describe('document (revisions)', function() {
    var db, doc;
  
    before(function() {
      utils.delete_nonsystem_databases(manager);
      db = manager.getDatabase('test006_docrevs');
    });
  
    it('must not return a current revision for a new document', function() {
      var doc = db.createDocument();
      should(doc.currentRevision).eql(null);
    });

    it('must return an unsaved revision from createRevision in a new document', function() {
      var doc = db.createDocument();
      var rev = doc.createRevision();
      should.exist(rev);
      rev.properties.should.have.properties(['_id']);
      should(rev.save).be.a.Function; // indicates UnsavedRevision
    });
  
    it('must create a single revision', function() {
      var doc = db.createDocument();
      var rev = doc.putProperties({
        a: 10,
        b: false,
        c: 'a string'
      });
      should.exist(rev);
      should.exist(doc.documentID);
      should(doc.currentRevision).be.exactly(rev);
      should(doc.properties).have.properties({
        a: 10,
        b: false,
        c: 'a string'
      });
    });

    it('must return null for currentRevision after deletion', function() {
      // https://github.com/couchbase/couchbase-lite-ios/issues/265
      var doc = db.createDocument();
      var rev1 = doc.putProperties({ foo:'bar' });
      doc.deleteDocument();
      var rev2 = doc.currentRevision;
      should.not.exist(rev2);
    });

  
    it('must not update a document without a _rev', function() {
      var doc = db.createDocument();
      var rev1 = doc.putProperties({ x: 3.14 });
      should.exist(rev1);
    
      var rev2 = doc.putProperties({ y: 10 });
      should(rev2).eql(null);
      should(doc.error).be.an.Object;
      doc.error.code.should.eql(409);
      should(doc.currentRevision).be.exactly(rev1);
    });
  
    it('must track multiple revisions', function() {
      var doc = db.createDocument();
      var rev1 = doc.putProperties({ i: 1 });
      var rev2 = doc.putProperties({ _rev: rev1.revisionID, name: "foo" });
      var rev3 = doc.putProperties({ _rev: rev2.revisionID, i: 2, location: "Santa Cruz" });
    
      should(doc.currentRevision).be.exactly(rev3);
      doc.currentRevisionID.should.eql(rev3.revisionID);
      doc.properties.should.have.properties({
        i: 2,
        location: "Santa Cruz"
      });
      doc.properties.should.not.have.properties(["name"]);
    });
  
    it('must return a list of leaf revisions', function() {
      var doc = db.createDocument();
      var rev1 = doc.putProperties({ i: 1 });
      var rev2 = doc.putProperties({ _rev: rev1.revisionID, i: 2 });
      var rev3 = doc.putProperties({ _rev: rev2.revisionID, i: 3 });
      var rev4 = doc.putProperties({ _rev: rev3.revisionID, i: 4 });
    
      should(doc.leafRevisions).be.an.Array;
      doc.leafRevisions.length.should.eql(1);
      doc.leafRevisions[0].revisionID.should.eql(rev4.revisionID);
    });
  
    it('must return a revision history', function() {
      var doc = db.createDocument();
      var rev1 = doc.putProperties({ i: 1 });
      var rev2 = doc.putProperties({ _rev: rev1.revisionID, i: 2 });
      var rev3 = doc.putProperties({ _rev: rev2.revisionID, i: 3 });
      var rev4 = doc.putProperties({ _rev: rev3.revisionID, i: 4 });
      var rev5 = doc.putProperties({ _rev: rev4.revisionID, i: 5 });
    
      var history = doc.revisionHistory;
      history.should.be.an.Array;
      history.length.should.eql(5);
      history[0].revisionID.should.eql(rev1.revisionID);
      history[1].revisionID.should.eql(rev2.revisionID);
      history[2].revisionID.should.eql(rev3.revisionID);
      history[3].revisionID.should.eql(rev4.revisionID);
      history[4].revisionID.should.eql(rev5.revisionID);
    });
  
    it('must return revisions by revid', function() {
      var doc = db.createDocument();
      var rev1 = doc.putProperties({ i: 1 });
      var rev2 = doc.putProperties({ _rev: rev1.revisionID, i: 2 });
      var rev3 = doc.putProperties({ _rev: rev2.revisionID, i: 3 });
    
      var rev2a = doc.getRevision(rev2.revisionID);
      rev2a.revisionID.should.eql(rev2.revisionID);
    });
  
    it('must create a new unsaved revision', function() {
      var doc = db.createDocument();
      var rev1 = doc.putProperties({ name: "Paul" });
      var rev2 = doc.createRevision();
      var props = rev2.properties;
      props['married'] = true;
      rev2.properties = props;
      var rev2saved = rev2.save();
      should.exist(rev2saved);
      should(rev2saved.properties).have.properties({
        name: "Paul",
        married: true
      });
    });
  
    it('must return currentRevision from conflictingRevisions when there are no conflicts', function() {
      var doc = db.createDocument();
      doc.putProperties({ i: 1 });

      should(doc.conflictingRevisions).be.an.Array;
      doc.conflictingRevisions.length.should.eql(1);
      doc.conflictingRevisions[0].revisionID.should.eql(doc.currentRevision.revisionID);
    });
  
    it('must return a list of conflicting revisions', function() {
      var doc = db.createDocument();
      var rev1 = doc.putProperties({ name: "Paul", birth_year: 1977 });
    
      // create a revision with a new property
      var rev2a = rev1.createRevision();
      var props2a = rev2a.properties;
      props2a['married'] = true;
      rev2a.properties = props2a;
      rev2a = rev2a.save(true);
      should.exist(rev2a);
    
      // create a revision with a different property value
      var rev2b = rev1.createRevision();
      var props2b = rev2b.properties;
      props2b['birth_year'] = 1967;
      rev2b.properties = props2b;
      rev2b = rev2b.save(true); 
      should.exist(rev2b);
    
      var conflict_ids = [rev2a.revisionID, rev2b.revisionID];
    
      should(doc.conflictingRevisions).be.an.Array;

      doc.conflictingRevisions.length.should.eql(2);
      conflict_ids.should.containEql(doc.conflictingRevisions[0].revisionID);
      conflict_ids.should.containEql(doc.conflictingRevisions[1].revisionID);
    });

  });
  
};