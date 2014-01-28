Ti.include('test_utils.js')

var _ = require('underscore'),
    server = require('com.obscure.titouchdb');

exports.run_tests = function() {
    var pushComplete = false, checkCount = 15;
    
    var db = server.databaseNamed('test18');
    db.create();

    try {
        createDocuments(db, 10);
        db.registerFilter('even', 'function(doc,req){ return (doc.sequence % 2) == 0; }');
        
        var push = db.createPushReplication('http://touchbooks.iriscouch.com/test18');
        push.filter = 'even';
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
      if (pushComplete) {
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