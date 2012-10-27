Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test13a');
    db.create();

    try {
        createDocuments(db, 5);
        
        var ddoc = db.designDocumentWithName('mydesign');
        ddoc.defineView('reduceview', 'function(doc){emit("foo",1);}', 'function(keys,values,rereduce) { var sum = 0; for (i=0; i<values.length;i++) { sum += values[i]; } return sum; }');
        ddoc.saveChanges();
        
        var query = ddoc.queryViewNamed('reduceview');
        query.groupLevel = 1;
        
        var result = query.rows();
        assert(result, "missing rows from query result");
        assert(result.rowCount == 1, "wrong number of rows returned: "+result.rowCount);
        
        var r = result.rowAtIndex(0);
        assert(r, "missing first row");
        assert(r.value == 5, "incorrect sum value: "+r.value);
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}
