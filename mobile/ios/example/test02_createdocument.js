
var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

function assert(exp, msg) {
    if (!exp) {
        throw "FAILURE: "+msg;
    }
}

function createDocWithProperties(db, props) {
    var doc = db.untitledDocument();
    assert(doc, "couldn't create doc");
    assert(!doc.currentRevisionID, "new doc should not have currentRevisionID");
    assert(doc.currentRevision, "new doc should have currentRevision");
    assert(!doc.documentID, "new untitled doc should not have documentID");
    
    doc.putProperties(props); // saves the doc!
    
    assert(doc.currentRevisionID, "saved doc should have currentRevisionID");
    assert(doc.currentRevision, "saved doc should have currentRevision");
    assert(doc.documentID, "saved doc should have documentID");
    
    return doc;
}

exports.run_tests = function() {
    var db = server.databaseNamed('test02');
    db.create();

    try {
        var properties = {
            testName: 'testCreateDocument',
            tag: 1337,
        };

        var doc = createDocWithProperties(db, properties);
        assert(doc.documentID.length > 10, "invalid document ID: "+doc.documentID);
        assert(doc.currentRevisionID.length > 10, "invalid doc revision: "+doc.currentRevisionID);
        var userProperties = doc.userProperties;
        _.each(properties, function(value, key) {
            assert(_.has(userProperties, key), "missing property "+key);
            assert(userProperties[key] === value, "wrong value for "+key+": "+userProperties[key]);
        });

        db.deleteDatabase();
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }
}