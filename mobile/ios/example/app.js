// open a single window
var window = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel();
window.add(label);
window.open();

// TODO: write your module tests here
var TiTouchDB = require('com.obscure.TiTouchDB');

// replication test
var db = TiTouchDB.databaseNamed('books');
db.ensureCreated();

db.pullFromDatabaseAtURL('http://localhost:5984/books');

var count = db.getDocumentCount();
label.text = String.format("db has %d documents", count);

//db.replicateDatabase('http://localhost:5984/books', false, { create_target: true });



/*
var db = TiTouchDB.databaseNamed("test1");
if (db) {
  db.open();
  var doc = db.getDocument('D30739F2-2E1C-4936-8E68-B90501D1474F');
  label.text = JSON.stringify(doc.properties);
  // label.text = String.format("name: %s; path: %s; exists: %s; document count: %d", db.name, db.path, db.exists ? 'YES' : 'NO', db.documentCount);
  
  var docs = db.getAllDocs();
  Ti.API.info(JSON.stringify(docs));
  Ti.API.info(JSON.stringify(docs.rows[0]));
}
else {
  label.text = "error creating db";
}

*/
