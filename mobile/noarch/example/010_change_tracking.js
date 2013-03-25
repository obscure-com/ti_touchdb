Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test010');
  
  var changes = 0, checkCount = 20;
  try {
    db.addEventListener('change', function(e) {
      ++changes;
    });

    createDocuments(db, 3);
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }

  var interval = setInterval(function() {
    if (changes > 0) {
      Ti.API.info("change notification done!  changes = "+changes);
      clearInterval(interval);
      db.deleteDatabase();
    }
    else if (checkCount-- < 0) {
      clearInterval(interval);
      db.deleteDatabase();
      throw new Error("timed out waiting for change notifications");
    }
  }, 2000);

}