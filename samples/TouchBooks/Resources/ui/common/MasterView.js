//Master View Component Constructor

var _ = require('lib/underscore'),
    books = require('lib/books');

function MasterView() {
	//create object instance, parasitic subclass of Observable
	var self = Ti.UI.createView({
		backgroundColor:'white'
	});
	
	var table = Ti.UI.createTableView({
	});
	self.add(table);
	
	self.refresh = function() {
	  Ti.API.info("refresh");
    books.fetchBooksByAuthor(function(err, result) {
      if (err) {
        Ti.API.info(JSON.stringify(err));
        return;
      }
      
      var sections = [], section;
      
      _.each(result, function(row) {
        var author = row.key[0];
        var title = row.key[1];
        
        if (!section || section.headerTitle !== author) {
          section && sections.push(section);
          section = Ti.UI.createTableViewSection({
            headerTitle: author
          });
        }
        
        section.add(Ti.UI.createTableViewRow({
          id: 'BookListRow',
          title: title,
          isbn: row.documentID
        }));
      });
      
      table.setData(sections);
    });
	};
	
	//add behavior
  Ti.App.addEventListener('books:replication_complete', function(e) {
    self.refresh();
  });

  Ti.App.addEventListener('books:book_updated', function(e) {
   self.refresh();
  });
  
  Ti.App.addEventListener('books:book_created', function(e) {
   self.refresh();
  });
  
	table.addEventListener('click', function(e) {
		self.fireEvent('itemSelected', {
			isbn: e.row.isbn
		});
	});
	
	self.refresh(); // TODO async
	
	return self;
}

module.exports = MasterView;