Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test07');
    db.create();

    try {
        var doc = createDocWithProperties(db, {
            testName: 'test06_history',
            tag: 1
        });
        var rev1ID = doc.currentRevisionID;
        assert(rev1ID.indexOf('1-') == 0, 'first revision should start with 1-');
        assert(doc.userProperties.tag == 1, 'tag is incorrect: '+doc.userProperties.tag);
        
        var p2 = doc.properties;
        p2.tag = 2;
        doc.putProperties(p2);
        var rev2ID = doc.currentRevisionID;
        assert(rev2ID.indexOf('2-') == 0, 'second revision should start with 2-');
        
        var revs = doc.getRevisionHistory();
        assert(revs, "missing revision history");
        assert(revs.length == 2, "incorrect number of revisions: "+revs.length);
        
        var rev1 = revs[0];
        assert(rev1.revisionID === rev1ID, "revision 1 ID mismatch");
        assert(rev1.properties, "missing rev 1 properties");
        assert(rev1.properties.tag == 1, "rev 1 tag is "+rev1.properties.tag);
        
        var rev2 = revs[1];
        assert(rev2.revisionID === rev2ID, "revision 2 ID mismatch");
        assert(rev2.properties, "missing rev 2 properties");
        assert(rev2.properties.tag == 2, "rev 2 tag is "+rev1.properties.tag);
        
        var conflicts = doc.getConflictingRevisions();
        assert(conflicts, "missing conflicting revisions");
        assert(conflicts.length == 1, "wrong number of conflicting revisions: "+conflicts.length);
        assert(conflicts[0].revisionID == rev2ID, "incorrect revision ID in conflict: "+conflicts[0].revisionID);
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}