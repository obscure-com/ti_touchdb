
exports.launch = function() {
  var TiTouchDB = require('com.obscure.TiTouchDB'),
      BookListWindow = require('/ui/BookListWindow'),
      BookListView = require('/ui/BookListView');

  // get the database object and ensure that it is open
  var db = TiTouchDB.databaseNamed('books');
  db.open();
  
  // start with one replication at the beginning
  TiTouchDB.addEventListener('TDReplicatorProgressChanged', function(e) {
    Ti.App.fireEvent('books:refresh_all');
  });
  db.replicateDatabase('http://touchbooks.iriscouch.com/books', false);

  // TODO handle books:show_detail_view event

  var listView = new BookListView(db);
  var listWin = new BookListWindow(listView);
  
  listWin.addEventListener('close', function(e) {
    db.close();
  });
  
  listWin.open();
};
