
function BookListView(server, options) {
  var _ = require('lib/underscore'),
      db = server.databaseNamed('books');


  db.open();
  
  var result = Ti.UI.createTableView(_.extend({}, options));
  
  result.addEventListener('click', function(e) {
    var book = e.rowData.book;
    // controller.open(exports.createDetailWindow(controller, db, book));
  });
  
  result.addEventListener('delete', function(e) {
    var book = e.rowData.book;
    if (book) {
      /*
      db.remove(book._id, book._rev, function(resp, status) {
        if (status !== 200) {
          alert('Error deleting book: '+JSON.stringify(resp));
        }
      });
      */
    }
  });
  
  result.addEventListener('refresh', function(e) {
    load_book_list(db, result);
  });
  
/*

  var editButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.EDIT,
  });
  editButton.addEventListener('click', function(e) {
    tableView.editing = true;
    result.leftNavButton = doneButton;
  });
  
  var doneButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.DONE,
  });
  doneButton.addEventListener('click', function(e) {
    tableView.editing = false;
    result.leftNavButton = editButton;
  });
  
  result.leftNavButton = editButton;
  
  var addButton = Ti.UI.createButton({
    systemButton: Ti.UI.iPhone.SystemButton.ADD,
  });
  addButton.addEventListener('click', function(e) {
    var win = exports.createDetailWindow(controller, db, {
      title: L('book.default_title'),
      author: L('book.default_author'),
      copyright: [1970],
    });
    win._set_editing(true);
    controller.open(win);
  });
  result.rightNavButton = addButton;

  result.addEventListener('open', function(e) {
    load_book_list(db, tableView);
  });
    
*/
  return result;  
}

function load_book_list(db, table) {  
  var view = db.viewNamed('books/by_author');
  var data = view.queryWithOptions({
    includeDocs: true
  });

  var sections = [], section;
  for (i in data.rows) {
    var author = data.rows[i].key[0];
    var book = data.rows[i].doc;
    
    if (!section || section.headerTitle !== author) {
      section && sections.push(section);
      section = Ti.UI.createTableViewSection({
        headerTitle: author
      });
    }
    
    section.add(Ti.UI.createTableViewRow({
      id: 'BookListRow',
      title: book.title,
      hasChild: true,
      book: book,
    }));
  }
  table.setData(sections);
};

module.exports = BookListView;