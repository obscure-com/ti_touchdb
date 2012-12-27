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
    var rev3 = doc.putProperties(_.extend(rev1.properties, {
      "release_date": [1999, 5, 12]
    }));
    assert(!rev3, 'putProperties returned something for rev3: '+rev3);
    assert(doc.error, 'conflict should have set doc.error');
    assert(doc.error.code == 409, 'error code should be 409 conflict: '+doc.error.code);

    // test the put() and save() functions
    var rev4 = doc.newRevision();
    rev4.setPropertyForKey('label', 'RCA');
    var rev5 = rev4.save();
    assert(rev5, 'rev4.save() returned null');
    assert(!rev4.error, 'rev4.save() resulted in an error');
    var p5 = rev5.properties;
    assert(p5.label === 'RCA', 'rev4.put() property not present');
    assert(p5.artist === 'Foo Fighters', 'rev5 did not have an artist property');
    
    // parent revision
    assert(rev5.parentRevisionID === rev4.revisionID, 'rev5 should have a parent revision of rev4');
    
    // deletion
    var rev6 = rev5.deleteDocument();
    assert(rev6, 'deleteDocument() should have returned a deleted revision');
    assert(!rev5.error, 'deleteDocument() set an error on rev5');
    assert(rev6.isDeleted, 'rev6 isDeleted returned true');
    
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
    
}