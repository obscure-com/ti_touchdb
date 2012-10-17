/*
 * App initialization logic; runs prior to UI load
 */

var server = require('com.obscure.titouchdb'),
    db = server.databaseNamed(Alloy.CFG.books_db_name);

db.ensureCreated();

// create views
var ddoc = db.designDocumentWithName('books');
ddoc.defineView('by_author', 'function(doc) { if (doc.author) { emit(doc.author, null); } }');
ddoc.defineView('by_published', 'function(doc) { if (doc.published && doc.published.length > 0) { emit(doc.published[0], null); } }');
ddoc.saveChanges();

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
push.restart();
