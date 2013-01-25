Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test010');
  
  db.addEventListener('test', function(e) {
    alert("fired test");
  });


  try {
    var changes = 0;
    db.addEventListener('gnee', function(e) {
      alert("gnee!");
      Ti.API.info(JSON.stringify(e));
      ++changes;
    });
    
    db.eventTest();

    /*
    createDocuments(db, 3);
    
    wait(2000);
    assert(changes > 0, 'no changes detected');
    
    */
    db.deleteDatabase();
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
}