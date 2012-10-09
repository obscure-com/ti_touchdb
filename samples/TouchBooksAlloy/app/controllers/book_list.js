
var books = Alloy.createCollection("Book");
books.on('fetch', function(e) {
  $.tableView.refresh(books);
});

$.tableView.refresh = function(collection) {
  var self = this;
  self.setData([]);
  collection.each(function(book) {
    var row = Ti.UI.createTableViewRow({
      title: book.get('title')
    });
    self.appendRow(row);
  });
};

function loadBookList(e) {
  books.fetch();
}

function changeGrouping(e) {
  if (OS_ANDROID) {
    if (e.source.id === 'authorSwitch') {
      $.publishedSwitch.value = !e.source.value;
    }
    else if (e.source.id === 'publishedSwitch') {
      $.authorSwitch.value = !e.source.value;
    }
  }
  alert($.tableView.data.length);
}
