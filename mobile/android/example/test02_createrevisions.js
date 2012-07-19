Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test02b');
    db.create();

    try {
        var properties = {
            testName: 'testCreateRevisions',
            tag: 1337,
        };
        
        var doc = createDocWithProperties(db, properties);
        var rev1 = doc.currentRevision;
        assert(rev1, "missing current revision");
        assert(rev1.revisionID, "missing revision ID on rev1");
        assert(rev1.revisionID.indexOf('1-') == 0, "invalid revision ID: "+rev1.revisionID);
        
        var properties2 = _.extend(properties, { tag: 4567 });
        rev1.putProperties(properties2);
        
        var rev2 = doc.currentRevision;
        assert(rev2.revisionID === doc.currentRevisionID, "revision ID mismatch");
        assert(rev2.revisionID.indexOf('2-') == 0, "invalid revision ID: "+rev2.revisionID);
        
        assert(!rev2.propertiesAreLoaded, "rev2 properties shouldn't be loaded until they are accessed");
        var userProperties = rev2.userProperties;
        assert(rev2.propertiesAreLoaded, "rev2 properties aren't loaded");
        assert(_.isEqual(properties2, userProperties), "user properties "+JSON.stringify(userProperties)+" don't match original "+JSON.stringify(properties));
        assert(rev2.document.documentID === doc.documentID, "document ID mismatch: "+rev2.document.documentID);
        
        db.deleteDatabase();
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }
    
}