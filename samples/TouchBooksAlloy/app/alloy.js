/*
 * App initialization logic; runs prior to UI load
 */

// turn on sync logging
Ti.App.Properties.setBool("Log", true);
Ti.App.Properties.setBool("LogSync", true);
Ti.App.Properties.setBool("LogSyncVerbose", true);

var server = require('com.obscure.titouchdb'),
    db = server.databaseManager.getDatabase(Alloy.CFG.books_db_name || 'books');

db.setFilter('books_only', function(doc, req) {
  return doc.modelname === "book";
});

if (Alloy.CFG.remote_couchdb_server) {
  var pull = db.createPullReplication(Alloy.CFG.remote_couchdb_server);
  var push = db.createPushReplication(Alloy.CFG.remote_couchdb_server);
  
  pull.continuous = true;
  pull.addEventListener('change', function(e) {
    Ti.API.info(String.format("pull: running: %d, total: %d, completed: %d", !!pull.isRunning, pull.changesCount, pull.completedChangesCount));
    if (pull.status == server.REPLICATION_MODE_IDLE) {
      Ti.App.fireEvent('books:update_from_server');
      Ti.API.info("idle pull replication; fired update event");
    }
  });
  pull.start();

  push.continuous = true;
  push.filter = 'books_only'; // TODO push filter not working?
  
  push.addEventListener('change', function(e) {
    Ti.API.info(String.format("push: running: %d, total: %d, completed: %d", !!pull.isRunning, pull.changesCount, pull.completedChangesCount));
    if (pull.status == server.REPLICATION_MODE_IDLE) {
      Ti.App.fireEvent('books:update_from_server');
      Ti.API.info("idle push replication; fired update event");
    }
  });
  push.start();

  // hold references to the replications
  Alloy.Globals.replications = {
    push: push,
    pull: pull
  };
  
  // restart replication on app resume
  Ti.App.addEventListener('resume', function() {
    Alloy.Globals.replications.push.start();
    Alloy.Globals.replications.pull.start();
  });
}
