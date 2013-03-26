/*
 * App initialization logic; runs prior to UI load
 */

var server = require('com.obscure.titouchdb'),
    db = server.databaseManager.createDatabaseNamed(Alloy.CFG.books_db_name);

db.defineFilter('books_only', function(doc,req) {
  return doc.modelname === "book";
});

var pull = db.pullFromURL(Alloy.CFG.remote_couchdb_server);
pull.continuous = true;
pull.addEventListener('change', function(e) {
  if (e.total > 0 && e.completed === e.total) {
    Ti.App.fireEvent('books:update_from_server');
  }
});
pull.start();

var push = db.pushToURL(Alloy.CFG.remote_couchdb_server);
push.continuous = true;
push.filter = 'books_only';
push.start();

// restart replication on app resume
Ti.App.addEventListener('resume', function() {
	push.start();
	pull.start();
});
