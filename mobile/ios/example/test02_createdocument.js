Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test02a');
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
        assert(_.isEqual(properties, userProperties), "user properties "+JSON.stringify(userProperties)+" don't match original "+JSON.stringify(properties));
        _.each(properties, function(value, key) {
            assert(_.has(userProperties, key), "missing property "+key);
            assert(userProperties[key] === value, "wrong value for "+key+": "+userProperties[key]);
        });

        // verify that document was saved
        var q = db.getAllDocuments();
        assert(q, "getAllDocuments() returned nothing");
        
        var results = q.fetchRows();
        assert(results && results.rows, "getAllDocuments() query has no results");
        assert(results.rows.length == 1, "wrong number of documents: "+results.rows.length);
        assert(results.rows[0].doc._id === doc.documentID, "wrong document ID "+results.rows[0].doc._id);

        db.deleteDatabase();
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }
}