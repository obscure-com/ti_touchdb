Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test14');
    db.create();

    try {
        var docs = [];
        var lastDocID;
        _.times(50, function(i) {
            var props = {
                sequence: i,
                prev: lastDocID,
            };
            var doc = createDocWithProperties(db, props);
            docs.push(doc);
            lastDocID = doc.documentID;
        });
        
        var query = db.slowQuery('function(doc){emit(doc.sequence,{_id:doc.prev});}');
        query.startKey = 23;
        query.endKey = 33;
        query.prefetch = true;
        
        var result = query.rows();
        assert(result, "query did not return a result object");
        assert(result.rowCount == 11, "query returned the wrong number of rows: "+result.rowCount);
        // TODO total count is known to be wrong at the moment...
        
        var rownum = 23;
        while (row = result.nextRow()) {
            assert(row.key == rownum, "incorrect key: "+row.key +" != "+rownum);
            var prevdoc = docs[rownum-1];
            // prefetch not working?
            // assert(prevdoc.documentID == row.documentID, "document ID did not match at row "+rownum);
            ++rownum;
        }
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    db.deleteDatabase();
}