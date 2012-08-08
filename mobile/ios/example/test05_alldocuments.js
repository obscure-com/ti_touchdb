Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test05');
    db.create();

    try {
        var n = 5;
        createDocuments(db, n);
        
        db.clearDocumentCache();
        var query = db.getAllDocuments();
        assert(!query.designDocument, "getAllDocuments should not have a design doc");
        
        var rows = query.rows();
        assert(rows.rowCount === n, "incorrect number of rows");
        assert(rows.totalCount === n, "incorrect totalCount in query result");
        
        var c = 0;
        while (row = rows.nextRow()) {
           var doc = row.document; 
           assert(doc, "did not get doc from query row");
           assert(doc.currentRevision.propertiesAreLoaded, "query row should have preloaded doc properties");
           var props = doc.properties;
           assert(props, "couldn't get doc properties");
           assert(props.testName === 'someTest', "didn't get the right number of docs")
           c++;
        }
        assert(c == n, "returned incorrect number of docs: "+c);
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}