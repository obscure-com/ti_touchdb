Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test13c');
    db.create();

    try {
        createDocuments(db, 10);
        
        var ddoc = db.designDocumentWithName('mydesign');
        ddoc.defineView('vu', 'function(doc){emit([doc.testName, doc.sequence],doc);}');
        ddoc.saveChanges();
        
        var query = ddoc.queryViewNamed('vu');
        
        var result = query.rows();
        assert(result, "missing rows from query result");
        assert(result.rowCount == 10, "wrong number of rows returned: "+result.rowCount);
        
        for (seq = 0; seq < result.rowCount; seq++) {
            var r = result.rowAtIndex(seq);
            assert(r.key, "missing key");
            assert(r.key[0] == 'someTest', "incorrect first element of key: "+r.key[0]);
            assert(r.key[1] == seq, "incorrect second element of key: "+r.key[1]);
        }
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}
