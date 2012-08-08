Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test02a');
    db.create();

    try {
        var properties = {
            testName: 'testCreateDocument',
            tag: 1337,
            arrprop: [1,2,3,4]
        };

        var doc = createDocWithProperties(db, properties);
        assert(doc.documentID.length > 10, "invalid document ID: "+doc.documentID);
        assert(doc.currentRevisionID.length > 10, "invalid doc revision: "+doc.currentRevisionID);
        var userProperties = doc.userProperties;
        assert(_.isEqual(properties, userProperties), "user properties "+JSON.stringify(userProperties)+" don't match original "+JSON.stringify(properties));
        _.each(properties, function(value, key) {
            assert(_.has(userProperties, key), "missing property "+key);
            assert(_.isEqual(userProperties[key], value), "wrong value for "+key+": "+userProperties[key] +" != " + value);
        });

        // verify that document was saved
        var q = db.getAllDocuments();
        assert(q, "getAllDocuments() returned nothing");
        
        var rows = q.rows();
        assert(rows, "getAllDocuments() query has no rows");
        assert(rows.rowCount == 1, "wrong number of documents: "+rows.rowCount);
        assert(rows.rowAtIndex(0).documentID === doc.documentID, "wrong document ID "+rows.rowAtIndex(0).documentID);

        db.deleteDatabase();
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }
}
