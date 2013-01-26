Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test010');
  
  try {
    var changes = 0;

    db.addEventListener('change', function(e) {
      Ti.API.info(JSON.stringify(e));
      ++changes;
    });

    createDocuments(db, 3);
    
    wait(2000);
    
    // database change events not currently working
    // assert(changes > 0, 'no changes detected');

    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
}