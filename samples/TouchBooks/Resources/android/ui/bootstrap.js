var _ = require('lib/underscore');

var server = require('com.obscure.titouchdb'),
    repl,
    db;

exports.launch = function() {
  var BookListWindow = require('/ui/BookListWindow'),
      BookListView = require('/ui/BookListView');

  // get the database object and ensure that it is open
  db = server.databaseNamed('books');
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

(function() {
  Ti.App.addEventListener('books:show_detail_view', function(e) {
    var BookDetailWindow = require('/ui/BookDetailWindow'),
        BookDetailView = require('/ui/BookDetailView');
        
    var detailWindow = new BookDetailWindow(e);
    var detailView = new BookDetailView(db, e);
    detailWindow.add(detailView);
    detailWindow.open();
  });  
}());
  

