var _ = require('lib/underscore');

var repl;

exports.launch = function() {
  var server = require('com.obscure.titouchdb'),
      BookListWindow = require('/ui/BookListWindow'),
      BookListView = require('/ui/BookListView');

  // get the database object and ensure that it is open
  var db = server.databaseNamed('books');
  db.ensureCreated();
  
  // start with one replication at the beginning
  _.once(function() {
    repl = db.pullFromDatabaseAtURL('http://touchbooks.iriscouch.com/books');
    repl.addEventListener('stopped', function(e) {
      Ti.App.fireEvent('books:refresh_all');
    });
    repl.start();
  })();

  var listView = new BookListView(db);
  var listWin = new BookListWindow(listView);
  
  listWin.addEventListener('close', function(e) {
    db.close();
  });
  
  listWin.open();
};
