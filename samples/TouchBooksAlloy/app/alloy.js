/*
 * App initialization logic; runs prior to UI load
 */

var server = require('com.obscure.titouchdb'),
    db = server.databaseManager.createDatabaseNamed(Alloy.CFG.books_db_name || 'books');

db.defineFilter('books_only', function(doc,req) {
  return doc.modelname === "book";
});

if (Alloy.CFG.remote_couchdb_server) {
  var pull = db.pullFromURL(Alloy.CFG.remote_couchdb_server);
  pull.continuous = true;
  pull.addEventListener('change', function(e) {
    if (pull.total > 0 && pull.completed === pull.total) {
      Ti.App.fireEvent('books:update_from_server');
    }
  });
  pull.start();

  var push = db.pushToURL(Alloy.CFG.remote_couchdb_server);
  push.continuous = true;
  push.filter = 'books_only';
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
