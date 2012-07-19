Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.TiTouchDB');

exports.run_tests = function() {
    var db = server.databaseNamed('test17');
    db.deleteDatabase();
    db.ensureCreated();

    var replicationComplete = false, checkCount = 15;

    try {
      // start with one replication at the beginning
      var repl = db.pullFromDatabaseAtURL('http://touchbooks.iriscouch.com/books');
      repl.addEventListener('progress', function(e) {
        Ti.API.info(JSON.stringify(e));
      });
      repl.addEventListener('stopped', function(e) {
        Ti.API.info(JSON.stringify(e));
        replicationComplete = true;
      });
      repl.start();
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    var interval = setInterval(function() {
      if (replicationComplete) {
        Ti.API.info("replication done!");
        clearInterval(interval);
        db.deleteDatabase();
      }
      else if (checkCount-- < 0) {
        throw Error("timed out waiting for replication");
      }
    }, 2000);

}