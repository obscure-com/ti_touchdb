/**
 * CommonJS module that abstracts out the interaction with TiTouchDB
 * and the Books database.
 * 
 * The last argument to each function in this module is a callback that
 * follows the node.js callback style:
 * 
 *   function callback(err, result) {...}
 * 
 * Most of the functions in TiTouchDB are synchronous, but by treating them
 * all as async, we can potentially swap our internal implementation for an
 * async version in the future.
 */

var server = require('com.obscure.titouchdb'),
    db = server.databaseNamed('books'),
    pull;

exports.initialize = function(cb) {
  // make sure the db exists
  db.ensureCreated();
  
  // pull won't work unless the db is around!
  pull = db.pullFromDatabaseAtURL('http://touchbooks.iriscouch.com/books');
  pull.addEventListener('progress', function(e) {
    Ti.API.info(JSON.stringify(e));
  });
  pull.addEventListener('stopped', function(e) {
    cb && cb(null, e);
  });
  pull.start();
};

exports.dumpBooks = function(cb) {
  var query = db.getAllDocuments();
  var rows = query.rows();
  while (row = rows.nextRow()) {
    Ti.API.info('-----');
    Ti.API.info(row.documentID);
    Ti.API.info(JSON.stringify(row.key));
    Ti.API.info(JSON.stringify(row.document.properties));
  }
  cb && cb(null, null);
};


exports.fetchBooksByAuthor = function(cb) {
  var ddoc = db.designDocumentWithName('books');
  if (!ddoc) {
    cb && cb({ error: 'missing design document' }, []);
    return;
  }
  
  var query = ddoc.queryViewNamed('by_author');
  if (!query) {
    cb && cb({ error: 'missing view' }, []);
    return;
  }
  
  var rows = query.rows();
  
  var result = [];
  while (row = rows.nextRow()) {
    result.push(row);
  }
  
  cb && cb(null, result);
};

exports.fetchBook = function(book_id, cb) {
  cb && cb(null, db.documentWithID(book_id));
};

exports.saveBook = function(book_id, properties, cb) {
  var doc = db.documentWithID(book_id);
  var result = doc.putProperties(properties);
  if (result.error) {
    cb && cb(result.error, null);
  }
  else {
    cb && cb(null, doc);
  }
};
