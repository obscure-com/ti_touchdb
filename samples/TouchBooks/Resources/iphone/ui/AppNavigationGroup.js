
function AppNavigationGroup(server) {
  // get the database object and ensure that it is open
  var db = server.databaseNamed('books');
  db.open();
  
  // set up the root window
  var BookListWindow = require('/ui/BookListWindow'),
      BookListView = require('/ui/BookListView');
  
  var listWindow = new BookListWindow();
  var listView = new BookListView(db);
  listWindow.add(listView);
  
  // create the nav group with the root window
  var result = Ti.UI.iPhone.createNavigationGroup({
     window: listWindow
  });

  // add event listeners for other window transitions
  Ti.App.addEventListener('books:show_detail_view', function(e) {
    var BookDetailWindow = require('/ui/BookDetailWindow'),
        BookDetailView = require('/ui/BookDetailView');
        
    var detailWindow = new BookDetailWindow(e);
    var detailView = new BookDetailView(db, e);
    detailWindow.add(detailView);
    result.open(detailWindow);
  });
  
  return result;
};

module.exports = AppNavigationGroup;
