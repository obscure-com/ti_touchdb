Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test17');
    db.create();

    try {
      // start with one replication at the beginning
      var repl = db.pullFromDatabaseAtURL('http://localhost:5984/books');
      repl.addEventListener('progress', function(e) {
        Ti.API.info(JSON.stringify(e));
        // Ti.API.info(String.format("replication progress: %d; status: %s; completed: %d; total: %d; error: %s", e.running, e.status, e.completed, e.total, JSON.stringify(e.error)));
      });
      repl.addEventListener('stopped', function(e) {
        Ti.API.info(JSON.stringify(e));
        // Ti.API.info(String.format("replication stopped: %d; status: %s; completed: %d; total: %d; error: %s", e.running, e.status, e.completed, e.total, JSON.stringify(e.error)));
      });
      repl.start();
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    /*
    setTimeout(function() {
      db.deleteDatabase();
      Ti.API.info("deleted db");
    }, 60000);
    */
}