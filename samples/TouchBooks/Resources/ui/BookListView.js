
function BookListView(db, options) {
  var _ = require('lib/underscore');
  
  var result = Ti.UI.createTableView(_.extend({ uid: 1 }, options));
  
  result.addEventListener('click', function(e) {
    var book = e.rowData.book;
    Ti.App.fireEvent('books:show_detail_view', {
      title: book.title,
      isbn: book._id
    });
  });
  
  result.addEventListener('delete', function(e) {
    var book = e.rowData.book;
    if (book) {
      var status = db.deleteRevision(book);
      Ti.API.info('delete book '+book.properties.isbn+': '+status);
    }
  });
  
  result.addEventListener('refresh', function(e) {
    load_book_list(db, result);
  });
  
  return result;  
}

function load_book_list(db, table) {  
  var view = db.viewNamed('books/by_author');
  var data = view.queryWithOptions({
    includeDocs: true
  });

  // TODO use underscore
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