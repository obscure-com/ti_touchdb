Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test012');

  try {
    var doc = createDocWithProperties(db, {
      testName: '012_history',
      tag: 1
    });
    var rev1ID = doc.currentRevisionID;
    assert(rev1ID.indexOf('1-') == 0, 'first revision should start with 1-, was '+rev1ID);
    assert(doc.userProperties.tag == 1, 'tag is incorrect: ' + doc.userProperties.tag);

    var p2 = doc.properties;
    p2.tag = 2;
    doc.putProperties(p2);
    var rev2ID = doc.currentRevisionID;
    assert(rev2ID.indexOf('2-') == 0, 'second revision should start with 2-, was '+rev2ID);

    var revs = doc.getRevisionHistory();
    assert(revs, "missing revision history");
    assert(revs.length == 2, "incorrect number of revisions: " + revs.length);

    var rev1 = revs[0];
    assert(rev1.revisionID === rev1ID, "revision 1 ID mismatch: " + rev1.revisionID + " != " + rev1ID);
    assert(rev1.properties, "missing rev 1 properties");
    assert(rev1.properties.tag == 1, "rev 1 tag is " + rev1.properties.tag);

    var rev2 = revs[1];
    assert(rev2.revisionID === rev2ID, "revision 2 ID mismatch: " + rev2.revisionID + " != " + rev2ID);
    assert(rev2.properties, "missing rev 2 properties");
    assert(rev2.properties.tag == 2, "rev 2 tag is " + rev1.properties.tag);

/*
        // TODO no conflicts returned; iOS returns one, so somebody isn't correct
        var conflicts = doc.getConflictingRevisions();
        assert(conflicts, "missing conflicting revisions");
        assert(conflicts.length == 1, "wrong number of conflicting revisions: "+conflicts.length);
        assert(conflicts[0].revisionID == rev2ID, "incorrect revision ID in conflict: "+conflicts[0].revisionID);
        */
  } catch (e) {
    db.deleteDatabase();
    throw e;
  }

  db.deleteDatabase();
}
