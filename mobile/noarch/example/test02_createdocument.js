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

        // create a named document
        var named = db.untitledDocument();
        named.putProperties({
          _id: 'fooglebar',
          something: 10
        });
        var namedRefetch = db.documentWithID('fooglebar');
        assert(namedRefetch, "db did not refetch document by ID");
        
        // test documentsWithIDs
        var docids = ['fooglebar', doc.documentID];
        var docs = db.getDocumentsWithIDs(docids);
        assert(docs, "documentsWithIDs returned null query");
        var rows2 = docs.rows();
        assert(rows2, "documentsWithIDs query returned no rows");
        assert(rows2.rowCount == 2, "documentsWithIDs returned the wrong number of documents: "+rows2.rowCount);
        for (i=0; i < rows2.rowCount; i++) {
          var r = rows2.rowAtIndex(i);
          assert(r, "rowAtIndex "+i+" returned null");
          assert(_.contains(docids, r.documentID), "didn't ask for document ID "+r.documentID);
        }

        db.deleteDatabase();
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }
}
