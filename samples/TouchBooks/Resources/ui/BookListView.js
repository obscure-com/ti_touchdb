
function BookListView(db, options) {
  var _ = require('lib/underscore');
  
  var result = Ti.UI.createTableView(_.extend({ uid: 1 }, options));
  
  result.addEventListener('click', function(e) {
    var book = e.rowData.book;
    Ti.App.fireEvent('books:show_detail_view', {
      title: book.properties.title,
      isbn: book.documentID
    });
  });
  
  result.addEventListener('delete', function(e) {
    var book = e.rowData.book;
    if (book) {
      // book is a dictionary because it came from a view function.
      // need to get the full document object to delete
      var doc = db.documentWithID(book.documentID);
      var status = doc.deleteDocument();
    }
  });
  
  result.addEventListener('refresh', function(e) {
    load_book_list(db, result);
  });
  
  return result;  
}

function load_book_list(db, table) {  
  var ddoc = db.designDocumentWithName('books');
  var query = ddoc.queryViewNamed('by_author');
  var result = query.rows();

  // TODO use underscore
  var sections = [], section;
  while (row = result.nextRow()) {
    var author = row.key[0];
    var book = row.document;
    
    if (!section || section.headerTitle !== author) {
      section && sections.push(section);
      section = Ti.UI.createTableViewSection({
        headerTitle: author
      });
    }
    
    section.add(Ti.UI.createTableViewRow({
      id: 'BookListRow',
      title: book.properties.title,
      hasChild: true,
      book: book,
      height: 48,
    }));
  }
  table.setData(sections);
};

module.exports = BookListView;