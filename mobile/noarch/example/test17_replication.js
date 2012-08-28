Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var db = server.databaseNamed('test17');
    db.ensureCreated();

    var pullComplete = false, pushComplete = false, checkCount = 15;

    try {
      var dt = new Date();
      createDocWithProperties(db, {
        testname: 'push_to_remote',
        timestamp: dt.getTime() / 1000,
      }, 'zzz');
      
      // start with one replication at the beginning
      var pull = db.pullFromDatabaseAtURL('http://touchbooks.iriscouch.com/books');
      pull.addEventListener('progress', function(e) {
        Ti.API.info('pull progress: '+JSON.stringify(e));
      });
      pull.addEventListener('stopped', function(e) {
        Ti.API.info('pull stopped: '+JSON.stringify(e));
        pullComplete = (e.completed >= e.total);
      });
      pull.start();
      
      var push = db.pushToDatabaseAtURL('http://touchbooks.iriscouch.com/test');
      push.addEventListener('progress', function(e) {
        Ti.API.info('push progress: '+JSON.stringify(e));
      });
      push.addEventListener('stopped', function(e) {
        Ti.API.info('push stopped: '+JSON.stringify(e));
        pushComplete = (e.completed >= e.total);
      });
      push.start();
    }
    catch (e) {
        db.deleteDatabase();
        throw e;
    }

    var interval = setInterval(function() {
      if (pullComplete && pushComplete) {
        Ti.API.info("replication done!  doc count = "+db.getDocumentCount());
        clearInterval(interval);
        db.deleteDatabase();
      }
      else if (checkCount-- < 0) {
        clearInterval(interval);
        throw new Error("timed out waiting for replication");
      }
    }, 2000);

}
