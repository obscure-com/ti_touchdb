Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test007');
  try {
    var doc = createDocWithProperties(db, {
      "title":"There is Nothing Left to Lose",
      "artist":"Foo Fighters"
    });
    
    var rev1 = doc.currentRevision;
    assert(rev1, 'currentRevision returned null');
    
    var rev2 = doc.putProperties(_.extend(rev1.properties, {
      "release_date": [1999, 11, 2]
    }));
    assert(!doc.error, 'error on document after putting rev2');
    assert(rev2, 'missing rev2 after putProperties');
    var p2 = rev2.properties;
    assert(p2.release_date, 'missing new property on rev2');
    assert(p2.title === 'There is Nothing Left to Lose', 'incorrect title property on rev2: '+p2.title);
    
    // create a conflict
    var rev_conflict = doc.putProperties(_.extend(rev1.properties, {
      "release_date": [1999, 5, 12]
    }));
    assert(!rev_conflict, 'putProperties returned something for rev_conflict: '+rev_conflict);
    assert(doc.error, 'conflict should have set doc.error');
    assert(doc.error.code == 409, 'error code should be 409 conflict: '+doc.error.code);

    // test the put() and save() functions
    var rev_tmp = rev2.newRevision();
    rev_tmp.setPropertyForKey('label', 'RCA');
    var rev3 = rev_tmp.save();
    assert(rev3, 'rev_tmp.save() returned null');
    assert(!rev_tmp.error, 'rev_tmp.save() resulted in an error');
    var p5 = rev3.properties;
    assert(p5.label === 'RCA', 'rev3.put() property not present');
    assert(p5.artist === 'Foo Fighters', 'rev3 did not have an artist property');
    
    // parent revision (only on new revision!)
    assert(rev_tmp.parentRevisionID === rev2.revisionID, 'rev3 ('+rev_tmp.revisionID+') should have a parent revision of rev2  ('+rev2.revisionID+'); actually '+rev_tmp.parentRevisionID);
    
    // deletion
    var rev4 = rev3.deleteDocument();
    assert(rev4, 'deleteDocument() should have returned a deleted revision: '+JSON.stringify(rev3.error));
    assert(!rev3.error, 'deleteDocument() set an error on rev3');
    assert(rev4.isDeleted, 'rev4 isDeleted returned true');
    
    // history
    var revs = rev4.getRevisionHistory();
    assert(revs, 'getRevisionHistory() returned null');
    assert(revs.length == 4, 'getRevisionHistory() returned the wrong number of revisions: '+revs.length);
    assert(revs[0].revisionID == rev1.revisionID, 'rev1 id mismatch: '+rev1.revisionID + ' != '+revs[0].revisionID);
    assert(revs[1].revisionID == rev2.revisionID, 'rev2 id mismatch: '+rev2.revisionID + ' != '+revs[1].revisionID);
    assert(revs[2].revisionID == rev3.revisionID, 'rev3 id mismatch: '+rev3.revisionID + ' != '+revs[2].revisionID);
    assert(revs[3].revisionID == rev4.revisionID, 'rev4 id mismatch: '+rev4.revisionID + ' != '+revs[3].revisionID);
    
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
    
}