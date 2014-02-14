Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var db = touchdb.databaseManager.databaseNamed('test004');
  try {
    createDocuments(db, 10);
    assert(db.documentCount === 10, 'incorrect number of documents in the database: '+db.documentCount);
    
    var q1 = db.slowQueryWithMap(function(doc) {
      if (doc.sequence % 2 == 0) {
        emit(doc.sequence, null);
      }
    });
    
    assert(q1 !== null, 'slowQueryWithMap returned null');

    var r1 = q1.run();
    assert(r1 !== null, 'q1.run() returned null');
    assert(r1.count === 5, 'r1 returned an incorrect number of documents: 5 != '+r1.count);
    for (i=0; i < r1.count; i++) {
      var row = r1.rowAtIndex(i);
      assert(row !== null, 'missing rowAtIndex('+i+')');
      assert(row.key == i*2, 'incorrect key for row '+i+': '+row.key);
    }
    
    // queryAllDocuments
    var q2 = db.createAllDocumentsQuery();
    assert(q2 != null, 'queryAllDocuments returned null');
    
    var r2 = q2.run();
    assert(r2 != null, 'q2.run() returned null');
    assert(r2.count == 10, 'r2 returned an incorrect number of documents: 10 != '+r2.count);
    for (i=0; i < r2.count; i++) {
      var row = r2.rowAtIndex(i);
      assert(row != null, 'mising rowAtIndex('+i+')');
    }
    
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
    
}
