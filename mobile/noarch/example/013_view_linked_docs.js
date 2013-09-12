Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test013');
  
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

    var query = db.slowQueryWithMap(function(doc) {
      emit(doc.sequence, { _id: doc.prev });
    });
    assert(query, "slowQueryWithMap returned null");
    
    query.startKey = 23;
    query.endKey = 33;
    query.prefetch = true;
    
    var result = query.rows();
    assert(result, "query did not return a result object");
    assert(result.count == 11, "query returned the wrong number of rows: "+result.count);
    
    var rownum = 23;
    while (row = result.nextRow()) {
        assert(row.key == rownum, "incorrect key: "+row.key +" != "+rownum);
        var prevdoc = docs[rownum-1];
        assert(prevdoc.documentID == row.documentID, "document ID did not match at row "+rownum+"; orig: "+prevdoc.documentID+"; new: "+row.documentID);
        ++rownum;
    }

    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }

}