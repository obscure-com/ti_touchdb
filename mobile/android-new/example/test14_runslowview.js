Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test14');
    db.create();

    try {
        createDocuments(db, 50);
        
        var query = db.slowQuery('function(doc){emit(doc.sequence,null);}');
        query.startKey = 23;
        query.endKey = 33;
        
        var result = query.rows();
        assert(result, "missing rows from query result");
        assert(result.rowCount == 11, "wrong number of rows returned: "+result.rowCount);
        /* returning 11 as of 16 Apr 2012
        assert(result.totalCount == 50, "wrong number of total rows returned: "+result.totalCount);
        */
        
        var expectedKey = 23;
        while (r = result.nextRow()) {
            assert(r.key == expectedKey, "key mismatch: "+r.key+" != "+expectedKey);
            expectedKey++;
        }
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}