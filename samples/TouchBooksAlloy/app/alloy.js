/*
 * App initialization logic; runs prior to UI load
 */

var server = require('com.obscure.titouchdb'),
    db = server.databaseNamed(Alloy.CFG.books_db_name);

db.ensureCreated();

db.registerFilter('books_only', 'function(doc,req) { return doc.modelname === "book"; }');

var pull = db.replicationFromDatabaseAtURL(Alloy.CFG.remote_couchdb_server);
pull.continuous = true;
pull.addEventListener('progress', function(e) {
  if (e.completed > (this.completed || 0)) {
    Ti.App.fireEvent('books:update_from_server');
    this.completed = e.completed;
  }
});
pull.restart();

var push = db.replicationToDatabaseAtURL(Alloy.CFG.remote_couchdb_server);
push.continuous = true;
push.filter = 'books_only';
push.restart();

// restart replication on app resume
Ti.App.addEventListener('resume', function() {
	push.restart();
	pull.restart();
});
