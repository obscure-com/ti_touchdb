/*
 * App initialization logic; runs prior to UI load
 */

// turn on sync logging
Ti.App.Properties.setBool("Log", true);
Ti.App.Properties.setBool("LogSync", true);
Ti.App.Properties.setBool("LogSyncVerbose", true);

var server = require('com.obscure.titouchdb'),
    db = server.databaseManager.createDatabaseNamed(Alloy.CFG.books_db_name || 'books');

db.defineFilter('books_only', function(doc,req) {
  return doc.modelname === "book";
});

if (Alloy.CFG.remote_couchdb_server) {
  var repls = db.replicateWithURL(Alloy.CFG.remote_couchdb_server);
  var pull = repls[0], push = repls[1];
  
  pull.continuous = true;
  pull.addEventListener('change', function(e) {
    Ti.API.info(String.format("pull: running: %d, total: %d, completed: %d", !!pull.running, pull.total, pull.completed));
    // if (pull.total > 0 && pull.completed === pull.total) {
      Ti.App.fireEvent('books:update_from_server');
    // }
  });
  pull.start();

  push.continuous = true;
  push.filter = 'books_only';
  
  push.addEventListener('change', function(e) {
    Ti.API.info(String.format("push: running: %d, total: %d, completed: %d", !!pull.running, pull.total, pull.completed));
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
